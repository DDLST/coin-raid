import { PLAYER_RADIUS, PROJECTILE_CONFIG, REGIONS } from '../Constants';
import { type Enemy } from '../enemies/EnemyTypes';
import { type GameScene } from '../GameScene';
import { clearLine, type Point } from '../world/Navigation';

export type Projectile = Point & {
  vx: number;
  vy: number;
  life: number;
  damage: number;
  region: number;
  friendly: boolean;
  color: number;
  radius: number;
  blast: number;
  visual: string;
  hits: Set<number>;
};

/** Создание снарядов, движение, столкновения и завершение их жизни. */
export class ProjectileSystem {
  constructor(private readonly context: GameScene) {}

  enemyProjectileTexture(enemy: Enemy): string {
    const kind = enemy.kind === 'boss' ? REGIONS[enemy.region].bossTexture : enemy.kind;
    return enemy.move === 'breath' || kind === 'dragon'
      ? 'shot-fire'
      : kind === 'vampire'
        ? 'shot-bat'
        : kind === 'alchemist' || kind === 'zombie'
          ? 'shot-acid'
          : kind === 'skeleton' || kind === 'archer'
            ? 'shot-bone'
            : kind === 'knight' && enemy.region === 4
              ? 'shot-ice'
              : kind === 'wraith' || kind === 'shade'
                ? 'shot-shadow'
                : 'shot-violet';
  }

  shoot(
    from: Point,
    angle: number,
    speed: number,
    damage: number,
    friendly: boolean,
    region: number,
    color: number,
    blast: number,
    visual = friendly ? 'shot-spirit' : 'shot-violet',
  ): void {
    const { worldState } = this.context;
    worldState.projectiles.push({
      x: from.x + Math.cos(angle) * PROJECTILE_CONFIG.muzzleOffset,
      y: from.y + Math.sin(angle) * PROJECTILE_CONFIG.muzzleOffset,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: friendly ? PROJECTILE_CONFIG.friendlyLifetime : PROJECTILE_CONFIG.enemyLifetime,
      damage,
      region,
      friendly,
      color,
      radius: friendly ? PROJECTILE_CONFIG.friendlyRadius : PROJECTILE_CONFIG.enemyRadius,
      blast,
      visual,
      hits: new Set(),
    });
  }

  update(dt: number): void {
    const { worldState, visuals } = this.context;
    for (const projectile of worldState.projectiles) {
      projectile.life -= dt;
      const before = { x: projectile.x, y: projectile.y };
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      if (
        !clearLine(
          before,
          projectile,
          3,
          worldState.terrainByRegion[projectile.region],
          this.context.world.regionBounds(projectile.region),
        )
      ) {
        projectile.life = 0;
      }
      if (projectile.life <= 0) {
        continue;
      }
      if (projectile.friendly) {
        const target = worldState.enemies.find(
          (enemy) =>
            !enemy.dead &&
            enemy.region === projectile.region &&
            !projectile.hits.has(enemy.id) &&
            Math.hypot(enemy.sprite.x - projectile.x, enemy.sprite.y - projectile.y) <
              enemy.radius + projectile.radius,
        );
        if (target) {
          projectile.hits.add(target.id);
          this.context.combat.hitEnemy(target, projectile.damage, PROJECTILE_CONFIG.hitKnockback);
          if (projectile.blast > 0) {
            this.context.effects.particles(projectile.x, projectile.y, 12, projectile.color);
            for (const enemy of worldState.enemies) {
              if (
                enemy !== target &&
                !enemy.dead &&
                enemy.region === projectile.region &&
                Math.hypot(enemy.sprite.x - projectile.x, enemy.sprite.y - projectile.y) <
                  projectile.blast + enemy.radius &&
                clearLine(
                  projectile,
                  enemy.sprite,
                  3,
                  worldState.terrainByRegion[projectile.region],
                  this.context.world.regionBounds(projectile.region),
                )
              ) {
                this.context.combat.hitEnemy(
                  enemy,
                  projectile.damage * PROJECTILE_CONFIG.blastDamageScale,
                  PROJECTILE_CONFIG.blastKnockback,
                );
              }
            }
          }
          projectile.life = 0;
        }
      } else if (
        Math.hypot(projectile.x - visuals.player.x, projectile.y - visuals.player.y) <
        PLAYER_RADIUS + projectile.radius
      ) {
        this.context.player.damagePlayer(projectile.damage, projectile, true);
        projectile.life = 0;
      }
    }
    worldState.projectiles = worldState.projectiles.filter((projectile) => projectile.life > 0);
  }

  reset(): void {
    this.context.worldState.projectiles = [];
  }
}
