import { GAME_CONFIG } from '../config.js';

const freeze = (value = []) => Object.freeze([...value]);

const PHASE_INTENTS = Object.freeze({
  '01':'Alguém deixou esta máquina esperando por você.',
  '02':'Encontre o que não pertence a este sistema.',
  '03':'Agora é hora de ouvir a máquina ao lado.',
  '04':'O sinal não está tentando formar uma voz.',
  '05':'A palavra anterior também existe dentro do computador.',
  '06':'Descubra o que nenhuma das duas versões conseguiu apagar.',
  '07':'O nome mente; o momento em que foi tocado, não.',
  '08':'O arquivo perdeu o cabeçalho, mas não perdeu tudo.',
  '09':'A palavra recuperada aponta para algo fora da tela.',
  '10':'Esse arquivo já mudou uma vez.',
  '11':'As duas fontes discordam, mas deixaram o mesmo rastro.',
  '12':'O telefone guardou uma versão diferente.',
  '13':'O Receiver também mudou enquanto você estava fora.',
  '14':'Essa fotografia não foi feita para ser bonita.',
  '15':'Tem alguma coisa errada com o horário.',
  '16':'A resposta está onde a noite deixa as coisas ao alcance.',
  '17':'Três pistas antigas descrevem a mesma fonte.',
  '18':'A margem não possui nome até as lembranças se encostarem.',
  '19':'Algumas memórias só existem quando as duas versões se ligam.',
  '20':'Há um espaço inteiro ausente entre relações conhecidas.',
  '21':'Noventa e nove por cento não encerra uma investigação.',
  '22':'As histórias continuam guardando uma coisa abaixo delas.',
  '23':'Volte para a máquina. O primeiro horário ainda está lá.',
  '24':'As duas cadeias finalmente podem ocupar a mesma linha.',
  '25':'As classificações já cumpriram seu papel.'
});

const PHASE_HINTS = Object.freeze({
  '01':['A estação ainda não está pedindo investigação.','Procure o único controle da tela de espera.','Inicie o sistema para chegar ao desktop.','Pressione INICIAR SISTEMA.'],
  '02':['O elemento estranho está dentro da instalação, não nos documentos pessoais.','Abra Meu computador e examine SISTEMA.','Entre em REGISTROS e compare a origem dos índices.','Abra REG_101000.idx e use ISOLAR REGISTRO.'],
  '03':['Ruído também informa quando muda de comportamento.','Percorra os canais com o controle físico do Receiver.','Procure um canal cuja tela não permaneça em estática comum.','Ligue o aparelho e sintonize o canal 04.'],
  '04':['A transmissão descreve letras sem usar voz.','Observe a alternância entre pulsos curtos e longos.','Registre ponto e traço e consulte Morse.','-- . ... .- forma MESA.'],
  '05':['A palavra recuperada nomeia algo dentro do PC.','No desktop, abra MOUNT.exe.','Leia a data da montagem sem dispositivo e use DDMMYY.','17/04/91 vira 170491.'],
  '06':['As diferenças são ruído; procure o que resistiu.','Compare cada linha da versão A com a mesma linha da B.','Selecione somente os três pares idênticos.','Extraia A DATA / ABRE / O ARQUIVO.'],
  '07':['Os nomes foram feitos para parecer convincentes.','Abra DIRETORIO_J e compare a coluna MODIFICADO.','Use 10:10 como critério, não a palavra “final”.','Abra final_agora_vai.txt, modificado às 10:10.'],
  '08':['Os espaços já separam unidades completas.','Abra DUMP_24.exe e trate cada bloco como um byte.','Converta os três bytes para caracteres ASCII.','01001100 01010101 01000001 forma LUA.'],
  '09':['A resposta anterior é um objeto próximo, não outro arquivo.','Procure no quarto uma lua que possa guardar uma marca.','Examine a borda acessível do pano com lua.','Registre VX-04.'],
  '10':['Não procure um novo arquivo.','Volte ao caminho usado na primeira investigação do PC.','Abra SISTEMA / REGISTROS / REG_101000.idx.','Leia as linhas novas e use PROCESSAR ALTERAÇÃO.'],
  '11':['Relatos podem mentir; propriedades geométricas não.','Cruze as duas fontes e descarte opiniões repetidas.','Selecione quatro camadas que descrevam forma e comprimento.','Use VOLUME, LATERAIS, COMPRIMENTO e SILHUETA; depois CALCULAR GEOMETRIA.'],
  '12':['A reconstrução já terminou; agora procure uma lembrança.','Desbloqueie o celular e abra Mensagens.','Entre na conversa de J. e consulte o anexo antigo.','Em IMG_2019_MULLET.jpg, use ANEXAR METADATA AO ARQUIVO.'],
  '13':['A ausência de sinal pode deixar uma presença física.','No Receiver, procure o canal vazio que mudou desde a visita anterior.','Deixe o canal 11 ativo e então desligue o aparelho.','Sintonize 11 e use DESLIGAR para revelar FIM · 01 · COMEÇO.'],
  '14':['A fotografia é o espaço de investigação, não apenas uma ilustração.','No BOOKSCAN, amplie a primeira estante e procure títulos que significam FIM e COMEÇO.','Marque diretamente as duas lombadas adjacentes e correlacione as marcas.','É Assim que Acaba + É Assim que Começa fornecem 03:__ e __:17: retorne com 03:17.'],
  '15':['O horário recuperado deve alterar o ambiente, não ser digitado em um formulário.','Use o relógio da barra inferior do PC.','Abra DATA / HORA, ajuste horas e minutos e aplique.','Defina 03:17; o sistema revelará 0317.REC.'],
  '16':['A instrução fala de alcance noturno, não da superfície onde se dorme.','Pense no móvel que continua próximo depois de deitar.','Examine a mesa de cabeceira e procure a marca preparada.','Registre VX-11 encontrado na mesa de cabeceira.'],
  '17':['As pistas antigas descrevem uma fonte antes de descrever números.','Autentique primeiro o NÓ das cadeiras verdes.','Depois use EVENTO_1010 nos controles grandes e procure o pico do ajuste fino.','CAN 10 · NÍVEL 10 · AJUSTE FINO +3.'],
  '18':['O nome do lugar está distribuído entre lembranças espaciais.','Autentique NODE_17 e selecione todos os fragmentos coerentes.','Ligue as marcas na ordem apresentada e leia o contorno.','A resposta formada é PARQUINHO DA BEIRA-MAR.'],
  '19':['Cada lembrança possui uma origem e uma consequência.','Procure três pares que falam do mesmo acontecimento.','Selecione dois registros por vez para criar cada vínculo.','Ligue evento/conversa, foto/mullet e margem/parquinho.'],
  '20':['A planta é verificada por relações, não por decoração exata.','Posicione repouso, armazenamento, trabalho, apoio e observador em suas âncoras.','Complete todas as relações e valide o modelo; depois siga a origem física.','A diferença de +11,2 m² leva ao Cômodo Zero e ao NODE_00.'],
  '21':['Uma conclusão incompleta é uma nova evidência.','Abra INTEGRIDADE.exe no mesmo computador.','Execute o encerramento e observe qual relação permanece sem âncora.','Use TESTAR ENCERRAMENTO e depois VOLTAR AO ARQUIVO.'],
  '22':['“Histórias” nomeia um lugar físico de armazenamento.','Procure abaixo da estante, não dentro de um livro.','Autentique o NODE_11 pelo código completo encontrado no QR.','Insira VX-LIVROS-0214.'],
  '23':['03:17 revelou; agora o sistema pede a origem.','O evento central repete a hora no nome e na primeira linha.','Abra novamente DATA / HORA pela taskbar.','Restaure 10:10 e aplique para sincronizar RECUPERAR.exe.'],
  '24':['As duas cadeias devem manter identidade e ordem.','Abra RECUPERAR_FINAL.exe e leia os resultados 520 e 1314.','A operação indicada é concatenar, não somar.','Digite 5201314.'],
  '25':[]
});

const WORLD_BY_FAMILY = Object.freeze({ computer:'computer', device:'tv', phone:'phone', archive:'document', forensic:'document', reconstruction:'reconstruction', final:'final' });
const CALLBACKS_BY_PHASE = Object.freeze({
  '05':['signal:mesa'], '07':['event:1010'], '09':['binary:lua'], '10':['file:event-1010'],
  '12':['forensic:hair-geometry'], '13':['tv:channel-04'], '14':['tv:afterimage'], '15':['books:0317'],
  '17':['event:1010','node:green'], '19':['event:two-sources','memory:mullet','location:margin'],
  '20':['room:relations'], '21':['room:unanchored-tv'], '23':['clock:0317','event:1010'], '24':['chain:520','chain:1314']
});

function definePuzzle(definition) {
  const puzzle = {
    area: 'desktop', controller: 'system', prerequisites: [], discoveries: [], hints: [],
    archiveEffects: [], mutations: [], callbacks: [], physicalEffect: null, audioCue: 'ui.contact', motionCue: 'low',
    next: [], solution: null, ui: {}, keyboardPath: true, ...definition
  };
  puzzle.world = definition.world || WORLD_BY_FAMILY[puzzle.family] || 'computer';
  puzzle.environment = definition.environment || puzzle.family || puzzle.world;
  puzzle.intent = definition.intent || PHASE_INTENTS[puzzle.id] || puzzle.objective;
  puzzle.mutations = freeze(puzzle.mutations);
  puzzle.callbacks = freeze(CALLBACKS_BY_PHASE[puzzle.id] || puzzle.callbacks);
  puzzle.corruption = Number.isFinite(puzzle.corruption) ? puzzle.corruption : Math.max(0, Math.min(5, puzzle.act - 1));
  puzzle.kind = puzzle.renderer;
  puzzle.requirements = freeze(puzzle.prerequisites);
  puzzle.evidence = freeze(puzzle.discoveries);
  puzzle.hints = freeze(PHASE_HINTS[puzzle.id] || puzzle.hints);
  puzzle.next = freeze(puzzle.next);
  puzzle.contract = Object.freeze({
    id: puzzle.id, act: puzzle.act, family: puzzle.family, world: puzzle.world, environment: puzzle.environment, intent: puzzle.intent,
    narrative: puzzle.narrative, objective: puzzle.objective,
    interaction: puzzle.interaction, successMeaning: puzzle.successMeaning,
    prerequisites: puzzle.requirements, discoveries: puzzle.evidence, hints: puzzle.hints,
    renderer: puzzle.renderer, controller: puzzle.controller,
    archiveEffects: freeze(puzzle.archiveEffects), mutations: puzzle.mutations, callbacks: puzzle.callbacks, physicalEffect: puzzle.physicalEffect,
    audioCue: puzzle.audioCue, motionCue: puzzle.motionCue,
    accessibility: Object.freeze({ reducedMotion: true, audioIndependent: true, keyboardPath: puzzle.keyboardPath })
  });
  return Object.freeze(puzzle);
}

const P = definePuzzle;

export const PUZZLES = Object.freeze([
  P({ id:'01', act:1, family:'computer', area:'desktop', code:'ESTACAO_R', title:'computador deixado ligado', renderer:'boot', integrity:0, next:['02'],
    narrative:'Um computador gráfico antigo foi deixado ligado para uma única leitora.', objective:'Iniciar a estação e observar o ambiente deixado para você.', interaction:'acionar a inicialização manual', successMeaning:'A estação gráfica fica disponível para investigação.', motionCue:'boot-sequence',
    ui:{ status:(s)=>s.flags.initialized?'DESKTOP DISPONÍVEL':'SISTEMA EM ESPERA' } }),
  P({ id:'02', act:1, family:'computer', area:'files', code:'INDICE_LOCAL', title:'índice de inicialização', renderer:'logs', integrity:4, next:['03'], controller:'archive', prerequisites:['01'], discoveries:['evento-1010'], archiveEffects:['evento-1010:v1'],
    mutations:[{id:'event-index',when:{flag:'event1010Seen'},notice:'REGISTRO EXTERNO INDEXADO'}],
    narrative:'O computador parece usado: há manutenção, backups e um registro temporal fora da rotina.', objective:'Localizar o registro que não pertence à sequência operacional.', interaction:'inspecionar logs e metadados', successMeaning:'EVENTO_1010 passa a existir no histórico pesquisável.',
    ui:{status:(s)=>s.flags.event1010Seen?'EVENTO_1010 INDEXADO':'6 LOGS // 1 ANOMALIA'} }),
  P({ id:'03', act:1, family:'device', area:'receiver', code:'RECEPTOR_VX', title:'portadora não identificada', renderer:'tv-intro', integrity:7, next:['04'], controller:'receiver', prerequisites:['02'], discoveries:['receiver-04'], audioCue:'receiver.static', motionCue:'receiver-channel-lock',
    mutations:[{id:'receiver',when:{unlocked:'03'},icons:['receiver-app']}],
    narrative:'Um periférico sem fabricante responde a uma faixa que o computador não cataloga.', objective:'Encontrar a portadora que não produz apenas estática.', interaction:'varrer os canais do Receiver', successMeaning:'Uma transmissão específica é isolada.',
    ui:{status:(s)=>`RECEPTOR ${s.tv.power?'ATIVO':'DESLIGADO'} // CAN ${String(s.tv.channel).padStart(2,'0')}`} }),
  P({ id:'04', act:1, family:'device', area:'receiver', code:'SINAL_04', title:'persistência luminosa', renderer:'morse', integrity:9, next:['05'], controller:'receiver', prerequisites:['03'], discoveries:['object-desk'],
    narrative:'A portadora não contém voz; a lâmpada repete pulsos curtos e longos.', objective:'Interpretar o objeto codificado pelo sinal.', interaction:'reproduzir, anotar e decodificar Morse', successMeaning:'MESA deixa de parecer um objeto imediato e passa a nomear uma tabela interna do computador.', solution:{accepted:['mesa','escrivaninha']}, completion:{message:'SINAL INTERPRETADO // MESA'},
    ui:{inputLabel:'Objeto escrito pelo sinal',placeholder:'nome do objeto',submitLabel:'REGISTRAR LEITURA',wrongFeedback:'O objeto não corresponde aos pulsos.'} }),
  P({ id:'05', act:1, family:'computer', area:'files', code:'MOUNT_TABLE', title:'propriedades de uma unidade antiga', renderer:'file-properties', integrity:12, next:['06'], controller:'archive', prerequisites:['04'], discoveries:['archive-170491'],
    mutations:[{id:'mount-table',when:{unlocked:'05'},icons:['mount-app'],phaseApp:'mount-app'}],
    narrative:'MESA também aparece na tabela de montagem da unidade. Uma entrada antiga não possui dispositivo correspondente.', objective:'Inspecionar as propriedades da montagem órfã e recuperar seu índice.', interaction:'comparar unidade, data de criação e endereço', successMeaning:'ARCHIVE_170491 passa a ligar informação antiga a um contexto ainda desconhecido.', solution:{accepted:['170491','17 04 91','17/04/91']}, completion:{message:'MONTAGEM ÓRFÃ INDEXADA // 170491'},
    ui:{inputLabel:'Índice da montagem órfã',placeholder:'seis dígitos',submitLabel:'MONTAR UNIDADE',format:/^[\d\s/.-]{6,10}$/,formatHint:'Use dia, mês e ano na ordem exibida.',wrongFeedback:'Esse índice não corresponde à montagem órfã.'} }),
  P({ id:'06', act:2, family:'archive', area:'documents', code:'DOC_1708', title:'duas versões do mesmo relatório', renderer:'document', integrity:15, next:['07'], controller:'archive', prerequisites:['05'], discoveries:['document-invariant'], archiveEffects:['documento-06'], motionCue:'memory-reconstruction',
    narrative:'Duas cópias discordam em quase tudo. Três trechos sobreviveram idênticos.', objective:'Extrair as linhas invariantes das versões A e B.', interaction:'comparar o mesmo índice nas duas versões', successMeaning:'Uma instrução apagada volta a ser legível.', completion:{message:'INSTRUÇÃO RECUPERADA // A DATA ABRE O ARQUIVO',motion:'document'}, ui:{status:(s)=>`${s.documentFragments.length} / 3 INVARIANTES`,wrongFeedback:'Esse trecho foi alterado.'} }),
  P({ id:'07', act:2, family:'computer', area:'files', code:'DIRETORIO_J', title:'versões incompatíveis', renderer:'files', integrity:19, next:['08'], controller:'archive', prerequisites:['06'], discoveries:['file-1010'],
    mutations:[{id:'directory-tools',when:{unlocked:'07'},icons:['directory-app'],phaseApp:'directory-app'}],
    narrative:'Uma pasta banal contém cinco arquivos chamados “final”. Os nomes mentem; o horário deixa rastro.', objective:'Encontrar a versão tocada no momento do evento.', interaction:'abrir arquivos e comparar propriedades', successMeaning:'A cópia legítima é separada das iscas.', ui:{status:()=> '5 VERSÕES // 4 ISCAS'} }),
  P({ id:'08', act:2, family:'computer', area:'files', code:'PACOTE_8BIT', title:'fragmentos sem cabeçalho', renderer:'binary', integrity:23, next:['09'], prerequisites:['07'], discoveries:['object-moon'],
    mutations:[{id:'dump-reader',when:{unlocked:'08'},icons:['dump-app'],phaseApp:'dump-app'}],
    narrative:'A versão correta guarda 24 bits já separados em três blocos.', objective:'Converter os blocos em um objeto.', interaction:'ler três bytes como caracteres', successMeaning:'Um objeto conhecido ganha função investigativa.', solution:{accepted:['lua']}, completion:{message:'OBJETO RECUPERADO // LUA'}, ui:{inputLabel:'Palavra formada pelos três bytes',placeholder:'objeto recuperado',submitLabel:'INDEXAR OBJETO',wrongFeedback:'Os bytes não formam esse objeto.'} }),
  P({ id:'09', act:2, family:'reconstruction', world:'physical', area:'images', code:'OBJETO_L01', title:'referência material', renderer:'moon-one', integrity:26, next:['10'], controller:'nodes', prerequisites:['08'], discoveries:['vx-04-moon'], physicalEffect:'moon',
    mutations:[{id:'analyzer',when:{unlocked:'09'},icons:['analyzer-app']}],
    narrative:'LUA não é outra senha: é uma referência a algo que já está no quarto.', objective:'Localizar a primeira marca do objeto.', interaction:'consultar o visualizador e examinar o objeto físico', successMeaning:'VX-04 ganha uma origem material.', solution:{accepted:['vx 04','vx04']}, completion:{message:'CAMADA VX-04 RECUPERADA',effects:['moonFirstFound']}, ui:{inputLabel:'Marca encontrada no objeto',placeholder:'identificador físico',submitLabel:'ANEXAR MARCA',wrongFeedback:'Essa não é a primeira camada do objeto.'} }),
  P({ id:'10', act:2, family:'computer', area:'archive', code:'SOMA_DIVERGENTE', title:'um arquivo conhecido mudou', renderer:'return-event', integrity:31, next:['11'], controller:'archive', prerequisites:['09','02'], discoveries:['shared-event'], archiveEffects:['evento-1010:v2'],
    mutations:[{id:'event-rewrite',when:{unlocked:'10'},wallpaper:'alert',notice:'1 ARQUIVO CONHECIDO FOI ALTERADO'}],
    narrative:'EVENTO_1010 não corresponde mais à primeira leitura.', objective:'Voltar ao mesmo índice no PC e processar suas novas linhas.', interaction:'abrir Meu computador / SISTEMA / REGISTROS e reler REG_101000.idx', successMeaning:'O arquivo revela que havia duas fontes no evento.', ui:{status:(s)=>s.flags.eventChanged?'VERSÃO 02 PROCESSADA':'REGISTRO CONHECIDO ALTERADO'} }),
  P({ id:'11', act:3, family:'forensic', area:'evidence', code:'CONFLITO_MEMORIA', title:'divergência entre fontes', renderer:'conflict', integrity:35, next:['12'], controller:'forensic', prerequisites:['10'], discoveries:['hair-geometry'], motionCue:'memory-reconstruction',
    narrative:'Duas versões da mesma lembrança discordam. A geometria não depende do relato.', objective:'Cruzar camadas suficientes para reconstruir a forma.', interaction:'selecionar evidências e calcular o modelo', successMeaning:'Uma memória deixa de depender de uma única voz.', ui:{status:(s)=>`${s.forensicSelections.length} / 4 CAMADAS NECESSÁRIAS`} }),
  P({ id:'12', act:3, family:'phone', area:'messages', code:'MEMORIA_2019', title:'uma fotografia antiga', renderer:'phone-memory', integrity:39, next:['13'], controller:'phone', prerequisites:['11'], discoveries:['memory-mullet'],
    narrative:'A reconstrução técnica encontra uma fotografia e uma conversa antiga no celular preparado.', objective:'Abrir a conversa de J., localizar IMG_2019 e anexar sua metadata.', interaction:'desbloquear o celular, abrir Mensagens e consultar o anexo', successMeaning:'MULLET deixa de ser uma adivinhação e vira detalhe de uma memória compartilhada.', solution:{accepted:[GAME_CONFIG.memoryAnswer,...GAME_CONFIG.memoryAliases]}, completion:{message:'MEMÓRIA ANEXADA // IMG_2019_MULLET',effects:['mulletConfirmed']}, ui:{wrongFeedback:'Essa evidência não corresponde à reconstrução.'} }),
  P({ id:'13', act:3, family:'device', area:'receiver', code:'RECEPTOR_VX', title:'imagem residual', renderer:'tv-sequence', integrity:43, next:['14'], controller:'receiver', prerequisites:['12','03'], discoveries:['receiver-afterimage'], motionCue:'tv-afterimage',
    narrative:'O Receiver mudou enquanto estava fora de uso.', objective:'Descobrir o que permanece depois que a portadora some.', interaction:'operar canal e power', successMeaning:'FIM · 01 · COMEÇO fica gravado no fósforo como relação, não senha.', ui:{status:(s)=>s.flags.tvChannel11Primed?'CANAL 11 // PORTADORA AUSENTE':`CAN ${String(s.tv.channel).padStart(2,'0')}`} }),
  P({ id:'14', act:3, family:'computer', area:'images', code:'BOOKSCAN_END01START', title:'captura degradada da estante', renderer:'books', integrity:47, next:['15'], prerequisites:['13'], discoveries:['book-time'], physicalEffect:'books',
    mutations:[{id:'bookscan',when:{unlocked:'14'},icons:['bookscan-app'],phaseApp:'bookscan-app',notice:'2 CAPTURAS DE ESTANTE RECUPERADAS'}],
    narrative:'Duas fotografias reais da estante e um log descrevem extremidades separadas por um único volume.', objective:'Identificar o par FIM/COMEÇO, consultar os livros físicos e retornar com o timestamp.', interaction:'abrir BOOKSCAN.exe, correlacionar títulos adjacentes e reunir os dois insertos', successMeaning:'03:17 nasce de uma cadeia entre captura, log, estante física e retorno ao PC.', solution:{accepted:['03:17','0317','03 17']}, completion:{message:'BOOKSCAN INDEXADO // 03:17',effects:['booksFound']}, ui:{inputLabel:'Timestamp encontrado nos dois insertos',placeholder:'00:00',submitLabel:'RETORNAR AO BOOKSCAN',format:/^\d{2}[:\s]?\d{2}$/,formatHint:'Use quatro dígitos, com ou sem dois-pontos.',wrongFeedback:'Os fragmentos físicos não formam esse horário.'} }),
  P({ id:'15', act:3, family:'computer', area:'desktop', code:'CLOCK_CAL', title:'relógio de sistema', renderer:'clock-calibration', integrity:51, next:['16'], prerequisites:['14'], discoveries:['night-instruction'],
    mutations:[{id:'clock-calibration',when:{unlocked:'15'},clockMode:'calibrate'}],
    narrative:'O BOOKSCAN recuperou uma hora. A barra da estação agora aceita calibração manual.', objective:'Ajustar o relógio do PC para a hora extraída dos livros.', interaction:'abrir o relógio da barra, ajustar e aplicar', successMeaning:'O sistema revela uma instrução que só existe em 03:17.', ui:{status:(s)=>`RELÓGIO // ${String(s.desktopOs.clockHour).padStart(2,'0')}:${String(s.desktopOs.clockMinute).padStart(2,'0')}`} }),
  P({ id:'16', act:3, family:'reconstruction', world:'physical', area:'files', code:'NODE_NOTURNO', title:'proximidade sem coordenada', renderer:'bedside', integrity:55, next:['17'], controller:'nodes', prerequisites:['15'], discoveries:['vx-11-receiver'], physicalEffect:'bedside',
    narrative:'A instrução aponta para o móvel que permanece ao alcance depois de deitar.', objective:'Encontrar e registrar a marca noturna.', interaction:'interpretar a relação e consultar o ambiente', successMeaning:'VX-11 liga o quarto ao Receiver.', solution:{accepted:['vx 11','vx11','receptor','tv','televisao']}, completion:{message:'MARCA VX-11 CONFIRMADA',effects:['bedsideFound']}, ui:{inputLabel:'Marca encontrada perto da cama',placeholder:'identificador',submitLabel:'VINCULAR',wrongFeedback:'Essa marca não estava no lugar descrito.'} }),
  P({ id:'17', act:3, family:'device', area:'receiver', code:'FONTE_CROMATICA', title:'o verde que restou', renderer:'tv-tuning', integrity:59, next:['18'], controller:'receiver', prerequisites:['16','evento-1010'], discoveries:['node-14','carrier-1010'], physicalEffect:'green',
    narrative:'ASSENTO, EXTERNO e VERDE vieram de sistemas diferentes e descrevem a mesma fonte.', objective:'Vincular NODE_14 e estabilizar a portadora em seu pico.', interaction:'autenticar a fonte e operar canal, volume e ajuste fino', successMeaning:'Uma fonte externa passa a controlar o Receiver.', ui:{status:(s)=>s.flags.greenNodeValidated?`FONTE // ${s.tv.channel}:${s.tv.volume} · FINO ${s.tv.fine>0?'+':''}${s.tv.fine}`:'FONTE EXTERNA NÃO VINCULADA'} }),
  P({ id:'18', act:4, family:'forensic', area:'evidence', code:'MARGEM_EXTERNA', title:'contorno sem nome', renderer:'location', integrity:64, next:['19'], controller:'forensic', prerequisites:['17'], discoveries:['node-17','location-park'], physicalEffect:'yard',
    narrative:'A fonte verde abriu uma trilha curta até uma margem privada da casa.', objective:'Autenticar NODE_17 e reconstruir o lugar pelas evidências.', interaction:'seguir marcas, retornar e cruzar fragmentos espaciais', successMeaning:'O exterior ganha uma posição verificável.', solution:{accepted:[GAME_CONFIG.locationAnswer,...GAME_CONFIG.locationAliases]}, completion:{message:'LOCAL RECUPERADO // PARQUINHO DA BEIRA-MAR',motion:'location',effects:['locationRecovered']}, ui:{inputLabel:'Lugar formado pelas evidências',placeholder:'nome do local',submitLabel:'CONFIRMAR CONTORNO',wrongFeedback:'As evidências não formam esse lugar.'} }),
  P({ id:'19', act:4, family:'forensic', area:'evidence', code:'TESTE_ENTIDADE', title:'vínculos de memória', renderer:'identity', integrity:69, next:['20'], controller:'forensic', prerequisites:['18','12','10'], discoveries:['shared-memory'],
    narrative:'Registros separados contam os dois lados das mesmas lembranças.', objective:'Ligar cada origem à consequência correspondente.', interaction:'selecionar dois registros por vez', successMeaning:'ENTIDADE B deixa de ser tratada como desconhecida.', ui:{status:(s)=>`${Math.floor(s.relationLinks.length/2)} / 3 VÍNCULOS`} }),
  P({ id:'20', act:4, family:'reconstruction', area:'reconstruction', code:'PLANTA_INCOMPLETA', title:'Cômodo Zero', renderer:'room', integrity:74, next:['21'], controller:'reconstruction', prerequisites:['19'], discoveries:['house-match','node-00','reading-0317'], physicalEffect:'room',
    mutations:[{id:'reconstruction',when:{unlocked:'20'},icons:['recovery-app']}],
    narrative:'A casa fecha quase toda. Repouso, armazenamento e abertura descrevem um cômodo ausente do índice.', objective:'Reconstruir relações, localizar o volume ausente e anexar NODE_00.', interaction:'arrastar ou selecionar objeto + destino; depois visitar a origem', successMeaning:'Uma leitura impossível de 03:17 entra no sistema.', ui:{status:(s)=>s.flags.roomNodeValidated?'NODE_00 // LEITURA ANTERIOR 03:17':s.flags.houseAnomalyRevealed?'VOLUME AUSENTE // ACESSO FÍSICO':`${Object.values(s.room).filter((v)=>v?.moved).length} OBJETOS POSICIONADOS`} }),
  P({ id:'21', act:4, family:'computer', area:'desktop', code:'INTEGRIDADE_99', title:'encerramento incompleto', renderer:'impossible', integrity:99, next:['22'], prerequisites:['20'], discoveries:['system-object-tv'], motionCue:'system-signal-loss',
    mutations:[{id:'false-close',when:{unlocked:'21'},icons:['truth-app'],phaseApp:'truth-app',wallpaper:'unstable'}],
    narrative:'O sistema declara conclusão sem explicar a terceira fonte nem o Cômodo Zero.', objective:'Testar e recusar o encerramento de 99%.', interaction:'executar o fechamento e observar a inconsistência', successMeaning:'O canal escondido atrás do falso final é liberado.', ui:{status:(s)=>s.flags.fakeFinalSeen?'FALSO FINAL ROMPIDO':'ENCERRAMENTO DISPONÍVEL'} }),
  P({ id:'22', act:4, family:'reconstruction', world:'physical', area:'files', code:'NODE_11', title:'histórias suspensas', renderer:'books-node', integrity:84, next:['23'], controller:'nodes', prerequisites:['21'], discoveries:['node-11','audio-header'], physicalEffect:'books',
    narrative:'O falso final revela um cabeçalho de áudio e aponta para onde histórias são armazenadas.', objective:'Autenticar o NODE sob a estante.', interaction:'consultar o cabeçalho e retornar com a assinatura', successMeaning:'Os livros digitais e físicos passam a compartilhar índice.', solution:{accepted:[GAME_CONFIG.booksNodeCode]}, completion:{message:'NODE_11 AUTENTICADO',effects:['booksNodeValidated']}, ui:{inputLabel:'Assinatura encontrada sob a estante',placeholder:'VX-LIVROS-0000',submitLabel:'AUTENTICAR',wrongFeedback:'A assinatura não pertence ao NODE_11.'} }),
  P({ id:'23', act:5, family:'computer', area:'desktop', code:'CLOCK_ORIGIN', title:'hora original do evento', renderer:'clock-origin', integrity:91, next:['24'], prerequisites:['22','20'], discoveries:['time-origin'],
    mutations:[{id:'clock-origin',when:{unlocked:'23'},clockMode:'restore',wallpaper:'origin'}],
    narrative:'A calibração de 03:17 abriu o sistema, mas o evento central possui outra hora original registrada desde o início.', objective:'Restaurar no relógio a hora exata de EVENTO_1010.', interaction:'revisitar o registro conhecido e corrigir a hora da barra', successMeaning:'O sistema reconhece a origem temporal e libera as cadeias finais.', ui:{status:(s)=>`ORIGEM ESPERADA // EVENTO_1010 · ATUAL ${String(s.desktopOs.clockHour).padStart(2,'0')}:${String(s.desktopOs.clockMinute).padStart(2,'0')}`} }),
  P({ id:'24', act:5, family:'computer', area:'evidence', code:'CHAVE_COMPOSTA', title:'dois fragmentos de dados', renderer:'meta', integrity:99, next:['25'], controller:'forensic', prerequisites:['23'], discoveries:['fragment-520','fragment-1314','relation-us'],
    mutations:[{id:'final-tool',when:{flag:'clockOriginRestored'},icons:['final-recovery-app'],phaseApp:'final-recovery-app',notice:'RECUPERAR.exe FOI REESCRITO'}],
    narrative:'Duas cadeias independentes terminam em 520 e 1314. Até aqui, ambos pareciam apenas dados.', objective:'Confirmar as cadeias e concatenar a chave final.', interaction:'revisitar evidências e inserir a chave', successMeaning:'O sistema recupera a interpretação sem exigir conhecimento externo.', solution:{accepted:['5201314']}, completion:{message:'CHAVE ACEITA // INTERPRETAÇÃO RECUPERADA',motion:'merge',effects:['finalRecovered']}, ui:{inputLabel:'Chave composta',placeholder:'sete dígitos',submitLabel:'EXECUTAR CHAVE',format:/^\d{7}$/,formatHint:'A chave possui sete dígitos sem separadores.',wrongFeedback:'A concatenação não preserva a ordem das cadeias.'} }),
  P({ id:'25', act:5, family:'final', area:'identity', code:'RECUPERACAO_COMPLETA', title:'arquivo íntegro', renderer:'final', integrity:100, prerequisites:['24'], discoveries:['event-meaning'],
    narrative:'As classificações técnicas perderam a função.', objective:'Permanecer e ler.', interaction:'conclusão narrativa', successMeaning:'EVENTO_1010 finalmente recebe significado humano.', ui:{status:()=> '10/10 // O DIA EM QUE A GENTE SE CONHECEU'} })
]);

export const PUZZLE_BY_ID = Object.freeze(Object.fromEntries(PUZZLES.map((puzzle) => [puzzle.id, puzzle])));
export const puzzleFor = (id) => PUZZLE_BY_ID[id] || PUZZLE_BY_ID['01'];
