import { REGIONS, WORLD_HEIGHT, WORLD_WIDTH } from '../Constants';
import { type GameScene } from '../GameScene';
import { regionEnd, regionStart } from '../world/WorldLayout';
import { EnemyRenderer } from './EnemyRenderer';
import { HeroRenderer } from './HeroRenderer';
import { ResidentRenderer } from './ResidentRenderer';
import { WorldObjectRenderer } from './WorldObjectRenderer';

/** Задаёт порядок отрисовки акторов и туманных границ биома. */
export class ActorRenderer {
  private readonly hero: HeroRenderer;
  private readonly enemies: EnemyRenderer;
  private readonly residents: ResidentRenderer;
  private readonly objects: WorldObjectRenderer;
  constructor(private readonly context: GameScene) {
    this.hero = new HeroRenderer(context);
    this.enemies = new EnemyRenderer(context);
    this.residents = new ResidentRenderer(context);
    this.objects = new WorldObjectRenderer(context);
  }
  hideArms(): void {
    this.hero.hideArms();
  }
  drawActors(): void {
    const { visuals } = this.context;
    const frame = this.hero.drawBody();
    this.residents.draw();
    this.objects.drawBiomeMoods();
    visuals.attackImageCursor = 0;
    visuals.combatInk.clear();
    this.hero.drawOverlays(frame);
    this.objects.drawHazards();
    this.enemies.draw();
    this.objects.drawProjectiles();
    this.objects.drawCollectibles();
    this.context.weather.drawWeather();
    for (let i = visuals.attackImageCursor; i < visuals.attackImages.length; i++) {
      visuals.attackImages[i].setVisible(false);
    }
    this.context.tutorial.updateTeachingUI();
  }
  drawGates(): void {
    const { worldState, journey, visuals } = this.context;
    const g = visuals.gateInk;
    g.clear();
    if (!journey.progress.length || worldState.area !== 'biome') {
      return;
    }
    const i = worldState.regionIndex;
    const p = journey.progress[i];
    const color = REGIONS[i].fog;
    const left = regionStart(i) + 30;
    const right = regionEnd(i) - 30;
    const wall = (x: number) => {
      g.fillStyle(color, 0.18);
      g.fillRect(x - 34, 65, 68, WORLD_HEIGHT - 100);
      g.lineStyle(3, color, 0.48);
      g.lineBetween(x, 65, x, WORLD_HEIGHT - 35);
      for (let n = 0; n < 25; n++) {
        const y = 65 + n * 42;
        const drift = Math.sin(visuals.animationTime * 1.2 + n * 1.8) * 14;
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
