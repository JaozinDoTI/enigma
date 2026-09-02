import { syncDocumentExtraction, syncForensicSelection, syncLocationSelection } from '../dom-sync.js';
import { Motion } from '../motion-engine.js';
import { getState, updateState } from '../state.js';
import { uiFeedback } from '../ui-feedback.js';
import { DOCUMENT_TARGET_FREQUENCY, documentCommitState } from '../computer-runtime.js';

const ACTIONS = new Set(['document-row','memory-region','document-snapshot','commit-document','open-file','forensic-feature','ack-conflict','location-fragment']);

export function handlePuzzleClick(action,button,context) {
  if (!ACTIONS.has(action)) return false;
  if (action === 'document-row' || action === 'memory-region') {
    if (!getState().signalAnalyzer.locked) { context.feedback('SEM SIGNAL LOCK // AS REGIÕES AINDA NÃO SÃO CONFIÁVEIS','warn'); return true; }
    if (!documentCommitState(getState()).validSnapshot) { context.feedback('CAPTURE UM SNAPSHOT VÁLIDO ANTES DE FIXAR REGIÕES','warn'); return true; }
    const token=button.dataset.token;
    Motion.emit('evidence:contact',{source:'document-comparison',row:button.dataset.row});
    if (!token) {
      context.wrong('06',button.dataset.row,'REGIÃO INSTÁVEL // O conteúdo saiu do alinhamento.');
      Motion.pulse(button,'is-invalid','fast');
      return true;
    }
    updateState((state)=>{
      const selected=state.documentFragments||[];
      state.documentFragments=selected.includes(token)?selected.filter((fragment)=>fragment!==token):[...selected,token];
    });
    syncDocumentExtraction(getState());
    Motion.emit('evidence:linked',{source:'document-invariant',token});
    Motion.pulse(button,'is-revealed','fast');
    return true;
  }
  if (action === 'document-snapshot') {
    const guard=documentCommitState(getState());
    if (!guard.hasA || !guard.hasB) { context.feedback('REFERÊNCIA CRUZADA INCOMPLETA // ABRA AS CÓPIAS A E B','warn'); return true; }
    if (!guard.locked || !guard.exactFrequency) { context.feedback('SEM SIGNAL LOCK // O ESTADO NÃO PODE SER CAPTURADO','warn'); return true; }
    if (!guard.notFrozen) { context.feedback('SINAL JÁ CONSOLIDADO','warn'); return true; }
    updateState((state)=>{
      const capturedAt=Date.now();
      const snapshot={copy:'OVERLAY',frequency:DOCUMENT_TARGET_FREQUENCY,revision:state.documentRuntime.revision,copies:['A','B'],capturedAt,at:capturedAt,valid:true};
      state.documentRuntime.snapshots=[...state.documentRuntime.snapshots.map((item)=>item.valid?{...item,valid:false}:item),snapshot].slice(-6);
    },{progress:true});
    button.textContent='ESTADO ATUAL CAPTURADO';
    button.disabled=true;
    syncDocumentExtraction(getState());
    Motion.emit('evidence:contact',{source:'document-snapshot'});
    return true;
  }
  if (action === 'commit-document') {
    const order=['A DATA','ABRE','O ARQUIVO'];
    const guard=documentCommitState(getState());
    if (!guard.hasA || !guard.hasB) { context.feedback('REFERÊNCIA CRUZADA INCOMPLETA // ABRA AS CÓPIAS A E B','warn'); return true; }
    if (!guard.exactFrequency || !guard.locked) { context.feedback('PORTADORA NÃO ESTABILIZADA EM 170.8','warn'); return true; }
    if (!guard.validSnapshot) { context.feedback('ESTADO VOLÁTIL // CAPTURE UM SNAPSHOT VÁLIDO NESTE LOCK','warn'); return true; }
    if (!guard.allInvariants) { context.feedback('EXTRAÇÃO INCOMPLETA // Fixe apenas o que não se move.','warn'); return true; }
    if (!guard.notFrozen) { context.feedback('SINAL JÁ CONSOLIDADO','warn'); return true; }
    button.disabled=true;
    updateState((state)=>{state.signalAnalyzer.frozen=true;},{progress:true});
    Motion.emit('evidence:resolve',{source:'document-invariant'});
    context.correctAnswer('06',order.join(' '));
    return true;
  }
  if (action === 'open-file') {
    Motion.emit('archive:open',{file:button.dataset.file});
    const preview=document.querySelector('[data-file-preview]');
    const file=button.dataset.file;
    document.querySelectorAll('.file-row').forEach((row)=>row.classList.remove('is-open'));
    button.classList.add('is-open');
    preview?.classList.remove('hidden');
    if (preview) preview.textContent=file==='final_agora_vai.txt'?'10:10 // CHAVE DO CONTEÚDO CORRESPONDENTE':'VERSÃO PLAUSÍVEL. HORÁRIO INCONSISTENTE.';
    uiFeedback.reveal(preview);
    if (file==='final_agora_vai.txt') { Motion.cancel('file-consistency'); context.progress('07',['08'],'METADADOS CONFIÁVEIS ENCONTRADOS'); return true; }
    button.classList.add('is-processing');
    context.feedback('CONSISTÊNCIA ........ APROVADA','good');
    Motion.schedule('file-consistency',()=>{button.classList.remove('is-processing');context.wrong('07',file,'CONSISTÊNCIA ........ FALSA // O NOME NÃO É EVIDÊNCIA');},Motion.reduced?0:900);
    return true;
  }
  if (action === 'forensic-feature') {
    Motion.emit('evidence:contact',{source:'forensic-layer'});
    updateState((state)=>{const key=button.dataset.feature;state.forensicSelections=state.forensicSelections.includes(key)?state.forensicSelections.filter((item)=>item!==key):[...state.forensicSelections,key];});
    syncForensicSelection(button,getState());
    Motion.pulse(button,'is-revealed','fast');
    return true;
  }
  if (action === 'ack-conflict') {
    const required=['textile','animal','domestic','recurrence'];
    if (!required.every((item)=>(getState().forensicSelections||[]).includes(item))) { context.feedback('MODELO INCONCLUSIVO: USE AS QUATRO CAMADAS INVARIANTES DO OBJETO','warn'); return true; }
    Motion.emit('evidence:resolve',{source:'forensic-model'});
    Motion.play('memory-reconstruction',{target:document.querySelector('[data-forensic]')});
    context.progress('11',['12'],'OBJETO TÊXTIL // FORMA ANIMAL // IDENTIDADE PENDENTE',{delay:900});
    return true;
  }
  Motion.emit('evidence:contact',{source:'location-fragment'});
  updateState((state)=>{const fragment=button.dataset.fragment;state.locationFragments=state.locationFragments.includes(fragment)?state.locationFragments.filter((item)=>item!==fragment):[...state.locationFragments,fragment];});
  syncLocationSelection(button,getState());
  Motion.pulse(button,'is-revealed','fast');
  return true;
}
