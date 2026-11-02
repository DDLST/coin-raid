import { ENEMY_BASE_HP, ENEMY_PARAMETERS, REGIONS, THIRD_BIOME_DAMAGE } from '../Constants';
import { type EnemyKind } from '../world/WorldLayout';

/** Вычисляет параметры врага, не создавая спрайты и игровые объекты. */
export function enemyStats(kind: EnemyKind, index: number) {
  const region = REGIONS[index];
  const parameters = ENEMY_PARAMETERS[kind];
  const hp = kind === 'boss' ? region.bossHP : ENEMY_BASE_HP[kind] + index * parameters.hpGrowth;
  const biomeDamageScale = index === 2 ? THIRD_BIOME_DAMAGE : 1;
  return {
    hp,
    size: parameters.size,
    damage: (parameters.damage + index * parameters.damageGrowth) * biomeDamageScale,
    reward: parameters.reward + index * parameters.rewardGrowth,
    speed: region.speed * parameters.speedScale,
    radius: parameters.radius,
  };
}
