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
  ]
});

const actionKey = (eventName, action) => `${eventName}:${action.domain}:${action.payload.id || action.type}`;

function deliverPhone(action) {
  const payload = action.payload;
  const notification = action.type === 'message'
    ? { id:payload.id, kind:'message', label:'NÚMERO NÃO SALVO', preview:payload.notification || '1 nova mensagem' }
    : action.type === 'call'
      ? { id:payload.id, kind:'call', label:payload.from, preview:`chamada ${payload.status.toLowerCase()} · ${payload.duration}` }
      : null;
  if (action.type === 'call') {
    audioManager.playEvent('phone.incoming',{volume:.1});
    audioManager.playEvent('phone.vibration',{when:.06,volume:.08,duration:.48});
  } else if (action.type === 'message') {
    audioManager.playEvent('phone.vibration',{volume:.07});
    audioManager.playEvent('phone.message',{when:.12,volume:.08});
  } else if (action.type === 'clock') {
    audioManager.playEvent('source.03',{volume:.045,duration:.22});
  }
  if (notification) showPhoneNotification(notification);
  updateState((state) => {
    if (action.type === 'message') {
      state.phone.unread += 1;
      state.phone.delivered = [...new Set([...state.phone.delivered,payload.id])];
      state.phone.notifications = [...state.phone.notifications,notification].slice(-8);
    }
    if (action.type === 'call') {
      state.phone.unread += 1;
      state.phone.delivered = [...new Set([...state.phone.delivered,payload.id])];
      state.phone.calls = [{ ...payload, at:Date.now() }, ...state.phone.calls.filter((call) => call.id !== payload.id)].slice(0,12);
      state.phone.notifications = [...state.phone.notifications,notification].slice(-8);
    }
    if (action.type === 'clock') {
      state.phone.clock.hour = payload.hour;
      state.phone.clock.minute = payload.minute;
      state.phone.clock.synchronized = true;
    }
  });
  patchPhoneDevices(getState(), { screen:action.type==='clock', status:true, badges:true });
  if (action.type === 'message' || action.type === 'call') patchPhoneDelivery(getState(),action);
}

function deliverComputer(action) {
  updateState((state) => { state.discoveries = [...new Set([...state.discoveries, action.payload.id])]; });
  document.querySelector('[data-retro-desktop]')?.classList.add('has-remote-trace');
  audioManager.playEvent('system.disk',{volume:.055});
}

function deliverTv(action) {
  updateState((state) => { state.discoveries = [...new Set([...state.discoveries, action.payload.id])]; });
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
