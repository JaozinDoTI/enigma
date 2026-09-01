import { Motion } from './motion-engine.js';

const IMPACT_COPY = {
  success: 'REGISTRO ESTABILIZADO',
  error: 'ANOMALIA DETECTADA',
  denied: 'ACESSO NEGADO',
  discovery: 'NOVA CAMADA ENCONTRADA'
};

class UIFeedbackController {
  constructor() {
    this.transitionSequence = 0;
    this.impactSequence = 0;
  }

  get reducedMotion() {
    return Motion.reduced;
  }

  duration(level = 'normal') {
    return Motion.duration(level);
  }

  cancel(key) {
    Motion.cancel(key);
  }

  schedule(key, callback, delay) {
    return Motion.schedule(key, callback, delay);
  }

  wait(level = 'normal') {
    return Motion.wait(level);
  }

  toast(message, { kind = 'info', duration = 3200 } = {}) {
    const region = document.querySelector('[data-toast-region]');
    if (!region) return;
    const node = document.createElement('div');
    const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    node.className = `toast toast--${kind} is-entering`;
    node.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    node.textContent = message;
    region.append(node);
    this.schedule(id, () => {
      node.classList.remove('is-entering');
      node.classList.add('is-leaving');
      this.schedule(`${id}-remove`, () => node.remove(), this.duration('fast'));
    }, duration);
  }

  message(message, kind = 'info') {
    const target = document.querySelector('[data-feedback]');
    if (!target) {
      this.toast(message, { kind });
      return null;
    }
    target.className = `feedback ${kind} is-revealed`;
    target.textContent = message;
    return target;
  }

  clearFieldState(input) {
    const form = input?.closest('[data-answer], [data-node-auth]');
    form?.classList.remove('is-error', 'is-success');
    input?.removeAttribute('aria-invalid');
  }

  error(message, { critical = false, target } = {}) {
    const form = target?.matches?.('form') ? target : target?.closest?.('[data-answer], [data-node-auth]');
    const component = form || target;
    component?.classList.remove('is-success');
    component?.classList.add('is-error');
    const input = form?.querySelector('.answer-input') || (target?.matches?.('.answer-input') ? target : null);
    input?.setAttribute('aria-invalid', 'true');
    this.message(message, 'error');
    Motion.emit('motion:error', { message, critical });
    if (critical) this.screenImpact('error', message, { level: 'dramatic' });
  }

  success(message, { impact = false, target } = {}) {
    const component = target || document.querySelector('[data-answer]') || document.querySelector('.main-panel');
    component?.classList.remove('is-error');
    component?.classList.add('is-success');
    component?.querySelector?.('.answer-input')?.removeAttribute('aria-invalid');
    if (document.querySelector('[data-feedback]')) this.message(message, 'good');
    this.toast(message, { kind: 'success' });
    Motion.emit('motion:complete', { name: 'puzzle-success', message });
    if (impact) this.screenImpact('success', message, { level: impact === 'dramatic' ? 'dramatic' : 'slow' });
  }

  reveal(target, { kind = 'discovery' } = {}) {
    if (!target) return;
    target.dataset.revealKind = kind;
    target.classList.add('is-revealed');
  }

  screenImpact(kind, message, { level = 'slow' } = {}) {
    const layer = document.querySelector('[data-screen-feedback]');
    if (!layer) return;
    this.cancel('screen-impact');
    this.cancel('screen-impact-reset');
    const sequence = ++this.impactSequence;
    const kicker = layer.querySelector('[data-screen-feedback-kicker]');
    const content = layer.querySelector('[data-screen-feedback-message]');
    layer.className = `screen-feedback screen-feedback--${kind}`;
    layer.setAttribute('aria-hidden', 'false');
    if (kicker) kicker.textContent = IMPACT_COPY[kind] || IMPACT_COPY.discovery;
    if (content) content.textContent = message;
    const visibleFor = Math.max(this.duration(level), 560);
    layer.style.setProperty('--impact-duration', `${visibleFor}ms`);
    requestAnimationFrame(() => {
      if (sequence === this.impactSequence) layer.classList.add('is-active');
    });
    this.schedule('screen-impact', () => {
      if (sequence !== this.impactSequence) return;
      layer.classList.remove('is-active');
      this.schedule('screen-impact-reset', () => {
        if (sequence !== this.impactSequence) return;
        layer.setAttribute('aria-hidden', 'true');
        if (content) content.textContent = '';
      }, this.duration('normal'));
    }, visibleFor);
  }

  async transition(root, commit) {
    const panel = root.querySelector('.main-panel');
    const sequence = ++this.transitionSequence;
    if (!panel || this.reducedMotion) {
      commit();
      return;
    }
    root.classList.add('is-transitioning');
    root.setAttribute('aria-busy', 'true');
    panel.classList.remove('is-entering', 'scene-enter');
    panel.classList.add('is-leaving');
    await this.wait('normal');
    if (sequence !== this.transitionSequence) return;
    commit();
    root.classList.remove('is-transitioning');
    root.removeAttribute('aria-busy');
  }

  cancelTransition() {
    this.transitionSequence += 1;
  }
}

export const uiFeedback = new UIFeedbackController();
