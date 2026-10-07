import Phaser from 'phaser';
import { GameScene } from './GameScene';

export function createGame(parent: string): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: document.getElementById(parent)?.clientWidth || 960,
    height: document.getElementById(parent)?.clientHeight || 560,
    backgroundColor: '#5c8a60',
    scene: [GameScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };

  return new Phaser.Game(config);
}
