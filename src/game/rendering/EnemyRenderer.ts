import { BOSS_CONFIG, ENEMY_ATTACK_CONFIG } from '../Constants';
import { enemyAreaRadius, enemyMeleeReach } from '../enemies/EnemyAttackGeometry';
import { enemyStats } from '../enemies/EnemyStats';
import { type GameScene } from '../GameScene';

/** Видимость и позы врагов, предупреждения их атак и полосы здоровья. */
export class EnemyRenderer {
  constructor(private readonly context: GameScene) {}

  draw(): void {
    const { worldState, visuals } = this.context;
    const t = visuals.animationTime;
    const g = visuals.combatInk;
    for (const enemy of worldState.enemies) {
      const visible =
        enemy.region === worldState.regionIndex &&
        (worldState.area === 'biome' || worldState.area === 'tutorial') &&
        (worldState.area === 'tutorial') === enemy.training;
      if (!visible) {
        enemy.sprite.setVisible(false);
        enemy.shadow.setVisible(false);
        continue;
      }
      if (enemy.dead) {
        continue;
      }
      enemy.sprite.setVisible(true);
      const walk = enemy.mode === 'chase' || enemy.mode === 'charge';
      const bounce = walk ? Math.sin(t * (enemy.mode === 'charge' ? 25 : 13) + enemy.id) : 0;
      const size = enemyStats(enemy.kind, enemy.region).size;
      const anticipates = enemy.mode === 'windup';
      const kick =
        enemy.recoil / (enemy.kind === 'boss' ? BOSS_CONFIG.recoil : ENEMY_ATTACK_CONFIG.recoil);
      const breathing = Math.sin(t * 2.2 + enemy.id) * 0.006;
      const roaring = enemy.voiceLeft > 0;
      enemy.sprite
        .setAngle(
          anticipates
            ? -enemy.aim.x * 7
            : enemy.mode === 'charge'
              ? enemy.aim.x * 9
              : kick * enemy.aim.x * 8 + bounce * 1.2,
        )
        .setScale(
          (size / 128) * (roaring ? 1.035 : 1),
          (size / 128) *
            (1 + breathing + (anticipates ? -0.04 : 0) + kick * 0.025 + (roaring ? 0.025 : 0)),
        )
        .setDepth(20 + enemy.sprite.y * 0.01);
      const mouth = {
        x: enemy.sprite.x + enemy.aim.x * (enemy.radius * 0.52),
        y: enemy.sprite.y - enemy.radius * 0.52,
      };
      if (roaring) {
        g.fillStyle(0x120c1e, 0.8);
        g.fillEllipse(mouth.x, mouth.y, 12, 6 + Math.sin(t * 16) * 2);
        for (let n = 0; n < 2; n++) {
          const r = 15 + (((1.2 - enemy.voiceLeft) * 42 + n * 15) % 40);
          g.lineStyle(2, 0xbfc4ce, (1 - r / 60) * 0.3);
          g.strokeEllipse(mouth.x, mouth.y, r, r * 0.42);
        }
      }
      if (
        ['fan', 'breath', 'nova', 'snipe', 'summon'].includes(enemy.move) &&
        (anticipates || kick > 0)
      ) {
        const angle = Math.atan2(enemy.aim.y, enemy.aim.x);
        this.context.effects.drawCombatImage(
          this.context.projectiles.enemyProjectileTexture(enemy),
          mouth.x + enemy.aim.x * 12,
          mouth.y + enemy.aim.y * 12,
          anticipates ? 19 + Math.sin(t * 15) * 3 : 31,
          angle,
          anticipates ? 0.5 : kick * 0.7,
        );
      }
      enemy.shadow.setPosition(enemy.sprite.x, enemy.sprite.y + enemy.radius).setVisible(true);
      if (enemy.flash > 0) {
        enemy.sprite.setTint(0xdfffe1);
      } else if (enemy.stun > 0) {
        enemy.sprite.setTint(0x99d1e4);
      } else if (enemy.mode === 'windup') {
        enemy.sprite.setTint(0xf1beb6);
      } else {
        enemy.sprite.clearTint();
      }
      if (enemy.kind === 'boss' && enemy.mode === 'windup') {
        for (const attack of enemy.bossPlan ?? []) {
          this.context.bosses.drawBossStrike(attack, true, 1);
        }
      } else if (enemy.mode === 'windup') {
        const angle = Math.atan2(enemy.aim.y, enemy.aim.x);
        if (
          enemy.move === 'slam' ||
          enemy.move === 'poison' ||
          enemy.move === 'quake' ||
          enemy.move === 'nova'
        ) {
          const radius = enemyAreaRadius(enemy.move);
          g.lineStyle(2, 0xf78f81, 0.8);
          g.fillStyle(0xe28d77, 0.1);
          g.fillCircle(enemy.sprite.x, enemy.sprite.y, radius);
          g.strokeCircle(enemy.sprite.x, enemy.sprite.y, radius);
        } else if (enemy.move === 'curse') {
          g.lineStyle(2, 0xc9a0e9, 0.85);
          g.fillStyle(0x9d70bd, 0.12);
          g.fillCircle(enemy.target.x, enemy.target.y, enemyAreaRadius(enemy.move));
          g.strokeCircle(enemy.target.x, enemy.target.y, enemyAreaRadius(enemy.move));
          g.lineBetween(enemy.sprite.x, enemy.sprite.y, enemy.target.x, enemy.target.y);
        } else if (enemy.move === 'blink') {
          g.lineStyle(2, 0xd991b8, 0.8);
          g.fillStyle(0xb8698e, 0.12);
          g.fillCircle(enemy.target.x, enemy.target.y, enemyAreaRadius(enemy.move));
          g.strokeCircle(enemy.target.x, enemy.target.y, enemyAreaRadius(enemy.move));
          g.lineBetween(enemy.sprite.x, enemy.sprite.y, enemy.target.x, enemy.target.y);
        } else if (enemy.move === 'summon' || enemy.move === 'meteor') {
          g.lineStyle(2, enemy.move === 'summon' ? 0xb9aad8 : 0xf2a98a, 0.8);
          g.strokeCircle(enemy.sprite.x, enemy.sprite.y, 58);
          for (let n = 0; n < 6; n++) {
            const a = t * 1.5 + (n * Math.PI) / 3;
            g.fillStyle(0xdbc8ea, 0.6);
            g.fillCircle(enemy.sprite.x + Math.cos(a) * 58, enemy.sprite.y + Math.sin(a) * 58, 3);
          }
        } else if (enemy.move === 'fan' || enemy.move === 'breath') {
          this.context.effects.cone(
            g,
            enemy.sprite,
            angle,
            ENEMY_ATTACK_CONFIG.conePreviewReach,
            enemy.move === 'breath'
              ? ENEMY_ATTACK_CONFIG.breathPreviewArc
              : ENEMY_ATTACK_CONFIG.fanPreviewArc,
            0xf0968c,
            0.13,
          );
        } else if (enemy.move === 'slash' || enemy.move === 'combo') {
          this.context.effects.cone(
            g,
            enemy.sprite,
            angle,
            enemyMeleeReach(enemy.kind),
            ENEMY_ATTACK_CONFIG.slashArc,
            0xf08c85,
            0.15,
          );
        } else {
          g.lineStyle(3, 0xf0968c, 0.65);
          g.lineBetween(
            enemy.sprite.x,
            enemy.sprite.y,
            enemy.sprite.x + enemy.aim.x * ENEMY_ATTACK_CONFIG.conePreviewReach,
            enemy.sprite.y + enemy.aim.y * ENEMY_ATTACK_CONFIG.conePreviewReach,
          );
          g.strokeCircle(enemy.sprite.x, enemy.sprite.y, enemy.radius + 8);
        }
      }
      if (
        enemy.hp < enemy.maxHP &&
        enemy.kind !== 'boss' &&
        enemy.region === worldState.regionIndex
      ) {
        g.fillStyle(0x102a22, 0.8);
        g.fillRect(enemy.sprite.x - 22, enemy.sprite.y - enemy.radius - 28, 44, 4);
        g.fillStyle(0xcc9e9a, 0.9);
        g.fillRect(
          enemy.sprite.x - 22,
          enemy.sprite.y - enemy.radius - 28,
          (44 * enemy.hp) / enemy.maxHP,
          4,
        );
      }
      if (enemy.kind === 'boss') {
        g.lineStyle(2, 0xd9bda5, 0.55);
        g.strokeCircle(enemy.sprite.x, enemy.sprite.y, enemy.radius + 14);
        const y = enemy.sprite.y - 58;
        g.lineStyle(2, 0xdfc7a2, 0.8);
        g.beginPath();
        g.moveTo(enemy.sprite.x - 13, y);
        g.lineTo(enemy.sprite.x - 12, y - 10);
        g.lineTo(enemy.sprite.x - 5, y - 5);
        g.lineTo(enemy.sprite.x, y - 15);
        g.lineTo(enemy.sprite.x + 5, y - 5);
        g.lineTo(enemy.sprite.x + 12, y - 10);
        g.lineTo(enemy.sprite.x + 13, y);
        g.strokePath();
      }
    }
  }
}
