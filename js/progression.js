import { puzzleFor } from './puzzles/catalog.js';
import { answerMatches } from './utils.js';
import { stabilizeComputer } from './computer-runtime.js';

const EFFECTS = Object.freeze({
  moonFirstFound(state) { state.flags.moonFirstFound = true; },
  curitibaConfirmed(state) {
    state.flags.curitibaConfirmed = true;
    const file=state.computer.files['object-c-thumb'];
    if (file) { file.variant='identified'; file.recovered=true; file.lastMutation='metadata-attached'; }
  },
  booksFound(state) { state.flags.booksFound = true; },
  bedsideFound(state) { state.flags.bedsideFound = true; },
  locationRecovered(state) { state.flags.locationRecovered = true; },
  booksNodeValidated(state) { state.flags.booksNodeValidated = true; state.physicalNodes.books = 'validated'; },
  bookPairResolved(state) { state.flags.bookPairResolved = true; },
  finalRecovered(state) { state.flags.finalRecovered = true; stabilizeComputer(state); }
});

export function isAcceptedAnswer(id, answer) {
  return answerMatches(answer, puzzleFor(id).solution?.accepted || []);
}

export function completionFor(id) {
  const puzzle = puzzleFor(id);
  if (!puzzle.completion) return null;
  const completion = puzzle.completion;
  return Object.freeze({
    next: puzzle.next,
    message: completion.message,
    delay: completion.delay,
    motion: completion.motion,
    mutate(state) {
      (completion.effects || []).forEach((effect) => EFFECTS[effect]?.(state));
    }
  });
}
