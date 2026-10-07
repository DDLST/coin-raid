import { PEOPLE, type Role } from './story';
import type { WeaponId } from './progression';

export const SPECIES=['барсук','сова','рысь','волк','горный козёл','ворон','кабан','саламандра'] as const;
const NAMES=[['Брун','Мара','Ива','Лисандр'],['Рунар','Сивель','Верба','Рох'],['Кремень','Терна','Рута','Фен'],['Нокс','Велена','Лотос','Орен'],['Седой','Астра','Мята','Тарк'],['Кориан','Элма','Морена','Луциан'],['Гром','Искра','Арника','Вейр'],['Сол','Рада','Эхо','Кальд']];
const TRADITIONS=[
 'Лесные мастера начинают с меча. Копьё откроется после первой печати.',
 'Караульная деревня кует мечи и длинные копья для защиты дороги.',
 'Каменщики работают с мечами и секирами: тяжёлый удар раскалывает панцирь.',
 'На переправе ценят меч и посох: здесь учат держаться вне кровавых чар.',
 'Северные мастера предпочитают копьё и секиру. Начальный меч остаётся доступен.',
 'Хранители памяти работают с посохами и клинками, не будят павших зря.',
 'Звездочёты берегут длинные копья и посохи для боя среди молний.',
 'Последний огонь собирает все традиции оружия перед логовом дракона.',
];
const STOCK:WeaponId[][]=[['sword','spear'],['sword','spear'],['sword','axe'],['sword','staff'],['sword','spear','axe'],['sword','staff'],['sword','spear','staff'],['sword','spear','axe','staff']];
export const villageStock=(village:number):WeaponId[]=>STOCK[Math.max(0,Math.min(7,village+1))];
export function resident(village:number,role:Role){
 const row=Math.max(0,Math.min(7,village+1)),index=PEOPLE.findIndex(p=>p.role===role),base=PEOPLE[index];
 const species=row===0?[0,2,1,6][index]:(row+[0,1,3,5][index])%8;
 return{...base,name:NAMES[row][index],species:SPECIES[species],texture:`resident-${species}-${role}`,lore:`Я ${NAMES[row][index]}, ${SPECIES[species]}, ${base.job.toLowerCase()}. ${base.lore} ${TRADITIONS[row]}`};
}
export const houseName=(village:number,role:Role):string=>`${role==='smith'?'Кузница':role==='armorer'?'Мастерская':role==='healer'?'Дом настоек':'Лавка'} · ${resident(village,role).name}`;
export const villageTradition=(village:number):string=>TRADITIONS[Math.max(0,Math.min(7,village+1))];
