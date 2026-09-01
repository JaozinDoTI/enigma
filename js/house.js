import { escapeHtml } from './utils.js';

const NODE_LABELS = Object.freeze({
  green: 'ASSENTO / EXTERIOR',
  yard: 'MARGEM / CÉU ABERTO',
  room: 'ORIGEM NÃO INDEXADA',
  books: 'ARMAZENAMENTO / QUARTO'
});

function nodeState(state, key) {
  const value = state.physicalNodes?.[key] || 'unknown';
  if (value === 'validated') return 'AUTENTICADO';
  if (value === 'detected' || value === 'detected-early') return 'DETECTADO';
  return 'SEM LEITURA';
}

export function renderHouseReconstruction(state) {
  const roomKnown = state.unlocked.some((id) => Number(id) >= 10) || state.flags.houseAnomalyRevealed;
  const exteriorKnown = state.flags.greenNodeValidated || state.unlocked.includes('17');
  const yardKnown = state.flags.yardNodeValidated || state.unlocked.includes('18');
  const anomalyOpen = state.flags.houseAnomalyRevealed || state.flags.roomNodeScanned || state.flags.roomNodeValidated;
  const nodes = ['green', 'yard', 'room', 'books'];
  const knownNodes = nodes.filter((key) => state.physicalNodes?.[key] !== 'unknown');

  return `<section class="house-tool" aria-label="Reconstrução espacial persistente">
    <header class="house-tool__header"><div><span>RECONSTRUÇÃO ESPACIAL</span><strong>A CASA NÃO É UM ENDEREÇO. É UMA RELAÇÃO.</strong></div><i>${knownNodes.length} / ${nodes.length} FONTES</i></header>
    <div class="house-blueprint ${anomalyOpen ? 'has-anomaly' : ''}">
      <svg viewBox="0 0 720 430" role="img" aria-label="Planta parcial da casa reconstruída pelo sistema">
        <g class="house-blueprint__walls">
          <path d="M42 42H504V286H42Z M250 42V286 M250 164H504 M504 112H632V342H372V286" />
          ${exteriorKnown ? '<path class="is-recovered" d="M504 112H632V286H504 M520 202H620" />' : ''}
          ${yardKnown ? '<path class="is-recovered" d="M372 286H632V342H372Z" />' : ''}
          ${roomKnown ? '<path class="is-anomaly" d="M250 42H372V164H250Z" />' : ''}
        </g>
        <g class="house-blueprint__labels">
          <text x="78" y="92">QUARTO // ORIGEM</text><text x="78" y="114">OBJETOS RELACIONADOS</text>
          <text x="388" y="214">ÁREA COMUM</text>
          ${exteriorKnown ? '<text x="526" y="154">FONTE EXTERNA</text><text x="526" y="174">CROMA // VERDE</text>' : '<text x="526" y="154">SEM AMOSTRA</text>'}
          ${yardKnown ? '<text x="420" y="321">MARGEM PRIVADA // CÉU</text>' : ''}
          ${roomKnown ? `<text class="is-anomaly" x="268" y="91">${anomalyOpen ? 'ESPAÇO NÃO CLASSIFICADO' : 'ÁREA SEM ÍNDICE'}</text><text class="is-anomaly" x="268" y="113">+11,2 m² // ORIGEM ?</text>` : ''}
        </g>
        <g class="house-blueprint__nodes">
          ${state.physicalNodes?.green !== 'unknown' ? '<circle cx="572" cy="224" r="7"/><text x="585" y="229">NÓ_14</text>' : ''}
          ${state.physicalNodes?.yard !== 'unknown' ? '<circle cx="478" cy="317" r="7"/><text x="491" y="322">NÓ_17</text>' : ''}
          ${state.physicalNodes?.room !== 'unknown' ? '<circle class="is-anomaly" cx="312" cy="132" r="7"/><text class="is-anomaly" x="325" y="137">NÓ_00</text>' : ''}
          ${state.physicalNodes?.books !== 'unknown' ? '<circle cx="112" cy="67" r="7"/><text x="125" y="72">NÓ_11</text>' : ''}
        </g>
      </svg>
      <aside class="house-blueprint__calculation">
        <span>ÁREA CALCULADA</span><strong>${roomKnown ? '118,6 m²' : '107,4 m²'}</strong>
        <span>ÁREA INDEXADA</span><strong>107,4 m²</strong>
        <span>DIFERENÇA</span><strong class="${roomKnown ? 'error' : ''}">${roomKnown ? '+11,2 m²' : '—'}</strong>
        <p>${roomKnown ? 'Existe espaço suficiente para um cômodo que os registros se recusam a nomear.' : 'A malha cresce quando uma fonte física é autenticada.'}</p>
      </aside>
    </div>
    <div class="house-node-ledger">${nodes.map((key) => `<div class="${state.physicalNodes?.[key] === 'validated' ? 'is-validated' : ''}"><span>${escapeHtml(NODE_LABELS[key])}</span><strong>${nodeState(state, key)}</strong></div>`).join('')}</div>
  </section>`;
}
