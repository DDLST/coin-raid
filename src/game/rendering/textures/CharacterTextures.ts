import Phaser from 'phaser';
import { ARMED_MOTION_FRAMES, HERO_DIRECTIONS, SKINS } from '../../Constants';

export function createArmArtwork(scene: Phaser.Scene): void {
  for (const [key, bracer] of [
    ['hero-upper', false],
    ['hero-forearm', true],
  ] as const) {
    if (scene.textures.exists(key)) {
      continue;
    }
    const texture = scene.textures.createCanvas(key, 32, 64);
    if (!texture) {
      throw Error('Sleeve texture unavailable');
    }
    const c = texture.getContext();
    const gradient = c.createLinearGradient(0, 0, 32, 0);
    gradient.addColorStop(0, '#342723');
    gradient.addColorStop(0.45, bracer ? '#ad865e' : '#866143');
    gradient.addColorStop(1, '#3e2d25');
    c.fillStyle = gradient;
    c.beginPath();
    c.roundRect(3, 0, 26, 64, 8);
    c.fill();
    c.strokeStyle = '#c7a272';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(8, 6);
    c.lineTo(8, 57);
    c.stroke();
    c.fillStyle = '#322d2c';
    c.fillRect(4, bracer ? 8 : 51, 24, 7);
    c.fillStyle = '#bda276';
    c.fillRect(9, bracer ? 10 : 53, 5, 3);
    if (bracer) {
      c.strokeStyle = '#655347';
      c.lineWidth = 4;
      for (const y of [27, 46]) {
        c.beginPath();
        c.moveTo(5, y);
        c.lineTo(27, y + 3);
        c.stroke();
      }
    }
    texture.refresh();
  }
}

export function createHeroArtwork(scene: Phaser.Scene): void {
  const atlas = scene.textures.get('hero-atlas').getSourceImage() as CanvasImageSource;
  const directions = HERO_DIRECTIONS;
  for (const skin of SKINS) {
    for (let pose = 0; pose < 2; pose++) {
      for (let dir = 0; dir < 4; dir++) {
        const key =
          pose === 0 && dir === 0 ? skin.id : `${skin.id}-${directions[dir]}${pose ? '-run' : ''}`;
        const t = scene.textures.createCanvas(key, 128, 128);
        if (!t) {
          throw Error('Hero texture unavailable');
        }
        const c = t.getContext();
        c.imageSmoothingEnabled = true;
        c.imageSmoothingQuality = 'high';
        if (skin.id === 'fox-moon') {
          c.filter = 'grayscale(1) brightness(1.4)';
        } else if (skin.id === 'fox-ash') {
          c.filter = 'grayscale(.85) brightness(.75)';
        } else if (skin.id === 'fox-ember') {
          c.filter = 'saturate(1.5)';
        }
        c.drawImage(atlas, dir * 384, pose * 512, 384, 512, 16, 0, 96, 128);
        c.filter = 'none';
        if (!['fox', 'fox-moon', 'fox-ash', 'fox-ember'].includes(skin.id)) {
          c.globalCompositeOperation = 'source-atop';
          c.globalAlpha = 0.27;
          c.fillStyle = skin.scarf;
          c.fillRect(0, 0, 128, 128);
          c.globalAlpha = 1;
          c.globalCompositeOperation = 'source-over';
        }
        t.refresh();
      }
    }
  }
}

export function createArmedMotionArtwork(scene: Phaser.Scene, selected = 'fox'): void {
  if (scene.textures.exists(`${selected}-armed-front`)) {
    return;
  }
  const atlas = scene.textures.get('armed-motion-atlas').getSourceImage() as HTMLImageElement;
  // x/y/width/height/spine-x, measured on the painted bodies. Tails cross grid guides.
  const frames = ARMED_MOTION_FRAMES;
  for (const skin of SKINS.filter((s) => s.id === selected)) {
    for (const [row, direction] of ['front', 'back', 'left', 'right'].entries()) {
      for (let phase = 0; phase < 5; phase++) {
        const key = `${skin.id}-armed-${direction}${phase ? `-step-${phase - 1}` : ''}`;
        const t = scene.textures.createCanvas(key, 128, 128);
        if (!t) {
          throw Error('Armed body texture unavailable');
        }
        const c = t.getContext();
        c.imageSmoothingEnabled = true;
        c.imageSmoothingQuality = 'high';
        if (skin.id === 'fox-moon') {
          c.filter = 'grayscale(1) brightness(1.4)';
        } else if (skin.id === 'fox-ash') {
          c.filter = 'grayscale(.85) brightness(.75)';
        } else if (skin.id === 'fox-ember') {
          c.filter = 'saturate(1.5)';
        }
        const [x, y, width, height, spine] = frames[row][phase];
        const scale = 116 / height;
        c.drawImage(atlas, x, y, width, height, 64 + (x - spine) * scale, 8, width * scale, 116);
        c.filter = 'none';
        if (!['fox', 'fox-moon', 'fox-ash', 'fox-ember'].includes(skin.id)) {
          c.globalCompositeOperation = 'source-atop';
          c.globalAlpha = 0.27;
          c.fillStyle = skin.scarf;
          c.fillRect(0, 0, 128, 128);
          c.globalAlpha = 1;
          c.globalCompositeOperation = 'source-over';
        }
        t.refresh();
      }
    }
  }
  for (const skin of SKINS.filter((s) => s.id === selected)) {
    const t = scene.textures.createCanvas(`${skin.id}-arm-upper`, 128, 128);
    if (!t) {
      throw Error('Arm texture unavailable');
    }
    const c = t.getContext();
    if (skin.id === 'fox-moon') {
      c.filter = 'grayscale(1) brightness(1.4)';
    } else if (skin.id === 'fox-ash') {
      c.filter = 'grayscale(.85) brightness(.75)';
    } else if (skin.id === 'fox-ember') {
      c.filter = 'saturate(1.5)';
    }
    c.drawImage(scene.textures.get('arm-upper').getSourceImage() as CanvasImageSource, 0, 0);
    c.filter = 'none';
    if (!['fox', 'fox-moon', 'fox-ash', 'fox-ember'].includes(skin.id)) {
      c.globalCompositeOperation = 'source-atop';
      c.globalAlpha = 0.27;
      c.fillStyle = skin.scarf;
      c.fillRect(0, 0, 128, 128);
      c.globalAlpha = 1;
      c.globalCompositeOperation = 'source-over';
    }
    t.refresh();
  }
}

export function createStrideArtwork(scene: Phaser.Scene, selected = 'fox'): void {
  createMotionArtwork(scene, 'stride-atlas', 'step', selected);
}

export function createRollArtwork(scene: Phaser.Scene, selected = 'fox'): void {
  createMotionArtwork(scene, 'roll-atlas', 'roll', selected);
}

export function createMotionArtwork(
  scene: Phaser.Scene,
  atlasKey: string,
  motion: string,
  selected: string,
): void {
  if (scene.textures.exists(`${selected}-front-${motion}-0`)) {
    return;
  }
  const atlas = scene.textures.get(atlasKey).getSourceImage() as HTMLImageElement;
  const cell = atlas.width / 4;
  for (const skin of SKINS.filter((s) => s.id === selected)) {
    for (const [row, direction] of ['front', 'back', 'left', 'right'].entries()) {
      for (let phase = 0; phase < 4; phase++) {
        const t = scene.textures.createCanvas(
          `${skin.id}-${direction}-${motion}-${phase}`,
          128,
          128,
        );
        if (!t) {
          throw Error('Motion texture unavailable');
        }
        const c = t.getContext();
        c.imageSmoothingEnabled = true;
        c.imageSmoothingQuality = 'high';
        if (skin.id === 'fox-moon') {
          c.filter = 'grayscale(1) brightness(1.4)';
        } else if (skin.id === 'fox-ash') {
          c.filter = 'grayscale(.85) brightness(.75)';
        } else if (skin.id === 'fox-ember') {
          c.filter = 'saturate(1.5)';
        }
        c.drawImage(atlas, phase * cell, row * cell, cell, cell, 0, 0, 128, 128);
        c.filter = 'none';
        if (!['fox', 'fox-moon', 'fox-ash', 'fox-ember'].includes(skin.id)) {
          c.globalCompositeOperation = 'source-atop';
          c.globalAlpha = 0.27;
          c.fillStyle = skin.scarf;
          c.fillRect(0, 0, 128, 128);
          c.globalAlpha = 1;
          c.globalCompositeOperation = 'source-over';
        }
        t.refresh();
      }
    }
  }
}
