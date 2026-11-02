import Phaser from 'phaser';
import { type GameScene } from '../GameScene';
import { type Point } from '../world/Navigation';

/** Частицы, подписи, геометрия и пул изображений боевых эффектов. */
export class CombatEffectRenderer {
  constructor(private readonly context: GameScene) {}

  private readonly temporary = new Set<Phaser.GameObjects.GameObject>();
  private liveParticles = 0;

  particles(x: number, y: number, count: number, color: number): void {
    count = Math.min(count, Math.max(0, 70 - this.liveParticles));
    for (let i = 0; i < count; i++) {
      this.liveParticles++;
      const a = Math.random() * Math.PI * 2;
      const d = 15 + Math.random() * 50;
      const dot = this.context.add.circle(x, y, 2 + Math.random() * 2, color, 0.9).setDepth(600);
      this.temporary.add(dot);
      this.context.tweens.add({
        targets: dot,
        x: x + Math.cos(a) * d,
        y: y + Math.sin(a) * d,
        alpha: 0,
        scale: 0.2,
        duration: 250 + Math.random() * 220,
        onComplete: () => {
          this.temporary.delete(dot);
          dot.destroy();
          this.liveParticles--;
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
    this.temporary.add(label);
    this.context.tweens.add({
      targets: label,
      y: y - 85,
      alpha: 0,
      duration: 700,
      onComplete: () => {
        this.temporary.delete(label);
        label.destroy();
      },
    });
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

  updateEffects(dt: number): void {
    this.context.visuals.effects = this.context.visuals.effects.filter((effect) => {
      effect.life -= dt;
      return effect.life > 0;
    });
  }

  reset(): void {
    for (const object of this.temporary) {
      this.context.tweens.killTweensOf(object);
      object.destroy();
    }
    this.temporary.clear();
    this.liveParticles = 0;
    this.context.visuals.effects = [];
  }
}
