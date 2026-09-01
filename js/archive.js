import { escapeHtml, normalizeAnswer } from './utils.js';

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
      ? ['AUTOR // J. // origem local', 'CONVERSA PROLONGADA // 10:10', 'DESTINATÁRIA // identidade removida', 'PRESENÇA DELA CONFIRMADA DURANTE O EVENTO', 'MOTIVO DO ARQUIVO // CLASSIFICAÇÃO PENDENTE']
      : ['AUTOR // assinatura removida', 'CONVERSA PROLONGADA // 10:10', 'DESTINATÁRIA // não informada', '[ 3 LINHAS RETIDAS PELO AUTOR ]']
  }),
  record({
    id: 'transmissao-04', code: 'TRANSMISSÃO_04', type: 'INTERCEPTAÇÃO',
    discovered: (state) => state.completed.includes('04'),
    metadata: () => [['PORTADORA', 'CANAL 04'], ['CODIFICAÇÃO', 'MORSE'], ['INTEGRIDADE', '81%']],
    content: () => ['PADRÃO // -- . ... .-', 'LEITURA // MESA', 'RECADO // A TELA ERA APENAS O COMEÇO']
  }),
  record({
    id: 'documento-06', code: 'DOCUMENTO_06', type: 'COMPARAÇÃO DE VERSÕES',
    discovered: (state) => state.completed.includes('06'),
    metadata: () => [['VERSÕES', '02'], ['DIVERGÊNCIA', 'EXTENSA'], ['INVARIANTE', 'RECUPERADO']],
    content: () => ['TRECHO QUE O AUTOR NÃO ALTEROU:', 'A DATA ABRE O ARQUIVO']
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
    metadata: () => [['OBJETO', 'LUA'], ['CAMADA', '01 / 01'], ['ESTADO', 'RECUPERADA']],
    content: () => ['OBSERVADOR // REFERÊNCIA EXTERNA', 'ASSINATURA // VX-04', 'ORIGEM MATERIAL CONFIRMADA']
  }),
  record({
    id: 'imagem-receptor-13', code: 'IMAGEM_RECEPTOR_13', type: 'RESÍDUO DE FÓSFORO',
    discovered: (state) => state.completed.includes('13'),
    metadata: () => [['FONTE', 'CANAL 11'], ['ESTADO', 'SEM PORTADORA'], ['QUADROS', '03']],
    content: () => ['RELAÇÃO PRESERVADA // FIM · 01 · COMEÇO', 'DISTÂNCIA // UM VOLUME', 'ORDEM DE LEITURA // ESQUERDA → DIREITA']
  }),
  record({
    id: 'instrucao-15', code: 'INSTRUÇÃO_15', type: 'RESPOSTA DO RELÓGIO',
    discovered: (state) => state.completed.includes('15'),
    metadata: () => [['CALIBRAÇÃO', '03:17'], ['RESPOSTA', 'LIBERADA'], ['DESTINO', 'EXTERNO']],
    content: () => ['03:17 // HORA APLICADA AO SISTEMA', 'ONDE A NOITE DEIXA O QUE VOCÊ PRECISA']
  }),
  record({
    id: 'croma-verde-14', code: 'CROMA_VERDE_14', type: 'LEITURA DE FONTE EXTERNA',
    discovered: (state) => state.flags.greenNodeValidated,
    metadata: () => [['NÓ', '14'], ['OBJETO', 'ASSENTO'], ['AMBIENTE', 'EXTERNO'], ['CANAL PRESERVADO', 'VERDE']],
    content: () => ['SEQUÊNCIA DE POSIÇÃO // 03 · 01 · 04', 'CADEIRA VINCULADA // ORIENTAÇÃO CONFIRMADA', 'FRAGMENTO // △ ○ ⌁', 'DESTINO // MARGEM SOB CÉU ABERTO']
  }),
  record({
    id: 'limiar-17', code: 'MARGEM_17', type: 'REFERÊNCIA EXTERNA SEGURA',
    discovered: (state) => state.flags.yardNodeValidated,
    metadata: () => [['NÓ', '17'], ['ORIGEM', 'ÁREA PRIVADA'], ['ESTADO', 'AUTENTICADO']],
    content: () => ['ORIGEM // MARGEM PRIVADA SOB CÉU ABERTO', 'FRAGMENTO // REPITA O EVENTO NOS DOIS CONTROLES', 'VALOR // CONSULTAR EVENTO_1010', 'DESTINO // RECEPTOR VX-11']
  }),
  record({
    id: 'volume-00', code: 'VOLUME_NÃO_INDEXADO', type: 'DIVERGÊNCIA ESPACIAL',
    discovered: (state) => state.flags.houseAnomalyRevealed,
    version: (state) => state.flags.roomNodeValidated ? 2 : 1,
    metadata: (version) => [['ÁREA CALCULADA', '118,6 m²'], ['ÁREA INDEXADA', '107,4 m²'], ['DIFERENÇA', '+11,2 m²'], ['LEITURAS', version === 2 ? '02' : '01']],
    content: (version) => version === 2
      ? ['ORIGEM // NÃO INDEXADA', 'LEITURA ATUAL // SESSÃO LOCAL', 'LEITURA ANTERIOR // 03:17', 'A LEITURA ANTERIOR NÃO POSSUI EVENTO DE ENTRADA']
      : ['ORIGEM // NÃO INDEXADA', 'OCUPAÇÃO // INCONSISTENTE', 'INTERFACE // INSUFICIENTE', 'ACESSO // FÍSICO']
  }),
  record({
    id: 'portadora-1010', code: 'PORTADORA_1010', type: 'INTERCEPTAÇÃO',
    discovered: (state) => state.completed.includes('17'),
    metadata: () => [['CANAL', '10'], ['NÍVEL', '10'], ['AJUSTE FINO', '+3'], ['SINCRONIA', 'FIXADA']],
    content: () => ['EVENTO_1010 // PORTADORA ESTÁVEL', 'PICO LOCAL // +3', 'A FREQUÊNCIA RESPONDE À MESMA DATA', 'PRÓXIMO BLOCO // UMA LEMBRANÇA SEM NOME']
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
    content: () => ['CABEÇALHO // “TÃO FÁCIL SE APAIXONAR…”', 'CANAL EXTERNO // AUTENTICADO', 'NÓ_00 // IMPACTOS 01 · 02 · 03', 'ÍNDICE ÚTIL // SEGUNDA MARCA']
  }),
  record({
    id: 'archive-170491', code: 'ARCHIVE_170491', type: 'MONTAGEM ÓRFÃ',
    discovered: (state) => state.completed.includes('05'),
    metadata: () => [['CRIADO', '17 / 04 / 91'], ['DISPOSITIVO', 'AUSENTE'], ['ESTADO', 'MONTADO SOMENTE PARA LEITURA']],
    content: () => ['ÍNDICE // 170491', 'CONTEÚDO // NÃO RECUPERADO', 'A INFORMAÇÃO PODE ADQUIRIR CONTEXTO EM UMA LEITURA FUTURA']
  }),
  record({
    id: 'checksum-520', code: 'CADEIA_520', type: 'CHECKSUM RELACIONAL',
    discovered: (state) => state.completed.includes('20'),
    metadata: () => [['MONTAGEM', 'FASE 05'], ['CÔMODO', 'FASE 20'], ['RESULTADO', '520']],
    content: () => ['05 // MONTAGEM ÓRFÃ', '20 // CÔMODO ZERO', 'CHECKSUM PRESERVADO // 520']
  }),
  record({
    id: 'endereco-1314', code: 'ENDERECO_1314', type: 'CABEÇALHO DE PERMANÊNCIA',
    discovered: (state) => state.completed.includes('22'),
    metadata: () => [['ORIGEM', 'NODE_11'], ['CABEÇALHO', '13 · 14'], ['ENDEREÇO', '1314']],
    content: () => ['ARMAZENAMENTO // HISTÓRIAS', 'ENDEREÇO DE PERMANÊNCIA // 1314', 'INTERPRETAÇÃO // NÃO SOLICITADA']
  }),
  record({
    id: 'fonte-03', code: 'FONTE_03', type: 'ANOMALIA DE AQUISIÇÃO',
    discovered: (state) => state.flags.roomNodeValidated,
    metadata: () => [['FONTES ESPERADAS', '02'], ['FONTES DETECTADAS', '03'], ['ORIGEM', 'NÃO CLASSIFICADA']],
    content: () => ['ENTIDADE A // PRESENTE', 'ENTIDADE B // PRESENTE', 'ENTIDADE C // HIPÓTESE NÃO CONFIRMADA', 'PRIMEIRA LEITURA // 03:17']
  }),
  record({
    id: 'adjacencia-23', code: 'ORIGEM_TEMPORAL_1010', type: 'AJUSTE DE SISTEMA',
    discovered: (state) => state.completed.includes('23'),
    metadata: () => [['CALIBRAÇÃO ANTERIOR', '03:17'], ['ORIGEM RESTAURADA', '10:10'], ['REFERÊNCIA', 'EVENTO_1010']],
    content: () => ['O RELÓGIO RESPONDEU À ORIGEM DO EVENTO', 'HORA RESTAURADA // 10:10', 'CADEIAS FINAIS // LIBERADAS']
  }),
  record({
    id: 'chaves-24', code: 'CHAVES_COMPOSTAS', type: 'CHECKSUM RELACIONAL',
    discovered: (state) => state.unlocked.includes('24'),
    metadata: () => [['CADEIA A', '520'], ['CADEIA B', '1314'], ['OPERAÇÃO', 'CONCATENAÇÃO']],
    content: () => ['520 // DADO RECUPERADO', '1314 // ENDEREÇO DE PERMANÊNCIA', 'INTERPRETAÇÃO // BLOQUEADA ATÉ A EXECUÇÃO']
  })
]);

const SEARCH_ECHOES = Object.freeze([
  { terms: ['lua'], code: 'OBJETO_LUA', type: 'REFERÊNCIA MATERIAL', text: 'Duas camadas registradas. Uma leitura ainda não ocorreu.', after: '08' },
  { terms: ['10 10', '1010', '10:10'], code: 'EVENTO_1010', type: 'RECORRÊNCIA TEMPORAL', text: 'O mesmo valor aparece como data, horário e calibração.', after: '02' },
  { terms: ['verde', 'assento', 'cadeira'], code: 'CROMA_RESIDUAL', type: 'FONTE EXTERNA', text: 'ASSENTO // EXTERNO. Apenas o canal verde preservou informação.', after: '13' },
  { terms: ['quarto', 'comodo', 'cômodo', '0317', '03:17'], code: 'VOLUME_NAO_INDEXADO', type: 'DIVERGÊNCIA ESPACIAL', text: 'Área calculada excede a planta em 11,2 m². Última leitura: 03:17.', after: '19' },
  { terms: ['quintal', 'ceu', 'céu', 'margem'], code: 'MARGEM_PRIVADA', type: 'RELAÇÃO ESPACIAL', text: 'Cobertura ausente. Ainda dentro do limite preparado.', after: '17' },
  { terms: ['rayssa'], code: 'DESTINATARIA_REMOVIDA', type: 'METADADO INSTÁVEL', text: 'Nenhum resultado.', after: '10', contaminated: true }
]);

function reached(state, id) {
  return state.unlocked.some((candidate) => Number(candidate) >= Number(id));
}

export function archiveSearchResults(state, query) {
  const normalized = normalizeAnswer(query);
  if (!normalized) return [];
  const recordHits = archiveRecordsFor(state).filter((item) => {
    const haystack = normalizeAnswer([item.code, item.type, ...item.metadata.flat(), ...item.content].join(' '));
    return haystack.includes(normalized);
  }).map((item) => ({ code: item.code, type: item.type, text: item.content[0], recordId: item.id }));
  const echoHits = SEARCH_ECHOES.filter((item) => reached(state, item.after) && item.terms.some((term) => normalizeAnswer(term) === normalized));
  return [...recordHits, ...echoHits].slice(0, 8);
}

export function renderArchiveSearch(state) {
  const query = state.ui?.archiveQuery || '';
  const results = archiveSearchResults(state, query);
  return `<section class="archive-search" aria-label="Pesquisa do arquivo">
    <form class="archive-search__form" data-archive-search>
      <label for="archive-query">CONSULTA POR PALAVRA, OBJETO OU HORÁRIO</label>
      <div><input id="archive-query" name="query" value="${escapeHtml(query)}" autocomplete="off" spellcheck="false" placeholder="ex.: lua, 10:10"><button type="submit">PESQUISAR</button></div>
    </form>
    ${query ? `<div class="archive-search__results"><header><span>CONSULTA // ${escapeHtml(query.toUpperCase())}</span><strong>${results.length} CORRESPONDÊNCIA${results.length === 1 ? '' : 'S'}</strong></header>${results.length ? results.map((item) => item.recordId
      ? `<button type="button" data-action="open-archive-record" data-record="${escapeHtml(item.recordId)}"><i>${escapeHtml(item.type)}</i><strong>${escapeHtml(item.code)}</strong><span>${escapeHtml(item.text)}</span></button>`
      : `<article class="${item.contaminated ? 'is-contaminated' : ''}"><i>${escapeHtml(item.type)}</i><strong>${escapeHtml(item.code)}</strong><span>${escapeHtml(item.text)}</span></article>`).join('') : '<p>NENHUMA ENTRADA INDEXADA. O ARQUIVO NÃO COMPLETA PALAVRAS.</p>'}</div>` : ''}
  </section>`;
}

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
