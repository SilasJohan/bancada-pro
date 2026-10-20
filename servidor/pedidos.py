"""Venda por Pix com confirmação manual.

Por que manual: um Pix para chave de conta pessoal não avisa ninguém. Não há como o
site saber, sozinho, que o dinheiro caiu — qualquer "validação automática" sem API do
banco confiaria no comprovante, e comprovante se falsifica. Então:

  1. aluno cria o pedido → recebe Pix copia-e-cola/QR com valor e identificador do pedido
  2. avisa pelo WhatsApp → o dono confere NO APP DO BANCO e clica "Confirmar" no painel
  3. só então o servidor cria o código; a página do pedido (que faz polling) mostra o código

O código nunca existe antes da confirmação, e só sai para quem tem o token do pedido
(32 bytes aleatórios, guardado no navegador de quem comprou). Não há o que burlar no
navegador: o navegador não decide nada.

Para virar automático depois (Mercado Pago, Efí, Asaas…): o webhook do provedor chama
confirmar_pedido() — o resto do fluxo continua igual.
"""
import secrets
import time
import unicodedata
from datetime import datetime

import segno
from flask import Blueprint, jsonify, request

import app as base
import painel

publico = Blueprint("pedidos", __name__, url_prefix="/api/pedido")
admin = Blueprint("pedidos_admin", __name__, url_prefix="/api/admin/pedidos")

EXPIRA_HORAS = 72
ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

ESQUEMA = """
CREATE TABLE IF NOT EXISTS pedidos (
  id TEXT PRIMARY KEY,               -- curto, vai no Pix e na conversa do WhatsApp
  token_hash TEXT UNIQUE NOT NULL,   -- só quem criou o pedido vê o código
  nome TEXT NOT NULL,                -- quem vai estudar
  pagador TEXT NOT NULL,             -- titular da conta que paga (o que aparece no extrato)
  email TEXT NOT NULL,
  whatsapp TEXT,
  valor_centavos INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',   -- pendente | pago | cancelado
  codigo TEXT,
  criado INTEGER NOT NULL,
  resolvido INTEGER,
  ip TEXT
);
CREATE INDEX IF NOT EXISTS ix_pedidos_status ON pedidos(status, criado);
"""


def preparar(c):
    c.executescript(ESQUEMA)


# ============================ Pix (BR Code estático, padrão EMV do Banco Central) ============================
def _campo(id_, valor):
    return f"{id_}{len(valor):02d}{valor}"


def _crc16(s):
    crc = 0xFFFF
    for b in s.encode():
        crc ^= b << 8
        for _ in range(8):
            crc = ((crc << 1) ^ 0x1021) if crc & 0x8000 else crc << 1
            crc &= 0xFFFF
    return f"{crc:04X}"


def _ascii(s, n):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return "".join(ch for ch in s.upper() if ch.isalnum() or ch == " ")[:n].strip() or "BANCADA"


def pix_copia_e_cola(chave, nome, cidade, centavos, txid):
    payload = (_campo("00", "01")
               + _campo("26", _campo("00", "br.gov.bcb.pix") + _campo("01", chave))
               + _campo("52", "0000") + _campo("53", "986")
               + _campo("54", f"{centavos // 100}.{centavos % 100:02d}")
               + _campo("58", "BR") + _campo("59", _ascii(nome, 25)) + _campo("60", _ascii(cidade, 15))
               + _campo("62", _campo("05", txid))
               + "6304")
    return payload + _crc16(payload)


def centavos_do_preco(texto):
    reais, _, cents = texto.replace("R$", "").strip().replace(".", "").partition(",")
    return int(reais) * 100 + int((cents + "00")[:2])


def brl(centavos):
    return f"R$ {centavos // 100},{centavos % 100:02d}"


def _pix_do_pedido(p):
    cfg = base.config()
    txid = "BANCADA" + p["id"]
    copia = pix_copia_e_cola(cfg["pix_chave"], cfg.get("pix_nome", "BANCADA"), cfg.get("pix_cidade", "FLORIANOPOLIS"),
                             p["valor_centavos"], txid)
    return copia, segno.make(copia, error="m").svg_inline(border=4, omitsize=True, dark="#000000", light="#FFFFFF")


def _fmt(cod):
    return f"{cod[:4]}-{cod[4:8]}-{cod[8:]}" if cod else None


def _estado(p, com_pix=True):
    vencido = p["status"] == "pendente" and p["criado"] < base.agora() - EXPIRA_HORAS * 3600
    out = {"id": p["id"], "status": "expirado" if vencido else p["status"], "valor": brl(p["valor_centavos"]),
           "nome": p["nome"], "pagador": p["pagador"], "email": p["email"], "criado": p["criado"]}
    if p["status"] == "pago":
        out["codigo"] = _fmt(p["codigo"])
    elif com_pix and not vencido and p["status"] == "pendente":
        out["pix"], out["qr"] = _pix_do_pedido(p)
    return out


# ============================ rotas públicas ============================
@publico.post("")
def criar():
    if not request.is_json:
        return base.erro("JSON obrigatório.", 415)
    c = base.db(); preparar(c)
    if base.limitado("pedido:" + base.ip(), 5, 3600):
        return base.erro("Muitos pedidos deste aparelho. Espere uma hora ou fale com o suporte.", 429)
    d = request.json
    nome = (d.get("nome") or "").strip()[:80]
    pagador = (d.get("pagador") or "").strip()[:80] or nome
    email = (d.get("email") or "").strip().lower()[:160]
    whats = "".join(ch for ch in (d.get("whatsapp") or "") if ch.isdigit())[:15]
    if len(nome) < 2 or "@" not in email or "." not in email.split("@")[-1]:
        return base.erro("Preencha o nome e um e-mail válido.")
    cfg = base.config()
    if not cfg.get("pix_chave"):
        return base.erro("Vendas pausadas no momento. Fale com o suporte.", 503)
    token = secrets.token_urlsafe(32)
    while True:
        pid = "".join(secrets.choice(ALFABETO) for _ in range(6))
        if not c.execute("SELECT 1 FROM pedidos WHERE id=?", (pid,)).fetchone():
            break
    c.execute("INSERT INTO pedidos (id, token_hash, nome, pagador, email, whatsapp, valor_centavos, criado, ip) "
              "VALUES (?,?,?,?,?,?,?,?,?)",
              (pid, base.hash_token(token), nome, pagador, email, whats,
               centavos_do_preco(cfg["precos"]["individual"]), base.agora(), base.ip()))
    base.falhou("pedido:" + base.ip())          # conta para o limite de pedidos por hora
    c.commit()
    p = c.execute("SELECT * FROM pedidos WHERE id=?", (pid,)).fetchone()
    return jsonify(ok=True, token=token, **_estado(p))


@publico.get("/estado")
def estado():
    c = base.db(); preparar(c)
    p = c.execute("SELECT * FROM pedidos WHERE token_hash=?",
                  (base.hash_token(request.args.get("t", "")),)).fetchone()
    if not p:
        return base.erro("Pedido não encontrado.", 404)
    r = jsonify(ok=True, suporte=base.config().get("suporte", ""), **_estado(p))
    r.headers["Cache-Control"] = "no-store"
    return r


# ============================ painel ============================
@admin.before_request
def guarda():
    if request.method == "POST" and not request.is_json:
        return base.erro("JSON obrigatório.", 415)
    if not painel.eh_admin():
        return base.erro("Entre como administrador.", 401)
    preparar(base.db())


@admin.get("")
def lista():
    status = request.args.get("status", "pendente")
    c = base.db()
    if status == "pendente":
        rows = c.execute("SELECT * FROM pedidos WHERE status='pendente' ORDER BY criado DESC LIMIT 200").fetchall()
    else:
        rows = c.execute("SELECT * FROM pedidos WHERE status!='pendente' ORDER BY resolvido DESC LIMIT 200").fetchall()
    out = []
    for p in rows:
        e = _estado(p, com_pix=False)
        e.update(whatsapp=p["whatsapp"], resolvido=p["resolvido"])
        out.append(e)
    return jsonify(ok=True, pedidos=out)


def confirmar_pedido(c, pid):
    """Único lugar que transforma pedido em código. Um webhook de provedor chamaria isto."""
    p = c.execute("SELECT * FROM pedidos WHERE id=?", (pid,)).fetchone()
    if not p or p["status"] != "pendente":
        return None
    cfg = base.config()
    cod = painel.gerar_codigos(c, 1, "pix-" + datetime.now().strftime("%Y-%m"), cfg["acesso_ate"], 2)[0]
    # só confirma se ainda estava pendente: dois cliques simultâneos não geram dois códigos
    n = c.execute("UPDATE pedidos SET status='pago', codigo=?, resolvido=? WHERE id=? AND status='pendente'",
                  (base.normaliza_codigo(cod), base.agora(), pid)).rowcount
    if not n:
        c.execute("DELETE FROM codigos WHERE codigo=?", (base.normaliza_codigo(cod),))
        c.commit()
        return None
    c.commit()
    return cod


@admin.post("/confirmar")
def confirmar():
    cod = confirmar_pedido(base.db(), (request.json.get("id") or "").upper())
    if not cod:
        return base.erro("Pedido não encontrado ou já resolvido.", 409)
    return jsonify(ok=True, codigo=cod)


@admin.post("/cancelar")
def cancelar():
    c = base.db()
    n = c.execute("UPDATE pedidos SET status='cancelado', resolvido=? WHERE id=? AND status='pendente'",
                  (base.agora(), (request.json.get("id") or "").upper())).rowcount
    c.commit()
    return jsonify(ok=True) if n else base.erro("Pedido não encontrado ou já resolvido.", 409)


def pendentes(c):
    preparar(c)
    return c.execute("SELECT COUNT(*) FROM pedidos WHERE status='pendente' AND criado>?",
                     (int(time.time()) - EXPIRA_HORAS * 3600,)).fetchone()[0]
