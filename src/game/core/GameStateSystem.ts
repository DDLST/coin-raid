import { GAME_TRANSITIONS } from '../Constants';

export type GameState =
  | 'ready'
  | 'playing'
  | 'paused'
  | 'intro'
  | 'story'
  | 'dialog'
  | 'shop'
  | 'menu'
  | 'map'
  | 'loot'
  | 'dying'
  | 'won'
  | 'confirm'
  | 'travel';

/** Единственный владелец режима игры. Окна интерфейса не хранят его копию. */
export class GameStateSystem {
  private current: GameState = 'ready';

  constructor(private readonly onChange?: () => void) {}

  get state(): GameState {
    return this.current;
  }

  get playing(): boolean {
    return this.current === 'playing';
  }

  get cinematic(): boolean {
    return this.current === 'intro' || this.current === 'story';
  }

  transitionTo(next: GameState): void {
    if (next === this.current) {
      return;
    }
    if (!GAME_TRANSITIONS[this.current].includes(next)) {
      throw new Error(`Недопустимый переход игры: ${this.current} -> ${next}`);
    }
    this.current = next;
    this.onChange?.();
  }

  reset(): void {
    this.current = 'ready';
    this.onChange?.();
  }
}
