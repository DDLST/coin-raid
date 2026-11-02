import Phaser from 'phaser';
import {
  COUNTER_WINDOW,
  DODGE_COST,
  DODGE_TIME,
  FLASK_HEAL,
  GAME_CONFIG,
  HURT_PROTECTION,
  PARRY_DURATION,
  PERFECT_PARRY,
  PLAYER_CONFIG,
  PLAYER_RADIUS,
  POTION_HEAL,
  REGIONS,
  STAMINA_DELAY,
  ULTIMATE_MAX,
} from '../Constants';
import { stats } from '../combat/CombatRules';
import { type Enemy } from '../enemies/EnemyTypes';
import { type GameScene } from '../GameScene';
import { moveCircle, type Point } from '../world/Navigation';

/** Движение, здоровье, лечение и уклонение героя. */
export class PlayerController {
  constructor(private readonly context: GameScene) {}
  updateAim(): void {
    const { hero, ui, visuals } = this.context;
    if (hero.attackTime >= 0 || hero.dodgeLeft > 0) {
      return;
    }
    if (ui.mouse) {
      const at = this.context.cameras.main.getWorldPoint(ui.mouse.x, ui.mouse.y);
      if (Math.hypot(at.x - visuals.player.x, at.y - visuals.player.y) > 8) {
        hero.face = Math.atan2(at.y - visuals.player.y, at.x - visuals.player.x);
      }
    }
  }
  movePlayer(dt: number): void {
    const { hero, worldState, journey, ui, visuals } = this.context;
    let x = 0;
    let y = 0;
    if (ui.keys.LEFT.isDown || ui.keys.A.isDown) {
      x--;
    }
    if (ui.keys.RIGHT.isDown || ui.keys.D.isDown) {
      x++;
    }
    if (ui.keys.UP.isDown || ui.keys.W.isDown) {
      y--;
    }
    if (ui.keys.DOWN.isDown || ui.keys.S.isDown) {
      y++;
    }
    const len = Math.hypot(x, y);
    if (len > 0.05) {
      x /= Math.max(1, len);
      y /= Math.max(1, len);
      hero.movement = {
        x: x / (Math.hypot(x, y) || 1),
        y: y / (Math.hypot(x, y) || 1),
      };
      if (hero.attackTime < 0 && !ui.mouse) {
        hero.face = Math.atan2(y, x);
      }
    }
    if (hero.dodgeLeft > 0) {
      x = hero.dodgeVector.x;
      y = hero.dodgeVector.y;
    }
    const speed =
      stats(journey.profile).speed *
      (hero.dodgeLeft > 0
        ? PLAYER_CONFIG.dodgeSpeedScale
        : hero.attackTime >= 0
          ? PLAYER_CONFIG.attackSpeedScale
          : 1) *
      this.context.weather.groundSpeed(visuals.player, true);
    const before = {
      x: visuals.player.x,
      y: visuals.player.y,
    };
    const moved = moveCircle(
      before,
      x * speed * dt,
      y * speed * dt,
      PLAYER_RADIUS,
      this.context.world.activeTerrain(),
      this.context.world.playerBounds(),
    );
    visuals.player.setPosition(moved.x, moved.y);
    hero.strideDistance += Math.hypot(moved.x - before.x, moved.y - before.y);
    hero.velocity =
      dt > 0 ? { x: (moved.x - before.x) / dt, y: (moved.y - before.y) / dt } : { x: 0, y: 0 };
    this.context.audio.footstep(
      this.context.weather.groundSpeed(visuals.player, true) < 1
        ? 'water'
        : worldState.area === 'interior'
          ? 'stone'
          : REGIONS[worldState.regionIndex].ground,
      Math.hypot(hero.velocity.x, hero.velocity.y) > 15 && hero.dodgeLeft <= 0,
    );
    if (hero.dodgeLeft > 0 && Math.floor(visuals.animationTime * 45) % 3 === 0) {
      const ghost = this.context.add
        .image(visuals.player.x, visuals.player.y, visuals.player.texture.key)
        .setOrigin(0.5, 0.68)
        .setDisplaySize(92, 92)
        .setAlpha(0.2)
        .setDepth(9);
      this.context.tweens.add({
        targets: ghost,
        alpha: 0,
        duration: 150,
        onComplete: () => ghost.destroy(),
      });
    }
  }
  dodge(): void {
    const { hero, journey } = this.context;
    if (this.context.flow.state !== 'playing' || hero.dodgeWait > 0 || hero.stamina < DODGE_COST) {
      return;
    }
    const w = this.context.combat.currentAttackSpec();
    if (hero.attackTime >= 0 && hero.attackTime < w.activeEnd) {
      return;
    }
    hero.attackTime = -1;
    hero.dodgeLeft = DODGE_TIME;
    hero.dodgeWait = stats(journey.profile).dodgeCooldown;
    hero.dodgeVector =
      Math.hypot(hero.velocity.x, hero.velocity.y) > 5
        ? hero.movement
        : {
            x: Math.cos(hero.face),
            y: Math.sin(hero.face),
          };
    hero.stamina -= DODGE_COST;
    hero.regenDelay = STAMINA_DELAY;
    this.context.audio.play('dash');
    this.context.tutorial.lessonEvent('dodge');
  }
  heal(potion = false): void {
    const { hero, journey, visuals } = this.context;
    if (
      this.context.flow.state !== 'playing' ||
      hero.healWait > 0 ||
      hero.attackTime >= 0 ||
      hero.dodgeLeft > 0
    ) {
      return;
    }
    if (potion ? journey.profile.potions <= 0 : hero.flasks <= 0) {
      this.context.menu.toast(
        potion
          ? 'Зелий нет. Купи запас у лекаря в деревне.'
          : 'Фляга пуста. V - зелье из сумки; Лекарь продаёт запас.',
      );
      return;
    }
    if (hero.hp >= stats(journey.profile).maxHP) {
      return;
    }
    if (potion) {
      journey.profile.potions--;
    } else {
      hero.flasks--;
    }
    journey.dirty = true;
    hero.hp = Math.min(
      stats(journey.profile).maxHP,
      hero.hp +
        (potion
          ? Math.max(POTION_HEAL, stats(journey.profile).maxHP * PLAYER_CONFIG.potionHealthRatio)
          : FLASK_HEAL),
    );
    hero.healWait = PLAYER_CONFIG.healCooldown;
    this.context.audio.play('heal');
    this.context.effects.particles(visuals.player.x, visuals.player.y, 12, 0xbdd785);
    this.context.hud.updateHUD();
    this.context.tutorial.lessonEvent('heal');
  }
  damagePlayer(amount: number, source: Point, magic = false, attacker?: Enemy): void {
    const { hero, worldState, journey, visuals } = this.context;
    if (this.context.flow.state !== 'playing' || hero.hurtLeft > 0 || hero.dodgeLeft > 0) {
      return;
    }
    const front =
      Math.abs(
        Phaser.Math.Angle.Wrap(
          Math.atan2(source.y - visuals.player.y, source.x - visuals.player.x) - hero.face,
        ),
      ) < PLAYER_CONFIG.parryFrontArc;
    if (hero.guardLeft > 0 && !magic && front) {
      const perfect = hero.guardLeft >= PARRY_DURATION - PERFECT_PARRY;
      hero.guardLeft = 0;
      if (perfect && attacker && !attacker.dead) {
        hero.counterTarget = attacker.id;
        hero.counterLeft = COUNTER_WINDOW;
        attacker.stun =
          attacker.kind === 'boss'
            ? PLAYER_CONFIG.counterBossStun
            : PLAYER_CONFIG.counterMinionStun;
        attacker.mode = 'recover';
        attacker.clock = attacker.stun;
        for (const pending of worldState.hazards) {
          if (pending.ownerId === attacker.id && !pending.fired) {
            pending.left = 0;
          }
        }
        hero.ultimate = Math.min(ULTIMATE_MAX, hero.ultimate + PLAYER_CONFIG.parryUltimateGain);
        this.context.audio.play('parry');
        this.context.effects.addEffect('ring', visuals.player, 0xffedab, 70);
        this.context.menu.toast('Точное парирование! ЛКМ - контрудар по отмеченному врагу.');
        return;
      }
      amount *= PLAYER_CONFIG.blockDamageScale;
      this.context.audio.play('parry');
      this.context.effects.addEffect('ring', visuals.player, 0xe3cf99, 45);
    }
    const a = stats(journey.profile);
    const damage = Math.max(
      PLAYER_CONFIG.minDamage,
      Math.round(
        amount *
          a.armor *
          (magic ? a.ward : 1) *
          (hero.shieldLeft > 0 ? PLAYER_CONFIG.shieldDamageScale : 1),
      ),
    );
    hero.hp = Math.max(0, hero.hp - damage);
    hero.hurtLeft = HURT_PROTECTION;
    hero.hurtFlash = PLAYER_CONFIG.hurtFlashDuration;
    hero.attackTime = -1;
    hero.counterLeft = 0;
    hero.counterTarget = -1;
    this.context.quests.onQuestEvent('hurt');
    worldState.wispFear = PLAYER_CONFIG.wispFearDuration;
    this.context.audio.play('hurt');
    const dx = visuals.player.x - source.x;
    const dy = visuals.player.y - source.y;
    const len = Math.hypot(dx, dy) || 1;
    const moved = moveCircle(
      visuals.player,
      (dx / len) * PLAYER_CONFIG.damageKnockback,
      (dy / len) * PLAYER_CONFIG.damageKnockback,
      PLAYER_RADIUS,
      this.context.world.activeTerrain(),
      this.context.world.playerBounds(),
    );
    visuals.player.setPosition(moved.x, moved.y);
    this.context.cameras.main.shake(100, 0.0035);
    this.context.effects.particles(visuals.player.x, visuals.player.y, 7, 0xd99591);
    this.context.effects.popup(visuals.player.x, visuals.player.y - 38, `-${damage}`, '#f0b0aa');
    this.context.hud.updateHUD();
    if (hero.hp <= 0) {
      journey.deaths++;
      this.context.flow.transitionTo('dying');
      hero.deathLeft = GAME_CONFIG.deathDuration;
      this.context.controls.resetInput();
      this.context.actors.drawActors();
      this.context.menu.toast('Ты пал. Костёр хранит твоё эхо.');
    }
  }

  updateTimers(dt: number): void {
    const { hero } = this.context;
    hero.dodgeLeft = Math.max(0, hero.dodgeLeft - dt);
    hero.dodgeWait = Math.max(0, hero.dodgeWait - dt);
    hero.hurtLeft = Math.max(0, hero.hurtLeft - dt);
    hero.hurtFlash = Math.max(0, hero.hurtFlash - dt);
    hero.regenDelay = Math.max(0, hero.regenDelay - dt);
    hero.healWait = Math.max(0, hero.healWait - dt);
    hero.slowed = Math.max(0, hero.slowed - dt);
  }

  updateDeath(dt: number): void {
    const { hero, visuals } = this.context;
    hero.deathLeft -= dt;
    visuals.animationTime += dt;
    visuals.player
      .setAngle(
        Math.min(
          GAME_CONFIG.deathMaxAngle,
          (GAME_CONFIG.deathDuration - hero.deathLeft) * GAME_CONFIG.deathRotationSpeed,
        ),
      )
      .setAlpha(Math.max(GAME_CONFIG.deathMinAlpha, hero.deathLeft / GAME_CONFIG.deathDuration));
    visuals.armorSprite.setVisible(false);
    if (hero.deathLeft <= 0) {
      this.context.world.respawn();
    }
  }

  regenerateStamina(dt: number): void {
    const { hero, journey } = this.context;
    if (hero.regenDelay > 0 || hero.attackTime >= 0 || hero.dodgeLeft > 0) {
      return;
    }
    const parameters = stats(journey.profile);
    hero.stamina = Math.min(parameters.maxStamina, hero.stamina + parameters.staminaRegen * dt);
  }
}
