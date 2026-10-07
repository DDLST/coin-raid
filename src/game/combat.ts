import { armorFor, weaponFor, type Profile } from './progression';
import type { Point } from './world';
export const DODGE_TIME = .27;
export const DODGE_COST = 25;
export const HURT_PROTECTION = .62;
export const FLASK_HEAL = 38;
export const ULTIMATE_MAX = 100;
export function stats(p: Profile) {
  const u = p.upgrades, a = armorFor(p), w = weaponFor(p);
  return { maxHP: 100 + u.vitality * 15, maxStamina: 100 + u.focus * 15 + a.stamina,
    speed: 250 * (1 + u.speed * .06) * a.speed, damage: 26 * (1 + u.power * .12) * w.damage,
    armor: Math.max(.45, (1 - a.reduction) * (1 - u.armor * .06)), ward: Math.max(.35, (1 - a.ward) * (1 - u.ward * .12) * (p.relics.includes('emberseal')?.82:1)),
    staminaRegen: 29 * (1 + u.focus * .10) * a.regen, dodgeCooldown: .95 - u.dash * .1, flasks: 2 + u.flask };
}
export function slashConnects(from: Point, angle: number, target: Point, radius: number, reach: number, arc: number): boolean {
  const x = target.x - from.x, y = target.y - from.y;
  const delta = Math.atan2(Math.sin(Math.atan2(y, x) - angle), Math.cos(Math.atan2(y, x) - angle));
  return Math.hypot(x, y) <= reach + radius && Math.abs(delta) <= arc;
}

export function attackSpec(p:Profile,heavy:boolean,combo=0){
 const w=weaponFor(p);
 if(!heavy)return{reach:w.reach+(w.style==='sword'&&combo===2?16:0),arc:w.arc,cost:w.cost,windup:w.windup,activeEnd:w.activeEnd,duration:w.duration,multiplier:[1,1.08,1.35][combo],step:0};
 const specs={sword:{reach:w.reach,arc:w.arc,cost:12,windup:0,activeEnd:.22,duration:.38,multiplier:0,step:0},spear:{reach:235,arc:.25,cost:34,windup:.25,activeEnd:.38,duration:.80,multiplier:1.65,step:65},axe:{reach:152,arc:Math.PI,cost:43,windup:.48,activeEnd:.62,duration:1.05,multiplier:1.5,step:0},staff:{reach:340,arc:Math.PI,cost:35,windup:.32,activeEnd:.45,duration:.88,multiplier:2.1,step:0}};
 return specs[w.style];
}
