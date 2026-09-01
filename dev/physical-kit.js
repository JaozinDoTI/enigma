const NODES = [
  {
    key: 'green', order: '01', puzzle: '13 → 17', id: 'NÓ_14', type: 'NÓ CROMÁTICO', code: 'VX-VERDE-0314',
    label: 'ASSENTO // EXTERNO // VERDE', hide: 'Atrás ou embaixo da cadeira correta, em ponto acessível, seco e protegido com envelope plástico.', prerequisite: 'Receiver entrega 03 · 01 · 04; Arquivo relaciona ASSENTO + EXTERNO + VERDE.', print: '△  ○  ⌁ // LEVAR PARA A MARGEM SOB CÉU ABERTO.'
  },
  {
    key: 'yard', order: '02', puzzle: '17 → 18', id: 'NÓ_17', type: 'NÓ DE MARGEM', code: 'VX-MARGEM-1703',
    label: 'MARGEM // REPETIR EVENTO', hide: 'No fim da sequência △ → ○ → ⌁ preparada no quintal privado, protegido do tempo.', prerequisite: 'NÓ_14 no celular revela as três marcas e a relação com céu aberto.', print: 'REPITA O EVENTO NOS DOIS CONTROLES.'
  },
  {
    key: 'room', order: '03', puzzle: '20', id: 'NÓ_00', type: 'NÓ NÃO INDEXADO', code: 'VX-QUARTO-0317',
    label: 'ORIGEM // NÃO INDEXADA', hide: 'No quarto conhecido como estranho, após uma cadeia de três marcas discretas perto de madeira. Nunca deixar o QR como primeira coisa visível.', prerequisite: 'Planta fecha o quarto conhecido e revela diferença coerente de +11,2 m².', print: 'LEITURA ANTERIOR // 03:17 // EVENTO DE ENTRADA AUSENTE.'
  },
  {
    key: 'books', order: '04', puzzle: '21 → 22', id: 'NÓ_11', type: 'NÓ DE ARMAZENAMENTO', code: 'VX-LIVROS-0214',
    label: 'ARMAZENAMENTO // HISTÓRIAS', hide: 'Sob a estante de livros, visível sem mover móvel pesado ou alcançar altura.', prerequisite: 'O falso encerramento rompe e devolve a frase sobre histórias suspensas.', print: 'CABEÇALHO // TÃO FÁCIL SE APAIXONAR…'
  },
  {
    key: 'book-end', order: '05A', puzzle: '14', id: 'BOOKSCAN_FIM', type: 'INSERTO FÍSICO', code: '03:__',
    label: 'É ASSIM QUE ACABA // FIM', hide: 'Inserir de forma removível em É Assim que Acaba, sem colar ou danificar páginas.', prerequisite: 'BOOKSCAN correlaciona FIM · DISTÂNCIA 01 · COMEÇO.', print: 'FIM // 03:__',
    payload: 'RECUPERACAO_1010|VOLUME_FIM|03:__', qr: false
  },
  {
    key: 'book-begin', order: '05B', puzzle: '14', id: 'BOOKSCAN_COMECO', type: 'INSERTO FÍSICO', code: '__:17',
    label: 'É ASSIM QUE COMEÇA // COMEÇO', hide: 'Inserir de forma removível em É Assim que Começa, imediatamente ao lado do primeiro volume.', prerequisite: 'Mesma correlação BOOKSCAN do volume FIM.', print: 'COMEÇO // __:17',
    payload: 'RECUPERACAO_1010|VOLUME_COMECO|__:17', qr: false
  }
];

const baseInput = document.querySelector('[data-base-url]');
const cardsRoot = document.querySelector('[data-qr-cards]');
const manifestRoot = document.querySelector('[data-manifest]');
const used = {};

function initialBase() {
  if (location.protocol === 'file:') return 'http://SEU-ENDERECO/';
  const projectRoot = new URL('../', location.href);
  return projectRoot.href;
}

function nodeUrl(node) {
  if (node.payload) return node.payload;
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

function saveUsed(node, checked) {
  used[node] = checked;
}

function render() {
  cardsRoot.replaceChildren();
  manifestRoot.replaceChildren();

  NODES.forEach((node) => {
    const url = nodeUrl(node);
    if (!url) return;
    const card = document.createElement('article');
    card.className = 'node-print-card';
    card.innerHTML = `<header><span>RECUPERAÇÃO_1010</span><strong>${node.id}</strong></header><div class="node-print-card__qr" data-qr></div><div class="node-print-card__identity"><span>${node.type} // ${node.label}</span><strong>${node.code}</strong><small>${node.print}</small><small>SOMA DE VERIFICAÇÃO // ${node.order}-1010-VX</small></div><footer>ESCANEAR // RECUPERAR // RETORNAR</footer>`;
    cardsRoot.append(card);
    const transport = card.querySelector('[data-qr]');
    if (node.qr === false) {
      transport.classList.add('node-print-card__fragment');
      transport.innerHTML = `<span>${node.label}</span><strong>${node.code}</strong><small>RECORTAR E INSERIR SEM DANIFICAR O LIVRO</small>`;
    } else {
      new QRCode(transport, { text: url, width: 220, height: 220, colorDark: '#050807', colorLight: '#f2f0df', correctLevel: QRCode.CorrectLevel.H });
    }

    const row = document.createElement('tr');
    row.innerHTML = `<td>${node.order}</td><td>${node.puzzle}</td><td><strong>${node.id}</strong><small>${node.type}</small><small>${node.label}</small></td><td>${node.hide}</td><td>${node.prerequisite}</td><td><small>${node.print}</small><code></code></td><td><input type="checkbox" data-used="${node.key}" aria-label="Marcar ${node.id} como utilizado" ${used[node.key] ? 'checked' : ''}></td>`;
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
