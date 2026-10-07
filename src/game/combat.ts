import { armorFor, weaponFor, ATTRIBUTE_GAIN, type Profile } from './progression';
import type { Point } from './world';
import type { SkillId } from './skills';
export const DODGE_TIME = .27;
export const DODGE_COST = 25;
export const HURT_PROTECTION = .62;
export const FLASK_HEAL = 38;
export const POTION_HEAL = 55;
export const ULTIMATE_MAX = 100;
// Единый множитель действует на обычные удары, приёмы, кровотечение и абсолютные атаки.
export const PLAYER_DAMAGE_SCALE = .85;
export function stats(p: Profile) {
  const u = p.upgrades, a = armorFor(p), w = weaponFor(p);
  return { maxHP: 100 + u.vitality * 15 + p.healthLevel * ATTRIBUTE_GAIN, maxStamina: 100 + u.focus * 15 + p.enduranceLevel * ATTRIBUTE_GAIN + a.stamina,
    speed: 250 * (1 + u.speed * .06) * a.speed, damage: 26 * PLAYER_DAMAGE_SCALE * (1 + u.power * .12) * w.damage,
    armor: Math.max(.45, (1 - a.reduction) * (1 - u.armor * .06)), ward: Math.max(.35, (1 - a.ward) * (1 - u.ward * .12) * (p.relics.includes('emberseal')?.82:1)),
    staminaRegen: 29 * (1 + u.focus * .10 + p.enduranceLevel * .03) * a.regen, dodgeCooldown: .95 - u.dash * .1, flasks: 2 + u.flask };
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

export function skillAttack(id:SkillId){
 const common={reach:150,arc:.85,cost:30,windup:.2,activeEnd:.40,duration:.70,multiplier:1.6,step:0,pulses:1};
 const specs:Record<SkillId,typeof common>={
  sword_cross:{...common,cost:28,windup:.13,activeEnd:.40,duration:.65,multiplier:.95,pulses:2},
  sword_lunge:{...common,cost:30,reach:160,arc:.42,multiplier:1.8,step:100},
  sword_storm:{...common,cost:45,reach:175,arc:1.3,windup:.20,activeEnd:.68,duration:.96,multiplier:.9,pulses:3},
  spear_pierce:{...common,cost:26,reach:220,arc:.25,multiplier:1.5},
  spear_retreat:{...common,cost:32,reach:270,arc:.28,multiplier:1.75,step:-65},
  spear_comet:{...common,cost:46,reach:330,arc:.20,windup:.30,activeEnd:.47,duration:.90,multiplier:2.4,step:60},
  axe_cleave:{...common,cost:36,reach:160,arc:.42,windup:.42,activeEnd:.58,duration:.98,multiplier:2.15},
  axe_leap:{...common,cost:42,reach:138,arc:Math.PI,windup:.38,activeEnd:.60,duration:1.02,multiplier:1.7,step:100},
  axe_fault:{...common,cost:50,reach:280,arc:.28,windup:.52,activeEnd:.72,duration:1.20,multiplier:2.75},
  staff_fan:{...common,cost:30,reach:420,arc:.28,windup:.20,activeEnd:.34,multiplier:.8},
  staff_ward:{...common,cost:38,reach:130,arc:Math.PI,windup:.22,activeEnd:.40,duration:.78,multiplier:1.3},
  staff_star:{...common,cost:50,reach:420,arc:Math.PI,windup:.38,activeEnd:.54,duration:.96,multiplier:3.4},
 };
 return specs[id];
}
