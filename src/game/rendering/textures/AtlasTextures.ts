import Phaser from 'phaser';
import {
  COMBAT_TEXTURE_KEYS,
  ENEMY_TEXTURE_KEYS,
  EQUIPMENT_ATLAS_FRAMES,
  RESIDENT_CLOTH_COLORS,
  RESIDENT_ROLES,
  VILLAGER_TEXTURE_KEYS,
} from '../../Constants';
import { ellipse, texture } from './TexturePrimitives';

export function createAtlasArtwork(scene: Phaser.Scene): void {
  const village = scene.textures.get('village-atlas').getSourceImage() as CanvasImageSource;
  const keys = VILLAGER_TEXTURE_KEYS;
  for (let i = 0; i < 4; i++) {
    if (scene.textures.exists(keys[i])) {
      scene.textures.remove(keys[i]);
    }
    const npc = scene.textures.createCanvas(keys[i], 128, 128);
    if (!npc) {
      throw Error('NPC texture unavailable');
    }
    npc.getContext().drawImage(village, i * 384, 485, 384, 539, 20, 1, 88, 125);
    npc.refresh();
    const building = scene.textures.createCanvas(`building-${i}`, 384, 485);
    if (!building) {
      throw Error('Building texture unavailable');
    }
    building.getContext().drawImage(village, i * 384, 0, 384, 485, 0, 0, 384, 485);
    building.refresh();
  }
  const biomes = scene.textures.get('biome-atlas').getSourceImage() as CanvasImageSource;
  for (let i = 0; i < 8; i++) {
    const t = scene.textures.createCanvas(`landmark-${i}`, 384, 512);
    if (!t) {
      throw Error('Landmark texture unavailable');
    }
    t.getContext().drawImage(
      biomes,
      (i % 4) * 384,
      Math.floor(i / 4) * 512,
      384,
      512,
      0,
      0,
      384,
      512,
    );
    t.refresh();
  }
  texture(scene, 'wraith', (c) => {
    const aura = c.createRadialGradient(32, 30, 2, 32, 30, 30);
    aura.addColorStop(0, '#c8bcf044');
    aura.addColorStop(1, '#8f74c800');
    ellipse(c, 32, 30, 30, 30, aura);
    c.fillStyle = '#79708d';
    c.beginPath();
    c.moveTo(8, 60);
    c.lineTo(14, 22);
    c.quadraticCurveTo(18, 4, 32, 4);
    c.quadraticCurveTo(47, 5, 51, 23);
    c.lineTo(58, 60);
    c.lineTo(47, 52);
    c.lineTo(39, 61);
    c.lineTo(32, 54);
    c.lineTo(23, 61);
    c.lineTo(16, 52);
    c.fill();
    ellipse(c, 32, 24, 12, 14, '#202131');
    ellipse(c, 26, 22, 3, 2, '#c8a3ff');
    ellipse(c, 38, 22, 3, 2, '#c8a3ff');
    c.strokeStyle = '#c2a1ec';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(18, 41);
    c.lineTo(32, 47);
    c.lineTo(45, 39);
    c.stroke();
  });
  texture(scene, 'knight', (c) => {
    ellipse(c, 32, 57, 23, 5, '#141d2b44');
    ellipse(c, 23, 53, 8, 9, '#465766');
    ellipse(c, 42, 53, 8, 9, '#465766');
    c.fillStyle = '#586b7d';
    c.fillRect(15, 28, 32, 25);
    c.strokeStyle = '#d3b76f';
    c.lineWidth = 2;
    c.strokeRect(17, 29, 28, 22);
    ellipse(c, 32, 19, 18, 16, '#667989');
    c.fillStyle = '#263341';
    c.fillRect(18, 17, 28, 7);
    ellipse(c, 25, 20, 3, 1, '#efb898');
    ellipse(c, 38, 20, 3, 1, '#efb898');
    c.fillStyle = '#93b2c1';
    c.beginPath();
    c.moveTo(41, 30);
    c.lineTo(62, 31);
    c.lineTo(58, 49);
    c.lineTo(51, 57);
    c.lineTo(42, 48);
    c.fill();
    c.strokeStyle = '#e5d199';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(51, 35);
    c.lineTo(51, 51);
    c.moveTo(46, 40);
    c.lineTo(56, 40);
    c.stroke();
    c.strokeStyle = '#dce4d9';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(9, 51);
    c.lineTo(6, 18);
    c.stroke();
    c.strokeStyle = '#bb9657';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(1, 40);
    c.lineTo(14, 38);
    c.stroke();
  });
}

export function createCreepyArtwork(scene: Phaser.Scene): void {
  const atlas = scene.textures.get('creep-atlas').getSourceImage() as CanvasImageSource;
  const keys = ENEMY_TEXTURE_KEYS;
  for (const [i, key] of keys.entries()) {
    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }
    const t = scene.textures.createCanvas(key, 128, 128);
    if (!t) {
      throw Error('Monster texture unavailable');
    }
    const c = t.getContext();
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    c.drawImage(atlas, (i % 4) * 384, Math.floor(i / 4) * 512, 384, 512, 16, 0, 96, 128);
    t.refresh();
  }
}

export function createDetailArtwork(scene: Phaser.Scene): void {
  const atlas = scene.textures.get('details-atlas').getSourceImage() as CanvasImageSource;
  for (const [i, key] of [
    'archer',
    'alchemist',
    'shade',
    'gargoyle',
    'village-well',
    'village-wagon',
    'village-shrine',
    'village-board',
  ].entries()) {
    const t = scene.textures.createCanvas(key, 128, 128);
    if (!t) {
      throw Error('Detail texture unavailable');
    }
    t.getContext().drawImage(
      atlas,
      (i % 4) * 384,
      Math.floor(i / 4) * 512,
      384,
      512,
      16,
      0,
      96,
      128,
    );
    t.refresh();
  }
  const interior = scene.textures.get('interiors-atlas').getSourceImage() as HTMLImageElement;
  const cell = interior.width / 2;
  for (const [i, role] of ['smith', 'armorer', 'healer', 'trader'].entries()) {
    const t = scene.textures.createCanvas(`interior-${role}`, cell, cell);
    if (!t) {
      throw Error('Interior texture unavailable');
    }
    t.getContext().drawImage(
      interior,
      (i % 2) * cell,
      Math.floor(i / 2) * cell,
      cell,
      cell,
      0,
      0,
      cell,
      cell,
    );
    t.refresh();
  }
}

export function createCombatArtwork(scene: Phaser.Scene): void {
  const atlas = scene.textures.get('combat-atlas').getSourceImage() as HTMLImageElement;
  const rows = [0, 376, 746, 947, 1254].map((v) => (v * atlas.height) / 1254);
  const cell = atlas.width / 4;
  const keys = COMBAT_TEXTURE_KEYS;
  for (const [i, key] of keys.entries()) {
    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }
    const t = scene.textures.createCanvas(key, 128, 128);
    if (!t) {
      throw Error('Combat texture unavailable');
    }
    const row = Math.floor(i / 4);
    const height = rows[row + 1] - rows[row];
    const c = t.getContext();
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    c.drawImage(atlas, (i % 4) * cell, rows[row], cell, height, 0, 0, 128, 128);
    t.refresh();
  }
  const spirit = scene.textures.createCanvas('shot-spirit', 128, 128);
  if (!spirit) {
    throw Error('Spirit texture unavailable');
  }
  spirit
    .getContext()
    .drawImage(scene.textures.get('shot-violet').getSourceImage() as CanvasImageSource, 0, 0);
  spirit.refresh();
}

export function createEquipmentArtwork(scene: Phaser.Scene): void {
  const atlas = scene.textures.get('equipment-atlas').getSourceImage() as HTMLImageElement;
  const frames: [string, number, number, number, number][] = EQUIPMENT_ATLAS_FRAMES;
  for (const [key, x, y, width, height] of frames) {
    const equipment = !key.startsWith('arm-') && !key.startsWith('hand-');
    const size = equipment ? 256 : 128;
    const t = scene.textures.createCanvas(equipment ? `held-${key}` : key, size, size);
    if (!t) {
      throw Error('Equipment texture unavailable');
    }
    const c = t.getContext();
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    if (equipment) {
      const scale = 240 / height;
      c.drawImage(atlas, x, y, width, height, (256 - width * scale) / 2, 8, width * scale, 240);
    } else {
      c.drawImage(atlas, x, y, width, height, 0, 0, 128, 128);
    }
    t.refresh();
  }
}

export function createResidentArtwork(scene: Phaser.Scene): void {
  const atlas = scene.textures.get('resident-atlas').getSourceImage() as HTMLImageElement;
  const width = atlas.width / 4;
  const height = atlas.height / 2;
  const roles = RESIDENT_ROLES;
  const colors = RESIDENT_CLOTH_COLORS;
  for (let species = 0; species < 8; species++) {
    for (const [role, name] of roles.entries()) {
      const t = scene.textures.createCanvas(`resident-${species}-${name}`, 128, 128);
      if (!t) {
        throw Error('Resident texture unavailable');
      }
      const c = t.getContext();
      c.imageSmoothingEnabled = true;
      c.imageSmoothingQuality = 'high';
      c.drawImage(
        atlas,
        (species % 4) * width,
        Math.floor(species / 4) * height,
        width,
        height,
        16,
        0,
        96,
        128,
      );
      c.globalCompositeOperation = 'source-atop';
      c.globalAlpha = 0.16;
      c.fillStyle = colors[role];
      c.fillRect(15, 47, 98, 49);
      c.globalAlpha = 1;
      c.globalCompositeOperation = 'source-over';
      if (name === 'smith') {
        c.strokeStyle = '#514338';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(96, 82);
        c.lineTo(105, 64);
        c.stroke();
        c.fillStyle = '#8f9899';
        c.fillRect(98, 59, 15, 7);
      } else if (name === 'armorer') {
        c.fillStyle = '#63798a';
        c.beginPath();
        c.moveTo(92, 64);
        c.lineTo(111, 66);
        c.lineTo(111, 80);
        c.lineTo(102, 88);
        c.lineTo(92, 80);
        c.closePath();
        c.fill();
        c.strokeStyle = '#c5b98e';
        c.lineWidth = 2;
        c.stroke();
      } else if (name === 'healer') {
        c.fillStyle = '#568665';
        c.fillRect(99, 66, 6, 5);
        ellipse(c, 102, 79, 8, 10, '#7aac83');
        ellipse(c, 101, 77, 3, 5, '#b9d6a4');
      } else {
        ellipse(c, 101, 84, 10, 12, '#8b684b');
        c.strokeStyle = '#c2ab71';
        c.lineWidth = 2;
        c.strokeRect(94, 80, 13, 8);
      }
      t.refresh();
    }
  }
}
