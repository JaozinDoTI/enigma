import { updateState } from './state.js';

export function trackClick(label = 'unknown') {
  updateState((state) => {
    state.stats.clicks += 1;
    if (label.startsWith('tv:')) state.stats.tvInteractions += 1;
  });
}

export function finalStats(state) {
  return {
    elapsed: Date.now() - (state.startedAt || Date.now()),
    failed: state.stats.wrongAnswers,
    hints: Object.values(state.hintsUsed).reduce((sum, level) => sum + level, 0),
    tv: state.stats.tvInteractions,
    returns: state.stats.returns
  };
}
