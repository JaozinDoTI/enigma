import { audioManager } from '../audio.js';
import { Motion } from '../motion-engine.js';
import { getState, updateState } from '../state.js';
import { patchPhoneDelivery, patchPhoneDevices, showPhoneNotification } from '../phone.js';

const effect = (domain, type, delay, payload = {}) => Object.freeze({ domain, type, delay, payload });

export const WORLD_EVENTS = Object.freeze({
  'computer.event.isolated': [
    effect('phone','message',2200,{ id:'message:first-file', text:'você abriu justamente esse.', notification:'1 nova mensagem' })
  ],
  'tv.channel.04.locked': [
    effect('phone','call',1800,{ id:'call:three-tones', from:'NÚMERO NÃO SALVO', duration:'00:07', status:'PERDIDA', signal:'source.03' }),
    effect('computer','trace',0,{ id:'trace:receiver-04' })
  ],
  'computer.event.rewritten': [
    effect('phone','message',2600,{ id:'message:not-first', text:'você demorou pra perceber que mudou.', notification:'1 nova mensagem' })
  ],
  'phone.curitiba.attached': [
    effect('tv','carrier',900,{ id:'carrier:curitiba-metadata', channel:11 }),
    effect('computer','trace',1700,{ id:'trace:object-c-identified' })
  ],
  'tv.afterimage.recovered': [
    effect('computer','trace',1200,{ id:'trace:afterimage-f01c' })
  ],
  'computer.clock.0317': [
    effect('phone','message',1400,{ id:'message:first-time', text:'você já viu esse horário.', notification:'1 nova mensagem' }),
    effect('phone','clock',3400,{ id:'clock:0317', hour:3, minute:17 })
  ],
  'room.node.validated': [
    effect('computer','trace',500,{ id:'trace:room-node' }),
    effect('phone','message',1900,{ id:'message:local-not-yours', text:'local não significa seu.', notification:'NÚMERO NÃO SALVO' })
  ],
  'reconstruction.identity.linked': [
    effect('tv','carrier',700,{ id:'carrier:memory-return', channel:11 })
  ],
  'computer.integrity.ruptured': [
    effect('tv','carrier',600,{ id:'carrier:shell-loss', channel:11 }),
    effect('phone','message',2100,{ id:'message:shell-lost', text:'a estação ainda está respondendo.', notification:'atividade do sistema' })
  ],
  'computer.reboot.completed': [
    effect('computer','trace',400,{ id:'trace:boot-02' }),
    effect('phone','message',2600,{ id:'message:boot-02', text:'você chamou isso de reiniciar.', notification:'BOOT 02' })
  ]
});

const actionKey = (eventName, action) => `${eventName}:${action.domain}:${action.payload.id || action.type}`;

function deliverPhone(action) {
  const payload = action.payload;
  const notification = action.type === 'message'
    ? { id:payload.id, kind:'message', label:'NÚMERO NÃO SALVO', preview:payload.notification || '1 nova mensagem' }
    : action.type === 'call'
      ? { id:payload.id, kind:'call', label:payload.from, preview:`chamada ${payload.status.toLowerCase()} · ${payload.duration}` }
      : action.type === 'note'
        ? { id:payload.id, kind:'notes', label:'NOTAS', preview:payload.notification || 'nota alterada' }
        : action.type === 'artifact' || action.type === 'gallery'
          ? { id:payload.id, kind:action.type === 'gallery' ? 'gallery' : 'files', label:action.type === 'gallery' ? 'GALERIA' : 'ARQUIVOS', preview:payload.notification || 'novo item local' }
      : null;
  if (notification) Object.assign(notification,{status:'arrived',arrivedAt:Date.now(),openedAt:null});
  if (action.type === 'call') {
    audioManager.duck(['ambience'],{depth:.3,attack:.03,hold:.5,release:.7});
    audioManager.playEvent('phone.incoming',{volume:.22});
    audioManager.playEvent('phone.vibration',{when:.06,volume:.19,duration:.58});
  } else if (action.type === 'message') {
    audioManager.playEvent('phone.vibration',{volume:.17});
    audioManager.playEvent('phone.message',{when:.18,volume:.18});
  } else if (action.type === 'clock') {
    audioManager.playEvent('source.03',{volume:.045,duration:.22});
  }
  if (notification) showPhoneNotification(notification);
  updateState((state) => {
    const eventId=payload.eventId||payload.id;
    const previous=state.phone.eventLedger[eventId];
    state.phone.eventLedger[eventId]={...(previous||{}),...payload,eventId,type:action.type,status:'delivered',arrivedAt:previous?.arrivedAt||Date.now()};
    const upsertNotification=(candidate)=>{
      if(!candidate)return;
      state.phone.notifications=[...state.phone.notifications.filter((item)=>item.eventId!==eventId&&item.id!==candidate.id),{...candidate,eventId}].slice(-8);
    };
    if (action.type === 'message') {
      state.phone.delivered = [...new Set([...state.phone.delivered,payload.id])];
      state.phone.events = [...state.phone.events.filter((item)=>item.id!==payload.id),{...payload,type:'message',at:Date.now()}].slice(-24);
      upsertNotification(notification);
    }
    if (action.type === 'call') {
      state.phone.delivered = [...new Set([...state.phone.delivered,payload.id])];
      state.phone.calls = [{ ...payload, at:Date.now() }, ...state.phone.calls.filter((call) => call.id !== payload.id)].slice(0,12);
      upsertNotification(notification);
    }
    if (action.type === 'clock') {
      state.phone.clock.hour = payload.hour;
      state.phone.clock.minute = payload.minute;
      state.phone.clock.synchronized = true;
    }
    if (action.type === 'note') {
      state.phone.notes = [...state.phone.notes.filter((item)=>item.id!==payload.id),{...payload,at:Date.now()}].slice(-12);
      upsertNotification(notification);
    }
    if (action.type === 'artifact') {
      state.phone.artifacts = [...state.phone.artifacts.filter((item)=>item.id!==payload.id),{...payload,at:Date.now()}].slice(-12);
      upsertNotification(notification);
    }
    if (action.type === 'gallery') {
      state.phone.gallery = [...state.phone.gallery.filter((item)=>item.id!==payload.id),{...payload,at:Date.now()}].slice(-12);
      upsertNotification(notification);
      if (payload.capture) state.capture.delivered = true;
    }
    if (action.type === 'battery') state.phone.battery = Math.max(1,Math.min(100,Number(payload.value)||state.phone.battery));
    if (action.type === 'phantom') state.phone.phantom = {...payload,at:Date.now()};
    state.phone.unread=state.phone.notifications.filter((item)=>item.status!=='read').length;
  });
  const refreshScreen=['clock','note','artifact','gallery','battery','phantom'].includes(action.type) || (['message','call'].includes(action.type) && getState().phone.locked);
  patchPhoneDevices(getState(), { screen:refreshScreen, status:true, badges:true });
  if (action.type === 'message' || action.type === 'call') patchPhoneDelivery(getState(),action);
  if (action.type === 'phantom') Motion.schedule(`phone-phantom:${payload.id}`,()=>{
    updateState((state)=>{if(state.phone.phantom?.id===payload.id) state.phone.phantom=null;});
    patchPhoneDevices(getState(),{screen:true,status:false,badges:false});
  },Math.max(600,payload.duration||1200));
}

function deliverComputer(action) {
  updateState((state) => { state.discoveries = [...new Set([...state.discoveries, action.payload.id])]; });
  document.querySelector('[data-retro-desktop]')?.classList.add('has-remote-trace');
  audioManager.playEvent('system.disk',{volume:.055});
}

function deliverTv(action) {
  updateState((state) => {
    state.discoveries = [...new Set([...state.discoveries, action.payload.id])];
    if (action.type==='carrier' && action.payload.channel) {
      state.tv.channel=action.payload.channel;
      state.tv.unlocked=true;
      state.tv.externalMutation=action.payload.id;
      state.tv.lastTransmission=`CANAL ${String(action.payload.channel).padStart(2,'0')} // ALTERAÇÃO EXTERNA`;
    }
  });
  audioManager.playEvent('receiver.interference',{volume:.04,duration:.14});
}

function deliver(eventName, action, key) {
  if (action.domain === 'phone') deliverPhone(action);
  if (action.domain === 'computer') deliverComputer(action);
  if (action.domain === 'tv') deliverTv(action);
  updateState((state) => {
    state.worldEvents.scheduled = state.worldEvents.scheduled.filter((id) => id !== key);
    state.worldEvents.delivered = [...new Set([...state.worldEvents.delivered,key])];
  });
  document.dispatchEvent(new CustomEvent('world:delivered',{ detail:{ event:eventName, action } }));
}

export function emitWorldEvent(eventName) {
  (WORLD_EVENTS[eventName] || []).forEach((action) => {
    const key = actionKey(eventName,action);
    const state = getState();
    if (state.worldEvents.scheduled.includes(key) || state.worldEvents.delivered.includes(key)) return;
    updateState((draft) => { draft.worldEvents.scheduled = [...draft.worldEvents.scheduled,key]; });
    document.dispatchEvent(new CustomEvent('world:scheduled',{ detail:{ event:eventName, action } }));
    Motion.schedule(`world-event:${key}`,() => deliver(eventName,action,key),action.delay);
  });
}

export function scheduleWorldAction(eventName, action) {
  const normalized = effect(action.domain || 'phone',action.type,Math.max(0,action.delay || 0),action.payload || {});
  const key = actionKey(eventName,normalized);
  const state = getState();
  if (state.worldEvents.scheduled.includes(key) || state.worldEvents.delivered.includes(key)) return false;
  updateState((draft)=>{draft.worldEvents.scheduled=[...draft.worldEvents.scheduled,key];});
  document.dispatchEvent(new CustomEvent('world:scheduled',{detail:{event:eventName,action:normalized}}));
  Motion.schedule(`world-event:${key}`,()=>deliver(eventName,normalized,key),normalized.delay);
  return true;
}
