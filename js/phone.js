import { escapeHtml } from './utils.js';

const UNKNOWN_MESSAGES = Object.freeze([
  ['message:first-file','vocÃª abriu justamente esse.'],
  ['message:not-first','vocÃª demorou pra perceber que mudou.'],
  ['message:first-time','vocÃª jÃ¡ viu esse horÃ¡rio.'],
  ['message:local-not-yours','local nÃ£o significa seu.']
]);

const GALLERY = Object.freeze([
  { id:'cam-room', src:'./assets/images/webcam-frame-0017.jpg', label:'CAM_0001', meta:'08/10/2025 Â· cÃ¢mera domÃ©stica Â· quarto vazio' },
  { id:'mullet', src:'./assets/images/camera-02.svg', label:'IMG_2019', meta:'17/04/2019 Â· cÃ¢mera frontal Â· metadata recuperada' },
  { id:'moon', src:'./assets/images/moon-scan.svg', label:'SCAN_LUA', meta:'10/10/2025 Â· scanner local Â· exposiÃ§Ã£o plana' },
  { id:'shelf', src:'./assets/evidence/books/shelf-cam-01.jpg', label:'ESTANTE_01', meta:'17/09/2025 Â· cÃ¢mera domÃ©stica Â· cÃ³pia comprimida', optional:true }
]);

const hasPhase = (state,id) => state.unlocked.includes(id) || state.completed.includes(id);
const wasDelivered = (state,id) => state.phone.delivered.includes(id);
const phoneTime = (state) => `${String(state.phone.clock.hour).padStart(2,'0')}:${String(state.phone.clock.minute).padStart(2,'0')}`;

export function renderPhoneStatus(state) {
  return `<time>${phoneTime(state)}</time><span aria-label="sinal local">â–®â–®â–®</span><span>${state.phone.battery}%</span>`;
}

function lockScreen(state) {
  const latest = state.phone.notifications.at(-1);
  return `<section class="phone-lock"><time>${phoneTime(state)}</time><span>10 de outubro</span>${latest ? `<button type="button" class="phone-lock__notification" data-action="phone-unlock"><i>${escapeHtml(latest.label)}</i><strong>${escapeHtml(latest.preview)}</strong><small>toque para consultar</small></button>` : ''}<button type="button" class="phone-unlock" data-action="phone-unlock">DESBLOQUEAR</button></section>`;
}

function home(state) {
  const apps = [
    ['messages','â–£','Mensagens',true],
    ['calls','â—–','Chamadas',state.phone.calls.length > 0 || hasPhase(state,'03')],
    ['gallery','â–§','Galeria',hasPhase(state,'12')],
    ['recorder','â‰‹','Gravador',hasPhase(state,'17')],
    ['notes','â–¤','Notas',hasPhase(state,'20')],
    ['calendar','â–¡','CalendÃ¡rio',hasPhase(state,'23')],
    ['files','âŒ‘','Arquivos',hasPhase(state,'14')],
    ['camera','â—‰','CAM Archive',state.flags.clock0317Triggered]
  ];
  return `<section class="phone-home"><div class="phone-app-grid">${apps.filter(([, , ,available])=>available).map(([app,icon,label])=>`<button type="button" data-action="phone-app" data-phone-app="${app}"><i>${icon}</i><span>${label}</span>${app==='messages'&&state.phone.unread?`<b>${state.phone.unread}</b>`:''}</button>`).join('')}</div><p>dispositivo local Â· sem rede</p></section>`;
}

function messages(state) {
  if (state.phone.thread) {
    const unknown = UNKNOWN_MESSAGES.filter(([id]) => wasDelivered(state,id)).map(([,text]) => ['in',text]);
    const isJ = state.phone.thread === 'j';
    const chat = isJ ? [
      ['in','vocÃª ainda chama aquilo de â€œsÃ³ um corteâ€?'],
      ['out','nÃ£o comeÃ§a'],
      ['in','eu achei a foto antiga. a metadata sobreviveu.']
    ] : unknown;
    return `<section class="phone-app phone-thread"><header><button type="button" data-action="phone-app" data-phone-app="messages" aria-label="Voltar">â€¹</button><strong>${isJ?'J.':'NÃšMERO NÃƒO SALVO'}</strong></header><div class="phone-chat" data-phone-chat>${chat.map(([side,text])=>`<p class="is-${side}">${escapeHtml(text)}</p>`).join('')}${isJ?`<article class="phone-attachment"><img src="./assets/images/camera-02.svg" alt="Fotografia antiga recuperada"><strong>IMG_2019_MULLET.jpg</strong><small>17/04/2019 Â· cÃ¢mera frontal Â· comentÃ¡rio: â€œele vai negar atÃ© o fimâ€</small><button type="button" data-action="phone-confirm-memory">ANEXAR METADATA AO ARQUIVO</button></article>`:''}</div></section>`;
  }
  const unknownPreview = UNKNOWN_MESSAGES.filter(([id])=>wasDelivered(state,id)).at(-1)?.[1] || 'nenhuma mensagem entregue';
  return `<section class="phone-app phone-messages"><header><button type="button" data-action="phone-home" aria-label="InÃ­cio">â€¹</button><strong>MENSAGENS</strong></header><button type="button" data-action="phone-thread" data-thread="unknown"><i>N</i><span><strong>NÃšMERO NÃƒO SALVO</strong><small>${escapeHtml(unknownPreview)}</small></span>${state.phone.unread?'<b></b>':''}</button>${hasPhase(state,'12')?`<button type="button" data-action="phone-thread" data-thread="j"><i>J</i><span><strong>J.</strong><small>eu sabia que vocÃª ia achar essa foto</small></span></button>`:''}</section>`;
}

function calls(state) {
  return `<section class="phone-app phone-calls"><header><button type="button" data-action="phone-home" aria-label="InÃ­cio">â€¹</button><strong>CHAMADAS</strong></header><div class="phone-call-list">${state.phone.calls.length ? state.phone.calls.map((call)=>`<article><i>â†™</i><span><strong>${escapeHtml(call.from)}</strong><small>${escapeHtml(call.duration)} Â· ${escapeHtml(call.status)}</small></span><button type="button" data-action="phone-call-audio" data-signal="${escapeHtml(call.signal)}">OUVIR</button></article>`).join('') : '<p>Nenhuma chamada registrada.</p>'}</div><div class="phone-call-caption" data-phone-call-caption>O histÃ³rico permanece neste dispositivo.</div></section>`;
}

function gallery(state) {
  const selected = GALLERY.find((item)=>item.id===state.phone.galleryItem);
  if (selected) return `<section class="phone-app phone-gallery-detail"><header><button type="button" data-action="phone-gallery-close" aria-label="Voltar">â€¹</button><strong>${escapeHtml(selected.label)}</strong></header><div class="phone-gallery-image"><img src="${selected.src}" alt="${escapeHtml(selected.label)}"></div><dl><dt>METADATA</dt><dd>${escapeHtml(selected.meta)}</dd></dl><button type="button" data-action="phone-share-evidence" data-gallery="${selected.id}">ANEXAR Ã€ INVESTIGAÃ‡ÃƒO LOCAL</button></section>`;
  return `<section class="phone-app phone-gallery"><header><button type="button" data-action="phone-home" aria-label="InÃ­cio">â€¹</button><strong>GALERIA</strong></header><div>${GALLERY.map((item)=>`<button type="button" data-action="phone-gallery-open" data-gallery="${item.id}" ${item.optional?'data-evidence-frame':''}><img src="${item.src}" alt="" ${item.optional?'data-evidence-source':''}><span>${escapeHtml(item.label)}</span>${item.optional?'<i class="phone-gallery-missing">CAPTURA AUSENTE</i>':''}</button>`).join('')}</div><p>As cÃ³pias possuem origens e compressÃµes diferentes.</p></section>`;
}

function recorder() {
  return `<section class="phone-app phone-recorder"><header><button type="button" data-action="phone-home">â€¹</button><strong>GRAVADOR</strong></header><div class="phone-wave" aria-label="Forma de onda de sete segundos">${Array.from({length:31},(_,i)=>`<i style="--h:${18+((i*17)%68)}%"></i>`).join('')}</div><strong>fonte_03.m4a</strong><span>00:07 Â· trÃªs impactos Â· ruÃ­do de sala</span><button type="button" data-action="phone-audio">REPRODUZIR</button></section>`;
}

function notes() {
  return `<section class="phone-app phone-notes"><header><button type="button" data-action="phone-home">â€¹</button><strong>NOTAS</strong></header><p>nÃ£o Ã© a primeira leitura.</p><p>devolver o relÃ³gio para onde tudo comeÃ§ou.</p></section>`;
}

function calendar() {
  return `<section class="phone-app phone-calendar"><header><button type="button" data-action="phone-home">â€¹</button><strong>CALENDÃRIO</strong></header><time>10</time><span>OUTUBRO Â· 2025</span><article><strong>10:10</strong><p>nenhum tÃ­tulo</p><small>criado antes da instalaÃ§Ã£o deste dispositivo</small></article></section>`;
}

function files(state) {
  return `<section class="phone-app phone-files"><header><button type="button" data-action="phone-home">â€¹</button><strong>ARQUIVOS</strong></header><article><i>IMG</i><span><strong>IMG_2019_MULLET.jpg</strong><small>1,8 MB Â· local</small></span></article><article><i>REC</i><span><strong>fonte_03.m4a</strong><small>00:07 Â· local</small></span></article>${state.flags.clock0317Triggered?'<article class="is-new"><i>DAT</i><span><strong>FRAME_0317.BMP</strong><small>metadata alterada</small></span></article>':''}</section>`;
}

function cameraArchive(state) {
  const frames = [
    ['./assets/images/webcam-frame-0017.jpg','FRAME_0017.JPG','03:12:44 Â· TV desligada'],
    ['./assets/images/webcam-frame-0018.jpg','FRAME_0018.JPG','03:14:09 Â· compressÃ£o incompleta'],
    ['./assets/images/webcam-frame-0317.jpg','FRAME_0317.BMP',state.phone.clock.synchronized?'03:17:00 Â· relÃ³gio incompatÃ­vel':'timestamp ilegÃ­vel']
  ];
  return `<section class="phone-app phone-camera-archive"><header><button type="button" data-action="phone-home">â€¹</button><strong>CAM ARCHIVE</strong></header>${frames.map(([src,label,meta])=>`<article><img src="${src}" alt="Captura simulada recuperada"><span><strong>${label}</strong><small>${meta}</small></span></article>`).join('')}<p>CAPTURAS RECUPERADAS Â· cÃ¢mera real nÃ£o utilizada.</p></section>`;
}

export function renderPhoneScreen(state) {
  if (state.phone.locked) return lockScreen(state);
  if (state.phone.app === 'messages') return messages(state);
  if (state.phone.app === 'calls') return calls(state);
  if (state.phone.app === 'gallery') return gallery(state);
  if (state.phone.app === 'recorder') return recorder();
  if (state.phone.app === 'notes') return notes();
  if (state.phone.app === 'calendar') return calendar();
  if (state.phone.app === 'files') return files(state);
  if (state.phone.app === 'camera') return cameraArchive(state);
  return home(state);
}

export function renderPhoneDevice(state, { embedded = false } = {}) {
  return `<div class="phone-device ${embedded ? 'is-embedded' : ''}" data-phone-device data-motion-scope="device"><header class="phone-status" data-phone-status>${renderPhoneStatus(state)}</header><main data-phone-screen>${renderPhoneScreen(state)}</main><footer><button type="button" data-action="phone-home" aria-label="Tela inicial"></button></footer></div>`;
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
    document.querySelectorAll('.phone-dock__toggle').forEach((toggle) => {
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
    dock.classList.add('has-notification');
    dock.querySelector('.phone-notification')?.remove();
    dock.insertAdjacentHTML('beforeend',`<button type="button" class="phone-notification" data-action="phone-open-notification" data-kind="${notification.kind}"><strong>${escapeHtml(notification.label)}</strong><span>${escapeHtml(notification.preview)}</span></button>`);
  });
}

export function renderPhoneDock(state, puzzle) {
  const available = state.unlocked.includes('10') || state.unlocked.includes('12');
  if (!available || puzzle.id === '25' || puzzle.world === 'phone') return '';
  return `<aside class="phone-dock ${state.phone.open ? 'is-open' : ''}" data-phone-dock aria-label="Celular da investigaÃ§Ã£o"><button type="button" class="phone-dock__toggle" data-action="phone-toggle" aria-expanded="${state.phone.open}"><i></i><span>CELULAR</span>${state.phone.unread?`<b>${state.phone.unread}</b>`:''}</button><div class="phone-dock__device" ${state.phone.open?'':'hidden'}>${renderPhoneDevice(state)}</div></aside>`;
}
