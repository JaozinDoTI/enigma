import { GAME_CONFIG } from '../config.js';
import { clarityFor } from '../puzzles/clarity.js';
import { escapeHtml } from '../utils.js';

export function renderPuzzleBrief(puzzle, state, { compact = false, floating = false } = {}) {
  const contract = clarityFor(puzzle.id);
  const status = contract.status(state);
  if (floating) {
    return `<details class="puzzle-brief puzzle-brief--floating">
      <summary><span>AÇÃO REQUERIDA</span><strong>${escapeHtml(contract.objective)}</strong></summary>
      <div class="puzzle-brief__drawer">
        <p class="puzzle-brief__intent"><span>INTENÇÃO</span>${escapeHtml(puzzle.intent)}</p>
        <p class="puzzle-brief__narrative">${escapeHtml(contract.narrative)}</p>
        <p class="puzzle-brief__guidance">${escapeHtml(contract.actionHint)}</p>
        <dl class="puzzle-brief__contract"><div><dt>INTERAÇÃO</dt><dd>${escapeHtml(contract.interaction)}</dd></div><div><dt>RESULTADO</dt><dd>${escapeHtml(contract.successMeaning)}</dd></div></dl>
        <p class="puzzle-brief__status"><span>ESTADO ATUAL</span><strong>${escapeHtml(status)}</strong></p>
      </div>
    </details>`;
  }
  return `<section class="puzzle-brief ${compact ? 'puzzle-brief--compact' : ''}" aria-label="Orientação operacional da etapa">
    <p class="puzzle-brief__intent"><span>INTENÇÃO</span>${escapeHtml(puzzle.intent)}</p>
    <p class="puzzle-brief__narrative">${escapeHtml(contract.narrative)}</p>
    <div class="puzzle-brief__objective"><span>AÇÃO REQUERIDA</span><strong>${escapeHtml(contract.objective)}</strong><small>${escapeHtml(contract.actionHint)}</small></div>
    <dl class="puzzle-brief__contract"><div><dt>INTERAÇÃO</dt><dd>${escapeHtml(contract.interaction)}</dd></div><div><dt>RESULTADO</dt><dd>${escapeHtml(contract.successMeaning)}</dd></div></dl>
    <p class="puzzle-brief__status"><span>ESTADO ATUAL</span><strong>${escapeHtml(status)}</strong></p>
  </section>`;
}

export function renderSceneTools(state, { compact = false } = {}) {
  return `<div class="scene-tools ${compact ? 'scene-tools--compact' : ''}">
    <button type="button" class="micro-button" data-action="toggle-mute">${state.settings.muted ? 'SOM DESLIGADO' : 'SOM LIGADO'}</button>
    <label class="master-volume"><span>VOL</span><input type="range" min="0" max="1" step="0.05" value="${state.settings.volume}" data-master-volume aria-label="Volume geral"><output>${Math.round(state.settings.volume * 100)}%</output></label>
    <button type="button" class="danger-button" data-action="dev-reset">ZERAR PROGRESSO</button>
  </div>`;
}

export function renderNarrativeLoader() {
  return '<div class="narrative-loader" data-narrative-loader hidden aria-live="polite"><span>INDEXANDO BLOCOS DE MEMÓRIA</span><i aria-hidden="true"></i></div>';
}

export function renderReturnControl(puzzle, state, label = 'VOLTAR AO SISTEMA') {
  if (state.pendingTransition?.from===puzzle.id && ['preparing','offered','moving'].includes(state.pendingTransition.status)) return '<span class="scene-session-lock">CONTINUAÇÃO SENDO PREPARADA</span>';
  const returnTarget = state.discovered.filter((id) => id !== puzzle.id && id !== state.pendingTransition?.to).at(-1);
  if (!returnTarget) return '<span class="scene-session-lock">SESSÃO DE INICIALIZAÇÃO</span>';
  return `<button type="button" class="scene-return" data-action="navigate" data-target="${returnTarget}"><kbd>ESC</kbd>${label}</button>`;
}

export function renderDevPanel(state) {
  const dev = GAME_CONFIG.devMode || new URLSearchParams(location.search).get('dev') === '1';
  if (!dev) return '';
  return `<details class="dev-panel scene-dev-panel"><summary>console de manutenção</summary><div class="dev-actions">
    <button type="button" class="micro-button" data-action="dev-next">liberar próximo</button>
    <button type="button" class="micro-button" data-action="dev-event" data-event="same-file-four">simular repetição</button>
    <button type="button" class="micro-button" data-action="dev-event" data-event="wrong-answer-chain">simular erro</button>
    <button type="button" class="micro-button" data-action="dev-event" data-event="phone-ignored">simular abandono</button>
    <button type="button" class="micro-button" data-action="dev-event" data-event="receiver-obsession">simular receiver</button>
    <button type="button" class="micro-button" data-action="dev-clear-transition">limpar transição</button>
    <button type="button" class="danger-button" data-action="dev-reset">reiniciar</button>
  </div><p>SEED ${state.director.seed} · CURSOR ${state.director.cursor} · EVENTOS ${state.director.delivered.length}</p><pre class="dev-state">${JSON.stringify(state, null, 2)}</pre></details>`;
}
