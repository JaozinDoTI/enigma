import { audioManager } from '../audio.js';
import { patchPhoneDevices } from '../phone.js';
import { getState, updateState } from '../state.js';

const PHONE_ACTIONS = new Set([
  'phone-toggle','phone-unlock','phone-home','phone-app','phone-thread','phone-confirm-memory',
  'phone-audio','phone-call-audio','phone-gallery-open','phone-gallery-close','phone-share-evidence','phone-open-notification'
]);

function patch(options = { screen:true, status:true, badges:true }) {
  patchPhoneDevices(getState(),options);
}

export function handlePhoneClick(action, button, context) {
  if (!PHONE_ACTIONS.has(action)) return false;
  if (action === 'phone-toggle') {
    let open = false;
    updateState((state)=>{ state.phone.open=!state.phone.open; open=state.phone.open; });
    const dock = button.closest('[data-phone-dock]');
    dock?.classList.toggle('is-open',open);
    dock?.querySelector('.phone-dock__device')?.toggleAttribute('hidden',!open);
    button.setAttribute('aria-expanded',String(open));
    audioManager.playEvent(open?'phone.unlock':'phone.lock',{volume:.07});
    return true;
  }
  if (action === 'phone-open-notification') {
    updateState((state)=>{
      state.phone.open=true;
      state.phone.locked=false;
      state.phone.app=button.dataset.kind==='call'?'calls':'messages';
      state.phone.thread=button.dataset.kind==='call'?null:'unknown';
      state.phone.notifications=[];
      state.phone.unread=0;
    });
    button.remove();
    patch();
    document.querySelectorAll('[data-phone-dock]').forEach((dock)=>{
      dock.classList.add('is-open');
      dock.querySelector('.phone-dock__device')?.removeAttribute('hidden');
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
        state.phone.unread=0;
        state.phone.notifications=[];
      }
    });
    patch();
    document.querySelectorAll('.phone-notification').forEach((item)=>item.remove());
    const sound = action === 'phone-unlock' ? 'phone.unlock' : action === 'phone-app' ? 'phone.app.open' : 'phone.tap';
    audioManager.playEvent(sound,{volume:.05});
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
  if (action === 'phone-confirm-memory') {
    if (context.current() !== '12') {
      context.feedback('EVIDÊNCIA DETECTADA // CONTEXTO FORENSE AINDA INCOMPLETO','warn');
      return true;
    }
    updateState((state)=>{state.phone.events=[...new Set([...state.phone.events,'memory:2019'])];});
    context.correctAnswer('12','mullet');
    return true;
  }
  if (action === 'phone-audio' || action === 'phone-call-audio') {
    audioManager.playUnknownSource({ duration:7 });
    button.textContent='00:07 // TRÊS IMPACTOS';
    button.closest('.phone-app')?.querySelector('[data-phone-call-caption]')?.replaceChildren(document.createTextNode('estática · três impactos · silêncio'));
    return true;
  }
  return true;
}
