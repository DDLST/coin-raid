import armedMotionAtlas from '../assets/armed-motion-atlas.webp?url';
import biomeAtlas from '../assets/biome-atlas.webp?url';
import combatAtlas from '../assets/combat-atlas.webp?url';
import creepAtlas from '../assets/creep-atlas.webp?url';
import detailsAtlas from '../assets/details-atlas.webp?url';
import equipmentAtlas from '../assets/equipment-atlas.webp?url';
import heroAtlas from '../assets/hero-atlas.webp?url';
import interiorsAtlas from '../assets/interiors-atlas.webp?url';
import track0 from '../assets/music/boss-battle-10-metal.mp3?url';
import track1 from '../assets/music/boss-battle-2-symphonic-metal.mp3?url';
import track2 from '../assets/music/boss-battle-9-metal.mp3?url';
import track3 from '../assets/music/choir-1.mp3?url';
import track4 from '../assets/music/choir-2.mp3?url';
import track5 from '../assets/music/choir-3.mp3?url';
import track6 from '../assets/music/fairy-adventure.mp3?url';
import track7 from '../assets/music/fight-for-better-future-rockmetal.mp3?url';
import track8 from '../assets/music/heavy-battle-1.mp3?url';
import track9 from '../assets/music/heavy-battle-2.mp3?url';
import residentAtlas from '../assets/resident-atlas.webp?url';
import rollAtlas from '../assets/roll-atlas.webp?url';
import storyAtlas from '../assets/story-atlas.webp?url';
import strideAtlas from '../assets/stride-atlas.webp?url';
import villageAtlas from '../assets/village-atlas.webp?url';
import { type AudioSettings } from './audio/GameAudio';
import { type TrackId } from './audio/Soundtrack';
import { type GameState } from './core/GameStateSystem';
import { type BossAttack } from './enemies/BossPatterns';
import { type WeaponId } from './progression/PlayerProgression';
import { type SkillId } from './progression/Skills';
import { type DeliveryId, type LineId, type Role } from './story/StoryProgress';
import { type Terrain } from './world/Navigation';
import { type WeatherKind } from './world/WeatherSystem';
import { type EnemyAttack, type EnemyKind, type Region } from './world/WorldLayout';

// Допустимые переходы. Новое путешествие использует отдельный reset().
export const GAME_TRANSITIONS: Record<GameState, readonly GameState[]> = {
  ready: ['playing'],
  playing: [
    'ready',
    'paused',
    'intro',
    'story',
    'dialog',
    'menu',
    'map',
    'loot',
    'dying',
    'won',
    'confirm',
  ],
  paused: ['playing', 'menu', 'map', 'confirm', 'ready'],
  intro: ['playing', 'ready'],
  story: ['playing', 'won', 'ready'],
  dialog: ['playing', 'shop', 'ready'],
  shop: ['dialog', 'ready'],
  menu: ['playing', 'paused', 'map', 'travel', 'confirm', 'ready'],
  map: ['playing', 'paused', 'menu', 'ready'],
  loot: ['playing', 'ready'],
  dying: ['playing', 'ready'],
  won: ['playing', 'confirm', 'ready'],
  confirm: ['playing', 'paused', 'menu', 'won', 'ready'],
  travel: ['menu', 'playing', 'ready'],
};

// Время задаётся в секундах; значения с суффиксом Ms — в миллисекундах.
// Параметры механик объявлены до каталогов: описания вычисляются из тех же значений.
export const DODGE_TIME = 0.27;

export const DODGE_COST = 25;

export const HURT_PROTECTION = 0.62;

export const FLASK_HEAL = 38;

export const POTION_HEAL = 55;

export const ULTIMATE_MAX = 100;

export const PLAYER_DAMAGE_SCALE = 0.85;

export const PLAYER_RADIUS = 16;

export const STAMINA_DELAY = 0.48;

export const PARRY_DURATION = 0.24;

export const PERFECT_PARRY = 0.14;

export const COUNTER_WINDOW = 1.15;

// Герой: ресурсы, защита, движение и восстановление
export const PLAYER_CONFIG = {
  baseHP: 100,
  baseStamina: 100,
  speed: 250,
  damage: 26,
  resourceUpgradeGain: 15,
  speedUpgradeScale: 0.06,
  damageUpgradeScale: 0.12,
  armorUpgradeScale: 0.06,
  wardUpgradeScale: 0.12,
  minArmorScale: 0.45,
  minWardScale: 0.35,
  embersealWardScale: 0.82,
  staminaRegen: 29,
  focusRegenScale: 0.1,
  enduranceRegenScale: 0.03,
  dodgeCooldown: 0.95,
  dodgeUpgradeReduction: 0.1,
  dodgeSpeedScale: 2.7,
  attackSpeedScale: 0.4,
  healCooldown: 1.1,
  potionHealthRatio: 0.3,
  parryFrontArc: 1.1,
  blockDamageScale: 0.45,
  shieldDamageScale: 0.65,
  minDamage: 2,
  hurtFlashDuration: 0.22,
  counterBossStun: 0.65,
  counterMinionStun: 1.15,
  parryUltimateGain: 18,
  damageKnockback: 25,
  wispFearDuration: 1.4,
  magnetUpgradeRadius: 20,
} as const;

// Обучение: уроки, противники и осколки
export const TUTORIAL_CONFIG = {
  movementGoalX: 285,
  waypoint: { x: 305, y: 550 },
  stationaryStun: 999,
  enemyDamage: 5,
  enemySpeed: 65,
  enemyClock: 0.7,
  restoredEnemyClock: 0.8,
  finalLesson: 10,
  parryLesson: 3,
  coinLesson: 1,
  attackLesson: 2,
  dodgeLesson: 4,
  healLesson: 5,
  ultimateLesson: 6,
  trainingHealth: 600,
  trainingWound: 45,
  finalHealth: 35,
  finalSpeed: 115,
  finalClock: 2,
  coinStartX: 375,
  coinSpacing: 60,
  coinY: 550,
  weaponCoins: 3,
} as const;

// Абсолютное умение: одинаковые параметры расчёта и анимации
export const ULTIMATE_CONFIG = {
  duration: 0.86,
  protection: 0.45,
  dawnbladeHeal: 20,
  pulseInterval: 0.25,
  animationCycle: 0.28,
  axePulses: 3,
  swordPulses: 2,
  spearReach: 440,
  axeReach: 150,
  swordReach: 185,
  spearArc: 0.3,
  axeDamage: 1,
  damage: 2.4,
  spiritUpgradeScale: 0.2,
  staffShots: 8,
  runicStaffShots: 12,
  projectileSpeed: 470,
  projectileDamage: 2,
  projectileBlast: 85,
  knockback: 55,
} as const;

// Обычные атаки, серии и награды за попадания
export const COMBAT_CONFIG = {
  comboWindow: 1.2,
  comboLength: 3,
  parryCost: 12,
  counterDistance: 240,
  counterStep: 70,
  counterGap: 95,
  axeComboArc: 0.5,
  axeComboReachBonus: 12,
  axeComboDamage: 1.35,
  hitCharge: 5,
  dawnbladeHeal: 2,
  recoveryHealPerLevel: 2,
  killScoreMultiplier: 40,
  pickupScoreMultiplier: 100,
  pickupCharge: 3,
  maxPickupCharge: 12,
  bleedDuration: 3,
  bleedInterval: 1,
  bleedDamageScale: 0.18,
} as const;

// Страницы карточек и уведомления
export const UI_CONFIG = {
  itemsPerPage: 4,
  achievementDuration: 4.5,
  achievementFade: 0.45,
  lootDuration: 2.45,
  lootEntries: 18,
  lootWinner: 14,
  lootCellWidth: 96,
  lootCellCenter: 44,
  lootFallbackWidth: 350,
  lootTransition: 'transform 2.3s cubic-bezier(.15,.66,.17,1)',
} as const;

// Кадр, интерфейс и начальные условия
export const GAME_CONFIG = {
  fallbackWidth: 960,
  fallbackHeight: 560,
  backgroundColor: '#10191e',
  targetFps: 60,
  maxFrameMs: 40,
  hudInterval: 0.09,
  dialogCharactersPerSecond: 78,
  toastDurationMs: 3200,
  checkpointDuration: 2.7,
  deathDuration: 0.8,
  deathRotationSpeed: 110,
  deathMaxAngle: 85,
  deathMinAlpha: 0.2,
  storyFrameDuration: 12,
  combatMusicDistance: 420,
  combatMusicHold: 3,
  bossWarningCoins: 10,
  bossUrgentCoins: 3,
  bossDigitDuration: 0.78,
  initialProtection: 2,
  loadProtection: 1.2,
  firstRegionY: 588,
  initialFlasks: 2,
  firstWeatherDelay: 13,
  firstStrikeDelay: 2,
  keys: 'W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,SHIFT,J,Q,V,E,P,ESC,ENTER,H,M,F,R,TAB,C,ONE,TWO,THREE',
} as const;

export const SKILL_KEYS = ['ONE', 'TWO', 'THREE'] as const;
export const SESSION_OVERLAYS = [
  'briefing-overlay',
  'dialog-overlay',
  'shop-overlay',
  'map-overlay',
  'menu-overlay',
  'loot-overlay',
  'intro-overlay',
  'story-overlay',
  'training-overlay',
  'confirm-overlay',
  'travel-overlay',
  'training-panel',
  'achievement-banner',
  'checkpoint-banner',
  'boss-countdown',
  'interaction',
] as const;
// Приёмы и названия боссов
export const BOSS_MOVES = [
  ['oath-cross', 'blade-wheel', 'grave-spears'],
  ['tomb-cage', 'grave-hands', 'funeral-march'],
  ['blood-eclipse', 'mirror-hunt', 'blood-tethers'],
  ['ritual-star', 'soul-spiral', 'pyre-procession'],
  ['frost-maze', 'ice-pincers', 'crown-sweep'],
  ['memory-trap', 'spectral-waltz', 'silence-seal'],
  ['storm-grid', 'orbit-lances', 'sky-collapse'],
  ['dragon-sweep', 'world-fracture', 'soul-prison'],
] as const;

export const BOSS_NAMES: Record<BossAttack, string> = {
  'oath-cross': 'Крест забытой клятвы',
  'blade-wheel': 'Колесо клинков',
  'grave-spears': 'Могильные копья',
  'tomb-cage': 'Гробовая клетка',
  'grave-hands': 'Руки из могил',
  'funeral-march': 'Похоронный марш',
  'blood-eclipse': 'Кровавое затмение',
  'mirror-hunt': 'Охота отражений',
  'blood-tethers': 'Кровавые нити',
  'ritual-star': 'Звезда костяного ритуала',
  'soul-spiral': 'Спираль душ',
  'pyre-procession': 'Шествие погребальных огней',
  'frost-maze': 'Ледяной лабиринт',
  'ice-pincers': 'Ледяные тиски',
  'crown-sweep': 'Осколки короны',
  'memory-trap': 'Ловушка памяти',
  'spectral-waltz': 'Призрачный вальс',
  'silence-seal': 'Печать безмолвия',
  'storm-grid': 'Шахматы бури',
  'orbit-lances': 'Копья орбиты',
  'sky-collapse': 'Падение небес',
  'dragon-sweep': 'Крылья пожирателя',
  'world-fracture': 'Разлом мира',
  'soul-prison': 'Темница душ',
};

export const BOSS_ATTACK_IDS = new Set<string>(BOSS_MOVES.flat());

// Размеры мира, биомы и цели
export const REGION_WIDTH = 1280;

export const ROAD_WIDTH = 950;

export const PROLOGUE_WIDTH = 1120;

export const REGION_STEP = REGION_WIDTH + ROAD_WIDTH;

export const WORLD_HEIGHT = 1100;

export const ENEMY_KINDS = [
  'skeleton',
  'zombie',
  'necromancer',
  'vampire',
  'dragon',
  'wraith',
  'knight',
  'archer',
  'alchemist',
  'shade',
  'gargoyle',
  'boss',
] as const;

export const REGIONS: Region[] = [
  {
    name: 'Роща забытых',
    coins: 24,
    awaken: 8,
    roster: [
      { kind: 'skeleton', count: 4 },
      { kind: 'archer', count: 1 },
      { kind: 'zombie', count: 3 },
      { kind: 'necromancer', count: 1 },
    ],
    speed: 155,
    bossName: 'Рыцарь без клятвы',
    bossTexture: 'skeleton',
    bossHP: 480,
    bossMoves: BOSS_MOVES[0],
    fog: 0x6eafa5,
    lore: 'Проклятие подняло стражей рощи. Скелеты перехватывают путь, мертвецы оставляют яд.',
    ground: 'grass',
    palette: {
      ground: '#426b51',
      light: '#789969',
      grass: '#728f51',
      tree: '#264c3a',
      accent: '#c6e6b1',
    },
  },
  {
    name: 'Некрополь золотых руин',
    coins: 32,
    awaken: 10,
    roster: [
      { kind: 'skeleton', count: 3 },
      { kind: 'archer', count: 2 },
      { kind: 'zombie', count: 3 },
      { kind: 'alchemist', count: 1 },
      { kind: 'necromancer', count: 1 },
    ],
    speed: 168,
    bossName: 'Могильный исполин',
    bossTexture: 'zombie',
    bossHP: 680,
    bossMoves: BOSS_MOVES[1],
    fog: 0xbfb47c,
    lore: 'Под руинами лежит заражённая могила. Некромант поднимает павших, исполин заражает землю.',
    ground: 'stone',
    palette: {
      ground: '#77744a',
      light: '#a9a476',
      grass: '#89894c',
      tree: '#565f3f',
      accent: '#e9d29b',
    },
  },
  {
    name: 'Топи кровавой луны',
    coins: 40,
    awaken: 12,
    roster: [
      { kind: 'zombie', count: 3 },
      { kind: 'vampire', count: 3 },
      { kind: 'shade', count: 1 },
      { kind: 'necromancer', count: 2 },
      { kind: 'alchemist', count: 1 },
    ],
    speed: 181,
    bossName: 'Госпожа тумана',
    bossTexture: 'vampire',
    bossHP: 900,
    bossMoves: BOSS_MOVES[2],
    fog: 0x9b83b5,
    lore: 'Лунный туман питает вампиров. Перед прыжком они оставляют метку; кровавые чары летят веером.',
    ground: 'water',
    palette: {
      ground: '#3b5664',
      light: '#7b8c99',
      grass: '#5b717f',
      tree: '#284650',
      accent: '#d4bad5',
    },
  },
  {
    name: 'Пепельное святилище',
    coins: 50,
    awaken: 14,
    roster: [
      { kind: 'skeleton', count: 4 },
      { kind: 'necromancer', count: 3 },
      { kind: 'dragon', count: 3 },
    ],
    speed: 192,
    bossName: 'Архонт костяного пламени',
    bossTexture: 'necromancer',
    bossHP: 1120,
    bossMoves: BOSS_MOVES[3],
    fog: 0xa46a55,
    lore: 'Архонт связал кости с драконьим огнём. Его ритуал вызывает прислужников и падающие огненные печати.',
    ground: 'ash',
    palette: {
      ground: '#625659',
      light: '#9e8980',
      grass: '#827671',
      tree: '#443f4e',
      accent: '#f0ba87',
    },
  },
  {
    name: 'Цитадель белого ветра',
    coins: 60,
    awaken: 16,
    roster: [
      { kind: 'skeleton', count: 4 },
      { kind: 'knight', count: 2 },
      { kind: 'gargoyle', count: 1 },
      { kind: 'wraith', count: 3 },
    ],
    speed: 196,
    bossName: 'Страж ледяной короны',
    bossTexture: 'knight',
    bossHP: 1400,
    bossMoves: BOSS_MOVES[4],
    fog: 0x9abfd9,
    lore: 'Ледяная печать удерживает голоса пленников. Латы стражей закрывают фронт, но не спину.',
    ground: 'stone',
    palette: {
      ground: '#496478',
      light: '#99b1ba',
      grass: '#8dabb3',
      tree: '#334e67',
      accent: '#d5f3ff',
    },
  },
  {
    name: 'Катакомбы тихих голосов',
    coins: 70,
    awaken: 18,
    roster: [
      { kind: 'necromancer', count: 3 },
      { kind: 'wraith', count: 2 },
      { kind: 'shade', count: 2 },
      { kind: 'zombie', count: 2 },
      { kind: 'archer', count: 1 },
    ],
    speed: 201,
    bossName: 'Хранитель безымянных',
    bossTexture: 'wraith',
    bossHP: 1650,
    bossMoves: BOSS_MOVES[5],
    fog: 0x8d72b5,
    lore: 'В катакомбах заперты воспоминания семей. Призраки проклинают землю, хранитель меняет место ритуала.',
    ground: 'stone',
    palette: {
      ground: '#403749',
      light: '#786883',
      grass: '#625675',
      tree: '#292837',
      accent: '#d7b3ee',
    },
  },
  {
    name: 'Плато расколотого неба',
    coins: 80,
    awaken: 20,
    roster: [
      { kind: 'knight', count: 2 },
      { kind: 'gargoyle', count: 2 },
      { kind: 'dragon', count: 3 },
      { kind: 'vampire', count: 3 },
    ],
    speed: 208,
    bossName: 'Вестник последней бури',
    bossTexture: 'necromancer',
    bossHP: 1900,
    bossMoves: BOSS_MOVES[6],
    fog: 0x87aab8,
    lore: 'Старая обсерватория управляет бурями дракона. Читай линии выстрелов и держись между кольцами волн.',
    ground: 'stone',
    palette: {
      ground: '#485969',
      light: '#81959a',
      grass: '#61767d',
      tree: '#303f53',
      accent: '#d7eef2',
    },
  },
  {
    name: 'Сердце сумеречного леса',
    coins: 95,
    awaken: 22,
    roster: [
      { kind: 'vampire', count: 2 },
      { kind: 'shade', count: 1 },
      { kind: 'necromancer', count: 2 },
      { kind: 'dragon', count: 2 },
      { kind: 'gargoyle', count: 1 },
      { kind: 'skeleton', count: 3 },
    ],
    speed: 215,
    bossName: 'Дракон пожиратель душ',
    bossTexture: 'dragon',
    bossHP: 2450,
    bossMoves: BOSS_MOVES[7],
    fog: 0x64989e,
    lore: 'За восемью печатями дракон держит семью лиса и украденную казну. Победи его, чтобы открыть темницу.',
    ground: 'grass',
    palette: {
      ground: '#30594f',
      light: '#72927f',
      grass: '#658769',
      tree: '#21433d',
      accent: '#c2e5d5',
    },
  },
];

export const WORLD_WIDTH = PROLOGUE_WIDTH + REGION_STEP * REGIONS.length - ROAD_WIDTH;

export const VILLAGE_NAMES = [
  'Приют на опушке',
  'Деревня Серебряный дым',
  'Убежище каменщиков',
  'Лунная переправа',
  'Станция белого ветра',
  'Посёлок забытых имён',
  'Приют звёздочётов',
  'Последний огонь',
];

export const REGION_INCOME = REGIONS.map((_, i) => 140 + i * 28);

export const REGION_THEMES = [
  'forest',
  'ruins',
  'swamp',
  'ash',
  'ice',
  'crypt',
  'storm',
  'heart',
] as const;

export const PICKUP_RADIUS = 31;

export const INTERACT_DISTANCE = 112;

// Параметры противников и волн
export const PATH_INTERVAL = 0.45;

export const MAX_MINIONS = 18;

export const WAVE_FIRST = 4;

export const WAVE_SIZE = 3;

export const BOSS_REWARD = 45;

export const THIRD_BIOME_DAMAGE = 0.74;

export const THIRD_BIOME_WINDUP = 1.18;

export const ENEMY_BASE_HP: Record<Exclude<EnemyKind, 'boss'>, number> = {
  skeleton: 64,
  zombie: 94,
  necromancer: 78,
  vampire: 92,
  dragon: 138,
  wraith: 100,
  knight: 140,
  archer: 65,
  alchemist: 84,
  shade: 96,
  gargoyle: 155,
};

// Сохранения, снаряжение и улучшения
export const PROFILE_KEY = 'raid-coin-manual-v5';

export const LEGACY_KEYS = [
  'raid-coin-profile-v1',
  'raid-coin-profile-v2',
  'raid-coin-profile-v3',
  'raid-coin-profile-v4',
  'raid-coin-profile',
  'raid-coin-best-v3',
  'raid-coin-best-v4',
];

export const SKINS = [
  { id: 'fox', name: 'Рыжий', price: 0, fur: '#efa359', scarf: '#61c8b2' },
  {
    id: 'fox-moon',
    name: 'Лунный',
    price: 45,
    fur: '#e4e3dc',
    scarf: '#b4a1d4',
  },
  {
    id: 'fox-ember',
    name: 'Огненный',
    price: 75,
    fur: '#ac5b42',
    scarf: '#efc75f',
  },
  {
    id: 'fox-forest',
    name: 'Лесной',
    price: 110,
    fur: '#927453',
    scarf: '#93ba65',
  },
  {
    id: 'fox-royal',
    name: 'Королевский',
    price: 150,
    fur: '#deb268',
    scarf: '#a45865',
  },
  {
    id: 'fox-ash',
    name: 'Пепельный',
    price: 190,
    fur: '#6d737a',
    scarf: '#eac780',
  },
  {
    id: 'fox-star',
    name: 'Звёздный',
    price: 270,
    fur: '#c7b9d3',
    scarf: '#82b5b6',
  },
] as const;

export const WEAPONS = [
  {
    id: 'sword',
    style: 'sword',
    name: 'Духовный меч',
    icon: '⚔',
    price: 0,
    quest: false,
    type: 'slash',
    reach: 105,
    arc: 0.82,
    damage: 0.92,
    cost: 16,
    windup: 0.1,
    activeEnd: 0.22,
    duration: 0.43,
    color: 0xa7eff4,
    description: `Три быстрых дуги. ПКМ: парирование на ${PARRY_DURATION} с.`,
    ultimate: 'Круг души',
    ultimateHint: `${ULTIMATE_CONFIG.swordPulses} волны радиусом ${ULTIMATE_CONFIG.swordReach}`,
  },
  {
    id: 'spear',
    style: 'spear',
    name: 'Копьё памяти',
    icon: '↗',
    price: 90,
    quest: false,
    type: 'thrust',
    reach: 168,
    arc: 0.28,
    damage: 1.22,
    cost: 21,
    windup: 0.16,
    activeEnd: 0.29,
    duration: 0.56,
    color: 0xbfd8ff,
    description: 'Узкий выпад по строю. ПКМ: тяжёлый выпад с шагом.',
    ultimate: 'Линия судьбы',
    ultimateHint: `Пробивающий луч длиной ${ULTIMATE_CONFIG.spearReach}`,
  },
  {
    id: 'axe',
    style: 'axe',
    name: 'Секира клятвы',
    icon: '⛏',
    price: 150,
    quest: false,
    type: 'sweep',
    reach: 118,
    arc: 1.4,
    damage: 1.8,
    cost: 32,
    windup: 0.28,
    activeEnd: 0.43,
    duration: 0.82,
    color: 0xffc48a,
    description: 'Мощная дуга. ПКМ: медленный круговой удар по земле.',
    ultimate: 'Вихрь клятвы',
    ultimateHint: `${ULTIMATE_CONFIG.axePulses} круговых удара радиусом ${ULTIMATE_CONFIG.axeReach}`,
  },
  {
    id: 'staff',
    style: 'staff',
    name: 'Посох эха',
    icon: '✧',
    price: 210,
    quest: false,
    type: 'magic',
    reach: 400,
    arc: 0.22,
    damage: 0.8,
    cost: 20,
    windup: 0.2,
    activeEnd: 0.32,
    duration: 0.66,
    color: 0xd1b3ff,
    description: 'Магический сгусток. ПКМ: отложенная печать под прицелом.',
    ultimate: 'Созвездие',
    ultimateHint: `${ULTIMATE_CONFIG.staffShots} магических лучей и защитная вспышка`,
  },
  {
    id: 'dawnblade',
    style: 'sword',
    name: 'Клинок Рассвета',
    icon: '☀',
    price: 0,
    quest: true,
    type: 'slash',
    reach: 116,
    arc: 0.88,
    damage: 1.08,
    cost: 18,
    windup: 0.11,
    activeEnd: 0.24,
    duration: 0.46,
    color: 0xffe3a1,
    description: 'Награда «Голос забытых». Попадания возвращают 2 HP.',
    ultimate: 'Рассвет',
    ultimateHint: `${ULTIMATE_CONFIG.swordPulses} волны и исцеление на ${ULTIMATE_CONFIG.dawnbladeHeal} HP`,
  },
  {
    id: 'runicstaff',
    style: 'staff',
    name: 'Посох трёх печатей',
    icon: '✺',
    price: 0,
    quest: true,
    type: 'magic',
    reach: 430,
    arc: 0.22,
    damage: 0.62,
    cost: 27,
    windup: 0.23,
    activeEnd: 0.35,
    duration: 0.73,
    color: 0x95f1cc,
    description: 'Награда «Письма хранителя». Тройной магический веер.',
    ultimate: 'Три печати',
    ultimateHint: `${ULTIMATE_CONFIG.runicStaffShots} магических лучей`,
  },
] as const;

export const ARMORS = [
  {
    id: 'travel',
    name: 'Дорожный плащ',
    icon: '♧',
    price: 0,
    reduction: 0,
    speed: 1,
    regen: 1,
    stamina: 0,
    ward: 0,
    color: 0x65bdb5,
    description: 'Лёгкий стартовый плащ',
  },
  {
    id: 'ranger',
    name: 'Доспех странника',
    icon: '◇',
    price: 80,
    reduction: 0.14,
    speed: 1.04,
    regen: 1.1,
    stamina: 10,
    ward: 0.08,
    color: 0x9cad78,
    description: '-14% урона · +4% скорости · +10 выносливости',
  },
  {
    id: 'iron',
    name: 'Латы хранителя',
    icon: '▣',
    price: 175,
    reduction: 0.3,
    speed: 0.9,
    regen: 0.9,
    stamina: 0,
    ward: 0.12,
    color: 0xb0b9c8,
    description: '-30% урона · тяжелее и медленнее',
  },
  {
    id: 'robe',
    name: 'Роба рассвета',
    icon: '✦',
    price: 240,
    reduction: 0.18,
    speed: 1,
    regen: 1.2,
    stamina: 25,
    ward: 0.32,
    color: 0xbeb3ed,
    description: '-18% урона · защита от магии · +25 выносливости',
  },
] as const;

export const ATTRIBUTE_GAIN = 10;
export const ATTRIBUTE_FIRST_PRICE = 100;
export const ATTRIBUTE_PRICE_STEP = 50;

export const ATTRIBUTE_SHOP_HINT = `HP и выносливость: +${ATTRIBUTE_GAIN} за ${ATTRIBUTE_FIRST_PRICE} ◈, затем ${ATTRIBUTE_FIRST_PRICE + ATTRIBUTE_PRICE_STEP}, ${ATTRIBUTE_FIRST_PRICE + ATTRIBUTE_PRICE_STEP * 2}… Усиления сохраняются после смерти. Зелья — в сумке, клавиша V.`;

export const UPGRADES = [
  {
    id: 'vitality',
    name: 'Запас здоровья',
    icon: '♥',
    prices: [ATTRIBUTE_FIRST_PRICE],
    description: `+${ATTRIBUTE_GAIN} HP. Цена +${ATTRIBUTE_PRICE_STEP} за покупку. Доступно всегда.`,
  },
  {
    id: 'focus',
    name: 'Запас выносливости',
    icon: '✧',
    prices: [ATTRIBUTE_FIRST_PRICE],
    description: `+${ATTRIBUTE_GAIN} выносливости, +${Math.round(PLAYER_CONFIG.enduranceRegenScale * 100)}% восстановления. Цена +${ATTRIBUTE_PRICE_STEP}. Всегда доступно.`,
  },
  {
    id: 'speed',
    name: 'Быстрые лапы',
    icon: '➚',
    prices: [45, 90, 160],
    description: `+${Math.round(PLAYER_CONFIG.speedUpgradeScale * 100)}% скорости за ступень`,
  },
  {
    id: 'dash',
    name: 'Лёгкий рывок',
    icon: 'ϟ',
    prices: [40, 85, 150],
    description: `Уклонение восстанавливается на ${PLAYER_CONFIG.dodgeUpgradeReduction} с быстрее`,
  },
  {
    id: 'boots',
    name: 'Сухие лапы',
    icon: '♧',
    prices: [50, 110],
    description: 'Меньше замедление в воде',
  },
  {
    id: 'power',
    name: 'Сила оружия',
    icon: '⚔',
    prices: [55, 115, 190],
    description: `+${Math.round(PLAYER_CONFIG.damageUpgradeScale * 100)}% урона за ступень`,
  },
  {
    id: 'armor',
    name: 'Укрепление брони',
    icon: '◇',
    prices: [65, 135, 220],
    description: `Ещё -${Math.round(PLAYER_CONFIG.armorUpgradeScale * 100)}% получаемого урона`,
  },
  {
    id: 'flask',
    name: 'Дорожная фляга',
    icon: '♜',
    prices: [55, 115, 190],
    description: '+1 заряд лечения у костра',
  },
  {
    id: 'magnet',
    name: 'Зов осколков',
    icon: '◈',
    prices: [45, 95],
    description: `+${PLAYER_CONFIG.magnetUpgradeRadius} к радиусу сбора силы`,
  },
  {
    id: 'ward',
    name: 'Печать от чар',
    icon: '☽',
    prices: [65, 130],
    description: `Ещё -${Math.round(PLAYER_CONFIG.wardUpgradeScale * 100)}% урона магии и яда`,
  },
  {
    id: 'spirit',
    name: 'Абсолютная сила',
    icon: '✺',
    prices: [80, 165],
    description: `+${Math.round(ULTIMATE_CONFIG.spiritUpgradeScale * 100)}% урона абсолютного умения`,
  },
  {
    id: 'recovery',
    name: 'Живое эхо',
    icon: '✚',
    prices: [75, 150],
    description: `Победа над врагом лечит на ${COMBAT_CONFIG.recoveryHealPerLevel} HP за ступень`,
  },
] as const;

// Дерево навыков
export const SKILL_TREE = [
  {
    id: 'sword_cross',
    style: 'sword',
    tier: 1,
    name: 'Перекрёстный удар',
    key: 1,
    seals: 1,
    points: 1,
    price: 30,
    cooldown: 3,
    description: 'Две быстрые дуги по прицелу. 28 выносливости.',
  },
  {
    id: 'sword_lunge',
    style: 'sword',
    tier: 2,
    name: 'Шаг дуэлянта',
    key: 2,
    seals: 3,
    points: 1,
    price: 65,
    cooldown: 4,
    description: 'Рывок вперёд и точный удар. 30 выносливости.',
  },
  {
    id: 'sword_storm',
    style: 'sword',
    tier: 3,
    name: 'Танец клинка',
    key: 3,
    seals: 5,
    points: 2,
    price: 120,
    cooldown: 8,
    description: 'Три широкие дуги; нужно выбрать безопасное окно. 45 выносливости.',
  },
  {
    id: 'spear_pierce',
    style: 'spear',
    tier: 1,
    name: 'Пробить строй',
    key: 1,
    seals: 1,
    points: 1,
    price: 35,
    cooldown: 3,
    description: 'Длинный узкий выпад по нескольким целям. 26 выносливости.',
  },
  {
    id: 'spear_retreat',
    style: 'spear',
    tier: 2,
    name: 'Отступающий выпад',
    key: 2,
    seals: 3,
    points: 1,
    price: 70,
    cooldown: 4,
    description: 'Шаг назад и ответный укол. 32 выносливости.',
  },
  {
    id: 'spear_comet',
    style: 'spear',
    tier: 3,
    name: 'Копьё кометы',
    key: 3,
    seals: 5,
    points: 2,
    price: 125,
    cooldown: 8,
    description: 'Пробивающий выпад на 330 единиц. 46 выносливости.',
  },
  {
    id: 'axe_cleave',
    style: 'axe',
    tier: 1,
    name: 'Рассечение',
    key: 1,
    seals: 2,
    points: 1,
    price: 45,
    cooldown: 4,
    description: 'Вертикальный удар с кровотечением. Узкий прицел, 36 выносливости.',
  },
  {
    id: 'axe_leap',
    style: 'axe',
    tier: 2,
    name: 'Падение клятвы',
    key: 2,
    seals: 3,
    points: 1,
    price: 80,
    cooldown: 5,
    description: 'Прыжок к цели и удар по земле. 42 выносливости.',
  },
  {
    id: 'axe_fault',
    style: 'axe',
    tier: 3,
    name: 'Разлом',
    key: 3,
    seals: 5,
    points: 2,
    price: 140,
    cooldown: 9,
    description: 'Рассекающая линия на 280 единиц. 50 выносливости.',
  },
  {
    id: 'staff_fan',
    style: 'staff',
    tier: 1,
    name: 'Веер эха',
    key: 1,
    seals: 3,
    points: 1,
    price: 50,
    cooldown: 4,
    description: 'Пять отдельных сгустков по разным направлениям. 30 выносливости.',
  },
  {
    id: 'staff_ward',
    style: 'staff',
    tier: 2,
    name: 'Круг защиты',
    key: 2,
    seals: 4,
    points: 1,
    price: 90,
    cooldown: 7,
    description:
      'Волна отталкивает врагов, защита снижает урон на 35% в течение 3 секунд. 38 выносливости.',
  },
  {
    id: 'staff_star',
    style: 'staff',
    tier: 3,
    name: 'Падающая звезда',
    key: 3,
    seals: 6,
    points: 2,
    price: 155,
    cooldown: 10,
    description: 'Большая отложенная печать под мышью. 50 выносливости.',
  },
] as const;

// Достижения
export const ACHIEVEMENTS = [
  {
    id: 'boss_0',
    name: 'Укротитель нежити',
    icon: '☠',
    description: 'Победи первого хозяина. Ты разорвал первую цепь и вернул себе право идти дальше.',
    boss: 0,
  },
  {
    id: 'boss_1',
    name: 'Сильнее могил',
    icon: '♜',
    description: 'Победи хозяина кладбища. Ни туман, ни страх не остановили тебя.',
    boss: 1,
  },
  {
    id: 'boss_2',
    name: 'Победитель кровавой луны',
    icon: '☾',
    description: 'Победи Госпожу тумана. Ещё одна цепь твоей семьи разорвана.',
    boss: 2,
  },
  {
    id: 'boss_3',
    name: 'Пламя под твоей волей',
    icon: '♨',
    description: 'Победи Архонта. Ты выдержал жар и научился читать его замахи.',
    boss: 3,
  },
  {
    id: 'boss_4',
    name: 'Крушитель ледяной короны',
    icon: '❄',
    description: 'Победи ледяного хозяина. Даже холод не погасил твою клятву.',
    boss: 4,
  },
  {
    id: 'boss_5',
    name: 'Вернувший имена',
    icon: '✧',
    description: 'Освободи крипту. Твой путь вернул надежду забытым душам.',
    boss: 5,
  },
  {
    id: 'boss_6',
    name: 'Усмиритель последней бури',
    icon: 'ϟ',
    description: 'Победи хозяина грозы. До семьи осталась последняя печать.',
    boss: 6,
  },
  {
    id: 'boss_7',
    name: 'Защитник своей семьи',
    icon: '♛',
    description: 'Победи дракона. Ты прошёл весь путь и вернул тех, ради кого сражался.',
    boss: 7,
  },
  {
    id: 'counter',
    name: 'Первый ответ',
    icon: '⚔',
    description:
      'Попади контрударом после точного парирования. Теперь чужой замах становится твоим шансом.',
    boss: -1,
  },
  {
    id: 'skill',
    name: 'На пути к мастерству',
    icon: '✦',
    description: 'Изучи первый приём. Ты можешь менять сборку и пробовать свой стиль.',
    boss: -1,
  },
  {
    id: 'delivery',
    name: 'Вестник надежды',
    icon: '✉',
    description: 'Доставь посылку и вернись за наградой. Твоя помощь изменила жизнь деревни.',
    boss: -1,
  },
  {
    id: 'promise',
    name: 'Сдержанное обещание',
    icon: '♧',
    description: 'Заверши сюжетное поручение. Уникальная награда заслужена твоими действиями.',
    boss: -1,
  },
  {
    id: 'kills',
    name: 'Не уступающий тьме',
    icon: '◇',
    description: 'Победи 30 противников. Каждая победа приблизила тебя к дому.',
    boss: -1,
  },
  {
    id: 'return',
    name: 'Ты не сдался',
    icon: '☀',
    description:
      'Вернись к костру после поражения. Это новая попытка, и твой опыт остаётся с тобой.',
    boss: -1,
  },
  {
    id: 'training',
    name: 'Готов к дороге',
    icon: '➚',
    description: 'Пройди все уроки Бруна. Ты готов встретить первую печать.',
    boss: -1,
  },
] as const;

// Расходуемые предметы
export const POTION_PRICE = 25;

export const SUPPLY_CONFIG = { potionLimit: 99, bandageHeal: 50 } as const;

export const SUPPLIES = [
  {
    id: 'field-potion',
    name: 'Дорожное зелье',
    icon: '⚗',
    price: POTION_PRICE,
    description: `В сумку: V лечит ${POTION_HEAL} HP или ${Math.round(PLAYER_CONFIG.potionHealthRatio * 100)}% максимума. Не занимает заряд фляги.`,
  },
  {
    id: 'heal-service',
    name: 'Перевязка',
    icon: '✚',
    price: 8,
    description: `Восстановить ${SUPPLY_CONFIG.bandageHeal} HP`,
  },
  {
    id: 'refill',
    name: 'Заряд фляги',
    icon: '♜',
    price: 10,
    description: 'Добавить 1 заряд, до максимума',
  },
  {
    id: 'rest-service',
    name: 'Полное лечение',
    icon: '☀',
    price: 18,
    description: 'Восстановить HP и все фляги',
  },
];

// Персонажи, история и сюжетные задания
export const PEOPLE = [
  {
    role: 'smith' as Role,
    name: 'Брун',
    job: 'Кузнец',
    texture: 'merchant',
    offset: -170,
    lore: 'Я кую не сталь, а память. Восемь хозяев держат печати дракона. Каждая победа разрывает одну цепь у темницы твоей семьи.',
  },
  {
    role: 'armorer' as Role,
    name: 'Мара',
    job: 'Бронница',
    texture: 'npc-armorer',
    offset: -50,
    lore: 'Латы спасают от клинков, роба - от чар. Нельзя стать неуязвимым: считай выносливость и выходи из печатей прежде, чем они вспыхнут.',
  },
  {
    role: 'healer' as Role,
    name: 'Ива',
    job: 'Лекарь',
    texture: 'npc-healer',
    offset: 70,
    lore: 'Твои близкие живы. Дракон питается связями, которые мы бережём. Огонь поселений помнит тебя и возвращает после смерти.',
  },
  {
    role: 'trader' as Role,
    name: 'Лисандр',
    job: 'Странник',
    texture: 'npc-trader',
    offset: 190,
    lore: 'Дракон забрал семейную казну и превратил её в осколки. Они вернут силу оружию и оплатят помощь деревни. Деньги - средство, семья - причина пути.',
  },
];

export const OPENING = [
  {
    title: 'Дом, который стоит вернуть.',
    text: 'Каждый вечер лис возвращался к маленькому дому у леса. Его ждали любимая и ребёнок, тёплый свет и смех за столом. Меч висел у двери, а в семейной шкатулке росли сбережения на будущее. Он ещё не знал, что обычный вечер станет тем, ради чего придётся пройти через тьму.',
    scene: 'home',
  },
  {
    title: 'Ночь разорванного неба.',
    text: 'Небо расколол рёв. Дракон, пожиратель душ, похитил семью: светящиеся клетки исчезли в дыму вместе с любимыми голосами. Он забрал казну и рассеял силу лиса по своим землям. Семья жива, но каждая ночь питает цепи дракона. Времени на ожидание нет.',
    scene: 'raid',
  },
  {
    title: 'Восемь печатей. Один путь.',
    text: 'Брун нашёл лиса среди развалин. Восемь хозяев держат цепи темницы, а призраки печатей ломают оружие у границ каждой земли. Но память нельзя украсть навсегда: осколки души вернут выбранному оружию силу. Победа над хозяином даст искру мастерства и разорвёт ещё одну цепь.',
    scene: 'oath',
  },
  {
    title: 'Ты идёшь за ними.',
    text: 'Кузнец приготовит оружие, бронница укрепит плащ, лекарь пополнит флягу. Помогай людям: их истории и поручения открывают особые награды. Костры вернут тебя после поражения. Пройди восемь земель, сразись с драконом и верни семью домой. Клятва начинается с первого шага.',
    scene: 'road',
  },
] as const;

export const ENDING = [
  {
    title: 'Последняя цепь разорвана.',
    text: 'Дракон повержен. Восемь печатей погасли, и дверь темницы открылась. Лис снова услышал знакомые голоса.',
    scene: 'rescue',
  },
  {
    title: 'Дом - это те, кого ты вернул.',
    text: 'Семья спасена, украденная казна найдена. За спиной остался путь через туман, впереди - дорога домой. Сохрани завершённое путешествие, если хочешь оставить память об этой победе.',
    scene: 'home',
  },
] as const;

export const LESSONS = [
  {
    event: 'move',
    title: 'Первые шаги',
    hint: 'WASD / стрелки. Дойди до светлого круга справа.',
    target: 1,
  },
  {
    event: 'pickup',
    title: 'Верни силу',
    hint: `Подбери ${TUTORIAL_CONFIG.weaponCoins} осколка на тропе. В биомах аура снова разрушит оружие.`,
    target: TUTORIAL_CONFIG.weaponCoins,
  },
  {
    event: 'hit',
    title: 'Клинок и прицел',
    hint: 'Наводи мышью на манекен. ЛКМ - удар. Попади 3 раза; движение и прицел независимы.',
    target: 3,
  },
  {
    event: 'counter',
    title: 'Парирование и контрудар',
    hint: 'Наведи мышь на стража. Отбей его замах на ПКМ / C, затем нажми ЛКМ в золотом окне для контрудара.',
    target: 1,
  },
  {
    event: 'dodge',
    title: 'Уклонение',
    hint: 'Пробел / Shift. Рывок тратит выносливость; в нём урон не проходит.',
    target: 1,
  },
  {
    event: 'heal',
    title: 'Фляга',
    hint: `Q восстанавливает ${FLASK_HEAL} HP. Заряды ограничены: их пополняют деревни и лекарь.`,
    target: 1,
  },
  {
    event: 'ultimate',
    title: 'Абсолютная сила',
    hint: 'R при полном заряде. Здесь заряд уже готов; в мире его дают осколки и попадания.',
    target: 1,
  },
  {
    event: 'inventory',
    title: 'Всё нужное в меню',
    hint: 'Tab / Esc → Вещи. Здесь оружие, броня и заряд умения. Сохранение выполняется только по кнопке.',
    target: 1,
  },
  {
    event: 'map',
    title: 'Карта и задания',
    hint: 'M открывает карту. В меню есть испытания, сундуки и сюжетные поручения.',
    target: 1,
  },
  {
    event: 'talk',
    title: 'Подготовка у людей',
    hint: 'Подойди к двери кузницы, нажми E, войди и поговори с Бруном. Прочти о печатях или зайди в лавку. Реплики можно пропускать.',
    target: 1,
  },
  {
    event: 'kill',
    title: 'Проверка на нежити',
    hint: 'Победи 2 учебных скелетов. Красная метка - предупреждение. После атаки у врага есть окно для твоего удара.',
    target: 2,
  },
] as const;

export const LINES = [
  {
    id: 'bell' as LineId,
    name: 'Голос забытых',
    giver: 'smith' as Role,
    offered: 0,
    region: 2,
    reward: 'dawnblade',
    rewardName: 'Клинок Рассвета',
    description:
      'Победи 2 некромантов после принятия поручения, забери язык колокола у лунного алтаря в третьем биоме и победи Госпожу тумана.',
  },
  {
    id: 'runes' as LineId,
    name: 'Письма хранителя',
    giver: 'trader' as Role,
    offered: 1,
    region: 3,
    reward: 'runicstaff',
    rewardName: 'Посох трёх печатей',
    description:
      'В четвёртом биоме прочти и активируй печати в порядке Луна → Искра → Корень. Неверная печать сбрасывает последовательность. Победи Архонта.',
  },
  {
    id: 'wisp' as LineId,
    name: 'Последний огонёк',
    giver: 'healer' as Role,
    offered: 2,
    region: 3,
    reward: 'emberseal',
    rewardName: 'Пепельная печать: -18% магического урона',
    description:
      'Найди заблудившийся огонёк в четвёртом биоме и проведи к восточному костру. Он движется, пока ты рядом, и замирает, когда ты получаешь урон. Победи Архонта.',
  },
] as const;

export const DELIVERIES = [
  {
    id: 'medicine' as DeliveryId,
    name: 'Свет для больных',
    giver: 'healer' as Role,
    from: 1,
    to: 0,
    receiver: 'armorer' as Role,
    seals: 2,
    parcel: 'Сумка лечебных настоек',
    reward: 35,
    description:
      'Ива приготовила настойки для раненых Серебряного дыма. Доставь сумку Маре в деревню после первого биома; вернись к Иве за наградой.',
    response: 'Спасибо. Эти настойки помогут моим людям пережить ночь.',
  },
  {
    id: 'blueprint' as DeliveryId,
    name: 'Мост над тишиной',
    giver: 'smith' as Role,
    from: 4,
    to: 2,
    receiver: 'trader' as Role,
    seals: 5,
    parcel: 'Чертёж мостовых скоб',
    reward: 65,
    description:
      'Брун нашёл способ восстановить старый мост. Передай чертёж Лисандру на Лунной переправе, затем вернись к Бруну в Посёлок забытых имён.',
    response: 'Теперь караван сможет пройти. Верну мастеру его искру надежды.',
  },
] as const;

export const INTRO_DURATION = 6.3;

export const WEAPON_STEAL_AT = 1.2;

export const WEAPON_BREAK_AT = 2.6;

// Обучение и подсказки
export const BRIEFING_CARDS = [
  {
    icon: '◈',
    title: 'Сила и духовное оружие',
    text: 'Призрак ломает оружие при входе в биом. Светящиеся осколки возвращают силу. Набери квоту, победи босса и иди к следующей деревне.',
  },
  {
    icon: '⚔',
    title: 'Красная метка - опасность',
    text: 'Полоса HP сверху показывает здоровье, нижняя - выносливость. Красный сектор или круг предупреждает об атаке. Отойди или уклонись на Пробел.',
  },
  {
    icon: '✦',
    title: 'Парирование и ответ',
    text: 'Наводи мышью на врага. C или ПКМ меча отбивает удар. При точном парировании появляется золотая метка: ЛКМ наносит контрудар именно этому врагу.',
  },
  {
    icon: '☁',
    title: 'Смотри под ноги',
    text: 'Дождь создаёт мокрые участки. Гроза и метеоры отмечают место удара заранее. Ураган тянет к своей воронке. События могут задеть и противников.',
  },
  {
    icon: '▣',
    title: 'Испытания и награды',
    text: 'Выполняй задания, чтобы появился сундук. M покажет его место, E откроет. После смерти испытания непройденного биома начинаются снова, с новыми сундуками.',
  },
  {
    icon: '♜',
    title: 'Деревня и ручное сохранение',
    text: 'Костёр возвращает после смерти. В домах можно купить оружие, броню, +10 HP, выносливость и запас зелий. Tab → Сохранить прогресс. После обучения сам дойди до рощи.',
  },
] as const;

export const LESSON_CUES = [
  {
    keys: ['W', 'A', 'S', 'D'],
    selector: '',
    label: 'Дойди до отмеченного круга',
  },
  {
    keys: ['W', 'A', 'S', 'D'],
    selector: '',
    label: 'Подойди к каждому светящемуся осколку',
  },
  {
    keys: ['МЫШЬ', 'ЛКМ'],
    selector: '',
    label: 'Наведи прицел на отмеченного стража',
  },
  {
    keys: ['C', 'ПКМ', 'ЛКМ'],
    selector: '#counter-ready',
    label: 'Отбей замах, затем ударь золотую цель',
  },
  {
    keys: ['ПРОБЕЛ', 'SHIFT'],
    selector: '',
    label: 'Нажми уклонение и посмотри на выносливость',
  },
  {
    keys: ['Q'],
    selector: '.hero-hud',
    label: 'Выпей флягу и посмотри на полосу HP',
  },
  {
    keys: ['R'],
    selector: '#ultimate-ready',
    label: 'Используй подготовленное абсолютное умение',
  },
  {
    keys: ['TAB'],
    selector: '#menu-button,[data-menu-tab="equipment"]',
    label: 'Открой меню, затем подсвеченную вкладку «Вещи»',
  },
  {
    keys: ['M'],
    selector: '#map-button,#map-close',
    label: 'Открой карту, найди себя и закрой карту',
  },
  {
    keys: ['E'],
    selector: '#interact-button,#dialog-trade,#dialog-skip',
    label: 'Подойди к отмеченной двери, затем к кузнецу',
  },
  {
    keys: ['МЫШЬ', 'ЛКМ', 'C', 'ПРОБЕЛ'],
    selector: '',
    label: 'Победи двух отмеченных учебных скелетов',
  },
] as const;

// Вероятности наград
export const LOOT_CONFIG = {
  weights: { empty: 25, souls: 35, heal: 20, upgrade: 12, equipment: 8 },
  soulsBase: 18,
  soulsPerRegion: 7,
  fallbackSouls: 40,
} as const;
const lootTotalWeight = Object.values(LOOT_CONFIG.weights).reduce((sum, weight) => sum + weight, 0);
export const LOOT_ODDS = [
  ['Пусто', LOOT_CONFIG.weights.empty],
  ['сила', LOOT_CONFIG.weights.souls],
  ['лечение', LOOT_CONFIG.weights.heal],
  ['облик / улучшение', LOOT_CONFIG.weights.upgrade],
  ['оружие / броня', LOOT_CONFIG.weights.equipment],
]
  .map(
    ([label, weight]) =>
      `${label} ${Math.round((Number(weight) / lootTotalWeight) * 10000) / 100}%`,
  )
  .join(' · ');

export const TRIAL_CONFIG = {
  sprintTarget: 8,
  sprintTargetPerRegion: 1,
  sprintSeconds: 50,
  sprintSecondsPerRegion: 5,
  tripleKills: 3,
  tripleSeconds: 12,
  focusHits: 6,
} as const;

// Тексты дневника
export const QUEST_NOTES: Record<LineId, { why: string; offer: string; thanks: string }> = {
  bell: {
    why: 'Колокол возвращал людям имена. Некроманты заглушили его, и Брун хочет вернуть память погибших стражей.',
    offer:
      'Я помню имена тех, кто охранял эту дорогу. Некроманты украли голос нашего колокола. Разбей двух заклинателей и забери его язык у лунного алтаря. Когда падёт Госпожа тумана, колокол снова зазвучит. Я выкую тебе клинок, который лечит раны светом памяти.',
    thanks:
      'Слышишь? Колокол снова зовёт стражей по именам. Теперь их память защищает тебя. Клинок Рассвета возвращает 2 HP при попадании. Спасибо, что не прошёл мимо нашей беды.',
  },
  runes: {
    why: 'Хранитель оставил письма дочери в трёх печатях. Лисандр ищет их, чтобы история семьи не исчезла в огне.',
    offer:
      'Караванщик спрятал письма своей дочери в трёх печатях Пепельного святилища. Читай их в порядке Луна, Искра, Корень: память, надежда, дом. Архонт не даст вынести письмо, пока жив. Верни его после победы - и я отдам посох хранителя, а не продам последнюю память о нём.',
    thanks:
      'В письме всего три слова: «Я вернусь домой». Для тебя они тоже важны. Посох трёх печатей выпускает три сгустка за один удар. Пусть эта чужая надежда поможет вернуть твою семью.',
  },
  wisp: {
    why: 'Огонёк хранит голос пропавшего ученика Ивы. Его нужно вывести из пепла к восточному огню.',
    offer:
      'Мой ученик ушёл искать пленников и не вернулся. В святилище остался его огонёк. Найди его на западной тропе и держись рядом до восточного костра. Он пугается боли и замирает, если тебя ранят. Победи Архонта, чтобы огонь не погас. Я сохраню его голос в защитной печати для тебя.',
    thanks:
      'Он добрался до огня. Теперь я знаю, что его память не досталась дракону. Пепельная печать ослабляет магию на 18% и действует сразу. Ты вернул мне надежду - пусть она бережёт тебя.',
  },
};

// Жители и ассортимент деревень
export const SPECIES = [
  'барсук',
  'сова',
  'рысь',
  'волк',
  'горный козёл',
  'ворон',
  'кабан',
  'саламандра',
] as const;

export const RESIDENT_NAMES = [
  ['Брун', 'Мара', 'Ива', 'Лисандр'],
  ['Рунар', 'Сивель', 'Верба', 'Рох'],
  ['Кремень', 'Терна', 'Рута', 'Фен'],
  ['Нокс', 'Велена', 'Лотос', 'Орен'],
  ['Седой', 'Астра', 'Мята', 'Тарк'],
  ['Кориан', 'Элма', 'Морена', 'Луциан'],
  ['Гром', 'Искра', 'Арника', 'Вейр'],
  ['Сол', 'Рада', 'Эхо', 'Кальд'],
];

export const VILLAGE_TRADITIONS = [
  'Лесные мастера начинают с меча. Копьё откроется после первой печати.',
  'Караульная деревня кует мечи и длинные копья для защиты дороги.',
  'Каменщики работают с мечами и секирами: тяжёлый удар раскалывает панцирь.',
  'На переправе ценят меч и посох: здесь учат держаться вне кровавых чар.',
  'Северные мастера предпочитают копьё и секиру. Начальный меч остаётся доступен.',
  'Хранители памяти работают с посохами и клинками, не будят павших зря.',
  'Звездочёты берегут длинные копья и посохи для боя среди молний.',
  'Последний огонь собирает все традиции оружия перед логовом дракона.',
];

export const VILLAGE_STOCK: WeaponId[][] = [
  ['sword', 'spear'],
  ['sword', 'spear'],
  ['sword', 'axe'],
  ['sword', 'staff'],
  ['sword', 'spear', 'axe'],
  ['sword', 'staff'],
  ['sword', 'spear', 'staff'],
  ['sword', 'spear', 'axe', 'staff'],
];

// Названия зданий
export const HOUSE_NAMES: Record<Role, string> = {
  smith: 'Кузница Бруна',
  armorer: 'Мастерская Мары',
  healer: 'Дом настоек Ивы',
  trader: 'Лавка Лисандра',
};

// Сетка поиска пути и схемы препятствий
export const GRID_CELL = 24;

export const TERRAIN_LAYOUTS: [Terrain['kind'], number, number][][] = [
  [
    ['tree', 0.5, 0.33],
    ['stump', 0.57, 0.72],
    ['puddle', 0.23, 0.29],
    ['puddle', 0.78, 0.6],
  ],
  [
    ['tree', 0.38, 0.27],
    ['tree', 0.65, 0.5],
    ['stump', 0.3, 0.78],
    ['stump', 0.73, 0.77],
    ['puddle', 0.48, 0.64],
  ],
  [
    ['tree', 0.46, 0.24],
    ['tree', 0.26, 0.69],
    ['stump', 0.61, 0.6],
    ['stump', 0.73, 0.35],
    ['puddle', 0.44, 0.84],
    ['puddle', 0.78, 0.7],
  ],
  [
    ['tree', 0.24, 0.35],
    ['tree', 0.5, 0.49],
    ['tree', 0.77, 0.65],
    ['stump', 0.55, 0.8],
    ['stump', 0.72, 0.26],
    ['puddle', 0.3, 0.79],
  ],
  [
    ['tree', 0.38, 0.24],
    ['tree', 0.62, 0.41],
    ['tree', 0.33, 0.75],
    ['stump', 0.74, 0.74],
    ['stump', 0.52, 0.69],
    ['puddle', 0.19, 0.37],
    ['puddle', 0.82, 0.45],
  ],
];

// Погода и предупреждения
export const LIGHTNING_WARNING = 1.2;

export const LIGHTNING_RADIUS = 48;

export const WEATHER_DURATION = 15;

export const METEOR_WARNING = 1.65;
export const METEOR_RADIUS = 65;

export const HURRICANE_RADIUS = 125;
export const HURRICANE_PULL = 72;

export const WEATHER_NAMES: Record<WeatherKind, string> = {
  clear: 'Ясно',
  rain: 'Дождь',
  storm: 'Гроза',
  meteors: 'Метеорный дождь',
  hurricane: 'Ураган',
};

export const WEATHER_HINTS: Record<WeatherKind, string> = {
  clear: '',
  rain: 'Дождь: мокрые участки замедляют лиса и противников.',
  storm: 'Гроза: выйди из красного круга до удара молнии.',
  meteors: 'Метеоры: огненный круг отмечает место падения. Камни поражают и врагов.',
  hurricane:
    'Ураган: обходи движущуюся воронку. Она тянет и лиса, и врагов; Пробел помогает вырваться.',
};

// Размеры оружия и точки хвата
export const WEAPON_ART: Record<
  WeaponId,
  { size: number; gripX: number; gripY: number; tipY: number }
> = {
  sword: { size: 100, gripX: 0.5, gripY: 0.802, tipY: 0.04 },
  dawnblade: { size: 102, gripX: 0.5, gripY: 0.847, tipY: 0.04 },
  spear: { size: 148, gripX: 0.498, gripY: 0.671, tipY: 0.04 },
  axe: { size: 114, gripX: 0.5, gripY: 0.741, tipY: 0.04 },
  staff: { size: 124, gripX: 0.509, gripY: 0.715, tipY: 0.04 },
  runicstaff: { size: 122, gripX: 0.499, gripY: 0.761, tipY: 0.04 },
};

export const WEAPON_SIZE = Object.fromEntries(
  WEAPONS.map((w) => [w.id, WEAPON_ART[w.id].size]),
) as Record<WeaponId, number>;

export const ROLL_GRIPS: Record<string, readonly (readonly [number, number])[]> = {
  front: [
    [89, 98],
    [64, 112],
    [78, 92],
    [123, 115],
  ],
  back: [
    [105, 118],
    [84, 64],
    [27, 85],
    [122, 117],
  ],
  left: [
    [78, 96],
    [80, 89],
    [79, 60],
    [100, 99],
  ],
  right: [
    [93, 54],
    [54, 92],
    [24, 69],
    [102, 100],
  ],
};

export const UPPER_ARM_LENGTH = 14;
export const FOREARM_LENGTH = 16;

// Записи и музыкальные темы
export const TRACKS = {
  'boss-battle-10-metal': {
    url: track0,
    name: 'Boss Battle 10',
    author: 'nene',
    seconds: 42.732,
  },
  'boss-battle-2-symphonic-metal': {
    url: track1,
    name: 'Symphonic Boss Battle 2',
    author: 'nene',
    seconds: 26.532,
  },
  'boss-battle-9-metal': {
    url: track2,
    name: 'Boss Battle 9',
    author: 'nene',
    seconds: 42.516,
  },
  'choir-1': {
    url: track3,
    name: 'Fantasy Choir I',
    author: 'César da Rocha (cesisco)',
    seconds: 91.296,
  },
  'choir-2': {
    url: track4,
    name: 'Fantasy Choir II',
    author: 'César da Rocha (cesisco)',
    seconds: 53.172,
  },
  'choir-3': {
    url: track5,
    name: 'Fantasy Choir III',
    author: 'César da Rocha (cesisco)',
    seconds: 126.18,
  },
  'fairy-adventure': {
    url: track6,
    name: 'Fairy Adventure',
    author: 'MintoDog',
    seconds: 144.036,
  },
  'fight-for-better-future-rockmetal': {
    url: track7,
    name: 'Fight for Better Future',
    author: 'nene',
    seconds: 68.184,
  },
  'heavy-battle-1': {
    url: track8,
    name: 'Heavy Battle I',
    author: 'MintoDog',
    seconds: 80.892,
  },
  'heavy-battle-2': {
    url: track9,
    name: 'Heavy Battle II',
    author: 'MintoDog',
    seconds: 83.088,
  },
} as const;

export const THEMES: Record<'explore' | 'combat' | 'boss' | 'rage', TrackId>[] = [
  {
    explore: 'choir-2',
    combat: 'boss-battle-2-symphonic-metal',
    boss: 'boss-battle-10-metal',
    rage: 'boss-battle-9-metal',
  },
  {
    explore: 'choir-3',
    combat: 'heavy-battle-1',
    boss: 'boss-battle-9-metal',
    rage: 'boss-battle-10-metal',
  },
  {
    explore: 'choir-1',
    combat: 'boss-battle-9-metal',
    boss: 'boss-battle-2-symphonic-metal',
    rage: 'boss-battle-10-metal',
  },
  {
    explore: 'heavy-battle-1',
    combat: 'fight-for-better-future-rockmetal',
    boss: 'boss-battle-10-metal',
    rage: 'boss-battle-9-metal',
  },
  {
    explore: 'choir-2',
    combat: 'heavy-battle-2',
    boss: 'boss-battle-2-symphonic-metal',
    rage: 'boss-battle-10-metal',
  },
  {
    explore: 'choir-3',
    combat: 'boss-battle-2-symphonic-metal',
    boss: 'boss-battle-9-metal',
    rage: 'boss-battle-10-metal',
  },
  {
    explore: 'heavy-battle-2',
    combat: 'boss-battle-9-metal',
    boss: 'boss-battle-10-metal',
    rage: 'boss-battle-2-symphonic-metal',
  },
  {
    explore: 'choir-1',
    combat: 'fight-for-better-future-rockmetal',
    boss: 'boss-battle-9-metal',
    rage: 'boss-battle-10-metal',
  },
];

// Громкость и резервные мелодии
export const DEFAULT_AUDIO: AudioSettings = {
  master: 0.65,
  music: 0.42,
  effects: 0.7,
  muted: false,
};

export const AUDIO_MELODIES = [
  [64, 67, 71, 67, 62, 66, 69, 66, 60, 64, 67, 64, 62, 66, 69, 71],
  [57, 60, 64, 60, 55, 59, 62, 59, 53, 57, 60, 57, 55, 59, 62, 64],
  [62, 65, 69, 72, 69, 65, 60, 64, 67, 70, 67, 64, 58, 62, 65, 69],
  [55, 58, 62, 65, 62, 58, 53, 57, 60, 63, 60, 57, 51, 55, 58, 62],
  [60, 63, 67, 70, 67, 63, 58, 62, 65, 68, 65, 62, 56, 60, 63, 67],
];

// Атласы для загрузки
export const ATLAS_ASSETS = [
  { key: 'village-atlas', url: villageAtlas },
  { key: 'biome-atlas', url: biomeAtlas },
  { key: 'story-atlas', url: storyAtlas },
  { key: 'creep-atlas', url: creepAtlas },
  { key: 'hero-atlas', url: heroAtlas },
  { key: 'interiors-atlas', url: interiorsAtlas },
  { key: 'details-atlas', url: detailsAtlas },
  { key: 'combat-atlas', url: combatAtlas },
  { key: 'stride-atlas', url: strideAtlas },
  { key: 'resident-atlas', url: residentAtlas },
  { key: 'roll-atlas', url: rollAtlas },
  { key: 'equipment-atlas', url: equipmentAtlas },
  { key: 'armed-motion-atlas', url: armedMotionAtlas },
];

// Вторые атаки и изучаемые приёмы
export const HEAVY_ATTACKS = {
  sword: {
    reach: 0,
    arc: 0,
    cost: 12,
    windup: 0,
    activeEnd: 0.22,
    duration: 0.38,
    multiplier: 0,
    step: 0,
  },
  spear: {
    reach: 235,
    arc: 0.25,
    cost: 34,
    windup: 0.25,
    activeEnd: 0.38,
    duration: 0.8,
    multiplier: 1.65,
    step: 65,
  },
  axe: {
    reach: 152,
    arc: Math.PI,
    cost: 43,
    windup: 0.48,
    activeEnd: 0.62,
    duration: 1.05,
    multiplier: 1.5,
    step: 0,
  },
  staff: {
    reach: 340,
    arc: Math.PI,
    cost: 35,
    windup: 0.32,
    activeEnd: 0.45,
    duration: 0.88,
    multiplier: 2.1,
    step: 0,
  },
};

export const SKILL_ATTACK_BASE = {
  reach: 150,
  arc: 0.85,
  cost: 30,
  windup: 0.2,
  activeEnd: 0.4,
  duration: 0.7,
  multiplier: 1.6,
  step: 0,
  pulses: 1,
};
export const SKILL_ATTACKS: Record<SkillId, typeof SKILL_ATTACK_BASE> = {
  sword_cross: {
    ...SKILL_ATTACK_BASE,
    cost: 28,
    windup: 0.13,
    activeEnd: 0.4,
    duration: 0.65,
    multiplier: 0.95,
    pulses: 2,
  },
  sword_lunge: {
    ...SKILL_ATTACK_BASE,
    cost: 30,
    reach: 160,
    arc: 0.42,
    multiplier: 1.8,
    step: 100,
  },
  sword_storm: {
    ...SKILL_ATTACK_BASE,
    cost: 45,
    reach: 175,
    arc: 1.3,
    windup: 0.2,
    activeEnd: 0.68,
    duration: 0.96,
    multiplier: 0.9,
    pulses: 3,
  },
  spear_pierce: {
    ...SKILL_ATTACK_BASE,
    cost: 26,
    reach: 220,
    arc: 0.25,
    multiplier: 1.5,
  },
  spear_retreat: {
    ...SKILL_ATTACK_BASE,
    cost: 32,
    reach: 270,
    arc: 0.28,
    multiplier: 1.75,
    step: -65,
  },
  spear_comet: {
    ...SKILL_ATTACK_BASE,
    cost: 46,
    reach: 330,
    arc: 0.2,
    windup: 0.3,
    activeEnd: 0.47,
    duration: 0.9,
    multiplier: 2.4,
    step: 60,
  },
  axe_cleave: {
    ...SKILL_ATTACK_BASE,
    cost: 36,
    reach: 160,
    arc: 0.42,
    windup: 0.42,
    activeEnd: 0.58,
    duration: 0.98,
    multiplier: 2.15,
  },
  axe_leap: {
    ...SKILL_ATTACK_BASE,
    cost: 42,
    reach: 138,
    arc: Math.PI,
    windup: 0.38,
    activeEnd: 0.6,
    duration: 1.02,
    multiplier: 1.7,
    step: 100,
  },
  axe_fault: {
    ...SKILL_ATTACK_BASE,
    cost: 50,
    reach: 280,
    arc: 0.28,
    windup: 0.52,
    activeEnd: 0.72,
    duration: 1.2,
    multiplier: 2.75,
  },
  staff_fan: {
    ...SKILL_ATTACK_BASE,
    cost: 30,
    reach: 420,
    arc: 0.28,
    windup: 0.2,
    activeEnd: 0.34,
    multiplier: 0.8,
  },
  staff_ward: {
    ...SKILL_ATTACK_BASE,
    cost: 38,
    reach: 130,
    arc: Math.PI,
    windup: 0.22,
    activeEnd: 0.4,
    duration: 0.78,
    multiplier: 1.3,
  },
  staff_star: {
    ...SKILL_ATTACK_BASE,
    cost: 50,
    reach: 420,
    arc: Math.PI,
    windup: 0.38,
    activeEnd: 0.54,
    duration: 0.96,
    multiplier: 3.4,
  },
};

export const COMBO_DAMAGE_MULTIPLIERS = [1, 1.08, 1.35];

// Появление врагов и волн
export const SPAWN_CONFIG = {
  pruneInterval: 1,
  baseCap: 12,
  minimumInterval: 5,
  baseInterval: 9,
  intervalRegionReduction: 0.45,
  firstWaveClock: 1.2,
  waveStun: 0.95,
  warningRadius: 32,
  warningDuration: 0.9,
  warningLifetime: 1.2,
  minionDistance: 240,
  bossDistance: 310,
  bossVoiceDuration: 1.2,
  bossStun: 0.7,
} as const;

// Ярость и ритм босса
export const BOSS_CONFIG = {
  rageHealthRatio: 0.5,
  rageVoiceDuration: 0.9,
  rageClockLimit: 0.5,
  rageMinions: 2,
  windup: 1.1,
  rageWindup: 0.88,
  warning: 0.8,
  rageWarning: 0.65,
  hazardLifetime: 0.58,
  recoil: 0.26,
  attackVoiceDuration: 0.55,
  recovery: 0.95,
} as const;

export const AUDIO_ROOT_NOTES = [40, 38, 39, 37, 36];

export const AUDIO_RIFFS = [
  [0, 0, 3, 0, 5, 0, 6, 5],
  [0, 0, 0, 3, 0, 5, 3, 1],
  [0, 3, 0, 6, 5, 0, 3, 1],
  [0, 0, 6, 0, 5, 3, 1, 0],
  [0, 0, 1, 0, 6, 5, 3, 1],
];

export const WEAPON_SOUND_PARAMETERS = {
  sword: { hz: 780, end: 230, body: 0.07, air: 3800, duration: 0.19 },
  dawnblade: { hz: 1120, end: 420, body: 0.075, air: 5100, duration: 0.23 },
  spear: { hz: 340, end: 150, body: 0.085, air: 2300, duration: 0.17 },
  axe: { hz: 140, end: 44, body: 0.15, air: 1200, duration: 0.31 },
  staff: { hz: 220, end: 940, body: 0.095, air: 1700, duration: 0.34 },
  runicstaff: { hz: 370, end: 1320, body: 0.09, air: 2900, duration: 0.39 },
};

export const ENEMY_ATTACK_MOVES: Record<Exclude<EnemyKind, 'boss'>, EnemyAttack[]> = {
  skeleton: ['slash', 'combo', 'snipe'],
  zombie: ['combo', 'poison', 'slam'],
  necromancer: ['fan', 'summon', 'curse', 'snipe'],
  vampire: ['blink', 'combo', 'fan', 'nova'],
  dragon: ['breath', 'charge', 'meteor'],
  wraith: ['blink', 'curse', 'nova'],
  knight: ['combo', 'snipe', 'charge', 'quake'],
  archer: ['snipe', 'fan'],
  alchemist: ['poison', 'curse', 'fan'],
  shade: ['blink', 'combo', 'charge'],
  gargoyle: ['charge', 'quake', 'slam'],
};

export const RESIDENT_FUR_COLORS = [
  0xb9aea1, 0xc1b6a1, 0xb6a284, 0x949aa4, 0xc3b9a2, 0x697583, 0x9e8263, 0xba8261,
];

export const WOLF_TEXTURE_COLORS = [
  ['wolf-grey', '#6c7880', '#a9b4b7'],
  ['wolf-snow', '#afbabc', '#e6e6da'],
  ['wolf-brown', '#74645b', '#b09a7c'],
];

export const VILLAGER_TEXTURE_KEYS = ['merchant', 'npc-armorer', 'npc-healer', 'npc-trader'];

export const ENEMY_TEXTURE_KEYS = [
  'skeleton',
  'zombie',
  'necromancer',
  'vampire',
  'dragon',
  'wraith',
  'knight',
  'weapon-reaper',
];

export const HERO_DIRECTIONS = ['front', 'back', 'left', 'right'];

export const COMBAT_TEXTURE_KEYS = [
  'sword',
  'spear',
  'axe',
  'staff',
  'dawnblade',
  'runicstaff',
  'shot-violet',
  'shot-bone',
  'shot-acid',
  'shot-bat',
  'shot-ice',
  'shot-fire',
  'fx-meteor',
  'fx-hurricane',
  'fx-slash',
  'shot-shadow',
];

export const EQUIPMENT_ATLAS_FRAMES: [string, number, number, number, number][] = [
  ['sword', 170, 0, 154, 432],
  ['spear', 515, 0, 90, 432],
  ['axe', 741, 0, 286, 433],
  ['staff', 1127, 0, 172, 433],
  ['dawnblade', 150, 433, 192, 383],
  ['runicstaff', 471, 433, 179, 383],
  ['arm-upper', 802, 445, 170, 366],
  ['arm-bracer', 1155, 439, 140, 370],
  ['hand-palm', 149, 817, 174, 265],
  ['hand-grip', 478, 817, 170, 265],
  ['hand-open', 803, 814, 205, 272],
  ['hand-open-back', 1132, 815, 209, 271],
];

export const ARMED_MOTION_FRAMES = [
  [
    [34, 9, 185, 272, 151],
    [303, 7, 191, 278, 430],
    [580, 8, 184, 278, 704],
    [866, 9, 192, 277, 991],
    [1173, 8, 176, 277, 1286],
  ],
  [
    [75, 288, 189, 268, 137],
    [363, 289, 191, 272, 420],
    [635, 290, 192, 270, 692],
    [926, 291, 194, 270, 985],
    [1218, 290, 172, 271, 1277],
  ],
  [
    [43, 564, 225, 260, 123],
    [315, 562, 266, 265, 432],
    [610, 562, 246, 262, 702],
    [868, 564, 268, 263, 982],
    [1174, 563, 221, 261, 1268],
  ],
  [
    [32, 826, 209, 261, 161],
    [306, 824, 257, 259, 446],
    [587, 824, 219, 264, 716],
    [881, 825, 250, 261, 1014],
    [1164, 823, 207, 266, 1287],
  ],
];

export const RESIDENT_ROLES = ['smith', 'armorer', 'healer', 'trader'];

export const RESIDENT_CLOTH_COLORS = ['#b28255', '#7e98b4', '#78a681', '#a98aaa'];

export const TUTORIAL_KEY_NAMES = {
  ПРОБЕЛ: 'SPACE',
  TAB: 'TAB',
  SHIFT: 'SHIFT',
};

// Приросты характеристик по индексу биома; HP босса задан в REGIONS.
export const ENEMY_PARAMETERS: Record<
  EnemyKind,
  {
    hpGrowth: number;
    size: number;
    damage: number;
    damageGrowth: number;
    reward: number;
    rewardGrowth: number;
    speedScale: number;
    radius: number;
  }
> = {
  skeleton: {
    hpGrowth: 14,
    size: 78,
    damage: 14,
    damageGrowth: 2,
    reward: 5,
    rewardGrowth: 1,
    speedScale: 1,
    radius: 20,
  },
  zombie: {
    hpGrowth: 18,
    size: 83,
    damage: 17,
    damageGrowth: 2,
    reward: 6,
    rewardGrowth: 2,
    speedScale: 0.7,
    radius: 20,
  },
  necromancer: {
    hpGrowth: 18,
    size: 78,
    damage: 11,
    damageGrowth: 2,
    reward: 9,
    rewardGrowth: 2,
    speedScale: 0.72,
    radius: 20,
  },
  vampire: {
    hpGrowth: 18,
    size: 78,
    damage: 16,
    damageGrowth: 2,
    reward: 9,
    rewardGrowth: 2,
    speedScale: 1.18,
    radius: 20,
  },
  dragon: {
    hpGrowth: 24,
    size: 103,
    damage: 16,
    damageGrowth: 2,
    reward: 12,
    rewardGrowth: 2,
    speedScale: 0.88,
    radius: 25,
  },
  wraith: {
    hpGrowth: 18,
    size: 78,
    damage: 11,
    damageGrowth: 2,
    reward: 9,
    rewardGrowth: 2,
    speedScale: 1,
    radius: 20,
  },
  knight: {
    hpGrowth: 24,
    size: 83,
    damage: 17,
    damageGrowth: 2,
    reward: 9,
    rewardGrowth: 2,
    speedScale: 0.9,
    radius: 20,
  },
  archer: {
    hpGrowth: 18,
    size: 78,
    damage: 14,
    damageGrowth: 2,
    reward: 9,
    rewardGrowth: 2,
    speedScale: 1,
    radius: 20,
  },
  alchemist: {
    hpGrowth: 18,
    size: 78,
    damage: 11,
    damageGrowth: 2,
    reward: 9,
    rewardGrowth: 2,
    speedScale: 0.72,
    radius: 20,
  },
  shade: {
    hpGrowth: 18,
    size: 78,
    damage: 16,
    damageGrowth: 2,
    reward: 9,
    rewardGrowth: 2,
    speedScale: 1.18,
    radius: 20,
  },
  gargoyle: {
    hpGrowth: 18,
    size: 78,
    damage: 17,
    damageGrowth: 2,
    reward: 9,
    rewardGrowth: 2,
    speedScale: 0.76,
    radius: 20,
  },
  boss: {
    hpGrowth: 0,
    size: 148,
    damage: 23,
    damageGrowth: 4,
    reward: BOSS_REWARD,
    rewardGrowth: 13,
    speedScale: 0.95,
    radius: 34,
  },
};

// Контрудар героя

export const COUNTER_ATTACK = {
  reach: 170,
  arc: 0.7,
  cost: 20,
  windup: 0.1,
  activeEnd: 0.27,
  duration: 0.58,
  multiplier: 2.6,
  step: 0,
  pulses: 1,
};

export const ARTWORK_READY_KEY = '__raid-artwork-ready';

// Обычные вражеские атаки: расчёт урона и предупреждения читают одну геометрию.
export const ENEMY_ATTACK_CONFIG = {
  recoil: 0.26,
  slashReach: 92,
  zombieReach: 86,
  knightReach: 112,
  slashArc: 1.2,
  slamRadius: 155,
  slamDamage: 1.15,
  slamLifetime: 0.35,
  curseRadius: 100,
  poisonRadius: 72,
  curseWarning: 0.9,
  poisonWarning: 0.5,
  curseLifetime: 4.5,
  poisonLifetime: 5.5,
  curseDamage: 0.38,
  poisonDamage: 0.5,
  trainingWindup: 0.9,
  complexWindup: 0.92,
  simpleWindup: 0.62,
  rageWindupScale: 0.78,
  rageRecoveryScale: 0.75,
  chargeDuration: 0.37,
  roarDuration: 0.75,
  comboDamage: 1.15,
  vampireHealing: 0.7,
  comboInterruptStun: 0.05,
  comboLength: 2,
  comboWindup: 0.44,
  blinkOffset: 100,
  blinkWindup: 0.48,
  novaShots: 10,
  rageNovaShots: 14,
  breathShots: 6,
  rageBreathShots: 9,
  fanShots: 4,
  breathSpread: 0.16,
  fanSpread: 0.23,
  snipeSpeed: 490,
  novaSpeed: 225,
  breathSpeed: 335,
  fanSpeed: 290,
  snipeDamage: 1.2,
  quakeInitialRadius: 20,
  quakeWarning: 0.55,
  quakeLifetime: 2.5,
  quakeDamage: 1.1,
  meteorCount: 3,
  rageMeteorCount: 6,
  meteorRadius: 58,
  meteorSpread: 125,
  meteorWarning: 1.15,
  meteorLifetime: 1.7,
  meteorDelay: 0.12,
  meteorDamage: 1.05,
  summonRecovery: 1.4,
  breathRecovery: 1.3,
  snipeRecovery: 1.2,
  recovery: 0.95,
  summonDistance: 90,
  summonPlayerDistance: 200,
  summonStun: 0.75,
  summonClock: 2,
  summonWarningRadius: 30,
  summonWarning: 0.7,
  summonWarningLifetime: 1,
  conePreviewReach: 240,
  breathPreviewArc: 0.55,
  fanPreviewArc: 0.6,
  novaPreviewRadius: 190,
  quakePreviewRadius: 160,
} as const;

// Движение и попадание снарядов
export const PROJECTILE_CONFIG = {
  muzzleOffset: 25,
  friendlyLifetime: 0.86,
  enemyLifetime: 2.8,
  friendlyRadius: 8,
  enemyRadius: 7,
  hitKnockback: 22,
  blastDamageScale: 0.7,
  blastKnockback: 18,
} as const;

// Опасные зоны и урон окружения
export const HAZARD_CONFIG = {
  enemyHitFlash: 0.2,
  bossStun: 0.25,
  minionStun: 0.6,
  vampireBossHealing: 0.5,
  sigilKnockback: 40,
  meteorEnemyDamageScale: 0.8,
  waveSpeed: 180,
  waveThickness: 12,
} as const;
