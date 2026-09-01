import { GAME_CONFIG } from './config.js';
import { RECOVERED_FILES, LOCATION_FRAGMENTS } from '../data/records.js';
import { HAIR_CONFLICT, IDENTITY_RECORDS } from '../data/memories.js';
import { DOCUMENT_COMPARISON_ROWS } from '../data/puzzles.js';
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

const externalStep = (fact, humanText = '', humanLabel = 'AUTOR NÃO IDENTIFICADO') => `<aside class="external-step" aria-label="Transição para o ambiente físico">
  <span>PRÓXIMA AÇÃO FORA DA TELA</span><strong>A RESPOSTA NÃO ESTÁ NESTA TELA</strong><p>${escapeHtml(fact)}</p>
  ${humanText ? voiceMessage('human', humanLabel, humanText) : ''}
</aside>`;

const greenNodeGate = (state) => {
  if (state.flags.greenNodeValidated) {
    return `${voiceMessage('system', 'SISTEMA', 'NÓ_14 AUTENTICADO // CROMA VERDE VINCULADO')}${voiceMessage('human', 'J.', 'Sim. Eu realmente fiz você ir até as cadeiras por causa disso.')}${renderTV(state, { mode: 'tuning' })}<div class="feedback" data-feedback></div>`;
  }
  return `<section class="external-auth" data-external-auth="green">
    ${externalStep('A imagem residual preservou 03 · 01 · 04. O Arquivo conhece ASSENTO, EXTERNO e um único canal cromático.', 'Tá. Agora você vai precisar sair daí.', 'J.')}
    ${voiceMessage('system', 'SISTEMA', 'FONTE 14 // ASSENTO EXTERNO // CROMA PRESERVADO: VERDE')}
    ${voiceMessage('interference', 'INTERFERÊNCIA', '...ela já encontrou?')}
    <p class="external-auth__clue">Use a sequência como posições. Conte as cadeiras a partir da esquerda; a leitura 03 → 01 → 04 identifica a orientação marcada. Somente uma delas guarda o NÓ.</p>
    <form class="answer-form" data-node-auth="green">
      <label class="answer-label" for="node-green">Assinatura de retorno da fonte verde</label>
      <div class="answer-control"><input id="node-green" class="answer-input" name="token" autocomplete="off" placeholder="VX-VERDE-0000"><button class="primary-button" type="submit">VINCULAR FONTE</button></div>
      <small class="answer-format">PROCURE APENAS NAS CADEIRAS PREPARADAS, SEM DESMONTAR NADA.</small>
    </form><div class="feedback" data-feedback aria-live="polite"></div>
  </section>`;
};

const yardNodeGate = (state) => `<section class="external-auth external-auth--yard" data-external-auth="yard">
  ${externalStep('O NÓ verde reteve três marcas e uma relação: depois do assento, o limite continua sob céu aberto.', '', 'J.')}
  ${voiceMessage('system', 'SISTEMA', 'FONTE 17 // COBERTURA AUSENTE // LIMITE PRIVADO // ESTRUTURA ENCERRADA')}
  <div class="yard-symbols" aria-label="Sequência de símbolos recuperada"><span>△</span><span>○</span><span>⌁</span></div>
  <p class="external-auth__clue">As mesmas três marcas foram preparadas no quintal. Leia na ordem exibida; a última marca completa conduz ao NÓ, sem depender de luz, clima ou horário.</p>
  <form class="answer-form" data-node-auth="yard">
    <label class="answer-label" for="node-yard">Assinatura encontrada na margem</label>
    <div class="answer-control"><input id="node-yard" class="answer-input" name="token" autocomplete="off" placeholder="VX-MARGEM-0000"><button class="primary-button" type="submit">AUTENTICAR MARGEM</button></div>
    <small class="answer-format">ÁREA PRIVADA E SEGURA // NÃO SAIR PARA A RUA.</small>
  </form><div class="feedback" data-feedback aria-live="polite"></div>
</section>`;

function documentScene(state) {
  const selected = state.documentFragments || [];
  const order = ['A DATA', 'ABRE', 'O ARQUIVO'];
  const rows = DOCUMENT_COMPARISON_ROWS.map((row, index) => {
    const isSelected = row.token && selected.includes(row.token);
    return `<button type="button" class="document-compare__row${isSelected ? ' is-selected' : ''}" data-action="document-row" data-row="${row.id}" ${row.token ? `data-token="${escapeHtml(row.token)}"` : ''} aria-pressed="${Boolean(isSelected)}" aria-label="Linha ${index + 1}. Versão A: ${escapeHtml(row.versionA)}. Versão B: ${escapeHtml(row.versionB)}.">
      <span class="document-compare__ref">${String(index + 1).padStart(2, '0')}</span>
      <span class="document-compare__cell" data-version="A">${escapeHtml(row.versionA)}</span>
      <span class="document-compare__cell" data-version="B">${escapeHtml(row.versionB)}</span>
    </button>`;
  }).join('');
  const slots = order.map((token, index) => `<span class="document-extraction__slot${selected.includes(token) ? ' is-filled' : ''}" data-document-slot="${escapeHtml(token)}"><small>0${index + 1}</small>${selected.includes(token) ? escapeHtml(token) : 'TRECHO AUSENTE'}</span>`).join('');
  return `<section class="document-puzzle">
    <header class="document-puzzle__intro"><span>RELATÓRIO ALTERADO // COMPARAÇÃO LOCAL</span><p>O invasor deixou duas cópias. Toque apenas nas linhas que permaneceram idênticas.</p></header>
    <div class="document-compare" data-document-compare role="group" aria-label="Comparação entre as versões A e B">
      <div class="document-compare__head" aria-hidden="true"><span>REF</span><strong>VERSÃO A</strong><strong>VERSÃO B</strong></div>
      ${rows}
    </div>
    <footer class="document-extraction">
      <div class="document-extraction__result"><span>CONTEÚDO INVARIANTE <strong data-document-count>${selected.length} / 3</strong></span><div class="document-extraction__slots">${slots}</div></div>
      <button type="button" class="primary-button document-extraction__commit" data-action="commit-document" ${selected.length === order.length ? '' : 'disabled'}>EXTRAIR INSTRUÇÃO</button>
    </footer>
    <div class="feedback document-puzzle__feedback" data-feedback data-document-status aria-live="polite">${selected.length === order.length ? 'INSTRUÇÃO RECONSTRUÍDA // PRONTA PARA EXTRAÇÃO' : 'COMPARE O MESMO ÍNDICE NAS DUAS VERSÕES'}</div>
  </section>`;
}

function files() {
  return `<p class="muted">PROPRIETÁRIO DO DIRETÓRIO: J. O nome de um arquivo pode ser uma isca. A hora em que ele foi tocado deixa rastro.</p>${voiceMessage('human', 'J.', 'Eu nunca soube dar nome pra arquivo. Dessa vez isso ajuda.') }<div class="file-stack">${RECOVERED_FILES.map((file) => `<button type="button" class="file-row" data-action="open-file" data-file="${file.name}"><span>${file.name}</span><span>${file.modified}</span><span>${file.size}</span></button>`).join('')}</div><div class="system-message hidden" data-file-preview></div>`;
}

function binary() {
  const bits = '010011000101010101000001'.split('');
  return `<p>Alguém apagou o cabeçalho, mas deixou os 24 bits separados em três blocos legíveis.</p><div class="binary-board" aria-label="24 bits agrupados visualmente de oito em oito">${bits.map((bit) => `<span class="bit">${bit}</span>`).join('')}</div>${answerForm('08','objeto recuperado')}`;
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
    <div><div class="relation-board"><article class="evidence-sheet evidence-sheet--a"><span class="evidence-sheet__stamp">ENTIDADE A / confiança 99,4%</span><i aria-hidden="true"></i>${HAIR_CONFLICT.entityA.map((line) => `<p>+ ${line}</p>`).join('')}<small>FONTE: REGISTRO PRIMÁRIO // 10.10</small></article><article class="evidence-sheet evidence-sheet--b"><span class="evidence-sheet__stamp">ENTIDADE B / autodeclarado</span><i aria-hidden="true"></i>${HAIR_CONFLICT.entityB.map((line) => `<p>− ${line}</p>`).join('')}<small>ASSINATURA: FONTE B // PARCIAL</small></article></div>
      <div class="forensic-features">${features.map(([key,label]) => `<button type="button" class="meta-key ${selected.includes(key) ? 'is-active' : ''}" data-action="forensic-feature" data-feature="${key}" aria-pressed="${selected.includes(key)}">${label}</button>`).join('')}</div>
      <button type="button" class="primary-button" data-action="ack-conflict">CALCULAR GEOMETRIA</button><div class="feedback" data-feedback></div>
    </div>
  </div>`;
}

function books(state) {
  const selected = state.bookSelections || [];
  return `<section class="bookscan-evidence">
    <header><span>BOOKSCAN // DUAS FONTES DOMÉSTICAS</span><strong>EXTREMIDADES · DISTÂNCIA 01</strong></header>
    <div class="bookscan-workbench" data-bookscan>
      <nav class="bookscan-toolbar" aria-label="Ferramentas da fotografia"><button type="button" data-action="bookscan-zoom" data-delta="-.25">−</button><output data-bookscan-zoom>100%</output><button type="button" data-action="bookscan-zoom" data-delta=".25">+</button><button type="button" data-action="bookscan-reset">REENQUADRAR</button><span>ARRASTE OU ROLE PARA EXAMINAR</span></nav>
      <div class="bookscan-viewport" data-bookscan-viewport tabindex="0" aria-label="Fotografia navegável da estante">
        <figure class="bookscan-capture" data-evidence-frame data-bookscan-canvas>
          <img data-evidence-source src="./assets/evidence/books/shelf-cam-01.jpg" alt="Captura degradada da estante real">
          <div class="bookscan-noise" aria-hidden="true"></div><time>CAM_01 · 17/09/2025 03:__</time>
          <div class="bookscan-hotspots" aria-label="Lombadas examináveis">
            <button type="button" data-action="bookscan-spine" data-book="lado" style="--x:25.1%;--y:34%;--w:2.9%;--h:45%" aria-label="Examinar lombada O Lado Feio do Amor"><span>O Lado Feio do Amor</span></button>
            <button type="button" data-action="bookscan-spine" data-book="acaba" class="${selected.includes('acaba')?'is-selected':''}" style="--x:27.6%;--y:34%;--w:2.9%;--h:45%" aria-label="Examinar lombada É Assim que Acaba"><span>É Assim que Acaba</span></button>
            <button type="button" data-action="bookscan-spine" data-book="comeca" class="${selected.includes('comeca')?'is-selected':''}" style="--x:30.5%;--y:34%;--w:2.9%;--h:45%" aria-label="Examinar lombada É Assim que Começa"><span>É Assim que Começa</span></button>
            <button type="button" data-action="bookscan-spine" data-book="maldicao" style="--x:33.4%;--y:34%;--w:3.0%;--h:45%" aria-label="Examinar lombada A Maldição do Ex"><span>A Maldição do Ex</span></button>
            <button type="button" data-action="bookscan-spine" data-book="lua" style="--x:50.4%;--y:34%;--w:4.0%;--h:45%" aria-label="Examinar lombada Cidade da Lua Crescente"><span>Cidade da Lua Crescente</span></button>
          </div>
          <div class="bookscan-missing"><strong>CAPTURA 01 AUSENTE</strong><span>assets/evidence/books/shelf-cam-01.jpg</span></div>
          <figcaption>JPEG recomposto · selecione duas lombadas diretamente na imagem</figcaption>
        </figure>
      </div>
      <figure class="bookscan-reference" data-evidence-frame><img data-evidence-source src="./assets/evidence/books/shelf-cam-02.jpg" alt="Segunda captura degradada da estante real"><div class="bookscan-missing"><strong>CAPTURA 02 AUSENTE</strong><span>assets/evidence/books/shelf-cam-02.jpg</span></div><figcaption>CAM_02 · referência de coleção e ordenação</figcaption></figure>
    </div>
    <div class="bookscan-log"><code>CRITÉRIO // EXTREMIDADES</code><code>DISTÂNCIA ENTRE VOLUMES // 01</code><code>MENSAGEM RECUPERADA // “o fim ficou perto demais do começo”</code></div>
    <div class="bookscan-selection"><span>LOMBADAS MARCADAS</span><output data-bookscan-selection>${selected.length ? selected.map((id)=>({acaba:'É Assim que Acaba',comeca:'É Assim que Começa',lado:'O Lado Feio do Amor',maldicao:'A Maldição do Ex',lua:'Cidade da Lua Crescente'})[id]).join(' + ') : 'nenhuma'}</output><button type="button" class="primary-button" data-action="bookscan-confirm-pair" ${selected.length===2?'':'disabled'}>CORRELACIONAR MARCAS</button></div>
    <section class="bookscan-return" ${state.flags.bookPairIdentified?'':'hidden'}><strong>PAR ADJACENTE CONFIRMADO</strong><p>Consulte os dois volumes físicos na mesma ordem: FIM → COMEÇO. Cada inserto completa metade do timestamp.</p>${answerForm('14','horário formado pelos insertos')}</section>
    <div class="feedback" data-feedback></div>
  </section>`;
}

function identity(state) {
  const selected = state.relationSelection || [];
  const linked = state.relationLinks || [];
  const linkedPairs = Math.floor(linked.length / 2);
  return `<p>As duas fontes nunca contam a mesma lembrança do mesmo jeito. Ligue os registros que só fazem sentido quando ficam lado a lado.</p><div class="identity-link-status">MEMÓRIAS COMPARTILHADAS <strong>${linkedPairs} / 3</strong></div><div class="relation-board identity-board" data-relations>
    <svg class="identity-connections" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true">${Array.from({ length: linkedPairs }, (_, index) => `<path d="M42 ${25 + index * 50} C50 ${8 + index * 50} 50 ${42 + index * 50} 58 ${25 + index * 50}" pathLength="1"></path>`).join('')}</svg>
    ${IDENTITY_RECORDS.map((record) => `<button type="button" class="record-chip ${selected.includes(record.id) ? 'is-selected' : ''} ${linked.includes(record.id) ? 'is-linked' : ''}" data-action="relation" data-record="${record.id}" data-pair="${record.pair}" aria-pressed="${selected.includes(record.id) || linked.includes(record.id)}" ${linked.includes(record.id) ? 'disabled' : ''}>${record.label}</button>`).join('')}</div><div class="feedback" data-feedback></div>`;
}

function locationScene(state) {
  if (!state.flags.yardNodeValidated) return yardNodeGate(state);
  const selected = state.locationFragments || [];
  const points = [[28,34],[142,24],[226,72],[72,134],[178,144],[248,122]];
  const selectedPoints = selected.map((tag) => points[LOCATION_FRAGMENTS.findIndex(([candidate]) => candidate === tag)]).filter(Boolean);
  const connections = selectedPoints.slice(1).map((to, index) => {
    const from = selectedPoints[index];
    return `<path d="M${from[0]} ${from[1]} L${to[0]} ${to[1]}" pathLength="1"></path>`;
  }).join('');
  return `<p>O nome do lugar foi apagado. O que sobrou foi o tipo de coisa que alguém lembraria depois de estar lá.</p>
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
  const keyboardPlacement = `<section class="room-placement" aria-label="Alternativa de posicionamento sem arrastar"><header><span>MODO DE PRECISÃO</span><strong>SELECIONE UM OBJETO E DEPOIS UMA ÂNCORA</strong></header><div class="room-placement__anchors">${[
    ['rest','REPOUSO',32,63],['storage','ARMAZENAMENTO',33,14],['work','TRABALHO',69,65],['support','APOIO LATERAL',18,66],['observer','OBSERVADOR',62,18]
  ].map(([id,label,x,y])=>`<button type="button" data-action="room-anchor" data-anchor="${id}" data-x="${x}" data-y="${y}">${label}</button>`).join('')}</div><p data-room-placement-status>OBJETO SELECIONADO // ${state.roomPlacement.selectedObject ? state.roomPlacement.selectedObject.toUpperCase() : 'NENHUM'}</p></section>`;
  if (state.flags.houseAnomalyRevealed && !state.flags.roomNodeValidated) {
    return `<section class="room-anomaly">
      ${voiceMessage('system', 'SISTEMA', 'MODELO RECUSADO // ÁREA INDEXADA MENOR QUE ÁREA CALCULADA')}
      <div class="room-anomaly__measure"><span>ÁREA CALCULADA<strong>118,6 m²</strong></span><span>ÁREA INDEXADA<strong>107,4 m²</strong></span><span>VOLUME AUSENTE<strong>+11,2 m²</strong></span></div>
      <p>Existe um cômodo inteiro entre relações que o arquivo reconhece, mas não nomeia. A origem tem uma única característica preservada: três marcas curtas, próximas de madeira.</p>
      ${voiceMessage('human', 'J.', 'Tá. Essa parte eu queria muito ver você descobrir sozinha.')}
      ${externalStep('FONTE LOCALIZADA // INTERFACE INSUFICIENTE // ACESSO FÍSICO. Procure somente no cômodo que corresponde à área ausente e siga as três marcas preparadas.', '', 'J.')}
      <form class="answer-form" data-node-auth="room"><label class="answer-label" for="node-room">Assinatura do espaço não classificado</label><div class="answer-control"><input id="node-room" class="answer-input" name="token" autocomplete="off" placeholder="VX-QUARTO-0000"><button class="primary-button" type="submit">ANEXAR LEITURA</button></div><small class="answer-format">O CELULAR MOSTRA UMA LEITURA ANTERIOR. NÃO TENTE EXPLICÁ-LA AGORA.</small></form><div class="feedback" data-feedback></div>
    </section>`;
  }
  if (state.flags.roomNodeValidated) {
    return `<section class="room-anomaly room-anomaly--resolved">${voiceMessage('system', 'SISTEMA', 'NÓ_00 // LEITURA ATUAL ANEXADA // LEITURA ANTERIOR 03:17 MANTIDA')}<p>O cômodo agora existe na planta. O problema é que o NÓ afirma ter sido lido antes de você entrar nele.</p>${voiceMessage('interference', 'FONTE NÃO CLASSIFICADA', 'eu já estava aqui')}<button type="button" class="primary-button" data-action="confirm-room-return">FECHAR LEITURA E SAIR</button></section>`;
  }
  return `<p>O arquivo conhece este quarto pelas relações entre os objetos. Refaça essas relações; posição exata não importa.</p>
    <div class="room-analysis"><strong data-room-score>COMPATIBILIDADE DO QUARTO: ${evaluation.score}%</strong><span data-room-relation-count>${evaluation.verifiedRelations.length} / ${evaluation.relations.length} RELAÇÕES VÁLIDAS</span></div>
    <div class="room-grid" data-room><svg class="room-relations" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><g data-room-relations>${evaluation.verifiedRelations.map((relation,index) => `<path d="M${12 + index * 12} 84 L${20 + index * 13} 18" pathLength="1" data-relation="${relation.id}"></path>`).join('')}</g></svg>${renderedObjects}</div>${keyboardPlacement}
    <ul class="room-relation-list">${evaluation.relations.map((relation) => `<li data-room-relation="${relation.id}" class="${evaluation.verifiedRelations.includes(relation) ? 'is-valid' : ''}">${relation.label}</li>`).join('')}</ul>
    <button type="button" class="primary-button" data-action="validate-room">VALIDAR MODELO</button><div class="feedback" data-feedback></div>`;
}

function meta() {
  return `<section class="key-composition">
    <header><span>CLASSIFICADOR DE RELAÇÃO // ÚLTIMA OPERAÇÃO</span><strong>DUAS CADEIAS CONVERGENTES</strong></header>
    <div class="key-chains">
      <article><span>CADEIA A // RECUPERADA</span><ol><li><i>05</i><strong>índice do volume</strong></li><li><i>20</i><strong>Cômodo Zero anexado</strong></li><li><i>520</i><strong>fragmento de checksum</strong></li></ol><output>520</output></article>
      <article><span>CADEIA B // RECUPERADA</span><ol><li><i>13</i><strong>afterimage do Receiver</strong></li><li><i>14</i><strong>índice de armazenamento</strong></li><li><i>1314</i><strong>endereço de permanência</strong></li></ol><output>1314</output></article>
    </div>
    <div class="composition-rule"><span>OPERAÇÃO AUTORIZADA</span><strong>CONCATENAR A → B</strong><code>520 + 1314</code></div>
    ${voiceMessage('human', 'JOÃO', 'Você já tem tudo. Não soma. Só coloca uma coisa depois da outra.')}
    ${answerForm('24', 'chave composta')}
  </section>`;
}

function finalExperience(state) {
  const elapsed = formatDuration(Date.now() - (state.startedAt || Date.now()));
  const counter = daysSince(GAME_CONFIG.importantDate);
  return `<section class="final-stage"><div class="final-key-meaning"><span>520</span><i>I LOVE YOU</i><span>1314</span><i>FOR A LIFETIME</i><strong>I LOVE YOU FOR ETERNITY</strong></div><p class="final-call">Rayssa?</p><p class="final-salutation">Bom dia, princesa.</p><div class="date">10/10<small>o dia em que a gente se conheceu.</small></div><h1 tabindex="-1" data-scene-heading>nós.</h1><p class="final-human">João + Rayssa<br>estado: aqui.</p><div class="counter"><div><strong data-counter="days">${counter.days}</strong><span>dias</span></div><div><strong data-counter="hours">${counter.hours}</strong><span>horas</span></div><div><strong data-counter="minutes">${counter.minutes}</strong><span>minutos</span></div><div><strong data-counter="seconds">${counter.seconds}</strong><span>segundos</span></div></div><p class="final-message">${escapeHtml(GAME_CONFIG.finalMessage)}</p><button type="button" class="primary-button" data-action="play-final-music">${GAME_CONFIG.musicUrl ? 'TOCAR MÚSICA RECUPERADA' : 'TOCAR SINAL RECUPERADO'}</button><div class="stats-table"><div class="stats-row"><span>TEMPO TOTAL</span><strong data-total-elapsed>${elapsed}</strong></div><div class="stats-row"><span>TENTATIVAS</span><strong>${state.stats.wrongAnswers}</strong></div><div class="stats-row"><span>DICAS CONSULTADAS</span><strong>${Object.values(state.hintsUsed).reduce((a,b)=>a+b,0)}</strong></div></div></section>`;
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
    case 'boot':
    case 'logs': return '';
    case 'tv-intro': return renderTV(state, { mode: state.unlocked.includes('13') ? 'sequence' : 'intro' });
    case 'morse': return `<div class="receiver-puzzle receiver-puzzle--morse">${renderTV(state,{mode:'morse'})}<div class="receiver-puzzle__answer">${answerForm('04','interpretação do sinal')}</div></div>`;
    case 'file-properties': return `<section class="mount-table"><header><span>MESA // TABELA DE MONTAGEM</span><strong>1 DISPOSITIVO SEM CORRESPONDÊNCIA</strong></header><div class="mount-rows"><article><span>UNIDADE_A</span><strong>07 / 04 / 93</strong><i>LOCAL // ATIVA</i></article><article class="is-anomaly"><span>ARCHIVE_?</span><strong>17 / 04 / 91</strong><i>DISPOSITIVO // AUSENTE</i></article><article><span>BACKUP_B</span><strong>02 / 11 / 99</strong><i>REMOVÍVEL // OFFLINE</i></article></div><p class="system-message">FORMATO DE ÍNDICE // DDMMYY // NÃO ALTERAR A ORDEM</p>${answerForm('05','índice da montagem órfã')}</section>`;
    case 'document': return documentScene(state);
    case 'files': return files();
    case 'binary': return binary();
    case 'moon-one': return `${externalStep('Os três blocos formaram LUA.', 'Não é a do céu. Você sabe qual é.')}<div class="terminal"><p class="terminal-line">OBJETO: L_U_A</p><p class="terminal-line">localização: ambiente próximo</p><p class="terminal-line">camadas detectadas: 02</p></div><p>Nesta visita, apenas a primeira marca possui contexto.</p>${answerForm('09','código do fragmento físico')}`;
    case 'return-event': return '';
    case 'conflict': return conflict(state);
    case 'phone-memory': return '';
    case 'tv-sequence': return renderTV(state, { mode: 'sequence' });
    case 'books': return books(state);
    case 'clock-calibration': return '';
    case 'bedside': return `${externalStep('Instrução recuperada: ONDE A NOITE DEIXA O QUE VOCÊ PRECISA.', 'Você tá complicando. Não é a cama.', 'J.')}<div class="clue-grid"><div class="clue-card"><span class="clue-card__tag">resposta óbvia / errada</span><p>a superfície onde você dorme</p></div><div class="clue-card"><span class="clue-card__tag">relação correta</span><p>o que continua ao alcance depois de deitar</p></div></div>${answerForm('16','código do fragmento físico')}`;
    case 'tv-tuning': return greenNodeGate(state);
    case 'location': return locationScene(state);
    case 'identity': return identity(state);
    case 'room': return room(state);
    case 'impossible': return state.flags.fakeFinalSeen ? `<div class="terminal glitch-once"><p class="terminal-line error">INTEGRIDADE: 99%</p><p class="terminal-line">1 RELAÇÃO NÃO RESOLVIDA</p><p class="terminal-line">A TV NÃO PERTENCE AO QUARTO</p><p class="terminal-line">A TV PERTENCE AO SISTEMA</p></div>${voiceMessage('human', 'J.', 'Não. Ainda não acabou.')}<button type="button" class="primary-button" data-action="continue-after-fake">VOLTAR AO ARQUIVO</button>` : `<section class="final-stage false-final"><div class="date">RECUPERAÇÃO CONCLUÍDA</div><p class="faint">OBJETO SEM ÂNCORA FÍSICA<br>INTEGRIDADE DECLARADA: 99%</p><h1>arquivo restaurado.</h1><p>O sistema quer que você aceite uma conclusão que não explica tudo.</p><div class="fake-progress"><span></span></div><button type="button" class="primary-button" data-action="fake-end">TESTAR ENCERRAMENTO</button></section>`;
    case 'books-node': return `${externalStep('O canal externo deixou a frase: abaixo de onde as histórias ficam.', 'Eu sabia que você ia olhar nos livros primeiro.', 'JOÃO')}<p class="muted">Talvez o NÓ já tenha sido encontrado antes. Só agora o código possui contexto.</p>${state.flags.booksNodeScanned ? '<p class="good">NÓ_11 DETECTADO.</p>' : ''}<div class="system-message">CABEÇALHO DE ÁUDIO PARCIAL: “TÃO FÁCIL SE APAIXONAR…”</div>${answerForm('22','código do nó')}`;
    case 'clock-origin': return '';
    case 'meta': return meta(state);
    case 'final': return finalExperience(state);
    default: return '<p>TIPO DE REGISTRO DESCONHECIDO</p>';
  }
}
