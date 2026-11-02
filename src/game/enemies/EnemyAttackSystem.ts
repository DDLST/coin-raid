import {
  ENEMY_ATTACK_CONFIG,
  ENEMY_ATTACK_MOVES,
  MAX_MINIONS,
  PLAYER_RADIUS,
  REGIONS,
  THIRD_BIOME_WINDUP,
} from '../Constants';
import { slashConnects } from '../combat/CombatRules';
import { type GameScene } from '../GameScene';
import { clampPoint, clearLine, freePoint, moveCircle } from '../world/Navigation';
import { type EnemyAttack, type EnemyKind } from '../world/WorldLayout';
import { enemyAreaRadius, enemyMeleeReach } from './EnemyAttackGeometry';
import { enemyStats } from './EnemyStats';
import { type Enemy } from './EnemyTypes';

/** Выбор приёмов обычных врагов, телеграфы и выполнение атак. */
export class EnemyAttackSystem {
  constructor(private readonly context: GameScene) {}

  startEnemyAttack(enemy: Enemy): void {
    const { hero, worldState, visuals } = this.context;
    if (enemy.kind === 'boss') {
      this.context.bosses.startBossAttack(enemy);
      return;
    }
    const moves: Record<Exclude<EnemyKind, 'boss'>, EnemyAttack[]> = ENEMY_ATTACK_MOVES;
    const choices = enemy.training ? (['slash'] as EnemyAttack[]) : moves[enemy.kind];
    enemy.move = choices[enemy.moveIndex % choices.length];
    enemy.moveIndex++;
    enemy.chain = 0;
    enemy.target = this.context.enemies.predict(enemy);
    if (enemy.move === 'blink') {
      const at = clampPoint(
        {
          x: enemy.target.x - Math.cos(hero.face) * ENEMY_ATTACK_CONFIG.blinkOffset,
          y: enemy.target.y - Math.sin(hero.face) * ENEMY_ATTACK_CONFIG.blinkOffset,
        },
        this.context.enemies.enemyBounds(enemy),
      );
      enemy.target = freePoint(
        at,
        enemy.radius,
        worldState.terrainByRegion[enemy.region],
        this.context.enemies.enemyBounds(enemy),
      )
        ? at
        : {
            x: visuals.player.x,
            y: visuals.player.y,
          };
    }
    const dx = enemy.target.x - enemy.sprite.x;
    const dy = enemy.target.y - enemy.sprite.y;
    const len = Math.hypot(dx, dy) || 1;
    enemy.aim = { x: dx / len, y: dy / len };
    enemy.mode = 'windup';
    enemy.hasHit = false;
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
    ].includes(enemy.move);
    enemy.clock = enemy.training
      ? ENEMY_ATTACK_CONFIG.trainingWindup
      : (complex ? ENEMY_ATTACK_CONFIG.complexWindup : ENEMY_ATTACK_CONFIG.simpleWindup) *
        (enemy.phase2 ? ENEMY_ATTACK_CONFIG.rageWindupScale : 1) *
        (enemy.region === 2 ? THIRD_BIOME_WINDUP : 1);
  }

  recoverEnemy(enemy: Enemy, seconds = 1): void {
    enemy.mode = 'recover';
    enemy.clock = seconds * (enemy.phase2 ? ENEMY_ATTACK_CONFIG.rageRecoveryScale : 1);
  }

  executeEnemyAttack(enemy: Enemy): void {
    const { hero, worldState, visuals } = this.context;
    if (enemy.kind === 'boss') {
      this.context.bosses.executeBossAttack(enemy);
      return;
    }
    enemy.recoil = ENEMY_ATTACK_CONFIG.recoil;
    if (enemy.move === 'breath') {
      enemy.voiceLeft = ENEMY_ATTACK_CONFIG.roarDuration;
      this.context.audio.play('roar');
    }
    const angle = Math.atan2(enemy.aim.y, enemy.aim.x);
    if (enemy.move === 'charge') {
      enemy.mode = 'charge';
      enemy.clock = ENEMY_ATTACK_CONFIG.chargeDuration;
      this.context.audio.play('dash');
      return;
    }
    if (enemy.move === 'slash' || enemy.move === 'combo') {
      const reach = enemyMeleeReach(enemy.kind);
      this.context.effects.addEffect('slash', enemy.sprite, 0xf49a8b, reach, angle);
      if (
        slashConnects(
          enemy.sprite,
          angle,
          visuals.player,
          PLAYER_RADIUS,
          reach,
          ENEMY_ATTACK_CONFIG.slashArc,
        ) &&
        clearLine(
          enemy.sprite,
          visuals.player,
          3,
          worldState.terrainByRegion[enemy.region],
          this.context.enemies.enemyBounds(enemy),
        )
      ) {
        const before = hero.hp;
        this.context.player.damagePlayer(
          enemy.damage *
            (enemy.move === 'combo' && enemy.chain === ENEMY_ATTACK_CONFIG.comboLength
              ? ENEMY_ATTACK_CONFIG.comboDamage
              : 1),
          enemy.sprite,
          false,
          enemy,
        );
        if (enemy.kind === 'vampire' && hero.hp < before) {
          enemy.hp = Math.min(
            enemy.maxHP,
            enemy.hp + (before - hero.hp) * ENEMY_ATTACK_CONFIG.vampireHealing,
          );
        }
      }
      this.context.audio.play(
        enemy.kind === 'zombie' || enemy.kind === 'vampire' ? 'bite' : 'slash',
      );
      if (enemy.stun > ENEMY_ATTACK_CONFIG.comboInterruptStun) {
        return;
      }
      if (enemy.move === 'combo' && ++enemy.chain < ENEMY_ATTACK_CONFIG.comboLength) {
        enemy.target = this.context.enemies.predict(enemy);
        const dx = enemy.target.x - enemy.sprite.x;
        const dy = enemy.target.y - enemy.sprite.y;
        const len = Math.hypot(dx, dy) || 1;
        enemy.aim = { x: dx / len, y: dy / len };
        enemy.mode = 'windup';
        enemy.clock = ENEMY_ATTACK_CONFIG.comboWindup;
        return;
      }
    } else if (enemy.move === 'slam') {
      if (
        Math.hypot(enemy.sprite.x - visuals.player.x, enemy.sprite.y - visuals.player.y) <
          ENEMY_ATTACK_CONFIG.slamRadius + PLAYER_RADIUS &&
        clearLine(
          enemy.sprite,
          visuals.player,
          3,
          worldState.terrainByRegion[enemy.region],
          this.context.enemies.enemyBounds(enemy),
        )
      ) {
        this.context.player.damagePlayer(
          enemy.damage * ENEMY_ATTACK_CONFIG.slamDamage,
          enemy.sprite,
          false,
          enemy,
        );
      }
      worldState.hazards.push({
        x: enemy.sprite.x,
        y: enemy.sprite.y,
        region: enemy.region,
        radius: ENEMY_ATTACK_CONFIG.slamRadius,
        warning: 0,
        left: ENEMY_ATTACK_CONFIG.slamLifetime,
        damage: 0,
        kind: 'ring',
        fired: true,
      });
      this.context.audio.play('axe');
      this.context.effects.particles(enemy.sprite.x, enemy.sprite.y, 16, 0xb9c892);
    } else if (enemy.move === 'poison' || enemy.move === 'curse') {
      const at = enemy.move === 'curse' ? enemy.target : enemy.sprite;
      worldState.hazards.push({
        x: at.x,
        y: at.y,
        region: enemy.region,
        radius: enemyAreaRadius(enemy.move),
        warning:
          enemy.move === 'curse'
            ? ENEMY_ATTACK_CONFIG.curseWarning
            : ENEMY_ATTACK_CONFIG.poisonWarning,
        left:
          enemy.move === 'curse'
            ? ENEMY_ATTACK_CONFIG.curseLifetime
            : ENEMY_ATTACK_CONFIG.poisonLifetime,
        damage:
          enemy.damage *
          (enemy.move === 'curse'
            ? ENEMY_ATTACK_CONFIG.curseDamage
            : ENEMY_ATTACK_CONFIG.poisonDamage),
        kind: enemy.move === 'curse' ? 'curse' : 'poison',
        fired: false,
      });
      this.context.audio.play('cast');
    } else if (enemy.move === 'summon') {
      this.summonMinions(enemy, 1);
      this.context.audio.play('cast');
    } else if (
      enemy.move === 'fan' ||
      enemy.move === 'breath' ||
      enemy.move === 'nova' ||
      enemy.move === 'snipe'
    ) {
      const count =
        enemy.move === 'nova'
          ? enemy.phase2
            ? ENEMY_ATTACK_CONFIG.rageNovaShots
            : ENEMY_ATTACK_CONFIG.novaShots
          : enemy.move === 'snipe'
            ? 1
            : enemy.move === 'breath'
              ? enemy.phase2
                ? ENEMY_ATTACK_CONFIG.rageBreathShots
                : ENEMY_ATTACK_CONFIG.breathShots
              : ENEMY_ATTACK_CONFIG.fanShots;
      for (let n = 0; n < count; n++) {
        const shot =
          enemy.move === 'nova'
            ? angle + (n * Math.PI * 2) / count
            : angle +
              (n - (count - 1) / 2) *
                (enemy.move === 'breath'
                  ? ENEMY_ATTACK_CONFIG.breathSpread
                  : ENEMY_ATTACK_CONFIG.fanSpread);
        const speed =
          enemy.move === 'snipe'
            ? ENEMY_ATTACK_CONFIG.snipeSpeed
            : enemy.move === 'nova'
              ? ENEMY_ATTACK_CONFIG.novaSpeed
              : enemy.move === 'breath'
                ? ENEMY_ATTACK_CONFIG.breathSpeed
                : ENEMY_ATTACK_CONFIG.fanSpeed;
        this.context.projectiles.shoot(
          enemy.sprite,
          shot,
          speed,
          enemy.damage * (enemy.move === 'snipe' ? ENEMY_ATTACK_CONFIG.snipeDamage : 1),
          false,
          enemy.region,
          enemy.move === 'breath' ? 0xf4ad76 : enemy.move === 'snipe' ? 0xd0e9f4 : 0xcf9bdc,
          0,
          this.context.projectiles.enemyProjectileTexture(enemy),
        );
      }
      this.context.audio.play('cast');
    } else if (enemy.move === 'quake') {
      worldState.hazards.push({
        x: enemy.sprite.x,
        y: enemy.sprite.y,
        region: enemy.region,
        radius: ENEMY_ATTACK_CONFIG.quakeInitialRadius,
        warning: ENEMY_ATTACK_CONFIG.quakeWarning,
        left: ENEMY_ATTACK_CONFIG.quakeLifetime,
        damage: enemy.damage * ENEMY_ATTACK_CONFIG.quakeDamage,
        kind: 'wave',
        fired: false,
      });
      this.context.audio.play('axe');
    } else if (enemy.move === 'blink') {
      this.context.effects.particles(enemy.sprite.x, enemy.sprite.y, 9, 0xc7aedc);
      const at = moveCircle(
        enemy.target,
        0,
        0,
        enemy.radius,
        worldState.terrainByRegion[enemy.region],
        this.context.enemies.enemyBounds(enemy),
      );
      enemy.sprite.setPosition(at.x, at.y);
      this.context.effects.particles(at.x, at.y, 9, 0xc7aedc);
      const dx = visuals.player.x - at.x;
      const dy = visuals.player.y - at.y;
      const len = Math.hypot(dx, dy) || 1;
      enemy.aim = { x: dx / len, y: dy / len };
      enemy.move = enemy.kind === 'vampire' ? 'combo' : 'slash';
      enemy.chain = 0;
      enemy.mode = 'windup';
      enemy.clock = ENEMY_ATTACK_CONFIG.blinkWindup;
      this.context.audio.play('dash');
      return;
    } else if (enemy.move === 'meteor') {
      const count = enemy.phase2
        ? ENEMY_ATTACK_CONFIG.rageMeteorCount
        : ENEMY_ATTACK_CONFIG.meteorCount;
      for (let n = 0; n < count; n++) {
        const at =
          n === 0
            ? enemy.target
            : clampPoint(
                {
                  x: enemy.target.x + Math.cos(n * 2.4) * ENEMY_ATTACK_CONFIG.meteorSpread,
                  y: enemy.target.y + Math.sin(n * 2.4) * ENEMY_ATTACK_CONFIG.meteorSpread,
                },
                this.context.enemies.enemyBounds(enemy),
              );
        worldState.hazards.push({
          x: at.x,
          y: at.y,
          region: enemy.region,
          radius: ENEMY_ATTACK_CONFIG.meteorRadius,
          warning: ENEMY_ATTACK_CONFIG.meteorWarning + n * ENEMY_ATTACK_CONFIG.meteorDelay,
          left: ENEMY_ATTACK_CONFIG.meteorLifetime + n * ENEMY_ATTACK_CONFIG.meteorDelay,
          damage: enemy.damage * ENEMY_ATTACK_CONFIG.meteorDamage,
          kind: 'meteor',
          fired: false,
        });
      }
      this.context.audio.play('cast');
    }
    this.recoverEnemy(
      enemy,
      enemy.move === 'summon'
        ? ENEMY_ATTACK_CONFIG.summonRecovery
        : enemy.move === 'breath'
          ? ENEMY_ATTACK_CONFIG.breathRecovery
          : enemy.move === 'snipe'
            ? ENEMY_ATTACK_CONFIG.snipeRecovery
            : ENEMY_ATTACK_CONFIG.recovery,
    );
  }

  summonMinions(enemy: Enemy, count: number): void {
    const { worldState, journey } = this.context;
    if (journey.progress[enemy.region].bossDead || enemy.training) {
      return;
    }
    const active = worldState.enemies.filter(
      (v) => v.region === enemy.region && !v.dead && v.kind !== 'boss',
    ).length;
    const available = Math.min(count, MAX_MINIONS - active);
    for (let n = 0; n < available; n++) {
      const angle = (n * Math.PI * 2) / Math.max(1, available);
      const kind =
        REGIONS[enemy.region].roster[(n + enemy.moveIndex) % REGIONS[enemy.region].roster.length]
          .kind;
      const radius = enemyStats(kind, enemy.region).radius;
      const candidate = clampPoint(
        {
          x: enemy.sprite.x + Math.cos(angle) * ENEMY_ATTACK_CONFIG.summonDistance,
          y: enemy.sprite.y + Math.sin(angle) * ENEMY_ATTACK_CONFIG.summonDistance,
        },
        this.context.enemies.enemyBounds(enemy),
      );
      const p = freePoint(
        candidate,
        radius,
        worldState.terrainByRegion[enemy.region],
        this.context.enemies.enemyBounds(enemy),
      )
        ? candidate
        : this.context.world.freePosition(
            enemy.region,
            radius,
            ENEMY_ATTACK_CONFIG.summonPlayerDistance,
          );
      const minion = this.context.enemies.spawnEnemy(kind, enemy.region, n, p);
      minion.stun = ENEMY_ATTACK_CONFIG.summonStun;
      minion.clock = ENEMY_ATTACK_CONFIG.summonClock;
      worldState.hazards.push({
        ...p,
        region: enemy.region,
        radius: ENEMY_ATTACK_CONFIG.summonWarningRadius,
        warning: ENEMY_ATTACK_CONFIG.summonWarning,
        left: ENEMY_ATTACK_CONFIG.summonWarningLifetime,
        damage: 0,
        kind: 'ring',
        fired: false,
      });
      this.context.effects.particles(p.x, p.y, 8, 0xb5ccef);
    }
  }
}
