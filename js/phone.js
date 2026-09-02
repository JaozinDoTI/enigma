import { escapeHtml } from './utils.js';
import { getLocalCaptureUrl } from './local-capture.js';

const UNKNOWN_MESSAGES = Object.freeze([
  ['message:first-file','você abriu justamente esse.'],
  ['message:not-first','você demorou pra perceber que mudou.'],
  ['message:first-time','você já viu esse horário.'],
  ['message:local-not-yours','local não significa seu.'],
  ['message:shell-lost','a estação ainda está respondendo.'],
  ['message:boot-02','você chamou isso de reiniciar.']
]);

const GALLERY = Object.freeze([
  { id:'cam-room', src:'./assets/images/camera-01.svg', label:'CAM_0001', meta:'10/10/2025 · cache local · quadro parcial' },
  { id:'curitiba', src:'./assets/images/camera-02.svg', label:'OBJETO_C', meta:'17/04/2019 · cache doméstico · identidade parcial' },
  { id:'moon', src:'./assets/images/moon-scan.svg', label:'SCAN_LUA', meta:'10/10/2025 · scanner local · exposição plana' },
  { id:'shelf', src:'./assets/evidence/books/shelf-cam-01.jpg', label:'ESTANTE_01', meta:'17/09/2025 · câmera doméstica · cópia comprimida', optional:true }
]);

const hasPhase = (state,id) => state.unlocked.includes(id) || state.completed.includes(id);
const wasDelivered = (state,id) => state.phone.delivered.includes(id);
const phoneTime = (state) => `${String(state.phone.clock.hour).padStart(2,'0')}:${String(state.phone.clock.minute).padStart(2,'0')}`;

export function renderPhoneStatus(state) {
  return `<time>${phoneTime(state)}</time><span aria-label="sinal local">▮▮▮</span><span>${state.phone.battery}%</span>`;
}

function lockScreen(state) {
  const latest = state.phone.notifications.at(-1);
  return `<section class="phone-lock"><time>${phoneTime(state)}</time><span>10 de outubro</span>${latest ? `<button type="button" class="phone-lock__notification" data-action="phone-unlock"><i>${escapeHtml(latest.label)}</i><strong>${escapeHtml(latest.preview)}</strong><small>toque para consultar</small></button>` : ''}<button type="button" class="phone-unlock" data-action="phone-unlock">DESBLOQUEAR</button></section>`;
}

function home(state) {
  const apps = [
    ['messages','▣','Mensagens',true],
    ['calls','◖','Chamadas',true],
    ['gallery','▧','Galeria',hasPhase(state,'08')],
    ['recorder','≋','Gravador',hasPhase(state,'13')],
    ['notes','▤','Notas',true],
    ['calendar','□','Calendário',hasPhase(state,'18')],
    ['files','⌑','Arquivos',true],
    ['camera','◉','CAM Archive',state.flags.clock0317Triggered]
  ];
  return `<section class="phone-home"><div class="phone-app-grid">${apps.filter(([, , ,available])=>available).map(([app,icon,label])=>`<button type="button" data-action="phone-app" data-phone-app="${app}"><i>${icon}</i><span>${label}</span>${app==='messages'&&state.phone.unread?`<b>${state.phone.unread}</b>`:''}</button>`).join('')}</div><p>dispositivo local · sem rede</p></section>`;
}

function messages(state) {
  if (state.phone.thread) {
    const known = UNKNOWN_MESSAGES.filter(([id]) => wasDelivered(state,id)).map(([id,text]) => ({ id,text }));
    const reactive = (state.phone.events || []).filter((item)=>item.type==='message' && !known.some((entry)=>entry.id===item.id)).map((item)=>({id:item.id,text:item.text}));
    const unknown = [...known,...reactive].map(({text}) => ['in',text]);
    const isJ = state.phone.thread === 'j';
    const chat = isJ ? [
      ['in','eu achei a foto em outra cópia.'],
      ['out','o objeto c?'],
      ['in','o anexo quebrou. o thumbnail ainda deve estar em Arquivos.']
    ] : unknown;
    return `<section class="phone-app phone-thread"><header><button type="button" data-action="phone-app" data-phone-app="messages" aria-label="Voltar">‹</button><strong>${isJ?'J.':'NÚMERO NÃO SALVO'}</strong></header><div class="phone-chat" data-phone-chat>${chat.map(([side,text])=>`<p class="is-${side}">${escapeHtml(text)}</p>`).join('')}${isJ?`<article class="phone-attachment is-broken"><div class="broken-image">DADOS AUSENTES</div><strong>IMG_1010.jpg</strong><small>original removido · referência: OBJETO_C.thumb</small><button type="button" data-action="phone-trace-memory" data-step="message">LOCALIZAR THUMBNAIL</button></article>`:''}</div></section>`;
  }
  const unknownPreview = state.phone.events?.at(-1)?.text || UNKNOWN_MESSAGES.filter(([id])=>wasDelivered(state,id)).at(-1)?.[1] || 'nenhuma mensagem entregue';
  return `<section class="phone-app phone-messages"><header><button type="button" data-action="phone-home" aria-label="Início">‹</button><strong>MENSAGENS</strong></header><button type="button" data-action="phone-thread" data-thread="unknown"><i>N</i><span><strong>NÚMERO NÃO SALVO</strong><small>${escapeHtml(unknownPreview)}</small></span>${state.phone.unread?'<b></b>':''}</button>${hasPhase(state,'12')?`<button type="button" data-action="phone-thread" data-thread="j"><i>J</i><span><strong>J.</strong><small>eu sabia que você ia achar essa foto</small></span></button>`:''}</section>`;
}

function calls(state) {
  const playing=state.phone.foregroundPlayback;
  return `<section class="phone-app phone-calls"><header><button type="button" data-action="phone-home" aria-label="Início">‹</button><strong>CHAMADAS</strong></header><div class="phone-call-list">${state.phone.calls.length ? state.phone.calls.map((call)=>`<article><i>↙</i><span><strong>${escapeHtml(call.from)}</strong><small>${escapeHtml(call.duration)} · ${escapeHtml(call.status)}</small></span><button type="button" data-action="phone-call-audio" data-signal="${escapeHtml(call.signal)}" ${playing?'disabled':''}>${playing?'REPRODUZINDO':'OUVIR'}</button></article>`).join('') : '<p>Nenhuma chamada registrada.</p>'}</div><div class="phone-call-caption ${playing?'is-playing':''}" data-phone-call-caption>${playing?'estática · impacto 01 · impacto 02 · impacto 03 · silêncio':'O histórico permanece neste dispositivo.'}</div></section>`;
}

function gallery(state) {
  const dynamic=(state.phone.gallery||[]).map((item)=>({id:item.id,src:item.capture?(getLocalCaptureUrl()||'./assets/images/camera-03.svg'):'./assets/images/camera-03.svg',label:item.label||item.id,meta:item.meta||'origem local desconhecida',volatile:Boolean(item.capture)}));
  const items=[...GALLERY,...dynamic];
  const selected = items.find((item)=>item.id===state.phone.galleryItem);
  if (selected) return `<section class="phone-app phone-gallery-detail"><header><button type="button" data-action="phone-gallery-close" aria-label="Voltar">‹</button><strong>${escapeHtml(selected.label)}</strong></header><div class="phone-gallery-image"><img src="${selected.src}" alt="${escapeHtml(selected.label)}"></div><dl><dt>METADATA</dt><dd>${escapeHtml(selected.meta)}</dd></dl><button type="button" data-action="phone-share-evidence" data-gallery="${selected.id}">ANEXAR À INVESTIGAÇÃO LOCAL</button></section>`;
  return `<section class="phone-app phone-gallery"><header><button type="button" data-action="phone-home" aria-label="Início">‹</button><strong>GALERIA</strong></header><div>${items.map((item)=>`<button type="button" data-action="phone-gallery-open" data-gallery="${item.id}" ${item.optional?'data-evidence-frame':''}><img src="${item.src}" alt=""><span>${escapeHtml(item.label)}</span>${item.volatile?'<i>MEMÓRIA VOLÁTIL</i>':item.optional?'<i class="phone-gallery-missing">CAPTURA AUSENTE</i>':''}</button>`).join('')}</div><p>As cópias possuem origens e compressões diferentes.</p></section>`;
}

function recorder(state) {
  const playing=state.phone.foregroundPlayback;
  return `<section class="phone-app phone-recorder ${playing?'is-playing':''}"><header><button type="button" data-action="phone-home">‹</button><strong>GRAVADOR</strong></header><div class="phone-wave" aria-label="Forma de onda de sete segundos">${Array.from({length:31},(_,i)=>`<i style="--h:${18+((i*17)%68)}%"></i>`).join('')}</div><strong>fonte_03.m4a</strong><span>${playing?'REPRODUZINDO 00:07':'00:07 · três impactos · ruído de sala'}</span><button type="button" data-action="phone-audio" ${playing?'disabled':''}>${playing?'REPRODUZINDO':'REPRODUZIR'}</button><i class="phone-playback-progress" aria-hidden="true"></i></section>`;
}

function notes(state) {
  return `<section class="phone-app phone-notes"><header><button type="button" data-action="phone-home">‹</button><strong>NOTAS</strong></header><p>comprar pilhas.</p><p>devolver o adaptador.</p>${(state.phone.notes||[]).map((note)=>`<p class="is-reactive">${escapeHtml(note.text)}</p>`).join('')}${hasPhase(state,'15')?'<p>não é a primeira leitura.</p>':''}${hasPhase(state,'23')?'<p>devolver o relógio para onde tudo começou.</p>':''}</section>`;
}

function calendar() {
  return `<section class="phone-app phone-calendar"><header><button type="button" data-action="phone-home">‹</button><strong>CALENDÁRIO</strong></header><time>10</time><span>OUTUBRO · 2025</span><article><strong>10:10</strong><p>nenhum título</p><small>criado antes da instalação deste dispositivo</small></article></section>`;
}

function files(state) {
  return `<section class="phone-app phone-files"><header><button type="button" data-action="phone-home">‹</button><strong>ARQUIVOS</strong></header>${hasPhase(state,'08')?`<article><i>IMG</i><span><strong>${state.flags.curitibaConfirmed?'IMG_CURITIBA_PRESENTE.jpg':'OBJETO_C.thumb'}</strong><small>${state.flags.curitibaConfirmed?'1,8 MB · metadata recuperada':'18 KB · cache parcial · ponte: CAM Archive'}</small></span>${hasPhase(state,'12')&&!state.flags.curitibaConfirmed?'<button type="button" data-action="phone-trace-memory" data-step="files">SEGUIR ORIGEM</button>':''}</article>`:'<p>Nenhum arquivo recente.</p>'}${(state.phone.artifacts||[]).map((item)=>`<article class="is-new"><i>${escapeHtml(item.kind||'DAT')}</i><span><strong>${escapeHtml(item.name||item.id)}</strong><small>${escapeHtml(item.meta||'origem local desconhecida')}</small></span></article>`).join('')}${hasPhase(state,'13')?'<article><i>REC</i><span><strong>fonte_03.m4a</strong><small>00:07 · local</small></span></article>':''}${state.flags.clock0317Triggered?'<article class="is-new"><i>DAT</i><span><strong>FRAME_0317.BMP</strong><small>metadata alterada</small></span></article>':''}</section>`;
}

function cameraArchive(state) {
  const frames = [
    ['./assets/images/camera-01.svg','FRAME_0017.JPG','03:12:44 · origem não catalogada'],
    ['./assets/images/camera-03.svg','FRAME_0018.JPG','03:14:09 · perda de dados: 18%'],
    ['./assets/images/camera-02.svg','FRAME_0317.BMP',state.phone.clock.synchronized?'03:17:00 · timestamp incompatível':'timestamp ilegível']
  ];
  const canRecover=state.phone.memoryTrail.includes('files');
  return `<section class="phone-app phone-camera-archive"><header><button type="button" data-action="phone-home">‹</button><strong>CAM ARCHIVE</strong></header>${frames.map(([src,label,meta],index)=>`<article class="${index===2&&canRecover?'is-memory-source':''}"><img src="${src}" alt="Captura simulada recuperada"><span><strong>${label}</strong><small>${meta}</small></span>${index===2&&canRecover?'<button type="button" data-action="phone-trace-memory" data-step="archive">RECUPERAR CÓPIA</button>':''}</article>`).join('')}${state.phone.memoryTrail.includes('archive')?`<article class="phone-memory-recovered"><img src="./assets/images/camera-02.svg" alt="Objeto têxtil recuperado"><span><strong>IMG_CURITIBA_PRESENTE.jpg</strong><small>OBJETO C · nome preservado: CURITIBA</small></span><button type="button" data-action="phone-confirm-memory">ANEXAR METADATA AO ARQUIVO</button></article>`:''}<p>CAPTURAS RECUPERADAS · câmera real não utilizada.</p></section>`;
}

export function renderPhoneScreen(state) {
  if (state.phone.locked) return lockScreen(state);
  if (state.phone.app === 'messages') return messages(state);
  if (state.phone.app === 'calls') return calls(state);
  if (state.phone.app === 'gallery') return gallery(state);
  if (state.phone.app === 'recorder') return recorder(state);
  if (state.phone.app === 'notes') return notes(state);
  if (state.phone.app === 'calendar') return calendar();
  if (state.phone.app === 'files') return files(state);
  if (state.phone.app === 'camera') return cameraArchive(state);
  return home(state);
}

export function renderPhoneDevice(state, { embedded = false } = {}) {
  return `<div class="phone-device ${embedded ? 'is-embedded' : ''}" data-phone-device data-motion-scope="device"><header class="phone-status" data-phone-status>${renderPhoneStatus(state)}</header><main data-phone-screen>${renderPhoneScreen(state)}</main>${state.phone.phantom?`<aside class="phone-phantom">${escapeHtml(state.phone.phantom.text)}</aside>`:''}<footer><button type="button" data-action="${embedded?'phone-home':'phone-toggle'}" aria-label="${embedded?'Tela inicial':'Abaixar celular'}"></button></footer></div>`;
}

export function patchPhoneDevices(state, { screen = false, status = false, badges = false } = {}) {
  document.querySelectorAll('[data-phone-device]').forEach((device) => {
    if (status) {
      const bar = device.querySelector('[data-phone-status]');
      if (bar) bar.innerHTML = renderPhoneStatus(state);
    }
    if (screen) {
      const target = device.querySelector('[data-phone-screen]');
      if (target) {
        const scrollTop = target.scrollTop;
        target.innerHTML = renderPhoneScreen(state);
        target.scrollTop = scrollTop;
        target.querySelectorAll('[data-evidence-source]').forEach((image)=>{
          const frame=image.closest('[data-evidence-frame]');
          const update=()=>frame?.classList.toggle('has-source',image.complete&&image.naturalWidth>0);
          image.addEventListener('load',update,{once:true});image.addEventListener('error',update,{once:true});update();
        });
      }
    }
  });
  if (badges) {
    document.querySelectorAll('.phone-prop').forEach((toggle) => {
      toggle.querySelector('b')?.remove();
      if (state.phone.unread) toggle.insertAdjacentHTML('beforeend',`<b>${state.phone.unread}</b>`);
    });
  }
}

export function patchPhoneDelivery(state, { type, payload }) {
  document.querySelectorAll('[data-phone-device]').forEach((device)=>{
    const screen=device.querySelector('[data-phone-screen]');
    if (!screen) return;
    const chat=screen.querySelector('[data-phone-chat]');
    if (type==='message' && state.phone.app==='messages' && state.phone.thread==='unknown' && chat) {
      const message=document.createElement('p');
      message.className='is-in';
      message.textContent=payload.text;
      chat.append(message);
      chat.scrollTop=chat.scrollHeight;
      return;
    }
    if ((type==='message' && screen.querySelector('.phone-messages')) || (type==='call' && screen.querySelector('.phone-calls'))) {
      const scrollTop=screen.scrollTop;
      screen.innerHTML=renderPhoneScreen(state);
      screen.scrollTop=scrollTop;
    }
  });
}

export function showPhoneNotification(notification) {
  if (!notification) return;
  document.querySelectorAll('[data-phone-dock]').forEach((dock) => {
    dock.classList.remove('is-waking','has-preview');
    dock.classList.add('has-notification','is-waking');
    const prop=dock.querySelector('[data-phone-prop]');
    if (prop) {
      prop.dataset.action='phone-open-notification';
      prop.dataset.kind=notification.kind;
      prop.dataset.notification=notification.id;
      prop.setAttribute('aria-label',`${notification.label}: ${notification.preview}. Pegar celular.`);
    }
    const alert=dock.querySelector('[data-phone-prop-alert]');
    if (alert) alert.innerHTML=`<strong>${escapeHtml(notification.label)}</strong><span>${escapeHtml(notification.preview)}</span>`;
    const held=dock.querySelector('[data-phone-device]');
    held?.classList.add('has-live-arrival');
    setTimeout(()=>held?.classList.remove('has-live-arrival'),900);
    requestAnimationFrame(()=>setTimeout(()=>{if(dock.classList.contains('has-notification')) dock.classList.add('has-preview');},220));
  });
}

export function renderPhoneDock(state, puzzle) {
  const available = state.unlocked.some((id)=>Number(id)>=3);
  if (!available || puzzle.id === '25' || puzzle.world === 'phone') return '';
  const latest=(state.phone.notifications||[]).filter((item)=>item.status!=='read').at(-1);
  const action=latest?'phone-open-notification':'phone-toggle';
  return `<aside class="phone-dock ${state.phone.open ? 'is-open' : ''}${latest?' has-notification has-preview':''}" data-phone-dock aria-label="Celular da investigação">
    <button type="button" class="phone-prop" data-phone-prop data-action="${action}" ${latest?`data-kind="${escapeHtml(latest.kind)}" data-notification="${escapeHtml(latest.id)}"`:''} aria-expanded="${state.phone.open}" aria-label="${latest?`${escapeHtml(latest.label)}: ${escapeHtml(latest.preview)}. Pegar celular.`:'Pegar celular'}">
      <i class="phone-prop__speaker"></i><span class="phone-prop__screen"><time>${phoneTime(state)}</time><em data-phone-prop-alert>${latest?`<strong>${escapeHtml(latest.label)}</strong><span>${escapeHtml(latest.preview)}</span>`:'<small>SEM ATIVIDADE</small>'}</em></span>${state.phone.unread?`<b>${state.phone.unread}</b>`:''}
    </button>
    <div class="phone-dock__backdrop" aria-hidden="true"></div><div class="phone-dock__device" ${state.phone.open?'':'hidden'}>${renderPhoneDevice(state)}</div>
  </aside>`;
}
