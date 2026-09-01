import { getState, updateState } from './state.js';
import { Motion } from './motion-engine.js';
import { AudioEngine } from './audio/engine.js';

const ENVIRONMENT_BY_FAMILY = Object.freeze({
  system: 'system',
  archive: 'archive',
  device: 'device',
  phone: 'phone',
  forensic: 'forensic',
  reconstruction: 'reconstruction',
  override: 'override'
});

const RECEIVER_MODE_BY_PUZZLE = Object.freeze({ '03': 'intro', '13': 'sequence', '17': 'tuning' });

class AudioExperience {
  constructor() {
    this.engine = new AudioEngine();
    this.music = null;
    this.musicSource = null;
    this.sceneFamily = 'system';
    this.rareSequence = 0;
    const settings = getState().settings;
    this.engine.masterVolume = settings.volume;
    this.engine.muted = settings.muted;
  }

  get unlocked() { return this.engine.unlocked; }
  receiverMode() { return RECEIVER_MODE_BY_PUZZLE[document.body.dataset.puzzle] || document.querySelector('[data-tv-mode]')?.dataset.tvMode || 'normal'; }

  async unlock(options = {}) {
    const available = await this.engine.unlock(options);
    if (available) {
      this.engine.setVolume(getState().settings.volume, { ramp: .02 });
      this.engine.setMuted(getState().settings.muted);
      this.scheduleRareEvent();
    }
    return available;
  }

  enable() { return this.unlock(); }
  load(names) { return this.engine.load(names); }

  playEvent(name, overrides) {
    if (this.engine.unlocked) return this.engine.play(name, overrides);
    this.unlock().then((available) => { if (available) this.engine.play(name, overrides); });
    return null;
  }

  async beep(frequency = 420, duration = .07) {
    if (!await this.unlock()) return false;
    this.engine.play('ui.contact', { generator: 'tone', frequency, endFrequency: frequency * .92, duration, volume: .09, type: 'triangle' });
    return true;
  }

  async noise(duration = .12, intensity = .035) {
    if (!await this.unlock()) return false;
    this.engine.play('receiver.static', { duration, volume: intensity });
    return true;
  }

  async playUnknownSource({ duration = 1.4 } = {}) {
    if (!await this.unlock()) return false;
    this.engine.duck(['ambience','device'], { depth:.08, attack:.04, hold:Math.min(duration,.9), release:1.1 });
    [0,.31,.67].forEach((when,index)=>this.engine.play('source.signature',{ when, volume:.07-index*.008, frequency:84-index*5 }));
    this.engine.play('source.03',{ when:.88, duration:Math.max(.28,Math.min(1.2,duration-.88)), volume:.045 });
    return true;
  }

  async clockRupture() {
    if (!await this.unlock()) return false;
    this.engine.dropout(['ambience','device'], { depth:.001, attack:.018, hold:.52, release:1.7 });
    this.engine.play('system.disk',{ when:.04,duration:.46,volume:.13 });
    this.engine.play('computer.file.changed',{ when:.34,volume:.08 });
    return true;
  }

  setMuted(muted) {
    updateState((state) => { state.settings.muted = muted; });
    this.engine.setMuted(muted);
    if (this.music) this.music.muted = muted;
    if (!muted) this.unlock();
  }

  setVolume(value) {
    const volume = Math.min(1, Math.max(0, Number(value)));
    updateState((state) => { state.settings.volume = volume; });
    this.engine.setVolume(volume);
  }

  setBusVolume(name, value) { this.engine.setBusVolume(name, value); }
  stop(target, fade) { this.engine.stop(target, fade); }
  loop(name) { return this.engine.loop(name); }
  fade(target, value, duration) { return this.engine.fade(target, value, duration); }
  crossfade(from, to, duration) { return this.engine.crossfade(from, to, duration); }
  duck(names, options) { return this.engine.duck(names, options); }
  dropout(names, options) { return this.engine.dropout(names, options); }

  transitionToScene(family, { state = getState() } = {}) {
    this.sceneFamily = family;
    const environment = ENVIRONMENT_BY_FAMILY[family] || 'system';
    this.engine.transition(environment, { duration: family === 'device' ? .9 : .7 });
    if (family === 'device') this.engine.setReceiverState(state.tv, this.receiverMode());
    this.scheduleRareEvent();
  }

  async playBoot() {
    if (!await this.unlock({ startEnvironment: false })) return false;
    this.engine.play('ui.contact', { volume: .16 });
    this.engine.play('system.relay', { when: .34, volume: .28 });
    Motion.schedule('audio-boot-ambience', () => this.engine.transition('system', { duration: 1.15 }), Motion.reduced ? 0 : 620);
    this.engine.play('system.flyback', { when: .92, duration: .72 });
    this.engine.play('receiver.static', { when: 1.42, duration: .18, volume: .12 });
    this.engine.play('system.disk', { when: 1.72, duration: .28 });
    return new Promise((resolve) => Motion.schedule('audio-boot-complete', () => resolve(true), Motion.reduced ? 0 : 2260));
  }

  async confirmEnabled() {
    if (!await this.unlock()) return;
    this.engine.play('ui.contact', { volume: .13 });
    this.engine.play('system.relay', { when: .08, volume: .1 });
  }

  normalError(detail = {}) {
    if (!this.engine.unlocked) return this.unlock().then((available) => { if (available) this.normalError(detail); });
    const critical = Boolean(detail.critical);
    const message = String(detail.message || '');
    const sound = message.startsWith('ENTRADA INVÁLIDA') || message.startsWith('FORMATO NÃO RECONHECIDO')
      ? 'input.invalid'
      : message.startsWith('RESPOSTA INCORRETA')
        ? 'input.wrong'
        : critical ? 'system.error' : 'ui.reject';
    this.engine.play(sound);
    if (critical) {
      this.engine.duck(['ambience', 'device'], { depth: .001, attack: .025, hold: .12, release: .52 });
      this.engine.play('impact.low', { when: .07, volume: .12 });
    }
  }

  success() {
    if (!this.engine.unlocked) return this.unlock().then((available) => { if (available) this.success(); });
    this.engine.duck(['ambience', 'device'], { depth: .46, attack: .05, hold: .12, release: .5 });
    const id = document.body.dataset.puzzle;
    if (['03', '13', '17'].includes(id)) this.engine.play('receiver.lock', { volume: .1 });
    else if (['05', '09', '14', '16', '22', '23'].includes(id)) this.engine.play('object.lock', { volume: .1 });
    else if (['11', '15', '18', '19', '20', '24'].includes(id)) {
      this.engine.play('object.lock', { volume: .07 });
      this.engine.play('reconstruction.process', { when: .15 });
    } else this.engine.play('ui.accept');
  }

  async workspaceArea(panel) {
    if (!await this.unlock()) return;
    const environment = panel === 'archive' ? 'archive' : 'system';
    this.sceneFamily = environment;
    this.engine.transition(environment, { duration: .42 });
    if (panel === 'archive') {
      this.engine.play('archive.engage');
      this.engine.play('archive.seek', { when: .055, duration: .2, volume: .065 });
    }
  }

  async archiveRecordOpen(detail = {}) {
    if (!await this.unlock()) return;
    this.engine.play('archive.engage', { volume: .1 });
    this.engine.play('archive.seek', { when: .045, duration: .2 });
    if (detail.altered) {
      this.engine.dropout(['ambience'], { hold: .08, release: .2 });
      this.engine.play('archive.fault', { when: .12 });
      this.engine.play('archive.seek', { when: .2, duration: .13, volume: .065 });
      this.engine.play('archive.data', { when: .29 });
    } else this.engine.play('archive.data', { when: .18 });
  }

  fragment(action) {
    if (action === 'removed') {
      this.playEvent('paper.lift', { volume: .035 });
      this.playEvent('paper.slide', { when: .045 });
      return;
    }
    this.playEvent('paper.lift', { volume: .04 });
    this.playEvent('paper.place', { when: .055 });
  }

  roomContact(detail = {}, dropped = false) {
    const profiles = {
      wood: { frequency: dropped ? 82 : 250, filter: 520 },
      paper: { frequency: dropped ? 150 : 680, filter: 1100 },
      device: { frequency: dropped ? 68 : 180, filter: 380 },
      generic: { frequency: dropped ? 96 : 330, filter: 720 }
    };
    const profile = profiles[detail.material] || profiles.generic;
    this.playEvent(dropped ? 'object.drop' : 'object.contact', { ...profile, volume: dropped ? .085 : .055 });
  }

  discovery(kind = 'generic') {
    if (!this.engine.unlocked) return this.unlock().then((available) => { if (available) this.discovery(kind); });
    this.engine.duck(['ambience', 'device'], { depth: .22, attack: .05, hold: .34, release: .75 });
    this.engine.play('narrative.discovery');
    const detail = kind === 'merge' ? 'memory.resolve' : kind === 'impossible' ? 'receiver.collapse' : 'system.relay';
    this.engine.play(detail, { when: .18, volume: .1 });
  }

  handleMotionStart(detail) {
    const name = detail?.name;
    if (!this.engine.unlocked) return this.unlock().then((available) => { if (available) this.handleMotionStart(detail); });
    if (name === 'scene-transition') {
      if (detail.from === 'archive' && detail.to !== 'archive') this.engine.play('archive.close', { volume: .055 });
      if (detail.from === 'device' && detail.to !== 'device') this.engine.play('receiver.collapse', { volume: .055, duration: .2 });
      if (['device', 'override'].includes(detail.to)) this.engine.hardReset();
      else if (detail.to === 'archive') { this.engine.duck(['ambience'], { depth: .3, hold: .18 }); this.engine.play('archive.seek', { when: .12 }); }
      else if (detail.to === 'forensic') { this.engine.duck(['ambience'], { depth: .38, hold: .2 }); this.engine.play('forensic.contact', { when: .14 }); }
      else if (detail.to === 'reconstruction') { this.engine.duck(['ambience'], { depth: .25, hold: .25 }); this.engine.play('memory.resolve', { when: .1, volume: .07 }); }
      else if (['system', 'computer'].includes(detail.to)) this.engine.play('system.relay', { when: .28, volume: .12 });
      return;
    }
    if (name === 'hard-reset') return this.engine.hardReset();
    if (name === 'screen-tear') return this.engine.play('impact.glitch');
    if (name === 'horizontal-roll') return this.engine.play('receiver.interference', { duration: .16, volume: .07 });
    if (name === 'vertical-desync') return this.engine.play('receiver.interference', { duration: .2, volume: .09, filter: 520 });
    if (name === 'system-signal-loss') return this.engine.play('receiver.collapse', { volume: .12 });
    if (name === 'frame-ghost') return this.engine.play('rare.crackle', { volume: .035 });
    if (name === 'phosphor-burn') return this.engine.play('system.flyback', { duration: .2, volume: .018 });
    if (name === 'signal-recovery') return this.engine.play('receiver.lock', { volume: .08 });
  }

  handleTvPower(detail) {
    if (!this.engine.unlocked) return this.unlock().then((available) => { if (available) this.handleTvPower(detail); });
    const state = getState();
    this.engine.tvPower(Boolean(detail?.value), state.tv, this.receiverMode());
  }

  handleTvChannel() {
    if (!this.engine.unlocked) return this.unlock().then((available) => { if (available) this.handleTvChannel(); });
    const state = getState();
    this.engine.channel(state.tv, this.receiverMode());
  }

  handleTvVolume() {
    if (!this.engine.unlocked) return this.unlock().then((available) => { if (available) this.handleTvVolume(); });
    this.engine.play('receiver.volume');
    this.engine.setReceiverState(getState().tv, this.receiverMode());
  }

  scheduleRareEvent() {
    Motion.cancel('audio-rare-event');
    if (!this.engine.unlocked) return;
    const sequence = ++this.rareSequence;
    const delay = 28000 + Math.floor(Math.random() * 65000);
    Motion.schedule('audio-rare-event', () => {
      if (sequence !== this.rareSequence || getState().settings.muted) return this.scheduleRareEvent();
      const eventByFamily = {
        system: ['rare.relay', 'rare.crackle', 'system.disk'],
        archive: ['archive.seek', 'rare.relay', 'rare.distant'],
        device: ['rare.fragment', 'rare.crackle'],
        phone: ['rare.distant'],
        forensic: ['forensic.contact', 'rare.relay', 'rare.wood'],
        reconstruction: ['rare.fragment', 'rare.crackle', 'rare.wood', 'rare.distant'],
        override: ['rare.crackle']
      };
      const options = eventByFamily[this.sceneFamily] || eventByFamily.system;
      const name = options[Math.floor(Math.random() * options.length)];
      this.engine.play(name, { volume: this.sceneFamily === 'device' ? .035 : .025 });
      this.scheduleRareEvent();
    }, delay);
  }

  async playMorse(pattern, lamp, trace) {
    if (!lamp || !trace || !await this.unlock()) return false;
    let cursor = 0;
    trace.textContent = '';
    pattern.forEach((letter, letterIndex) => {
      [...letter].forEach((mark, markIndex) => {
        const duration = mark === '.' ? .12 : .36;
        this.engine.play('morse.radio', { when: cursor, duration, volume: .14 * (.94 + Math.random() * .1) });
        const start = Math.round(cursor * 1000);
        const end = Math.round((cursor + duration) * 1000);
        Motion.schedule(`morse-${letterIndex}-${markIndex}-on`, () => lamp.classList.add('is-lit'), start);
        Motion.schedule(`morse-${letterIndex}-${markIndex}-off`, () => { lamp.classList.remove('is-lit'); trace.textContent += mark; }, end);
        cursor += duration + .18;
      });
      Motion.schedule(`morse-${letterIndex}-space`, () => { trace.textContent += '   '; }, Math.round(cursor * 1000));
      cursor += .42;
    });
    return new Promise((resolve) => Motion.schedule('morse-complete', () => resolve(true), Math.round(cursor * 1000)));
  }

  async playRecoveredSignal() {
    if (!await this.unlock()) return false;
    this.engine.duck(['ambience', 'device'], { depth: .2, hold: 1.4, release: 1.2 });
    const notes = [261.63, 329.63, 392, 523.25, 392, 659.25];
    notes.forEach((frequency, index) => this.engine.play('memory.resolve', { when: index * .22, frequency, endFrequency: frequency, duration: .32, volume: .08 }));
    return true;
  }

  async playMusic(url) {
    this.setMuted(false);
    if (!url) return this.playRecoveredSignal();
    if (!await this.unlock()) return false;
    if (!this.music || this.music.dataset.source !== url) {
      this.music?.pause();
      this.music = new Audio(url);
      this.music.dataset.source = url;
      this.music.loop = true;
      this.music.crossOrigin = 'anonymous';
      this.musicSource = this.engine.context.createMediaElementSource(this.music);
      this.musicSource.connect(this.engine.bus('narrative'));
    }
    this.music.muted = false;
    try { await this.music.play(); return true; } catch { return false; }
  }
}

export const audioManager = new AudioExperience();

let motionAudioBound = false;

export function bindMotionAudio() {
  if (motionAudioBound) return;
  motionAudioBound = true;
  document.addEventListener('motion:start', (event) => audioManager.handleMotionStart(event.detail));
  document.addEventListener('motion:error', (event) => audioManager.normalError(event.detail));
  document.addEventListener('motion:complete', (event) => { if (event.detail?.name === 'puzzle-success') audioManager.success(); });
  document.addEventListener('motion:impact', (event) => audioManager.discovery(event.detail?.kind));
  document.addEventListener('tv:power', (event) => audioManager.handleTvPower(event.detail));
  document.addEventListener('tv:channel', () => audioManager.handleTvChannel());
  document.addEventListener('tv:volume', () => audioManager.handleTvVolume());
  document.addEventListener('tv:fine', () => { audioManager.playEvent('receiver.knob',{volume:.08}); audioManager.playEvent('receiver.static',{when:.03,duration:.08,volume:.035}); });
  document.addEventListener('tv:afterimage', () => { audioManager.duck(['ambience', 'device'], { depth: .08, hold: .5 }); audioManager.playEvent('rare.fragment', { volume: .08 }); });
  document.addEventListener('entity:detected', () => { audioManager.duck(['ambience'], { depth: .02, hold: .18 }); audioManager.playEvent('narrative.entity'); });
  document.addEventListener('memory:restored', () => audioManager.playEvent('memory.resolve'));
  document.addEventListener('evidence:contact', () => audioManager.playEvent('forensic.contact'));
  document.addEventListener('evidence:linked', () => { audioManager.playEvent('evidence.trace'); audioManager.playEvent('evidence.link', { when: .08 }); });
  document.addEventListener('evidence:rejected', () => { audioManager.playEvent('forensic.contact', { volume: .05 }); audioManager.playEvent('evidence.reject', { when: .045 }); });
  document.addEventListener('evidence:resolve', () => audioManager.playEvent('forensic.resolve'));
  document.addEventListener('archive:open', () => audioManager.playEvent('archive.seek'));
  document.addEventListener('workspace:area-change', (event) => audioManager.workspaceArea(event.detail?.panel));
  document.addEventListener('archive:record-open', (event) => audioManager.archiveRecordOpen(event.detail));
  document.addEventListener('archive:record-close', () => audioManager.playEvent('archive.close'));
  document.addEventListener('fragment:placed', () => audioManager.fragment('placed'));
  document.addEventListener('fragment:removed', () => audioManager.fragment('removed'));
  document.addEventListener('room:object-pick', (event) => audioManager.roomContact(event.detail));
  document.addEventListener('room:object-drop', (event) => audioManager.roomContact(event.detail, true));
  document.addEventListener('room:object-rejected', () => { audioManager.playEvent('object.drop', { volume: .055 }); audioManager.playEvent('evidence.reject', { when: .07 }); });
  document.addEventListener('room:position-lock', () => audioManager.playEvent('object.lock', { when: .04 }));
  document.addEventListener('room:structure-ready', () => { audioManager.duck(['ambience'], { depth: .35, hold: .12 }); audioManager.playEvent('structure.confirm', { when: .09 }); });
  document.addEventListener('residue:selected', (event) => { audioManager.playEvent('forensic.contact', { volume: .055 }); if (event.detail?.count === 3) audioManager.playEvent('evidence.trace', { when: .05 }); });
}
