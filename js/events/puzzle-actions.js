import { syncDocumentExtraction, syncForensicSelection, syncLocationSelection } from '../dom-sync.js';
import { Motion } from '../motion-engine.js';
import { getState, recordAttempt, updateState } from '../state.js';
import { uiFeedback } from '../ui-feedback.js';

const ACTIONS = new Set(['document-row','commit-document','open-file','forensic-feature','ack-conflict','location-fragment']);

export function handlePuzzleClick(action,button,context) {
  if (!ACTIONS.has(action)) return false;
  if (action === 'document-row') {
    const token=button.dataset.token;
    Motion.emit('evidence:contact',{source:'document-comparison',row:button.dataset.row});
    if (!token) {
      recordAttempt('06',button.dataset.row,false);
      uiFeedback.error('TRECHO ALTERADO // As duas versões divergem neste índice.');
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
  if (action === 'commit-document') {
    const order=['A DATA','ABRE','O ARQUIVO'];
    const selected=order.filter((token)=>(getState().documentFragments||[]).includes(token));
    if (selected.length!==order.length) { context.feedback('EXTRAÇÃO INCOMPLETA // Encontre os três trechos preservados.','warn'); return true; }
    button.disabled=true;
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
    const required=['volume','sides','length','silhouette'];
    if (!required.every((item)=>(getState().forensicSelections||[]).includes(item))) { context.feedback('MODELO INCONCLUSIVO: USE AS QUATRO CAMADAS QUE DESCREVEM GEOMETRIA','warn'); return true; }
    Motion.emit('evidence:resolve',{source:'forensic-model'});
    Motion.play('memory-reconstruction',{target:document.querySelector('[data-forensic]')});
    context.progress('11',['12'],'GEOMETRIA DO CONFLITO EXTRAÍDA',{delay:900});
    return true;
  }
  Motion.emit('evidence:contact',{source:'location-fragment'});
  updateState((state)=>{const fragment=button.dataset.fragment;state.locationFragments=state.locationFragments.includes(fragment)?state.locationFragments.filter((item)=>item!==fragment):[...state.locationFragments,fragment];});
  syncLocationSelection(button,getState());
  Motion.pulse(button,'is-revealed','fast');
  return true;
}
