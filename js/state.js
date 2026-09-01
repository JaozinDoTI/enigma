import { GAME_CONFIG } from './config.js';
import { unique } from './utils.js';

export const createInitialState = () => ({
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
  worldEvents: { scheduled:[], delivered:[] },
  ui: { activePanel: null, archiveView: null, archiveQuery: '', focusReturn: null },
  desktopOs: {
    selectedIcon: null,
    windows: [],
    zCounter: 20,
    startOpen: false,
    clockHour: 10,
    clockMinute: 10,
    clockPanelOpen: false
  },
  phone: {
    open:false, locked:true, app:'home', thread:null, unread:0, battery:73,
    clock:{ hour:10, minute:12, synchronized:false },
    delivered:[], events:[], calls:[], notifications:[], galleryItem:null
  },
  archive: { reads: {}, searches: [] },
  flags: {
    initialized: false,
    event1010Seen: false,
    moonFirstFound: false,
    eventChanged: false,
    mulletConfirmed: false,
    tvSequenceSeen: false,
    tvChannel11Primed: false,
    booksFound: false,
    bedsideFound: false,
    greenNodeScanned: false,
    greenNodeValidated: false,
    yardNodeScanned: false,
    yardNodeValidated: false,
    tvTuned: false,
    locationRecovered: false,
    identityLinked: false,
    roomRebuilt: false,
    houseAnomalyRevealed: false,
    roomNodeScanned: false,
    roomNodeValidated: false,
    booksNodeScanned: false,
    booksNodeValidated: false,
    bookPairResolved: false,
    bookPairIdentified: false,
    clock0317Triggered: false,
    clockOriginRestored: false,
    fakeFinalSeen: false,
    finalRecovered: false,
    assistanceJokeSeen: false
  },
  tv: { power: true, channel: 1, volume: 3, fine: 0, antenna: 0, unlocked: false, morsePlays: 0 },
  physicalNodes: { green: 'unknown', yard: 'unknown', room: 'unknown', books: 'unknown' },
  room: {},
  documentFragments: [],
  bookSelections: [],
  forensicSelections: [],
  locationFragments: [],
  relationSelection: [],
  relationLinks: [],
  roomPlacement: { selectedObject: null, selectedAnchor: null },
  stats: { tvInteractions: 0, wrongAnswers: 0, returns: 0, clicks: 0 },
  settings: { muted: false, volume: 0.45 },
  lastProgressAt: Date.now()
});

let gameState = createInitialState();
const ARRAY_FIELDS = Object.freeze(['unlocked','completed','discoveries','events','documentFragments','bookSelections','forensicSelections','locationFragments','relationSelection','relationLinks']);

function normalizeState(state) {
  ARRAY_FIELDS.forEach((key) => { if (!Array.isArray(state[key])) state[key] = []; });
  if (!state.ui || typeof state.ui !== 'object') state.ui = { activePanel: null, archiveView: null, archiveQuery: '', focusReturn: null };
  if (!state.room || typeof state.room !== 'object') state.room = {};
  if (!state.roomPlacement || typeof state.roomPlacement !== 'object') state.roomPlacement = { selectedObject: null, selectedAnchor: null };
  if (!state.flags || typeof state.flags !== 'object') state.flags = createInitialState().flags;
  if (!state.archive || typeof state.archive !== 'object') state.archive = { reads: {}, searches: [] };
  if (!state.phone || typeof state.phone !== 'object') state.phone = createInitialState().phone;
  if (!state.phone.clock || typeof state.phone.clock !== 'object') state.phone.clock = { hour:10, minute:12, synchronized:false };
  ['delivered','events','calls','notifications'].forEach((key) => { if (!Array.isArray(state.phone[key])) state.phone[key] = []; });
  if (!state.worldEvents || typeof state.worldEvents !== 'object') state.worldEvents = { scheduled:[], delivered:[] };
  ['scheduled','delivered'].forEach((key)=>{if(!Array.isArray(state.worldEvents[key])) state.worldEvents[key]=[];});
  state.currentPuzzle = /^\d{2}$/.test(String(state.currentPuzzle)) ? String(state.currentPuzzle) : '01';
  state.tv.channel = Math.max(1, Math.min(12, Number(state.tv.channel) || 1));
  state.tv.volume = Math.max(0, Math.min(10, Number(state.tv.volume) || 0));
}

function sealSchema(state) {
  ['ui','desktopOs','phone','flags','tv','physicalNodes','stats','settings','archive','roomPlacement','worldEvents'].forEach((key) => Object.seal(state[key]));
  Object.seal(state.phone.clock);
  return Object.seal(state);
}

gameState = sealSchema(gameState);

function commit(progress = false) {
  normalizeState(gameState);
  gameState.updatedAt = Date.now();
  if (progress) gameState.lastProgressAt = Date.now();
}

export function getState() { return gameState; }

export function updateState(mutator, { progress = false } = {}) {
  mutator(gameState);
  commit(progress);
  return gameState;
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
  gameState = sealSchema(createInitialState());
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
