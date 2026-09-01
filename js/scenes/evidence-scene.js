import { renderHintPanel } from '../hints.js';
import { renderDevPanel, renderNarrativeLoader, renderPuzzleBrief, renderReturnControl, renderSceneTools } from './shared.js';

export function renderEvidenceScene(context) {
  const { puzzle, state, content, animate } = context;
  return `<section class="investigation-scene${animate ? ' scene-enter is-entering' : ''}" data-scene-family="forensic" data-motion-scope="scene">
    <header class="investigation-docket"><div><span>CASO RECUPERACAO_1010</span><strong>${puzzle.title}</strong><small>FONTE VINCULADA · ACESSO RESTRITO</small></div>${renderSceneTools(state, { compact: true })}</header>
    ${renderPuzzleBrief(puzzle, state, { floating: true })}
    <div class="investigation-stage"><div class="investigation-coordinates" aria-hidden="true"><span>00:10:10</span><span>HASH 54F1-A09C</span><span>FONTE // DESCONHECIDA</span></div><main class="investigation-surface">${content}</main><aside class="investigation-notes"><span>ANÁLISE EM CURSO</span><i></i><p>Não presumir que o arquivo descreve apenas uma pessoa.</p>${renderHintPanel(puzzle.id)}</aside></div>
    <footer class="investigation-footer">${renderReturnControl(puzzle, state)}<span>EVIDÊNCIA NÃO DEVE SAIR DESTA SESSÃO</span></footer>
    ${renderNarrativeLoader()}${renderDevPanel(state)}
  </section>`;
}
