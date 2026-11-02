import {
  ACHIEVEMENTS,
  ARMORS,
  ATTRIBUTE_FIRST_PRICE,
  ATTRIBUTE_GAIN,
  ATTRIBUTE_PRICE_STEP,
  SKILL_TREE,
  SKINS,
  SUPPLY_CONFIG,
  UPGRADES,
  WEAPONS,
} from '../Constants';
import { type AchievementId } from './Achievements';
import { type SkillId } from './Skills';

export type WeaponId = (typeof WEAPONS)[number]['id'];

export type ArmorId = (typeof ARMORS)[number]['id'];

export type AttributeId = 'vitality' | 'focus';

export type UpgradeId = (typeof UPGRADES)[number]['id'];
export type Profile = {
  healthLevel: number;
  enduranceLevel: number;
  potions: number;
  trackedQuest: string;
  skills: SkillId[];
  unlockedSkills: SkillId[];
  disabledSkills: SkillId[];
  skillPoints: number;
  achievements: AchievementId[];
  counterWins: number;
  coins: number;
  owned: string[];
  skin: string;
  blade: boolean;
  upgrades: Record<UpgradeId, number>;
  weapons: WeaponId[];
  weapon: WeaponId;
  relics: string[];
  armors: ArmorId[];
  armor: ArmorId;
};
export const newProfile = (): Profile => ({
  healthLevel: 0,
  enduranceLevel: 0,
  potions: 0,
  trackedQuest: '',
  skills: [],
  unlockedSkills: [],
  disabledSkills: [],
  skillPoints: 0,
  achievements: [],
  counterWins: 0,
  coins: 0,
  owned: ['fox'],
  skin: 'fox',
  blade: false,
  weapons: ['sword'],
  weapon: 'sword',
  relics: [],
  armors: ['travel'],
  armor: 'travel',
  upgrades: {
    speed: 0,
    dash: 0,
    boots: 0,
    power: 0,
    vitality: 0,
    armor: 0,
    focus: 0,
    flask: 0,
    magnet: 0,
    ward: 0,
    spirit: 0,
    recovery: 0,
  },
});
export const weaponFor = (p: Profile) => WEAPONS.find((w) => w.id === p.weapon) ?? WEAPONS[0];
export const armorFor = (p: Profile) => ARMORS.find((a) => a.id === p.armor) ?? ARMORS[0];
export const isAttribute = (id: string): id is AttributeId => id === 'vitality' || id === 'focus';
export const attributeLevel = (p: Profile, id: AttributeId): number =>
  id === 'vitality' ? p.healthLevel : p.enduranceLevel;
export const attributePrice = (p: Profile, id: AttributeId): number =>
  ATTRIBUTE_FIRST_PRICE + ATTRIBUTE_PRICE_STEP * attributeLevel(p, id);
export function parseProfile(raw: string | null): Profile {
  const p = newProfile();
  try {
    const data = JSON.parse(raw ?? 'null') as Partial<Profile> | null;
    if (!data || typeof data !== 'object') {
      return p;
    }
    if (typeof data.coins === 'number' && Number.isFinite(data.coins)) {
      p.coins = Math.max(0, Math.min(1e7, Math.floor(data.coins)));
    }
    p.blade = data.blade === true;
    for (const key of ['healthLevel', 'enduranceLevel', 'potions'] as const) {
      const n = data[key];
      if (typeof n === 'number' && Number.isFinite(n)) {
        p[key] = Math.max(
          0,
          Math.min(key === 'potions' ? SUPPLY_CONFIG.potionLimit : 10000, Math.floor(n)),
        );
      }
    }
    if (
      typeof data.trackedQuest === 'string' &&
      /^(line:(bell|runes|wisp)|delivery:(medicine|blueprint)|trial:(sprint|triple|focus))$/.test(
        data.trackedQuest,
      )
    ) {
      p.trackedQuest = data.trackedQuest;
    }
    if (Array.isArray(data.skills)) {
      p.skills = [...new Set(data.skills.filter((v) => SKILL_TREE.some((s) => s.id === v)))];
    }
    p.unlockedSkills = [
      ...new Set([
        ...p.skills,
        ...(Array.isArray(data.unlockedSkills)
          ? data.unlockedSkills.filter((v) => SKILL_TREE.some((s) => s.id === v))
          : []),
      ]),
    ];
    if (Array.isArray(data.disabledSkills)) {
      p.disabledSkills = [...new Set(data.disabledSkills.filter((v) => p.skills.includes(v)))];
    }
    if (Array.isArray(data.achievements)) {
      p.achievements = [
        ...new Set(data.achievements.filter((v) => ACHIEVEMENTS.some((a) => a.id === v))),
      ];
    }
    if (typeof data.counterWins === 'number' && Number.isFinite(data.counterWins)) {
      p.counterWins = Math.max(0, Math.min(1e7, Math.floor(data.counterWins)));
    }
    if (typeof data.skillPoints === 'number' && Number.isFinite(data.skillPoints)) {
      p.skillPoints = Math.max(0, Math.min(20, Math.floor(data.skillPoints)));
    }
    p.relics = Array.isArray(data.relics)
      ? data.relics.filter((v) => v === 'emberseal').slice(0, 1)
      : [];
    if (Array.isArray(data.owned)) {
      p.owned = [...new Set(['fox', ...data.owned.filter((v) => SKINS.some((s) => s.id === v))])];
    }
    if (typeof data.skin === 'string' && p.owned.includes(data.skin)) {
      p.skin = data.skin;
    }
    if (Array.isArray(data.weapons)) {
      p.weapons = [
        ...new Set<WeaponId>([
          'sword',
          ...data.weapons.filter((v) => WEAPONS.some((w) => w.id === v)),
        ]),
      ];
    }
    if (data.weapon && p.weapons.includes(data.weapon)) {
      p.weapon = data.weapon;
    }
    if (Array.isArray(data.armors)) {
      p.armors = [
        ...new Set<ArmorId>([
          'travel',
          ...data.armors.filter((v) => ARMORS.some((a) => a.id === v)),
        ]),
      ];
    }
    if (data.armor && p.armors.includes(data.armor)) {
      p.armor = data.armor;
    }
    if (data.upgrades && typeof data.upgrades === 'object') {
      for (const u of UPGRADES) {
        const n = data.upgrades[u.id];
        if (typeof n === 'number' && Number.isFinite(n)) {
          p.upgrades[u.id] = Math.max(
            0,
            Math.min(isAttribute(u.id) ? 3 : u.prices.length, Math.floor(n)),
          );
        }
      }
    }
  } catch {
    /* Невалидное сохранение не мешает новой игре. */
  }
  return p;
}
export const itemUnlock = (id: string, rank = 0): number =>
  isAttribute(id)
    ? 0
    : id === 'spear'
      ? 1
      : id === 'axe'
        ? 2
        : id === 'staff'
          ? 3
          : id === 'ranger'
            ? 1
            : id === 'iron'
              ? 3
              : id === 'robe'
                ? 4
                : UPGRADES.some((u) => u.id === id)
                  ? rank === 0
                    ? ['power', 'armor', 'ward', 'spirit', 'recovery'].includes(id)
                      ? 1
                      : 0
                    : rank === 1
                      ? 3
                      : 5
                  : 0;
export function purchase(p: Profile, id: string, seals = 0): string {
  if (isAttribute(id)) {
    const price = attributePrice(p, id);
    if (p.coins < price) {
      return 'Не хватает осколков души.';
    }
    p.coins -= price;
    if (id === 'vitality') {
      p.healthLevel++;
    } else {
      p.enduranceLevel++;
    }
    return `+${ATTRIBUTE_GAIN} ${id === 'vitality' ? 'HP' : 'выносливости'}. Следующее усиление: ${attributePrice(p, id)} ◈.`;
  }
  const owned =
    p.owned.includes(id) || p.weapons.some((v) => v === id) || p.armors.some((v) => v === id);
  const unlockRank = p.upgrades[id as UpgradeId] ?? 0;
  const unlock = itemUnlock(id, unlockRank);
  if (!owned && seals < unlock) {
    return `Откроется после ${unlock} печатей.`;
  }
  const skin = SKINS.find((s) => s.id === id);
  if (skin) {
    if (!p.owned.includes(id)) {
      if (p.coins < skin.price) {
        return 'Не хватает осколков души.';
      }
      p.coins -= skin.price;
      p.owned.push(id);
    }
    p.skin = id;
    return `Надет облик «${skin.name}».`;
  }
  const weapon = WEAPONS.find((w) => w.id === id);
  if (weapon) {
    if (weapon.quest && !p.weapons.includes(weapon.id)) {
      return 'Это награда сюжетного задания, её нельзя купить.';
    }
    if (!p.weapons.includes(weapon.id)) {
      if (p.coins < weapon.price) {
        return 'Не хватает осколков души.';
      }
      p.coins -= weapon.price;
      p.weapons.push(weapon.id);
    }
    p.weapon = weapon.id;
    return `Выбрано: ${weapon.name}. ${weapon.ultimateHint}.`;
  }
  const armor = ARMORS.find((a) => a.id === id);
  if (armor) {
    if (!p.armors.includes(armor.id)) {
      if (p.coins < armor.price) {
        return 'Не хватает осколков души.';
      }
      p.coins -= armor.price;
      p.armors.push(armor.id);
    }
    p.armor = armor.id;
    return `Надето: ${armor.name}.`;
  }
  const u = UPGRADES.find((item) => item.id === id);
  if (!u) {
    return 'Предмет не найден.';
  }
  const rank = p.upgrades[u.id];
  if (rank >= u.prices.length) {
    return 'Улучшение на максимуме.';
  }
  if (p.coins < u.prices[rank]) {
    return 'Не хватает осколков души.';
  }
  p.coins -= u.prices[rank];
  p.upgrades[u.id]++;
  return `«${u.name}»: ступень ${rank + 1}.`;
}
