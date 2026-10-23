/* Atividades — treino infinito por conteúdo, fora do formato da prova.
   É o drill de matemática estendido às outras matérias: questão atrás de questão sobre um
   conteúdo só, para treinar até dominar. Nada daqui aparece no Treino do dia nem no
   Simulado — os trechos não podem repetir questões de banco.js (ver CLAUDE.md).

   Cada atividade é {id, area, topico, tipo, ...} e entra em window.ATIVIDADES.
   O conteúdo de Português, Geo/História e Ciências mora em atividades-port.js,
   atividades-gh.js e atividades-cie.js; aqui ficam o motor e os geradores numéricos.

   tipo "classificar" — itens [categoria, trecho, nota?]. Sorteia um trecho e pergunta a
       categoria (p1), ou sorteia uma categoria e pergunta qual trecho é dela (p2).
       cats {categoria: explicação} entra no porquê, depois de responder.
       Para pares termo→definição, basta um item por categoria (sem cats).
       inversa:false desliga a pergunta p2 quando um trecho pode ter mais de uma leitura.
   tipo "julgar"    — certas [[frase, nota]] e erradas [[frase, nota]]. p1 pede a certa
       entre 4 erradas; p2 (opcional) pede a errada entre 4 certas.
   tipo "gerador"   — gerar() devolve {enunciado, alts, correta, porque}, números novos
       a cada chamada.
   Como as combinações são sorteadas a cada clique, um conjunto de 40 itens já rende
   milhares de questões diferentes — e nenhuma dá para decorar pela posição da letra.  */
(function () {
  const A = window.ATIVIDADES = window.ATIVIDADES || [];
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  function embaralhar(v) {
    const a = v.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const num = v => Number(v.toFixed(2)).toLocaleString("pt-BR", {maximumFractionDigits: 2});
  const brl = v => "R$ " + v.toLocaleString("pt-BR", {minimumFractionDigits: 2, maximumFractionDigits: 2});

  /* ---------------- motor ---------------- */

  /* sorteia evitando o que saiu há pouco; se tudo saiu há pouco, aceita repetir */
  function sortear(lista, chave, recentes) {
    const frescos = lista.filter(x => !recentes.has(chave(x)));
    return pick(frescos.length ? frescos : lista);
  }
  const aspas = t => "“" + t + "”";

  function classificar(atv, recentes) {
    const cats = [...new Set(atv.itens.map(i => i[0]))];
    const nAlts = Math.min(5, cats.length);
    const cola = c => atv.cats && atv.cats[c] ? c + ": " + atv.cats[c] : null;
    const inversa = atv.inversa !== false && atv.p2 && Math.random() < 0.4;

    if (!inversa) {
      const item = sortear(atv.itens, i => i[1], recentes);
      const outras = embaralhar(cats.filter(c => c !== item[0])).slice(0, nAlts - 1);
      const alts = embaralhar([item[0]].concat(outras));
      const linhas = [aspas(item[1]) + " → " + item[0] + "."];
      if (item[2]) linhas.push(item[2]);
      if (cola(item[0])) linhas.push("Lembre — " + cola(item[0]));
      return {chave: item[1], enunciado: atv.p1, texto: item[1], alts, correta: alts.indexOf(item[0]),
        porque: linhas.join("\n")};
    }
    const alvo = sortear(cats, c => "cat:" + c, recentes);
    const certo = pick(atv.itens.filter(i => i[0] === alvo));
    const outras = embaralhar(cats.filter(c => c !== alvo)).slice(0, nAlts - 1)
      .map(c => pick(atv.itens.filter(i => i[0] === c)));
    const opcoes = embaralhar([certo].concat(outras));
    const linhas = [aspas(certo[1]) + " → " + alvo + "." + (certo[2] ? " " + certo[2] : "")];
    if (cola(alvo)) linhas.push("Lembre — " + cola(alvo));
    linhas.push("", "As outras alternativas:");
    outras.forEach(o => linhas.push("• " + aspas(o[1]) + " → " + o[0]));
    return {chave: "cat:" + alvo, enunciado: atv.p2.replace("{c}", alvo), alts: opcoes.map(o => o[1]),
      correta: opcoes.indexOf(certo), porque: linhas.join("\n")};
  }

  function julgar(atv, recentes) {
    const inversa = atv.p2 && Math.random() < 0.35;
    const [unica, resto] = inversa ? [atv.erradas, atv.certas] : [atv.certas, atv.erradas];
    const certo = sortear(unica, i => i[0], recentes);
    const outras = embaralhar(resto).slice(0, 4);
    const opcoes = embaralhar([certo].concat(outras));
    const linhas = [aspas(certo[0]) + " — " + certo[1], "", "As outras alternativas:"];
    outras.forEach(o => linhas.push("• " + aspas(o[0]) + " — " + o[1]));
    return {chave: certo[0], enunciado: inversa ? atv.p2 : atv.p1, alts: opcoes.map(o => o[0]),
      correta: opcoes.indexOf(certo), porque: linhas.join("\n")};
  }

  /* recentes: Set com as chaves das últimas questões da sessão, para não repetir logo */
  window.gerarAtividade = function (atv, recentes) {
    recentes = recentes || new Set();
    let q;
    if (atv.tipo === "gerador") { q = atv.gerar(); q.chave = q.enunciado; }
    else q = (atv.tipo === "julgar" ? julgar : classificar)(atv, recentes);
    q.area = atv.area; q.topico = atv.topico; q.gerada = true;
    q.id = "ATV:" + atv.id + ":" + Math.random().toString(36).slice(2, 8);
    return q;
  };

  /* ---------------- geradores numéricos ---------------- */

  /* 5 alternativas: correta + distratores (erros típicos), sem repetir o texto na tela */
  function montar(correto, distratores, fmt) {
    fmt = fmt || (v => num(v));
    const vistos = new Set([fmt(correto)]), lista = [correto];
    for (const d of distratores) {
      if (lista.length >= 5) break;
      if (d == null || !isFinite(d) || vistos.has(fmt(d))) continue;
      vistos.add(fmt(d)); lista.push(d);
    }
    let guarda = 0;
    while (lista.length < 5 && guarda++ < 200) {
      const passo = Math.max(1, Math.abs(Math.round(correto * 0.15)));
      const d = Number.isInteger(correto) ? correto + ri(-4, 4) * passo : Math.round(correto * (1 + ri(-40, 40) / 100) * 100) / 100;
      if (!vistos.has(fmt(d))) { vistos.add(fmt(d)); lista.push(d); }
    }
    lista.sort((a, b) => a - b);
    return {alts: lista.map(fmt), correta: lista.indexOf(correto)};
  }
  /* alternativas que não são números (frações, expressões): correta + distratores em texto */
  function montarTexto(correto, distratores, reserva) {
    const lista = [correto];
    for (const d of distratores.concat(reserva ? reserva() : [])) {
      if (lista.length >= 5) break;
      if (d && !lista.includes(d)) lista.push(d);
    }
    let guarda = 0;
    while (lista.length < 5 && reserva && guarda++ < 50) { const d = reserva()[0]; if (d && !lista.includes(d)) lista.push(d); }
    const alts = embaralhar(lista);
    return {alts, correta: alts.indexOf(correto)};
  }
  const mdc = (a, b) => b ? mdc(b, a % b) : Math.abs(a);
  const mmc = (a, b) => a / mdc(a, b) * b;
  function fracao(n, d) {
    if (d < 0) { n = -n; d = -d; }
    const g = mdc(n, d) || 1; n /= g; d /= g;
    return d === 1 ? String(n) : n + "/" + d;
  }
  const sinal = v => v < 0 ? "(" + v + ")" : String(v);
  const sup = n => String(n).replace(/[-0-9]/g, c => "⁻⁰¹²³⁴⁵⁶⁷⁸⁹"["-0123456789".indexOf(c)]);

  const MAT = [];

  MAT.push({id:"mat-fracoes", topico:"Operações com frações",
    gerar() {
      const a = ri(1, 7), b = pick([2, 3, 4, 5, 6, 8, 10]), c = ri(1, 7), d = pick([2, 3, 4, 5, 6, 8, 9, 12].filter(x => x !== b));
      const op = pick(["+", "−", "×", "÷"]);
      let n, den, passo, erros;
      if (op === "+" || op === "−") {
        const m = mmc(b, d), s = op === "+" ? 1 : -1;
        n = a * (m / b) + s * c * (m / d); den = m;
        passo = `MMC(${b}, ${d}) = ${m}. Reescreva: ${a}/${b} = ${a * m / b}/${m} e ${c}/${d} = ${c * m / d}/${m}. Agora ${op === "+" ? "some" : "subtraia"} só os numeradores: ${a * m / b} ${op} ${c * m / d} = ${n} → ${n}/${m} = ${fracao(n, m)}.`;
        erros = [fracao(a + s * c, b + d), fracao(a + s * c, b * d), fracao(a * c, b * d), fracao(a * d + s * c * b, b + d)];
      } else if (op === "×") {
        n = a * c; den = b * d;
        passo = `Multiplica em linha: (${a} × ${c}) / (${b} × ${d}) = ${n}/${den} = ${fracao(n, den)}. Não precisa de MMC para multiplicar.`;
        erros = [fracao(a * d, b * c), fracao(a + c, b + d), fracao(a * c, b + d), fracao(a * d * c, b)];
      } else {
        n = a * d; den = b * c;
        passo = `Dividir é multiplicar pelo inverso: ${a}/${b} × ${d}/${c} = ${n}/${den} = ${fracao(n, den)}.`;
        erros = [fracao(a * c, b * d), fracao(b * c, a * d), fracao(a + d, b + c), fracao(a * c, b * c)];
      }
      const certo = fracao(n, den);
      return {enunciado: `Calcule e simplifique: ${a}/${b} ${op} ${c}/${d}`,
        ...montarTexto(certo, erros, () => [fracao(n + ri(-3, 3) || 1, den + ri(-2, 2) || 1)]), porque: passo};
    }});

  MAT.push({id:"mat-porcentagem", topico:"Porcentagem",
    gerar() {
      const tipo = pick(["de", "aumento", "desconto", "qual", "seguidos"]);
      const p = pick([5, 10, 12, 15, 20, 25, 30, 40, 50, 60, 75]);
      const v = pick([40, 60, 80, 120, 150, 200, 240, 300, 360, 450, 500, 800, 1200]);
      if (tipo === "de") {
        const r = v * p / 100;
        return {enunciado: `Quanto é ${p}% de ${v}?`, ...montar(r, [v * p / 10, v / p, r * 2, v - r]),
          porque: `${p}% = ${p}/100 = ${num(p / 100)}. Então ${v} × ${num(p / 100)} = ${num(r)}.\nAtalho: 10% de ${v} é ${num(v / 10)}; a partir daí monte o resto (5% é metade de 10%, 25% é um quarto).`};
      }
      if (tipo === "aumento" || tipo === "desconto") {
        const s = tipo === "aumento" ? 1 : -1, r = v * (1 + s * p / 100);
        return {enunciado: `Um produto custa ${brl(v)}. Com ${tipo === "aumento" ? "um aumento" : "um desconto"} de ${p}%, quanto passa a custar?`,
          ...montar(r, [v * p / 100, v * (1 - s * p / 100), v + s * p, v * (1 + s * p / 10)], brl),
          porque: `${tipo === "aumento" ? "Aumento" : "Desconto"} de ${p}% → multiplique por ${num(1 + s * p / 100)}: ${brl(v)} × ${num(1 + s * p / 100)} = ${brl(r)}.\nA alternativa ${brl(v * p / 100)} é só o valor do ${tipo}, não o preço final.`};
      }
      if (tipo === "qual") {
        const parte = v * p / 100;
        return {enunciado: `Numa turma de ${v} pessoas, ${num(parte)} usam óculos. Que porcentagem da turma usa óculos?`,
          ...montar(p, [v / parte, parte, 100 - p, p / 10], x => num(x) + "%"),
          porque: `Porcentagem = parte ÷ total × 100 = ${num(parte)} ÷ ${v} × 100 = ${p}%.`};
      }
      const p1 = pick([10, 20, 25, 50]), r = v * (1 + p1 / 100) * (1 - p1 / 100);
      return {enunciado: `Um preço de ${brl(v)} sobe ${p1}% e, no mês seguinte, cai ${p1}%. Qual é o preço final?`,
        ...montar(r, [v, v * (1 + p1 / 100), v * (1 - p1 / 100), v * (1 - p1 / 200)], brl),
        porque: `Variações seguidas se multiplicam: ${brl(v)} × ${num(1 + p1 / 100)} × ${num(1 - p1 / 100)} = ${brl(r)}.\nNão volta para ${brl(v)}: os ${p1}% de queda incidem sobre um valor maior, então tiram mais do que o aumento colocou.`};
    }});

  MAT.push({id:"mat-potencias", topico:"Potências e raízes",
    gerar() {
      const tipo = pick(["pot", "pot", "neg", "regra", "raiz"]);
      if (tipo === "pot") {
        const b = ri(2, 6), e = ri(2, b <= 3 ? 5 : 3), r = b ** e;
        return {enunciado: `Quanto vale ${b}${"⁰¹²³⁴⁵"[e]}?`, ...montar(r, [b * e, b + e, b ** (e - 1), e ** b]),
          porque: `${b}${"⁰¹²³⁴⁵"[e]} = ${Array(e).fill(b).join(" × ")} = ${r}. O erro clássico é fazer ${b} × ${e} = ${b * e}: potência é multiplicar a base por ela mesma, não pelo expoente.`};
      }
      if (tipo === "neg") {
        const b = ri(2, 5), e = pick([2, 3]), parenteses = Math.random() < 0.5;
        const r = parenteses ? (-b) ** e : -(b ** e);
        return {enunciado: `Quanto vale ${parenteses ? "(−" + b + ")" : "−" + b}${"⁰¹²³"[e]}?`,
          ...montar(r, [-r, b * e, -b * e, b ** e + 1]),
          porque: parenteses
            ? `Com parênteses, o sinal faz parte da base: (−${b}) × (−${b})${e === 3 ? " × (−" + b + ")" : ""} = ${r}. Expoente par deixa positivo; ímpar mantém negativo.`
            : `Sem parênteses, o expoente vale só para o ${b}: −(${b}${"⁰¹²³"[e]}) = −${b ** e}. O sinal de menos fica de fora.`};
      }
      if (tipo === "regra") {
        const b = ri(2, 5), m = ri(2, 6), n = ri(1, 4), div = Math.random() < 0.5;
        const e = div ? m - n : m + n;
        return {enunciado: `Escreva como uma única potência: ${b}${sup(m)} ${div ? "÷" : "×"} ${b}${sup(n)}`,
          ...montarTexto(b + sup(e), [b + sup(m * n), b + sup(div ? m + n : Math.abs(m - n)), (b * b) + sup(e), b + sup(m * n + 1)],
            () => [b + sup(e + ri(1, 4))]),
          porque: `Mesma base: na ${div ? "divisão, SUBTRAI" : "multiplicação, SOMA"} os expoentes. ${m} ${div ? "−" : "+"} ${n} = ${e}, então ${b}${sup(e)}. Multiplicar expoentes (${m} × ${n}) é a regra da potência de potência, (aᵐ)ⁿ — outra situação.`};
      }
      const r = ri(4, 20), q = r * r;
      return {enunciado: `Quanto vale √${q}?`, ...montar(r, [q / 2, r + 1, r - 1, r * 2]),
        porque: `Raiz quadrada é a operação inversa do quadrado: ${r} × ${r} = ${q}, então √${q} = ${r}. Não é dividir por 2 (${num(q / 2)}).`};
    }});

  MAT.push({id:"mat-inteiros", topico:"Números inteiros e sinais",
    gerar() {
      const a = ri(-15, 15) || 4, b = ri(-12, 12) || -3, op = pick(["+", "−", "×", "÷"]);
      let r, bb = b, txt;
      if (op === "+") { r = a + b; txt = `${sinal(a)} + ${sinal(b)} = ${r}. ${Math.sign(a) === Math.sign(b) ? "Sinais iguais: soma os valores e mantém o sinal." : "Sinais diferentes: subtrai os valores e fica o sinal do maior em módulo."}`; }
      if (op === "−") { r = a - b; txt = `Subtrair ${sinal(b)} é somar o oposto: ${sinal(a)} + ${sinal(-b)} = ${r}.`; }
      if (op === "×") { r = a * b; txt = `${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(r)}; sinais ${Math.sign(a) === Math.sign(b) ? "iguais → positivo" : "diferentes → negativo"}: ${r}.`; }
      if (op === "÷") { bb = pick([-4, -3, -2, 2, 3, 5]); const dividendo = bb * (ri(-9, 9) || 2); r = dividendo / bb;
        return {enunciado: `Calcule: ${sinal(dividendo)} ÷ ${sinal(bb)}`, ...montar(r, [-r, dividendo - bb, r + 1, dividendo * bb]),
          porque: `${Math.abs(dividendo)} ÷ ${Math.abs(bb)} = ${Math.abs(r)}; sinais ${Math.sign(dividendo) === Math.sign(bb) ? "iguais → positivo" : "diferentes → negativo"}: ${r}.`}; }
      return {enunciado: `Calcule: ${sinal(a)} ${op} ${sinal(b)}`, ...montar(r, [-r, op === "−" ? a + b : a - b, op === "×" ? a + b : a * b, r + (r > 0 ? -2 : 2)]), porque: txt};
    }});

  MAT.push({id:"mat-expressoes", topico:"Expressões numéricas",
    gerar() {
      const a = ri(2, 9), b = ri(2, 6), c = ri(2, 5), d = ri(1, 9), modo = pick([1, 2, 3]);
      if (modo === 1) {
        const r = a + b * c;
        return {enunciado: `Calcule: ${a} + ${b} × ${c}`, ...montar(r, [(a + b) * c, a * b + c, a + b + c]),
          porque: `Multiplicação vem antes da soma: ${b} × ${c} = ${b * c}; depois ${a} + ${b * c} = ${r}. Quem faz da esquerda para a direita chega em ${(a + b) * c}.`};
      }
      if (modo === 2) {
        const r = (a + b) * c - d;
        return {enunciado: `Calcule: (${a} + ${b}) × ${c} − ${d}`, ...montar(r, [a + b * c - d, (a + b) * (c - d), (a + b) * c + d]),
          porque: `Parênteses primeiro: ${a} + ${b} = ${a + b}. Depois a multiplicação: ${a + b} × ${c} = ${(a + b) * c}. Por fim ${(a + b) * c} − ${d} = ${r}.`};
      }
      const q = b * c, r = a * a - q / b + d;
      return {enunciado: `Calcule: ${a}² − ${q} ÷ ${b} + ${d}`, ...montar(r, [a * 2 - q / b + d, (a * a - q) / b + d, a * a - q / (b + d), a * a - c - d]),
        porque: `Potência primeiro: ${a}² = ${a * a}. Depois a divisão: ${q} ÷ ${b} = ${c}. Por fim, da esquerda para a direita: ${a * a} − ${c} + ${d} = ${r}.`};
    }});

  MAT.push({id:"mat-equacao1", topico:"Equação do 1º grau",
    gerar() {
      const x = ri(-6, 12) || 3, a = ri(2, 9), b = ri(-20, 20) || 5, modo = pick([1, 2]);
      if (modo === 1) {
        const c = a * x + b;
        return {enunciado: `Resolva: ${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${c}`, ...montar(x, [(c + b) / a, c / a - b, (c - b) * a, -x]),
          porque: `${a}x = ${c} ${b < 0 ? "+" : "−"} ${Math.abs(b)} = ${c - b}\nx = ${c - b} ÷ ${a} = ${x}.\nConferindo: ${a} × ${sinal(x)} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${c}. ✓`};
      }
      const cc = ri(1, a - 1) || 1, d = a * x + b - cc * x;
      return {enunciado: `Resolva: ${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${cc}x ${d < 0 ? "−" : "+"} ${Math.abs(d)}`,
        ...montar(x, [(d + b) / (a - cc), (d - b) / (a + cc), d - b, -x]),
        porque: `Junte x de um lado e números do outro: ${a}x − ${cc}x = ${d} ${b < 0 ? "+" : "−"} ${Math.abs(b)}\n${a - cc}x = ${d - b}\nx = ${x}.`};
    }});

  MAT.push({id:"mat-regra3", topico:"Regra de três",
    gerar() {
      if (Math.random() < 0.55) {
        const u = pick([2.5, 3, 4, 4.5, 6, 7.5, 12]), q1 = ri(2, 8), q2 = ri(3, 15), ctx = pick([["cadernos", "custam"], ["quilos de arroz", "custam"], ["metros de fio", "custam"]]);
        const r = u * q2;
        return {enunciado: `Se ${q1} ${ctx[0]} ${ctx[1]} ${brl(u * q1)}, quanto custam ${q2}?`,
          ...montar(r, [u * q1 * q1 / q2, u * q1 + q2, u * q1 * q2, r / 2], brl),
          porque: `Direta (mais ${ctx[0]}, mais caro): ${q1} → ${brl(u * q1)}, ${q2} → x. x = ${brl(u * q1)} × ${q2} ÷ ${q1} = ${brl(r)}.\nOu pelo valor unitário: ${brl(u * q1)} ÷ ${q1} = ${brl(u)} cada.`};
      }
      const p1 = pick([2, 3, 4, 5, 6]), d1 = pick([6, 8, 10, 12, 15, 20, 24, 30]), p2 = pick([2, 3, 4, 5, 6, 8, 10, 12].filter(v => v !== p1 && (p1 * d1) % v === 0));
      if (!p2) return this.gerar();
      const r = p1 * d1 / p2;
      return {enunciado: `${p1} pedreiros constroem um muro em ${d1} dias. Trabalhando no mesmo ritmo, em quantos dias ${p2} pedreiros constroem o mesmo muro?`,
        ...montar(r, [d1 * p2 / p1, d1 + p2 - p1, d1 - p2 + p1, d1 * p1 * p2 / 10]),
        porque: `INVERSA: mais pedreiros, menos dias. O trabalho total é ${p1} × ${d1} = ${p1 * d1} "pedreiro-dias". Com ${p2}: ${p1 * d1} ÷ ${p2} = ${num(r)} dias.\nQuem multiplica cruzado como se fosse direta chega em ${num(d1 * p2 / p1)}.`};
    }});

  MAT.push({id:"mat-mmc", topico:"MMC e MDC",
    gerar() {
      const g = ri(2, 6), x = ri(2, 7); let y = ri(2, 7); if (y === x) y = x + 1;
      const a = g * Math.min(x, y), b = g * Math.max(x, y);   // têm divisor comum de verdade, MDC ≥ 2
      if (Math.random() < 0.5) {
        const r = mmc(a, b);
        return {enunciado: pick([`Um farol pisca a cada ${a} segundos e outro a cada ${b} segundos. Se piscaram juntos agora, daqui a quantos segundos piscarão juntos de novo?`, `Qual é o MMC de ${a} e ${b}?`]),
          ...montar(r, [a * b, mdc(a, b), a + b, r * 2]),
          porque: `Coincidência de repetições → MMC. Múltiplos de ${a}: ${[1, 2, 3, 4].map(k => a * k).join(", ")}… Múltiplos de ${b}: ${[1, 2, 3].map(k => b * k).join(", ")}… O primeiro em comum é ${r}.\n${a} × ${b} = ${a * b} também é múltiplo comum, mas não é o MENOR.`};
      }
      const r = mdc(a, b);
      return {enunciado: pick([`Duas fitas medem ${a} cm e ${b} cm. Quer-se cortá-las em pedaços iguais, do maior tamanho possível, sem sobra. Quanto mede cada pedaço?`, `Qual é o MDC de ${a} e ${b}?`]),
        ...montar(r, [mmc(a, b), Math.abs(a - b) === r ? r * 2 : Math.abs(a - b), r === 2 ? 4 : r - 1, a / r]),
        porque: `Dividir em partes iguais e o maior possível → MDC. Divisores de ${a}: ${Array.from({length: a}, (_, i) => i + 1).filter(k => a % k === 0).join(", ")}. Divisores de ${b}: ${Array.from({length: b}, (_, i) => i + 1).filter(k => b % k === 0).join(", ")}. O maior em comum é ${r}.`};
    }});

  MAT.push({id:"mat-unidades", topico:"Conversão de unidades",
    gerar() {
      const t = pick([
        () => { const v = pick([1.5, 2.3, 0.75, 3.2, 12.5]); return [`Quantos metros há em ${num(v)} km?`, v * 1000, [v * 100, v * 10, v * 10000], " m", `1 km = 1000 m: ${num(v)} × 1000 = ${num(v * 1000)} m.`]; },
        () => { const v = pick([35, 120, 250, 7, 1500]); return [`Quantos metros há em ${v} cm?`, v / 100, [v / 10, v / 1000, v * 100], " m", `1 m = 100 cm, então divida por 100: ${v} ÷ 100 = ${num(v / 100)} m.`]; },
        () => { const v = pick([2, 3, 1.5, 0.5, 4]); return [`Quantos litros cabem em ${num(v)} m³?`, v * 1000, [v * 100, v * 10, v * 1000000], " L", `1 m³ = 1000 L: ${num(v)} × 1000 = ${num(v * 1000)} L.`]; },
        () => { const v = pick([250, 1500, 750, 3200, 50]); return [`${v} mL equivalem a quantos litros?`, v / 1000, [v / 100, v / 10, v * 1000], " L", `1 L = 1000 mL: ${v} ÷ 1000 = ${num(v / 1000)} L.`]; },
        () => { const v = pick([2, 3, 5, 0.5, 1.2]); return [`Quantos cm² há em ${num(v)} m²?`, v * 10000, [v * 100, v * 1000, v * 10], " cm²", `Área sobe de 100 em 100 por degrau: m² → dm² (×100) → cm² (×100). ${num(v)} × 10 000 = ${num(v * 10000)} cm². Usar só ×100 é tratar área como comprimento.`]; },
        () => { const v = pick([1.5, 2.25, 0.75, 3.5, 1.2]); return [`Quantos minutos há em ${num(v)} h?`, v * 60, [v * 100, v * 10, v * 30], " min", `Tempo é base 60: ${num(v)} × 60 = ${num(v * 60)} min. ${num(v)} h NÃO é ${num(Math.floor(v))} h e ${Math.round((v % 1) * 100)} min.`]; },
        () => { const v = pick([2.5, 0.8, 1.25, 4, 0.35]); return [`Quantos gramas há em ${num(v)} kg?`, v * 1000, [v * 100, v * 10, v / 1000], " g", `1 kg = 1000 g: ${num(v)} × 1000 = ${num(v * 1000)} g.`]; }
      ])();
      return {enunciado: t[0], ...montar(t[1], t[2], v => num(v) + t[3]), porque: t[4]};
    }});

  MAT.push({id:"mat-media", topico:"Média aritmética e ponderada",
    gerar() {
      if (Math.random() < 0.5) {
        const n = ri(3, 5), vs = Array.from({length: n}, () => ri(4, 10)); let s = vs.reduce((a, b) => a + b, 0);
        while (s % n) { vs[0]++; s++; }
        const r = s / n;
        return {enunciado: `Um estudante tirou as notas ${vs.join(", ")}. Qual é a média aritmética?`, ...montar(r, [s / (n - 1), s, (Math.max(...vs) + Math.min(...vs)) / 2, r + 0.5]),
          porque: `Soma: ${vs.join(" + ")} = ${s}. Divida pela quantidade de notas (${n}): ${s} ÷ ${n} = ${num(r)}.`};
      }
      const [n1, n2, p1, p2] = [ri(4, 10), ri(4, 10), pick([1, 2, 3]), pick([2, 3, 4])];
      const r = (n1 * p1 + n2 * p2) / (p1 + p2);
      return {enunciado: `A prova 1 tem peso ${p1} e a prova 2 tem peso ${p2}. Um aluno tirou ${n1} na prova 1 e ${n2} na prova 2. Qual é a média ponderada?`,
        ...montar(r, [(n1 + n2) / 2, (n1 * p1 + n2 * p2) / 2, (n1 * p2 + n2 * p1) / (p1 + p2), n1 * p1 + n2 * p2]),
        porque: `(${n1} × ${p1} + ${n2} × ${p2}) ÷ (${p1} + ${p2}) = ${n1 * p1 + n2 * p2} ÷ ${p1 + p2} = ${num(r)}.\nDividir por 2 (número de provas) em vez de ${p1 + p2} (soma dos pesos) é o erro mais comum.`};
    }});

  MAT.push({id:"mat-notacao", topico:"Notação científica",
    gerar() {
      const m = ri(11, 99) / 10, e = pick([-5, -4, -3, -2, 3, 4, 5, 6, 7, 8]);
      const valor = Number((m * 10 ** e).toPrecision(6));
      const escrito = valor >= 1 ? valor.toLocaleString("pt-BR", {maximumFractionDigits: 0}) : valor.toLocaleString("pt-BR", {maximumFractionDigits: 10});
      const f = x => num(m) + " × 10" + sup(x);
      return {enunciado: `Escreva ${escrito} em notação científica.`,
        ...montarTexto(f(e), [f(-e), f(e + 1), f(e - 1), num(m * 10) + " × 10" + sup(e - 1)]),
        porque: `A vírgula precisa parar logo depois do primeiro algarismo diferente de zero: ${num(m)}. Para chegar lá ela andou ${Math.abs(e)} casas para a ${e > 0 ? "esquerda (número grande → expoente positivo)" : "direita (número pequeno → expoente negativo)"}: ${f(e)}.\n${num(m * 10)} × 10${sup(e - 1)} vale o mesmo número, mas não é notação científica, porque ${num(m * 10)} ≥ 10.`};
    }});

  MAT.push({id:"mat-angulos", topico:"Ângulos e polígonos",
    gerar() {
      const t = pick(["comp", "sup", "tri", "pol"]);
      if (t === "comp" || t === "sup") {
        const tot = t === "comp" ? 90 : 180, a = ri(12, tot - 15);
        return {enunciado: `Qual é o ${t === "comp" ? "complemento" : "suplemento"} de um ângulo de ${a}°?`, ...montar(tot - a, [(t === "comp" ? 180 : 90) - a, a, 360 - a], v => v + "°"),
          porque: `${t === "comp" ? "Complemento: o que falta para 90°" : "Suplemento: o que falta para 180°"}. ${tot} − ${a} = ${tot - a}°. Para lembrar: Complemento ↔ Canto (90°), Suplemento ↔ Semicírculo/reta (180°).`};
      }
      if (t === "tri") {
        const a = ri(30, 80), b = ri(30, 150 - a - 10), c = 180 - a - b;
        return {enunciado: `Dois ângulos de um triângulo medem ${a}° e ${b}°. Quanto mede o terceiro?`, ...montar(c, [360 - a - b, 180 - a, 180 - b, c + 10], v => v + "°"),
          porque: `A soma dos ângulos internos de qualquer triângulo é 180°: 180 − ${a} − ${b} = ${c}°.`};
      }
      const n = pick([5, 6, 8, 10, 12]), nome = {5: "pentágono", 6: "hexágono", 8: "octógono", 10: "decágono", 12: "dodecágono"}[n], s = (n - 2) * 180;
      return {enunciado: `Qual é a soma dos ângulos internos de um ${nome} (${n} lados)?`, ...montar(s, [n * 180, (n - 1) * 180, 360, n * 90], v => v + "°"),
        porque: `Um polígono de n lados se divide em (n − 2) triângulos a partir de um vértice. (${n} − 2) × 180° = ${s}°.${n === 6 ? " Num hexágono regular, cada ângulo mede " + s / 6 + "°." : ""}`};
    }});

  MAT.forEach(a => { a.area = "mat"; a.tipo = "gerador"; A.push(a); });

  /* ---- Ciências com conta: os mesmos geradores, só que de física ---- */
  const CIE = [];

  CIE.push({id:"cie-consumo", topico:"Consumo de energia elétrica",
    gerar() {
      const ap = pick([["chuveiro", 5500], ["chuveiro", 4400], ["ferro de passar", 1000], ["micro-ondas", 1200], ["aquecedor elétrico", 2000], ["ar-condicionado", 1500], ["lâmpada de LED", 10, "a"]]);
      const fem = ap[2] === "a", um = fem ? "Uma" : "Um", ligado = fem ? "ligada" : "ligado", ele = fem ? "ela" : "ele";
      const min = ap[1] < 100 ? pick([300, 360, 480]) : pick([10, 15, 20, 30, 40, 60]);
      const dias = 30, tarifa = pick([0.7, 0.8, 0.9, 1]);
      const kwh = ap[1] / 1000 * (min / 60) * dias, custo = kwh * tarifa;
      if (Math.random() < 0.5)
        return {enunciado: `${um} ${ap[0]} de ${ap[1]} W fica ${ligado} ${min} minutos por dia. Quanto ${ele} consome em ${dias} dias?`,
          ...montar(kwh, [ap[1] * (min / 60) * dias, ap[1] / 1000 * min * dias, ap[1] / 1000 * (min / 60), kwh / 2], v => num(v) + " kWh"),
          porque: `Potência: ${ap[1]} W = ${num(ap[1] / 1000)} kW. Tempo por dia: ${min} min = ${num(min / 60)} h. Em ${dias} dias: ${num(min / 60 * dias)} h.\nE = ${num(ap[1] / 1000)} kW × ${num(min / 60 * dias)} h = ${num(kwh)} kWh.\nEsquecer de converter minutos em horas (ou W em kW) é o erro que as outras alternativas esperam.`};
      return {enunciado: `${um} ${ap[0]} de ${ap[1]} W fica ${ligado} ${min} minutos por dia, durante ${dias} dias. Se a tarifa é ${brl(tarifa)} por kWh, quanto ${ele} custa no mês?`,
        ...montar(custo, [custo * 60, kwh, custo / dias, custo * 1000 / 60], brl),
        porque: `Energia: ${num(ap[1] / 1000)} kW × ${num(min / 60)} h × ${dias} dias = ${num(kwh)} kWh.\nCusto: ${num(kwh)} × ${brl(tarifa)} = ${brl(custo)}.`};
    }});

  CIE.push({id:"cie-ohm", topico:"Lei de Ohm e potência elétrica",
    gerar() {
      const t = pick(["i", "U", "R", "P"]);
      const R = pick([5, 10, 20, 22, 40, 50, 100]), i = pick([0.5, 1, 2, 2.5, 4, 5, 10]), U = R * i;
      if (t === "i") return {enunciado: `Um resistor de ${R} Ω é ligado a uma tensão de ${num(U)} V. Qual é a corrente?`, ...montar(i, [U * R, R / U, U - R, i * 2], v => num(v) + " A"),
        porque: `i = U ÷ R = ${num(U)} ÷ ${R} = ${num(i)} A.`};
      if (t === "U") return {enunciado: `Por um resistor de ${R} Ω passa uma corrente de ${num(i)} A. Qual é a tensão nos seus terminais?`, ...montar(U, [R / i, R + i, i / R, U * 2], v => num(v) + " V"),
        porque: `U = R × i = ${R} × ${num(i)} = ${num(U)} V.`};
      if (t === "R") return {enunciado: `Um aparelho ligado em ${num(U)} V é percorrido por ${num(i)} A. Qual é a resistência dele?`, ...montar(R, [U * i, i / U, U - i, R * 2], v => num(v) + " Ω"),
        porque: `R = U ÷ i = ${num(U)} ÷ ${num(i)} = ${R} Ω.`};
      const Ut = pick([127, 220]), it = pick([2, 5, 10, 20]);
      return {enunciado: `Um aparelho ligado em ${Ut} V puxa ${it} A. Qual é a potência dele?`, ...montar(Ut * it, [Ut / it, Ut + it, Ut * it / 1000, Ut * it * 2], v => num(v) + " W"),
        porque: `P = U × i = ${Ut} × ${it} = ${num(Ut * it)} W${Ut * it >= 1000 ? " (= " + num(Ut * it / 1000) + " kW)" : ""}.`};
    }});

  CIE.push({id:"cie-velocidade", topico:"Velocidade média",
    gerar() {
      const t = pick(["v", "d", "conv", "parada"]);
      if (t === "v") { const v = pick([40, 50, 60, 72, 80, 90, 100]), h = pick([1.5, 2, 2.5, 3, 4]), d = v * h;
        return {enunciado: `Um ônibus percorre ${num(d)} km em ${num(h)} h. Qual é a velocidade média?`, ...montar(v, [d * h, h / d * 1000, d / (h + 1), v / 3.6], x => num(x) + " km/h"),
          porque: `v = ${num(d)} km ÷ ${num(h)} h = ${num(v)} km/h.`}; }
      if (t === "d") { const v = pick([60, 80, 90, 100, 110]), min = pick([30, 45, 90, 120, 150]), d = v * min / 60;
        return {enunciado: `Um carro mantém ${v} km/h durante ${min} minutos. Que distância percorre?`, ...montar(d, [v * min, v / (min / 60), v * min / 100, d * 2], x => num(x) + " km"),
          porque: `Tempo em horas: ${min} min = ${num(min / 60)} h. d = v × t = ${v} × ${num(min / 60)} = ${num(d)} km.`}; }
      if (t === "conv") { const ms = pick([5, 10, 15, 20, 25, 30]), kmh = ms * 3.6;
        if (Math.random() < 0.5) return {enunciado: `${num(kmh)} km/h equivalem a quantos m/s?`, ...montar(ms, [kmh * 3.6, kmh / 60, kmh / 1000, kmh / 10], x => num(x) + " m/s"),
          porque: `km/h → m/s: divide por 3,6 (porque 1 km = 1000 m e 1 h = 3600 s). ${num(kmh)} ÷ 3,6 = ${ms} m/s.`};
        return {enunciado: `${ms} m/s equivalem a quantos km/h?`, ...montar(kmh, [ms / 3.6, ms * 60, ms * 3600, ms * 10], x => num(x) + " km/h"),
          porque: `m/s → km/h: multiplica por 3,6. ${ms} × 3,6 = ${num(kmh)} km/h.`}; }
      const d1 = pick([60, 90, 120]), h1 = pick([1, 1.5]), d2 = pick([60, 80, 120]), h2 = pick([1, 2]), par = 0.5;
      const v = (d1 + d2) / (h1 + h2 + par);
      return {enunciado: `Uma viagem tem dois trechos: ${d1} km em ${num(h1)} h e ${d2} km em ${num(h2)} h, com uma parada de 30 min entre eles. Qual é a velocidade média da viagem toda?`,
        ...montar(v, [(d1 + d2) / (h1 + h2), (d1 / h1 + d2 / h2) / 2, (d1 + d2) / (h1 + h2 + 30), v + 10], x => num(x) + " km/h"),
        porque: `Distância total: ${d1} + ${d2} = ${d1 + d2} km. Tempo total, com a parada: ${num(h1)} + ${num(h2)} + 0,5 = ${num(h1 + h2 + par)} h.\nv = ${d1 + d2} ÷ ${num(h1 + h2 + par)} = ${num(v)} km/h. Fazer a média das velocidades dos trechos não dá a velocidade média.`};
    }});

  CIE.push({id:"cie-densidade", topico:"Densidade",
    gerar() {
      const t = pick(["d", "m", "flutua"]);
      const mat = pick([["alumínio", 2.7], ["ferro", 7.9], ["cobre", 8.9], ["madeira de pinho", 0.5], ["gelo", 0.92], ["chumbo", 11.3]]
        .concat(t === "flutua" ? [] : [["óleo de cozinha", 0.9], ["álcool", 0.79]]));   // líquido não é "objeto maciço"
      const V = pick([10, 20, 50, 100, 200]), m = mat[1] * V;
      if (t === "d") return {enunciado: `Uma amostra de ${mat[0]} tem massa ${num(m)} g e volume ${V} cm³. Qual é a densidade?`, ...montar(mat[1], [V / m, m * V, m - V, mat[1] * 10], x => num(x) + " g/cm³"),
        porque: `d = m ÷ V = ${num(m)} ÷ ${V} = ${num(mat[1])} g/cm³.`};
      if (t === "m") return {enunciado: `A densidade de ${mat[0]} é ${num(mat[1])} g/cm³. Qual é a massa de ${V} cm³ desse material?`, ...montar(m, [V / mat[1], mat[1] + V, m / 10, m * 2], x => num(x) + " g"),
        porque: `m = d × V = ${num(mat[1])} × ${V} = ${num(m)} g.`};
      const flutua = mat[1] < 1;
      const alts = embaralhar(["Flutua, porque sua densidade é menor que a da água", "Afunda, porque sua densidade é maior que a da água",
        "Flutua, porque seu volume é maior que o da água deslocada", "Afunda, porque todo objeto sólido é mais denso que líquidos", "Fica parado no meio, porque massa e volume se equilibram"]);
      return {enunciado: `Um objeto maciço de ${mat[0]} (densidade ${num(mat[1])} g/cm³) é colocado na água (1 g/cm³). O que acontece?`,
        alts, correta: alts.indexOf(flutua ? alts.find(a => a.startsWith("Flutua, porque sua")) : alts.find(a => a.startsWith("Afunda, porque sua"))),
        porque: `Compare só as densidades: ${num(mat[1])} ${flutua ? "<" : ">"} 1, então ${flutua ? "flutua" : "afunda"}. O tamanho do objeto não muda a resposta — um grão e uma tora de pinho flutuam igual.`};
    }});

  CIE.forEach(a => { a.area = "cie"; a.tipo = "gerador"; A.push(a); });
})();
