import { clamp } from '../utils.js';
import { bringPaperToFront, ensurePaperBoard } from '../paper-engine.js';
import { getState, updateState } from '../state.js';

let drag=null;

export function handlePaperClick(action,button) {
  const piece=button.closest('[data-paper-piece]');
  if (!piece || !['paper-rotate','paper-flip'].includes(action)) return false;
  const boardId=piece.dataset.board;const pieceId=piece.dataset.paperPiece;
  updateState((state)=>{
    const board=ensurePaperBoard(state,boardId);const current=board?.pieces[pieceId];if(!current)return;
    bringPaperToFront(state,boardId,pieceId);
    if(action==='paper-rotate')current.rotation=((current.rotation+Number(button.dataset.delta||0)+180)%360)-180;
    if(action==='paper-flip')current.flipped=!current.flipped;
  },{progress:true});
  return true;
}

export function handlePaperPointerDown(event) {
  const piece=event.target.closest('[data-paper-piece]');const field=piece?.closest('.paper-field');
  if(!piece||!field||event.target.closest('button')||(event.pointerType==='mouse'&&event.button!==0))return false;
  event.preventDefault();const fieldRect=field.getBoundingClientRect();const pieceRect=piece.getBoundingClientRect();
  updateState((state)=>bringPaperToFront(state,piece.dataset.board,piece.dataset.paperPiece));
  drag={pointerId:event.pointerId,piece,fieldRect,offsetX:event.clientX-pieceRect.left,offsetY:event.clientY-pieceRect.top,x:Number(piece.style.getPropertyValue('--paper-x').replace('%',''))||0,y:Number(piece.style.getPropertyValue('--paper-y').replace('%',''))||0};
  piece.setPointerCapture?.(event.pointerId);piece.classList.add('is-dragging');return true;
}

export function handlePaperPointerMove(event) {
  if(!drag||drag.pointerId!==event.pointerId)return false;event.preventDefault();
  drag.x=clamp(((event.clientX-drag.fieldRect.left-drag.offsetX)/drag.fieldRect.width)*100,0,88);
  drag.y=clamp(((event.clientY-drag.fieldRect.top-drag.offsetY)/drag.fieldRect.height)*100,0,82);
  drag.piece.style.setProperty('--paper-x',`${drag.x}%`);drag.piece.style.setProperty('--paper-y',`${drag.y}%`);return true;
}

export function handlePaperPointerUp(event,cancelled=false) {
  if(!drag||drag.pointerId!==event.pointerId)return false;const completed=drag;drag=null;completed.piece.classList.remove('is-dragging');
  if(!cancelled)updateState((state)=>{const board=ensurePaperBoard(state,completed.piece.dataset.board);const current=board?.pieces[completed.piece.dataset.paperPiece];if(current){current.x=completed.x;current.y=completed.y;}},{progress:true});
  return true;
}
