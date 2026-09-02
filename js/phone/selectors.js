import { PHONE_EVENT_CATALOG } from './catalog.js';

const visibleByProgress = (state,entry) => !entry.payload?.visibleFrom || state.unlocked.includes(entry.payload.visibleFrom) || state.completed.includes(entry.payload.visibleFrom);

export function selectPhoneEntries(state) {
  return state.phone.order.map((id)=>state.phone.entries[id]).filter((entry)=>entry && visibleByProgress(state,entry) && !['removed','expired'].includes(entry.status));
}

export const selectPhoneKind = (state,kind) => selectPhoneEntries(state).filter((entry)=>entry.kind===kind && entry.status!=='scheduled');
export const selectThread = (state,thread) => selectPhoneKind(state,'message').filter((entry)=>(entry.payload.thread||'unknown')===thread);
export const selectTyping = (state,thread,now=Date.now()) => selectPhoneKind(state,'typing').some((entry)=>entry.payload.thread===thread && Number(entry.expiresAt||0)>now);
export const selectRingingCall = (state,now=Date.now()) => selectPhoneKind(state,'call').find((entry)=>entry.payload.callState==='ringing' && Number(entry.expiresAt||Infinity)>now) || null;

export function selectNotifications(state) {
  return selectPhoneEntries(state).filter((entry)=>entry.payload?.notify && entry.status!=='scheduled' && !entry.openedAt && (!entry.expiresAt || entry.expiresAt>Date.now())).map((entry)=>({
    id:entry.id, kind:entry.kind, at:entry.visibleAt||entry.createdAt,
    label:entry.kind==='call'?(entry.payload.person||'Telefone'):entry.kind==='phantom'?'Mensagens':entry.kind==='gallery'?'Galeria':entry.kind==='contact'?'Contatos':entry.kind==='file'?'Arquivos':'Mensagens',
    preview:entry.kind==='call'?'Chamada recebida':entry.payload.preview||entry.payload.text||entry.payload.label||entry.payload.name||'Nova atividade'
  })).sort((a,b)=>a.at-b.at);
}

export const selectUnreadCount = (state) => selectPhoneKind(state,'message').filter((entry)=>!entry.seenAt).length;

export function phoneClock(state,now=Date.now()) {
  const clock=state.phone.clock;
  const offset=clock.restoreAt>now?clock.offset:0;
  const total=((clock.hour*60)+clock.minute+offset+1440)%1440;
  return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
}

export function phoneDebugSummary(state) {
  const entries=selectPhoneEntries(state);
  const now=Date.now();const level=state.phone.activity.level;
  const eligible=PHONE_EVENT_CATALOG.filter((event)=>event.level<=level&&event.level>=Math.max(0,level-1))
    .filter((event)=>(state.phone.scheduler.counts[event.definition]||0)<event.max)
    .filter((event)=>(state.phone.scheduler.cooldowns[event.definition]||0)<=now)
    .filter((event)=>!state.phone.scheduler.locks[event.group])
    .filter((event)=>!event.condition||event.condition(state)).map((event)=>event.definition);
  return {
    level:state.phone.activity.level,
    seed:state.phone.scheduler.seed,
    cursor:state.phone.scheduler.cursor,
    pending:state.phone.scheduler.queue.map((id)=>({id,dueAt:state.phone.entries[id]?.dueAt||null})),
    eligible,
    locks:Object.keys(state.phone.scheduler.locks),
    lastDecision:state.phone.scheduler.decisions.at(-1)||null,
    totals:Object.fromEntries(['scheduled','visible','seen','answered','rejected','returned','expired','removed'].map((status)=>[status,Object.values(state.phone.entries).filter((entry)=>entry.status===status).length])),
    recent:entries.slice(-6).map(({id,definition,kind,status})=>({id,definition,kind,status}))
  };
}
