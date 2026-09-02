import { discoverPuzzle, getState, recordVisit } from './state.js';
import { uiFeedback } from './ui-feedback.js';

let onRoute = null;
let lastDenied = null;

export function currentRoute() {
  const match = location.hash.match(/^#\/record\/(\d{2})$/);
  const requested = match?.[1] || getState().currentPuzzle || '01';
  if (getState().discovered.includes(requested)) { lastDenied = null; return requested; }
  if (requested !== lastDenied) {
    lastDenied = requested;
    queueMicrotask(() => uiFeedback.toast(`REGISTRO ${requested} AINDA NÃO FOI INDEXADO`, { kind: 'error' }));
  }
  return getState().currentPuzzle;
}

export function navigate(id, { replace = false } = {}) {
  if (getState().unlocked.includes(id)) discoverPuzzle(id,'navigation');
  const hash = `#/record/${id}`;
  if (replace) history.replaceState(null, '', hash);
  else location.hash = hash;
  if (location.hash === hash) route();
}

function route() {
  const id = currentRoute();
  recordVisit(id);
  onRoute?.(id);
}

export function initRouter(callback) {
  onRoute = callback;
  window.addEventListener('hashchange', route);
  if (!location.hash) { navigate(getState().currentPuzzle || '01', { replace: true }); return; }
  route();
}
