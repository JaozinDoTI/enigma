import { renderHintPanel } from '../hints.js';
import { archiveRecordFor, renderArchiveDocument, renderArchiveIndex, renderArchiveSearch } from '../archive.js';
import { renderPhaseOneComputer } from '../phase-one-computer.js';
import { escapeHtml } from '../utils.js';
import { renderDevPanel, renderSceneTools } from './shared.js';

const PHASE_NAMES = Object.freeze({
  boot:'COMPUTADOR', logs:'EVENTO_1010', 'tv-intro':'RECEPTOR', morse:'PORTADORA', 'file-properties':'MONTAGEM',
  document:'DOCUMENTO', files:'DIRETÓRIO', binary:'PACOTE', 'moon-one':'LUA', 'return-event':'RETORNO', conflict:'CONFLITO',
  'phone-memory':'MEMÓRIA', 'tv-sequence':'AFTERIMAGE', books:'BOOKSCAN', 'clock-calibration':'RELÓGIO', bedside:'CABECEIRA',
  'tv-tuning':'FONTE VERDE', location:'MARGEM', identity:'FONTES', room:'CÔMODO ZERO', impossible:'INTEGRIDADE',
  'books-node':'HISTÓRIAS', 'clock-origin':'ORIGEM', meta:'CHAVE', final:'RECUPERAÇÃO'
});

function visiblePhases(puzzles, state) {
  return puzzles.filter((puzzle) => state.discovered.includes(puzzle.id) || state.completed.includes(puzzle.id) || puzzle.id === state.currentPuzzle);
}

function phaseState(puzzle, current, state) {
  if (puzzle.id === current.id) return 'current';
  if (state.completed.includes(puzzle.id)) return 'complete';
  if (state.discovered.includes(puzzle.id)) return 'discovered';
  return 'locked';
}

function progressRail(puzzle, puzzles, state) {
  const phases = visiblePhases(puzzles, state);
  return `<ol class="phase-progress">${phases.map((item) => {
    const status = phaseState(item,puzzle,state);
    const label = state.completed.includes(item.id) ? item.revealTitle : `REGISTRO ${item.id}`;
    const changed = item.id === '10' && !state.completed.includes('10') && Number(state.currentPuzzle) >= 10;
    return `<li class="is-${status}${changed?' has-change':''}"><button type="button" data-action="navigate" data-target="${item.id}" ${status==='locked'?'disabled aria-disabled="true"':''} ${status==='current'?'aria-current="step"':''}><i>${item.id}</i><span>${escapeHtml(label)}</span><b aria-label="${status}">${status==='complete'?'●':status==='current'?'◉':'◌'}</b>${changed?'<em aria-label="conteúdo alterado">*</em>':''}</button></li>`;
  }).join('')}</ol>`;
}

function phaseRail(puzzle, puzzles, state, active) {
  const archiveAvailable = state.unlocked.some((id) => Number(id) >= 2);
  return `<aside class="phase-rail" aria-label="Navegação da investigação">
    <header><span>RECUPERAÇÃO</span><strong>1010</strong><i></i></header>
    <nav aria-label="Fases recuperadas">${progressRail(puzzle,puzzles,state)}</nav>
    <section class="phase-objective"><span>INTENÇÃO</span><em>${escapeHtml(puzzle.intent)}</em><span>AÇÃO ATUAL</span><strong>${escapeHtml(puzzle.objective)}</strong><small>${escapeHtml(puzzle.interaction)}</small><div class="phase-hints">${renderHintPanel(puzzle.id)}</div></section>
    <div class="phase-rail__tools"><button type="button" class="phase-tool ${active==='task'?'is-active':''}" data-action="workspace-tab" data-panel="task">VOLTAR À FASE</button>${archiveAvailable?`<button type="button" class="phase-tool ${active==='archive'?'is-active':''}" data-action="workspace-tab" data-panel="archive">ARQUIVO</button>`:''}${renderSceneTools(state,{compact:true})}</div>
    ${renderDevPanel(state)}
  </aside>`;
}

function archiveStage(state) {
  const recordId = state.ui.archiveView?.recordId;
  if (recordId && archiveRecordFor(state,recordId)) return renderArchiveDocument(state,recordId);
  return `<section class="phase-archive"><header><span>ARQUIVO MUTÁVEL</span><strong>${state.flags.eventChanged?'CONTEÚDO ALTERADO':'CONSULTA LOCAL'}</strong></header>${renderArchiveSearch(state)}<nav aria-label="Registros recuperados">${renderArchiveIndex(state)}</nav></section>`;
}

export function renderSystemScene(context) {
  const { puzzle, puzzles, state, experience } = context;
  const requested = state.ui.activePanel || 'task';
  const active = requested === 'archive' && state.unlocked.some((id) => Number(id) >= 2) ? 'archive' : 'task';
  const stage = renderPhaseOneComputer(puzzle,state);
  return `<div class="phase-shell" data-act="${experience.act}" data-area="${active}" data-scene-family="computer" data-motion-scope="scene">
    ${phaseRail(puzzle,puzzles,state,active)}
    <main class="phase-stage">
      <section class="phase-pane ${active==='task'?'is-active':''}" data-workspace-pane="task" ${active==='task'?'':'hidden'}>${stage}</section>
      <section class="phase-pane ${active==='archive'?'is-active':''}" data-workspace-pane="archive" ${active==='archive'?'':'hidden'}>${archiveStage(state)}</section>
    </main>
  </div>`;
}
