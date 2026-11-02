import Phaser from 'phaser';

export type Palette = {
  ground: string;
  light: string;
  grass: string;
  tree: string;
  accent: string;
};

export function texture(
  scene: Phaser.Scene,
  key: string,
  draw: (c: CanvasRenderingContext2D) => void,
): void {
  if (scene.textures.exists(key)) {
    return;
  }
  const result = scene.textures.createCanvas(key, 128, 128);
  if (!result) {
    throw new Error(`Cannot create texture ${key}`);
  }
  const c = result.getContext();
  c.scale(2, 2);
  draw(c);
  result.refresh();
}

export function ellipse(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string | CanvasGradient,
): void {
  c.fillStyle = fill;
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fill();
}
