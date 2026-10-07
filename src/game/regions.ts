import type { Palette } from './art';
export const REGION_WIDTH = 1280;
export const ROAD_WIDTH = 280;
export const REGION_STEP = REGION_WIDTH + ROAD_WIDTH;
export const WORLD_HEIGHT = 1100;
export const ENEMY_KINDS = ['skeleton', 'zombie', 'necromancer', 'vampire', 'dragon', 'boss'] as const;
export type EnemyKind = typeof ENEMY_KINDS[number];
export type EnemyAttack = 'slash' | 'charge' | 'slam' | 'poison' | 'summon' | 'fan' | 'blink' | 'meteor' | 'breath';
export type Region = { name: string; coins: number; awaken: number; bossTime: number; roster: { kind: Exclude<EnemyKind, 'boss'>; count: number }[];
  speed: number; bossName: string; bossTexture: string; bossHP: number; bossMoves: EnemyAttack[]; fog: number; lore: string; ground: 'grass' | 'stone' | 'water' | 'ash'; palette: Palette };
export const REGIONS: Region[] = [
  { name: 'Роща забытых', coins: 18, awaken: 10, bossTime: 55, roster: [{ kind: 'skeleton', count: 4 }, { kind: 'zombie', count: 2 }], speed: 130,
    bossName: 'Рыцарь без клятвы', bossTexture: 'skeleton', bossHP: 230, bossMoves: ['slash', 'charge', 'summon'], fog: 0x6eafa5,
    lore: 'Проклятие подняло стражей рощи. Скелеты перехватывают путь, мертвецы оставляют яд.', ground: 'grass',
    palette: { ground: '#426b51', light: '#789969', grass: '#728f51', tree: '#264c3a', accent: '#c6e6b1' } },
  { name: 'Некрополь золотых руин', coins: 26, awaken: 12, bossTime: 60, roster: [{ kind: 'skeleton', count: 4 }, { kind: 'zombie', count: 3 }, { kind: 'necromancer', count: 1 }], speed: 145,
    bossName: 'Могильный исполин', bossTexture: 'zombie', bossHP: 340, bossMoves: ['slam', 'poison', 'summon'], fog: 0xbfb47c,
    lore: 'Под руинами лежит заражённая могила. Некромант поднимает павших, исполин заражает землю.', ground: 'stone',
    palette: { ground: '#77744a', light: '#a9a476', grass: '#89894c', tree: '#565f3f', accent: '#e9d29b' } },
  { name: 'Топи кровавой луны', coins: 34, awaken: 14, bossTime: 65, roster: [{ kind: 'zombie', count: 3 }, { kind: 'vampire', count: 3 }, { kind: 'necromancer', count: 2 }], speed: 157,
    bossName: 'Госпожа тумана', bossTexture: 'vampire', bossHP: 450, bossMoves: ['blink', 'fan', 'slash'], fog: 0x9b83b5,
    lore: 'Лунный туман питает вампиров. Перед прыжком они оставляют метку; кровавые чары летят веером.', ground: 'water',
    palette: { ground: '#3b5664', light: '#7b8c99', grass: '#5b717f', tree: '#284650', accent: '#d4bad5' } },
  { name: 'Пепельное святилище', coins: 42, awaken: 16, bossTime: 70, roster: [{ kind: 'skeleton', count: 3 }, { kind: 'necromancer', count: 3 }, { kind: 'dragon', count: 2 }], speed: 171,
    bossName: 'Архонт костяного пламени', bossTexture: 'necromancer', bossHP: 570, bossMoves: ['summon', 'meteor', 'fan'], fog: 0xa46a55,
    lore: 'Архонт связал кости с драконьим огнём. Его ритуал вызывает прислужников и падающие огненные печати.', ground: 'ash',
    palette: { ground: '#625659', light: '#9e8980', grass: '#827671', tree: '#443f4e', accent: '#f0ba87' } },
  { name: 'Сердце сумеречного леса', coins: 52, awaken: 18, bossTime: 75, roster: [{ kind: 'vampire', count: 3 }, { kind: 'necromancer', count: 2 }, { kind: 'dragon', count: 3 }, { kind: 'skeleton', count: 3 }], speed: 186,
    bossName: 'Дракон пожиратель душ', bossTexture: 'dragon', bossHP: 760, bossMoves: ['breath', 'charge', 'meteor', 'summon'], fog: 0x64989e,
    lore: 'Дракон удерживает твою последнюю силу. Дыхание, рывок и небесные печати сменяют друг друга.', ground: 'grass',
    palette: { ground: '#30594f', light: '#72927f', grass: '#658769', tree: '#21433d', accent: '#c2e5d5' } },
];
export const WORLD_WIDTH = REGION_STEP * REGIONS.length - ROAD_WIDTH;
export const regionStart = (index: number): number => index * REGION_STEP;
export const regionEnd = (index: number): number => regionStart(index) + REGION_WIDTH;
export const merchantPosition = (index: number) => ({ x: regionEnd(index) + ROAD_WIDTH / 2, y: WORLD_HEIGHT / 2 });
export const checkpointPosition = (index: number) => ({ x: regionStart(index) + 100, y: WORLD_HEIGHT / 2 + 38 });
