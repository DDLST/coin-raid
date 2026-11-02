import {
  ENEMY_KINDS,
  PROLOGUE_WIDTH,
  REGION_STEP,
  REGION_WIDTH,
  ROAD_WIDTH,
  WORLD_HEIGHT,
} from '../Constants';
import { type BossAttack } from '../enemies/BossPatterns';
import { type Palette } from '../rendering/textures/TexturePrimitives';

export type EnemyKind = (typeof ENEMY_KINDS)[number];
export type EnemyAttack =
  | BossAttack
  | 'slash'
  | 'charge'
  | 'slam'
  | 'poison'
  | 'summon'
  | 'fan'
  | 'blink'
  | 'meteor'
  | 'breath'
  | 'combo'
  | 'nova'
  | 'snipe'
  | 'quake'
  | 'curse';
export type Region = {
  name: string;
  coins: number;
  awaken: number;
  roster: { kind: Exclude<EnemyKind, 'boss'>; count: number }[];
  speed: number;
  bossName: string;
  bossTexture: string;
  bossHP: number;
  bossMoves: readonly BossAttack[];
  fog: number;
  lore: string;
  ground: 'grass' | 'stone' | 'water' | 'ash';
  palette: Palette;
};

export const regionStart = (index: number): number => PROLOGUE_WIDTH + index * REGION_STEP;
export const regionEnd = (index: number): number => regionStart(index) + REGION_WIDTH;
export const merchantPosition = (index: number) => ({
  x: regionEnd(index) + ROAD_WIDTH / 2,
  y: WORLD_HEIGHT / 2,
});
export const checkpointPosition = (index: number) => ({
  x: regionStart(index) + 100,
  y: WORLD_HEIGHT / 2 + 38,
});

export const villagePosition = (index: number) =>
  index < 0 ? { x: PROLOGUE_WIDTH * 0.5, y: WORLD_HEIGHT / 2 } : merchantPosition(index);
