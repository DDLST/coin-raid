import type { Profile } from './progression';
import type { Point } from './world';
export const ATTACK_WINDUP = .095;
export const ATTACK_ACTIVE_END = .25;
export const ATTACK_DURATION = .48;
export const ATTACK_REACH = 100;
export const ATTACK_COST = 18;
export const DODGE_TIME = .26;
export const DODGE_COST = 25;
export const HURT_PROTECTION = .75;
export const FLASK_HEAL = 45;
export function stats(profile: Profile) {
  const u = profile.upgrades;
  return { maxHP: 100 + u.vitality * 15, maxStamina: 100 + u.focus * 15,
    speed: 250 * (1 + u.speed * .06), damage: 24 * (1 + u.power * .20),
    armor: 1 - u.armor * .08, staminaRegen: 34 * (1 + u.focus * .10),
    dodgeCooldown: .9 - u.dash * .1, flasks: 2 + u.flask };
}
export function slashConnects(from: Point, angle: number, target: Point, radius: number): boolean {
  const x = target.x - from.x, y = target.y - from.y;
  const delta = Math.atan2(Math.sin(Math.atan2(y, x) - angle), Math.cos(Math.atan2(y, x) - angle));
  return Math.hypot(x, y) <= ATTACK_REACH + radius && Math.abs(delta) < 1.15;
}
