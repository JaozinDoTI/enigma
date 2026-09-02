import { audioManager } from '../audio.js';
import { discoverPuzzle, getState, updateState } from '../state.js';
import { emitWorldEvent } from '../worlds/world-events.js';
import { Motion } from '../motion-engine.js';
import { changePhoneCall, markPhoneThreadSeen, openPhoneEntry, reconcilePhone, recordPhoneAction } from '../phone/runtime.js';

const ACTIONS=new Set([
  'phone-toggle','phone-unlock','phone-home','phone-back','phone-overview','phone-app','phone-thread',
  'phone-back-messages','phone-back-thread','phone-open-notification','phone-attachment','phone-related-file',
  'phone-file-item','phone-back-files','phone-open-archive','phone-gallery-item','phone-back-gallery','phone-back-camera',
  'phone-save-metadata','phone-call-answer','phone-call-reject','phone-call-return','phone-play-audio'
]);

const setRoute=(app,view='root',id=null)=>updateState((state)=>{state.phone.locked=false;state.phone.route={app,view,id};});
const hasPhase12=()=>{const state=getState();return state.unlocked.includes('12')||state.completed.includes('12');};

function destinationFor(entry) {
  if(!entry)return {app:'home',view:'root',id:null};
  if(entry.kind==='call')return {app:'calls',view:'root',id:null};
  if(entry.kind==='gallery')return {app:entry.payload.archive?'camera':'gallery',view:'detail',id:entry.id};
  if(entry.kind==='file')return {app:'files',view:'detail',id:entry.id};
  if(entry.kind==='contact')return {app:'contacts',view:'root',id:null};
  if(entry.kind==='phantom')return {app:'messages',view:'root',id:null};
  return {app:'messages',view:'thread',id:entry.payload.thread||'unknown'};
}

function openPhone(entryReason='manual') {
  updateState((state)=>{state.phone.open=true;});
  recordPhoneAction('open',{entry:entryReason});reconcilePhone();
  audioManager.playEvent('phone.pickup',{volume:.34});
}

function closePhone() {
  updateState((state)=>{state.phone.open=false;state.phone.locked=true;});
  recordPhoneAction('close');audioManager.playEvent('phone.lock',{volume:.26});
}

export function handlePhoneClick(action,button,context) {
  if(!ACTIONS.has(action))return false;
  if(action==='phone-toggle'){
    if(getState().phone.open)closePhone();else openPhone();
    context.refresh?.();return true;
  }
  if(action==='phone-open-notification'){
    const id=button.dataset.entry;const entry=getState().phone.entries[id];
    openPhone('notification');openPhoneEntry(id);
    updateState((state)=>{state.phone.locked=false;state.phone.route=destinationFor(state.phone.entries[id]);});
    if(entry?.kind==='message')markPhoneThreadSeen(entry.payload.thread||'unknown');
    recordPhoneAction('item',{kind:'notification',id});audioManager.playEvent('phone.unlock',{volume:.2});context.refresh?.();return true;
  }
  if(action==='phone-unlock'){
    setRoute('home');recordPhoneAction('app',{app:'home'});audioManager.playEvent('phone.unlock',{volume:.2});context.refresh?.();return true;
  }
  if(action==='phone-home'||action==='phone-overview'){
    setRoute('home');recordPhoneAction('app',{app:'home'});audioManager.playEvent('phone.tap',{volume:.16});context.refresh?.();return true;
  }
  if(action==='phone-back'){
    const route=getState().phone.route;
    if(route.app==='home')closePhone();else if(route.view!=='root')setRoute(route.app);else setRoute('home');
    context.refresh?.();return true;
  }
  if(action==='phone-app'){
    const app=button.dataset.phoneApp||'home';setRoute(app);recordPhoneAction('app',{app});audioManager.playEvent(`phone.app.${app}`,{volume:.16});context.refresh?.();return true;
  }
  if(action==='phone-thread'){
    const thread=button.dataset.thread||'j';setRoute('messages','thread',thread);markPhoneThreadSeen(thread);recordPhoneAction('item',{kind:'thread',id:thread});
    if(thread==='j'&&hasPhase12()&&!getState().discovered.includes('12')){discoverPuzzle('12','phone-thread');context.navigate?.('12');}
    audioManager.playEvent('phone.tap',{volume:.14});context.refresh?.();return true;
  }
  if(action==='phone-back-messages'){setRoute('messages');context.refresh?.();return true;}
  if(action==='phone-back-thread'){setRoute('messages','thread','j');context.refresh?.();return true;}
  if(action==='phone-attachment'){
    const id=button.dataset.entry;setRoute('messages','attachment',id);recordPhoneAction('item',{kind:'attachment',id});audioManager.playEvent('phone.app.files',{volume:.18});context.refresh?.();return true;
  }
  if(action==='phone-related-file'||action==='phone-file-item'){
    const id=button.dataset.entry;setRoute('files','detail',id);recordPhoneAction('item',{kind:'file',id});audioManager.playEvent('phone.app.files',{volume:.18});context.refresh?.();return true;
  }
  if(action==='phone-back-files'){setRoute('files');context.refresh?.();return true;}
  if(action==='phone-open-archive'){setRoute('camera');recordPhoneAction('app',{app:'camera'});audioManager.playEvent('phone.app.camera',{volume:.2});context.refresh?.();return true;}
  if(action==='phone-gallery-item'){
    const id=button.dataset.entry;const archive=getState().phone.entries[id]?.payload.archive;setRoute(archive?'camera':'gallery','detail',id);recordPhoneAction('item',{kind:'gallery',id});audioManager.playEvent('phone.tap',{volume:.14});context.refresh?.();return true;
  }
  if(action==='phone-back-gallery'){setRoute('gallery');context.refresh?.();return true;}
  if(action==='phone-back-camera'){setRoute('camera');context.refresh?.();return true;}
  if(action==='phone-save-metadata'){
    if(context.current()!=='12'){context.feedback('Os detalhes foram preservados no aparelho.','good');return true;}
    updateState((state)=>{state.discoveries=[...new Set([...state.discoveries,'phone:metadata:curitiba'])];},{progress:true});
    emitWorldEvent('phone.curitiba.attached');audioManager.playEvent('ui.accept',{volume:.24});context.correctAnswer('12','curitiba');return true;
  }
  if(action==='phone-call-answer'||action==='phone-call-reject'||action==='phone-call-return'){
    const id=button.dataset.entry;const next=action==='phone-call-answer'?'answered':action==='phone-call-reject'?'rejected':'returned';
    if(!changePhoneCall(id,next))return true;
    recordPhoneAction(action==='phone-call-reject'?'call-rejected':action==='phone-call-return'?'call-returned':'call-answered',{id});
    if(next==='answered'){audioManager.duck(['ambience'],{depth:.28,attack:.05,hold:2.2,release:1});audioManager.playEvent('phone.pickup',{volume:.3});if(getState().phone.entries[id]?.payload.signal==='silence')audioManager.playEvent('phone.call.silence',{when:.25,volume:.3,duration:2.4});}
    else audioManager.playEvent('phone.lock',{volume:.24});context.refresh?.();return true;
  }
  if(action==='phone-play-audio'){
    if(getState().phone.ui.playback)return true;
    updateState((state)=>{state.phone.ui.playback={signal:button.dataset.signal||'normal',until:Date.now()+4000};});
    audioManager.duck(['ambience'],{depth:.22,attack:.06,hold:3.2,release:.8});
    if(button.dataset.signal==='normal')audioManager.playEvent('phone.recording',{volume:.45,duration:3.5});else audioManager.playUnknownSource({duration:4,volume:.7});
    Motion.schedule('phone-playback-end',()=>{updateState((state)=>{state.phone.ui.playback=null;});context.refresh?.();},4000);context.refresh?.();return true;
  }
  return true;
}

export function lowerPhoneFromKeyboard(context) {
  if(!getState().phone.open)return false;
  closePhone();context.refresh?.();return true;
}
