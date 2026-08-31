import { GAME_CONFIG } from '../config.js';
import { renderHintPanel } from '../hints.js';
import { renderEvidenceBoard, renderColdStorage, renderIdentity, renderReceiverStatus } from '../evidence-board.js';
import { renderDevPanel, renderNarrativeLoader, renderPuzzleBrief, renderSceneTools } from './shared.js';
import { archiveRecordFor, renderArchiveDocument, renderArchiveIndex } from '../archive.js';

function workspaceTabs(puzzle, state, experience) {
  const areas = [
    ['archive','ARQUIVO',true],
    ['receiver','RECEPTOR',experience.receiverAvailable],
    ['evidence','EVIDÊNCIAS',experience.evidenceAvailable],
    ['cold-storage','ARMAZENAMENTO FRIO',experience.coldStorageAvailable],
    ['identity','IDENTIDADE',experience.identityAvailable]
  ];
  const requested = state.ui?.activePanel || experience.activeArea;
  const active = areas.some(([id,,available]) => id === requested && available) ? requested : 'archive';
  const panes = {
    archive: `<div class="panel-label">arquivo persistente</div><div class="integrity" aria-label="integridade ${puzzle.integrity}%"><span style="--integrity:${puzzle.integrity / 100}"></span></div><div class="status-grid"><div class="status-cell muted">INTEGRIDADE<strong>${puzzle.integrity}%</strong></div><div class="status-cell muted">MODO<strong>LEITURA</strong></div></div><nav class="archive-nav" aria-label="Registros recuperados">${renderArchiveIndex(state)}</nav>`,
    receiver: renderReceiverStatus(state),
    evidence: renderEvidenceBoard(state),
    'cold-storage': renderColdStorage(state),
    identity: renderIdentity(state)
  };
  const tabs = areas.map(([id,label,available]) => `<button type="button" role="tab" class="workspace-tab ${id === active ? 'is-active' : ''}" data-action="workspace-tab" data-panel="${id}" aria-selected="${id === active}" ${available ? '' : 'disabled aria-disabled="true"'}>${label}</button>`).join('');
  const content = areas.map(([id,label]) => `<section role="tabpanel" class="workspace-pane ${id === active ? 'is-active' : ''}" data-workspace-pane="${id}" aria-label="${label}" ${id === active ? '' : 'hidden'}>${panes[id]}</section>`).join('');
  return `<nav class="workspace-tabs" role="tablist" aria-label="Ambientes do sistema">${tabs}</nav><div class="workspace-panes">${content}</div>`;
}

function receiverBeacon(state, available) {
  if (!available) return '';
  return `<button type="button" class="receiver-beacon ${state.tv.power ? 'is-on' : 'is-off'}" data-action="workspace-tab" data-panel="receiver" data-persistent-receiver aria-label="Abrir estado do receptor"><span>RECEPTOR</span><strong>CAN ${String(state.tv.channel).padStart(2, '0')}</strong><i>${state.tv.power ? 'ATIVO' : 'INATIVO'}</i></button>`;
}

export function renderSystemScene(context) {
  const { puzzle, state, content, animate, experience, elapsed, recovered } = context;
  const requestedRecord = state.ui?.archiveView?.recordId;
  const archiveDocument = requestedRecord && archiveRecordFor(state, requestedRecord)
    ? renderArchiveDocument(state, requestedRecord)
    : '';
  const mainContent = archiveDocument || `<div class="scene-header"><div><span class="scene-code">${puzzle.code}</span><h1 class="scene-title">${puzzle.title}</h1></div>${renderSceneTools(state)}</div>
        ${renderPuzzleBrief(puzzle, state, { floating: true })}${content}${puzzle.id !== '25' ? `<aside class="system-scene__hint">${renderHintPanel(puzzle.id)}</aside>` : ''}${renderNarrativeLoader()}`;
  return `<div class="shell system-scene ${recovered ? 'recovered-shell' : ''}" data-act="${experience.act}" data-area="${experience.activeArea}" data-scene-family="system" data-motion-scope="scene">
    <header class="system-bar"><span>${experience.systemState} · ATO ${experience.act}</span><span class="brand">${GAME_CONFIG.systemName}</span><span class="system-bar__right">${experience.operatorRole} · ${elapsed}</span></header>
    <div class="workspace">
      <main class="main-panel system-panel${animate ? ' scene-enter is-entering' : ''}">
        ${mainContent}
      </main>
      <aside class="side-panel">${receiverBeacon(state, experience.receiverAvailable)}${workspaceTabs(puzzle, state, experience)}${renderDevPanel(state)}</aside>
    </div>
  </div>`;
}
