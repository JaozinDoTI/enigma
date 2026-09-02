import { AUDIO_BUSES, AUDIO_ENVIRONMENTS, AUDIO_MANIFEST } from './manifest.js';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const choose = (items) => items?.length ? items[Math.floor(Math.random() * items.length)] : null;

export const AudioEngine = class AudioEngine {
  constructor() {
    this.context = null;
    this.master = null;
    this.compressor = null;
    this.buses = new Map();
    this.busLevels = new Map(Object.entries(AUDIO_BUSES));
    this.masterVolume = .65;
    this.muted = false;
    this.noiseBuffer = null;
    this.environment = null;
    this.environmentName = 'system';
    this.desiredEnvironment = 'system';
    this.receiverNoiseGain = null;
    this.receiverLocked = false;
    this.active = new Map();
  }

  get unlocked() { return Boolean(this.context && this.context.state === 'running'); }

  load(names = Object.keys(AUDIO_MANIFEST)) {
    const requested = Array.isArray(names) ? names : [names];
    return Promise.resolve(requested.filter((name) => Boolean(AUDIO_MANIFEST[name])));
  }

  async unlock({ startEnvironment = true } = {}) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;
    if (!this.context) this.createGraph(new AudioContextClass());
    if (this.context.state === 'suspended') await this.context.resume();
    if (startEnvironment && this.unlocked && !this.environment) this.transition(this.desiredEnvironment, { duration: .8 });
    return this.unlocked;
  }

  createGraph(context) {
    this.context = context;
    this.master = context.createGain();
    this.compressor = context.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.knee.value = 18;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = .006;
    this.compressor.release.value = .24;
    this.master.gain.value = this.muted ? 0 : this.masterVolume;
    this.compressor.connect(this.master).connect(context.destination);
    Object.entries(AUDIO_BUSES).forEach(([name, level]) => {
      const gain = context.createGain();
      gain.gain.value = level;
      gain.connect(this.compressor);
      this.buses.set(name, gain);
    });
    this.noiseBuffer = this.createNoiseBuffer(3);
  }

  createNoiseBuffer(seconds) {
    const length = Math.ceil(this.context.sampleRate * seconds);
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    let previous = 0;
    for (let index = 0; index < length; index += 1) {
      const white = Math.random() * 2 - 1;
      previous = previous * .18 + white * .82;
      data[index] = previous;
    }
    return buffer;
  }

  bus(name) { return this.buses.get(name) || this.buses.get('ui'); }

  setVolume(value, { ramp = .08 } = {}) {
    this.masterVolume = clamp(Number(value));
    if (!this.master || !this.context) return;
    this.ramp(this.master.gain, this.muted ? 0 : this.masterVolume, ramp);
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    if (this.master && this.context) this.ramp(this.master.gain, this.muted ? 0 : this.masterVolume, .06);
  }

  setBusVolume(name, value, { ramp = .12 } = {}) {
    const level = clamp(Number(value));
    this.busLevels.set(name, level);
    const bus = this.bus(name);
    if (bus && this.context) this.ramp(bus.gain, level, ramp);
  }

  ramp(parameter, value, duration, at = this.context?.currentTime || 0) {
    if (!parameter || !this.context) return;
    parameter.cancelScheduledValues(at);
    parameter.setValueAtTime(Math.max(.0001, parameter.value), at);
    parameter.exponentialRampToValueAtTime(Math.max(.0001, value), at + Math.max(.005, duration));
  }

  play(name, overrides = {}) {
    if (!this.unlocked || this.muted) return null;
    const definition = { ...(AUDIO_MANIFEST[name] || {}), ...overrides };
    if (!definition.generator) return null;
    const variant = choose(definition.variants);
    const settings = { ...definition, ...(variant || {}) };
    const when = this.context.currentTime + Math.max(0, settings.when || 0);
    const method = {
      tone: 'tone',
      morse: 'tone',
      noise: 'noise',
      click: 'click',
      relay: 'relay',
      impact: 'impact',
      disk: 'disk'
    }[settings.generator];
    return this[method]?.(name, settings, when) || null;
  }

  output(settings, when) {
    const gain = this.context.createGain();
    const panner = this.context.createStereoPanner?.();
    gain.gain.setValueAtTime(.0001, when);
    const volume = Math.max(.0001, settings.volume || .1);
    gain.gain.exponentialRampToValueAtTime(volume, when + Math.min(.012, (settings.duration || .1) / 4));
    gain.gain.exponentialRampToValueAtTime(.0001, when + (settings.duration || .1));
    if (panner) {
      const variation = settings.panVariation || 0;
      panner.pan.value = clamp((settings.pan || 0) + (Math.random() * 2 - 1) * variation, -1, 1);
      gain.connect(panner).connect(this.bus(settings.bus));
    } else gain.connect(this.bus(settings.bus));
    return gain;
  }

  tone(name, settings, when) {
    const oscillator = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const gain = this.output(settings, when);
    const rate = 1 + (Math.random() * 2 - 1) * (settings.rateVariation || 0);
    oscillator.type = settings.type || 'sine';
    oscillator.frequency.setValueAtTime((settings.frequency || 440) * rate, when);
    if (settings.endFrequency) oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, settings.endFrequency * rate), when + settings.duration);
    filter.type = 'bandpass';
    filter.frequency.value = settings.filter || Math.min(12000, (settings.frequency || 440) * 2.5);
    filter.Q.value = settings.q || .7;
    oscillator.connect(filter).connect(gain);
    oscillator.start(when);
    oscillator.stop(when + settings.duration + .02);
    return this.track(name, [oscillator], gain, when + settings.duration);
  }

  noise(name, settings, when) {
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.output(settings, when);
    source.buffer = this.noiseBuffer;
    source.playbackRate.value = .82 + Math.random() * .38;
    filter.type = settings.filterType || 'bandpass';
    filter.frequency.value = settings.filter || 1400;
    filter.Q.value = settings.q || .7;
    source.connect(filter).connect(gain);
    source.start(when, Math.random() * 1.5, settings.duration);
    source.stop(when + settings.duration + .02);
    return this.track(name, [source], gain, when + settings.duration);
  }

  click(name, settings, when) {
    this.noise(`${name}:body`, { ...settings, duration: settings.duration, volume: settings.volume * .7, filterType: 'highpass', filter: settings.frequency || 600 }, when);
    return this.tone(name, { ...settings, type: 'triangle', endFrequency: (settings.frequency || 500) * .45 }, when);
  }

  relay(name, settings, when) {
    this.click(`${name}:open`, { ...settings, duration: .045 }, when);
    return this.click(`${name}:close`, { ...settings, volume: settings.volume * .72, duration: .05, frequency: (settings.frequency || 170) * 1.24 }, when + .072);
  }

  impact(name, settings, when) {
    this.noise(`${name}:air`, { ...settings, volume: settings.volume * .22, duration: settings.duration * .7, filterType: 'lowpass', filter: 260 }, when);
    return this.tone(name, { ...settings, type: 'sine' }, when);
  }

  disk(name, settings, when) {
    const count = 3 + Math.floor(Math.random() * 3);
    let handle = null;
    for (let index = 0; index < count; index += 1) {
      handle = this.click(`${name}:${index}`, { ...settings, duration: .018, volume: settings.volume * (1 - index * .08), frequency: (settings.frequency || 900) + index * 77 }, when + index * (.032 + Math.random() * .018));
    }
    return handle;
  }

  track(name, sources, gain, endAt) {
    const id = `${name}:${endAt}:${Math.random()}`;
    const handle = {
      id,
      stop: (fade = .04) => {
        if (this.context) this.ramp(gain.gain, 0, fade);
        sources.forEach((source) => { try { source.stop((this.context?.currentTime || 0) + fade + .01); } catch {} });
        this.active.delete(id);
      }
    };
    this.active.set(id, handle);
    const last = sources.at(-1);
    if (last) last.onended = () => this.active.delete(id);
    return handle;
  }

  stop(id, fade = .08) {
    if (!id) return;
    const handle = typeof id === 'string' ? this.active.get(id) : id;
    handle?.stop(fade);
  }

  loop(name) {
    if (AUDIO_ENVIRONMENTS[name]) return this.transition(name);
    return this.play(name, { loop: true });
  }

  fade(target, value, duration = .3) {
    const node = typeof target === 'string' ? this.bus(target) : target;
    if (node?.gain) this.ramp(node.gain, value, duration);
  }

  crossfade(from, to, duration = .65) {
    if (from?.gains) from.gains.forEach(({ node }) => this.ramp(node.gain, 0, duration));
    if (to?.gains) to.gains.forEach(({ node, target }) => this.ramp(node.gain, target, duration));
  }

  transition(name, { duration = .7 } = {}) {
    this.desiredEnvironment = name;
    if (!this.unlocked || !AUDIO_ENVIRONMENTS[name]) return null;
    if (this.environmentName === name && this.environment) return this.environment;
    const previous = this.environment;
    const next = this.createEnvironment(name);
    this.environment = next;
    this.environmentName = name;
    this.crossfade(previous, next, duration);
    if (previous) previous.sources.forEach((source) => { try { source.stop(this.context.currentTime + duration + .08); } catch {} });
    return next;
  }

  createEnvironment(name) {
    const definition = AUDIO_ENVIRONMENTS[name];
    const now = this.context.currentTime;
    const sources = [];
    const gains = [];
    const bedGain = this.context.createGain();
    bedGain.gain.value = .0001;
    bedGain.connect(this.bus(definition.bus));
    gains.push({ node: bedGain, target: definition.volume });

    definition.hum.forEach((frequency, index) => {
      const oscillator = this.context.createOscillator();
      const harmonicGain = this.context.createGain();
      const filter = this.context.createBiquadFilter();
      oscillator.type = index ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      harmonicGain.gain.value = 1 / (index + 1.5);
      filter.type = 'lowpass';
      filter.frequency.value = definition.filter;
      oscillator.connect(harmonicGain).connect(filter).connect(bedGain);
      oscillator.start(now);
      sources.push(oscillator);
    });

    const noiseSource = this.context.createBufferSource();
    const noiseFilter = this.context.createBiquadFilter();
    const noiseGain = this.context.createGain();
    noiseSource.buffer = this.noiseBuffer;
    noiseSource.loop = true;
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = definition.filter * 1.7;
    noiseFilter.Q.value = .52;
    noiseGain.gain.value = definition.noise;
    noiseSource.connect(noiseFilter).connect(noiseGain).connect(bedGain);
    noiseSource.start(now, Math.random());
    sources.push(noiseSource);

    if (definition.whine) {
      const whine = this.context.createOscillator();
      const whineGain = this.context.createGain();
      whine.type = 'sine';
      whine.frequency.value = definition.whine;
      whineGain.gain.value = .025;
      whine.connect(whineGain).connect(bedGain);
      whine.start(now);
      sources.push(whine);
    }

    if (name === 'device') {
      const staticSource = this.context.createBufferSource();
      const staticFilter = this.context.createBiquadFilter();
      const staticGain = this.context.createGain();
      staticSource.buffer = this.noiseBuffer;
      staticSource.loop = true;
      staticFilter.type = 'bandpass';
      staticFilter.frequency.value = 1800;
      staticFilter.Q.value = .7;
      staticGain.gain.value = .0001;
      staticSource.connect(staticFilter).connect(staticGain).connect(this.bus('signal'));
      staticSource.start(now, Math.random());
      sources.push(staticSource);
      gains.push({ node: staticGain, target: .0001 });
      this.receiverNoiseGain = staticGain;
    } else this.receiverNoiseGain = null;

    return { name, sources, gains };
  }

  duck(names = ['ambience', 'device'], { depth = .18, attack = .05, hold = .28, release = .7 } = {}) {
    if (!this.unlocked) return;
    const now = this.context.currentTime;
    names.forEach((name) => {
      const bus = this.bus(name);
      const normal = this.busLevels.get(name) ?? .4;
      bus.gain.cancelScheduledValues(now);
      bus.gain.setValueAtTime(Math.max(.0001, bus.gain.value), now);
      bus.gain.exponentialRampToValueAtTime(Math.max(.0001, normal * depth), now + attack);
      bus.gain.setValueAtTime(Math.max(.0001, normal * depth), now + attack + hold);
      bus.gain.exponentialRampToValueAtTime(normal, now + attack + hold + release);
    });
  }

  dropout(names = ['ambience'], { depth = .001, attack = .012, hold = .07, release = .16 } = {}) {
    this.duck(names, { depth, attack, hold, release });
  }

  setReceiverState(tv, mode = 'normal') {
    if (!this.unlocked || !this.receiverNoiseGain) return;
    const targets = { intro: 4, sequence: 11, tuning: 10 };
    const target = targets[mode] || 4;
    const distance = Math.abs(tv.channel - target);
    const volumeFactor = .7 + (tv.volume / 10) * .3;
    const locked = tv.power && distance === 0 && (mode !== 'tuning' || tv.volume === 10);
    const staticLevel = !tv.power ? .0001 : locked ? .0025 : (.012 + Math.min(distance, 6) * .006) * volumeFactor;
    this.ramp(this.receiverNoiseGain.gain, staticLevel, locked ? .5 : .12);
    if (locked && !this.receiverLocked) this.play('receiver.lock');
    this.receiverLocked = locked;
  }

  tvPower(on, tv, mode) {
    if (!this.unlocked) return;
    this.play('receiver.power');
    if (on) {
      this.play('system.relay', { when: .12, volume: .18 });
      this.play('receiver.interference', { when: .24, duration: .3 });
      this.play('system.flyback', { when: .3 });
      this.play('receiver.static', { when: .5, duration: .24 });
    } else {
      this.play('receiver.collapse', { when: .07 });
      this.play('receiver.static', { when: .08, duration: .18, volume: .12 });
      if (this.receiverNoiseGain) this.ramp(this.receiverNoiseGain.gain, .0001, .65);
      this.receiverLocked = false;
    }
    if (on) this.setReceiverState(tv, mode);
  }

  channel(tv, mode) {
    this.play('receiver.knob');
    this.play('receiver.static', { when: .035, duration: .15 });
    this.play('receiver.interference', { when: .11, duration: .22, volume: .11 });
    this.setReceiverState(tv, mode);
  }

  hardReset() {
    if (!this.unlocked) return;
    const now = this.context.currentTime;
    this.play('receiver.interference', { duration: .32, volume: .2 });
    this.play('impact.blackout', { when: .25 });
    ['ambience', 'device', 'signal'].forEach((name) => {
      const bus = this.bus(name);
      const normal = this.busLevels.get(name);
      bus.gain.cancelScheduledValues(now);
      bus.gain.setValueAtTime(Math.max(.0001, bus.gain.value), now);
      bus.gain.exponentialRampToValueAtTime(.0001, now + .34);
      bus.gain.setValueAtTime(.0001, now + .56);
      bus.gain.exponentialRampToValueAtTime(normal, now + 1.05);
    });
    this.play('system.relay', { when: .62, volume: .22 });
    this.play('system.flyback', { when: .79, duration: .42 });
  }
};
