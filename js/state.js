import { GAME_CONFIG } from './config.js';
import { unique } from './utils.js';

export const createInitialState = () => ({
  version: GAME_CONFIG.version,
  startedAt: null,
  updatedAt: Date.now(),
  currentPuzzle: '01',
  pendingTransition: null,
  transitionSequence: 0,
  roomCamera: { target:'DESK', previousTarget:null, transition:null, locked:false },
  unlocked: ['01'],
  discovered: ['01'],
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
  ui: { activePanel: null, archiveView: null, archiveQuery: '', focusReturn: null, titleReveal: null, phaseIntent: null },
  desktopOs: {
    selectedIcon: null,
    windows: [],
    zCounter: 20,
    startOpen: false,
    clockHour: 10,
    clockMinute: 10,
    clockPanelOpen: false
  },
  computer: {
    files: {
      'event-1010': { behavior:'temporal', variant:'base', openCount:0, quarantined:false, hidden:false, recovered:false, lastMutation:null },
      'tmp1': { behavior:'parasite', variant:'base', openCount:0, quarantined:false, hidden:false, recovered:false, lastMutation:null },
      'tmp2': { behavior:'parasite', variant:'spawned', openCount:0, quarantined:false, hidden:true, recovered:false, lastMutation:null },
      'event-old': { behavior:'mirror', variant:'base', openCount:0, quarantined:false, hidden:false, recovered:false, lastMutation:null },
      'cache': { behavior:'latent', variant:'base', openCount:0, quarantined:false, hidden:false, recovered:false, lastMutation:null },
      'webcam-cache': { behavior:'temporal', variant:'base', openCount:0, quarantined:false, hidden:false, recovered:false, lastMutation:null },
      'object-c-thumb': { behavior:'recoverable', variant:'damaged', openCount:0, quarantined:false, hidden:false, recovered:false, lastMutation:null },
      'shell-trace': { behavior:'rupture', variant:'recovered', openCount:0, quarantined:false, hidden:true, recovered:false, lastMutation:null },
      'rel-1708-a': { behavior:'temporal', variant:'base', openCount:0, quarantined:false, hidden:false, recovered:false, lastMutation:null },
      'rel-1708-b': { behavior:'temporal', variant:'base', openCount:0, quarantined:false, hidden:false, recovered:false, lastMutation:null }
    },
    navigation: { history:[], index:-1, searchQuery:'', rememberedQuery:'', sortBy:'name', showHidden:false },
    quarantine: [],
    processes: { shell:'running', archive:'running', vxdrv:'idle', indexer:'idle', sourceB:'hidden' },
    boot: { count:1, status:'ready', safeBoot:false, lastCrashReason:null, recoveredProcesses:[] },
    corruption: { shellIntegrity:100, activePayload:null, history:[] }
  },
  phone: {
    open:false,
    locked:true,
    route:{ app:'home', view:'root', id:null },
    battery:78,
    clock:{ hour:10, minute:10, offset:0, restoreAt:0 },
    entries:{},
    order:[],
    scheduler:{
      queue:[], cooldowns:{}, counts:{}, locks:{}, decisions:[],
      seed:(Date.now() ^ 0x50484f4e) >>> 0, cursor:0, budget:{},
      silenceUntil:0, lastTickAt:0
    },
    activity:{
      level:0, session:null, sessions:[], apps:{}, items:{}, actions:[],
      ignored:0, rejected:0, returned:0, quickCloses:0, receiverUses:0,
      pcStartedAt:Date.now(), pcDuration:0
    },
    ui:{ wakeUntil:0, arrivalKind:null, playback:null }
  },
  director: {
    metrics:{ wrongFolderStreak:0, emptySearches:0, repeatedFileOpens:0, consecutiveWrong:0, receiverInteractions:0, quarantineActions:0, lastActionAt:Date.now() }
  },
  capture: { status:'idle', requestedAt:null, capturedAt:null, delivered:false, error:null },
  documentRuntime: { copiesSeen:[], snapshots:[], revision:0, overlay:52, stableRegions:[] },
  signalAnalyzer: { coarse:170, fine:0, locked:false, frozen:false },
  moonForensics: { status:'searching', contrast:20, channel:'rgb', result:null },
  vxNet: { url:'vx://home', history:['vx://home'], index:0, snapshots:{}, downloads:[], query:'', recoveredLink:false },
  paperEngine: { zCounter:20, activeBoard:null, boards:{} },
  archive: { reads: {}, searches: [] },
  flags: {
    initialized: false,
    event1010Seen: false,
    moonFirstFound: false,
    eventChanged: false,
    curitibaConfirmed: false,
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
  tv: { power: true, channel: 1, volume: 3, fine: 0, antenna: 0, unlocked: false, morsePlays: 0, lastTransmission:null, externalMutation:null, afterimage:null },
  physicalNodes: { green: 'unknown', yard: 'unknown', room: 'unknown', books: 'unknown' },
  room: {},
  documentFragments: [],
  bookSelections: [],
  bookshelfSelections: [],
  forensicSelections: [],
  locationFragments: [],
  relationSelection: [],
  relationLinks: [],
  hypothesisSelection: [],
  hypothesisLinks: [],
  roomPlacement: { selectedObject: null, selectedAnchor: null },
  stats: { tvInteractions: 0, wrongAnswers: 0, returns: 0, clicks: 0 },
  settings: { muted: false, volume: 0.65 },
  lastProgressAt: Date.now()
});

let gameState = createInitialState();
const ARRAY_FIELDS = Object.freeze(['unlocked','discovered','completed','discoveries','events','documentFragments','bookSelections','bookshelfSelections','forensicSelections','locationFragments','relationSelection','relationLinks','hypothesisSelection','hypothesisLinks']);

function normalizeState(state) {
  ARRAY_FIELDS.forEach((key) => { if (!Array.isArray(state[key])) state[key] = []; });
  if (!state.ui || typeof state.ui !== 'object') state.ui = { activePanel: null, archiveView: null, archiveQuery: '', focusReturn: null, titleReveal:null, phaseIntent:null };
  if (!state.room || typeof state.room !== 'object') state.room = {};
  if (!state.roomPlacement || typeof state.roomPlacement !== 'object') state.roomPlacement = { selectedObject: null, selectedAnchor: null };
  if (!state.flags || typeof state.flags !== 'object') state.flags = createInitialState().flags;
  if (!state.archive || typeof state.archive !== 'object') state.archive = { reads: {}, searches: [] };
  if (!state.phone || typeof state.phone !== 'object') state.phone = createInitialState().phone;
  if (!state.phone.route || typeof state.phone.route !== 'object') state.phone.route = createInitialState().phone.route;
  if (!state.phone.clock || typeof state.phone.clock !== 'object') state.phone.clock = createInitialState().phone.clock;
  if (!state.phone.entries || typeof state.phone.entries !== 'object') state.phone.entries = {};
  if (!Array.isArray(state.phone.order)) state.phone.order = [];
  if (!state.phone.scheduler || typeof state.phone.scheduler !== 'object') state.phone.scheduler=createInitialState().phone.scheduler;
  if (!state.phone.activity || typeof state.phone.activity !== 'object') state.phone.activity=createInitialState().phone.activity;
  if (!state.phone.ui || typeof state.phone.ui !== 'object') state.phone.ui=createInitialState().phone.ui;
  ['queue','decisions'].forEach((key)=>{if(!Array.isArray(state.phone.scheduler[key]))state.phone.scheduler[key]=[];});
  ['sessions','actions'].forEach((key)=>{if(!Array.isArray(state.phone.activity[key]))state.phone.activity[key]=[];});
  ['cooldowns','counts','locks','budget'].forEach((key)=>{if(!state.phone.scheduler[key]||typeof state.phone.scheduler[key]!=='object')state.phone.scheduler[key]={};});
  ['apps','items'].forEach((key)=>{if(!state.phone.activity[key]||typeof state.phone.activity[key]!=='object')state.phone.activity[key]={};});
  if (!state.director || typeof state.director !== 'object') state.director = createInitialState().director;
  if (!state.director.metrics || typeof state.director.metrics !== 'object') state.director.metrics = createInitialState().director.metrics;
  if (!state.capture || typeof state.capture !== 'object') state.capture = createInitialState().capture;
  if (!state.documentRuntime || typeof state.documentRuntime !== 'object') state.documentRuntime = createInitialState().documentRuntime;
  ['copiesSeen','snapshots','stableRegions'].forEach((key)=>{if(!Array.isArray(state.documentRuntime[key])) state.documentRuntime[key]=[];});
  if (!state.worldEvents || typeof state.worldEvents !== 'object') state.worldEvents = { scheduled:[], delivered:[] };
  ['scheduled','delivered'].forEach((key)=>{if(!Array.isArray(state.worldEvents[key])) state.worldEvents[key]=[];});
  if (!state.computer || typeof state.computer !== 'object') state.computer = createInitialState().computer;
  if (!state.computer.files || typeof state.computer.files !== 'object') state.computer.files = createInitialState().computer.files;
  if (!state.computer.navigation || typeof state.computer.navigation !== 'object') state.computer.navigation = createInitialState().computer.navigation;
  if (!Array.isArray(state.computer.navigation.history)) state.computer.navigation.history = [];
  if (!Array.isArray(state.computer.quarantine)) state.computer.quarantine = [];
  if (!state.computer.processes || typeof state.computer.processes !== 'object') state.computer.processes = createInitialState().computer.processes;
  if (!state.computer.boot || typeof state.computer.boot !== 'object') state.computer.boot = createInitialState().computer.boot;
  if (!state.computer.corruption || typeof state.computer.corruption !== 'object') state.computer.corruption = createInitialState().computer.corruption;
  if (!Array.isArray(state.computer.corruption.history)) state.computer.corruption.history = [];
  if (!state.roomCamera || typeof state.roomCamera !== 'object') state.roomCamera = createInitialState().roomCamera;
  if (!state.signalAnalyzer || typeof state.signalAnalyzer !== 'object') state.signalAnalyzer = createInitialState().signalAnalyzer;
  if (!state.moonForensics || typeof state.moonForensics !== 'object') state.moonForensics = createInitialState().moonForensics;
  state.moonForensics.contrast = Math.max(0,Math.min(100,Number(state.moonForensics.contrast)||20));
  if (!['rgb','blue','infra'].includes(state.moonForensics.channel)) state.moonForensics.channel='rgb';
  if (!['searching','forensics','recovered','committed'].includes(state.moonForensics.status)) state.moonForensics.status='searching';
  if (state.moonForensics.result!=='VX-04') state.moonForensics.result=null;
  if (state.computer?.files?.['webcam-cache']?.recovered && state.moonForensics.status==='searching') Object.assign(state.moonForensics,{status:'recovered',contrast:78,channel:'infra',result:'VX-04'});
  if (state.completed.includes('09')) {
    Object.assign(state.moonForensics,{status:'committed',contrast:Math.max(65,state.moonForensics.contrast),channel:'infra',result:'VX-04'});
    state.computer.files['webcam-cache'].recovered=true;
  }
  if (!state.vxNet || typeof state.vxNet !== 'object') state.vxNet = createInitialState().vxNet;
  if (!Array.isArray(state.vxNet.history)) state.vxNet.history = ['vx://home'];
  if (!Array.isArray(state.vxNet.downloads)) state.vxNet.downloads = [];
  if (!state.paperEngine || typeof state.paperEngine !== 'object') state.paperEngine = createInitialState().paperEngine;
  if (!state.paperEngine.boards || typeof state.paperEngine.boards !== 'object') state.paperEngine.boards = {};
  state.currentPuzzle = /^\d{2}$/.test(String(state.currentPuzzle)) ? String(state.currentPuzzle) : '01';
  state.tv.channel = Math.max(1, Math.min(12, Number(state.tv.channel) || 1));
  state.tv.volume = Math.max(0, Math.min(10, Number(state.tv.volume) || 0));
}

function sealSchema(state) {
  ['ui','desktopOs','computer','phone','flags','tv','physicalNodes','stats','settings','archive','roomPlacement','worldEvents','director','capture','documentRuntime','roomCamera','signalAnalyzer','moonForensics','vxNet','paperEngine'].forEach((key) => Object.seal(state[key]));
  ['navigation','processes','boot','corruption'].forEach((key) => Object.seal(state.computer[key]));
  Object.seal(state.phone.clock);
  Object.seal(state.phone.route);
  Object.seal(state.phone.scheduler);
  Object.seal(state.phone.activity);
  Object.seal(state.phone.ui);
  Object.seal(state.director.metrics);
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

export function completePuzzle(id, next = [], message = '') {
  updateState((state) => {
    state.completed = unique([...state.completed, id]);
    state.discovered = unique([...state.discovered, id]);
    state.unlocked = unique([...state.unlocked, ...next]);
    state.currentPuzzle = id;
    state.ui.titleReveal = { id, message, status:'pending', at:Date.now() };
  }, { progress: true });
}

export function discoverPuzzle(id, source = 'world') {
  if (!gameState.unlocked.includes(id)) return false;
  if (gameState.discovered.includes(id)) return false;
  updateState((state) => {
    state.discovered = unique([...state.discovered,id]);
    state.discoveries = unique([...state.discoveries,`phase:${id}:${source}`]);
  }, { progress: true });
  return true;
}

export function recordVisit(id) {
  updateState((state) => {
    const visits = state.pagesVisited[id] || 0;
    state.pagesVisited[id] = visits + 1;
    if (visits===0) state.ui.phaseIntent={id,status:'pending',createdAt:Date.now()};
    if (visits > 0) state.stats.returns += 1;
    state.currentPuzzle = id;
    if (state.unlocked.includes(id)) state.discovered = unique([...state.discovered,id]);
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
    state.discovered = [...state.unlocked];
    state.currentPuzzle = id;
    state.startedAt ||= Date.now();
  }, { progress: true });
}
