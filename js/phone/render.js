import { escapeHtml } from '../utils.js';
import { getLocalCaptureUrl } from '../local-capture.js';
import { PHONE_APPS } from './catalog.js';
import { phoneClock, selectNotifications, selectPhoneKind, selectRingingCall, selectThread, selectTyping, selectUnreadCount } from './selectors.js';

const stateLabel={ringing:'chamando',answered:'atendida',rejected:'recusada',missed:'perdida',returned:'retorno sem resposta'};
const hasPhase=(state,id)=>state.unlocked.includes(id)||state.completed.includes(id);

function appHeader(title,back='phone-home') {
  return `<header class="phone-appbar"><button type="button" data-action="${back}" aria-label="Voltar">‹</button><strong>${escapeHtml(title)}</strong><i></i></header>`;
}

function lockScreen(state) {
  const notifications=selectNotifications(state).slice(-3).reverse();
  return `<section class="phone-lockscreen"><div><time>${phoneClock(state)}</time><span>sexta-feira, 10 de outubro</span></div><div class="phone-lock-notifications">${notifications.map((item)=>`<button type="button" data-action="phone-open-notification" data-entry="${escapeHtml(item.id)}"><i>${escapeHtml(item.label)}</i><strong>${escapeHtml(item.preview)}</strong><small>agora</small></button>`).join('')}</div><button type="button" class="phone-swipe" data-action="phone-unlock"><i></i><span>deslize para desbloquear</span></button></section>`;
}

function home(state) {
  const unread=selectUnreadCount(state);
  return `<section class="phone-home-screen"><div class="phone-widget"><time>${phoneClock(state)}</time><span>10 OUT · sem rede</span></div><div class="phone-app-grid">${PHONE_APPS.map(([app,icon,label])=>`<button type="button" data-action="phone-app" data-phone-app="${app}"><i>${icon}</i><span>${label}</span>${app==='messages'&&unread?`<b>${unread}</b>`:''}</button>`).join('')}</div><div class="phone-dock-row"><button type="button" data-action="phone-app" data-phone-app="calls">☎</button><button type="button" data-action="phone-app" data-phone-app="messages">✉</button><button type="button" data-action="phone-app" data-phone-app="camera">◉</button></div></section>`;
}

function threadList(state) {
  const threads=[['j','J.'],['mae','Mãe'],['unknown','Número não salvo']];
  return `<section class="phone-app phone-messages">${appHeader('Mensagens')}${threads.map(([id,name])=>{const messages=selectThread(state,id);if(!messages.length)return '';const latest=messages.at(-1);const unread=messages.some((entry)=>!entry.seenAt);return `<button type="button" class="phone-list-row" data-action="phone-thread" data-thread="${id}"><i>${escapeHtml(name.slice(0,1))}</i><span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(latest.payload.text)}</small></span><time>${escapeHtml(latest.payload.timestamp||'agora')}</time>${unread?'<b></b>':''}</button>`;}).join('')}</section>`;
}

function attachmentDetail(state,entry) {
  const attachment=entry?.payload?.attachment;
  if(!attachment)return threadList(state);
  return `<section class="phone-app phone-attachment-detail">${appHeader(attachment.name,'phone-back-thread')}<div class="phone-corrupt-preview"><i></i><span>Não foi possível abrir a imagem</span></div><dl><div><dt>Nome</dt><dd>${escapeHtml(attachment.name)}</dd></div><div><dt>Estado</dt><dd>dados incompletos</dd></div><div><dt>Referência local</dt><dd>${escapeHtml(attachment.reference)}</dd></div></dl><button type="button" class="phone-system-action" data-action="phone-related-file" data-entry="phase12:file">Abrir em Arquivos</button></section>`;
}

function messages(state) {
  const route=state.phone.route;
  if(route.view==='attachment')return attachmentDetail(state,state.phone.entries[route.id]);
  if(route.view!=='thread')return threadList(state);
  const items=selectThread(state,route.id);const name=route.id==='j'?'J.':route.id==='mae'?'Mãe':'Número não salvo';
  return `<section class="phone-app phone-thread">${appHeader(name,'phone-back-messages')}<div class="phone-chat">${items.map((entry)=>`<article class="is-${entry.payload.side||'in'}${entry.editedAt?' is-edited':''}"><p>${escapeHtml(entry.payload.text)}</p>${entry.payload.attachment?`<button type="button" class="phone-chat-attachment" data-action="phone-attachment" data-entry="${escapeHtml(entry.id)}"><span class="phone-broken-thumb">×</span><span><strong>${escapeHtml(entry.payload.attachment.name)}</strong><small>imagem indisponível · toque para ver detalhes</small></span></button>`:''}<time>${escapeHtml(entry.payload.timestamp||'agora')}${entry.editedAt?' · editada':''}</time></article>`).join('')}${selectTyping(state,route.id)?'<div class="phone-typing"><i></i><i></i><i></i></div>':''}</div></section>`;
}

function calls(state) {
  const calls=selectPhoneKind(state,'call').slice().reverse();
  return `<section class="phone-app phone-calls">${appHeader('Telefone')}<nav><button class="is-active">Recentes</button><button>Contatos</button></nav>${calls.map((entry)=>`<article class="phone-list-row"><i>${entry.payload.callState==='missed'?'↙':'↗'}</i><span><strong>${escapeHtml(entry.payload.person)}</strong><small>${escapeHtml(stateLabel[entry.payload.callState]||entry.payload.callState)} · ${escapeHtml(entry.payload.duration||'00:00')}</small></span><time>${escapeHtml(entry.payload.timestamp||'agora')}</time>${entry.payload.callState==='missed'?`<button type="button" data-action="phone-call-return" data-entry="${escapeHtml(entry.id)}" aria-label="Retornar chamada">☎</button>`:''}${entry.payload.signal&&entry.payload.signal!=='normal'&&entry.payload.callState!=='ringing'?`<button type="button" data-action="phone-play-audio" data-signal="${escapeHtml(entry.payload.signal)}">ouvir</button>`:''}</article>`).join('')}</section>`;
}

function gallery(state,archive=false) {
  const route=state.phone.route;const items=selectPhoneKind(state,'gallery').filter((entry)=>archive?entry.payload.archive:!entry.payload.archive);
  const selected=route.view==='detail'?state.phone.entries[route.id]:null;
  const imageFor=(entry)=>entry.payload.capture?(getLocalCaptureUrl()||'./assets/images/camera-03.svg'):(entry.payload.src||'./assets/images/camera-03.svg');
  if(selected)return `<section class="phone-app phone-gallery-detail">${appHeader(archive?'CAM Archive':'Galeria',archive?'phone-back-camera':'phone-back-gallery')}<img src="${escapeHtml(imageFor(selected))}" alt="${escapeHtml(selected.payload.label)}"><div><strong>${escapeHtml(selected.payload.name)}</strong><small>${escapeHtml(selected.payload.meta)}</small></div>${selected.id==='phase12:frame'&&!state.flags.curitibaConfirmed?'<button type="button" class="phone-system-action" data-action="phone-save-metadata" data-entry="phase12:frame">Salvar nos detalhes</button>':''}</section>`;
  return `<section class="phone-app phone-gallery">${appHeader(archive?'CAM Archive':'Galeria')}<div>${items.map((entry)=>`<button type="button" data-action="phone-gallery-item" data-entry="${escapeHtml(entry.id)}"><img src="${escapeHtml(imageFor(entry))}" alt=""><span>${escapeHtml(entry.payload.label)}</span><small>${escapeHtml(entry.payload.name)}</small></button>`).join('')}</div>${archive?'<p>Cópias locais recuperadas automaticamente.</p>':''}</section>`;
}

function files(state) {
  const route=state.phone.route;const selected=route.view==='detail'?state.phone.entries[route.id]:null;
  if(selected)return `<section class="phone-app phone-file-detail">${appHeader(selected.payload.name,'phone-back-files')}<div class="phone-file-icon">${escapeHtml(selected.payload.fileType||'DAT')}</div><dl><div><dt>Tamanho</dt><dd>${escapeHtml(selected.payload.size||'—')}</dd></div><div><dt>Local</dt><dd>${escapeHtml(selected.payload.location||'Armazenamento interno')}</dd></div><div><dt>Detalhes</dt><dd>${escapeHtml(selected.payload.detail||'arquivo local')}</dd></div></dl>${selected.id==='phase12:file'?'<button type="button" class="phone-system-action" data-action="phone-open-archive">Abrir CAM Archive</button>':''}</section>`;
  return `<section class="phone-app phone-files">${appHeader('Arquivos')}<h2>Recentes</h2>${selectPhoneKind(state,'file').slice().reverse().map((entry)=>`<button type="button" class="phone-list-row" data-action="phone-file-item" data-entry="${escapeHtml(entry.id)}"><i>${escapeHtml(entry.payload.fileType||'DAT')}</i><span><strong>${escapeHtml(entry.payload.name)}</strong><small>${escapeHtml(entry.payload.size||'')} · ${escapeHtml(entry.payload.location||'interno')}</small></span></button>`).join('')}</section>`;
}

function notes(state) {return `<section class="phone-app phone-notes">${appHeader('Notas')}${selectPhoneKind(state,'note').map((entry)=>`<article><strong>${escapeHtml(entry.payload.title)}</strong><p>${escapeHtml(entry.payload.text).replaceAll('\n','<br>')}</p><small>${escapeHtml(entry.payload.timestamp||'')}</small></article>`).join('')}</section>`;}
function contacts(state) {const additions=selectPhoneKind(state,'contact');const contacts=[{id:'j',name:'J.',number:'local-01'},{id:'mae',name:'Mãe',number:'(41) 9••••-0101'},{id:'assist',name:'Assistência',number:'ramal 04'},...additions.map((entry)=>({id:entry.id,...entry.payload}))];return `<section class="phone-app phone-contacts">${appHeader('Contatos')}${contacts.map((item)=>`<article class="phone-list-row"><i>${escapeHtml(item.name.slice(0,1))}</i><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.number)}</small></span></article>`).join('')}</section>`;}
function calendar(state) {const items=selectPhoneKind(state,'calendar');return `<section class="phone-app phone-calendar">${appHeader('Calendário')}<time>10</time><span>OUTUBRO · 2025</span>${items.map((entry)=>`<article><strong>${escapeHtml(entry.payload.time)}</strong><p>${escapeHtml(entry.payload.title)}</p></article>`).join('')}</section>`;}
function recorder(state) {const playing=state.phone.ui.playback;return `<section class="phone-app phone-recorder">${appHeader('Gravador')}<div class="phone-wave">${Array.from({length:34},(_,i)=>`<i style="--h:${20+((i*23)%64)}%"></i>`).join('')}</div><strong>lembrete_02.m4a</strong><span>${playing?'reproduzindo':'00:04 · gravação local'}</span><button type="button" data-action="phone-play-audio" data-signal="normal" ${playing?'disabled':''}>${playing?'reproduzindo':'reproduzir'}</button></section>`;}

function screen(state) {
  if(state.phone.locked)return lockScreen(state);
  const app=state.phone.route.app;
  if(app==='messages')return messages(state);if(app==='calls')return calls(state);if(app==='gallery')return gallery(state);if(app==='files')return files(state);if(app==='camera')return gallery(state,true);if(app==='notes')return notes(state);if(app==='contacts')return contacts(state);if(app==='calendar')return calendar(state);if(app==='recorder')return recorder(state);return home(state);
}

export function renderPhoneDevice(state,{embedded=false}={}) {
  const ringing=selectRingingCall(state);const waking=state.phone.ui.wakeUntil>Date.now();
  return `<div class="phone-device${embedded?' is-embedded':''}${waking?' is-waking':''}" data-phone-device><div class="phone-hardware"><i></i><span></span></div><div class="phone-display"><header class="phone-statusbar"><time>${phoneClock(state)}</time><span>▮▮▮ · 4G</span><b>${state.phone.battery}%</b></header><main>${screen(state)}</main>${ringing?`<aside class="phone-call-screen"><small>CHAMADA RECEBIDA</small><div class="phone-caller">${escapeHtml((ringing.payload.person||'?').slice(0,1))}</div><strong>${escapeHtml(ringing.payload.person||'Sem número')}</strong><span>${ringing.payload.signal==='silence'?'áudio indisponível':'celular'}</span><div><button type="button" data-action="phone-call-reject" data-entry="${escapeHtml(ringing.id)}"><i>×</i>recusar</button><button type="button" data-action="phone-call-answer" data-entry="${escapeHtml(ringing.id)}"><i>☎</i>atender</button></div></aside>`:''}</div><footer class="phone-navbar"><button type="button" data-action="phone-back">△</button><button type="button" data-action="phone-home">○</button><button type="button" data-action="phone-overview">□</button></footer></div>`;
}

export function renderPhoneDock(state,puzzle) {
  if(!state.unlocked.some((id)=>Number(id)>=3)||puzzle.id==='25'||puzzle.world==='phone')return '';
  const latest=selectNotifications(state).at(-1);const waking=state.phone.ui.wakeUntil>Date.now();
  return `<aside class="phone-presence${state.phone.open?' is-focused':''}${waking?' is-waking':''}" data-phone-presence><button type="button" class="phone-room-prop" data-action="${latest?'phone-open-notification':'phone-toggle'}" ${latest?`data-entry="${escapeHtml(latest.id)}"`:''} aria-label="${latest?`${escapeHtml(latest.label)}: ${escapeHtml(latest.preview)}. Pegar celular.`:'Pegar celular'}"><span class="phone-room-screen"><time>${phoneClock(state)}</time>${latest?`<i><strong>${escapeHtml(latest.label)}</strong><small>${escapeHtml(latest.preview)}</small></i>`:'<i></i>'}</span><b></b></button><div class="phone-focus-backdrop" data-action="phone-toggle" aria-hidden="true"></div><div class="phone-focus-camera">${state.phone.open?renderPhoneDevice(state):''}<button type="button" class="phone-lower" data-action="phone-toggle">abaixar celular <kbd>ESC</kbd></button></div></aside>`;
}
