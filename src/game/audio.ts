import {RecordedMusic, type MusicMode} from './soundtrack';
import type { WeaponId } from './progression';
import type { WeatherKind } from './events';
export type Sound = 'slash' | 'thrust' | 'axe' | 'cast' | 'hit' | 'bite' | 'hurt' | 'dash' | 'pickup' | 'heal' | 'checkpoint' | 'crack' | 'thunder' | 'boss' | 'loot' | 'empty' | 'ultimate' | 'howl' | 'parry' | 'achievement' | 'meteor' | 'wind' | 'roar';
export type AudioSettings = { master: number; music: number; effects: number; muted: boolean };
export const DEFAULT_AUDIO: AudioSettings = { master: .65, music: .42, effects: .70, muted: false };
const MELODIES = [
  [64, 67, 71, 67, 62, 66, 69, 66, 60, 64, 67, 64, 62, 66, 69, 71],
  [57, 60, 64, 60, 55, 59, 62, 59, 53, 57, 60, 57, 55, 59, 62, 64],
  [62, 65, 69, 72, 69, 65, 60, 64, 67, 70, 67, 64, 58, 62, 65, 69],
  [55, 58, 62, 65, 62, 58, 53, 57, 60, 63, 60, 57, 51, 55, 58, 62],
  [60, 63, 67, 70, 67, 63, 58, 62, 65, 68, 65, 62, 56, 60, 63, 67],
];
const freq = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
// Записи CC0 хранятся в игре. Звуки мира и резервная музыка синтезируются в браузере.
export class ForestAudio {
  settings: AudioSettings = { ...DEFAULT_AUDIO };
  available = true;
  private context: AudioContext | null = null;
  private master!: GainNode;
  private music!: GainNode;
  private guitar!: WaveShaperNode;
  private recorded:RecordedMusic|null=null;
  private mode:MusicMode='explore';
  private ambientLeft=12;
  private effects!: GainNode;
  private rain!: GainNode;
  private rainSource: AudioBufferSourceNode | null = null;
  private noise!: AudioBuffer;
  private region = 0;
  private note = 0;
  private nextNote = 0;
  private paused = true;
  private weather:WeatherKind = 'clear';
  private stepLeft = 0;
  unlock(): void {
    if (!this.available) return;
    try {
      if (!this.context) {
        this.context = new AudioContext(); const c = this.context;
        this.master = c.createGain(); this.music = c.createGain(); this.effects = c.createGain(); this.rain = c.createGain();
        this.recorded=new RecordedMusic(c,this.music);this.music.connect(this.master); this.effects.connect(this.master); this.rain.connect(this.effects); const compressor=c.createDynamicsCompressor();compressor.threshold.value=-9;compressor.knee.value=12;compressor.ratio.value=4;this.master.connect(compressor).connect(c.destination);
        this.guitar=c.createWaveShaper();const curve=new Float32Array(4096);for(let i=0;i<curve.length;i++){const x=i*2/(curve.length-1)-1;curve[i]=Math.tanh(x*16)*.55;}this.guitar.curve=curve;this.guitar.oversample='2x';
        const cabinet=c.createBiquadFilter();cabinet.type='lowpass';cabinet.frequency.value=2400;this.guitar.connect(cabinet).connect(this.music);
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
    this.music.gain.setTargetAtTime(this.settings.music * .60, at, .12);
    this.effects.gain.setTargetAtTime(this.settings.effects * .90, at, .05);
  }
  setRegion(index: number): void { if (this.region !== index) { this.region = index; this.note = 0; this.nextNote = (this.context?.currentTime ?? 0) + .15; } }
  update(dt:number,playing:boolean,weather:WeatherKind,mode:MusicMode='explore'):void{
    this.stepLeft=Math.max(0,this.stepLeft-dt);const c=this.context;if(!c||c.state!=='running')return;
    if(this.paused!==!playing||this.weather!==weather){this.paused=!playing;this.weather=weather;this.rain.gain.setTargetAtTime(playing&&(weather==='rain'||weather==='storm'||weather==='hurricane')?weather==='hurricane'?.055:weather==='storm'?.13:.085:0,c.currentTime,.3);}
    const synthMode=mode==='rage'?'boss':mode==='village'||mode==='story'?'explore':mode;this.recorded?.update(dt,playing&&!this.settings.muted,this.region,mode);if(this.mode!==synthMode){this.mode=synthMode;this.nextNote=c.currentTime+.06;this.note=0;}
    if(!playing||this.settings.muted){this.nextNote=c.currentTime+.1;return;}
    this.ambientLeft-=dt;if(this.ambientLeft<=0){this.ambientLeft=18+Math.random()*13;if(mode==='explore'&&(this.region===0||this.region===2))this.play('howl');}
    if(this.recorded&&!this.recorded.failed)return;
    const index=this.region%5,roots=[40,38,39,37,36],root=roots[index],bpm=mode==='boss'?174+this.region*3:mode==='combat'?132+this.region*4:92+this.region*3;
    const step=60/bpm/2,riffs=[[0,0,3,0,5,0,6,5],[0,0,0,3,0,5,3,1],[0,3,0,6,5,0,3,1],[0,0,6,0,5,3,1,0],[0,0,1,0,6,5,3,1]];
    while(this.nextNote<c.currentTime+.14){const n=this.note,at=this.nextNote,heavy=mode!=='explore';
      if(heavy){const offset=riffs[index][n%8];this.tone(freq(root+offset),step*.78,.075,'sawtooth',this.guitar,at);this.tone(freq(root+offset+7),step*.65,.035,'square',this.guitar,at+.002);this.tone(freq(root+offset-12),step*.92,.090,'sine',this.music,at);
        if(n%4===0||mode==='boss'&&n%2===0)this.tone(128,.18,.20,'sine',this.music,at,42);
        if(n%8===4){this.noiseBurst(.17,.10,1600,'highpass',this.music,at);this.tone(180,.08,.045,'triangle',this.music,at,95);}
        this.noiseBurst(n%8===7?.12:.045,n%2?.024:.017,7500,'highpass',this.music,at);
        if(n%4===0)this.tone(freq(root+24+[0,3,7,5][Math.floor(n/4)%4]),step*1.8,.015,'triangle',this.music,at+.01);
      }else if(n%2===0){const melody=MELODIES[index],key=melody[Math.floor(n/2)%16];this.tone(freq(key),step*3,.055,'sine',this.music,at);this.tone(freq(root-12),step*3,.048,'triangle',this.music,at);if(n%8===0)this.tone(96,.15,.055,'sine',this.music,at,44);if(n%4===2)this.noiseBurst(.055,.009,4500,'highpass',this.music,at);}
      this.note++;this.nextNote+=step;
    }
  }
  private tone(hz: number, duration: number, volume: number, type: OscillatorType = 'sine', bus?: AudioNode, start?: number, endHz?: number): void {
    const c = this.context; if (!c) return; const at = start ?? c.currentTime;
    const oscillator = c.createOscillator(), gain = c.createGain(); oscillator.type = type; oscillator.frequency.setValueAtTime(hz, at);
    if (endHz) oscillator.frequency.exponentialRampToValueAtTime(endHz, at + duration);
    gain.gain.setValueAtTime(.0001, at); gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume), at + .015);
    gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    oscillator.connect(gain).connect(bus ?? this.effects); oscillator.start(at); oscillator.stop(at + duration + .04);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  private noiseBurst(duration: number, volume: number, hz: number, type: BiquadFilterType = 'lowpass',bus?:AudioNode,start?:number): void {
    const c = this.context; if (!c) return;const at=start??c.currentTime;
    const source = c.createBufferSource(), filter = c.createBiquadFilter(), gain = c.createGain(); source.buffer = this.noise;
    filter.type = type; filter.frequency.value = hz;
    gain.gain.setValueAtTime(Math.max(.0002, volume), at); gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    source.connect(filter).connect(gain).connect(bus??this.effects); source.start(at, Math.random()); source.stop(at + duration);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
  }
  play(sound: Sound): void {
    if (!this.context || this.context.state !== 'running' || this.settings.muted) return;
    switch (sound) {
      case 'roar': this.noiseBurst(.72,.20,470,'bandpass');this.tone(85,.78,.10,'sawtooth',undefined,undefined,39);this.tone(130,.62,.045,'triangle',undefined,this.context.currentTime+.1,56);break;
      case 'meteor': this.noiseBurst(1,.36,460);this.tone(100,.75,.18,'triangle',undefined,undefined,28);break;
      case 'wind':this.noiseBurst(1.7,.12,560,'bandpass');this.tone(160,1.4,.035,'sine',undefined,undefined,74);break;
      case 'achievement': [523,659,784,1047].forEach((hz,i)=>this.tone(hz,.45,.035,'triangle',undefined,this.context!.currentTime+i*.09));break;
      case 'howl': this.tone(210,1.9,.024,'triangle',undefined,undefined,340);this.tone(420,1.6,.010,'sine',undefined,this.context.currentTime+.25,540);break;
      case 'parry': this.tone(1240,.27,.07,'triangle',undefined,undefined,640);this.noiseBurst(.12,.22,3200,'highpass');break;
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
  weaponSound(weapon:WeaponId,impact=false):void {
    if(!this.context||this.context.state!=='running'||this.settings.muted)return;
    const at=this.context.currentTime;
    const params:Record<WeaponId,{hz:number;end:number;body:number;air:number;duration:number}>= {
      sword:{hz:780,end:230,body:.070,air:3800,duration:.19},
      dawnblade:{hz:1120,end:420,body:.075,air:5100,duration:.23},
      spear:{hz:340,end:150,body:.085,air:2300,duration:.17},
      axe:{hz:140,end:44,body:.150,air:1200,duration:.31},
      staff:{hz:220,end:940,body:.095,air:1700,duration:.34},
      runicstaff:{hz:370,end:1320,body:.090,air:2900,duration:.39},
    };
    const p=params[weapon];
    this.noiseBurst(impact?.15:p.duration,impact?.32:.29,p.air,weapon==='sword'||weapon==='dawnblade'?'highpass':'bandpass');
    this.tone(impact?p.hz*1.3:p.hz,p.duration,p.body,weapon==='axe'?'triangle':'sine',undefined,at,p.end);
    if(weapon==='staff'||weapon==='runicstaff')this.tone(p.hz*1.5,p.duration,.055,'triangle',undefined,at+.04,p.end*1.5);
    else this.tone(impact?135:210,.09,.055,'triangle',undefined,at,60);
  }
  footstep(ground: 'grass' | 'stone' | 'water' | 'ash', running: boolean): void {
    if (!running || this.stepLeft > 0 || !this.context || this.paused || this.settings.muted) return;
    this.stepLeft = .23;
    const params = { grass: [1500, .035], stone: [3200, .05], water: [700, .065], ash: [2100, .038] }[ground];
    this.noiseBurst(ground === 'water' ? .17 : .07, params[1], params[0]);
    if (ground === 'stone') this.tone(220 + Math.random() * 80, .035, .015, 'triangle');
  }
  get trackTitle():string{return this.recorded?.title??'Резервная синтезированная тема';}
  destroy(): void {this.recorded?.destroy(); this.rainSource?.stop(); void this.context?.close(); this.context = null; }
}
