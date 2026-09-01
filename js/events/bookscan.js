import { audioManager } from '../audio.js';
import { Motion } from '../motion-engine.js';
import { getState, updateState } from '../state.js';

const LABELS = Object.freeze({ acaba:'É Assim que Acaba', comeca:'É Assim que Começa', lado:'O Lado Feio do Amor', maldicao:'A Maldição do Ex', lua:'Cidade da Lua Crescente' });
const ACTIONS = new Set(['bookscan-spine','bookscan-zoom','bookscan-reset','bookscan-confirm-pair']);

function syncSelection() {
  const selected = getState().bookSelections || [];
  document.querySelectorAll('[data-action="bookscan-spine"]').forEach((hotspot)=>{
    const active=selected.includes(hotspot.dataset.book);
    hotspot.classList.toggle('is-selected',active);
    hotspot.setAttribute('aria-pressed',String(active));
  });
  document.querySelectorAll('[data-bookscan-selection]').forEach((output)=>{output.textContent=selected.length?selected.map((id)=>LABELS[id]).join(' + '):'nenhuma';});
  document.querySelectorAll('[data-action="bookscan-confirm-pair"]').forEach((button)=>{button.disabled=selected.length!==2;});
}

export function handleBookscanClick(action,button,context) {
  if (!ACTIONS.has(action)) return false;
  if (action === 'bookscan-spine') {
    const id=button.dataset.book;
    updateState((state)=>{
      const selected=state.bookSelections || [];
      state.bookSelections=selected.includes(id)?selected.filter((item)=>item!==id):[...selected.slice(-1),id];
    });
    syncSelection();
    Motion.pulse(button,'is-marking','fast');
    audioManager.playEvent('forensic.contact',{volume:.045});
    return true;
  }
  const viewport=button.closest('[data-bookscan]')?.querySelector('[data-bookscan-viewport]');
  const canvas=viewport?.querySelector('[data-bookscan-canvas]');
  if (action === 'bookscan-zoom') {
    const zoom=Math.max(1,Math.min(2.5,Number(viewport?.dataset.zoom || 1)+Number(button.dataset.delta)));
    if (viewport) viewport.dataset.zoom=String(zoom);
    if (canvas) canvas.style.width=`${zoom*100}%`;
    button.closest('[data-bookscan]')?.querySelector('[data-bookscan-zoom]')?.replaceChildren(document.createTextNode(`${Math.round(zoom*100)}%`));
    audioManager.playEvent('phone.tap',{volume:.035});
    return true;
  }
  if (action === 'bookscan-reset') {
    if (viewport) { viewport.dataset.zoom='1'; viewport.scrollTo({left:0,top:0,behavior:'smooth'}); }
    if (canvas) canvas.style.width='100%';
    button.closest('[data-bookscan]')?.querySelector('[data-bookscan-zoom]')?.replaceChildren(document.createTextNode('100%'));
    return true;
  }
  const pair=[...(getState().bookSelections||[])].sort().join('|');
  if (pair!=='acaba|comeca') { context.wrong('14',pair,'As marcas não formam FIM e COMEÇO com distância 01.'); return true; }
  updateState((state)=>{state.flags.bookPairIdentified=true;},{progress:true});
  document.querySelector('.bookscan-return')?.removeAttribute('hidden');
  Motion.emit('evidence:linked',{source:'bookscan-adjacency'});
  context.feedback('PAR IDENTIFICADO // AGORA CONSULTE OS VOLUMES FÍSICOS','good');
  return true;
}
