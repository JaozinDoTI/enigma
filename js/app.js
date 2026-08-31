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

function commitRender(id, animate) {
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
  document.title = `${puzzle.code} // ${GAME_CONFIG.systemName}`;
  renderedRoute = puzzle.id;
  renderedSceneFamily = sceneFamilyFor(puzzle);
  const activeArea = state.ui?.activePanel || puzzle.area;
  const audioFamily = renderedSceneFamily === 'system' && activeArea === 'archive' ? 'archive' : renderedSceneFamily;
  audioManager.transitionToScene(audioFamily, { puzzle, state });
  orchestrateNarrative(puzzle, state);
}

function render(id = currentRoute(), { animate = true } = {}) {
  const routeChanged = renderedRoute !== null && renderedRoute !== id;
  if (animate && renderedRoute === id) {
    commitRender(id, false);
    return;
  }
  if (animate && routeChanged) {
    const nextSceneFamily = sceneFamilyFor(PUZZLE_BY_ID[id] || PUZZLE_BY_ID['01']);
    const immersiveChange = nextSceneFamily !== 'system' || renderedSceneFamily !== 'system';
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
  if (!['desk','yard','books'].includes(node)) return;
  const required = node === 'desk' ? '05' : node === 'yard' ? '17' : '22';
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
