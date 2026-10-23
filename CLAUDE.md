# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Bancada em versão produto: o mesmo app de estudo do `bancada-ifsc`, com conta por aluno,
código de acesso, progresso no servidor e freio contra compartilhamento. Ver `README.md` para
o fluxo de venda e a rotina de administração — este arquivo é só o que não dá para deduzir
lendo o código.

## Comandos

```bash
# Sempre como www-data: o banco precisa continuar com esse dono, senão o gunicorn
# (que roda como www-data) perde a escrita e toda /entrar passa a dar 500.
cd /var/www/bancada-pro/servidor
sudo -u www-data .venv/bin/python admin.py codigos 5 --lote venda-pix
sudo -u www-data .venv/bin/python admin.py suspeitos        # uma vez por semana
sudo -u www-data .venv/bin/python admin.py senha aluno@email.com
sudo -u www-data .venv/bin/python admin.py senha-admin

sudo systemctl restart bancada-pro       # depois de mexer em servidor/ ou config.json
sudo journalctl -u bancada-pro -f        # PRIMEIRO lugar a olhar quando dá 502
```

## Arquitetura

```
nginx :25443 (TLS/Cloudflare) ou :8802 (LAN)
   │
   ├── /                → Flask /api/inicio decide: sessão válida vai para /app/
   ├── /app/*           → auth_request; sem sessão, 302 para /entrar
   │                      (inclui app/dados/*.js — é isso que impede baixar o banco
   │                       de questões sem conta)
   └── /api/*, /admin   → gunicorn 127.0.0.1:8811 (systemd: bancada-pro)
                             │
                   dados-privados/bancada.db (SQLite)
                   dados-privados/config.json (ciclo, preço, links)
```

`publico/` e `app/` são servidos pelo nginx direto; só `/api` e `/admin` passam pelo Python.
Quem define quais caminhos exigem sessão é `deploy/nginx-locais.conf`, incluído pelos dois
server blocks — editar o vhost sem editar esse include deixa a LAN e a internet com regras
diferentes, que é o tipo de divergência que só aparece em produção.

## Invariantes

- **`dados-privados/` nunca pode ser servido.** É onde moram o banco e o `config.json`. Uma
  regra `location` nova que caia antes do bloqueio expõe os e-mails dos compradores. Ao mexer
  no nginx, confira com `curl -I http://127.0.0.1:8802/dados-privados/bancada.db` — tem que
  dar 403 ou 404, nunca 200.
- **O código de acesso só nasce no passo 3 da venda** (`pedidos.confirmar_pedido()`), nunca
  quando o aluno abre `/comprar`. Criar antes significaria entregar acesso a quem não pagou.
- **Limite de 2 aparelhos é a trava que sustenta o preço.** Afrouxar para 3 derruba o efeito
  descrito no README (dois amigos dividindo se derrubam o tempo todo) — é decisão de produto,
  não número arbitrário.
- **A marca d'água com nome e e-mail é o que torna o vazamento rastreável.** Ela é renderizada
  em toda tela do app de propósito; tirar "porque polui a interface" remove a única forma de
  saber de qual conta saiu um print no grupo da turma.
- **`admin.py` roda como `www-data`.** Rodar como root uma vez só já basta para o `bancada.db`
  trocar de dono e o site cair na requisição seguinte. Se acontecer:
  `chown www-data:www-data dados-privados/bancada.db`.
- **O banco é o único dado insubstituível do projeto.** O código está no GitHub; as contas
  compradas, não. O cron de `/etc/cron.d/bancada-pro-backup` usa `sqlite3 .backup` em vez de
  `cp` porque copiar um SQLite com escrita em andamento gera arquivo corrompido que só se
  revela na hora de restaurar.
- **O backup fica no mesmo disco.** Isso protege contra engano humano, não contra disco morto —
  leve `/var/backups/bancada-pro` para fora de vez em quando.

## Convenções

- Texto ao usuário e comentários em pt-BR.
- `deploy/` é a fonte da verdade da configuração: nada edita esses arquivos no servidor, então
  sobrescrever com `cp` é sempre seguro. Foi por isso que se evitou `certbot --nginx` aqui e no
  `bancada-ifsc` — ele reescreve o vhost no servidor e o próximo deploy apagaria o bloco TLS.
- **Treino do dia, Simulado e Atividades não compartilham questões.** `uso:"simulado"` em
  `banco.js` reserva a questão ao simulado (o treino nunca a mostra, nem como revisão); as
  Atividades (`app/dados/atividades*.js`) não podem repetir trechos de `banco.js`. Ao
  acrescentar conteúdo em qualquer um dos dois, confira que nenhuma frase foi copiada do outro.
- Questão nova entra em `app/dados/banco.js` no mesmo formato do `bancada-ifsc`, com `nivel` 1–3.
  Português é a área com menos questões, então é ela que limita quantos simulados inéditos cada
  aluno consegue — ao acrescentar questões, acrescente primeiro ali.
