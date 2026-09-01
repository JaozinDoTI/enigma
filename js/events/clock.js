import { audioManager } from '../audio.js';
import { openDesktopResource } from './desktop-os.js';
import { Motion } from '../motion-engine.js';
import { getState, updateState } from '../state.js';
import { emitWorldEvent } from '../worlds/world-events.js';

export function handleClockClick(action, context) {
  if (action !== 'os-clock-apply') return false;
  const state = getState();
  const time = `${String(state.desktopOs.clockHour).padStart(2,'0')}:${String(state.desktopOs.clockMinute).padStart(2,'0')}`;
  audioManager.playEvent('computer.clock.apply',{volume:.12});
  if (context.current() === '15') {
    if (time !== '03:17') { context.wrong('15',time,'O BOOKSCAN não aponta para essa hora.'); return true; }
    updateState((draft) => { draft.desktopOs.clockPanelOpen=false; draft.flags.clock0317Triggered=true; });
    emitWorldEvent('computer.clock.0317');
    document.querySelector('.retro-desktop')?.classList.add('is-clock-reacting');
    audioManager.clockRupture();
    Motion.schedule('clock-0317-resource',()=>openDesktopResource('clock-note'),620);
    context.progress('15',['16'],'03:17 // ARQUIVO OCULTO RECUPERADO',{delay:2100});
    return true;
  }
  if (context.current() === '23') {
    if (time !== '10:10') { context.wrong('23',time,'A hora não corresponde ao EVENTO_1010.'); return true; }
    updateState((draft)=>{draft.desktopOs.clockPanelOpen=false;draft.flags.bookPairResolved=true;draft.flags.clockOriginRestored=true;});
    document.querySelector('.retro-desktop')?.classList.add('is-clock-synchronized');
    audioManager.playEvent('system.relay',{volume:.18});
    context.progress('23',['24'],'ORIGEM TEMPORAL SINCRONIZADA // RECUPERAR.exe REESCRITO',{delay:1400});
    return true;
  }
  context.feedback(`RELÓGIO AJUSTADO // ${time}`,'good');
  return true;
}
