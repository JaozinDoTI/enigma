export const GAME_CONFIG = Object.freeze({
  systemName: 'RECUPERACAO_1010',
  importantDate: '2025-10-10T00:00:00-03:00',
  playerName: 'Rayssa',
  protagonistName: 'João',
  locationAnswer: 'parquinho da beira-mar',
  locationAliases: ['parquinho', 'parquinho da beira mar', 'beira mar', 'parquinho beira mar'],
  memoryAnswer: 'mullet',
  memoryAliases: ['mullet', 'corte mullet', 'o mullet'],
  finalAnswer: 'nós',
  finalAliases: ['nos', 'nós', 'a gente', 'nós dois'],
  deskNodeCode: 'VX-MESA-1010',
  yardNodeCode: 'VX-LIMIAR-1010',
  booksNodeCode: 'VX-LIVROS-0214',
  bookPositions: [2, 5, 1],
  bookFragmentToken: 'NIGHT-251',
  roomLayout: {
    bed: { x: 32, y: 63 },
    shelf: { x: 33, y: 14 },
    desk: { x: 69, y: 65 },
    bedside: { x: 18, y: 66 },
    moon: { x: 62, y: 18 }
  },
  metaOrder: ['1010', 'tv', 'mullet', 'lua', 'parquinho', 'livros', 'musica'],
  songTitle: 'So Easy to Fall in Love',
  musicUrl: '',
  finalVideoUrl: '',
  finalSecretUrl: '',
  finalMessage: 'Se você chegou até aqui, provavelmente já percebeu que eu compliquei isso muito mais do que precisava.',
  gallery: [],
  devMode: false,
  inactivityHintMinutes: 12,
  storageKey: 'gameState',
  version: 3
});

export const ROUTES = Object.freeze({
  deskQr: 'node.html?node=desk',
  yardQr: 'node.html?node=yard',
  booksQr: 'node.html?node=books'
});
