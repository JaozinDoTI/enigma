import { GAME_CONFIG } from './config.js';
import { PUZZLES, PUZZLE_BY_ID } from './puzzles/index.js';
import { renderScene, updateFinalMetrics } from './scene-renderer.js';
import { renderShell } from './view.js';
import { currentRoute, initRouter, navigate } from './router.js';
import { getState, updateState } from './state.js';
import { initInteractions, notifyNodeDetection, notifyNoProgress } from './events.js';
import { uiFeedback } from './ui-feedback.js';
import { audioManager, bindMotionAudio } from './audio.js';
import { orchestrateNarrative } from './narrative-events.js';
import { Motion } from './motion-engine.js';
import { sceneFamilyFor } from './scenes/registry.js';

const root = document.querySelector('#app');
let renderedRoute = null;
let renderedSceneFamily = null;

function focusToken() {
  const active = document.activeElement;
  if (!active || active === document.body) return null;
  return { id: active.id || '', action: active.dataset?.action || '', panel: active.dataset?.panel || '', file: active.dataset?.file || '' };
}

function restoreFocus(token, routeChanged) {
  window.requestAnimationFrame(() => {
    if (routeChanged) {
      root.querySelector('[data-scene-heading], main h1, .final-stage h1')?.focus({ preventScroll: true });
      return;
    }
    if (!token) return;
    const selectors = [
      token.id && `#${CSS.escape(token.id)}`,
      token.action && `[data-action="${CSS.escape(token.action)}"]${token.panel ? `[data-panel="${CSS.escape(token.panel)}"]` : ''}${token.file ? `[data-file="${CSS.escape(token.file)}"]` : ''}`
    ].filter(Boolean);
    const previous = selectors.length ? root.querySelector(selectors.join(',')) : null;
    const fallbackId = getState().ui.focusReturn;
    const fallback = fallbackId ? root.querySelector(`[data-record="${CSS.escape(fallbackId)}"]`) : null;
    (previous || fallback)?.focus({ preventScroll: true });
    if (fallback) updateState((state) => { state.ui.focusReturn = null; });
  });
}

function commitRender(id, animate) {
  const previousFocus = focusToken();
  const routeChanged = renderedRoute !== null && renderedRoute !== id;
  const puzzle = PUZZLE_BY_ID[id] || PUZZLE_BY_ID['01'];
  if (renderedRoute !== null && renderedRoute !== puzzle.id && (getState().ui?.activePanel || getState().ui?.archiveView)) {
    updateState((draft) => {
      draft.ui.activePanel = null;
      draft.ui.archiveView = null;
    });
  }
  const state = getState();
  const content = renderScene(puzzle, state);
  root.innerHTML = renderShell({ puzzle, puzzles: PUZZLES, state, content, animate });
  root.querySelectorAll('[data-evidence-source]').forEach((image)=>{
    const frame=image.closest('[data-evidence-frame]');
    const update=()=>frame?.classList.toggle('has-source',image.complete&&image.naturalWidth>0);
    image.addEventListener('load',update,{once:true});image.addEventListener('error',update,{once:true});update();
  });
  document.title = `${puzzle.code} // ${GAME_CONFIG.systemName}`;
  renderedRoute = puzzle.id;
  renderedSceneFamily = sceneFamilyFor(puzzle);
  const activeArea = state.ui?.activePanel || puzzle.area;
  const audioFamily = renderedSceneFamily === 'computer' && activeArea === 'archive' ? 'archive' : renderedSceneFamily;
  audioManager.transitionToScene(audioFamily, { puzzle, state });
  orchestrateNarrative(puzzle, state);
  restoreFocus(previousFocus, routeChanged);
}

function render(id = currentRoute(), { animate = true } = {}) {
  const routeChanged = renderedRoute !== null && renderedRoute !== id;
  if (animate && renderedRoute === id) {
    commitRender(id, false);
    return;
  }
  if (animate && routeChanged) {
    const nextSceneFamily = sceneFamilyFor(PUZZLE_BY_ID[id] || PUZZLE_BY_ID['01']);
      const immersiveChange = nextSceneFamily !== 'computer' || renderedSceneFamily !== 'computer';
    if (immersiveChange) {
      Motion.play('scene-transition', { target: document.body, from: renderedSceneFamily, to: nextSceneFamily, swap: () => commitRender(id, true) });
      return;
    }
    uiFeedback.transition(root, () => commitRender(id, true));
    return;
  }
  uiFeedback.cancelTransition();
  root.classList.remove('is-transitioning');
  root.removeAttribute('aria-busy');
  commitRender(id, animate && renderedRoute === null);
}

function processNodeQuery() {
  const params = new URLSearchParams(location.search);
  const node = params.get('node');
  if (!['green','yard','room','books'].includes(node)) return;
  const required = { green: '17', yard: '18', room: '20', books: '22' }[node];
  const early = !getState().unlocked.includes(required);
  updateState((state) => {
    state.flags[`${node}NodeScanned`] = true;
    state.physicalNodes[node] = early ? 'detected-early' : 'detected';
    state.discoveries = [...new Set([...state.discoveries, `node:${node}`])];
  }, { progress: !early });
  const clean = `${location.pathname}${location.hash || ''}`;
  history.replaceState(null, '', clean);
  uiFeedback.schedule('node-detection', () => notifyNodeDetection(node, early), 250);
}

audioManager.load(['ui.contact', 'system.relay', 'system.flyback', 'receiver.static']);
bindMotionAudio();
initInteractions({
  refresh: () => render(currentRoute(), { animate: false }),
  navigate,
  current: currentRoute,
  last: () => PUZZLES.at(-1)?.id || '01'
});
initRouter(render);
processNodeQuery();

window.setInterval(() => {
  if (getState().flags.finalRecovered && currentRoute() === '25') {
    updateFinalMetrics(getState());
  }
}, 1000);

window.setInterval(() => {
  const state = getState();
  const id = currentRoute();
  const threshold = GAME_CONFIG.inactivityHintMinutes * 60 * 1000;
  if (id === '25' || Date.now() - state.lastProgressAt < threshold || state.noProgressNotified[id]) return;
  updateState((draft) => { draft.noProgressNotified[id] = true; });
  notifyNoProgress();
}, 30000);
