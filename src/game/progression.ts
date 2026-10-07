import { SKILL_TREE, type SkillId } from './skills';
import { ACHIEVEMENTS, type AchievementId } from './achievements';
export const PROFILE_KEY = 'raid-coin-manual-v5';
export const LEGACY_KEYS = ['raid-coin-profile-v1', 'raid-coin-profile-v2', 'raid-coin-profile-v3', 'raid-coin-profile-v4', 'raid-coin-profile', 'raid-coin-best-v3', 'raid-coin-best-v4'];
export const SKINS = [
  { id: 'fox', name: 'Рыжий', price: 0, fur: '#efa359', scarf: '#61c8b2' },
  { id: 'fox-moon', name: 'Лунный', price: 45, fur: '#e4e3dc', scarf: '#b4a1d4' },
  { id: 'fox-ember', name: 'Огненный', price: 75, fur: '#ac5b42', scarf: '#efc75f' },
  { id: 'fox-forest', name: 'Лесной', price: 110, fur: '#927453', scarf: '#93ba65' },
  { id: 'fox-royal', name: 'Королевский', price: 150, fur: '#deb268', scarf: '#a45865' },
  { id: 'fox-ash', name: 'Пепельный', price: 190, fur: '#6d737a', scarf: '#eac780' },
  { id: 'fox-star', name: 'Звёздный', price: 270, fur: '#c7b9d3', scarf: '#82b5b6' },
] as const;
export const WEAPONS = [
  { id:'sword', style:'sword', name:'Духовный меч', icon:'⚔', price:0, quest:false, type:'slash', reach:105, arc:.82, damage:.92, cost:16, windup:.10, activeEnd:.22, duration:.43, color:0xa7eff4, description:'Три быстрых дуги. ПКМ: парирование на 0,22 с.', ultimate:'Круг души', ultimateHint:'Две волны радиусом 185' },
  { id:'spear', style:'spear', name:'Копьё памяти', icon:'↗', price:90, quest:false, type:'thrust', reach:168, arc:.28, damage:1.22, cost:21, windup:.16, activeEnd:.29, duration:.56, color:0xbfd8ff, description:'Узкий выпад по строю. ПКМ: тяжёлый выпад с шагом.', ultimate:'Линия судьбы', ultimateHint:'Пробивающий луч длиной 440' },
  { id:'axe', style:'axe', name:'Секира клятвы', icon:'⛏', price:150, quest:false, type:'sweep', reach:118, arc:1.40, damage:1.80, cost:32, windup:.28, activeEnd:.43, duration:.82, color:0xffc48a, description:'Мощная дуга. ПКМ: медленный круговой удар по земле.', ultimate:'Вихрь клятвы', ultimateHint:'Три круговых удара радиусом 150' },
  { id:'staff', style:'staff', name:'Посох эха', icon:'✧', price:210, quest:false, type:'magic', reach:400, arc:.22, damage:.80, cost:20, windup:.20, activeEnd:.32, duration:.66, color:0xd1b3ff, description:'Магический сгусток. ПКМ: отложенная печать под прицелом.', ultimate:'Созвездие', ultimateHint:'Восемь магических лучей и защитная вспышка' },
  { id:'dawnblade', style:'sword', name:'Клинок Рассвета', icon:'☀', price:0, quest:true, type:'slash', reach:116, arc:.88, damage:1.08, cost:18, windup:.11, activeEnd:.24, duration:.46, color:0xffe3a1, description:'Награда «Голос забытых». Попадания возвращают 2 HP.', ultimate:'Рассвет', ultimateHint:'Две волны и исцеление на 20 HP' },
  { id:'runicstaff', style:'staff', name:'Посох трёх печатей', icon:'✺', price:0, quest:true, type:'magic', reach:430, arc:.22, damage:.62, cost:27, windup:.23, activeEnd:.35, duration:.73, color:0x95f1cc, description:'Награда «Письма хранителя». Тройной магический веер.', ultimate:'Три печати', ultimateHint:'Двенадцать магических лучей' },
] as const;
export type WeaponId = typeof WEAPONS[number]['id'];
export const ARMORS = [
  { id: 'travel', name: 'Дорожный плащ', icon: '♧', price: 0, reduction: 0, speed: 1, regen: 1, stamina: 0, ward: 0, color: 0x65bdb5, description: 'Лёгкий стартовый плащ' },
  { id: 'ranger', name: 'Доспех странника', icon: '◇', price: 80, reduction: .14, speed: 1.04, regen: 1.10, stamina: 10, ward: .08, color: 0x9cad78, description: '-14% урона · +4% скорости · +10 выносливости' },
  { id: 'iron', name: 'Латы хранителя', icon: '▣', price: 175, reduction: .30, speed: .90, regen: .90, stamina: 0, ward: .12, color: 0xb0b9c8, description: '-30% урона · тяжелее и медленнее' },
  { id: 'robe', name: 'Роба рассвета', icon: '✦', price: 240, reduction: .18, speed: 1, regen: 1.20, stamina: 25, ward: .32, color: 0xbeb3ed, description: '-18% урона · защита от магии · +25 выносливости' },
] as const;
export type ArmorId = typeof ARMORS[number]['id'];
export const UPGRADES = [
  { id: 'speed', name: 'Быстрые лапы', icon: '➚', prices: [45, 90, 160], description: '+6% скорости за ступень' },
  { id: 'dash', name: 'Лёгкий рывок', icon: 'ϟ', prices: [40, 85, 150], description: 'Уклонение восстанавливается на 0,1 с быстрее' },
  { id: 'boots', name: 'Сухие лапы', icon: '♧', prices: [50, 110], description: 'Меньше замедление в воде' },
  { id: 'power', name: 'Сила оружия', icon: '⚔', prices: [55, 115, 190], description: '+12% урона за ступень' },
  { id: 'vitality', name: 'Живучесть', icon: '♥', prices: [50, 110, 185], description: '+15 максимального здоровья' },
  { id: 'armor', name: 'Укрепление брони', icon: '◇', prices: [65, 135, 220], description: 'Ещё -6% получаемого урона' },
  { id: 'focus', name: 'Выносливость', icon: '✧', prices: [50, 110, 185], description: '+15 запаса · +10% восстановления' },
  { id: 'flask', name: 'Дорожная фляга', icon: '♜', prices: [55, 115, 190], description: '+1 заряд лечения у костра' },
  { id: 'magnet', name: 'Зов осколков', icon: '◈', prices: [45, 95], description: '+20 к радиусу сбора силы' },
  { id: 'ward', name: 'Печать от чар', icon: '☽', prices: [65, 130], description: 'Ещё -12% урона магии и яда' },
  { id: 'spirit', name: 'Абсолютная сила', icon: '✺', prices: [80, 165], description: '+20% урона абсолютного умения' },
  { id: 'recovery', name: 'Живое эхо', icon: '✚', prices: [75, 150], description: 'Победа над врагом лечит на 2 HP за ступень' },
] as const;
export type UpgradeId = typeof UPGRADES[number]['id'];
export type Profile = { skills:SkillId[];unlockedSkills:SkillId[];disabledSkills:SkillId[];skillPoints:number;achievements:AchievementId[];counterWins:number; coins: number; owned: string[]; skin: string; blade: boolean; upgrades: Record<UpgradeId, number>; weapons: WeaponId[]; weapon: WeaponId; relics: string[]; armors: ArmorId[]; armor: ArmorId };
export const newProfile = (): Profile => ({ skills:[],unlockedSkills:[],disabledSkills:[],skillPoints:0,achievements:[],counterWins:0, coins: 0, owned: ['fox'], skin: 'fox', blade: false,
  weapons: ['sword'], weapon: 'sword', relics: [], armors: ['travel'], armor: 'travel',
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
    if(Array.isArray(data.skills))p.skills=[...new Set(data.skills.filter(v=>SKILL_TREE.some(s=>s.id===v)))];
    p.unlockedSkills=[...new Set([...p.skills,...(Array.isArray(data.unlockedSkills)?data.unlockedSkills.filter(v=>SKILL_TREE.some(s=>s.id===v)):[])])];
    if(Array.isArray(data.disabledSkills))p.disabledSkills=[...new Set(data.disabledSkills.filter(v=>p.skills.includes(v)))];
    if(Array.isArray(data.achievements))p.achievements=[...new Set(data.achievements.filter(v=>ACHIEVEMENTS.some(a=>a.id===v)))];
    if(typeof data.counterWins==='number'&&Number.isFinite(data.counterWins))p.counterWins=Math.max(0,Math.min(1e7,Math.floor(data.counterWins)));
    if(typeof data.skillPoints==='number'&&Number.isFinite(data.skillPoints))p.skillPoints=Math.max(0,Math.min(20,Math.floor(data.skillPoints)));
    p.relics = Array.isArray(data.relics) ? data.relics.filter(v => v === 'emberseal').slice(0,1) : [];
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
export const itemUnlock=(id:string,rank=0):number=>id==='spear'?1:id==='axe'?2:id==='staff'?3:id==='ranger'?1:id==='iron'?3:id==='robe'?4:UPGRADES.some(u=>u.id===id)?(rank===0?(['power','armor','ward','spirit','recovery'].includes(id)?1:0):rank===1?3:5):0;
export function purchase(p: Profile, id: string,seals=0): string {
  const owned=p.owned.includes(id)||p.weapons.some(v=>v===id)||p.armors.some(v=>v===id);
  const unlockRank=p.upgrades[id as UpgradeId]??0,unlock=itemUnlock(id,unlockRank);if(!owned&&seals<unlock)return `Откроется после ${unlock} печатей.`;
  const skin = SKINS.find(s => s.id === id);
  if (skin) { if (!p.owned.includes(id)) { if (p.coins < skin.price) return 'Не хватает осколков души.'; p.coins -= skin.price; p.owned.push(id); } p.skin = id; return `Надет облик «${skin.name}».`; }
  const weapon = WEAPONS.find(w => w.id === id);
  if (weapon) { if(weapon.quest && !p.weapons.includes(weapon.id))return 'Это награда сюжетного задания, её нельзя купить.'; if (!p.weapons.includes(weapon.id)) { if (p.coins < weapon.price) return 'Не хватает осколков души.'; p.coins -= weapon.price; p.weapons.push(weapon.id); } p.weapon = weapon.id; return `Выбрано: ${weapon.name}. ${weapon.ultimateHint}.`; }
  const armor = ARMORS.find(a => a.id === id);
  if (armor) { if (!p.armors.includes(armor.id)) { if (p.coins < armor.price) return 'Не хватает осколков души.'; p.coins -= armor.price; p.armors.push(armor.id); } p.armor = armor.id; return `Надето: ${armor.name}.`; }
  const u = UPGRADES.find(item => item.id === id); if (!u) return 'Предмет не найден.';
  const rank = p.upgrades[u.id]; if (rank >= u.prices.length) return 'Улучшение на максимуме.';
  if (p.coins < u.prices[rank]) return 'Не хватает осколков души.';
  p.coins -= u.prices[rank]; p.upgrades[u.id]++; return `«${u.name}»: ступень ${rank + 1}.`;
}
