import { getState, updateState } from '../state.js';
import { syncRoomState } from '../dom-sync.js';
import { Motion } from '../motion-engine.js';
import { uiFeedback } from '../ui-feedback.js';

function selectRoomObject(button) {
  const object = button.dataset.object;
  if (object === 'tv') {
    uiFeedback.toast('O OBJETO NÃO POSSUI ÂNCORA FÍSICA', { kind:'error' });
    Motion.emit('room:object-rejected', { object, material:button.dataset.material });
    return;
  }
  updateState((state)=>{state.roomPlacement.selectedObject=object;});
  document.querySelectorAll('.room-object').forEach((item)=>item.classList.toggle('is-selected',item===button));
  document.querySelector('[data-room-placement-status]')?.replaceChildren(`OBJETO SELECIONADO // ${button.textContent.trim().replace('VERIFICADO','').trim()}`);
  document.querySelector('[data-action="room-anchor"]')?.focus();
  Motion.emit('room:object-pick', { object, material:button.dataset.material, input:'keyboard' });
}

function placeAtAnchor(button) {
  const objectId = getState().roomPlacement.selectedObject;
  if (!objectId) {
    uiFeedback.toast('SELECIONE UM OBJETO ANTES DA ÂNCORA', { kind:'error' });
    return;
  }
  const x = Number(button.dataset.x);
  const y = Number(button.dataset.y);
  updateState((state)=>{
    state.room[objectId]={x,y,moved:true};
    state.roomPlacement.selectedAnchor=button.dataset.anchor;
    state.roomPlacement.selectedObject=null;
  },{progress:true});
  const object = document.querySelector(`.room-object[data-object="${objectId}"]`);
  if (object) {
    object.style.left=`${x}%`; object.style.top=`${y}%`;
    object.classList.remove('is-selected'); object.classList.add('is-verified');
    object.querySelector('[data-room-object-state]')?.removeAttribute('hidden');
  }
  document.querySelector('[data-room-placement-status]')?.replaceChildren(`POSIÇÃO REGISTRADA // ${objectId.toUpperCase()} → ${button.textContent.trim()}`);
  const evaluation=syncRoomState(getState());
  Motion.emit('room:object-drop',{object:objectId,input:'keyboard'});
  if(evaluation.ready) Motion.emit('room:structure-ready',{relations:evaluation.verifiedRelations.length});
  object?.focus();
}

export function handleReconstructionClick(action, button) {
  if(action==='room-object'){selectRoomObject(button);return true;}
  if(action==='room-anchor'){placeAtAnchor(button);return true;}
  return false;
}
