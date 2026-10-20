"""Bancada — servidor de contas do produto.

O que este processo faz (e só isso):
  - cadastro com CÓDIGO DE ACESSO de uso único (o código vira a conta; repassar não adianta)
  - login com senha (scrypt), sessão em cookie HttpOnly
  - limite de aparelhos por conta: entrar num aparelho além do limite derruba o mais antigo
  - /api/auth para o nginx (auth_request) liberar /app/ só para conta válida e não vencida
  - progresso salvo no servidor (o aluno estuda no celular e no PC)
  - registro de aparelhos/IPs por conta, para o admin.py achar conta compartilhada

Os arquivos do app (questões, dossiê, geradores) NÃO passam por aqui: o nginx os serve,
mas só depois que /api/auth responde 200.
"""
import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import time
from datetime import datetime, timezone

from flask import Flask, g, jsonify, redirect, request, send_from_directory

BASE = os.path.dirname(os.path.abspath(__file__))
DB = os.environ.get("BANCADA_DB", os.path.join(BASE, "..", "dados-privados", "bancada.db"))
CONFIG = os.environ.get("BANCADA_CONFIG", os.path.join(BASE, "..", "dados-privados", "config.json"))
PUBLICO = os.path.join(BASE, "..", "publico")

COOKIE = "bancada_sessao"
SESSAO_DIAS = 30
MAX_PROGRESSO = 2_000_000          # bytes — progresso real fica bem abaixo de 200 KB

app = Flask(__name__)


def config():
    with open(CONFIG, encoding="utf-8") as f:
        return json.load(f)


# ============================ banco ============================
ESQUEMA = """
CREATE TABLE IF NOT EXISTS contas (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  senha TEXT NOT NULL,
  expira TEXT NOT NULL,              -- ISO date; depois disso o acesso fecha
  max_aparelhos INTEGER NOT NULL DEFAULT 2,
  bloqueada INTEGER NOT NULL DEFAULT 0,
  criada INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS codigos (
  codigo TEXT PRIMARY KEY,
  lote TEXT NOT NULL,                -- ex.: "venda-pix", "turma-prof-joao"
  expira TEXT NOT NULL,              -- vencimento do ACESSO que o código dá
  max_aparelhos INTEGER NOT NULL DEFAULT 2,
  conta_id INTEGER REFERENCES contas(id),
  usado_em INTEGER,
  criado INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessoes (
  token_hash TEXT PRIMARY KEY,
  conta_id INTEGER NOT NULL REFERENCES contas(id),
  aparelho TEXT NOT NULL,            -- user-agent resumido
  ip TEXT,
  criada INTEGER NOT NULL,
  vista INTEGER NOT NULL,
  revogada INTEGER NOT NULL DEFAULT 0,
  motivo TEXT
);
CREATE TABLE IF NOT EXISTS acessos (   -- trilha para detectar compartilhamento
  conta_id INTEGER NOT NULL,
  quando INTEGER NOT NULL,
  ip TEXT,
  aparelho TEXT,
  evento TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS progresso (
  conta_id INTEGER PRIMARY KEY REFERENCES contas(id),
  dados TEXT NOT NULL,
  versao INTEGER NOT NULL,
  salvo INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS tentativas (
  chave TEXT NOT NULL,
  quando INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_sessoes_conta ON sessoes(conta_id);
CREATE INDEX IF NOT EXISTS ix_acessos_conta ON acessos(conta_id, quando);
CREATE INDEX IF NOT EXISTS ix_tentativas ON tentativas(chave, quando);
"""


def conectar():
    os.makedirs(os.path.dirname(DB), exist_ok=True)
    c = sqlite3.connect(DB, timeout=10)
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA journal_mode=WAL")
    c.execute("PRAGMA foreign_keys=ON")
    c.executescript(ESQUEMA)
    return c


def db():
    if "db" not in g:
        g.db = conectar()
    return g.db


@app.teardown_appcontext
def fechar(_):
    c = g.pop("db", None)
    if c is not None:
        c.close()


# ============================ utilidades ============================
def agora():
    return int(time.time())


def hoje():
    return datetime.now(timezone.utc).date().isoformat()


def hash_senha(senha, sal=None):
    sal = sal or secrets.token_bytes(16)
    h = hashlib.scrypt(senha.encode(), salt=sal, n=2**14, r=8, p=1, dklen=32)
    return "scrypt$" + sal.hex() + "$" + h.hex()


def confere_senha(senha, guardado):
    try:
        _, sal, h = guardado.split("$")
        return hmac.compare_digest(hash_senha(senha, bytes.fromhex(sal)), guardado)
    except ValueError:
        return False


def hash_token(t):
    return hashlib.sha256(t.encode()).hexdigest()


def ip():
    return request.headers.get("X-Real-IP") or request.remote_addr or ""


def aparelho():
    ua = request.headers.get("User-Agent", "")[:300]
    so = next((s for s in ("Android", "iPhone", "iPad", "Windows", "Mac OS", "CrOS", "Linux") if s in ua), "?")
    nav = next((n for n in ("Edg/", "OPR/", "SamsungBrowser", "Firefox", "Chrome", "Safari") if n in ua), "?")
    return f"{so} · {nav.rstrip('/')}"


def normaliza_codigo(c):
    return "".join(ch for ch in (c or "").upper() if ch.isalnum())


def erro(msg, status=400, **extra):
    return jsonify(ok=False, erro=msg, **extra), status


def registrar(conta_id, evento):
    db().execute("INSERT INTO acessos VALUES (?,?,?,?,?)", (conta_id, agora(), ip(), aparelho(), evento))


def limitado(chave, maximo, janela):
    """Freio contra adivinhar senha/código: no máximo `maximo` falhas por `janela` s."""
    c = db()
    c.execute("DELETE FROM tentativas WHERE quando < ?", (agora() - 86400,))
    n = c.execute("SELECT COUNT(*) FROM tentativas WHERE chave=? AND quando>?",
                  (chave, agora() - janela)).fetchone()[0]
    return n >= maximo


def falhou(chave):
    db().execute("INSERT INTO tentativas VALUES (?,?)", (chave, agora()))
    db().commit()


# ============================ sessão ============================
def abrir_sessao(conta):
    """Cria a sessão e aplica o limite de aparelhos: o mais antigo cai."""
    c = db()
    token = secrets.token_urlsafe(32)
    c.execute("INSERT INTO sessoes (token_hash, conta_id, aparelho, ip, criada, vista) VALUES (?,?,?,?,?,?)",
              (hash_token(token), conta["id"], aparelho(), ip(), agora(), agora()))
    ativas = c.execute("SELECT token_hash FROM sessoes WHERE conta_id=? AND revogada=0 ORDER BY vista DESC",
                       (conta["id"],)).fetchall()
    for s in ativas[conta["max_aparelhos"]:]:
        c.execute("UPDATE sessoes SET revogada=1, motivo='limite' WHERE token_hash=?", (s["token_hash"],))
    registrar(conta["id"], "login")
    c.commit()
    return por_cookie(jsonify(ok=True), token)


def por_cookie(resp, token):
    # Lax (e não Strict): quem chega por um link do WhatsApp ou do Google continua logado;
    # POST/PUT de outro site continuam sem levar o cookie.
    resp.set_cookie(COOKIE, token, max_age=SESSAO_DIAS * 86400, httponly=True,
                    secure=request.headers.get("X-Forwarded-Proto", request.scheme) == "https",
                    samesite="Lax", path="/")
    return resp


@app.after_request
def renovar_cookie(resp):
    """Sessão deslizante: quem usa o app não é deslogado no 30º dia depois do login."""
    token = g.pop("renovar_cookie", None)
    if token and request.path != "/api/auth":    # o auth_request do nginx descarta cabeçalhos
        por_cookie(resp, token)
    return resp


def sessao_atual():
    """(conta, motivo) — conta=None quando não há acesso; motivo explica por quê."""
    token = request.cookies.get(COOKIE)
    if not token:
        return None, "sem-sessao"
    c = db()
    s = c.execute("SELECT * FROM sessoes WHERE token_hash=?", (hash_token(token),)).fetchone()
    if not s:
        return None, "sem-sessao"
    if s["revogada"]:
        return None, s["motivo"] or "revogada"
    if s["vista"] < agora() - SESSAO_DIAS * 86400:
        return None, "expirou"
    conta = c.execute("SELECT * FROM contas WHERE id=?", (s["conta_id"],)).fetchone()
    if not conta or conta["bloqueada"]:
        return None, "bloqueada"
    if conta["expira"] < hoje():
        return None, "vencida"
    g.renovar_cookie = token
    if s["vista"] < agora() - 300:          # não escreve a cada requisição
        c.execute("UPDATE sessoes SET vista=?, ip=? WHERE token_hash=?", (agora(), ip(), s["token_hash"]))
        registrar(conta["id"], "uso")
        c.commit()
    return conta, None


MENSAGENS = {
    "limite": "Sua conta foi aberta em outro aparelho e esta sessão foi encerrada. "
              "Cada acesso é individual e vale para poucos aparelhos.",
    "vencida": "Seu acesso venceu. Para continuar estudando, adquira o acesso do próximo ciclo.",
    "bloqueada": "Esta conta foi suspensa. Fale com o suporte.",
    "sair": "Você saiu.",
}


# ============================ rotas ============================
@app.post("/api/cadastro")
def cadastro():
    d = request.get_json(silent=True) or {}
    nome = (d.get("nome") or "").strip()[:80]
    email = (d.get("email") or "").strip().lower()[:160]
    senha = d.get("senha") or ""
    codigo = normaliza_codigo(d.get("codigo"))
    if limitado("codigo:" + ip(), 10, 3600):
        return erro("Muitas tentativas. Espere uma hora e tente de novo.", 429)
    if len(nome) < 2 or "@" not in email or "." not in email.split("@")[-1]:
        return erro("Preencha nome e um e-mail válido.")
    if len(senha) < 8:
        return erro("A senha precisa ter pelo menos 8 caracteres.")
    c = db()
    cod = c.execute("SELECT * FROM codigos WHERE codigo=?", (codigo,)).fetchone()
    if not cod:
        falhou("codigo:" + ip())
        return erro("Código de acesso inválido.")
    if cod["conta_id"]:
        falhou("codigo:" + ip())
        return erro("Este código já foi usado. Cada código ativa uma única conta.")
    if c.execute("SELECT 1 FROM contas WHERE email=?", (email,)).fetchone():
        return erro("Já existe conta com este e-mail. Entre com ele — ou, se é um código novo "
                    "para renovar, use 'Renovar acesso' depois de entrar.")
    cur = c.execute("INSERT INTO contas (email, nome, senha, expira, max_aparelhos, criada) VALUES (?,?,?,?,?,?)",
                    (email, nome, hash_senha(senha), cod["expira"], cod["max_aparelhos"], agora()))
    c.execute("UPDATE codigos SET conta_id=?, usado_em=? WHERE codigo=?", (cur.lastrowid, agora(), codigo))
    registrar(cur.lastrowid, "cadastro:" + codigo)
    c.commit()
    conta = c.execute("SELECT * FROM contas WHERE id=?", (cur.lastrowid,)).fetchone()
    return abrir_sessao(conta)


@app.post("/api/entrar")
def entrar():
    d = request.get_json(silent=True) or {}
    email = (d.get("email") or "").strip().lower()
    senha = d.get("senha") or ""
    if limitado("login:" + ip(), 20, 900) or limitado("login:" + email, 8, 900):
        return erro("Muitas tentativas. Espere 15 minutos.", 429)
    conta = db().execute("SELECT * FROM contas WHERE email=?", (email,)).fetchone()
    if not conta or not confere_senha(senha, conta["senha"]):
        falhou("login:" + ip()); falhou("login:" + email)
        return erro("E-mail ou senha incorretos.", 401)
    if conta["bloqueada"]:
        return erro(MENSAGENS["bloqueada"], 403)
    return abrir_sessao(conta)


@app.post("/api/renovar")
def renovar():
    """Aluno do ciclo passado usa um código novo e mantém a conta e o histórico."""
    conta, _ = sessao_conta_mesmo_vencida()
    if not conta:
        return erro("Entre na sua conta primeiro.", 401)
    codigo = normaliza_codigo((request.get_json(silent=True) or {}).get("codigo"))
    if limitado("codigo:" + ip(), 10, 3600):
        return erro("Muitas tentativas. Espere uma hora.", 429)
    c = db()
    cod = c.execute("SELECT * FROM codigos WHERE codigo=? AND conta_id IS NULL", (codigo,)).fetchone()
    if not cod:
        falhou("codigo:" + ip())
        return erro("Código inválido ou já usado.")
    c.execute("UPDATE contas SET expira=MAX(expira, ?), max_aparelhos=? WHERE id=?",
              (cod["expira"], cod["max_aparelhos"], conta["id"]))
    c.execute("UPDATE codigos SET conta_id=?, usado_em=? WHERE codigo=?", (conta["id"], agora(), codigo))
    registrar(conta["id"], "renovou:" + codigo)
    c.commit()
    return jsonify(ok=True)


def sessao_conta_mesmo_vencida():
    token = request.cookies.get(COOKIE)
    if not token:
        return None, None
    s = db().execute("SELECT * FROM sessoes WHERE token_hash=? AND revogada=0", (hash_token(token),)).fetchone()
    if not s:
        return None, None
    return db().execute("SELECT * FROM contas WHERE id=? AND bloqueada=0", (s["conta_id"],)).fetchone(), s


@app.post("/api/sair")
def sair():
    token = request.cookies.get(COOKIE)
    if token:
        db().execute("UPDATE sessoes SET revogada=1, motivo='sair' WHERE token_hash=?", (hash_token(token),))
        db().commit()
    resp = jsonify(ok=True)
    resp.delete_cookie(COOKIE, path="/")
    return resp


@app.get("/api/inicio")
def inicio():
    """A página inicial (/): quem já entrou neste aparelho vai direto para o app."""
    conta, _ = sessao_atual()
    if conta and "vitrine" not in request.args:
        resp = redirect("/app/", 302)
    else:
        resp = send_from_directory(PUBLICO, "index.html")
    resp.headers["Cache-Control"] = "private, no-store"
    resp.headers["Vary"] = "Cookie"
    return resp


@app.get("/api/auth")
def auth():
    """Chamado pelo nginx (auth_request) antes de servir qualquer arquivo de /app/."""
    conta, _ = sessao_atual()
    return ("", 204) if conta else ("", 401)


@app.get("/api/publico")
def publico():
    """O que a página de vendas precisa: preço e links. Nada de conta aqui."""
    cfg = config()
    return jsonify(ciclo=cfg["ciclo"], prova=cfg["prova"], precos=cfg.get("precos", {}),
                   link_compra=cfg["link_compra"], suporte=cfg["suporte"])


@app.get("/api/eu")
def eu():
    conta, motivo = sessao_atual()
    if not conta:
        return erro(MENSAGENS.get(motivo, "Entre na sua conta."), 401, motivo=motivo)
    cfg = config()
    aparelhos = db().execute(
        "SELECT aparelho, ip, vista FROM sessoes WHERE conta_id=? AND revogada=0 ORDER BY vista DESC",
        (conta["id"],)).fetchall()
    return jsonify(ok=True, nome=conta["nome"], email=conta["email"], expira=conta["expira"],
                   max_aparelhos=conta["max_aparelhos"],
                   aparelhos=[dict(a) for a in aparelhos],
                   prova=cfg["prova"], ciclo=cfg)


@app.get("/api/progresso")
def ler_progresso():
    conta, motivo = sessao_atual()
    if not conta:
        return erro(MENSAGENS.get(motivo, "Entre na sua conta."), 401, motivo=motivo)
    p = db().execute("SELECT dados, versao FROM progresso WHERE conta_id=?", (conta["id"],)).fetchone()
    return jsonify(ok=True, versao=p["versao"] if p else 0, dados=json.loads(p["dados"]) if p else None)


@app.put("/api/progresso")
def gravar_progresso():
    conta, motivo = sessao_atual()
    if not conta:
        return erro(MENSAGENS.get(motivo, "Entre na sua conta."), 401, motivo=motivo)
    if (request.content_length or 0) > MAX_PROGRESSO:
        return erro("Progresso grande demais.", 413)
    d = request.get_json(silent=True) or {}
    dados, base = d.get("dados"), int(d.get("versao") or 0)
    if not isinstance(dados, dict) or not isinstance(dados.get("cards"), dict):
        return erro("Formato inválido.")
    c = db()
    atual = c.execute("SELECT versao FROM progresso WHERE conta_id=?", (conta["id"],)).fetchone()
    if atual and atual["versao"] != base:
        # outro aparelho salvou no meio: o cliente junta e tenta de novo
        return erro("conflito", 409, versao=atual["versao"])
    nova = base + 1
    c.execute("INSERT INTO progresso VALUES (?,?,?,?) ON CONFLICT(conta_id) DO UPDATE "
              "SET dados=excluded.dados, versao=excluded.versao, salvo=excluded.salvo",
              (conta["id"], json.dumps(dados, separators=(",", ":")), nova, agora()))
    c.commit()
    return jsonify(ok=True, versao=nova)


import painel  # noqa: E402  (no fim: o painel importa este módulo)
app.register_blueprint(painel.bp)
import pedidos  # noqa: E402
app.register_blueprint(pedidos.publico)
app.register_blueprint(pedidos.admin)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8811, debug=True)
