import type { Palette } from './art';
export const REGION_WIDTH = 1280;
export const ROAD_WIDTH = 280;
export const REGION_STEP = REGION_WIDTH + ROAD_WIDTH;
export const WORLD_HEIGHT = 1100;
export type Region = { name: string; coins: number; bossTime: number; wolves: number; boars: number; hunters: number;
  speed: number; bossName: string; bossTexture: string; bossHP: number; bossAttack: 'charge' | 'slam'; palette: Palette };
export const REGIONS: Region[] = [
  { name: 'Роща первых огней', coins: 14, bossTime: 45, wolves: 4, boars: 0, hunters: 0, speed: 125,
    bossName: 'Серый вожак', bossTexture: 'wolf-grey', bossHP: 150, bossAttack: 'charge',
    palette: { ground: '#426b51', light: '#789969', grass: '#728f51', tree: '#264c3a', accent: '#e6c681' } },
  { name: 'Золотые руины', coins: 20, bossTime: 50, wolves: 5, boars: 2, hunters: 0, speed: 143,
    bossName: 'Клык руин', bossTexture: 'boar', bossHP: 240, bossAttack: 'slam',
    palette: { ground: '#79764a', light: '#a9a476', grass: '#89894c', tree: '#565f3f', accent: '#e9d29b' } },
  { name: 'Туманные топи', coins: 28, bossTime: 55, wolves: 6, boars: 2, hunters: 2, speed: 156,
    bossName: 'Страж болот', bossTexture: 'bear', bossHP: 330, bossAttack: 'slam',
    palette: { ground: '#3b6164', light: '#7b9990', grass: '#5b7f71', tree: '#284f50', accent: '#bad5c4' } },
  { name: 'Пепельный перевал', coins: 36, bossTime: 60, wolves: 7, boars: 3, hunters: 3, speed: 169,
    bossName: 'Пепельный охотник', bossTexture: 'hunter', bossHP: 440, bossAttack: 'charge',
    palette: { ground: '#625659', light: '#9e8980', grass: '#827671', tree: '#443f4e', accent: '#f0ba87' } },
  { name: 'Сердце древнего леса', coins: 45, bossTime: 65, wolves: 8, boars: 4, hunters: 4, speed: 182,
    bossName: 'Король зимней стаи', bossTexture: 'wolf-snow', bossHP: 570, bossAttack: 'charge',
    palette: { ground: '#30594f', light: '#72927f', grass: '#658769', tree: '#21433d', accent: '#e5d593' } },
];
export const WORLD_WIDTH = REGION_STEP * REGIONS.length - ROAD_WIDTH;
export const regionStart = (index: number): number => index * REGION_STEP;
export const regionEnd = (index: number): number => regionStart(index) + REGION_WIDTH;
export const merchantPosition = (index: number) => ({ x: regionEnd(index) + ROAD_WIDTH / 2, y: WORLD_HEIGHT / 2 });
