import Phaser from 'phaser';
import { GAME_CONFIG } from '../Constants';
import { type Hazard } from '../combat/HazardSystem';
import { type Projectile } from '../combat/ProjectileSystem';
import { type Enemy } from '../enemies/EnemyTypes';
import { type SavedChest } from '../persistence/SaveSchema';
import { type BiomeMood } from '../rendering/Atmosphere';
import { type Area, type LineId, type Role } from '../story/StoryProgress';
import { type House } from '../village/VillageLayout';
import { type NavGrid, type Point, type Terrain } from './Navigation';
import { type Strike, type WeatherKind } from './WeatherSystem';

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
  weatherNext: number = GAME_CONFIG.firstWeatherDelay;
  wetZones: (Point & {
    radius: number;
  })[] = [];
  strike: Strike | null = null;
  strikeNext: number = GAME_CONFIG.firstStrikeDelay;
  biomeMoods: BiomeMood[] = [];
  hurricane:
    | (Point & {
        phase: number;
      })
    | null = null;
  windSoundLeft = 0;
  drawnRegions = new Set<number>();
  drawnVillages = new Set<number>();

  resetJourney(): void {
    this.regionIndex = 0;
    this.villageIndex = -1;
    this.lastVillage = -1;
    this.area = 'village';
    this.wispFear = 0;
    this.wispPath = [];
    this.wispPathLeft = 0;
    for (const villager of this.villagers) {
      villager.near = false;
      villager.greetUntil = 0;
    }
  }
  resetScene(): void {
    Object.assign(this, new WorldState());
  }
}
