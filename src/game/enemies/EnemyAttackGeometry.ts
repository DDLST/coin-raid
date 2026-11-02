import { ENEMY_ATTACK_CONFIG } from '../Constants';
import { type EnemyAttack, type EnemyKind } from '../world/WorldLayout';

export function enemyMeleeReach(kind: EnemyKind): number {
  return kind === 'zombie'
    ? ENEMY_ATTACK_CONFIG.zombieReach
    : kind === 'knight'
      ? ENEMY_ATTACK_CONFIG.knightReach
      : ENEMY_ATTACK_CONFIG.slashReach;
}
/** Радиусы обычных зон и их предварительного рисунка. */
export function enemyAreaRadius(move: EnemyAttack): number {
  switch (move) {
    case 'slam':
      return ENEMY_ATTACK_CONFIG.slamRadius;
    case 'curse':
      return ENEMY_ATTACK_CONFIG.curseRadius;
    case 'poison':
      return ENEMY_ATTACK_CONFIG.poisonRadius;
    case 'meteor':
    case 'blink':
      return ENEMY_ATTACK_CONFIG.meteorRadius;
    case 'nova':
      return ENEMY_ATTACK_CONFIG.novaPreviewRadius;
    case 'quake':
      return ENEMY_ATTACK_CONFIG.quakePreviewRadius;
    default:
      return ENEMY_ATTACK_CONFIG.summonWarningRadius;
  }
}
