import { HAZARD_CONFIG, PLAYER_RADIUS, REGIONS } from '../Constants';
import { type BossStrike, bossStrikeHits } from '../enemies/BossPatterns';
import { type GameScene } from '../GameScene';
import { weaponFor } from '../progression/PlayerProgression';
import { clearLine, type Point } from '../world/Navigation';

export type Hazard = Point & {
  region: number;
  radius: number;
  warning: number;
  left: number;
  damage: number;
  kind: 'poison' | 'meteor' | 'ring' | 'sigil' | 'wave' | 'curse' | 'boss';
  fired: boolean;
  environment?: boolean;
  bossStrike?: BossStrike;
  ownerId?: number;
};

/** Время предупреждений, попадания опасных зон и урон окружения. */
export class HazardSystem {
  constructor(private readonly context: GameScene) {}

  damageEnemiesInArea(at: Point, radius: number, damage: number): void {
    const { worldState } = this.context;
    for (const enemy of worldState.enemies) {
      if (
        !enemy.dead &&
        enemy.region === worldState.regionIndex &&
        Math.hypot(enemy.sprite.x - at.x, enemy.sprite.y - at.y) < radius + enemy.radius
      ) {
        enemy.hp = Math.max(0, enemy.hp - damage);
        enemy.flash = HAZARD_CONFIG.enemyHitFlash;
        enemy.stun = Math.max(
          enemy.stun,
          enemy.kind === 'boss' ? HAZARD_CONFIG.bossStun : HAZARD_CONFIG.minionStun,
        );
        if (enemy.hp === 0) {
          this.context.defeats.killEnemy(enemy);
        }
      }
    }
  }

  update(dt: number): void {
    const { hero, worldState, journey, visuals } = this.context;
    for (const hazard of worldState.hazards) {
      if (hazard.left <= 0) {
        continue;
      }
      hazard.left -= dt;
      const before = hazard.warning;
      hazard.warning -= dt;
      if (hazard.warning > 0) {
        continue;
      }
      if (hazard.kind === 'boss') {
        const owner = worldState.enemies.find((enemy) => enemy.id === hazard.ownerId);
        const attack = hazard.bossStrike;
        if (!owner || owner.dead || !attack) {
          hazard.left = 0;
          continue;
        }
        if (!hazard.fired) {
          hazard.fired = true;
          this.context.effects.particles(hazard.x, hazard.y, 4, REGIONS[hazard.region].fog);
          if (
            worldState.area === 'biome' &&
            hazard.region === worldState.regionIndex &&
            bossStrikeHits(attack, visuals.player, PLAYER_RADIUS)
          ) {
            const before = hero.hp;
            this.context.player.damagePlayer(
              hazard.damage,
              attack.physical ? owner.sprite : hazard,
              !attack.physical,
              owner,
            );
            if (owner.region === 2 && before > hero.hp) {
              owner.hp = Math.min(
                owner.maxHP,
                owner.hp + (before - hero.hp) * HAZARD_CONFIG.vampireBossHealing,
              );
            }
          }
        }
        continue;
      }
      if (hazard.kind === 'sigil' && !hazard.fired) {
        hazard.fired = true;
        this.context.effects.addEffect(
          'ring',
          hazard,
          weaponFor(journey.profile).color,
          hazard.radius,
        );
        for (const enemy of worldState.enemies) {
          if (
            !enemy.dead &&
            enemy.region === hazard.region &&
            Math.hypot(enemy.sprite.x - hazard.x, enemy.sprite.y - hazard.y) <
              hazard.radius + enemy.radius &&
            clearLine(
              hazard,
              enemy.sprite,
              3,
              this.context.world.activeTerrain(),
              this.context.world.playerBounds(),
            )
          ) {
            this.context.combat.hitEnemy(enemy, hazard.damage, HAZARD_CONFIG.sigilKnockback);
          }
        }
      }
      if (hazard.kind === 'meteor' && !hazard.fired) {
        hazard.fired = true;
        this.context.audio.play('meteor');
        this.context.effects.particles(hazard.x, hazard.y, 14, 0xffc699);
        if (hazard.environment) {
          this.damageEnemiesInArea(
            hazard,
            hazard.radius,
            hazard.damage * HAZARD_CONFIG.meteorEnemyDamageScale,
          );
        }
        if (
          Math.hypot(hazard.x - visuals.player.x, hazard.y - visuals.player.y) <
          hazard.radius + PLAYER_RADIUS
        ) {
          this.context.player.damagePlayer(hazard.damage, hazard, true);
        }
      }
      if (
        (hazard.kind === 'poison' || hazard.kind === 'curse') &&
        hazard.left > 0 &&
        Math.hypot(hazard.x - visuals.player.x, hazard.y - visuals.player.y) <
          hazard.radius + PLAYER_RADIUS
      ) {
        this.context.player.damagePlayer(hazard.damage, hazard, true);
      }
      if (hazard.kind === 'wave') {
        hazard.radius += HAZARD_CONFIG.waveSpeed * dt;
        const d = Math.hypot(hazard.x - visuals.player.x, hazard.y - visuals.player.y);
        if (
          !hazard.fired &&
          Math.abs(d - hazard.radius) < PLAYER_RADIUS + HAZARD_CONFIG.waveThickness
        ) {
          this.context.player.damagePlayer(hazard.damage, hazard, true);
          if (hero.hurtLeft > 0) {
            hazard.fired = true;
          }
        }
      }
      if (before > 0 && hazard.kind === 'ring') {
        hazard.fired = true;
      }
    }
    worldState.hazards = worldState.hazards.filter((hazard) => hazard.left > 0);
  }

  reset(): void {
    this.context.worldState.hazards = [];
  }
}
