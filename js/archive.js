import { escapeHtml } from './utils.js';

const record = (definition) => Object.freeze(definition);

const ARCHIVE_RECORDS = Object.freeze([
  record({
    id: 'evento-1010',
    code: 'EVENTO_1010',
    type: 'REGISTRO TEMPORAL',
    discovered: (state) => state.flags.event1010Seen || state.completed.includes('02'),
    version: (state) => state.unlocked.includes('10') ? 2 : 1,
    metadata: (version) => version === 2
      ? [['INDEXADO', '10.10 · 10:10:00'], ['SOMA ANTERIOR', '54F1-A09C'], ['SOMA ATUAL', '54F1-B771'], ['DIVERGÊNCIA', '3 LINHAS ADICIONADAS']]
      : [['INDEXADO', '10.10 · 10:10:00'], ['SOMA DE VERIFICAÇÃO', '54F1-A09C'], ['INTEGRIDADE', '62%'], ['ORIGEM', 'NÃO RESOLVIDA']],
    content: (version) => version === 2
      ? ['ENTIDADE A // origem local', 'CONVERSA PROLONGADA // 10:10', 'ENTIDADE B // origem externa', 'PRESENÇA CONFIRMADA DURANTE O EVENTO', 'FONTE COMPARTILHADA // CLASSIFICAÇÃO PENDENTE']
      : ['ENTIDADE A // origem local', 'CONVERSA PROLONGADA // 10:10', '[ 3 LINHAS NÃO RECUPERADAS ]']
  }),
  record({
    id: 'transmissao-04', code: 'TRANSMISSÃO_04', type: 'INTERCEPTAÇÃO',
    discovered: (state) => state.completed.includes('04'),
    metadata: () => [['PORTADORA', 'CANAL 04'], ['CODIFICAÇÃO', 'MORSE'], ['INTEGRIDADE', '81%']],
    content: () => ['PADRÃO // -- . ... .-', 'INTERPRETAÇÃO REGISTRADA // MESA', 'DESTINO // AMBIENTE FÍSICO']
  }),
  record({
    id: 'documento-06', code: 'DOCUMENTO_06', type: 'COMPARAÇÃO DE VERSÕES',
    discovered: (state) => state.completed.includes('06'),
    metadata: () => [['VERSÕES', '02'], ['DIVERGÊNCIA', 'EXTENSA'], ['INVARIANTE', 'RECUPERADO']],
    content: () => ['CONTEÚDO PRESERVADO ENTRE VERSÕES:', 'A DATA ABRE O ARQUIVO']
  }),
  record({
    id: 'pacote-24', code: 'PACOTE_24', type: 'DUMP BINÁRIO',
    discovered: (state) => state.completed.includes('08'),
    metadata: () => [['EXTENSÃO', '24 BITS'], ['BLOCOS', '03 × 08'], ['CABEÇALHO', 'AUSENTE']],
    content: () => ['01001100 01010101 01000001', 'OBJETO DECODIFICADO // LUA']
  }),
  record({
    id: 'residuo-vx04', code: 'RESÍDUO_VX-04', type: 'REFERÊNCIA FÍSICA',
    discovered: (state) => state.completed.includes('09'),
    metadata: () => [['OBJETO', 'LUA'], ['CAMADA', '01 / 02'], ['ESTADO', 'RECUPERADA']],
    content: () => ['OBSERVADOR // REFERÊNCIA EXTERNA', 'PRIMEIRA CAMADA // VX-04', 'SEGUNDA CAMADA // NÃO LIDA']
  }),
  record({
    id: 'imagem-receptor-13', code: 'IMAGEM_RECEPTOR_13', type: 'RESÍDUO DE FÓSFORO',
    discovered: (state) => state.completed.includes('13'),
    metadata: () => [['FONTE', 'CANAL 11'], ['ESTADO', 'SEM PORTADORA'], ['QUADROS', '03']],
    content: () => ['SEQUÊNCIA PRESERVADA // 02 · 05 · 01', 'ORDEM DE LEITURA // ESQUERDA → DIREITA']
  }),
  record({
    id: 'instrucao-15', code: 'INSTRUÇÃO_15', type: 'RECONSTRUÇÃO DE FRAGMENTOS',
    discovered: (state) => state.completed.includes('15'),
    metadata: () => [['FRAGMENTOS', '04'], ['SINTAXE', 'ESTÁVEL'], ['DESTINO', 'EXTERNO']],
    content: () => ['ONDE A NOITE DEIXA O QUE VOCÊ PRECISA']
  }),
  record({
    id: 'limiar-17', code: 'LIMIAR_17', type: 'REFERÊNCIA EXTERNA SEGURA',
    discovered: (state) => state.flags.yardNodeValidated,
    metadata: () => [['NÓ', '17'], ['ORIGEM', 'ÁREA PRIVADA'], ['ESTADO', 'AUTENTICADO']],
    content: () => ['FRAGMENTO // REPITA O EVENTO NOS DOIS CONTROLES', 'VALOR // CONSULTAR EVENTO_1010', 'DESTINO // RECEPTOR VX-11']
  }),
  record({
    id: 'portadora-1010', code: 'PORTADORA_1010', type: 'INTERCEPTAÇÃO',
    discovered: (state) => state.completed.includes('17'),
    metadata: () => [['CANAL', '10'], ['NÍVEL', '10'], ['SINCRONIA', 'FIXADA']],
    content: () => ['EVENTO_1010 // PORTADORA ESTÁVEL', 'DADOS ESPACIAIS ENCAMINHADOS À RECONSTRUÇÃO']
  }),
  record({
    id: 'reconstrucao-18', code: 'RECONSTRUÇÃO_18', type: 'MEMÓRIA ESPACIAL',
    discovered: (state) => state.completed.includes('18'),
    metadata: () => [['FONTES', '06'], ['COEXISTÊNCIA', 'POSITIVA'], ['ESTADO', 'RECUPERADO']],
    content: () => ['LOCAL // PARQUINHO DA BEIRA-MAR', 'EVENTO_1010 // DUAS ENTIDADES PRESENTES']
  }),
  record({
    id: 'cabecalho-audio-22', code: 'CABEÇALHO_ÁUDIO_22', type: 'REGISTRO EXTERNO',
    discovered: (state) => state.completed.includes('22'),
    metadata: () => [['NÓ', '11'], ['ARMAZENAMENTO', 'LIVROS'], ['INTEGRIDADE', 'PARCIAL']],
    content: () => ['CABEÇALHO // “TÃO FÁCIL SE APAIXONAR…”', 'CANAL EXTERNO // AUTENTICADO']
  })
]);

function materialize(definition, state) {
  const version = definition.version?.(state) || 1;
  const storedReadVersion = state.archive?.reads?.[definition.id] || 0;
  const readVersion = definition.id === 'evento-1010' && (state.flags.event1010Seen || state.completed.includes('02'))
    ? Math.max(1, storedReadVersion)
    : storedReadVersion;
  const status = version > readVersion
    ? (readVersion ? 'ALTERADO' : 'NOVO')
    : 'LIDO';
  return {
    ...definition,
    version,
    readVersion,
    status,
    metadata: definition.metadata(version, state),
    content: definition.content(version, state)
  };
}

export function archiveRecordsFor(state) {
  return ARCHIVE_RECORDS.filter((item) => item.discovered(state)).map((item) => materialize(item, state));
}

export function archiveRecordFor(state, id) {
  const definition = ARCHIVE_RECORDS.find((item) => item.id === id && item.discovered(state));
  return definition ? materialize(definition, state) : null;
}

export function renderArchiveIndex(state) {
  const records = archiveRecordsFor(state);
  if (!records.length) return '<p class="archive-empty">NENHUM REGISTRO RECUPERADO</p>';
  return `<div class="archive-records">
    <div class="archive-records__heading"><span>REGISTROS RECUPERADOS</span><strong>${records.length}</strong></div>
    ${records.map((item) => `<button type="button" class="archive-record-link ${item.status === 'ALTERADO' ? 'is-altered' : ''}" data-action="open-archive-record" data-record="${escapeHtml(item.id)}">
      <span><strong>${escapeHtml(item.code)}</strong><small>${escapeHtml(item.type)}</small></span><i>${item.status}</i>
    </button>`).join('')}
  </div>`;
}

export function renderArchiveDocument(state, recordId) {
  const item = archiveRecordFor(state, recordId);
  if (!item) return '';
  return `<article class="archive-document" data-archive-document="${escapeHtml(item.id)}">
    <header class="archive-document__toolbar">
      <button type="button" class="scene-return" data-action="close-archive-record"><kbd>ESC</kbd>FECHAR REGISTRO</button>
      <span>CONSULTA HISTÓRICA · SOMENTE LEITURA</span>
    </header>
    <div class="archive-document__identity"><span>${escapeHtml(item.type)}</span><h1>${escapeHtml(item.code)}</h1><small>VERSÃO NARRATIVA ${String(item.version).padStart(2, '0')}</small></div>
    <dl class="archive-document__metadata">${item.metadata.map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>
    ${item.id === 'evento-1010' && item.version === 2 ? '<p class="archive-document__alteration">CONTEÚDO ALTERADO APÓS INDEXAÇÃO</p>' : ''}
    <div class="archive-document__content">${item.content.map((line) => `<p>${escapeHtml(line)}</p>`).join('')}</div>
    <footer>IDENTIDADE ${escapeHtml(item.id.toUpperCase())} · LEITURA NÃO EXECUTÁVEL · V${item.version}</footer>
  </article>`;
}
