import { audioManager } from '../audio.js';
import { getState, updateState } from '../state.js';
import { desktopResource, desktopWindowMarkup } from '../phase-one-computer.js';

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

function openResource(resourceId, kind = 'resource') {
  const resource = desktopResource(resourceId);
  const layer = document.querySelector('.os-window-layer');
  if (!resource || !layer) return false;
  const key = windowKey(resourceId, kind);
  const existing = getState().desktopOs.windows.find((entry) => entry.key === key);
  if (existing) {
    focusWindow(key);
    play('ui.contact', { volume: .07 });
    return true;
  }
  let entry;
  updateState((state) => {
    state.desktopOs.zCounter += 1;
    const count = state.desktopOs.windows.length;
    entry = {
      key, resourceId, kind,
      x: 54 + (count % 5) * 34,
      y: 42 + (count % 4) * 28,
      z: state.desktopOs.zCounter,
      minimized: false,
      maximized: false
    };
    state.desktopOs.windows.push(entry);
    state.desktopOs.startOpen = false;
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
    if (matchMedia('(max-width: 760px), (pointer: coarse)').matches) openResource(id);
    return true;
  }
  if (action === 'os-open-resource') return openResource(button.dataset.resource);
  if (action === 'os-open-context') return openSelected();
  if (action === 'os-properties') return openSelected('properties');
  if (action === 'os-window-close') return closeWindow(button);
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
    play('receiver.static', { duration: .16, volume: .055 });
    button.textContent = 'LEITURA ENCERRADA';
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
  return openResource(icon.dataset.osResource);
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
    return openResource(document.activeElement.dataset.osResource);
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
