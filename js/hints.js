import { HINTS } from '../data/hints.js';
import { getState, updateState } from './state.js';

export function renderHintPanel(id) {
  const used = getState().hintsUsed[id] || 0;
  const current = used ? HINTS[id]?.[used - 1] : '';
  return `
    <details class="hint-panel" data-hint-panel="${id}" ${used ? 'open' : ''}>
      <summary>SOLICITAR AJUDA? <span class="faint">[ infelizmente ]</span></summary>
      <div class="hint-content">
        ${current ? `<p data-hint-message>${current}</p>` : '<p class="muted" data-hint-message>O AUTOR SABERÁ QUE VOCÊ PEDIU.</p>'}
        ${used < 3 ? `<button type="button" class="micro-button" data-action="hint" data-puzzle="${id}">${used ? 'aprofundar anomalia' : 'solicitar nível 1'}</button>` : '<span class="warn">LIMITE DE AJUDA ATINGIDO</span>'}
      </div>
    </details>`;
}

export function useHint(id) {
  updateState((state) => {
    state.hintsUsed[id] = Math.min(3, (state.hintsUsed[id] || 0) + 1);
    state.flags.assistanceJokeSeen = true;
  });
}
