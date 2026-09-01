import { PUZZLES, puzzleFor } from '../puzzles/catalog.js';

function conditionMet(state, condition = {}) {
  if (condition.flag && !state.flags[condition.flag]) return false;
  if (condition.discovery && !state.discoveries.includes(condition.discovery)) return false;
  if (condition.unlocked && !state.unlocked.includes(condition.unlocked)) return false;
  if (condition.completed && !state.completed.includes(condition.completed)) return false;
  if (condition.event && !state.events.some((event)=>event.type===condition.event)) return false;
  return true;
}

function activeMutations(state) {
  return PUZZLES.flatMap((puzzle)=>puzzle.mutations || []).filter((mutation)=>conditionMet(state,mutation.when));
}

export function computerWorldAt(state, phaseId = state.currentPuzzle) {
  const mutations = activeMutations(state);
  const latestMutationWith = (property) => [...mutations].reverse().find((mutation) => mutation[property]);
  const reactiveIcons = [state.flags.clock0317Triggered ? 'clock-note' : null].filter(Boolean);
  const phaseMutation = (puzzleFor(phaseId).mutations || []).find((mutation)=>mutation.phaseApp && conditionMet(state,mutation.when));
  return Object.freeze({
    mutations,
    icons: [...new Set([...mutations.flatMap((mutation) => mutation.icons || []),...reactiveIcons])],
    wallpaper: state.flags.clockOriginRestored ? 'synchronized' : latestMutationWith('wallpaper')?.wallpaper || 'base',
    notice: latestMutationWith('notice')?.notice || '',
    clockMode: latestMutationWith('clockMode')?.clockMode || null,
    phaseApp: phaseMutation?.phaseApp || null
  });
}
