import { PEOPLE, RESIDENT_NAMES, SPECIES, VILLAGE_STOCK, VILLAGE_TRADITIONS } from '../Constants';
import { type WeaponId } from '../progression/PlayerProgression';
import { type Role } from '../story/StoryProgress';

export const villageStock = (village: number): WeaponId[] =>
  VILLAGE_STOCK[Math.max(0, Math.min(7, village + 1))];
export function resident(village: number, role: Role) {
  const row = Math.max(0, Math.min(7, village + 1));
  const index = PEOPLE.findIndex((p) => p.role === role);
  const base = PEOPLE[index];
  const species = row === 0 ? [0, 2, 1, 6][index] : (row + [0, 1, 3, 5][index]) % 8;
  return {
    ...base,
    name: RESIDENT_NAMES[row][index],
    species: SPECIES[species],
    texture: `resident-${species}-${role}`,
    lore: `Я ${RESIDENT_NAMES[row][index]}, ${SPECIES[species]}, ${base.job.toLowerCase()}. ${base.lore} ${VILLAGE_TRADITIONS[row]}`,
  };
}
export const houseName = (village: number, role: Role): string =>
  `${role === 'smith' ? 'Кузница' : role === 'armorer' ? 'Мастерская' : role === 'healer' ? 'Дом настоек' : 'Лавка'} · ${resident(village, role).name}`;
export const villageTradition = (village: number): string =>
  VILLAGE_TRADITIONS[Math.max(0, Math.min(7, village + 1))];
