import { escapeHtml } from './utils.js';

const TARGET_BY_WORLD = Object.freeze({
  computer:'DESK', device:'RECEIVER', tv:'RECEIVER', forensic:'TABLE', archive:'TABLE',
  document:'TABLE', reconstruction:'ROOM', physical:'ROOM', phone:'DESK', final:'ROOM'
});

const TARGET_BY_PHASE = Object.freeze({ '09':'DESK', '11':'TABLE', '12':'TABLE', '16':'BEDSIDE', '18':'TABLE', '19':'TABLE', '20':'TABLE', '22':'ROOM', '24':'TABLE', '25':'ROOM' });

export function cameraTargetFor(puzzle) {
  return TARGET_BY_PHASE[puzzle?.id] || TARGET_BY_WORLD[puzzle?.world] || TARGET_BY_WORLD[puzzle?.family] || 'DESK';
}

export function renderRoomStage(scene,puzzle,state) {
  const target=cameraTargetFor(puzzle);
  const previous=state.roomCamera?.previousTarget || target;
  return `<section class="room-stage" data-room-stage data-camera-target="${target}" data-camera-previous="${previous}">
    <div class="room-stage__space" aria-hidden="true">
      <div class="room-stage__wall"><i></i><i></i></div>
      <div class="room-anchor room-anchor--desk"><span>R-1010</span></div>
      <div class="room-anchor room-anchor--receiver"><span>VX</span></div>
      <div class="room-anchor room-anchor--table"><i></i><i></i><i></i></div>
      <div class="room-anchor room-anchor--bedside"><b></b></div>
      <div class="room-stage__floor"></div>
    </div>
    <div class="room-stage__camera" data-room-camera>
      <div class="room-stage__peripheral" aria-hidden="true"><span>${escapeHtml(target)}</span></div>
      <div class="room-stage__focus">${scene}</div>
    </div>
  </section>`;
}

export function setRoomCamera(state,target,transition=null) {
  if (!state.roomCamera || state.roomCamera.target===target) return false;
  state.roomCamera.previousTarget=state.roomCamera.target;
  state.roomCamera.target=target;
  state.roomCamera.transition=transition;
  state.roomCamera.locked=Boolean(transition);
  return true;
}
