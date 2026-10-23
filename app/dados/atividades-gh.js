/* Atividades de Geografia e História — formato em atividades.js.
   Atividade de pares (um item por categoria) pergunta nos dois sentidos: dada a
   descrição, qual é o termo; dado o termo, qual é a descrição.                     */
(function () {
  const A = window.ATIVIDADES = window.ATIVIDADES || [];
  const gh = a => { a.area = "gh"; A.push(a); };

  gh({id:"gh-periodos-brasil", topico:"Períodos da história do Brasil", tipo:"classificar",
    p1:"Em que período da história do Brasil isto aconteceu?",
    p2:"Qual destes fatos aconteceu no período: {c}?",
    cats:{
      "Brasil Colônia":"1500–1822. Exploração pelo pacto colonial: pau-brasil, açúcar, ouro.",
      "Primeiro Reinado":"1822–1831. D. Pedro I, Constituição de 1824 com o Poder Moderador.",
      "Período Regencial":"1831–1840. Regentes governam por D. Pedro II ser criança; revoltas provinciais.",
      "Segundo Reinado":"1840–1889. D. Pedro II, café, Guerra do Paraguai, leis abolicionistas.",
      "República Velha":"1889–1930. Política do café com leite, coronelismo, voto de cabresto.",
      "Era Vargas":"1930–1945. Getúlio Vargas, leis trabalhistas, Estado Novo (1937–1945).",
      "República de 1946":"1946–1964. Período democrático: Vargas eleito, JK, Jânio, Jango.",
      "Ditadura Militar":"1964–1985. Governos militares, censura, AI-5, “milagre econômico”.",
      "Nova República":"1985–hoje. Redemocratização, Constituição de 1988, Plano Real."
    },
    itens:[
      ["Brasil Colônia","Divisão do território em capitanias hereditárias."],
      ["Brasil Colônia","Inconfidência Mineira, reprimida com a execução de Tiradentes (1792)."],
      ["Brasil Colônia","Auge da mineração de ouro em Minas Gerais."],
      ["Brasil Colônia","Destruição do Quilombo dos Palmares e morte de Zumbi (1695)."],
      ["Primeiro Reinado","Outorga da primeira Constituição do país, com o Poder Moderador (1824)."],
      ["Primeiro Reinado","Confederação do Equador, revolta em Pernambuco contra o centralismo do imperador (1824)."],
      ["Primeiro Reinado","Abdicação de D. Pedro I em favor do filho (1831)."],
      ["Período Regencial","Cabanagem, no Pará, e Balaiada, no Maranhão."],
      ["Período Regencial","Início da Revolução Farroupilha no Rio Grande do Sul (1835)."],
      ["Período Regencial","Golpe da Maioridade, que antecipou a coroação de D. Pedro II (1840)."],
      ["Segundo Reinado","Guerra do Paraguai (1864–1870)."],
      ["Segundo Reinado","Lei Eusébio de Queirós, que proibiu o tráfico de africanos escravizados (1850)."],
      ["Segundo Reinado","Expansão do café pelo Vale do Paraíba e oeste paulista."],
      ["Segundo Reinado","Assinatura da Lei Áurea (1888)."],
      ["República Velha","Guerra de Canudos, no sertão da Bahia (1896–1897)."],
      ["República Velha","Revolta da Vacina, no Rio de Janeiro (1904)."],
      ["República Velha","Guerra do Contestado, na divisa de Santa Catarina com o Paraná (1912–1916)."],
      ["República Velha","Revezamento de presidentes de São Paulo e Minas Gerais, sustentado pelo voto de cabresto dos coronéis."],
      ["Era Vargas","Criação da Consolidação das Leis do Trabalho, a CLT (1943)."],
      ["Era Vargas","Golpe do Estado Novo e fechamento do Congresso (1937)."],
      ["Era Vargas","Direito de voto concedido às mulheres no Código Eleitoral (1932)."],
      ["República de 1946","Construção de Brasília e inauguração da nova capital (1960)."],
      ["República de 1946","Criação da Petrobras após a campanha “O petróleo é nosso” (1953)."],
      ["República de 1946","Renúncia de Jânio Quadros, após sete meses de governo (1961)."],
      ["Ditadura Militar","Decretação do AI-5, que fechou o Congresso e suspendeu o habeas corpus para crimes políticos (1968)."],
      ["Ditadura Militar","Lei da Anistia (1979)."],
      ["Ditadura Militar","Campanha das Diretas Já, com grandes comícios pelo voto direto para presidente (1984)."],
      ["Nova República","Promulgação da “Constituição Cidadã” (1988)."],
      ["Nova República","Impeachment do presidente Fernando Collor (1992)."],
      ["Nova República","Lançamento do Plano Real, que controlou a hiperinflação (1994)."]
    ]});

  gh({id:"gh-historia-geral", topico:"Grandes processos da história geral", tipo:"classificar",
    p1:"A que processo histórico este fato pertence?",
    p2:"Qual destes fatos faz parte de: {c}?",
    cats:{
      "Antiguidade clássica":"Grécia e Roma: pólis, democracia ateniense, República e Império romanos.",
      "Idade Média":"feudalismo, servidão, poder da Igreja, Cruzadas.",
      "Renascimento":"humanismo e antropocentrismo nas artes e ciências (séc. XIV–XVI).",
      "Reforma Protestante":"ruptura com a Igreja Católica a partir de Lutero (1517).",
      "Grandes Navegações":"expansão marítima europeia, sobretudo ibérica, nos séculos XV e XVI.",
      "Revolução Francesa":"1789–1799: fim do Antigo Regime na França, ideais de liberdade e igualdade.",
      "Revolução Industrial":"máquinas e fábricas, começando na Inglaterra no séc. XVIII.",
      "Imperialismo":"partilha da África e da Ásia pelas potências industriais no séc. XIX.",
      "Primeira Guerra Mundial":"1914–1918, guerra de trincheiras.",
      "Segunda Guerra Mundial":"1939–1945, nazifascismo, Holocausto, bombas atômicas."
    },
    itens:[
      ["Antiguidade clássica","Cidadãos atenienses votavam diretamente nas assembleias da pólis."],
      ["Antiguidade clássica","Júlio César concentra poder e a República romana dá lugar ao Império."],
      ["Antiguidade clássica","Construção do Partenon, em Atenas."],
      ["Idade Média","Servos trabalhavam a terra do senhor feudal em troca de proteção."],
      ["Idade Média","Expedições militares cristãs para tomar Jerusalém: as Cruzadas."],
      ["Idade Média","Monges copiavam manuscritos à mão nos mosteiros."],
      ["Renascimento","Leonardo da Vinci pinta a Mona Lisa."],
      ["Renascimento","Michelangelo pinta o teto da Capela Sistina."],
      ["Renascimento","O ser humano passa a ser o centro das preocupações artísticas: antropocentrismo."],
      ["Reforma Protestante","Martinho Lutero divulga as 95 teses contra a venda de indulgências."],
      ["Reforma Protestante","Henrique VIII rompe com o papa e cria a Igreja Anglicana."],
      ["Reforma Protestante","João Calvino defende a doutrina da predestinação em Genebra."],
      ["Grandes Navegações","Vasco da Gama chega às Índias contornando a África (1498)."],
      ["Grandes Navegações","Cristóvão Colombo chega à América (1492)."],
      ["Grandes Navegações","O Tratado de Tordesilhas divide as terras entre Portugal e Espanha (1494)."],
      ["Revolução Francesa","Queda da Bastilha, em Paris (1789)."],
      ["Revolução Francesa","A Assembleia Nacional aprova um texto afirmando que os homens nascem livres e iguais em direitos (1789)."],
      ["Revolução Francesa","O rei Luís XVI é guilhotinado (1793)."],
      ["Revolução Industrial","A máquina a vapor aperfeiçoada por James Watt se espalha pelas fábricas."],
      ["Revolução Industrial","Operários ingleses quebram máquinas em protesto: o ludismo."],
      ["Revolução Industrial","Crianças trabalham em minas de carvão e fábricas de tecido de Manchester por salários menores que os dos adultos."],
      ["Imperialismo","A Conferência de Berlim organiza a partilha da África entre potências europeias (1884–1885)."],
      ["Imperialismo","A Guerra do Ópio força a China a abrir seus portos ao comércio britânico."],
      ["Imperialismo","O Congo vira propriedade pessoal do rei Leopoldo II, da Bélgica."],
      ["Primeira Guerra Mundial","O assassinato do arquiduque Francisco Ferdinando, em Sarajevo, serve de estopim (1914)."],
      ["Primeira Guerra Mundial","Soldados passam meses em trincheiras na frente ocidental."],
      ["Primeira Guerra Mundial","O Tratado de Versalhes impõe pesadas indenizações à Alemanha (1919)."],
      ["Segunda Guerra Mundial","A Alemanha nazista invade a Polônia (1939)."],
      ["Segunda Guerra Mundial","Tropas aliadas desembarcam na Normandia no Dia D (1944)."],
      ["Segunda Guerra Mundial","Milhões de judeus são assassinados em campos de extermínio: o Holocausto."]
    ]});

  gh({id:"gh-escravidao", topico:"Escravidão, resistência e abolição", tipo:"classificar",
    p1:"A que termo, lei ou personagem a descrição se refere?",
    p2:"O que foi {c}?",
    itens:[
      ["Lei Eusébio de Queirós","Lei de 1850 que proibiu o tráfico de africanos escravizados para o Brasil."],
      ["Lei do Ventre Livre","Lei de 1871 que declarou livres os filhos de mulheres escravizadas nascidos a partir dela."],
      ["Lei dos Sexagenários","Lei de 1885 que libertava escravizados com mais de 60 anos, idade que poucos alcançavam."],
      ["Lei Áurea","Lei de 1888 que extinguiu a escravidão no Brasil, sem indenização nem integração dos libertos."],
      ["Bill Aberdeen","Lei inglesa de 1845 que autorizava a marinha britânica a apreender navios negreiros."],
      ["Quilombo dos Palmares","Maior e mais duradouro quilombo do período colonial, na Serra da Barriga (atual Alagoas)."],
      ["Zumbi","Liderança de Palmares morta em 1695; a data da sua morte, 20 de novembro, virou Dia da Consciência Negra."],
      ["Revolta dos Malês","Levante de africanos muçulmanos escravizados e libertos em Salvador, em 1835."],
      ["Quilombo","Comunidade formada por pessoas que fugiam da escravidão; muitas existem até hoje como comunidades remanescentes."],
      ["Luiz Gama","Ex-escravizado que se tornou advogado e libertou centenas de pessoas na Justiça, no século XIX."],
      ["Tráfico negreiro","Comércio de africanos escravizados através do Atlântico, nos navios chamados tumbeiros."],
      ["Lei 10.639/2003","Tornou obrigatório o ensino de história e cultura afro-brasileira nas escolas."]
    ]});

  gh({id:"gh-santa-catarina", topico:"Santa Catarina", tipo:"classificar",
    p1:"A que fato, lugar ou grupo da história de Santa Catarina a descrição se refere?",
    p2:"Qual descrição corresponde a: {c}?",
    itens:[
      ["Guerra do Contestado","Conflito de 1912 a 1916 entre sertanejos e forças do governo, na região disputada entre SC e PR, ligado à ferrovia e à expulsão de posseiros."],
      ["Novembrada","Protesto de estudantes e moradores contra o presidente Figueiredo durante sua visita a Florianópolis, em 1979."],
      ["Florianópolis","Novo nome dado a Nossa Senhora do Desterro em 1894, homenageando o presidente que reprimiu a Revolução Federalista."],
      ["Colonização açoriana","Povoamento do litoral no século XVIII por famílias trazidas de um arquipélago português do Atlântico, que marcou a pesca artesanal e o falar manezinho."],
      ["Colonização alemã","Origem de Blumenau (1850) e de Joinville, a antiga Colônia Dona Francisca (1851)."],
      ["Colonização italiana","Ocupação do sul do estado no fim do século XIX, em cidades como Urussanga e Nova Veneza."],
      ["República Juliana","República proclamada em Laguna em 1839, durante a Revolução Farroupilha; dela participou Anita Garibaldi."],
      ["Laklãnõ-Xokleng","Povo indígena do Vale do Itajaí perseguido por bugreiros no início do século XX, para liberar terras à colonização."],
      ["Oeste catarinense","Região de Chapecó e Concórdia, conhecida pela agroindústria de aves e suínos."],
      ["Sul catarinense","Região de Criciúma, marcada pela mineração de carvão e pela indústria cerâmica."],
      ["Planalto Serrano","Região de São Joaquim e Urubici, de altitude elevada, onde as geadas são frequentes e a maçã é o principal cultivo."],
      ["Vale do Itajaí","Região de Blumenau e Brusque, polo da indústria têxtil e atingida com frequência por enchentes."]
    ]});

  gh({id:"gh-guerra-fria", topico:"Guerra Fria", tipo:"classificar",
    p1:"A que fato ou conceito da Guerra Fria a descrição se refere?",
    p2:"O que foi {c}?",
    itens:[
      ["Doutrina Truman","Política anunciada pelos EUA em 1947 de conter o avanço do comunismo no mundo."],
      ["Plano Marshall","Ajuda econômica dos EUA para reconstruir a Europa Ocidental depois da Segunda Guerra."],
      ["OTAN","Aliança militar criada em 1949, liderada pelos Estados Unidos."],
      ["Pacto de Varsóvia","Aliança militar criada em 1955 pela União Soviética e seus aliados do Leste Europeu."],
      ["Muro de Berlim","Barreira erguida em 1961 separando as partes oriental e ocidental de uma cidade alemã; caiu em 1989."],
      ["Crise dos Mísseis","Confronto de 1962 causado pela instalação de mísseis soviéticos em Cuba; o mundo esteve perto da guerra nuclear."],
      ["Revolução Cubana","Movimento liderado por Fidel Castro que derrubou Fulgêncio Batista em 1959."],
      ["Corrida espacial","Disputa que teve o Sputnik (1957), Yuri Gagarin no espaço (1961) e a chegada à Lua (1969)."],
      ["Guerra da Coreia","Conflito de 1950–1953 que deixou a península dividida no paralelo 38."],
      ["Guerra do Vietnã","Guerra em que os EUA lutaram contra o norte comunista e acabaram se retirando em 1973."],
      ["Perestroika e Glasnost","Reformas econômicas e de abertura política lançadas por Mikhail Gorbachev na URSS."],
      ["Fim da URSS","Dissolução do bloco soviético em 1991, em 15 países independentes."]
    ]});

  gh({id:"gh-biomas", topico:"Biomas brasileiros", tipo:"classificar",
    p1:"A qual bioma brasileiro a descrição corresponde?",
    p2:"Qual destas descrições é do bioma {c}?",
    cats:{
      "Amazônia":"floresta equatorial densa, maior biodiversidade do planeta, a maior bacia hidrográfica.",
      "Cerrado":"savana do Brasil Central, árvores de troncos retorcidos, nascentes de grandes rios; muito ocupado pela soja.",
      "Caatinga":"vegetação do semiárido nordestino, que perde as folhas na seca; exclusiva do Brasil.",
      "Mata Atlântica":"floresta do litoral, onde vive a maior parte da população; a mais devastada.",
      "Pampa":"campos com gramíneas no sul do Rio Grande do Sul, usados para pecuária.",
      "Pantanal":"maior planície alagável do mundo, com ciclo de cheia e seca, em MT e MS."
    },
    itens:[
      ["Amazônia","Floresta quente e úmida o ano inteiro, com árvores altas e folhas largas, cortada por rios enormes."],
      ["Amazônia","Bioma cujo desmatamento ameaça os “rios voadores” que levam chuva ao Centro-Sul."],
      ["Amazônia","Ocupa quase metade do território brasileiro e abriga muitos povos indígenas."],
      ["Cerrado","Árvores baixas de casca grossa e galhos retorcidos, adaptadas ao fogo e à estação seca."],
      ["Cerrado","Bioma do Planalto Central onde nascem rios que abastecem várias das grandes bacias brasileiras."],
      ["Cerrado","Bioma que mais perdeu área para a expansão da soja no Centro-Oeste."],
      ["Caatinga","Plantas que perdem as folhas na seca e cactos como o mandacaru."],
      ["Caatinga","Único bioma exclusivamente brasileiro, no sertão nordestino."],
      ["Caatinga","Chuvas escassas e irregulares e rios intermitentes, que secam parte do ano."],
      ["Mata Atlântica","Floresta da faixa litorânea, da qual resta pouco mais de 10% da cobertura original."],
      ["Mata Atlântica","Bioma onde estão as maiores cidades do país e que inclui a mata de araucárias do Sul."],
      ["Mata Atlântica","Primeiro bioma explorado pelos portugueses, com a extração do pau-brasil."],
      ["Pampa","Vegetação rasteira de gramíneas, sem florestas extensas, ligada à tradição gaúcha da criação de gado."],
      ["Pampa","Relevo de coxilhas suaves, também presente no Uruguai e na Argentina."],
      ["Pantanal","Maior planície alagável do mundo, com alternância de cheias e secas."],
      ["Pantanal","Bioma de Mato Grosso e Mato Grosso do Sul, conhecido pela observação de onças, jacarés e tuiuiús."]
    ]});

  gh({id:"gh-climas", topico:"Climas do Brasil", tipo:"classificar",
    p1:"Que tipo de clima a descrição caracteriza?",
    p2:"Qual destas descrições é do clima {c}?",
    cats:{
      "Equatorial":"quente e chuvoso o ano todo, pouca variação de temperatura.",
      "Tropical":"verão quente e chuvoso, inverno seco.",
      "Semiárido":"quente, com chuvas escassas e mal distribuídas.",
      "Tropical atlântico":"quente e úmido no litoral, chuvas trazidas pela umidade do oceano.",
      "Tropical de altitude":"temperaturas mais amenas por causa da altitude; geada ocasional.",
      "Subtropical":"estações bem definidas, inverno frio com geada e até neve nas serras; chuvas bem distribuídas."
    },
    itens:[
      ["Equatorial","Temperaturas altas e chuvas abundantes o ano todo, com pequena amplitude térmica, na região amazônica."],
      ["Equatorial","Clima de Manaus e Belém, onde chove quase todos os dias."],
      ["Tropical","Duas estações bem marcadas: verão chuvoso e inverno seco, típico do Brasil Central."],
      ["Tropical","Clima de Brasília e Cuiabá, com meses de céu limpo e baixa umidade no inverno."],
      ["Semiárido","Chuvas abaixo de 800 mm por ano, irregulares, e longos períodos de estiagem no sertão."],
      ["Semiárido","Clima que favorece a vegetação da caatinga e rios intermitentes."],
      ["Tropical atlântico","Clima do litoral do Nordeste e do Sudeste, quente e úmido por influência do oceano."],
      ["Tropical atlântico","Clima de Salvador e Recife, com chuvas concentradas no outono e inverno."],
      ["Tropical de altitude","Clima das serras do Sudeste, como em Campos do Jordão, mais frio pela altitude."],
      ["Tropical de altitude","Clima de Belo Horizonte e de áreas serranas de SP e MG: verões chuvosos e invernos amenos."],
      ["Subtropical","Clima de Santa Catarina: as quatro estações são bem definidas e o inverno traz geadas."],
      ["Subtropical","Clima onde pode nevar nas áreas mais altas, como São Joaquim e Urupema."]
    ]});

  gh({id:"gh-cartografia", topico:"Cartografia", tipo:"classificar",
    p1:"A qual conceito da cartografia a descrição corresponde?",
    p2:"O que é {c}?",
    itens:[
      ["Escala","Relação entre a medida no mapa e a medida real no terreno."],
      ["Latitude","Distância em graus de um ponto até a Linha do Equador, de 0° a 90° norte ou sul."],
      ["Longitude","Distância em graus de um ponto até o Meridiano de Greenwich, de 0° a 180° leste ou oeste."],
      ["Linha do Equador","Paralelo 0°, que divide a Terra nos hemisférios Norte e Sul."],
      ["Meridiano de Greenwich","Meridiano 0°, que divide a Terra nos hemisférios Leste e Oeste e serve de referência para os fusos."],
      ["Fuso horário","Faixa de 15° de longitude em que vale a mesma hora oficial."],
      ["Trópico de Capricórnio","Paralelo de cerca de 23° sul, que corta o Brasil na altura da cidade de São Paulo."],
      ["Curva de nível","Linha que liga pontos de mesma altitude num mapa topográfico."],
      ["Rosa dos ventos","Figura que indica os pontos cardeais, colaterais e subcolaterais."],
      ["Legenda","Parte do mapa que explica o significado das cores e símbolos usados."],
      ["Projeção cartográfica","Técnica de representar a superfície esférica da Terra num plano, sempre com alguma distorção."],
      ["Coordenadas geográficas","Par de latitude e longitude que localiza com precisão qualquer ponto da Terra."]
    ]});

  gh({id:"gh-ambiente", topico:"Questões ambientais", tipo:"classificar",
    p1:"A que problema ou conceito ambiental a descrição se refere?",
    p2:"O que é {c}?",
    itens:[
      ["Efeito estufa","Fenômeno natural em que gases da atmosfera retêm parte do calor do Sol, mantendo a Terra aquecida."],
      ["Aquecimento global","Aumento da temperatura média do planeta pela intensificação do efeito estufa por atividades humanas."],
      ["Ilha de calor","Centro urbano mais quente que os arredores por causa do asfalto, do concreto e da pouca vegetação."],
      ["Inversão térmica","Camada de ar frio fica presa sob uma de ar quente, retendo poluentes perto do solo, comum em manhãs de inverno."],
      ["Chuva ácida","Precipitação formada quando óxidos de enxofre e nitrogênio lançados por indústrias e veículos reagem com a água da atmosfera."],
      ["Destruição da camada de ozônio","Afinamento da camada que filtra os raios ultravioleta, provocado principalmente pelos CFCs."],
      ["Assoreamento","Acúmulo de sedimentos no leito dos rios, agravado pela retirada da mata ciliar."],
      ["Eutrofização","Excesso de nutrientes de esgoto e fertilizantes na água, que provoca proliferação de algas e falta de oxigênio."],
      ["Desertificação","Degradação do solo em áreas secas, que perde a capacidade de sustentar vegetação."],
      ["Acordo de Paris","Tratado climático de 2015 em que cada país apresenta suas próprias metas de corte de emissões."],
      ["Desenvolvimento sustentável","Atender às necessidades do presente sem comprometer as das gerações futuras."],
      ["Mata ciliar","Vegetação das margens de rios, que protege contra erosão e assoreamento."]
    ]});

  gh({id:"gh-populacao", topico:"População, cidades e globalização", tipo:"classificar",
    p1:"A que conceito a descrição se refere?",
    p2:"O que é {c}?",
    itens:[
      ["Êxodo rural","Migração em massa do campo para as cidades, que no Brasil se acelerou entre 1950 e 1980."],
      ["Conurbação","Quando duas ou mais cidades crescem até suas áreas urbanas se encontrarem, como Florianópolis e São José."],
      ["Metrópole","Grande cidade que concentra serviços e exerce influência sobre uma vasta região."],
      ["Megalópole","Junção de duas ou mais metrópoles numa grande mancha urbana contínua."],
      ["Migração pendular","Deslocamento diário de pessoas entre a cidade onde moram e a cidade onde trabalham ou estudam."],
      ["Crescimento vegetativo","Diferença entre a taxa de natalidade e a taxa de mortalidade de uma população."],
      ["Envelhecimento populacional","Aumento da proporção de idosos causado pela queda da natalidade e pelo aumento da expectativa de vida."],
      ["IDH","Índice que combina renda, educação e expectativa de vida para medir o desenvolvimento de um país."],
      ["Globalização","Integração econômica, cultural e tecnológica entre países, acelerada pelos meios de transporte e comunicação."],
      ["Empresa transnacional","Empresa com sede num país e filiais espalhadas por vários outros."],
      ["Mercosul","Bloco econômico criado em 1991 por Brasil, Argentina, Paraguai e Uruguai."],
      ["Segregação socioespacial","Separação de grupos sociais em áreas diferentes da cidade, de acordo com a renda."]
    ]});

  gh({id:"gh-direitos", topico:"Direitos humanos e cidadania", tipo:"classificar",
    p1:"A que marco ou movimento a descrição se refere?",
    p2:"O que é {c}?",
    itens:[
      ["Declaração Universal dos Direitos Humanos","Documento aprovado pela ONU em 1948, depois dos horrores da Segunda Guerra."],
      ["Constituição de 1988","Chamada de “Cidadã”, garantiu direitos sociais, o SUS e tornou o racismo crime inafiançável."],
      ["ECA","Estatuto de 1990 que define os direitos de crianças e adolescentes no Brasil."],
      ["Lei Maria da Penha","Lei de 2006 que cria mecanismos para coibir a violência doméstica contra a mulher."],
      ["Apartheid","Regime de segregação racial na África do Sul, de 1948 a 1994, combatido por Nelson Mandela."],
      ["Movimento pelos direitos civis","Luta contra a segregação racial nos EUA nos anos 1950 e 1960, com Martin Luther King e Rosa Parks."],
      ["Lei de Cotas","Lei de 2012 que garante parte das matrículas das instituições federais de ensino a estudantes de escola pública, com recorte racial e de renda."],
      ["Estatuto da Pessoa Idosa","Lei que garante direitos às pessoas com 60 anos ou mais, como prioridade no atendimento."],
      ["Voto feminino no Brasil","Direito conquistado pelas mulheres no Código Eleitoral de 1932."],
      ["Contracultura","Movimento jovem dos anos 1960 que questionou valores tradicionais, com o rock, o movimento hippie e o pacifismo."],
      ["Estatuto da Igualdade Racial","Lei de 2010 voltada a garantir à população negra a igualdade de oportunidades e o combate à discriminação."]
    ]});
})();
