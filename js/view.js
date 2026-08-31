import { formatDuration } from './utils.js';
import { deriveExperience, applyExperienceToDocument } from './experience.js';
import { renderExperienceScene, sceneFamilyFor } from './scenes/registry.js';

export function renderShell({ puzzle, puzzles, state, content, animate = true }) {
  const elapsed = formatDuration(Date.now() - (state.startedAt || Date.now()));
  const recovered = state.flags.finalRecovered;
  const experience = deriveExperience(puzzle, state);
  experience.activeArea = state.ui?.activePanel || experience.activeArea;
  experience.sceneFamily = sceneFamilyFor(puzzle);
  applyExperienceToDocument(experience);
  document.body.classList.toggle('is-recovered', recovered);
  document.body.classList.toggle('is-false-final', puzzle.id === '21' && !state.flags.fakeFinalSeen);
  document.body.classList.toggle('is-immersive', experience.sceneFamily !== 'system');
  document.body.dataset.puzzle = puzzle.id;

  return renderExperienceScene({ puzzle, puzzles, total: puzzles.length, state, content, animate, experience, elapsed, recovered });
}
