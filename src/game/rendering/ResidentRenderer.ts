import { RESIDENT_FUR_COLORS } from '../Constants';
import { type GameScene } from '../GameScene';

/** Положение, дыхание и приветствия жителей деревень. */
export class ResidentRenderer {
  constructor(private readonly context: GameScene) {}

  draw(): void {
    const { worldState, visuals } = this.context;
    const t = visuals.animationTime;
    const fur = RESIDENT_FUR_COLORS;
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
      if (this.context.flow.state === 'playing' && distance < 195 && !n.near) {
        n.near = true;
        n.greetUntil = t + 1.8;
      }
      if (distance > 260) {
        n.near = false;
      }
      if (n.greetUntil <= t) {
        continue;
      }
      const species = Number(n.sprite.texture.key.split('-')[1]);
      const side = visuals.player.x < at.x ? -1 : 1;
      const elbow = { x: at.x + side * 23, y: at.y - 5 };
      const hand = {
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
}
