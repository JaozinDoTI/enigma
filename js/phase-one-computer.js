import { escapeHtml } from './utils.js';
import { computerWorldAt } from './worlds/computer-world.js';
import { puzzleFor } from './puzzles/catalog.js';
import { renderScene } from './scene-renderer.js';
import { fileRuntime, resolveComputerResource, sortComputerResources, visibleComputerChildren } from './computer-runtime.js';

const RESOURCE_LIST = [
  { id:'computer', name:'Meu computador', type:'folder', parent:'desktop', path:'C:\\', children:['system','documents','downloads','temp','backup','images','personal'] },
  { id:'documents', name:'Documentos', type:'folder', parent:'computer', path:'C:\\DOCUMENTOS', children:['work','shopping','untitled'] },
  { id:'notes', name:'NOTAS.txt', type:'text', parent:'desktop', created:'09/10/2025 21:02', modified:'09/10/2025 21:06', size:'1 KB', origin:'C:\\DOCUMENTOS', body:['devolver o adaptador','comprar pilhas','não mexer no relógio do sistema'] },
  { id:'trash', name:'Lixeira', type:'trash', parent:'desktop', path:'LIXEIRA', children:['old-image','draft'] },
  { id:'receiver-app', name:'RECEPTOR.exe', type:'program', parent:'desktop', created:'10/10/2025 10:10', modified:'10/10/2025 10:10', size:'31 KB', origin:'REGISTRO ISOLADO', target:'03' },
  { id:'analyzer-app', name:'ANALISADOR.exe', type:'program', parent:'desktop', created:'10/10/2025 10:11', modified:'10/10/2025 10:11', size:'82 KB', origin:'PACOTE RECUPERADO', target:'09' },
  { id:'recovery-app', name:'RECUPERAR.exe', type:'program', parent:'desktop', created:'10/10/2025 14:25', modified:'10/10/2025 14:25', size:'101 KB', origin:'MODELO RELACIONAL', target:'20' },
  { id:'bookscan-app', name:'BOOKSCAN.exe', type:'program', parent:'desktop', created:'10/10/2025 13:14', modified:'10/10/2025 13:14', size:'67 KB', origin:'IMAGEM RESIDUAL', target:'14' },
  { id:'truth-app', name:'INTEGRIDADE.exe', type:'program', parent:'desktop', created:'10/10/2025 23:10', modified:'10/10/2025 23:10', size:'131 KB', origin:'SISTEMA', target:'21' },
  { id:'quarantine', name:'QUARENTENA', type:'folder', parent:'computer', path:'C:\\QUARENTENA', children:[] },
  { id:'archive-170491', name:'ARCHIVE_170491', type:'folder', parent:'computer', path:'V:\\ARCHIVE_170491', children:['rel-1708-a'] },
  { id:'rel-1708-a', name:'REL_1708.A', type:'document', parent:'archive-170491', created:'17/04/1991 03:17', modified:'10/10/2025 10:10', size:'17 KB', origin:'VOLUME 170491' },
  { id:'rel-1708-b', name:'REL_1708.B', type:'document', parent:'backup', created:'17/04/1991 03:17', modified:'10/10/2025 10:12', size:'18 KB', origin:'BACKUP / REFERÊNCIA DE A' },
  { id:'mount-app', name:'MOUNT.exe', type:'program', parent:'desktop', created:'17/04/1991 08:00', modified:'10/10/2025 10:12', size:'38 KB', origin:'SISTEMA', target:'05', phaseApp:true },
  { id:'directory-app', name:'VX_NET.exe', type:'program', parent:'desktop', created:'10/10/2025 10:08', modified:'10/10/2025 10:10', size:'51 KB', origin:'SISTEMA / REDE LOCAL', target:'07', phaseApp:true },
  { id:'downloads', name:'Downloads', type:'folder', parent:'computer', path:'C:\\DOWNLOADS', children:['dump-app'] },
  { id:'dump-app', name:'DUMP_24.bin', type:'program', parent:'downloads', created:'10/10/2025 10:10', modified:'10/10/2025 10:11', size:'24 KB', origin:'VX_NET / mirror://final', target:'08', phaseApp:true },
  { id:'final-recovery-app', name:'RECUPERAR_FINAL.exe', type:'program', parent:'desktop', created:'10/10/2025 10:10', modified:'10/10/2025 10:10', size:'520 KB', origin:'DUAS CADEIAS', target:'24', phaseApp:true },
  { id:'clock-note', name:'0317.REC', type:'text', parent:'desktop', created:'17/04/1991 03:17', modified:'10/10/2025 03:17', size:'3 KB', origin:'RELÓGIO DO SISTEMA', body:['CALIBRAÇÃO ACEITA','ONDE A NOITE DEIXA O QUE VOCÊ PRECISA','o sistema não criou este arquivo; apenas deixou de escondê-lo'] },
  { id:'system', name:'SISTEMA', type:'folder', parent:'computer', path:'C:\\SISTEMA', children:['drivers','registers','config','processes'] },
  { id:'temp', name:'TEMP', type:'folder', parent:'computer', path:'C:\\TEMP', children:['tmp1','cache','old-image'] },
  { id:'cam-cache', name:'CAM_CACHE', type:'folder', parent:'temp', path:'C:\\TEMP\\CAM_CACHE', children:[] },
  { id:'cam-local-app', name:'CAM_LOCAL.exe', type:'program', parent:'cam-cache', created:'10/10/2025 10:10', modified:'10/10/2025 10:10', size:'26 KB', origin:'MÓDULO OPCIONAL LOCAL' },
  { id:'backup', name:'BACKUP', type:'folder', parent:'computer', path:'C:\\BACKUP', children:['backup1','backup2','event-old'] },
  { id:'images', name:'IMAGENS', type:'folder', parent:'computer', path:'C:\\IMAGENS', children:['camera-old','moon-thumb'] },
  { id:'personal', name:'PESSOAL', type:'folder', parent:'computer', path:'C:\\PESSOAL', children:['empty-folder','audio-note'] },
  { id:'drivers', name:'DRIVERS', type:'folder', parent:'system', path:'C:\\SISTEMA\\DRIVERS', children:['display-driver','audio-driver'] },
  { id:'registers', name:'REGISTROS', type:'folder', parent:'system', path:'C:\\SISTEMA\\REGISTROS', children:['log-0704','log-0709','event-1010','log-1011','log-1102','source-b'] },
  { id:'config', name:'CONFIG.SYS', type:'text', parent:'system', created:'17/04/1991 08:00', modified:'07/10/2025 18:42', size:'3 KB', origin:'INSTALAÇÃO LOCAL', body:['DISPLAY=VGA_640','AUDIO=VX_COMPAT','CLOCK=LOCAL','MOUNT=AUTO'] },
  { id:'processes', name:'PROCESSOS.sys', type:'data', parent:'system', created:'17/04/1991 08:00', modified:'10/10/2025 10:10', size:'4 KB', origin:'SISTEMA', body:[] },
  { id:'work', name:'trabalho.txt', type:'text', parent:'documents', created:'02/10/2025 14:20', modified:'02/10/2025 17:41', size:'5 KB', origin:'USUÁRIO J.', body:['pendências da semana','confirmar manutenção do drive','reorganizar arquivos depois'] },
  { id:'shopping', name:'compras.txt', type:'text', parent:'documents', created:'09/10/2025 20:58', modified:'09/10/2025 21:06', size:'1 KB', origin:'USUÁRIO J.', body:['pilhas AA','fita removível','café','envelope plástico'] },
  { id:'untitled', name:'sem_nome.txt', type:'text', parent:'documents', created:'08/10/2025 00:31', modified:'08/10/2025 00:33', size:'0 KB', origin:'USUÁRIO J.', body:[''] },
  { id:'tmp1', name:'~$0001.tmp', type:'data', parent:'temp', created:'10/10/2025 09:44', modified:'10/10/2025 09:44', size:'16 KB', origin:'SISTEMA', body:['DADOS TEMPORÁRIOS','SEM CONTEÚDO LEGÍVEL'] },
  { id:'tmp2', name:'~$0001_2.tmp', type:'data', parent:'temp', created:'10/10/2025 09:44', modified:'10/10/2025 10:13', size:'19 KB', origin:'PROCESSO DESCONHECIDO', body:['DADOS TEMPORÁRIOS','MESMA CRIAÇÃO / TAMANHO DIVERGENTE'] },
  { id:'cache', name:'cache.dat', type:'data', parent:'temp', created:'10/10/2025 09:45', modified:'10/10/2025 09:58', size:'128 KB', origin:'SISTEMA', body:['CACHE DE VISUALIZAÇÃO','BLOCO 04 / 18'] },
  { id:'backup1', name:'backup_01', type:'folder', parent:'backup', path:'C:\\BACKUP\\backup_01', children:[] },
  { id:'backup2', name:'backup_02', type:'folder', parent:'backup', path:'C:\\BACKUP\\backup_02', children:[] },
  { id:'event-old', name:'evento.old', type:'data', parent:'backup', created:'09/10/2025 23:48', modified:'09/10/2025 23:48', size:'2 KB', origin:'BACKUP LOCAL', body:['VERSÃO ENCERRADA','NENHUM EVENTO ASSOCIADO'] },
  { id:'found-000', name:'FOUND.000', type:'folder', parent:'backup', path:'C:\\BACKUP\\FOUND.000', children:[] },
  { id:'shell-trace', name:'SHELL_RECOVERY.LOG', type:'log', parent:'found-000', created:'10/10/2025 10:10', modified:'10/10/2025 10:10', size:'6 KB', origin:'BOOT 02', body:['SHELL.EXE ........ RECUPERADO'] },
  { id:'camera-old', name:'camera_01.bmp', type:'image', parent:'images', created:'08/10/2025 22:14', modified:'08/10/2025 22:14', size:'301 KB', origin:'CÂMERA DOMÉSTICA', source:'./assets/images/camera-01.svg' },
  { id:'moon-thumb', name:'tecido_scan.bmp', type:'image', parent:'images', created:'10/10/2025 10:08', modified:'10/10/2025 10:08', size:'184 KB', origin:'SCANNER LOCAL', source:'./assets/images/moon-scan.svg' },
  { id:'object-c-thumb', name:'OBJETO_C.thumb', type:'image', parent:'images', created:'17/04/2019 18:11', modified:'10/10/2025 09:58', size:'18 KB', origin:'CACHE DE MINIATURAS', attributes:'OCULTO · RECUPERÁVEL', source:'./assets/images/camera-02.svg' },
  { id:'old-image', name:'img_old.bmp', type:'image', parent:'trash', created:'17/09/2025 03:17', modified:'17/09/2025 03:17', size:'42 KB', origin:'TEMP', source:'./assets/images/camera-02.svg' },
  { id:'frame-0017', name:'FRAME_0017.JPG', type:'image', parent:'cam-cache', created:'10/10/2025 03:12', modified:'10/10/2025 03:12', size:'38 KB', origin:'WEBCAM CACHE / SIMULADO', source:'./assets/images/camera-01.svg' },
  { id:'frame-0018', name:'FRAME_0018.JPG', type:'image', parent:'cam-cache', created:'10/10/2025 03:14', modified:'10/10/2025 03:14', size:'31 KB', origin:'WEBCAM CACHE / SIMULADO', source:'./assets/images/camera-03.svg' },
  { id:'frame-0317', name:'FRAME_0317.BMP', type:'image', parent:'cam-cache', created:'10/10/2025 03:17', modified:'10/10/2025 10:10', size:'51 KB', origin:'WEBCAM CACHE / TIMESTAMP INCOMPATÍVEL', source:'./assets/images/camera-02.svg' },
  { id:'webcam-cache', name:'WEBCAM_CACHE.DAT', type:'data', parent:'cam-cache', created:'10/10/2025 03:17', modified:'10/10/2025 03:17', size:'4 KB', origin:'CAPTURA SIMULADA', body:['DISPOSITIVO REAL: NÃO ACESSADO','FRAMES LOCAIS RECUPERADOS','OFFSET DE RELÓGIO: INDETERMINADO'] },
  { id:'draft', name:'rascunho.txt', type:'text', parent:'trash', created:'01/10/2025 11:22', modified:'01/10/2025 11:23', size:'1 KB', origin:'DOCUMENTOS', body:['isso parece menos suspeito no papel'] },
  { id:'empty-folder', name:'SEM_NOME', type:'folder', parent:'personal', path:'C:\\PESSOAL\\SEM_NOME', children:[] },
  { id:'audio-note', name:'calibracao.wav', type:'audio', parent:'personal', created:'07/10/2025 19:10', modified:'07/10/2025 19:10', size:'64 KB', origin:'GERADOR LOCAL', body:['00:04','RUÍDO DE ALINHAMENTO','SEM FALA'] },
  { id:'display-driver', name:'VGA_640.drv', type:'data', parent:'drivers', created:'17/04/1991 08:00', modified:'17/04/1991 08:00', size:'42 KB', origin:'INSTALAÇÃO LOCAL', body:['CONTROLADOR DE VÍDEO','ESTADO NOMINAL'] },
  { id:'audio-driver', name:'VX_AUDIO.drv', type:'data', parent:'drivers', created:'17/04/1991 08:00', modified:'07/04/1993 11:40', size:'31 KB', origin:'INSTALAÇÃO LOCAL', body:['CONTROLADOR DE ÁUDIO','PORTADORA NÃO CATALOGADA'] },
  { id:'log-0704', name:'REG_070411.idx', type:'log', parent:'registers', created:'10/10/2025 07:04', modified:'10/10/2025 07:04', size:'4 KB', origin:'ESTAÇÃO R-1010', body:['07:04:11  NÓ_01  nominal','ORIGEM  estação local','ASSINATURA  válida'] },
  { id:'log-0709', name:'REG_070932.idx', type:'log', parent:'registers', created:'10/10/2025 07:09', modified:'10/10/2025 07:09', size:'4 KB', origin:'ESTAÇÃO R-1010', body:['07:09:32  REGISTRO_674','verificação divergente','ORIGEM  estação local'] },
  { id:'event-1010', name:'REG_101000.idx', type:'log', parent:'registers', created:'17/04/1991 03:17', modified:'10/10/2025 10:10', size:'10 KB', origin:'VOLUME EXTERNO / NÃO MONTADO', attributes:'SISTEMA · OCULTO · SOMENTE LEITURA', body:['10:10:00  EVENTO_1010','origem desconhecida','volume correspondente ausente','índice anterior à pasta atual'], anomaly:true },
  { id:'log-1011', name:'REG_101108.idx', type:'log', parent:'registers', created:'10/10/2025 10:11', modified:'10/10/2025 10:11', size:'4 KB', origin:'ESTAÇÃO R-1010', body:['10:11:08  VX-04','sem portadora','ORIGEM  estação local'] },
  { id:'log-1102', name:'REG_110214.idx', type:'log', parent:'registers', created:'10/10/2025 11:02', modified:'10/10/2025 11:02', size:'4 KB', origin:'ESTAÇÃO R-1010', body:['11:02:14  VX-11','adiado','ORIGEM  estação local'] },
  { id:'source-b', name:'REG_142510.idx', type:'log', parent:'registers', created:'10/10/2025 14:25', modified:'10/10/2025 14:25', size:'4 KB', origin:'ESTAÇÃO R-1010', body:['14:25:10  SRC-B','correlação adiada','ORIGEM  estação local'] }
];

const RESOURCES = Object.freeze(Object.fromEntries(RESOURCE_LIST.map((resource) => [resource.id, Object.freeze(resource)])));
const BASE_DESKTOP_ICONS = Object.freeze([['computer',5,7],['documents',5,27],['notes',5,49],['trash',5,71]]);

export function desktopResource(id, state = null) {
  const resource=RESOURCES[id] || null;
  return state ? resolveComputerResource(resource,state) : resource;
}

function glyph(type) {
  const shape = type === 'folder' ? '<path d="M3 8h7l2-3h9v15H3z"/><path d="M3 9h18"/>'
    : type === 'trash' ? '<path d="M7 7h10l-1 13H8zM5 7h14M9 4h6"/>'
      : type === 'image' ? '<rect x="3" y="4" width="18" height="16"/><path d="m5 17 5-6 4 4 2-2 4 4"/><circle cx="16" cy="8" r="1.5"/>'
        : type === 'audio' ? '<path d="M4 9v6h4l5 4V5L8 9zM17 9c2 2 2 4 0 6"/>'
          : type === 'log' || type === 'data' ? '<path d="M5 3h10l4 4v14H5zM15 3v5h4"/><path d="M8 12h8M8 15h8M8 18h5"/>'
            : '<path d="M5 3h10l4 4v14H5zM15 3v5h4"/><path d="M8 12h8M8 15h8"/>';
  return `<svg class="retro-glyph retro-glyph--${type}" viewBox="0 0 24 24" aria-hidden="true">${shape}</svg>`;
}

function iconMarkup(resource, location = 'window', position = null) {
  const style = position ? ` style="--os-x:${position[0]}%;--os-y:${position[1]}%"` : '';
  return `<button type="button" class="os-icon os-icon--${location}" data-action="os-select" data-os-resource="${resource.id}" aria-label="${escapeHtml(resource.name)}" aria-selected="false"${style}>${glyph(resource.type)}<span>${escapeHtml(resource.name)}</span></button>`;
}

function folderBody(resource, state) {
  const childIds=visibleComputerChildren(state,resource.id,resource.children || []);
  const query=String(state.computer.navigation.searchQuery||'').trim().toLocaleLowerCase('pt-BR');
  const children=sortComputerResources(childIds.map((id)=>desktopResource(id,state)).filter(Boolean),state.computer.navigation.sortBy)
    .filter((child)=>!query || child.name.toLocaleLowerCase('pt-BR').includes(query) || String(child.origin||'').toLocaleLowerCase('pt-BR').includes(query));
  const canNavigate=state.computer.navigation.history.length>1;
  return `<div class="os-explorer-toolbar"><button type="button" data-action="os-nav-back" ${canNavigate?'':'disabled'} aria-label="Voltar">←</button><button type="button" data-action="os-nav-forward" aria-label="Avançar">→</button><span class="os-address"><small>ENDEREÇO</small><strong>${escapeHtml(resource.path || resource.name)}</strong></span><form data-os-search><label><span>BUSCAR</span><input name="query" value="${escapeHtml(state.computer.navigation.searchQuery||'')}" placeholder="${escapeHtml(state.computer.navigation.rememberedQuery||'nome ou origem')}" autocomplete="off"></label><button type="submit">IR</button></form><label class="os-sort">ORDENAR<select data-os-sort><option value="name" ${state.computer.navigation.sortBy==='name'?'selected':''}>NOME</option><option value="modified" ${state.computer.navigation.sortBy==='modified'?'selected':''}>MODIFICADO</option><option value="size" ${state.computer.navigation.sortBy==='size'?'selected':''}>TAMANHO</option></select></label></div><div class="os-folder-grid">${children.length ? children.map((child) => iconMarkup(child)).join('') : `<p class="os-empty-folder">${query?'Nenhum objeto corresponde à busca.':'Esta pasta está vazia.'}</p>`}</div><footer class="os-statusbar">${children.length} objeto${children.length === 1 ? '' : 's'}<span>${escapeHtml(resource.path || '')}</span></footer>`;
}

function textBody(resource,state) {
  const entry=resource.id==='clock-note' && state.unlocked.includes('16') ? '<button type="button" class="os-dialog-button" data-action="navigate" data-target="16">SEGUIR REFERÊNCIA FÍSICA</button>' : '';
  return `<div class="os-document-reader">${(resource.body || []).map((line) => `<p>${escapeHtml(line) || '&nbsp;'}</p>`).join('')}${entry}</div><footer class="os-statusbar">SOMENTE LEITURA<span>${escapeHtml(resource.size || '0 KB')}</span></footer>`;
}

function logBody(resource, state) {
  const isolated = state.completed.includes('02');
  const altered = resource.anomaly && computerWorldAt(state,state.currentPuzzle).mutations.some((mutation)=>mutation.id==='event-rewrite');
  const lines = [...(resource.body || []), ...(altered && fileRuntime(state,resource.id)?.variant!=='rewritten' ? ['10:10:00  ASSINATURA REESCRITA','DUAS FONTES PRESENTES NO MESMO EVENTO','CHECKSUM ANTERIOR ≠ CHECKSUM ATUAL'] : [])];
  const anomalyAction = !isolated
    ? '<button type="button" class="os-dialog-button" data-action="os-isolate-event">ISOLAR REGISTRO</button>'
    : altered && !state.flags.eventChanged
      ? (fileRuntime(state,resource.id)?.quarantined
        ? '<button type="button" class="os-dialog-button os-dialog-button--alert" data-action="os-ack-change">ISOLAR VERSÃO DIVERGENTE</button>'
        : '<p class="os-isolated">CHECKSUM ATUAL ≠ SNAPSHOT DO HISTÓRICO // ABRA PROPRIEDADES E ENVIE UMA CÓPIA À QUARENTENA</p>')
      : `<p class="os-isolated">${altered?'VERSÃO 02 PROCESSADA // DUAS FONTES':'REGISTRO ISOLADO // CONSULTA'}</p>`;
  return `<div class="os-log-viewer"><header><span>LEITOR DE ÍNDICE</span><strong>${escapeHtml(resource.name)}</strong></header>${lines.map((line) => `<code>${escapeHtml(line)}</code>`).join('')}${resource.anomaly ? `<div class="os-log-origin"><span>ORIGEM DECLARADA</span><strong>${escapeHtml(resource.origin)}</strong></div>${anomalyAction}` : ''}</div>`;
}

function imageBody(resource,state) {
  const entry=resource.id==='object-c-thumb' && state.unlocked.includes('11') ? '<button type="button" class="os-dialog-button" data-action="navigate" data-target="11">ABRIR MODELO FORENSE</button>' : '';
  return `<figure class="os-image-viewer"><header><button type="button" data-action="os-image-zoom" data-delta="-.25">−</button><span>ZOOM <output data-image-zoom>100%</output></span><button type="button" data-action="os-image-zoom" data-delta=".25">+</button><button type="button" data-action="os-image-enhance">REALÇAR</button></header><div data-image-canvas><img src="${resource.source}" alt="Imagem antiga: ${escapeHtml(resource.name)}"></div><figcaption>${escapeHtml(resource.name)} · ${escapeHtml(resource.size)} · ${escapeHtml(resource.origin || 'ORIGEM DESCONHECIDA')}</figcaption>${entry}</figure>`;
}

function audioBody(resource) {
  return `<div class="os-audio-player"><div class="os-audio-reels" aria-hidden="true"><i></i><span></span><i></i></div><strong>${escapeHtml(resource.name)}</strong><p>${escapeHtml((resource.body || []).join(' · '))}</p><button type="button" data-action="os-audio-preview">REPRODUZIR</button></div>`;
}

function programBody(resource, state) {
  if (resource.id==='cam-local-app') {
    const status=state.capture.status;
    return `<section class="local-capture-consent"><span>CAM LOCAL // MÓDULO OPCIONAL</span><strong>${status==='captured'?'UM QUADRO MANTIDO EM MEMÓRIA':status==='denied'?'ACESSO NEGADO OU INDISPONÍVEL':'CONSENTIMENTO NECESSÁRIO'}</strong><p>Se você autorizar, a câmera será aberta somente para um quadro. A faixa é encerrada imediatamente. A imagem não é enviada, reconhecida nem gravada no armazenamento.</p>${status==='captured'?'<small>A captura poderá reaparecer dentro da ficção desta sessão. Recarregar ou reiniciar descarta o quadro.</small>':`<button type="button" class="os-dialog-button" data-action="local-capture-authorize">${status==='requesting'?'AGUARDANDO PERMISSÃO…':'AUTORIZAR UMA CAPTURA'}</button><small>Recusar não bloqueia a experiência; uma captura fictícia será usada.</small>`}</section>`;
  }
  const targetPuzzle = resource.target ? puzzleFor(resource.target) : null;
  const isNative = resource.phaseApp || resource.id === 'bookscan-app' || resource.id === 'truth-app';
  if (isNative && targetPuzzle && resource.target === state.currentPuzzle) return `<div class="os-native-app">${renderScene(targetPuzzle,state)}</div>`;
  return `<div class="os-program"><div class="os-program__mark">R</div><span>PROGRAMA INSTALADO PELO SISTEMA</span><strong>${escapeHtml(resource.name)}</strong><p>Este dispositivo opera fora da estação gráfica.</p><button type="button" class="os-dialog-button" data-action="navigate" data-target="${resource.target}">EXECUTAR</button></div>`;
}

function memoryDocumentBody(resource,state) {
  const isA=resource.id==='rel-1708-a';
  const revision=state.documentRuntime.revision%3;
  const unstableA=[['o índice reconhece a data','o índice rejeita a data','o índice esqueceu a data'],['a data','a data','a data'],['abre','abre','abre'],['o arquivo','o arquivo','o arquivo'],['quando a cópia se move','antes que a cópia responda','depois que a janela retorna']];
  const unstableB=[['a origem preserva a hora','a origem nega a hora','a origem troca a hora'],['a data','a data','a data'],['abre','abre','abre'],['o arquivo','o arquivo','o arquivo'],['enquanto ainda existe nome','quando o nome desaparece','se a leitura for repetida']];
  const lines=(isA?unstableA:unstableB).map((variants,index)=>`<p class="${index>0&&index<4?'is-stable':'is-unstable'}"><small>${String(index+1).padStart(2,'0')}</small>${escapeHtml(variants[revision])}</p>`).join('');
  const seen=state.documentRuntime.copiesSeen;
  return `<section class="memory-document"><header><span>${isA?'CÓPIA PRIMÁRIA':'CÓPIA DE BACKUP'}</span><strong>ESTADO ${String(revision+1).padStart(2,'0')}</strong></header>${lines}<footer><button type="button" class="os-dialog-button" data-action="os-document-snapshot" data-copy="${isA?'A':'B'}">CAPTURAR ESTADO</button>${seen.includes('A')&&seen.includes('B')?'<button type="button" class="os-dialog-button" data-action="navigate" data-target="06">ABRIR COMPARADOR</button>':'<span>REFERÊNCIA CRUZADA INCOMPLETA</span>'}</footer></section>`;
}

function propertiesBody(resource, state) {
  const rows = [
    ['TIPO',resource.type.toUpperCase()],['LOCAL',resource.path || `C:\\${String(resource.parent || '').toUpperCase()}`],
    ['CRIADO',resource.created || '—'],['MODIFICADO',resource.modified || '—'],['TAMANHO',resource.size || '—'],
    ['ORIGEM',resource.origin || 'ESTAÇÃO R-1010'],['ATRIBUTOS',resource.attributes || 'ARQUIVO'],
    ['COMPORTAMENTO',resource.behavior ? resource.behavior.toUpperCase() : 'ESTÁVEL'],['LEITURAS',String(resource.openCount || 0)]
  ];
  const canQuarantine=Boolean(fileRuntime(state,resource.id)) && !resource.quarantined;
  return `<div class="os-properties"><div class="os-properties__identity">${glyph(resource.type)}<strong>${escapeHtml(resource.name)}</strong></div><dl>${rows.map(([label,value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>${resource.lastMutation?`<p class="os-property-alert">ÚLTIMA MUTAÇÃO // ${escapeHtml(resource.lastMutation)}</p>`:''}<footer>${canQuarantine?`<button type="button" class="os-dialog-button" data-action="os-quarantine" data-resource="${resource.id}">ENVIAR PARA QUARENTENA</button>`:''}<button type="button" class="os-dialog-button" data-action="os-window-close">FECHAR</button></footer></div>`;
}

function quarantineBody(resource,state) {
  const current=resolveComputerResource(resource,state);
  const original=RESOURCES[resource.id];
  return `<div class="os-quarantine-compare"><header><span>CÓPIA ESTABILIZADA</span><strong>${escapeHtml(current.name)}</strong></header><div><section><small>ORIGINAL</small><p>${escapeHtml(original.size||'—')} · ${escapeHtml(original.origin||'—')}</p>${(original.body||[]).map((line)=>`<code>${escapeHtml(line)}</code>`).join('')}</section><section><small>ESTADO ATUAL</small><p>${escapeHtml(current.size||'—')} · ${escapeHtml(current.origin||'—')}</p>${(current.body||[]).map((line)=>`<code>${escapeHtml(line)}</code>`).join('')}</section></div><footer>O ORIGINAL CONTINUA NO LOCAL DE ORIGEM.</footer></div>`;
}

function processesBody(state) {
  const labels={shell:'SHELL.EXE',archive:'ARCHIVE.EXE',vxdrv:'VXDRV.SYS',indexer:'INDEXER.EXE',sourceB:'SOURCE_B'};
  return `<div class="os-process-list"><header><span>PROCESSOS DA ESTAÇÃO</span><strong>BOOT ${String(state.computer.boot.count).padStart(2,'0')}</strong></header>${Object.entries(state.computer.processes).map(([id,status])=>`<div class="is-${escapeHtml(status)}"><strong>${labels[id]||id.toUpperCase()}</strong><span>${escapeHtml(status.toUpperCase())}</span></div>`).join('')}<footer>INTEGRIDADE DA SHELL // ${state.computer.corruption.shellIntegrity}%</footer></div>`;
}

function resourceBody(entry, state) {
  const baseResource = RESOURCES[entry.resourceId];
  const resource = resolveComputerResource(baseResource,state);
  if (!resource) return '<p>OBJETO INDISPONÍVEL</p>';
  if (entry.kind === 'properties') return propertiesBody(resource,state);
  if (entry.kind === 'quarantine') return quarantineBody(baseResource,state);
  if (resource.id === 'processes') return processesBody(state);
  if (resource.type === 'folder' || resource.type === 'trash') return folderBody(resource,state);
  if (resource.type === 'image') return imageBody(resource,state);
  if (resource.type === 'audio') return audioBody(resource);
  if (resource.type === 'program') return programBody(resource, state);
  if (resource.type === 'document') return memoryDocumentBody(resource,state);
  if (resource.type === 'log' || resource.type === 'data') return logBody(resource, state);
  return textBody(resource,state);
}

export function desktopWindowMarkup(entry, state) {
  const resource = desktopResource(entry.resourceId,state);
  if (!resource) return '';
  const title = entry.kind === 'properties' ? `Propriedades de ${resource.name}` : resource.name;
  const classes = ['os-window', `os-window--${entry.kind === 'properties' ? 'properties' : resource.type}`, entry.maximized ? 'is-maximized' : '', entry.minimized ? 'is-minimized' : ''].filter(Boolean).join(' ');
  return `<section class="${classes}" data-os-window="${entry.key}" data-resource="${resource.id}" style="--win-x:${entry.x}px;--win-y:${entry.y}px;--win-z:${entry.z}" aria-label="Janela ${escapeHtml(title)}">
    <header class="os-titlebar" data-os-titlebar><span>${glyph(resource.type)}<strong>${escapeHtml(title)}</strong></span><div><button type="button" data-action="os-window-front" aria-label="Trazer para frente">↑</button><button type="button" data-action="os-window-minimize" aria-label="Minimizar">_</button><button type="button" data-action="os-window-maximize" aria-label="Maximizar">□</button><button type="button" data-action="os-window-close" aria-label="Fechar">×</button></div></header>
    <div class="os-window__body">${resourceBody(entry,state)}</div>
  </section>`;
}

function bootScreen(state) {
  const reboot=state.computer.boot.count>1 || state.computer.boot.status!=='ready';
  const bootNumber=state.computer.boot.status==='crashing'?state.computer.boot.count+1:state.computer.boot.count;
  return `<section class="retro-boot ${reboot?'is-recovery-boot':''}"><div class="retro-boot__mark"><i></i><span>R</span></div><div><span>ESTAÇÃO GRÁFICA R-1010 // BOOT ${String(bootNumber).padStart(2,'0')}</span><strong>${reboot?'RECUPERAÇÃO DA SHELL':'SISTEMA LOCAL // 1998.10'}</strong>${reboot?'<code>MEMORY ........ DUPLICATE</code><code>ENTITY_B ...... PRESENT</code><code>SHELL.EXE ...... RECOVERED</code>':'<p>Uma sessão interrompida pode ser retomada manualmente.</p>'}</div><button type="button" data-action="${reboot?'os-reboot-return':'boot-fragment'}">${reboot?'REMONTAR DESKTOP':'INICIAR SISTEMA'}</button><small>NENHUMA CONEXÃO EXTERNA · PROGRESSO DA SESSÃO PRESERVADO</small></section>`;
}

function clockPanel(state) {
  const hh = String(state.desktopOs.clockHour).padStart(2,'0');
  const mm = String(state.desktopOs.clockMinute).padStart(2,'0');
  return `<section class="os-clock-panel" aria-label="Ajustar relógio do sistema" ${state.desktopOs.clockPanelOpen ? '' : 'hidden'}><header>DATA / HORA DO SISTEMA</header><div class="os-clock-adjust"><div><button type="button" data-action="os-clock-delta" data-unit="hour" data-delta="1">▲</button><output data-clock-hour>${hh}</output><button type="button" data-action="os-clock-delta" data-unit="hour" data-delta="-1">▼</button><small>HORA</small></div><b>:</b><div><button type="button" data-action="os-clock-delta" data-unit="minute" data-delta="1">▲</button><output data-clock-minute>${mm}</output><button type="button" data-action="os-clock-delta" data-unit="minute" data-delta="-1">▼</button><small>MINUTO</small></div></div><p>10/10/2025 · fuso local</p><footer><button type="button" data-action="os-clock-apply">APLICAR AO SISTEMA</button><button type="button" data-action="os-clock-toggle">CANCELAR</button></footer></section>`;
}

function desktop(puzzle, state) {
  const windows = state.desktopOs.windows || [];
  const world = computerWorldAt(state,puzzle?.id);
  const iconPositions = [[18,7],[18,29],[18,51],[18,73],[31,7],[31,29],[31,51],[31,73]];
  const baseIcons=[...BASE_DESKTOP_ICONS,['quarantine',5,89]];
  const icons = [...baseIcons, ...world.icons.map((id,index) => [id,...iconPositions[index % iconPositions.length]])];
  const clock = `${String(state.desktopOs.clockHour).padStart(2,'0')}:${String(state.desktopOs.clockMinute).padStart(2,'0')}`;
  return `<section class="retro-desktop retro-desktop--phase-${puzzle?.id || '01'} retro-desktop--${world.wallpaper}" data-retro-desktop data-world="computer">
    <div class="retro-wallpaper" aria-hidden="true"><i></i><span>RECUPERAÇÃO</span></div>
    <div class="os-desktop-icons">${icons.map(([id,x,y]) => iconMarkup(desktopResource(id,state),'desktop',[x,y])).join('')}</div>
    <div class="os-world-notice" ${world.notice ? '' : 'hidden'}><i></i><span>${escapeHtml(world.notice)}</span></div>
    <div class="os-window-layer">${windows.map((entry) => desktopWindowMarkup(entry,state)).join('')}</div>
    <div class="os-context-menu" data-os-context-menu hidden><button type="button" data-action="os-open-context">Abrir</button><button type="button" data-action="os-properties">Propriedades</button></div>
    <div class="os-start-menu ${state.desktopOs.startOpen ? 'is-open' : ''}" data-os-start-menu ${state.desktopOs.startOpen ? '' : 'hidden'}><header><strong>R</strong><span>ESTAÇÃO 1010</span></header><button type="button" data-action="os-open-resource" data-resource="computer">Meu computador</button><button type="button" data-action="os-open-resource" data-resource="documents">Documentos</button><hr><button type="button" data-action="os-shutdown">Suspender</button></div>
    ${clockPanel(state)}
    <footer class="os-taskbar"><button type="button" class="os-start" data-action="os-start"><i>R</i><span>SISTEMA</span></button><div class="os-running-windows">${windows.map((entry) => `<button type="button" data-action="os-task-window" data-window="${entry.key}">${escapeHtml(RESOURCES[entry.resourceId]?.name || 'Janela')}</button>`).join('')}</div><span class="os-system-status" title="Atividade da estação"><i></i>${escapeHtml(state.computer.processes.indexer.toUpperCase())}</span><button type="button" class="os-clock-button ${world.clockMode ? 'is-relevant' : ''}" data-action="os-clock-toggle" data-os-clock>${clock}</button></footer>
  </section>`;
}

export function renderPhaseOneComputer(puzzle, state) {
  const shellAvailable=state.flags.initialized && !['crashing','booting'].includes(state.computer.boot.status);
  return `<div class="retro-computer" data-phase-object="computer"><div class="retro-monitor"><div class="retro-monitor__screen">${shellAvailable ? desktop(puzzle,state) : bootScreen(state)}</div><div class="retro-monitor__brand"><i></i><span>R-1010</span><small>COLOR DISPLAY</small></div></div></div>`;
}
