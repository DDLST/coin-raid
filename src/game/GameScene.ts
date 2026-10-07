import Phaser from 'phaser';

// Эти числа можно менять, не переписывая правила игры.
const PLAYER_SPEED = 260;
const ENEMY_SPEED = 210;
const COINS_TO_WIN = 10;
const PLAYER_SIZE = 42;
const ENEMY_SIZE = 46;
const COIN_RADIUS = 18;
const FIELD_TOP = 110;
const FIELD_BOTTOM_MARGIN = 80;
const SPAWN_DISTANCE = 90;

type GameState = 'playing' | 'won' | 'lost';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private target!: Phaser.GameObjects.Arc;
  private enemy!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;
  private restartKey!: Phaser.Input.Keyboard.Key;
  private scoreText!: Phaser.GameObjects.Text;
  private score = 0;
  private state: GameState = 'playing';
  private enemyDirection = -1;

  constructor() {
    super('GameScene');
  }

  create(): void {
    const { width, height } = this.scale;
    // create вызывается и при первом запуске, и при перезапуске сцены.
    this.score = 0;
    this.state = 'playing';
    this.enemyDirection = -1;

    this.add.text(width / 2, 24, 'МОНЕТНЫЙ РЕЙД', {
      fontFamily: 'system-ui, sans-serif', fontSize: '28px', color: '#ffffff',
    }).setOrigin(0.5, 0);

    this.add.text(width / 2, 66, 'Собери 10 монет. WASD / стрелки - движение. Красный враг опасен!', {
      fontFamily: 'system-ui, sans-serif', fontSize: '18px', color: '#cbd5e1',
    }).setOrigin(0.5, 0);

    this.add.rectangle(width / 2, height / 2, width - 48, ENEMY_SIZE + 20, 0xef4444, 0.08)
      .setStrokeStyle(1, 0xef4444, 0.25);
    this.player = this.add.rectangle(120, 180, PLAYER_SIZE, PLAYER_SIZE, 0x38bdf8)
      .setStrokeStyle(2, 0xe0f2fe);
    this.target = this.add.circle(width * 0.72, height * 0.52, COIN_RADIUS, 0xfacc15)
      .setStrokeStyle(3, 0xffe79b);
    // Враг патрулирует горизонтальную линию между краями поля.
    this.enemy = this.add.rectangle(width - 120, height / 2, ENEMY_SIZE, ENEMY_SIZE, 0xef4444);
    this.placeCoin();

    this.scoreText = this.add.text(24, height - 52, `Монеты: 0 / ${COINS_TO_WIN}`, {
      fontFamily: 'system-ui, sans-serif', fontSize: '22px', color: '#ffffff',
    });
    this.add.text(width - 24, height - 50, 'R - начать заново', {
      fontFamily: 'system-ui, sans-serif', fontSize: '18px', color: '#cbd5e1',
    }).setOrigin(1, 0);

    if (!this.input.keyboard) throw new Error('Keyboard input is unavailable.');
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }

  update(_time: number, delta: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.restart();
      return;
    }
    // После победы или поражения игровые объекты больше не движутся.
    if (this.state !== 'playing') return;

    // Ограничение защищает от большого скачка после переключения вкладки.
    const seconds = Math.min(delta, 50) / 1000;
    this.movePlayer(seconds);
    this.moveEnemy(seconds);

    if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.enemy.getBounds())) {
      this.finishGame('lost');
      return;
    }
    this.checkTarget();
  }

  private movePlayer(seconds: number): void {
    let dx = 0;
    let dy = 0;
    if (this.cursors.left.isDown || this.wasd.left.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) dx += 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.wasd.down.isDown) dy += 1;

    if (dx !== 0 || dy !== 0) {
      // Нормализация: движение по диагонали не быстрее обычного.
      const length = Math.hypot(dx, dy);
      this.player.x += (dx / length) * PLAYER_SPEED * seconds;
      this.player.y += (dy / length) * PLAYER_SPEED * seconds;
    }
    const half = PLAYER_SIZE / 2;
    this.player.x = Phaser.Math.Clamp(this.player.x, half, this.scale.width - half);
    this.player.y = Phaser.Math.Clamp(this.player.y, FIELD_TOP + half,
      this.scale.height - FIELD_BOTTOM_MARGIN - half);
  }

  private moveEnemy(seconds: number): void {
    const half = ENEMY_SIZE / 2;
    const right = this.scale.width - half;
    this.enemy.x += this.enemyDirection * ENEMY_SPEED * seconds;
    if (this.enemy.x <= half || this.enemy.x >= right) {
      this.enemy.x = Phaser.Math.Clamp(this.enemy.x, half, right);
      this.enemyDirection *= -1;
    }
  }

  private checkTarget(): void {
    const coin = new Phaser.Geom.Circle(this.target.x, this.target.y, COIN_RADIUS);
    if (!Phaser.Geom.Intersects.CircleToRectangle(coin, this.player.getBounds())) return;

    this.score += 1;
    this.scoreText.setText(`Монеты: ${this.score} / ${COINS_TO_WIN}`);
    if (this.score >= COINS_TO_WIN) {
      this.target.setVisible(false);
      this.finishGame('won');
      return;
    }
    this.placeCoin();
  }

  private placeCoin(): void {
    // Случайная точка сетки. Монета не появляется прямо на игроке или враге.
    const positions: { x: number; y: number }[] = [];
    for (let x = 60; x <= this.scale.width - 60; x += 120) {
      for (let y = FIELD_TOP + 50; y <= this.scale.height - FIELD_BOTTOM_MARGIN - 40; y += 100) {
        const fromPlayer = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
        const fromEnemy = Phaser.Math.Distance.Between(x, y, this.enemy.x, this.enemy.y);
        if (fromPlayer >= SPAWN_DISTANCE && fromEnemy >= SPAWN_DISTANCE) positions.push({ x, y });
      }
    }
    const position = Phaser.Utils.Array.GetRandom(positions);
    this.target.setPosition(position.x, position.y);
  }

  private finishGame(result: 'won' | 'lost'): void {
    this.state = result;
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75);
    this.add.text(width / 2, height / 2 - 48, result === 'won' ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ', {
      fontFamily: 'system-ui, sans-serif', fontSize: '42px', color: '#ffffff',
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 20,
      result === 'won' ? `Собраны все ${COINS_TO_WIN} монет!` : `Столкновение с врагом. Монеты: ${this.score} / ${COINS_TO_WIN}`, {
        fontFamily: 'system-ui, sans-serif', fontSize: '22px', color: '#ffffff',
      }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 70, 'Нажми R, чтобы начать заново', {
      fontFamily: 'system-ui, sans-serif', fontSize: '22px', color: '#facc15',
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 130, '  ИГРАТЬ СНОВА  ', {
      fontFamily: 'system-ui, sans-serif', fontSize: '22px', color: '#0f172a',
      backgroundColor: '#facc15', padding: { x: 12, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.restart());
  }
}
