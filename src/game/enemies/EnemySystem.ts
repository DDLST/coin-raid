import {
  COMBAT_CONFIG,
  PATH_INTERVAL,
  PLAYER_RADIUS,
  PROLOGUE_WIDTH,
  REGIONS,
  SPAWN_CONFIG,
  WORLD_HEIGHT,
} from '../Constants';
import { stats } from '../combat/CombatRules';
import { type GameScene } from '../GameScene';
import {
  type Bounds,
  clampPoint,
  clearLine,
  findPath,
  moveCircle,
  type Point,
} from '../world/Navigation';
import { type EnemyKind } from '../world/WorldLayout';
import { enemyStats } from './EnemyStats';
import { type Enemy } from './EnemyTypes';

/** Создание противников, выбор цели, поиск пути и обновление поведения. */
export class EnemySystem {
  constructor(private readonly context: GameScene) {}
  predict(enemy: Enemy): Point {
    const { hero, visuals } = this.context;
    const d = Math.hypot(enemy.sprite.x - visuals.player.x, enemy.sprite.y - visuals.player.y);
    const speed = Math.hypot(hero.velocity.x, hero.velocity.y);
    const time = speed ? Math.min(0.6 + (enemy.id % 3) * 0.08, d / 450, 150 / speed) : 0;
    return clampPoint(
      {
        x: visuals.player.x + hero.velocity.x * time,
        y: visuals.player.y + hero.velocity.y * time,
      },
      this.enemyBounds(enemy),
    );
  }
  walkEnemy(enemy: Enemy, target: Point, speed: number, dt: number): void {
    const { worldState } = this.context;
    let aim = target;
    const bounds = this.enemyBounds(enemy);
    const terrain = worldState.terrainByRegion[enemy.region];
    const grid =
      enemy.kind === 'boss' ? worldState.bossNav[enemy.region] : worldState.nav[enemy.region];
    if (!clearLine(enemy.sprite, target, enemy.radius, terrain, bounds)) {
      if (enemy.nextPath <= 0) {
        enemy.path = findPath(enemy.sprite, target, grid);
        enemy.nextPath = PATH_INTERVAL;
      }
      while (
        enemy.path.length > 1 &&
        (Math.hypot(enemy.sprite.x - enemy.path[0].x, enemy.sprite.y - enemy.path[0].y) < 14 ||
          clearLine(enemy.sprite, enemy.path[1], enemy.radius, terrain, bounds))
      ) {
        enemy.path.shift();
      }
      if (enemy.path.length) {
        aim = enemy.path[0];
      }
    } else {
      enemy.path = [];
      enemy.nextPath = 0;
    }
    const dx = aim.x - enemy.sprite.x;
    const dy = aim.y - enemy.sprite.y;
    const len = Math.hypot(dx, dy) || 1;
    const travel = Math.min(speed * dt, len);
    if (enemy.mode === 'chase') {
      enemy.aim = { x: dx / len, y: dy / len };
    }
    const moved = moveCircle(
      enemy.sprite,
      (dx / len) * travel,
      (dy / len) * travel,
      enemy.radius,
      terrain,
      bounds,
    );
    enemy.sprite.setPosition(moved.x, moved.y).setFlipX(dx < 0);
  }
  spawnEnemy(kind: EnemyKind, index: number, variant = 0, point?: Point): Enemy {
    const { worldState, journey } = this.context;
    const r = REGIONS[index];
    const boss = kind === 'boss';
    const parameters = enemyStats(kind, index);
    const pos =
      point ?? this.context.world.freePosition(index, parameters.radius, SPAWN_CONFIG.bossDistance);
    const key = boss ? r.bossTexture : kind;
    const { hp, size } = parameters;
    const sprite = this.context.add
      .image(pos.x, pos.y, key)
      .setDisplaySize(size, size)
      .setDepth(20 + pos.y * 0.01);
    const shadow = this.context.add
      .ellipse(
        pos.x,
        pos.y + (boss ? 36 : 21),
        boss ? 66 : kind === 'dragon' ? 53 : 35,
        boss ? 22 : 14,
        0x092a27,
        0.32,
      )
      .setDepth(8);
    const enemy: Enemy = {
      id: journey.nextId++,
      region: index,
      kind,
      variant,
      sprite,
      shadow,
      hp,
      maxHP: hp,
      radius: parameters.radius,
      damage: parameters.damage,
      reward: parameters.reward,
      speed: parameters.speed,
      mode: 'chase',
      clock: 1.7 + variant * 0.22,
      nextPath: 0,
      path: [],
      aim: { x: 1, y: 0 },
      target: { ...pos },
      hasHit: false,
      stun: 0,
      flash: 0,
      phase2: false,
      dead: false,
      move: 'slash',
      moveIndex: variant,
      training: false,
      chain: 0,
      bleed: 0,
      bleedTick: 1,
      recoil: 0,
      voiceLeft: 0,
    };
    worldState.enemies.push(enemy);
    return enemy;
  }

  updateEnemies(dt: number): void {
    const { worldState, journey, visuals } = this.context;
    for (const enemy of [...worldState.enemies]) {
      if (
        enemy.dead ||
        enemy.region !== worldState.regionIndex ||
        (worldState.area !== 'biome' && worldState.area !== 'tutorial') ||
        (worldState.area === 'tutorial') !== enemy.training
      ) {
        continue;
      }
      enemy.recoil = Math.max(0, enemy.recoil - dt);
      enemy.voiceLeft = Math.max(0, enemy.voiceLeft - dt);
      enemy.stun = Math.max(0, enemy.stun - dt);
      enemy.flash = Math.max(0, enemy.flash - dt);
      enemy.nextPath -= dt;
      if (enemy.bleed > 0) {
        enemy.bleed -= dt;
        enemy.bleedTick -= dt;
        if (enemy.bleedTick <= 0) {
          enemy.bleedTick = COMBAT_CONFIG.bleedInterval;
          enemy.hp = Math.max(
            0,
            enemy.hp - stats(journey.profile).damage * COMBAT_CONFIG.bleedDamageScale,
          );
          enemy.flash = 0.1;
          this.context.effects.particles(enemy.sprite.x, enemy.sprite.y, 3, 0xe3a287);
          if (enemy.hp === 0) {
            this.context.defeats.killEnemy(enemy);
          }
        }
      }
      if (enemy.dead) {
        continue;
      }
      if (enemy.stun > 0) {
        continue;
      }
      enemy.clock -= dt;
      const bounds = this.enemyBounds(enemy);
      const distance = Math.hypot(
        visuals.player.x - enemy.sprite.x,
        visuals.player.y - enemy.sprite.y,
      );
      if (
        visuals.player.x < bounds.left! ||
        visuals.player.x > bounds.width - bounds.margin ||
        distance > 1100
      ) {
        continue;
      }
      const slow = this.context.weather.groundSpeed(enemy.sprite, false);
      this.context.bosses.updatePhase(enemy);
      if (enemy.mode === 'windup') {
        if (enemy.clock <= 0) {
          this.context.enemyAttacks.executeEnemyAttack(enemy);
        }
        continue;
      }
      if (enemy.mode === 'charge') {
        const speed =
          (enemy.kind === 'boss'
            ? enemy.phase2
              ? 480
              : 415
            : enemy.kind === 'vampire'
              ? 405
              : enemy.kind === 'dragon'
                ? 370
                : 300) * slow;
        const moved = moveCircle(
          enemy.sprite,
          enemy.aim.x * speed * dt,
          enemy.aim.y * speed * dt,
          enemy.radius,
          worldState.terrainByRegion[enemy.region],
          bounds,
        );
        enemy.sprite.setPosition(moved.x, moved.y).setFlipX(enemy.aim.x < 0);
        if (
          !enemy.hasHit &&
          Math.hypot(enemy.sprite.x - visuals.player.x, enemy.sprite.y - visuals.player.y) <
            enemy.radius + PLAYER_RADIUS + 9 &&
          clearLine(
            enemy.sprite,
            visuals.player,
            3,
            worldState.terrainByRegion[enemy.region],
            bounds,
          )
        ) {
          this.context.player.damagePlayer(enemy.damage, enemy.sprite, false, enemy);
          enemy.hasHit = true;
        }
        if (enemy.clock <= 0) {
          enemy.mode = 'recover';
          enemy.clock = enemy.kind === 'boss' ? (enemy.phase2 ? 0.64 : 0.95) : 0.85;
        }
        continue;
      }
      if (enemy.mode === 'recover') {
        if (enemy.clock <= 0) {
          enemy.mode = 'chase';
          enemy.clock =
            enemy.kind === 'boss'
              ? enemy.phase2
                ? 0.8
                : 1.2
              : enemy.kind === 'necromancer'
                ? 1.9
                : Math.max(0.5, 0.88 - enemy.region * 0.06);
        }
        continue;
      }
      const ranged =
        enemy.kind === 'archer' ||
        enemy.kind === 'alchemist' ||
        enemy.kind === 'necromancer' ||
        enemy.kind === 'dragon' ||
        enemy.kind === 'wraith' ||
        (enemy.kind === 'boss' &&
          (REGIONS[enemy.region].bossTexture === 'necromancer' ||
            REGIONS[enemy.region].bossTexture === 'dragon'));
      if (ranged && distance < 200) {
        const dx = enemy.sprite.x - visuals.player.x;
        const dy = enemy.sprite.y - visuals.player.y;
        const len = Math.hypot(dx, dy) || 1;
        this.walkEnemy(
          enemy,
          clampPoint(
            {
              x: enemy.sprite.x + (dx / len) * 150,
              y: enemy.sprite.y + (dy / len) * 150,
            },
            bounds,
          ),
          enemy.speed * slow,
          dt,
        );
      } else if (!ranged || distance > 350) {
        let target = this.predict(enemy);
        if (enemy.kind === 'skeleton' && distance > 120) {
          const a = Math.atan2(target.y - enemy.sprite.y, target.x - enemy.sprite.x);
          const side = Math.sin(enemy.id * 3 + journey.elapsed * 0.8) * 55;
          target = clampPoint(
            {
              x: target.x - Math.sin(a) * side,
              y: target.y + Math.cos(a) * side,
            },
            bounds,
          );
        }
        this.walkEnemy(enemy, target, enemy.speed * (enemy.phase2 ? 1.14 : 1) * slow, dt);
      }
      const reach =
        enemy.kind === 'boss'
          ? 640
          : enemy.kind === 'necromancer' ||
              enemy.kind === 'dragon' ||
              enemy.kind === 'archer' ||
              enemy.kind === 'alchemist'
            ? 520
            : enemy.kind === 'wraith'
              ? 400
              : enemy.kind === 'vampire' || enemy.kind === 'shade' || enemy.kind === 'gargoyle'
                ? 300
                : enemy.kind === 'knight'
                  ? 210
                  : enemy.kind === 'zombie'
                    ? 125
                    : 110;
      if (enemy.clock <= 0 && distance < reach) {
        this.context.enemyAttacks.startEnemyAttack(enemy);
      }
    }
  }

  enemyBounds(enemy: Enemy): Bounds {
    return enemy.training
      ? {
          width: PROLOGUE_WIDTH - 20,
          height: WORLD_HEIGHT,
          margin: 35,
          top: 65,
          left: 35,
        }
      : this.context.world.regionBounds(enemy.region);
  }
}
