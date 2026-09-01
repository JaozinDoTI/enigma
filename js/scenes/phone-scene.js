import { renderHintPanel } from '../hints.js';
import { renderPhoneDevice } from '../phone.js';
import { renderDevPanel, renderNarrativeLoader, renderPuzzleBrief, renderReturnControl, renderSceneTools } from './shared.js';

export function renderPhoneScene({ puzzle, state, animate }) {
  return `<section class="phone-scene${animate?' scene-enter is-entering':''}" data-scene-family="phone" data-motion-scope="scene"><div class="phone-scene__room" aria-hidden="true"></div><header>${renderReturnControl(puzzle,state,'ABAIXAR CELULAR')}${renderSceneTools(state,{compact:true})}</header>${renderPuzzleBrief(puzzle,state,{floating:true})}<main>${renderPhoneDevice(state,{embedded:true})}</main><aside>${renderHintPanel(puzzle.id)}</aside>${renderNarrativeLoader()}${renderDevPanel(state)}</section>`;
}
