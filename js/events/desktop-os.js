import { audioManager } from '../audio.js';
import { discoverPuzzle, getState, updateState } from '../state.js';
import { desktopResource, desktopWindowMarkup } from '../phase-one-computer.js';
import { finishSimulatedReboot, markTempDuplicate, moveNavigation, noteNavigation, quarantineFile, recordFileOpen, stabilizeComputer } from '../computer-runtime.js';
import { Motion } from '../motion-engine.js';
import { signalBehavior } from '../behavior-director.js';
import { requestLocalCapture } from '../local-capture.js';
import { scheduleWorldAction } from '../worlds/world-events.js';

let drag = null;

function desktopRoot() { return document.querySelector('[data-retro-desktop]'); }
function windowElement(key) { return document.querySelector(`[data-os-window="${CSS.escape(key)}"]`); }

function play(name = 'ui.contact', overrides = {}) {
  audioManager.playEvent(name, overrides);
}

function setSelected(resourceId) {
  updateState((state) => { state.desktopOs.selectedIcon = resourceId || null; });
  document.querySelectorAll('[data-os-resource]').forEach((icon) => {
    const selected = icon.dataset.osResource === resourceId;
    icon.classList.toggle('is-selected', selected);
    icon.setAttribute('aria-selected', String(selected));
  });
}

function focusWindow(key) {
  let z = 20;
  updateState((state) => {
    state.desktopOs.zCounter += 1;
    z = state.desktopOs.zCounter;
    const entry = state.desktopOs.windows.find((candidate) => candidate.key === key);
    if (entry) { entry.z = z; entry.minimized = false; }
  });
  document.querySelectorAll('[data-os-window]').forEach((windowNode) => windowNode.classList.toggle('is-focused', windowNode.dataset.osWindow === key));
  const target = windowElement(key);
  if (target) {
    target.style.setProperty('--win-z', z);
    target.classList.remove('is-minimized');
  }
}

function windowKey(resourceId, kind = 'resource') { return `${kind}:${resourceId}`; }

function discoverDocumentComparison(resourceId) {
  if (!['rel-1708-a','rel-1708-b'].includes(resourceId)) return;
  const state=getState();
  if (state.documentRuntime.copiesSeen.includes('A') && state.documentRuntime.copiesSeen.includes('B')) discoverPuzzle('06','two-copies');
}

function refreshWindow(key) {
  const state=getState();
  const entry=state.desktopOs.windows.find((candidate)=>candidate.key===key);
  const target=windowElement(key);
  if (!entry || !target) return;
  const shell=document.createElement('div');
  shell.innerHTML=desktopWindowMarkup(entry,state).trim();
  const replacement=shell.firstElementChild;
  if (replacement) target.replaceWith(replacement);
}

function refreshResourceWindows(...resourceIds) {
  getState().desktopOs.windows.filter((entry)=>resourceIds.includes(entry.resourceId)).forEach((entry)=>refreshWindow(entry.key));
}

function reactToPayload(payload,resourceId) {
  if (!payload) return;
  const desktop=desktopRoot();
  desktop?.classList.add('has-file-payload');
  audioManager.playFilePayload(payload);
  if (payload==='parasite:temp-duplicate') {
    Motion.schedule('file-payload:temp-duplicate',()=>{
      updateState((state)=>markTempDuplicate(state));
      refreshResourceWindows('temp','tmp1');
      desktop?.classList.remove('has-file-payload');
      play('computer.file.changed',{volume:.07});
    },Motion.reduced?0:1800);
  }
  if (payload==='mirror:backup-contaminated' || payload==='temporal:clock-conflict') refreshResourceWindows(resourceId);
  Motion.schedule(`file-payload:clear:${resourceId}`,()=>desktop?.classList.remove('has-file-payload'),Motion.reduced?0:620);
}

function openResource(resourceId, kind = 'resource') {
  const resource = desktopResource(resourceId);
  const layer = document.querySelector('.os-window-layer');
  if (!resource || !layer) return false;
  const key = windowKey(resourceId, kind);
  const existing = getState().desktopOs.windows.find((entry) => entry.key === key);
  if (existing) {
    let payload=null;
    updateState((state)=>{
      if (resource.type==='folder' || resource.type==='trash') noteNavigation(state,resourceId);
      else payload=recordFileOpen(state,resourceId);
    });
    refreshWindow(key);
    focusWindow(key);
    play('ui.contact', { volume: .07 });
    reactToPayload(payload,resourceId);
    discoverDocumentComparison(resourceId);
    return true;
  }
  let entry;
  let payload=null;
  const bounds=layer.getBoundingClientRect();
  updateState((state) => {
    state.desktopOs.zCounter += 1;
    const count = state.desktopOs.windows.length;
    const critical=['final-recovery-app','truth-app','event-1010'].includes(resourceId);
    const estimatedWidth=Math.min(680,Math.max(360,bounds.width*.72));
    const estimatedHeight=Math.min(520,Math.max(280,bounds.height*.72));
    const cascadeX=critical?Math.max(12,(bounds.width-estimatedWidth)/2):36+(count%6)*30;
    const cascadeY=critical?Math.max(12,(bounds.height-estimatedHeight)/2):28+(count%5)*25;
    entry = {
      key, resourceId, kind,
      x: Math.round(Math.max(8,Math.min(cascadeX,Math.max(8,bounds.width-estimatedWidth-8)))),
      y: Math.round(Math.max(8,Math.min(cascadeY,Math.max(8,bounds.height-estimatedHeight-42)))),
      z: state.desktopOs.zCounter,
      minimized: false,
      maximized: false
    };
    state.desktopOs.windows.push(entry);
    state.desktopOs.startOpen = false;
    if (resource.type==='folder' || resource.type==='trash') noteNavigation(state,resourceId);
    else payload=recordFileOpen(state,resourceId);
  });
  layer.insertAdjacentHTML('beforeend', desktopWindowMarkup(entry, getState()));
  windowElement(key)?.querySelectorAll('[data-evidence-source]').forEach((image)=>{
    const frame=image.closest('[data-evidence-frame]');
    const update=()=>frame?.classList.toggle('has-source',image.complete&&image.naturalWidth>0);
    image.addEventListener('load',update,{once:true});
    image.addEventListener('error',update,{once:true});
    update();
  });
  const running = document.querySelector('.os-running-windows');
  if (running) {
    const task = document.createElement('button');
    task.type = 'button';
    task.dataset.action = 'os-task-window';
    task.dataset.window = entry.key;
    task.textContent = resource.name;
    running.append(task);
  }
  document.querySelector('[data-os-start-menu]')?.setAttribute('hidden','');
  document.querySelector('[data-os-context-menu]')?.setAttribute('hidden','');
  focusWindow(key);
  play(resource.type === 'folder' || resource.type === 'trash' ? 'computer.folder.open' : 'computer.window.open', { volume: resource.type === 'folder' ? .07 : .09 });
  reactToPayload(payload,resourceId);
  discoverDocumentComparison(resourceId);
  return true;
}

export function openDesktopResource(resourceId, kind = 'resource') { return openResource(resourceId,kind); }

function closeWindow(button) {
  const target = button.closest('[data-os-window]');
  if (!target) return false;
  const key = target.dataset.osWindow;
  updateState((state) => { state.desktopOs.windows = state.desktopOs.windows.filter((entry) => entry.key !== key); });
  document.querySelector(`[data-action="os-task-window"][data-window="${CSS.escape(key)}"]`)?.remove();
  target.remove();
  play('computer.window.close', { volume: .055 });
  return true;
}

function minimizeWindow(button) {
  const target = button.closest('[data-os-window]');
  if (!target) return false;
  updateState((state) => {
    const entry = state.desktopOs.windows.find((candidate) => candidate.key === target.dataset.osWindow);
    if (entry) entry.minimized = true;
  });
  target.classList.add('is-minimized');
  play('computer.window.minimize', { volume: .05 });
  return true;
}

function maximizeWindow(button) {
  const target = button.closest('[data-os-window]');
  if (!target) return false;
  let maximized = false;
  updateState((state) => {
    const entry = state.desktopOs.windows.find((candidate) => candidate.key === target.dataset.osWindow);
    if (entry) { entry.maximized = !entry.maximized; maximized = entry.maximized; }
  });
  target.classList.toggle('is-maximized', maximized);
  focusWindow(target.dataset.osWindow);
  play('computer.window.maximize', { volume: .055 });
  return true;
}

function openSelected(kind = 'resource') {
  const selected = getState().desktopOs.selectedIcon;
  return selected ? openResource(selected, kind) : false;
}

export function handleDesktopBackgroundClick(event) {
  const desktop = desktopRoot();
  if (!desktop) return false;
  const icon = event.target.closest('[data-os-resource]');
  const context = event.target.closest('[data-os-context-menu]');
  const windowNode = event.target.closest('[data-os-window]');
  if (windowNode) focusWindow(windowNode.dataset.osWindow);
  if (!icon && !context && !windowNode && !event.target.closest('[data-os-start-menu],.os-taskbar')) {
    setSelected(null);
    document.querySelector('[data-os-context-menu]')?.setAttribute('hidden','');
  }
  return false;
}

export function handleDesktopClick(action, button) {
  if (!desktopRoot() && !button.closest('.retro-boot')) return false;
  if (action === 'os-select') {
    const id = button.dataset.osResource;
    setSelected(id);
    document.querySelector('[data-os-context-menu]')?.setAttribute('hidden','');
    play('ui.contact', { volume: .04 });
    const resource=desktopResource(id,getState());
    const currentPhaseApp=resource?.type==='program'&&resource.target===getState().currentPuzzle;
    if (currentPhaseApp || matchMedia('(max-width: 760px), (pointer: coarse)').matches) openResource(id,button.closest('[data-resource="quarantine"]')?'quarantine':'resource');
    return true;
  }
  if (action === 'os-open-resource') return openResource(button.dataset.resource);
  if (action === 'os-open-context') return openSelected();
  if (action === 'os-properties') return openSelected('properties');
  if (action === 'os-quarantine') {
    const id=button.dataset.resource;
    let changed=false;
    updateState((state)=>{changed=quarantineFile(state,id);});
    if (changed) {
      refreshResourceWindows(id,'quarantine');
      play('computer.file.changed',{volume:.06});
      button.textContent='CÓPIA ESTABILIZADA';
      button.disabled=true;
    }
    return true;
  }
  if (action === 'os-document-snapshot') {
    const copy=button.dataset.copy;
    updateState((state)=>{
      const snapshot={copy,revision:state.documentRuntime.revision,at:Date.now()};
      state.documentRuntime.snapshots=[...state.documentRuntime.snapshots.filter((item)=>item.copy!==copy),snapshot];
    },{progress:true});
    button.textContent=`ESTADO ${copy} CAPTURADO`;
    button.disabled=true;
    play('system.disk',{volume:.07});
    return true;
  }
  if (action === 'local-capture-authorize') {
    if (getState().capture.status==='requesting') return true;
    updateState((state)=>{state.capture.status='requesting';state.capture.requestedAt=Date.now();state.capture.error=null;});
    button.disabled=true;
    button.textContent='AGUARDANDO PERMISSÃO…';
    requestLocalCapture().then((frame)=>{
      updateState((state)=>{state.capture.status='captured';state.capture.capturedAt=Date.now();state.capture.error=null;});
      scheduleWorldAction('capture.local.completed',{domain:'phone',type:'gallery',delay:18000,payload:{id:'gallery:local-capture',capture:true,label:'FRAME_LOCAL_1010',meta:`${frame.width}×${frame.height} · memória volátil · origem: esta sessão`,notification:'novo quadro sem origem no aparelho'}});
      refreshResourceWindows('cam-local-app');
      play('system.relay',{volume:.07});
    }).catch((error)=>{
      updateState((state)=>{state.capture.status='denied';state.capture.error=String(error?.name||error?.message||'denied');});
      scheduleWorldAction('capture.local.fallback',{domain:'phone',type:'gallery',delay:12000,payload:{id:'gallery:local-fallback',fallback:true,label:'FRAME_LOCAL_INDISPONÍVEL',meta:'captura fictícia · permissão não concedida',notification:'fallback local preparado'}});
      refreshResourceWindows('cam-local-app');
      play('ui.reject',{volume:.06});
    });
    return true;
  }
  if (action === 'os-nav-back' || action === 'os-nav-forward') {
    let target=null;
    updateState((state)=>{target=moveNavigation(state,action==='os-nav-back'?-1:1);});
    if (target) openResource(target);
    return true;
  }
  if (action === 'os-reboot-return') {
    updateState((state)=>{finishSimulatedReboot(state);stabilizeComputer(state);});
    document.dispatchEvent(new CustomEvent('computer:reboot-complete'));
    play('system.relay',{volume:.08});
    return true;
  }
  if (action === 'os-window-close') return closeWindow(button);
  if (action === 'os-window-front') { const target=button.closest('[data-os-window]');if(target)focusWindow(target.dataset.osWindow);return true; }
  if (action === 'os-window-minimize') return minimizeWindow(button);
  if (action === 'os-window-maximize') return maximizeWindow(button);
  if (action === 'os-task-window') { focusWindow(button.dataset.window); return true; }
  if (action === 'os-start') {
    let open = false;
    updateState((state) => { state.desktopOs.startOpen = !state.desktopOs.startOpen; open = state.desktopOs.startOpen; });
    const menu = document.querySelector('[data-os-start-menu]');
    menu?.toggleAttribute('hidden', !open);
    menu?.classList.toggle('is-open', open);
    play('ui.contact', { volume: .055 });
    return true;
  }
  if (action === 'os-clock-toggle') {
    let open = false;
    updateState((state) => { state.desktopOs.clockPanelOpen = !state.desktopOs.clockPanelOpen; open = state.desktopOs.clockPanelOpen; });
    document.querySelector('.os-clock-panel')?.toggleAttribute('hidden', !open);
    play('ui.contact', { volume: .055 });
    return true;
  }
  if (action === 'os-clock-delta') {
    const unit = button.dataset.unit;
    const delta = Number(button.dataset.delta) || 0;
    updateState((state) => {
      if (unit === 'hour') state.desktopOs.clockHour = (state.desktopOs.clockHour + delta + 24) % 24;
      if (unit === 'minute') state.desktopOs.clockMinute = (state.desktopOs.clockMinute + delta + 60) % 60;
    });
    const state = getState();
    const hour = document.querySelector('[data-clock-hour]');
    const minute = document.querySelector('[data-clock-minute]');
    const taskClock = document.querySelector('[data-os-clock]');
    if (hour) hour.textContent = String(state.desktopOs.clockHour).padStart(2,'0');
    if (minute) minute.textContent = String(state.desktopOs.clockMinute).padStart(2,'0');
    if (taskClock) taskClock.textContent = `${String(state.desktopOs.clockHour).padStart(2,'0')}:${String(state.desktopOs.clockMinute).padStart(2,'0')}`;
    play('ui.contact', { volume: .035 });
    return true;
  }
  if (action === 'os-shutdown') {
    updateState((state) => { state.desktopOs.startOpen = false; });
    document.querySelector('[data-os-start-menu]')?.setAttribute('hidden','');
    play('ui.reject', { volume: .07 });
    return true;
  }
  if (action === 'os-audio-preview') {
    if (button.disabled) return true;
    button.disabled=true;
    button.textContent='REPRODUZINDO 00:04';
    audioManager.duck(['ambience','device'],{depth:.22,attack:.04,hold:3.4,release:.7});
    play('receiver.static', { duration: 4, volume: .2, filter:620 });
    play('source.signature',{when:.7,volume:.18});
    play('source.signature',{when:1.6,volume:.16,frequency:109});
    play('source.signature',{when:2.55,volume:.14,frequency:101});
    Motion.schedule('desktop-audio-preview-finish',()=>{if(button.isConnected){button.disabled=false;button.textContent='REPRODUZIR';}},4000);
    return true;
  }
  if (action === 'os-image-zoom') {
    const viewer=button.closest('.os-image-viewer');const image=viewer?.querySelector('img');
    if(!viewer||!image)return true;
    const zoom=Math.max(.5,Math.min(3,Number(viewer.dataset.zoom||1)+Number(button.dataset.delta||0)));
    viewer.dataset.zoom=String(zoom);image.style.width=`${zoom*100}%`;image.style.maxWidth='none';
    const output=viewer.querySelector('[data-image-zoom]');if(output)output.textContent=`${Math.round(zoom*100)}%`;
    play('ui.contact',{volume:.035});return true;
  }
  if (action === 'os-image-enhance') {
    const viewer=button.closest('.os-image-viewer');viewer?.classList.toggle('is-enhanced');
    button.textContent=viewer?.classList.contains('is-enhanced')?'ORIGINAL':'REALÇAR';play('system.disk',{volume:.055});return true;
  }
  return false;
}

export function handleDesktopDoubleClick(event) {
  const icon = event.target.closest('[data-os-resource]');
  if (!icon || !desktopRoot()) return false;
  event.preventDefault();
  setSelected(icon.dataset.osResource);
  const inQuarantine=Boolean(icon.closest('[data-resource="quarantine"]'));
  return openResource(icon.dataset.osResource,inQuarantine?'quarantine':'resource');
}

export function handleDesktopContextMenu(event) {
  const icon = event.target.closest('[data-os-resource]');
  const desktop = desktopRoot();
  if (!icon || !desktop) return false;
  event.preventDefault();
  setSelected(icon.dataset.osResource);
  const menu = document.querySelector('[data-os-context-menu]');
  if (!menu) return true;
  const bounds = desktop.getBoundingClientRect();
  menu.style.left = `${Math.min(event.clientX - bounds.left, bounds.width - 170)}px`;
  menu.style.top = `${Math.min(event.clientY - bounds.top, bounds.height - 110)}px`;
  menu.removeAttribute('hidden');
  play('ui.contact', { volume: .04 });
  return true;
}

export function handleDesktopPointerDown(event) {
  const titlebar = event.target.closest('[data-os-titlebar]');
  const windowNode = titlebar?.closest('[data-os-window]');
  if (!titlebar || !windowNode || event.target.closest('button') || windowNode.classList.contains('is-maximized')) return false;
  const desktop = desktopRoot();
  if (!desktop) return false;
  event.preventDefault();
  focusWindow(windowNode.dataset.osWindow);
  const windowRect = windowNode.getBoundingClientRect();
  const desktopRect = desktop.getBoundingClientRect();
  drag = {
    pointerId: event.pointerId, key: windowNode.dataset.osWindow, node: windowNode,
    desktopRect, offsetX: event.clientX - windowRect.left, offsetY: event.clientY - windowRect.top,
    x: windowRect.left - desktopRect.left, y: windowRect.top - desktopRect.top
  };
  titlebar.setPointerCapture?.(event.pointerId);
  windowNode.classList.add('is-dragging');
  return true;
}

export function handleDesktopPointerMove(event) {
  if (!drag || drag.pointerId !== event.pointerId) return false;
  event.preventDefault();
  const maxX = Math.max(0, drag.desktopRect.width - drag.node.offsetWidth);
  const maxY = Math.max(0, drag.desktopRect.height - drag.node.offsetHeight - 36);
  drag.x = Math.max(0, Math.min(maxX, event.clientX - drag.desktopRect.left - drag.offsetX));
  drag.y = Math.max(0, Math.min(maxY, event.clientY - drag.desktopRect.top - drag.offsetY));
  drag.node.style.setProperty('--win-x', `${drag.x}px`);
  drag.node.style.setProperty('--win-y', `${drag.y}px`);
  return true;
}

export function handleDesktopPointerUp(event, cancelled = false) {
  if (!drag || drag.pointerId !== event.pointerId) return false;
  const completed = drag;
  drag = null;
  completed.node.classList.remove('is-dragging');
  if (!cancelled) updateState((state) => {
    const entry = state.desktopOs.windows.find((candidate) => candidate.key === completed.key);
    if (entry) { entry.x = Math.round(completed.x); entry.y = Math.round(completed.y); }
  });
  return true;
}

export function handleDesktopKeydown(event) {
  if (!desktopRoot()) return false;
  if (event.key === 'Enter' && document.activeElement?.matches('[data-os-resource]')) {
    event.preventDefault();
    return openResource(document.activeElement.dataset.osResource,document.activeElement.closest('[data-resource="quarantine"]')?'quarantine':'resource');
  }
  if (event.key === 'Escape') {
    const menu = document.querySelector('[data-os-context-menu]:not([hidden])');
    if (menu) { menu.setAttribute('hidden',''); return true; }
    const start = document.querySelector('[data-os-start-menu]:not([hidden])');
    if (start) {
      updateState((state) => { state.desktopOs.startOpen = false; });
      start.setAttribute('hidden','');
      return true;
    }
  }
  return false;
}

export function handleDesktopSubmit(event) {
  const form=event.target.closest('[data-os-search]');
  if (!form || !desktopRoot()) return false;
  event.preventDefault();
  const query=String(new FormData(form).get('query')||'').trim();
  updateState((state)=>{state.computer.navigation.searchQuery=query;});
  const windowNode=form.closest('[data-os-window]');
  const key=windowNode?.dataset.osWindow;
  if (key) refreshWindow(key);
  const hasResults=Boolean(key && windowElement(key)?.querySelector('[data-os-resource]'));
  if (query && !hasResults) signalBehavior('empty-search',{query});
  play('system.disk',{volume:.045});
  return true;
}

export function handleDesktopChange(event) {
  if (!event.target.matches('[data-os-sort]') || !desktopRoot()) return false;
  updateState((state)=>{state.computer.navigation.sortBy=event.target.value||'name';});
  const windowNode=event.target.closest('[data-os-window]');
  if (windowNode) refreshWindow(windowNode.dataset.osWindow);
  return true;
}
