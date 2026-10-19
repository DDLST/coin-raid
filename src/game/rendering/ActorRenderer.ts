import { type Point } from '../world/Navigation';
import { armElbow, weaponPose, ROLL_GRIPS, WEAPON_ART, weaponTexture } from './WeaponAnimation';
import Phaser from 'phaser';
import { createArmedMotionArtwork, createStrideArtwork, createRollArtwork } from './TextureFactory';
import { weaponFor } from '../progression/PlayerProgression';
import { DODGE_TIME } from '../combat/CombatRules';
import { INTRO_DURATION, WEAPON_STEAL_AT } from '../story/StoryContent';
import { setBiomeMood } from './Atmosphere';
import { METEOR_WARNING } from '../world/WeatherSystem';
import { REGIONS, regionStart, regionEnd, WORLD_HEIGHT, WORLD_WIDTH } from '../world/WorldConfig';
import type { GameScene } from '../GameScene';

/** Позы, руки, оружие, враги, жители и отрисовка границ биома. */
export class ActorRenderer {
  constructor(private readonly context: GameScene) {}
  animateResidents(): void {
    const { worldState, ui, visuals } = this.context;
    const t = visuals.animationTime,
      fur = [0xb9aea1, 0xc1b6a1, 0xb6a284, 0x949aa4, 0xc3b9a2, 0x697583, 0x9e8263, 0xba8261];
    for (const n of worldState.villagers) {
      const inside =
        worldState.area === 'interior' &&
        n.village === worldState.villageIndex &&
        n.role === worldState.interiorRole;
      const outside =
        (worldState.area === 'village' || worldState.area === 'tutorial') &&
        n.village === worldState.villageIndex;
      const visible = inside || outside;
      n.sprite.setVisible(visible);
      n.gesture.clear().setVisible(visible);
      if (!visible) {
        n.near = false;
        continue;
      }
      const h = worldState.houses.find((h) => h.village === n.village && h.role === n.role)!;
      const at = inside ? { x: h.x + 15, y: h.y - 27 } : { x: h.door.x + 65, y: h.door.y + 20 };
      n.sprite
        .setPosition(at.x, at.y)
        .setScale(86 / 128, (86 / 128) * (1 + Math.sin(t * 2 + n.village + n.role.length) * 0.006))
        .setDepth(20 + at.y * 0.01);
      const distance = Math.hypot(visuals.player.x - at.x, visuals.player.y - at.y);
      if (ui.state === 'playing' && distance < 195 && !n.near) {
        n.near = true;
        n.greetUntil = t + 1.8;
      }
      if (distance > 260) n.near = false;
      if (n.greetUntil <= t) continue;
      const species = Number(n.sprite.texture.key.split('-')[1]),
        side = visuals.player.x < at.x ? -1 : 1,
        elbow = { x: at.x + side * 23, y: at.y - 5 },
        hand = {
          x: at.x + side * (28 + Math.sin((n.greetUntil - t) * 12) * 5),
          y: at.y - 30,
        };
      const g = n.gesture;
      g.setDepth(n.sprite.depth + 0.1).lineStyle(5, 0x594e43, 1);
      g.lineBetween(at.x + side * 12, at.y - 10, elbow.x, elbow.y);
      g.fillStyle(0x594e43, 1);
      g.fillCircle(elbow.x, elbow.y, 2.5);
      g.lineBetween(elbow.x, elbow.y, hand.x, hand.y);
      g.fillStyle(fur[species] ?? 0xb9aea1, 1);
      g.fillEllipse(hand.x, hand.y, 7, 8);
      g.lineStyle(1, 0xe8d4a4, 0.6);
      g.lineBetween(hand.x + side * 9, hand.y - 4, hand.x + side * 14, hand.y - 7);
    }
  }
  hideArms(): void {
    const { visuals } = this.context;
    for (const arm of visuals.arms)
      for (const part of [arm.upper, arm.forearm, arm.hand]) part.setVisible(false);
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
    const angle = rotation - Math.PI / 2,
      ox = Math.cos(angle) * 4,
      oy = Math.sin(angle) * 4,
      dx = grip.x - ox - shoulder.x,
      dy = grip.y - oy - shoulder.y,
      d = Math.hypot(dx, dy),
      scale = d > 29 ? 29 / d : 1;
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
    const parts = visuals.arms[index],
      angle = rotation - Math.PI / 2,
      wrist = {
        x: grip.x - Math.cos(angle) * 4,
        y: grip.y - Math.sin(angle) * 4,
      };
    const elbow = armElbow(shoulder, wrist, (index === 0 ? -1 : 1) * side),
      alpha = visuals.player.alpha;
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
    for (const part of [parts.upper, parts.forearm, parts.hand])
      if (hero.hurtFlash > 0) part.setTint(0xff8c92);
      else part.clearTint();
  }
  drawActors(): void {
    const { hero, worldState, journey, ui, visuals } = this.context;
    createArmedMotionArtwork(this.context, journey.profile.skin);
    createStrideArtwork(this.context, journey.profile.skin);
    createRollArtwork(this.context, journey.profile.skin);
    const t = visuals.animationTime,
      item = weaponFor(journey.profile),
      spec = this.context.combat.currentAttackSpec(),
      w = { ...item, ...spec },
      moving = Math.hypot(hero.velocity.x, hero.velocity.y) > 10;
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
      ui.state !== 'dying' &&
      !(ui.state === 'intro' && INTRO_DURATION - journey.introLeft >= WEAPON_STEAL_AT);
    let poseTime = hero.attackTime,
      poseAngle = hero.attackTime >= 0 ? hero.attackAngle : hero.face,
      poseSpec = {
        windup: w.windup,
        activeEnd: w.activeEnd,
        duration: w.duration,
        arc: w.arc,
      },
      poseHeavy = hero.heavyAttack,
      poseCombo = hero.combo,
      chain = false;
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
      const total = 0.86 - hero.ultimateLeft,
        cycle = w.style === 'axe' || w.style === 'sword' ? 0.28 : 0.86;
      poseTime = total % cycle;
      poseAngle = hero.ultimateAngle;
      poseSpec = {
        windup: cycle * 0.2,
        activeEnd: cycle * 0.7,
        duration: cycle,
        arc: w.style === 'spear' ? 0.3 : 1.4,
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
    const step = Math.floor(hero.strideDistance / 19) % 4,
      key =
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
    if (hero.hurtFlash > 0) visuals.player.setTint(0xff8c92);
    else visuals.player.clearTint();
    visuals.player.setAlpha(
      hero.hurtLeft > 0 && ui.state === 'playing' ? 0.84 + Math.sin(t * 32) * 0.1 : 1,
    );
    visuals.armorSprite.setVisible(
      journey.profile.armor !== 'travel' && ui.state !== 'dying' && hero.dodgeLeft <= 0,
    );
    if (journey.profile.armor !== 'travel')
      visuals.armorSprite
        .setTexture(`armor-${journey.profile.armor}`)
        .setPosition(visuals.player.x, visuals.player.y - 3 - lift)
        .setDisplaySize(34, 34)
        .setAngle(visuals.player.angle)
        .setAlpha(visuals.player.alpha * 0.82)
        .setDepth(visuals.player.depth + 0.1);
    const swing = pose.angle;
    const art = WEAPON_ART[w.id],
      rotation = pose.rotation + visuals.player.rotation,
      weaponDepth = visuals.player.depth + (pose.behind ? -0.15 : 0.5);
    const side = Math.cos(facing) < 0 ? -1 : 1,
      profile = direction === 'left' || direction === 'right';
    const shoulders = [
      this.bodyPoint(side * (profile ? 3 : 11), -24, lift),
      this.bodyPoint(side * (profile ? -5 : -11), -24, lift),
    ];
    let hand = this.bodyPoint(pose.handX, pose.handY, lift),
      other = this.bodyPoint(pose.otherX, pose.otherY, lift);
    if (hero.dodgeLeft <= 0) {
      if (pose.both) {
        const distance = w.style === 'spear' ? -12 : w.style === 'axe' ? -8 : -6,
          dx = Math.cos(rotation - Math.PI / 2) * distance,
          dy = Math.sin(rotation - Math.PI / 2) * distance;
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
      if (hero.dodgeLeft > 0)
        visuals.arms[0].hand
          .setVisible(true)
          .setTexture('hand-grip')
          .setPosition(hand.x, hand.y)
          .setDisplaySize(10, 15)
          .setRotation(rotation)
          .setDepth(weaponDepth + 0.08)
          .setAlpha(visuals.player.alpha);
      else {
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
    this.animateResidents();
    for (let i = 0; i < worldState.biomeMoods.length; i++)
      if (worldState.biomeMoods[i])
        setBiomeMood(
          worldState.biomeMoods[i],
          journey.progress[i]?.cleared === true,
          worldState.area === 'interior',
        );
    visuals.attackImageCursor = 0;
    const g = visuals.combatInk;
    g.clear();
    const active =
      (hero.attackTime >= w.windup && hero.attackTime <= w.activeEnd) ||
      (hero.ultimateLeft > 0 && poseTime >= poseSpec.windup && poseTime <= poseSpec.activeEnd);
    const tipDistance = (art.gripY - art.tipY) * art.size,
      tip = {
        x: hand.x + Math.cos(rotation - Math.PI / 2) * tipDistance,
        y: hand.y + Math.sin(rotation - Math.PI / 2) * tipDistance,
      };
    if (!held || !active || visuals.trailWeapon !== w.id || hero.attackTime < visuals.trailAttack)
      visuals.weaponTrail = [];
    visuals.trailWeapon = w.id;
    visuals.trailAttack = hero.attackTime;
    if (held && active) {
      const last = visuals.weaponTrail.at(-1);
      if (!last || Math.hypot(tip.x - last.x, tip.y - last.y) > 0.5) visuals.weaponTrail.push(tip);
      if (visuals.weaponTrail.length > 7) visuals.weaponTrail.shift();
      for (let i = 1; i < visuals.weaponTrail.length; i++) {
        const from = visuals.weaponTrail[i - 1],
          to = visuals.weaponTrail[i];
        g.lineStyle(2 + i * 0.7, w.color, (i / visuals.weaponTrail.length) * 0.45);
        g.lineBetween(from.x, from.y, to.x, to.y);
      }
    }
    if (held && w.style === 'staff' && (hero.attackTime >= 0 || hero.ultimateLeft > 0))
      this.context.effects.drawCombatImage(
        w.id === 'runicstaff' ? 'shot-spirit' : 'shot-violet',
        tip.x,
        tip.y,
        25 + Math.sin(t * 30) * 3,
        swing,
        active ? 0.75 : 0.3,
      );
    for (const fx of visuals.effects) {
      const fade = fx.life / fx.max,
        reach = fx.radius * (1 + (1 - fade) * 0.25);
      g.lineStyle(9 * fade + 1, fx.color, fade * 0.65);
      if (fx.kind === 'slash')
        this.context.effects.drawCombatImage(
          'fx-slash',
          fx.x + Math.cos(fx.angle) * reach * 0.52,
          fx.y + Math.sin(fx.angle) * reach * 0.52,
          reach * 1.2,
          fx.angle,
          fade * 0.75,
        );
      if (fx.kind === 'ring') g.strokeCircle(fx.x, fx.y, reach);
      else if (fx.kind === 'thrust')
        g.lineBetween(
          fx.x,
          fx.y,
          fx.x + Math.cos(fx.angle) * reach,
          fx.y + Math.sin(fx.angle) * reach,
        );
      else {
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
    if (hero.guardLeft > 0)
      this.context.effects.cone(g, visuals.player, hero.face, 60, 1.1, 0xffe3a1, 0.22);
    this.context.tutorial.drawTeachingCue(g);
    if (ui.mouse && ui.state === 'playing') {
      const at = this.context.cameras.main.getWorldPoint(ui.mouse.x, ui.mouse.y);
      g.lineStyle(1, 0xb7f0e9, 0.62);
      g.strokeCircle(at.x, at.y, 6);
      g.lineBetween(at.x - 10, at.y, at.x - 3, at.y);
      g.lineBetween(at.x + 3, at.y, at.x + 10, at.y);
    }
    if (hero.attackTime >= 0) {
      const active = hero.attackTime >= w.windup && hero.attackTime <= w.activeEnd,
        alpha = active
          ? 0.5
          : hero.attackTime < w.windup
            ? 0.08
            : Math.max(
                0,
                0.24 * (1 - (hero.attackTime - w.activeEnd) / (w.duration - w.activeEnd)),
              );
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
      g.lineStyle(5, w.color, (hero.ultimateLeft / 0.86) * 0.75);
      if (w.style === 'spear')
        g.lineBetween(
          visuals.player.x,
          visuals.player.y,
          visuals.player.x + Math.cos(hero.ultimateAngle) * 440,
          visuals.player.y + Math.sin(hero.ultimateAngle) * 440,
        );
      else
        g.strokeCircle(
          visuals.player.x,
          visuals.player.y,
          (w.style === 'axe' ? 150 : 185) * (1 - (hero.ultimateLeft / 0.86) * 0.4),
        );
    }
    for (const h of worldState.hazards) {
      if (h.kind === 'boss' && h.bossStrike) {
        this.context.bosses.drawBossStrike(h.bossStrike, h.warning > 0, h.left);
        continue;
      }
      const warning = h.warning > 0,
        color =
          h.kind === 'sigil'
            ? weaponFor(journey.profile).color
            : h.kind === 'poison'
              ? 0x9eba71
              : h.kind === 'curse'
                ? 0xb19cdb
                : h.kind === 'wave'
                  ? 0xe5ca9e
                  : h.kind === 'ring'
                    ? 0xb7a5e3
                    : warning
                      ? 0xf38e83
                      : 0xffc485;
      g.fillStyle(color, warning ? 0.1 : 0.19);
      if (h.kind !== 'wave') g.fillCircle(h.x, h.y, h.radius);
      g.lineStyle(warning ? 2 : 3, color, 0.7);
      g.strokeCircle(h.x, h.y, h.radius);
      if (warning) {
        g.lineStyle(1, 0xf2e6bb, 0.55);
        g.strokeCircle(h.x, h.y, h.radius * (1 - Math.min(1, h.warning / 1.7)));
      }
      if (h.kind === 'meteor') {
        const fraction = warning
          ? Math.min(1, h.warning / (h.environment ? METEOR_WARNING : 1.8))
          : 0;
        this.context.effects.drawCombatImage(
          'fx-meteor',
          h.x - fraction * 105,
          h.y - fraction * 230,
          warning ? 92 : 116,
          0.12,
          warning ? 0.9 : Math.max(0, h.left) * 0.7,
        );
      }
      if (h.kind === 'poison' || h.kind === 'curse') {
        this.context.effects.drawCombatImage(
          h.kind === 'poison' ? 'shot-acid' : 'shot-violet',
          h.x,
          h.y,
          50 + Math.sin(t * 5) * 6,
          t * 0.1,
          warning ? 0.35 : 0.6,
        );
      }
    }
    for (const e of worldState.enemies) {
      const visible =
        e.region === worldState.regionIndex &&
        (worldState.area === 'biome' || worldState.area === 'tutorial') &&
        (worldState.area === 'tutorial') === e.training;
      if (!visible) {
        e.sprite.setVisible(false);
        e.shadow.setVisible(false);
        continue;
      }
      if (e.dead) continue;
      e.sprite.setVisible(true);
      const walk = e.mode === 'chase' || e.mode === 'charge',
        bounce = walk ? Math.sin(t * (e.mode === 'charge' ? 25 : 13) + e.id) : 0,
        size = e.kind === 'boss' ? 148 : e.kind === 'dragon' ? 103 : e.kind === 'zombie' ? 83 : 78;
      const anticipates = e.mode === 'windup',
        kick = e.recoil / 0.26,
        breathing = Math.sin(t * 2.2 + e.id) * 0.006,
        roaring = e.voiceLeft > 0;
      e.sprite
        .setAngle(
          anticipates
            ? -e.aim.x * 7
            : e.mode === 'charge'
              ? e.aim.x * 9
              : kick * e.aim.x * 8 + bounce * 1.2,
        )
        .setScale(
          (size / 128) * (roaring ? 1.035 : 1),
          (size / 128) *
            (1 + breathing + (anticipates ? -0.04 : 0) + kick * 0.025 + (roaring ? 0.025 : 0)),
        )
        .setDepth(20 + e.sprite.y * 0.01);
      const mouth = {
        x: e.sprite.x + e.aim.x * (e.radius * 0.52),
        y: e.sprite.y - e.radius * 0.52,
      };
      if (roaring) {
        g.fillStyle(0x120c1e, 0.8);
        g.fillEllipse(mouth.x, mouth.y, 12, 6 + Math.sin(t * 16) * 2);
        for (let n = 0; n < 2; n++) {
          const r = 15 + (((1.2 - e.voiceLeft) * 42 + n * 15) % 40);
          g.lineStyle(2, 0xbfc4ce, (1 - r / 60) * 0.3);
          g.strokeEllipse(mouth.x, mouth.y, r, r * 0.42);
        }
      }
      if (
        ['fan', 'breath', 'nova', 'snipe', 'summon'].includes(e.move) &&
        (anticipates || kick > 0)
      ) {
        const angle = Math.atan2(e.aim.y, e.aim.x);
        this.context.effects.drawCombatImage(
          this.context.effects.enemyProjectile(e),
          mouth.x + e.aim.x * 12,
          mouth.y + e.aim.y * 12,
          anticipates ? 19 + Math.sin(t * 15) * 3 : 31,
          angle,
          anticipates ? 0.5 : kick * 0.7,
        );
      }
      e.shadow.setPosition(e.sprite.x, e.sprite.y + e.radius).setVisible(true);
      if (e.flash > 0) e.sprite.setTint(0xdfffe1);
      else if (e.stun > 0) e.sprite.setTint(0x99d1e4);
      else if (e.mode === 'windup') e.sprite.setTint(0xf1beb6);
      else e.sprite.clearTint();
      if (e.kind === 'boss' && e.mode === 'windup') {
        for (const attack of e.bossPlan ?? []) this.context.bosses.drawBossStrike(attack, true, 1);
      } else if (e.mode === 'windup') {
        const angle = Math.atan2(e.aim.y, e.aim.x);
        if (e.move === 'slam' || e.move === 'poison' || e.move === 'quake' || e.move === 'nova') {
          const radius =
            e.move === 'nova'
              ? 190
              : e.move === 'quake'
                ? 160
                : e.move === 'slam'
                  ? 155
                  : e.kind === 'boss'
                    ? 100
                    : 72;
          g.lineStyle(2, 0xf78f81, 0.8);
          g.fillStyle(0xe28d77, 0.1);
          g.fillCircle(e.sprite.x, e.sprite.y, radius);
          g.strokeCircle(e.sprite.x, e.sprite.y, radius);
        } else if (e.move === 'curse') {
          g.lineStyle(2, 0xc9a0e9, 0.85);
          g.fillStyle(0x9d70bd, 0.12);
          g.fillCircle(e.target.x, e.target.y, 100);
          g.strokeCircle(e.target.x, e.target.y, 100);
          g.lineBetween(e.sprite.x, e.sprite.y, e.target.x, e.target.y);
        } else if (e.move === 'blink') {
          g.lineStyle(2, 0xd991b8, 0.8);
          g.fillStyle(0xb8698e, 0.12);
          g.fillCircle(e.target.x, e.target.y, 58);
          g.strokeCircle(e.target.x, e.target.y, 58);
          g.lineBetween(e.sprite.x, e.sprite.y, e.target.x, e.target.y);
        } else if (e.move === 'summon' || e.move === 'meteor') {
          g.lineStyle(2, e.move === 'summon' ? 0xb9aad8 : 0xf2a98a, 0.8);
          g.strokeCircle(e.sprite.x, e.sprite.y, 58);
          for (let n = 0; n < 6; n++) {
            const a = t * 1.5 + (n * Math.PI) / 3;
            g.fillStyle(0xdbc8ea, 0.6);
            g.fillCircle(e.sprite.x + Math.cos(a) * 58, e.sprite.y + Math.sin(a) * 58, 3);
          }
        } else if (e.move === 'fan' || e.move === 'breath')
          this.context.effects.cone(
            g,
            e.sprite,
            angle,
            240,
            e.move === 'breath' ? 0.55 : 0.6,
            0xf0968c,
            0.13,
          );
        else if (e.move === 'slash' || e.move === 'combo')
          this.context.effects.cone(
            g,
            e.sprite,
            angle,
            e.kind === 'boss' ? 143 : 92,
            1.2,
            0xf08c85,
            0.15,
          );
        else {
          g.lineStyle(3, 0xf0968c, 0.65);
          g.lineBetween(
            e.sprite.x,
            e.sprite.y,
            e.sprite.x + e.aim.x * 240,
            e.sprite.y + e.aim.y * 240,
          );
          g.strokeCircle(e.sprite.x, e.sprite.y, e.radius + 8);
        }
      }
      if (e.hp < e.maxHP && e.kind !== 'boss' && e.region === worldState.regionIndex) {
        g.fillStyle(0x102a22, 0.8);
        g.fillRect(e.sprite.x - 22, e.sprite.y - e.radius - 28, 44, 4);
        g.fillStyle(0xcc9e9a, 0.9);
        g.fillRect(e.sprite.x - 22, e.sprite.y - e.radius - 28, (44 * e.hp) / e.maxHP, 4);
      }
      if (e.kind === 'boss') {
        g.lineStyle(2, 0xd9bda5, 0.55);
        g.strokeCircle(e.sprite.x, e.sprite.y, e.radius + 14);
        const y = e.sprite.y - 58;
        g.lineStyle(2, 0xdfc7a2, 0.8);
        g.beginPath();
        g.moveTo(e.sprite.x - 13, y);
        g.lineTo(e.sprite.x - 12, y - 10);
        g.lineTo(e.sprite.x - 5, y - 5);
        g.lineTo(e.sprite.x, y - 15);
        g.lineTo(e.sprite.x + 5, y - 5);
        g.lineTo(e.sprite.x + 12, y - 10);
        g.lineTo(e.sprite.x + 13, y);
        g.strokePath();
      }
    }
    for (const p of worldState.projectiles) {
      const angle = Math.atan2(p.vy, p.vx),
        size = p.visual === 'shot-bone' ? 49 : p.visual === 'shot-bat' ? 57 : 44;
      this.context.effects.drawCombatImage(
        p.visual,
        p.x,
        p.y,
        size * (1 + Math.sin(t * 17 + p.x * 0.01) * 0.09),
        angle,
        0.96,
      );
      g.lineStyle(2, p.color, 0.28);
      g.lineBetween(p.x, p.y, p.x - p.vx * 0.07, p.y - p.vy * 0.07);
    }
    for (const c of worldState.coins) {
      const visible =
        c.region === worldState.regionIndex &&
        (worldState.area === 'biome' || worldState.area === 'tutorial');
      c.sprite.setVisible(visible);
      if (!visible) continue;
      c.sprite
        .setAngle(Math.sin(t * 2 + c.phase) * 9)
        .setScale(45 / 128, (45 / 128) * (0.88 + Math.sin(t * 3 + c.phase) * 0.1));
      g.lineStyle(1, 0xbef2e7, 0.2);
      g.strokeCircle(c.sprite.x, c.sprite.y, 22 + Math.sin(t * 2 + c.phase) * 3);
    }
    for (const c of worldState.chests) {
      c.sprite.setVisible(c.region === worldState.regionIndex && worldState.area === 'biome');
      if (c.opened || !c.sprite.visible) continue;
      g.lineStyle(1, 0xd8c4f0, 0.5 + Math.sin(t * 4) * 0.2);
      g.strokeCircle(c.x, c.y, 35 + Math.sin(t * 2) * 2);
    }
    for (const q of worldState.questProps) {
      q.sprite.setAngle(Math.sin(t * 2 + q.order) * 3);
      g.lineStyle(2, 0xe6ca86, 0.55);
      g.strokeCircle(q.point.x, q.point.y, 31 + Math.sin(t * 3) * 3);
    }
    if (worldState.wisp) {
      g.lineStyle(1, 0xf9d491, 0.3);
      g.strokeCircle(worldState.wisp.x, worldState.wisp.y, 155);
    }
    worldState.fires.forEach((f, i) => f.setAlpha(0.83 + Math.sin(t * 9 + i) * 0.14));
    this.context.weather.drawWeather();
    for (let i = visuals.attackImageCursor; i < visuals.attackImages.length; i++)
      visuals.attackImages[i].setVisible(false);
    this.context.tutorial.updateTeachingUI();
  }
  drawGates(): void {
    const { worldState, journey, visuals } = this.context;
    const g = visuals.gateInk;
    g.clear();
    if (!journey.progress.length || worldState.area !== 'biome') return;
    const i = worldState.regionIndex,
      p = journey.progress[i],
      color = REGIONS[i].fog,
      left = regionStart(i) + 30,
      right = regionEnd(i) - 30;
    const wall = (x: number) => {
      g.fillStyle(color, 0.18);
      g.fillRect(x - 34, 65, 68, WORLD_HEIGHT - 100);
      g.lineStyle(3, color, 0.48);
      g.lineBetween(x, 65, x, WORLD_HEIGHT - 35);
      for (let n = 0; n < 25; n++) {
        const y = 65 + n * 42,
          drift = Math.sin(visuals.animationTime * 1.2 + n * 1.8) * 14;
        g.fillStyle(color, 0.1 + (0.08 * (1 + Math.sin(n + visuals.animationTime))) / 2);
        g.fillEllipse(x + drift, y, 65 + Math.sin(n) * 17, 82);
      }
      g.lineStyle(2, 0xdfe3d0, 0.45);
      g.strokeCircle(x, 550, 28);
      g.beginPath();
      g.moveTo(x - 12, 550);
      g.lineTo(x, 532);
      g.lineTo(x + 12, 550);
      g.lineTo(x, 568);
      g.closePath();
      g.strokePath();
    };
    if (!p.bossDead) {
      g.fillStyle(0x0a2226, 0.42);
      g.fillRect(0, 0, Math.max(0, left), WORLD_HEIGHT);
      wall(left);
    }
    if (!p.cleared) {
      g.fillStyle(color, 0.1);
      g.fillRect(right, 0, WORLD_WIDTH - right, WORLD_HEIGHT);
      wall(right);
    }
  }
}
