import { ACHIEVEMENTS } from '../Constants';

// Награды отмечают действия в этой игре. Они сохраняются только вместе с ручным сохранением.

export type AchievementId = (typeof ACHIEVEMENTS)[number]['id'];
export type AchievementFacts = {
  bosses: boolean[];
  counters: number;
  skills: number;
  deliveries: boolean;
  promise: boolean;
  kills: number;
  returned: boolean;
  trained: boolean;
};
export function earnedAchievements(f: AchievementFacts): AchievementId[] {
  return ACHIEVEMENTS.filter((a) =>
    a.boss >= 0
      ? f.bosses[a.boss]
      : a.id === 'counter'
        ? f.counters > 0
        : a.id === 'skill'
          ? f.skills > 0
          : a.id === 'delivery'
            ? f.deliveries
            : a.id === 'promise'
              ? f.promise
              : a.id === 'kills'
                ? f.kills >= 30
                : a.id === 'return'
                  ? f.returned
                  : f.trained,
  ).map((a) => a.id);
}
