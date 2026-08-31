import { GAME_CONFIG } from './config.js';
import { SYSTEM_LOGS, RECOVERED_FILES, LOCATION_FRAGMENTS } from '../data/records.js';
import { HAIR_CONFLICT, IDENTITY_RECORDS } from '../data/memories.js';
import { DOCUMENT_PARAGRAPHS, BOOK_FRAGMENTS, META_ITEMS } from '../data/puzzles.js';
import { renderTV } from './tv.js';
import { escapeHtml, formatDuration, daysSince } from './utils.js';
import { evaluateRoom } from './room-model.js';
import { clarityFor } from './puzzles/clarity.js';

const answerForm = (id, placeholderFallback = 'resposta necessária', buttonFallback = 'VERIFICAR') => {
  const contract = clarityFor(id);
  const label = contract.inputLabel || placeholderFallback;
  const placeholder = contract.placeholder || placeholderFallback;
  const button = contract.submitLabel || buttonFallback;
  return `<form class="answer-form" data-answer="${id}">
    <label class="answer-label" for="answer-${id}">${escapeHtml(label)}</label>
    <div class="answer-control"><input id="answer-${id}" class="answer-input" name="answer" autocomplete="off" placeholder="${escapeHtml(placeholder)}"><button class="primary-button" type="submit">${escapeHtml(button)}</button></div>
    ${contract.formatHint ? `<small class="answer-format">FORMATO // ${escapeHtml(contract.formatHint)}</small>` : ''}
  </form><div class="feedback" data-feedback aria-live="polite"></div>`;
};

const voiceMessage = (voice, label, text) => `<blockquote class="voice-message voice-message--${voice}"><span>${escapeHtml(label)}</span><p>${escapeHtml(text)}</p></blockquote>`;

const externalStep = (fact, humanText = '') => `<aside class="external-step" aria-label="Transição para o ambiente físico">
  <span>PRÓXIMA AÇÃO FORA DA TELA</span><strong>A RESPOSTA NÃO ESTÁ NESTA TELA</strong><p>${escapeHtml(fact)}</p>
  ${humanText ? voiceMessage('human', 'JOÃO', humanText) : ''}
</aside>`;

const yardNodeGate = (state) => {
  if (state.flags.yardNodeValidated) {
    return `${voiceMessage('system', 'SISTEMA', 'NÓ_17 AUTENTICADO // FRAGMENTO DE CALIBRAÇÃO VINCULADO')}${voiceMessage('human', 'JOÃO', 'Eu sabia que você ia voltar com isso.')}${renderTV(state, { mode: 'tuning' })}<div class="feedback" data-feedback></div>`;
  }
  return `<section class="external-auth" data-external-auth="yard">
    ${externalStep('A instrução aponta para o limite privado entre a casa e a área externa segura.', 'Tá. Agora você vai precisar sair daí.')}
    ${voiceMessage('system', 'SISTEMA', 'IDENTIFICAR NÓ DE LIMIAR // ÁREA PRIVADA // NÃO SAIR PARA A RUA')}
    ${voiceMessage('interference', 'INTERFERÊNCIA', '...ela já encontrou?')}
    <p class="external-auth__clue">O arquivo chama de limiar o lugar onde a casa termina sem deixar de ser sua. O NÓ preparado nesse ponto contém apenas uma parte da calibração.</p>
    <form class="answer-form" data-node-auth="yard">
      <label class="answer-label" for="node-yard">Código de retorno do NÓ_17</label>
      <div class="answer-control"><input id="node-yard" class="answer-input" name="token" autocomplete="off" placeholder="VX-LIMIAR-0000"><button class="primary-button" type="submit">AUTENTICAR NÓ</button></div>
      <small class="answer-format">VOLTE AO TERMINAL DEPOIS DE LER O FRAGMENTO DO NÓ.</small>
    </form><div class="feedback" data-feedback aria-live="polite"></div>
  </section>`;
};

function boot(state) {
  if (!state.completed.includes('01')) return `<section class="audio-init" data-audio-init><span>RECUPERACAO_1010</span><h1>${state.flags.initialized ? 'SEQUÊNCIA INTERROMPIDA' : 'SISTEMA INATIVO'}</h1><p>Nenhum canal de áudio será aberto antes da inicialização manual.</p><button type="button" class="audio-init__button" data-action="boot-fragment"><i aria-hidden="true"></i>${state.flags.initialized ? 'RETOMAR INICIALIZAÇÃO' : 'INICIALIZAR'}</button><small>AO CONTINUAR, O TERMINAL ATIVARÁ O EQUIPAMENTO DE RECUPERAÇÃO</small></section>`;
  return `<div class="terminal"><p class="terminal-line">NÓ DE RECUPERAÇÃO .... ATIVO</p><p class="terminal-line">INTEGRIDADE DO ARQUIVO  0%</p><p class="terminal-line">CANAL DE ÁUDIO .... ABERTO</p></div>`;
}

function logs(state) {
  return `<p class="system-message">Seis registros sobreviveram à interrupção. Um deles não compartilha o mesmo relógio.</p><div class="log-list">${SYSTEM_LOGS.map(([time,name,status]) => {
    const isEvent = name === 'EVENTO_1010';
    const indexed = isEvent && (state.flags.event1010Seen || state.completed.includes('02'));
    const action = isEvent ? (indexed ? 'open-archive-record' : 'open-event') : 'inspect-log';
    return `<button type="button" class="log-row text-button" data-action="${action}" ${indexed ? 'data-record="evento-1010"' : ''}><span>${time}</span><span ${isEvent ? 'data-anomaly' : ''}>${name}</span><span>${status}</span></button>`;
  }).join('')}</div><div class="feedback" data-feedback></div>`;
}

function documentScene() {
  const decorate = (paragraph, index) => index === 4 ? paragraph.replace('A DATA','<span class="document-invariant">A DATA</span>') : index === 5 ? paragraph.replace('ABRE','<span class="document-invariant">ABRE</span>') : index === 6 ? paragraph.replace('ARQUIVO','<span class="document-invariant">ARQUIVO</span>') : paragraph;
  const versionA = DOCUMENT_PARAGRAPHS.map(decorate).map((paragraph) => `<p>${paragraph}</p>`).join('');
  const versionB = DOCUMENT_PARAGRAPHS.map((paragraph) => paragraph
    .replace('418 fragmentos','416 fragmentos')
    .replace('quarenta e dois','trinta e nove')
    .replace('duas presenças','duas fontes de memória'))
    .map(decorate).map((paragraph) => `<p>${paragraph}</p>`).join('');
  return `<p class="muted">DUAS VERSÕES OCUPAM O MESMO BLOCO. DESLOQUE O LIMITE E LOCALIZE O CONTEÚDO INVARIANTE.</p>
    <section class="document-compare" data-document-compare style="--version-split:50%">
      <article class="long-document document-version document-version--a" aria-label="Versão A">${versionA}</article>
      <article class="long-document document-version document-version--b" aria-label="Versão B">${versionB}</article>
      <div class="document-scan" aria-hidden="true"></div>
    </section>
    <label class="version-control">VERSÃO A <input type="range" min="8" max="92" value="50" data-version-slider aria-label="Comparar versão A e versão B"> VERSÃO B <output data-version-output>50%</output></label>
    ${answerForm('06','interpretação do conteúdo invariável')}`;
}

function files() {
  return `<p class="muted">PROPRIETÁRIO DO DIRETÓRIO: J. Os nomes são definidos pelo usuário. Os metadados não.</p><div class="file-stack">${RECOVERED_FILES.map((file) => `<button type="button" class="file-row" data-action="open-file" data-file="${file.name}"><span>${file.name}</span><span>${file.modified}</span><span>${file.size}</span></button>`).join('')}</div><div class="system-message hidden" data-file-preview></div>`;
}

function binary() {
  const bits = '010011000101010101000001'.split('');
  return `<p>A LARGURA DO PACOTE foi preservada mesmo depois que seus cabeçalhos desapareceram.</p><div class="binary-board" aria-label="24 bits agrupados visualmente de oito em oito">${bits.map((bit) => `<span class="bit">${bit}</span>`).join('')}</div>${answerForm('08','objeto recuperado')}`;
}

function conflict(state) {
  const selected = state.forensicSelections || [];
  const features = [['volume','VOLUME'],['sides','LATERAIS'],['length','COMPRIMENTO'],['silhouette','SILHUETA'],['report','RELATO'],['conflict','INCONSISTÊNCIAS']];
  return `<div class="forensic-layout" data-forensic>
    <svg class="forensic-thread-map" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true"><path d="M220 248 C410 170 566 122 742 106"></path><path d="M220 258 C428 314 612 390 846 366"></path><circle cx="220" cy="253" r="7"></circle><circle cx="742" cy="106" r="6"></circle><circle cx="846" cy="366" r="6"></circle></svg>
    <div class="forensic-model" style="--forensic-progress:${selected.length / features.length}">
      <svg viewBox="0 0 240 260" role="img" aria-label="Reconstrução vetorial de uma silhueta de cabelo">
        <path class="forensic-scan" d="M30 32 H210"></path>
        <path class="forensic-head" pathLength="1" d="M74 116 C68 52 172 42 176 116 C178 163 155 199 122 203 C88 198 69 161 74 116Z"></path>
        <path class="forensic-hair" pathLength="1" d="M72 112 C58 50 183 35 184 114 L175 174 L155 151 L149 220 L114 196 L88 170Z"></path>
      </svg>
      <div class="forensic-status">CAMADAS RECONSTRUÍDAS <strong>${selected.length} / ${features.length}</strong></div>
    </div>
    <div><div class="relation-board"><article class="evidence-sheet evidence-sheet--a"><span class="evidence-sheet__stamp">ENTIDADE A / confiança 99,4%</span><i aria-hidden="true"></i>${HAIR_CONFLICT.entityA.map((line) => `<p>+ ${line}</p>`).join('')}<small>FONTE: REGISTRO PRIMÁRIO // 10.10</small></article><article class="evidence-sheet evidence-sheet--b"><span class="evidence-sheet__stamp">ENTIDADE B / autodeclarado</span><i aria-hidden="true"></i>${HAIR_CONFLICT.entityB.map((line) => `<p>− ${line}</p>`).join('')}<small>ASSINATURA: VX-02 // PARCIAL</small></article></div>
      <div class="forensic-features">${features.map(([key,label]) => `<button type="button" class="meta-key ${selected.includes(key) ? 'is-active' : ''}" data-action="forensic-feature" data-feature="${key}" aria-pressed="${selected.includes(key)}">${label}</button>`).join('')}</div>
      <button type="button" class="primary-button" data-action="ack-conflict">CALCULAR GEOMETRIA</button><div class="feedback" data-feedback></div>
    </div>
  </div>`;
}

function books() {
  return `${externalStep('Fato registrado: imagem residual 02 · 05 · 01.')}<p>O receptor transmitiu três índices. Nenhum arquivo digital possui essa quantidade de posições estáveis.</p><div class="sequence-list">${GAME_CONFIG.bookPositions.map((position) => `<span class="sequence-chip">${String(position).padStart(2,'0')}</span>`).join('')}</div><p class="muted">ORDEM: esquerda → direita. ALTURA DE REFERÊNCIA: acima do restante. Há três partes da soma de verificação junto aos fragmentos.</p>${answerForm('14','soma de verificação dos fragmentos')}`;
}

function fragments(state) {
  const selected = state.fragments || [];
  const piece = (fragment, placed) => `<button type="button" class="fragment ${placed ? 'is-placed' : ''}" data-action="${placed ? 'fragment-remove' : 'fragment'}" data-fragment="${escapeHtml(fragment)}" aria-pressed="${placed}">${escapeHtml(fragment)}</button>`;
  return `<p>Quatro partes compartilham papel, pressão e idade. Restaure a sintaxe.</p><div class="fragment-tray" aria-label="Fragmentos disponíveis">${BOOK_FRAGMENTS.filter((fragment) => !selected.includes(fragment)).map((fragment) => piece(fragment, false)).join('')}</div><div class="fragment-target" aria-label="Área de montagem">${selected.map((fragment) => piece(fragment, true)).join('')}</div><button type="button" class="primary-button" data-action="check-fragments">VERIFICAR SINTAXE</button><div class="feedback" data-feedback></div>`;
}

function identity(state) {
  const selected = state.relationSelection || [];
  const linked = state.relationLinks || [];
  const linkedPairs = Math.floor(linked.length / 2);
  return `<p>O sistema não pede respostas. Ele pede vínculos. Selecione dois registros que descrevem a mesma lembrança.</p><div class="identity-link-status">MEMÓRIAS COMPARTILHADAS <strong>${linkedPairs} / 3</strong></div><div class="relation-board identity-board" data-relations>
    <svg class="identity-connections" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true">${Array.from({ length: linkedPairs }, (_, index) => `<path d="M42 ${25 + index * 50} C50 ${8 + index * 50} 50 ${42 + index * 50} 58 ${25 + index * 50}" pathLength="1"></path>`).join('')}</svg>
    ${IDENTITY_RECORDS.map((record) => `<button type="button" class="record-chip ${selected.includes(record.id) ? 'is-selected' : ''} ${linked.includes(record.id) ? 'is-linked' : ''}" data-action="relation" data-record="${record.id}" data-pair="${record.pair}" aria-pressed="${selected.includes(record.id) || linked.includes(record.id)}" ${linked.includes(record.id) ? 'disabled' : ''}>${record.label}</button>`).join('')}</div><div class="feedback" data-feedback></div>`;
}

function locationScene(state) {
  const selected = state.locationFragments || [];
  const points = [[28,34],[142,24],[226,72],[72,134],[178,144],[248,122]];
  const selectedPoints = selected.map((tag) => points[LOCATION_FRAGMENTS.findIndex(([candidate]) => candidate === tag)]).filter(Boolean);
  const connections = selectedPoints.slice(1).map((to, index) => {
    const from = selectedPoints[index];
    return `<path d="M${from[0]} ${from[1]} L${to[0]} ${to[1]}" pathLength="1"></path>`;
  }).join('');
  return `<p>Os dados espaciais não conseguem nomear o local. Reconstrua-o pela coexistência.</p>
    <div class="spatial-reconstruction" data-location-map style="--location-progress:${selected.length / LOCATION_FRAGMENTS.length}">
      <svg viewBox="0 0 280 170" role="img" aria-label="Mapa abstrato formado pelas relações selecionadas">
        <path class="spatial-contour" d="M20 82 C54 20 136 8 202 30 C252 48 274 90 244 140 C198 164 91 162 34 129Z" pathLength="1"></path>
        <g data-location-connections>${connections}</g>
        ${points.map(([x,y], index) => `<circle cx="${x}" cy="${y}" r="4" data-location-point="${escapeHtml(LOCATION_FRAGMENTS[index][0])}" class="${selected.includes(LOCATION_FRAGMENTS[index][0]) ? 'is-active' : ''}"></circle>`).join('')}
      </svg>
      <div class="spatial-fragments">${LOCATION_FRAGMENTS.map(([tag,text], index)=>`<button type="button" class="evidence-slip spatial-fragment ${selected.includes(tag) ? 'is-selected' : ''}" data-action="location-fragment" data-fragment="${escapeHtml(tag)}" aria-pressed="${selected.includes(tag)}" style="--slip-index:${index}"><span>${tag}</span><strong>${text}</strong><small>REF ${String(index + 1).padStart(2, '0')} // 10:10</small></button>`).join('')}</div>
      <div class="system-message" data-location-status>MEMÓRIA ESPACIAL: ${selected.length === LOCATION_FRAGMENTS.length ? 'CONTORNO RECUPERADO' : `${selected.length} / ${LOCATION_FRAGMENTS.length} FRAGMENTOS`}</div>
    </div>${answerForm('18','local recuperado')}`;
}

function room(state) {
  const positions = state.room || {};
  const evaluation = evaluateRoom(state);
  const objects = [
    ['bed','CAMA','generic'],['shelf','ESTANTE','wood'],['desk','ESCRIVANINHA','wood'],['bedside','MESA LATERAL','wood'],['moon','LUA','paper'],['tv','TV','device']
  ];
  const renderedObjects = objects.map(([key,label,material],index) => {
    const position = positions[key] || { x: 4 + (index * 14), y: 84, moved:false };
    return `<button type="button" class="room-object ${position.moved && key !== 'tv' ? 'is-verified' : ''}" data-action="room-object" data-object="${key}" data-material="${material}" style="left:${position.x}%;top:${position.y}%">${label}<span data-room-object-state ${position.moved && key !== 'tv' ? '' : 'hidden'}>VERIFICADO</span></button>`;
  }).join('');
  return `<p>Reconstrua relações aproximadas do ambiente observado. O sistema não exige coordenadas exatas.</p>
    <div class="room-analysis"><strong data-room-score>COMPATIBILIDADE DO QUARTO: ${evaluation.score}%</strong><span data-room-relation-count>${evaluation.verifiedRelations.length} / ${evaluation.relations.length} RELAÇÕES VÁLIDAS</span></div>
    <div class="room-grid" data-room><svg class="room-relations" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><g data-room-relations>${evaluation.verifiedRelations.map((relation,index) => `<path d="M${12 + index * 12} 84 L${20 + index * 13} 18" pathLength="1" data-relation="${relation.id}"></path>`).join('')}</g></svg>${renderedObjects}</div>
    <ul class="room-relation-list">${evaluation.relations.map((relation) => `<li data-room-relation="${relation.id}" class="${evaluation.verifiedRelations.includes(relation) ? 'is-valid' : ''}">${relation.label}</li>`).join('')}</ul>
    <button type="button" class="primary-button" data-action="validate-room">VALIDAR MODELO</button><div class="feedback" data-feedback></div>`;
}

function meta(state) {
  const selected = state.metaSelections || [];
  const residues = { lua:'N', tv:'O', mullet:'S' };
  const classifications = [['AMIGO',1],['CONTATO',2],['FONTE DE MEMÓRIA',3],['DEPENDÊNCIA',3]];
  const coherent = selected.join(',') === 'lua,tv,mullet';
  return `<div class="terminal"><p class="terminal-line" data-kind="system">RECUPERAÇÃO CONCLUÍDA</p><div class="fake-progress"><span></span></div><p class="terminal-line error">INTEGRIDADE: 99%</p><p class="terminal-line">1 RELAÇÃO NÃO RESOLVIDA</p></div><p>Três índices órfãos sobreviveram desde a inicialização: <strong>VX-04 / VX-11 / VX-02</strong>. Reconecte os registros que os carregaram, nessa ordem.</p>
    <div class="merge-classifier" data-merge-classifier><div class="classification-log">${classifications.map(([label,threshold]) => `<p data-classification-threshold="${threshold}" class="${selected.length >= threshold ? 'is-processed' : ''}">${label}<strong>${selected.length >= threshold ? 'INVÁLIDO' : 'AGUARDANDO'}</strong></p>`).join('')}<p class="relation-result">RELAÇÃO<strong>${coherent ? 'RESÍDUO COERENTE' : 'NÃO RESOLVIDA'}</strong></p></div>
    <div class="meta-console">${META_ITEMS.map((item) => `<button type="button" class="meta-key ${selected.includes(item.key) ? 'is-active' : ''}" data-action="meta-item" data-key="${item.key}" aria-pressed="${selected.includes(item.key)}"><span>${item.label}</span><strong>${item.value}</strong></button>`).join('')}</div></div>
    <div class="system-message" data-meta-residue>RESÍDUO: ${selected.map((key) => residues[key] || '·').join(' ') || '· · ·'}</div><div class="meta-answer-slot ${coherent ? 'is-ready' : ''}" data-meta-answer ${coherent ? '' : 'inert'} aria-hidden="${!coherent}">${answerForm('24','significado da relação')}</div>`;
}

function finalScene(state) {
  const elapsed = formatDuration(Date.now() - (state.startedAt || Date.now()));
  const counter = daysSince(GAME_CONFIG.importantDate);
  return `<section class="final-stage"><div class="date">EVENTO INICIAL · 10.10.2025</div><p class="final-salutation">Bom dia, princesa.</p><h1>nós.</h1><p>ENTIDADE A: ${escapeHtml(GAME_CONFIG.protagonistName)}<br>ENTIDADE B: ${escapeHtml(GAME_CONFIG.playerName)}<br>ESTADO: ATIVO</p><div class="counter"><div><strong data-counter="days">${counter.days}</strong><span>dias</span></div><div><strong data-counter="hours">${counter.hours}</strong><span>horas</span></div><div><strong data-counter="minutes">${counter.minutes}</strong><span>minutos</span></div><div><strong data-counter="seconds">${counter.seconds}</strong><span>segundos</span></div></div><p class="final-message">${escapeHtml(GAME_CONFIG.finalMessage)}</p><button type="button" class="primary-button" data-action="play-final-music">${GAME_CONFIG.musicUrl ? 'TOCAR MÚSICA RECUPERADA' : 'TOCAR SINAL RECUPERADO'}</button>${GAME_CONFIG.finalVideoUrl ? `<p><a class="primary-button" href="${escapeHtml(GAME_CONFIG.finalVideoUrl)}" target="_blank" rel="noopener">ABRIR VÍDEO RECUPERADO</a></p>` : ''}${GAME_CONFIG.finalSecretUrl ? `<p><a class="text-button" href="${escapeHtml(GAME_CONFIG.finalSecretUrl)}" target="_blank" rel="noopener">registro externo</a></p>` : ''}<div class="final-gallery">${GAME_CONFIG.gallery.length ? GAME_CONFIG.gallery.map((src) => `<img src="${escapeHtml(src)}" alt="Memória recuperada">`).join('') : '<div class="final-placeholder">FOTO_01</div><div class="final-placeholder">FOTO_02</div><div class="final-placeholder">LINK_DO_VÍDEO</div>'}</div><div class="stats-table"><div class="stats-row"><span>TEMPO TOTAL</span><strong data-total-elapsed>${elapsed}</strong></div><div class="stats-row"><span>TENTATIVAS INCORRETAS</span><strong>${state.stats.wrongAnswers}</strong></div><div class="stats-row"><span>NÍVEIS DE DICA USADOS</span><strong>${Object.values(state.hintsUsed).reduce((a,b)=>a+b,0)}</strong></div><div class="stats-row"><span>INTERAÇÕES COM A TV</span><strong>${state.stats.tvInteractions}</strong></div><div class="stats-row"><span>VEZES QUE ELA CULPOU JOÃO</span><strong>17*</strong></div><p class="muted">* dado completamente inventado pelo sistema</p></div></section>`;
}

export function updateFinalMetrics(state) {
  const counter = daysSince(GAME_CONFIG.importantDate);
  Object.entries(counter).forEach(([unit, value]) => {
    const target = document.querySelector(`[data-counter="${unit}"]`);
    if (target) target.textContent = value;
  });
  const elapsed = document.querySelector('[data-total-elapsed]');
  if (elapsed) elapsed.textContent = formatDuration(Date.now() - (state.startedAt || Date.now()));
}

export function renderScene(puzzle, state) {
  switch (puzzle.kind) {
    case 'boot': return boot(state);
    case 'logs': return logs(state);
    case 'tv-intro': return renderTV(state, { mode: state.unlocked.includes('13') ? 'sequence' : 'intro' });
    case 'morse': return `<div class="receiver-puzzle receiver-puzzle--morse">${renderTV(state,{mode:'morse'})}<div class="receiver-puzzle__answer">${answerForm('04','interpretação do sinal')}</div></div>`;
    case 'desk-node': return `${externalStep('Fato registrado: a PORTADORA 04 foi interpretada como MESA.', 'Antes que você reclame: sim, eu escondi coisa pela casa.')}<div class="terminal"><p class="terminal-line">proximidade do NÓ_02: não resolvida</p><p class="terminal-line">limite do navegador: atravessado</p></div>${state.flags.deskNodeScanned ? '<p class="good">NÓ EXTERNO DETECTADO. BUFFER DE CÓDIGO ABERTO.</p>' : '<p class="muted">Aguardando nó externo…</p>'}${answerForm('05','código do nó')}`;
    case 'document': return documentScene();
    case 'files': return files();
    case 'binary': return binary();
    case 'moon-one': return `${externalStep('Fato registrado: o pacote de 24 bits identificou o objeto LUA.')}<div class="terminal"><p class="terminal-line">OBJETO: L_U_A</p><p class="terminal-line">localização: fora do arquivo</p><p class="terminal-line">estado do observador: presente</p></div><p>A primeira camada contém um registro curto.</p>${answerForm('09','código do fragmento físico')}`;
    case 'return-event': return (state.archive?.reads?.['evento-1010'] || 0) >= 2
      ? `<div class="terminal"><p class="terminal-line">DIVERGÊNCIA LIDA</p><p class="terminal-line">3 linhas adicionadas após a indexação</p><p class="terminal-line">duas fontes presentes no mesmo evento</p></div>${voiceMessage('interference', 'INTERFERÊNCIA', '...ela já encontrou?')}<button type="button" class="primary-button" data-action="resolve-event-revision">PROCESSAR DIVERGÊNCIA</button><div class="feedback" data-feedback></div>`
      : `<div class="terminal"><p class="terminal-line error">SOMA DE VERIFICAÇÃO DIVERGENTE</p><p class="terminal-line">um registro previamente indexado não corresponde mais à última leitura</p><p class="terminal-line faint">AÇÃO REQUERIDA // localize no ARQUIVO o registro alterado</p></div><div class="feedback" data-feedback></div>`;
    case 'conflict': return conflict(state);
    case 'mullet': return `<p>A geometria possui um identificador comum. Resolva o conflito sem confiar na ENTIDADE B.</p>${answerForm('12','identificador da memória')}`;
    case 'tv-sequence': return renderTV(state, { mode: 'sequence' });
    case 'books': return books();
    case 'fragments': return fragments(state);
    case 'bedside': return `${externalStep('Instrução registrada: ONDE A NOITE DEIXA O QUE VOCÊ PRECISA.', 'Você tá complicando. Não é a cama.')}<div class="clue-grid"><div class="clue-card"><span class="clue-card__tag">falso positivo</span><p>superfície onde o dia termina</p></div><div class="clue-card"><span class="clue-card__tag">proximidade</span><p>ao alcance antes de dormir</p></div></div>${answerForm('16','código do fragmento físico')}`;
    case 'tv-tuning': return yardNodeGate(state);
    case 'location': return locationScene(state);
    case 'identity': return identity(state);
    case 'room': return room(state);
    case 'impossible': return state.flags.fakeFinalSeen ? `<div class="terminal glitch-once"><p class="terminal-line error">INTEGRIDADE: 99%</p><p class="terminal-line">1 RELAÇÃO NÃO RESOLVIDA</p><p class="terminal-line">OBJETO PERTENCE AO SISTEMA</p><p class="terminal-line">CANAL EXTERNO RESTAURADO</p></div><button type="button" class="primary-button" data-action="continue-after-fake">VOLTAR AO ARQUIVO</button>` : `<section class="final-stage false-final"><div class="date">RECUPERAÇÃO CONCLUÍDA</div><p class="faint">OBJETO NÃO PERTENCE À MEMÓRIA<br>OBJETO PERTENCE AO SISTEMA</p><h1>arquivo restaurado.</h1><p>Eu achei que lembrar seria a parte difícil. Era só encontrar o caminho de volta.</p><div class="fake-progress"><span></span></div><button type="button" class="primary-button" data-action="fake-end">ENCERRAR SISTEMA</button></section>`;
    case 'books-node': return `${externalStep('Fato registrado: o canal externo aponta para baixo de onde as histórias ficam.', 'Eu sabia que você ia olhar nos livros primeiro.')}<p class="muted">O nó pode já ter sido detectado. Agora há contexto suficiente.</p>${state.flags.booksNodeScanned ? '<p class="good">NÓ_11 DETECTADO.</p>' : ''}<div class="system-message">CABEÇALHO DE ÁUDIO PARCIAL: “TÃO FÁCIL SE APAIXONAR…”</div>${answerForm('22','código do nó')}`;
    case 'moon-two': return `${externalStep('Referência registrada: OBSERVADOR / LUA · primeira camada já recuperada.', 'Você já passou por isso antes. Só não desse jeito.')}<div class="terminal"><p class="terminal-line">O OBSERVADOR GUARDOU OS DOIS LADOS</p><p class="terminal-line">a primeira visita recuperou apenas uma camada</p><p class="terminal-line">ela permaneceu atrás de você</p></div>${answerForm('23','segundo fragmento físico')}`;
    case 'meta': return meta(state);
    case 'final': return finalScene(state);
    default: return '<p>TIPO DE REGISTRO DESCONHECIDO</p>';
  }
}
