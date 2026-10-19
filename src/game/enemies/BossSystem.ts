import { REGIONS } from '../world/WorldConfig';
import { type Enemy } from './EnemyTypes';
import { bossPattern, isBossAttack, type BossStrike } from './BossPatterns';
import Phaser from 'phaser';
import type { GameScene } from '../GameScene';

/** Предупреждения появления и выполнение уникальных приёмов боссов. */
export class BossSystem {
  constructor(private readonly context: GameScene) {}
  resetBossCountdown(): void {
    const { ui } = this.context;
    ui.bossDigit = -1;
    ui.bossDigitLeft = 0;
    this.context.element('boss-countdown').hidden = true;
  }
  updateBossCountdown(dt: number): void {
    const { worldState, journey, ui } = this.context;
    const notice = this.context.element('boss-countdown');
    if (ui.bossDigitLeft > 0) {
      ui.bossDigitLeft = Math.max(0, ui.bossDigitLeft - dt);
      if (ui.bossDigitLeft === 0) notice.hidden = true;
    }
    if (
      worldState.area !== 'biome' ||
      ui.state !== 'playing' ||
      journey.progress[worldState.regionIndex].spawned ||
      journey.progress[worldState.regionIndex].bossDead
    ) {
      if (
        worldState.area !== 'biome' ||
        journey.progress[worldState.regionIndex].spawned ||
        journey.progress[worldState.regionIndex].bossDead
      )
        this.resetBossCountdown();
      return;
    }
    const left = Math.ceil(
      REGIONS[worldState.regionIndex].bossTime - journey.progress[worldState.regionIndex].elapsed,
    );
    if (left > 0 && left <= 10 && left !== ui.bossDigit) {
      ui.bossDigit = left;
      ui.bossDigitLeft = 0.78;
      notice.innerHTML = `<span class="blood-digit">${left}</span><small>ПЕЧАТЬ ПРОБУЖДАЕТСЯ</small>`;
      notice.hidden = false;
      this.context.audio.play('heartbeat');
    }
  }
  startBossAttack(e: Enemy): void {
    const choices = REGIONS[e.region].bossMoves;
    e.move = choices[e.moveIndex++ % choices.length];
    e.target = this.context.enemies.predict(e);
    e.bossPlan = bossPattern(e.move, e.sprite, e.target, e.phase2);
    const dx = e.target.x - e.sprite.x,
      dy = e.target.y - e.sprite.y,
      d = Math.hypot(dx, dy) || 1;
    e.aim = { x: dx / d, y: dy / d };
    e.mode = 'windup';
    e.hasHit = false;
    e.clock = e.phase2 ? 0.88 : 1.1;
  }
  executeBossAttack(e: Enemy): void {
    const { worldState } = this.context;
    if (!isBossAttack(e.move)) e.move = REGIONS[e.region].bossMoves[0];
    const pattern = e.bossPlan ?? bossPattern(e.move, e.sprite, e.target, e.phase2),
      warning = e.phase2 ? 0.65 : 0.8;
    for (const attack of pattern)
      worldState.hazards.push({
        x: attack.x,
        y: attack.y,
        region: e.region,
        radius: attack.radius,
        warning: warning + attack.delay,
        left: warning + attack.delay + 0.58,
        damage: e.damage * attack.scale,
        kind: 'boss',
        fired: false,
        bossStrike: attack,
        ownerId: e.id,
      });
    e.recoil = 0.26;
    e.voiceLeft = 0.55;
    this.context.audio.play(e.region === 7 ? 'roar' : 'cast');
    e.mode = 'recover';
    e.clock = 0.95 + Math.max(...pattern.map((p) => p.delay), 0);
  }
  drawBossStrike(attack: BossStrike, warning: boolean, left: number): void {
    const { visuals } = this.context;
    const g = visuals.combatInk,
      color = warning
        ? 0xd05860
        : attack.visual === 'shot-fire' || attack.visual === 'fx-meteor'
          ? 0xfca976
          : attack.visual === 'shot-ice'
            ? 0xa4d4ef
            : attack.visual === 'shot-bat'
              ? 0xd992bb
              : attack.physical
                ? 0xe8d4b0
                : 0xc5a9e2;
    const alpha = warning ? 0.1 : Math.min(0.34, left * 0.65),
      pulse = 1 + Math.sin(visuals.animationTime * 10) * 0.03;
    if (attack.shape === 'line') {
      const c = Math.cos(attack.angle),
        s = Math.sin(attack.angle),
        l = attack.length / 2,
        w = attack.width / 2;
      const points = [
        [-l, -w],
        [l, -w],
        [l, w],
        [-l, w],
      ].map(
        ([x, y]) => new Phaser.Math.Vector2(attack.x + c * x - s * y, attack.y + s * x + c * y),
      );
      g.fillStyle(color, alpha);
      g.fillPoints(points, true);
      g.lineStyle(warning ? 2 : 3, color, 0.8);
      g.strokePoints(points, true);
      if (!warning) {
        g.lineStyle(attack.width * 0.35, color, alpha);
        g.lineBetween(attack.x - c * l, attack.y - s * l, attack.x + c * l, attack.y + s * l);
        for (let n = 0; n < 3; n++) {
          const x = (n - 1) * attack.length * 0.3;
          this.context.effects.drawCombatImage(
            attack.visual,
            attack.x + c * x,
            attack.y + s * x,
            attack.width * 2 * pulse,
            attack.angle,
            Math.min(0.85, left * 1.6),
          );
        }
      }
    } else if (attack.shape === 'ring') {
      g.lineStyle(attack.radius - attack.inner, color, alpha);
      g.strokeCircle(attack.x, attack.y, (attack.radius + attack.inner) / 2);
      g.lineStyle(warning ? 2 : 3, color, 0.8);
      g.strokeCircle(attack.x, attack.y, attack.radius);
      g.strokeCircle(attack.x, attack.y, attack.inner);
      for (let n = 0; n < 8; n++) {
        const a = (n * Math.PI) / 4,
          r = (attack.radius + attack.inner) / 2;
        this.context.effects.drawCombatImage(
          attack.visual,
          attack.x + Math.cos(a) * r,
          attack.y + Math.sin(a) * r,
          warning ? 20 : 42 * pulse,
          a,
          warning ? 0.3 : Math.min(0.75, left * 1.3),
        );
      }
    } else {
      g.fillStyle(color, alpha);
      g.fillCircle(attack.x, attack.y, attack.radius);
      g.lineStyle(warning ? 2 : 3, color, 0.8);
      g.strokeCircle(attack.x, attack.y, attack.radius);
      this.context.effects.drawCombatImage(
        attack.visual,
        attack.x,
        attack.y,
        attack.radius * (warning ? 0.65 : 1.6) * pulse,
        visuals.animationTime * 0.2,
        warning ? 0.38 : Math.min(0.9, left * 1.6),
      );
      if (warning) {
        g.lineStyle(1, color, 0.6);
        g.lineBetween(attack.x - 8, attack.y - 8, attack.x + 8, attack.y + 8);
        g.lineBetween(attack.x + 8, attack.y - 8, attack.x - 8, attack.y + 8);
      }
    }
  }
}
