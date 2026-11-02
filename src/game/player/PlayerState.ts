import { GAME_CONFIG, PLAYER_CONFIG } from '../Constants';
import { type SkillId } from '../progression/Skills';
import { type Point } from '../world/Navigation';

/** Текущее состояние героя. Максимумы вычисляются в CombatRules.stats. */
export class PlayerState {
  // Ресурсы героя. Формулы максимумов и лечения задаются в CombatRules.
  hp: number = PLAYER_CONFIG.baseHP;
  stamina: number = PLAYER_CONFIG.baseStamina;
  flasks: number = GAME_CONFIG.initialFlasks;
  armed = false;
  ultimate = 0;
  ultimateLeft = 0;
  ultimatePulse = 0;
  ultimateAngle = 0;

  // Боевые окна и выбранные действия.
  guardLeft = 0;
  heavyAttack = false;
  counterTarget = -1;
  counterLeft = 0;
  counterStrike = false;
  strikeTarget = -1;
  activeSkill: SkillId | null = null;
  attackPulse = -1;
  skillCooldowns: Partial<Record<SkillId, number>> = {};
  shieldLeft = 0;
  face = 0;
  velocity: Point = { x: 0, y: 0 };
  movement: Point = { x: 1, y: 0 };
  attackTime = -1;
  attackAngle = 0;
  attackFired = false;
  attackHits = new Set<number>();
  combo = 0;
  lastAttack = -10;
  dodgeLeft = 0;
  dodgeWait = 0;
  dodgeVector: Point = { x: 1, y: 0 };
  hurtLeft = 0;
  hurtFlash = 0;
  regenDelay = 0;
  healWait = 0;
  deathLeft = 0;
  slowed = 0;
  strideDistance = 0;

  reset(): void {
    Object.assign(this, new PlayerState());
  }
}
