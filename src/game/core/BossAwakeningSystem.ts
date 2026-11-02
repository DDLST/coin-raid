import { REGIONS } from '../Constants';
import { type GameScene } from '../GameScene';

/** Условие пробуждения отделено от однократного перехода к бою с боссом. */
export class BossAwakeningSystem {
  constructor(private readonly context: GameScene) {}

  shouldAwakenBoss(): boolean {
    const { flow, worldState, journey } = this.context;
    if (!flow.playing || worldState.area !== 'biome') {
      return false;
    }
    const progress = journey.progress[worldState.regionIndex];
    return (
      !progress.spawned &&
      !progress.bossDead &&
      progress.coins >= REGIONS[worldState.regionIndex].coins
    );
  }

  update(): void {
    if (this.shouldAwakenBoss()) {
      this.enterBossPhase();
    }
  }

  enterBossPhase(): void {
    const { worldState, journey } = this.context;
    if (!this.context.flow.playing || worldState.area !== 'biome') {
      return;
    }
    const progress = journey.progress[worldState.regionIndex];
    if (progress.spawned || progress.bossDead) {
      return;
    }
    progress.spawned = true;
    this.context.enemySpawner.spawnBoss();
  }
}
