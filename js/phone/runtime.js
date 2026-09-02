import { audioManager } from '../audio.js';
import { getState, updateState } from '../state.js';
import { PHONE_CANONICAL, PHONE_EVENT_CATALOG, PHONE_SEED_ENTRIES, PHASE12_ENTRIES } from './catalog.js';

const ENTRY_LIMIT=180;
const ACTION_LIMIT=80;
let refreshView=()=>{};
let wakeTimer=null;
let refreshFrame=null;
let initialized=false;

const cloneEntry = (entry,now) => ({
  ...entry, payload:{...(entry.payload||{})}, createdAt:entry.createdAt||now,
  visibleAt:entry.status==='visible'?(entry.visibleAt||now):null, openedAt:null, seenAt:null,
  expiresAt:entry.payload?.expiresAfter?now+entry.payload.expiresAfter:null,
  forced:Boolean(entry.forced)
});

function addEntry(state,entry,now=Date.now()) {
  if(state.phone.entries[entry.id])return false;
  state.phone.entries[entry.id]=cloneEntry(entry,now);
  state.phone.order=[...state.phone.order,entry.id].slice(-ENTRY_LIMIT);
  return true;
}

function anomalyLevel(state) {
  if(state.flags.finalRecovered||state.completed.includes('24'))return 4;
  if(state.flags.fakeFinalSeen||state.completed.includes('20'))return 3;
  if(state.flags.curitibaConfirmed||state.completed.includes('12'))return 2;
  if(state.completed.includes('04')||state.flags.moonFirstFound)return 1;
  return 0;
}

function nextRandom(state) {
  state.phone.scheduler.cursor+=1;
  let x=(state.phone.scheduler.seed+Math.imul(state.phone.scheduler.cursor,0x6D2B79F5))>>>0;
  x=Math.imul(x^(x>>>15),x|1);x^=x+Math.imul(x^(x>>>7),x|61);
  return ((x^(x>>>14))>>>0)/4294967296;
}

function dispatchChange(reason,entry=null) {
  document.dispatchEvent(new CustomEvent('phone:changed',{detail:{reason,entry}}));
}

function requestPhoneRefresh() {
  if(refreshFrame!==null)return;
  refreshFrame=requestAnimationFrame(()=>{refreshFrame=null;refreshView();});
}

function armScheduler() {
  clearTimeout(wakeTimer);
  const state=getState();const now=Date.now();const silence=Number(state.phone.scheduler.silenceUntil)||0;
  const scheduled=state.phone.scheduler.queue.map((id)=>state.phone.entries[id]?.dueAt).filter(Number.isFinite).map((due)=>Math.max(due,silence));
  const expirations=Object.values(state.phone.entries).filter((entry)=>entry.expiresAt&&!['expired','removed'].includes(entry.status)).map((entry)=>entry.expiresAt);
  const clockRestore=state.phone.clock.restoreAt?[state.phone.clock.restoreAt]:[];
  const wakeAt=[...scheduled,...expirations,...clockRestore].filter(Number.isFinite).sort((a,b)=>a-b)[0];
  if(!wakeAt)return;
  wakeTimer=setTimeout(()=>reconcilePhone(Date.now()),Math.max(0,wakeAt-now));
}

function applyOccurrence(state,entry,now) {
  const payload=entry.payload;
  if(entry.kind==='battery')state.phone.battery=Math.max(1,Math.min(100,Number(payload.value)||state.phone.battery));
  if(entry.kind==='clock')Object.assign(state.phone.clock,{offset:Number(payload.offset)||0,restoreAt:now+(Number(payload.duration)||15000)});
  if(entry.kind==='mutation'){
    const target=state.phone.entries[payload.target]||Object.values(state.phone.entries).find((item)=>item.definition===payload.targetDefinition);
    if(target&&payload.operation==='edit-message'){target.payload={...target.payload,text:payload.text};target.editedAt=now;}
    if(target&&payload.operation==='remove-message')target.status='removed';
    entry.status='seen';entry.seenAt=now;
  }
  state.phone.ui.wakeUntil=now+1200;
  state.phone.ui.arrivalKind=entry.kind;
}

export function bootstrapPhone(now=Date.now()) {
  updateState((state)=>{
    PHONE_SEED_ENTRIES.forEach((entry)=>addEntry(state,entry,now));
    PHASE12_ENTRIES.forEach((entry)=>addEntry(state,entry,now));
    state.phone.activity.level=anomalyLevel(state);
  });
}

export function schedulePhoneOccurrence(definition,payload,{ delay=0, source='director', forced=false, worldKey=null }={}) {
  const now=Date.now();
  let id=null;
  updateState((state)=>{
    const serial=Object.values(state.phone.entries).filter((entry)=>entry.definition===definition&&entry.source===source).length+1;
    id=`${source}:${definition}:${serial}`;
    if(state.phone.entries[id])return;
    const dueAt=now+Math.max(0,delay);
    addEntry(state,{id,definition,kind:payload.kind,source,status:'scheduled',payload:{...payload},dueAt,worldKey,forced},now);
    state.phone.scheduler.queue=[...state.phone.scheduler.queue,id];
  });
  armScheduler();
  return id;
}

export function scheduleCanonicalPhoneEvent(worldEvent,{delay=0,worldKey=null}={}) {
  const canonical=PHONE_CANONICAL[worldEvent];
  if(!canonical)return false;
  const already=Object.values(getState().phone.entries).some((entry)=>entry.definition===canonical.definition&&entry.source===worldEvent);
  if(already)return false;
  schedulePhoneOccurrence(canonical.definition,canonical.payload,{delay,source:worldEvent,worldKey});
  return true;
}

export function reconcilePhone(now=Date.now()) {
  const arrivals=[];
  let changed=false;
  updateState((state)=>{
    state.phone.activity.level=anomalyLevel(state);
    const quiet=now<state.phone.scheduler.silenceUntil;
    state.phone.scheduler.queue=[...new Set(state.phone.scheduler.queue)].filter((id)=>{
      const entry=state.phone.entries[id];
      if(!entry||entry.status!=='scheduled')return false;
      if(entry.dueAt>now||quiet)return true;
      entry.status='visible';entry.visibleAt=now;
      if(entry.payload.expiresAfter)entry.expiresAt=now+entry.payload.expiresAfter;
      applyOccurrence(state,entry,now);arrivals.push({...entry,payload:{...entry.payload}});changed=true;
      if(entry.worldKey){state.worldEvents.scheduled=state.worldEvents.scheduled.filter((key)=>key!==entry.worldKey);state.worldEvents.delivered=[...new Set([...state.worldEvents.delivered,entry.worldKey])];}
      return false;
    });
    Object.values(state.phone.entries).forEach((entry)=>{
      if(entry.payload?.notify&&!entry.openedAt&&!entry.ignoredAt&&entry.visibleAt&&now-entry.visibleAt>=60000){entry.ignoredAt=now;state.phone.activity.ignored+=1;changed=true;}
      if(!entry.expiresAt||entry.expiresAt>now||['expired','removed'].includes(entry.status))return;
      if(entry.kind==='call'&&entry.payload.callState==='ringing'&&!entry.payload.vanish){entry.payload.callState='missed';entry.status='visible';entry.expiresAt=null;changed=true;return;}
      entry.status=entry.payload.vanish?'removed':'expired';changed=true;
    });
    Object.entries(state.phone.scheduler.locks).forEach(([group,until])=>{if(until<=now)delete state.phone.scheduler.locks[group];});
    if(state.phone.clock.restoreAt&&state.phone.clock.restoreAt<=now){state.phone.clock.offset=0;state.phone.clock.restoreAt=0;changed=true;}
    state.phone.scheduler.lastTickAt=now;
  });
  arrivals.forEach((entry)=>document.dispatchEvent(new CustomEvent('phone:arrival',{detail:{entry}})));
  if(changed)dispatchChange('reconcile');
  armScheduler();
  return arrivals;
}

function eligibleDefinitions(state,now) {
  const level=state.phone.activity.level;
  if((state.phone.scheduler.cooldowns.global||0)>now)return [];
  return PHONE_EVENT_CATALOG.filter((event)=>event.level<=level&&event.level>=Math.max(0,level-1))
    .filter((event)=>(state.phone.scheduler.counts[event.definition]||0)<event.max)
    .filter((event)=>(state.phone.scheduler.cooldowns[event.definition]||0)<=now)
    .filter((event)=>!state.phone.scheduler.locks[event.group])
    .filter((event)=>!event.condition||event.condition(state));
}

export function runPhoneDirector({force=null}={}) {
  if(getState().flags.finalRecovered&&!force)return null;
  const now=Date.now();let selected=null;let delay=0;
  updateState((state)=>{
    state.phone.activity.level=anomalyLevel(state);
    if(force){selected=PHONE_EVENT_CATALOG.find((event)=>event.definition===force)||null;delay=0;}
    else{
      if(now<state.phone.scheduler.silenceUntil)return;
      const level=state.phone.activity.level;
      if((state.phone.scheduler.budget[level]||0)>=2)return;
      const candidates=eligibleDefinitions(state,now);if(!candidates.length)return;
      const total=candidates.reduce((sum,event)=>sum+event.weight,0);let cursor=nextRandom(state)*total;
      selected=candidates.find((event)=>(cursor-=event.weight)<=0)||candidates.at(-1);
      delay=selected.delay[0]+Math.floor(nextRandom(state)*(selected.delay[1]-selected.delay[0]));
      state.phone.scheduler.counts[selected.definition]=(state.phone.scheduler.counts[selected.definition]||0)+1;
      state.phone.scheduler.budget[level]=(state.phone.scheduler.budget[level]||0)+1;
      state.phone.scheduler.cooldowns[selected.definition]=now+selected.cooldown;
      state.phone.scheduler.cooldowns.global=now+90000;
      state.phone.scheduler.locks[selected.group]=now+Math.max(selected.cooldown*.35,45000);
    }
    state.phone.scheduler.decisions=[...state.phone.scheduler.decisions,{at:now,definition:selected?.definition||null,forced:Boolean(force),level:state.phone.activity.level,delay}].slice(-24);
  });
  if(!selected)return null;
  const id=schedulePhoneOccurrence(selected.definition,selected.payload,{delay,forced:Boolean(force),source:force?'debug':'director'});
  return id;
}

export function recordPhoneAction(type,detail={}) {
  const now=Date.now();
  updateState((state)=>{
    const activity=state.phone.activity;
    activity.actions=[...activity.actions,{type,at:now,...detail}].slice(-ACTION_LIMIT);
    if(type==='open')activity.session={openedAt:now,entry:detail.entry||'manual'};
    if(type==='close'&&activity.session){const duration=now-activity.session.openedAt;if(duration<2200)activity.quickCloses+=1;activity.sessions=[...activity.sessions,{...activity.session,closedAt:now,duration}].slice(-20);activity.session=null;}
    if(type==='app'){activity.apps[detail.app]=(activity.apps[detail.app]||0)+1;}
    if(type==='item'){const key=`${detail.kind}:${detail.id}`;activity.items[key]=(activity.items[key]||0)+1;}
    if(type==='notification-ignored')activity.ignored+=1;
    if(type==='call-rejected')activity.rejected+=1;
    if(type==='call-returned')activity.returned+=1;
    if(type==='receiver')activity.receiverUses+=1;
    if(type==='pc-action'){activity.pcDuration=Math.max(activity.pcDuration,now-activity.pcStartedAt);}
    activity.level=anomalyLevel(state);
  });
}

export function openPhoneEntry(id) {
  updateState((state)=>{const entry=state.phone.entries[id];if(!entry)return;entry.openedAt??=Date.now();if(entry.kind==='phantom'){entry.status='expired';return;}if(entry.kind==='message')entry.seenAt??=Date.now();});
}

export function markPhoneThreadSeen(thread) {
  updateState((state)=>Object.values(state.phone.entries).forEach((entry)=>{if(entry.kind==='message'&&entry.payload.thread===thread){entry.seenAt??=Date.now();entry.openedAt??=entry.seenAt;}}));
}

export function changePhoneCall(id,nextState) {
  let changed=false;
  updateState((state)=>{const entry=state.phone.entries[id];if(!entry||entry.kind!=='call')return;entry.payload.callState=nextState;entry.status=nextState;entry.openedAt??=Date.now();changed=true;});
  return changed;
}

export function setPhoneSilence(duration,reason='transition') {
  updateState((state)=>{state.phone.scheduler.silenceUntil=Math.max(state.phone.scheduler.silenceUntil,Date.now()+duration);state.phone.scheduler.decisions=[...state.phone.scheduler.decisions,{at:Date.now(),definition:`silence:${reason}`,forced:false,level:state.phone.activity.level,delay:duration}].slice(-24);});
  armScheduler();
}

function presentArrival(entry) {
  const isCall=entry.kind==='call'&&entry.payload.callState==='ringing';
  if(isCall){audioManager.duck(['ambience'],{depth:.42,attack:.04,hold:.8,release:.9});audioManager.playEvent('phone.incoming',{volume:.52});audioManager.playEvent('phone.vibration',{when:.04,volume:.46,duration:.8});}
  else if(entry.payload.notify){audioManager.playEvent('phone.vibration',{volume:.36,duration:.42});audioManager.playEvent(/^(ODD|REACT|IMPOSSIBLE)_/.test(entry.definition)?'phone.message.odd':'phone.message.normal',{when:.12,volume:.38});}
}

export function initPhoneSystem({refresh}={}) {
  refreshView=refresh||refreshView;
  const requestedSeed=Number(new URLSearchParams(location.search).get('phoneSeed'));
  if(Number.isSafeInteger(requestedSeed)&&requestedSeed>=0)updateState((state)=>{state.phone.scheduler.seed=requestedSeed>>>0;state.phone.scheduler.cursor=0;});
  bootstrapPhone();reconcilePhone();
  if(initialized)return;initialized=true;
  document.addEventListener('phone:arrival',(event)=>presentArrival(event.detail.entry));
  document.addEventListener('phone:changed',requestPhoneRefresh);
  document.addEventListener('behavior:signal',(event)=>{
    const {type,payload={}}=event.detail||{};
    if(type==='receiver')recordPhoneAction('receiver',payload);
    if(type==='resource'||type==='empty-search'||type==='quarantine')recordPhoneAction('pc-action',payload);
  });
}
