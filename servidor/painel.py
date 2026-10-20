"""Painel do administrador: as mesmas operações do admin.py, por uma página web (/admin).

Login próprio, separado das contas de aluno: uma senha de administrador guardada
(com scrypt) no banco, definida pela linha de comando com `admin.py senha-admin`.
Toda rota exige o cookie de admin; POST só aceita JSON (formulário de outro site
não consegue mandar JSON sem preflight, e o cookie é SameSite=Strict).
"""
import json
import os
import secrets
import time
from collections import defaultdict
from datetime import datetime

from flask import Blueprint, jsonify, request

import app as base

bp = Blueprint("painel", __name__, url_prefix="/api/admin")
COOKIE = "bancada_admin"
SESSAO_HORAS = 12
ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"   # sem 0/O, 1/I: código ditado por WhatsApp não erra

ESQUEMA = """
CREATE TABLE IF NOT EXISTS admin (id INTEGER PRIMARY KEY CHECK (id = 1), senha TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admin_sessoes (token_hash TEXT PRIMARY KEY, criada INTEGER NOT NULL, ip TEXT);
"""


def preparar(c):
    c.executescript(ESQUEMA)


# ============================ operações (também usadas pelo admin.py) ============================
def novo_codigo():
    s = "".join(secrets.choice(ALFABETO) for _ in range(12))
    return f"{s[:4]}-{s[4:8]}-{s[8:]}"


def gerar_codigos(c, n, lote, expira, aparelhos):
    out = []
    for _ in range(n):
        cod = novo_codigo()
        c.execute("INSERT INTO codigos (codigo, lote, expira, max_aparelhos, criado) VALUES (?,?,?,?,?)",
                  (base.normaliza_codigo(cod), lote, expira, aparelhos, int(time.time())))
        out.append(cod)
    c.commit()
    return out


def suspeitos(c, dias=7, minimo=4):
    """Sinais de conta repassada: muitos logins (gente se derrubando pelo limite de
    aparelhos), muitos IPs ou aparelhos diferentes, sessões derrubadas por limite."""
    desde = int(time.time()) - dias * 86400
    st = defaultdict(lambda: {"logins": 0, "ips": set(), "aparelhos": set(), "derrubadas": 0})
    for e in c.execute("SELECT conta_id, ip, aparelho, evento FROM acessos WHERE quando>? AND evento NOT LIKE 'admin:%'", (desde,)):
        s = st[e["conta_id"]]
        s["ips"].add(e["ip"]); s["aparelhos"].add(e["aparelho"])
        if e["evento"] == "login":
            s["logins"] += 1
    for r in c.execute("SELECT conta_id, COUNT(*) n FROM sessoes WHERE motivo='limite' AND vista>? GROUP BY conta_id",
                       (desde,)):
        st[r["conta_id"]]["derrubadas"] = r["n"]
    out = []
    for cid, s in st.items():
        pontos = max(0, s["logins"] - 6) + 2 * max(0, len(s["ips"]) - 4) + \
                 3 * max(0, len(s["aparelhos"]) - 3) + 2 * s["derrubadas"]
        if pontos >= minimo:
            conta = c.execute("SELECT email, nome, bloqueada FROM contas WHERE id=?", (cid,)).fetchone()
            out.append({"email": conta["email"], "nome": conta["nome"], "bloqueada": conta["bloqueada"],
                        "pontos": pontos, "logins": s["logins"], "ips": len(s["ips"]),
                        "aparelhos": len(s["aparelhos"]), "derrubadas": s["derrubadas"]})
    return sorted(out, key=lambda x: -x["pontos"])


def senha_temporaria():
    return "-".join("".join(secrets.choice("abcdefghjkmnpqrstuvwxyz23456789") for _ in range(4)) for _ in range(3))


# ============================ sessão de admin ============================
def eh_admin():
    t = request.cookies.get(COOKIE)
    if not t:
        return False
    c = base.db(); preparar(c)
    s = c.execute("SELECT criada FROM admin_sessoes WHERE token_hash=?", (base.hash_token(t),)).fetchone()
    return bool(s) and s["criada"] > base.agora() - SESSAO_HORAS * 3600


@bp.before_request
def guarda():
    if request.method == "POST" and not request.is_json:
        return base.erro("JSON obrigatório.", 415)
    if request.endpoint not in ("painel.entrar", "painel.estado") and not eh_admin():
        return base.erro("Entre como administrador.", 401)


@bp.get("/estado")
def estado():
    c = base.db(); preparar(c)
    configurado = c.execute("SELECT 1 FROM admin").fetchone() is not None
    return jsonify(ok=True, configurado=configurado, logado=eh_admin())


@bp.post("/entrar")
def entrar():
    c = base.db(); preparar(c)
    if base.limitado("admin:" + base.ip(), 5, 900):
        return base.erro("Muitas tentativas. Espere 15 minutos.", 429)
    a = c.execute("SELECT senha FROM admin").fetchone()
    if not a or not base.confere_senha(request.json.get("senha") or "", a["senha"]):
        base.falhou("admin:" + base.ip())
        return base.erro("Senha incorreta.", 401)
    t = secrets.token_urlsafe(32)
    c.execute("DELETE FROM admin_sessoes WHERE criada < ?", (base.agora() - SESSAO_HORAS * 3600,))
    c.execute("INSERT INTO admin_sessoes VALUES (?,?,?)", (base.hash_token(t), base.agora(), base.ip()))
    c.commit()
    r = jsonify(ok=True)
    r.set_cookie(COOKIE, t, max_age=SESSAO_HORAS * 3600, httponly=True, samesite="Strict", path="/api/admin",
                 secure=request.headers.get("X-Forwarded-Proto", request.scheme) == "https")
    return r


@bp.post("/sair")
def sair():
    base.db().execute("DELETE FROM admin_sessoes WHERE token_hash=?", (base.hash_token(request.cookies.get(COOKIE, "")),))
    base.db().commit()
    r = jsonify(ok=True); r.delete_cookie(COOKIE, path="/api/admin")
    return r


# ============================ leitura ============================
@bp.get("/resumo")
def resumo():
    c = base.db(); h = base.hoje(); semana = base.agora() - 7 * 86400
    um = lambda q, *a: c.execute(q, a).fetchone()[0]
    return jsonify(ok=True,
        contas=um("SELECT COUNT(*) FROM contas"),
        ativas=um("SELECT COUNT(*) FROM contas WHERE expira>=? AND bloqueada=0", h),
        estudaram_7d=um("SELECT COUNT(DISTINCT conta_id) FROM acessos WHERE quando>?", semana),
        novas_7d=um("SELECT COUNT(*) FROM contas WHERE criada>?", semana),
        codigos_livres=um("SELECT COUNT(*) FROM codigos WHERE conta_id IS NULL AND expira>=?", h),
        bloqueadas=um("SELECT COUNT(*) FROM contas WHERE bloqueada=1"),
        suspeitos=len(suspeitos(c)),
        pedidos_pendentes=__import__("pedidos").pendentes(c),
        config=base.config())


@bp.get("/lotes")
def lotes():
    c = base.db()
    out = [dict(r) for r in c.execute(
        "SELECT lote, expira, max_aparelhos, COUNT(*) n, COUNT(conta_id) usados, MAX(criado) criado "
        "FROM codigos GROUP BY lote, expira, max_aparelhos ORDER BY MAX(criado) DESC")]
    return jsonify(ok=True, lotes=out)


@bp.get("/lote")
def lote():
    c = base.db()
    rows = c.execute("SELECT k.codigo, k.usado_em, k.expira, c.email FROM codigos k "
                     "LEFT JOIN contas c ON c.id=k.conta_id WHERE k.lote=? ORDER BY k.criado, k.codigo",
                     (request.args.get("lote", ""),)).fetchall()
    fmt = lambda k: f"{k[:4]}-{k[4:8]}-{k[8:]}"
    return jsonify(ok=True, codigos=[{"codigo": fmt(r["codigo"]), "usado_em": r["usado_em"],
                                      "email": r["email"], "expira": r["expira"]} for r in rows])


@bp.get("/contas")
def contas():
    q = "%" + request.args.get("q", "").strip().lower() + "%"
    c = base.db()
    rows = c.execute(
        "SELECT c.id, c.email, c.nome, c.expira, c.bloqueada, c.criada, c.max_aparelhos, "
        "(SELECT MAX(quando) FROM acessos a WHERE a.conta_id=c.id) ultimo, "
        "(SELECT lote FROM codigos k WHERE k.conta_id=c.id ORDER BY usado_em LIMIT 1) lote "
        "FROM contas c WHERE lower(c.email) LIKE ? OR lower(c.nome) LIKE ? ORDER BY c.criada DESC LIMIT 300",
        (q, q)).fetchall()
    return jsonify(ok=True, contas=[dict(r) for r in rows], hoje=base.hoje())


@bp.get("/conta")
def conta():
    c = base.db()
    r = c.execute("SELECT id, email, nome, expira, bloqueada, criada, max_aparelhos FROM contas WHERE email=?",
                  (request.args.get("email", "").lower(),)).fetchone()
    if not r:
        return base.erro("Conta não encontrada.", 404)
    cid = r["id"]
    p = c.execute("SELECT dados, salvo FROM progresso WHERE conta_id=?", (cid,)).fetchone()
    estudo = None
    if p:
        d = json.loads(p["dados"])
        estudo = {"questoes": len(d.get("cards", {})), "dias": len(d.get("dias", {})),
                  "simulados": [s.get("total") for s in d.get("simulados", [])][-5:], "salvo": p["salvo"]}
    return jsonify(ok=True, conta=dict(r), estudo=estudo,
        codigos=[dict(k) for k in c.execute("SELECT codigo, lote, usado_em FROM codigos WHERE conta_id=?", (cid,))],
        sessoes=[dict(s) for s in c.execute(
            "SELECT aparelho, ip, criada, vista, revogada, motivo FROM sessoes WHERE conta_id=? ORDER BY vista DESC LIMIT 20", (cid,))],
        acessos=[dict(a) for a in c.execute(
            "SELECT quando, evento, ip, aparelho FROM acessos WHERE conta_id=? ORDER BY quando DESC LIMIT 40", (cid,))])


@bp.get("/suspeitos")
def lista_suspeitos():
    return jsonify(ok=True, suspeitos=suspeitos(base.db(), int(request.args.get("dias", 7)), 4))


# ============================ escrita ============================
def _data(s):
    datetime.strptime(s, "%Y-%m-%d")
    return s


@bp.post("/codigos")
def criar_codigos():
    d = request.json
    try:
        n = int(d.get("n", 1)); aparelhos = int(d.get("aparelhos", 2))
        expira = _data(d.get("expira") or base.config()["acesso_ate"])
    except (ValueError, TypeError):
        return base.erro("Quantidade, aparelhos ou data inválidos.")
    lote = (d.get("lote") or "").strip()[:60]
    if not lote or not 1 <= n <= 500 or not 1 <= aparelhos <= 5:
        return base.erro("Dê um nome ao lote; quantidade de 1 a 500; aparelhos de 1 a 5.")
    return jsonify(ok=True, lote=lote, expira=expira, codigos=gerar_codigos(base.db(), n, lote, expira, aparelhos))


@bp.post("/conta/acao")
def acao_conta():
    d = request.json
    c = base.db()
    r = c.execute("SELECT id FROM contas WHERE email=?", ((d.get("email") or "").lower(),)).fetchone()
    if not r:
        return base.erro("Conta não encontrada.", 404)
    cid, acao, extra = r["id"], d.get("acao"), {}
    revogar = lambda motivo: c.execute(
        "UPDATE sessoes SET revogada=1, motivo=? WHERE conta_id=? AND revogada=0", (motivo, cid))
    if acao == "bloquear":
        c.execute("UPDATE contas SET bloqueada=1 WHERE id=?", (cid,)); revogar("bloqueada")
    elif acao == "desbloquear":
        c.execute("UPDATE contas SET bloqueada=0 WHERE id=?", (cid,))
    elif acao == "derrubar":
        revogar("admin")
    elif acao == "senha":
        nova = senha_temporaria()
        c.execute("UPDATE contas SET senha=? WHERE id=?", (base.hash_senha(nova), cid)); revogar("admin")
        extra["senha"] = nova
    elif acao == "estender":
        try:
            c.execute("UPDATE contas SET expira=? WHERE id=?", (_data(d.get("data", "")), cid))
        except ValueError:
            return base.erro("Data inválida (use o calendário).")
    elif acao == "aparelhos":
        n = int(d.get("n", 2))
        if not 1 <= n <= 5:
            return base.erro("De 1 a 5 aparelhos.")
        c.execute("UPDATE contas SET max_aparelhos=? WHERE id=?", (n, cid))
    else:
        return base.erro("Ação desconhecida.")
    base.db().execute("INSERT INTO acessos VALUES (?,?,?,?,?)", (cid, base.agora(), base.ip(), "painel", "admin:" + acao))
    c.commit()
    return jsonify(ok=True, **extra)


CAMPOS_CONFIG = {"ciclo", "prova", "fim_inscricao", "acesso_ate", "link_compra", "suporte",
                 "pix_chave", "pix_nome", "pix_cidade"}


@bp.post("/config")
def salvar_config():
    d = request.json
    cfg = base.config()
    for k in CAMPOS_CONFIG:
        if k in d:
            cfg[k] = str(d[k]).strip()
    if "preco" in d:
        cfg.setdefault("precos", {})["individual"] = str(d["preco"]).strip()
    try:
        _data(cfg["acesso_ate"])
        for k in ("prova", "fim_inscricao"):
            datetime.fromisoformat(cfg[k])
    except ValueError:
        return base.erro("Alguma data está em formato inválido.")
    tmp = base.CONFIG + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)
    os.replace(tmp, base.CONFIG)
    return jsonify(ok=True, config=cfg)
