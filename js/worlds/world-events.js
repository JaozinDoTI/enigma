import { audioManager } from '../audio.js';
import { Motion } from '../motion-engine.js';
import { getState, updateState } from '../state.js';
import { reconcilePhone, scheduleCanonicalPhoneEvent, schedulePhoneOccurrence } from '../phone/runtime.js';

const effect=(domain,type,delay,payload={})=>Object.freeze({domain,type,delay,payload});

export const WORLD_EVENTS=Object.freeze({
  'computer.event.isolated':[effect('phone','canonical',2200)],
  'tv.channel.04.locked':[effect('phone','canonical',1800),effect('computer','trace',0,{id:'trace:receiver-04'})],
  'computer.event.rewritten':[effect('phone','canonical',2600)],
  'phone.curitiba.attached':[effect('tv','carrier',900,{id:'carrier:curitiba-metadata',channel:11}),effect('computer','trace',1700,{id:'trace:object-c-identified'})],
  'tv.afterimage.recovered':[effect('computer','trace',1200,{id:'trace:afterimage-f01c'})],
  'computer.clock.0317':[effect('phone','canonical',1400)],
  'room.node.validated':[effect('computer','trace',500,{id:'trace:room-node'}),effect('phone','canonical',1900)],
  'reconstruction.identity.linked':[effect('tv','carrier',700,{id:'carrier:memory-return',channel:11})],
  'computer.integrity.ruptured':[effect('tv','carrier',600,{id:'carrier:shell-loss',channel:11}),effect('phone','canonical',2100)],
  'computer.reboot.completed':[effect('computer','trace',400,{id:'trace:boot-02'}),effect('phone','canonical',2600)]
});

const actionKey=(eventName,action)=>`${eventName}:${action.domain}:${action.payload.id||action.type}`;

function deliverComputer(action) {
  updateState((state)=>{state.discoveries=[...new Set([...state.discoveries,action.payload.id])];});
  document.querySelector('[data-retro-desktop]')?.classList.add('has-remote-trace');
  audioManager.playEvent('system.disk',{volume:.1});
}

function deliverTv(action) {
  updateState((state)=>{
    state.discoveries=[...new Set([...state.discoveries,action.payload.id])];
    if(action.type==='carrier'&&action.payload.channel){state.tv.channel=action.payload.channel;state.tv.unlocked=true;state.tv.externalMutation=action.payload.id;state.tv.lastTransmission=`CANAL ${String(action.payload.channel).padStart(2,'0')} // ALTERAÇÃO EXTERNA`;}
  });
  audioManager.playEvent('receiver.interference',{volume:.08,duration:.14});
}

function completeWorldAction(eventName,action,key) {
  if(action.domain==='computer')deliverComputer(action);
  if(action.domain==='tv')deliverTv(action);
  updateState((state)=>{state.worldEvents.scheduled=state.worldEvents.scheduled.filter((id)=>id!==key);state.worldEvents.delivered=[...new Set([...state.worldEvents.delivered,key])];});
  document.dispatchEvent(new CustomEvent('world:delivered',{detail:{event:eventName,action}}));
}

function scheduleAction(eventName,action,forced=false) {
  const normalized=effect(action.domain||'phone',action.type,Math.max(0,action.delay||0),action.payload||{});
  const key=actionKey(eventName,normalized);const state=getState();
  if(state.worldEvents.scheduled.includes(key)||state.worldEvents.delivered.includes(key))return false;
  updateState((draft)=>{draft.worldEvents.scheduled=[...draft.worldEvents.scheduled,key];});
  document.dispatchEvent(new CustomEvent('world:scheduled',{detail:{event:eventName,action:normalized}}));
  if(normalized.domain==='phone'){
    const scheduled=normalized.type==='canonical'
      ?scheduleCanonicalPhoneEvent(eventName,{delay:normalized.delay,worldKey:key})
      :Boolean(schedulePhoneOccurrence(`CANON_${eventName.toUpperCase().replaceAll(/[^A-Z0-9]+/g,'_')}`,{kind:normalized.type,...normalized.payload,notify:normalized.payload.notification!==false},{delay:normalized.delay,source:eventName,forced,worldKey:key}));
    if(!scheduled)completeWorldAction(eventName,normalized,key);
  } else Motion.schedule(`world-event:${key}`,()=>completeWorldAction(eventName,normalized,key),normalized.delay);
  return true;
}

export function emitWorldEvent(eventName){(WORLD_EVENTS[eventName]||[]).forEach((action)=>scheduleAction(eventName,action));}
export function scheduleWorldAction(eventName,action){return scheduleAction(eventName,action,Boolean(action.forced));}
export function reconcileWorldEvents(now=Date.now()){return reconcilePhone(now);}
