import p01 from './puzzle-01.js';
import p02 from './puzzle-02.js';
import p03 from './puzzle-03.js';
import p04 from './puzzle-04.js';
import p05 from './puzzle-05.js';
import p06 from './puzzle-06.js';
import p07 from './puzzle-07.js';
import p08 from './puzzle-08.js';
import p09 from './puzzle-09.js';
import p10 from './puzzle-10.js';
import p11 from './puzzle-11.js';
import p12 from './puzzle-12.js';
import p13 from './puzzle-13.js';
import p14 from './puzzle-14.js';
import p15 from './puzzle-15.js';
import p16 from './puzzle-16.js';
import p17 from './puzzle-17.js';
import p18 from './puzzle-18.js';
import p19 from './puzzle-19.js';
import p20 from './puzzle-20.js';
import p21 from './puzzle-21.js';
import p22 from './puzzle-22.js';
import p23 from './puzzle-23.js';
import p24 from './puzzle-24.js';
import p25 from './puzzle-25.js';
import { PUZZLE_CONTRACTS, PUZZLE_SOLUTIONS } from './contracts.js';
import { HINTS } from '../../data/hints.js';

const descriptors = [p01,p02,p03,p04,p05,p06,p07,p08,p09,p10,p11,p12,p13,p14,p15,p16,p17,p18,p19,p20,p21,p22,p23,p24,p25];
export const PUZZLES = descriptors.map((puzzle) => {
  const metadata = PUZZLE_CONTRACTS[puzzle.id];
  return Object.freeze({
    ...puzzle,
    ...metadata,
    contract: Object.freeze({
      id: puzzle.id,
      act: metadata.act,
      requirements: metadata.requirements,
      initialState: `área ${metadata.area} · corrupção ${metadata.corruption}`,
      mechanic: puzzle.kind,
      evidence: metadata.evidence,
      mutations: metadata.mutatesSystem ? ['estado global do sistema'] : [],
      animations: [metadata.motion],
      anticipatedEvents: metadata.retroactive ? ['retorno ou mutação retroativa'] : [],
      solution: PUZZLE_SOLUTIONS[puzzle.id],
      futureReturn: metadata.retroactive,
      hints: HINTS[puzzle.id] || [],
      accessibility: Object.freeze({ reducedMotion: true, audioIndependent: true, keyboardPath: true })
    })
  });
});
export const PUZZLE_BY_ID = Object.fromEntries(PUZZLES.map((puzzle) => [puzzle.id, puzzle]));
