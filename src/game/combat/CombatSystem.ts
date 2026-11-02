import Phaser from 'phaser';
import {
  COMBAT_CONFIG,
  COUNTER_ATTACK,
  PARRY_DURATION,
  PLAYER_RADIUS,
  REGIONS,
  SKILL_TREE,
  STAMINA_DELAY,
  ULTIMATE_MAX,
} from '../Constants';
import { type Enemy } from '../enemies/EnemyTypes';
import { type GameScene } from '../GameScene';
import { weaponFor } from '../progression/PlayerProgression';
import { type SkillId } from '../progression/Skills';
import { clampPoint, clearLine, moveCircle } from '../world/Navigation';
import { attackSpec, skillAttack, slashConnects, stats } from './CombatRules';

/** Атаки героя, парирование, урон врагам и награды за победу. */
export class CombatSystem {
  constructor(private readonly context: GameScene) {}
  currentAttackSpec(): ReturnType<typeof attackSpec> & {
    pulses: number;
  } {
    const { hero, journey } = this.context;
    if (hero.counterStrike) {
      return { ...COUNTER_ATTACK };
    }
    if (hero.activeSkill) {
      return skillAttack(hero.activeSkill);
    }
    const a = attackSpec(journey.profile, hero.heavyAttack, hero.combo);
    if (weaponFor(journey.profile).style === 'axe' && !hero.heavyAttack && hero.combo === 1) {
      return {
        ...a,
        arc: COMBAT_CONFIG.axeComboArc,
        reach: a.reach + COMBAT_CONFIG.axeComboReachBonus,
        multiplier: COMBAT_CONFIG.axeComboDamage,
        pulses: 1,
      };
    }
    return { ...a, pulses: 1 };
  }
  attack(): void {
    const { hero, worldState, journey, ui, visuals } = this.context;
    if (this.context.flow.state !== 'playing') {
      return;
    }
    const w = weaponFor(journey.profile);
    if (!hero.armed) {
      if (!ui.mouseHeld) {
        this.context.menu.toast(
          `Нужно ${REGIONS[worldState.regionIndex].awaken} осколков силы, чтобы восстановить оружие.`,
        );
      }
      return;
    }
    if (hero.attackTime >= 0 || hero.dodgeLeft > 0 || hero.guardLeft > 0 || hero.ultimateLeft > 0) {
      return;
    }
    const counter = worldState.enemies.find((e) => e.id === hero.counterTarget && !e.dead);
    if (
      counter &&
      hero.counterLeft > 0 &&
      hero.stamina >= COUNTER_ATTACK.cost &&
      Math.hypot(counter.sprite.x - visuals.player.x, counter.sprite.y - visuals.player.y) <
        COMBAT_CONFIG.counterDistance &&
      clearLine(
        visuals.player,
        counter.sprite,
        3,
        this.context.world.activeTerrain(),
        this.context.world.playerBounds(),
      )
    ) {
      hero.face = Math.atan2(
        counter.sprite.y - visuals.player.y,
        counter.sprite.x - visuals.player.x,
      );
      const distance = Math.hypot(
        counter.sprite.x - visuals.player.x,
        counter.sprite.y - visuals.player.y,
      );
      const step = Math.min(
        COMBAT_CONFIG.counterStep,
        Math.max(0, distance - COMBAT_CONFIG.counterGap),
      );
      const at = moveCircle(
        visuals.player,
        Math.cos(hero.face) * step,
        Math.sin(hero.face) * step,
        PLAYER_RADIUS,
        this.context.world.activeTerrain(),
        this.context.world.playerBounds(),
      );
      visuals.player.setPosition(at.x, at.y);
      hero.counterStrike = true;
      hero.strikeTarget = counter.id;
      hero.counterLeft = 0;
      hero.counterTarget = -1;
      hero.activeSkill = null;
      hero.heavyAttack = false;
      hero.stamina -= COUNTER_ATTACK.cost;
    } else {
      if (hero.stamina < w.cost) {
        return;
      }
      this.context.player.updateAim();
      hero.combo =
        journey.elapsed - hero.lastAttack < COMBAT_CONFIG.comboWindow
          ? (hero.combo + 1) % COMBAT_CONFIG.comboLength
          : 0;
      hero.lastAttack = journey.elapsed;
      hero.heavyAttack = false;
      hero.activeSkill = null;
      hero.counterStrike = false;
      hero.strikeTarget = -1;
      hero.stamina -= w.cost;
    }
    hero.attackTime = 0;
    hero.attackAngle = hero.face;
    hero.attackHits.clear();
    hero.attackFired = false;
    hero.attackPulse = -1;
    hero.regenDelay = STAMINA_DELAY;
  }
  parry(): void {
    const { hero, ui, visuals } = this.context;
    if (
      this.context.flow.state !== 'playing' ||
      !hero.armed ||
      hero.attackTime >= 0 ||
      hero.dodgeLeft > 0 ||
      hero.guardLeft > 0 ||
      hero.ultimateLeft > 0 ||
      hero.stamina < COMBAT_CONFIG.parryCost
    ) {
      return;
    }
    this.context.player.updateAim();
    hero.stamina -= COMBAT_CONFIG.parryCost;
    hero.regenDelay = STAMINA_DELAY;
    ui.mouseHeld = false;
    hero.guardLeft = PARRY_DURATION;
    this.context.effects.addEffect('ring', visuals.player, 0xffe3a1, 45);
  }
  useSkill(key: number): void {
    const { hero, journey } = this.context;
    const w = weaponFor(journey.profile);
    const skill = SKILL_TREE.find((s) => s.style === w.style && s.key === key);
    if (
      !skill ||
      !journey.profile.skills.includes(skill.id) ||
      journey.profile.disabledSkills.includes(skill.id)
    ) {
      this.context.menu.toast('Приём не установлен. Tab → Навыки: изучи его или вставь в панель.');
      return;
    }
    if (
      this.context.flow.state !== 'playing' ||
      !hero.armed ||
      hero.attackTime >= 0 ||
      hero.dodgeLeft > 0 ||
      hero.guardLeft > 0 ||
      hero.ultimateLeft > 0 ||
      (hero.skillCooldowns[skill.id] ?? 0) > 0
    ) {
      return;
    }
    const a = skillAttack(skill.id);
    if (hero.stamina < a.cost) {
      this.context.menu.toast('Недостаточно выносливости.');
      return;
    }
    this.context.player.updateAim();
    hero.stamina -= a.cost;
    hero.activeSkill = skill.id;
    hero.counterStrike = false;
    hero.heavyAttack = false;
    hero.skillCooldowns[skill.id] = skill.cooldown;
    hero.attackTime = 0;
    hero.attackAngle = hero.face;
    hero.attackPulse = -1;
    hero.attackHits.clear();
    hero.attackFired = false;
    hero.regenDelay = STAMINA_DELAY;
  }
  resolveAttack(): void {
    const { hero, worldState, journey, ui, visuals } = this.context;
    const w = weaponFor(journey.profile);
    const a = this.currentAttackSpec();
    if (hero.attackTime < a.windup || hero.attackTime > a.activeEnd) {
      return;
    }
    const pulse = Math.min(
      a.pulses - 1,
      Math.floor(
        ((hero.attackTime - a.windup) / Math.max(0.01, a.activeEnd - a.windup)) * a.pulses,
      ),
    );
    if (pulse !== hero.attackPulse) {
      hero.attackPulse = pulse;
      hero.attackHits.clear();
      if (hero.counterStrike) {
        this.context.audio.play('parry');
      }
      this.context.audio.weaponSound(w.id);
      this.context.effects.addEffect(
        hero.activeSkill === 'axe_leap' ||
          hero.activeSkill === 'staff_ward' ||
          (hero.heavyAttack && w.style === 'axe')
          ? 'ring'
          : w.style === 'spear' || hero.activeSkill === 'axe_fault'
            ? 'thrust'
            : 'slash',
        visuals.player,
        hero.counterStrike ? 0xffe7a1 : w.color,
        a.reach,
        hero.attackAngle + (pulse % 2 ? 0.18 : -0.18),
      );
    }
    if (!hero.attackFired) {
      hero.attackFired = true;
      if (a.step) {
        let step = a.step;
        if (step > 0 && a.arc < 1) {
          for (const e of worldState.enemies) {
            if (
              e.dead ||
              e.region !== worldState.regionIndex ||
              !slashConnects(
                visuals.player,
                hero.attackAngle,
                e.sprite,
                e.radius,
                step + e.radius,
                0.55,
              )
            ) {
              continue;
            }
            step = Math.min(
              step,
              Math.max(
                0,
                Math.hypot(e.sprite.x - visuals.player.x, e.sprite.y - visuals.player.y) -
                  e.radius -
                  PLAYER_RADIUS -
                  4,
              ),
            );
          }
        }
        const moved = moveCircle(
          visuals.player,
          Math.cos(hero.attackAngle) * step,
          Math.sin(hero.attackAngle) * step,
          PLAYER_RADIUS,
          this.context.world.activeTerrain(),
          this.context.world.playerBounds(),
        );
        visuals.player.setPosition(moved.x, moved.y);
      }
      if (w.type === 'magic' && !hero.counterStrike) {
        if (hero.activeSkill === 'staff_ward') {
          hero.shieldLeft = 3;
          for (const e of worldState.enemies) {
            if (
              !e.dead &&
              e.region === worldState.regionIndex &&
              Math.hypot(e.sprite.x - visuals.player.x, e.sprite.y - visuals.player.y) <
                130 + e.radius &&
              clearLine(
                visuals.player,
                e.sprite,
                3,
                this.context.world.activeTerrain(),
                this.context.world.playerBounds(),
              )
            ) {
              this.hitEnemy(e, stats(journey.profile).damage * a.multiplier, 85);
            }
          }
        } else if (hero.heavyAttack || hero.activeSkill === 'staff_star') {
          const target = ui.mouse
            ? this.context.cameras.main.getWorldPoint(ui.mouse.x, ui.mouse.y)
            : {
                x: visuals.player.x + Math.cos(hero.attackAngle) * 220,
                y: visuals.player.y + Math.sin(hero.attackAngle) * 220,
              };
          const d = Math.hypot(target.x - visuals.player.x, target.y - visuals.player.y) || 1;
          const range = hero.activeSkill === 'staff_star' ? 420 : 340;
          const point = clampPoint(
            {
              x: visuals.player.x + (target.x - visuals.player.x) * Math.min(1, range / d),
              y: visuals.player.y + (target.y - visuals.player.y) * Math.min(1, range / d),
            },
            this.context.world.playerBounds(),
          );
          if (
            clearLine(
              visuals.player,
              point,
              3,
              this.context.world.activeTerrain(),
              this.context.world.playerBounds(),
            )
          ) {
            worldState.hazards.push({
              ...point,
              region: worldState.regionIndex,
              radius: hero.activeSkill === 'staff_star' ? 150 : 92,
              warning: hero.activeSkill === 'staff_star' ? 0.9 : 0.65,
              left: 1.4,
              damage: stats(journey.profile).damage * a.multiplier,
              kind: 'sigil',
              fired: false,
            });
          }
        } else {
          const shots = hero.activeSkill === 'staff_fan' ? 5 : w.id === 'runicstaff' ? 3 : 1;
          for (let n = 0; n < shots; n++) {
            this.context.projectiles.shoot(
              visuals.player,
              hero.attackAngle + (n - (shots - 1) / 2) * 0.17,
              520,
              stats(journey.profile).damage * a.multiplier,
              true,
              worldState.regionIndex,
              w.color,
              hero.activeSkill === 'staff_fan' ? 35 : 65,
            );
          }
        }
        return;
      }
    }
    if (w.type === 'magic' && !hero.counterStrike) {
      return;
    }
    for (const e of [...worldState.enemies]) {
      if (
        e.dead ||
        hero.attackHits.has(e.id) ||
        e.region !== worldState.regionIndex ||
        (hero.counterStrike && e.id !== hero.strikeTarget) ||
        this.context.tutorial.trainingArea() !== e.training ||
        !slashConnects(visuals.player, hero.attackAngle, e.sprite, e.radius, a.reach, a.arc) ||
        !clearLine(
          visuals.player,
          e.sprite,
          3,
          this.context.world.activeTerrain(),
          this.context.world.playerBounds(),
        )
      ) {
        continue;
      }
      hero.attackHits.add(e.id);
      this.hitEnemy(
        e,
        stats(journey.profile).damage * a.multiplier,
        hero.counterStrike ? 65 : w.type === 'sweep' ? (hero.heavyAttack ? 80 : 52) : 22,
      );
      if (hero.activeSkill === 'axe_cleave' && !e.dead) {
        e.bleed = COMBAT_CONFIG.bleedDuration;
        e.bleedTick = COMBAT_CONFIG.bleedInterval;
      }
      if (hero.counterStrike) {
        journey.profile.counterWins++;
        this.context.achievements.syncAchievements();
        this.context.effects.particles(e.sprite.x, e.sprite.y, 22, 0xffe8a3);
        this.context.cameras.main.shake(80, 0.003);
        this.context.effects.popup(e.sprite.x, e.sprite.y - 80, 'КОНТРУДАР', '#ffe6a0');
        this.context.tutorial.lessonEvent('counter');
      }
    }
  }
  hitEnemy(e: Enemy, amount: number, knockback = 25): void {
    const { hero, worldState, journey, visuals } = this.context;
    if (e.dead) {
      return;
    }
    const front =
      Math.abs(
        Phaser.Math.Angle.Wrap(
          Math.atan2(visuals.player.y - e.sprite.y, visuals.player.x - e.sprite.x) -
            Math.atan2(e.aim.y, e.aim.x),
        ),
      ) < 1.05;
    const shield =
      e.kind === 'knight' &&
      e.mode === 'chase' &&
      e.stun <= 0 &&
      front &&
      !hero.counterStrike &&
      hero.activeSkill !== 'axe_cleave';
    const damage = Math.max(1, Math.round(amount * (shield ? 0.38 : 1)));
    e.hp = Math.max(0, e.hp - damage);
    e.flash = 0.15;
    e.stun = shield ? 0.03 : e.kind === 'boss' ? 0.035 : e.kind === 'dragon' ? 0.12 : 0.23;
    e.nextPath = 0;
    if (shield) {
      this.context.audio.play('parry');
      this.context.effects.addEffect('ring', e.sprite, 0xaad7e5, 30);
    } else if (e.kind !== 'boss') {
      e.mode = 'recover';
      e.clock = 0.36;
      const dx = e.sprite.x - visuals.player.x;
      const dy = e.sprite.y - visuals.player.y;
      const len = Math.hypot(dx, dy) || 1;
      const moved = moveCircle(
        e.sprite,
        (dx / len) * knockback,
        (dy / len) * knockback,
        e.radius,
        worldState.terrainByRegion[e.region],
        this.context.enemies.enemyBounds(e),
      );
      e.sprite.setPosition(moved.x, moved.y);
    }
    hero.ultimate = Math.min(ULTIMATE_MAX, hero.ultimate + COMBAT_CONFIG.hitCharge);
    this.context.audio.weaponSound(journey.profile.weapon, true);
    this.context.effects.particles(e.sprite.x, e.sprite.y, 5, 0xbfe9d8);
    this.context.effects.popup(e.sprite.x, e.sprite.y - 28, String(damage), '#d9f1e5');
    if (journey.profile.weapon === 'dawnblade') {
      hero.hp = Math.min(stats(journey.profile).maxHP, hero.hp + COMBAT_CONFIG.dawnbladeHeal);
    }
    this.context.quests.onQuestEvent('hit');
    this.context.tutorial.lessonEvent('hit');
    if (e.hp <= 0) {
      this.context.defeats.killEnemy(e);
    }
  }

  secondaryAttack(): void {
    const { hero, journey, ui } = this.context;
    if (weaponFor(journey.profile).style === 'sword') {
      this.parry();
      return;
    }
    if (
      this.context.flow.state !== 'playing' ||
      !hero.armed ||
      hero.attackTime >= 0 ||
      hero.dodgeLeft > 0 ||
      hero.guardLeft > 0 ||
      hero.ultimateLeft > 0
    ) {
      return;
    }
    const a = attackSpec(journey.profile, true);
    if (hero.stamina < a.cost) {
      return;
    }
    this.context.player.updateAim();
    hero.stamina -= a.cost;
    hero.regenDelay = STAMINA_DELAY;
    ui.mouseHeld = false;
    hero.activeSkill = null;
    hero.counterStrike = false;
    hero.heavyAttack = true;
    hero.attackTime = 0;
    hero.attackAngle = hero.face;
    hero.attackFired = false;
    hero.attackPulse = -1;
    hero.attackHits.clear();
    hero.combo = 0;
  }

  updateTimers(dt: number): void {
    const { hero } = this.context;
    hero.guardLeft = Math.max(0, hero.guardLeft - dt);
    hero.counterLeft = Math.max(0, hero.counterLeft - dt);
    if (hero.counterLeft === 0) {
      hero.counterTarget = -1;
    }
    hero.shieldLeft = Math.max(0, hero.shieldLeft - dt);
    for (const id of Object.keys(hero.skillCooldowns) as SkillId[]) {
      hero.skillCooldowns[id] = Math.max(0, (hero.skillCooldowns[id] ?? 0) - dt);
    }
    if (hero.attackTime < 0) {
      return;
    }
    hero.attackTime += dt;
    if (hero.attackTime >= this.currentAttackSpec().duration) {
      hero.attackTime = -1;
      hero.activeSkill = null;
      hero.counterStrike = false;
    }
  }
}
