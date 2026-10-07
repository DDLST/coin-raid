export const PROFILE_KEY = 'raid-coin-manual-v5';
export const LEGACY_KEYS = ['raid-coin-profile-v1', 'raid-coin-profile-v2', 'raid-coin-profile-v3', 'raid-coin-profile-v4', 'raid-coin-profile', 'raid-coin-best-v3', 'raid-coin-best-v4'];
export const SKINS = [
  { id: 'fox', name: 'Рыжий', price: 0, fur: '#efa359', scarf: '#61c8b2' },
  { id: 'fox-moon', name: 'Лунный', price: 25, fur: '#e4e3dc', scarf: '#b4a1d4' },
  { id: 'fox-ember', name: 'Огненный', price: 40, fur: '#ac5b42', scarf: '#efc75f' },
  { id: 'fox-forest', name: 'Лесной', price: 55, fur: '#927453', scarf: '#93ba65' },
  { id: 'fox-royal', name: 'Королевский', price: 80, fur: '#deb268', scarf: '#a45865' },
  { id: 'fox-ash', name: 'Пепельный', price: 100, fur: '#6d737a', scarf: '#eac780' },
  { id: 'fox-star', name: 'Звёздный', price: 140, fur: '#c7b9d3', scarf: '#82b5b6' },
] as const;
export const WEAPONS = [
  { id: 'sword', name: 'Духовный меч', icon: '⚔', price: 0, type: 'slash', reach: 100, arc: 1.08, damage: 1, cost: 18, windup: .10, activeEnd: .25, duration: .47, color: 0xa7eff4,
    description: 'Быстрые дуги · комбо из 3 ударов', ultimate: 'Круг души', ultimateHint: 'Удар вокруг лиса, радиус 185' },
  { id: 'spear', name: 'Копьё памяти', icon: '↗', price: 42, type: 'thrust', reach: 162, arc: .36, damage: 1.25, cost: 22, windup: .17, activeEnd: .31, duration: .58, color: 0xbfd8ff,
    description: 'Длинный узкий выпад · пробивает строй', ultimate: 'Линия судьбы', ultimateHint: 'Пробивающий луч длиной 440' },
  { id: 'axe', name: 'Секира клятвы', icon: '⛏', price: 65, type: 'sweep', reach: 122, arc: 1.65, damage: 1.75, cost: 30, windup: .24, activeEnd: .44, duration: .78, color: 0xffc48a,
    description: 'Медленный широкий удар · сильное отбрасывание', ultimate: 'Вихрь клятвы', ultimateHint: 'Три круговых удара радиусом 150' },
  { id: 'staff', name: 'Посох эха', icon: '✧', price: 85, type: 'magic', reach: 420, arc: .22, damage: .90, cost: 21, windup: .19, activeEnd: .30, duration: .62, color: 0xd1b3ff,
    description: 'Сгусток силы · взрыв при попадании', ultimate: 'Созвездие', ultimateHint: 'Восемь магических лучей и защитная вспышка' },
] as const;
export type WeaponId = typeof WEAPONS[number]['id'];
export const ARMORS = [
  { id: 'travel', name: 'Дорожный плащ', icon: '♧', price: 0, reduction: 0, speed: 1, regen: 1, stamina: 0, ward: 0, color: 0x65bdb5, description: 'Лёгкий стартовый плащ' },
  { id: 'ranger', name: 'Доспех странника', icon: '◇', price: 35, reduction: .14, speed: 1.04, regen: 1.10, stamina: 10, ward: .08, color: 0x9cad78, description: '-14% урона · +4% скорости · +10 выносливости' },
  { id: 'iron', name: 'Латы хранителя', icon: '▣', price: 68, reduction: .30, speed: .90, regen: .90, stamina: 0, ward: .12, color: 0xb0b9c8, description: '-30% урона · тяжелее и медленнее' },
  { id: 'robe', name: 'Роба рассвета', icon: '✦', price: 100, reduction: .18, speed: 1, regen: 1.20, stamina: 25, ward: .32, color: 0xbeb3ed, description: '-18% урона · защита от магии · +25 выносливости' },
] as const;
export type ArmorId = typeof ARMORS[number]['id'];
export const UPGRADES = [
  { id: 'speed', name: 'Быстрые лапы', icon: '➚', prices: [15, 30, 50], description: '+6% скорости за ступень' },
  { id: 'dash', name: 'Лёгкий рывок', icon: 'ϟ', prices: [12, 25, 40], description: 'Уклонение восстанавливается на 0,1 с быстрее' },
  { id: 'boots', name: 'Сухие лапы', icon: '♧', prices: [18, 35], description: 'Меньше замедление в воде' },
  { id: 'power', name: 'Сила оружия', icon: '⚔', prices: [20, 40, 65], description: '+20% урона за ступень' },
  { id: 'vitality', name: 'Живучесть', icon: '♥', prices: [18, 35, 60], description: '+15 максимального здоровья' },
  { id: 'armor', name: 'Укрепление брони', icon: '◇', prices: [22, 45, 70], description: 'Ещё -6% получаемого урона' },
  { id: 'focus', name: 'Выносливость', icon: '✧', prices: [18, 35, 60], description: '+15 запаса · +10% восстановления' },
  { id: 'flask', name: 'Дорожная фляга', icon: '♜', prices: [20, 40, 65], description: '+1 заряд лечения у костра' },
  { id: 'magnet', name: 'Зов осколков', icon: '◈', prices: [16, 32], description: '+20 к радиусу сбора силы' },
  { id: 'ward', name: 'Печать от чар', icon: '☽', prices: [24, 48], description: 'Ещё -12% урона магии и яда' },
  { id: 'spirit', name: 'Абсолютная сила', icon: '✺', prices: [30, 55], description: '+20% урона абсолютного умения' },
  { id: 'recovery', name: 'Живое эхо', icon: '✚', prices: [28, 52], description: 'Победа над врагом лечит на 2 HP за ступень' },
] as const;
export type UpgradeId = typeof UPGRADES[number]['id'];
export type Profile = { coins: number; owned: string[]; skin: string; blade: boolean; upgrades: Record<UpgradeId, number>; weapons: WeaponId[]; weapon: WeaponId; armors: ArmorId[]; armor: ArmorId };
export const newProfile = (): Profile => ({ coins: 0, owned: ['fox'], skin: 'fox', blade: false,
  weapons: ['sword'], weapon: 'sword', armors: ['travel'], armor: 'travel',
  upgrades: { speed: 0, dash: 0, boots: 0, power: 0, vitality: 0, armor: 0, focus: 0, flask: 0, magnet: 0, ward: 0, spirit: 0, recovery: 0 } });
export const weaponFor = (p: Profile) => WEAPONS.find(w => w.id === p.weapon) ?? WEAPONS[0];
export const armorFor = (p: Profile) => ARMORS.find(a => a.id === p.armor) ?? ARMORS[0];
export function parseProfile(raw: string | null): Profile {
  const p = newProfile();
  try {
    const data = JSON.parse(raw ?? 'null') as Partial<Profile> | null;
    if (!data || typeof data !== 'object') return p;
    if (typeof data.coins === 'number' && Number.isFinite(data.coins)) p.coins = Math.max(0, Math.min(1e7, Math.floor(data.coins)));
    p.blade = data.blade === true;
    if (Array.isArray(data.owned)) p.owned = [...new Set(['fox', ...data.owned.filter(v => SKINS.some(s => s.id === v))])];
    if (typeof data.skin === 'string' && p.owned.includes(data.skin)) p.skin = data.skin;
    if (Array.isArray(data.weapons)) p.weapons = [...new Set<WeaponId>(['sword', ...data.weapons.filter(v => WEAPONS.some(w => w.id === v))])];
    if (data.weapon && p.weapons.includes(data.weapon)) p.weapon = data.weapon;
    if (Array.isArray(data.armors)) p.armors = [...new Set<ArmorId>(['travel', ...data.armors.filter(v => ARMORS.some(a => a.id === v))])];
    if (data.armor && p.armors.includes(data.armor)) p.armor = data.armor;
    if (data.upgrades && typeof data.upgrades === 'object') for (const u of UPGRADES) {
      const n = data.upgrades[u.id]; if (typeof n === 'number' && Number.isFinite(n)) p.upgrades[u.id] = Math.max(0, Math.min(u.prices.length, Math.floor(n)));
    }
  } catch { /* Невалидное сохранение не мешает новой игре. */ }
  return p;
}
export function purchase(p: Profile, id: string): string {
  const skin = SKINS.find(s => s.id === id);
  if (skin) { if (!p.owned.includes(id)) { if (p.coins < skin.price) return 'Не хватает осколков души.'; p.coins -= skin.price; p.owned.push(id); } p.skin = id; return `Надет облик «${skin.name}».`; }
  const weapon = WEAPONS.find(w => w.id === id);
  if (weapon) { if (!p.weapons.includes(weapon.id)) { if (p.coins < weapon.price) return 'Не хватает осколков души.'; p.coins -= weapon.price; p.weapons.push(weapon.id); } p.weapon = weapon.id; return `Выбрано: ${weapon.name}. ${weapon.ultimateHint}.`; }
  const armor = ARMORS.find(a => a.id === id);
  if (armor) { if (!p.armors.includes(armor.id)) { if (p.coins < armor.price) return 'Не хватает осколков души.'; p.coins -= armor.price; p.armors.push(armor.id); } p.armor = armor.id; return `Надето: ${armor.name}.`; }
  const u = UPGRADES.find(item => item.id === id); if (!u) return 'Предмет не найден.';
  const rank = p.upgrades[u.id]; if (rank >= u.prices.length) return 'Улучшение на максимуме.';
  if (p.coins < u.prices[rank]) return 'Не хватает осколков души.';
  p.coins -= u.prices[rank]; p.upgrades[u.id]++; return `«${u.name}»: ступень ${rank + 1}.`;
}
