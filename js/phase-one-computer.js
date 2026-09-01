import { escapeHtml } from './utils.js';
import { computerWorldAt } from './worlds/computer-world.js';
import { puzzleFor } from './puzzles/catalog.js';
import { renderScene } from './scene-renderer.js';

const RESOURCE_LIST = [
  { id:'computer', name:'Meu computador', type:'folder', parent:'desktop', path:'C:\\', children:['system','documents','temp','backup','images','personal'] },
  { id:'documents', name:'Documentos', type:'folder', parent:'computer', path:'C:\\DOCUMENTOS', children:['work','shopping','untitled'] },
  { id:'notes', name:'NOTAS.txt', type:'text', parent:'desktop', created:'09/10/2025 21:02', modified:'09/10/2025 21:06', size:'1 KB', origin:'C:\\DOCUMENTOS', body:['devolver o adaptador','comprar pilhas','não mexer no relógio do sistema'] },
  { id:'trash', name:'Lixeira', type:'trash', parent:'desktop', path:'LIXEIRA', children:['old-image','draft'] },
  { id:'receiver-app', name:'RECEPTOR.exe', type:'program', parent:'desktop', created:'10/10/2025 10:10', modified:'10/10/2025 10:10', size:'31 KB', origin:'REGISTRO ISOLADO', target:'03' },
  { id:'analyzer-app', name:'ANALISADOR.exe', type:'program', parent:'desktop', created:'10/10/2025 10:11', modified:'10/10/2025 10:11', size:'82 KB', origin:'PACOTE RECUPERADO', target:'09' },
  { id:'recovery-app', name:'RECUPERAR.exe', type:'program', parent:'desktop', created:'10/10/2025 14:25', modified:'10/10/2025 14:25', size:'101 KB', origin:'MODELO RELACIONAL', target:'20' },
  { id:'bookscan-app', name:'BOOKSCAN.exe', type:'program', parent:'desktop', created:'10/10/2025 13:14', modified:'10/10/2025 13:14', size:'67 KB', origin:'IMAGEM RESIDUAL', target:'14' },
  { id:'truth-app', name:'INTEGRIDADE.exe', type:'program', parent:'desktop', created:'10/10/2025 23:10', modified:'10/10/2025 23:10', size:'131 KB', origin:'SISTEMA', target:'21' },
  { id:'mount-app', name:'MOUNT.exe', type:'program', parent:'desktop', created:'17/04/1991 08:00', modified:'10/10/2025 10:12', size:'38 KB', origin:'SISTEMA', target:'05', phaseApp:true },
  { id:'directory-app', name:'DIRETORIO_J', type:'program', parent:'desktop', created:'10/10/2025 10:08', modified:'10/10/2025 10:10', size:'51 KB', origin:'DOCUMENTOS', target:'07', phaseApp:true },
  { id:'dump-app', name:'DUMP_24.exe', type:'program', parent:'desktop', created:'10/10/2025 10:10', modified:'10/10/2025 10:11', size:'24 KB', origin:'DIRETORIO_J', target:'08', phaseApp:true },
  { id:'final-recovery-app', name:'RECUPERAR_FINAL.exe', type:'program', parent:'desktop', created:'10/10/2025 10:10', modified:'10/10/2025 10:10', size:'520 KB', origin:'DUAS CADEIAS', target:'24', phaseApp:true },
  { id:'clock-note', name:'0317.REC', type:'text', parent:'desktop', created:'17/04/1991 03:17', modified:'10/10/2025 03:17', size:'3 KB', origin:'RELÓGIO DO SISTEMA', body:['CALIBRAÇÃO ACEITA','ONDE A NOITE DEIXA O QUE VOCÊ PRECISA','o sistema não criou este arquivo; apenas deixou de escondê-lo'] },
  { id:'system', name:'SISTEMA', type:'folder', parent:'computer', path:'C:\\SISTEMA', children:['drivers','registers','config'] },
  { id:'temp', name:'TEMP', type:'folder', parent:'computer', path:'C:\\TEMP', children:['tmp1','cache','old-image'] },
  { id:'cam-cache', name:'CAM_CACHE', type:'folder', parent:'temp', path:'C:\\TEMP\\CAM_CACHE', children:[] },
  { id:'backup', name:'BACKUP', type:'folder', parent:'computer', path:'C:\\BACKUP', children:['backup1','backup2','event-old'] },
  { id:'images', name:'IMAGENS', type:'folder', parent:'computer', path:'C:\\IMAGENS', children:['camera-old','moon-thumb'] },
  { id:'personal', name:'PESSOAL', type:'folder', parent:'computer', path:'C:\\PESSOAL', children:['empty-folder','audio-note'] },
  { id:'drivers', name:'DRIVERS', type:'folder', parent:'system', path:'C:\\SISTEMA\\DRIVERS', children:['display-driver','audio-driver'] },
  { id:'registers', name:'REGISTROS', type:'folder', parent:'system', path:'C:\\SISTEMA\\REGISTROS', children:['log-0704','log-0709','event-1010','log-1011','log-1102','source-b'] },
  { id:'config', name:'CONFIG.SYS', type:'text', parent:'system', created:'17/04/1991 08:00', modified:'07/10/2025 18:42', size:'3 KB', origin:'INSTALAÇÃO LOCAL', body:['DISPLAY=VGA_640','AUDIO=VX_COMPAT','CLOCK=LOCAL','MOUNT=AUTO'] },
  { id:'work', name:'trabalho.txt', type:'text', parent:'documents', created:'02/10/2025 14:20', modified:'02/10/2025 17:41', size:'5 KB', origin:'USUÁRIO J.', body:['pendências da semana','confirmar manutenção do drive','reorganizar arquivos depois'] },
  { id:'shopping', name:'compras.txt', type:'text', parent:'documents', created:'09/10/2025 20:58', modified:'09/10/2025 21:06', size:'1 KB', origin:'USUÁRIO J.', body:['pilhas AA','fita removível','café','envelope plástico'] },
  { id:'untitled', name:'sem_nome.txt', type:'text', parent:'documents', created:'08/10/2025 00:31', modified:'08/10/2025 00:33', size:'0 KB', origin:'USUÁRIO J.', body:[''] },
  { id:'tmp1', name:'~$0001.tmp', type:'data', parent:'temp', created:'10/10/2025 09:44', modified:'10/10/2025 09:44', size:'16 KB', origin:'SISTEMA', body:['DADOS TEMPORÁRIOS','SEM CONTEÚDO LEGÍVEL'] },
  { id:'cache', name:'cache.dat', type:'data', parent:'temp', created:'10/10/2025 09:45', modified:'10/10/2025 09:58', size:'128 KB', origin:'SISTEMA', body:['CACHE DE VISUALIZAÇÃO','BLOCO 04 / 18'] },
  { id:'backup1', name:'backup_01', type:'folder', parent:'backup', path:'C:\\BACKUP\\backup_01', children:[] },
  { id:'backup2', name:'backup_02', type:'folder', parent:'backup', path:'C:\\BACKUP\\backup_02', children:[] },
  { id:'event-old', name:'evento.old', type:'data', parent:'backup', created:'09/10/2025 23:48', modified:'09/10/2025 23:48', size:'2 KB', origin:'BACKUP LOCAL', body:['VERSÃO ENCERRADA','NENHUM EVENTO ASSOCIADO'] },
  { id:'camera-old', name:'camera_01.bmp', type:'image', parent:'images', created:'08/10/2025 22:14', modified:'08/10/2025 22:14', size:'301 KB', origin:'CÂMERA DOMÉSTICA', source:'./assets/images/camera-01.svg' },
  { id:'moon-thumb', name:'tecido_scan.bmp', type:'image', parent:'images', created:'10/10/2025 10:08', modified:'10/10/2025 10:08', size:'184 KB', origin:'SCANNER LOCAL', source:'./assets/images/moon-scan.svg' },
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

export function desktopResource(id) { return RESOURCES[id] || null; }

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
  let childIds = [...(resource.children || [])];
  if (resource.id === 'temp' && state.flags.event1010Seen) childIds.push('cam-cache');
  if (resource.id === 'cam-cache' && state.flags.eventChanged) childIds = ['frame-0017','frame-0018','webcam-cache'];
  if (resource.id === 'cam-cache' && state.flags.clock0317Triggered) childIds = ['frame-0017','frame-0018','frame-0317','webcam-cache'];
  const children = childIds.map((id) => RESOURCES[id]).filter(Boolean);
  return `<div class="os-address"><span>ENDEREÇO</span><strong>${escapeHtml(resource.path || resource.name)}</strong></div><div class="os-folder-grid">${children.length ? children.map((child) => iconMarkup(child)).join('') : '<p class="os-empty-folder">Esta pasta está vazia.</p>'}</div><footer class="os-statusbar">${children.length} objeto${children.length === 1 ? '' : 's'}<span>${escapeHtml(resource.path || '')}</span></footer>`;
}

function textBody(resource) {
  return `<div class="os-document-reader">${(resource.body || []).map((line) => `<p>${escapeHtml(line) || '&nbsp;'}</p>`).join('')}</div><footer class="os-statusbar">SOMENTE LEITURA<span>${escapeHtml(resource.size || '0 KB')}</span></footer>`;
}

function logBody(resource, state) {
  const isolated = state.completed.includes('02');
  const altered = resource.anomaly && computerWorldAt(state,state.currentPuzzle).mutations.some((mutation)=>mutation.id==='event-rewrite');
  const lines = [...(resource.body || []), ...(altered ? ['10:10:00  ASSINATURA REESCRITA','DUAS FONTES PRESENTES NO MESMO EVENTO','CHECKSUM ANTERIOR ≠ CHECKSUM ATUAL'] : [])];
  const anomalyAction = !isolated
    ? '<button type="button" class="os-dialog-button" data-action="os-isolate-event">ISOLAR REGISTRO</button>'
    : altered && !state.flags.eventChanged
      ? '<button type="button" class="os-dialog-button os-dialog-button--alert" data-action="os-ack-change">PROCESSAR ALTERAÇÃO</button>'
      : `<p class="os-isolated">${altered?'VERSÃO 02 PROCESSADA // DUAS FONTES':'REGISTRO ISOLADO // CONSULTA'}</p>`;
  return `<div class="os-log-viewer"><header><span>LEITOR DE ÍNDICE</span><strong>${escapeHtml(resource.name)}</strong></header>${lines.map((line) => `<code>${escapeHtml(line)}</code>`).join('')}${resource.anomaly ? `<div class="os-log-origin"><span>ORIGEM DECLARADA</span><strong>${escapeHtml(resource.origin)}</strong></div>${anomalyAction}` : ''}</div>`;
}

function imageBody(resource) {
  return `<figure class="os-image-viewer"><header><button type="button" data-action="os-image-zoom" data-delta="-.25">−</button><span>ZOOM <output data-image-zoom>100%</output></span><button type="button" data-action="os-image-zoom" data-delta=".25">+</button><button type="button" data-action="os-image-enhance">REALÇAR</button></header><div data-image-canvas><img src="${resource.source}" alt="Imagem antiga: ${escapeHtml(resource.name)}"></div><figcaption>${escapeHtml(resource.name)} · ${escapeHtml(resource.size)} · ${escapeHtml(resource.origin || 'ORIGEM DESCONHECIDA')}</figcaption></figure>`;
}

function audioBody(resource) {
  return `<div class="os-audio-player"><div class="os-audio-reels" aria-hidden="true"><i></i><span></span><i></i></div><strong>${escapeHtml(resource.name)}</strong><p>${escapeHtml((resource.body || []).join(' · '))}</p><button type="button" data-action="os-audio-preview">REPRODUZIR</button></div>`;
}

function programBody(resource, state) {
  const targetPuzzle = resource.target ? puzzleFor(resource.target) : null;
  const isNative = resource.phaseApp || resource.id === 'bookscan-app' || resource.id === 'truth-app';
  if (isNative && targetPuzzle && resource.target === state.currentPuzzle) return `<div class="os-native-app">${renderScene(targetPuzzle,state)}</div>`;
  return `<div class="os-program"><div class="os-program__mark">R</div><span>PROGRAMA INSTALADO PELO SISTEMA</span><strong>${escapeHtml(resource.name)}</strong><p>Este dispositivo opera fora da estação gráfica.</p><button type="button" class="os-dialog-button" data-action="navigate" data-target="${resource.target}">EXECUTAR</button></div>`;
}

function propertiesBody(resource) {
  const rows = [
    ['TIPO',resource.type.toUpperCase()],['LOCAL',resource.path || `C:\\${String(resource.parent || '').toUpperCase()}`],
    ['CRIADO',resource.created || '—'],['MODIFICADO',resource.modified || '—'],['TAMANHO',resource.size || '—'],
    ['ORIGEM',resource.origin || 'ESTAÇÃO R-1010'],['ATRIBUTOS',resource.attributes || 'ARQUIVO']
  ];
  return `<div class="os-properties"><div class="os-properties__identity">${glyph(resource.type)}<strong>${escapeHtml(resource.name)}</strong></div><dl>${rows.map(([label,value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl><footer><button type="button" class="os-dialog-button" data-action="os-window-close">FECHAR</button></footer></div>`;
}

function resourceBody(entry, state) {
  const resource = RESOURCES[entry.resourceId];
  if (!resource) return '<p>OBJETO INDISPONÍVEL</p>';
  if (entry.kind === 'properties') return propertiesBody(resource);
  if (resource.type === 'folder' || resource.type === 'trash') return folderBody(resource,state);
  if (resource.type === 'image') return imageBody(resource);
  if (resource.type === 'audio') return audioBody(resource);
  if (resource.type === 'program') return programBody(resource, state);
  if (resource.type === 'log' || resource.type === 'data') return logBody(resource, state);
  return textBody(resource);
}

export function desktopWindowMarkup(entry, state) {
  const resource = RESOURCES[entry.resourceId];
  if (!resource) return '';
  const title = entry.kind === 'properties' ? `Propriedades de ${resource.name}` : resource.name;
  const classes = ['os-window', `os-window--${entry.kind === 'properties' ? 'properties' : resource.type}`, entry.maximized ? 'is-maximized' : '', entry.minimized ? 'is-minimized' : ''].filter(Boolean).join(' ');
  return `<section class="${classes}" data-os-window="${entry.key}" data-resource="${resource.id}" style="--win-x:${entry.x}px;--win-y:${entry.y}px;--win-z:${entry.z}" aria-label="Janela ${escapeHtml(title)}">
    <header class="os-titlebar" data-os-titlebar><span>${glyph(resource.type)}<strong>${escapeHtml(title)}</strong></span><div><button type="button" data-action="os-window-minimize" aria-label="Minimizar">_</button><button type="button" data-action="os-window-maximize" aria-label="Maximizar">□</button><button type="button" data-action="os-window-close" aria-label="Fechar">×</button></div></header>
    <div class="os-window__body">${resourceBody(entry,state)}</div>
  </section>`;
}

function bootScreen() {
  return `<section class="retro-boot"><div class="retro-boot__mark"><i></i><span>R</span></div><div><span>ESTAÇÃO GRÁFICA R-1010</span><strong>SISTEMA LOCAL // 1998.10</strong><p>Uma sessão interrompida pode ser retomada manualmente.</p></div><button type="button" data-action="boot-fragment">INICIAR SISTEMA</button><small>NENHUMA CONEXÃO EXTERNA · VOLUME A: PRESENTE</small></section>`;
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
  const icons = [...BASE_DESKTOP_ICONS, ...world.icons.map((id,index) => [id,...iconPositions[index % iconPositions.length]])];
  const clock = `${String(state.desktopOs.clockHour).padStart(2,'0')}:${String(state.desktopOs.clockMinute).padStart(2,'0')}`;
  return `<section class="retro-desktop retro-desktop--phase-${puzzle?.id || '01'} retro-desktop--${world.wallpaper}" data-retro-desktop data-world="computer">
    <div class="retro-wallpaper" aria-hidden="true"><i></i><span>RECUPERAÇÃO</span></div>
    <div class="os-desktop-icons">${icons.map(([id,x,y]) => iconMarkup(RESOURCES[id],'desktop',[x,y])).join('')}</div>
    <div class="os-world-notice" ${world.notice ? '' : 'hidden'}><i></i><span>${escapeHtml(world.notice)}</span></div>
    <div class="os-window-layer">${windows.map((entry) => desktopWindowMarkup(entry,state)).join('')}</div>
    <div class="os-context-menu" data-os-context-menu hidden><button type="button" data-action="os-open-context">Abrir</button><button type="button" data-action="os-properties">Propriedades</button></div>
    <div class="os-start-menu ${state.desktopOs.startOpen ? 'is-open' : ''}" data-os-start-menu ${state.desktopOs.startOpen ? '' : 'hidden'}><header><strong>R</strong><span>ESTAÇÃO 1010</span></header><button type="button" data-action="os-open-resource" data-resource="computer">Meu computador</button><button type="button" data-action="os-open-resource" data-resource="documents">Documentos</button><hr><button type="button" data-action="os-shutdown">Suspender</button></div>
    ${clockPanel(state)}
    <footer class="os-taskbar"><button type="button" class="os-start" data-action="os-start"><i>R</i><span>SISTEMA</span></button><div class="os-running-windows">${windows.map((entry) => `<button type="button" data-action="os-task-window" data-window="${entry.key}">${escapeHtml(RESOURCES[entry.resourceId]?.name || 'Janela')}</button>`).join('')}</div><button type="button" class="os-clock-button ${world.clockMode ? 'is-relevant' : ''}" data-action="os-clock-toggle" data-os-clock>${clock}</button></footer>
  </section>`;
}

export function renderPhaseOneComputer(puzzle, state) {
  return `<div class="retro-computer" data-phase-object="computer"><div class="retro-monitor"><div class="retro-monitor__screen">${state.flags.initialized ? desktop(puzzle,state) : bootScreen()}</div><div class="retro-monitor__brand"><i></i><span>R-1010</span><small>COLOR DISPLAY</small></div></div></div>`;
}
