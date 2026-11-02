import { ULTIMATE_CONFIG, ULTIMATE_MAX } from '../Constants';
import { type GameScene } from '../GameScene';
import { weaponFor } from '../progression/PlayerProgression';
import { clearLine } from '../world/Navigation';
import { slashConnects, stats } from './CombatRules';

/** Накопленная абсолютная атака: запуск, импульсы и завершение. */
export class UltimateSystem {
  constructor(private readonly context: GameScene) {}

  useUltimate(): void {
    const { hero, worldState, journey, visuals } = this.context;
    if (
      this.context.flow.state !== 'playing' ||
      !hero.armed ||
      hero.ultimate < ULTIMATE_MAX ||
      hero.attackTime >= 0 ||
      hero.dodgeLeft > 0
    ) {
      return;
    }
    this.context.player.updateAim();
    hero.ultimate = 0;
    hero.ultimateAngle = hero.face;
    hero.ultimateLeft = ULTIMATE_CONFIG.duration;
    hero.ultimatePulse = 0;
    hero.hurtLeft = Math.max(hero.hurtLeft, ULTIMATE_CONFIG.protection);
    this.context.audio.play('ultimate');
    this.context.tutorial.lessonEvent('ultimate');
    if (journey.profile.weapon === 'dawnblade') {
      hero.hp = Math.min(stats(journey.profile).maxHP, hero.hp + ULTIMATE_CONFIG.dawnbladeHeal);
    }
    const w = weaponFor(journey.profile);
    this.context.menu.toast(w.ultimate);
    this.context.effects.particles(visuals.player.x, visuals.player.y, 18, w.color);
    if (w.style === 'staff') {
      for (
        let n = 0;
        n < (w.id === 'runicstaff' ? ULTIMATE_CONFIG.runicStaffShots : ULTIMATE_CONFIG.staffShots);
        n++
      ) {
        this.context.projectiles.shoot(
          visuals.player,
          hero.face +
            (n * Math.PI * 2) /
              (w.id === 'runicstaff'
                ? ULTIMATE_CONFIG.runicStaffShots
                : ULTIMATE_CONFIG.staffShots),
          ULTIMATE_CONFIG.projectileSpeed,
          stats(journey.profile).damage *
            ULTIMATE_CONFIG.projectileDamage *
            (1 + journey.profile.upgrades.spirit * ULTIMATE_CONFIG.spiritUpgradeScale),
          true,
          worldState.regionIndex,
          w.color,
          ULTIMATE_CONFIG.projectileBlast,
        );
      }
    }
  }

  updateUltimate(dt: number): void {
    const { hero, worldState, journey, visuals } = this.context;
    if (hero.ultimateLeft <= 0) {
      return;
    }
    const before = hero.ultimateLeft;
    hero.ultimateLeft = Math.max(0, hero.ultimateLeft - dt);
    const w = weaponFor(journey.profile);
    const pulses =
      w.style === 'axe'
        ? ULTIMATE_CONFIG.axePulses
        : w.style === 'sword'
          ? ULTIMATE_CONFIG.swordPulses
          : 1;
    while (
      hero.ultimatePulse < pulses &&
      ULTIMATE_CONFIG.duration - hero.ultimateLeft >=
        hero.ultimatePulse * ULTIMATE_CONFIG.pulseInterval
    ) {
      hero.ultimatePulse++;
      if (w.style === 'staff') {
        continue;
      }
      const reach =
        w.style === 'spear'
          ? ULTIMATE_CONFIG.spearReach
          : w.style === 'axe'
            ? ULTIMATE_CONFIG.axeReach
            : ULTIMATE_CONFIG.swordReach;
      const arc = w.style === 'spear' ? ULTIMATE_CONFIG.spearArc : Math.PI;
      for (const e of worldState.enemies) {
        if (
          !e.dead &&
          e.region === worldState.regionIndex &&
          slashConnects(visuals.player, hero.ultimateAngle, e.sprite, e.radius, reach, arc) &&
          clearLine(
            visuals.player,
            e.sprite,
            3,
            worldState.terrain,
            this.context.world.playerBounds(),
          )
        ) {
          this.context.combat.hitEnemy(
            e,
            stats(journey.profile).damage *
              (w.style === 'axe' ? ULTIMATE_CONFIG.axeDamage : ULTIMATE_CONFIG.damage) *
              (1 + journey.profile.upgrades.spirit * ULTIMATE_CONFIG.spiritUpgradeScale),
            ULTIMATE_CONFIG.knockback,
          );
        }
      }
    }
    if (before > 0 && hero.ultimateLeft === 0) {
      hero.ultimate = Math.min(ULTIMATE_MAX, hero.ultimate);
    }
  }
}
