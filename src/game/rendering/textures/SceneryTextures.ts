import Phaser from 'phaser';
import { ellipse, type Palette } from './TexturePrimitives';

export function localScenery(g: Phaser.GameObjects.Graphics, start: number): void {
  const commands = g.commandBuffer.slice();
  g.clear();
  g.save();
  g.translateCanvas(-start, 0);
  g.commandBuffer = g.commandBuffer.concat(commands);
  g.restore();
}

export function mergeScenery(
  g: Phaser.GameObjects.Graphics,
  key: string,
  start: number,
  width: number,
  height: number,
): void {
  localScenery(g, start);
  if (!g.scene.textures.exists(key)) {
    g.generateTexture(key, width, height);
  }
  g.destroy();
}

export function bakeScenery(
  scene: Phaser.Scene,
  g: Phaser.GameObjects.Graphics,
  key: string,
  start: number,
  width: number,
  height: number,
  depth: number,
): Phaser.GameObjects.Image {
  localScenery(g, start);
  if (!g.scene.textures.exists(key)) {
    g.generateTexture(key, width, height);
  }
  g.destroy();
  return scene.add.image(start, 0, key).setOrigin(0).setDepth(depth);
}

export function background(
  scene: Phaser.Scene,
  width: number,
  height: number,
  level: number,
  palette: Palette,
): string {
  const key = `forest-${level}-${width}-${height}`;
  if (scene.textures.exists(key)) {
    return key;
  }
  const tex = scene.textures.createCanvas(key, Math.ceil(width), Math.ceil(height));
  if (!tex) {
    throw new Error('Cannot create forest background');
  }
  const c = tex.getContext();
  let seed = level * 919 + 37;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const gradient = c.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, palette.light);
  gradient.addColorStop(1, palette.ground);
  c.fillStyle = gradient;
  c.fillRect(0, 0, width, height);
  // Чёткий грунт: мелкие камни, листья, трещины и отдельные травинки.
  const rocky = [2, 5, 6, 7].includes(level);
  const ash = level === 4;
  if (rocky) {
    const tile = level === 6 ? 56 : 74;
    for (let row = 0; row < height / tile; row++) {
      for (let col = -1; col < width / tile; col++) {
        const x = col * tile + ((row % 2) * tile) / 2;
        const y = row * tile;
        c.fillStyle = palette.grass;
        c.globalAlpha = 0.11 + random() * 0.09;
        c.fillRect(x + 2, y + 2, tile - 4, tile - 4);
        c.globalAlpha = 0.35;
        c.strokeStyle = palette.tree;
        c.lineWidth = 1;
        c.strokeRect(x + 1, y + 1, tile - 2, tile - 2);
        c.strokeStyle = palette.accent;
        c.globalAlpha = 0.18;
        c.beginPath();
        c.moveTo(x + 4, y + 3);
        c.lineTo(x + tile - 5, y + 3);
        c.stroke();
        if (random() < 0.3) {
          c.globalAlpha = 0.38;
          c.strokeStyle = palette.tree;
          c.beginPath();
          c.moveTo(x + tile * 0.2, y + 10);
          c.lineTo(x + tile * 0.45, y + tile * 0.55);
          c.lineTo(x + tile * 0.7, y + tile * 0.7);
          c.stroke();
        }
      }
    }
  }
  for (let n = 0; n < (width * height) / 280; n++) {
    const x = random() * width;
    const y = random() * height;
    const v = random();
    c.globalAlpha = 0.22 + random() * 0.3;
    if (v < 0.45) {
      c.fillStyle = v < 0.2 ? palette.tree : palette.accent;
      c.fillRect(x, y, 1 + random() * 3, 1 + random() * 2);
    } else if (v < 0.67) {
      c.fillStyle = ash ? '#26272f' : palette.tree;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + 3, y - 3);
      c.lineTo(x + 8, y - 1);
      c.lineTo(x + 6, y + 3);
      c.closePath();
      c.fill();
      c.globalAlpha = 0.25;
      c.strokeStyle = palette.accent;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x + 2, y - 2);
      c.lineTo(x + 6, y - 1);
      c.stroke();
    } else if (!rocky && !ash) {
      c.strokeStyle = palette.grass;
      c.lineWidth = 1;
      for (let blade = 0; blade < 3; blade++) {
        c.beginPath();
        c.moveTo(x + blade * 2, y);
        c.lineTo(x + blade * 3 - 3, y - 4 - random() * 5);
        c.stroke();
      }
      if (n % 13 === 0) {
        c.globalAlpha = 0.8;
        ellipse(c, x, y - 5, 2, 1, level === 3 ? '#ba8ca8' : '#dccf89');
      }
    } else {
      c.strokeStyle = palette.tree;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + 6, y + 4);
      c.lineTo(x + 10, y + 2);
      c.stroke();
    }
  }
  c.globalAlpha = 1;
  if (level >= 30) {
    // Брусчатка вдоль дорог, с травой между швами.
    for (let row = 0; row < height / 19; row++) {
      for (let col = -1; col < width / 31; col++) {
        const x = col * 31 + (row % 2) * 15;
        const y = row * 19;
        const onRoad =
          Math.abs(y + 9 - 550) < 47 ||
          (y > 405 &&
            y < 947 &&
            (Math.abs(x + 15 - (width / 2 - 205)) < 21 ||
              Math.abs(x + 15 - (width / 2 + 205)) < 21));
        if (!onRoad) {
          continue;
        }
        c.globalAlpha = 0.44;
        c.fillStyle = random() < 0.5 ? '#8c9180' : '#afa88b';
        c.beginPath();
        c.moveTo(x + 2, y + 3);
        c.lineTo(x + 26, y + 1);
        c.lineTo(x + 29, y + 12);
        c.lineTo(x + 22, y + 17);
        c.lineTo(x + 4, y + 16);
        c.closePath();
        c.fill();
        c.globalAlpha = 0.5;
        c.strokeStyle = '#4d6550';
        c.lineWidth = 1;
        c.stroke();
        c.globalAlpha = 0.3;
        c.strokeStyle = '#e3d5ae';
        c.beginPath();
        c.moveTo(x + 4, y + 3);
        c.lineTo(x + 24 - random() * 8, y + 2);
        c.stroke();
      }
    }
    c.globalAlpha = 1;
  }
  // Детали биомов не имеют коллизий: это грунт, растения и следы прошлого.
  if (level === 2) {
    c.strokeStyle = '#e4d5a53b';
    c.lineWidth = 2;
    for (let i = 0; i < 18; i++) {
      const x = 140 + random() * (width - 280);
      const y = 130 + random() * (height - 260);
      c.strokeRect(x, y, 26 + random() * 25, 19 + random() * 19);
    }
  }
  if (level === 3) {
    for (let i = 0; i < 70; i++) {
      const x = random() * width;
      const y = random() * height;
      c.strokeStyle = '#b2c5a966';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x - 4, y - 15);
      c.moveTo(x, y);
      c.lineTo(x + 5, y - 19);
      c.stroke();
      if (i % 5 === 0) {
        ellipse(c, x + 4, y - 17, 5, 3, '#d1cb9b');
        ellipse(c, x - 5, y - 11, 4, 3, '#a18caf');
      }
    }
  }
  if (level === 4) {
    for (let i = 0; i < 32; i++) {
      const x = random() * width;
      const y = random() * height;
      c.strokeStyle = '#302e3838';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + 13, y + 14);
      c.lineTo(x + 9, y + 28);
      c.stroke();
      if (i % 3 === 0) {
        ellipse(c, x + 6, y + 3, 2, 2, '#f7c185');
      }
    }
  }
  if (level === 5) {
    const x = width * 0.64;
    const y = height * 0.5;
    c.strokeStyle = '#e0dba73b';
    c.lineWidth = 4;
    c.beginPath();
    c.ellipse(x, y, 115, 80, 0, 0, Math.PI * 2);
    c.stroke();
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(x, y, 93, 64, 0, 0, Math.PI * 2);
    c.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ellipse(c, x + Math.cos(a) * 105, y + Math.sin(a) * 72, 4, 4, '#eadbaa99');
    }
  }
  // Декоративная листва лежит у края, не скрывая игровые объекты.
  const tree = (x: number, y: number, size: number) => {
    ellipse(c, x + 6, y + 9, size, size * 0.7, '#0c302449');
    const canopy = c.createRadialGradient(x - size * 0.25, y - size * 0.25, 1, x, y, size);
    canopy.addColorStop(0, palette.grass);
    canopy.addColorStop(1, palette.tree);
    ellipse(c, x, y, size, size * 0.8, canopy);
    for (let k = 0; k < 10; k++) {
      const a = random() * Math.PI * 2;
      const r = random() * size * 0.65;
      c.globalAlpha = 0.18;
      ellipse(c, x + Math.cos(a) * r, y + Math.sin(a) * r, size * 0.26, size * 0.18, '#d4e4a2');
    }
    c.globalAlpha = 1;
  };
  for (let x = -8; x < width + 25; x += 64) {
    tree(x, -13, 38 + random() * 16);
    tree(x + 24, height + 15, 35 + random() * 18);
  }
  for (let y = 58; y < height; y += 83) {
    tree(-20, y, 34 + random() * 12);
    tree(width + 20, y + 30, 38 + random() * 12);
  }
  // Светлая дымка и виньетка объединяют рисунок.
  const light = c.createRadialGradient(
    width * 0.22,
    height * 0.15,
    0,
    width * 0.4,
    height * 0.4,
    width * 0.9,
  );
  light.addColorStop(0, '#fff8c023');
  light.addColorStop(1, '#082b271d');
  c.fillStyle = light;
  c.fillRect(0, 0, width, height);
  tex.refresh();
  return key;
}

export function biomeGround(
  scene: Phaser.Scene,
  start: number,
  index: number,
  width: number,
  height: number,
  palette: Palette,
  floorKey: string,
): void {
  const g = scene.add.graphics().setDepth(2);
  let seed = 4921 + index * 917;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const stone = index === 1 || index === 4 || index === 5 || index === 6;
  if (stone) {
    for (let n = 0; n < 140; n++) {
      const x = start + 90 + random() * (width - 180);
      const y = 100 + random() * (height - 200);
      g.fillStyle(index === 4 ? 0xbbd8dc : index === 5 ? 0x686076 : 0xa79b84, 0.12);
      g.fillRoundedRect(x, y, 24 + random() * 40, 15 + random() * 24, 5);
      g.lineStyle(1, 0x142834, 0.17);
      g.strokeRoundedRect(x, y, 24, 16, 4);
    }
  }
  if (index === 2) {
    g.fillStyle(0x4c7880, 0.25);
    for (let n = 0; n < 14; n++) {
      g.fillEllipse(
        start + random() * width,
        120 + random() * 800,
        60 + random() * 80,
        25 + random() * 40,
      );
    }
  }
  if (index === 3) {
    g.lineStyle(2, 0xf2965f, 0.2);
    for (let n = 0; n < 22; n++) {
      const x = start + random() * width;
      const y = 80 + random() * 940;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + 19, y + 17);
      g.lineTo(x + 9, y + 35);
      g.strokePath();
    }
  }
  if (index === 4) {
    g.lineStyle(2, 0xcfeaf6, 0.35);
    for (let n = 0; n < 95; n++) {
      const x = start + random() * width;
      const y = 80 + random() * 940;
      g.lineBetween(x - 3, y, x + 3, y);
      g.lineBetween(x, y - 3, x, y + 3);
    }
  }
  if (index === 5) {
    g.lineStyle(2, 0xb19ac9, 0.18);
    for (let n = 0; n < 20; n++) {
      const x = start + random() * width;
      const y = 90 + random() * 900;
      g.strokeCircle(x, y, 14);
      g.lineBetween(x - 10, y - 10, x + 10, y + 10);
    }
  }
  if (index === 6) {
    g.lineStyle(2, 0xb3d4da, 0.25);
    for (let n = 0; n < 15; n++) {
      const x = start + random() * width;
      const y = 80 + random() * 920;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x - 10, y + 16);
      g.lineTo(x + 8, y + 15);
      g.lineTo(x - 2, y + 31);
      g.strokePath();
    }
  }
  if (index === 7) {
    g.lineStyle(4, 0x9edccb, 0.22);
    g.strokeEllipse(start + width * 0.62, height * 0.5, 230, 175);
    g.lineStyle(2, 0xdad3ac, 0.28);
    g.strokeEllipse(start + width * 0.62, height * 0.5, 195, 148);
  }
  mergeScenery(g, floorKey, start, width, height);
  const landmark = scene.add
    .image(start + width * 0.65, height * 0.25, `landmark-${index}`)
    .setOrigin(0.5, 0.85)
    .setDisplaySize(250, 334)
    .setDepth(7);
  if (index === 0 || index === 2 || index === 7) {
    const lamp = scene.add
      .ellipse(
        start + width * 0.65,
        height * 0.18,
        170,
        60,
        parseInt(palette.accent.slice(1), 16),
        0.07,
      )
      .setDepth(3);
    scene.tweens.add({
      targets: lamp,
      alpha: 0.02,
      duration: 1700,
      yoyo: true,
      repeat: -1,
    });
  }
  landmark.setAlpha(0.97);
}
