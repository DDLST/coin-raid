import Phaser from 'phaser';
import {
  DODGE_TIME,
  INTRO_DURATION,
  PLAYER_CONFIG,
  ROLL_GRIPS,
  ULTIMATE_CONFIG,
  WEAPON_ART,
  WEAPON_STEAL_AT,
} from '../Constants';
import { type GameScene } from '../GameScene';
import { weaponFor } from '../progression/PlayerProgression';
import { type Point } from '../world/Navigation';
import {
  createArmedMotionArtwork,
  createRollArtwork,
  createStrideArtwork,
} from './textures/CharacterTextures';
import { armElbow, weaponPose, weaponTexture } from './WeaponAnimation';

/** Поза героя, броня, хват оружия, руки и визуальные зоны его атак. */
export class HeroRenderer {
  constructor(private readonly context: GameScene) {}

  hideArms(): void {
    const { visuals } = this.context;
    for (const arm of visuals.arms) {
      for (const part of [arm.upper, arm.forearm, arm.hand]) {
        part.setVisible(false);
      }
    }
  }

  bodyPoint(x: number, y: number, lift: number): Point {
    const { visuals } = this.context;
    const a = visuals.player.rotation;
    return {
      x: visuals.player.x + Math.cos(a) * x - Math.sin(a) * y,
      y: visuals.player.y - lift + Math.sin(a) * x + Math.cos(a) * y,
    };
  }

  reachableGrip(grip: Point, shoulder: Point, rotation: number): Point {
    const angle = rotation - Math.PI / 2;
    const ox = Math.cos(angle) * 4;
    const oy = Math.sin(angle) * 4;
    const dx = grip.x - ox - shoulder.x;
    const dy = grip.y - oy - shoulder.y;
    const d = Math.hypot(dx, dy);
    const scale = d > 29 ? 29 / d : 1;
    return { x: shoulder.x + dx * scale + ox, y: shoulder.y + dy * scale + oy };
  }

  drawArm(
    index: number,
    shoulder: Point,
    grip: Point,
    rotation: number,
    depth: number,
    open = false,
    side = 1,
  ): void {
    const { hero, visuals } = this.context;
    const parts = visuals.arms[index];
    const angle = rotation - Math.PI / 2;
    const wrist = {
      x: grip.x - Math.cos(angle) * 4,
      y: grip.y - Math.sin(angle) * 4,
    };
    const elbow = armElbow(shoulder, wrist, (index === 0 ? -1 : 1) * side);
    const alpha = visuals.player.alpha;
    const segment = (image: Phaser.GameObjects.Image, from: Point, to: Point, width: number) =>
      image
        .setVisible(true)
        .setPosition(from.x, from.y)
        .setDisplaySize(width, Math.hypot(to.x - from.x, to.y - from.y) + 1.3)
        .setRotation(Math.atan2(to.y - from.y, to.x - from.x) - Math.PI / 2)
        .setDepth(depth)
        .setAlpha(alpha);
    parts.upper.setTexture('hero-upper');
    segment(parts.upper, shoulder, elbow, 12);
    segment(parts.forearm, elbow, wrist, 10.5);
    parts.hand
      .setVisible(true)
      .setTexture(open ? 'hand-open' : index === 0 ? 'hand-grip' : 'hand-palm')
      .setOrigin(0.5, 0.35)
      .setPosition(grip.x, grip.y)
      .setDisplaySize(open ? 11 : 9, 12)
      .setRotation(rotation)
      .setDepth(depth + 0.32)
      .setAlpha(alpha);
    for (const part of [parts.upper, parts.forearm, parts.hand]) {
      if (hero.hurtFlash > 0) {
        part.setTint(0xff8c92);
      } else {
        part.clearTint();
      }
    }
  }

  drawBody() {
    const { hero, worldState, journey, visuals } = this.context;
    createArmedMotionArtwork(this.context, journey.profile.skin);
    createStrideArtwork(this.context, journey.profile.skin);
    createRollArtwork(this.context, journey.profile.skin);
    const t = visuals.animationTime;
    const item = weaponFor(journey.profile);
    const spec = this.context.combat.currentAttackSpec();
    const w = { ...item, ...spec };
    const moving = Math.hypot(hero.velocity.x, hero.velocity.y) > 10;
    const facing =
      hero.dodgeLeft > 0
        ? Math.atan2(hero.dodgeVector.y, hero.dodgeVector.x)
        : hero.ultimateLeft > 0
          ? hero.ultimateAngle
          : hero.attackTime >= 0
            ? hero.attackAngle
            : hero.face;
    const direction =
      Math.abs(Math.cos(facing)) > 0.72
        ? Math.cos(facing) < 0
          ? 'left'
          : 'right'
        : Math.sin(facing) < 0
          ? 'back'
          : 'front';
    const rollPhase = Math.min(3, Math.floor((1 - hero.dodgeLeft / DODGE_TIME) * 4));
    const held =
      hero.armed &&
      this.context.flow.state !== 'dying' &&
      !(
        this.context.flow.state === 'intro' && INTRO_DURATION - journey.introLeft >= WEAPON_STEAL_AT
      );
    let poseTime = hero.attackTime;
    let poseAngle = hero.attackTime >= 0 ? hero.attackAngle : hero.face;
    let poseSpec = {
      windup: w.windup,
      activeEnd: w.activeEnd,
      duration: w.duration,
      arc: w.arc,
    };
    let poseHeavy = hero.heavyAttack;
    let poseCombo = hero.combo;
    let chain = false;
    if (spec.pulses > 1 && poseTime >= w.windup && poseTime <= w.activeEnd) {
      const pulse = Math.min(
        spec.pulses - 0.00001,
        ((poseTime - w.windup) / Math.max(0.01, w.activeEnd - w.windup)) * spec.pulses,
      );
      poseCombo = Math.floor(pulse);
      poseTime = pulse % 1;
      poseSpec = { windup: 0, activeEnd: 1, duration: 1, arc: w.arc };
      chain = true;
    }
    if (hero.ultimateLeft > 0) {
      const total = ULTIMATE_CONFIG.duration - hero.ultimateLeft;
      const cycle =
        w.style === 'axe' || w.style === 'sword'
          ? ULTIMATE_CONFIG.animationCycle
          : ULTIMATE_CONFIG.duration;
      poseTime = total % cycle;
      poseAngle = hero.ultimateAngle;
      poseSpec = {
        windup: cycle * 0.2,
        activeEnd: cycle * 0.7,
        duration: cycle,
        arc: w.style === 'spear' ? ULTIMATE_CONFIG.spearArc : 1.4,
      };
      poseHeavy = w.style === 'axe';
    }
    const pose = weaponPose(
      w.id,
      poseAngle,
      poseTime,
      poseSpec.windup,
      poseSpec.activeEnd,
      poseSpec.duration,
      poseSpec.arc,
      poseHeavy,
      {
        combo: poseCombo,
        skill: hero.activeSkill,
        guard: hero.guardLeft > 0,
        runPhase: moving ? ((hero.strideDistance / 19) * Math.PI) / 2 : undefined,
        roll: hero.dodgeLeft > 0 ? 1 - hero.dodgeLeft / DODGE_TIME : undefined,
        chain,
      },
    );
    if (hero.dodgeLeft > 0) {
      const [x, y] = ROLL_GRIPS[direction][rollPhase];
      pose.handX = ((x - 64) * 92) / 128;
      pose.handY = ((y - 128 * 0.68) * 92) / 128;
      pose.rotation =
        facing + Math.PI / 2 + Math.sin((1 - hero.dodgeLeft / DODGE_TIME) * Math.PI * 2) * 0.4;
    }
    const step = Math.floor(hero.strideDistance / 19) % 4;
    const key =
      hero.dodgeLeft > 0
        ? `${journey.profile.skin}-${direction}-roll-${rollPhase}`
        : held
          ? `${journey.profile.skin}-armed-${direction}${moving ? `-step-${step}` : ''}`
          : moving
            ? `${journey.profile.skin}-${direction}-step-${step}`
            : direction === 'front'
              ? journey.profile.skin
              : `${journey.profile.skin}-${direction}`;
    const lift =
      hero.activeSkill === 'axe_leap' && hero.attackTime >= 0
        ? Math.sin(Math.min(1, hero.attackTime / w.duration) * Math.PI) * 12
        : 0;
    visuals.player
      .setTexture(key)
      .setOrigin(0.5, 0.68 + lift / 92)
      .setFlipX(false)
      .setAngle(held ? pose.lean : 0)
      .setScale(
        92 / 128,
        (92 / 128) * (moving || hero.dodgeLeft > 0 ? 1 : 1 + Math.sin(t * 2.5) * 0.004),
      )
      .setDepth(20 + visuals.player.y * 0.01);
    visuals.playerShadow
      .setDepth(worldState.area === 'interior' ? 15 : 8)
      .setPosition(visuals.player.x, visuals.player.y + 27)
      .setScale(hero.dodgeLeft > 0 ? 1.3 : 1);
    if (hero.hurtFlash > 0) {
      visuals.player.setTint(0xff8c92);
    } else {
      visuals.player.clearTint();
    }
    visuals.player.setAlpha(
      hero.hurtLeft > 0 && this.context.flow.state === 'playing'
        ? 0.84 + Math.sin(t * 32) * 0.1
        : 1,
    );
    visuals.armorSprite.setVisible(
      journey.profile.armor !== 'travel' &&
        this.context.flow.state !== 'dying' &&
        hero.dodgeLeft <= 0,
    );
    if (journey.profile.armor !== 'travel') {
      visuals.armorSprite
        .setTexture(`armor-${journey.profile.armor}`)
        .setPosition(visuals.player.x, visuals.player.y - 3 - lift)
        .setDisplaySize(34, 34)
        .setAngle(visuals.player.angle)
        .setAlpha(visuals.player.alpha * 0.82)
        .setDepth(visuals.player.depth + 0.1);
    }
    const swing = pose.angle;
    const art = WEAPON_ART[w.id];
    const rotation = pose.rotation + visuals.player.rotation;
    const weaponDepth = visuals.player.depth + (pose.behind ? -0.15 : 0.5);
    const side = Math.cos(facing) < 0 ? -1 : 1;
    const profile = direction === 'left' || direction === 'right';
    const shoulders = [
      this.bodyPoint(side * (profile ? 3 : 11), -24, lift),
      this.bodyPoint(side * (profile ? -5 : -11), -24, lift),
    ];
    let hand = this.bodyPoint(pose.handX, pose.handY, lift);
    let other = this.bodyPoint(pose.otherX, pose.otherY, lift);
    if (hero.dodgeLeft <= 0) {
      if (pose.both) {
        const distance = w.style === 'spear' ? -12 : w.style === 'axe' ? -8 : -6;
        const dx = Math.cos(rotation - Math.PI / 2) * distance;
        const dy = Math.sin(rotation - Math.PI / 2) * distance;
        for (let n = 0; n < 4; n++) {
          hand = this.reachableGrip(hand, shoulders[0], rotation);
          other = { x: hand.x + dx, y: hand.y + dy };
          const clamped = this.reachableGrip(other, shoulders[1], rotation);
          hand.x += clamped.x - other.x;
          hand.y += clamped.y - other.y;
        }
        other = { x: hand.x + dx, y: hand.y + dy };
      } else {
        hand = this.reachableGrip(hand, shoulders[0], rotation);
        other = this.reachableGrip(
          other,
          shoulders[1],
          pose.casting
            ? pose.otherAngle + visuals.player.rotation
            : Math.PI + visuals.player.rotation,
        );
      }
    }
    visuals.sword
      .setVisible(held)
      .setTexture(weaponTexture(w.id))
      .clearTint()
      .setDisplaySize(art.size, art.size)
      .setOrigin(art.gripX, art.gripY)
      .setPosition(hand.x, hand.y)
      .setRotation(rotation)
      .setDepth(weaponDepth)
      .setAlpha(visuals.player.alpha);
    this.hideArms();
    if (held) {
      if (hero.dodgeLeft > 0) {
        visuals.arms[0].hand
          .setVisible(true)
          .setTexture('hand-grip')
          .setPosition(hand.x, hand.y)
          .setDisplaySize(10, 15)
          .setRotation(rotation)
          .setDepth(weaponDepth + 0.08)
          .setAlpha(visuals.player.alpha);
      } else {
        this.drawArm(0, shoulders[0], hand, rotation, weaponDepth - 0.24, false, side);
        this.drawArm(
          1,
          shoulders[1],
          other,
          pose.both
            ? rotation
            : pose.casting
              ? pose.otherAngle + visuals.player.rotation
              : Math.PI + visuals.player.rotation,
          pose.both
            ? weaponDepth - 0.25
            : visuals.player.depth + (direction === 'back' || profile ? -0.2 : 0.18),
          pose.casting,
          side,
        );
      }
    }

    return { t, w, poseTime, poseSpec, held, art, rotation, hand, swing };
  }

  drawOverlays(frame: ReturnType<HeroRenderer['drawBody']>): void {
    const { hero, worldState, ui, visuals } = this.context;
    const t = visuals.animationTime;
    const g = visuals.combatInk;
    const { w, poseTime, poseSpec, held, art, rotation, hand, swing } = frame;
    const active =
      (hero.attackTime >= w.windup && hero.attackTime <= w.activeEnd) ||
      (hero.ultimateLeft > 0 && poseTime >= poseSpec.windup && poseTime <= poseSpec.activeEnd);
    const tipDistance = (art.gripY - art.tipY) * art.size;
    const tip = {
      x: hand.x + Math.cos(rotation - Math.PI / 2) * tipDistance,
      y: hand.y + Math.sin(rotation - Math.PI / 2) * tipDistance,
    };
    if (!held || !active || visuals.trailWeapon !== w.id || hero.attackTime < visuals.trailAttack) {
      visuals.weaponTrail = [];
    }
    visuals.trailWeapon = w.id;
    visuals.trailAttack = hero.attackTime;
    if (held && active) {
      const last = visuals.weaponTrail.at(-1);
      if (!last || Math.hypot(tip.x - last.x, tip.y - last.y) > 0.5) {
        visuals.weaponTrail.push(tip);
      }
      if (visuals.weaponTrail.length > 7) {
        visuals.weaponTrail.shift();
      }
      for (let i = 1; i < visuals.weaponTrail.length; i++) {
        const from = visuals.weaponTrail[i - 1];
        const to = visuals.weaponTrail[i];
        g.lineStyle(2 + i * 0.7, w.color, (i / visuals.weaponTrail.length) * 0.45);
        g.lineBetween(from.x, from.y, to.x, to.y);
      }
    }
    if (held && w.style === 'staff' && (hero.attackTime >= 0 || hero.ultimateLeft > 0)) {
      this.context.effects.drawCombatImage(
        w.id === 'runicstaff' ? 'shot-spirit' : 'shot-violet',
        tip.x,
        tip.y,
        25 + Math.sin(t * 30) * 3,
        swing,
        active ? 0.75 : 0.3,
      );
    }
    for (const fx of visuals.effects) {
      const fade = fx.life / fx.max;
      const reach = fx.radius * (1 + (1 - fade) * 0.25);
      g.lineStyle(9 * fade + 1, fx.color, fade * 0.65);
      if (fx.kind === 'slash') {
        this.context.effects.drawCombatImage(
          'fx-slash',
          fx.x + Math.cos(fx.angle) * reach * 0.52,
          fx.y + Math.sin(fx.angle) * reach * 0.52,
          reach * 1.2,
          fx.angle,
          fade * 0.75,
        );
      }
      if (fx.kind === 'ring') {
        g.strokeCircle(fx.x, fx.y, reach);
      } else if (fx.kind === 'thrust') {
        g.lineBetween(
          fx.x,
          fx.y,
          fx.x + Math.cos(fx.angle) * reach,
          fx.y + Math.sin(fx.angle) * reach,
        );
      } else {
        g.beginPath();
        g.arc(fx.x, fx.y, reach, fx.angle - 0.8, fx.angle + 0.8, false);
        g.strokePath();
      }
    }
    if (hero.counterLeft > 0) {
      const e = worldState.enemies.find((e) => e.id === hero.counterTarget && !e.dead);
      if (e) {
        g.lineStyle(3, 0xffe4a0, 0.8);
        g.strokeCircle(e.sprite.x, e.sprite.y, e.radius + 20 + Math.sin(t * 16) * 3);
        g.lineBetween(visuals.player.x, visuals.player.y, e.sprite.x, e.sprite.y);
      }
    }
    if (hero.shieldLeft > 0) {
      g.lineStyle(3, 0xb1e8ec, 0.6);
      g.strokeCircle(visuals.player.x, visuals.player.y, 43 + Math.sin(t * 5) * 3);
    }
    if (hero.guardLeft > 0) {
      this.context.effects.cone(
        g,
        visuals.player,
        hero.face,
        60,
        PLAYER_CONFIG.parryFrontArc,
        0xffe3a1,
        0.22,
      );
    }
    this.context.tutorial.drawTeachingCue(g);
    if (ui.mouse && this.context.flow.state === 'playing') {
      const at = this.context.cameras.main.getWorldPoint(ui.mouse.x, ui.mouse.y);
      g.lineStyle(1, 0xb7f0e9, 0.62);
      g.strokeCircle(at.x, at.y, 6);
      g.lineBetween(at.x - 10, at.y, at.x - 3, at.y);
      g.lineBetween(at.x + 3, at.y, at.x + 10, at.y);
    }
    if (hero.attackTime >= 0) {
      const active = hero.attackTime >= w.windup && hero.attackTime <= w.activeEnd;
      const alpha = active
        ? 0.5
        : hero.attackTime < w.windup
          ? 0.08
          : Math.max(0, 0.24 * (1 - (hero.attackTime - w.activeEnd) / (w.duration - w.activeEnd)));
      if (w.type === 'thrust' || hero.activeSkill === 'axe_fault') {
        g.lineStyle(active ? 2 : 1, w.color, alpha * 0.4);
        g.lineBetween(
          hand.x,
          hand.y,
          visuals.player.x + Math.cos(hero.attackAngle) * w.reach,
          visuals.player.y + Math.sin(hero.attackAngle) * w.reach,
        );
      } else if (w.type !== 'magic') {
        g.lineStyle(active ? 4 : 2, w.color, alpha * 0.55);
        g.beginPath();
        g.arc(
          visuals.player.x,
          visuals.player.y,
          w.reach * 0.8,
          hero.attackAngle - w.arc,
          hero.attackAngle + w.arc,
          false,
        );
        g.strokePath();
        if (active) {
          g.lineStyle(1, 0xf5ffeb, 0.4);
          g.lineBetween(hand.x, hand.y, tip.x, tip.y);
        }
      }
    }
    if (hero.ultimateLeft > 0) {
      g.lineStyle(5, w.color, (hero.ultimateLeft / ULTIMATE_CONFIG.duration) * 0.75);
      if (w.style === 'spear') {
        g.lineBetween(
          visuals.player.x,
          visuals.player.y,
          visuals.player.x + Math.cos(hero.ultimateAngle) * ULTIMATE_CONFIG.spearReach,
          visuals.player.y + Math.sin(hero.ultimateAngle) * ULTIMATE_CONFIG.spearReach,
        );
      } else {
        g.strokeCircle(
          visuals.player.x,
          visuals.player.y,
          (w.style === 'axe' ? ULTIMATE_CONFIG.axeReach : ULTIMATE_CONFIG.swordReach) *
            (1 - (hero.ultimateLeft / ULTIMATE_CONFIG.duration) * 0.4),
        );
      }
    }
  }
}
