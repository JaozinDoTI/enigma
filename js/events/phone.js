import { audioManager } from '../audio.js';
import { patchPhoneDevices } from '../phone.js';
import { signalBehavior } from '../behavior-director.js';
import { discoverPuzzle, getState, updateState } from '../state.js';
import { emitWorldEvent } from '../worlds/world-events.js';
import { Motion } from '../motion-engine.js';

const PHONE_ACTIONS = new Set([
  'phone-toggle','phone-unlock','phone-home','phone-app','phone-thread','phone-confirm-memory',
  'phone-audio','phone-call-audio','phone-gallery-open','phone-gallery-close','phone-share-evidence','phone-open-notification'
  ,'phone-trace-memory'
]);

function patch(options = { screen:true, status:true, badges:true }) {
  patchPhoneDevices(getState(),options);
}

export function handlePhoneClick(action, button, context) {
  if (!PHONE_ACTIONS.has(action)) return false;
  if (action === 'phone-toggle') {
    const wasOpen=getState().phone.open;
    const open=!wasOpen;
    updateState((state)=>{ state.phone.open=open; state.phone.interactionState=open?'lifting':'lowering'; if(open) state.phone.lastOpenedAt=Date.now(); });
    const dock = button.closest('[data-phone-dock]');
    const device=dock?.querySelector('.phone-dock__device');
    if (open) {
      device?.removeAttribute('hidden');
      dock?.classList.remove('is-lowering');
      dock?.classList.add('is-open','is-lifting');
      requestAnimationFrame(()=>dock?.classList.add('is-picked-up'));
      Motion.schedule('phone-pickup-finish',()=>{dock?.classList.remove('is-lifting');updateState((state)=>{state.phone.interactionState='held';});},Motion.reduced?0:620);
    } else {
      dock?.classList.remove('is-picked-up');
      dock?.classList.add('is-lowering');
      Motion.schedule('phone-lowering-finish',()=>{dock?.classList.remove('is-open','is-lowering');device?.setAttribute('hidden','');updateState((state)=>{state.phone.interactionState='resting';});},Motion.reduced?0:520);
    }
    button.setAttribute('aria-expanded',String(open));
    audioManager.playEvent(open?'phone.pickup':'phone.lock',{volume:open ? .18 : .15});
    if (open) signalBehavior('phone-open');
    return true;
  }
  if (action === 'phone-open-notification') {
    updateState((state)=>{
      state.phone.open=true;
      state.phone.locked=false;
      const destination={call:'calls',gallery:'gallery',files:'files',notes:'notes'}[button.dataset.kind] || 'messages';
      state.phone.app=destination;
      state.phone.thread=destination==='messages'?'unknown':null;
      const notificationId=button.dataset.notification;
      state.phone.notifications=state.phone.notifications.map((item)=>item.id===notificationId?{...item,status:'read',openedAt:Date.now()}:item);
      const opened=state.phone.notifications.find((item)=>item.id===notificationId);if(opened?.eventId&&state.phone.eventLedger[opened.eventId])state.phone.eventLedger[opened.eventId]={...state.phone.eventLedger[opened.eventId],status:'read',openedAt:opened.openedAt};
      state.phone.unread=state.phone.notifications.filter((item)=>item.status!=='read').length;
      state.phone.lastOpenedAt=Date.now();
      state.phone.interactionState='lifting';
    });
    if (getState().phone.open) signalBehavior('phone-open');
    button.dataset.action='phone-toggle';
    button.removeAttribute('data-kind');
    button.removeAttribute('data-notification');
    patch();
    document.querySelectorAll('[data-phone-dock]').forEach((dock)=>{
      dock.classList.add('is-open');
      dock.classList.remove('has-notification','is-waking','has-preview');
      dock.classList.add('is-lifting');
      dock.querySelector('.phone-dock__device')?.removeAttribute('hidden');
      requestAnimationFrame(()=>dock.classList.add('is-picked-up'));
      Motion.schedule('phone-notification-pickup-finish',()=>{dock.classList.remove('is-lifting');updateState((state)=>{state.phone.interactionState='held';});},Motion.reduced?0:620);
    });
    audioManager.playEvent('phone.unlock',{volume:.07});
    return true;
  }
  if (['phone-unlock','phone-home','phone-app','phone-thread'].includes(action)) {
    updateState((state)=>{
      if (action==='phone-unlock') { state.phone.locked=false; state.phone.app='home'; }
      if (action==='phone-home') { state.phone.locked=false; state.phone.app='home'; state.phone.thread=null; state.phone.galleryItem=null; }
      if (action==='phone-app') { state.phone.app=button.dataset.phoneApp || 'home'; state.phone.thread=null; state.phone.galleryItem=null; }
      if (action==='phone-thread') { state.phone.app='messages'; state.phone.thread=button.dataset.thread || 'j'; }
      if ((action==='phone-app' && ['messages','calls'].includes(state.phone.app)) || action==='phone-thread') {
        const kinds=state.phone.app==='calls'?['call']:['message'];
        state.phone.notifications=state.phone.notifications.map((item)=>kinds.includes(item.kind)?{...item,status:'read',openedAt:item.openedAt||Date.now()}:item);
        state.phone.unread=state.phone.notifications.filter((item)=>item.status!=='read').length;
      }
    });
    patch();
    document.querySelectorAll('[data-phone-dock]').forEach((dock)=>dock.classList.remove('has-notification','is-waking','has-preview'));
    const appSound={messages:'phone.app.messages',gallery:'phone.app.gallery',files:'phone.app.files',recorder:'phone.app.recorder',calls:'phone.app.calls',calendar:'phone.app.calendar',camera:'phone.app.camera'};
    const sound = action === 'phone-unlock' ? 'phone.unlock' : action === 'phone-app' ? (appSound[button.dataset.phoneApp]||'phone.app.open') : 'phone.tap';
    audioManager.playEvent(sound,{volume:.05});
    if (action==='phone-thread' && button.dataset.thread==='j' && getState().unlocked.includes('12') && !getState().discovered.includes('12')) {
      discoverPuzzle('12','phone-thread');
      context.navigate?.('12');
    }
    return true;
  }
  if (action === 'phone-gallery-open') {
    updateState((state)=>{state.phone.galleryItem=button.dataset.gallery;});
    patch({screen:true,status:false,badges:false});
    audioManager.playEvent('phone.tap',{volume:.045});
    return true;
  }
  if (action === 'phone-gallery-close') {
    updateState((state)=>{state.phone.galleryItem=null;});
    patch({screen:true,status:false,badges:false});
    return true;
  }
  if (action === 'phone-share-evidence') {
    updateState((state)=>{state.discoveries=[...new Set([...state.discoveries,`phone-gallery:${button.dataset.gallery}`])];},{progress:true});
    context.feedback('METADATA ANEXADA À INVESTIGAÇÃO LOCAL','good');
    audioManager.playEvent('ui.accept',{volume:.07});
    return true;
  }
  if (action === 'phone-trace-memory') {
    const step=button.dataset.step;
    updateState((state)=>{state.phone.memoryTrail=[...new Set([...state.phone.memoryTrail,step])];if(step==='message')state.phone.app='files';if(step==='files')state.phone.app='camera';},{progress:true});
    patch({screen:true,status:false,badges:false});
    context.feedback(step==='archive'?'CÓPIA DEGRADADA RECUPERADA':'ORIGEM SEGUINTE LOCALIZADA','good');
    audioManager.playEvent('system.relay',{volume:.08});
    return true;
  }
  if (action === 'phone-confirm-memory') {
    if (context.current() !== '12') {
      context.feedback('EVIDÊNCIA DETECTADA // CONTEXTO FORENSE AINDA INCOMPLETO','warn');
      return true;
    }
    updateState((state)=>{state.phone.events=[...new Set([...state.phone.events,'memory:2019'])];});
    emitWorldEvent('phone.curitiba.attached');
    context.correctAnswer('12','curitiba');
    return true;
  }
  if (action === 'phone-audio' || action === 'phone-call-audio') {
    if (getState().phone.foregroundPlayback) return true;
    updateState((state)=>{state.phone.foregroundPlayback={id:button.dataset.signal||'source.03',startedAt:Date.now(),duration:7000};});
    audioManager.playUnknownSource({ duration:7 });
    button.textContent='REPRODUZINDO';
    button.disabled=true;
    button.closest('.phone-app')?.classList.add('is-playing');
    button.closest('.phone-app')?.querySelector('[data-phone-call-caption]')?.replaceChildren(document.createTextNode('estática · três impactos · silêncio'));
    Motion.schedule('phone-foreground-finish',()=>{
      updateState((state)=>{state.phone.foregroundPlayback=null;});
      if (button.isConnected) {button.disabled=false;button.textContent=action==='phone-call-audio'?'OUVIR':'REPRODUZIR';button.closest('.phone-app')?.classList.remove('is-playing');}
    },7000);
    return true;
  }
  return true;
}
