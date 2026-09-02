import { formatDuration } from './utils.js';
import { deriveExperience, applyExperienceToDocument } from './experience.js';
import { renderExperienceScene, sceneFamilyFor, worldFor } from './scenes/registry.js';
import { renderPhoneDock } from './phone/render.js';
import { escapeHtml } from './utils.js';
import { renderTransitionOffer } from './transition-director.js';
import { renderRoomStage } from './room-stage.js';

function renderIntent(puzzle,state) {
  const pending=state.ui?.phaseIntent?.id===puzzle.id&&state.ui.phaseIntent.status==='pending';
  if(!pending)return '';
  return `<div class="phase-intent is-entering" data-phase-intent><span>${String(puzzle.id).padStart(2,'0')} // ${escapeHtml(puzzle.world.toUpperCase())}</span><strong>${escapeHtml(puzzle.cue || puzzle.intent)}</strong><small>${escapeHtml(puzzle.intent)}</small></div>`;
}

function renderTitleReveal(puzzle,state) {
  if (state.ui?.titleReveal?.id !== puzzle.id || (state.ui.titleReveal.status || 'pending') !== 'pending' || !state.completed.includes(puzzle.id)) return '';
  return `<aside class="title-reveal" data-title-reveal role="status"><span>REGISTRO ${escapeHtml(puzzle.id)} RECUPERADO</span><strong>${escapeHtml(puzzle.revealTitle)}</strong>${state.ui.titleReveal.message?`<small>${escapeHtml(state.ui.titleReveal.message)}</small>`:''}<i aria-hidden="true"></i></aside>`;
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
  const staged = renderRoomStage(scene,puzzle,state);
  if (puzzle.id==='25') return staged;
  return `${staged}${renderIntent(puzzle,state)}${renderTitleReveal(puzzle,state)}${renderTransitionOffer(state)}${renderPhoneDock(state,puzzle)}`;
}
