import { renderHintPanel } from '../hints.js';
import { renderDevPanel, renderNarrativeLoader, renderPuzzleBrief, renderReturnControl, renderSceneTools } from './shared.js';

export function renderReconstructionScene(context) {
  const { puzzle, state, content, animate, experience } = context;
  return `<section class="reconstruction-scene${animate ? ' scene-enter is-entering' : ''}" data-scene-family="reconstruction" data-motion-scope="scene" data-area="${experience.activeArea}">
    <header class="reconstruction-scene__index"><span>MEMÓRIA / FONTE ATIVA</span><strong>${puzzle.title}</strong>${renderSceneTools(state, { compact: true })}</header>
    ${renderPuzzleBrief(puzzle, state, { floating: true })}
    <main class="reconstruction-scene__field"><div class="reconstruction-scene__title"><span>${experience.systemState}</span><h1>${puzzle.title}</h1></div>${content}</main>
    <footer class="reconstruction-scene__footer">${renderReturnControl(puzzle, state)}<span>INTEGRIDADE ${puzzle.integrity}%</span></footer>
    <aside class="reconstruction-scene__hint">${renderHintPanel(puzzle.id)}</aside>${renderNarrativeLoader()}${renderDevPanel(state)}
  </section>`;
}

export function renderOverrideScene(context) {
  const { puzzle, state, content, animate, total } = context;
  return `<section class="override-scene override-scene--${puzzle.id}${animate ? ' scene-enter is-entering' : ''}" data-scene-family="override" data-motion-scope="scene">
    <div class="override-scene__mark">${puzzle.title}<span>SESSÃO NÃO LINEAR</span></div>${puzzle.id === '25' ? '' : renderPuzzleBrief(puzzle, state, { floating: true })}<main class="override-scene__content">${content}</main>
    <footer class="override-scene__controls">${renderReturnControl(puzzle, state)}${renderSceneTools(state, { compact: true })}</footer>
    ${puzzle.id !== '25' ? `<aside class="override-scene__hint">${renderHintPanel(puzzle.id)}</aside>` : ''}${renderNarrativeLoader()}${renderDevPanel(state)}
  </section>`;
}
