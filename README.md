# Bancada — versão produto

Cópia do site pessoal (`/var/www/bancada-ifsc`, que continua intocado) transformada em
produto vendável: conta por aluno, código de acesso, progresso salvo no servidor e
proteção contra compartilhamento.

```
publico/          página de vendas (/), login e ativação (/entrar) — abertos
app/              o app de estudo — o nginx só entrega com sessão válida
servidor/app.py   contas, sessões, códigos, progresso (Flask + SQLite)
servidor/admin.py gerar códigos, ver contas, achar compartilhamento, bloquear
dados-privados/config.json  data da prova, vencimento do acesso, preço, links
dados-privados/   banco SQLite (nunca é servido; FAZER BACKUP)
deploy/           nginx e systemd
```

## Como a venda funciona (Pix com confirmação manual)

1. Aluno abre `/comprar`, preenche os dados e recebe o Pix (QR + copia-e-cola) com o valor e o
   número do pedido. A chave, o nome e a cidade do Pix ficam em Configuração, no painel.
2. Paga e toca "Já paguei", que abre o WhatsApp do suporte com o número do pedido.
3. Você confere **no app do banco** e clica "Confirmar pagamento" em `/admin` → Pedidos Pix.
4. O código aparece sozinho na página do pedido do aluno → "Ativar minha conta".

O código só é criado no servidor no passo 3 e só é entregue a quem tem o token do pedido.
Pedido não confirmado expira em 72h (dá para confirmar mesmo assim, se o Pix chegou atrasado).
Para ficar automático, um provedor com API (Mercado Pago, Efí, Asaas) chamaria
`pedidos.confirmar_pedido()` pelo webhook; o resto continua igual.

Professor/cursinho: painel → Gerar códigos → lote com um código por aluno.

## Proteção contra compartilhamento

| Camada | Efeito |
|---|---|
| Código de uso único | Repassar o código depois de usado não serve para nada |
| Limite de 2 aparelhos | Entrar no 3º derruba o mais antigo — dois amigos dividindo se derrubam o tempo todo |
| Questões só com login | `app/dados/*.js` passam pelo `auth_request` do nginx; sem sessão, 302 para /entrar |
| Marca d'água | Nome + e-mail do comprador em toda tela: print no grupo da turma diz de quem veio |
| Detecção | `admin.py suspeitos` pontua contas com muitos logins/IPs/aparelhos/derrubadas |
| Vencimento | Acesso acaba depois da prova; cada ciclo é uma venda nova |
| Freio de tentativas | 8 senhas erradas por e-mail / 10 códigos errados por IP → espera |

Nada que roda no navegador é 100% à prova de cópia — quem tem acesso pode copiar à mão.
O objetivo é tornar o compartilhamento **inconveniente e rastreável**, não impossível.

## Rotina de administração

```bash
cd /var/www/bancada-pro/servidor
sudo -u www-data .venv/bin/python admin.py codigos 5 --lote venda-pix
sudo -u www-data .venv/bin/python admin.py lotes
sudo -u www-data .venv/bin/python admin.py suspeitos          # uma vez por semana
sudo -u www-data .venv/bin/python admin.py conta aluno@email.com
sudo -u www-data .venv/bin/python admin.py senha aluno@email.com   # "esqueci a senha"
sudo -u www-data .venv/bin/python admin.py bloquear aluno@email.com
```

Rode como `www-data` para o banco continuar com o dono certo.

## Novo ciclo (a cada edital — duas provas por ano)

1. Edite `dados-privados/config.json`: `ciclo`, `prova`, `fim_inscricao`, `acesso_ate`, `precos`.
2. Atualize `app/app.js` → `PROVAS_PDF` com a prova mais recente, e `MAPA` se o edital mudou.
3. Acrescente questões em `app/dados/banco.js` (o mesmo formato do site pessoal), com `nivel` 1–3.
   O banco é repartido: as marcadas `uso:"simulado"` só caem no Simulado, as outras só no
   Treino do dia. Os simulados nunca repetem questão na mesma conta: com 7 por área, a reserva
   de 35 por área (15 em matemática, que usa 3 por simulado) dá 5 simulados inéditos. Questão
   nova entra no treino; marque como simulado só para repor essa reserva.
4. `sudo systemctl restart bancada-pro`.

O plano de estudos se recalcula sozinho a partir da data da prova.

## Dificuldade, simulados e login

- O aluno escolhe a dificuldade (Normal · Um pouco mais difícil · Difícil) no painel, treino,
  drill e simulado. Normal usa `nivel` 1–2 do banco; o intermediário, 2–3; Difícil, só 3
  (completa com 2 se acabar). Os geradores de matemática têm versões próprias por nível.
- Cada simulado salva os `ids` das questões do banco; elas não voltam em outro simulado da
  conta. Acabando as inéditas de uma área, voltam as que caíram há mais tempo (com aviso).
- A correção do simulado explica só as erradas/em branco; as certas ficam recolhidas.
- `/` passa pelo Flask (`/api/inicio`): com sessão válida vai direto para `/app/`.
  `/?vitrine` mostra a página de vendas mesmo logado. "Sair da conta" volta para `/`.
  O cookie é `SameSite=Lax` e se renova a cada uso (30 dias sem usar → sai).

## Painel do administrador — `/admin`

`https://bancada.sohan.sbs/admin` (ou `http://192.168.88.42:8802/admin` em casa).
Resumo, gerar códigos (com mensagem pronta para WhatsApp), contas (nova senha, bloquear,
desconectar, mudar vencimento/aparelhos), suspeitos e configuração do ciclo/preço/links.

Trocar a senha do painel:

```bash
sudo -u www-data /var/www/bancada-pro/servidor/.venv/bin/python /var/www/bancada-pro/servidor/admin.py senha-admin
```

## Como está instalado

| | |
|---|---|
| Serviço | `bancada-pro` (systemd, gunicorn em 127.0.0.1:8811) — `systemctl restart bancada-pro` |
| nginx | `/etc/nginx/sites-available/bancada-pro` (cópia de `deploy/nginx.conf`) |
| Endereço | `bancada.sohan.sbs` na 25443 (Cloudflare) · LAN `:8802` |
| Dados | `dados-privados/bancada.db` e `dados-privados/config.json` (dono `www-data`) |
| Backup | `/etc/cron.d/bancada-pro-backup`, todo dia 03:15 → `/var/backups/bancada-pro`, guarda 60 dias |

Falta na Cloudflare (igual ao site pessoal): DNS `A bancada → 200.152.8.138` **Proxied**, e na
Origin Rule existente acrescentar `bancada.sohan.sbs` (ou criar outra) com porta 25443.

Atualizar nginx depois de editar `deploy/`: `sudo cp deploy/nginx.conf /etc/nginx/sites-available/bancada-pro && sudo nginx -t && sudo systemctl reload nginx`.

O backup fica no mesmo disco do servidor — copie `/var/backups/bancada-pro` para outro
lugar (Drive, pendrive) de vez em quando.
