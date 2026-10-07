import type { Palette } from './art';
export const REGION_WIDTH = 1280;
export const ROAD_WIDTH = 950;
export const PROLOGUE_WIDTH = 1120;
export const REGION_STEP = REGION_WIDTH + ROAD_WIDTH;
export const WORLD_HEIGHT = 1100;
export const ENEMY_KINDS = ['skeleton', 'zombie', 'necromancer', 'vampire', 'dragon', 'wraith', 'knight', 'boss'] as const;
export type EnemyKind = typeof ENEMY_KINDS[number];
export type EnemyAttack = 'slash' | 'charge' | 'slam' | 'poison' | 'summon' | 'fan' | 'blink' | 'meteor' | 'breath' | 'combo' | 'nova' | 'snipe' | 'quake' | 'curse';
export type Region = { name: string; coins: number; awaken: number; bossTime: number; roster: { kind: Exclude<EnemyKind, 'boss'>; count: number }[];
  speed: number; bossName: string; bossTexture: string; bossHP: number; bossMoves: EnemyAttack[]; fog: number; lore: string; ground: 'grass' | 'stone' | 'water' | 'ash'; palette: Palette };
export const REGIONS: Region[] = [
  { name: 'Роща забытых', coins: 24, awaken: 8, bossTime: 45, roster: [{ kind: 'skeleton', count: 5 }, { kind: 'zombie', count: 3 }, { kind: 'necromancer', count: 1 }], speed: 155,
    bossName: 'Рыцарь без клятвы', bossTexture: 'skeleton', bossHP: 480, bossMoves: ['combo', 'charge', 'quake', 'snipe', 'slam'], fog: 0x6eafa5,
    lore: 'Проклятие подняло стражей рощи. Скелеты перехватывают путь, мертвецы оставляют яд.', ground: 'grass',
    palette: { ground: '#426b51', light: '#789969', grass: '#728f51', tree: '#264c3a', accent: '#c6e6b1' } },
  { name: 'Некрополь золотых руин', coins: 32, awaken: 10, bossTime: 50, roster: [{ kind: 'skeleton', count: 5 }, { kind: 'zombie', count: 3 }, { kind: 'necromancer', count: 2 }], speed: 168,
    bossName: 'Могильный исполин', bossTexture: 'zombie', bossHP: 680, bossMoves: ['slam', 'poison', 'combo', 'summon', 'quake'], fog: 0xbfb47c,
    lore: 'Под руинами лежит заражённая могила. Некромант поднимает павших, исполин заражает землю.', ground: 'stone',
    palette: { ground: '#77744a', light: '#a9a476', grass: '#89894c', tree: '#565f3f', accent: '#e9d29b' } },
  { name: 'Топи кровавой луны', coins: 40, awaken: 12, bossTime: 55, roster: [{ kind: 'zombie', count: 3 }, { kind: 'vampire', count: 4 }, { kind: 'necromancer', count: 3 }], speed: 181,
    bossName: 'Госпожа тумана', bossTexture: 'vampire', bossHP: 900, bossMoves: ['blink', 'fan', 'combo', 'nova', 'curse'], fog: 0x9b83b5,
    lore: 'Лунный туман питает вампиров. Перед прыжком они оставляют метку; кровавые чары летят веером.', ground: 'water',
    palette: { ground: '#3b5664', light: '#7b8c99', grass: '#5b717f', tree: '#284650', accent: '#d4bad5' } },
  { name: 'Пепельное святилище', coins: 50, awaken: 14, bossTime: 60, roster: [{ kind: 'skeleton', count: 4 }, { kind: 'necromancer', count: 3 }, { kind: 'dragon', count: 3 }], speed: 192,
    bossName: 'Архонт костяного пламени', bossTexture: 'necromancer', bossHP: 1120, bossMoves: ['summon', 'meteor', 'fan', 'curse', 'nova'], fog: 0xa46a55,
    lore: 'Архонт связал кости с драконьим огнём. Его ритуал вызывает прислужников и падающие огненные печати.', ground: 'ash',
    palette: { ground: '#625659', light: '#9e8980', grass: '#827671', tree: '#443f4e', accent: '#f0ba87' } },
  {name:'Цитадель белого ветра',coins:60,awaken:16,bossTime:70,roster:[{kind:'skeleton',count:4},{kind:'knight',count:3},{kind:'wraith',count:3}],speed:196,bossName:'Страж ледяной короны',bossTexture:'knight',bossHP:1400,bossMoves:['combo','snipe','quake','charge','nova'],fog:0x9abfd9,lore:'Ледяная печать удерживает голоса пленников. Латы стражей закрывают фронт, но не спину.',ground:'stone',palette:{ground:'#496478',light:'#99b1ba',grass:'#8dabb3',tree:'#334e67',accent:'#d5f3ff'}},
  {name:'Катакомбы тихих голосов',coins:70,awaken:18,bossTime:75,roster:[{kind:'necromancer',count:3},{kind:'wraith',count:4},{kind:'zombie',count:3}],speed:201,bossName:'Хранитель безымянных',bossTexture:'wraith',bossHP:1650,bossMoves:['blink','curse','nova','summon','meteor'],fog:0x8d72b5,lore:'В катакомбах заперты воспоминания семей. Призраки проклинают землю, хранитель меняет место ритуала.',ground:'stone',palette:{ground:'#403749',light:'#786883',grass:'#625675',tree:'#292837',accent:'#d7b3ee'}},
  {name:'Плато расколотого неба',coins:80,awaken:20,bossTime:80,roster:[{kind:'knight',count:4},{kind:'dragon',count:3},{kind:'vampire',count:3}],speed:208,bossName:'Вестник последней бури',bossTexture:'necromancer',bossHP:1900,bossMoves:['snipe','nova','meteor','quake','combo'],fog:0x87aab8,lore:'Старая обсерватория управляет бурями дракона. Читай линии выстрелов и держись между кольцами волн.',ground:'stone',palette:{ground:'#485969',light:'#81959a',grass:'#61767d',tree:'#303f53',accent:'#d7eef2'}},
  { name: 'Сердце сумеречного леса', coins: 95, awaken: 22, bossTime: 90, roster: [{ kind: 'vampire', count: 3 }, { kind: 'necromancer', count: 2 }, { kind: 'dragon', count: 3 }, { kind: 'skeleton', count: 3 }], speed: 215,
    bossName: 'Дракон пожиратель душ', bossTexture: 'dragon', bossHP: 2450, bossMoves: ['breath', 'charge', 'meteor', 'summon', 'nova', 'quake'], fog: 0x64989e,
    lore: 'За восемью печатями дракон держит семью лиса и украденную казну. Победи его, чтобы открыть темницу.', ground: 'grass',
    palette: { ground: '#30594f', light: '#72927f', grass: '#658769', tree: '#21433d', accent: '#c2e5d5' } },
];
export const WORLD_WIDTH = PROLOGUE_WIDTH + REGION_STEP * REGIONS.length - ROAD_WIDTH;
export const regionStart = (index: number): number => PROLOGUE_WIDTH + index * REGION_STEP;
export const regionEnd = (index: number): number => regionStart(index) + REGION_WIDTH;
export const merchantPosition = (index: number) => ({ x: regionEnd(index) + ROAD_WIDTH / 2, y: WORLD_HEIGHT / 2 });
export const checkpointPosition = (index: number) => ({ x: regionStart(index) + 100, y: WORLD_HEIGHT / 2 + 38 });

export const villagePosition=(index:number)=>index<0?{x:PROLOGUE_WIDTH*.5,y:WORLD_HEIGHT/2}:merchantPosition(index);
export const VILLAGE_NAMES=['Приют на опушке','Деревня Серебряный дым','Убежище каменщиков','Лунная переправа','Станция белого ветра','Посёлок забытых имён','Приют звёздочётов','Последний огонь'];

export const REGION_INCOME=REGIONS.map((_,i)=>140+i*28);
export const REGION_THEMES=['forest','ruins','swamp','ash','ice','crypt','storm','heart'] as const;
