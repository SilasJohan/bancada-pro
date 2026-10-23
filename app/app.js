/* Bancada — treino para o Exame de Classificação do IFSC (Técnico Integrado)
   estrutura oficial: 7+7+7+7 = 28 questões. Versão produto: conta, progresso no servidor.
   Quem chama é o boot em index.html, depois de /api/eu e /api/progresso.            */
window.iniciarBancada = function (EU, PROG) {
"use strict";

const PROVA = new Date(EU.ciclo.prova);
const FIM_INSCRICAO = new Date(EU.ciclo.fim_inscricao);
const dataBR = d => d.toLocaleDateString("pt-BR", {day:"2-digit", month:"2-digit", year:"numeric"});
const PROVA_BR = dataBR(PROVA);
const PROVA_DM = PROVA_BR.slice(0, 5);
const AREAS = {
  port: {nome:"Língua Portuguesa", curto:"Português", faixa:[1,7]},
  mat:  {nome:"Matemática",        curto:"Matemática", faixa:[8,14]},
  gh:   {nome:"Geografia e História", curto:"Geo/História", faixa:[15,21]},
  cie:  {nome:"Ciências",          curto:"Ciências", faixa:[22,28]}
};
const ORDEM = ["port","mat","gh","cie"];
const INTERVALOS = [0, 1, 2, 4, 8, 16];   // caixas de Leitner, em dias

/* ============================ estado ============================
   A fonte da verdade é o servidor (a conta). O localStorage é só cópia de
   segurança para quando a internet cai no meio do treino.                    */
const CHAVE = "bancada-pro:" + EU.email;
let versao = PROG.versao || 0;
let S = carregar();
let META = S.meta || 20;                                // acertos-alvo em 28, o aluno escolhe

function vazio() {
  return {cards:{}, dias:{}, simulados:[], dossie:{}, ultimaTela:"painel", tema:null, meta:20, nivel:1};
}
function carregar() {
  let local = null;
  try { local = JSON.parse(localStorage.getItem(CHAVE)); } catch (e) {}
  const servidor = PROG.dados && PROG.dados.cards ? Object.assign(vazio(), PROG.dados) : vazio();
  // ficou progresso local que não chegou ao servidor (offline)? junta
  return local && local.cards && local._pendente ? juntar(servidor, local) : servidor;
}
let timerSync = null, enviando = false;
function salvar() {
  S._pendente = true;
  try { localStorage.setItem(CHAVE, JSON.stringify(S)); } catch (e) {}
  clearTimeout(timerSync);
  timerSync = setTimeout(sincronizar, 1500);
}
async function sincronizar() {
  if (enviando) { timerSync = setTimeout(sincronizar, 1000); return; }
  enviando = true;
  try {
    const dados = Object.assign({}, S); delete dados._pendente;
    let r = await fetch("/api/progresso", {method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({versao, dados})});
    if (r.status === 409) {                     // outro aparelho salvou antes: junta e tenta de novo
      const atual = await (await fetch("/api/progresso")).json();
      if (atual.dados) S = juntar(S, atual.dados);
      versao = atual.versao; enviando = false; return sincronizar();
    }
    if (r.status === 401) { const j = await r.json(); window.bancadaSaiu(j.motivo); return; }
    if (r.ok) {
      versao = (await r.json()).versao;
      S._pendente = false;
      try { localStorage.setItem(CHAVE, JSON.stringify(S)); } catch (e) {}
    }
  } catch (e) { /* offline: fica pendente e vai na próxima */ }
  enviando = false;
}
addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && S._pendente) sincronizar(); });
setInterval(() => { if (S._pendente) sincronizar(); }, 60000);

const hojeISO = () => new Date().toISOString().slice(0, 10);
function somaDias(n) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }

/* chave de agendamento: questões do banco pelo id; questões geradas pelo arquétipo */
const chaveCard = q => q.gerada ? q.id.split(":").slice(0, 2).join(":") : q.id;

function card(q) {
  const k = chaveCard(q);
  if (!S.cards[k]) S.cards[k] = {box:0, venc:hojeISO(), acertos:0, erros:0, area:q.area, topico:q.topico, visto:null};
  return S.cards[k];
}
function registrar(q, acertou) {
  const c = card(q);
  c.box = acertou ? Math.min(5, c.box + 1) : 1;
  c.venc = somaDias(INTERVALOS[c.box]);
  c[acertou ? "acertos" : "erros"]++;
  if (!acertou) delete c.dispensado;          // errou de novo: não era só bobeira, volta ao caderno
  c.visto = hojeISO();
  c.area = q.area; c.topico = q.topico;
  const d = S.dias[hojeISO()] || (S.dias[hojeISO()] = {n:0, a:0});
  d.n++; if (acertou) d.a++;
  salvar();
}

/* ============================ métricas ============================ */
function vencidos() {
  const h = hojeISO();
  return Object.entries(S.cards).filter(([, c]) => c.venc <= h && c.box > 0).map(([k]) => k);
}
function dominio(area) {
  // 0..1 — média da caixa de Leitner, amortecida pela cobertura do banco da área
  const cs = Object.values(S.cards).filter(c => c.area === area);
  const alvo = area === "mat" ? 10 : Math.max(8, Math.round(BANCO.filter(q => q.area === area).length * 0.7));
  if (!cs.length) return 0;
  const soma = cs.reduce((t, c) => t + (c.box - 1) / 4, 0);
  return Math.max(0, Math.min(1, soma / Math.max(alvo, cs.length)));
}
function projecaoArea(area) {           // acertos estimados em 7 questões
  return 7 * (0.25 + 0.75 * dominio(area));   // 0,25 = piso do chute em 5 alternativas
}
function projecao() { return ORDEM.reduce((t, a) => t + projecaoArea(a), 0); }
function ofensiva() {
  let n = 0;
  for (let i = 0; i < 400; i++) { if (S.dias[somaDias(-i)]) n++; else if (i > 0) break; }
  return n;
}
function diasAte(d) { return Math.ceil((d - new Date()) / 86400000); }

/* ============================ dificuldade ============================
   O aluno escolhe; vale para treino, drill e simulado. A ideia é treinar acima
   da prova para que, no dia, ela pareça fácil.                                  */
const NIVEIS = {
  1: {rot:"Normal",                 desc:"No ritmo da prova real do IFSC."},
  2: {rot:"Um pouco mais difícil",  desc:"Mais passos e alternativas mais parecidas entre si."},
  3: {rot:"Difícil",                desc:"Acima da prova. Quem acerta aqui acha a prova fácil."}
};
const SELO_NIVEL = {1:"básica", 2:"padrão IFSC", 3:"acima da prova"};
let NIVEL = NIVEIS[S.nivel] ? S.nivel : 1;
/* de cada dificuldade, quais níveis do banco servem — em ordem de preferência */
const FAIXAS = {1: [[1, 2], [3]], 2: [[2, 3], [1]], 3: [[3], [2], [1]]};
function faixa(q) { const i = FAIXAS[NIVEL].findIndex(f => f.includes(q.nivel || 2)); return i < 0 ? 9 : i; }

function seletorNivel(aoMudar) {
  const p = painel("Dificuldade", html("span", "rotulo", "treine difícil, a prova fica fácil"));
  const ac = el("div", "acoes");
  [1, 2, 3].forEach(n => {
    const b = el("button", "btn peq", NIVEIS[n].rot);
    b.setAttribute("aria-pressed", String(NIVEL === n));
    b.onclick = () => { S.nivel = NIVEL = n; salvar(); aoMudar(); };
    ac.append(b);
  });
  p.corpo.append(ac);
  p.corpo.append(html("p", "recado", NIVEIS[NIVEL].desc));
  return p;
}

/* ============================ seleção de questões ============================ */
function bancoPorArea(a) { return BANCO.filter(q => q.area === a); }

function embaralhar(v) {
  const a = v.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/* do menos recente para o mais recente: nunca vistas primeiro, empate resolvido no sorteio */
function porFrescor(lista) {
  const visto = q => (S.cards[chaveCard(q)] || {}).visto || "";
  return embaralhar(lista).sort((a, b) => visto(a) < visto(b) ? -1 : visto(a) > visto(b) ? 1 : 0);
}
/* primeiro as da dificuldade escolhida; dentro dela, as menos vistas */
function porNivel(lista) {
  return porFrescor(lista).map((q, i) => [q, i])
    .sort((a, b) => faixa(a[0]) - faixa(b[0]) || a[1] - b[1]).map(x => x[0]);
}
/* cópia da questão com as alternativas em nova ordem e a certa na posição `alvo`;
   as letras citadas no porque como {A}…{E} acompanham a troca */
function variante(q, alvo) {
  if (q.gerada) return q;                       // os geradores já sorteiam números e ordem
  const resto = embaralhar([0, 1, 2, 3, 4].filter(i => i !== q.correta));
  const ordem = resto.slice(0, alvo).concat(q.correta, resto.slice(alvo));
  return Object.assign({}, q, {
    alts: ordem.map(i => q.alts[i]),
    correta: alvo,
    porque: q.porque.replace(/\{([A-E])\}/g, (m, l) => "ABCDE"[ordem.indexOf("ABCDE".indexOf(l))])
  });
}
/* reparte as letras certas por igual na sessão (ninguém acerta "chutando B") */
function variarLetras(fila) {
  let posicoes = [];
  return fila.map(q => {
    if (!posicoes.length) posicoes = embaralhar([0, 1, 2, 3, 4]);
    return variante(q, posicoes.pop());
  });
}

function sessao(n) {
  const h = hojeISO(), fila = [], usados = new Set();
  // 1) o que venceu hoje, do mais atrasado para o mais recente
  Object.entries(S.cards).filter(([, c]) => c.venc <= h)
    .sort((a, b) => a[1].venc < b[1].venc ? -1 : 1)
    .forEach(([k]) => {
      if (fila.length >= n) return;
      if (k.startsWith("GEN:")) { const g = GERADORES.findIndex(f => f.name === k.split(":")[1]); if (g >= 0) { fila.push(gerarQuestao(g, NIVEL)); usados.add(k); } }
      else { const q = BANCO.find(x => x.id === k); if (q) { fila.push(q); usados.add(k); } }
    });
  // 2) completa com material novo, equilibrando as quatro áreas, na dificuldade escolhida
  const novos = BANCO.filter(q => !S.cards[q.id]);
  let volta = 0;
  while (fila.length < n && volta < 60) {
    const area = ORDEM[fila.length % 4];
    const ord = porNivel(novos.filter(q => q.area === area && !usados.has(q.id)));
    const cand = ord.filter(q => faixa(q) === faixa(ord[0] || {}));
    // matemática: metade do banco (enquanto houver inédita), metade gerada com números novos
    if (!cand.length || (area === "mat" && Math.random() < 0.5)) {
      const g = gerarQuestao(null, NIVEL); fila.push(g); usados.add(chaveCard(g));
    } else { const q = cand[Math.floor(Math.random() * cand.length)]; fila.push(q); usados.add(q.id); }
    volta++;
  }
  return variarLetras(fila.slice(0, n));
}

/* uma questão do banco que já caiu num simulado desta conta não cai em outro.
   A lista vem dos próprios simulados salvos (campo ids), então segue a conta
   em qualquer aparelho e se junta no sync como o resto.                       */
function ultimoSimuladoDe() {
  const u = {};
  S.simulados.forEach(s => (s.ids || []).forEach(id => { u[id] = Math.max(u[id] || 0, s.data); }));
  return u;
}
function ineditasPorArea() {
  const u = ultimoSimuladoDe(), r = {};
  ORDEM.forEach(a => r[a] = bancoPorArea(a).filter(q => !u[q.id]).length);
  return r;
}
function simuladosIneditos() {    // matemática não limita: os geradores nunca esgotam
  const r = ineditasPorArea();
  return Math.min(...ORDEM.filter(a => a !== "mat").map(a => Math.floor(r[a] / 7)));
}
function montarSimulado() {
  const u = ultimoSimuladoDe(), p = [];
  let repetidas = 0;
  ORDEM.forEach(a => {
    const area = bancoPorArea(a);
    // inéditas em simulado, na dificuldade escolhida, as que o treino ainda não mostrou primeiro
    const ineditas = porNivel(area.filter(q => !u[q.id]));
    if (a === "mat") {
      // até 3 do banco (inéditas, da dificuldade certa); o resto gerado com números novos
      const doBanco = ineditas.filter(q => faixa(q) === 0).slice(0, 3);
      const geradas = Array.from({length: 7 - doBanco.length}, (_, i) => gerarQuestao(i * 3 + Math.floor(Math.random() * 3), NIVEL));
      p.push(...embaralhar(doBanco.concat(geradas)));
      return;
    }
    const escolha = ineditas.slice(0, 7);
    // acabaram as inéditas da área: voltam as que caíram há mais tempo
    const antigas = area.filter(q => u[q.id]).sort((x, y) => u[x.id] - u[y.id]);
    while (escolha.length < 7 && antigas.length) { escolha.push(antigas.shift()); repetidas++; }
    p.push(...escolha);
  });
  const qs = variarLetras(p);   // já na ordem oficial: 1-7 port, 8-14 mat, 15-21 gh, 22-28 cie
  qs.repetidas = repetidas;
  return qs;
}

/* ============================ utilidades de render ============================ */
const el = (t, cls, txt) => { const e = document.createElement(t); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
function html(tag, cls, inner) { const e = document.createElement(tag); if (cls) e.className = cls; if (inner != null) e.innerHTML = inner; return e; }
const tela = document.getElementById("tela");
function limpar() { tela.replaceChildren(); }
function topo(t, sub) {
  const d = el("div", "topo"); d.append(el("h1", null, t)); if (sub) d.append(el("p", null, sub)); return d;
}
function painel(titulo, extra) {
  const p = el("section", "painel");
  if (titulo) { const c = el("div", "painel-cab"); c.append(el("h2", "rotulo", titulo)); if (extra) c.append(extra); p.append(c); }
  const b = el("div", "painel-corpo"); p.append(b); p.corpo = b; return p;
}

/* ============================ cartão de questão ============================ */
function renderQuestao(q, opts) {
  opts = opts || {};
  const box = el("article", "questao");
  const cab = el("div", "q-cab");
  cab.append(html("span", "selo " + q.area, AREAS[q.area].curto));
  cab.append(el("span", "top", q.topico));
  if (SELO_NIVEL[q.nivel]) cab.append(html("span", "chip " + (q.nivel === 3 ? "alta" : q.nivel === 2 ? "media" : "neutro"), SELO_NIVEL[q.nivel]));
  const dir = el("span", "dir", opts.rotulo || (q.gerada ? "gerada" : q.id));
  cab.append(dir);
  box.append(cab);
  if (q.texto) {                               // texto-base, como no caderno oficial
    const t = el("blockquote", "texto-base", q.texto);
    if (q.fonte) t.append(el("cite", null, "Fonte: " + q.fonte));
    box.append(t);
  }
  box.append(el("div", "enunciado", q.enunciado));

  const alts = el("div", "alts");
  const botoes = q.alts.map((texto, i) => {
    const b = el("button", "alt");
    b.append(el("span", "letra", "ABCDE"[i]));
    b.append(el("span", null, texto));
    b.onclick = () => escolher(i);
    alts.append(b);
    return b;
  });
  box.append(alts);

  let respondido = false;
  function escolher(i) {
    if (respondido) return;
    respondido = true;
    const certo = i === q.correta;
    botoes.forEach((b, k) => {
      b.disabled = true;
      if (k === q.correta) b.classList.add("certa");
      else if (k === i) b.classList.add("errada");
    });
    if (!opts.semExplicacao) {
      const p = el("div", "porque");
      p.append(el("div", "rotulo", certo ? "Por que está certa" : i < 0 ? "Ficou em branco · a resolução" : "Onde você escorregou"));
      p.append(document.createTextNode(q.porque));
      box.append(p);
    }
    if (opts.aoResponder) opts.aoResponder(certo, i, box);
  }
  box.escolher = escolher;
  box.marcar = i => { botoes.forEach((b, k) => b.classList.toggle("marcada", k === i)); };
  box.botoes = botoes;
  return box;
}

/* ============================ TELA: painel ============================ */
function telaPainel() {
  limpar();
  const dias = diasAte(PROVA);
  const proj = projecao();
  const venc = vencidos().length;

  tela.append(topo("Painel de bancada",
    "Exame de Classificação do IFSC · Técnico Integrado · prova de " + PROVA_BR + ", das 14h às 18h."));

  const insc = diasAte(FIM_INSCRICAO);
  if (insc >= 0) {
    tela.append(html("div", "aviso",
      "<span>⚑</span><div><b>Inscrições encerram em " + insc + " dia" + (insc === 1 ? "" : "s") + "</b> (" + dataBR(FIM_INSCRICAO) + "). " +
      "Sem inscrição paga ou isenção deferida, nada disso vale. " +
      'Confira em <a href="https://www.ifsc.edu.br/editais-com-inscricoes-abertas" target="_blank" rel="noopener">ifsc.edu.br/editais-com-inscricoes-abertas</a>.</div>'));
  }

  const g = el("div", "grade-cartoes");
  [["Dias até a prova", Math.max(0, dias), PROVA_BR + ", 14h"],
   ["Nota projetada", proj.toFixed(1), "de 28 · meta " + META],
   ["Para revisar hoje", venc, venc ? "toque em Treino do dia" : "em dia"],
   ["Ofensiva", ofensiva(), "dias seguidos"]
  ].forEach(([r, v, u]) => {
    const c = el("div", "cartao");
    c.append(el("div", "rotulo", r));
    c.append(el("div", "v", String(v)));
    c.append(el("div", "u", u));
    g.append(c);
  });
  tela.append(g);

  /* réplica da grade de respostas do caderno oficial */
  const pg = painel("Grade de respostas · projeção", html("span", "rotulo", proj.toFixed(1) + " / 28"));
  const grade = el("div", "grade-prova");
  let n = 0;
  ORDEM.forEach(a => {
    const acertos = Math.round(projecaoArea(a));
    for (let i = 1; i <= 7; i++) {
      n++;
      const c = el("div", "qc " + a + (i <= acertos ? " on" : ""), String(n).padStart(2, "0"));
      grade.append(c);
    }
  });
  pg.corpo.append(grade);
  const leg = el("div", "legenda");
  ORDEM.forEach(a => leg.append(html("span", null,
    '<i style="background:var(--a-' + a + ')"></i>' + AREAS[a].curto + " · " + projecaoArea(a).toFixed(1) + "/7")));
  pg.corpo.append(leg);
  pg.corpo.append(html("p", null,
    '<span style="font-size:12.5px;color:var(--muted)">Estimativa a partir do seu histórico de acertos e do espaçamento das revisões, ' +
    'com piso de 25% (o acerto por chute em 5 alternativas). Não é nota garantida — é termômetro.</span>'));
  tela.append(pg);

  /* domínio por área */
  const pd = painel("Domínio por área");
  const dd = el("div", "dominio");
  ORDEM.forEach(a => {
    const v = dominio(a), l = el("div", "dlinha");
    l.append(el("b", null, AREAS[a].curto));
    const t = el("div", "trilho"); const i = el("i");
    i.style.width = Math.max(2, v * 100) + "%"; i.style.background = "var(--a-" + a + ")";
    t.append(i); l.append(t);
    l.append(el("span", "n", Math.round(v * 100) + "%"));
    dd.append(l);
  });
  pd.corpo.append(dd);
  tela.append(pd);

  /* o que fazer agora */
  const pa = painel("O que fazer agora");
  const ac = el("div", "acoes");
  const b1 = el("button", "btn pri", venc ? "Treino do dia · " + venc + " para revisar" : "Treino do dia · 10 questões");
  b1.onclick = () => ir("treino"); ac.append(b1);
  const b2 = el("button", "btn", "Drill de matemática"); b2.onclick = () => ir("drill"); ac.append(b2);
  const b3 = el("button", "btn", "Simulado completo"); b3.onclick = () => ir("simulado"); ac.append(b3);
  pa.corpo.append(ac);
  tela.append(pa);
  tela.append(seletorNivel(telaPainel));

  if (S.simulados.length) {
    const ps = painel("Simulados realizados");
    const tb = el("table");
    tb.innerHTML = "<thead><tr><th>Data</th><th>Dificuldade</th><th>Português</th><th>Matemática</th><th>Geo/Hist</th><th>Ciências</th><th>Total</th></tr></thead>";
    const tbody = el("tbody");
    S.simulados.slice().reverse().forEach(s => {
      const tr = el("tr");
      tr.append(el("td", null, new Date(s.data).toLocaleDateString("pt-BR")));
      tr.append(el("td", null, NIVEIS[s.nivel] ? NIVEIS[s.nivel].rot : "Normal"));
      ORDEM.forEach(a => tr.append(el("td", "num", s.porArea[a] + "/7")));
      const td = el("td", "num");
      td.append(html("span", "chip " + (s.total >= META ? "ok" : s.total >= 18 ? "media" : "alta"), s.total + "/28"));
      tr.append(td); tbody.append(tr);
    });
    tb.append(tbody);
    ps.corpo.append(html("div", "rolagem")).lastChild.append(tb);
    tela.append(ps);
  }
}

/* ============================ TELA: treino do dia ============================ */
function telaTreino() {
  limpar();
  const fila = sessao(10);
  let i = 0, acertos = 0;
  tela.append(topo("Treino do dia",
    "Dez questões: primeiro o que a repetição espaçada mandou revisar hoje, depois material novo equilibrado entre as quatro áreas, na dificuldade que você escolher. Responda antes de ter certeza — errar aqui é o que faz a explicação grudar."));
  tela.append(seletorNivel(telaTreino));

  const status = painel(null);
  status.corpo.style.display = "flex";
  status.corpo.style.justifyContent = "space-between";
  status.corpo.style.alignItems = "center";
  status.corpo.style.gap = "12px";
  const contador = el("div", "rotulo", "");
  const placar = el("div", "mono", "");
  placar.style.fontSize = "15px";
  status.corpo.append(contador, placar);
  tela.append(status);

  const palco = el("div");
  palco.style.display = "flex"; palco.style.flexDirection = "column"; palco.style.gap = "16px";
  tela.append(palco);

  function proxima() {
    palco.replaceChildren();
    if (i >= fila.length) return fim();
    contador.textContent = "Questão " + (i + 1) + " de " + fila.length;
    placar.textContent = acertos + " / " + i;
    const q = fila[i];
    const cartao = renderQuestao(q, {
      rotulo: (i + 1) + "/" + fila.length,
      aoResponder: certo => {
        if (certo) acertos++;
        registrar(q, certo);
        placar.textContent = acertos + " / " + (i + 1);
        const nav = el("div", "acoes");
        nav.style.padding = "0 20px 18px";
        const b = el("button", "btn pri", i + 1 < fila.length ? "Próxima questão" : "Ver resultado");
        b.onclick = () => { i++; proxima(); };
        nav.append(b);
        const c = card(q);
        nav.append(html("span", "chip neutro",
          certo ? "volta em " + INTERVALOS[c.box] + " dia" + (INTERVALOS[c.box] === 1 ? "" : "s")
                : "volta amanhã"));
        cartao.append(nav);
        b.focus();
      }
    });
    palco.append(cartao);
  }
  function fim() {
    contador.textContent = "Sessão concluída";
    placar.textContent = acertos + " / " + fila.length;
    const p = painel("Resultado da sessão");
    const pct = Math.round(acertos / fila.length * 100);
    p.corpo.append(html("p", null,
      "<span style='font-family:\"IBM Plex Mono\",monospace;font-size:30px;font-weight:600'>" + acertos + "/" + fila.length + "</span> " +
      "<span style='color:var(--muted)'>· " + pct + "% de acerto</span>"));
    p.corpo.append(html("p", null, "<span style='color:var(--ink-2);font-size:14px'>" + (
      pct >= 80 ? "Ritmo de aprovação. Agora feche os olhos e explique em voz alta, sem olhar, o conceito que mais te custou nesta sessão — três minutos. É o passo que quase ninguém faz e o que mais rende."
      : pct >= 50 ? "Dentro do esperado para material novo. O que você errou volta amanhã automaticamente; não reestude agora, deixe o espaçamento trabalhar."
      : "Sessão dura — e isso é informação, não fracasso. Vá para Caderno de erro e leia só as explicações das que você errou hoje. Elas voltam amanhã."
    ) + "</span>"));
    const ac = el("div", "acoes");
    const b1 = el("button", "btn pri", "Nova sessão"); b1.onclick = () => telaTreino();
    const b2 = el("button", "btn", "Voltar ao painel"); b2.onclick = () => ir("painel");
    ac.append(b1, b2); p.corpo.append(ac);
    palco.append(p);
  }
  proxima();
}

/* ============================ TELA: drill de matemática ============================ */
function telaDrill() {
  limpar();
  tela.append(topo("Drill de matemática",
    "Os arquétipos abaixo foram extraídos das provas de 2023.2 a 2026.2 — juntos, cobrem quase todas as 7 questões de matemática. Cada clique gera números novos, então nunca dá para decorar a resposta: só resta aprender o caminho."));

  let gerIdx = null, atual = null;
  const pf = painel("Arquétipo");
  const filtros = el("div", "acoes");
  const nomes = [["Todos", null]].concat(GERADORES.map((f, k) => {
    const amostra = f(); return [amostra.topico, k];
  }));
  const vistos = new Set(); const unicos = [];
  nomes.forEach(([n, k]) => { const key = n + "|" + k; if (!vistos.has(key)) { vistos.add(key); unicos.push([n, k]); } });
  const btns = unicos.map(([n, k]) => {
    const b = el("button", "btn peq", n);
    b.setAttribute("aria-pressed", String(k === gerIdx));
    b.onclick = () => { gerIdx = k; btns.forEach(x => x.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true"); nova(); };
    filtros.append(b); return b;
  });
  pf.corpo.append(filtros);
  tela.append(seletorNivel(telaDrill));
  tela.append(pf);

  const palco = el("div");
  palco.style.display = "flex"; palco.style.flexDirection = "column"; palco.style.gap = "14px";
  tela.append(palco);

  function nova() {
    palco.replaceChildren();
    atual = gerarQuestao(gerIdx, NIVEL);
    const cartao = renderQuestao(atual, {
      rotulo: "gerada agora",
      aoResponder: certo => {
        registrar(atual, certo);
        const nav = el("div", "acoes"); nav.style.padding = "0 20px 18px";
        const b = el("button", "btn pri", "Gerar outra"); b.onclick = nova;
        nav.append(b);
        nav.append(html("span", "chip " + (certo ? "ok" : "alta"), certo ? "acertou" : "errou — este arquétipo volta amanhã"));
        cartao.append(nav); b.focus();
      }
    });
    palco.append(cartao);
  }
  nova();
}

/* ============================ TELA: simulado ============================ */
function telaSimulado() {
  limpar();
  tela.append(topo("Simulado completo",
    "Vinte e oito questões na ordem oficial do caderno (1–7 Português, 8–14 Matemática, 15–21 Geografia e História, 22–28 Ciências), com quatro horas de relógio. Faça sentado, sem celular, de uma vez só."));

  const inicio = painel("Antes de começar");
  inicio.corpo.append(html("ul", "limpa",
    "<li>Quatro horas corridas. O cartão-resposta real só pode ser entregue a partir das 15h30 — não existe motivo para ter pressa.</li>" +
    "<li>Use o protocolo de três passagens: resolva o que sai rápido, volte nas travadas, confira tudo refazendo as contas.</li>" +
    "<li>Não deixe nada em branco. Não há penalidade por erro, e o desempate premia justamente as questões difíceis.</li>" +
    "<li>Depois deste simulado, faça também as provas reais em PDF, listadas na aba Plano — elas têm as imagens e os textos longos que este treino não reproduz.</li>"));
  const ined = simuladosIneditos();
  inicio.corpo.append(html("p", "recado", ined > 0
    ? "Nenhuma questão se repete entre os seus simulados. Você ainda tem questões inéditas para <b>" + ined + " simulado" + (ined === 1 ? "" : "s") + " completo" + (ined === 1 ? "" : "s") + "</b> (a matemática gera números novos sempre)."
    : "Você já fez simulados com todas as questões do banco em alguma área. Neste, as que faltarem para completar 28 serão as que caíram há mais tempo."));
  const ac = el("div", "acoes");
  const b = el("button", "btn pri", "Iniciar simulado · 4h00");
  const b2 = el("button", "btn", "Modo rápido · 1h00");
  ac.append(b, b2); inicio.corpo.append(ac);
  tela.append(seletorNivel(telaSimulado));
  tela.append(inicio);
  b.onclick = () => rodar(4 * 3600);
  b2.onclick = () => rodar(3600);

  function rodar(segundos) {
    limpar();
    const qs = montarSimulado();
    const respostas = new Array(28).fill(null);
    let atual = 0, restante = segundos, timer;

    const barra = el("div", "barra-fixa");
    const crono = el("div", "crono", "");
    const mini = el("div", "mini-grade");
    const btnFim = el("button", "btn", "Encerrar e corrigir");
    barra.append(crono, mini, btnFim);
    tela.append(barra);

    const palco = el("div");
    palco.style.display = "flex"; palco.style.flexDirection = "column"; palco.style.gap = "14px";
    tela.append(palco);

    const cels = qs.map((q, i) => {
      const c = el("button", null, String(i + 1).padStart(2, "0"));
      c.onclick = () => { atual = i; mostrar(); };
      mini.append(c); return c;
    });

    function tick() {
      restante--;
      const h = Math.floor(restante / 3600), m = Math.floor(restante % 3600 / 60), s = restante % 60;
      crono.textContent = [h, m, s].map(v => String(v).padStart(2, "0")).join(":");
      crono.classList.toggle("urgente", restante < 600);
      if (restante <= 0) { clearInterval(timer); corrigir(); }
    }
    tick(); timer = setInterval(tick, 1000);

    function mostrar() {
      palco.replaceChildren();
      cels.forEach((c, i) => {
        c.classList.toggle("atual", i === atual);
        c.classList.toggle("resp", respostas[i] != null);
      });
      const q = qs[atual];
      const cartao = renderQuestao(q, {rotulo: "questão " + (atual + 1) + " de 28", semExplicacao: true});
      cartao.botoes.forEach((btn, k) => {
        btn.disabled = false;
        btn.classList.remove("certa", "errada");
        btn.onclick = () => { respostas[atual] = k; cartao.marcar(k); cels[atual].classList.add("resp"); };
      });
      if (respostas[atual] != null) cartao.marcar(respostas[atual]);
      const nav = el("div", "acoes"); nav.style.padding = "0 20px 18px";
      const ant = el("button", "btn", "← Anterior"); ant.disabled = atual === 0;
      ant.onclick = () => { atual--; mostrar(); };
      const pro = el("button", "btn pri", atual === 27 ? "Ir para o fim" : "Próxima →");
      pro.onclick = () => { if (atual < 27) { atual++; mostrar(); } else btnFim.focus(); };
      const pular = el("button", "btn peq", "Marcar para voltar depois");
      pular.onclick = () => { if (atual < 27) { atual++; mostrar(); } };
      nav.append(ant, pro, pular);
      nav.append(html("span", "chip neutro", respostas.filter(r => r != null).length + " de 28 respondidas"));
      cartao.append(nav);
      palco.append(cartao);
      window.scrollTo({top: 0, behavior: "instant"});
    }

    btnFim.onclick = () => {
      const branco = respostas.filter(r => r == null).length;
      if (branco && !confirm("Ainda há " + branco + " questão(ões) em branco. Na prova real, deixar em branco é jogar ponto fora — não há penalidade por erro. Encerrar mesmo assim?")) return;
      clearInterval(timer); corrigir();
    };

    function corrigir() {
      clearInterval(timer);
      const porArea = {port:0, mat:0, gh:0, cie:0};
      qs.forEach((q, i) => {
        const certo = respostas[i] === q.correta;
        if (certo) porArea[q.area]++;
        registrar(q, certo);
      });
      const total = ORDEM.reduce((t, a) => t + porArea[a], 0);
      S.simulados.push({data: Date.now(), total, porArea, tempo: segundos - restante, nivel: NIVEL,
        ids: qs.filter(q => !q.gerada).map(q => q.id)});
      salvar();

      limpar();
      tela.append(topo("Resultado do simulado", total >= META
        ? "Acima da meta. Nesse patamar você disputa as primeiras colocações da ampla concorrência."
        : "Abaixo da meta de " + META + "/28. O valor aqui não é a nota — é o mapa de onde estão os buracos."));

      const g = el("div", "grade-cartoes");
      [["Total", total + "/28", total >= META ? "acima da meta" : "meta: " + META + "/28"],
       ["Tempo usado", Math.floor((segundos - restante) / 60) + " min", "de " + Math.floor(segundos / 60) + " min"],
       ["Em branco", respostas.filter(r => r == null).length, "nunca deixe em branco"]
      ].forEach(([r, v, u]) => {
        const c = el("div", "cartao");
        c.append(el("div", "rotulo", r), el("div", "v", String(v)), el("div", "u", u)); g.append(c);
      });
      tela.append(g);

      const pa = painel("Desempenho por área");
      const dd = el("div", "dominio");
      ORDEM.forEach(a => {
        const l = el("div", "dlinha");
        l.append(el("b", null, AREAS[a].curto));
        const t = el("div", "trilho"), i = el("i");
        i.style.width = (porArea[a] / 7 * 100) + "%"; i.style.background = "var(--a-" + a + ")";
        t.append(i); l.append(t); l.append(el("span", "n", porArea[a] + "/7"));
        dd.append(l);
      });
      pa.corpo.append(dd);
      tela.append(pa);

      // só as erradas (e em branco) vêm com explicação; as certas ficam recolhidas
      const erradas = [], certas = [];
      qs.forEach((q, i) => (respostas[i] === q.correta ? certas : erradas).push(i));
      const pe = painel(erradas.length ? "Revise o que você errou" : "Gabarito completo",
        html("span", "rotulo", erradas.length + " de 28"));
      const lista = el("div");
      lista.style.display = "flex"; lista.style.flexDirection = "column"; lista.style.gap = "12px";
      if (!erradas.length) lista.append(html("div", "vazio", "Você acertou as 28. Suba a dificuldade no próximo simulado."));
      erradas.forEach(i => {
        const cartao = renderQuestao(qs[i], {rotulo: "questão " + (i + 1) + (respostas[i] == null ? " · em branco" : "")});
        cartao.escolher(respostas[i] == null ? -1 : respostas[i]);
        cartao.style.borderColor = "var(--rubro)";
        lista.append(cartao);
      });
      pe.corpo.append(lista);
      tela.append(pe);
      if (certas.length) {
        const dt = el("details", "certas");
        dt.append(el("summary", null, "Ver as " + certas.length + " que você acertou (" +
          certas.map(i => String(i + 1).padStart(2, "0")).join(", ") + ")"));
        certas.forEach(i => {
          const c = renderQuestao(qs[i], {rotulo: "questão " + (i + 1), semExplicacao: true});
          c.escolher(respostas[i]);
          dt.append(c);
        });
        tela.append(dt);
      }

      const ac2 = el("div", "acoes");
      const v = el("button", "btn pri", "Voltar ao painel"); v.onclick = () => ir("painel");
      ac2.append(v); tela.append(ac2);
      window.scrollTo({top: 0, behavior: "instant"});
    }
    mostrar();
  }
}

/* ============================ TELA: caderno de erro ============================ */
function telaErros() {
  limpar();
  tela.append(topo("Caderno de erro",
    "Sua prova de verdade não são as 28 questões do dia " + PROVA_DM + " — são as questões que você erra até lá. Ordenadas pelo que mais te derrubou."));

  const itens = Object.entries(S.cards).filter(([, c]) => c.erros > 0 && !c.dispensado)
    .sort((a, b) => (b[1].erros - b[1].acertos) - (a[1].erros - a[1].acertos));
  const dispensados = Object.values(S.cards).filter(c => c.erros > 0 && c.dispensado);

  /* erro por bobeira ou pressa: o aluno tira do caderno, mas a questão segue no Treino
     pela caixa de Leitner e, se for errada de novo, volta sozinha (ver registrar()) */
  function marcar(cs, valor) {
    cs.forEach(c => { if (valor) c.dispensado = true; else delete c.dispensado; });
    salvar(); atualizarContadores(); telaErros();
  }
  function painelDispensados() {
    if (!dispensados.length) return;
    const p = painel(null);
    const ac = el("div", "acoes");
    ac.append(el("span", null, dispensados.length + (dispensados.length === 1 ? " erro tirado" : " erros tirados") + " do caderno por bobeira."));
    const b = el("button", "btn peq", "Trazer de volta");
    b.onclick = () => marcar(dispensados, false);
    ac.append(b); p.corpo.append(ac); tela.append(p);
  }

  if (!itens.length) {
    const p = painel(null);
    p.corpo.append(html("div", "vazio", dispensados.length
      ? "Caderno limpo. Os que você tirou continuam aparecendo no Treino do dia — se errar de novo, voltam para cá."
      : "Nada aqui ainda. Faça um Treino do dia — e não tenha medo de errar: este caderno é o ativo mais valioso do método."));
    tela.append(p); painelDispensados(); return;
  }

  const p = painel("Tópicos por prejuízo", html("span", "rotulo", itens.length + " itens"));
  const tb = el("table");
  tb.innerHTML = "<thead><tr><th>Tópico</th><th>Área</th><th>Erros</th><th>Acertos</th><th>Caixa</th><th>Volta em</th><th></th></tr></thead>";
  const tbody = el("tbody");
  itens.forEach(([k, c]) => {
    const tr = el("tr");
    tr.append(el("td", null, c.topico || k));
    tr.append(el("td", null, AREAS[c.area] ? AREAS[c.area].curto : "—"));
    tr.append(el("td", "num", String(c.erros)));
    tr.append(el("td", "num", String(c.acertos)));
    const td = el("td", "num");
    td.append(html("span", "chip " + (c.box >= 4 ? "ok" : c.box >= 2 ? "media" : "alta"), c.box + "/5"));
    tr.append(td);
    const d = Math.max(0, Math.ceil((new Date(c.venc + "T00:00") - new Date()) / 86400000));
    tr.append(el("td", "num", d <= 0 ? "hoje" : d + "d"));
    const tdx = el("td");
    const bx = el("button", "btn peq", "Tirar");
    bx.title = "Errei por bobeira, já sei o conteúdo. Se errar de novo, volta para o caderno.";
    bx.onclick = () => marcar([c], true);
    tdx.append(bx); tr.append(tdx);
    tbody.append(tr);
  });
  tb.append(tbody);
  const rol = el("div", "rolagem"); rol.append(tb); p.corpo.append(rol);
  tela.append(p);

  const q = painel("Revisar agora só os erros");
  const ac = el("div", "acoes");
  const b = el("button", "btn pri", "Sessão só de erros");
  b.onclick = () => sessaoErros(itens);
  ac.append(b); q.corpo.append(ac);
  tela.append(q);
  painelDispensados();

  function sessaoErros(lista) {
    const fila = lista.slice(0, 10).map(([k]) => {
      if (k.startsWith("GEN:")) { const gi = GERADORES.findIndex(f => f.name === k.split(":")[1]); return gi >= 0 ? gerarQuestao(gi, NIVEL) : null; }
      return BANCO.find(x => x.id === k);
    }).filter(Boolean);
    fila.splice(0, fila.length, ...variarLetras(fila));
    limpar();
    tela.append(topo("Revisão de erros", "As " + fila.length + " que mais te custaram, de novo."));
    const palco = el("div");
    palco.style.display = "flex"; palco.style.flexDirection = "column"; palco.style.gap = "14px";
    tela.append(palco);
    let i = 0;
    (function prox() {
      palco.replaceChildren();
      if (i >= fila.length) {
        const p2 = painel("Revisão concluída");
        const a2 = el("div", "acoes");
        const v = el("button", "btn pri", "Voltar ao caderno"); v.onclick = telaErros;
        a2.append(v); p2.corpo.append(a2); palco.append(p2); return;
      }
      const qq = fila[i];
      const cartao = renderQuestao(qq, {
        rotulo: (i + 1) + "/" + fila.length,
        aoResponder: certo => {
          registrar(qq, certo);
          const nav = el("div", "acoes"); nav.style.padding = "0 20px 18px";
          const bn = el("button", "btn pri", i + 1 < fila.length ? "Próxima" : "Concluir");
          bn.onclick = () => { i++; prox(); };
          nav.append(bn); cartao.append(nav); bn.focus();
        }
      });
      palco.append(cartao);
    })();
  }
}

/* ============================ TELA: plano ============================ */
const SEMANAS = [
  ["1", "", "Simulado diagnóstico (prova 2026.1 em PDF, cronometrada). Confira se a inscrição está feita. Depois: matemática — área/volume e porcentagem."],
  ["2", "", "Matemática: razão, proporção, regra de três e leitura de gráfico. Geo/Hist: escravidão, resistência e abolicionismo + expansão marítima e colonização da América (Caminha, Tordesilhas, povos originários)."],
  ["3", "", "Matemática: sistemas do 1º grau e conversão de unidades. Geo/Hist: Santa Catarina — Contestado, colonização, regiões, clima. Uma sessão leve de História Antiga, Idade Média e expansão islâmica, Renascimento e Reforma/Contrarreforma."],
  ["4", "", "Ciências: energia, transformações, propagação de calor e eletricidade. Química básica. Geo/Hist (2 sessões): Estados Nacionais e absolutismo, Iluminismo, revoluções burguesas e independências na América (Haiti, hispânicas, EUA). Conferir pagamento da inscrição antes do prazo."],
  ["5", "", "Ciências: célula, fotossíntese, respiração celular, corpo humano, vacinas e ISTs. Astronomia. Geo/Hist (2 sessões): Revolução Industrial e imperialismo europeu na África e na Ásia."],
  ["6", "", "Geo/Hist: Primeira Guerra, entreguerras e crise de 1929, totalitarismos, Segunda Guerra, Era Vargas, Ditadura Militar, Guerra Fria."],
  ["7", "", "Simulado 2 (prova 2025.1) no domingo. Geo/Hist: independências na África e na Ásia, imperialismos dos séculos XX e XXI, contracultura e direitos humanos; globalização, trabalho, biomas e ambiente. Mais caderno de erro + 7 questões de interpretação por dia."],
  ["8", "", "Simulado 3 (prova 2025.2) no domingo. Na semana: caderno de erro + drill de matemática nos arquétipos ainda vermelhos. Mapa do edital: nenhum tópico de Geo/Hist pode ficar sem ter sido visto."],
  ["9", "", "Simulado 4 (prova 2024.1) no domingo. Na semana: só o caderno de erro, só o que continua vermelho."],
  ["—", "", "Quinta: revisão leve das fórmulas e do bloco SC, 30 min. Sexta: releitura do caderno de erro, 30 min, nada novo. Sábado: zero estudo, separar documento com foto e caneta preta, dormir cedo."]
];
const PROVAS_PDF = [
  ["2026.2", "31/05/2026", "2026-2-ec-int-prova-titular-ifsc", "integrado_-_gabarito_definitivo_2026-2_assinado-1-"],
  ["2026.1", "19/10/2025", "2026-1-ec-int-prova-ifsc", "integrado_-_gabarito_definitivo_2026-1_-_prova_titular_-_ifsc_assinado"],
  ["2025.2", "08/06/2025", "2025-2-ec-int-prova-titular-ifsc", "integrado_-_gabarito_definitivo_2025-2_-_prova_titular_-_ifsc_assinado"],
  ["2025.1", "24/11/2024", "2025-1-ec-int-prova-titular-ifsc", "integrado_-_gabarito_definitivo_2025-1_-_prova_titular_-_ifsc_assinado"],
  ["2024.2", "—", "p-b-2024-2-ec-int-prova-titular", "gabarito_definitivo_2024-2_assinado"],
  ["2024.1", "—", "2024-1-ec-int-prova-titular", "gabarito-definitivo-2024-1-prova-titular"],
  ["2023.2", "—", "2023-2-ec-int-prova-titular", "gabarito-oficial-2023-2-prova-titular"]
];
/* o calendário é contado de trás para frente a partir do dia da prova:
   reta final = os 3 dias antes; cada semana anterior, 7 dias */
const DIA = 86400000;
const P0 = new Date(PROVA.getFullYear(), PROVA.getMonth(), PROVA.getDate()).getTime();
const LIMITES = SEMANAS.slice(0, -1).map((_, i) => P0 - 3 * DIA - (SEMANAS.length - 2 - i) * 7 * DIA).concat(P0);
const dm = t => new Date(t).toLocaleDateString("pt-BR", {day:"2-digit", month:"2-digit"});
SEMANAS.forEach((s, i) => { const ini = i ? LIMITES[i - 1] : LIMITES[0] - 7 * DIA; s[1] = dm(ini) + "–" + dm(LIMITES[i] - DIA); });
function semanaAtual() {
  const t = Date.now();
  for (let i = 0; i < LIMITES.length; i++) if (t < LIMITES[i]) return i;
  return -1;
}
function telaPlano() {
  limpar();
  tela.append(topo("Plano até a prova",
    "Cinquenta minutos por dia, além do cursinho: 10 min de revisão espaçada, 25 min no bloco da semana, 12 min de questões mistas e 3 min explicando em voz alta."));

  const atual = semanaAtual();
  const p = painel("Calendário", html("span", "rotulo", diasAte(PROVA) + " dias restantes"));
  SEMANAS.forEach(([n, per, foco], i) => {
    const s = el("div", "semana" + (i === atual ? " agora" : ""));
    const d1 = el("div", "per");
    d1.append(html("b", null, n === "—" ? "Reta final" : "Semana " + n));
    d1.append(el("span", null, per));
    const d2 = el("div", "foco", foco);
    s.append(d1, d2);
    p.corpo.style.padding = "0";
    p.corpo.append(s);
  });
  tela.append(p);

  const pp = painel("Provas oficiais em PDF", html("span", "rotulo", "para os simulados reais"));
  pp.corpo.append(html("p", null, "<span style='font-size:13.5px;color:var(--ink-2)'>Os simulados deste site treinam o raciocínio, mas as provas reais trazem os textos longos, as imagens e as charges que só existem no caderno impresso. Faça pelo menos quatro delas, cronometradas, em papel.</span>"));
  const tb = el("table");
  tb.innerHTML = "<thead><tr><th>Edição</th><th>Data da prova</th><th>Arquivos</th></tr></thead>";
  const tbody = el("tbody");
  PROVAS_PDF.forEach(([ed, data, pv, gb]) => {
    const tr = el("tr");
    tr.append(el("td", null, ed), el("td", null, data));
    tr.append(html("td", null,
      '<a href="https://www.ifsc.edu.br/documents/d/ingresso/' + pv + '" target="_blank" rel="noopener">caderno de prova</a> · ' +
      '<a href="https://www.ifsc.edu.br/documents/d/ingresso/' + gb + '" target="_blank" rel="noopener">gabarito</a>'));
    tbody.append(tr);
  });
  tb.append(tbody);
  const rol = el("div", "rolagem"); rol.append(tb); pp.corpo.append(rol);
  tela.append(pp);

  const pr = painel("Protocolo do dia " + PROVA_DM);
  pr.corpo.append(html("ul", "limpa",
    "<li><b>Passagem 1 · 14h–15h30.</b> Resolva só o que sai em menos de três minutos. Qualquer resistência, marque e pule. Meta: 18 a 22 questões fechadas.</li>" +
    "<li><b>Passagem 2 · 15h30–17h.</b> Volte nas travadas com tempo integral. São provavelmente as tais “10 questões que a maioria errou” — as do desempate. Depois delas o empate vai para a idade (o mais velho leva), então brigue por cada uma.</li>" +
    "<li><b>Passagem 3 · 17h–17h40.</b> Confira as 28. Em matemática, <b>refaça a conta</b> em vez de reler. Procure a palavra INCORRETA ou EXCETO em todos os enunciados.</li>" +
    "<li><b>17h40–18h.</b> Transfira para o cartão-resposta com calma, caneta preta ou azul. Duas marcações na mesma questão anulam a resposta. Confira o número da linha a cada cinco questões.</li>"));
  tela.append(pr);
}

/* ============================ TELA: mapa do edital ============================ */
const MAPA = [
  ["mat","Área, perímetro e volume em contexto","alta","≈2 por prova, sempre — planta de apartamento, contêiner, copo cilíndrico, pilha de botões"],
  ["mat","Porcentagem, desconto e finanças","alta","≈1 por prova, sempre — à vista x parcelado, etanol x gasolina"],
  ["mat","Razão, proporção e regra de três","alta","1 a 2 por prova"],
  ["mat","Leitura de gráfico e tabela","alta","1 a 2 por prova"],
  ["mat","Sistema de duas equações do 1º grau","alta","≈1 por prova, disfarçado de compra no mercado"],
  ["mat","Conversão de unidades","alta","≈1 por prova — tempo, litros e m³, W e kWh"],
  ["mat","Pitágoras e relações métricas","media","aparece dentro de questões de geometria em contexto"],
  ["mat","Primos, MMC, MDC, racionais e irracionais","media","cai esporadicamente, mas é barato de dominar"],
  ["mat","Probabilidade e contagem","media","≈1 a cada duas provas"],
  ["mat","Equação do 2º grau e fatoração","baixa","está no edital, mas quase nunca aparece isolada"],
  ["gh","Escravidão, resistência e abolicionismo","alta","1 a 2 por prova, em TODAS as provas analisadas — maior retorno da prova inteira"],
  ["gh","Santa Catarina: Contestado, colonização, regiões","alta","1 a 2 por prova — bloco fechado e memorizável"],
  ["gh","Meio ambiente, biomas, desmatamento e queimadas","alta","1 a 2 por prova, e reaparece em Ciências"],
  ["gh","História contemporânea: nazifascismo, Vargas, Ditadura, Guerra Fria","alta","≈1 por prova"],
  ["gh","Globalização, capitalismo e mundo do trabalho","alta","≈1 por prova"],
  ["gh","Direitos humanos, desigualdade, gênero, povos originários","alta","≈1 por prova"],
  ["gh","Cartografia e linguagem gráfica","media","escala, curvas de nível, leitura de mapa"],
  ["gh","Colonização da América e expansão marítima","media","caiu em 2026.2 (Carta de Caminha) — porta de entrada da História Geral na prova"],
  ["gh","Iluminismo, revoluções burguesas e independências na América","media","raro isolado; sustenta as questões de direitos humanos e de escravidão (Haiti)"],
  ["gh","Revolução Industrial, imperialismo e descolonização da África e da Ásia","media","raro isolado; volta como pano de fundo de trabalho, tecnologia e recursos"],
  ["gh","Guerras Mundiais, entreguerras e totalitarismos","media","nazismo caiu em 2026.1 — Versalhes e 1929 são o contexto cobrado"],
  ["gh","Contracultura, direitos civis e imperialismos dos séculos XX e XXI","media","raro isolado; liga com racismo, direitos humanos e geopolítica atual"],
  ["gh","Antiguidade, Idade Média e expansão islâmica, Renascimento, Reforma, Estados Nacionais","baixa","está no Anexo V, mas não caiu como tema próprio de 2023.2 a 2026.2 — ler o Dossiê e fazer as questões"],
  ["cie","Energia: fontes, transformação, calor e eletricidade","alta","1 a 2 por prova — e pesa em qualquer curso técnico"],
  ["cie","Química: átomo, íons, misturas, transformação física x química","alta","1 a 2 por prova — bloco pequeno, 100% memorizável"],
  ["cie","Célula, fotossíntese e respiração celular","alta","≈2 por prova"],
  ["cie","Corpo humano, vacinas, imunidade e ISTs","alta","1 a 2 por prova"],
  ["cie","Astronomia: Terra, Lua, gravidade e massa","alta","≈1 por prova — bloco minúsculo, retorno altíssimo"],
  ["cie","Ecologia, efeito estufa e biodiversidade","media","≈1 por prova"],
  ["cie","Evolução e genética (1ª Lei de Mendel)","media","alternam entre si a cada prova"],
  ["cie","Mecânica: movimento e máquinas simples","media","≈1 a cada duas provas"],
  ["port","Interpretação: intenção, efeito de sentido, tese","alta","o eixo de quase todas as 7 questões"],
  ["port","Análise de afirmativas I / II / III","alta","formato recorrente em todas as áreas, não só em Português"],
  ["port","Coesão, conectivos e coerência","alta","≈1 por prova"],
  ["port","Variação linguística e preconceito linguístico","alta","item explícito do Anexo V, cai com frequência"],
  ["port","Figuras de linguagem e ambiguidade","media","≈1 por prova"],
  ["port","Gêneros textuais: tirinha, charge, notícia, manual","alta","o suporte da maioria das questões"],
  ["port","Gramática: concordância, regência, crase, morfologia","media","quase sempre embutida numa questão de análise, raramente isolada"]
];
function telaEdital() {
  limpar();
  tela.append(topo("Mapa do edital",
    "O Anexo V do edital listado por frequência real nas provas de 2023.2 a 2026.2, e não pela ordem em que o IFSC o publica. Estude de cima para baixo."));

  ORDEM.forEach(a => {
    const p = painel(AREAS[a].nome + " · 7 questões", html("span", "rotulo", "domínio " + Math.round(dominio(a) * 100) + "%"));
    const tb = el("table");
    tb.innerHTML = "<thead><tr><th>Tópico</th><th>Peso</th><th>Como cai</th></tr></thead>";
    const tbody = el("tbody");
    MAPA.filter(m => m[0] === a).forEach(([, nome, peso, obs]) => {
      const tr = el("tr");
      tr.append(el("td", null, nome));
      const td = el("td");
      td.append(html("span", "chip " + (peso === "alta" ? "alta" : peso === "media" ? "media" : "neutro"),
        peso === "alta" ? "alto" : peso === "media" ? "médio" : "baixo"));
      tr.append(td);
      tr.append(html("td", null, "<span style='color:var(--muted)'>" + obs + "</span>"));
      tbody.append(tr);
    });
    tb.append(tbody);
    const rol = el("div", "rolagem"); rol.append(tb); p.corpo.append(rol);
    p.corpo.style.padding = "0";
    tela.append(p);
  });

  const f = painel("Fontes");
  f.corpo.append(html("ul", "limpa",
    '<li><a href="https://www.ifsc.edu.br/documents/d/ingresso/edital-01_2026_2_tecnico_integrado_prova" target="_blank" rel="noopener">Edital 01/DEING/2026-2</a> — conteúdo programático no Anexo V, critérios de desempate no Anexo III</li>' +
    '<li><a href="https://www.ifsc.edu.br/provas-e-gabaritos" target="_blank" rel="noopener">Provas e gabaritos oficiais</a></li>' +
    '<li><a href="https://www.ifsc.edu.br/estatisticas-dos-processos-seletivos" target="_blank" rel="noopener">Estatísticas dos processos seletivos</a> — relação candidato/vaga e notas de corte</li>' +
    '<li><a href="https://www.ifsc.edu.br/calendario-de-inscricoes" target="_blank" rel="noopener">Calendário de inscrições</a></li>'));
  tela.append(f);
}

/* ============================ dossiê de conteúdo ============================ */
const TIERS = {
  nucleo: {rot:"Núcleo",  cls:"alta",
    reg:"Cai em toda prova (ou quase). É aqui que estão ~20 das 28 questões.",
    ordem:"Saber no automático, com detalhe, sem precisar pensar. Se algum item aqui está aberto, ele vem antes de qualquer outra coisa."},
  orbita: {rot:"Órbita",  cls:"media",
    reg:"Cai em cerca de metade das provas.",
    ordem:"Saber bem, sem aprofundar. Estudar só depois que o núcleo inteiro estiver fechado."},
  cauda:  {rot:"Cauda",   cls:"neutro",
    reg:"Está no Anexo V do edital, mas historicamente quase não cai.",
    ordem:"Ler uma vez para reconhecer e conseguir eliminar alternativa. Nunca gastar sessão inteira aqui — é o erro clássico de quem estuda pelo edital em vez de estudar pela prova."}
};
const ORDEM_TIER = ["nucleo","orbita","cauda"];
let filtroArea = "todas", filtroTier = "todos";

function dossieChave(d) { return d.area + "|" + d.topico; }
function dossieFeito(d) { return !!S.dossie[dossieChave(d)]; }
function contarDossie(tier) {
  const lst = DOMINIO.filter(d => d.tier === tier);
  return {n: lst.length, ok: lst.filter(dossieFeito).length};
}

function cartaoDossie(d) {
  const cx = el("article", "dossie" + (dossieFeito(d) ? " feito" : ""));

  const cab = el("header", "dossie-cab");
  cab.append(html("span", "selo " + d.area, AREAS[d.area].curto));
  cab.append(el("h3", null, d.topico));
  const marca = el("button", "btn peq marca");
  marca.setAttribute("aria-pressed", String(dossieFeito(d)));
  marca.textContent = dossieFeito(d) ? "✓ domino" : "marcar";
  marca.onclick = () => {
    const k = dossieChave(d);
    if (S.dossie[k]) delete S.dossie[k]; else S.dossie[k] = hojeISO();
    salvar(); telaDossie();
  };
  cab.append(marca);
  cx.append(cab);

  const corpo = el("div", "dossie-corpo");
  corpo.append(html("p", "freq", "<b>Frequência:</b> " + d.freq));

  const t = el("div", "bloco-saber");
  t.append(el("div", "rotulo", "O que você precisa saber"));
  const ul = el("ul", "limpa");
  d.saber.forEach(x => ul.append(html("li", null, x)));
  t.append(ul);
  corpo.append(t);

  corpo.append(html("div", "nota armadilha",
    "<span class='rotulo'>A armadilha</span>" + d.armadilha));
  corpo.append(html("div", "nota fogo",
    "<span class='rotulo'>Teste de fogo — explique em voz alta</span>" + d.fogo));

  cx.append(corpo);
  return cx;
}

function telaDossie() {
  limpar();
  tela.append(topo("Dossiê de conteúdo",
    "O Anexo V separado em três camadas de profundidade. A regra é simples: nunca estude um item de Órbita com algum item de Núcleo ainda aberto, e nunca estude Cauda por medo do edital. Marque “domino” só depois de passar no teste de fogo em voz alta, sem olhar."));

  /* --- barra de progresso por camada --- */
  const res = painel("Onde você está");
  const g = el("div", "dominio");
  ORDEM_TIER.forEach(t => {
    const {n, ok} = contarDossie(t);
    const linha = el("div", "dlinha");
    linha.append(el("b", null, TIERS[t].rot));
    const tr = el("div", "trilho"); const i = el("i");
    i.style.width = (n ? ok / n * 100 : 0) + "%";
    i.style.background = t === "nucleo" ? "var(--rubro)" : t === "orbita" ? "var(--ambar)" : "var(--muted)";
    tr.append(i); linha.append(tr);
    linha.append(html("span", "n", ok + "/" + n));
    g.append(linha);
  });
  res.corpo.append(g);
  const nuc = contarDossie("nucleo");
  res.corpo.append(html("p", "recado", nuc.ok < nuc.n
    ? "Faltam <b>" + (nuc.n - nuc.ok) + "</b> tópicos de Núcleo. Eles valem, sozinhos, cerca de 20 das 28 questões — é onde a sua nota é decidida."
    : "Núcleo fechado. Agora Órbita vale a pena; Cauda, só se sobrar tempo."));
  tela.append(res);

  /* --- filtros --- */
  const barra = el("div", "acoes");
  const grupoArea = el("div", "acoes");
  [["todas","Todas as áreas"]].concat(ORDEM.map(a => [a, AREAS[a].curto])).forEach(([k, r]) => {
    const b = el("button", "btn peq", r);
    b.setAttribute("aria-pressed", String(filtroArea === k));
    b.onclick = () => { filtroArea = k; telaDossie(); };
    grupoArea.append(b);
  });
  barra.append(grupoArea);
  tela.append(barra);

  const barra2 = el("div", "acoes");
  [["todos","Todas as camadas"]].concat(ORDEM_TIER.map(t => [t, TIERS[t].rot])).forEach(([k, r]) => {
    const b = el("button", "btn peq", r);
    b.setAttribute("aria-pressed", String(filtroTier === k));
    b.onclick = () => { filtroTier = k; telaDossie(); };
    barra2.append(b);
  });
  tela.append(barra2);

  /* --- conteúdo --- */
  let algum = false;
  ORDEM_TIER.forEach(t => {
    if (filtroTier !== "todos" && filtroTier !== t) return;
    const lst = DOMINIO.filter(d => d.tier === t && (filtroArea === "todas" || d.area === filtroArea));
    if (!lst.length) return;
    algum = true;

    const cab = el("section", "camada");
    const h = el("div", "camada-cab");
    h.append(html("span", "chip " + TIERS[t].cls, TIERS[t].rot));
    h.append(el("span", "camada-reg", TIERS[t].reg));
    cab.append(h);
    cab.append(el("p", "camada-ordem", TIERS[t].ordem));
    tela.append(cab);

    ORDEM.forEach(a => lst.filter(d => d.area === a).forEach(d => tela.append(cartaoDossie(d))));
  });
  if (!algum) tela.append(html("div", "painel", "<div class='vazio'>Nada com esse filtro.</div>"));
}

/* ============================ TELA: minha conta ============================ */
function telaConta() {
  limpar();
  tela.append(topo("Minha conta", EU.nome + " · " + EU.email));

  const venc = new Date(EU.expira + "T23:59");
  const pa = painel("Acesso");
  pa.corpo.append(html("p", null, "Ativo até <b>" + dataBR(venc) + "</b> · ciclo " + EU.ciclo.ciclo +
    ". Seu progresso fica salvo na conta — entre pelo celular ou pelo computador e continue de onde parou."));
  tela.append(pa);

  const pm = painel("Sua meta");
  const ac = el("div", "acoes");
  [16, 18, 20, 22, 24, 26].forEach(m => {
    const b = el("button", "btn peq", m + "/28");
    b.setAttribute("aria-pressed", String(META === m));
    b.onclick = () => { S.meta = META = m; salvar(); telaConta(); };
    ac.append(b);
  });
  pm.corpo.append(ac);
  pm.corpo.append(html("p", "recado", "Na dúvida, veja a nota de corte do seu curso e câmpus em " +
    '<a href="https://www.ifsc.edu.br/estatisticas-dos-processos-seletivos" target="_blank" rel="noopener">estatísticas dos processos seletivos</a> ' +
    "e mire 3 ou 4 acertos acima dela."));
  tela.append(pm);

  const pd = painel("Aparelhos conectados", html("span", "rotulo", EU.aparelhos.length + " de " + EU.max_aparelhos));
  const ul = el("ul", "limpa");
  EU.aparelhos.forEach(a => ul.append(el("li", null, a.aparelho + " · último uso " +
    new Date(a.vista * 1000).toLocaleString("pt-BR", {day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit"}))));
  pd.corpo.append(ul);
  pd.corpo.append(html("p", "recado", "O acesso é individual e vale para até " + EU.max_aparelhos +
    " aparelhos. Entrar num aparelho a mais desconecta o mais antigo."));
  tela.append(pd);

  const ps = painel(null);
  const a2 = el("div", "acoes");
  const sair = el("button", "btn", "Sair desta conta");
  sair.onclick = sairDaConta;
  a2.append(sair);
  if (EU.ciclo.suporte) a2.append(html("a", "btn", "Falar com o suporte")), a2.lastChild.href = EU.ciclo.suporte;
  ps.corpo.append(a2);
  tela.append(ps);
}

/* ============================ navegação ============================ */
const TELAS = {
  painel:   {rot:"Painel",          ico:"◉", fn: telaPainel},
  treino:   {rot:"Treino do dia",   ico:"▶", fn: telaTreino},
  drill:    {rot:"Drill de mat.",   ico:"∑", fn: telaDrill},
  simulado: {rot:"Simulado",        ico:"⏱", fn: telaSimulado},
  erros:    {rot:"Caderno de erro", ico:"✕", fn: telaErros},
  edital:   {rot:"Mapa do edital",  ico:"☰", fn: telaEdital},
  dossie:   {rot:"Dossiê",          ico:"◈", fn: telaDossie},
  plano:    {rot:"Plano até a prova",ico:"▤", fn: telaPlano},
  conta:    {rot:"Minha conta",     ico:"◎", fn: telaConta}
};
const nav = document.getElementById("nav");
const botoesNav = {};
Object.entries(TELAS).forEach(([k, t]) => {
  const b = el("button");
  b.append(html("span", null, t.ico), html("span", null, t.rot));
  if (k === "treino" || k === "erros") { const c = el("span", "ct", ""); b.append(c); botoesNav[k + ":ct"] = c; }
  b.onclick = () => ir(k);
  nav.append(b); botoesNav[k] = b;
});
function ir(k) {
  S.ultimaTela = k; salvar();
  Object.keys(TELAS).forEach(x => botoesNav[x].setAttribute("aria-current", String(x === k)));
  TELAS[k].fn();
  atualizarContadores();
  window.scrollTo({top: 0, behavior: "instant"});
}
function atualizarContadores() {
  const v = vencidos().length;
  botoesNav["treino:ct"].textContent = v || "";
  botoesNav["treino:ct"].style.display = v ? "" : "none";
  const e = Object.values(S.cards).filter(c => c.erros > 0 && c.box < 3 && !c.dispensado).length;
  botoesNav["erros:ct"].textContent = e || "";
  botoesNav["erros:ct"].style.display = e ? "" : "none";
}

/* sair: grava o que falta, encerra a sessão e volta para a página inicial */
async function sairDaConta() {
  try { await sincronizar(); await fetch("/api/sair", {method:"POST"}); } catch (e) {}
  try { localStorage.removeItem(CHAVE); } catch (e) {}
  location.href = "/";
}
document.getElementById("btn-sair").onclick = sairDaConta;

/* tema e reset */
const btnTema = document.getElementById("btn-tema");
if (S.tema) document.documentElement.setAttribute("data-theme", S.tema);
btnTema.onclick = () => {
  const atual = document.documentElement.getAttribute("data-theme");
  const escuro = atual ? atual === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  S.tema = escuro ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", S.tema);
  salvar();
};
/* junta dois estados: de cada questão fica a revisão mais recente (usado no sync) */
function juntar(local, vindo) {
  const r = Object.assign(vazio(), local, {              // cópia: não mexer no estado atual
    cards: Object.assign({}, local.cards),
    dias: Object.assign({}, local.dias),
    simulados: (local.simulados || []).slice(),
    dossie: Object.assign({}, local.dossie)
  });
  for (const [k, c] of Object.entries(vindo.cards || {})) {
    const meu = r.cards[k];
    // sem registro aqui, ou o outro computador revisou depois: fica o de lá
    if (!meu || (c.visto || "") > (meu.visto || "") ||
        ((c.visto || "") === (meu.visto || "") && (c.box || 0) > (meu.box || 0))) r.cards[k] = c;
  }
  for (const [dia, d] of Object.entries(vindo.dias || {})) {
    const meu = r.dias[dia];
    r.dias[dia] = meu ? {n: meu.n + d.n, a: meu.a + d.a} : d;
  }
  const vistos = new Set(r.simulados.map(s => s.data));
  (vindo.simulados || []).forEach(s => { if (!vistos.has(s.data)) r.simulados.push(s); });
  r.simulados.sort((a, b) => a.data - b.data);
  for (const [k, dia] of Object.entries(vindo.dossie || {}))
    if (!r.dossie[k] || dia < r.dossie[k]) r.dossie[k] = dia;   // vale a primeira vez que foi marcado
  return r;
}

document.getElementById("btn-zerar").onclick = () => {
  if (confirm("Isso apaga todo o seu histórico de revisões, o caderno de erro e os simulados. Não dá para desfazer. Zerar mesmo?")) {
    S = vazio(); salvar(); ir("painel");
  }
};

document.getElementById("quem").textContent = EU.nome.split(" ")[0];

ir(TELAS[S.ultimaTela] ? S.ultimaTela : "painel");
};
