import { GAME_CONFIG } from './config.js';
import { clearStoredState, loadStoredState, saveStoredState } from './storage.js';
import { unique } from './utils.js';

const initialState = () => ({
  version: GAME_CONFIG.version,
  startedAt: null,
  updatedAt: Date.now(),
  currentPuzzle: '01',
  unlocked: ['01'],
  completed: [],
  discoveries: [],
  answers: {},
  attempts: {},
  hintsUsed: {},
  noProgressNotified: {},
  pagesVisited: {},
  events: [],
  motionEvents: {},
  ui: { activePanel: null, archiveView: null },
  archive: { reads: {} },
  flags: {
    initialized: false,
    event1010Seen: false,
    deskNodeScanned: false,
    deskNodeValidated: false,
    moonFirstFound: false,
    eventChanged: false,
    mulletConfirmed: false,
    tvSequenceSeen: false,
    tvChannel11Primed: false,
    booksFound: false,
    bedsideFound: false,
    yardNodeScanned: false,
    yardNodeValidated: false,
    tvTuned: false,
    locationRecovered: false,
    identityLinked: false,
    roomRebuilt: false,
    booksNodeScanned: false,
    booksNodeValidated: false,
    moonSecondFound: false,
    fakeFinalSeen: false,
    finalRecovered: false,
    assistanceJokeSeen: false
  },
  tv: { power: true, channel: 1, volume: 3, antenna: 0, unlocked: false, morsePlays: 0 },
  physicalNodes: { desk: 'unknown', yard: 'unknown', books: 'unknown' },
  room: {},
  fragments: [],
  forensicSelections: [],
  locationFragments: [],
  metaSelections: [],
  stats: { tvInteractions: 0, wrongAnswers: 0, returns: 0, clicks: 0 },
  settings: { muted: false, volume: 0.45 },
  lastProgressAt: Date.now()
});

function mergeState(stored) {
  const fresh = initialState();
  if (!stored) return fresh;
  const settings = {
    ...fresh.settings,
    ...(stored.settings || {}),
    ...((stored.version ?? 0) < 2 ? { muted: false } : {})
  };
  return {
    ...fresh,
    ...stored,
    version: fresh.version,
    flags: { ...fresh.flags, ...(stored.flags || {}) },
    tv: { ...fresh.tv, ...(stored.tv || {}) },
    physicalNodes: { ...fresh.physicalNodes, ...(stored.physicalNodes || {}) },
    motionEvents: { ...fresh.motionEvents, ...(stored.motionEvents || {}) },
    ui: { ...fresh.ui, ...(stored.ui || {}) },
    archive: { ...fresh.archive, ...(stored.archive || {}), reads: { ...fresh.archive.reads, ...(stored.archive?.reads || {}) } },
    stats: { ...fresh.stats, ...(stored.stats || {}) },
    settings
  };
}

let gameState = mergeState(loadStoredState());
const listeners = new Set();

function commit(progress = false) {
  gameState.updatedAt = Date.now();
  if (progress) gameState.lastProgressAt = Date.now();
  saveStoredState(gameState);
  listeners.forEach((listener) => listener(gameState));
}

export function getState() { return gameState; }
export function subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }

export function updateState(mutator, { progress = false } = {}) {
  mutator(gameState);
  commit(progress);
  return gameState;
}

export function startGame() {
  updateState((state) => {
    state.startedAt ||= Date.now();
    state.flags.initialized = true;
  }, { progress: true });
}

export function unlockPuzzle(id) {
  updateState((state) => { state.unlocked = unique([...state.unlocked, id]); }, { progress: true });
}

export function completePuzzle(id, next = []) {
  updateState((state) => {
    state.completed = unique([...state.completed, id]);
    state.unlocked = unique([...state.unlocked, ...next]);
    state.currentPuzzle = next[0] || id;
  }, { progress: true });
}

export function recordVisit(id) {
  updateState((state) => {
    const visits = state.pagesVisited[id] || 0;
    state.pagesVisited[id] = visits + 1;
    if (visits > 0) state.stats.returns += 1;
    state.currentPuzzle = id;
  });
}

export function recordAttempt(id, answer, correct) {
  updateState((state) => {
    state.attempts[id] = (state.attempts[id] || 0) + 1;
    if (correct) state.answers[id] = answer;
    else state.stats.wrongAnswers += 1;
  }, { progress: correct });
}

export function addEvent(type, detail = '') {
  updateState((state) => {
    state.events.push({ type, detail, at: Date.now() });
    state.events = state.events.slice(-120);
  });
}

export function resetState() {
  clearStoredState();
  gameState = initialState();
  commit();
}

export function unlockThrough(id) {
  const target = Number(id);
  updateState((state) => {
    state.unlocked = Array.from({ length: target }, (_, index) => String(index + 1).padStart(2, '0'));
    state.currentPuzzle = id;
    state.startedAt ||= Date.now();
  }, { progress: true });
}
