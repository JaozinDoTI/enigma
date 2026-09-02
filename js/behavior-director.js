import { updateState } from './state.js';

const FOLDERS=new Set(['documents','pictures','downloads','temporary']);

export function signalBehavior(type,payload={}) {
  updateState((state)=>{
    const metrics=state.director.metrics;metrics.lastActionAt=Date.now();
    if(type==='wrong-answer')metrics.consecutiveWrong+=1;
    if(type==='progress')metrics.consecutiveWrong=0;
    if(type==='receiver')metrics.receiverInteractions+=1;
    if(type==='quarantine')metrics.quarantineActions+=1;
    if(type==='empty-search')metrics.emptySearches+=1;
    if(type==='resource'){
      const id=payload.id||'';metrics.wrongFolderStreak=FOLDERS.has(id)?metrics.wrongFolderStreak+1:0;
      metrics.repeatedFileOpens=Math.max(metrics.repeatedFileOpens,state.computer.files[id]?.openCount||0);
    }
  });
  document.dispatchEvent(new CustomEvent('behavior:signal',{detail:{type,payload}}));
}
