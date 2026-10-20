/* Geradores infinitos de Matemática — um por arquétipo recorrente na prova do IFSC.
   Cada gerador devolve {topico, enunciado, alts[5], correta, porque}.
   Os distratores são erros REAIS (esquecer de converter, usar diâmetro como raio,
   somar em vez de multiplicar), não números aleatórios.                              */
(function () {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const brl = v => "R$ " + v.toLocaleString("pt-BR", {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const num = v => Number(v.toFixed(2)).toLocaleString("pt-BR", {maximumFractionDigits: 2});

  /* monta as 5 alternativas: valor correto + distratores, sem repetir, embaralhado */
  function montar(correto, distratores, fmt) {
    const vistos = new Set([fmt(correto)]);   // compara pelo texto da tela: R$ 20,74 = R$ 20,7360
    const lista = [correto];
    for (const d of distratores) {
      if (lista.length >= 5) break;
      if (d == null || !isFinite(d) || d <= 0) continue;
      if (vistos.has(fmt(d))) continue;
      vistos.add(fmt(d)); lista.push(d);
    }
    let guard = 0;
    while (lista.length < 5 && guard++ < 200) {
      const d = correto * (1 + (ri(-40, 40) / 100));
      const r = Number.isInteger(correto) ? Math.round(d) : Math.round(d * 100) / 100;
      if (r > 0 && !vistos.has(fmt(r))) { vistos.add(fmt(r)); lista.push(r); }
    }
    lista.sort((a, b) => a - b);
    return {alts: lista.map(fmt), correta: lista.indexOf(correto)};
  }

  const G = [];

  /* ---- ARQUÉTIPO 1a: área de terreno/sala + quantos cabem ---- */
  G.push(function areaQuantosCabem(nv) {
    if (nv === 3) {                       // medidas quebradas, faixa em centímetros e um armário a descontar
      const c = ri(9, 16) + pick([0, 0.5]), l = ri(6, 10) + pick([0, 0.5]);
      const faixa = pick([1.2, 1.5, 2]), profCm = pick([150, 200, 250]), prof = profCm / 100;
      const arm = pick([1.5, 2, 2.5, 3]);
      const areaTotal = c * l, areaProf = prof * l, util = areaTotal - areaProf - arm;
      const n = Math.floor(util / faixa);
      const {alts, correta} = montar(n, [
        Math.floor((areaTotal - areaProf) / faixa),   // esqueceu o armário
        Math.floor((areaTotal - arm) / faixa),        // esqueceu a faixa
        Math.floor((areaTotal - prof * c - arm) / faixa), // faixa × comprimento
        Math.ceil(util / faixa)                       // arredondou para cima
      ], v => v + "");
      return {
        topico: "Área em contexto",
        enunciado: `Um laboratório de eletrônica tem a forma de um retângulo de ${num(c)} m de comprimento por ${num(l)} m de largura. Junto à parede do fundo, uma faixa de ${profCm} cm de profundidade, ocupando toda a largura da sala, é reservada para a bancada do professor. Além disso, um armário ocupa ${num(arm)} m² do piso. Se cada bancada de estudante exige ${num(faixa)} m² (já incluída a circulação), quantas bancadas, no máximo, cabem no espaço restante?`,
        alts, correta,
        porque: `Três passos, e a prova costuma esconder pelo menos um deles.\n1) Área total = ${num(c)} × ${num(l)} = ${num(areaTotal)} m².\n2) Converta a faixa: ${profCm} cm = ${num(prof)} m. Ela ocupa toda a LARGURA: ${num(prof)} × ${num(l)} = ${num(areaProf)} m².\n3) Área útil = ${num(areaTotal)} − ${num(areaProf)} − ${num(arm)} (armário) = ${num(util)} m².\nBancadas = ${num(util)} ÷ ${num(faixa)} = ${num(util / faixa)} → arredonda para BAIXO: ${n}. Antes de calcular, liste tudo o que o enunciado manda descontar — esquecer o armário ou a faixa é o erro que as outras alternativas esperam.`
      };
    }
    const c = ri(8, 16) + (nv === 2 ? pick([0, 0.5]) : 0), l = ri(5, 10);
    const faixa = pick([1.2, 1.5, 2]);
    const prof = pick([0, 1.5, 2]);
    const areaTotal = c * l;
    const areaProf = prof * l;
    const util = areaTotal - areaProf;
    const n = Math.floor(util / faixa);
    const ctx = pick([
      ["uma sala de aula do IFSC", "estudantes"],
      ["um laboratório de eletrônica", "bancadas de trabalho"],
      ["um auditório do câmpus", "cadeiras"]
    ]);
    const {alts, correta} = montar(n, [
      Math.floor(areaTotal / faixa),          // esqueceu de tirar a área do professor
      Math.floor(util / faixa) + 1,           // arredondou para cima
      Math.floor((areaTotal - prof * c) / faixa), // usou o comprimento no lugar da largura
      Math.floor(util / (faixa * 2))
    ], v => v + "");
    return {
      topico: "Área em contexto",
      enunciado: `${ctx[0].charAt(0).toUpperCase() + ctx[0].slice(1)} é um retângulo de ${c} m de comprimento por ${l} m de largura. ` +
        (prof ? `Uma faixa retangular de ${num(prof)} m de comprimento, ocupando toda a largura da sala, é reservada e não pode ser usada. ` : "") +
        `Sabendo que cada um dos ${ctx[1]} exige ${num(faixa)} m² (já incluída a área de circulação), qual é a quantidade máxima que cabe no espaço?`,
      alts, correta,
      porque: `Área total = ${c} × ${l} = ${areaTotal} m². ` +
        (prof ? `Área reservada = ${num(prof)} × ${l} = ${num(areaProf)} m² (a faixa ocupa toda a LARGURA, então multiplica pela largura). Área útil = ${areaTotal} − ${num(areaProf)} = ${num(util)} m². ` : "") +
        `Quantidade = ${num(util)} ÷ ${num(faixa)} = ${num(util / faixa)} → como não existe fração de ${ctx[1]}, arredonda-se para BAIXO: ${n}.`
    };
  });

  /* ---- ARQUÉTIPO 1b: volume de cilindro / capacidade em litros ---- */
  G.push(function volumeCilindro(nv) {
    if (nv >= 2) {                        // medidas em centímetros; no difícil, só falta encher uma parte
      const dCm = pick([80, 100, 120, 160, 200]), hCm = pick([50, 80, 100, 150]);
      const r = dCm / 200, h = hCm / 100;
      const litros = 3 * r * r * h * 1000;
      if (nv === 2) {
        const {alts, correta} = montar(litros, [
          3 * (dCm / 100) ** 2 * h * 1000,  // diâmetro como raio
          litros / 1000,                     // ficou em m³
          3 * (dCm / 2) * (dCm / 2) * hCm,   // cm³ chamado de litro
          litros / 10
        ], v => num(v) + " L");
        return {
          topico: "Volume e capacidade",
          enunciado: `Um reservatório cilíndrico tem ${dCm} cm de diâmetro interno e ${hCm} cm de altura. Usando π ≈ 3, qual é a sua capacidade, em litros?`,
          alts, correta,
          porque: `Passe tudo para metros antes: diâmetro ${dCm} cm = ${num(dCm / 100)} m, então r = ${num(r)} m; altura ${hCm} cm = ${num(h)} m.\nV = 3 × ${num(r)}² × ${num(h)} = ${num(litros / 1000)} m³ = ${num(litros)} L (1 m³ = 1.000 L).\nOutro caminho seguro: trabalhe em decímetros, porque 1 dm³ = 1 L direto (r = ${num(dCm / 20)} dm, h = ${num(hCm / 10)} dm). O erro mais caro é chamar cm³ de litro: 1 L = 1.000 cm³.`
        };
      }
      const f = pick([[1, 4], [1, 3], [2, 5], [3, 8]]);
      const falta = litros * (1 - f[0] / f[1]);
      const {alts, correta} = montar(falta, [
        litros * f[0] / f[1],                          // calculou o que já tem
        litros,                                        // esqueceu o que já tem
        3 * (dCm / 100) ** 2 * h * 1000 * (1 - f[0] / f[1]), // diâmetro como raio
        falta / 1000                                   // ficou em m³
      ], v => num(v) + " L");
      return {
        topico: "Volume e capacidade",
        enunciado: `Um reservatório cilíndrico tem ${dCm} cm de diâmetro interno e ${hCm} cm de altura e está com ${f[0]}/${f[1]} da sua capacidade ocupada por água. Usando π ≈ 3, quantos litros ainda faltam para enchê-lo completamente?`,
        alts, correta,
        porque: `1) Converta: r = ${dCm} ÷ 2 = ${dCm / 2} cm = ${num(r)} m; h = ${num(h)} m.\n2) Capacidade = 3 × ${num(r)}² × ${num(h)} = ${num(litros / 1000)} m³ = ${num(litros)} L.\n3) Se ${f[0]}/${f[1]} está ocupado, falta ${f[1] - f[0]}/${f[1]}: ${num(litros)} × ${f[1] - f[0]}/${f[1]} = ${num(falta)} L.\nA alternativa com ${num(litros * f[0] / f[1])} L é a de quem calculou a água que JÁ está lá. Releia a pergunta antes de marcar: “quanto falta” não é “quanto tem”.`
      };
    }
    const d = pick([2, 4, 6, 1, 3]);
    const h = pick([0.5, 1, 1.5, 2, 2.5]);
    const r = d / 2;
    const v = 3 * r * r * h;          // π ≈ 3
    const litros = v * 1000;
    const {alts, correta} = montar(litros, [
      3 * d * d * h * 1000,           // usou o diâmetro como raio
      v,                              // esqueceu de converter m³ → L
      3 * r * r * h * 100,            // converteu errado
      2 * 3 * r * h * 1000            // usou a fórmula do perímetro
    ], v => num(v) + " L");
    return {
      topico: "Volume e capacidade",
      enunciado: `Uma caixa d’água cilíndrica tem ${num(d)} m de diâmetro e ${num(h)} m de altura. Usando π ≈ 3, qual é a sua capacidade, em litros?`,
      alts, correta,
      porque: `Primeiro: o enunciado dá o DIÂMETRO, então r = ${num(d)} ÷ 2 = ${num(r)} m. V = π·r²·h = 3 × ${num(r)}² × ${num(h)} = ${num(v)} m³. Como 1 m³ = 1.000 L, a capacidade é ${num(litros)} L. As duas armadilhas da questão são usar o diâmetro como raio e esquecer a conversão para litros.`
    };
  });

  /* ---- ARQUÉTIPO 2: porcentagem — à vista x parcelado ---- */
  G.push(function aVistaParcelado(nv) {
    if (nv === 3) {                       // descontos sucessivos: não se somam
      const a = pick([10, 20, 25, 30]), b = pick([10, 15, 20]);
      const preco = pick([800, 1200, 1500, 2000, 2400]);
      const final = preco * (1 - a / 100) * (1 - b / 100);
      const eq = 100 - final / preco * 100;
      const {alts, correta} = montar(eq, [a + b, a + b + a * b / 100, (a + b) / 2, Math.max(a, b) + 5], v => num(v) + "%");
      return {
        topico: "Porcentagem e finanças",
        enunciado: `Um celular custa ${brl(preco)}. Na Black Friday a loja dá ${a}% de desconto sobre esse preço e, pagando no Pix, o cliente ganha mais ${b}% de desconto sobre o valor já reduzido. Qual é o desconto TOTAL, em relação ao preço original, para quem paga no Pix na Black Friday?`,
        alts, correta,
        porque: `Descontos sucessivos se MULTIPLICAM, não se somam. Fator total = (1 − ${num(a / 100)}) × (1 − ${num(b / 100)}) = ${num(1 - a / 100)} × ${num(1 - b / 100)} = ${num((1 - a / 100) * (1 - b / 100))}.\nPreço final = ${brl(preco)} × ${num((1 - a / 100) * (1 - b / 100))} = ${brl(final)}. O cliente paga ${num(100 - eq)}% do preço, então o desconto total é ${num(eq)}%.\nA alternativa ${a + b}% é a armadilha: o segundo desconto incide sobre um valor MENOR, por isso o total sempre fica abaixo da soma.`
      };
    }
    const etiqueta = pick([1200, 1800, 2400, 3000, 3600]);
    const desc = pick([10, 12, 15, 20, 25]);
    const vista = etiqueta * (1 - desc / 100);
    const parcelas = pick([6, 8, 10, 12]);
    const valorParcela = Math.round((etiqueta * pick([1, 1.05, 1.1])) / parcelas / 5) * 5;
    const totalParc = valorParcela * parcelas;
    const dif = Math.abs(totalParc - vista);
    const {alts, correta} = montar(dif, [
      Math.abs(totalParc - etiqueta),
      etiqueta * desc / 100,
      Math.abs(etiqueta - vista) + totalParc - etiqueta,
      dif / 2
    ], brl);
    return {
      topico: "Porcentagem e finanças",
      enunciado: `Uma loja anuncia um notebook por ${brl(etiqueta)}. Há duas formas de pagamento: à vista, com ${desc}% de desconto, ou em ${parcelas} parcelas de ${brl(valorParcela)}. Qual é a diferença entre o total pago nas duas formas?`,
      alts, correta,
      porque: `À vista: ${brl(etiqueta)} × (1 − ${desc / 100}) = ${brl(vista)}. Parcelado: ${parcelas} × ${brl(valorParcela)} = ${brl(totalParc)}. Diferença = ${brl(totalParc)} − ${brl(vista)} = ${brl(dif)}. Atalho: aplicar desconto de ${desc}% é multiplicar por ${num(1 - desc / 100)} direto, em vez de calcular o desconto e subtrair — uma conta a menos, um erro a menos.`
    };
  });

  /* ---- ARQUÉTIPO 3: regra de três / proporção ---- */
  G.push(function regraDeTres(nv) {
    if (nv === 3) {                       // regra de três composta, montada para dar resposta exata
      const taxa = ri(1, 3);                // peças por máquina por hora
      const m = pick([3, 4, 5, 6]), h = pick([4, 6, 8]), d = pick([5, 6, 10, 12]);
      const m2 = m + pick([-1, 1, 2, 3]), h2 = pick([4, 5, 6, 8].filter(x => x !== h)), d2 = ri(3, 15);
      const p = taxa * m * h * d, p2 = taxa * m2 * h2 * d2;
      const {alts, correta} = montar(d2, [
        d * (p2 / p) * (m2 / m) * (h2 / h),   // tratou tudo como direta
        d * (p2 / p),                         // só olhou as peças
        d * (p2 / p) * (m / m2),              // esqueceu as horas
        d2 + 2, d2 * 2, d2 + 1, d2 + 3
      ], v => num(v) + " dias");
      return {
        topico: "Regra de três",
        enunciado: `Numa fábrica, ${m} máquinas iguais, funcionando ${h} horas por dia, produzem ${p} peças em ${d} dias. Quantos dias serão necessários para que ${m2} dessas máquinas, funcionando ${h2} horas por dia, produzam ${p2} peças?`,
        alts, correta,
        porque: `Regra de três COMPOSTA: compare cada grandeza com “dias”, uma de cada vez.\n• Mais peças → mais dias: DIRETA.\n• Mais máquinas → menos dias: INVERSA.\n• Mais horas por dia → menos dias: INVERSA.\nDias = ${d} × (${p2}/${p}) × (${m}/${m2}) × (${h}/${h2}) = ${d2}.\nAtalho de conferência: calcule a produção por máquina por hora — ${p} ÷ (${m} × ${h} × ${d}) = ${taxa} peça(s) — e então ${p2} ÷ (${m2} × ${h2} × ${taxa}) = ${d2} dias. Quem multiplicou tudo na mesma direção caiu no distrator.`
      };
    }
    const modo = pick(["direta", "inversa"]);
    if (modo === "direta") {
      const maq = ri(2, 6), pecas = ri(30, 120), hFonte = ri(2, 6);
      const maq2 = maq + ri(1, 4);
      const res = pecas / maq * maq2;
      const {alts, correta} = montar(res, [pecas * maq / maq2, pecas + maq2, res / 2, pecas * maq2], v => num(v) + " peças");
      return {
        topico: "Regra de três",
        enunciado: `Em uma oficina, ${maq} máquinas idênticas produzem ${pecas} peças em ${hFonte} horas. Mantendo o mesmo ritmo e o mesmo tempo, quantas peças produziriam ${maq2} máquinas?`,
        alts, correta,
        porque: `Grandezas DIRETAMENTE proporcionais: mais máquinas, mais peças. ${maq} máquinas → ${pecas} peças, logo 1 máquina → ${num(pecas / maq)} peças. Com ${maq2} máquinas: ${num(pecas / maq)} × ${maq2} = ${num(res)} peças. Sempre confira o sentido antes de montar a proporção: se uma grandeza cresce e a outra decresce, a regra é inversa e você deve multiplicar cruzado ao contrário.`
      };
    }
    const op = ri(3, 8), dias = ri(6, 20);
    const op2 = op + ri(1, 6);
    const res = op * dias / op2;
    const {alts, correta} = montar(res, [dias * op2 / op, dias - (op2 - op), dias, res * 2], v => num(v) + " dias");
    return {
      topico: "Regra de três",
      enunciado: `Uma equipe de ${op} operários monta um painel elétrico em ${dias} dias. Mantendo o mesmo ritmo de trabalho, em quantos dias ${op2} operários fariam o mesmo serviço?`,
      alts, correta,
      porque: `Grandezas INVERSAMENTE proporcionais: mais operários, menos dias. O total de trabalho é constante: ${op} × ${dias} = ${op * dias} operários-dia. Com ${op2} operários: ${op * dias} ÷ ${op2} = ${num(res)} dias. O teste que nunca falha: a resposta tem que ser MENOR que ${dias}; se deu maior, você montou a proporção no sentido errado.`
    };
  });

  /* ---- ARQUÉTIPO 4: leitura de gráfico / tabela ---- */
  G.push(function leituraGrafico(nv) {
    const cats = ["Estudo", "Sono", "Lazer", "Transporte", "Refeições"];
    let vals = [ri(3, 7), ri(7, 9), ri(2, 5), ri(1, 3), ri(1, 3)];
    const soma = vals.reduce((a, b) => a + b, 0);
    if (soma > 24) vals[1] -= (soma - 24);
    const tot = vals.reduce((a, b) => a + b, 0);
    const outras = 24 - tot;
    const i = ri(0, 2), j = (i + 2) % 5;
    const res = vals[i] + vals[j];
    const barras = cats.map((c, k) => `${c.padEnd(12, ".")} ${"█".repeat(vals[k])} ${vals[k]} h`).join("\n");
    if (nv >= 2) {                        // pede a porcentagem do dia, não as horas
      const pct = res / 24 * 100;
      const {alts, correta} = montar(Math.round(pct), [
        Math.round(res / tot * 100),          // dividiu pelo total do gráfico, não por 24
        res,                                  // horas tratadas como %
        Math.round(vals[i] / 24 * 100),       // só uma categoria
        Math.round((res + outras) / 24 * 100)
      ], v => v + "%");
      return {
        topico: "Leitura de gráfico",
        enunciado: `O gráfico de barras abaixo mostra como um estudante distribui as horas de um dia.${outras ? (outras === 1 ? " A 1 h restante, não representada, está" : ` As ${outras} h restantes, não representadas, estão`) + " em “Outros”." : ""}\n\n${barras}\n\nAproximadamente, que porcentagem do dia ele dedica, somadas, a ${cats[i]} e ${cats[j]}?`,
        alts, correta,
        porque: `${cats[i]} + ${cats[j]} = ${vals[i]} + ${vals[j]} = ${res} h. O “todo” é o DIA, ou seja, 24 h — e não as ${tot} h que aparecem no gráfico.\n${res} ÷ 24 = ${num(res / 24)} ≈ ${Math.round(pct)}%.\nA alternativa de ${Math.round(res / tot * 100)}% é de quem dividiu pela soma das barras. Em porcentagem, a pergunta-chave é sempre: porcentagem DE QUÊ?`
      };
    }
    const {alts, correta} = montar(res, [Math.abs(vals[i] - vals[j]), vals[i], vals[j], res + outras], v => v + " horas");
    return {
      topico: "Leitura de gráfico",
      enunciado: `O gráfico de barras abaixo mostra como um estudante distribui as horas do seu dia.${outras ? (outras === 1 ? " A 1 h restante está" : ` As ${outras} h restantes estão`) + " em “Outros”." : ""}\n\n${barras}\n\nQuantas horas somadas ele dedica a ${cats[i]} e ${cats[j]}?`,
      alts, correta,
      porque: `Leia os dois valores direto no gráfico e some: ${cats[i]} = ${vals[i]} h e ${cats[j]} = ${vals[j]} h, logo ${vals[i]} + ${vals[j]} = ${res} h. Em questão de gráfico, sublinhe no enunciado QUAIS categorias são pedidas antes de olhar para os números — o erro mais comum não é de conta, é ler a barra errada.`
    };
  });

  /* ---- ARQUÉTIPO 5: sistema de 2 equações do 1º grau disfarçado ---- */
  G.push(function sistemaDisfarcado(nv) {
    const cen = pick([
      {a: "kg de tomate", ap: "kg de tomate", b: "pé de alface", bp: "pés de alface", loc: "na feira"},
      {a: "resistor", ap: "resistores", b: "capacitor", bp: "capacitores", loc: "na loja de componentes"},
      {a: "caderno", ap: "cadernos", b: "caneta", bp: "canetas", loc: "na papelaria"}
    ]);
    const A = q => q + " " + (q > 1 ? cen.ap : cen.a), B = q => q + " " + (q > 1 ? cen.bp : cen.b);
    // preços unitários; no difícil, com centavos
    const x = nv === 3 ? ri(7, 25) * 0.5 : ri(3, 12), y = nv === 3 ? ri(4, 18) * 0.5 : ri(2, 9);
    const q1a = ri(2, 4), q1b = ri(1, 3);
    let q2a = ri(1, 4), q2b = ri(1, 4);
    if (q1a * q2b - q2a * q1b === 0) q2b = q2b + 1;   // garante sistema possível e determinado
    const t1 = q1a * x + q1b * y, t2 = q2a * x + q2b * y;
    if (nv >= 2) {                        // o atalho x + y não serve: tem que achar x e y
      const q3a = ri(2, 5), q3b = pick([1, 2, 3, 4].filter(v => v !== q3a));
      const res3 = q3a * x + q3b * y;
      const {alts, correta} = montar(res3, [q3a * y + q3b * x, (q3a + q3b) * (x + y) / 2, x + y, res3 + 1.5, q3a * x], brl);
      return {
        topico: "Sistema do 1º grau",
        enunciado: `${cen.loc.charAt(0).toUpperCase() + cen.loc.slice(1)}, Manoela comprou ${A(q1a)} e ${B(q1b)} e pagou ${brl(t1)}. No dia seguinte, aos mesmos preços, comprou ${A(q2a)} e ${B(q2b)} e pagou ${brl(t2)}. Quanto ela pagaria, aos mesmos preços, por ${A(q3a)} e ${B(q3b)}?`,
        alts, correta,
        porque: `Chame de x o preço de 1 ${cen.a} e de y o de 1 ${cen.b}:\n  ${q1a}x + ${q1b}y = ${num(t1)}\n  ${q2a}x + ${q2b}y = ${num(t2)}\nMultiplique as equações para igualar os coeficientes de uma das letras e subtraia (método da adição): sai x = ${brl(x)} e y = ${brl(y)}. Confira na primeira equação: ${q1a} × ${num(x)} + ${q1b} × ${num(y)} = ${num(t1)}. ✓\nResposta: ${q3a} × ${brl(x)} + ${q3b} × ${brl(y)} = ${brl(res3)}.\nA armadilha é trocar os preços na última conta (${brl(q3a * y + q3b * x)}): escreva “x = ${cen.a}” no canto da folha antes de começar.`
      };
    }
    const res = x + y;
    const {alts, correta} = montar(res, [x, y, Math.abs(x - y), res + 1, res - 1, 2 * res], brl);
    return {
      topico: "Sistema do 1º grau",
      enunciado: `${cen.loc.charAt(0).toUpperCase() + cen.loc.slice(1)}, Manoela comprou ${A(q1a)} e ${B(q1b)} e pagou ${brl(t1)}. No dia seguinte, aos mesmos preços, comprou ${A(q2a)} e ${B(q2b)} e pagou ${brl(t2)}. Quanto custaria comprar 1 ${cen.a} e 1 ${cen.b}?`,
      alts, correta,
      porque: `Chame de x o preço de 1 ${cen.a} e de y o preço de 1 ${cen.b}:\n  ${q1a}x + ${q1b}y = ${num(t1)}\n  ${q2a}x + ${q2b}y = ${num(t2)}\nResolvendo, x = ${brl(x)} e y = ${brl(y)}, logo x + y = ${brl(res)}.\nATALHO que o IFSC adora: quando a pergunta é por x + y, às vezes basta somar ou subtrair as duas equações e dividir — não precisa isolar cada variável. Sempre teste esse atalho antes de partir para a substituição.`
    };
  });

  /* ---- ARQUÉTIPO 6a: conversão de unidades de tempo ---- */
  G.push(function conversaoTempo(nv) {
    if (nv === 3) {                       // hora decimal → h, min e s (dois passos de ×60)
      const H = ri(1, 5), k = ri(3, 197);   // k × 18 s garante decimal com até 3 casas
      const seg = 18 * k, m = Math.floor(seg / 60), s = seg % 60, dec = k * 5 / 1000;
      const fmt = (hh, mm, ss) => `${hh} h ${mm} min ${ss} s`;
      const certo = fmt(H, m, s);
      const lista = [certo], vistos = new Set([certo]);
      [fmt(H, Math.round(dec * 100), 0),                 // decimal lido como minuto
       fmt(H, Math.floor(dec * 100), Math.round(dec * 1000) % 10 * 6),
       fmt(H, m, Math.round((dec * 60 - m) * 100) % 60), // sobra de minuto lida como segundo
       fmt(H, m + 1, s), fmt(H, Math.max(0, m - 1), s), fmt(H, m, (s + 30) % 60)]
        .forEach(e => { if (lista.length < 5 && !vistos.has(e)) { vistos.add(e); lista.push(e); } });
      lista.sort(() => Math.random() - 0.5);
      return {
        topico: "Conversão de unidades",
        enunciado: `Um técnico registrou na planilha que a montagem de um painel levou ${String(+(H + dec).toFixed(3)).replace(".", ",")} horas. Em horas, minutos e segundos, esse tempo corresponde a:`,
        alts: lista, correta: lista.indexOf(certo),
        porque: `A parte inteira já são horas: ${H} h. A parte decimal é FRAÇÃO de hora: ${String(+dec.toFixed(3)).replace(".", ",")} × 60 = ${num(dec * 60)} min → ${m} min inteiros, e sobra ${num(dec * 60 - m)} min.\nEssa sobra × 60 = ${s} s. Resultado: ${certo}.\nNunca leia a casa decimal como minutos (",${String(+dec.toFixed(3)).split(".")[1]}" h não é ${Math.round(dec * 100)} min): cada troca de unidade exige multiplicar por 60 de novo.`
      };
    }
    const dias = pick([1.4, 2.3, 2.9, 3.6, 1.75, 4.25]);
    const d = Math.floor(dias);
    const restoH = (dias - d) * 24;
    const h = Math.floor(restoH);
    const min = Math.round((restoH - h) * 60);
    const certo = `${d} dias, ${h} horas e ${min} minutos`;
    const errados = [
      `${d} dias, ${h} horas e ${Math.round((dias - d) * 100)} minutos`,
      `${d} dias, ${h + 1} horas e ${min} minutos`,
      `${d} dias, ${Math.round(restoH)} horas e 0 minutos`,
      `${d} dias, ${h} horas e ${Math.max(1, min - 10)} minutos`
    ];
    const lista = [certo]; const vistos = new Set([certo]);
    for (const e of errados) if (!vistos.has(e) && lista.length < 5) {vistos.add(e); lista.push(e);}
    for (let k = 1; lista.length < 5; k++) { const e = `${d} dias, ${h} horas e ${min + k * 7} minutos`; if (!vistos.has(e)) {vistos.add(e); lista.push(e);} }
    lista.sort(() => Math.random() - 0.5);
    return {
      topico: "Conversão de unidades",
      enunciado: `Considerando que 1 dia equivale a 24 horas, 1 hora a 60 minutos e 1 minuto a 60 segundos, ${num(dias)} dias equivalem a:`,
      alts: lista, correta: lista.indexOf(certo),
      porque: `Separe a parte inteira da decimal. Parte inteira: ${d} dias. Parte decimal: ${num(dias - d)} dia × 24 = ${num(restoH)} h → são ${h} horas inteiras e sobra ${num(restoH - h)} h. Essa sobra × 60 = ${min} min. Resultado: ${certo}.\nO erro que a prova espera é tratar a casa decimal como se já fosse minuto (${num(dias - d)} virar "${Math.round((dias - d) * 100)} minutos"). Decimal de dia não é hora e decimal de hora não é minuto — cada passo exige uma multiplicação.`
    };
  });

  /* ---- ARQUÉTIPO 6b: consumo de água/energia com conversão ---- */
  G.push(function consumoConta(nv) {
    if (nv === 3) {                       // economia: diferença de tempo em MINUTOS e potência em W
      const w = pick([4400, 5400, 6000, 6600, 7200]);
      const t1 = pick([20, 25, 30, 40]), t2 = t1 - pick([10, 15, 20].filter(x => x < t1));
      const pessoas = pick([2, 3, 4]), dias = 30, tarifa = pick([0.7, 0.8, 0.9]);
      const FR = {10: "1/6", 15: "1/4", 20: "1/3"};
      const kwh = (w / 1000) * ((t1 - t2) / 60) * pessoas * dias;
      const econ = kwh * tarifa;
      const {alts, correta} = montar(econ, [
        (w / 1000) * (t1 - t2) * pessoas * dias * tarifa,     // não converteu min → h
        (w / 1000) * (t2 / 60) * pessoas * dias * tarifa,     // custo do banho novo
        econ / pessoas,                                       // esqueceu as pessoas
        (w / 1000) * (t1 / 60) * pessoas * dias * tarifa      // custo do banho antigo
      ], brl);
      return {
        topico: "Conversão de unidades",
        enunciado: `Numa casa moram ${pessoas} pessoas, e cada uma toma um banho por dia num chuveiro de ${num(w)} W. Para economizar, todas reduziram o banho de ${t1} para ${t2} minutos. Com a tarifa de ${brl(tarifa)} por kWh, quanto a família economiza em ${dias} dias?`,
        alts, correta,
        porque: `Calcule só a DIFERENÇA de tempo: ${t1} − ${t2} = ${t1 - t2} min por banho = ${FR[t1 - t2]} h.\nPotência: ${num(w)} W = ${num(w / 1000)} kW.\nEnergia economizada = ${num(w / 1000)} kW × ${FR[t1 - t2]} h × ${pessoas} pessoas × ${dias} dias = ${num(kwh)} kWh.\nEconomia = ${num(kwh)} × ${brl(tarifa)} = ${brl(econ)}.\nA alternativa que sai 60 vezes maior é a de quem multiplicou MINUTOS por kW — kWh exige o tempo em horas.`
      };
    }
    const tipo = pick(["agua", "energia"]);
    if (tipo === "agua") {
      const lmin = pick([6, 8, 9, 12]);
      const minBanho = pick([8, 10, 15, 20]);
      const banhos = pick([1, 2]);
      const dias = 30;
      const tarifa = pick([5.5, 6.5, 7.2, 8]);
      const litros = lmin * minBanho * banhos * dias;
      const m3 = litros / 1000;
      const custo = m3 * tarifa;
      const {alts, correta} = montar(custo, [litros * tarifa, custo / banhos, custo * 1000 / 100, litros / tarifa], brl);
      return {
        topico: "Conversão de unidades",
        enunciado: `Um chuveiro consome ${lmin} litros de água por minuto. Uma pessoa toma ${banhos} banho${banhos > 1 ? "s" : ""} de ${minBanho} minutos por dia, ao longo de ${dias} dias. Sabendo que a companhia cobra ${brl(tarifa)} por metro cúbico e que 1 m³ = 1.000 L, qual será o custo desse consumo?`,
        alts, correta,
        porque: `Consumo total = ${lmin} L/min × ${minBanho} min × ${banhos} banho(s) × ${dias} dias = ${num(litros)} L. Converta: ${num(litros)} ÷ 1.000 = ${num(m3)} m³. Custo = ${num(m3)} × ${brl(tarifa)} = ${brl(custo)}.\nA armadilha é multiplicar a tarifa pelos LITROS em vez dos metros cúbicos — o resultado sai 1.000 vezes maior. Sempre confira se a unidade da tarifa bate com a unidade do consumo antes de multiplicar.`
      };
    }
    const w = pick([800, 1200, 1500, 2200, 3500, 5500]);
    const hdia = pick([0.25, 0.5, 1, 2, 3]);
    const dias = 30;
    const tarifa = pick([0.65, 0.75, 0.8, 0.95]);
    const kwh = (w / 1000) * hdia * dias;
    const custo = kwh * tarifa;
    const {alts, correta} = montar(custo, [w * hdia * dias * tarifa, custo / dias, kwh, custo * 2], brl);
    return {
      topico: "Conversão de unidades",
      enunciado: `Um aparelho de ${num(w)} W é utilizado ${num(hdia)} hora(s) por dia, durante ${dias} dias. Com a tarifa de ${brl(tarifa)} por kWh, qual é o custo mensal de energia desse aparelho?`,
      alts, correta,
      porque: `Converta a potência para quilowatts: ${num(w)} W ÷ 1.000 = ${num(w / 1000)} kW. Energia = potência × tempo = ${num(w / 1000)} × ${num(hdia)} × ${dias} = ${num(kwh)} kWh. Custo = ${num(kwh)} × ${brl(tarifa)} = ${brl(custo)}.\nGuarde esta fórmula, porque ela resolve toda questão de conta de luz do IFSC: E(kWh) = P(kW) × t(h). O erro fatal é esquecer de dividir os watts por 1.000.`
    };
  });

  /* ---- ARQUÉTIPO 7: fração de um total ---- */
  G.push(function fracoesKit(nv) {
    if (nv >= 2) {                        // fração DO RESTANTE, não do total
      const f = pick([[1, 4], [2, 5], [1, 3], [3, 8]]), g = pick([[1, 3], [2, 3], [1, 2], [3, 5]]);
      const n = f[1] * g[1] * ri(2, 6);
      const usado1 = n * f[0] / f[1], resto = n - usado1, usado2 = resto * g[0] / g[1], sobra = resto - usado2;
      const {alts, correta} = montar(sobra, [
        n - usado1 - n * g[0] / g[1],    // tomou a segunda fração do total
        usado2, resto, usado1
      ], v => num(v) + " livros");
      return {
        topico: "Frações",
        enunciado: `O câmpus recebeu uma doação de ${n} livros. ${f[0]}/${f[1]} deles foram para a biblioteca central e ${g[0]}/${g[1]} DO RESTANTE foram para a sala de leitura do curso técnico. Os demais ficaram guardados no almoxarifado. Quantos livros foram para o almoxarifado?`,
        alts, correta,
        porque: `Biblioteca: ${f[0]}/${f[1]} de ${n} = ${num(usado1)}. Restante: ${n} − ${num(usado1)} = ${num(resto)}.\nSala de leitura: ${g[0]}/${g[1]} DO RESTANTE = ${g[0]}/${g[1]} de ${num(resto)} = ${num(usado2)}.\nAlmoxarifado: ${num(resto)} − ${num(usado2)} = ${num(sobra)}.\nO distrator ${num(n - usado1 - n * g[0] / g[1])} é de quem calculou ${g[0]}/${g[1]} do TOTAL. Sublinhe “do restante” no enunciado: muda a base da segunda fração.`
      };
    }
    const f = pick([[1, 2], [1, 3], [2, 3], [3, 4], [1, 4], [5, 6]]);
    const g = pick([[1, 2], [1, 3], [2, 3], [1, 6]]);
    const mmc = (a, b) => { let m = a; while (m % b) m += a; return m; };
    const n = pick([12, 18, 20, 24, 30, 36].filter(v => v % mmc(f[1], g[1]) === 0));
    const a = n * f[0] / f[1], b = n * g[0] / g[1];
    const res = a + b;
    const {alts, correta} = montar(res, [Math.abs(a - b), a, b, n * (f[0] + g[0]) / (f[1] + g[1])], v => num(v) + " unidades");
    return {
      topico: "Frações",
      enunciado: `Uma pousada montou ${n} kits de lanche. Cada kit leva ${f[0]}/${f[1]} de um pão caseiro e ${g[0]}/${g[1]} de um queijo colonial. No total, quantas unidades de pão e de queijo foram consumidas somadas?`,
      alts, correta,
      porque: `Pães: ${n} × ${f[0]}/${f[1]} = ${num(a)}. Queijos: ${n} × ${g[0]}/${g[1]} = ${num(b)}. Total = ${num(a)} + ${num(b)} = ${num(res)}.\nMultiplicar um inteiro por fração é multiplicar pelo numerador e dividir pelo denominador — e, quando dá para simplificar antes (${n} com ${f[1]}), a conta fica de cabeça. Não some as frações entre si: os kits consomem os dois itens ao mesmo tempo.`
    };
  });

  /* ---- ARQUÉTIPO 8: Pitágoras em contexto ---- */
  G.push(function pitagorasContexto(nv) {
    if (nv === 3) {                       // Pitágoras duas vezes: diagonal interna de uma caixa
      const [a, b, c, d] = pick([[20, 30, 60, 70], [10, 40, 80, 90], [40, 40, 70, 90], [20, 60, 90, 110], [30, 40, 120, 130]]);
      const fundo = Math.sqrt(a * a + c * c);
      const {alts, correta} = montar(d, [fundo, a + b + c, Math.sqrt(a * a + b * b), Math.sqrt(b * b + c * c)], v => num(v) + " cm");
      return {
        topico: "Pitágoras",
        enunciado: `Uma caixa de ferramentas tem a forma de um bloco retangular de ${a} cm de largura, ${c} cm de comprimento e ${b} cm de altura. Qual é o comprimento da maior haste reta que cabe inteira dentro dela, ligando um canto do fundo ao canto oposto da tampa?`,
        alts, correta,
        porque: `É Pitágoras DUAS vezes.\n1) Diagonal do fundo (largura e comprimento): D² = ${a}² + ${c}² = ${a * a + c * c}.\n2) A haste é a hipotenusa do triângulo formado por D e pela altura: d² = D² + ${b}² = ${a * a + c * c} + ${b * b} = ${d * d} → d = ${d} cm.\nAtalho: d² = largura² + comprimento² + altura². A alternativa ${num(fundo)} cm para no primeiro passo (é só a diagonal do fundo). A diagonal do bloco é sempre maior que a de qualquer face.`
      };
    }
    const trio = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]]);
    const k = nv === 2 ? pick([1.5, 2, 2.5]) : 1;
    const [a, b, c] = trio.map(v => v * k);
    const modo = pick(["hip", "cat"]);
    const ctx = pick([
      ["Uma antena é sustentada por um cabo esticado do topo até um ponto no chão", "antena", "cabo"],
      ["Uma escada está apoiada em uma parede vertical", "parede", "escada"],
      ["Uma rampa de acesso liga o chão ao patamar de entrada do câmpus", "patamar", "rampa"]
    ]);
    if (modo === "hip") {
      const {alts, correta} = montar(c, [a + b, Math.abs(b - a), Math.sqrt(b * b - a * a), c + 1], v => num(v) + " m");
      return {
        topico: "Pitágoras",
        enunciado: `${ctx[0]}. A altura ${"do " + ctx[1]} é de ${a} m e a distância horizontal até a base é de ${b} m. Qual é o comprimento ${"da " + ctx[2]}?`,
        alts, correta,
        porque: `A ${ctx[2]} é a HIPOTENUSA (o lado oposto ao ângulo reto, sempre o maior). c² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c} → c = ${c} m.\nO distrator ${a + b} é quem simplesmente somou os lados: a hipotenusa é sempre MENOR que a soma dos catetos e MAIOR que cada um deles — use isso para eliminar alternativas antes mesmo de calcular.`
      };
    }
    const {alts, correta} = montar(a, [c - b, Math.sqrt(c * c + b * b), c + b, a + 1], v => num(v) + " m");
    return {
      topico: "Pitágoras",
      enunciado: `${ctx[0]}. ${"A " + ctx[2]} mede ${c} m e sua base está a ${b} m de distância do ponto de apoio. Que altura ${"o " + ctx[1]} alcança?`,
      alts, correta,
      porque: `Aqui a incógnita é um CATETO, então a fórmula é subtração: a² = c² − b² = ${c * c} − ${b * b} = ${a * a} → a = ${a} m.\nO distrator ${c - b} é de quem subtraiu os lados direto, sem elevar ao quadrado. Regra: procurando a hipotenusa, some os quadrados; procurando um cateto, subtraia o quadrado do outro cateto do quadrado da hipotenusa.`
    };
  });

  window.GERADORES = G;
  /* nivel: 1 normal · 2 um pouco mais difícil · 3 difícil */
  window.gerarQuestao = function (idx, nivel) {
    const f = (idx == null) ? pick(G) : G[idx % G.length];
    const nv = [1, 2, 3].includes(nivel) ? nivel : 1;
    const q = f(nv);
    q.area = "mat"; q.nivel = nv; q.id = "GEN:" + f.name + ":" + Math.random().toString(36).slice(2, 8);
    q.gerada = true;
    return q;
  };
})();
