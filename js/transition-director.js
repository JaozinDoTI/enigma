import { audioManager } from './audio.js';
import { Motion } from './motion-engine.js';
import { puzzleFor } from './puzzles/catalog.js';
import { discoverPuzzle, getState, updateState } from './state.js';
import { escapeHtml } from './utils.js';
import { cameraTargetFor, setRoomCamera } from './room-stage.js';

let navigateTo = () => {};
let refreshView = () => {};

const WORLD_LABELS = Object.freeze({computer:'COMPUTADOR',tv:'RECEIVER',phone:'CELULAR',document:'ARQUIVO',physical:'AMBIENTE',reconstruction:'AMBIENTE',forensic:'MESA DE EVIDÊNCIAS',final:'RECUPERAÇÃO'});

function worldOf(puzzle) { return puzzle?.world || puzzle?.family || 'computer'; }

export function configureTransitionDirector({navigate,refresh}) {
  navigateTo=navigate || navigateTo;
  refreshView=refresh || refreshView;
}

export function offerPhaseTransition(fromId,{delay=null}={}) {
  const puzzle=puzzleFor(fromId);
  const contract=puzzle?.transition;
  const to=contract?.to;
  if (!to) {
    updateState((state)=>{state.pendingTransition=null;});
    return null;
  }
  const target=puzzleFor(to);
  const existing=getState().pendingTransition;
  if (existing?.from===fromId && existing?.to===to && existing?.status!=='arrived') return existing;
  let instanceId='';
  updateState((state)=>{ state.transitionSequence=(state.transitionSequence||0)+1; instanceId=`T${String(state.transitionSequence).padStart(4,'0')}:${fromId}:${to}`; });
  const plan={
    instanceId,
    from:fromId,to,mode:contract.mode,motion:contract.motion,label:contract.label,
    fromWorld:worldOf(puzzle),toWorld:worldOf(target),fromTarget:cameraTargetFor(puzzle),toTarget:cameraTargetFor(target),status:'preparing',createdAt:Date.now()
  };
  updateState((state)=>{state.pendingTransition=plan;if(state.ui.titleReveal?.id===fromId) state.ui.titleReveal.transitionId=instanceId;});
  const wait=Motion.reduced?180:Math.max(650,Number(delay)||1000);
  Motion.schedule(`transition-offer:${instanceId}`,()=>{
    const current=getState().pendingTransition;
    if (!current || current.instanceId!==instanceId || current.status!=='preparing') return;
    updateState((state)=>{
      if (state.ui.titleReveal?.id===fromId) state.ui.titleReveal={...state.ui.titleReveal,status:'consumed',consumedAt:Date.now()};
      state.pendingTransition={...state.pendingTransition,status:'offered'};
    });
    refreshView();
    requestAnimationFrame(()=>document.querySelector('[data-action="accept-transition"]')?.focus({preventScroll:true}));
    if (contract.mode==='AUTO_CONTINUE' || contract.mode==='FINAL') Motion.schedule(`transition-auto-accept:${instanceId}`,()=>acceptPendingTransition(instanceId),Motion.reduced?180:520);
  },wait);
  return plan;
}

function ensureOverlay(plan) {
  document.querySelector('[data-world-handoff]')?.remove();
  const overlay=document.createElement('div');
  overlay.className='world-handoff';
  overlay.dataset.worldHandoff='';
  overlay.dataset.from=plan.fromWorld;
  overlay.dataset.to=plan.toWorld;
  overlay.dataset.motion=plan.motion;
  if (plan.fromWorld===plan.toWorld) overlay.classList.add('is-same-surface');
  overlay.setAttribute('aria-live','polite');
  overlay.dataset.transitionId=plan.instanceId;
  overlay.innerHTML=`<div class="world-handoff__room" aria-hidden="true"><i></i><b></b><em></em></div><p><span>${escapeHtml(plan.fromTarget)}</span><strong>${escapeHtml(plan.toTarget)}</strong></p>`;
  document.body.append(overlay);
  requestAnimationFrame(()=>overlay.classList.add('is-moving'));
  return overlay;
}

export function acceptPendingTransition(expectedInstanceId = null) {
  const plan=getState().pendingTransition;
  if (!plan || (expectedInstanceId && plan.instanceId!==expectedInstanceId) || !['preparing','offered'].includes(plan.status)) return false;
  const sameTarget=plan.fromTarget===plan.toTarget;
  updateState((state)=>{state.pendingTransition={...state.pendingTransition,status:'moving'};setRoomCamera(state,plan.toTarget,plan.motion);});
  if (sameTarget) {
    discoverPuzzle(plan.to,`handoff:${plan.from}`);
    updateState((state)=>{if(state.pendingTransition?.instanceId===plan.instanceId)state.pendingTransition={...state.pendingTransition,status:'arrived'};state.roomCamera.locked=false;state.roomCamera.transition=null;});
    navigateTo(plan.to);
    Motion.schedule(`transition-same-target:${plan.instanceId}`,()=>updateState((state)=>{if(state.pendingTransition?.instanceId===plan.instanceId)state.pendingTransition=null;}),60);
    return true;
  }
  const overlay=ensureOverlay(plan);
  audioManager.playWorldHandoff(plan);
  const sameSurface=plan.fromWorld===plan.toWorld;
  const bedside=plan.toTarget==='BEDSIDE'||plan.fromTarget==='BEDSIDE';
  const swapAt=Motion.reduced?80:(bedside?820:sameSurface?360:620);
  const finishAt=Motion.reduced?180:(bedside?1780:sameSurface?820:1380);
  Motion.schedule(`transition-world-swap:${plan.instanceId}`,()=>{
    if (getState().pendingTransition?.instanceId!==plan.instanceId) return;
    discoverPuzzle(plan.to,`handoff:${plan.from}`);
    updateState((state)=>{if(state.pendingTransition?.instanceId===plan.instanceId)state.pendingTransition={...state.pendingTransition,status:'arrived'};});
    navigateTo(plan.to);
  },swapAt);
  Motion.schedule(`transition-world-finish:${plan.instanceId}`,()=>{
    if (getState().pendingTransition?.instanceId!==plan.instanceId) { overlay.remove(); return; }
    overlay.classList.add('is-arrived');
    updateState((state)=>{if(state.pendingTransition?.instanceId===plan.instanceId)state.pendingTransition=null;state.roomCamera.locked=false;state.roomCamera.transition=null;});
    Motion.schedule(`transition-world-remove:${plan.instanceId}`,()=>overlay.remove(),Motion.reduced?20:260);
  },finishAt);
  return true;
}

export function renderTransitionOffer(state) {
  const plan=state.pendingTransition;
  if (!plan || plan.status!=='offered' || ['AUTO_CONTINUE','FINAL'].includes(plan.mode)) return '';
  const eyebrow=plan.mode==='PHYSICAL_HANDOFF'?'A PISTA CONTINUA FORA DA TELA':plan.mode==='DIEGETIC_ENTRY'?'NOVO PONTO DE ENTRADA DISPONÍVEL':'OUTRO DISPOSITIVO ESTÁ RESPONDENDO';
  return `<aside class="transition-offer" data-transition-offer data-transition-id="${escapeHtml(plan.instanceId)}" role="status"><span>${escapeHtml(eyebrow)}</span><button type="button" data-action="accept-transition">${escapeHtml(plan.label)}</button></aside>`;
}

export function clearPendingTransition() {
  const instanceId=getState().pendingTransition?.instanceId;
  if (instanceId) {
    ['transition-offer','transition-auto-accept','transition-same-target','transition-world-swap','transition-world-finish','transition-world-remove'].forEach((key)=>Motion.cancel(`${key}:${instanceId}`));
  }
  updateState((state)=>{state.pendingTransition=null;});
  document.querySelector('[data-world-handoff]')?.remove();
  refreshView();
}
