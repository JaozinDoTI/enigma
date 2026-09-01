import { PUZZLES } from '../js/puzzles/catalog.js';

// Compatibility view derived from the canonical puzzle catalog.
export const HINTS = Object.freeze(Object.fromEntries(PUZZLES.map((puzzle) => [puzzle.id, puzzle.hints])));
