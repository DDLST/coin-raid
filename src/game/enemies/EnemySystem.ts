import { enemyStats } from './EnemyConfig';
import { type Enemy } from './EnemyTypes';
import {
  type Point,
  clampPoint,
  clearLine,
  findPath,
  moveCircle,
  freePoint,
  type Bounds,
} from '../world/Navigation';
import { PATH_INTERVAL, MAX_MINIONS, WAVE_SIZE, THIRD_BIOME_WINDUP } from './EnemyConfig';
import {
  type EnemyKind,
  REGIONS,
  type EnemyAttack,
  PROLOGUE_WIDTH,
  WORLD_HEIGHT,
} from '../world/WorldConfig';
import { stats, PLAYER_RADIUS, slashConnects } from '../combat/CombatRules';
import type { GameScene } from '../GameScene';

/** Создание противников, волны, поиск пути и обычные вражеские атаки. */
export class EnemySystem {
  constructor(private readonly context: GameScene) {}
  predict(e: Enemy): Point {
    const { hero, visuals } = this.context;
    const d = Math.hypot(e.sprite.x - visuals.player.x, e.sprite.y - visuals.player.y),
      speed = Math.hypot(hero.velocity.x, hero.velocity.y);
    const time = speed ? Math.min(0.6 + (e.id % 3) * 0.08, d / 450, 150 / speed) : 0;
    return clampPoint(
      {
        x: visuals.player.x + hero.velocity.x * time,
        y: visuals.player.y + hero.velocity.y * time,
      },
      this.enemyBounds(e),
    );
  }
  walkEnemy(e: Enemy, target: Point, speed: number, dt: number): void {
    const { worldState } = this.context;
    let aim = target;
    const bounds = this.enemyBounds(e),
      terrain = worldState.terrainByRegion[e.region],
      grid = e.kind === 'boss' ? worldState.bossNav[e.region] : worldState.nav[e.region];
    if (!clearLine(e.sprite, target, e.radius, terrain, bounds)) {
      if (e.nextPath <= 0) {
        e.path = findPath(e.sprite, target, grid);
        e.nextPath = PATH_INTERVAL;
      }
      while (
        e.path.length > 1 &&
        (Math.hypot(e.sprite.x - e.path[0].x, e.sprite.y - e.path[0].y) < 14 ||
          clearLine(e.sprite, e.path[1], e.radius, terrain, bounds))
      )
        e.path.shift();
      if (e.path.length) aim = e.path[0];
    } else {
      e.path = [];
      e.nextPath = 0;
    }
    const dx = aim.x - e.sprite.x,
      dy = aim.y - e.sprite.y,
      len = Math.hypot(dx, dy) || 1,
      travel = Math.min(speed * dt, len);
    if (e.mode === 'chase') e.aim = { x: dx / len, y: dy / len };
    const moved = moveCircle(
      e.sprite,
      (dx / len) * travel,
      (dy / len) * travel,
      e.radius,
      terrain,
      bounds,
    );
    e.sprite.setPosition(moved.x, moved.y).setFlipX(dx < 0);
  }
  spawnEnemy(kind: EnemyKind, index: number, variant = 0, point?: Point): Enemy {
    const { worldState, journey } = this.context;
    const r = REGIONS[index],
      boss = kind === 'boss',
      pos = point ?? this.context.world.freePosition(index, boss ? 34 : 20, 310),
      key = boss ? r.bossTexture : kind;
    const parameters = enemyStats(kind, index);
    const { hp, size } = parameters;
    const sprite = this.context.add
        .image(pos.x, pos.y, key)
        .setDisplaySize(size, size)
        .setDepth(20 + pos.y * 0.01),
      shadow = this.context.add
        .ellipse(
          pos.x,
          pos.y + (boss ? 36 : 21),
          boss ? 66 : kind === 'dragon' ? 53 : 35,
          boss ? 22 : 14,
          0x092a27,
          0.32,
        )
        .setDepth(8);
    const e: Enemy = {
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
    worldState.enemies.push(e);
    return e;
  }
  updateWaves(dt: number): void {
    const { worldState, journey } = this.context;
    journey.pruneLeft -= dt;
    if (journey.pruneLeft <= 0) {
      journey.pruneLeft = 1;
      worldState.enemies = worldState.enemies.filter((e) => {
        if (!e.dead || e.sprite.visible) return true;
        e.sprite.destroy();
        e.shadow.destroy();
        return false;
      });
    }
    if (worldState.area !== 'biome' || journey.progress[worldState.regionIndex].bossDead) return;
    journey.waveClock -= dt;
    const active = worldState.enemies.filter(
        (e) => e.region === worldState.regionIndex && !e.dead && e.kind !== 'boss',
      ).length,
      cap = Math.min(MAX_MINIONS, 12 + worldState.regionIndex);
    if (journey.waveClock > 0 && active > 0) return;
    journey.waveClock = Math.max(5, 9 - worldState.regionIndex * 0.45);
    journey.waveNumber++;
    const roster = REGIONS[worldState.regionIndex].roster.flatMap((g) =>
      Array.from({ length: g.count }, () => g.kind),
    );
    for (let n = 0; n < Math.min(WAVE_SIZE, cap - active); n++) {
      const kind = roster[(journey.waveNumber * 3 + n) % roster.length],
        at = this.context.world.freePosition(
          worldState.regionIndex,
          kind === 'dragon' ? 25 : 20,
          240,
        ),
        e = this.spawnEnemy(kind, worldState.regionIndex, journey.waveNumber + n, at);
      e.stun = 0.95;
      e.clock = 1.2;
      worldState.hazards.push({
        ...at,
        region: worldState.regionIndex,
        radius: 32,
        warning: 0.9,
        left: 1.2,
        damage: 0,
        kind: 'ring',
        fired: false,
      });
      this.context.effects.particles(at.x, at.y, 5, REGIONS[worldState.regionIndex].fog);
    }
  }
  spawnBoss(): void {
    const { worldState, journey } = this.context;
    const p = journey.progress[worldState.regionIndex];
    if (p.spawned || p.bossDead) return;
    p.spawned = true;
    const boss = this.spawnEnemy(
      'boss',
      worldState.regionIndex,
      0,
      this.context.world.freePosition(worldState.regionIndex, 35, 310),
    );
    boss.voiceLeft = 1.2;
    boss.stun = 0.7;
    this.context.bosses.resetBossCountdown();
    this.context.audio.play('boss');
    this.context.audio.play('scream');
    this.context.menu.toast('ФАЗА 2');
    this.context.cameras.main.shake(180, 0.0025);
    this.context.menu.updateHUD();
  }
  startEnemyAttack(e: Enemy): void {
    const { hero, worldState, visuals } = this.context;
    if (e.kind === 'boss') {
      this.context.bosses.startBossAttack(e);
      return;
    }
    const moves: Record<Exclude<EnemyKind, 'boss'>, EnemyAttack[]> = {
      skeleton: ['slash', 'combo', 'snipe'],
      zombie: ['combo', 'poison', 'slam'],
      necromancer: ['fan', 'summon', 'curse', 'snipe'],
      vampire: ['blink', 'combo', 'fan', 'nova'],
      dragon: ['breath', 'charge', 'meteor'],
      wraith: ['blink', 'curse', 'nova'],
      knight: ['combo', 'snipe', 'charge', 'quake'],
      archer: ['snipe', 'fan'],
      alchemist: ['poison', 'curse', 'fan'],
      shade: ['blink', 'combo', 'charge'],
      gargoyle: ['charge', 'quake', 'slam'],
    };
    const choices = e.training ? (['slash'] as EnemyAttack[]) : moves[e.kind];
    e.move = choices[e.moveIndex % choices.length];
    e.moveIndex++;
    e.chain = 0;
    e.target = this.predict(e);
    if (e.move === 'blink') {
      const at = clampPoint(
        {
          x: e.target.x - Math.cos(hero.face) * 100,
          y: e.target.y - Math.sin(hero.face) * 100,
        },
        this.enemyBounds(e),
      );
      e.target = freePoint(at, e.radius, worldState.terrainByRegion[e.region], this.enemyBounds(e))
        ? at
        : {
            x: visuals.player.x,
            y: visuals.player.y,
          };
    }
    const dx = e.target.x - e.sprite.x,
      dy = e.target.y - e.sprite.y,
      len = Math.hypot(dx, dy) || 1;
    e.aim = { x: dx / len, y: dy / len };
    e.mode = 'windup';
    e.hasHit = false;
    const complex = [
      'summon',
      'meteor',
      'breath',
      'blink',
      'poison',
      'nova',
      'snipe',
      'curse',
      'quake',
    ].includes(e.move);
    e.clock = e.training
      ? 0.9
      : (complex ? 0.92 : 0.62) * (e.phase2 ? 0.78 : 1) * (e.region === 2 ? THIRD_BIOME_WINDUP : 1);
  }
  updateEnemies(dt: number): void {
    const { worldState, journey, visuals } = this.context;
    for (const e of [...worldState.enemies]) {
      if (
        e.dead ||
        e.region !== worldState.regionIndex ||
        (worldState.area !== 'biome' && worldState.area !== 'tutorial') ||
        (worldState.area === 'tutorial') !== e.training
      )
        continue;
      e.recoil = Math.max(0, e.recoil - dt);
      e.voiceLeft = Math.max(0, e.voiceLeft - dt);
      e.stun = Math.max(0, e.stun - dt);
      e.flash = Math.max(0, e.flash - dt);
      e.nextPath -= dt;
      if (e.bleed > 0) {
        e.bleed -= dt;
        e.bleedTick -= dt;
        if (e.bleedTick <= 0) {
          e.bleedTick = 1;
          e.hp = Math.max(0, e.hp - stats(journey.profile).damage * 0.18);
          e.flash = 0.1;
          this.context.effects.particles(e.sprite.x, e.sprite.y, 3, 0xe3a287);
          if (e.hp === 0) this.context.combat.killEnemy(e);
        }
      }
      if (e.dead) continue;
      if (e.stun > 0) continue;
      e.clock -= dt;
      const bounds = this.enemyBounds(e),
        distance = Math.hypot(visuals.player.x - e.sprite.x, visuals.player.y - e.sprite.y);
      if (
        visuals.player.x < bounds.left! ||
        visuals.player.x > bounds.width - bounds.margin ||
        distance > 1100
      )
        continue;
      const slow = this.context.weather.groundSpeed(e.sprite, false);
      if (e.kind === 'boss' && !e.phase2 && e.hp <= e.maxHP * 0.5) {
        e.phase2 = true;
        e.voiceLeft = 0.9;
        this.context.audio.play('roar');
        e.clock = Math.min(e.clock, 0.5);
        this.summonMinions(e, 2);
        this.context.menu.toast(
          `${REGIONS[e.region].bossName}: вторая фаза. Ускоренные приёмы и призванная нежить.`,
        );
      }
      if (e.mode === 'windup') {
        if (e.clock <= 0) this.executeEnemyAttack(e);
        continue;
      }
      if (e.mode === 'charge') {
        const speed =
          (e.kind === 'boss'
            ? e.phase2
              ? 480
              : 415
            : e.kind === 'vampire'
              ? 405
              : e.kind === 'dragon'
                ? 370
                : 300) * slow;
        const moved = moveCircle(
          e.sprite,
          e.aim.x * speed * dt,
          e.aim.y * speed * dt,
          e.radius,
          worldState.terrainByRegion[e.region],
          bounds,
        );
        e.sprite.setPosition(moved.x, moved.y).setFlipX(e.aim.x < 0);
        if (
          !e.hasHit &&
          Math.hypot(e.sprite.x - visuals.player.x, e.sprite.y - visuals.player.y) <
            e.radius + PLAYER_RADIUS + 9 &&
          clearLine(e.sprite, visuals.player, 3, worldState.terrainByRegion[e.region], bounds)
        ) {
          this.context.player.damagePlayer(e.damage, e.sprite, false, e);
          e.hasHit = true;
        }
        if (e.clock <= 0) {
          e.mode = 'recover';
          e.clock = e.kind === 'boss' ? (e.phase2 ? 0.64 : 0.95) : 0.85;
        }
        continue;
      }
      if (e.mode === 'recover') {
        if (e.clock <= 0) {
          e.mode = 'chase';
          e.clock =
            e.kind === 'boss'
              ? e.phase2
                ? 0.8
                : 1.2
              : e.kind === 'necromancer'
                ? 1.9
                : Math.max(0.5, 0.88 - e.region * 0.06);
        }
        continue;
      }
      const ranged =
        e.kind === 'archer' ||
        e.kind === 'alchemist' ||
        e.kind === 'necromancer' ||
        e.kind === 'dragon' ||
        e.kind === 'wraith' ||
        (e.kind === 'boss' &&
          (REGIONS[e.region].bossTexture === 'necromancer' ||
            REGIONS[e.region].bossTexture === 'dragon'));
      if (ranged && distance < 200) {
        const dx = e.sprite.x - visuals.player.x,
          dy = e.sprite.y - visuals.player.y,
          len = Math.hypot(dx, dy) || 1;
        this.walkEnemy(
          e,
          clampPoint(
            {
              x: e.sprite.x + (dx / len) * 150,
              y: e.sprite.y + (dy / len) * 150,
            },
            bounds,
          ),
          e.speed * slow,
          dt,
        );
      } else if (!ranged || distance > 350) {
        let target = this.predict(e);
        if (e.kind === 'skeleton' && distance > 120) {
          const a = Math.atan2(target.y - e.sprite.y, target.x - e.sprite.x),
            side = Math.sin(e.id * 3 + journey.elapsed * 0.8) * 55;
          target = clampPoint(
            {
              x: target.x - Math.sin(a) * side,
              y: target.y + Math.cos(a) * side,
            },
            bounds,
          );
        }
        this.walkEnemy(e, target, e.speed * (e.phase2 ? 1.14 : 1) * slow, dt);
      }
      const reach =
        e.kind === 'boss'
          ? 640
          : e.kind === 'necromancer' ||
              e.kind === 'dragon' ||
              e.kind === 'archer' ||
              e.kind === 'alchemist'
            ? 520
            : e.kind === 'wraith'
              ? 400
              : e.kind === 'vampire' || e.kind === 'shade' || e.kind === 'gargoyle'
                ? 300
                : e.kind === 'knight'
                  ? 210
                  : e.kind === 'zombie'
                    ? 125
                    : 110;
      if (e.clock <= 0 && distance < reach) this.startEnemyAttack(e);
    }
  }
  recoverEnemy(e: Enemy, seconds = 1): void {
    e.mode = 'recover';
    e.clock = seconds * (e.phase2 ? 0.75 : 1);
  }
  executeEnemyAttack(e: Enemy): void {
    const { hero, worldState, visuals } = this.context;
    if (e.kind === 'boss') {
      this.context.bosses.executeBossAttack(e);
      return;
    }
    e.recoil = 0.26;
    if (e.move === 'breath') {
      e.voiceLeft = 0.75;
      this.context.audio.play('roar');
    }
    const angle = Math.atan2(e.aim.y, e.aim.x);
    if (e.move === 'charge') {
      e.mode = 'charge';
      e.clock = 0.37;
      this.context.audio.play('dash');
      return;
    }
    if (e.move === 'slash' || e.move === 'combo') {
      const reach = e.kind === 'zombie' ? 86 : e.kind === 'knight' ? 112 : 92;
      this.context.effects.addEffect('slash', e.sprite, 0xf49a8b, reach, angle);
      if (
        slashConnects(e.sprite, angle, visuals.player, PLAYER_RADIUS, reach, 1.2) &&
        clearLine(
          e.sprite,
          visuals.player,
          3,
          worldState.terrainByRegion[e.region],
          this.enemyBounds(e),
        )
      ) {
        const before = hero.hp;
        this.context.player.damagePlayer(
          e.damage * (e.move === 'combo' && e.chain === 2 ? 1.15 : 1),
          e.sprite,
          false,
          e,
        );
        if (e.kind === 'vampire' && hero.hp < before)
          e.hp = Math.min(e.maxHP, e.hp + (before - hero.hp) * 0.7);
      }
      this.context.audio.play(e.kind === 'zombie' || e.kind === 'vampire' ? 'bite' : 'slash');
      if (e.stun > 0.05) return;
      if (e.move === 'combo' && ++e.chain < 2) {
        e.target = this.predict(e);
        const dx = e.target.x - e.sprite.x,
          dy = e.target.y - e.sprite.y,
          len = Math.hypot(dx, dy) || 1;
        e.aim = { x: dx / len, y: dy / len };
        e.mode = 'windup';
        e.clock = 0.44;
        return;
      }
    } else if (e.move === 'slam') {
      if (
        Math.hypot(e.sprite.x - visuals.player.x, e.sprite.y - visuals.player.y) <
          155 + PLAYER_RADIUS &&
        clearLine(
          e.sprite,
          visuals.player,
          3,
          worldState.terrainByRegion[e.region],
          this.enemyBounds(e),
        )
      )
        this.context.player.damagePlayer(e.damage * 1.15, e.sprite, false, e);
      worldState.hazards.push({
        x: e.sprite.x,
        y: e.sprite.y,
        region: e.region,
        radius: 155,
        warning: 0,
        left: 0.35,
        damage: 0,
        kind: 'ring',
        fired: true,
      });
      this.context.audio.play('axe');
      this.context.effects.particles(e.sprite.x, e.sprite.y, 16, 0xb9c892);
    } else if (e.move === 'poison' || e.move === 'curse') {
      const at = e.move === 'curse' ? e.target : e.sprite;
      worldState.hazards.push({
        x: at.x,
        y: at.y,
        region: e.region,
        radius: e.move === 'curse' ? 100 : 72,
        warning: e.move === 'curse' ? 0.9 : 0.5,
        left: e.move === 'curse' ? 4.5 : 5.5,
        damage: e.damage * (e.move === 'curse' ? 0.38 : 0.5),
        kind: e.move === 'curse' ? 'curse' : 'poison',
        fired: false,
      });
      this.context.audio.play('cast');
    } else if (e.move === 'summon') {
      this.summonMinions(e, 1);
      this.context.audio.play('cast');
    } else if (e.move === 'fan' || e.move === 'breath' || e.move === 'nova' || e.move === 'snipe') {
      const count =
        e.move === 'nova'
          ? e.phase2
            ? 14
            : 10
          : e.move === 'snipe'
            ? 1
            : e.move === 'breath'
              ? e.phase2
                ? 9
                : 6
              : 4;
      for (let n = 0; n < count; n++) {
        const shot =
            e.move === 'nova'
              ? angle + (n * Math.PI * 2) / count
              : angle + (n - (count - 1) / 2) * (e.move === 'breath' ? 0.16 : 0.23),
          speed =
            e.move === 'snipe' ? 490 : e.move === 'nova' ? 225 : e.move === 'breath' ? 335 : 290;
        this.context.effects.shoot(
          e.sprite,
          shot,
          speed,
          e.damage * (e.move === 'snipe' ? 1.2 : 1),
          false,
          e.region,
          e.move === 'breath' ? 0xf4ad76 : e.move === 'snipe' ? 0xd0e9f4 : 0xcf9bdc,
          0,
          this.context.effects.enemyProjectile(e),
        );
      }
      this.context.audio.play('cast');
    } else if (e.move === 'quake') {
      worldState.hazards.push({
        x: e.sprite.x,
        y: e.sprite.y,
        region: e.region,
        radius: 20,
        warning: 0.55,
        left: 2.5,
        damage: e.damage * 1.1,
        kind: 'wave',
        fired: false,
      });
      this.context.audio.play('axe');
    } else if (e.move === 'blink') {
      this.context.effects.particles(e.sprite.x, e.sprite.y, 9, 0xc7aedc);
      const at = moveCircle(
        e.target,
        0,
        0,
        e.radius,
        worldState.terrainByRegion[e.region],
        this.enemyBounds(e),
      );
      e.sprite.setPosition(at.x, at.y);
      this.context.effects.particles(at.x, at.y, 9, 0xc7aedc);
      const dx = visuals.player.x - at.x,
        dy = visuals.player.y - at.y,
        len = Math.hypot(dx, dy) || 1;
      e.aim = { x: dx / len, y: dy / len };
      e.move = e.kind === 'vampire' ? 'combo' : 'slash';
      e.chain = 0;
      e.mode = 'windup';
      e.clock = 0.48;
      this.context.audio.play('dash');
      return;
    } else if (e.move === 'meteor') {
      const count = e.phase2 ? 6 : 3;
      for (let n = 0; n < count; n++) {
        const at =
          n === 0
            ? e.target
            : clampPoint(
                {
                  x: e.target.x + Math.cos(n * 2.4) * 125,
                  y: e.target.y + Math.sin(n * 2.4) * 125,
                },
                this.enemyBounds(e),
              );
        worldState.hazards.push({
          x: at.x,
          y: at.y,
          region: e.region,
          radius: 58,
          warning: 1.15 + n * 0.12,
          left: 1.7 + n * 0.12,
          damage: e.damage * 1.05,
          kind: 'meteor',
          fired: false,
        });
      }
      this.context.audio.play('cast');
    }
    this.recoverEnemy(
      e,
      e.move === 'summon' ? 1.4 : e.move === 'breath' ? 1.3 : e.move === 'snipe' ? 1.2 : 0.95,
    );
  }
  summonMinions(e: Enemy, count: number): void {
    const { worldState, journey } = this.context;
    if (journey.progress[e.region].bossDead || e.training) return;
    const active = worldState.enemies.filter(
      (v) => v.region === e.region && !v.dead && v.kind !== 'boss',
    ).length;
    const available = Math.min(count, MAX_MINIONS - active);
    for (let n = 0; n < available; n++) {
      const angle = (n * Math.PI * 2) / Math.max(1, available),
        candidate = clampPoint(
          {
            x: e.sprite.x + Math.cos(angle) * 90,
            y: e.sprite.y + Math.sin(angle) * 90,
          },
          this.enemyBounds(e),
        );
      const p = freePoint(candidate, 22, worldState.terrainByRegion[e.region], this.enemyBounds(e))
        ? candidate
        : this.context.world.freePosition(e.region, 22, 200);
      const kind =
        REGIONS[e.region].roster[(n + e.moveIndex) % REGIONS[e.region].roster.length].kind;
      const minion = this.spawnEnemy(kind, e.region, n, p);
      minion.stun = 0.75;
      minion.clock = 2;
      worldState.hazards.push({
        ...p,
        region: e.region,
        radius: 30,
        warning: 0.7,
        left: 1,
        damage: 0,
        kind: 'ring',
        fired: false,
      });
      this.context.effects.particles(p.x, p.y, 8, 0xb5ccef);
    }
  }
  enemyBounds(e: Enemy): Bounds {
    return e.training
      ? {
          width: PROLOGUE_WIDTH - 20,
          height: WORLD_HEIGHT,
          margin: 35,
          top: 65,
          left: 35,
        }
      : this.context.world.regionBounds(e.region);
  }
}
