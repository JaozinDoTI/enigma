import { escapeHtml } from './utils.js';

const EVIDENCE = [
  { id: 'EVT-1010', type: 'EVENTO', origin: 'ARQUIVO', confidence: '98%', residual: '—', unlock: '02' },
  { id: 'VX-04', type: 'RESÍDUO', origin: 'SEM PORTADORA', confidence: '21%', residual: 'BLOQUEADO', unlock: '02' },
  { id: 'PORT-04', type: 'PORTADORA', origin: 'RECEPTOR', confidence: '96%', residual: 'OBJETO: MESA', unlock: '04' },
  { id: 'DOC-1708', type: 'DOCUMENTO', origin: 'ARQUIVO', confidence: '91%', residual: 'DATA', unlock: '06' },
  { id: 'FILE-1010', type: 'METADADO', origin: 'DIRETÓRIO J', confidence: '96%', residual: '10:10', unlock: '07' },
  { id: 'PACKET-24', type: 'PACOTE', origin: 'ARQUIVO', confidence: '94%', residual: 'OBJETO: LUA', unlock: '08' },
  { id: 'MEM-MULLET', type: 'MEMÓRIA', origin: 'CONFLITO', confidence: '99.4%', residual: 'S', unlock: '12' },
  { id: 'IMG-251', type: 'IMAGEM RESIDUAL', origin: 'RECEPTOR', confidence: '89%', residual: '02 · 05 · 01', unlock: '13' },
  { id: 'INST-NOITE', type: 'INSTRUÇÃO', origin: 'FRAGMENTOS', confidence: '93%', residual: 'ONDE A NOITE DEIXA O QUE VOCÊ PRECISA', unlock: '15' },
  { id: 'VX-11', type: 'RESÍDUO', origin: 'SEM PORTADORA', confidence: '18%', residual: 'BLOQUEADO', unlock: '02' },
  { id: 'NÓ-17', type: 'NÓ FÍSICO', origin: 'LIMIAR PRIVADO', confidence: '100%', residual: 'REPETIR EVENTO', unlock: '17' },
  { id: 'PORT-1010', type: 'PORTADORA', origin: 'RECEPTOR', confidence: '99%', residual: 'CAN 10 · NÍVEL 10', unlock: '17' },
  { id: 'LOC-1010', type: 'LOCAL', origin: 'PARQUINHO', confidence: '94%', residual: '—', unlock: '18' },
  { id: 'ROOM-99', type: 'MODELO', origin: 'ARMAZENAMENTO FRIO', confidence: '99%', residual: 'TV', unlock: '20' },
  { id: 'NÓ-11', type: 'NÓ FÍSICO', origin: 'ESTANTE', confidence: '100%', residual: 'VALIDADO', unlock: '22' },
  { id: 'VX-02', type: 'RESÍDUO', origin: 'SEM PORTADORA', confidence: '16%', residual: 'BLOQUEADO', unlock: '02' },
  { id: 'REL-NÓS', type: 'RELAÇÃO', origin: 'ENTIDADES A/B', confidence: '100%', residual: 'NÓS', unlock: '24' }
];

function isKnown(state, evidence) {
  return state.completed.includes(evidence.unlock);
}

export function knownEvidence(state) {
  return EVIDENCE.filter((item) => isKnown(state, item)).map((item) => {
    if (item.id === 'VX-04' && state.flags.moonFirstFound) return { ...item, origin: 'LUA', confidence: '74%', residual: 'N' };
    if (item.id === 'VX-11' && state.flags.bedsideFound) return { ...item, origin: 'RECEPTOR', confidence: '82%', residual: 'O' };
    if (item.id === 'VX-02' && state.flags.moonSecondFound) return { ...item, origin: 'CONFLITO', confidence: '88%', residual: 'S' };
    return item;
  });
}

export function renderEvidenceBoard(state) {
  const items = knownEvidence(state);
  if (!items.length) return '<p class="workspace-empty">NENHUMA EVIDÊNCIA INDEXADA.</p>';
  const lines = items.slice(1).map((_, index) => {
    const y = 18 + index * 22;
    return `<path d="M12 ${y} H34" pathLength="1"></path>`;
  }).join('');
  return `<div class="evidence-board" data-evidence-board>
    <header class="evidence-board__header"><span>EVIDÊNCIAS REGISTRADAS</span><strong>${items.length}</strong></header>
    <svg class="evidence-connections" viewBox="0 0 40 ${Math.max(44, items.length * 24)}" aria-hidden="true">${lines}</svg>
    <ol class="evidence-list">${items.map((item) => `<li class="evidence-item" data-evidence-id="${escapeHtml(item.id)}">
      <strong>${escapeHtml(item.id)}</strong>
      <span>${escapeHtml(item.type)} · ${escapeHtml(item.origin)}</span>
      <small>CONFIANÇA ${item.confidence} · RESIDUAL ${item.residual}</small>
    </li>`).join('')}</ol>
  </div>`;
}

export function renderColdStorage(state) {
  const nodeStatus = (name, label) => {
    const value = state.physicalNodes[name];
    const translated = value === 'validated' ? 'VALIDADO' : value === 'detected' ? 'DETECTADO' : value === 'detected-early' ? 'SEM CONTEXTO' : 'AUSENTE';
    return `<li><span>${label}</span><strong>${translated}</strong></li>`;
  };
  return `<div class="cold-storage-map">
    <p class="workspace-copy">MEMÓRIAS REMOVIDAS DO SISTEMA E PRESERVADAS FISICAMENTE.</p>
    <ul>${nodeStatus('desk','NÓ 02 / ESCRIVANINHA')}${nodeStatus('yard','NÓ 17 / LIMIAR EXTERNO')}${nodeStatus('books','NÓ 11 / ESTANTE')}
      <li><span>OBSERVADOR / LUA</span><strong>${state.flags.moonFirstFound ? (state.flags.moonSecondFound ? '2 CAMADAS' : '1 DE 2') : 'NÃO LIDO'}</strong></li>
      <li><span>MODELO DO QUARTO</span><strong>${state.flags.roomRebuilt ? '99%' : 'PENDENTE'}</strong></li>
    </ul>
  </div>`;
}

export function renderIdentity(state) {
  const shared = [state.flags.eventChanged, state.flags.mulletConfirmed, state.flags.locationRecovered].filter(Boolean).length;
  const status = state.flags.finalRecovered ? 'RAYSSA' : state.flags.identityLinked ? 'RAYSSA?' : 'DESCONHECIDA';
  return `<div class="identity-register">
    <div><span>ENTIDADE A</span><strong>JOÃO</strong></div>
    <div><span>ENTIDADE B</span><strong data-entity-b>${status}</strong></div>
    <div><span>MEMÓRIAS COMPARTILHADAS</span><strong>${shared} / 3</strong></div>
    <div><span>RELAÇÃO</span><strong>${state.flags.finalRecovered ? 'NÓS' : 'NÃO RESOLVIDA'}</strong></div>
  </div>`;
}

export function renderReceiverStatus(state) {
  const mode = state.flags.tvTuned ? 'CONTATO DE ENTIDADE' : state.flags.tvSequenceSeen ? 'IMAGEM RESIDUAL' : state.tv.unlocked ? 'CANAL' : 'SEM SINAL';
  const target = ['17', '13', '03'].find((id) => state.unlocked.includes(id)) || '03';
  return `<div class="receiver-status ${state.tv.power ? 'is-on' : 'is-off'}" data-receiver-module>
    <div class="receiver-summary"><span>RECEPTOR VX-11</span><strong>${state.tv.power ? 'ATIVO' : 'INATIVO'}</strong></div>
    <dl><div><dt>CANAL</dt><dd>${String(state.tv.channel).padStart(2, '0')}</dd></div><div><dt>ESTADO</dt><dd>${state.tv.power ? mode : 'DESLIGADO'}</dd></div></dl>
    <button type="button" class="primary-button receiver-open" data-action="navigate" data-target="${target}">ABRIR RECEPTOR</button>
  </div>`;
}
