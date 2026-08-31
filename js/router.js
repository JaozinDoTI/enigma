import { getState, recordVisit } from './state.js';

let onRoute = null;

export function currentRoute() {
  const match = location.hash.match(/^#\/record\/(\d{2})$/);
  const requested = match?.[1] || getState().currentPuzzle || '01';
  return getState().unlocked.includes(requested) ? requested : getState().currentPuzzle;
}

export function navigate(id, { replace = false } = {}) {
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
  if (!location.hash) navigate(getState().currentPuzzle || '01', { replace: true });
  route();
}
