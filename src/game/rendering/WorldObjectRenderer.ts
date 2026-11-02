import { METEOR_WARNING } from '../Constants';
import { type GameScene } from '../GameScene';
import { weaponFor } from '../progression/PlayerProgression';
import { setBiomeMood } from './Atmosphere';

/** Изображения опасных зон, снарядов, наград и предметов мира. */
export class WorldObjectRenderer {
  constructor(private readonly context: GameScene) {}

  drawBiomeMoods(): void {
    const { worldState, journey } = this.context;
    for (let i = 0; i < worldState.biomeMoods.length; i++) {
      if (worldState.biomeMoods[i]) {
        setBiomeMood(
          worldState.biomeMoods[i],
          journey.progress[i]?.cleared === true,
          worldState.area === 'interior',
        );
      }
    }
  }

  drawHazards(): void {
    const { worldState, journey, visuals } = this.context;
    const t = visuals.animationTime;
    const g = visuals.combatInk;
    for (const h of worldState.hazards) {
      if (h.kind === 'boss' && h.bossStrike) {
        this.context.bosses.drawBossStrike(h.bossStrike, h.warning > 0, h.left);
        continue;
      }
      const warning = h.warning > 0;
      const color =
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
      if (h.kind !== 'wave') {
        g.fillCircle(h.x, h.y, h.radius);
      }
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
  }

  drawProjectiles(): void {
    const { worldState, visuals } = this.context;
    const t = visuals.animationTime;
    const g = visuals.combatInk;
    for (const p of worldState.projectiles) {
      const angle = Math.atan2(p.vy, p.vx);
      const size = p.visual === 'shot-bone' ? 49 : p.visual === 'shot-bat' ? 57 : 44;
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
  }

  drawCollectibles(): void {
    const { worldState, visuals } = this.context;
    const t = visuals.animationTime;
    const g = visuals.combatInk;
    for (const c of worldState.coins) {
      const visible =
        c.region === worldState.regionIndex &&
        (worldState.area === 'biome' || worldState.area === 'tutorial');
      c.sprite.setVisible(visible);
      if (!visible) {
        continue;
      }
      c.sprite
        .setAngle(Math.sin(t * 2 + c.phase) * 9)
        .setScale(45 / 128, (45 / 128) * (0.88 + Math.sin(t * 3 + c.phase) * 0.1));
      g.lineStyle(1, 0xbef2e7, 0.2);
      g.strokeCircle(c.sprite.x, c.sprite.y, 22 + Math.sin(t * 2 + c.phase) * 3);
    }
    for (const c of worldState.chests) {
      c.sprite.setVisible(c.region === worldState.regionIndex && worldState.area === 'biome');
      if (c.opened || !c.sprite.visible) {
        continue;
      }
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
  }
}
