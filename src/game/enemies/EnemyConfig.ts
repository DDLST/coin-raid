import { REGIONS, type EnemyKind } from '../world/WorldConfig';

// Частота поиска пути и ограничения обычных волн.
export const PATH_INTERVAL = 0.45;
export const MAX_MINIONS = 18;
export const WAVE_FIRST = 4;
export const WAVE_SIZE = 3;
export const BOSS_REWARD = 45;
export const THIRD_BIOME_DAMAGE = 0.74;
export const THIRD_BIOME_WINDUP = 1.18;

export const ENEMY_BASE_HP: Record<Exclude<EnemyKind, 'boss'>, number> = {
  skeleton: 64,
  zombie: 94,
  necromancer: 78,
  vampire: 92,
  dragon: 138,
  wraith: 100,
  knight: 140,
  archer: 65,
  alchemist: 84,
  shade: 96,
  gargoyle: 155,
};

/** Численные параметры противника; создание спрайтов находится в EnemySystem. */
export function enemyStats(kind: EnemyKind, index: number) {
  const region = REGIONS[index];
  const boss = kind === 'boss';
  const hp = boss
    ? region.bossHP
    : ENEMY_BASE_HP[kind] +
      index * (kind === 'skeleton' ? 14 : kind === 'dragon' || kind === 'knight' ? 24 : 18);
  const size = boss
    ? 148
    : kind === 'dragon'
      ? 103
      : kind === 'zombie' || kind === 'knight'
        ? 83
        : 78;
  const damage =
    (boss
      ? 23 + index * 4
      : kind === 'skeleton' || kind === 'archer'
        ? 14 + index * 2
        : kind === 'zombie' || kind === 'knight' || kind === 'gargoyle'
          ? 17 + index * 2
          : kind === 'vampire' || kind === 'dragon' || kind === 'shade'
            ? 16 + index * 2
            : 11 + index * 2) * (index === 2 ? THIRD_BIOME_DAMAGE : 1);
  const reward = boss
    ? BOSS_REWARD + index * 13
    : kind === 'skeleton'
      ? 5 + index
      : kind === 'zombie'
        ? 6 + index * 2
        : kind === 'dragon'
          ? 12 + index * 2
          : 9 + index * 2;
  const speed =
    region.speed *
    (boss
      ? 0.95
      : kind === 'zombie'
        ? 0.7
        : kind === 'necromancer' || kind === 'alchemist'
          ? 0.72
          : kind === 'vampire' || kind === 'shade'
            ? 1.18
            : kind === 'gargoyle'
              ? 0.76
              : kind === 'dragon'
                ? 0.88
                : kind === 'knight'
                  ? 0.9
                  : 1);
  return { hp, size, damage, reward, speed, radius: boss ? 34 : kind === 'dragon' ? 25 : 20 };
}
