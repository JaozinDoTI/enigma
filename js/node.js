import { GAME_CONFIG } from './config.js';
import { escapeHtml } from './utils.js';

const params = new URLSearchParams(location.search);
const node = params.get('node');
const nodes = {
  desk: { id: 'NÓ_02', token: GAME_CONFIG.deskNodeCode, message: 'A superfície lembra o que foi deixado sob ela.' },
  yard: {
    id: 'NÓ_17',
    token: GAME_CONFIG.yardNodeCode,
    message: 'A casa acaba aqui, mas você ainda está dentro do que é seguro.',
    fragment: 'CALIBRAÇÃO PARCIAL // REPITA O EVENTO NOS DOIS CONTROLES.'
  },
  books: { id: 'NÓ_11', token: GAME_CONFIG.booksNodeCode, message: 'Histórias suspensas projetam uma sombra abaixo.' }
};
const record = nodes[node];
const root = document.querySelector('#node-card');

if (!record) {
  root.innerHTML = '<p class="error">NÓ DESCONHECIDO</p><p class="node-meta">A portadora é válida, mas o destino não.</p>';
} else {
  root.innerHTML = `<p class="good">${record.id} ENCONTRADO</p><h1>NÓ EXTERNO</h1><p>${escapeHtml(record.message)}</p>${record.fragment ? `<p class="node-fragment">${escapeHtml(record.fragment)}</p>` : ''}<div class="node-token">${escapeHtml(record.token)}</div><p class="node-meta">ASSINATURA DE RETORNO. Volte ao terminal original e informe este código. O fragmento recuperado ainda precisa ser cruzado com o ARQUIVO.</p>`;
}
