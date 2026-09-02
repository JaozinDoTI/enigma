export const GAME_CONFIG = Object.freeze({
  systemName: 'RECUPERACAO_1010',
  importantDate: '2025-10-10T00:00:00-03:00',
  playerName: 'Rayssa',
  protagonistName: 'João',
  locationAnswer: 'parquinho da beira-mar',
  locationAliases: ['parquinho', 'parquinho da beira mar', 'beira mar', 'parquinho beira mar'],
  memoryAnswer: 'curitiba',
  memoryAliases: ['curitiba', 'gato curitiba', 'gato de pelúcia', 'gato de pelucia', 'objeto c'],
  finalAnswer: 'nós',
  finalAliases: ['nos', 'nós', 'a gente', 'nós dois'],
  greenNodeCode: 'VX-VERDE-0314',
  yardNodeCode: 'VX-MARGEM-1703',
  roomNodeCode: 'VX-QUARTO-0317',
  booksNodeCode: 'VX-LIVROS-0214',
  bookPageTargets: Object.freeze({
    'Teto para Dois': null,
    'É Assim que Acaba': null,
    'É Assim que Começa': null,
    'A Maldição do Ex': null,
    'Cidade da Lua Crescente': null
  }),
  roomLayout: {
    bed: { x: 32, y: 63 },
    shelf: { x: 33, y: 14 },
    desk: { x: 69, y: 65 },
    bedside: { x: 18, y: 66 },
    moon: { x: 62, y: 18 }
  },
  metaOrder: ['1010', 'tv', 'curitiba', 'lua', 'parquinho', 'livros', 'musica'],
  songTitle: 'So Easy to Fall in Love',
  musicUrl: '',
  finalVideoUrl: '',
  finalSecretUrl: '',
  finalMessage: 'Se você chegou até aqui, provavelmente já percebeu que eu compliquei isso muito mais do que precisava.',
  gallery: [],
  devMode: false,
  inactivityHintMinutes: 12,
  version: 5
});

export const ROUTES = Object.freeze({
  greenQr: 'node.html?node=green',
  yardQr: 'node.html?node=yard',
  roomQr: 'node.html?node=room',
  booksQr: 'node.html?node=books'
});
