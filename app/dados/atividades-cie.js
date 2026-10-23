/* Atividades de Ciências (conceitos) — formato em atividades.js.
   As de conta (consumo, Ohm, velocidade, densidade) são geradores e estão em atividades.js. */
(function () {
  const A = window.ATIVIDADES = window.ATIVIDADES || [];
  const cie = a => { a.area = "cie"; A.push(a); };

  cie({id:"cie-organelas", topico:"Célula e organelas", tipo:"classificar",
    p1:"Qual estrutura celular tem a função descrita?",
    p2:"Qual é a função de: {c}?",
    itens:[
      ["Mitocôndria","Realiza a respiração celular, liberando a energia da glicose na forma de ATP."],
      ["Cloroplasto","Organela verde, rica em clorofila, onde a luz é usada para produzir glicose."],
      ["Núcleo","Guarda o material genético (DNA) e controla as atividades da célula."],
      ["Membrana plasmática","Envolve a célula e controla o que entra e o que sai dela."],
      ["Ribossomo","Produz proteínas a partir das instruções do material genético."],
      ["Parede celular","Camada rígida de celulose por fora da membrana, que dá sustentação à célula vegetal."],
      ["Vacúolo","Armazena água, sais e outras substâncias; na célula vegetal ocupa grande parte do volume."],
      ["Lisossomo","Contém enzimas que fazem a digestão de substâncias dentro da célula."],
      ["Complexo golgiense","Modifica, empacota e envia substâncias produzidas pela célula."],
      ["Citoplasma","Região entre a membrana e o núcleo, preenchida por um fluido onde ficam as organelas."]
    ]});

  cie({id:"cie-sistemas", topico:"Sistemas do corpo humano", tipo:"classificar",
    p1:"A qual sistema do corpo humano a descrição pertence?",
    p2:"Qual destas descrições se refere ao sistema {c}?",
    cats:{
      "Digestório":"transforma os alimentos em nutrientes absorvíveis — boca, estômago, intestinos, fígado, pâncreas.",
      "Respiratório":"troca gases com o ambiente — pulmões, brônquios, alvéolos.",
      "Circulatório":"transporta substâncias pelo sangue — coração, artérias, veias, capilares.",
      "Urinário (excretor)":"filtra o sangue e elimina resíduos — rins, ureteres, bexiga.",
      "Nervoso":"recebe estímulos e coordena respostas — encéfalo, medula, nervos.",
      "Endócrino":"produz hormônios — tireoide, pâncreas (insulina), suprarrenais, hipófise.",
      "Imunológico":"defende contra microrganismos — glóbulos brancos, anticorpos."
    },
    itens:[
      ["Digestório","No intestino delgado, os nutrientes são absorvidos e passam para o sangue."],
      ["Digestório","A bile, produzida pelo fígado, ajuda a quebrar as gorduras."],
      ["Digestório","O suco gástrico, ácido, começa a digestão das proteínas no estômago."],
      ["Respiratório","Nos alvéolos, o oxigênio passa do ar para o sangue e o gás carbônico faz o caminho inverso."],
      ["Respiratório","O diafragma se contrai e o ar entra nos pulmões."],
      ["Circulatório","O coração bombeia o sangue, que sai pelas artérias e volta pelas veias."],
      ["Circulatório","As hemácias transportam o oxigênio pelo corpo."],
      ["Urinário (excretor)","Os rins filtram o sangue e retiram a ureia, formando a urina."],
      ["Urinário (excretor)","A bexiga armazena a urina até ela ser eliminada."],
      ["Nervoso","Tirar a mão de uma panela quente antes de pensar: um ato reflexo coordenado pela medula espinal."],
      ["Nervoso","Os neurônios transmitem impulsos elétricos entre o encéfalo e o resto do corpo."],
      ["Endócrino","O pâncreas libera insulina para controlar o nível de açúcar no sangue."],
      ["Endócrino","A adrenalina, liberada pelas glândulas suprarrenais, acelera o coração num susto."],
      ["Imunológico","Os glóbulos brancos produzem anticorpos contra um vírus."],
      ["Imunológico","A vacina ensina o corpo a reconhecer um agente antes do contato com a doença."]
    ]});

  cie({id:"cie-doencas", topico:"Doenças e seus agentes", tipo:"classificar",
    p1:"Qual é o tipo de agente causador da doença?",
    p2:"Qual destas doenças tem como agente: {c}?",
    cats:{
      "Vírus":"acelular, só se reproduz dentro de células. Prevenção por vacina; antibiótico não funciona.",
      "Bactéria":"organismo unicelular procarionte. Tratamento com antibiótico.",
      "Protozoário":"unicelular eucarionte, geralmente transmitido por vetor ou água contaminada.",
      "Fungo":"micoses de pele e unhas, candidíase; tratamento com antifúngico.",
      "Verme (helminto)":"parasitas como lombriga, tênia e esquistossomo; prevenção por saneamento e higiene."
    },
    itens:[
      ["Vírus","Gripe (influenza)"],["Vírus","Covid-19"],["Vírus","Dengue"],["Vírus","Sarampo"],["Vírus","Aids (HIV)"],["Vírus","Raiva"],["Vírus","Catapora"],
      ["Bactéria","Tuberculose"],["Bactéria","Tétano"],["Bactéria","Cólera"],["Bactéria","Sífilis"],["Bactéria","Leptospirose"],["Bactéria","Hanseníase"],
      ["Protozoário","Malária"],["Protozoário","Doença de Chagas"],["Protozoário","Toxoplasmose"],["Protozoário","Leishmaniose"],["Protozoário","Giardíase"],
      ["Fungo","Pé de atleta (micose)"],["Fungo","Candidíase"],["Fungo","Frieira entre os dedos"],
      ["Verme (helminto)","Ascaridíase (lombriga)"],["Verme (helminto)","Esquistossomose (barriga-d’água)"],["Verme (helminto)","Teníase (solitária)"],["Verme (helminto)","Amarelão (ancilostomose)"]
    ]});

  cie({id:"cie-elementos", topico:"Símbolos dos elementos químicos", tipo:"classificar",
    p1:"Qual é o elemento químico representado pelo símbolo?",
    p2:"Qual é o símbolo do elemento {c}?",
    itens:[
      ["Hidrogênio","H"],["Oxigênio","O"],["Carbono","C"],["Nitrogênio","N"],["Sódio","Na"],["Potássio","K"],
      ["Cálcio","Ca"],["Ferro","Fe"],["Ouro","Au"],["Prata","Ag"],["Cobre","Cu"],["Chumbo","Pb"],
      ["Mercúrio","Hg"],["Enxofre","S"],["Fósforo","P"],["Cloro","Cl"],["Hélio","He"],["Magnésio","Mg"],
      ["Zinco","Zn"],["Alumínio","Al"],["Flúor","F"],["Iodo","I"],["Silício","Si"],["Estanho","Sn"]
    ]});

  cie({id:"cie-familias", topico:"Tabela periódica: famílias", tipo:"classificar",
    p1:"A que família da tabela periódica o elemento pertence?",
    p2:"Qual destes elementos pertence à família: {c}?",
    cats:{
      "Metal alcalino":"família 1 (exceto o hidrogênio): Li, Na, K, Rb, Cs. Um elétron na última camada.",
      "Metal alcalinoterroso":"família 2: Be, Mg, Ca, Sr, Ba. Dois elétrons na última camada.",
      "Calcogênio":"família 16: O, S, Se, Te.",
      "Halogênio":"família 17: F, Cl, Br, I. Formam sais com metais.",
      "Gás nobre":"família 18: He, Ne, Ar, Kr, Xe, Rn. Última camada completa, quase não reagem."
    },
    itens:[
      ["Metal alcalino","Sódio (Na)"],["Metal alcalino","Potássio (K)"],["Metal alcalino","Lítio (Li)"],
      ["Metal alcalinoterroso","Cálcio (Ca)"],["Metal alcalinoterroso","Magnésio (Mg)"],["Metal alcalinoterroso","Bário (Ba)"],
      ["Calcogênio","Oxigênio (O)"],["Calcogênio","Enxofre (S)"],["Calcogênio","Selênio (Se)"],
      ["Halogênio","Cloro (Cl)"],["Halogênio","Flúor (F)"],["Halogênio","Iodo (I)"],["Halogênio","Bromo (Br)"],
      ["Gás nobre","Hélio (He)"],["Gás nobre","Neônio (Ne)"],["Gás nobre","Argônio (Ar)"]
    ]});

  cie({id:"cie-separacao", topico:"Separação de misturas", tipo:"classificar",
    p1:"Qual é o método mais adequado para separar a mistura?",
    p2:"Em qual situação o método mais adequado é {c}?",
    cats:{
      "Filtração":"sólido não dissolvido + líquido (ou gás), usando um filtro.",
      "Decantação":"deixar em repouso para o componente mais denso ir ao fundo; serve também para líquidos que não se misturam (funil de decantação).",
      "Destilação simples":"sólido dissolvido num líquido: o líquido evapora e é condensado.",
      "Destilação fracionada":"líquidos misturados com pontos de ebulição diferentes.",
      "Evaporação":"deixar o líquido evaporar e recolher só o sólido que estava dissolvido.",
      "Separação magnética":"um dos componentes é atraído por ímã (ferro).",
      "Peneiração":"sólidos com grãos de tamanhos diferentes.",
      "Centrifugação":"girar em alta velocidade para acelerar a separação por densidade."
    },
    itens:[
      ["Filtração","Água com areia."],["Filtração","Café: separar o pó da bebida."],["Filtração","Ar com poeira, no aspirador de pó."],
      ["Decantação","Água e óleo, num funil de separação."],["Decantação","Água barrenta deixada em repouso numa estação de tratamento."],
      ["Destilação simples","Obter água pura a partir da água do mar."],["Destilação simples","Separar a água do sal de cozinha dissolvido, recuperando a água."],
      ["Destilação fracionada","Separar os derivados do petróleo (gasolina, querosene, diesel)."],["Destilação fracionada","Separar álcool e água."],
      ["Evaporação","Obter sal nas salinas, recuperando só o sal."],
      ["Separação magnética","Limalha de ferro misturada com areia."],["Separação magnética","Separar latas de aço das de alumínio numa usina de reciclagem."],
      ["Peneiração","Areia fina e pedrinhas, numa construção."],["Peneiração","Separar grãos de farinha mais grossos da farinha fina."],
      ["Centrifugação","Separar o plasma das células do sangue, em laboratório."],["Centrifugação","Tirar a água da roupa na máquina de lavar."]
    ]});

  cie({id:"cie-transformacoes", topico:"Transformações físicas e químicas", tipo:"julgar",
    p1:"Qual destas é uma transformação QUÍMICA?",
    p2:"Qual destas é uma transformação FÍSICA?",
    certas:[
      ["Queima de um papel.","Forma cinzas, gás carbônico e água: substâncias novas."],
      ["Ferrugem num portão de ferro.","O ferro reage com oxigênio e água formando óxido de ferro."],
      ["Cozimento de um ovo.","As proteínas mudam de estrutura de forma irreversível."],
      ["Fermentação da massa de pão.","Leveduras transformam açúcar em gás carbônico e álcool."],
      ["Bicarbonato de sódio com vinagre fazendo espuma.","A liberação de gás carbônico indica reação química."],
      ["Banana escurecendo depois de cortada.","Reação de oxidação."],
      ["Leite azedando.","Bactérias transformam a lactose em ácido."]
    ],
    erradas:[
      ["Gelo derretendo.","Muda só o estado físico: continua sendo água."],
      ["Água fervendo na chaleira.","Mudança de estado: o vapor ainda é água."],
      ["Açúcar dissolvendo no café.","O açúcar continua sendo açúcar, só está disperso."],
      ["Quebrar um copo de vidro.","Muda a forma, não a substância."],
      ["Amassar uma lata de alumínio.","Muda a forma, não a substância."],
      ["Orvalho se formando de manhã.","Condensação do vapor de água: mudança de estado."],
      ["Naftalina sumindo no armário.","Sublimação: passa de sólido direto a gás, sem virar outra substância."]
    ]});

  cie({id:"cie-energia", topico:"Transformações de energia", tipo:"classificar",
    p1:"Qual é a principal transformação de energia que acontece no dispositivo ou situação?",
    p2:"Em qual destes casos ocorre a transformação: {c}?",
    itens:[
      ["Potencial gravitacional → elétrica","Usina hidrelétrica: a água desce pelas turbinas."],
      ["Química → elétrica","Pilha de uma lanterna."],
      ["Luminosa → elétrica","Painel fotovoltaico no telhado."],
      ["Cinética do vento → elétrica","Aerogerador de um parque eólico."],
      ["Elétrica → cinética","Ventilador ligado."],
      ["Química → cinética","Motor de carro a gasolina."],
      ["Luminosa → química","Fotossíntese numa folha."],
      ["Elétrica → térmica","Chuveiro elétrico."],
      ["Química → térmica e luminosa","Vela acesa."],
      ["Elétrica → sonora","Caixa de som."]
    ]});

  cie({id:"cie-fontes", topico:"Fontes de energia", tipo:"classificar",
    p1:"A qual fonte de energia a descrição se refere?",
    p2:"Qual é a descrição da fonte: {c}?",
    itens:[
      ["Hidrelétrica","Renovável, principal fonte da eletricidade brasileira, mas alaga grandes áreas na construção das represas."],
      ["Eólica","Renovável, usa a força do vento; cresce muito no litoral do Nordeste."],
      ["Solar fotovoltaica","Renovável, transforma luz diretamente em eletricidade em placas instaladas em telhados."],
      ["Nuclear","Não renovável, usa a fissão do urânio; o Brasil tem usinas em Angra dos Reis."],
      ["Termelétrica a carvão","Não renovável e muito poluente; em SC, usada no complexo Jorge Lacerda, perto do carvão do sul do estado."],
      ["Biomassa","Renovável, queima bagaço de cana, lenha ou resíduos orgânicos."],
      ["Petróleo","Combustível fóssil, não renovável, de onde saem gasolina, diesel e plásticos."],
      ["Geotérmica","Renovável, aproveita o calor do interior da Terra; comum na Islândia."],
      ["Gás natural","Combustível fóssil, menos poluente que o carvão, usado em termelétricas e no GNV."]
    ]});

  cie({id:"cie-calor", topico:"Propagação de calor", tipo:"classificar",
    p1:"Qual é o principal processo de propagação de calor na situação?",
    p2:"Em qual situação o calor se propaga principalmente por {c}?",
    cats:{
      "Condução":"contato direto, de partícula para partícula; precisa de meio material.",
      "Convecção":"correntes de fluido (líquido ou gás): a parte quente, menos densa, sobe.",
      "Irradiação":"ondas eletromagnéticas; não precisa de meio material."
    },
    itens:[
      ["Condução","A colher de metal esquenta quando fica dentro da panela de sopa."],
      ["Condução","Pegar uma panela quente pelo cabo de metal e queimar a mão."],
      ["Condução","O piso de cerâmica parece mais frio que o tapete, por tirar calor do pé mais rápido."],
      ["Convecção","O ar-condicionado é instalado no alto da parede."],
      ["Convecção","O congelador fica na parte de cima da geladeira antiga, para o ar frio descer."],
      ["Convecção","As brisas do litoral, que mudam de sentido entre o dia e a noite."],
      ["Irradiação","Um carro escuro estacionado ao sol esquenta mais que um carro branco."],
      ["Irradiação","Sentir o calor de uma fogueira a alguns metros de distância."],
      ["Irradiação","A estufa de plantas aquecida pela luz que atravessa o vidro."]
    ]});

  cie({id:"cie-ecologia", topico:"Ecologia", tipo:"classificar",
    p1:"A qual conceito ecológico a descrição corresponde?",
    p2:"O que é {c}?",
    itens:[
      ["Produtor","Ser que fabrica o próprio alimento pela fotossíntese, como plantas e algas."],
      ["Consumidor primário","Herbívoro, que se alimenta diretamente dos produtores."],
      ["Decompositor","Fungos e bactérias que transformam a matéria morta em nutrientes para o solo."],
      ["População","Conjunto de indivíduos da mesma espécie vivendo na mesma área."],
      ["Comunidade","Conjunto de todas as populações de espécies diferentes de uma área."],
      ["Ecossistema","Comunidade de seres vivos junto com o ambiente físico (água, solo, clima) com que interage."],
      ["Mutualismo","Relação em que as duas espécies se beneficiam, como a abelha e a flor."],
      ["Parasitismo","Relação em que um ser vive às custas do outro e o prejudica, como o carrapato no cão."],
      ["Comensalismo","Relação em que um se beneficia e o outro não é afetado, como a rêmora e o tubarão."],
      ["Predação","Um animal caça e mata outro para se alimentar."],
      ["Competição","Disputa por um mesmo recurso, como alimento ou território, que prejudica os dois lados."],
      ["Nicho ecológico","O papel de uma espécie no ambiente: o que come, quando age, como se relaciona."],
      ["Habitat","O lugar onde uma espécie vive."]
    ]});

  cie({id:"cie-astronomia", topico:"Astronomia: Terra, Lua e Sol", tipo:"classificar",
    p1:"A qual fenômeno ou conceito astronômico a descrição se refere?",
    p2:"O que é {c}?",
    itens:[
      ["Rotação","Giro da Terra em torno do próprio eixo, que dura cerca de 24 horas e causa o dia e a noite."],
      ["Translação","Volta da Terra ao redor do Sol, que dura cerca de 365 dias."],
      ["Estações do ano","Consequência da inclinação do eixo da Terra combinada com a translação."],
      ["Solstício","Data, em junho e em dezembro, em que o Sol atinge sua posição mais ao norte ou mais ao sul no céu."],
      ["Equinócio","Data em que dia e noite têm aproximadamente a mesma duração em todo o planeta."],
      ["Eclipse solar","Durante o dia o céu escurece porque a sombra da Lua passa por uma região da Terra; só acontece na lua nova."],
      ["Eclipse lunar","A Lua cheia fica avermelhada porque entra na sombra projetada pela Terra."],
      ["Lua nova","Fase em que a face iluminada da Lua está voltada para o lado oposto ao da Terra, e quase não a vemos."],
      ["Lua cheia","Fase em que vemos toda a face da Lua voltada para nós iluminada."],
      ["Marés","Subida e descida do nível do mar causadas principalmente pela atração gravitacional da Lua."],
      ["Ano-luz","Distância que a luz percorre em um ano — unidade de distância, não de tempo."],
      ["Movimento aparente do Sol","O Sol parece nascer a leste e se pôr a oeste por causa da rotação da Terra."]
    ]});

  cie({id:"cie-genetica", topico:"Genética e evolução", tipo:"classificar",
    p1:"A qual conceito a descrição se refere?",
    p2:"O que é {c}?",
    itens:[
      ["DNA","Molécula em forma de dupla hélice que guarda a informação genética."],
      ["Gene","Trecho do DNA com a informação para produzir uma característica ou proteína."],
      ["Cromossomo","Estrutura formada por DNA enrolado; o ser humano tem 46 em cada célula do corpo."],
      ["Alelo dominante","Versão de um gene que se manifesta mesmo quando há só uma cópia dela."],
      ["Alelo recessivo","Versão de um gene que só se manifesta quando estão presentes duas cópias dela."],
      ["Genótipo","Conjunto de genes de um indivíduo para uma característica, como Aa."],
      ["Fenótipo","Característica observável, resultado do genótipo e do ambiente."],
      ["Mutação","Alteração no DNA que pode gerar características novas."],
      ["Seleção natural","Indivíduos mais adaptados ao ambiente sobrevivem e se reproduzem mais, passando suas características adiante (Darwin)."],
      ["Lei do uso e desuso","Ideia de Lamarck: órgãos usados se desenvolvem e os não usados atrofiam, passando aos filhos."],
      ["Fóssil","Vestígio preservado de um ser vivo antigo, usado como evidência da evolução."]
    ]});

  cie({id:"cie-unidades", topico:"Grandezas e unidades", tipo:"classificar",
    p1:"Qual grandeza física é medida nesta unidade?",
    p2:"Qual é a unidade de {c} no Sistema Internacional?",
    itens:[
      ["Força","newton (N)"],["Energia","joule (J)"],["Potência","watt (W)"],["Tensão elétrica","volt (V)"],
      ["Corrente elétrica","ampère (A)"],["Resistência elétrica","ohm (Ω)"],["Frequência","hertz (Hz)"],
      ["Massa","quilograma (kg)"],["Pressão","pascal (Pa)"],["Temperatura","kelvin (K)"],["Tempo","segundo (s)"],
      ["Velocidade","metro por segundo (m/s)"]
    ]});

  cie({id:"cie-fisica", topico:"Força, movimento e ondas", tipo:"classificar",
    p1:"A qual conceito ou lei a descrição corresponde?",
    p2:"Qual situação ou definição corresponde a: {c}?",
    itens:[
      ["Inércia (1ª lei de Newton)","Num freio brusco, os passageiros são jogados para a frente."],
      ["Princípio fundamental (2ª lei de Newton)","Para dar a mesma aceleração, um carrinho cheio precisa de mais força que um vazio."],
      ["Ação e reação (3ª lei de Newton)","O foguete empurra os gases para baixo e é empurrado para cima."],
      ["Peso","Força com que a Terra atrai um corpo; muda se o corpo for para a Lua."],
      ["Massa","Quantidade de matéria de um corpo; não muda de um planeta para outro."],
      ["Atrito","Força que se opõe ao deslizamento entre duas superfícies em contato."],
      ["Aceleração","Variação da velocidade em determinado tempo."],
      ["Som","Onda mecânica, que precisa de meio material e não se propaga no vácuo."],
      ["Eco","Reflexão do som que volta ao ouvinte com atraso perceptível."],
      ["Refração da luz","Mudança de direção da luz ao passar do ar para a água, que faz o canudo parecer quebrado no copo."],
      ["Frequência","Número de oscilações de uma onda por segundo; define se o som é grave ou agudo."]
    ]});
})();
