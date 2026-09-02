import { PUZZLE_BY_ID } from './puzzles/index.js';
import { getState, updateState } from './state.js';
import { scheduleWorldAction } from './worlds/world-events.js';

const FOLDERS = new Set(['my-computer','system','registry','documents','backup','temp','cam-cache','quarantine']);
const COOLDOWN = 75_000;

const E = (definition) => Object.freeze(definition);
export const REACTIVE_EVENTS = Object.freeze([
  E({ id:'same-file-four', acts:[1,2,3,4], priority:9, weight:4, strength:1, max:1,
    eligible:(s)=>s.director.metrics.repeatedFileOpens>=4 || Object.values(s.computer.files).some((file)=>file.openCount>=4),
    effect:{type:'message',payload:{id:'reactive:same-file-four',text:'não mudou na quinta vez.',notification:'você abriu o mesmo arquivo outra vez'}},
    followup:[{delay:11000,type:'note',payload:{id:'reactive:same-file-note',text:'ela ainda espera a sexta leitura.',notification:'nota editada agora'}}] }),
  E({ id:'wrong-folders', acts:[1,2,3,4], priority:8, weight:5, strength:1, max:2,
    eligible:(s)=>s.director.metrics.wrongFolderStreak>=6,
    effect:{type:'message',payload:{id:'reactive:wrong-folders',text:'você fechou antes da última linha.',notification:'a pasta já tinha sido aberta'}} }),
  E({ id:'empty-searches', acts:[1,2,3,4], priority:7, weight:3, strength:1, max:1,
    eligible:(s)=>s.director.metrics.emptySearches>=3,
    effect:{type:'note',payload:{id:'reactive:search-note',text:'o resultado vazio também foi indexado.',notification:'nota criada sem interação'}} }),
  E({ id:'wrong-answer-chain', acts:[2,3,4,5], priority:10, weight:5, strength:1, max:2,
    eligible:(s)=>s.director.metrics.consecutiveWrong>=3,
    effect:{type:'message',payload:{id:'reactive:wrong-answer',text:'você está olhando para o que mudou.',notification:'NÚMERO NÃO SALVO'}} }),
  E({ id:'wrong-answer-invariant', acts:[2], phases:['06'], priority:11, weight:8, strength:1, max:1,
    eligible:(s)=>s.director.metrics.consecutiveWrong>=5,
    effect:{type:'message',payload:{id:'reactive:invariant',text:'procura o que ficou parado.',notification:'NÚMERO NÃO SALVO'}} }),
  E({ id:'receiver-obsession', acts:[1,3,4], priority:8, weight:4, strength:2, max:1,
    eligible:(s)=>s.director.metrics.receiverInteractions>=30,
    effect:{type:'call',payload:{id:'reactive:receiver-call',from:'SOURCE.03',duration:'00:03',status:'PERDIDA',signal:'source.03'}},
    followup:[{delay:14500,type:'artifact',payload:{id:'reactive:receiver-audio',kind:'REC',name:'canal_atual_03.m4a',meta:'00:03 · criado depois da sintonia',notification:'o Receiver deixou um arquivo'}}] }),
  E({ id:'quarantine-watched', acts:[1,2,3,4], priority:8, weight:4, strength:1, max:1,
    eligible:(s)=>s.director.metrics.quarantineActions>=2,
    effect:{type:'message',payload:{id:'reactive:quarantine',text:'isolar não é apagar.',notification:'atividade na quarentena'}},
    followup:[{delay:12500,type:'artifact',payload:{id:'reactive:quarantine-copy',kind:'DAT',name:'fora_da_quarentena.tmp',meta:'criado após o isolamento',notification:'uma cópia apareceu no telefone'}}] }),
  E({ id:'phone-ignored', acts:[1,2,3,4,5], priority:9, weight:5, strength:2, max:2,
    eligible:(s)=>s.director.metrics.ignoredNotifications>=2,
    effect:{type:'call',payload:{id:'reactive:ignored-call',from:'NÚMERO NÃO SALVO',duration:'00:10',status:'PERDIDA',signal:'source.03'}},
    followup:[{delay:9000,type:'note',payload:{id:'reactive:ignored-note',text:'você ouviu.',notification:'nota criada sem interação'}}] }),
  E({ id:'object-c-leak', acts:[3,4], priority:9, weight:3, strength:2, max:1,
    eligible:(s)=>s.computer.files['object-c-thumb']?.openCount>=2,
    effect:{type:'artifact',payload:{id:'reactive:object-c-file',kind:'IMG',name:'OBJETO_C_outra_copia.thumb',meta:'18 KB · criado durante esta sessão',notification:'arquivo repetido detectado'}} }),
  E({ id:'stalled-session', acts:[2,3,4], priority:6, weight:2, strength:1, max:1,
    eligible:(s)=>Date.now()-s.lastProgressAt>180_000 && s.stats.returns>=4,
    effect:{type:'note',payload:{id:'reactive:stalled',text:'não foi aqui que você parou.',notification:'nota alterada'}} }),
  E({ id:'early-99', acts:[3], priority:4, weight:1, strength:2, max:1,
    eligible:(s)=>s.completed.length>=13,
    effect:{type:'phantom',payload:{id:'reactive:99',text:'INTEGRIDADE 99%',duration:1200}} })
]);

function currentAct(state) { return PUZZLE_BY_ID[state.currentPuzzle]?.act || 1; }

function randomUnit(state) {
  let value = 0;
  updateState((draft)=>{
    draft.director.cursor += 1;
    let x = (draft.director.seed + Math.imul(draft.director.cursor,0x6D2B79F5)) >>> 0;
    x = Math.imul(x ^ (x >>> 15),x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7),x | 61);
    value = ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  });
  return value;
}

function choose(candidates,state) {
  const best = Math.max(...candidates.map((event)=>event.priority));
  const pool = candidates.filter((event)=>event.priority===best);
  const total = pool.reduce((sum,event)=>sum+event.weight,0);
  let cursor = randomUnit(state)*total;
  return pool.find((event)=>(cursor-=event.weight)<=0) || pool.at(-1);
}

function budgetAllows(state,event,act,bypass) {
  if (bypass) return true;
  const spent = state.director.actBudget[act] || 0;
  if (spent + event.strength > 4) return false;
  if ((state.director.eventCounts[event.id] || 0) >= event.max) return false;
  const cooldown = state.director.cooldowns[event.id] || 0;
  return Date.now() >= cooldown && Date.now() >= (state.director.cooldowns.global || 0);
}

export function evaluateBehaviorDirector({ force = null } = {}) {
  const state = getState();
  if (state.flags.finalRecovered) return null;
  const act = currentAct(state);
  const candidates = REACTIVE_EVENTS.filter((event)=>
    (!force || event.id===force) && event.acts.includes(act) && (!event.phases || event.phases.includes(state.currentPuzzle)) &&
    budgetAllows(state,event,act,Boolean(force)) && (force || event.eligible(state))
  );
  if (!candidates.length) return null;
  const selected = force ? candidates[0] : choose(candidates,state);
  const occurrence = (state.director.eventCounts[selected.id] || 0) + 1;
  updateState((draft)=>{
    draft.director.eventCounts[selected.id]=occurrence;
    draft.director.actBudget[act]=(draft.director.actBudget[act]||0)+selected.strength;
    draft.director.cooldowns[selected.id]=Date.now()+COOLDOWN*2;
    draft.director.cooldowns.global=Date.now()+COOLDOWN;
    draft.director.delivered=[...draft.director.delivered,{id:selected.id,at:Date.now(),act,phase:draft.currentPuzzle}].slice(-40);
    if (selected.id==='wrong-folders') draft.director.metrics.wrongFolderStreak=0;
    if (selected.id==='wrong-answer-chain' || selected.id==='wrong-answer-invariant') draft.director.metrics.consecutiveWrong=0;
    if (selected.id==='phone-ignored') draft.director.metrics.ignoredNotifications=0;
  });
  scheduleWorldAction(`director:${selected.id}:${occurrence}`,{domain:'phone',type:selected.effect.type,delay:force?0:900+Math.floor(randomUnit(getState())*1800),payload:{...selected.effect.payload,id:`${selected.effect.payload.id}:${occurrence}`}});
  (selected.followup||[]).forEach((step,index)=>scheduleWorldAction(`director:${selected.id}:${occurrence}:followup:${index}`,{domain:'phone',type:step.type,delay:force?Math.min(900,step.delay):step.delay,payload:{...step.payload,id:`${step.payload.id}:${occurrence}`}}));
  document.dispatchEvent(new CustomEvent('director:event',{detail:{id:selected.id,act,phase:state.currentPuzzle}}));
  return selected.id;
}

export function signalBehavior(type,payload={}) {
  updateState((state)=>{
    const metrics=state.director.metrics;
    metrics.lastActionAt=Date.now();
    if (type==='wrong-answer') metrics.consecutiveWrong+=1;
    if (type==='progress') metrics.consecutiveWrong=0;
    if (type==='receiver') metrics.receiverInteractions+=1;
    if (type==='quarantine') metrics.quarantineActions+=1;
    if (type==='empty-search') metrics.emptySearches+=1;
    if (type==='phone-open') { metrics.lastPhoneOpenAt=Date.now(); metrics.ignoredNotifications=0; }
    if (type==='notification-ignored') metrics.ignoredNotifications+=1;
    if (type==='resource') {
      const id=payload.id || '';
      if (FOLDERS.has(id)) metrics.wrongFolderStreak+=1;
      else metrics.wrongFolderStreak=0;
      const openCount=state.computer.files[id]?.openCount || 0;
      metrics.repeatedFileOpens=Math.max(metrics.repeatedFileOpens,openCount);
    }
  });
  queueMicrotask(()=>evaluateBehaviorDirector());
}

export function tickBehaviorDirector() {
  const state=getState();
  const unreadAge=state.phone.notifications.length && !state.phone.open ? Date.now()-(state.phone.lastOpenedAt||state.startedAt||Date.now()) : 0;
  if (state.phone.unread && unreadAge>60_000 && Date.now()-(state.phone.lastIgnoredAt||0)>60_000) {
    updateState((draft)=>{draft.phone.lastIgnoredAt=Date.now();});
    signalBehavior('notification-ignored');
    return;
  }
  evaluateBehaviorDirector();
}
