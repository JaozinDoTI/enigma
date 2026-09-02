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

const PHASE_CUES = Object.freeze({
  '01':'HORA DE ACORDAR A MÁQUINA','02':'HORA DE ENCONTRAR O QUE NÃO PERTENCE','03':'HORA DE OUVIR','04':'HORA DE TRANSFORMAR RUÍDO EM LINGUAGEM','05':'HORA DE PROCURAR A MESA ERRADA',
  '06':'HORA DE COMPARAR DUAS VERDADES','07':'HORA DE PARAR DE CONFIAR NOS NOMES','08':'HORA DE LER O QUE SOBROU','09':'HORA DE OLHAR PARA FORA DA TELA','10':'HORA DE VOLTAR AO PRIMEIRO ARQUIVO',
  '11':'HORA DE RECONSTRUIR O QUE NÃO TEM NOME','12':'HORA DE PERGUNTAR AO TELEFONE','13':'HORA DE DESLIGAR','14':'HORA DE PROCURAR ENTRE HISTÓRIAS','15':'HORA DE MEXER NO TEMPO',
  '16':'HORA DE PROCURAR ONDE A NOITE ALCANÇA','17':'HORA DE FAZER TRÊS PISTAS CONCORDAREM','18':'HORA DE DAR NOME AO LUGAR','19':'HORA DE LIGAR MEMÓRIAS','20':'HORA DE RECONSTRUIR O QUARTO',
  '21':'HORA DE DESCONFIAR DOS 99%','22':'HORA DE OLHAR ABAIXO DAS HISTÓRIAS','23':'HORA DE DEVOLVER O TEMPO À ORIGEM','24':'HORA DE COLOCAR AS DUAS CADEIAS NA MESMA LINHA','25':'HORA DE PARAR DE CLASSIFICAR'
});

const PHASE_REVEALS = Object.freeze({
  '01':'A ESTAÇÃO QUE ESPERAVA','02':'O ARQUIVO QUE NÃO PERTENCIA','03':'A PORTADORA','04':'A MESA','05':'A UNIDADE SEM DISPOSITIVO',
  '06':'O QUE FICOU PARADO','07':'O NOME MENTE','08':'LUA','09':'A MARCA NA MATÉRIA','10':'O ARQUIVO LEMBROU',
  '11':'UM OBJETO SEM NOME','12':'CURITIBA','13':'A IMAGEM QUE FICOU','14':'O FIM PERTO DO COMEÇO','15':'03:17',
  '16':'AO ALCANCE DA NOITE','17':'A FONTE VERDE','18':'PARQUINHO DA BEIRA-MAR','19':'DUAS FONTES, UMA MEMÓRIA','20':'CÔMODO ZERO',
  '21':'O UM POR CENTO AUSENTE','22':'ABAIXO DAS HISTÓRIAS','23':'A HORA DE ORIGEM','24':'5201314','25':'RECUPERAÇÃO_1010'
});

const PHASE_HINTS = Object.freeze({
  '01':['A estação ainda não está pedindo investigação.','Procure o único controle da tela de espera.','Inicie o sistema para chegar ao desktop.','Pressione INICIAR SISTEMA.'],
  '02':['O elemento estranho está dentro da instalação, não nos documentos pessoais.','Abra Meu computador e examine SISTEMA.','Entre em REGISTROS e compare a origem dos índices.','Abra REG_101000.idx e use ISOLAR REGISTRO.'],
  '03':['Ruído também informa quando muda de comportamento.','Percorra os canais com o controle físico do Receiver.','Procure um canal cuja tela não permaneça em estática comum.','Ligue o aparelho e sintonize o canal 04.'],
  '04':['A transmissão descreve letras sem usar voz.','Observe a alternância entre pulsos curtos e longos.','Registre ponto e traço e consulte Morse.','-- . ... .- forma MESA.'],
  '05':['A palavra recuperada nomeia algo dentro do PC.','No desktop, abra MOUNT.exe.','Leia a data da montagem sem dispositivo e use DDMMYY.','17/04/91 vira 170491.'],
  '06':['As cópias estão na mesma portadora, mas fora de sintonia.','O identificador 17-08 descreve uma frequência com uma casa decimal.','Use coarse e fine até obter SIGNAL LOCK; só então compare as regiões.','Sintonize 170.8 e congele A DATA / ABRE / O ARQUIVO.'],
  '07':['A instrução recuperada contém um endereço, não um arquivo.','Abra mirror://final no VX_NET e consulte snapshots, histórico e cache.','Um metadado mente; origem e checksum precisam concordar com EVENTO_1010.','Recupere o link parcial do snapshot com origem EVENTO_1010 e checksum 1010-A.'],
  '08':['Os espaços já separam unidades completas.','Abra DUMP_24.exe e trate cada bloco como um byte.','Converta os três bytes para caracteres ASCII.','01001100 01010101 01000001 forma LUA.'],
  '09':['LUA agora é uma chave de busca local.','Cruze tecido_scan.bmp, o log do scanner e o cache da webcam.','Aumente o contraste e examine o canal de resíduo.','No canal RESÍDUO com contraste suficiente, recupere VX-04.'],
  '10':['Uma versão histórica e a cópia atual discordam.','Compare o snapshot do VX_NET com REG_101000.idx.','Abra as propriedades da versão atual e estabilize uma cópia na quarentena.','Isole a versão divergente que prova DUAS FONTES.'],
  '11':['As peças críticas pertencem a uma mesma silhueta.','Na mesa, separe os dois recortes estranhos e alinhe fotografia e contorno.','Use bordas, transparência e metadata; não procure categorias prontas.','Estabilize os seis papéis do OBJETO C e teste a composição.'],
  '12':['A mensagem aponta para uma foto cujo anexo foi removido.','Siga a referência do chat até Arquivos e depois CAM Archive.','Recupere a cópia degradada antes de anexar a metadata.','Mensagens → thumbnail em Arquivos → CAM Archive → Curitiba.'],
  '13':['A ausência de sinal pode deixar uma presença física.','No Receiver, procure o canal vazio que mudou desde a visita anterior.','Deixe o canal 11 ativo e então desligue o aparelho.','Sintonize 11 e use DESLIGAR para revelar FIM · 01 · COMEÇO.'],
  '14':['A fotografia é o espaço de investigação, não apenas uma ilustração.','No BOOKSCAN, amplie a primeira estante e procure títulos que significam FIM e COMEÇO.','Marque diretamente as duas lombadas adjacentes e correlacione as marcas.','É Assim que Acaba + É Assim que Começa fornecem 03:__ e __:17: retorne com 03:17.'],
  '15':['O horário recuperado deve alterar o ambiente, não ser digitado em um formulário.','Use o relógio da barra inferior do PC.','Abra DATA / HORA, ajuste horas e minutos e aplique.','Defina 03:17; o sistema revelará 0317.REC.'],
  '16':['A instrução fala de alcance noturno, não da superfície onde se dorme.','Pense no móvel que continua próximo depois de deitar.','Examine a mesa de cabeceira e procure a marca preparada.','Registre VX-11 encontrado na mesa de cabeceira.'],
  '17':['As pistas antigas descrevem uma fonte antes de descrever números.','Autentique primeiro o NÓ das cadeiras verdes.','Depois use EVENTO_1010 nos controles grandes e procure o pico do ajuste fino.','CAN 10 · NÍVEL 10 · AJUSTE FINO +3.'],
  '18':['Algumas bordas pertencem à mesma superfície.','Na mesa, seis dos dez fragmentos formam um mapa contínuo.','Gire e alinhe margem, caminho, banco, brinquedo, sombra e água.','Compare o núcleo montado com a fotografia do celular e nomeie PARQUINHO DA BEIRA-MAR.'],
  '19':['Uma hipótese só vale quando todas as fontes conseguem sustentá-la.','Conecte livremente documentos, imagem, data, lugar e Receiver.','Teste o modelo; o sistema informa quantidade de vínculos inconsistentes e ausentes.','Relacione evento/conversa, objeto/Curitiba, mapa/lugar e Receiver/relógio.'],
  '20':['As quatro transparências descrevem quase o mesmo espaço.','Alinhe paredes e aberturas antes de comparar mobiliário e leitura.','A divergência restante mede uma área que nenhuma planta indexa.','Alinhe as quatro camadas para revelar +11,2 m² e NODE_00.'],
  '21':['Uma conclusão incompleta é uma nova evidência.','Abra INTEGRIDADE.exe no mesmo computador.','Execute o encerramento e observe qual relação permanece sem âncora.','Use TESTAR ENCERRAMENTO e depois VOLTAR AO ARQUIVO.'],
  '22':['“Histórias” nomeia um lugar físico de armazenamento.','Procure abaixo da estante, não dentro de um livro.','Autentique o NODE_11 pelo código completo encontrado no QR.','Insira VX-LIVROS-0214.'],
  '23':['03:17 revelou; agora o sistema pede a origem.','O evento central repete a hora no nome e na primeira linha.','Abra novamente DATA / HORA pela taskbar.','Restaure 10:10 e aplique para sincronizar RECUPERAR.exe.'],
  '24':['Nenhuma superfície possui a chave inteira.','Na mesa, reúna índices do PC, quadros do Receiver, ordem dos livros e orientação de leitura.','A indicação FIM 01 COMEÇO determina ordem; a seta da mesa determina leitura contínua.','Alinhe os quatro fragmentos e registre 5201314 como uma única linha.'],
  '25':[]
});

const WORLD_BY_FAMILY = Object.freeze({ computer:'computer', device:'tv', phone:'phone', archive:'document', forensic:'document', reconstruction:'reconstruction', final:'final' });
const CALLBACKS_BY_PHASE = Object.freeze({
  '05':['signal:mesa'], '07':['event:1010'], '09':['binary:lua'], '10':['file:event-1010'],
  '12':['forensic:object-c'], '13':['tv:channel-04'], '14':['tv:afterimage'], '15':['books:0317'],
  '17':['event:1010','node:green'], '19':['event:two-sources','memory:curitiba','location:margin'],
  '20':['room:relations'], '21':['room:unanchored-tv'], '23':['clock:0317','event:1010'], '24':['chain:520','chain:1314']
});

const ENTRY_POINTS_BY_PHASE = Object.freeze({
  '02':['SISTEMA/REGISTROS/REG_101000.idx'],'03':['RECEPTOR.exe'],'04':['canal 04'],'05':['MOUNT.exe'],'06':['ARCHIVE_170491/REL_1708.A','BACKUP/REL_1708.B'],
  '07':['VX_NET.exe / mirror://final'],'08':['C:\\DOWNLOADS\\DUMP_24.bin'],'09':['ANALISADOR.exe / busca LUA'],'10':['REG_101000.idx alterado'],'11':['mesa de investigação / OBJETO C'],'12':['celular/Mensagens'],
  '13':['RECEPTOR.exe/canal 11'],'14':['BOOKSCAN.exe'],'15':['relógio da barra'],'16':['0317.REC'],'17':['Receiver + NÓ verde'],'18':['NÓ da margem'],
  '19':['modelo de fontes'],'20':['RECUPERAR.exe'],'21':['INTEGRIDADE.exe'],'22':['retorno físico à estante'],'23':['relógio da barra'],'24':['RECUPERAR_FINAL.exe'],'25':['chave aceita']
});

const BEHAVIOR_HOOKS_BY_PHASE = Object.freeze({
  '02':['repeated-file','wrong-folders'],'03':['receiver-interactions','phone-ignored'],'06':['wrong-invariant','window-reopen','snapshot'],
  '10':['backtracking','repeated-file'],'11':['object-c-open'],'12':['phone-ignored'],'17':['receiver-interactions'],'21':['early-99'],'23':['clock-return']
});

const TRANSITIONS_BY_PHASE = Object.freeze({
  '01':{mode:'DIEGETIC_ENTRY',label:'INVESTIGAR O REGISTRO ANÔMALO',motion:'desktop-awaken'},
  '02':{mode:'WORLD_HANDOFF',label:'LEVANTAR E IR AO RECEIVER',motion:'seat-computer-to-tv'},
  '03':{mode:'AUTO_CONTINUE',label:'ACOMPANHAR A PORTADORA',motion:'receiver-lock'},
  '04':{mode:'WORLD_HANDOFF',label:'VOLTAR À MESA DO COMPUTADOR',motion:'seat-tv-to-computer'},
  '05':{mode:'DIEGETIC_ENTRY',label:'ABRIR A UNIDADE MONTADA',motion:'archive-mounted'},
  '06':{mode:'WORLD_HANDOFF',label:'FECHAR O COMPARADOR E VOLTAR AO PC',motion:'document-to-computer'},
  '07':{mode:'DIEGETIC_ENTRY',label:'ABRIR O PACOTE RECUPERADO',motion:'desktop-awaken'},
  '08':{mode:'DIEGETIC_ENTRY',label:'USAR LUA COMO CHAVE DE BUSCA',motion:'desktop-awaken'},
  '09':{mode:'DIEGETIC_ENTRY',label:'REABRIR O REGISTRO ALTERADO',motion:'desktop-awaken'},
  '10':{mode:'DIEGETIC_ENTRY',label:'ABRIR O MODELO FORENSE',motion:'computer-to-evidence'},
  '11':{mode:'WORLD_HANDOFF',label:'PEGAR O CELULAR',motion:'evidence-to-phone'},
  '12':{mode:'WORLD_HANDOFF',label:'ABAIXAR O CELULAR E IR AO RECEIVER',motion:'phone-to-tv'},
  '13':{mode:'WORLD_HANDOFF',label:'VOLTAR AO PC E ABRIR O BOOKSCAN',motion:'seat-tv-to-computer'},
  '14':{mode:'DIEGETIC_ENTRY',label:'ABRIR DATA E HORA DO SISTEMA',motion:'desktop-awaken'},
  '15':{mode:'PHYSICAL_HANDOFF',label:'PROCURAR AO ALCANCE DA NOITE',motion:'screen-to-room'},
  '16':{mode:'WORLD_HANDOFF',label:'IR ATÉ O RECEIVER',motion:'room-to-tv'},
  '17':{mode:'PHYSICAL_HANDOFF',label:'SEGUIR A FONTE ATÉ A MARGEM',motion:'tv-to-room'},
  '18':{mode:'AUTO_CONTINUE',label:'CORRELACIONAR AS FONTES',motion:'evidence-shift'},
  '19':{mode:'WORLD_HANDOFF',label:'ENTRAR NA RECONSTRUÇÃO DO CÔMODO',motion:'evidence-to-room'},
  '20':{mode:'WORLD_HANDOFF',label:'VOLTAR AO COMPUTADOR',motion:'room-to-computer'},
  '21':{mode:'PHYSICAL_HANDOFF',label:'PROCURAR ABAIXO DAS HISTÓRIAS',motion:'screen-to-room'},
  '22':{mode:'WORLD_HANDOFF',label:'VOLTAR AO PC E RESTAURAR A HORA',motion:'room-to-computer'},
  '23':{mode:'DIEGETIC_ENTRY',label:'EXECUTAR RECUPERAR_FINAL',motion:'desktop-awaken'},
  '24':{mode:'FINAL',label:'RECUPERAR O ARQUIVO',motion:'computer-to-final'},
  '25':{mode:'FINAL',label:'',motion:'none'}
});

function definePuzzle(definition) {
  const puzzle = {
    area: 'desktop', controller: 'system', prerequisites: [], discoveries: [], hints: [],
    archiveEffects: [], mutations: [], callbacks: [], fileBehaviors: [], physicalEffect: null, audioCue: 'ui.contact', motionCue: 'low',
    next: [], solution: null, ui: {}, keyboardPath: true,
    visibility:'latent', discovery:'world-entry', entryPoints:[], behaviorHooks:[], reactiveEvents:[], ...definition
  };
  puzzle.world = definition.world || WORLD_BY_FAMILY[puzzle.family] || 'computer';
  puzzle.environment = definition.environment || puzzle.family || puzzle.world;
  puzzle.intent = definition.intent || PHASE_INTENTS[puzzle.id] || puzzle.objective;
  puzzle.cue = definition.cue || PHASE_CUES[puzzle.id] || '';
  puzzle.revealTitle = definition.revealTitle || PHASE_REVEALS[puzzle.id] || puzzle.title;
  puzzle.entryPoints = definition.entryPoints || ENTRY_POINTS_BY_PHASE[puzzle.id] || [];
  puzzle.behaviorHooks = definition.behaviorHooks || BEHAVIOR_HOOKS_BY_PHASE[puzzle.id] || [];
  puzzle.reactiveEvents = definition.reactiveEvents || puzzle.behaviorHooks;
  puzzle.transition = Object.freeze({...(TRANSITIONS_BY_PHASE[puzzle.id] || {mode:'DIEGETIC_ENTRY',label:'CONTINUAR',motion:'crossfade'}),to:puzzle.next[0] || null});
  puzzle.mutations = freeze(puzzle.mutations);
  puzzle.callbacks = freeze(CALLBACKS_BY_PHASE[puzzle.id] || puzzle.callbacks);
  puzzle.fileBehaviors = freeze(puzzle.fileBehaviors);
  puzzle.corruption = Number.isFinite(puzzle.corruption) ? puzzle.corruption : Math.max(0, Math.min(5, puzzle.act - 1));
  puzzle.kind = puzzle.renderer;
  puzzle.requirements = freeze(puzzle.prerequisites);
  puzzle.evidence = freeze(puzzle.discoveries);
  puzzle.hints = freeze(PHASE_HINTS[puzzle.id] || puzzle.hints);
  puzzle.next = freeze(puzzle.next);
  puzzle.contract = Object.freeze({
    id: puzzle.id, act: puzzle.act, family: puzzle.family, world: puzzle.world, environment: puzzle.environment, intent: puzzle.intent, cue: puzzle.cue, revealTitle:puzzle.revealTitle,
    narrative: puzzle.narrative, objective: puzzle.objective,
    interaction: puzzle.interaction, successMeaning: puzzle.successMeaning,
    prerequisites: puzzle.requirements, discoveries: puzzle.evidence, hints: puzzle.hints,
    renderer: puzzle.renderer, controller: puzzle.controller,
    archiveEffects: freeze(puzzle.archiveEffects), mutations: puzzle.mutations, callbacks: puzzle.callbacks, fileBehaviors:puzzle.fileBehaviors, physicalEffect: puzzle.physicalEffect,
    audioCue: puzzle.audioCue, motionCue: puzzle.motionCue, visibility:puzzle.visibility, discovery:puzzle.discovery,
    entryPoints:freeze(puzzle.entryPoints), behaviorHooks:freeze(puzzle.behaviorHooks), reactiveEvents:freeze(puzzle.reactiveEvents), transition:puzzle.transition,
    accessibility: Object.freeze({ reducedMotion: true, audioIndependent: true, keyboardPath: puzzle.keyboardPath })
  });
  return Object.freeze(puzzle);
}

const P = definePuzzle;

export const PUZZLES = Object.freeze([
  P({ id:'01', act:1, family:'computer', area:'desktop', code:'ESTACAO_R', title:'computador deixado ligado', renderer:'boot', integrity:0, next:['02'], visibility:'immediate', discovery:'session-start', entryPoints:['boot-screen'],
    narrative:'Um computador gráfico antigo foi deixado ligado para uma única leitora.', objective:'Iniciar a estação e observar o ambiente deixado para você.', interaction:'acionar a inicialização manual', successMeaning:'A estação gráfica fica disponível para investigação.', motionCue:'boot-sequence',
    ui:{ status:(s)=>s.flags.initialized?'DESKTOP DISPONÍVEL':'SISTEMA EM ESPERA' } }),
  P({ id:'02', act:1, family:'computer', area:'files', code:'INDICE_LOCAL', title:'índice de inicialização', renderer:'logs', integrity:4, next:['03'], controller:'archive', prerequisites:['01'], discoveries:['evento-1010'], archiveEffects:['evento-1010:v1'], fileBehaviors:['event-1010:temporal'],
    mutations:[{id:'event-index',when:{flag:'event1010Seen'},notice:'REGISTRO EXTERNO INDEXADO'}],
    narrative:'O computador parece usado: há manutenção, backups e um registro temporal fora da rotina.', objective:'Localizar o registro que não pertence à sequência operacional.', interaction:'inspecionar logs e metadados', successMeaning:'EVENTO_1010 passa a existir no histórico pesquisável.',
    ui:{status:(s)=>s.flags.event1010Seen?'EVENTO_1010 INDEXADO':'6 LOGS // 1 ANOMALIA'} }),
  P({ id:'03', act:1, family:'device', area:'receiver', code:'RECEPTOR_VX', title:'portadora não identificada', renderer:'tv-intro', integrity:7, next:['04'], controller:'receiver', prerequisites:['02'], discoveries:['receiver-04'], audioCue:'receiver.static', motionCue:'receiver-channel-lock',
    mutations:[{id:'receiver',when:{unlocked:'03'},icons:['receiver-app']}],
    narrative:'Um periférico sem fabricante responde a uma faixa que o computador não cataloga.', objective:'Encontrar a portadora que não produz apenas estática.', interaction:'varrer os canais do Receiver', successMeaning:'Uma transmissão específica é isolada.',
    ui:{status:(s)=>`RECEPTOR ${s.tv.power?'ATIVO':'DESLIGADO'} // CAN ${String(s.tv.channel).padStart(2,'0')}`} }),
  P({ id:'04', act:1, family:'device', area:'receiver', code:'SINAL_04', title:'persistência luminosa', renderer:'morse', integrity:9, next:['05'], controller:'receiver', prerequisites:['03'], discoveries:['object-desk'], visibility:'immediate', discovery:'receiver-lock',
    narrative:'A portadora não contém voz; a lâmpada repete pulsos curtos e longos.', objective:'Interpretar o objeto codificado pelo sinal.', interaction:'reproduzir, anotar e decodificar Morse', successMeaning:'MESA deixa de parecer um objeto imediato e passa a nomear uma tabela interna do computador.', solution:{accepted:['mesa','escrivaninha']}, completion:{message:'SINAL INTERPRETADO // MESA'},
    ui:{inputLabel:'Objeto escrito pelo sinal',placeholder:'nome do objeto',submitLabel:'REGISTRAR LEITURA',wrongFeedback:'O objeto não corresponde aos pulsos.'} }),
  P({ id:'05', act:1, family:'computer', area:'files', code:'MOUNT_TABLE', title:'propriedades de uma unidade antiga', renderer:'file-properties', integrity:12, next:['06'], controller:'archive', prerequisites:['04'], discoveries:['archive-170491'],
    mutations:[{id:'mount-table',when:{unlocked:'05'},icons:['mount-app'],phaseApp:'mount-app'}],
    narrative:'MESA também aparece na tabela de montagem da unidade. Uma entrada antiga não possui dispositivo correspondente.', objective:'Inspecionar as propriedades da montagem órfã e recuperar seu índice.', interaction:'comparar unidade, data de criação e endereço', successMeaning:'ARCHIVE_170491 passa a ligar informação antiga a um contexto ainda desconhecido.', solution:{accepted:['170491','17 04 91','17/04/91']}, completion:{message:'MONTAGEM ÓRFÃ INDEXADA // 170491'},
    ui:{inputLabel:'Índice da montagem órfã',placeholder:'seis dígitos',submitLabel:'MONTAR UNIDADE',format:/^[\d\s/.-]{6,10}$/,formatHint:'Use dia, mês e ano na ordem exibida.',wrongFeedback:'Esse índice não corresponde à montagem órfã.'} }),
  P({ id:'06', act:2, family:'archive', area:'documents', code:'DOC_1708', title:'duas versões do mesmo relatório', renderer:'document', integrity:15, next:['07'], controller:'archive', prerequisites:['05'], discoveries:['document-invariant'], archiveEffects:['documento-06'], motionCue:'memory-reconstruction',
    narrative:'Duas cópias degradadas compartilham uma portadora derivada do índice 1708.', objective:'Deduzir 170.8, obter SIGNAL LOCK e congelar os invariantes.', interaction:'ajustar coarse/fine, comparar e estabilizar o sinal', successMeaning:'A instrução só se torna confiável na frequência exata.', completion:{message:'INSTRUÇÃO RECUPERADA // A DATA ABRE O ARQUIVO',motion:'document'}, ui:{status:(s)=>s.signalAnalyzer.locked?`${s.documentFragments.length} / 3 INVARIANTES`:`PORTADORA ${s.signalAnalyzer.coarse}.${s.signalAnalyzer.fine} // SEM LOCK`,wrongFeedback:'Esse trecho foi alterado.'} }),
  P({ id:'07', act:2, family:'computer', area:'files', code:'DIRETORIO_J', title:'versões incompatíveis', renderer:'files', integrity:19, next:['08'], controller:'archive', prerequisites:['06'], discoveries:['file-1010'],
    mutations:[{id:'directory-tools',when:{unlocked:'07'},icons:['directory-app'],phaseApp:'directory-app'}],
    narrative:'mirror://final preserva cinco snapshots e um link parcialmente quebrado.', objective:'Triangular origem, checksum e cache no VX_NET.', interaction:'usar endereço, histórico, cache e snapshots; recuperar o download correto', successMeaning:'DUMP_24.bin chega a Downloads por uma origem verificável.', ui:{status:(s)=>s.vxNet.downloads.includes('DUMP_24.bin')?'DOWNLOAD RECUPERADO':'5 SNAPSHOTS // 1 LINK RECUPERÁVEL'} }),
  P({ id:'08', act:2, family:'computer', area:'files', code:'PACOTE_8BIT', title:'fragmentos sem cabeçalho', renderer:'binary', integrity:23, next:['09'], prerequisites:['07'], discoveries:['object-moon'],
    mutations:[{id:'dump-reader',when:{unlocked:'08'},phaseApp:'dump-app',notice:'DUMP_24.bin SALVO EM C:\\DOWNLOADS'}],
    narrative:'A versão correta guarda 24 bits já separados em três blocos.', objective:'Converter os blocos em um objeto.', interaction:'ler três bytes como caracteres', successMeaning:'Um objeto conhecido ganha função investigativa.', solution:{accepted:['lua']}, completion:{message:'OBJETO RECUPERADO // LUA'}, ui:{inputLabel:'Palavra formada pelos três bytes',placeholder:'objeto recuperado',submitLabel:'INDEXAR OBJETO',wrongFeedback:'Os bytes não formam esse objeto.'} }),
  P({ id:'09', act:2, family:'computer', world:'computer', area:'images', code:'OBJETO_L01', title:'referência material', renderer:'moon-one', integrity:26, next:['10'], controller:'archive', prerequisites:['08'], discoveries:['vx-04-moon'],
    mutations:[{id:'analyzer',when:{unlocked:'09'},icons:['analyzer-app']}],
    narrative:'LUA é uma chave de busca. Imagem, log e cache preservam partes diferentes do mesmo scan.', objective:'Cruzar os três resultados e recuperar a marca no canal residual.', interaction:'ajustar contraste, canal e correlação de arquivos', successMeaning:'VX-04 ganha uma origem digital verificável.', solution:{accepted:['vx 04','vx04']}, completion:{message:'CAMADA VX-04 RECUPERADA',effects:['moonFirstFound']}, ui:{inputLabel:'Marca recuperada no scan',placeholder:'identificador',submitLabel:'ANEXAR MARCA',wrongFeedback:'Essa marca não pertence ao canal residual.'} }),
  P({ id:'10', act:2, family:'computer', area:'archive', code:'SOMA_DIVERGENTE', title:'um arquivo conhecido mudou', renderer:'return-event', integrity:31, next:['11'], controller:'archive', prerequisites:['09','02'], discoveries:['shared-event'], archiveEffects:['evento-1010:v2'], fileBehaviors:['event-1010:temporal','event-old:mirror','tmp1:parasite'],
    mutations:[{id:'event-rewrite',when:{unlocked:'10'},wallpaper:'alert'}],
    narrative:'EVENTO_1010 não corresponde mais à primeira leitura.', objective:'Voltar ao mesmo índice no PC e processar suas novas linhas.', interaction:'abrir Meu computador / SISTEMA / REGISTROS e reler REG_101000.idx', successMeaning:'O arquivo revela que havia duas fontes no evento.', ui:{status:(s)=>s.flags.eventChanged?'VERSÃO 02 PROCESSADA':'REGISTRO CONHECIDO ALTERADO'} }),
  P({ id:'11', act:3, family:'forensic', area:'evidence', code:'OBJETO_NAO_CATALOGADO', title:'objeto não catalogado', renderer:'conflict', integrity:35, next:['12'], controller:'forensic', prerequisites:['10'], discoveries:['object-c'], motionCue:'memory-reconstruction',
    narrative:'Fotografias cortadas, metadata e uma transparência chegaram à mesa com duas distrações.', objective:'Montar uma silhueta incompleta sem receber categorias prontas.', interaction:'mover, girar, sobrepor e testar a composição', successMeaning:'A forma têxtil recorrente surge visualmente; a identidade permanece desconhecida.', ui:{status:(s)=>s.paperEngine.boards['11']?.solved?'SILHUETA ESTABILIZADA':'MESA // COMPOSIÇÃO ABERTA'} }),
  P({ id:'12', act:3, family:'phone', area:'messages', code:'IDENTIDADE_OBJETO_C', title:'uma fotografia antiga', renderer:'phone-memory', integrity:39, next:['13'], controller:'phone', prerequisites:['11'], discoveries:['memory-curitiba'],
    narrative:'A conversa aponta para um anexo quebrado; o aparelho ainda preserva thumbnail e arquivo de câmera.', objective:'Seguir a origem entre Mensagens, Arquivos e CAM Archive.', interaction:'rastrear referências e recuperar a cópia antes de anexar metadata', successMeaning:'OBJETO C recebe seu nome humano: CURITIBA.', solution:{accepted:[GAME_CONFIG.memoryAnswer,...GAME_CONFIG.memoryAliases]}, completion:{message:'OBJETO C → CURITIBA // METADATA ANEXADA',effects:['curitibaConfirmed']}, ui:{wrongFeedback:'Essa identidade não corresponde ao objeto reconstruído.'} }),
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
    narrative:'NODE_17 libera dez fragmentos sobre a mesa; apenas seis pertencem ao mesmo mapa.', objective:'Montar o núcleo rasgado e comparar com a fotografia antiga do celular.', interaction:'mover, girar, excluir distrações e correlacionar duas fontes', successMeaning:'O exterior ganha uma posição reconhecível, não apenas um nome deduzido.', solution:{accepted:[GAME_CONFIG.locationAnswer,...GAME_CONFIG.locationAliases]}, completion:{message:'LOCAL RECUPERADO // PARQUINHO DA BEIRA-MAR',motion:'location',effects:['locationRecovered']}, ui:{inputLabel:'Lugar reconhecido após a montagem',placeholder:'nome do local',submitLabel:'ANEXAR LOCAL',wrongFeedback:'O mapa e a fotografia não sustentam esse lugar.'} }),
  P({ id:'19', act:4, family:'forensic', area:'evidence', code:'TESTE_ENTIDADE', title:'vínculos de memória', renderer:'identity', integrity:69, next:['20'], controller:'forensic', prerequisites:['18','12','10'], discoveries:['shared-memory'],
    narrative:'Documentos recuperados ocupam a mesma mesa, mas ainda não formam um modelo coerente.', objective:'Propor relações e testar uma hipótese completa de memória compartilhada.', interaction:'ligar qualquer par e submeter o conjunto à verificação', successMeaning:'ENTIDADE B deixa de ser tratada como desconhecida.', ui:{status:(s)=>`${s.hypothesisLinks.length} RELAÇÕES PROPOSTAS`} }),
  P({ id:'20', act:4, family:'reconstruction', area:'reconstruction', code:'PLANTA_INCOMPLETA', title:'Cômodo Zero', renderer:'room', integrity:74, next:['21'], controller:'reconstruction', prerequisites:['19'], discoveries:['house-match','node-00','reading-0317'], physicalEffect:'room',
    mutations:[{id:'reconstruction',when:{unlocked:'20'},icons:['recovery-app']}],
    narrative:'Quatro transparências impressas descrevem quase o mesmo quarto.', objective:'Alinhar estrutura, mobiliário, leitura e captura para localizar a área que não fecha.', interaction:'mover e girar camadas sobre a mesa; depois visitar a origem', successMeaning:'A divergência de +11,2 m² revela Cômodo Zero e sua leitura anterior.', ui:{status:(s)=>s.flags.roomNodeValidated?'NODE_00 // LEITURA ANTERIOR 03:17':s.flags.houseAnomalyRevealed?'VOLUME AUSENTE // +11,2 m²':'TRANSPARÊNCIAS NÃO ALINHADAS'} }),
  P({ id:'21', act:4, family:'computer', area:'desktop', code:'INTEGRIDADE_99', title:'encerramento incompleto', renderer:'impossible', integrity:99, next:['22'], prerequisites:['20'], discoveries:['system-object-tv'], fileBehaviors:['truth-app:rupture','shell-trace:recoverable'], motionCue:'system-signal-loss',
    mutations:[{id:'false-close',when:{unlocked:'21'},icons:['truth-app'],phaseApp:'truth-app',wallpaper:'unstable'}],
    narrative:'O sistema declara conclusão sem explicar a terceira fonte nem o Cômodo Zero.', objective:'Testar e recusar o encerramento de 99%.', interaction:'executar o fechamento e observar a inconsistência', successMeaning:'O canal escondido atrás do falso final é liberado.', ui:{status:(s)=>s.flags.fakeFinalSeen?'FALSO FINAL ROMPIDO':'ENCERRAMENTO DISPONÍVEL'} }),
  P({ id:'22', act:4, family:'reconstruction', world:'physical', area:'files', code:'NODE_11', title:'histórias suspensas', renderer:'books-node', integrity:84, next:['23'], controller:'nodes', prerequisites:['21'], discoveries:['node-11','audio-header'], physicalEffect:'books', visibility:'immediate', discovery:'integrity-rupture',
    narrative:'O falso final revela um cabeçalho de áudio e aponta para onde histórias são armazenadas.', objective:'Autenticar o NODE sob a estante.', interaction:'consultar o cabeçalho e retornar com a assinatura', successMeaning:'Os livros digitais e físicos passam a compartilhar índice.', solution:{accepted:[GAME_CONFIG.booksNodeCode]}, completion:{message:'NODE_11 AUTENTICADO',effects:['booksNodeValidated']}, ui:{inputLabel:'Assinatura encontrada sob a estante',placeholder:'VX-LIVROS-0000',submitLabel:'AUTENTICAR',wrongFeedback:'A assinatura não pertence ao NODE_11.'} }),
  P({ id:'23', act:5, family:'computer', area:'desktop', code:'CLOCK_ORIGIN', title:'hora original do evento', renderer:'clock-origin', integrity:91, next:['24'], prerequisites:['22','20'], discoveries:['time-origin'],
    mutations:[{id:'clock-origin',when:{unlocked:'23'},clockMode:'restore',wallpaper:'origin'}],
    narrative:'A calibração de 03:17 abriu o sistema, mas o evento central possui outra hora original registrada desde o início.', objective:'Restaurar no relógio a hora exata de EVENTO_1010.', interaction:'revisitar o registro conhecido e corrigir a hora da barra', successMeaning:'O sistema reconhece a origem temporal e libera as cadeias finais.', ui:{status:(s)=>`ORIGEM ESPERADA // EVENTO_1010 · ATUAL ${String(s.desktopOs.clockHour).padStart(2,'0')}:${String(s.desktopOs.clockMinute).padStart(2,'0')}`} }),
  P({ id:'24', act:5, family:'computer', area:'evidence', code:'CHAVE_COMPOSTA', title:'dois fragmentos de dados', renderer:'meta', integrity:99, next:['25'], controller:'forensic', prerequisites:['23'], discoveries:['fragment-520','fragment-1314','relation-us'],
    mutations:[{id:'final-tool',when:{flag:'clockOriginRestored'},icons:['final-recovery-app'],phaseApp:'final-recovery-app',notice:'RECUPERAR.exe FOI REESCRITO'}],
    narrative:'PC, Receiver, livros e mesa preservaram partes diferentes da leitura final.', objective:'Reconstruir ordem e orientação sem receber a operação pronta.', interaction:'alinhar os fragmentos finais e inserir a leitura contínua', successMeaning:'O sistema recupera a interpretação a partir da síntese de toda a experiência.', solution:{accepted:['5201314']}, completion:{message:'CHAVE ACEITA // INTERPRETAÇÃO RECUPERADA',motion:'merge',effects:['finalRecovered']}, ui:{inputLabel:'Leitura composta',placeholder:'sete dígitos',submitLabel:'EXECUTAR LEITURA',format:/^\d{7}$/,formatHint:'A leitura final possui sete dígitos.',wrongFeedback:'Ordem ou orientação não corresponde às fontes.'} }),
  P({ id:'25', act:5, family:'final', area:'identity', code:'RECUPERACAO_COMPLETA', title:'arquivo íntegro', renderer:'final', integrity:100, prerequisites:['24'], discoveries:['event-meaning'], visibility:'immediate', discovery:'key-accepted',
    narrative:'As classificações técnicas perderam a função.', objective:'Permanecer e ler.', interaction:'conclusão narrativa', successMeaning:'EVENTO_1010 finalmente recebe significado humano.', ui:{status:()=> '10/10 // O DIA EM QUE A GENTE SE CONHECEU'} })
]);

export const PUZZLE_BY_ID = Object.freeze(Object.fromEntries(PUZZLES.map((puzzle) => [puzzle.id, puzzle])));
export const puzzleFor = (id) => PUZZLE_BY_ID[id] || PUZZLE_BY_ID['01'];
