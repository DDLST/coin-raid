import type Phaser from 'phaser';
import { type SavedChest } from '../persistence/SaveSchema';
import { type Terrain, type NavGrid, type Point } from './Navigation';
import { type Enemy } from '../enemies/EnemyTypes';
import { type Projectile, type Hazard } from '../combat/CombatEffects';
import { type Area, type Role, type LineId } from '../story/StoryContent';
import { type House } from '../village/VillageLayout';
import { type WeatherKind, type Strike } from './WeatherSystem';
import { type BiomeMood } from '../rendering/Atmosphere';
/** Объекты мира, геометрия, текущая область и состояние погоды. */
export type Coin = {
  region: number;
  sprite: Phaser.GameObjects.Image;
  value: number;
  phase: number;
};
export type Chest = SavedChest & {
  sprite: Phaser.GameObjects.Image;
};
export class WorldState {
  terrain: Terrain[] = [];
  terrainByRegion: Terrain[][] = [];
  nav: NavGrid[] = [];
  bossNav: NavGrid[] = [];
  enemies: Enemy[] = [];
  coins: Coin[] = [];
  projectiles: Projectile[] = [];
  hazards: Hazard[] = [];
  chests: Chest[] = [];
  merchants: Phaser.GameObjects.Image[] = [];
  fires: Phaser.GameObjects.Image[] = [];
  regionIndex = 0;
  area: Area = 'village';
  villageIndex = -1;
  lastVillage = -1;
  villagers: {
    village: number;
    role: Role;
    sprite: Phaser.GameObjects.Image;
    gesture: Phaser.GameObjects.Graphics;
    near: boolean;
    greetUntil: number;
  }[] = [];
  houses: House[] = [];
  interiorRole: Role | null = null;
  interiorReturn: 'village' | 'tutorial' = 'village';
  interiorLayer: Phaser.GameObjects.Container | null = null;
  interiorShade: Phaser.GameObjects.Rectangle | null = null;
  outdoorArt: (Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Visible)[] = [];
  questProps: {
    id: LineId;
    order: number;
    point: Point;
    sprite: Phaser.GameObjects.Image;
  }[] = [];
  wisp: Phaser.GameObjects.Image | null = null;
  wispFear = 0;
  wispPath: Point[] = [];
  wispPathLeft = 0;
  weather: WeatherKind = 'clear';
  weatherLeft = 0;
  weatherNext = 13;
  wetZones: (Point & {
    radius: number;
  })[] = [];
  strike: Strike | null = null;
  strikeNext = 2;
  biomeMoods: BiomeMood[] = [];
  hurricane:
    | (Point & {
        phase: number;
      })
    | null = null;
  windSoundLeft = 0;
  drawnRegions = new Set<number>();
  drawnVillages = new Set<number>();
}
