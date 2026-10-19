import type Phaser from 'phaser';
import { type Point } from '../world/Navigation';
/** Ссылки на объекты Phaser, анимации и пулы графических эффектов. */
export class RenderState {
  player!: Phaser.GameObjects.Image;
  playerShadow!: Phaser.GameObjects.Ellipse;
  sword!: Phaser.GameObjects.Image;
  armorSprite!: Phaser.GameObjects.Image;
  combatInk!: Phaser.GameObjects.Graphics;
  weatherInk!: Phaser.GameObjects.Graphics;
  gateInk!: Phaser.GameObjects.Graphics;
  reaper!: Phaser.GameObjects.Image;
  stolenWeapon!: Phaser.GameObjects.Image;
  reaperInk!: Phaser.GameObjects.Graphics;
  effects: {
    x: number;
    y: number;
    angle: number;
    kind: 'slash' | 'ring' | 'thrust';
    color: number;
    life: number;
    max: number;
    radius: number;
  }[] = [];
  animationTime = 0;
  arms: {
    upper: Phaser.GameObjects.Image;
    forearm: Phaser.GameObjects.Image;
    hand: Phaser.GameObjects.Image;
  }[] = [];
  weaponTrail: Point[] = [];
  trailWeapon = '';
  trailAttack = -1;
  attackImages: Phaser.GameObjects.Image[] = [];
  attackImageCursor = 0;
  liveParticles = 0;
}
