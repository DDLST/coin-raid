import Phaser from 'phaser';
import { type GameState } from '../core/GameStateSystem';
import { type AchievementId } from '../progression/Achievements';
import { type Loot } from '../quests/LootRollRules';
import { type Role } from '../story/StoryProgress';
import { type Point } from '../world/Navigation';

/** Режим игры, выбор окон, ввод, диалоги и уведомления. */
export type ShopTab = 'weapons' | 'armors' | 'upgrades' | 'skins' | 'supplies' | 'growth';
export type MenuTab = 'overview' | 'equipment' | 'skills' | 'quests' | 'achievements' | 'settings';
export class InterfaceState {
  keys!: Record<string, Phaser.Input.Keyboard.Key>;
  listeners!: AbortController;
  nearestNPC = -1;
  dialogRole: Role = 'smith';
  nearestHouse = -1;
  nearestProp = -1;
  questView: 'trials' | 'story' | 'delivery' = 'trials';
  questPage = 0;
  mapMode: 'local' | 'world' = 'local';
  mapFocusRegion: number | null = null;
  mapFocusVillage: number | null = null;
  confirmReturn: GameState = 'playing';
  confirmTarget: 'title' | 'new' = 'title';
  achievementQueue: AchievementId[] = [];
  achievementLeft = 0;
  achievementPage = 0;
  mouse: Point | null = null;
  mouseHeld = false;
  hudLeft = 0;
  toastTimeout = 0;
  checkpointBannerLeft = 0;
  nearestChest = -1;
  dialogTarget = '';
  dialogTime = 0;
  shopTab: ShopTab = 'weapons';
  shopPage = 0;
  menuTab: MenuTab = 'overview';
  menuReturn: GameState = 'playing';
  mapReturn: GameState = 'playing';
  equipmentTab: 'weapons' | 'armors' | 'skins' = 'weapons';
  equipmentPage = 0;
  guideWanted = true;
  briefingPage = 0;
  loot: Loot | null = null;
  lootLeft = 0;
  bossDigit = -1;
  bossDigitLeft = 0;

  resetSession(): void {
    const { keys, listeners } = this;
    Object.assign(this, new InterfaceState());
    this.keys = keys;
    this.listeners = listeners;
  }
}
