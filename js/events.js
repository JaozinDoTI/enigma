import { GAME_CONFIG } from './config.js';
import { audioManager } from './audio.js';
import { trackClick } from './analytics.js';
import { useHint } from './hints.js';
import { addEvent, completePuzzle, getState, recordAttempt, resetState, unlockThrough, updateState } from './state.js';
import { clamp, normalizeAnswer } from './utils.js';
import { uiFeedback } from './ui-feedback.js';
import { Motion } from './motion-engine.js';
import { evaluateRoom } from './room-model.js';
import { completionFor, isAcceptedAnswer } from './progression.js';
import { clarityFor, validateInputFormat } from './puzzles/clarity.js';
import { archiveRecordFor } from './archive.js';
import { syncClarityStatus, syncForensicSelection, syncFragmentPlacement, syncHintPanel, syncIdentityRelations, syncLocationSelection, syncMetaSelection, syncMuteControls, syncRoomState, syncTv } from './dom-sync.js';

let refresh = () => {};
let go = () => {};
let current = () => '01';
let last = () => '01';
let roomPointer = null;

function feedback(message, kind = '') {
  uiFeedback.message(message, kind || 'info');
}

function progress(id, next, message = 'REGISTRO ACEITO', { delay = null } = {}) {
  const narrativeMilestones = new Set(['05', '09', '12', '19']);
  const loadingLabels = {
    '11': 'COMPARANDO ENTIDADES',
    '12': 'RESOLVENDO CONFLITO',
    '18': 'RECONSTRUINDO MEMÓRIA ESPACIAL',
    '20': 'VALIDANDO MODELO DO QUARTO',
    '24': 'FUNDINDO RELAÇÕES'
  };
  completePuzzle(id, next);
  addEvent('puzzle-complete', id);
  uiFeedback.success(message, { impact: narrativeMilestones.has(id) ? 'dramatic' : false });
  Motion.play('narrative-loading', { target: document.querySelector('[data-narrative-loader]'), label: loadingLabels[id] || 'INDEXANDO BLOCOS DE MEMÓRIA' });
  const navigationDelay = Motion.reduced ? 0 : (delay ?? uiFeedback.duration('slow'));
  uiFeedback.schedule('progress-navigation', () => go(next[0]), navigationDelay);
}

function wrong(id, answer, message = clarityFor(id).wrongFeedback) {
  recordAttempt(id, answer, false);
  const attempts = getState().attempts[id];
  uiFeedback.error(`RESPOSTA INCORRETA // ${message}`, { critical: attempts % 3 === 0, target: document.activeElement });
  if (attempts === 3) {
    const sender = Number(id) < 7 ? 'AUTOR NÃO IDENTIFICADO' : 'J.';
    uiFeedback.schedule(`author-nudge-${id}`, () => uiFeedback.toast(`${sender} // “Não é pra chutar. Volta uma pista e olha de novo.”`, { kind: 'discovery' }), 420);
  }
}

function correctAnswer(id, answer) {
  recordAttempt(id, answer, true);
  const completion = completionFor(id);
  if (!completion) return;
  if (completion.mutate) updateState(completion.mutate);
  if (completion.motion === 'document') Motion.play('memory-reconstruction', { target: document.querySelector('[data-document-compare]') });
  if (completion.motion === 'location') Motion.play('memory-reconstruction', { target: document.querySelector('[data-location-map]') });
  if (completion.motion === 'entity-conflict') Motion.play('entity-conflict', { target: document.querySelector('.answer-form'), feedback: document.querySelector('[data-feedback]') });
  if (completion.motion === 'merge') Motion.play('relation-merge', { target: document.querySelector('[data-merge-layer]') });
  progress(id, completion.next, completion.message, { delay: completion.delay });
}

function handleAnswer(id, answer) {
  const contract = clarityFor(id);
  if (!validateInputFormat(id, answer)) {
    uiFeedback.error(`FORMATO NÃO RECONHECIDO // ${contract.formatHint}`, { target: document.querySelector(`[data-answer="${id}"] .answer-input`) });
    return;
  }
  if (isAcceptedAnswer(id, answer)) correctAnswer(id, answer);
  else wrong(id, answer);
}

function setTv(property, value) {
  updateState((state) => {
    state.tv[property] = value;
  });
  const eventName = property === 'power' ? 'tv:power' : property === 'channel' ? 'tv:channel' : 'tv:volume';
  Motion.emit(eventName, { property, value });
}

function handleTv(action, button) {
  const state = getState();
  if (current() === '17' && !state.flags.yardNodeValidated) return;
  if (action === 'tv-power') setTv('power', !state.tv.power);
  if (action === 'tv-channel') setTv('channel', clamp(state.tv.channel + Number(button.dataset.delta), 1, 12));
  if (action === 'tv-volume') setTv('volume', clamp(state.tv.volume + Number(button.dataset.delta), 0, 10));
  const updated = getState();
  syncTv(updated);
  const id = current();
  if (id === '03' && updated.tv.power && !state.unlocked.includes('13') && updated.tv.channel === 4) {
    updateState((draft) => { draft.tv.unlocked = true; });
    Motion.play('receiver-channel-lock', { target: document.querySelector('.tv-cabinet') });
    progress('03',['04'],'CANAL ANÔMALO ENCONTRADO');
    return;
  }
  if (['03', '13'].includes(id) && updated.tv.power && updated.unlocked.includes('13') && !updated.completed.includes('13') && updated.tv.channel === 11) {
    updateState((draft) => { draft.flags.tvChannel11Primed = true; });
    syncClarityStatus(id, getState());
    Motion.play('receiver-channel-loss', { target: document.querySelector('.tv-cabinet') });
    uiFeedback.toast('CANAL 11 // NENHUMA PORTADORA ESTÁVEL', { kind: 'discovery' });
    return;
  }
  if (['03', '13'].includes(id) && action === 'tv-power' && !updated.tv.power && updated.tv.channel === 11 && updated.flags.tvChannel11Primed && !updated.completed.includes('13')) {
    updateState((draft) => { draft.flags.tvSequenceSeen = true; });
    syncTv(getState());
    Motion.play('tv-afterimage', { target: document.querySelector('.tv-screen') });
    progress('13',['14'],'IMAGEM RESIDUAL RECUPERADA: 02 / 05 / 01', { delay: 1000 });
    return;
  }
  if (id === '17' && updated.tv.power && updated.tv.channel === 10 && updated.tv.volume === 10) {
    updateState((draft) => { draft.flags.tvTuned = true; });
    Motion.play('receiver-channel-lock', { target: document.querySelector('.tv-cabinet') });
    progress('17',['18'],'PORTADORA DO EVENTO_1010 FIXADA');
    return;
  }
  const signalEvent = action === 'tv-channel'
    ? 'receiver-channel-loss'
    : action === 'tv-power'
      ? (updated.tv.power ? 'receiver-power-on' : 'receiver-power-off')
      : 'frame-ghost';
  const motionTarget = action === 'tv-volume'
    ? document.querySelector('.tv-knob-control--volume')
    : document.querySelector('.tv-cabinet');
  Motion.play(signalEvent, { target: motionTarget });
}

async function initializeSystem(button) {
  if (button.disabled) return;
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  await audioManager.unlock({ startEnvironment: false });
  updateState((state) => {
    state.startedAt ||= Date.now();
    state.flags.initialized = true;
    state.motionEvents ||= {};
    state.motionEvents['boot-sequence'] = true;
  }, { progress: true });
  await Promise.all([
    Motion.play('boot-sequence', { target: document.querySelector('[data-boot-layer]') }),
    audioManager.playBoot()
  ]);
  progress('01', ['02'], 'RECUPERAÇÃO INICIADA', { delay: 0 });
}

async function playMorse() {
  if (!getState().tv.power) {
    uiFeedback.toast('SEM SINAL // RECEPTOR DESLIGADO', { kind: 'error' });
    return;
  }
  const lamp = document.querySelector('.morse-lamp');
  const trace = document.querySelector('.signal-trace');
  if (!lamp || lamp.dataset.playing) return;
  lamp.dataset.playing = '1';
  const pattern = ['--','.', '...', '.-'];
  await audioManager.playMorse(pattern, lamp, trace);
  updateState((state) => { state.tv.morsePlays += 1; });
  delete lamp.dataset.playing;
}

function handleRelation(button) {
  Motion.emit('evidence:contact', { source: 'identity-link' });
  const id = button.dataset.record;
  const pair = button.dataset.pair;
  const state = getState();
  const selection = state.relationSelection || [];
  if (!selection.length) {
    updateState((draft) => { draft.relationSelection = [id]; });
    syncIdentityRelations(getState());
    return Motion.pulse(button, 'is-revealed', 'fast');
  }
  const first = selection[0];
  const firstButton = document.querySelector(`[data-record="${first}"]`);
  const correct = firstButton?.dataset.pair === id && pair === first;
  if (correct) {
    updateState((draft) => {
      draft.relationLinks = [...new Set([...(draft.relationLinks || []), first, id])];
      draft.relationSelection = [];
    }, { progress: true });
    if (getState().relationLinks.length === 6) {
      updateState((draft) => { draft.flags.identityLinked = true; });
      syncIdentityRelations(getState());
      Motion.emit('evidence:linked', { source: 'identity-complete' });
      Motion.emit('evidence:resolve', { source: 'identity-complete' });
      progress('19',['20'],'RECONHECIMENTO DE ENTIDADE: POSITIVO');
      return;
    }
  } else {
    recordAttempt('19', `${first}:${id}`, false);
    updateState((draft) => { draft.relationSelection = []; });
    uiFeedback.toast('RELAÇÃO REJEITADA', { kind: 'error' });
    Motion.emit('evidence:rejected', { source: 'identity-link' });
  }
  syncIdentityRelations(getState());
  if (correct) {
    Motion.emit('evidence:linked', { source: 'identity-link' });
    Motion.pulse(firstButton, 'is-revealed', 'fast');
    Motion.pulse(button, 'is-revealed', 'fast');
  }
}

function validateRoom() {
  const evaluation = evaluateRoom(getState());
  if (evaluation.moved.length < evaluation.required.length) {
    feedback(`MODELO INCOMPLETO: ${evaluation.required.length - evaluation.moved.length} OBJETOS SEM ÂNCORA`, 'warn');
    return;
  }
  if (!evaluation.ready) {
    feedback(`COMPATIBILIDADE ${evaluation.score}%: REVISE AS RELAÇÕES ACIMA, AO LADO E À DIREITA`, 'warn');
    return;
  }
  updateState((state) => { state.flags.roomRebuilt = true; });
  Motion.play('object-impossible', { target: document.querySelector('[data-room]') });
  progress('20',['21'],'COMPATIBILIDADE 99% // TV SEM CORRESPONDÊNCIA FÍSICA', { delay: 700 });
}

function handleClick(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  trackClick(action.startsWith('tv-') ? `tv:${action}` : action);
  if (action === 'workspace-tab') {
    const panel = button.dataset.panel;
    updateState((state) => { state.ui.activePanel = panel; });
    document.querySelectorAll('.workspace-tab[data-action="workspace-tab"]').forEach((tab) => {
      const selected = tab.dataset.panel === panel;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
    });
    document.querySelectorAll('[data-workspace-pane]').forEach((pane) => {
      const selected = pane.dataset.workspacePane === panel;
      pane.classList.toggle('is-active', selected);
      pane.hidden = !selected;
      if (selected) {
        pane.classList.remove('is-switching');
        requestAnimationFrame(() => pane.classList.add('is-switching'));
        Motion.schedule(`workspace-pane-switch-${pane.dataset.workspacePane}`, () => pane.classList.remove('is-switching'), Motion.duration('normal'));
      }
    });
    document.body.dataset.activeArea = panel;
    Motion.emit('workspace:area-change', { panel });
    return;
  }
  if (action === 'navigate') return go(button.dataset.target);
  if (action === 'boot-fragment') return initializeSystem(button);
  if (action === 'open-event') {
    updateState((state) => {
      state.flags.event1010Seen = true;
      state.archive.reads['evento-1010'] = Math.max(1, state.archive.reads['evento-1010'] || 0);
    });
    return progress('02',['03'],'EVENTO INDEXADO');
  }
  if (action === 'open-archive-record') {
    const record = archiveRecordFor(getState(), button.dataset.record);
    if (!record) return feedback('REGISTRO INDISPONÍVEL', 'warn');
    Motion.emit('archive:record-open', { record: record.id, altered: record.status === 'ALTERADO' });
    updateState((state) => {
      state.archive.reads[record.id] = Math.max(state.archive.reads[record.id] || 0, record.version);
      state.ui.archiveView = {
        recordId: record.id,
        originPuzzle: current(),
        originPanel: state.ui.activePanel || 'archive'
      };
    });
    return refresh();
  }
  if (action === 'close-archive-record') {
    const origin = getState().ui.archiveView;
    Motion.emit('archive:record-close', { record: origin?.recordId });
    updateState((state) => {
      state.ui.activePanel = origin?.originPanel || 'archive';
      state.ui.archiveView = null;
    });
    if (origin?.originPuzzle && origin.originPuzzle !== current()) return go(origin.originPuzzle);
    return refresh();
  }
  if (action === 'resolve-event-revision') {
    if (current() !== '10' || (getState().archive.reads['evento-1010'] || 0) < 2) return feedback('DIVERGÊNCIA AINDA NÃO LIDA', 'warn');
    updateState((state)=>{state.flags.eventChanged=true;});
    return progress('10',['11'],'EVENTO_1010: SIGNIFICADO ALTERADO');
  }
  if (action === 'inspect-log') return feedback('NENHUM CONTEÚDO RECUPERÁVEL', 'muted');
  if (['tv-power','tv-channel','tv-volume'].includes(action)) return handleTv(action, button);
  if (action === 'play-morse') return playMorse();
  if (action === 'open-file') {
    Motion.emit('archive:open', { file: button.dataset.file });
    const preview = document.querySelector('[data-file-preview]');
    const file = button.dataset.file;
    document.querySelectorAll('.file-row').forEach((row)=>row.classList.remove('is-open'));
    button.classList.add('is-open');
    preview?.classList.remove('hidden');
    if (preview) preview.textContent = file === 'final_agora_vai.txt' ? '10:10 // CHAVE DO CONTEÚDO CORRESPONDENTE' : 'VERSÃO PLAUSÍVEL. HORÁRIO INCONSISTENTE.';
    uiFeedback.reveal(preview);
    if (file === 'final_agora_vai.txt') {
      Motion.cancel('file-consistency');
      return progress('07',['08'],'METADADOS CONFIÁVEIS ENCONTRADOS');
    }
    button.classList.add('is-processing');
    feedback('CONSISTÊNCIA ........ APROVADA', 'good');
    return Motion.schedule('file-consistency', () => {
      button.classList.remove('is-processing');
      wrong('07',file,'CONSISTÊNCIA ........ FALSA // O NOME NÃO É EVIDÊNCIA');
    }, Motion.reduced ? 0 : 900);
  }
  if (action === 'forensic-feature') {
    Motion.emit('evidence:contact', { source: 'forensic-layer' });
    updateState((state) => {
      const key = button.dataset.feature;
      state.forensicSelections = state.forensicSelections.includes(key) ? state.forensicSelections.filter((item) => item !== key) : [...state.forensicSelections, key];
    });
    syncForensicSelection(button, getState());
    return Motion.pulse(button, 'is-revealed', 'fast');
  }
  if (action === 'ack-conflict') {
    if ((getState().forensicSelections || []).length < 4) return feedback('DADOS INSUFICIENTES: SELECIONE AO MENOS QUATRO CAMADAS', 'warn');
    Motion.emit('evidence:resolve', { source: 'forensic-model' });
    Motion.play('memory-reconstruction', { target: document.querySelector('[data-forensic]') });
    return progress('11',['12'],'GEOMETRIA DO CONFLITO EXTRAÍDA', { delay: 900 });
  }
  if (action === 'fragment') {
    updateState((state)=>{ if(!state.fragments.includes(button.dataset.fragment)) state.fragments.push(button.dataset.fragment); });
    syncFragmentPlacement(button, getState(), true);
    Motion.emit('fragment:placed', { fragment: button.dataset.fragment, material: 'paper' });
    return Motion.pulse(button, 'is-settling', 'fast');
  }
  if (action === 'fragment-remove') {
    updateState((state)=>{state.fragments=state.fragments.filter((item)=>item!==button.dataset.fragment);});
    syncFragmentPlacement(button, getState(), false);
    Motion.emit('fragment:removed', { fragment: button.dataset.fragment, material: 'paper' });
    return Motion.pulse(button, 'is-settling', 'fast');
  }
  if (action === 'check-fragments') {
    const phrase = getState().fragments.join('|');
    if (phrase === 'ONDE|A NOITE|DEIXA|O QUE VOCÊ PRECISA') return progress('15',['16'],'SINTAXE RESTAURADA');
    return wrong('15', phrase, 'ORDEM INCORRETA // A frase só é gramatical em uma ordem.');
  }
  if (action === 'relation') return handleRelation(button);
  if (action === 'location-fragment') {
    Motion.emit('evidence:contact', { source: 'location-fragment' });
    updateState((state) => {
      const fragment = button.dataset.fragment;
      state.locationFragments = state.locationFragments.includes(fragment) ? state.locationFragments.filter((item) => item !== fragment) : [...state.locationFragments, fragment];
    });
    syncLocationSelection(button, getState());
    return Motion.pulse(button, 'is-revealed', 'fast');
  }
  if (action === 'validate-room') return validateRoom();
  if (action === 'fake-end') {
    updateState((state)=>{state.flags.fakeFinalSeen=true;});
    refresh();
    Motion.play('system-signal-loss');
    return uiFeedback.screenImpact('error', 'INTEGRIDADE 99% // 1 RELAÇÃO NÃO RESOLVIDA', { level: 'dramatic' });
  }
  if (action === 'continue-after-fake') return progress('21',['22'],'CANAL EXTERNO ENCONTRADO');
  if (action === 'meta-item') {
    updateState((state)=>{
      const key=button.dataset.key;
      if(state.metaSelections.includes(key)) state.metaSelections=state.metaSelections.filter((item)=>item!==key);
      else state.metaSelections=state.metaSelections.length>=3?[key]:[...state.metaSelections,key];
    });
    syncMetaSelection(getState());
    Motion.emit('residue:selected', { key: button.dataset.key, count: getState().metaSelections.length });
    return Motion.pulse(button, 'is-revealed', 'fast');
  }
  if (action === 'hint') {
    useHint(button.dataset.puzzle);
    syncHintPanel(button.dataset.puzzle, getState());
    return uiFeedback.reveal(button.closest('.hint-panel'), { kind: 'hint' });
  }
  if (action === 'toggle-mute') {
    const muted = !getState().settings.muted;
    audioManager.setMuted(muted);
    if (!muted) audioManager.confirmEnabled();
    syncMuteControls(muted);
    return uiFeedback.toast(muted ? 'EFEITOS SONOROS DESLIGADOS' : 'EFEITOS SONOROS LIGADOS');
  }
  if (action === 'play-final-music') {
    return audioManager.playMusic(GAME_CONFIG.musicUrl).then((played) => {
      uiFeedback.toast(played ? 'SINAL DE ÁUDIO INICIADO' : 'NÃO FOI POSSÍVEL INICIAR O ÁUDIO', { kind: played ? 'success' : 'error' });
    });
  }
  if (action === 'dev-next') { const next=String(Math.min(Number(last()),Number(current())+1)).padStart(2,'0'); unlockThrough(next); return go(next); }
  if (action === 'dev-reset' && confirm('Resetar todo o progresso local?')) { resetState(); return go('01'); }
}

function handleSubmit(event) {
  const nodeForm = event.target.closest('[data-node-auth]');
  if (nodeForm) {
    event.preventDefault();
    const node = nodeForm.dataset.nodeAuth;
    const token = new FormData(nodeForm).get('token');
    const expected = node === 'yard' ? GAME_CONFIG.yardNodeCode : '';
    if (!normalizeAnswer(token)) return uiFeedback.error('ENTRADA INVÁLIDA // Informe o código exibido pelo NÓ.', { target: nodeForm.querySelector('.answer-input') });
    if (!expected || normalizeAnswer(token) !== normalizeAnswer(expected)) {
      recordAttempt('17-node', token, false);
      return uiFeedback.error('NÓ REJEITADO // O código não pertence ao limiar preparado.', { target: nodeForm.querySelector('.answer-input') });
    }
    recordAttempt('17-node', token, true);
    updateState((state) => {
      state.flags.yardNodeScanned = true;
      state.flags.yardNodeValidated = true;
      state.physicalNodes.yard = 'validated';
      state.discoveries = [...new Set([...state.discoveries, 'node:yard', 'fragment:repeat-event'])];
    }, { progress: true });
    addEvent('external-node-authenticated', 'yard');
    Motion.emit('evidence:resolve', { source: 'yard-node' });
    uiFeedback.toast('NÓ_17 AUTENTICADO // CALIBRAÇÃO PARCIAL RECUPERADA', { kind: 'discovery' });
    return refresh();
  }
  const form = event.target.closest('[data-answer]');
  if (!form) return;
  event.preventDefault();
  const answer = new FormData(form).get('answer');
  if (!normalizeAnswer(answer)) {
    const label = clarityFor(form.dataset.answer).inputLabel.toLowerCase();
    return uiFeedback.error(`ENTRADA INVÁLIDA // Informe ${label || 'a resposta solicitada'}.`, { target: form.querySelector('.answer-input') });
  }
  handleAnswer(form.dataset.answer, answer);
}

function handleInput(event) {
  if (event.target.matches('.answer-input')) uiFeedback.clearFieldState(event.target);
  if (event.target.matches('[data-master-volume]')) {
    audioManager.setVolume(Number(event.target.value));
    const output = event.target.closest('.master-volume')?.querySelector('output');
    if (output) output.textContent = `${Math.round(Number(event.target.value) * 100)}%`;
  }
  if (event.target.matches('[data-version-slider]')) {
    const compare = event.target.closest('.version-control')?.previousElementSibling;
    compare?.style.setProperty('--version-split', `${event.target.value}%`);
    const output = event.target.closest('.version-control')?.querySelector('[data-version-output]');
    if (output) output.textContent = `${event.target.value}%`;
  }
}

function handlePointerDown(event) {
  const object = event.target.closest('.room-object[data-object]');
  const room = object?.closest('[data-room]');
  if (!object || !room || (event.pointerType === 'mouse' && event.button !== 0)) return;
  event.preventDefault();
  const objectRect = object.getBoundingClientRect();
  const roomRect = room.getBoundingClientRect();
  const evaluation = evaluateRoom(getState());
  roomPointer = {
    pointerId: event.pointerId,
    object,
    room,
    roomRect,
    startLeft: objectRect.left - roomRect.left,
    startTop: objectRect.top - roomRect.top,
    offsetX: event.clientX - objectRect.left,
    offsetY: event.clientY - objectRect.top,
    left: objectRect.left - roomRect.left,
    top: objectRect.top - roomRect.top,
    previousRelations: evaluation.verifiedRelations.map((relation) => relation.id),
    previouslyReady: evaluation.ready
  };
  object.setPointerCapture?.(event.pointerId);
  object.classList.add('is-dragging');
  object.setAttribute('aria-grabbed', 'true');
  Motion.emit('room:object-pick', { object: object.dataset.object, material: object.dataset.material });
}

function handlePointerMove(event) {
  if (!roomPointer || roomPointer.pointerId !== event.pointerId) return;
  event.preventDefault();
  const { object, roomRect, startLeft, startTop, offsetX, offsetY } = roomPointer;
  const maxLeft = Math.max(0, roomRect.width - object.offsetWidth);
  const maxTop = Math.max(0, roomRect.height - object.offsetHeight);
  roomPointer.left = clamp(event.clientX - roomRect.left - offsetX, 0, maxLeft);
  roomPointer.top = clamp(event.clientY - roomRect.top - offsetY, 0, maxTop);
  object.style.transform = `translate3d(${roomPointer.left - startLeft}px, ${roomPointer.top - startTop}px, 0)`;
}

function finishRoomPointer(event, cancelled = false) {
  if (!roomPointer || roomPointer.pointerId !== event.pointerId) return;
  const interaction = roomPointer;
  roomPointer = null;
  const { object, roomRect } = interaction;
  object.releasePointerCapture?.(event.pointerId);
  object.classList.remove('is-dragging');
  object.setAttribute('aria-grabbed', 'false');
  object.style.transform = '';
  if (cancelled || object.dataset.object === 'tv') {
    if (!cancelled) {
      Motion.emit('room:object-rejected', { object: object.dataset.object, material: object.dataset.material });
      Motion.pulse(object, 'is-invalid-drop', 'normal');
      uiFeedback.toast('O OBJETO NÃO POSSUI ÂNCORA FÍSICA', { kind: 'error' });
    }
    return;
  }
  const x = clamp((interaction.left / roomRect.width) * 100, 0, 100);
  const y = clamp((interaction.top / roomRect.height) * 100, 0, 100);
  object.style.left = `${x}%`;
  object.style.top = `${y}%`;
  object.classList.add('is-verified');
  const stateLabel = object.querySelector('[data-room-object-state]');
  if (stateLabel) stateLabel.hidden = false;
  updateState((state)=>{state.room[object.dataset.object]={x,y,moved:true};},{progress:true});
  const evaluation = syncRoomState(getState());
  Motion.emit('room:object-drop', { object: object.dataset.object, material: object.dataset.material });
  if (evaluation.verifiedRelations.some((relation) => !interaction.previousRelations.includes(relation.id))) Motion.emit('room:position-lock', { object: object.dataset.object });
  if (evaluation.ready && !interaction.previouslyReady) Motion.emit('room:structure-ready', { relations: evaluation.verifiedRelations.length });
  Motion.pulse(object, 'is-settling', 'fast');
}

function handleKeydown(event) {
  if (event.key !== 'Escape' || !getState().ui?.archiveView) return;
  const close = document.querySelector('[data-action="close-archive-record"]');
  close?.click();
}

export function initInteractions(options) {
  refresh = options.refresh;
  go = options.navigate;
  current = options.current;
  last = options.last || last;
  document.addEventListener('click', handleClick);
  document.addEventListener('submit', handleSubmit);
  document.addEventListener('input', handleInput);
  document.addEventListener('pointerdown', handlePointerDown);
  document.addEventListener('pointermove', handlePointerMove, { passive: false });
  document.addEventListener('pointerup', (event) => finishRoomPointer(event));
  document.addEventListener('pointercancel', (event) => finishRoomPointer(event, true));
  document.addEventListener('keydown', handleKeydown);
}

export function notifyNodeDetection(node, early) {
  const labels = { desk: 'ESCRIVANINHA', yard: 'LIMIAR', books: 'ESTANTE' };
  const label = labels[node] || 'EXTERNO';
  const message = early ? `NÓ ${label} DETECTADO // ACESSO NEGADO // CONTEXTO INSUFICIENTE` : `NÓ ${label} DETECTADO`;
  uiFeedback.toast(message, { kind: early ? 'error' : 'discovery' });
  uiFeedback.screenImpact(early ? 'denied' : 'discovery', message, { level: early ? 'dramatic' : 'slow' });
}

export function notifyNoProgress() {
  uiFeedback.toast('ANOMALIA DETECTADA: SEM PROGRESSO // SOLICITAR AJUDA?', { kind: 'discovery' });
}
