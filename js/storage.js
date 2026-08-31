import { GAME_CONFIG } from './config.js';

export function loadStoredState() {
  try {
    const raw = localStorage.getItem(GAME_CONFIG.storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== GAME_CONFIG.version) {
      localStorage.removeItem(GAME_CONFIG.storageKey);
      return null;
    }
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (error) {
    console.warn('RECOVERY storage unreadable.', error);
    return null;
  }
}

export function saveStoredState(state) {
  try {
    localStorage.setItem(GAME_CONFIG.storageKey, JSON.stringify(state));
  } catch (error) {
    console.warn('RECOVERY storage unavailable.', error);
  }
}

export function clearStoredState() {
  localStorage.removeItem(GAME_CONFIG.storageKey);
}
