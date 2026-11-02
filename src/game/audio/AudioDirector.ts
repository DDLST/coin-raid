import { GAME_CONFIG } from '../Constants';
import { type GameScene } from '../GameScene';
import { type MusicMode } from './Soundtrack';

/** Выбирает музыку по ситуации. Синтез и воспроизведение находятся в GameAudio. */
export class AudioDirector {
  private combatLeft = 0;

  constructor(private readonly context: GameScene) {}

  reset(): void {
    this.combatLeft = 0;
  }

  update(dt: number): void {
    const { flow, worldState, visuals } = this.context;
    if (flow.playing) {
      const threat =
        worldState.area === 'biome' &&
        worldState.enemies.some(
          (enemy) =>
            !enemy.dead &&
            enemy.region === worldState.regionIndex &&
            Math.hypot(enemy.sprite.x - visuals.player.x, enemy.sprite.y - visuals.player.y) <
              GAME_CONFIG.combatMusicDistance,
        );
      this.combatLeft = threat ? GAME_CONFIG.combatMusicHold : Math.max(0, this.combatLeft - dt);
    }
    this.context.audio.update(dt, flow.playing || flow.cinematic, worldState.weather, this.mode());
  }

  private mode(): MusicMode {
    const { flow, worldState } = this.context;
    if (flow.state === 'story') {
      return 'story';
    }
    if (worldState.area === 'village' || worldState.area === 'interior') {
      return 'village';
    }
    const boss = worldState.enemies.find(
      (enemy) => !enemy.dead && enemy.kind === 'boss' && enemy.region === worldState.regionIndex,
    );
    if (worldState.area === 'biome' && boss) {
      return boss.phase2 ? 'rage' : 'boss';
    }
    return this.combatLeft > 0 ? 'combat' : 'explore';
  }
}
