import Phaser from 'phaser';
import { background, createArtwork, type Palette } from './art';
import { clampPoint, clearLine, findPath, freePoint, makeGrid, makeTerrain, moveCircle, type Bounds, type NavGrid, type Point, type Terrain } from './world';
import { PROFILE_KEY, SKINS, UPGRADES, newProfile, parseProfile, purchase, type Profile } from './progression';

// Баланс игры: основные параметры собраны здесь для дальнейшей доработки.
const PLAYER_SPEED = 238;
const PLAYER_RADIUS = 14;
const ENEMY_RADIUS = 17;
const STARTING_LIVES = 3;
const DASH_DURATION = 0.22;
const DASH_MULTIPLIER = 2.8;
const DASH_COOLDOWN = 2.7;
const HIT_PROTECTION = 1.6;
const COMBO_WINDOW = 5;
const FIELD_MARGIN = 29;
const FIELD_TOP = 55;
const STORAGE_KEY = 'raid-coin-best-v2';
const PATH_REFRESH = .32;
const PREDICT_LIMIT = 145;
const WEATHER_INTERVAL = [9, 15] as const;
const WEATHER_DURATION = 12;
const LIGHTNING_WARNING = 1.2;
const LIGHTNING_RADIUS = 42;

type GameState = 'ready' | 'playing' | 'paused' | 'between' | 'won' | 'lost';
type EnemyMode = 'chase' | 'warning' | 'rush';
type Level = { name: string; coins: number; enemies: number; speed: number; rush: boolean; palette: Palette };

const LEVELS: Level[] = [
  { name: 'Тихая роща', coins: 8, enemies: 1, speed: 105, rush: false,
    palette: { ground: '#477c58', light: '#86a774', grass: '#7d9b58', tree: '#345d43', accent: '#e2ce89' } },
  { name: 'Золотая тропа', coins: 10, enemies: 1, speed: 126, rush: false,
    palette: { ground: '#7d8950', light: '#b6b079', grass: '#99a162', tree: '#657745', accent: '#f2d681' } },
  { name: 'Сумеречный сад', coins: 12, enemies: 2, speed: 140, rush: false,
    palette: { ground: '#546b75', light: '#92a0a1', grass: '#819788', tree: '#465966', accent: '#d5b8d7' } },
  { name: 'Колючая чаща', coins: 14, enemies: 2, speed: 155, rush: true,
    palette: { ground: '#655866', light: '#a3938d', grass: '#8d8187', tree: '#514a5f', accent: '#edbda1' } },
  { name: 'Сердце леса', coins: 16, enemies: 3, speed: 165, rush: true,
    palette: { ground: '#386e66', light: '#7ca595', grass: '#79a68a', tree: '#2e5955', accent: '#e5d59b' } },
];

type Enemy = {
  sprite: Phaser.GameObjects.Image; shadow: Phaser.GameObjects.Ellipse;
  mode: EnemyMode; timer: number; rushX: number; rushY: number; index: number;
  path: Point[]; pathLeft: number; stunned: number;
};

type WeatherKind = 'clear' | 'rain' | 'storm';
type WetZone = Point & { radius: number };
type Strike = Point & { phase: 'warning' | 'impact'; left: number };

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Image;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private target!: Phaser.GameObjects.Image;
  private coinShadow!: Phaser.GameObjects.Ellipse;
  private backdrop!: Phaser.GameObjects.Image;
  private warnings!: Phaser.GameObjects.Graphics;
  private enemies: Enemy[] = [];
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private state: GameState = 'ready';
  private levelIndex = 0;
  private stageCoins = 0;
  private totalCoins = 0;
  private score = 0;
  private best = 0;
  private lives = STARTING_LIVES;
  private elapsed = 0;
  private animationTime = 0;
  private combo = 0;
  private lastCoinTime = -COMBO_WINDOW;
  private dashLeft = 0;
  private dashCooldown = 0;
  private dashX = 1;
  private dashY = 0;
  private hurtLeft = 0;
  private movementX = 1;
  private movementY = 0;
  private isMoving = false;
  private touchX = 0;
  private touchY = 0;
  private joystickPointer: number | null = null;
  private width = 960;
  private height = 560;
  private unit = 1;
  private oldBackground = '';
  private toastTimeout = 0;
  private listeners!: AbortController;
  private terrain: Terrain[] = [];
  private terrainSprites: Phaser.GameObjects.Image[] = [];
  private nav!: NavGrid;
  private weatherInk!: Phaser.GameObjects.Graphics;
  private stormInk!: Phaser.GameObjects.Graphics;
  private weather: WeatherKind = 'clear';
  private weatherLeft = 0;
  private weatherNext = 10;
  private wetZones: WetZone[] = [];
  private strike: Strike | null = null;
  private strikeNext = 2;
  private playerStunned = 0;
  private playerVelocity: Point = { x: 0, y: 0 };
  private profile: Profile = newProfile();
  private storageAvailable = true;
  private shopOpen = false;
  private shopReturn: GameState = 'ready';
  private shopTab: 'skins' | 'upgrades' = 'skins';

  constructor() { super('GameScene'); }

  create(): void {
    this.width = this.scale.width;
    this.height = this.scale.height;
    this.updateUnit();
    createArtwork(this);
    this.backdrop = this.add.image(0, 0, 'fox').setOrigin(0).setDepth(0);
    this.warnings = this.add.graphics().setDepth(4);
    this.weatherInk = this.add.graphics().setDepth(3);
    this.stormInk = this.add.graphics().setDepth(16);
    try { this.profile = parseProfile(localStorage.getItem(PROFILE_KEY)); }
    catch { this.storageAvailable = false; }
    this.playerShadow = this.add.ellipse(0, 0, 34, 13, 0x0f3027, 0.3).setDepth(5);
    this.player = this.add.image(0, 0, this.profile.skin).setDepth(10);
    this.coinShadow = this.add.ellipse(0, 0, 23, 9, 0x2f4932, 0.24).setDepth(5);
    this.target = this.add.image(0, 0, 'coin').setDepth(8);
    this.best = this.readBest();
    if (!this.input.keyboard) throw new Error('Keyboard input is unavailable');
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,SHIFT,R,P,ESC,ENTER') as Record<string, Phaser.Input.Keyboard.Key>;
    this.bindControls();
    this.loadLevel(0);
    this.state = 'ready';
    const edition = document.querySelector('.edition');
    if (edition) edition.textContent = `${LEVELS.length} полян · один маленький герой`;
    this.showModal('МАЛЕНЬКОЕ ПРИКЛЮЧЕНИЕ', 'Золото любит смелых.',
      `${LEVELS.length} полян · три жизни. Собирай золото и ускользай от волков.`, 'Начать погоню', true);
    this.scale.on('resize', this.resizeField, this);
    this.events.once('shutdown', () => {
      this.listeners.abort();
      this.scale.off('resize', this.resizeField, this);
      window.clearTimeout(this.toastTimeout);
    });
  }

  private element<T extends HTMLElement = HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing interface element: ${id}`);
    return element as T;
  }

  private bindControls(): void {
    this.listeners = new AbortController();
    const signal = this.listeners.signal;
    this.element('primary-button').addEventListener('click', () => this.primaryAction(), { signal });
    this.element('secondary-button').addEventListener('click', () => this.startNewRun(), { signal });
    this.element('pause-button').addEventListener('click', () => this.togglePause(), { signal });
    this.element('help-button').addEventListener('click', () => {
      if (this.state === 'playing') this.pause(true);
      else if (this.state === 'paused') this.pause(true);
    }, { signal });
    this.element('dash-button').addEventListener('pointerdown', event => {
      event.preventDefault(); this.useDash();
    }, { signal });
    this.element('shop-button').addEventListener('click', () => this.openShop(), { signal });
    this.element('modal-shop-button').addEventListener('click', () => this.openShop(), { signal });
    this.element('shop-close').addEventListener('click', () => this.closeShop(), { signal });
    for (const tab of ['skins', 'upgrades'] as const) this.element(`tab-${tab}`).addEventListener('click', () => {
      this.shopTab = tab; this.renderShop();
    }, { signal });
    this.element('shop-items').addEventListener('click', event => {
      const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('[data-item]') : null;
      if (!button?.dataset.item || button.disabled) return;
      this.element('shop-message').textContent = purchase(this.profile, button.dataset.item);
      this.player.setTexture(this.profile.skin); this.saveProfile(); this.updateWallet();
      this.dashCooldown = Math.min(this.dashCooldown, this.dashWait());
      this.renderShop(); this.updateDashUI();
    }, { signal });
    const joystick = this.element('joystick');
    const release = (event?: PointerEvent) => {
      if (event && this.joystickPointer !== event.pointerId) return;
      this.joystickPointer = null; this.touchX = 0; this.touchY = 0;
      this.element('joystick-knob').style.transform = '';
    };
    const move = (event: PointerEvent) => {
      if (event.pointerId !== this.joystickPointer) return;
      const bounds = joystick.getBoundingClientRect();
      const limit = bounds.width * .3;
      let x = (event.clientX - bounds.left - bounds.width / 2) / limit;
      let y = (event.clientY - bounds.top - bounds.height / 2) / limit;
      const distance = Math.hypot(x, y);
      if (distance > 1) { x /= distance; y /= distance; }
      this.touchX = Math.abs(x) > .12 ? x : 0;
      this.touchY = Math.abs(y) > .12 ? y : 0;
      this.element('joystick-knob').style.transform = `translate(${x * limit}px, ${y * limit}px)`;
    };
    joystick.addEventListener('pointerdown', event => {
      if (this.joystickPointer !== null) return;
      event.preventDefault(); this.joystickPointer = event.pointerId;
      joystick.setPointerCapture(event.pointerId); move(event);
    }, { signal });
    joystick.addEventListener('pointermove', move, { signal });
    joystick.addEventListener('pointerup', release, { signal });
    joystick.addEventListener('pointercancel', release, { signal });
    joystick.addEventListener('lostpointercapture', release, { signal });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') this.pause(false);
      if (document.hidden) release();
    }, { signal });
    window.addEventListener('blur', () => {
      release(); if (this.state === 'playing') this.pause(false);
    }, { signal });
    if (matchMedia('(pointer: coarse)').matches || this.width < 650) {
      this.element('control-hint').textContent = 'Джойстик слева - движение · ⚡ справа - рывок';
    }
  }

  update(_time: number, delta: number): void {
    if (this.shopOpen) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) this.closeShop();
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.R)) { this.startNewRun(); return; }
    if (Phaser.Input.Keyboard.JustDown(this.keys.P) || Phaser.Input.Keyboard.JustDown(this.keys.ESC)) this.togglePause();
    if (Phaser.Input.Keyboard.JustDown(this.keys.ENTER) && this.state !== 'playing') this.primaryAction();
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || Phaser.Input.Keyboard.JustDown(this.keys.SHIFT)) this.useDash();
    if (this.state !== 'playing') return;

    const seconds = Math.min(delta, 40) / 1000;
    this.elapsed += seconds; this.animationTime += seconds;
    this.dashCooldown = Math.max(0, this.dashCooldown - seconds);
    this.hurtLeft = Math.max(0, this.hurtLeft - seconds);
    this.updateWeather(seconds);
    this.movePlayer(seconds);
    this.moveEnemies(seconds);
    this.animateObjects();
    this.checkDamage();
    if (this.state === 'playing') this.checkTarget();
    this.updateDashUI();
  }

  private startNewRun(): void {
    this.score = 0; this.totalCoins = 0; this.lives = STARTING_LIVES;
    this.elapsed = 0; this.animationTime = 0;
    this.loadLevel(0); this.hideModal();
    this.toast('Волк предугадывает путь. Меняй направление!');
  }

  private loadLevel(index: number): void {
    this.levelIndex = index; this.stageCoins = 0; this.combo = 0;
    this.lastCoinTime = -COMBO_WINDOW; this.dashLeft = 0; this.dashCooldown = 0;
    this.hurtLeft = 1; this.touchX = 0; this.touchY = 0; this.isMoving = false;
    this.movementX = 1; this.movementY = 0;
    this.updateUnit(); this.drawBackground(); this.warnings.clear(); this.setupTerrain(); this.resetWeather();
    this.player.setTexture(this.profile.skin).setPosition(this.width * .32, this.height * .55).setAlpha(1).setFlipX(false);
    this.playerVelocity = { x: 0, y: 0 }; this.playerStunned = 0;
    this.player.setDisplaySize(61 * this.unit, 61 * this.unit);
    this.playerShadow.setSize(31 * this.unit, 12 * this.unit);
    this.target.setVisible(true).setDisplaySize(53 * this.unit, 53 * this.unit);
    this.coinShadow.setVisible(true).setSize(22 * this.unit, 8 * this.unit);
    for (const enemy of this.enemies) { enemy.sprite.destroy(); enemy.shadow.destroy(); }
    this.enemies = [];
    const starts = [
      { x: this.width * .83, y: this.height * .23 },
      { x: this.width * .78, y: this.height * .81 },
      { x: this.width * .16, y: this.height * .16 },
    ];
    for (let i = 0; i < LEVELS[index].enemies; i++) {
      const position = starts[i];
      const shadow = this.add.ellipse(position.x, position.y + 14 * this.unit, 35 * this.unit, 12 * this.unit, 0x203529, .32).setDepth(5);
      const sprite = this.add.image(position.x, position.y, ['wolf-grey', 'wolf-snow', 'wolf-brown'][i])
        .setDisplaySize(67 * this.unit, 67 * this.unit).setDepth(9);
      this.enemies.push({ sprite, shadow, mode: 'chase', timer: 3 + i * 2, rushX: 0, rushY: 0, index: i, path: [], pathLeft: 0, stunned: 0 });
    }
    for (const object of [this.player, ...this.enemies.map(e => e.sprite)]) this.resolvePosition(object, PLAYER_RADIUS * this.unit);
    this.placeCoin(); this.state = 'playing'; this.updateHUD(); this.updateDashUI();
  }

  private movePlayer(seconds: number): void {
    let x = this.touchX, y = this.touchY;
    if (this.keys.LEFT.isDown || this.keys.A.isDown) x -= 1;
    if (this.keys.RIGHT.isDown || this.keys.D.isDown) x += 1;
    if (this.keys.UP.isDown || this.keys.W.isDown) y -= 1;
    if (this.keys.DOWN.isDown || this.keys.S.isDown) y += 1;
    const length = Math.hypot(x, y);
    this.isMoving = length > .05;
    if (this.isMoving) {
      x /= Math.max(1, length); y /= Math.max(1, length);
      this.movementX = x / Math.hypot(x, y); this.movementY = y / Math.hypot(x, y);
    }
    const dashing = this.dashLeft > 0;
    if (dashing) { x = this.dashX; y = this.dashY; }
    const speed = this.playerSpeed() * this.unit * (dashing ? DASH_MULTIPLIER : 1) * this.groundSpeed(this.player, true);
    const before = { x: this.player.x, y: this.player.y };
    const moved = moveCircle(before, x * speed * seconds, y * speed * seconds, PLAYER_RADIUS * this.unit, this.terrain, this.bounds());
    this.player.setPosition(moved.x, moved.y);
    this.playerVelocity = seconds > 0 ? { x: (moved.x - before.x) / seconds, y: (moved.y - before.y) / seconds } : { x: 0, y: 0 };
    if (dashing && Math.floor(this.animationTime * 50) % 3 === 0) {
      const ghost = this.add.image(this.player.x, this.player.y, this.profile.skin).setDisplaySize(61 * this.unit, 61 * this.unit)
        .setFlipX(this.player.flipX).setAlpha(.24).setDepth(6);
      this.tweens.add({ targets: ghost, alpha: 0, duration: 180, onComplete: () => ghost.destroy() });
    }
    this.dashLeft = Math.max(0, this.dashLeft - seconds);
    if (Math.abs(this.movementX) > .1) this.player.setFlipX(this.movementX < 0);
    this.player.setAngle(this.isMoving ? Math.sin(this.animationTime * 16) * 4 : Math.sin(this.animationTime * 2) * 1.5);
    this.playerShadow.setPosition(this.player.x, this.player.y + 18 * this.unit);
    this.player.setAlpha(this.hurtLeft > 0 && Math.floor(this.hurtLeft * 12) % 2 ? .45 : 1);
  }

  private useDash(): void {
    if (this.state !== 'playing' || this.dashCooldown > 0) return;
    this.dashLeft = DASH_DURATION; this.dashCooldown = this.dashWait();
    this.dashX = this.movementX; this.dashY = this.movementY;
    this.particles(this.player.x, this.player.y, 5, 0xb8e9c8);
    this.updateDashUI();
  }

  private predictedTarget(enemy: Enemy): Point {
    const distance = Math.hypot(this.player.x - enemy.sprite.x, this.player.y - enemy.sprite.y);
    const horizon = Math.min(.8, distance / (PLAYER_SPEED * this.unit)) * (.6 + enemy.index * .13);
    const speed = Math.hypot(this.playerVelocity.x, this.playerVelocity.y);
    const limit = speed > 0 ? Math.min(horizon, PREDICT_LIMIT * this.unit / speed) : 0;
    // Линейный прогноз по фактической скорости, включая столкновения и замедления.
    return clampPoint({ x: this.player.x + this.playerVelocity.x * limit,
      y: this.player.y + this.playerVelocity.y * limit }, this.bounds());
  }

  private moveEnemies(seconds: number): void {
    this.warnings.clear();
    const level = LEVELS[this.levelIndex];
    for (const enemy of this.enemies) {
      const sprite = enemy.sprite, predicted = this.predictedTarget(enemy);
      enemy.timer -= seconds; enemy.pathLeft -= seconds;
      const dx = predicted.x - sprite.x, dy = predicted.y - sprite.y, distance = Math.hypot(dx, dy) || 1;
      if (enemy.stunned > 0) {
        this.warnings.lineStyle(2, 0xf7de8e, .8); this.warnings.strokeCircle(sprite.x, sprite.y, 23 * this.unit);
        continue;
      }
      if (enemy.mode === 'chase' && level.rush && enemy.timer <= 0) {
        enemy.mode = 'warning'; enemy.timer = .75;
        enemy.rushX = dx / distance; enemy.rushY = dy / distance;
      }
      const slow = this.groundSpeed(sprite, false);
      if (enemy.mode === 'warning') {
        this.warnings.lineStyle(2, 0xffdfa0, .8);
        this.warnings.lineBetween(sprite.x, sprite.y, sprite.x + enemy.rushX * 120 * this.unit, sprite.y + enemy.rushY * 120 * this.unit);
        this.warnings.strokeCircle(sprite.x, sprite.y, (23 + Math.sin(this.animationTime * 20) * 3) * this.unit);
        if (enemy.timer <= 0) { enemy.mode = 'rush'; enemy.timer = .4; }
      } else if (enemy.mode === 'rush') {
        const moved = moveCircle(sprite, enemy.rushX * 350 * this.unit * slow * seconds,
          enemy.rushY * 350 * this.unit * slow * seconds, ENEMY_RADIUS * this.unit, this.terrain, this.bounds());
        sprite.setPosition(moved.x, moved.y);
        if (enemy.timer <= 0) { enemy.mode = 'chase'; enemy.timer = 4.5 + enemy.index; enemy.pathLeft = 0; }
      } else {
        let aim = predicted;
        if (!clearLine(sprite, predicted, ENEMY_RADIUS * this.unit, this.terrain, this.bounds())) {
          if (enemy.pathLeft <= 0) { enemy.path = findPath(sprite, predicted, this.nav); enemy.pathLeft = PATH_REFRESH; }
          while (enemy.path.length > 1 && (Math.hypot(sprite.x - enemy.path[0].x, sprite.y - enemy.path[0].y) < 12 * this.unit ||
            clearLine(sprite, enemy.path[1], ENEMY_RADIUS * this.unit, this.terrain, this.bounds()))) enemy.path.shift();
          if (enemy.path.length) aim = enemy.path[0];
        } else { enemy.path = []; enemy.pathLeft = 0; }
        const ax = aim.x - sprite.x, ay = aim.y - sprite.y, len = Math.hypot(ax, ay) || 1;
        const speed = Math.min(PLAYER_SPEED * .87, level.speed + this.stageCoins * 2) * this.unit * slow;
        const travel = Math.min(speed * seconds, len);
        const moved = moveCircle(sprite, ax / len * travel, ay / len * travel, ENEMY_RADIUS * this.unit, this.terrain, this.bounds());
        sprite.setPosition(moved.x, moved.y);
      }
      sprite.setFlipX(dx < 0).setAngle(Math.sin(this.animationTime * 12 + enemy.index) * 3);
      enemy.shadow.setPosition(sprite.x, sprite.y + 16 * this.unit);
    }
  }

  private animateObjects(): void {
    this.target.setAngle(Math.sin(this.animationTime * 2) * 8);
    this.target.setScale((53 / 128) * this.unit * (1 + Math.sin(this.animationTime * 4) * .035));
    this.coinShadow.setPosition(this.target.x, this.target.y + 16 * this.unit);
    if (this.elapsed - this.lastCoinTime > COMBO_WINDOW && this.combo > 0) {
      this.combo = 0; this.element('combo-label').textContent = 'Собирай монеты подряд';
    }
  }

  private checkDamage(): void {
    if (this.hurtLeft > 0 || this.dashLeft > 0) return;
    for (const enemy of this.enemies) {
      if (enemy.stunned > 0) continue;
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.sprite.x, enemy.sprite.y);
      if (distance > (PLAYER_RADIUS + ENEMY_RADIUS) * this.unit * .88) continue;
      this.lives -= 1; this.hurtLeft = HIT_PROTECTION; this.combo = 0;
      this.particles(this.player.x, this.player.y, 10, 0xffc49d);
      const dx = enemy.sprite.x - this.player.x, dy = enemy.sprite.y - this.player.y;
      const length = Math.hypot(dx, dy) || 1;
      const knockback = moveCircle(enemy.sprite, (length === 1 ? 1 : dx / length) * 100 * this.unit,
        dy / length * 100 * this.unit, ENEMY_RADIUS * this.unit, this.terrain, this.bounds());
      enemy.sprite.setPosition(knockback.x, knockback.y); enemy.pathLeft = 0;
      enemy.mode = 'chase'; enemy.timer = 3;
      this.element('combo-label').textContent = 'Серия прервана'; this.updateHUD();
      if (this.lives <= 0) this.finishGame('lost');
      else this.toast('Минус жизнь. Рывок защищает от волка, но не проходит сквозь деревья.');
      break;
    }
  }

  private checkTarget(): void {
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);
    if (distance > (PLAYER_RADIUS + 12) * this.unit) return;
    this.combo = this.elapsed - this.lastCoinTime <= COMBO_WINDOW ? this.combo + 1 : 1;
    this.lastCoinTime = this.elapsed;
    const multiplier = Math.min(3, 1 + Math.floor((this.combo - 1) / 3));
    const points = (100 + this.levelIndex * 20) * multiplier;
    this.score += points; this.stageCoins += 1; this.totalCoins += 1;
    this.profile.coins++; this.saveProfile(); this.updateWallet();
    this.saveBest(); this.updateHUD();
    this.element('combo-label').textContent = multiplier > 1 ? `Серия ${this.combo} · очки ×${multiplier}` : `Серия ${this.combo} · успей за 5 секунд`;
    this.particles(this.target.x, this.target.y, 8, 0xffdda0);
    const popup = this.add.text(this.target.x, this.target.y - 19 * this.unit, `+${points}`, {
      fontFamily: 'system-ui, sans-serif', fontSize: `${16 * this.unit}px`, color: '#fff7ce', stroke: '#3e6546', strokeThickness: 3,
    }).setOrigin(.5).setDepth(20);
    this.tweens.add({ targets: popup, y: popup.y - 28 * this.unit, alpha: 0, duration: 600, onComplete: () => popup.destroy() });
    if (this.stageCoins >= LEVELS[this.levelIndex].coins) {
      this.target.setVisible(false); this.coinShadow.setVisible(false); this.warnings.clear();
      if (this.levelIndex === LEVELS.length - 1) this.finishGame('won');
      else this.completeLevel();
    } else this.placeCoin();
  }

  private placeCoin(): void {
    const margin = FIELD_MARGIN * this.unit + 10, safeDistance = 85 * this.unit;
    let best: Point | null = null, bestClearance = -1;
    for (let i = 0; i < 100; i++) {
      const point = { x: Phaser.Math.FloatBetween(margin, this.width - margin),
        y: Phaser.Math.FloatBetween(FIELD_TOP + 15, this.height - margin) };
      if (!freePoint(point, PLAYER_RADIUS * this.unit + 8, this.terrain, this.bounds())) continue;
      if (!clearLine(this.player, point, PLAYER_RADIUS * this.unit, this.terrain, this.bounds()) && !findPath(this.player, point, this.nav).length) continue;
      let clearance = Math.hypot(point.x - this.player.x, point.y - this.player.y);
      for (const enemy of this.enemies) clearance = Math.min(clearance, Math.hypot(point.x - enemy.sprite.x, point.y - enemy.sprite.y));
      if (clearance > bestClearance) { best = point; bestClearance = clearance; }
      if (clearance >= safeDistance) break;
    }
    if (!best) {
      const index = this.nav.free.findIndex(Boolean);
      best = { x: (index % this.nav.cols + .5) * this.nav.cell, y: (Math.floor(index / this.nav.cols) + .5) * this.nav.cell };
    }
    this.target.setPosition(best.x, best.y); this.coinShadow.setPosition(best.x, best.y + 16 * this.unit);
  }

  private completeLevel(): void {
    this.state = 'between'; this.score += 250 * (this.levelIndex + 1);
    const restoredLife = this.lives < STARTING_LIVES;
    this.lives = Math.min(STARTING_LIVES, this.lives + 1);
    this.saveBest(); this.updateHUD(); this.resetTouch();
    const next = LEVELS[this.levelIndex + 1];
    this.showModal(`ПОЛЯНА ${this.levelIndex + 1} ПРОЙДЕНА`, 'Отличный побег!',
      `Дальше: ${next.name}. ${next.coins} монет, ${next.enemies} ${next.enemies === 1 ? 'волк' : 'волка'} и больше скорость.${next.rush ? ' Следи за предупреждением о рывке.' : ''} ${restoredLife ? 'Восстановлена одна жизнь.' : 'Все три жизни сохранены.'}`, 'На следующую поляну', false);
    this.showStats();
  }

  private finishGame(result: 'won' | 'lost'): void {
    this.state = result; this.saveBest(); this.resetTouch(); this.warnings.clear();
    this.showModal(result === 'won' ? 'ВСЕ ПОЛЯНЫ ПРОЙДЕНЫ' : `ПОЛЯНА ${this.levelIndex + 1} / ${LEVELS.length}`,
      result === 'won' ? 'Лес запомнит тебя.' : 'Волки оказались быстрее.',
      result === 'won' ? `Все ${LEVELS.reduce((sum, level) => sum + level.coins, 0)} монет собраны! Попробуй пройти ещё раз: длинные серии приносят больше очков.`
        : 'Заходи к монетам по дуге и используй рывок, когда волк перекрывает путь. Следующая попытка будет лучше.', 'Ещё одна попытка', false);
    this.showStats();
  }

  private primaryAction(): void {
    if (this.state === 'between') {
      this.loadLevel(this.levelIndex + 1); this.hideModal();
      this.toast(this.levelIndex === 2 ? 'Два волка предугадывают твой путь.' : this.levelIndex === 3 ? 'Жёлтая линия - предупреждение о рывке!' : 'Волки стали быстрее. Используй обходы и лужи.');
    } else if (this.state === 'paused') this.resume();
    else if (this.state === 'ready' || this.state === 'won' || this.state === 'lost') this.startNewRun();
  }

  private togglePause(): void {
    if (this.state === 'playing') this.pause(false);
    else if (this.state === 'paused') this.resume();
  }

  private pause(help: boolean): void {
    this.state = 'paused'; this.resetTouch();
    this.showModal(help ? 'ПРАВИЛА ЛЕСНОЙ ПОГОНИ' : 'МОЖНО ПЕРЕВЕСТИ ДУХ', help ? 'Как остаться на шаг впереди' : 'Пауза',
      help ? 'Три жизни. Между полянами +1 жизнь. Монеты для магазина сохраняются после поражения.'
        : 'Игра остановлена. Монеты, жизни и прогресс сохраняются до продолжения этой попытки.', 'Продолжить', help);
    this.element('secondary-button').hidden = false;
    this.element('pause-button').textContent = '▶';
  }

  private resume(): void { this.state = 'playing'; this.hideModal(); this.element('pause-button').textContent = 'Ⅱ'; }

  private resetTouch(): void {
    this.touchX = 0; this.touchY = 0; this.joystickPointer = null;
    this.element('joystick-knob').style.transform = '';
  }

  private showModal(tag: string, title: string, description: string, action: string, help: boolean): void {
    this.element('modal-tag').textContent = tag;
    this.element('modal-title').textContent = title;
    this.element('modal-description').textContent = description;
    this.element('primary-button').innerHTML = `${action} <span>↗</span>`;
    this.element('help-content').hidden = !help;
    this.element('modal-stats').replaceChildren();
    this.element('secondary-button').hidden = true;
    this.element('overlay').hidden = false;
    this.element('overlay').classList.toggle('rules-open', help);
    document.body.classList.add('menu-open');
  }

  private showStats(): void {
    const stats = this.element('modal-stats');
    for (const [value, label] of [[this.score, 'очки'], [this.totalCoins, 'монеты'], [Math.floor(this.elapsed), 'секунды']] as const) {
      const column = document.createElement('div');
      const number = document.createElement('strong'); number.textContent = String(value);
      const caption = document.createElement('span'); caption.textContent = label;
      column.append(number, caption); stats.append(column);
    }
  }

  private hideModal(): void { this.element('overlay').hidden = true; document.body.classList.remove('menu-open'); this.element('pause-button').textContent = 'Ⅱ'; }

  private updateHUD(): void {
    const level = LEVELS[this.levelIndex];
    this.element('level-label').textContent = `ПОЛЯНА ${this.levelIndex + 1} / ${LEVELS.length}`;
    this.element('level-name').textContent = level.name;
    this.element('coin-count').textContent = `${this.stageCoins} / ${level.coins}`;
    this.element('coin-progress').style.width = `${this.stageCoins / level.coins * 100}%`;
    this.element('score-count').textContent = String(this.score);
    this.element('best-label').textContent = `Рекорд: ${this.best}`;
    this.element('hearts').textContent = '♥ '.repeat(this.lives) + '♡ '.repeat(STARTING_LIVES - this.lives);
    this.element('hearts').setAttribute('aria-label', `Жизни: ${this.lives}`);
    this.element('enemy-label').textContent = `${level.enemies} ${level.enemies === 1 ? 'волк' : 'волка'} · ${level.rush ? 'прогноз + рывки' : 'предугадывают путь'}`;
    this.element('combo-label').textContent = 'Собирай монеты подряд'; this.updateWallet();
  }

  private updateDashUI(): void {
    this.element('dash-progress').style.width = `${(1 - this.dashCooldown / this.dashWait()) * 100}%`;
    this.element('dash-label').textContent = this.dashCooldown > .05 ? `Рывок через ${this.dashCooldown.toFixed(1)} с` : 'Рывок готов';
    this.element('dash-button').classList.toggle('cooldown', this.dashCooldown > 0);
  }

  private toast(text: string): void {
    window.clearTimeout(this.toastTimeout);
    this.element('toast').textContent = text; this.element('toast').classList.add('visible');
    this.toastTimeout = window.setTimeout(() => this.element('toast').classList.remove('visible'), 2800);
  }

  private particles(x: number, y: number, count: number, tint: number): void {
    for (let i = 0; i < count; i++) {
      const spark = this.add.image(x, y, 'spark').setDisplaySize(20 * this.unit, 20 * this.unit).setTint(tint).setDepth(18);
      const angle = Math.PI * 2 * i / count;
      const distance = Phaser.Math.Between(20, 42) * this.unit;
      this.tweens.add({ targets: spark, x: x + Math.cos(angle) * distance, y: y + Math.sin(angle) * distance,
        alpha: 0, scale: 0, duration: 420, onComplete: () => spark.destroy() });
    }
  }

  private clampObject(object: Phaser.GameObjects.Image): void {
    const margin = FIELD_MARGIN * this.unit;
    object.x = Phaser.Math.Clamp(object.x, margin, this.width - margin);
    object.y = Phaser.Math.Clamp(object.y, FIELD_TOP, this.height - margin);
  }

  private updateUnit(): void { this.unit = Phaser.Math.Clamp(Math.min(this.width / 960, this.height / 560), .66, 1); }

  private drawBackground(): void {
    const key = background(this, this.width, this.height, this.levelIndex + 1, LEVELS[this.levelIndex].palette);
    this.backdrop.setTexture(key).setDisplaySize(this.width, this.height);
    if (this.oldBackground && this.oldBackground !== key) this.textures.remove(this.oldBackground);
    this.oldBackground = key;
  }

  private resizeField(size: Phaser.Structs.Size): void {
    if (!this.player || size.width < 100 || size.height < 100) return;
    const oldWidth = this.width, oldHeight = this.height;
    this.width = size.width; this.height = size.height; this.updateUnit(); this.drawBackground();
    for (const object of [this.player, this.target, ...this.enemies.map(enemy => enemy.sprite)]) {
      object.x *= this.width / oldWidth; object.y *= this.height / oldHeight; this.clampObject(object);
    }
    this.player.setDisplaySize(61 * this.unit, 61 * this.unit);
    this.target.setDisplaySize(53 * this.unit, 53 * this.unit);
    this.playerShadow.setSize(31 * this.unit, 12 * this.unit).setPosition(this.player.x, this.player.y + 18 * this.unit);
    this.coinShadow.setSize(22 * this.unit, 8 * this.unit).setPosition(this.target.x, this.target.y + 16 * this.unit);
    for (const enemy of this.enemies) {
      enemy.sprite.setDisplaySize(67 * this.unit, 67 * this.unit);
      enemy.shadow.setSize(35 * this.unit, 12 * this.unit).setPosition(enemy.sprite.x, enemy.sprite.y + 16 * this.unit);
    }
    const sx = this.width / oldWidth, sy = this.height / oldHeight;
    for (const zone of this.wetZones) { zone.x *= sx; zone.y *= sy; zone.radius *= Math.min(sx, sy); }
    if (this.strike) { this.strike.x *= sx; this.strike.y *= sy; }
    this.setupTerrain();
    for (const object of [this.player, ...this.enemies.map(e => e.sprite)]) this.resolvePosition(object, ENEMY_RADIUS * this.unit);
    for (const enemy of this.enemies) { enemy.path = []; enemy.pathLeft = 0; }
    if (!freePoint(this.target, PLAYER_RADIUS * this.unit + 8, this.terrain, this.bounds())) this.placeCoin();
    this.playerShadow.setPosition(this.player.x, this.player.y + 18 * this.unit);
    for (const enemy of this.enemies) enemy.shadow.setPosition(enemy.sprite.x, enemy.sprite.y + 16 * this.unit);
    this.coinShadow.setPosition(this.target.x, this.target.y + 16 * this.unit);
    this.element('control-hint').textContent = matchMedia('(pointer: coarse)').matches || this.width < 700
      ? 'Джойстик слева - движение · ϟ справа - рывок' : 'WASD / стрелки · Пробел - рывок · P - пауза';
    this.playerVelocity = { x: 0, y: 0 }; this.drawWeather(); this.resetTouch();
  }

  private bounds(): Bounds { return { width: this.width, height: this.height, margin: FIELD_MARGIN * this.unit, top: FIELD_TOP }; }
  private playerSpeed(): number { return PLAYER_SPEED * (1 + this.profile.upgrades.speed * .06); }
  private dashWait(): number { return DASH_COOLDOWN - this.profile.upgrades.dash * .3; }

  private resolvePosition(object: Phaser.GameObjects.Image, radius: number): void {
    const position = moveCircle(object, 0, 0, radius, this.terrain, this.bounds()); object.setPosition(position.x, position.y);
  }

  private setupTerrain(): void {
    for (const sprite of this.terrainSprites) sprite.destroy();
    this.terrain = makeTerrain(this.levelIndex, this.bounds(), this.unit);
    this.terrainSprites = this.terrain.map(t => this.add.image(t.x, t.y, t.kind)
      .setOrigin(.5, t.kind === 'tree' ? .82 : t.kind === 'stump' ? .61 : .5)
      .setDisplaySize((t.kind === 'tree' ? 108 : t.kind === 'stump' ? 70 : 110) * this.unit,
        (t.kind === 'tree' ? 108 : t.kind === 'stump' ? 70 : 110) * this.unit)
      .setDepth(t.kind === 'puddle' ? 2 : 7));
    this.nav = makeGrid(this.terrain, this.bounds(), this.unit, ENEMY_RADIUS * this.unit);
  }

  private resetWeather(): void {
    this.weather = 'clear'; this.weatherLeft = 0; this.weatherNext = Phaser.Math.Between(...WEATHER_INTERVAL);
    this.wetZones = []; this.strike = null;
    this.weatherInk.clear(); this.stormInk.clear(); this.updateWeatherLabel();
  }

  private randomOpenPoint(): Point {
    for (let i = 0; i < 60; i++) {
      const point = { x: Phaser.Math.FloatBetween(40 * this.unit, this.width - 40 * this.unit),
        y: Phaser.Math.FloatBetween(FIELD_TOP + 20, this.height - 40 * this.unit) };
      if (freePoint(point, PLAYER_RADIUS * this.unit, this.terrain, this.bounds())) return point;
    }
    return { x: this.player.x, y: this.player.y };
  }

  private startWeather(kind: 'rain' | 'storm' = Math.random() < .5 ? 'rain' : 'storm'): void {
    this.weather = kind; this.weatherLeft = WEATHER_DURATION; this.strikeNext = 1.7;
    const radius = Math.min(140 * this.unit, Math.min(this.width, this.height) * .25);
    this.wetZones = Array.from({ length: 2 }, () => ({ ...this.randomOpenPoint(), radius }));
    this.toast(kind === 'rain' ? 'Дождь! В мокрых кругах все движутся медленнее.' : 'Гроза! Оранжевый круг предупреждает о молнии.');
    this.updateWeatherLabel();
  }

  private queueStrike(): void {
    let point = this.randomOpenPoint();
    const roll = Math.random();
    // Иногда удар рядом с героем, иногда рядом с волком, иногда в случайном месте.
    if (roll < .4) point = clampPoint({ x: this.player.x + Phaser.Math.Between(-70, 70) * this.unit,
      y: this.player.y + Phaser.Math.Between(-70, 70) * this.unit }, this.bounds());
    else if (roll < .7 && this.enemies.length) {
      const enemy = Phaser.Utils.Array.GetRandom(this.enemies);
      point = { x: enemy.sprite.x, y: enemy.sprite.y };
    }
    this.strike = { ...point, phase: 'warning', left: LIGHTNING_WARNING };
  }

  private updateWeather(seconds: number): void {
    this.playerStunned = Math.max(0, this.playerStunned - seconds);
    for (const enemy of this.enemies) enemy.stunned = Math.max(0, enemy.stunned - seconds);
    if (this.weather === 'clear') {
      this.weatherNext -= seconds;
      if (this.weatherNext <= 0) this.startWeather();
    } else {
      this.weatherLeft -= seconds;
      if (this.weatherLeft <= 0) { this.resetWeather(); this.toast('Погода прояснилась.'); }
      else if (this.weather === 'storm') {
        this.strikeNext -= seconds;
        if (!this.strike && this.strikeNext <= 0) this.queueStrike();
        if (this.strike) {
          this.strike.left -= seconds;
          if (this.strike.left <= 0) {
            if (this.strike.phase === 'warning') {
              const strike = this.strike;
              strike.phase = 'impact'; strike.left = .3; this.strikeNext = 3.2;
              const hit = (p: Point) => Math.hypot(p.x - strike.x, p.y - strike.y) <= LIGHTNING_RADIUS * this.unit;
              if (hit(this.player)) { this.playerStunned = 1.8; this.toast('Молния замедлила тебя. Из оранжевого круга лучше уходить.'); }
              for (const enemy of this.enemies) if (hit(enemy.sprite)) {
                enemy.stunned = 2.4; enemy.mode = 'chase'; enemy.timer = 3; enemy.pathLeft = 0;
              }
              this.particles(strike.x, strike.y, 10, 0xffe6a6);
            } else this.strike = null;
          }
        }
      }
    }
    this.drawWeather(); this.updateWeatherLabel();
  }

  private groundSpeed(point: Point, player: boolean): number {
    if (player && this.playerStunned > 0) return .2;
    let speed = 1;
    if (this.terrain.some(t => t.kind === 'puddle' && Math.hypot(point.x - t.x, point.y - t.y) < t.radius)) speed = player ? .72 : .62;
    if (this.weather !== 'clear' && this.wetZones.some(z => Math.hypot(point.x - z.x, point.y - z.y) < z.radius)) speed = Math.min(speed, player ? .75 : .60);
    if (player && speed < 1) speed = Math.min(.96, speed + this.profile.upgrades.boots * .12);
    return speed;
  }

  private drawWeather(): void {
    const ink = this.weatherInk; ink.clear(); this.stormInk.clear();
    for (const zone of this.wetZones) {
      ink.fillStyle(this.weather === 'storm' ? 0x565677 : 0x538e91, .23); ink.fillCircle(zone.x, zone.y, zone.radius);
      ink.lineStyle(2, 0xb4dbbf, .6); ink.strokeCircle(zone.x, zone.y, zone.radius);
      ink.lineStyle(1.5, 0xd5e3d7, .65);
      for (let i = 0; i < 30; i++) {
        const x = zone.x + Math.sin(i * 127.1) * zone.radius * .9;
        const y = zone.y - zone.radius + (this.animationTime * 140 + i * 39) % (zone.radius * 2);
        if (Math.hypot(x - zone.x, y - zone.y) < zone.radius * .92) ink.lineBetween(x, y, x - 3 * this.unit, y + 10 * this.unit);
      }
    }
    if (!this.strike) return;
    const strike = this.strike, fx = this.stormInk, radius = LIGHTNING_RADIUS * this.unit;
    fx.fillStyle(strike.phase === 'warning' ? 0xe6a454 : 0xfff1b5, strike.phase === 'warning' ? .24 : .40);
    fx.fillCircle(strike.x, strike.y, radius); fx.lineStyle(3, 0xffd17d, .95); fx.strokeCircle(strike.x, strike.y, radius);
    if (strike.phase === 'warning') {
      fx.lineStyle(2, 0xffe0a0, .9); fx.strokeCircle(strike.x, strike.y, radius * Math.max(.1, strike.left / LIGHTNING_WARNING));
      fx.lineBetween(strike.x, strike.y - 10 * this.unit, strike.x, strike.y + 2 * this.unit); fx.fillStyle(0xffecc0); fx.fillCircle(strike.x, strike.y + 9 * this.unit, 2 * this.unit);
    } else {
      fx.lineStyle(5 * this.unit, 0xffefa9, .9); fx.beginPath(); fx.moveTo(strike.x + 12 * this.unit, 0);
      fx.lineTo(strike.x - 6 * this.unit, strike.y - 38 * this.unit); fx.lineTo(strike.x + 10 * this.unit, strike.y - 41 * this.unit); fx.lineTo(strike.x, strike.y); fx.strokePath();
    }
  }

  private updateWeatherLabel(): void {
    this.element('weather-label').textContent = this.weather === 'clear' ? '☀ Ясно' : `${this.weather === 'rain' ? '☂ Дождь' : 'ϟ Гроза'} · ${Math.ceil(this.weatherLeft)} с`;
    this.element('terrain-label').textContent = this.playerStunned > 0 ? 'Молния: замедление' : this.groundSpeed(this.player, true) < 1 ? 'Мокрая зона: медленнее' : 'Деревья и пни нужно обходить';
  }

  private updateWallet(): void {
    this.element('wallet-count').textContent = String(this.profile.coins);
    this.element('shop-wallet').textContent = `${this.profile.coins} ✦`;
  }

  private saveProfile(): void {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(this.profile)); }
    catch { this.storageAvailable = false; }
  }

  private openShop(): void {
    if (this.shopOpen) return;
    this.shopReturn = this.state; this.state = 'paused'; this.shopOpen = true; this.resetTouch();
    this.element('shop-overlay').hidden = false; document.body.classList.add('menu-open');
    this.element('shop-message').textContent = 'Каждая собранная монета пополняет кошелёк.';
    this.renderShop();
  }

  private closeShop(): void {
    this.shopOpen = false; this.state = this.shopReturn; this.element('shop-overlay').hidden = true;
    if (this.element('overlay').hidden) document.body.classList.remove('menu-open');
  }

  private renderShop(): void {
    this.updateWallet();
    for (const tab of ['skins', 'upgrades']) {
      const active = this.shopTab === tab; this.element(`tab-${tab}`).classList.toggle('selected', active);
      this.element(`tab-${tab}`).setAttribute('aria-selected', String(active));
    }
    this.element('storage-status').textContent = this.storageAvailable ? 'Покупки сохраняются в этом браузере.' : 'Хранилище недоступно: покупки действуют до закрытия страницы.';
    const items = this.element('shop-items'); items.replaceChildren();
    if (this.shopTab === 'skins') for (const skin of SKINS) {
      const owned = this.profile.owned.includes(skin.id), selected = this.profile.skin === skin.id;
      const card = document.createElement('article'); card.className = 'shop-card';
      const image = document.createElement('img'); image.alt = `Скин ${skin.name}`;
      image.src = (this.textures.get(skin.id).getSourceImage() as HTMLCanvasElement).toDataURL();
      const name = document.createElement('strong'); name.textContent = skin.name;
      const note = document.createElement('span'); note.textContent = 'Меняет внешний вид';
      const button = document.createElement('button'); button.dataset.item = skin.id; button.disabled = selected;
      button.textContent = selected ? 'Надет' : owned ? 'Надеть' : `Купить · ${skin.price} ✦`;
      card.append(image, name, note, button); items.append(card);
    } else for (const upgrade of UPGRADES) {
      const rank = this.profile.upgrades[upgrade.id], max = rank >= upgrade.prices.length;
      const card = document.createElement('article'); card.className = 'shop-card';
      const icon = document.createElement('div'); icon.className = 'upgrade-icon'; icon.textContent = upgrade.icon;
      const name = document.createElement('strong'); name.textContent = upgrade.name;
      const note = document.createElement('span'); note.textContent = `${upgrade.description} · ${rank}/${upgrade.prices.length}`;
      const button = document.createElement('button'); button.dataset.item = upgrade.id; button.disabled = max;
      button.textContent = max ? 'Максимум' : `Улучшить · ${upgrade.prices[rank]} ✦`;
      card.append(icon, name, note, button); items.append(card);
    }
  }

  private readBest(): number {
    try { const value = Number(localStorage.getItem(STORAGE_KEY)); return Number.isFinite(value) && value >= 0 ? value : 0; }
    catch { return 0; }
  }

  private saveBest(): void {
    if (this.score <= this.best) return;
    this.best = this.score;
    try { localStorage.setItem(STORAGE_KEY, String(this.best)); } catch { /* Игра работает и без доступа к хранилищу. */ }
  }
}
