import { type Point, clearLine } from '../world/Navigation';
import { type BossStrike, bossStrikeHits } from '../enemies/BossPatterns';
import { type Enemy } from '../enemies/EnemyTypes';
import { REGIONS } from '../world/WorldConfig';
import { PLAYER_RADIUS } from './CombatRules';
import { weaponFor } from '../progression/PlayerProgression';
import Phaser from 'phaser';
import type { GameScene } from '../GameScene';

/** Снаряды, опасные зоны, боевые эффекты и сообщения над персонажами. */
export type Projectile = Point & {
  vx: number;
  vy: number;
  life: number;
  damage: number;
  region: number;
  friendly: boolean;
  color: number;
  radius: number;
  blast: number;
  visual: string;
  hits: Set<number>;
};
export type Hazard = Point & {
  region: number;
  radius: number;
  warning: number;
  left: number;
  damage: number;
  kind: 'poison' | 'meteor' | 'ring' | 'sigil' | 'wave' | 'curse' | 'boss';
  fired: boolean;
  environment?: boolean;
  bossStrike?: BossStrike;
  ownerId?: number;
};
export class CombatEffects {
  constructor(private readonly context: GameScene) {}
  particles(x: number, y: number, count: number, color: number): void {
    const { visuals } = this.context;
    count = Math.min(count, Math.max(0, 70 - visuals.liveParticles));
    for (let i = 0; i < count; i++) {
      visuals.liveParticles++;
      const a = Math.random() * Math.PI * 2,
        d = 15 + Math.random() * 50,
        dot = this.context.add.circle(x, y, 2 + Math.random() * 2, color, 0.9).setDepth(600);
      this.context.tweens.add({
        targets: dot,
        x: x + Math.cos(a) * d,
        y: y + Math.sin(a) * d,
        alpha: 0,
        scale: 0.2,
        duration: 250 + Math.random() * 220,
        onComplete: () => {
          dot.destroy();
          visuals.liveParticles--;
        },
      });
    }
  }
  popup(x: number, y: number, text: string, color: string): void {
    const label = this.context.add
      .text(x, y - 35, text, {
        fontFamily: 'system-ui',
        fontSize: '17px',
        fontStyle: 'bold',
        color,
        stroke: '#203329',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(650);
    this.context.tweens.add({
      targets: label,
      y: y - 85,
      alpha: 0,
      duration: 700,
      onComplete: () => label.destroy(),
    });
  }
  enemyProjectile(e: Enemy): string {
    const kind = e.kind === 'boss' ? REGIONS[e.region].bossTexture : e.kind;
    return e.move === 'breath' || kind === 'dragon'
      ? 'shot-fire'
      : kind === 'vampire'
        ? 'shot-bat'
        : kind === 'alchemist' || kind === 'zombie'
          ? 'shot-acid'
          : kind === 'skeleton' || kind === 'archer'
            ? 'shot-bone'
            : kind === 'knight' && e.region === 4
              ? 'shot-ice'
              : kind === 'wraith' || kind === 'shade'
                ? 'shot-shadow'
                : 'shot-violet';
  }
  drawCombatImage(key: string, x: number, y: number, size: number, angle = 0, alpha = 1): void {
    const { visuals } = this.context;
    let image = visuals.attackImages[visuals.attackImageCursor];
    if (!image) {
      image = this.context.add.image(x, y, key).setDepth(510);
      visuals.attackImages.push(image);
    }
    visuals.attackImageCursor++;
    image
      .setTexture(key)
      .setVisible(true)
      .setPosition(x, y)
      .setDisplaySize(size, size)
      .setRotation(angle)
      .setAlpha(Math.max(0, Math.min(1, alpha)))
      .clearTint();
  }
  weatherHitEnemies(at: Point, radius: number, damage: number): void {
    const { worldState } = this.context;
    for (const e of worldState.enemies)
      if (
        !e.dead &&
        e.region === worldState.regionIndex &&
        Math.hypot(e.sprite.x - at.x, e.sprite.y - at.y) < radius + e.radius
      ) {
        e.hp = Math.max(0, e.hp - damage);
        e.flash = 0.2;
        e.stun = Math.max(e.stun, e.kind === 'boss' ? 0.25 : 0.6);
        if (e.hp === 0) this.context.combat.killEnemy(e);
      }
  }
  shoot(
    from: Point,
    angle: number,
    speed: number,
    damage: number,
    friendly: boolean,
    region: number,
    color: number,
    blast: number,
    visual = friendly ? 'shot-spirit' : 'shot-violet',
  ): void {
    const { worldState } = this.context;
    worldState.projectiles.push({
      x: from.x + Math.cos(angle) * 25,
      y: from.y + Math.sin(angle) * 25,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: friendly ? 0.86 : 2.8,
      damage,
      region,
      friendly,
      color,
      radius: friendly ? 8 : 7,
      blast,
      visual,
      hits: new Set(),
    });
  }
  updateProjectiles(dt: number): void {
    const { worldState, visuals } = this.context;
    for (const p of worldState.projectiles) {
      p.life -= dt;
      const before = { x: p.x, y: p.y };
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (
        !clearLine(
          before,
          p,
          3,
          worldState.terrainByRegion[p.region],
          this.context.world.regionBounds(p.region),
        )
      )
        p.life = 0;
      if (p.life <= 0) continue;
      if (p.friendly) {
        const target = worldState.enemies.find(
          (e) =>
            !e.dead &&
            e.region === p.region &&
            !p.hits.has(e.id) &&
            Math.hypot(e.sprite.x - p.x, e.sprite.y - p.y) < e.radius + p.radius,
        );
        if (target) {
          p.hits.add(target.id);
          this.context.combat.hitEnemy(target, p.damage, 22);
          if (p.blast > 0) {
            this.particles(p.x, p.y, 12, p.color);
            for (const e of worldState.enemies)
              if (
                e !== target &&
                !e.dead &&
                e.region === p.region &&
                Math.hypot(e.sprite.x - p.x, e.sprite.y - p.y) < p.blast + e.radius &&
                clearLine(
                  p,
                  e.sprite,
                  3,
                  worldState.terrainByRegion[p.region],
                  this.context.world.regionBounds(p.region),
                )
              )
                this.context.combat.hitEnemy(e, p.damage * 0.7, 18);
          }
          p.life = 0;
        }
      } else if (
        Math.hypot(p.x - visuals.player.x, p.y - visuals.player.y) <
        PLAYER_RADIUS + p.radius
      ) {
        this.context.player.damagePlayer(p.damage, p, true);
        p.life = 0;
      }
    }
    worldState.projectiles = worldState.projectiles.filter((p) => p.life > 0);
  }
  updateHazards(dt: number): void {
    const { hero, worldState, journey, visuals } = this.context;
    for (const h of worldState.hazards) {
      if (h.left <= 0) continue;
      h.left -= dt;
      const before = h.warning;
      h.warning -= dt;
      if (h.warning > 0) continue;
      if (h.kind === 'boss') {
        const owner = worldState.enemies.find((e) => e.id === h.ownerId),
          attack = h.bossStrike;
        if (!owner || owner.dead || !attack) {
          h.left = 0;
          continue;
        }
        if (!h.fired) {
          h.fired = true;
          this.particles(h.x, h.y, 4, REGIONS[h.region].fog);
          if (
            worldState.area === 'biome' &&
            h.region === worldState.regionIndex &&
            bossStrikeHits(attack, visuals.player, PLAYER_RADIUS)
          ) {
            const before = hero.hp;
            this.context.player.damagePlayer(
              h.damage,
              attack.physical ? owner.sprite : h,
              !attack.physical,
              owner,
            );
            if (owner.region === 2 && before > hero.hp)
              owner.hp = Math.min(owner.maxHP, owner.hp + (before - hero.hp) * 0.5);
          }
        }
        continue;
      }
      if (h.kind === 'sigil' && !h.fired) {
        h.fired = true;
        this.addEffect('ring', h, weaponFor(journey.profile).color, h.radius);
        for (const e of worldState.enemies)
          if (
            !e.dead &&
            e.region === h.region &&
            Math.hypot(e.sprite.x - h.x, e.sprite.y - h.y) < h.radius + e.radius &&
            clearLine(
              h,
              e.sprite,
              3,
              this.context.world.activeTerrain(),
              this.context.world.playerBounds(),
            )
          )
            this.context.combat.hitEnemy(e, h.damage, 40);
      }
      if (h.kind === 'meteor' && !h.fired) {
        h.fired = true;
        this.context.audio.play('meteor');
        this.particles(h.x, h.y, 14, 0xffc699);
        if (h.environment) this.weatherHitEnemies(h, h.radius, h.damage * 0.8);
        if (Math.hypot(h.x - visuals.player.x, h.y - visuals.player.y) < h.radius + PLAYER_RADIUS)
          this.context.player.damagePlayer(h.damage, h, true);
      }
      if (
        (h.kind === 'poison' || h.kind === 'curse') &&
        h.left > 0 &&
        Math.hypot(h.x - visuals.player.x, h.y - visuals.player.y) < h.radius + PLAYER_RADIUS
      )
        this.context.player.damagePlayer(h.damage, h, true);
      if (h.kind === 'wave') {
        h.radius += 180 * dt;
        const d = Math.hypot(h.x - visuals.player.x, h.y - visuals.player.y);
        if (!h.fired && Math.abs(d - h.radius) < PLAYER_RADIUS + 12) {
          this.context.player.damagePlayer(h.damage, h, true);
          if (hero.hurtLeft > 0) h.fired = true;
        }
      }
      if (before > 0 && h.kind === 'ring') h.fired = true;
    }
    worldState.hazards = worldState.hazards.filter((h) => h.left > 0);
  }
  cone(
    g: Phaser.GameObjects.Graphics,
    at: Point,
    angle: number,
    radius: number,
    arc: number,
    color: number,
    alpha: number,
  ): void {
    const points: Point[] = [{ x: at.x, y: at.y }];
    for (let n = 0; n <= 14; n++) {
      const a = angle - arc + (n / 14) * arc * 2;
      points.push({
        x: at.x + Math.cos(a) * radius,
        y: at.y + Math.sin(a) * radius,
      });
    }
    g.fillStyle(color, alpha);
    g.fillPoints(
      points.map((p) => new Phaser.Math.Vector2(p.x, p.y)),
      true,
    );
    g.lineStyle(2, color, Math.min(0.9, alpha * 4));
    g.beginPath();
    g.arc(at.x, at.y, radius, angle - arc, angle + arc, false);
    g.strokePath();
  }
  addEffect(
    kind: 'slash' | 'ring' | 'thrust',
    at: Point,
    color: number,
    radius: number,
    angle = this.context.hero.face,
  ): void {
    const { visuals } = this.context;
    visuals.effects.push({
      x: at.x,
      y: at.y,
      kind,
      color,
      radius,
      angle,
      life: 0.32,
      max: 0.32,
    });
  }
}
