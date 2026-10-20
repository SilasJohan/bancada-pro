#!/usr/bin/env python3
"""Administração da Bancada — rodar no servidor.

  admin.py codigos 10 --lote venda-pix                 gera 10 códigos (vencem no fim do ciclo)
  admin.py codigos 35 --lote turma-prof-joao           lote para professor/escola
  admin.py codigos 1 --lote cortesia --aparelhos 3     um código que vale 3 aparelhos
  admin.py lotes                                       quantos códigos usados/livres por lote
  admin.py contas                                      lista as contas
  admin.py conta email@x.com                           detalhes, aparelhos e acessos recentes
  admin.py suspeitos                                   contas com cara de compartilhada
  admin.py bloquear email@x.com  /  desbloquear email@x.com
  admin.py derrubar email@x.com                        encerra todas as sessões da conta
  admin.py senha email@x.com                           define senha nova (suporte "esqueci a senha")
  admin.py estender email@x.com 2027-06-30             muda o vencimento
  admin.py senha-admin                                 define a senha do painel web (/admin)

O dia a dia fica mais fácil pelo painel em /admin; estes comandos fazem o mesmo.
"""
import argparse
import getpass
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import app as servidor  # noqa: E402
import painel  # noqa: E402


def quando(t):
    return datetime.fromtimestamp(t).strftime("%d/%m/%Y %H:%M") if t else "—"


def conta_por_email(c, email):
    r = c.execute("SELECT * FROM contas WHERE email=?", (email.lower(),)).fetchone()
    if not r:
        sys.exit(f"Nenhuma conta com e-mail {email}")
    return r


def cmd_codigos(c, a):
    expira = a.expira or servidor.config()["acesso_ate"]
    out = painel.gerar_codigos(c, a.n, a.lote, expira, a.aparelhos)
    print(f"# lote {a.lote} · acesso até {expira} · {a.aparelhos} aparelhos")
    print("\n".join(out))


def cmd_lotes(c, a):
    for r in c.execute("SELECT lote, expira, COUNT(*) n, COUNT(conta_id) usados FROM codigos "
                       "GROUP BY lote, expira ORDER BY MIN(criado)"):
        print(f"{r['lote']:<28} até {r['expira']}  {r['usados']:>4}/{r['n']:<4} usados")


def cmd_contas(c, a):
    for r in c.execute("SELECT c.*, (SELECT COUNT(*) FROM sessoes s WHERE s.conta_id=c.id AND s.revogada=0) ativas "
                       "FROM contas c ORDER BY criada DESC"):
        flag = " BLOQUEADA" if r["bloqueada"] else ""
        print(f"{r['email']:<36} {r['nome']:<24} até {r['expira']}  {r['ativas']} sessões{flag}")


def cmd_conta(c, a):
    r = conta_por_email(c, a.email)
    print(f"{r['nome']} <{r['email']}> · criada {quando(r['criada'])} · acesso até {r['expira']} · "
          f"máx. {r['max_aparelhos']} aparelhos{' · BLOQUEADA' if r['bloqueada'] else ''}")
    print("\nCódigos usados:")
    for k in c.execute("SELECT codigo, lote, usado_em FROM codigos WHERE conta_id=?", (r["id"],)):
        print(f"  {k['codigo']}  {k['lote']}  {quando(k['usado_em'])}")
    print("\nSessões:")
    for s in c.execute("SELECT * FROM sessoes WHERE conta_id=? ORDER BY vista DESC LIMIT 15", (r["id"],)):
        st = "ativa" if not s["revogada"] else "caiu (" + (s["motivo"] or "?") + ")"
        print(f"  {s['aparelho']:<22} {s['ip'] or '':<16} criada {quando(s['criada'])}  vista {quando(s['vista'])}  {st}")
    print("\nÚltimos acessos:")
    for e in c.execute("SELECT * FROM acessos WHERE conta_id=? ORDER BY quando DESC LIMIT 20", (r["id"],)):
        print(f"  {quando(e['quando'])}  {e['evento']:<10} {e['ip'] or '':<16} {e['aparelho']}")


def cmd_suspeitos(c, a):
    linhas = painel.suspeitos(c, a.dias, a.minimo)
    if not linhas:
        print(f"Nenhuma conta suspeita nos últimos {a.dias} dias.")
        return
    print(f"{'pontos':>6}  {'e-mail':<36} logins  IPs  aparelhos  derrubadas")
    for s in linhas:
        print(f"{s['pontos']:>6}  {s['email']:<36} {s['logins']:>6}  {s['ips']:>3}  {s['aparelhos']:>9}  {s['derrubadas']:>10}")
    print("\nVeja os detalhes com: admin.py conta <email>   ·   suspender: admin.py bloquear <email>")


def cmd_senha_admin(c, a):
    painel.preparar(c)
    s1 = getpass.getpass("Senha do painel (mín. 12): ")
    if len(s1) < 12 or s1 != getpass.getpass("Repita: "):
        sys.exit("Senhas não conferem ou curta demais.")
    c.execute("INSERT INTO admin (id, senha) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET senha=excluded.senha",
              (servidor.hash_senha(s1),))
    c.execute("DELETE FROM admin_sessoes")
    c.commit()
    print("Senha do painel definida. Sessões de admin anteriores encerradas.")


def cmd_bloquear(c, a, valor=1):
    r = conta_por_email(c, a.email)
    c.execute("UPDATE contas SET bloqueada=? WHERE id=?", (valor, r["id"]))
    if valor:
        c.execute("UPDATE sessoes SET revogada=1, motivo='bloqueada' WHERE conta_id=? AND revogada=0", (r["id"],))
    c.commit()
    print(("Bloqueada: " if valor else "Desbloqueada: ") + r["email"])


def cmd_derrubar(c, a):
    r = conta_por_email(c, a.email)
    n = c.execute("UPDATE sessoes SET revogada=1, motivo='admin' WHERE conta_id=? AND revogada=0", (r["id"],)).rowcount
    c.commit()
    print(f"{n} sessões encerradas.")


def cmd_senha(c, a):
    r = conta_por_email(c, a.email)
    s1 = getpass.getpass("Senha nova (mín. 8): ")
    if len(s1) < 8 or s1 != getpass.getpass("Repita: "):
        sys.exit("Senhas não conferem ou curta demais.")
    c.execute("UPDATE contas SET senha=? WHERE id=?", (servidor.hash_senha(s1), r["id"]))
    c.execute("UPDATE sessoes SET revogada=1, motivo='admin' WHERE conta_id=? AND revogada=0", (r["id"],))
    c.commit()
    print("Senha trocada e sessões antigas encerradas.")


def cmd_estender(c, a):
    r = conta_por_email(c, a.email)
    datetime.strptime(a.data, "%Y-%m-%d")
    c.execute("UPDATE contas SET expira=? WHERE id=?", (a.data, r["id"]))
    c.commit()
    print(f"{r['email']}: acesso até {a.data}")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("codigos"); s.add_argument("n", type=int); s.add_argument("--lote", required=True)
    s.add_argument("--expira", help="AAAA-MM-DD (padrão: acesso_ate do config.json)")
    s.add_argument("--aparelhos", type=int, default=2)
    sub.add_parser("lotes"); sub.add_parser("contas")
    s = sub.add_parser("conta"); s.add_argument("email")
    s = sub.add_parser("suspeitos"); s.add_argument("--dias", type=int, default=7); s.add_argument("--minimo", type=int, default=4)
    for n in ("bloquear", "desbloquear", "derrubar", "senha"):
        sub.add_parser(n).add_argument("email")
    s = sub.add_parser("estender"); s.add_argument("email"); s.add_argument("data")
    sub.add_parser("senha-admin")
    a = p.parse_args()
    c = servidor.conectar()
    {"codigos": cmd_codigos, "lotes": cmd_lotes, "contas": cmd_contas, "conta": cmd_conta,
     "suspeitos": cmd_suspeitos, "bloquear": cmd_bloquear,
     "desbloquear": lambda c, a: cmd_bloquear(c, a, 0), "derrubar": cmd_derrubar,
     "senha": cmd_senha, "estender": cmd_estender, "senha-admin": cmd_senha_admin}[a.cmd](c, a)


if __name__ == "__main__":
    main()
