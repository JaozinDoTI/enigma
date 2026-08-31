import { escapeHtml } from './utils.js';

export function tvPresentation(state, mode = 'normal') {
  const tv = state.tv;
  let content = 'SEM SINAL';
  if (!tv.power) content = '';
  if (mode === 'intro' && tv.channel === 4) content = '•  —  ••';
  if (mode === 'sequence' && tv.channel === 11 && tv.power) content = 'SEM PORTADORA';
  if (mode === 'sequence' && tv.channel === 11 && !tv.power && state.flags.tvSequenceSeen) content = '2  5  1';
  if (mode === 'tuning' && tv.channel === 10 && tv.volume === 10) content = '10 / 10';
  if (mode === 'impossible') content = 'CANAL\nEXTERNO';
  return {
    content,
    frequency: (184 + tv.channel * .04).toFixed(2),
    channelAngle: -135 + ((tv.channel - 1) / 11) * 270,
    volumeAngle: -135 + (tv.volume / 10) * 270
  };
}

export function renderTV(state, { mode = 'normal' } = {}) {
  const tv = state.tv;
  const presentation = tvPresentation(state, mode);

  return `<div class="tv-wrap ${tv.power ? 'is-powered' : 'is-unpowered'}" data-tv-mode="${escapeHtml(mode)}">
    <div class="tv-cabinet" data-motion-scope="device">
      <div class="tv-cabinet__handle" aria-hidden="true"></div>
      <section class="tv-frame" aria-label="Tela do receptor VX-11">
        <div class="tv-glass">
          <div class="tv-screen ${tv.power ? '' : 'is-off'} ${mode === 'sequence' && !tv.power && state.flags.tvSequenceSeen ? 'has-afterimage' : ''}">
            <div class="tv-static" aria-hidden="true"></div>
            <span class="tv-number">CAN ${String(tv.channel).padStart(2, '0')}</span>
            <div class="tv-channel">${escapeHtml(presentation.content)}</div>
            <span class="tv-frequency">${presentation.frequency} MHz</span>
          </div>
        </div>
      </section>
      <aside class="tv-controls" aria-label="Controles físicos do receptor">
        <div class="tv-brand"><strong>VX</strong><span>RECEPTOR 11</span></div>
        <div class="tv-signal"><i class="${tv.power ? 'is-lit' : ''}"></i><span>${tv.power ? 'SINAL' : 'ESPERA'}</span></div>
        <div class="tv-knob-control tv-knob-control--channel is-primary" data-motion-scope="local">
          <div class="tv-control-heading"><label>CANAL</label><span>CONTROLE PRIMÁRIO</span></div>
          <div class="tv-knob-row">
            <button type="button" data-action="tv-channel" data-delta="-1" aria-label="Canal anterior"><i aria-hidden="true">−</i></button>
            <span class="tv-knob" style="--knob-angle:${presentation.channelAngle}deg" aria-hidden="true"><i></i></span>
            <button type="button" data-action="tv-channel" data-delta="1" aria-label="Próximo canal"><i aria-hidden="true">+</i></button>
          </div>
          <output><span>CAN</span><b data-tv-channel-output>${String(tv.channel).padStart(2, '0')}</b></output>
          <small>PERCORRER TRANSMISSÕES</small>
        </div>
        <div class="tv-knob-control tv-knob-control--volume ${mode === 'tuning' ? 'is-primary' : 'is-secondary'}" data-motion-scope="local">
          <div class="tv-control-heading"><label>VOLUME</label><span>${mode === 'tuning' ? 'CONTROLE REQUERIDO' : 'SAÍDA SECUNDÁRIA'}</span></div>
          <div class="tv-knob-row">
            <button type="button" data-action="tv-volume" data-delta="-1" aria-label="Diminuir volume"><i aria-hidden="true">−</i></button>
            <span class="tv-knob" style="--knob-angle:${presentation.volumeAngle}deg" aria-hidden="true"><i></i></span>
            <button type="button" data-action="tv-volume" data-delta="1" aria-label="Aumentar volume"><i aria-hidden="true">+</i></button>
          </div>
          <output><span>NÍVEL</span><b data-tv-volume-output>${String(tv.volume).padStart(2, '0')}</b></output>
          <small>${mode === 'tuning' ? 'AJUSTAR PARÂMETRO RECORRENTE' : 'NÃO ALTERA A SINTONIA'}</small>
        </div>
        <div class="tv-trim" aria-hidden="true"><span><i></i>AJUSTE FINO</span><span><i></i>SINC. V</span></div>
        <button type="button" class="tv-power" data-action="tv-power"><i aria-hidden="true"></i><span>${tv.power ? 'DESLIGAR' : 'LIGAR'}</span></button>
        <div class="tv-speaker" aria-label="Grade do alto-falante"></div>
        ${mode === 'morse' ? '<button type="button" class="tv-read-signal" data-action="play-morse">LER SINAL</button><div class="morse-lamp" aria-label="Luz de sinal"></div><div class="signal-trace" aria-live="polite"></div>' : ''}
      </aside>
      <div class="tv-technical-plate"><span>FAB. 10·10</span><span>SÉRIE 04-11-02</span><span>CUIDADO / ALTA TENSÃO</span></div>
    </div>
  </div>`;
}
