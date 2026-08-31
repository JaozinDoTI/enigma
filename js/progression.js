import { GAME_CONFIG } from './config.js';
import { answerMatches } from './utils.js';

const ANSWERS = Object.freeze({
  '04': ['mesa','escrivaninha'],
  '05': [GAME_CONFIG.deskNodeCode],
  '06': ['data','a data abre o arquivo','data abre arquivo'],
  '08': ['lua'],
  '09': ['vx 04','vx04','voce ja passou por isso'],
  '12': [GAME_CONFIG.memoryAnswer,...GAME_CONFIG.memoryAliases],
  '14': [GAME_CONFIG.bookFragmentToken],
  '16': ['vx 11','vx11','receptor','tv','televisao'],
  '18': [GAME_CONFIG.locationAnswer,...GAME_CONFIG.locationAliases],
  '22': [GAME_CONFIG.booksNodeCode],
  '23': ['vx 02','vx02','mullet','conflito'],
  '24': [GAME_CONFIG.finalAnswer,...GAME_CONFIG.finalAliases]
});

const COMPLETIONS = Object.freeze({
  '04': { next: ['05'], message: 'SINAL INTERPRETADO: MESA' },
  '05': { next: ['06'], message: 'NÓ 02 ENCONTRADO', mutate: (state) => { state.flags.deskNodeValidated = true; state.physicalNodes.desk = 'validated'; } },
  '06': { next: ['07'], message: 'CONTEÚDO INVARIANTE EXTRAÍDO', delay: 850, motion: 'document' },
  '08': { next: ['09'], message: 'REFERÊNCIA DO OBJETO: LUA' },
  '09': { next: ['10'], message: 'PRIMEIRA CAMADA DO OBSERVADOR RECUPERADA', mutate: (state) => { state.flags.moonFirstFound = true; } },
  '12': { next: ['13'], message: 'MEMÓRIA CONFIRMADA. A ENTIDADE B CONTINUA NEGANDO.', delay: 1100, motion: 'entity-conflict', mutate: (state) => { state.flags.mulletConfirmed = true; } },
  '14': { next: ['15'], message: 'QUATRO FRAGMENTOS FÍSICOS REGISTRADOS', mutate: (state) => { state.flags.booksFound = true; } },
  '16': { next: ['17'], message: 'NÓ NOTURNO CONFIRMADO', mutate: (state) => { state.flags.bedsideFound = true; } },
  '18': { next: ['19'], message: 'LOCALIZAÇÃO RECUPERADA: PARQUINHO DA BEIRA-MAR', delay: 900, motion: 'location', mutate: (state) => { state.flags.locationRecovered = true; } },
  '22': { next: ['23'], message: 'NÓ 11 ENCONTRADO', mutate: (state) => { state.flags.booksNodeValidated = true; state.physicalNodes.books = 'validated'; } },
  '23': { next: ['24'], message: 'A SEGUNDA CAMADA ESTEVE PRESENTE O TEMPO TODO', mutate: (state) => { state.flags.moonSecondFound = true; } },
  '24': { next: ['25'], message: 'RELAÇÃO IDENTIFICADA: NÓS', delay: 1250, motion: 'merge', mutate: (state) => { state.flags.finalRecovered = true; } }
});

export function isAcceptedAnswer(id, answer) {
  return answerMatches(answer, ANSWERS[id] || []);
}

export function completionFor(id) {
  return COMPLETIONS[id] || null;
}
