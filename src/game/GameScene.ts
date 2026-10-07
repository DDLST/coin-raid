import Phaser from 'phaser';
import { background, createArtwork, type Palette } from './art';

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
};

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

  constructor() { super('GameScene'); }

  create(): void {
    this.width = this.scale.width;
    this.height = this.scale.height;
    this.updateUnit();
    createArtwork(this);
    this.backdrop = this.add.image(0, 0, 'fox').setOrigin(0).setDepth(0);
    this.warnings = this.add.graphics().setDepth(4);
    this.playerShadow = this.add.ellipse(0, 0, 34, 13, 0x0f3027, 0.3).setDepth(5);
    this.player = this.add.image(0, 0, 'fox').setDepth(10);
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
      `Собери монеты на всех полянах: их ${LEVELS.length}. Стражи идут по твоему следу, но у тебя есть рывок и три жизни.`, 'Начать погоню', true);
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
      else if (this.state === 'paused') this.element('help-content').hidden = false;
    }, { signal });
    this.element('dash-button').addEventListener('pointerdown', event => {
      event.preventDefault(); this.useDash();
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
    if (Phaser.Input.Keyboard.JustDown(this.keys.R)) { this.startNewRun(); return; }
    if (Phaser.Input.Keyboard.JustDown(this.keys.P) || Phaser.Input.Keyboard.JustDown(this.keys.ESC)) this.togglePause();
    if (Phaser.Input.Keyboard.JustDown(this.keys.ENTER) && this.state !== 'playing') this.primaryAction();
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || Phaser.Input.Keyboard.JustDown(this.keys.SHIFT)) this.useDash();
    if (this.state !== 'playing') return;

    const seconds = Math.min(delta, 40) / 1000;
    this.elapsed += seconds; this.animationTime += seconds;
    this.dashCooldown = Math.max(0, this.dashCooldown - seconds);
    this.hurtLeft = Math.max(0, this.hurtLeft - seconds);
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
    this.toast('Собирай монеты. Страж уже идёт за тобой!');
  }

  private loadLevel(index: number): void {
    this.levelIndex = index; this.stageCoins = 0; this.combo = 0;
    this.lastCoinTime = -COMBO_WINDOW; this.dashLeft = 0; this.dashCooldown = 0;
    this.hurtLeft = 1; this.touchX = 0; this.touchY = 0; this.isMoving = false;
    this.movementX = 1; this.movementY = 0;
    this.updateUnit(); this.drawBackground(); this.warnings.clear();
    this.player.setPosition(this.width * .32, this.height * .55).setAlpha(1).setFlipX(false);
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
      const sprite = this.add.image(position.x, position.y, ['warden', 'tracker', 'bramble'][i])
        .setDisplaySize(58 * this.unit, 58 * this.unit).setDepth(9);
      this.enemies.push({ sprite, shadow, mode: 'chase', timer: 3 + i * 2, rushX: 0, rushY: 0, index: i });
    }
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
    const speed = PLAYER_SPEED * this.unit * (dashing ? DASH_MULTIPLIER : 1);
    this.player.x += x * speed * seconds; this.player.y += y * speed * seconds;
    this.clampObject(this.player);
    if (dashing && Math.floor(this.animationTime * 50) % 3 === 0) {
      const ghost = this.add.image(this.player.x, this.player.y, 'fox').setDisplaySize(61 * this.unit, 61 * this.unit)
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
    this.dashLeft = DASH_DURATION; this.dashCooldown = DASH_COOLDOWN;
    this.dashX = this.movementX; this.dashY = this.movementY;
    this.particles(this.player.x, this.player.y, 5, 0xb8e9c8);
    this.updateDashUI();
  }

  private moveEnemies(seconds: number): void {
    this.warnings.clear();
    const level = LEVELS[this.levelIndex];
    for (const enemy of this.enemies) {
      const sprite = enemy.sprite;
      enemy.timer -= seconds;
      // Второй страж немного срезает путь в направлении движения игрока.
      const lead = enemy.index === 1 && this.isMoving ? 50 * this.unit : 0;
      const dx = this.player.x + this.movementX * lead - sprite.x;
      const dy = this.player.y + this.movementY * lead - sprite.y;
      const distance = Math.hypot(dx, dy) || 1;
      if (enemy.mode === 'chase' && level.rush && enemy.timer <= 0) {
        enemy.mode = 'warning'; enemy.timer = .75;
        enemy.rushX = dx / distance; enemy.rushY = dy / distance;
      }
      if (enemy.mode === 'warning') {
        // Направление фиксируется заранее: рывок можно прочитать и обойти.
        this.warnings.lineStyle(2, 0xffdfa0, .8);
        this.warnings.lineBetween(sprite.x, sprite.y, sprite.x + enemy.rushX * 120 * this.unit, sprite.y + enemy.rushY * 120 * this.unit);
        this.warnings.strokeCircle(sprite.x, sprite.y, (23 + Math.sin(this.animationTime * 20) * 3) * this.unit);
        if (enemy.timer <= 0) { enemy.mode = 'rush'; enemy.timer = .4; }
      } else if (enemy.mode === 'rush') {
        sprite.x += enemy.rushX * 350 * this.unit * seconds;
        sprite.y += enemy.rushY * 350 * this.unit * seconds;
        if (enemy.timer <= 0) { enemy.mode = 'chase'; enemy.timer = 4.5 + enemy.index; }
      } else {
        // Скорость растёт с уровнем и понемногу с каждой собранной монетой.
        const speed = Math.min(PLAYER_SPEED * .87, level.speed + this.stageCoins * 2) * this.unit;
        sprite.x += dx / distance * speed * seconds; sprite.y += dy / distance * speed * seconds;
      }
      this.clampObject(sprite);
      sprite.setFlipX(dx < 0).setAngle(Math.sin(this.animationTime * 12 + enemy.index) * 4);
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
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.sprite.x, enemy.sprite.y);
      if (distance > (PLAYER_RADIUS + ENEMY_RADIUS) * this.unit * .88) continue;
      this.lives -= 1; this.hurtLeft = HIT_PROTECTION; this.combo = 0;
      this.particles(this.player.x, this.player.y, 10, 0xffc49d);
      const dx = enemy.sprite.x - this.player.x, dy = enemy.sprite.y - this.player.y;
      const length = Math.hypot(dx, dy) || 1;
      enemy.sprite.x += (length === 1 ? 1 : dx / length) * 100 * this.unit;
      enemy.sprite.y += dy / length * 100 * this.unit;
      this.clampObject(enemy.sprite);
      enemy.mode = 'chase'; enemy.timer = 3;
      this.element('combo-label').textContent = 'Серия прервана'; this.updateHUD();
      if (this.lives <= 0) this.finishGame('lost');
      else this.toast('Минус жизнь. Рывок помогает пройти сквозь стража.');
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
    const margin = FIELD_MARGIN * this.unit + 10;
    const safeDistance = 85 * this.unit;
    // Ограниченное число попыток и запасная точка исключают бесконечный цикл.
    let best = { x: this.width / 2, y: this.height / 2, clearance: -1 };
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.FloatBetween(margin, this.width - margin);
      const y = Phaser.Math.FloatBetween(FIELD_TOP + 15, this.height - margin);
      let clearance = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
      for (const enemy of this.enemies) clearance = Math.min(clearance, Phaser.Math.Distance.Between(x, y, enemy.sprite.x, enemy.sprite.y));
      if (clearance > best.clearance) best = { x, y, clearance };
      if (clearance >= safeDistance) break;
    }
    this.target.setPosition(best.x, best.y);
    this.coinShadow.setPosition(best.x, best.y + 16 * this.unit);
  }

  private completeLevel(): void {
    this.state = 'between'; this.score += 250 * (this.levelIndex + 1);
    const restoredLife = this.lives < STARTING_LIVES;
    this.lives = Math.min(STARTING_LIVES, this.lives + 1);
    this.saveBest(); this.updateHUD(); this.resetTouch();
    const next = LEVELS[this.levelIndex + 1];
    this.showModal(`ПОЛЯНА ${this.levelIndex + 1} ПРОЙДЕНА`, 'Отличный побег!',
      `Дальше: ${next.name}. ${next.coins} монет, ${next.enemies} ${next.enemies === 1 ? 'страж' : 'стража'} и больше скорость.${next.rush ? ' Следи за предупреждением о рывке.' : ''} ${restoredLife ? 'Восстановлена одна жизнь.' : 'Все три жизни сохранены.'}`, 'На следующую поляну', false);
    this.showStats();
  }

  private finishGame(result: 'won' | 'lost'): void {
    this.state = result; this.saveBest(); this.resetTouch(); this.warnings.clear();
    this.showModal(result === 'won' ? 'ВСЕ ПОЛЯНЫ ПРОЙДЕНЫ' : `ПОЛЯНА ${this.levelIndex + 1} / ${LEVELS.length}`,
      result === 'won' ? 'Лес запомнит тебя.' : 'Стражи оказались быстрее.',
      result === 'won' ? `Все ${LEVELS.reduce((sum, level) => sum + level.coins, 0)} монет собраны! Попробуй пройти ещё раз: длинные серии приносят больше очков.`
        : 'Заходи к монетам по дуге и используй рывок, когда страж перекрывает путь. Следующая попытка будет лучше.', 'Ещё одна попытка', false);
    this.showStats();
  }

  private primaryAction(): void {
    if (this.state === 'between') {
      this.loadLevel(this.levelIndex + 1); this.hideModal();
      this.toast(this.levelIndex === 2 ? 'Новый страж умеет срезать путь.' : this.levelIndex === 3 ? 'Жёлтая линия - предупреждение о рывке!' : 'Стражи стали быстрее. Не забывай о рывке.');
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
      help ? 'Три жизни на забег. За каждую пройденную поляну восстанавливается одна. Монеты подряд дают больше очков.'
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

  private hideModal(): void { this.element('overlay').hidden = true; this.element('pause-button').textContent = 'Ⅱ'; }

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
    this.element('enemy-label').textContent = `${level.enemies} ${level.enemies === 1 ? 'страж' : 'стража'} · ${level.rush ? 'опасные рывки' : 'идут по следу'}`;
    this.element('combo-label').textContent = 'Собирай монеты подряд';
  }

  private updateDashUI(): void {
    this.element('dash-progress').style.width = `${(1 - this.dashCooldown / DASH_COOLDOWN) * 100}%`;
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
      enemy.sprite.setDisplaySize(58 * this.unit, 58 * this.unit);
      enemy.shadow.setSize(35 * this.unit, 12 * this.unit).setPosition(enemy.sprite.x, enemy.sprite.y + 16 * this.unit);
    }
    this.resetTouch();
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
