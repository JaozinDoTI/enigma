import { renderHintPanel } from '../hints.js';
import { renderDevPanel, renderNarrativeLoader, renderPuzzleBrief, renderReturnControl, renderSceneTools } from './shared.js';

export function renderReceiverScene(context) {
  const { puzzle, state, content, animate } = context;
  return `<section class="receiver-scene${animate ? ' scene-enter is-entering' : ''}" data-scene-family="device" data-puzzle-id="${puzzle.id}" data-motion-scope="scene" aria-label="Ambiente do receptor ${puzzle.code}">
    <div class="receiver-room" aria-hidden="true"><i></i><i></i><i></i></div>
    <header class="receiver-scene__exit">${renderReturnControl(puzzle, state, 'ABANDONAR RECEPTOR')}${renderSceneTools(state, { compact: true })}</header>
    ${renderPuzzleBrief(puzzle, state, { floating: true })}
    <div class="receiver-scene__equipment"><div class="receiver-scene__plate"><span>UNIDADE DE INTERCEPTAÇÃO</span><strong>VX-11 / ${puzzle.code}</strong><small>ALIMENTAÇÃO 110–127 V · NÃO ABRIR</small></div>${content}</div>
    <footer class="receiver-scene__floor"><span>PORTADORA ANALÓGICA</span><span>LINHA NÃO MONITORADA</span></footer>
    <div class="receiver-scene__assistance">${renderHintPanel(puzzle.id)}</div>
    ${renderNarrativeLoader()}${renderDevPanel(state)}
  </section>`;
}
