import {
  ATTRIBUTE_GAIN,
  COMBO_DAMAGE_MULTIPLIERS,
  GAME_CONFIG,
  HEAVY_ATTACKS,
  PLAYER_CONFIG,
  PLAYER_DAMAGE_SCALE,
  SKILL_ATTACKS,
} from '../Constants';
import { armorFor, type Profile, weaponFor } from '../progression/PlayerProgression';
import { type SkillId } from '../progression/Skills';
import { type Point } from '../world/Navigation';

// Единый множитель действует на обычные удары, приёмы, кровотечение и абсолютные атаки.

export function stats(p: Profile) {
  const u = p.upgrades;
  const a = armorFor(p);
  const w = weaponFor(p);
  return {
    maxHP:
      PLAYER_CONFIG.baseHP +
      u.vitality * PLAYER_CONFIG.resourceUpgradeGain +
      p.healthLevel * ATTRIBUTE_GAIN,
    maxStamina:
      PLAYER_CONFIG.baseStamina +
      u.focus * PLAYER_CONFIG.resourceUpgradeGain +
      p.enduranceLevel * ATTRIBUTE_GAIN +
      a.stamina,
    speed: PLAYER_CONFIG.speed * (1 + u.speed * PLAYER_CONFIG.speedUpgradeScale) * a.speed,
    damage:
      PLAYER_CONFIG.damage *
      PLAYER_DAMAGE_SCALE *
      (1 + u.power * PLAYER_CONFIG.damageUpgradeScale) *
      w.damage,
    armor: Math.max(
      PLAYER_CONFIG.minArmorScale,
      (1 - a.reduction) * (1 - u.armor * PLAYER_CONFIG.armorUpgradeScale),
    ),
    ward: Math.max(
      PLAYER_CONFIG.minWardScale,
      (1 - a.ward) *
        (1 - u.ward * PLAYER_CONFIG.wardUpgradeScale) *
        (p.relics.includes('emberseal') ? PLAYER_CONFIG.embersealWardScale : 1),
    ),
    staminaRegen:
      PLAYER_CONFIG.staminaRegen *
      (1 +
        u.focus * PLAYER_CONFIG.focusRegenScale +
        p.enduranceLevel * PLAYER_CONFIG.enduranceRegenScale) *
      a.regen,
    dodgeCooldown: PLAYER_CONFIG.dodgeCooldown - u.dash * PLAYER_CONFIG.dodgeUpgradeReduction,
    flasks: GAME_CONFIG.initialFlasks + u.flask,
  };
}
export function slashConnects(
  from: Point,
  angle: number,
  target: Point,
  radius: number,
  reach: number,
  arc: number,
): boolean {
  const x = target.x - from.x;
  const y = target.y - from.y;
  const delta = Math.atan2(Math.sin(Math.atan2(y, x) - angle), Math.cos(Math.atan2(y, x) - angle));
  return Math.hypot(x, y) <= reach + radius && Math.abs(delta) <= arc;
}

export function attackSpec(p: Profile, heavy: boolean, combo = 0) {
  const w = weaponFor(p);
  if (!heavy) {
    return {
      reach: w.reach + (w.style === 'sword' && combo === 2 ? 16 : 0),
      arc: w.arc,
      cost: w.cost,
      windup: w.windup,
      activeEnd: w.activeEnd,
      duration: w.duration,
      multiplier: COMBO_DAMAGE_MULTIPLIERS[combo],
      step: 0,
    };
  }
  const parameters = HEAVY_ATTACKS[w.style];
  return w.style === 'sword' ? { ...parameters, reach: w.reach, arc: w.arc } : parameters;
}

export function skillAttack(id: SkillId) {
  return SKILL_ATTACKS[id];
}
