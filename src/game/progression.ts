export const PROFILE_KEY = 'raid-coin-profile-v3';
export const SKINS = [
  { id: 'fox', name: 'Рыжий', price: 0, fur: '#efa359', scarf: '#61c8b2' },
  { id: 'fox-moon', name: 'Лунный', price: 20, fur: '#e4e3dc', scarf: '#b4a1d4' },
  { id: 'fox-ember', name: 'Огненный', price: 35, fur: '#ac5b42', scarf: '#efc75f' },
  { id: 'fox-forest', name: 'Лесной', price: 55, fur: '#927453', scarf: '#93ba65' },
  { id: 'fox-royal', name: 'Королевский', price: 80, fur: '#deb268', scarf: '#a45865' },
  { id: 'fox-ash', name: 'Пепельный', price: 100, fur: '#6d737a', scarf: '#eac780' },
  { id: 'fox-star', name: 'Звёздный', price: 140, fur: '#c7b9d3', scarf: '#82b5b6' },
] as const;
export const UPGRADES = [
  { id: 'speed', name: 'Быстрые лапы', icon: '➚', prices: [15, 30, 50], description: '+6% скорости за ступень' },
  { id: 'dash', name: 'Лёгкий рывок', icon: 'ϟ', prices: [12, 25, 40], description: 'Перезарядка уклонения -0,1 с' },
  { id: 'boots', name: 'Сухие лапы', icon: '♧', prices: [18, 35], description: 'Меньше замедление в воде' },
  { id: 'power', name: 'Заточка клинка', icon: '⚔', prices: [20, 40, 65], description: '+20% урона за ступень' },
  { id: 'vitality', name: 'Живучесть', icon: '♥', prices: [18, 35, 60], description: '+15 к максимальному HP' },
  { id: 'armor', name: 'Кожаная броня', icon: '◇', prices: [22, 45, 70], description: '-8% получаемого урона' },
  { id: 'focus', name: 'Выносливость', icon: '✧', prices: [18, 35, 60], description: '+15 запаса, +10% восстановления' },
  { id: 'flask', name: 'Дорожная фляга', icon: '♜', prices: [20, 40, 65], description: '+1 заряд лечения' },
] as const;
export type UpgradeId = typeof UPGRADES[number]['id'];
export type Profile = { coins: number; owned: string[]; skin: string; blade: boolean; upgrades: Record<UpgradeId, number> };
export const newProfile = (): Profile => ({ coins: 0, owned: ['fox'], skin: 'fox', blade: false, upgrades: { speed: 0, dash: 0, boots: 0, power: 0, vitality: 0, armor: 0, focus: 0, flask: 0 } });

export function parseProfile(raw: string | null): Profile {
  const profile = newProfile();
  try {
    const value: unknown = JSON.parse(raw ?? 'null');
    if (!value || typeof value !== 'object') return profile;
    const data = value as Record<string, unknown>;
    profile.blade = data.blade === true;
    if (typeof data.coins === 'number' && Number.isFinite(data.coins)) profile.coins = Math.max(0, Math.min(1e7, Math.floor(data.coins)));
    if (Array.isArray(data.owned)) profile.owned = [...new Set(['fox', ...data.owned.filter((v): v is string => typeof v === 'string' && SKINS.some(s => s.id === v))])];
    if (typeof data.skin === 'string' && profile.owned.includes(data.skin)) profile.skin = data.skin;
    if (data.upgrades && typeof data.upgrades === 'object') for (const item of UPGRADES) {
      const rank = (data.upgrades as Record<string, unknown>)[item.id];
      if (typeof rank === 'number' && Number.isFinite(rank)) profile.upgrades[item.id] = Math.max(0, Math.min(item.prices.length, Math.floor(rank)));
    }
  } catch { /* Повреждённый профиль не мешает запуску. */ }
  return profile;
}

export function purchase(profile: Profile, id: string): string {
  const skin = SKINS.find(s => s.id === id);
  if (skin) {
    if (!profile.owned.includes(id)) {
      if (profile.coins < skin.price) return 'Не хватает монет. Они остаются даже после поражения.';
      profile.coins -= skin.price; profile.owned.push(id);
    }
    profile.skin = id; return `Выбран скин «${skin.name}».`;
  }
  const upgrade = UPGRADES.find(u => u.id === id);
  if (!upgrade) return 'Предмет не найден.';
  const rank = profile.upgrades[upgrade.id];
  if (rank >= upgrade.prices.length) return 'Улучшение уже на максимуме.';
  if (profile.coins < upgrade.prices[rank]) return 'Не хватает монет. Собери ещё в следующей попытке.';
  profile.coins -= upgrade.prices[rank]; profile.upgrades[upgrade.id]++;
  return `«${upgrade.name}»: ступень ${rank + 1}.`;
}
