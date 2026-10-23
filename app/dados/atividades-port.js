/* Atividades de Língua Portuguesa — formato em atividades.js.
   Os trechos foram escritos para ter UMA leitura dominante: ao acrescentar, confira que o
   trecho não serve também para outra categoria da mesma atividade (uma hipérbole que é
   também metáfora vira questão com duas respostas certas).                            */
(function () {
  const A = window.ATIVIDADES = window.ATIVIDADES || [];
  const port = a => { a.area = "port"; A.push(a); };

  port({id:"port-figuras", topico:"Figuras de linguagem", tipo:"classificar", inversa:false,
    p1:"Que figura de linguagem predomina no trecho?",
    cats:{
      "Metáfora":"comparação SEM conectivo — um termo passa a ser o outro (“ele é uma fera”).",
      "Comparação":"aproxima dois termos COM conectivo explícito: como, tal qual, feito, parece.",
      "Hipérbole":"exagero intencional para enfatizar (“chorei rios”).",
      "Eufemismo":"suaviza algo desagradável ou chocante (“partiu” em vez de “morreu”).",
      "Ironia":"diz o contrário do que se pensa, geralmente com tom de crítica ou deboche.",
      "Personificação":"atribui ações, sentimentos ou fala humana a seres inanimados ou animais (também chamada prosopopeia).",
      "Antítese":"aproxima palavras de sentidos opostos, sem contradição lógica (“riso e choro”).",
      "Paradoxo":"une ideias opostas numa afirmação que parece impossível, mas faz sentido (“dor que desatina sem doer”).",
      "Metonímia":"troca um termo por outro com o qual tem relação real: autor pela obra, marca pelo produto, parte pelo todo, recipiente pelo conteúdo.",
      "Onomatopeia":"palavra que imita um som (tic-tac, au-au, vrum).",
      "Gradação":"sequência de termos em ordem crescente ou decrescente de intensidade.",
      "Pleonasmo":"repetição de uma ideia para reforçar (intencional na literatura; vício quando é “subir para cima”).",
      "Sinestesia":"mistura sensações de sentidos diferentes (“cheiro doce”, “voz áspera”)."
    },
    itens:[
      ["Metáfora","Minha casa é meu porto seguro.","A casa não é um porto de verdade: ganha as qualidades de um porto (proteção, chegada), sem conectivo."],
      ["Metáfora","Aquele goleiro é uma muralha.","“Muralha” vira o próprio goleiro — não há “como” ligando os dois termos."],
      ["Metáfora","A vida é uma estrada cheia de curvas.",null],
      ["Metáfora","Seus olhos eram duas jabuticabas.","Sem conectivo, os olhos SÃO jabuticabas: metáfora. Com “como”, seria comparação."],
      ["Comparação","Ele dormia como uma pedra.","O conectivo “como” deixa a comparação explícita."],
      ["Comparação","Ela corria feito um raio pelo corredor.","“Feito” funciona aqui como conectivo comparativo (= como)."],
      ["Comparação","O silêncio da sala era tal qual o de uma igreja vazia.",null],
      ["Comparação","Teus cabelos são negros como a noite.",null],
      ["Hipérbole","Já te disse um milhão de vezes para fechar a porta!","Ninguém disse um milhão de vezes: o número exagera para mostrar irritação."],
      ["Hipérbole","Estou morrendo de fome.",null],
      ["Hipérbole","Chorei um oceano quando o filme acabou.",null],
      ["Hipérbole","A fila do banco estava quilométrica.",null],
      ["Eufemismo","O avô dela descansou depois de muito tempo doente.","“Descansou” suaviza “morreu”."],
      ["Eufemismo","O funcionário foi convidado a se retirar da empresa.","Forma educada de dizer “foi demitido”."],
      ["Eufemismo","Ele faltou com a verdade durante o depoimento.","Suaviza “mentiu”."],
      ["Eufemismo","Aquele senhor já está na melhor idade.","Suaviza “velhice”."],
      ["Ironia","Que beleza: choveu justo no dia do passeio!","“Que beleza” diz o contrário do que a pessoa sente."],
      ["Ironia","Parabéns pela pontualidade: só chegou duas horas atrasado.",null],
      ["Ironia","Que aluno aplicado: dormiu a aula inteira.",null],
      ["Personificação","O vento sussurrava segredos entre as árvores.","Sussurrar é ação humana atribuída ao vento."],
      ["Personificação","O despertador gritou às seis da manhã.",null],
      ["Personificação","A cidade acordou preguiçosa naquela segunda-feira.",null],
      ["Personificação","As estrelas piscavam para os namorados na praça.",null],
      ["Antítese","Entre o riso e o choro, a vida segue.","Riso × choro: opostos lado a lado, sem contradição lógica."],
      ["Antítese","Nasce o sol, e não dura mais que um dia; depois da luz se segue a noite escura.","Luz × noite escura (Gregório de Matos)."],
      ["Antítese","Os ricos ficam mais ricos e os pobres, mais pobres.",null],
      ["Paradoxo","É preciso se perder para se encontrar.","Perder-se e encontrar-se ao mesmo tempo parece impossível — e mesmo assim faz sentido."],
      ["Paradoxo","Estou cercado de gente e me sinto sozinho.","Diferente da antítese: aqui os opostos convivem na MESMA afirmação, criando um aparente absurdo."],
      ["Paradoxo","É um contentamento descontente.",null],
      ["Paradoxo","Quanto mais aprendo, mais percebo que nada sei.",null],
      ["Metonímia","Adoro ler Clarice Lispector nas férias.","Lê-se a OBRA, não a autora: autor no lugar da obra."],
      ["Metonímia","Bebeu dois copos de suco no café da manhã.","Bebe-se o conteúdo, não o copo: recipiente pelo conteúdo."],
      ["Metonímia","O estádio inteiro aplaudiu o gol.","Quem aplaude é o público: lugar pelos ocupantes."],
      ["Metonímia","Comprei um Bombril para lavar as panelas.","Marca no lugar do produto (palha de aço)."],
      ["Metonímia","Faltam braços para a colheita.","Parte (braços) pelo todo (trabalhadores)."],
      ["Onomatopeia","Toc, toc! Quem bate à porta a essa hora?",null],
      ["Onomatopeia","O relógio fazia tic-tac no silêncio da madrugada.",null],
      ["Onomatopeia","Vrum, vrum — e a moto sumiu na esquina.",null],
      ["Gradação","Primeiro um sussurro, depois uma conversa, por fim um grito.","Intensidade crescente: sussurro → conversa → grito."],
      ["Gradação","Lutou, sofreu, sangrou, venceu.",null],
      ["Gradação","Era um vilarejo, virou cidade, tornou-se metrópole.",null],
      ["Pleonasmo","Eu vi com meus próprios olhos o acidente.","Ver já é com os olhos: a repetição reforça a certeza do testemunho."],
      ["Pleonasmo","Sorriu para mim um sorriso triste.",null],
      ["Sinestesia","Ela tinha uma voz doce e aveludada.","Voz (audição) + doce (paladar) + aveludada (tato)."],
      ["Sinestesia","Senti um perfume quente vindo da cozinha.","Perfume (olfato) + quente (tato)."],
      ["Sinestesia","Aquele grito amarelo rasgou a tarde.","Grito (audição) + amarelo (visão)."]
    ]});

  port({id:"port-classes", topico:"Classes de palavras", tipo:"classificar", inversa:false,
    p1:"Qual é a classe gramatical da palavra em MAIÚSCULAS?",
    cats:{
      "Substantivo":"nomeia seres, coisas, ideias, sentimentos. Aceita artigo antes (“o amor”, “a corrida”).",
      "Adjetivo":"caracteriza o substantivo (qualidade, estado, origem).",
      "Verbo":"indica ação, estado ou fenômeno e varia em tempo e pessoa.",
      "Advérbio":"modifica verbo, adjetivo ou outro advérbio, indicando tempo, lugar, modo, intensidade, negação… Não varia.",
      "Pronome":"substitui ou acompanha o substantivo, indicando pessoa do discurso (eu, ele, meu, este, alguém, que…).",
      "Preposição":"liga duas palavras, estabelecendo relação entre elas (a, de, com, em, para, por, sem, sobre…). Não varia.",
      "Conjunção":"liga orações ou termos de mesma função (e, mas, porque, quando, embora, se…).",
      "Artigo":"vem antes do substantivo, definindo-o (o, a, os, as) ou indefinindo-o (um, uma, uns, umas).",
      "Numeral":"indica quantidade, ordem, multiplicação ou fração (dois, segundo, dobro, metade)."
    },
    itens:[
      ["Substantivo","A CORAGEM dela impressionou a todos."],["Substantivo","O ANDAR da criança ainda era inseguro.","Verbo substantivado: o artigo “o” transforma “andar” em substantivo."],
      ["Substantivo","Comprei um CADERNO novo."],["Substantivo","A SAUDADE apertou no fim de semana."],
      ["Adjetivo","Era uma noite FRIA e silenciosa."],["Adjetivo","O time CATARINENSE venceu o campeonato."],["Adjetivo","Ela ficou FELIZ com a notícia."],["Adjetivo","Encontrei um livro ANTIGO na estante."],
      ["Verbo","Os alunos ESTUDAM todas as tardes."],["Verbo","Amanhã CHOVERÁ no litoral."],["Verbo","Ela PARECIA cansada."],["Verbo","Nós CORREMOS até o ponto de ônibus."],
      ["Advérbio","Ele chegou CEDO à escola.","Tempo, modificando “chegou”."],["Advérbio","A prova estava MUITO difícil.","Intensidade, modificando o adjetivo “difícil”."],
      ["Advérbio","Ela fala CALMAMENTE com os clientes."],["Advérbio","NÃO vou ao jogo hoje."],
      ["Advérbio","Moramos AQUI há dez anos."],
      ["Pronome","ELA trouxe o bolo para a festa."],["Pronome","Esse lápis é MEU."],["Pronome","ALGUÉM deixou a janela aberta."],["Pronome","O livro QUE você me emprestou é ótimo.","“Que” retoma “livro”: pronome relativo (= o qual)."],["Pronome","ESTE caderno está rasgado."],
      ["Preposição","Fui DE ônibus para o centro."],["Preposição","Saiu SEM guarda-chuva."],["Preposição","O livro está SOBRE a mesa."],["Preposição","Gosto muito DE chocolate."],
      ["Conjunção","Estudei muito, MAS não passei.","Liga orações com ideia de oposição."],["Conjunção","Saí cedo PORQUE tinha prova."],["Conjunção","Comprei pão E leite."],["Conjunção","EMBORA estivesse cansado, foi ao treino."],["Conjunção","Ligue para mim QUANDO chegar."],
      ["Artigo","Encontrei O diretor no corredor."],
      ["Artigo","Encontrei UMA moeda no chão."],["Artigo","AS meninas venceram o torneio."],
      ["Numeral","Ele chegou em SEGUNDO lugar."],["Numeral","Comprei TRÊS cadernos."],["Numeral","Ganhou o DOBRO do salário."],["Numeral","Comeu METADE da pizza."]
    ]});

  port({id:"port-conectivos", topico:"Conectivos e relações de sentido", tipo:"classificar",
    p1:"Que relação de sentido o conectivo em MAIÚSCULAS estabelece?",
    p2:"Em qual frase o conectivo em MAIÚSCULAS expressa {c}?",
    cats:{
      "Adição":"soma ideias — e, também, além disso, não só… mas também, nem.",
      "Oposição (adversidade)":"contraria a expectativa da primeira ideia — mas, porém, contudo, todavia, entretanto, no entanto.",
      "Concessão":"admite um obstáculo que não impede o fato — embora, mesmo que, ainda que, apesar de, se bem que.",
      "Causa":"indica o motivo — porque, já que, visto que, uma vez que, como (no início da frase).",
      "Consequência":"indica o resultado — de modo que, tão… que, tanto… que, de forma que.",
      "Conclusão":"tira uma conclusão do que foi dito — logo, portanto, por isso, assim, então, pois (depois do verbo).",
      "Condição":"indica uma hipótese necessária — se, caso, desde que, contanto que.",
      "Finalidade":"indica o objetivo — para que, a fim de que, para.",
      "Tempo":"situa no tempo — quando, enquanto, assim que, logo que, depois que.",
      "Alternância":"apresenta opções que se excluem — ou… ou, ora… ora, quer… quer."
    },
    itens:[
      ["Adição","Ela canta E toca violão."],["Adição","Ele não estudou NEM fez o trabalho."],["Adição","A cidade é bonita; ALÉM DISSO, é segura."],
      ["Oposição (adversidade)","Treinou muito, MAS perdeu a final."],["Oposição (adversidade)","O plano era bom; PORÉM, faltou dinheiro."],["Oposição (adversidade)","Choveu a semana toda; NO ENTANTO, o rio não encheu."],
      ["Concessão","EMBORA estivesse doente, foi trabalhar."],["Concessão","MESMO QUE chova, o jogo vai acontecer."],["Concessão","APESAR DO cansaço, terminou a prova."],
      ["Causa","Não fui à aula PORQUE estava com febre."],["Causa","JÁ QUE você chegou, podemos começar."],["Causa","COMO estava chovendo, ficamos em casa."],["Causa","A estrada foi interditada, VISTO QUE houve um deslizamento."],
      ["Consequência","Correu TANTO QUE ficou sem fôlego."],["Consequência","Falou tão baixo QUE ninguém ouviu."],["Consequência","O ônibus atrasou, DE MODO QUE perdemos o início do filme."],
      ["Conclusão","Ele treinou o ano inteiro; LOGO, está preparado."],["Conclusão","Penso, PORTANTO existo."],["Conclusão","Faltou luz no bairro; POR ISSO, a aula foi cancelada."],
      ["Condição","SE estudar todos os dias, você vai longe."],["Condição","CASO precise, ligue para mim."],["Condição","Pode sair, DESDE QUE volte antes das dez."],
      ["Finalidade","Estudou muito PARA QUE pudesse entrar no IFSC."],["Finalidade","Saiu cedo A FIM DE evitar o trânsito."],
      ["Tempo","QUANDO o sinal tocou, todos saíram."],["Tempo","ASSIM QUE chegar, me avise."],["Tempo","ENQUANTO eu cozinhava, ele lavava a louça."],
      ["Alternância","OU você estuda, OU vai reprovar."],["Alternância","ORA chorava, ORA ria."]
    ]});

  port({id:"port-crase", topico:"Crase", tipo:"julgar",
    p1:"Em qual frase o acento indicativo de crase está CORRETO?",
    p2:"Em qual frase há ERRO no uso da crase?",
    certas:[
      ["Vou à praia no sábado.","Troque por masculino: vou AO parque → tem crase."],
      ["A reunião começa às 14h.","Hora exata sempre leva crase."],
      ["Entregou o trabalho à professora.","Entregou algo A alguém + A professora → à."],
      ["Saiu às pressas de casa.","Locução adverbial feminina (às pressas)."],
      ["Fizemos um bolo à moda mineira.","“À moda de” leva crase, mesmo subentendida (bife à milanesa)."],
      ["Ficou na porta, à espera do ônibus.","Locução “à espera de” leva crase."],
      ["Refiro-me àquela menina do fundo da sala.","Refiro-me A + AQUELA → àquela."],
      ["Ele chegou à noite, cansado.","Locução adverbial de tempo feminina (à noite)."],
      ["Fomos à Bahia nas férias.","Volto DA Bahia → o nome aceita artigo → vou À Bahia."]
    ],
    erradas:[
      ["Fomos à pé até a escola.","“Pé” é masculino: sem crase (a pé)."],
      ["Começou à chover forte.","Antes de verbo não há crase (começou a chover)."],
      ["Entreguei o livro à ele.","Antes de pronome pessoal não há crase (a ele)."],
      ["Ficaram cara à cara com o diretor.","Entre palavras repetidas não há crase (cara a cara)."],
      ["Vou à Florianópolis amanhã.","Volto DE Florianópolis (sem artigo) → vou A Florianópolis."],
      ["Comprou uma TV à prazo.","“Prazo” é masculino: a prazo."],
      ["Ele se dirigiu à uma loja do centro.","Antes de artigo indefinido “uma” não há crase."],
      ["O curso vai de segunda à sexta.","Com “de” sem artigo, usa-se “a” sem crase (de segunda a sexta); com “da”, crase (da segunda à sexta)."],
      ["Escreveu a carta à lápis.","“Lápis” é masculino: a lápis."]
    ]});

  port({id:"port-concordancia", topico:"Concordância", tipo:"julgar",
    p1:"Qual frase segue a norma-padrão quanto à concordância?",
    p2:"Qual frase apresenta ERRO de concordância?",
    certas:[
      ["Havia muitos alunos no pátio.","Haver = existir: impessoal, singular."],
      ["Faz três anos que ela se mudou.","Fazer indicando tempo: impessoal, singular."],
      ["Existem várias soluções para o problema.","Existir tem sujeito (várias soluções): plural."],
      ["Chegaram as encomendas que você pediu.","Sujeito posposto (as encomendas) no plural: verbo no plural."],
      ["Ela estava meio cansada depois do treino.","“Meio” = um pouco (advérbio): invariável."],
      ["Havia menos pessoas na fila hoje.","“Menos” é invariável — “menas” não existe."],
      ["Seguem anexos os documentos solicitados.","“Anexo” concorda com o substantivo: documentos anexos."],
      ["Mais de um aluno faltou à aula.","Com “mais de um”, o verbo fica no singular."],
      ["A maioria dos estudantes aprovou a proposta.","Coletivo partitivo: singular (concorda com “maioria”) ou plural. As duas formas são aceitas."]
    ],
    erradas:[
      ["Haviam muitos alunos no pátio.","Haver = existir é impessoal: havia."],
      ["Fazem três anos que ela se mudou.","Fazer indicando tempo é impessoal: faz."],
      ["Existe várias soluções para o problema.","Sujeito plural (várias soluções): existem."],
      ["Chegou as encomendas que você pediu.","Sujeito posposto plural: chegaram."],
      ["Ela estava meia cansada depois do treino.","Advérbio não varia: meio cansada."],
      ["Havia menas pessoas na fila hoje.","“Menas” não existe: menos."],
      ["Segue anexo os documentos solicitados.","Concordância: seguem anexos os documentos."],
      ["Os alunos estava animados com a viagem.","Sujeito plural: estavam."],
      ["Fazia muitos dias que não chovia e houveram queimadas.","Haver = existir/acontecer é impessoal: houve queimadas."]
    ]});

  port({id:"port-generos", topico:"Gêneros textuais", tipo:"classificar", inversa:false,
    p1:"A que gênero textual o trecho pertence, mais provavelmente?",
    cats:{
      "Notícia":"relata fato recente, de forma objetiva, respondendo o quê, quem, quando, onde.",
      "Artigo de opinião":"defende um ponto de vista, assinado, com argumentos.",
      "Crônica":"texto curto, a partir de uma cena do cotidiano, tom pessoal e muitas vezes humorado ou reflexivo.",
      "Receita / texto instrucional":"orienta passo a passo, com verbos no imperativo.",
      "Anúncio publicitário":"quer convencer a comprar ou aderir; apelo direto ao leitor, slogan.",
      "Verbete":"define um termo, como em dicionário ou enciclopédia.",
      "Fábula":"narrativa curta, geralmente com animais personificados, que termina com uma moral.",
      "Carta / e-mail":"comunicação entre remetente e destinatário, com saudação e despedida.",
      "Poema":"organizado em versos e estrofes, explora ritmo, sonoridade e imagens."
    },
    itens:[
      ["Notícia","A Defesa Civil de Santa Catarina emitiu, nesta terça-feira (14), alerta de chuva intensa para o Vale do Itajaí. Segundo o órgão, os acumulados podem passar de 100 mm até quinta."],
      ["Notícia","Um incêndio atingiu na madrugada de ontem um galpão no bairro Estreito, em Florianópolis. Ninguém ficou ferido, informou o Corpo de Bombeiros."],
      ["Notícia","O IFSC divulgou nesta segunda-feira o resultado preliminar do exame de classificação. Os candidatos podem recorrer até sexta."],
      ["Artigo de opinião","Defendo que o celular seja proibido em sala de aula. Não por implicância, mas porque os dados mostram que a atenção dos alunos cai pela metade quando o aparelho está à vista."],
      ["Artigo de opinião","É inaceitável que, em pleno século XXI, cidades inteiras ainda despejem esgoto sem tratamento no mar. A solução existe; falta vontade política."],
      ["Crônica","Hoje cedo, na fila da padaria, um senhor contava ao caixa que o neto lhe ensinara a mandar áudio. Saiu dali radiante, como quem tivesse descoberto o fogo."],
      ["Crônica","Toda segunda-feira o meu vizinho rega as plantas às seis da manhã, cantando bolero. No começo me irritava. Hoje, se ele falta, sinto que a semana não começou."],
      ["Receita / texto instrucional","Bata os ovos com o açúcar até formar um creme. Acrescente a farinha aos poucos e leve ao forno preaquecido a 180 °C por 40 minutos."],
      ["Receita / texto instrucional","Para instalar o aplicativo, acesse a loja do seu celular, digite o nome do programa e toque em “Instalar”. Depois, abra e crie sua conta."],
      ["Anúncio publicitário","Cansou de acordar cansado? Colchões Sonho Bom: você merece dormir nas nuvens. Só esta semana, em até 10x sem juros!"],
      ["Anúncio publicitário","Doe sangue. Uma bolsa pode salvar até quatro vidas. Procure o hemocentro mais próximo."],
      ["Verbete","Restinga (s.f.): vegetação que ocorre em planícies arenosas do litoral, entre a praia e a encosta, adaptada ao solo pobre e salino."],
      ["Verbete","Fotossíntese: processo pelo qual plantas, algas e algumas bactérias produzem glicose a partir de gás carbônico e água, usando a energia da luz."],
      ["Fábula","A cigarra cantou o verão inteiro enquanto a formiga trabalhava. Quando veio o inverno, a cigarra, faminta, bateu à porta da formiga. Moral: é preciso pensar no amanhã."],
      ["Fábula","Um leão, preso numa rede, foi libertado por um ratinho que roeu as cordas. Moral: os pequenos também podem ajudar os grandes."],
      ["Carta / e-mail","Prezada coordenadora, escrevo para solicitar a revisão da minha nota na avaliação de Química, conforme o anexo. Agradeço a atenção. Atenciosamente, Lucas."],
      ["Carta / e-mail","Querida vó, estou com saudade! Aqui em Joinville está frio, mas a escola nova é ótima. Mande um beijo para o vô. Com carinho, Bia."],
      ["Poema","Na beira do mar de Floripa / a tarde se deita devagar; / o vento conta segredos / que a areia não quer guardar."],
      ["Poema","No meio do caminho tinha uma pedra / tinha uma pedra no meio do caminho."]
    ]});

  port({id:"port-variacao", topico:"Variação linguística", tipo:"classificar",
    p1:"Que tipo de variação linguística aparece com mais destaque no trecho?",
    p2:"Qual trecho é um exemplo de variação {c}?",
    cats:{
      "regional (geográfica)":"marcas de uma região: vocabulário, sotaque, expressões locais.",
      "social (grupo ou idade)":"marcas de um grupo — jovens, profissão, comunidade: gíria e jargão.",
      "histórica":"marcas de outra época: palavras e grafias que caíram em desuso.",
      "situacional (formal × informal)":"o mesmo falante muda o registro conforme a situação — reunião, entrevista, conversa com amigos."
    },
    itens:[
      ["regional (geográfica)","Bah, tchê, que frio de renguear cusco!","Expressões típicas do Rio Grande do Sul."],
      ["regional (geográfica)","Ó-lhó-lhó, mas que tanso que tu és, rapaz!","Fala manezinha do litoral de Florianópolis."],
      ["regional (geográfica)","Oxente, painho, bora comer um cuscuz com macaxeira?","Marcas do Nordeste."],
      ["regional (geográfica)","Uai, sô, cê vai de ônibus mesmo? Que trem doido!","“Uai”, “sô”, “trem” marcam o falar mineiro."],
      ["social (grupo ou idade)","Mano, aquele rolê foi top demais, tá ligado?","Gíria de jovens."],
      ["social (grupo ou idade)","O paciente apresentou quadro de hipertensão arterial sistêmica, com taquicardia.","Jargão médico."],
      ["social (grupo ou idade)","O sistema caiu porque deu bug no deploy; vou dar um rollback.","Jargão de programadores."],
      ["social (grupo ou idade)","Esse meme flopou, ninguém deu like.","Vocabulário de internet, típico de um grupo."],
      ["histórica","Vossa mercê haverá de perdoar a demora desta missiva.","“Vossa mercê” e “missiva” são de outra época (vossa mercê deu origem a “você”)."],
      ["histórica","A pharmacia da praça vende xarope para a tosse.","Grafia antiga (ph no lugar de f), anterior às reformas ortográficas."],
      ["histórica","O moço pôs o chapéu, montou no automóvel e foi ao cinematógrafo.","“Cinematógrafo” é palavra de época."],
      ["situacional (formal × informal)","Excelentíssimo senhor prefeito, venho, por meio deste, solicitar providências.","Registro formal, adequado a um requerimento."],
      ["situacional (formal × informal)","Oi, prof! Vou chegar atrasadinho hoje, foi mal!","Registro informal, que pode ser inadequado para falar com professor por escrito."],
      ["situacional (formal × informal)","Senhoras e senhores, declaro aberta a sessão solene.","Situação cerimonial exige registro formal."],
      ["situacional (formal × informal)","Na entrevista de emprego ele disse “Agradeço a oportunidade”; com os amigos, depois, “Foi de boa, mano”.","A mesma pessoa muda o registro conforme a situação."],
      ["regional (geográfica)","No Sul se diz “bergamota”; em São Paulo, “mexerica”; no Rio, “tangerina”.","A mesma fruta tem nomes diferentes em cada região."],
      ["regional (geográfica)","O carioca chia o “s” em “mesmo” e “festa”; o manezinho também.","Diferença de pronúncia (sotaque) ligada ao lugar."],
      ["histórica","Antigamente se escrevia “pharmacia”, “Brazil” e “lyrio”.","Grafias que mudaram com as reformas ortográficas do século XX."],
      ["histórica","“Vosmecê” virou “você”, que hoje vira “cê” na fala.","Transformação da língua ao longo do tempo."],
      ["social (grupo ou idade)","No skate, a galera chama a manobra de “ollie” e a queda de “capote”.","Vocabulário próprio de um grupo."]
    ]});

  port({id:"port-funcoes", topico:"Funções da linguagem", tipo:"classificar",
    p1:"Qual função da linguagem predomina no trecho?",
    p2:"Em qual trecho predomina a função {c}?",
    cats:{
      "referencial":"foco no assunto: informa de modo objetivo (notícia, texto didático).",
      "emotiva":"foco no emissor: expressa sentimentos e opiniões, 1ª pessoa, exclamações.",
      "apelativa (conativa)":"foco no receptor: quer convencer ou dar ordens — imperativo, vocativo, “você”.",
      "fática":"foco no canal: testa ou mantém o contato (alô, tá me ouvindo?, né?).",
      "metalinguística":"a linguagem fala dela mesma: dicionário, poema sobre fazer poema, filme sobre cinema.",
      "poética":"foco na forma da mensagem: ritmo, rima, sonoridade, jogo de palavras."
    },
    itens:[
      ["referencial","A água ferve a 100 °C ao nível do mar."],["referencial","O Brasil tem 26 estados e um Distrito Federal."],
      ["emotiva","Ai, que saudade eu sinto daquele verão!"],["emotiva","Eu fico tão feliz quando vejo vocês juntos!"],
      ["apelativa (conativa)","Vacine seu filho. Proteja quem você ama."],["apelativa (conativa)","Você, que ainda não se inscreveu: corra, o prazo acaba hoje!"],
      ["fática","Alô? Alô? Tá me ouvindo? A ligação está cortando…"],["fática","Então, né… tipo assim… sabe?"],
      ["metalinguística","“Saudade” é um substantivo feminino que designa a lembrança nostálgica de alguém ou de algo distante."],["metalinguística","Escrevo este poema para falar da dificuldade de escrever poemas."],
      ["poética","O rato roeu a roupa do rei de Roma."],["poética","Vai, vem, voa a vida — veloz, vária, vã."],
      ["referencial","Segundo o IBGE, Santa Catarina tem cerca de 7,6 milhões de habitantes."],["referencial","A mitocôndria é a organela responsável pela respiração celular."],
      ["emotiva","Que medo eu senti naquela noite! Nunca mais quero passar por isso."],["apelativa (conativa)","Não perca! Inscreva-se já no curso de férias."],
      ["fática","— Oi, tudo bem? — Tudo, e aí? — Tudo certo."],["metalinguística","Uma crônica é um texto curto que parte de um fato do cotidiano."],
      ["poética","Batatinha quando nasce / espalha a rama pelo chão."]
    ]});

  port({id:"port-sujeito", topico:"Tipos de sujeito", tipo:"classificar",
    p1:"Qual é o tipo de sujeito da oração?",
    p2:"Qual destas orações se classifica como: {c}?",
    cats:{
      "Simples":"um só núcleo.",
      "Composto":"dois ou mais núcleos.",
      "Oculto (desinencial)":"não está escrito, mas a terminação do verbo o identifica.",
      "Indeterminado":"existe alguém, mas o texto não diz quem — 3ª do plural sem referente, ou verbo + se.",
      "Oração sem sujeito":"verbos impessoais: fenômenos da natureza, haver = existir, fazer/estar indicando tempo."
    },
    itens:[
      ["Simples","Os alunos do IFSC visitaram o museu."],["Simples","A chuva alagou a rua principal."],["Simples","Chegou a encomenda.","Sujeito posposto: a encomenda chegou."],
      ["Composto","Maria e João estudam juntos."],["Composto","O cachorro e o gato dormiam no sofá."],["Composto","Professores, pais e alunos participaram da reunião."],
      ["Oculto (desinencial)","Fomos ao cinema ontem.","A terminação -mos indica “nós”."],["Oculto (desinencial)","Estudei a tarde inteira.","-ei → eu."],["Oculto (desinencial)","Chegaremos cedo amanhã."],
      ["Indeterminado","Roubaram minha bicicleta.","Alguém roubou, mas não se sabe quem."],["Indeterminado","Precisa-se de vendedores.","Verbo que pede preposição + se: indeterminado."],["Indeterminado","Falaram mal de você na reunião."],["Indeterminado","Vive-se bem nesta cidade."],
      ["Oração sem sujeito","Choveu muito durante a noite."],["Oração sem sujeito","Há muitas pessoas na fila.","Haver = existir: impessoal."],["Oração sem sujeito","Faz dois anos que não o vejo."],["Oração sem sujeito","Está frio hoje."],
      ["Simples","O ônibus atrasou de novo."],["Simples","Ninguém respondeu à pergunta.","“Ninguém” é pronome e funciona como núcleo do sujeito."],["Simples","Aconteceram muitas coisas ontem.","Sujeito posposto: muitas coisas aconteceram."],
      ["Composto","Chegaram o diretor e a coordenadora."],["Composto","Florianópolis e Joinville receberam a feira."],
      ["Oculto (desinencial)","Saímos cedo para a prova."],["Oculto (desinencial)","Gostas de chocolate?","-s → tu."],
      ["Indeterminado","Disseram que vai faltar água."],["Indeterminado","Trata-se de um caso grave.","Verbo pronominal com “se”: não há quem pratique a ação."],
      ["Oração sem sujeito","Nevou em São Joaquim."],["Oração sem sujeito","Já era meia-noite quando ele chegou.","Ser indicando tempo: impessoal."],["Oração sem sujeito","Houve um acidente na BR-101."]
    ]});

  port({id:"port-conotacao", topico:"Denotação e conotação", tipo:"julgar",
    p1:"Em qual frase a palavra em MAIÚSCULAS está em sentido CONOTATIVO (figurado)?",
    p2:"Em qual frase a palavra em MAIÚSCULAS está em sentido DENOTATIVO (literal)?",
    certas:[
      ["Ele tem um coração de PEDRA.","Pedra = insensível."],["Aquela notícia foi um BALDE de água fria.","Balde de água fria = decepção."],
      ["Ela é a ESTRELA do time.","Estrela = destaque."],["Estou num MAR de dívidas.","Mar = grande quantidade."],
      ["O professor deu uma AULA de paciência.","Aula = demonstração."],["Ele está com a CABEÇA nas nuvens.","Distraído."],["A cidade é uma SELVA de pedra.","Selva = lugar hostil e confuso."]
    ],
    erradas:[
      ["A PEDRA rolou morro abaixo.","Pedra no sentido literal: mineral."],["Encheu o BALDE de água para lavar o carro.","Recipiente literal."],
      ["A ESTRELA mais próxima da Terra é o Sol.","Astro: sentido literal."],["O MAR estava agitado em Garopaba.","Mar literal."],
      ["A AULA de Física começa às 8h.","Aula literal."],["Bateu a CABEÇA na porta do armário.","Parte do corpo."],["A onça vive na SELVA amazônica.","Floresta literal."]
    ]});

  port({id:"port-ortografia", topico:"Ortografia e acentuação", tipo:"julgar",
    p1:"Em qual alternativa TODAS as palavras estão escritas corretamente?",
    p2:"Em qual alternativa há palavra escrita de forma ERRADA?",
    certas:[
      ["exceção, analisar, empecilho","Exceção (com xc), analisar (com s), empecilho (com e)."],
      ["ideia, heroico, voo","Pelo Acordo Ortográfico, “ideia” e “heroico” perderam o acento; “voo” perdeu o circunflexo."],
      ["privilégio, beneficente, cabeleireiro","Privilégio (pri-), beneficente (sem i extra), cabeleireiro (cabeleir-eiro)."],
      ["lâmpada, fácil, também","Proparoxítona, paroxítona em L e oxítona em EM: todas acentuadas."],
      ["paralisar, pesquisar, atrás","Paralisar e pesquisar com S (vêm de paralisia e pesquisa); atrás com S."],
      ["linguiça, frequente, tranquilo","Sem trema desde 2009."],
      ["chuchu, enxergar, xícara","Chuchu com CH; enxergar e xícara com X."],
      ["concessão, ascensão, obsessão","Grafias com ss, sc e ss — todas corretas."],
      ["mortadela, mendigo, prazeroso","Mortadela, mendigo (sem n antes do d) e prazeroso (não “prazeiroso”)."]
    ],
    erradas:[
      ["excessão, analizar, impecilho","O certo é exceção, analisar, empecilho."],
      ["idéia, heróico, vôo","Depois do Acordo: ideia, heroico, voo."],
      ["previlégio, beneficiente, cabelereiro","O certo é privilégio, beneficente, cabeleireiro."],
      ["lampada, facil, tambem","Faltam os acentos: lâmpada, fácil, também."],
      ["paralizar, pesquizar, atraz","O certo é paralisar, pesquisar, atrás."],
      ["lingüiça, freqüente, tranqüilo","O trema foi abolido em 2009."],
      ["xuxu, enchergar, chícara","O certo é chuchu, enxergar, xícara."],
      ["conceção, acenção, obseção","O certo é concessão, ascensão, obsessão."],
      ["mortandela, mendingo, prazeiroso","O certo é mortadela, mendigo, prazeroso."]
    ]});

  port({id:"port-pontuacao", topico:"Pontuação", tipo:"julgar",
    p1:"Qual frase está pontuada de acordo com a norma-padrão?",
    p2:"Qual frase tem ERRO de pontuação?",
    certas:[
      ["Os alunos do terceiro ano viajaram para Blumenau.","Sujeito longo, mas sem vírgula antes do verbo."],
      ["Pedro, traga o caderno amanhã.","Vírgula isolando o vocativo."],
      ["Florianópolis, capital de Santa Catarina, recebe muitos turistas.","Aposto entre vírgulas."],
      ["Quando a chuva parou, saímos de casa.","Oração subordinada antes da principal: vírgula."],
      ["Estudou bastante, mas não conseguiu a vaga.","Vírgula antes de “mas”."],
      ["Comprei arroz, feijão, ovos e leite.","Vírgula separando itens de uma enumeração; antes do “e” final, não."],
      ["No inverno, a serra catarinense recebe neve.","Adjunto adverbial deslocado para o início, isolado por vírgula."]
    ],
    erradas:[
      ["Os alunos do terceiro ano, viajaram para Blumenau.","Vírgula separando sujeito e verbo."],
      ["Pedro traga o caderno amanhã.","Falta a vírgula do vocativo: Pedro, traga…"],
      ["Florianópolis capital de Santa Catarina, recebe muitos turistas.","O aposto precisa de vírgula dos dois lados."],
      ["A professora entregou, as provas aos alunos.","Vírgula separando o verbo do complemento."],
      ["Comprei, arroz, feijão, ovos e leite.","Vírgula entre o verbo e o complemento."],
      ["O diretor da escola, anunciou as férias.","Vírgula entre sujeito e verbo."],
      ["Estudou bastante mas, não conseguiu a vaga.","A vírgula vem ANTES do “mas”, não depois."]
    ]});
})();
