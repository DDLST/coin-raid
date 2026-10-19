import {
  stats,
  PLAYER_RADIUS,
  DODGE_COST,
  DODGE_TIME,
  STAMINA_DELAY,
  POTION_HEAL,
  FLASK_HEAL,
  PARRY_DURATION,
  PERFECT_PARRY,
  COUNTER_WINDOW,
  HURT_PROTECTION,
} from '../combat/CombatRules';
import { moveCircle, type Point } from '../world/Navigation';
import { REGIONS } from '../world/WorldConfig';
import { type Enemy } from '../enemies/EnemyTypes';
import Phaser from 'phaser';
import type { GameScene } from '../GameScene';

/** Движение, здоровье, лечение и уклонение героя. */
export class PlayerController {
  constructor(private readonly context: GameScene) {}
  updateAim(): void {
    const { hero, ui, visuals } = this.context;
    if (hero.attackTime >= 0 || hero.dodgeLeft > 0) return;
    if (ui.mouse) {
      const at = this.context.cameras.main.getWorldPoint(ui.mouse.x, ui.mouse.y);
      if (Math.hypot(at.x - visuals.player.x, at.y - visuals.player.y) > 8)
        hero.face = Math.atan2(at.y - visuals.player.y, at.x - visuals.player.x);
    }
  }
  movePlayer(dt: number): void {
    const { hero, worldState, journey, ui, visuals } = this.context;
    let x = 0,
      y = 0;
    if (ui.keys.LEFT.isDown || ui.keys.A.isDown) x--;
    if (ui.keys.RIGHT.isDown || ui.keys.D.isDown) x++;
    if (ui.keys.UP.isDown || ui.keys.W.isDown) y--;
    if (ui.keys.DOWN.isDown || ui.keys.S.isDown) y++;
    const len = Math.hypot(x, y);
    if (len > 0.05) {
      x /= Math.max(1, len);
      y /= Math.max(1, len);
      hero.movement = {
        x: x / (Math.hypot(x, y) || 1),
        y: y / (Math.hypot(x, y) || 1),
      };
      if (hero.attackTime < 0 && !ui.mouse) hero.face = Math.atan2(y, x);
    }
    if (hero.dodgeLeft > 0) {
      x = hero.dodgeVector.x;
      y = hero.dodgeVector.y;
    }
    const speed =
      stats(journey.profile).speed *
      (hero.dodgeLeft > 0 ? 2.7 : hero.attackTime >= 0 ? 0.4 : 1) *
      this.context.weather.groundSpeed(visuals.player, true);
    const before = {
        x: visuals.player.x,
        y: visuals.player.y,
      },
      moved = moveCircle(
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
    const { hero, journey, ui } = this.context;
    if (ui.state !== 'playing' || hero.dodgeWait > 0 || hero.stamina < DODGE_COST) return;
    const w = this.context.combat.currentAttackSpec();
    if (hero.attackTime >= 0 && hero.attackTime < w.activeEnd) return;
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
    const { hero, journey, ui, visuals } = this.context;
    if (ui.state !== 'playing' || hero.healWait > 0 || hero.attackTime >= 0 || hero.dodgeLeft > 0)
      return;
    if (potion ? journey.profile.potions <= 0 : hero.flasks <= 0) {
      this.context.menu.toast(
        potion
          ? 'Зелий нет. Купи запас у лекаря в деревне.'
          : 'Фляга пуста. V - зелье из сумки; Лекарь продаёт запас.',
      );
      return;
    }
    if (hero.hp >= stats(journey.profile).maxHP) return;
    if (potion) journey.profile.potions--;
    else hero.flasks--;
    journey.dirty = true;
    hero.hp = Math.min(
      stats(journey.profile).maxHP,
      hero.hp + (potion ? Math.max(POTION_HEAL, stats(journey.profile).maxHP * 0.3) : FLASK_HEAL),
    );
    hero.healWait = 1.1;
    this.context.audio.play('heal');
    this.context.effects.particles(visuals.player.x, visuals.player.y, 12, 0xbdd785);
    this.context.menu.updateHUD();
    this.context.tutorial.lessonEvent('heal');
  }
  damagePlayer(amount: number, source: Point, magic = false, attacker?: Enemy): void {
    const { hero, worldState, journey, ui, visuals } = this.context;
    if (ui.state !== 'playing' || hero.hurtLeft > 0 || hero.dodgeLeft > 0) return;
    const front =
      Math.abs(
        Phaser.Math.Angle.Wrap(
          Math.atan2(source.y - visuals.player.y, source.x - visuals.player.x) - hero.face,
        ),
      ) < 1.1;
    if (hero.guardLeft > 0 && !magic && front) {
      const perfect = hero.guardLeft >= PARRY_DURATION - PERFECT_PARRY;
      hero.guardLeft = 0;
      if (perfect && attacker && !attacker.dead) {
        hero.counterTarget = attacker.id;
        hero.counterLeft = COUNTER_WINDOW;
        attacker.stun = attacker.kind === 'boss' ? 0.65 : 1.15;
        attacker.mode = 'recover';
        attacker.clock = attacker.stun;
        for (const pending of worldState.hazards)
          if (pending.ownerId === attacker.id && !pending.fired) pending.left = 0;
        hero.ultimate = Math.min(100, hero.ultimate + 18);
        this.context.audio.play('parry');
        this.context.effects.addEffect('ring', visuals.player, 0xffedab, 70);
        this.context.menu.toast('Точное парирование! ЛКМ - контрудар по отмеченному врагу.');
        return;
      }
      amount *= 0.45;
      this.context.audio.play('parry');
      this.context.effects.addEffect('ring', visuals.player, 0xe3cf99, 45);
    }
    const a = stats(journey.profile),
      damage = Math.max(
        2,
        Math.round(amount * a.armor * (magic ? a.ward : 1) * (hero.shieldLeft > 0 ? 0.65 : 1)),
      );
    hero.hp = Math.max(0, hero.hp - damage);
    hero.hurtLeft = HURT_PROTECTION;
    hero.hurtFlash = 0.22;
    hero.attackTime = -1;
    hero.counterLeft = 0;
    hero.counterTarget = -1;
    this.context.quests.onQuestEvent('hurt');
    worldState.wispFear = 1.4;
    this.context.audio.play('hurt');
    const dx = visuals.player.x - source.x,
      dy = visuals.player.y - source.y,
      len = Math.hypot(dx, dy) || 1,
      moved = moveCircle(
        visuals.player,
        (dx / len) * 25,
        (dy / len) * 25,
        PLAYER_RADIUS,
        this.context.world.activeTerrain(),
        this.context.world.playerBounds(),
      );
    visuals.player.setPosition(moved.x, moved.y);
    this.context.cameras.main.shake(100, 0.0035);
    this.context.effects.particles(visuals.player.x, visuals.player.y, 7, 0xd99591);
    this.context.effects.popup(visuals.player.x, visuals.player.y - 38, `-${damage}`, '#f0b0aa');
    this.context.menu.updateHUD();
    if (hero.hp <= 0) {
      journey.deaths++;
      ui.state = 'dying';
      hero.deathLeft = 0.8;
      this.context.controls.resetInput();
      this.context.actors.drawActors();
      this.context.menu.toast('Ты пал. Костёр хранит твоё эхо.');
    }
  }
}
