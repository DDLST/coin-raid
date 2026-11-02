import { MAX_MINIONS, REGIONS, SPAWN_CONFIG, WAVE_FIRST, WAVE_SIZE } from '../Constants';
import { type GameScene } from '../GameScene';
import { enemyStats } from './EnemyStats';

/** Появление волн и босса. Все часы обновляются только во время игры. */
export class EnemySpawnSystem {
  private waveClock = WAVE_FIRST;
  private waveNumber = 0;
  private pruneLeft: number = SPAWN_CONFIG.pruneInterval;

  constructor(private readonly context: GameScene) {}

  reset(): void {
    this.waveClock = WAVE_FIRST;
    this.waveNumber = 0;
    this.pruneLeft = SPAWN_CONFIG.pruneInterval;
  }

  updateWaves(dt: number): void {
    const { worldState, journey } = this.context;
    this.pruneLeft -= dt;
    if (this.pruneLeft <= 0) {
      this.pruneLeft = SPAWN_CONFIG.pruneInterval;
      worldState.enemies = worldState.enemies.filter((enemy) => {
        if (!enemy.dead || enemy.sprite.visible) {
          return true;
        }
        enemy.sprite.destroy();
        enemy.shadow.destroy();
        return false;
      });
    }
    if (worldState.area !== 'biome' || journey.progress[worldState.regionIndex].bossDead) {
      return;
    }
    this.waveClock -= dt;
    const active = worldState.enemies.filter(
      (enemy) => enemy.region === worldState.regionIndex && !enemy.dead && enemy.kind !== 'boss',
    ).length;
    const cap = Math.min(MAX_MINIONS, SPAWN_CONFIG.baseCap + worldState.regionIndex);
    if (this.waveClock > 0 && active > 0) {
      return;
    }
    this.waveClock = Math.max(
      SPAWN_CONFIG.minimumInterval,
      SPAWN_CONFIG.baseInterval - worldState.regionIndex * SPAWN_CONFIG.intervalRegionReduction,
    );
    this.waveNumber++;
    const roster = REGIONS[worldState.regionIndex].roster.flatMap((g) =>
      Array.from({ length: g.count }, () => g.kind),
    );
    for (let n = 0; n < Math.min(WAVE_SIZE, cap - active); n++) {
      const kind = roster[(this.waveNumber * WAVE_SIZE + n) % roster.length];
      const at = this.context.world.freePosition(
        worldState.regionIndex,
        enemyStats(kind, worldState.regionIndex).radius,
        SPAWN_CONFIG.minionDistance,
      );
      const enemy = this.context.enemies.spawnEnemy(
        kind,
        worldState.regionIndex,
        this.waveNumber + n,
        at,
      );
      enemy.stun = SPAWN_CONFIG.waveStun;
      enemy.clock = SPAWN_CONFIG.firstWaveClock;
      worldState.hazards.push({
        ...at,
        region: worldState.regionIndex,
        radius: SPAWN_CONFIG.warningRadius,
        warning: SPAWN_CONFIG.warningDuration,
        left: SPAWN_CONFIG.warningLifetime,
        damage: 0,
        kind: 'ring',
        fired: false,
      });
      this.context.effects.particles(at.x, at.y, 5, REGIONS[worldState.regionIndex].fog);
    }
  }

  spawnBoss(): void {
    const { worldState } = this.context;
    const boss = this.context.enemies.spawnEnemy(
      'boss',
      worldState.regionIndex,
      0,
      this.context.world.freePosition(
        worldState.regionIndex,
        enemyStats('boss', worldState.regionIndex).radius,
        SPAWN_CONFIG.bossDistance,
      ),
    );
    boss.voiceLeft = SPAWN_CONFIG.bossVoiceDuration;
    boss.stun = SPAWN_CONFIG.bossStun;
    this.context.bosses.resetBossCountdown();
    this.context.audio.play('boss');
    this.context.audio.play('scream');
    this.context.menu.toast('ФАЗА 2');
    this.context.cameras.main.shake(180, 0.0025);
    this.context.hud.updateHUD();
  }
}
