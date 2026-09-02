import { GAME_CONFIG } from './config.js';
import { RECOVERED_FILES, LOCATION_FRAGMENTS } from '../data/records.js';
import { OBJECT_CONFLICT, IDENTITY_RECORDS } from '../data/memories.js';
import { DOCUMENT_COMPARISON_ROWS } from '../data/puzzles.js';
import { renderTV } from './tv.js';
import { escapeHtml, formatDuration, daysSince } from './utils.js';
import { evaluateRoom } from './room-model.js';
import { clarityFor } from './puzzles/clarity.js';
import { renderPaperBoard } from './paper-engine.js';

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
  const revision=state.documentRuntime.revision%3;
  const a=[['o índice reconhece a data','o índice rejeita a data','o índice esqueceu a data'][revision],'A DATA','ABRE','O ARQUIVO',['quando a cópia se move','antes que a cópia responda','depois que a janela retorna'][revision]];
  const b=[['a origem preserva a hora','a origem nega a hora','a origem troca a hora'][revision],'A DATA','ABRE','O ARQUIVO',['enquanto ainda existe nome','quando o nome desaparece','se a leitura for repetida'][revision]];
  const layer=(copy,lines)=>`<article class="document-overlay__layer is-${copy.toLowerCase()}" aria-label="Cópia ${copy}">${lines.map((line,index)=>`<p data-overlay-line="${index}"><small>${String(index+1).padStart(2,'0')}</small>${escapeHtml(line)}</p>`).join('')}</article>`;
  const regions=a.map((line,index)=>{
    const token=index>0&&index<4?order[index-1]:'';
    const active=token&&selected.includes(token);
    return `<button type="button" class="document-overlay__region${active?' is-selected':''}" style="--region:${index}" data-action="memory-region" data-row="${index}" ${token?`data-token="${escapeHtml(token)}"`:''} aria-pressed="${Boolean(active)}"><span>${active?'REGIÃO FIXADA':'FIXAR REGIÃO'}</span></button>`;
  }).join('');
  const slots = order.map((token, index) => `<span class="document-extraction__slot${selected.includes(token) ? ' is-filled' : ''}" data-document-slot="${escapeHtml(token)}"><small>0${index + 1}</small>${selected.includes(token) ? escapeHtml(token) : 'TRECHO AUSENTE'}</span>`).join('');
  const locked = state.signalAnalyzer.locked;
  return `<section class="document-puzzle ${locked ? 'has-signal-lock' : 'is-degraded'}">
    <header class="document-puzzle__intro"><span>REL_1708 // COMPARADOR DE ESTADOS</span><p>As duas cópias continuam mudando. Sobreponha os estados e fixe apenas as regiões que não produzem ghosting.</p></header>
    <section class="signal-analyzer" data-signal-analyzer>
      <header><span>PORTADORA DERIVADA DOS METADADOS // 17-08</span><strong>${locked ? 'SIGNAL LOCK' : 'SEM SINCRONIA'}</strong></header>
      <div class="signal-spectrum">${Array.from({ length: 37 }, (_, index) => `<i style="--amp:${18 + ((index * 19) % 77)}%"></i>`).join('')}</div>
      <label>COARSE <input type="range" min="160" max="180" step="1" value="${state.signalAnalyzer.coarse}" data-signal-control="coarse"><output>${state.signalAnalyzer.coarse}</output></label>
      <label>FINE <input type="range" min="0" max="9" step="1" value="${state.signalAnalyzer.fine}" data-signal-control="fine"><output>.${state.signalAnalyzer.fine}</output></label>
      <button type="button" data-action="signal-lock">TESTAR PORTADORA</button>
    </section>
    <div class="document-overlay" data-document-compare style="--overlay:${state.documentRuntime.overlay/100}" role="group" aria-label="Sobreposição entre estados A e B">
      ${layer('A',a)}${layer('B',b)}<div class="document-overlay__regions">${regions}</div>
    </div>
    <label class="document-overlay__control"><span>TRANSPARÊNCIA A/B</span><input type="range" min="0" max="100" value="${state.documentRuntime.overlay}" data-document-overlay><output data-document-overlay-output>${state.documentRuntime.overlay}%</output></label>
    <div class="document-snapshot"><span>${state.documentRuntime.snapshots.length?'ESTADO CAPTURADO DISPONÍVEL':'NENHUM ESTADO CAPTURADO'}</span><button type="button" data-action="document-snapshot">CAPTURAR ESTADO ATUAL</button></div>
    <footer class="document-extraction">
      <div class="document-extraction__result"><span>REGIÕES ESTABILIZADAS <strong data-document-count>${selected.length}</strong></span><div class="document-extraction__slots">${slots}</div></div>
      ${locked&&selected.length===order.length?'<code class="document-carrier-reference">REF EXTERNA // mirror://final</code>':''}
      <button type="button" class="primary-button document-extraction__commit" data-action="commit-document" ${locked && selected.length === order.length && state.documentRuntime.snapshots.length ? '' : 'disabled'}>CONGELAR SINAL E CONSOLIDAR</button>
    </footer>
    <div class="feedback document-puzzle__feedback" data-feedback data-document-status aria-live="polite">${selected.length === order.length ? 'AS REGIÕES FIXAS FORMAM UMA INSTRUÇÃO' : 'MOVIMENTE A TRANSPARÊNCIA E OBSERVE O DESALINHAMENTO'}</div>
  </section>`;
}

function files(state) {
  const url=state.vxNet.history[state.vxNet.index]||state.vxNet.url||'vx://home';
  const snapshots=`<span>VX_NET // SNAPSHOTS DE MIRROR://FINAL</span>${state.unlocked.includes('10')?'<p class="vx-page-change">PÁGINA ATUAL ALTERADA // O HISTÓRICO PRESERVA O SNAPSHOT 1010-A</p>':''}<p>O relatório estabilizado preservou um endereço, não um nome de arquivo. Cinco snapshots discordam em pelo menos um metadado.</p><div class="vx-snapshots">${RECOVERED_FILES.map((file,index)=>`<article><header><strong>SNAPSHOT ${String(index+1).padStart(2,'0')}</strong><small>${file.name}</small></header><dl><div><dt>MODIFIED</dt><dd>${file.modified}</dd></div><div><dt>CACHE</dt><dd>${index===3?'10:10:06':`10:${12+index}:0${index}`}</dd></div><div><dt>ORIGEM</dt><dd>${index===3?'EVENTO_1010':'MIRROR LOCAL'}</dd></div><div><dt>CHECKSUM</dt><dd>${index===3?(state.unlocked.includes('10')?'1010-B / HISTÓRICO: 1010-A':'1010-A'):'DIVERGENTE'}</dd></div></dl><button type="button" data-action="vx-download" data-snapshot="${index}">${index===3?'RECUPERAR LINK PARCIAL':'ABRIR FINAL'}</button></article>`).join('')}</div>`;
  const pages={
    'vx://home':'<span>VX_NET 3.8 // REDE LOCAL</span><p>Favorito antigo: <button type="button" data-action="vx-page" data-url="mirror://final">mirror://final</button></p><p>Serviços: archive.local · index.local · mirror.local</p>',
    'vx://history':'<span>HISTÓRICO</span><ol><li>archive.local/manual</li><li>mirror://final <small>snapshot preservado às 10:10</small></li><li>index.local/REG_101000.idx</li></ol>',
    'vx://favorites':'<span>FAVORITOS</span><ol><li><button type="button" data-action="vx-page" data-url="archive.local/manual">Manual da estação</button></li><li><button type="button" data-action="vx-page" data-url="mirror://final">mirror://final</button></li></ol>',
    'vx://search':`<span>BUSCA LOCAL</span><form data-vx-search><input name="query" value="${escapeHtml(state.vxNet.query||'')}" placeholder="buscar no índice local"><button>BUSCAR</button></form>${state.vxNet.query?`<p>RESULTADOS PARA ${escapeHtml(state.vxNet.query)} // mirror://final · index.local · cache local</p>`:'<p>Nenhuma consulta ativa.</p>'}`,
    'vx://cache':'<span>CACHE LOCAL</span><p>mirror://final · 5 snapshots · um checksum confirmado por duas fontes</p>',
    'vx://downloads':`<span>DOWNLOADS</span><p>${state.vxNet.downloads.length?state.vxNet.downloads.join(' · '):'NENHUM DOWNLOAD RECUPERADO'}</p>`,
    'archive.local/manual':'<span>MANUAL DA ESTAÇÃO R-1010</span><p>Serviço de manutenção. Cópias em cache podem divergir da origem depois de uma remontagem.</p><p>Esta página não contém registro investigativo.</p>',
    'mirror://final':snapshots
  };
  const page=pages[url]||'<span>404 // ENDEREÇO NÃO ENCONTRADO</span><p>A rede é local. Verifique histórico, favoritos ou cache.</p>';
  return `<section class="vx-browser" data-vx-browser><header><button type="button" data-action="vx-back">‹</button><button type="button" data-action="vx-forward">›</button><button type="button" data-action="vx-reload">RECARREGAR</button><form data-vx-address><input name="url" value="${escapeHtml(url)}" aria-label="Endereço"><button>IR</button></form></header><nav><button data-action="vx-page" data-url="vx://home">INÍCIO</button><button data-action="vx-page" data-url="vx://history">HISTÓRICO</button><button data-action="vx-page" data-url="vx://favorites">FAVORITOS</button><button data-action="vx-page" data-url="vx://search">BUSCA</button><button data-action="vx-page" data-url="vx://cache">CACHE</button><button data-action="vx-page" data-url="vx://downloads">DOWNLOADS</button></nav><main data-vx-page>${page}</main></section>`;
}

function binary() {
  const bits = '010011000101010101000001'.split('');
  return `<section class="download-decoder"><header><span>DOWNLOADS / DUMP_24.bin</span><strong>DECODER INTERNO</strong></header><p>Alguém apagou o cabeçalho, mas deixou os 24 bits separados em três blocos legíveis.</p><div class="binary-board" aria-label="24 bits agrupados visualmente de oito em oito">${bits.map((bit) => `<span class="bit">${bit}</span>`).join('')}</div>${answerForm('08','objeto recuperado')}</section>`;
}

function moonDigital(state) {
  const recovered=Boolean(state.computer.files['webcam-cache']?.recovered);
  return `<section class="moon-search"><header><span>BUSCA LOCAL // LUA</span><strong>3 RESULTADOS EM ORIGENS DIFERENTES</strong></header><div class="moon-results"><article><span>IMAGEM</span><strong>tecido_scan.bmp</strong><small>CACHE / scanner local / canais danificados</small></article><article><span>LOG</span><strong>SCAN_LUA_04.log</strong><small>realce incompleto · referência VX</small></article><article><span>CACHE</span><strong>webcam-frame-0017.jpg</strong><small>thumbnail sem origem</small></article></div><div class="moon-forensics ${recovered?'is-recovered':''}" data-moon-forensics><figure><img src="./assets/images/moon-scan.svg" alt="Scan degradado de um tecido com lua"><div class="moon-channel-noise"></div></figure><div><label>CONTRASTE <input type="range" min="0" max="100" value="${recovered?78:20}" data-moon-control="contrast"></label><label>CANAL <select data-moon-control="channel"><option>RGB</option><option value="blue">AZUL</option><option value="infra">RESÍDUO</option></select></label><button type="button" data-action="moon-recover">CRUZAR LOG + CACHE + IMAGEM</button></div></div>${recovered?`<div class="moon-recovered-code"><span>MARCA RECUPERADA NO TECIDO</span><strong>VX-04</strong></div>${answerForm('09','marca recuperada')}`:'<p class="system-message">A marca não pertence a nenhum resultado isolado.</p>'}</section>`;
}

function booksNode(state) {
  const selected=state.bookshelfSelections||[];
  const decoded=selected.length===3&&['acaba','comeca','teto'].every((id)=>selected.includes(id));
  const titles=[['teto','Teto para Dois'],['acaba','É Assim que Acaba'],['comeca','É Assim que Começa'],['maldicao','A Maldição do Ex'],['lua','Cidade da Lua Crescente']];
  return `<section class="bookshelf-node"><header><span>CABEÇALHO RECUPERADO</span><strong>FIM · COMEÇO · ACIMA DE DOIS</strong><p>Os títulos indicam a coleção e a região. Eles não fornecem página nem dependem do texto dos livros.</p></header><div class="bookshelf-title-strip">${titles.map(([id,label])=>`<button type="button" class="${selected.includes(id)?'is-selected':''}" data-action="bookshelf-title" data-title="${id}">${label}</button>`).join('')}</div><button type="button" class="primary-button" data-action="bookshelf-region">TESTAR REGIÃO DA ESTANTE</button><div class="feedback" data-feedback></div>${decoded?`${externalStep('A relação aponta para a face inferior da prateleira que sustenta o conjunto, entre FIM e COMEÇO.')}<form class="answer-form" data-node-auth="books"><label class="answer-label" for="node-books">Assinatura do nó sob a estante</label><div class="answer-control"><input id="node-books" class="answer-input" name="token" autocomplete="off" placeholder="VX-LIVROS-0000"><button class="primary-button" type="submit">AUTENTICAR</button></div></form>`:''}</section>`;
}

function conflict(state) {
  return renderPaperBoard(state,'11',{instruction:'Organize as fotografias, alinhe o contorno e use a metadata como segunda origem. Duas peças não pertencem ao objeto.',secondary:'A silhueta deve surgir da composição; nenhuma categoria pronta será oferecida.'});
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
  const selected=state.hypothesisSelection||[];const links=state.hypothesisLinks||[];
  const documents=[...IDENTITY_RECORDS,{id:'receiver',label:'RECEIVER // 10:10'},{id:'clock',label:'DATA // 10 DE OUTUBRO'}];
  return `<section class="hypothesis-table"><header><span>MESA DE EVIDÊNCIAS</span><strong>MODELO DE DUAS FONTES</strong><p>Crie relações livremente. Nenhuma ligação será julgada até que a hipótese seja testada.</p></header><div class="hypothesis-documents">${documents.map((record,index)=>`<button type="button" class="hypothesis-document ${selected.includes(record.id)?'is-selected':''}" data-action="hypothesis-document" data-document="${record.id}" style="--doc-r:${-7+(index*5)%15}deg"><i>${String(index+1).padStart(2,'0')}</i><strong>${escapeHtml(record.label)}</strong></button>`).join('')}</div><ol class="hypothesis-links">${links.map((link)=>`<li>${escapeHtml(link.replace(':',' ↔ '))}<button type="button" data-action="remove-hypothesis" data-link="${escapeHtml(link)}" aria-label="Remover relação">×</button></li>`).join('')||'<li>NENHUMA RELAÇÃO PROPOSTA</li>'}</ol><button type="button" class="primary-button" data-action="test-hypothesis">TESTAR HIPÓTESE</button><div class="feedback" data-feedback></div></section>`;
}

function locationScene(state) {
  if (!state.flags.yardNodeValidated) return yardNodeGate(state);
  const solved=Boolean(state.paperEngine.boards['18']?.solved);
  return `${renderPaperBoard(state,'18',{instruction:'Seis fragmentos pertencem ao mesmo mapa. Gire e aproxime bordas, marcas e continuidade de caminho.',secondary:'As quatro distrações podem permanecer fora do núcleo.'})}${solved?`<section class="map-second-source"><figure><img src="./assets/images/camera-01.svg" alt="Fotografia antiga parcial usada como segunda fonte"><figcaption>CELULAR // FOTO ANTIGA CORTADA</figcaption></figure><p>A fotografia e o núcleo montado compartilham margem, banco, brinquedo e linha d’água.</p>${answerForm('18','local reconhecido')}</section>`:''}`;
}

function room(state) {
  if (state.flags.houseAnomalyRevealed && !state.flags.roomNodeValidated) {
    return `<section class="room-anomaly">${voiceMessage('system','SISTEMA','TRANSPARÊNCIAS ALINHADAS // ÁREA INDEXADA MENOR QUE ÁREA CALCULADA')}<div class="room-anomaly__measure"><span>ÁREA CALCULADA<strong>118,6 m²</strong></span><span>ÁREA INDEXADA<strong>107,4 m²</strong></span><span>VOLUME AUSENTE<strong>+11,2 m²</strong></span></div>${externalStep('A divergência aponta para o cômodo correspondente. Procure as três marcas preparadas próximas à madeira.')}<form class="answer-form" data-node-auth="room"><label class="answer-label" for="node-room">Assinatura do espaço não classificado</label><div class="answer-control"><input id="node-room" class="answer-input" name="token" autocomplete="off" placeholder="VX-QUARTO-0000"><button class="primary-button" type="submit">ANEXAR LEITURA</button></div></form><div class="feedback" data-feedback></div></section>`;
  }
  if (state.flags.roomNodeValidated) return `<section class="room-anomaly room-anomaly--resolved">${voiceMessage('system','SISTEMA','NODE_00 // LEITURA ATUAL ANEXADA // LEITURA ANTERIOR 03:17 MANTIDA')}<p>O volume agora existe. A leitura afirma ter ocorrido antes da entrada.</p><button type="button" class="primary-button" data-action="confirm-room-return">FECHAR LEITURA E SAIR</button></section>`;
  return renderPaperBoard(state,'20',{instruction:'Alinhe estrutura, mobiliário, captura antiga e leitura do sistema. Procure a única área que não fecha.',secondary:'A tolerância é pequena; use paredes e aberturas como registro.'});
  /* Grade legada mantida abaixo apenas como referência de migração; não é renderizada. */
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

function meta(state) {
  const solved=Boolean(state?.paperEngine?.boards?.['24']?.solved);
  return `${renderPaperBoard(state,'24',{instruction:'Reúna índices do PC, quadros do Receiver, ordem dos livros e orientação da mesa. A interface não informa a operação.',secondary:'A chave é lida como uma única linha, na direção indicada.'})}${solved?`<section class="final-key-entry"><span>LEITURA COMPOSTA DISPONÍVEL</span><p>Use somente os fragmentos estabilizados. Nenhuma soma é solicitada.</p>${answerForm('24','chave recuperada')}</section>`:''}`;
  /* Composição tutorial legada desativada. */
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
  return `<section class="final-room" data-final-room><div class="final-room__devices" aria-hidden="true"><div class="final-room__pc"><i>100%</i></div><div class="final-room__receiver"><i>SEM ESTÁTICA</i></div><div class="final-room__phone"><i>0 NOTIFICAÇÕES</i></div><div class="final-room__table"><i></i><i></i><i></i></div></div><main class="final-stage"><p class="final-call">Rayssa?</p><p class="final-salutation">Bom dia, princesa.</p><div class="date">10/10<small>o dia em que a gente se conheceu.</small></div><h1 tabindex="-1" data-scene-heading>nós.</h1><p class="final-human">João + Rayssa<br>estado: aqui.</p><div class="final-memory-strip"><span>Curitiba</span><span>Parquinho da Beira-Mar</span><span>03:17</span></div><div class="counter"><div><strong data-counter="days">${counter.days}</strong><span>dias</span></div><div><strong data-counter="hours">${counter.hours}</strong><span>horas</span></div><div><strong data-counter="minutes">${counter.minutes}</strong><span>minutos</span></div><div><strong data-counter="seconds">${counter.seconds}</strong><span>segundos</span></div></div><p class="final-message">${escapeHtml(GAME_CONFIG.finalMessage)}</p><button type="button" class="primary-button" data-action="play-final-music">${GAME_CONFIG.musicUrl ? 'TOCAR MÚSICA RECUPERADA' : 'TOCAR SINAL RECUPERADO'}</button><div class="stats-table"><div class="stats-row"><span>TEMPO TOTAL</span><strong data-total-elapsed>${elapsed}</strong></div><div class="stats-row"><span>TENTATIVAS</span><strong>${state.stats.wrongAnswers}</strong></div><div class="stats-row"><span>DICAS CONSULTADAS</span><strong>${Object.values(state.hintsUsed).reduce((a,b)=>a+b,0)}</strong></div></div></main></section>`;
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
    case 'files': return files(state);
    case 'binary': return binary();
    case 'moon-one': return moonDigital(state);
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
    case 'impossible': return state.flags.fakeFinalSeen ? `<div class="terminal glitch-once"><p class="terminal-line error">INTEGRIDADE: 99%</p><p class="terminal-line">RELAÇÕES: 18/18</p><p class="terminal-line">1 RELAÇÃO NÃO ANCORADA</p><p class="terminal-line">ORIGEM AUSENTE</p><p class="terminal-line">SHELL RECUPERADA // BOOT ${String(state.computer.boot.count).padStart(2,'0')}</p><p class="terminal-line">A TV NÃO PERTENCE AO QUARTO</p><p class="terminal-line">A TV PERTENCE AO SISTEMA</p></div><button type="button" class="primary-button" data-action="continue-after-fake">CONSULTAR ARQUIVO RECUPERADO</button>` : `<section class="final-stage false-final"><div class="date">RECUPERAÇÃO CONCLUÍDA</div><p class="faint">INTEGRIDADE: 99%<br>RELAÇÕES: 18/18<br>MEMÓRIA: ESTÁVEL</p><h1>arquivo restaurado.</h1><p>ENCERRANDO...</p><div class="fake-progress"><span></span></div><button type="button" class="primary-button" data-action="fake-end">VERIFICAR 1% RESTANTE</button></section>`;
    case 'books-node': return booksNode(state);
    case 'clock-origin': return '';
    case 'meta': return meta(state);
    case 'final': return finalExperience(state);
    default: return '<p>TIPO DE REGISTRO DESCONHECIDO</p>';
  }
}
