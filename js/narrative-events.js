import { Motion } from './motion-engine.js';
import { updateState } from './state.js';
import { uiFeedback } from './ui-feedback.js';

function runOnce(state, key, callback) {
  if (state.motionEvents?.[key]) return;
  updateState((draft) => {
    draft.motionEvents ||= {};
    draft.motionEvents[key] = true;
    draft.events.push({ type: 'motion-event', detail: key, at: Date.now() });
    draft.events = draft.events.slice(-120);
  });
  callback();
}

export function orchestrateNarrative(puzzle, state) {
  Motion.cancel('narrative-event');
  Motion.schedule('narrative-event', () => {
    if (puzzle.id === '10') {
      runOnce(state, 'entity-flicker', () => Motion.play('silent-observation', { target: document.querySelector('[data-operator-status]') }));
    }
    if (['14','18','19'].includes(puzzle.id)) {
      runOnce(state, `receiver-observation-${puzzle.id}`, () => Motion.play('receiver-observation', { target: document.querySelector('[data-persistent-receiver]') }));
    }
    if (puzzle.id === '23') {
      runOnce(state, 'old-evidence-return', () => {
        uiFeedback.toast('RELAÇÃO ANTIGA REINDEXADA: FIM / COMEÇO / ADJACÊNCIA', { kind: 'discovery' });
        Motion.play('record-corruption', { target: document.querySelector('.side-panel') });
      });
    }
  }, Motion.reduced ? 0 : 360);
}
