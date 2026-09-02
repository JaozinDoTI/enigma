import { escapeHtml } from './utils.js';

const piece=(id,label,x,y,rotation,targetX,targetY,targetRotation=0,extra={})=>Object.freeze({id,label,x,y,rotation,targetX,targetY,targetRotation,...extra});

export const PAPER_BOARDS=Object.freeze({
  '11':Object.freeze({title:'OBJETO C // MESA DE TRIAGEM',tolerance:7,pieces:Object.freeze([
    piece('photo-a','FOTO // CORTE A',7,8,-8,29,26,0,{kind:'photo',required:true,mark:'orelha'}),piece('photo-b','FOTO // CORTE B',66,10,12,43,26,0,{kind:'photo',required:true,mark:'contorno'}),
    piece('photo-c','FOTO // CORTE C',8,58,5,29,47,0,{kind:'photo',required:true,mark:'tecido'}),piece('photo-d','FOTO // CORTE D',70,60,-12,43,47,0,{kind:'photo',required:true,mark:'recorrência'}),
    piece('meta-c','METADATA // DUAS ORIGENS',44,66,3,67,42,0,{kind:'note',required:true,mark:'doméstico'}),piece('outline-c','CONTORNO // SEM NOME',45,5,-4,36,36,0,{kind:'acetate',required:true,mark:'animal'}),
    piece('noise-a','RECORTE // FONTE D',80,35,16,82,24,0,{kind:'noise'}),piece('noise-b','CHECKSUM INVÁLIDO',17,34,-17,78,68,0,{kind:'noise'})])}),
  '18':Object.freeze({title:'MARGEM // MAPA RASGADO',tolerance:6,pieces:Object.freeze([
    piece('map-1','MARGEM',5,7,-14,24,27,0,{kind:'map',required:true,mark:'água'}),piece('map-2','CAMINHO',72,8,9,39,27,0,{kind:'map',required:true,mark:'caminho'}),piece('map-3','BANCO',7,57,17,54,27,0,{kind:'map',required:true,mark:'banco'}),
    piece('map-4','BRINQUEDO',72,61,-11,24,47,0,{kind:'map',required:true,mark:'brinquedo'}),piece('map-5','SOMBRA',38,67,6,39,47,0,{kind:'map',required:true,mark:'sombra'}),piece('map-6','ÁGUA',43,5,-7,54,47,0,{kind:'map',required:true,mark:'beira-mar'}),
    piece('map-x','TELHADO',83,25,23,79,16,0,{kind:'noise'}),piece('map-y','TRILHO',15,34,-22,79,34,0,{kind:'noise'}),piece('map-z','ESCADA',80,48,13,79,52,0,{kind:'noise'}),piece('map-w','JANELA',45,34,18,79,70,0,{kind:'noise'})])}),
  '20':Object.freeze({title:'CÔMODO ZERO // TRANSPARÊNCIAS',tolerance:4,pieces:Object.freeze([
    piece('layer-structure','ESTRUTURA // 107,4 m²',8,8,-7,34,24,0,{kind:'acetate',required:true,mark:'paredes'}),piece('layer-furniture','MOBILIÁRIO // CAPTURA',65,10,9,34,24,0,{kind:'acetate',required:true,mark:'móveis'}),
    piece('layer-reading','LEITURA // SISTEMA',10,60,5,34,24,0,{kind:'acetate',required:true,mark:'+11,2 m²'}),piece('layer-archive','PLANTA // ARQUIVO',66,59,-9,34,24,0,{kind:'acetate',required:true,mark:'NODE_00'})])}),
  '24':Object.freeze({title:'SÍNTESE // FRAGMENTOS DE TODAS AS FONTES',tolerance:5,pieces:Object.freeze([
    piece('final-pc','PC // 5 · 20',7,9,-9,22,29,0,{kind:'strip',required:true,mark:'520'}),piece('final-tv','RECEIVER // 13 · 14',69,11,11,47,29,0,{kind:'strip',required:true,mark:'1314'}),
    piece('final-books','LIVROS // FIM 01 COMEÇO',8,61,6,22,52,0,{kind:'strip',required:true,mark:'ordem'}),piece('final-table','MESA // LEITURA →',69,59,-12,47,52,0,{kind:'acetate',required:true,mark:'orientação'}),
    piece('final-noise','SOMA // BLOQUEADA',44,7,18,78,66,0,{kind:'noise'})])})
});

export function ensurePaperBoard(state,id) {
  const definition=PAPER_BOARDS[id];
  if (!definition) return null;
  if (!state.paperEngine.boards[id]) {
    state.paperEngine.boards[id]={ pieces:Object.fromEntries(definition.pieces.map((item,index)=>[item.id,{x:item.x,y:item.y,rotation:item.rotation,z:index+1,flipped:false,group:null,locked:false}])),links:[],tested:false,solved:false };
  }
  state.paperEngine.activeBoard=id;
  return state.paperEngine.boards[id];
}

function rotationDistance(a,b) { const distance=Math.abs((((a-b)+180)%360)-180);return Math.min(distance,360-distance); }
export function evaluatePaperBoard(state,id) {
  const definition=PAPER_BOARDS[id];const board=ensurePaperBoard(state,id);
  if (!definition||!board) return {ready:false,aligned:0,total:0};
  const required=definition.pieces.filter((item)=>item.required);
  const aligned=required.filter((item)=>{const current=board.pieces[item.id];return Math.hypot(current.x-item.targetX,current.y-item.targetY)<=definition.tolerance&&rotationDistance(current.rotation,item.targetRotation)<=12;});
  return {ready:aligned.length===required.length,aligned:aligned.length,total:required.length};
}

export function bringPaperToFront(state,boardId,pieceId) {
  const board=ensurePaperBoard(state,boardId);if(!board?.pieces[pieceId])return;
  state.paperEngine.zCounter+=1;board.pieces[pieceId].z=state.paperEngine.zCounter;
}

export function renderPaperBoard(state,id,{instruction='',secondary=''}={}) {
  const definition=PAPER_BOARDS[id];const board=ensurePaperBoard(state,id);const evaluation=evaluatePaperBoard(state,id);
  const pieces=definition.pieces.map((item)=>{const current=board.pieces[item.id];return `<article class="paper-piece paper-piece--${item.kind}${current.flipped?' is-flipped':''}${current.locked?' is-locked':''}" data-paper-piece="${item.id}" data-board="${id}" style="--paper-x:${current.x}%;--paper-y:${current.y}%;--paper-r:${current.rotation}deg;--paper-z:${current.z}" tabindex="0"><div class="paper-piece__face"><span>${escapeHtml(item.label)}</span><i>${escapeHtml(item.mark||'')}</i></div><div class="paper-piece__back">${escapeHtml(item.id.toUpperCase())}</div><footer><button type="button" data-action="paper-rotate" data-delta="-15" aria-label="Girar à esquerda">↶</button><button type="button" data-action="paper-flip">VIRAR</button><button type="button" data-action="paper-rotate" data-delta="15" aria-label="Girar à direita">↷</button></footer></article>`;}).join('');
  const archive=Object.entries(state.paperEngine.boards).filter(([boardId])=>boardId!==id).map(([boardId,item])=>`<span class="${item.solved?'is-solved':''}">MESA ${boardId} ${item.solved?'// ARQUIVADA':'// INCOMPLETA'}</span>`).join('');
  return `<section class="paper-workbench" data-paper-board="${id}"><header><span>MESA DE INVESTIGAÇÃO</span><strong>${escapeHtml(definition.title)}</strong><small>${escapeHtml(instruction)}</small></header>${archive?`<nav class="paper-history" aria-label="Vestígios acumulados">${archive}</nav>`:''}<div class="paper-field">${pieces}<div class="paper-registration" aria-hidden="true"></div></div><aside class="paper-status"><span data-paper-progress>${evaluation.aligned} / ${evaluation.total} RELAÇÕES GEOMÉTRICAS ESTÁVEIS</span>${secondary?`<small>${escapeHtml(secondary)}</small>`:''}</aside><button type="button" class="primary-button" data-action="paper-validate" data-board="${id}">TESTAR COMPOSIÇÃO</button><div class="feedback" data-feedback></div></section>`;
}
