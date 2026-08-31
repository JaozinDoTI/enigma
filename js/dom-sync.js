import { HINTS } from '../data/hints.js';
import { LOCATION_FRAGMENTS } from '../data/records.js';
import { clarityFor } from './puzzles/clarity.js';
import { evaluateRoom } from './room-model.js';
import { tvPresentation } from './tv.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgElement(name, attributes) {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

export function syncClarityStatus(id, state) {
  document.querySelectorAll('.puzzle-brief__status strong').forEach((status) => {
    status.textContent = clarityFor(id).status(state);
  });
}

export function syncTv(state) {
  const wrap = document.querySelector('[data-tv-mode]');
  if (!wrap) return;
  const mode = wrap.dataset.tvMode || 'normal';
  const view = tvPresentation(state, mode);
  const screen = wrap.querySelector('.tv-screen');
  wrap.classList.toggle('is-powered', state.tv.power);
  wrap.classList.toggle('is-unpowered', !state.tv.power);
  screen?.classList.toggle('is-off', !state.tv.power);
  screen?.classList.toggle('has-afterimage', mode === 'sequence' && !state.tv.power && state.flags.tvSequenceSeen);
  const number = wrap.querySelector('.tv-number');
  const channel = wrap.querySelector('.tv-channel');
  const frequency = wrap.querySelector('.tv-frequency');
  const signalLamp = wrap.querySelector('.tv-signal i');
  const signalLabel = wrap.querySelector('.tv-signal span');
  const powerLabel = wrap.querySelector('.tv-power span');
  if (number) number.textContent = `CAN ${String(state.tv.channel).padStart(2, '0')}`;
  if (channel) channel.textContent = view.content;
  if (frequency) frequency.textContent = `${view.frequency} MHz`;
  signalLamp?.classList.toggle('is-lit', state.tv.power);
  if (signalLabel) signalLabel.textContent = state.tv.power ? 'SINAL' : 'ESPERA';
  if (powerLabel) powerLabel.textContent = state.tv.power ? 'DESLIGAR' : 'LIGAR';
  wrap.querySelector('.tv-knob-control--channel .tv-knob')?.style.setProperty('--knob-angle', `${view.channelAngle}deg`);
  wrap.querySelector('.tv-knob-control--volume .tv-knob')?.style.setProperty('--knob-angle', `${view.volumeAngle}deg`);
  const channelOutput = wrap.querySelector('[data-tv-channel-output]');
  const volumeOutput = wrap.querySelector('[data-tv-volume-output]');
  if (channelOutput) channelOutput.textContent = String(state.tv.channel).padStart(2, '0');
  if (volumeOutput) volumeOutput.textContent = String(state.tv.volume).padStart(2, '0');
  syncClarityStatus(document.body.dataset.puzzle, state);
}

export function syncForensicSelection(button, state) {
  const selected = state.forensicSelections || [];
  button.classList.toggle('is-active', selected.includes(button.dataset.feature));
  button.setAttribute('aria-pressed', String(selected.includes(button.dataset.feature)));
  const model = document.querySelector('.forensic-model');
  model?.style.setProperty('--forensic-progress', String(selected.length / 6));
  const counter = document.querySelector('.forensic-status strong');
  if (counter) counter.textContent = `${selected.length} / 6`;
  syncClarityStatus('11', state);
}

export function syncFragmentPlacement(button, state, placed) {
  const destination = document.querySelector(placed ? '.fragment-target' : '.fragment-tray');
  if (!destination) return;
  destination.append(button);
  button.dataset.action = placed ? 'fragment-remove' : 'fragment';
  button.classList.toggle('is-placed', placed);
  button.classList.remove('is-selected');
  button.setAttribute('aria-pressed', String(placed));
  syncClarityStatus('15', state);
}

export function syncLocationSelection(button, state) {
  const selected = state.locationFragments || [];
  button.classList.toggle('is-selected', selected.includes(button.dataset.fragment));
  button.setAttribute('aria-pressed', String(selected.includes(button.dataset.fragment)));
  const map = document.querySelector('[data-location-map]');
  map?.style.setProperty('--location-progress', String(selected.length / LOCATION_FRAGMENTS.length));
  document.querySelectorAll('[data-location-point]').forEach((point) => {
    point.classList.toggle('is-active', selected.includes(point.dataset.locationPoint));
  });
  const points = [[28,34],[142,24],[226,72],[72,134],[178,144],[248,122]];
  const selectedPoints = selected.map((tag) => points[LOCATION_FRAGMENTS.findIndex(([candidate]) => candidate === tag)]).filter(Boolean);
  const group = document.querySelector('[data-location-connections]');
  if (group) group.replaceChildren(...selectedPoints.slice(1).map((point, index) => svgElement('path', {
    d: `M${selectedPoints[index][0]} ${selectedPoints[index][1]} L${point[0]} ${point[1]}`,
    pathLength: '1'
  })));
  const status = document.querySelector('[data-location-status]');
  if (status) status.textContent = `MEMÓRIA ESPACIAL: ${selected.length === LOCATION_FRAGMENTS.length ? 'CONTORNO RECUPERADO' : `${selected.length} / ${LOCATION_FRAGMENTS.length} FRAGMENTOS`}`;
  syncClarityStatus('18', state);
}

export function syncIdentityRelations(state) {
  const selection = state.relationSelection || [];
  const linked = state.relationLinks || [];
  document.querySelectorAll('.identity-board [data-record]').forEach((record) => {
    const isSelected = selection.includes(record.dataset.record);
    const isLinked = linked.includes(record.dataset.record);
    record.classList.toggle('is-selected', isSelected);
    record.classList.toggle('is-linked', isLinked);
    record.disabled = isLinked;
    record.setAttribute('aria-pressed', String(isSelected || isLinked));
  });
  const linkedPairs = Math.floor(linked.length / 2);
  const status = document.querySelector('.identity-link-status strong');
  if (status) status.textContent = `${linkedPairs} / 3`;
  const connections = document.querySelector('.identity-connections');
  if (connections) connections.replaceChildren(...Array.from({ length: linkedPairs }, (_, index) => svgElement('path', {
    d: `M42 ${25 + index * 50} C50 ${8 + index * 50} 50 ${42 + index * 50} 58 ${25 + index * 50}`,
    pathLength: '1'
  })));
  syncClarityStatus('19', state);
}

export function syncRoomState(state) {
  const evaluation = evaluateRoom(state);
  const score = document.querySelector('[data-room-score]');
  const count = document.querySelector('[data-room-relation-count]');
  if (score) score.textContent = `COMPATIBILIDADE DO QUARTO: ${evaluation.score}%`;
  if (count) count.textContent = `${evaluation.verifiedRelations.length} / ${evaluation.relations.length} RELAÇÕES VÁLIDAS`;
  document.querySelectorAll('[data-room-relation]').forEach((item) => {
    item.classList.toggle('is-valid', evaluation.verifiedRelations.some((relation) => relation.id === item.dataset.roomRelation));
  });
  const connections = document.querySelector('[data-room-relations]');
  if (connections) connections.replaceChildren(...evaluation.verifiedRelations.map((relation, index) => svgElement('path', {
    d: `M${12 + index * 12} 84 L${20 + index * 13} 18`,
    pathLength: '1',
    'data-relation': relation.id
  })));
  syncClarityStatus('20', state);
  return evaluation;
}

export function syncMetaSelection(state) {
  const selected = state.metaSelections || [];
  document.querySelectorAll('.meta-console [data-key]').forEach((item) => {
    const active = selected.includes(item.dataset.key);
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('[data-classification-threshold]').forEach((line) => {
    const processed = selected.length >= Number(line.dataset.classificationThreshold);
    line.classList.toggle('is-processed', processed);
    const value = line.querySelector('strong');
    if (value) value.textContent = processed ? 'INVÁLIDO' : 'AGUARDANDO';
  });
  const coherent = selected.join(',') === 'lua,tv,mullet';
  const result = document.querySelector('.relation-result strong');
  if (result) result.textContent = coherent ? 'RESÍDUO COERENTE' : 'NÃO RESOLVIDA';
  const residues = { lua: 'N', tv: 'O', mullet: 'S' };
  const residue = document.querySelector('[data-meta-residue]');
  if (residue) residue.textContent = `RESÍDUO: ${selected.map((key) => residues[key] || '·').join(' ') || '· · ·'}`;
  const answer = document.querySelector('[data-meta-answer]');
  answer?.classList.toggle('is-ready', coherent);
  if (answer) {
    answer.toggleAttribute('inert', !coherent);
    answer.setAttribute('aria-hidden', String(!coherent));
  }
  syncClarityStatus('24', state);
}

export function syncHintPanel(id, state) {
  const used = state.hintsUsed[id] || 0;
  document.querySelectorAll(`[data-hint-panel="${id}"]`).forEach((panel) => {
    panel.open = true;
    const message = panel.querySelector('[data-hint-message]');
    if (message) {
      message.textContent = HINTS[id]?.[used - 1] || 'O AUTOR SABERÁ QUE VOCÊ PEDIU.';
      message.classList.toggle('muted', !used);
    }
    const action = panel.querySelector('[data-action="hint"]');
    if (used >= 3 && action) {
      const limit = document.createElement('span');
      limit.className = 'warn';
      limit.textContent = 'LIMITE DE AJUDA ATINGIDO';
      action.replaceWith(limit);
    } else if (action) action.textContent = used ? 'aprofundar anomalia' : 'solicitar nível 1';
  });
}

export function syncMuteControls(muted) {
  document.querySelectorAll('[data-action="toggle-mute"]').forEach((button) => {
    button.textContent = muted ? 'SOM DESLIGADO' : 'SOM LIGADO';
  });
}
