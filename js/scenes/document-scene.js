import { renderHintPanel } from '../hints.js';
import { renderDevPanel, renderNarrativeLoader, renderPuzzleBrief, renderReturnControl, renderSceneTools } from './shared.js';

export function renderDocumentScene(context) {
  const { puzzle, state, content, animate, total } = context;
  return `<section class="document-scene${animate ? ' scene-enter is-entering' : ''}" data-scene-family="archive" data-puzzle-id="${puzzle.id}" data-motion-scope="scene">
    <header class="document-scene__toolbar">${renderReturnControl(puzzle, state, 'FECHAR ARQUIVO')}<span>DOCUMENTO_RECUPERADO</span>${renderSceneTools(state, { compact: true })}</header>
    ${renderPuzzleBrief(puzzle, state, { floating: true })}
    <div class="document-scene__desk"><aside class="document-scene__metadata"><strong>${puzzle.title}</strong><span>INTEGRIDADE ${puzzle.integrity}%</span><span>ORIGEM NÃO ORDENADA</span><span>LEITURA LOCAL</span><i></i><small>assinatura parcial<br>10.10 // origem desconhecida</small></aside><main class="document-scene__paper">${content}</main></div>
    <div class="document-scene__hint">${renderHintPanel(puzzle.id)}</div>${renderNarrativeLoader()}${renderDevPanel(state)}
  </section>`;
}
