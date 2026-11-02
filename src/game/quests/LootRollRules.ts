import { ARMORS, LOOT_CONFIG, SKINS, UPGRADES, WEAPONS } from '../Constants';
import { isAttribute, itemUnlock, type Profile } from '../progression/PlayerProgression';

export type Loot = {
  kind: 'empty' | 'souls' | 'heal' | 'item';
  name: string;
  icon: string;
  value: number;
  item?: string;
  color: string;
};

export function rollLoot(p: Profile, region: number, random = Math.random): Loot {
  const weights = LOOT_CONFIG.weights;
  const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  const n = random() * total;
  const emptyEnd = weights.empty;
  const soulsEnd = emptyEnd + weights.souls;
  const healEnd = soulsEnd + weights.heal;
  const upgradeEnd = healEnd + weights.upgrade;
  if (n < emptyEnd) {
    return {
      kind: 'empty',
      name: 'Только древняя пыль',
      icon: '∅',
      value: 0,
      color: '#acb9b7',
    };
  }
  if (n < soulsEnd) {
    return {
      kind: 'souls',
      name: `${LOOT_CONFIG.soulsBase + region * LOOT_CONFIG.soulsPerRegion} осколков души`,
      icon: '◈',
      value: LOOT_CONFIG.soulsBase + region * LOOT_CONFIG.soulsPerRegion,
      color: '#a7eef2',
    };
  }
  if (n < healEnd) {
    return {
      kind: 'heal',
      name: 'Полное лечение и заряд фляги',
      icon: '✚',
      value: 1,
      color: '#b3d99c',
    };
  }
  const candidates =
    n < upgradeEnd
      ? [
          ...SKINS.filter((s) => !p.owned.includes(s.id)).map((s) => ({
            id: s.id,
            name: s.name,
            icon: '♧',
          })),
          ...UPGRADES.filter(
            (u) =>
              (isAttribute(u.id) || p.upgrades[u.id] < u.prices.length) &&
              region >= itemUnlock(u.id, p.upgrades[u.id]),
          ).map((u) => ({ id: u.id, name: u.name, icon: u.icon })),
        ]
      : [
          ...WEAPONS.filter(
            (w) => !w.quest && !p.weapons.includes(w.id) && region >= itemUnlock(w.id),
          ).map((w) => ({ id: w.id, name: w.name, icon: w.icon })),
          ...ARMORS.filter((a) => !p.armors.includes(a.id) && region >= itemUnlock(a.id)).map(
            (a) => ({ id: a.id, name: a.name, icon: a.icon }),
          ),
        ];
  if (!candidates.length) {
    return {
      kind: 'souls',
      name: `${LOOT_CONFIG.fallbackSouls} осколков души`,
      icon: '◈',
      value: LOOT_CONFIG.fallbackSouls,
      color: '#e4c88c',
    };
  }
  const item =
    candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))];
  return {
    kind: 'item',
    name: item.name,
    item: item.id,
    icon: item.icon,
    value: 0,
    color: n < upgradeEnd ? '#bac8f4' : '#e8c18f',
  };
}
