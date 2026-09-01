import { puzzleFor } from './catalog.js';

const DEFAULT_UI = Object.freeze({
  inputLabel: '', placeholder: '', submitLabel: 'VERIFICAR', format: null, formatHint: '',
  wrongFeedback: 'A operação foi aceita, mas o conteúdo não corresponde ao registro esperado.',
  status: () => 'AGUARDANDO OPERAÇÃO'
});

export function clarityFor(id) {
  const puzzle = puzzleFor(id);
  return Object.freeze({
    narrative: puzzle.narrative,
    objective: puzzle.objective,
    actionHint: puzzle.interaction,
    interaction: puzzle.interaction,
    successMeaning: puzzle.successMeaning,
    ...DEFAULT_UI,
    ...puzzle.ui
  });
}

export function validateInputFormat(id, value) {
  const format = clarityFor(id).format;
  return !format || format.test(String(value || '').trim());
}
