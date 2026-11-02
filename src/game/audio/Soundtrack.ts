import { THEMES, TRACKS } from '../Constants';

export type TrackId = keyof typeof TRACKS;
export type MusicMode = 'explore' | 'combat' | 'boss' | 'rage' | 'village' | 'story';

export const soundtrack = (region: number, mode: MusicMode): TrackId =>
  mode === 'village'
    ? 'fairy-adventure'
    : mode === 'story'
      ? 'choir-1'
      : THEMES[Math.max(0, Math.min(THEMES.length - 1, region))][mode];
// Два media-элемента декодируют только текущую и затухающую запись.
export class RecordedMusic {
  failed = false;
  current: TrackId | null = null;
  private slots: {
    element: HTMLAudioElement;
    gain: GainNode;
    source: MediaElementAudioSourceNode;
    key: TrackId | null;
    stopAt: number;
  }[] = [];
  private active = -1;
  private playing = false;
  private positions = new Map<TrackId, number>();
  constructor(
    private context: AudioContext,
    private bus: AudioNode,
  ) {}
  update(dt: number, playing: boolean, region: number, mode: MusicMode): void {
    for (const slot of this.slots) {
      if (slot.stopAt > 0) {
        slot.stopAt -= dt;
        if (slot.stopAt <= 0) {
          slot.element.pause();
          slot.stopAt = 0;
        }
      }
    }
    if (!playing) {
      if (this.playing) {
        for (const slot of this.slots) {
          slot.element.pause();
        }
      }
      this.playing = false;
      return;
    }
    const id = soundtrack(region, mode);
    if (id !== this.current) {
      const old = this.slots[this.active];
      if (old) {
        if (old.key) {
          this.positions.set(old.key, old.element.currentTime);
        }
        old.gain.gain.setTargetAtTime(0, this.context.currentTime, 0.2);
        old.stopAt = 0.8;
      }
      this.active = this.active === 0 ? 1 : 0;
      let slot = this.slots[this.active];
      if (!slot) {
        const element = new Audio();
        element.preload = 'metadata';
        element.loop = true;
        const gain = this.context.createGain();
        gain.gain.value = 0;
        const source = this.context.createMediaElementSource(element);
        source.connect(gain).connect(this.bus);
        slot = { element, gain, source, key: null, stopAt: 0 };
        this.slots[this.active] = slot;
      }
      slot.stopAt = 0;
      slot.element.pause();
      slot.key = id;
      slot.element.src = TRACKS[id].url;
      slot.element.loop = true;
      slot.element.addEventListener(
        'loadedmetadata',
        () => {
          if (slot.key === id) {
            slot.element.currentTime = Math.min(
              this.positions.get(id) ?? 0,
              Math.max(0, slot.element.duration - 0.1),
            );
          }
        },
        { once: true },
      );
      slot.element.onerror = () => {
        if (slot.key === this.current) {
          this.failed = true;
        }
      };
      slot.gain.gain.setTargetAtTime(
        mode === 'village' ? 0.54 : mode === 'explore' ? 0.72 : mode === 'combat' ? 0.92 : 1.1,
        this.context.currentTime,
        0.25,
      );
      this.current = id;
      this.playing = false;
    }
    if (!this.playing) {
      const slot = this.slots[this.active];
      if (slot) {
        void slot.element.play().catch((error: unknown) => {
          if (
            !(error instanceof DOMException && error.name === 'AbortError') &&
            slot.key === id &&
            this.current === id
          ) {
            this.failed = true;
          }
        });
      }
      this.playing = true;
    }
  }
  get title(): string {
    return this.current
      ? `${TRACKS[this.current].name} · ${TRACKS[this.current].author}`
      : 'Музыка включится после действия игрока';
  }
  destroy(): void {
    for (const slot of this.slots) {
      slot.element.pause();
      slot.element.removeAttribute('src');
      slot.element.load();
      slot.source.disconnect();
      slot.gain.disconnect();
    }
    this.slots = [];
  }
}
