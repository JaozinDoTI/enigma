import { formatDuration } from './utils.js';
import { deriveExperience, applyExperienceToDocument } from './experience.js';
import { renderExperienceScene, sceneFamilyFor, worldFor } from './scenes/registry.js';
import { renderPhoneDock } from './phone.js';
import { escapeHtml } from './utils.js';

function renderIntent(puzzle,state) {
  const firstVisit = (state.pagesVisited[puzzle.id] || 0) <= 1;
  return `<div class="phase-intent ${firstVisit?'is-entering':''}" data-phase-intent ${firstVisit?'':'hidden'}><span>${String(puzzle.id).padStart(2,'0')} // ${escapeHtml(puzzle.world.toUpperCase())}</span><strong>${escapeHtml(puzzle.intent)}</strong></div>`;
}

export function renderShell({ puzzle, puzzles, state, content, animate = true }) {
  const elapsed = formatDuration(Date.now() - (state.startedAt || Date.now()));
  const recovered = state.flags.finalRecovered;
  const experience = deriveExperience(puzzle, state);
  experience.activeArea = state.ui?.activePanel || experience.activeArea;
  experience.sceneFamily = sceneFamilyFor(puzzle);
  experience.world = worldFor(puzzle);
  applyExperienceToDocument(experience);
  document.body.classList.toggle('is-recovered', recovered);
  document.body.classList.toggle('is-false-final', puzzle.id === '21' && !state.flags.fakeFinalSeen);
  const immersive = !['system', 'computer'].includes(experience.sceneFamily);
  document.body.classList.toggle('is-immersive', immersive);
  document.body.dataset.puzzle = puzzle.id;
  document.body.dataset.world = experience.world;

  const scene = renderExperienceScene({ puzzle, puzzles, total: puzzles.length, state, content, animate, experience, elapsed, recovered });
  return `${scene}${renderIntent(puzzle,state)}${renderPhoneDock(state,puzzle)}`;
}
