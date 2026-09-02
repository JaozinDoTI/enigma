import { GAME_CONFIG } from './config.js';
import { audioManager } from './audio.js';
import { trackClick } from './analytics.js';
import { addEvent, completePuzzle, getState, recordAttempt, updateState } from './state.js';
import { clamp, normalizeAnswer } from './utils.js';
import { uiFeedback } from './ui-feedback.js';
import { Motion } from './motion-engine.js';
import { evaluateRoom } from './room-model.js';
import { completionFor, isAcceptedAnswer } from './progression.js';
import { clarityFor, validateInputFormat } from './puzzles/clarity.js';
import { archiveRecordFor } from './archive.js';
import { syncIdentityRelations, syncRoomState } from './dom-sync.js';
import { handleComputerClick, handleComputerKeydown, returnComputerToTask } from './events/computer.js';
import { handleReconstructionClick } from './events/reconstruction.js';
import { handleDesktopBackgroundClick, handleDesktopChange, handleDesktopClick, handleDesktopContextMenu, handleDesktopDoubleClick, handleDesktopKeydown, handleDesktopPointerDown, handleDesktopPointerMove, handleDesktopPointerUp, handleDesktopSubmit } from './events/desktop-os.js';
import { handlePhoneClick } from './events/phone.js';
import { handleReceiverClick } from './events/receiver.js';
import { handleClockClick } from './events/clock.js';
import { handleBookscanClick } from './events/bookscan.js';
import { handleNavigationClick } from './events/navigation.js';
import { handlePuzzleClick } from './events/puzzle-actions.js';
import { emitWorldEvent } from './worlds/world-events.js';
import { beginSimulatedReboot } from './computer-runtime.js';
import { signalBehavior } from './behavior-director.js';
import { offerPhaseTransition } from './transition-director.js';
import { evaluatePaperBoard, ensurePaperBoard } from './paper-engine.js';
import { handlePaperClick, handlePaperPointerDown, handlePaperPointerMove, handlePaperPointerUp } from './events/paper.js';

let refresh = () => {};
let go = () => {};
let current = () => '01';
let last = () => '01';
let roomPointer = null;

function feedback(message, kind = '') {
  uiFeedback.message(message, kind || 'info');
}

function progress(id, next, message = 'REGISTRO ACEITO', { delay = null } = {}) {
  if (getState().completed.includes(id)) return;
  const narrativeMilestones = new Set(['05', '09', '12', '19']);
  const loadingLabels = {
    '11': 'COMPARANDO ENTIDADES',
    '12': 'RESOLVENDO CONFLITO',
    '18': 'RECONSTRUINDO MEMÓRIA ESPACIAL',
    '20': 'VALIDANDO MODELO DO QUARTO',
    '24': 'FUNDINDO RELAÇÕES'
  };
  completePuzzle(id, next);
  signalBehavior('progress',{id});
  addEvent('puzzle-complete', id);
  uiFeedback.success(message, { impact: narrativeMilestones.has(id) ? 'dramatic' : false });
  Motion.play('narrative-loading', { target: document.querySelector('[data-narrative-loader]'), label: loadingLabels[id] || 'INDEXANDO BLOCOS DE MEMÓRIA' });
  go(id);
  uiFeedback.schedule('title-reveal-clear',()=>updateState((state)=>{if(state.ui.titleReveal?.id===id) state.ui.titleReveal=null;}),Motion.reduced?800:2600);
  offerPhaseTransition(id,{delay});
}

function wrong(id, answer, message = clarityFor(id).wrongFeedback) {
  recordAttempt(id, answer, false);
  signalBehavior('wrong-answer',{id});
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
  else wrong(id, answer, `FORMATO ACEITO // VALOR INCONSISTENTE. ${contract.wrongFeedback}`);
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
  progress('01',['02'],'SISTEMA GRÁFICO DISPONÍVEL // INVESTIGUE A MÁQUINA');
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
      emitWorldEvent('reconstruction.identity.linked');
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
  updateState((state) => {
    state.flags.roomRebuilt = true;
    state.flags.houseAnomalyRevealed = true;
  }, { progress: true });
  Motion.play('object-impossible', { target: document.querySelector('[data-room]') });
  uiFeedback.screenImpact('error', 'ÁREA CALCULADA EXCEDE ÁREA INDEXADA // +11,2 m²', { level: 'dramatic' });
  Motion.schedule('room-anomaly-reveal', () => refresh(), 700);
}

function handleClick(event) {
  handleDesktopBackgroundClick(event);
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  trackClick(action.startsWith('tv-') ? `tv:${action}` : action);
  if (action.startsWith('tv-')) signalBehavior('receiver',{action});
  if (action === 'os-quarantine') signalBehavior('quarantine',{id:button.dataset.resource});
  if (['os-open-resource','os-select','os-open-context'].includes(action)) signalBehavior('resource',{id:button.dataset.resource || button.dataset.osResource || getState().desktopOs.selectedIcon});
  if (handleDesktopClick(action, button, event)) return;
  if (handleComputerClick(action, button)) return;
  if (handleReconstructionClick(action, button)) return;
  if (handlePhoneClick(action,button,{ current, feedback, correctAnswer, navigate:go })) return;
  if (handleReceiverClick(action,button,{ current, feedback, progress, toast:(message)=>uiFeedback.toast(message,{kind:'discovery'}) })) return;
  if (handleClockClick(action,{ current, feedback, wrong, progress })) return;
  if (handleBookscanClick(action,button,{ feedback, wrong })) return;
  if (handlePaperClick(action,button)) return refresh();
  if (handlePuzzleClick(action,button,{ feedback, wrong, progress, correctAnswer })) return;
  if (handleNavigationClick(action,button,{ go, current, last })) return;
  if (action === 'boot-fragment') return initializeSystem(button);
  if (action === 'signal-lock') {
    const state=getState();const exact=state.signalAnalyzer.coarse===170&&state.signalAnalyzer.fine===8;
    if(!exact){const distance=Math.abs((state.signalAnalyzer.coarse+state.signalAnalyzer.fine/10)-170.8);return feedback(distance<1?'PORTADORA PRÓXIMA // FINE AINDA INSTÁVEL':'SEM SINCRONIA // DERIVE A PORTADORA DE 17-08','warn');}
    updateState((draft)=>{draft.signalAnalyzer.locked=true;},{progress:true});
    Motion.emit('evidence:resolve',{source:'signal-1708'});return refresh();
  }
  if (action === 'vx-download') {
    const snapshot=Number(button.dataset.snapshot);
    if(snapshot!==3)return wrong('07',String(snapshot),'SNAPSHOT INCONSISTENTE // dois metadados precisam concordar com EVENTO_1010.');
    updateState((state)=>{state.vxNet.downloads=[...new Set([...state.vxNet.downloads,'DUMP_24.bin'])];state.vxNet.recoveredLink=true;},{progress:true});
    return progress('07',['08'],'LINK PARCIAL RECUPERADO // DUMP_24.bin EM DOWNLOADS');
  }
  if (['vx-back','vx-forward','vx-reload','vx-page'].includes(action)) {
    updateState((state)=>{if(action==='vx-page'){const url=button.dataset.url;state.vxNet.history=state.vxNet.history.slice(0,state.vxNet.index+1);state.vxNet.history.push(url);state.vxNet.index=state.vxNet.history.length-1;state.vxNet.url=url;}if(action==='vx-back')state.vxNet.index=Math.max(0,state.vxNet.index-1);if(action==='vx-forward')state.vxNet.index=Math.min(state.vxNet.history.length-1,state.vxNet.index+1);state.vxNet.url=state.vxNet.history[state.vxNet.index];});return refresh();
  }
  if (action === 'moon-recover') {
    const root=button.closest('[data-moon-forensics]');const contrast=Number(root?.querySelector('[data-moon-control="contrast"]')?.value||0);const channel=root?.querySelector('[data-moon-control="channel"]')?.value;
    if(contrast<65||channel!=='infra')return feedback('CRUZAMENTO INSUFICIENTE // O RESÍDUO NÃO ESTÁ NO CANAL VISÍVEL','warn');
    updateState((state)=>{state.computer.files['webcam-cache'].recovered=true;},{progress:true});return refresh();
  }
  if (action === 'paper-validate') {
    const boardId=button.dataset.board;const evaluation=evaluatePaperBoard(getState(),boardId);
    updateState((state)=>{const board=ensurePaperBoard(state,boardId);board.tested=true;board.solved=evaluation.ready;});
    if(!evaluation.ready)return feedback(`COMPOSIÇÃO INSTÁVEL // ${evaluation.aligned} DE ${evaluation.total} RELAÇÕES COINCIDEM`,'warn');
    if(boardId==='11')return progress('11',['12'],'SILHUETA PARCIAL // OBJETO TÊXTIL RECORRENTE');
    if(boardId==='18')return refresh();
    if(boardId==='20'){updateState((state)=>{state.flags.roomRebuilt=true;state.flags.houseAnomalyRevealed=true;},{progress:true});uiFeedback.screenImpact('error','TRANSPARÊNCIAS DIVERGEM // +11,2 m²',{level:'dramatic'});return refresh();}
    if(boardId==='24')return refresh();
  }
  if (action === 'hypothesis-document') {
    const id=button.dataset.document;const selected=getState().hypothesisSelection;
    updateState((state)=>{if(!selected.length){state.hypothesisSelection=[id];return;}const first=selected[0];if(first===id){state.hypothesisSelection=[];return;}const key=[first,id].sort().join(':');state.hypothesisLinks=[...new Set([...state.hypothesisLinks,key])];state.hypothesisSelection=[];},{progress:true});return refresh();
  }
  if (action === 'remove-hypothesis') {const link=button.dataset.link;updateState((state)=>{state.hypothesisLinks=state.hypothesisLinks.filter((item)=>item!==link);});return refresh();}
  if (action === 'test-hypothesis') {
    const required=['conversation:date','curitiba:object-c','place:shore','clock:receiver'];const links=getState().hypothesisLinks;
    const inconsistent=links.filter((link)=>!required.includes(link));const missing=required.filter((link)=>!links.includes(link));
    if(inconsistent.length||missing.length)return feedback(`HIPÓTESE INCONSISTENTE // ${inconsistent.length} RELAÇÕES SEM SUPORTE · ${missing.length} RELAÇÕES AUSENTES`,'warn');
    updateState((state)=>{state.flags.identityLinked=true;},{progress:true});emitWorldEvent('reconstruction.identity.linked');return progress('19',['20'],'HIPÓTESE DE MEMÓRIA COMPARTILHADA: SUSTENTADA');
  }
  if (action === 'bookshelf-title') {
    const id=button.dataset.title;updateState((state)=>{state.bookshelfSelections=state.bookshelfSelections.includes(id)?state.bookshelfSelections.filter((item)=>item!==id):[...state.bookshelfSelections,id].slice(-3);},{progress:true});return refresh();
  }
  if (action === 'bookshelf-region') {
    const selected=getState().bookshelfSelections;const correct=selected.length===3&&['acaba','comeca','teto'].every((id)=>selected.includes(id));
    if(!correct)return feedback('REGIÃO NÃO SUSTENTADA // USE FIM, COMEÇO E ACIMA DE DOIS','warn');return refresh();
  }
  if (action === 'os-isolate-event') {
    Motion.emit('archive:record-open', { record: 'evento-1010', altered: false });
    audioManager.playEvent('system.disk', { volume: .12 });
    updateState((state) => {
      state.flags.event1010Seen = true;
      state.archive.reads['evento-1010'] = Math.max(1, state.archive.reads['evento-1010'] || 0);
    });
    emitWorldEvent('computer.event.isolated');
    return progress('02',['03'],'REGISTRO EXTERNO ISOLADO // EVENTO_1010');
  }
  if (action === 'os-ack-change') {
    if (current() !== '10') return feedback('ALTERAÇÃO FORA DA FASE ATUAL', 'warn');
    if (!getState().computer.files['event-1010']?.quarantined) return feedback('COMPARE A VERSÃO ATUAL COM UMA CÓPIA ESTABILIZADA NA QUARENTENA','warn');
    if (!getState().vxNet.history.includes('mirror://final')) return feedback('SNAPSHOT ANTERIOR AUSENTE // CONSULTE O HISTÓRICO DO VX_NET','warn');
    updateState((state) => {
      state.flags.eventChanged = true;
      state.archive.reads['evento-1010'] = 2;
    });
    emitWorldEvent('computer.event.rewritten');
    return progress('10',['11'],'EVENTO_1010: DUAS FONTES CONFIRMADAS');
  }
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
      state.ui.focusReturn = record.id;
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
  if (action === 'relation') return handleRelation(button);
  if (action === 'validate-room') return validateRoom();
  if (action === 'confirm-room-return') {
    if (!getState().flags.roomNodeValidated) return feedback('LEITURA FÍSICA AUSENTE', 'warn');
    return progress('20',['21'],'ESPAÇO NÃO CLASSIFICADO ANEXADO // ÚLTIMA LEITURA 03:17');
  }
  if (action === 'fake-end') {
    updateState((state)=>{state.flags.fakeFinalSeen=true;});
    Motion.play('system-signal-loss');
    uiFeedback.screenImpact('error', 'INTEGRIDADE 99% // RECALCULANDO // ORIGEM AUSENTE', { level: 'dramatic' });
    Motion.schedule('simulated-reboot',()=>{
      updateState((state)=>beginSimulatedReboot(state,'INTEGRIDADE_99'));
      emitWorldEvent('computer.integrity.ruptured');
      refresh();
    },Motion.reduced?0:1800);
    return;
  }
  if (action === 'continue-after-fake') return progress('21',['22'],'CANAL EXTERNO ENCONTRADO');
}

function handleSubmit(event) {
  if (handleDesktopSubmit(event)) return;
  const vxAddress=event.target.closest('[data-vx-address]');
  if(vxAddress){event.preventDefault();const url=String(new FormData(vxAddress).get('url')||'').trim().toLowerCase();updateState((state)=>{state.vxNet.history=state.vxNet.history.slice(0,state.vxNet.index+1);state.vxNet.history.push(url);state.vxNet.index=state.vxNet.history.length-1;state.vxNet.url=url;},{progress:Boolean(url)});return refresh();}
  const vxSearch=event.target.closest('[data-vx-search]');
  if(vxSearch){event.preventDefault();const query=String(new FormData(vxSearch).get('query')||'').trim();updateState((state)=>{state.vxNet.query=query;},{progress:Boolean(query)});return refresh();}
  const archiveSearch = event.target.closest('[data-archive-search]');
  if (archiveSearch) {
    event.preventDefault();
    const query = String(new FormData(archiveSearch).get('query') || '').trim();
    updateState((state) => {
      state.ui.archiveQuery = query;
      if (query) state.archive.searches = [...new Set([...(state.archive.searches || []), normalizeAnswer(query)])].slice(-24);
    }, { progress: Boolean(query) });
    addEvent('archive-search', query);
    return refresh();
  }
  const nodeForm = event.target.closest('[data-node-auth]');
  if (nodeForm) {
    event.preventDefault();
    const node = nodeForm.dataset.nodeAuth;
    const token = new FormData(nodeForm).get('token');
    const expected = {
      green: GAME_CONFIG.greenNodeCode,
      yard: GAME_CONFIG.yardNodeCode,
      room: GAME_CONFIG.roomNodeCode,
      books: GAME_CONFIG.booksNodeCode
    }[node] || '';
    const attemptId = `${node}-node`;
    if (!normalizeAnswer(token)) return uiFeedback.error('ENTRADA INVÁLIDA // Informe o código exibido pelo NÓ.', { target: nodeForm.querySelector('.answer-input') });
    if (!expected || normalizeAnswer(token) !== normalizeAnswer(expected)) {
      recordAttempt(attemptId, token, false);
      return uiFeedback.error('NÓ REJEITADO // A assinatura não pertence a esta fonte.', { target: nodeForm.querySelector('.answer-input') });
    }
    recordAttempt(attemptId, token, true);
    updateState((state) => {
      state.flags[`${node}NodeScanned`] = true;
      state.flags[`${node}NodeValidated`] = true;
      state.physicalNodes[node] = 'validated';
      const fragment = node === 'green' ? 'fragment:yard-symbols' : node === 'yard' ? 'fragment:repeat-event' : node==='books'?'fragment:audio-header':'fragment:reading-0317';
      state.discoveries = [...new Set([...state.discoveries, `node:${node}`, fragment])];
    }, { progress: true });
    addEvent('external-node-authenticated', node);
    if (node === 'room') emitWorldEvent('room.node.validated');
    Motion.emit('evidence:resolve', { source: `${node}-node` });
    const labels = { green: 'NÓ_14 // FONTE VERDE VINCULADA', yard: 'NÓ_17 // MARGEM AUTENTICADA', room: 'NÓ_00 // LEITURA 03:17 ANEXADA', books:'NÓ_11 // ESTANTE AUTENTICADA' };
    uiFeedback.toast(labels[node] || 'NÓ AUTENTICADO', { kind: 'discovery' });
    if(node==='books')return correctAnswer('22',token);
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
  if (handleDesktopChange(event)) return;
  if (event.target.matches('[data-document-overlay]')) {
    const value=Math.max(0,Math.min(100,Number(event.target.value)||0));
    updateState((state)=>{state.documentRuntime.overlay=value;});
    event.target.closest('.document-puzzle')?.querySelector('[data-document-compare]')?.style.setProperty('--overlay',String(value/100));
    const output=event.target.closest('label')?.querySelector('[data-document-overlay-output]');
    if(output) output.textContent=`${value}%`;
    return;
  }
  if (event.target.matches('[data-signal-control]')) {
    const key=event.target.dataset.signalControl;const value=Number(event.target.value);
    updateState((state)=>{state.signalAnalyzer[key]=value;state.signalAnalyzer.locked=false;});
    const output=event.target.closest('label')?.querySelector('output');if(output)output.textContent=key==='fine'?`.${value}`:String(value);
    return;
  }
  if (event.target.matches('.answer-input')) uiFeedback.clearFieldState(event.target);
  if (event.target.matches('[data-master-volume]')) {
    audioManager.setVolume(Number(event.target.value));
    const output = event.target.closest('.master-volume')?.querySelector('output');
    if (output) output.textContent = `${Math.round(Number(event.target.value) * 100)}%`;
  }
}

function handlePointerDown(event) {
  if (handleDesktopPointerDown(event)) return;
  if (handlePaperPointerDown(event)) return;
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
  if (handleDesktopPointerMove(event)) return;
  if (handlePaperPointerMove(event)) return;
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
  if (handleDesktopKeydown(event)) return;
  if (handleComputerKeydown(event)) return;
  if (event.key !== 'Escape') return;
  if (getState().ui?.archiveView) {
    document.querySelector('[data-action="close-archive-record"]')?.click();
    return;
  }
  if (returnComputerToTask()) return;
  document.querySelector('.scene-return[data-action="navigate"]')?.click();
}

export function initInteractions(options) {
  refresh = options.refresh;
  go = options.navigate;
  current = options.current;
  last = options.last || last;
  document.addEventListener('click', handleClick);
  document.addEventListener('dblclick', handleDesktopDoubleClick);
  document.addEventListener('contextmenu', handleDesktopContextMenu);
  document.addEventListener('submit', handleSubmit);
  document.addEventListener('input', handleInput);
  document.addEventListener('pointerdown', handlePointerDown);
  document.addEventListener('pointermove', handlePointerMove, { passive: false });
  document.addEventListener('pointerup', (event) => { if (!handleDesktopPointerUp(event) && !handlePaperPointerUp(event)) finishRoomPointer(event); });
  document.addEventListener('pointercancel', (event) => { if (!handleDesktopPointerUp(event, true) && !handlePaperPointerUp(event, true)) finishRoomPointer(event, true); });
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('computer:reboot-complete',()=>{emitWorldEvent('computer.reboot.completed');refresh();});
}

export function notifyNodeDetection(node, early) {
  const labels = { green: 'FONTE VERDE', yard: 'MARGEM', room: 'ESPAÇO NÃO CLASSIFICADO', books: 'ESTANTE' };
  const label = labels[node] || 'EXTERNO';
  const message = early ? `NÓ ${label} DETECTADO // ACESSO NEGADO // CONTEXTO INSUFICIENTE` : `NÓ ${label} DETECTADO`;
  uiFeedback.toast(message, { kind: early ? 'error' : 'discovery' });
  uiFeedback.screenImpact(early ? 'denied' : 'discovery', message, { level: early ? 'dramatic' : 'slow' });
}

export function notifyNoProgress() {
  uiFeedback.toast('ANOMALIA DETECTADA: SEM PROGRESSO // SOLICITAR AJUDA?', { kind: 'discovery' });
}
