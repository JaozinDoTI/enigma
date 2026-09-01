import { PUZZLES as CATALOG, PUZZLE_BY_ID as CATALOG_BY_ID, puzzleFor as findPuzzle } from './catalog.js';

export const PUZZLES = CATALOG;
export const PUZZLE_BY_ID = CATALOG_BY_ID;
export const puzzleFor = findPuzzle;
