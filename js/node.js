import { GAME_CONFIG } from './config.js';
import { escapeHtml } from './utils.js';

const params = new URLSearchParams(location.search);
const nodeKey = params.get('node');
const root = document.querySelector('#node-card');

const nodes = Object.freeze({
  green: {
    id: 'NÓ_14', kind: 'chroma', token: GAME_CONFIG.greenNodeCode,
    kicker: 'LEITOR CROMÁTICO', title: 'Um canal sobreviveu.',
    body: '<div class="node-chroma" aria-label="Canal verde isolado"><span>R</span><i></i><span>G</span><i class="is-live"></i><span>B</span><i></i></div><div class="node-symbol-sequence"><span>△</span><span>○</span><span>⌁</span></div><p>Leve a ordem das marcas para o lugar que ainda pertence à casa, mas não possui cobertura.</p>'
  },
  yard: {
    id: 'NÓ_17', kind: 'margin', token: GAME_CONFIG.yardNodeCode,
    kicker: 'AMOSTRA DE MARGEM', title: 'O limite também faz parte do arquivo.',
    body: '<div class="node-horizon"><i></i><span>ESTRUTURA</span><span>CÉU</span></div><p class="node-fragment">CALIBRAÇÃO PARCIAL // REPITA O EVENTO NOS DOIS CONTROLES.</p><p>O valor não está neste celular. Ele já apareceu no Arquivo.</p>'
  },
  room: {
    id: 'NÓ_00', kind: 'room', token: GAME_CONFIG.roomNodeCode,
    kicker: 'ÁUDIO LOCAL ENCONTRADO', title: 'Este NÓ já possui uma leitura.',
    body: '<dl class="node-impossible"><div><dt>LEITURA ATUAL</dt><dd>AGORA</dd></div><div><dt>ÚLTIMA LEITURA</dt><dd>03:17</dd></div><div><dt>ENTRADA CORRESPONDENTE</dt><dd>AUSENTE</dd></div></dl><button type="button" class="node-audio" data-node-audio><span>OUVIR AMOSTRA LOCAL</span><i></i></button><p data-audio-status>00:07 // room tone // origem não classificada</p>'
  },
  books: {
    id: 'NÓ_11', kind: 'storage', token: GAME_CONFIG.booksNodeCode,
    kicker: 'CABEÇALHO DE ÁUDIO', title: 'Histórias suspensas deixam sombra.',
    body: '<div class="node-wave" aria-hidden="true">▂▃▅▂▁▆▃▂▇▅▂▁▃▆▂</div><p>Fragmento reconhecido: “tão fácil se apaixonar…” O restante continua em outro canal.</p>'
  }
});

function render(record) {
  document.body.dataset.nodeKind = record.kind;
  root.className = `node-equipment node-equipment--${record.kind}`;
  root.innerHTML = `<header><span>RECUPERANDO NÓ EXTERNO</span><i data-node-progress>01 / 03</i></header><div class="node-equipment__boot" data-node-boot><span>PORTADORA ........ LOCAL</span><span>ASSINATURA ....... ${escapeHtml(record.id)}</span><span>INTEGRIDADE ...... VERIFICANDO</span></div><section data-node-content hidden><span class="node-equipment__kicker">${escapeHtml(record.kicker)}</span><h1>${escapeHtml(record.title)}</h1>${record.body}<div class="node-token"><span>ASSINATURA DE RETORNO</span><strong>${escapeHtml(record.token)}</strong></div><footer>VOLTE AO COMPUTADOR. ESTA LEITURA ALTERA A RECONSTRUÇÃO.</footer></section>`;
  window.setTimeout(() => {
    root.querySelector('[data-node-progress]').textContent = '03 / 03';
    root.querySelector('[data-node-boot]').hidden = true;
    root.querySelector('[data-node-content]').hidden = false;
    root.classList.add('is-recovered');
  }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 900);
}

function playRoomTone(button) {
  if (button.dataset.playing) return;
  button.dataset.playing = 'true';
  button.classList.add('is-playing');
  const status = document.querySelector('[data-audio-status]');
  if (status) status.textContent = 'REPRODUZINDO // 00:07';
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (AudioContext) {
    const context = new AudioContext();
    const gain = context.createGain();
    const hum = context.createOscillator();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 6.6);
    hum.type = 'sine'; hum.frequency.value = 47;
    hum.connect(gain).connect(context.destination); hum.start(); hum.stop(context.currentTime + 7);
    [2.4, 3.05, 5.2].forEach((offset) => {
      const click = context.createOscillator(); const clickGain = context.createGain();
      click.type = 'triangle'; click.frequency.value = 126;
      clickGain.gain.setValueAtTime(0.0001, context.currentTime + offset);
      clickGain.gain.linearRampToValueAtTime(0.06, context.currentTime + offset + 0.015);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + offset + 0.16);
      click.connect(clickGain).connect(context.destination); click.start(context.currentTime + offset); click.stop(context.currentTime + offset + 0.18);
    });
  }
  window.setTimeout(() => {
    button.classList.remove('is-playing'); delete button.dataset.playing;
    if (status) status.textContent = 'AMOSTRA ENCERRADA // TRÊS IMPACTOS // NENHUMA VOZ';
  }, 7000);
}

const record = nodes[nodeKey];
if (!record) {
  root.className = 'node-equipment node-equipment--error';
  root.innerHTML = '<p class="error">PORTADORA VÁLIDA // DESTINO DESCONHECIDO</p><p>Nenhuma leitura foi anexada.</p>';
} else {
  render(record);
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-node-audio]');
    if (button) playRoomTone(button);
  });
}
