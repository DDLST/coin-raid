import { TUTORIAL_CONFIG } from '../Constants';
import { type Point } from '../world/Navigation';

export function lessonPoint(
  index: number,
  player: Point,
  coins: Point[],
  enemies: Point[],
  door: Point,
  npc: Point,
  inside: boolean,
): Point | null {
  const nearest = (points: Point[]) =>
    [...points].sort(
      (a, b) =>
        Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y),
    )[0] ?? null;
  return index === 0
    ? { ...TUTORIAL_CONFIG.waypoint }
    : index === 1
      ? nearest(coins)
      : index === 2 || index === 3 || index === 10
        ? nearest(enemies)
        : index === 9
          ? inside
            ? npc
            : door
          : null;
}
