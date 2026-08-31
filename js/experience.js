import { GAME_CONFIG } from './config.js';

const ACT_NAMES = {
  1: 'INTRUSÃO',
  2: 'O ARQUIVO MENTE',
  3: 'CONTAMINAÇÃO HUMANA',
  4: 'RECONHECIMENTO',
  5: 'RELAÇÃO'
};

const SYSTEM_STATES = {
  1: 'OBSERVANDO',
  2: 'DESSINCRONIZADO',
  3: 'CORROMPIDO',
  4: 'RECONHECIMENTO',
  5: 'FUSÃO'
};

const OPERATOR_ROLES = {
  1: 'OPERADOR EXTERNO',
  2: 'OBSERVADOR',
  3: 'TESTEMUNHA',
  4: 'RAYSSA? // CORRESPONDÊNCIA PARCIAL',
  5: 'RAYSSA // FONTE RECONHECIDA'
};

export function deriveExperience(puzzle, state) {
  const recovered = state.flags.finalRecovered;
  const initialStable = puzzle.id === '01' && !state.flags.initialized;
  return {
    act: puzzle.act,
    actName: ACT_NAMES[puzzle.act],
    systemState: recovered || initialStable ? 'ESTÁVEL' : SYSTEM_STATES[puzzle.act],
    operatorRole: recovered ? `${GAME_CONFIG.playerName.toUpperCase()} // IDENTIFICADA` : OPERATOR_ROLES[puzzle.act],
    corruption: recovered ? 0 : puzzle.corruption,
    activeArea: puzzle.area,
    receiverAvailable: state.unlocked.some((id) => Number(id) >= 3),
    evidenceAvailable: state.unlocked.some((id) => Number(id) >= 2),
    identityAvailable: state.unlocked.some((id) => Number(id) >= 10),
    coldStorageAvailable: state.unlocked.some((id) => Number(id) >= 5)
  };
}

export function applyExperienceToDocument(experience) {
  document.body.dataset.act = String(experience.act);
  document.body.dataset.corruption = String(experience.corruption);
  document.body.dataset.activeArea = experience.activeArea;
  document.body.dataset.systemState = experience.systemState.toLowerCase().replaceAll(' ', '-');
  document.body.dataset.sceneFamily = experience.sceneFamily || 'system';
}
