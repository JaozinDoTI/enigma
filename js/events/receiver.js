import { audioManager } from '../audio.js';
import { syncClarityStatus, syncTv } from '../dom-sync.js';
import { Motion } from '../motion-engine.js';
import { getState, updateState } from '../state.js';
import { clamp } from '../utils.js';
import { emitWorldEvent } from '../worlds/world-events.js';

const RECEIVER_ACTIONS = new Set(['tv-power','tv-channel','tv-volume','tv-fine','play-morse']);

function setTv(property, value) {
  updateState((state) => { state.tv[property] = value; });
  const eventName = property === 'power' ? 'tv:power' : property === 'channel' ? 'tv:channel' : property === 'fine' ? 'tv:fine' : 'tv:volume';
  Motion.emit(eventName, { property, value });
}

async function playMorse() {
  if (!getState().tv.power) return;
  const lamp = document.querySelector('.morse-lamp');
  const trace = document.querySelector('.signal-trace');
  if (!lamp || lamp.dataset.playing) return;
  lamp.dataset.playing = '1';
  await audioManager.playMorse(['--','.', '...', '.-'], lamp, trace);
  updateState((state) => { state.tv.morsePlays += 1; });
  delete lamp.dataset.playing;
}

export function handleReceiverClick(action,button,context) {
  if (!RECEIVER_ACTIONS.has(action)) return false;
  if (action === 'play-morse') {
    if (!getState().tv.power) context.feedback('SEM SINAL // RECEPTOR DESLIGADO','warn');
    else playMorse();
    return true;
  }
  const previous = getState();
  if (context.current() === '17' && !previous.flags.greenNodeValidated) return true;
  if (action === 'tv-power') setTv('power', !previous.tv.power);
  if (action === 'tv-channel') setTv('channel', clamp(previous.tv.channel + Number(button.dataset.delta), 1, 12));
  if (action === 'tv-volume') setTv('volume', clamp(previous.tv.volume + Number(button.dataset.delta), 0, 10));
  if (action === 'tv-fine') setTv('fine', clamp(previous.tv.fine + Number(button.dataset.delta), -5, 5));
  const state = getState();
  syncTv(state);
  const id = context.current();
  if (id === '03' && state.tv.power && !previous.unlocked.includes('13') && state.tv.channel === 4) {
    updateState((draft) => { draft.tv.unlocked = true; });
    Motion.play('receiver-channel-lock', { target: document.querySelector('.tv-cabinet') });
    emitWorldEvent('tv.channel.04.locked');
    context.progress('03',['04'],'CANAL ANÔMALO ENCONTRADO');
    return true;
  }
  if (['03','13'].includes(id) && state.tv.power && state.unlocked.includes('13') && !state.completed.includes('13') && state.tv.channel === 11) {
    updateState((draft) => { draft.flags.tvChannel11Primed = true; });
    syncClarityStatus(id,getState());
    Motion.play('receiver-channel-loss',{target:document.querySelector('.tv-cabinet')});
    audioManager.playUnknownSource({duration:1.1});
    context.toast('CANAL 11 // NENHUMA PORTADORA ESTÁVEL');
    return true;
  }
  if (['03','13'].includes(id) && action==='tv-power' && !state.tv.power && state.tv.channel===11 && state.flags.tvChannel11Primed && !state.completed.includes('13')) {
    updateState((draft)=>{draft.flags.tvSequenceSeen=true;});
    syncTv(getState());
    Motion.play('tv-afterimage',{target:document.querySelector('.tv-screen')});
    context.progress('13',['14'],'IMAGEM RESIDUAL RECUPERADA: FIM / 01 / COMEÇO',{delay:1000});
    return true;
  }
  if (id==='17' && state.tv.power && state.tv.channel===10 && state.tv.volume===10 && state.tv.fine===3) {
    updateState((draft)=>{draft.flags.tvTuned=true;});
    Motion.play('receiver-channel-lock',{target:document.querySelector('.tv-cabinet')});
    context.progress('17',['18'],'PORTADORA DO EVENTO_1010 FIXADA');
    return true;
  }
  const signalEvent = action === 'tv-channel' ? 'receiver-channel-loss' : action === 'tv-power' ? (state.tv.power?'receiver-power-on':'receiver-power-off') : 'frame-ghost';
  Motion.play(signalEvent,{target:action==='tv-volume'?document.querySelector('.tv-knob-control--volume'):document.querySelector('.tv-cabinet')});
  return true;
}
