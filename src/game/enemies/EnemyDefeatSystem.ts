import { COMBAT_CONFIG, REGIONS } from '../Constants';
import { stats } from '../combat/CombatRules';
import { type Enemy } from '../enemies/EnemyTypes';
import { type GameScene } from '../GameScene';

/** Однократная победа над врагом, награда и очистка биома. */
export class EnemyDefeatSystem {
  constructor(private readonly context: GameScene) {}

  killEnemy(enemy: Enemy): void {
    const { hero, worldState, journey } = this.context;
    if (enemy.dead) {
      return;
    }
    enemy.dead = true;
    journey.kills++;
    if (!enemy.training && enemy.kind === 'necromancer') {
      const q = journey.lines.find((q) => q.id === 'bell')!;
      if (q.accepted && !q.claimed) {
        q.kills = Math.min(2, q.kills + 1);
      }
    }
    journey.score += enemy.reward * COMBAT_CONFIG.killScoreMultiplier;
    let paid = 0;
    if (!enemy.training) {
      if (enemy.kind === 'boss') {
        const p = journey.progress[enemy.region];
        p.bossDead = true;
        if (!p.rewarded) {
          p.rewarded = true;
          paid = this.context.economy.grantCoins(enemy.reward, enemy.region, false);
          journey.profile.skillPoints++;
        }
      } else {
        paid = this.context.economy.grantCoins(enemy.reward, enemy.region, true, true);
      }
    }
    this.context.quests.onQuestEvent('kill');
    this.context.tutorial.lessonEvent('kill');
    hero.hp = Math.min(
      stats(journey.profile).maxHP,
      hero.hp + journey.profile.upgrades.recovery * COMBAT_CONFIG.recoveryHealPerLevel,
    );
    this.context.effects.popup(
      enemy.sprite.x,
      enemy.sprite.y - 50,
      enemy.training ? 'Учебная победа' : paid ? `+${paid} ◈` : 'Сила биома +',
      '#baf3ec',
    );
    this.context.tweens.add({
      targets: enemy.sprite,
      angle: enemy.sprite.flipX ? -85 : 85,
      alpha: 0,
      scaleX: enemy.sprite.scaleX * 0.7,
      scaleY: enemy.sprite.scaleY * 0.7,
      duration: 430,
      onComplete: () => {
        enemy.sprite.setVisible(false);
        enemy.shadow.setVisible(false);
      },
    });
    this.context.effects.particles(enemy.sprite.x, enemy.sprite.y, 12, 0xade2df);
    this.context.achievements.syncAchievements();
    if (enemy.kind === 'boss') {
      const before = journey.profile.coins;
      for (const other of [...worldState.enemies]) {
        if (other !== enemy && !other.dead && other.region === enemy.region) {
          this.killEnemy(other);
        }
      }
      const minionReward = journey.profile.coins - before;
      worldState.projectiles = worldState.projectiles.filter(
        (p) => p.region !== enemy.region || p.friendly,
      );
      worldState.hazards = worldState.hazards.filter(
        (h) => h.region !== enemy.region || h.kind === 'sigil',
      );
      this.context.bosses.resetBossCountdown();
      if (paid) {
        this.context.effects.popup(
          enemy.sprite.x,
          enemy.sprite.y - 105,
          '+1 ИСКРА МАСТЕРСТВА',
          '#ffe0a0',
        );
      }
      this.context.menu.toast(
        `Печать разорвана! ${REGIONS[enemy.region].bossName} побеждён. Оставшаяся нежить рассыпалась. Награда: ${paid + minionReward} осколков${paid ? ', +1 искра' : ''}. Tab → Навыки: выбери новый приём.`,
      );
      this.context.world.checkProgress();
    }
  }
}
