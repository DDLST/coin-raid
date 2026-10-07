export type Sound = 'slash' | 'thrust' | 'axe' | 'cast' | 'hit' | 'bite' | 'hurt' | 'dash' | 'pickup' | 'heal' | 'checkpoint' | 'crack' | 'thunder' | 'boss' | 'loot' | 'empty' | 'ultimate';
export type AudioSettings = { master: number; music: number; effects: number; muted: boolean };
export const DEFAULT_AUDIO: AudioSettings = { master: .65, music: .30, effects: .70, muted: false };
const MELODIES = [
  [64, 67, 71, 67, 62, 66, 69, 66, 60, 64, 67, 64, 62, 66, 69, 71],
  [57, 60, 64, 60, 55, 59, 62, 59, 53, 57, 60, 57, 55, 59, 62, 64],
  [62, 65, 69, 72, 69, 65, 60, 64, 67, 70, 67, 64, 58, 62, 65, 69],
  [55, 58, 62, 65, 62, 58, 53, 57, 60, 63, 60, 57, 51, 55, 58, 62],
  [60, 63, 67, 70, 67, 63, 58, 62, 65, 68, 65, 62, 56, 60, 63, 67],
];
const freq = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
// Музыка и шумовые эффекты синтезируются в браузере, без внешних аудиофайлов.
export class ForestAudio {
  settings: AudioSettings = { ...DEFAULT_AUDIO };
  available = true;
  private context: AudioContext | null = null;
  private master!: GainNode;
  private music!: GainNode;
  private effects!: GainNode;
  private rain!: GainNode;
  private rainSource: AudioBufferSourceNode | null = null;
  private noise!: AudioBuffer;
  private region = 0;
  private note = 0;
  private nextNote = 0;
  private paused = true;
  private weather: 'clear' | 'rain' | 'storm' = 'clear';
  private stepLeft = 0;
  unlock(): void {
    if (!this.available) return;
    try {
      if (!this.context) {
        this.context = new AudioContext(); const c = this.context;
        this.master = c.createGain(); this.music = c.createGain(); this.effects = c.createGain(); this.rain = c.createGain();
        this.music.connect(this.master); this.effects.connect(this.master); this.rain.connect(this.effects); this.master.connect(c.destination);
        this.noise = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
        const data = this.noise.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        this.rainSource = c.createBufferSource(); this.rainSource.buffer = this.noise; this.rainSource.loop = true;
        const filter = c.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 3400;
        this.rainSource.connect(filter).connect(this.rain); this.rainSource.start(); this.rain.gain.value = 0;
        this.nextNote = c.currentTime + .08; this.applySettings();
      }
      void this.context.resume().catch(() => { this.available = false; });
    } catch { this.available = false; }
  }
  setSettings(patch: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...patch };
    for (const key of ['master', 'music', 'effects'] as const) this.settings[key] = Math.max(0, Math.min(1, this.settings[key]));
    this.applySettings();
  }
  private applySettings(): void {
    if (!this.context) return; const at = this.context.currentTime;
    this.master.gain.setTargetAtTime(this.settings.muted ? 0 : this.settings.master, at, .05);
    this.music.gain.setTargetAtTime(this.settings.music * .38, at, .12);
    this.effects.gain.setTargetAtTime(this.settings.effects * .7, at, .05);
  }
  setRegion(index: number): void { if (this.region !== index) { this.region = index; this.note = 0; this.nextNote = (this.context?.currentTime ?? 0) + .15; } }
  update(dt: number, playing: boolean, weather: 'clear' | 'rain' | 'storm'): void {
    this.stepLeft = Math.max(0, this.stepLeft - dt);
    const c = this.context; if (!c || c.state !== 'running') return;
    if (this.paused !== !playing || this.weather !== weather) { this.paused = !playing; this.weather = weather;
      this.rain.gain.setTargetAtTime(playing && weather !== 'clear' ? weather === 'storm' ? .13 : .085 : 0, c.currentTime, .3); }
    if (!playing || this.settings.muted) { this.nextNote = c.currentTime + .1; return; }
    const seconds = [1.05, 1.18, 1.12, .96, 1.06][this.region];
    while (this.nextNote < c.currentTime + .3) {
      const melody = MELODIES[this.region], note = melody[this.note % melody.length];
      this.tone(freq(note), seconds * 1.85, .055, 'sine', this.music, this.nextNote);
      this.tone(freq(note + 12), seconds * .95, .012, 'triangle', this.music, this.nextNote + .025);
      if (this.note % 4 === 0) this.tone(freq(melody[Math.floor(this.note % 16 / 4) * 4] - 24), seconds * 3.9, .036, 'sine', this.music, this.nextNote);
      this.note++; this.nextNote += seconds;
    }
  }
  private tone(hz: number, duration: number, volume: number, type: OscillatorType = 'sine', bus?: GainNode, start?: number, endHz?: number): void {
    const c = this.context; if (!c) return; const at = start ?? c.currentTime;
    const oscillator = c.createOscillator(), gain = c.createGain(); oscillator.type = type; oscillator.frequency.setValueAtTime(hz, at);
    if (endHz) oscillator.frequency.exponentialRampToValueAtTime(endHz, at + duration);
    gain.gain.setValueAtTime(.0001, at); gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume), at + .015);
    gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    oscillator.connect(gain).connect(bus ?? this.effects); oscillator.start(at); oscillator.stop(at + duration + .04);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  private noiseBurst(duration: number, volume: number, hz: number, type: BiquadFilterType = 'lowpass'): void {
    const c = this.context; if (!c) return;
    const source = c.createBufferSource(), filter = c.createBiquadFilter(), gain = c.createGain(); source.buffer = this.noise;
    filter.type = type; filter.frequency.value = hz;
    gain.gain.setValueAtTime(Math.max(.0002, volume), c.currentTime); gain.gain.exponentialRampToValueAtTime(.0001, c.currentTime + duration);
    source.connect(filter).connect(gain).connect(this.effects); source.start(c.currentTime, Math.random()); source.stop(c.currentTime + duration);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
  }
  play(sound: Sound): void {
    if (!this.context || this.context.state !== 'running' || this.settings.muted) return;
    switch (sound) {
      case 'slash': this.noiseBurst(.16, .21, 4200, 'highpass'); this.tone(480, .10, .025, 'triangle', undefined, undefined, 160); break;
      case 'thrust': this.noiseBurst(.12, .19, 2200, 'bandpass'); break;
      case 'axe': this.noiseBurst(.26, .28, 1300); this.tone(120, .18, .09, 'triangle', undefined, undefined, 48); break;
      case 'cast': this.tone(330, .3, .10, 'sine', undefined, undefined, 880); break;
      case 'hit': this.noiseBurst(.13, .28, 1100); this.tone(95, .12, .075, 'triangle'); break;
      case 'bite': this.noiseBurst(.18, .26, 850); this.tone(74, .19, .08, 'sawtooth', undefined, undefined, 42); break;
      case 'hurt': this.noiseBurst(.15, .20, 950); this.tone(110, .22, .045, 'triangle', undefined, undefined, 65); break;
      case 'dash': this.noiseBurst(.25, .17, 3200, 'bandpass'); break;
      case 'pickup': this.tone(880, .18, .065); this.tone(1320, .21, .038, 'sine', undefined, this.context.currentTime + .06); break;
      case 'heal': case 'checkpoint': case 'loot': case 'ultimate': {
        const notes = sound === 'checkpoint' ? [60, 64, 67, 72] : sound === 'ultimate' ? [48, 55, 60, 67] : [64, 67, 71];
        notes.forEach((n, i) => this.tone(freq(n), sound === 'ultimate' ? 1 : .7, .08, 'sine', undefined, this.context!.currentTime + i * .06)); break;
      }
      case 'thunder': this.noiseBurst(.95, .34, 600); this.tone(55, .8, .17, 'sine', undefined, undefined, 24); break;
      case 'crack': this.noiseBurst(.28, .34, 1800); this.tone(760, .32, .06, 'triangle', undefined, undefined, 170); break;
      case 'boss': this.tone(48, .9, .15); this.tone(71, 1.2, .07, 'triangle'); break;
      case 'empty': this.tone(190, .4, .07, 'sine', undefined, undefined, 110); break;
    }
  }
  footstep(ground: 'grass' | 'stone' | 'water' | 'ash', running: boolean): void {
    if (!running || this.stepLeft > 0 || !this.context || this.paused || this.settings.muted) return;
    this.stepLeft = .23;
    const params = { grass: [1500, .035], stone: [3200, .05], water: [700, .065], ash: [2100, .038] }[ground];
    this.noiseBurst(ground === 'water' ? .17 : .07, params[1], params[0]);
    if (ground === 'stone') this.tone(220 + Math.random() * 80, .035, .015, 'triangle');
  }
  destroy(): void { this.rainSource?.stop(); void this.context?.close(); this.context = null; }
}
