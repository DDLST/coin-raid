import Phaser from 'phaser';
import { GAME_CONFIG } from './Constants';
import { GameScene } from './GameScene';

export function createGame(parent: string, training: boolean | null = null): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: document.getElementById(parent)?.clientWidth || GAME_CONFIG.fallbackWidth,
    height: document.getElementById(parent)?.clientHeight || GAME_CONFIG.fallbackHeight,
    backgroundColor: GAME_CONFIG.backgroundColor,
    scene: [new GameScene(training)],
    fps: { target: GAME_CONFIG.targetFps },
    render: { powerPreference: 'high-performance' },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };

  return new Phaser.Game(config);
}
