const NODES = [
  {
    key: 'desk', order: '01', puzzle: '04 → 05', id: 'NÓ_02', code: 'VX-MESA-1010',
    label: 'PORTADORA // MESA', hide: 'Fixar discretamente na escrivaninha, em ponto acessível e sem desmontagem.'
  },
  {
    key: 'yard', order: '02', puzzle: '16 → 17', id: 'NÓ_17', code: 'VX-LIMIAR-1010',
    label: 'LIMIAR // REPETIR EVENTO', hide: 'Área privada segura do quintal, perto do limite da casa e protegida do tempo.'
  },
  {
    key: 'books', order: '03', puzzle: '21 → 22', id: 'NÓ_11', code: 'VX-LIVROS-0214',
    label: 'ARMAZENAMENTO // HISTÓRIAS', hide: 'Sob a estante de livros, visível sem mover móvel pesado ou alcançar altura.'
  }
];

const baseInput = document.querySelector('[data-base-url]');
const cardsRoot = document.querySelector('[data-qr-cards]');
const manifestRoot = document.querySelector('[data-manifest]');
const usedKey = 'recuperacao1010:physical-kit-used';

function initialBase() {
  if (location.protocol === 'file:') return 'http://SEU-ENDERECO/';
  const projectRoot = new URL('../', location.href);
  return projectRoot.href;
}

function nodeUrl(node) {
  const base = baseInput.value.trim() || initialBase();
  try {
    const url = new URL(`node.html?node=${node.key}`, base.endsWith('/') ? base : `${base}/`).href;
    baseInput.setCustomValidity('');
    return url;
  } catch {
    baseInput.setCustomValidity('Informe uma URL completa, por exemplo: https://site.exemplo/jogo/');
    baseInput.reportValidity();
    return '';
  }
}

function usedState() {
  try { return JSON.parse(localStorage.getItem(usedKey) || '{}'); }
  catch { return {}; }
}

function saveUsed(node, checked) {
  const next = { ...usedState(), [node]: checked };
  localStorage.setItem(usedKey, JSON.stringify(next));
}

function render() {
  const used = usedState();
  cardsRoot.replaceChildren();
  manifestRoot.replaceChildren();

  NODES.forEach((node) => {
    const url = nodeUrl(node);
    if (!url) return;
    const card = document.createElement('article');
    card.className = 'node-print-card';
    card.innerHTML = `<header><span>RECUPERAÇÃO_1010</span><strong>${node.id}</strong></header><div class="node-print-card__qr" data-qr></div><div class="node-print-card__identity"><span>${node.label}</span><strong>${node.code}</strong><small>SOMA DE VERIFICAÇÃO // ${node.order}-1010-VX</small></div><footer>ESCANEAR // RECUPERAR // RETORNAR</footer>`;
    cardsRoot.append(card);
    new QRCode(card.querySelector('[data-qr]'), { text: url, width: 220, height: 220, colorDark: '#050807', colorLight: '#f2f0df', correctLevel: QRCode.CorrectLevel.H });

    const row = document.createElement('tr');
    row.innerHTML = `<td>${node.order}</td><td>${node.puzzle}</td><td><strong>${node.id}</strong><small>${node.label}</small></td><td>${node.hide}</td><td><code></code></td><td><input type="checkbox" data-used="${node.key}" aria-label="Marcar ${node.id} como utilizado" ${used[node.key] ? 'checked' : ''}></td>`;
    row.querySelector('code').textContent = url;
    manifestRoot.append(row);
  });
}

baseInput.value = initialBase();
document.querySelector('[data-regenerate]').addEventListener('click', render);
document.querySelector('[data-print]').addEventListener('click', () => window.print());
manifestRoot.addEventListener('change', (event) => {
  if (event.target.matches('[data-used]')) saveUsed(event.target.dataset.used, event.target.checked);
});
render();
