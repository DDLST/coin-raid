import { armorFor, weaponFor, type Profile } from './progression';
import type { Point } from './world';
export const DODGE_TIME = .27;
export const DODGE_COST = 25;
export const HURT_PROTECTION = .62;
export const FLASK_HEAL = 45;
export const ULTIMATE_MAX = 100;
export function stats(p: Profile) {
  const u = p.upgrades, a = armorFor(p), w = weaponFor(p);
  return { maxHP: 100 + u.vitality * 15, maxStamina: 100 + u.focus * 15 + a.stamina,
    speed: 250 * (1 + u.speed * .06) * a.speed, damage: 26 * (1 + u.power * .20) * w.damage,
    armor: Math.max(.45, (1 - a.reduction) * (1 - u.armor * .06)), ward: Math.max(.35, (1 - a.ward) * (1 - u.ward * .12)),
    staminaRegen: 32 * (1 + u.focus * .10) * a.regen, dodgeCooldown: .95 - u.dash * .1, flasks: 2 + u.flask };
}
export function slashConnects(from: Point, angle: number, target: Point, radius: number, reach: number, arc: number): boolean {
  const x = target.x - from.x, y = target.y - from.y;
  const delta = Math.atan2(Math.sin(Math.atan2(y, x) - angle), Math.cos(Math.atan2(y, x) - angle));
  return Math.hypot(x, y) <= reach + radius && Math.abs(delta) <= arc;
}
