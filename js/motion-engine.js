const FALLBACKS = { instant: 90, fast: 160, normal: 260, slow: 420, dramatic: 720, sequence: 1200 };
export const MOTION_SCOPE = Object.freeze({ LOCAL: 'local', DEVICE: 'device', SCENE: 'scene', GLOBAL: 'global' });

function parseTime(value, fallback) {
  const normalized = value.trim();
  if (normalized.endsWith('ms')) return Number.parseFloat(normalized);
  if (normalized.endsWith('s')) return Number.parseFloat(normalized) * 1000;
  return fallback;
}

class MotionEngine {
  constructor() {
    this.timers = new Map();
    this.sequences = new Map();
    this.sequenceId = 0;
    this.registerDefaults();
  }

  get reduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  duration(level = 'normal') {
    if (this.reduced) return 0;
    const fallback = FALLBACKS[level] ?? FALLBACKS.normal;
    const raw = getComputedStyle(document.documentElement).getPropertyValue(`--motion-${level}`);
    return parseTime(raw, fallback);
  }

  emit(name, detail = {}) {
    document.dispatchEvent(new CustomEvent(name, { detail }));
  }

  cancel(key) {
    const timer = this.timers.get(key);
    if (timer) window.clearTimeout(timer);
    this.timers.delete(key);
  }

  schedule(key, callback, delay) {
    this.cancel(key);
    const timer = window.setTimeout(() => {
      this.timers.delete(key);
      callback();
    }, delay);
    this.timers.set(key, timer);
    return timer;
  }

  wait(level = 'normal') {
    return new Promise((resolve) => window.setTimeout(resolve, this.duration(level)));
  }

  pause(milliseconds, { reduce = true } = {}) {
    return new Promise((resolve) => window.setTimeout(resolve, reduce && this.reduced ? 0 : milliseconds));
  }

  register(name, definition, { scope = MOTION_SCOPE.LOCAL } = {}) {
    this.sequences.set(name, { definition, scope });
  }

  resolveTarget(scope, requestedTarget) {
    if (scope === MOTION_SCOPE.GLOBAL) return document.body;
    if (scope === MOTION_SCOPE.DEVICE) {
      return requestedTarget?.closest?.('[data-motion-scope="device"]')
        || (requestedTarget?.matches?.('[data-motion-scope="device"]') ? requestedTarget : null);
    }
    if (scope === MOTION_SCOPE.SCENE) {
      return requestedTarget?.closest?.('[data-motion-scope="scene"]')
        || (requestedTarget?.matches?.('[data-motion-scope="scene"]') ? requestedTarget : null);
    }
    return requestedTarget || null;
  }

  async play(name, context = {}) {
    const sequence = this.sequences.get(name);
    if (!sequence) return false;
    const target = this.resolveTarget(sequence.scope, context.target);
    if (!target) {
      console.warn(`[Motion] Evento "${name}" ignorado: target ${sequence.scope} ausente.`);
      return false;
    }
    const id = ++this.sequenceId;
    const resolvedContext = { ...context, target, id, scope: sequence.scope };
    this.emit('motion:start', { name, ...resolvedContext });
    await sequence.definition({ ...resolvedContext, reduced: this.reduced, engine: this });
    this.emit('motion:complete', { name, ...resolvedContext });
    return true;
  }

  pulse(target, className, level = 'normal') {
    if (!target) return Promise.resolve();
    const pulseId = ++this.sequenceId;
    target.classList.remove(className);
    requestAnimationFrame(() => target.classList.add(className));
    return new Promise((resolve) => this.schedule(`pulse-${className}-${pulseId}`, () => {
      target.classList.remove(className);
      resolve();
    }, this.duration(level)));
  }

  registerDefaults() {
    const signalEvents = {
      'screen-tear': ['crt-event--tear', 'fast', MOTION_SCOPE.DEVICE],
      'horizontal-roll': ['crt-event--roll', 'slow', MOTION_SCOPE.DEVICE],
      'vertical-desync': ['crt-event--desync', 'normal', MOTION_SCOPE.SCENE],
      'frame-ghost': ['crt-event--ghost', 'normal', MOTION_SCOPE.LOCAL],
      'phosphor-burn': ['crt-event--burn', 'slow', MOTION_SCOPE.DEVICE],
      'signal-recovery': ['crt-event--recovery', 'slow', MOTION_SCOPE.DEVICE],
      'system-signal-loss': ['crt-event--loss', 'dramatic', MOTION_SCOPE.GLOBAL],
      'system-corruption': ['motion-corruption', 'slow', MOTION_SCOPE.GLOBAL]
    };
    Object.entries(signalEvents).forEach(([name, [className, level, scope]]) => {
      this.register(name, ({ target, engine }) => engine.pulse(target, className, level), { scope });
    });
    this.register('receiver-power-off', ({ target, engine }) => engine.pulse(target, 'receiver-motion--power-off', 'dramatic'), { scope: MOTION_SCOPE.DEVICE });
    this.register('receiver-power-on', ({ target, engine }) => engine.pulse(target, 'receiver-motion--power-on', 'slow'), { scope: MOTION_SCOPE.DEVICE });
    this.register('receiver-channel-loss', ({ target, engine }) => engine.pulse(target, 'crt-event--tear', 'normal'), { scope: MOTION_SCOPE.DEVICE });
    this.register('receiver-channel-lock', ({ target, engine }) => engine.pulse(target, 'receiver-motion--signal-lock', 'slow'), { scope: MOTION_SCOPE.DEVICE });
    this.register('hard-reset', ({ target, swap, engine }) => new Promise((resolve) => {
      target.classList.remove('crt-event--hard-reset');
      requestAnimationFrame(() => target.classList.add('crt-event--hard-reset'));
      const midpoint = engine.reduced ? 0 : Math.round(engine.duration('dramatic') * .42);
      engine.schedule('hard-reset-swap', () => {
        swap?.();
        engine.schedule('hard-reset-finish', () => {
          target.classList.remove('crt-event--hard-reset');
          resolve();
        }, engine.reduced ? 0 : Math.round(engine.duration('dramatic') * .58));
      }, midpoint);
    }), { scope: MOTION_SCOPE.GLOBAL });
    this.register('scene-transition', ({ target, from = 'system', to = 'system', swap, engine }) => new Promise((resolve) => {
      const family = to === 'system' ? 'return' : to;
      const className = `scene-transition--${family}`;
      target.classList.remove(className);
      requestAnimationFrame(() => target.classList.add(className));
      const duration = engine.duration('dramatic');
      engine.schedule('scene-transition-swap', () => {
        swap?.();
        engine.schedule('scene-transition-finish', () => {
          target.classList.remove(className);
          resolve();
        }, engine.reduced ? 0 : Math.round(duration * .54));
      }, engine.reduced ? 0 : Math.round(duration * .46));
    }), { scope: MOTION_SCOPE.GLOBAL });
    this.register('boot-sequence', ({ target, engine }) => new Promise((resolve) => {
      if (!target) return resolve();
      target.setAttribute('aria-hidden', 'false');
      target.classList.add('is-active');
      engine.schedule('boot-sequence-finish', () => {
        target.classList.add('is-complete');
        engine.schedule('boot-sequence-reset', () => {
          target.classList.remove('is-active', 'is-complete');
          target.setAttribute('aria-hidden', 'true');
          resolve();
        }, engine.duration('normal'));
      }, engine.reduced ? 0 : 2300);
    }));
    this.register('record-corruption', async ({ target, engine }) => {
      engine.emit('motion:impact', { kind: 'corruption' });
      await engine.pulse(target, 'motion-corruption', 'slow');
    });
    this.register('narrative-loading', ({ target, label, engine }) => new Promise((resolve) => {
      if (!target) return resolve();
      const text = target.querySelector('span');
      if (text && label) text.textContent = label;
      target.hidden = false;
      target.classList.add('is-active');
      engine.schedule('narrative-loading-finish', () => {
        target.classList.remove('is-active');
        target.hidden = true;
        resolve();
      }, engine.duration('slow'));
    }));
    this.register('entity-detected', async ({ target, engine }) => {
      await engine.pulse(target, 'motion-entity-detected', 'fast');
    });
    this.register('entity-conflict', ({ target, feedback, engine }) => new Promise((resolve) => {
      target?.classList.add('is-system-conflict');
      if (feedback) feedback.textContent = 'RESPOSTA CORRETA';
      engine.schedule('entity-conflict-denial', () => {
        if (feedback) feedback.textContent = 'RESPOSTA INCORRETA';
      }, engine.reduced ? 0 : 330);
      engine.schedule('entity-conflict-resolve', () => {
        target?.classList.remove('is-system-conflict');
        if (feedback) feedback.textContent = 'MEMÓRIA CONFIRMADA. ... sério?';
        engine.emit('entity:detected', { source: 'memory-conflict' });
        resolve();
      }, engine.reduced ? 0 : 760);
    }));
    this.register('tv-afterimage', async ({ target, engine }) => {
      engine.emit('tv:afterimage');
      await Promise.all([
        engine.pulse(target, 'motion-afterimage', 'dramatic'),
        engine.play('phosphor-burn', { target })
      ]);
    }, { scope: MOTION_SCOPE.DEVICE });
    this.register('memory-reconstruction', async ({ target, engine }) => {
      await engine.pulse(target, 'motion-reconstruction', 'dramatic');
      engine.emit('memory:restored');
    });
    this.register('system-desync', async ({ target, engine }) => {
      await engine.pulse(target, 'motion-desync', 'slow');
      engine.emit('system:mutation', { state: 'desync' });
    }, { scope: MOTION_SCOPE.SCENE });
    this.register('object-impossible', async ({ target, engine }) => {
      engine.emit('motion:impact', { kind: 'impossible' });
      await engine.pulse(target, 'is-dismantling', 'dramatic');
    });
    this.register('relation-merge', async ({ target, engine }) => {
      engine.emit('motion:impact', { kind: 'merge' });
      if (target?.matches?.('[data-merge-layer]')) target.setAttribute('aria-hidden', 'false');
      await engine.pulse(target, 'is-merging', 'sequence');
      if (target?.matches?.('[data-merge-layer]')) target.setAttribute('aria-hidden', 'true');
    });
    this.register('silent-observation', ({ target, label = 'ENTIDADE B: ENCONTRADA', engine }) => new Promise((resolve) => {
      if (!target) return resolve();
      const original = target.textContent;
      target.textContent = label;
      target.classList.add('motion-entity-detected');
      engine.emit('entity:detected');
      engine.schedule('silent-observation-reset', () => {
        target.textContent = original;
        target.classList.remove('motion-entity-detected');
        resolve();
      }, engine.reduced ? 240 : 80);
    }));
    this.register('receiver-observation', ({ target, engine }) => new Promise((resolve) => {
      if (!target) return resolve();
      target.classList.add('is-observing');
      const screen = target.querySelector('.receiver-summary strong');
      const original = screen?.textContent;
      if (screen) screen.textContent = 'CAN B';
      engine.schedule('receiver-observation-reset', () => {
        if (screen) screen.textContent = original;
        target.classList.remove('is-observing');
        resolve();
      }, engine.reduced ? 500 : 400);
    }));
  }
}

export const Motion = new MotionEngine();
