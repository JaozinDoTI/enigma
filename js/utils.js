export function normalizeAnswer(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function answerMatches(value, accepted = []) {
  const normalized = normalizeAnswer(value);
  return accepted.some((candidate) => normalizeAnswer(candidate) === normalized);
}

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;'
  })[character]);
}

export function formatDuration(milliseconds) {
  const total = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = String(Math.floor(total / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const seconds = String(total % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function unique(items) {
  return [...new Set(items)];
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function daysSince(dateString) {
  const start = new Date(dateString);
  const now = new Date();
  const delta = Math.max(0, now - start);
  return {
    days: Math.floor(delta / 86400000),
    hours: Math.floor((delta % 86400000) / 3600000),
    minutes: Math.floor((delta % 3600000) / 60000),
    seconds: Math.floor((delta % 60000) / 1000)
  };
}

export function shuffledStable(items, seed = 17) {
  return [...items].sort((a, b) => {
    const left = String(a).split('').reduce((sum, char) => sum + char.charCodeAt(0) * seed, 0);
    const right = String(b).split('').reduce((sum, char) => sum + char.charCodeAt(0) * seed, 0);
    return (left % 97) - (right % 97);
  });
}
