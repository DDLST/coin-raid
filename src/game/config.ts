import Phaser from 'phaser';
import { GameScene } from './GameScene';

export function createGame(parent: string,training:boolean|null=null): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: document.getElementById(parent)?.clientWidth || 960,
    height: document.getElementById(parent)?.clientHeight || 560,
    backgroundColor: '#10191e',
    scene: [new GameScene(training)],
    fps: {target:60},
    render: {powerPreference:'high-performance'},
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };

  return new Phaser.Game(config);
}
