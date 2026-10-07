import Phaser from 'phaser';
import { SKINS } from './progression';

export type Palette = {
  ground: string; light: string; grass: string; tree: string; accent: string;
};

// Рисованные текстуры создаются локально. У игры нет запросов к CDN или файлам картинок.
function texture(scene: Phaser.Scene, key: string, draw: (c: CanvasRenderingContext2D) => void): void {
  if (scene.textures.exists(key)) return;
  const result = scene.textures.createCanvas(key, 128, 128);
  if (!result) throw new Error(`Cannot create texture ${key}`);
  const c = result.getContext();
  c.scale(2, 2);
  draw(c);
  result.refresh();
}

function ellipse(c: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string | CanvasGradient): void {
  c.fillStyle = fill; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill();
}

export function createArtwork(scene: Phaser.Scene): void {
  for (const skin of SKINS) texture(scene, skin.id, c => {
    // Хвост, лапы, шерсть, уши и бирюзовый шарф.
    c.fillStyle = '#c66d3b'; c.beginPath(); c.moveTo(26, 42); c.quadraticCurveTo(1, 48, 9, 18);
    c.quadraticCurveTo(22, 21, 29, 38); c.fill();
    c.fillStyle = '#fff0ca'; c.beginPath(); c.moveTo(9, 18); c.quadraticCurveTo(11, 29, 18, 30);
    c.quadraticCurveTo(17, 23, 9, 18); c.fill();
    ellipse(c, 23, 53, 6, 6, '#613c32'); ellipse(c, 43, 53, 6, 6, '#613c32');
    const body = c.createLinearGradient(20, 28, 43, 52); body.addColorStop(0, skin.fur); body.addColorStop(1, skin.id === 'fox-moon' ? '#aaaeb4' : '#9a603c');
    ellipse(c, 33, 42, 17, 17, body);
    c.fillStyle = skin.fur; c.beginPath(); c.moveTo(14, 30); c.lineTo(15, 5); c.lineTo(29, 18);
    c.quadraticCurveTo(34, 13, 41, 18); c.lineTo(54, 5); c.lineTo(54, 30); c.closePath(); c.fill();
    c.fillStyle = '#744637'; c.beginPath(); c.moveTo(18, 12); c.lineTo(19, 27); c.lineTo(27, 20); c.fill();
    c.beginPath(); c.moveTo(50, 12); c.lineTo(48, 27); c.lineTo(42, 20); c.fill();
    ellipse(c, 34, 29, 22, 19, skin.fur);
    c.fillStyle = '#ffedc5'; c.beginPath(); c.moveTo(12, 29); c.quadraticCurveTo(21, 28, 34, 39);
    c.quadraticCurveTo(46, 28, 56, 29); c.quadraticCurveTo(52, 49, 34, 48); c.quadraticCurveTo(16, 46, 12, 29); c.fill();
    ellipse(c, 25, 28, 2.7, 4, '#263e36'); ellipse(c, 44, 28, 2.7, 4, '#263e36');
    ellipse(c, 24.3, 26.7, .8, 1, '#fff7dd'); ellipse(c, 43.3, 26.7, .8, 1, '#fff7dd');
    ellipse(c, 34, 37, 3.6, 2.7, '#293d35');
    c.strokeStyle = '#95603d'; c.lineWidth = 1; c.beginPath(); c.moveTo(34, 39); c.lineTo(34, 42); c.stroke();
    c.strokeStyle = skin.scarf; c.lineWidth = 6; c.beginPath(); c.moveTo(18, 46); c.quadraticCurveTo(33, 53, 49, 46); c.stroke();
    c.fillStyle = skin.scarf; c.beginPath(); c.moveTo(40, 49); c.lineTo(55, 54); c.lineTo(52, 60); c.lineTo(39, 54); c.fill();
    ellipse(c, 16, 36, 3, 1.5, '#e69972'); ellipse(c, 51, 36, 3, 1.5, '#e69972');
  });
  const wolves = [['wolf-grey', '#6c7880', '#a9b4b7'], ['wolf-snow', '#afbabc', '#e6e6da'], ['wolf-brown', '#74645b', '#b09a7c']];
  for (const [key, dark, light] of wolves) texture(scene, key, c => {
    // Крупные уши, четыре лапы, длинная морда и пушистый хвост.
    c.fillStyle = dark; c.beginPath(); c.moveTo(24, 43); c.quadraticCurveTo(1, 52, 6, 20);
    c.lineTo(15, 28); c.lineTo(10, 25); c.quadraticCurveTo(24, 29, 28, 42); c.fill();
    for (const x of [22, 29, 42, 49]) ellipse(c, x, 55, 4.5, 6, '#39464b');
    const fur = c.createLinearGradient(20, 20, 45, 54); fur.addColorStop(0, light); fur.addColorStop(1, dark);
    ellipse(c, 35, 43, 20, 15, fur);
    c.fillStyle = dark; c.beginPath(); c.moveTo(16, 27); c.lineTo(17, 3); c.lineTo(32, 17);
    c.lineTo(40, 17); c.lineTo(55, 3); c.lineTo(55, 27); c.closePath(); c.fill();
    c.fillStyle = '#554e53'; c.beginPath(); c.moveTo(20, 10); c.lineTo(21, 26); c.lineTo(30, 20); c.fill();
    c.beginPath(); c.moveTo(51, 10); c.lineTo(49, 26); c.lineTo(41, 20); c.fill();
    ellipse(c, 36, 29, 21, 19, fur);
    c.fillStyle = '#e6dfcc'; c.beginPath(); c.moveTo(17, 29); c.lineTo(26, 33); c.lineTo(36, 46);
    c.lineTo(46, 33); c.lineTo(56, 29); c.lineTo(51, 42); c.lineTo(36, 51); c.lineTo(21, 42); c.closePath(); c.fill();
    c.strokeStyle = '#263c3e'; c.lineWidth = 2; c.beginPath(); c.moveTo(23, 25); c.lineTo(29, 27); c.moveTo(43, 27); c.lineTo(49, 25); c.stroke();
    ellipse(c, 27, 29, 3, 3.4, '#f1d284'); ellipse(c, 45, 29, 3, 3.4, '#f1d284');
    ellipse(c, 27.5, 29, 1.2, 2.4, '#253b3d'); ellipse(c, 44.5, 29, 1.2, 2.4, '#253b3d');
    ellipse(c, 36, 40, 4.7, 3, '#263b3e');
    c.strokeStyle = '#705c50'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(36, 43); c.lineTo(36, 46); c.moveTo(30, 46); c.quadraticCurveTo(36, 49, 42, 46); c.stroke();
    c.fillStyle = '#f7f1da'; c.beginPath(); c.moveTo(29, 45); c.lineTo(31, 49); c.lineTo(32, 46); c.moveTo(41, 46); c.lineTo(42, 49); c.lineTo(44, 45); c.fill();
  });
  texture(scene, 'tree', c => {
    ellipse(c, 32, 56, 22, 5, '#173d2e42');
    c.fillStyle = '#6b5139'; c.fillRect(27, 29, 10, 28); c.fillStyle = '#95734b'; c.fillRect(28, 31, 3, 23);
    const leaves = c.createRadialGradient(22, 16, 2, 32, 29, 30); leaves.addColorStop(0, '#a9be6e'); leaves.addColorStop(1, '#2c6145');
    ellipse(c, 32, 28, 28, 24, leaves); ellipse(c, 18, 33, 15, 12, leaves); ellipse(c, 46, 31, 15, 13, leaves);
    for (const [x,y] of [[16,20],[29,12],[43,21],[33,31]]) ellipse(c,x,y,8,5,'#bdd28a55');
    c.strokeStyle = '#375b3c'; c.lineWidth = 1; c.beginPath(); c.moveTo(8,34); c.quadraticCurveTo(27,45,54,34); c.stroke();
  });
  texture(scene, 'stump', c => {
    ellipse(c,32,48,26,8,'#193b2d44'); c.fillStyle='#765338'; c.beginPath(); c.moveTo(10,29); c.lineTo(9,49); c.quadraticCurveTo(32,61,55,48); c.lineTo(54,28); c.fill();
    c.strokeStyle='#b0834e';c.lineWidth=3;for(const x of [14,23,43,51]){c.beginPath();c.moveTo(x,34);c.lineTo(x-1,48);c.stroke();}
    ellipse(c,32,29,24,12,'#d9b477'); c.strokeStyle='#a27944';c.lineWidth=1.5;
    for(const r of [8,15,21]){c.beginPath();c.ellipse(32,29,r,r*.45,0,0,Math.PI*2);c.stroke();}
    ellipse(c,50,43,7,4,'#799d51');
  });
  texture(scene, 'puddle', c => {
    ellipse(c,32,34,29,20,'#40685b77'); const water=c.createLinearGradient(10,15,45,49);water.addColorStop(0,'#96c9ba');water.addColorStop(1,'#417d80');
    ellipse(c,32,31,27,17,water);ellipse(c,17,34,12,11,water);ellipse(c,45,29,14,11,water);
    c.strokeStyle='#d0e5ca99';c.lineWidth=1.5;c.beginPath();c.ellipse(30,29,15,7,0,.4,2.8);c.stroke();
    ellipse(c,23,23,9,2,'#e6f2d16b');ellipse(c,42,39,7,1.4,'#e6f2d16b');
  });
  texture(scene, 'coin', c => {
    ellipse(c, 32, 34, 18, 19, '#956133');
    const gold = c.createLinearGradient(16, 13, 45, 46); gold.addColorStop(0, '#fff0a7'); gold.addColorStop(.4, '#f7cb60'); gold.addColorStop(1, '#d99842');
    ellipse(c, 32, 31, 18, 19, gold);
    c.strokeStyle = '#ad7735'; c.lineWidth = 1.8; c.beginPath(); c.ellipse(32, 31, 13, 14, 0, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#ad7735'; c.beginPath(); c.moveTo(32, 21); c.lineTo(36, 28); c.lineTo(42, 31);
    c.lineTo(36, 34); c.lineTo(32, 41); c.lineTo(28, 34); c.lineTo(22, 31); c.lineTo(28, 28); c.fill();
    c.strokeStyle = '#fff5c8'; c.lineWidth = 2; c.beginPath(); c.arc(32, 31, 16, 3.4, 4.8); c.stroke();
  });
  texture(scene, 'spark', c => {
    c.fillStyle = '#ffeba5'; c.beginPath(); c.moveTo(32, 20); c.lineTo(35, 29); c.lineTo(44, 32);
    c.lineTo(35, 35); c.lineTo(32, 44); c.lineTo(29, 35); c.lineTo(20, 32); c.lineTo(29, 29); c.fill();
  });
}

// Детерминированное рисование: одинаковая поляна сохраняет своё оформление.
export function background(scene: Phaser.Scene, width: number, height: number, level: number, palette: Palette): string {
  const key = `forest-${level}-${width}-${height}`;
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, Math.ceil(width), Math.ceil(height));
  if (!tex) throw new Error('Cannot create forest background');
  const c = tex.getContext();
  let seed = level * 919 + 37;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const gradient = c.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, palette.light); gradient.addColorStop(1, palette.ground);
  c.fillStyle = gradient; c.fillRect(0, 0, width, height);
  // Мягкая тропа и пятна травы создают поляну, а не пустую сетку.
  c.save(); c.globalAlpha = .18; c.strokeStyle = '#f7dfa7'; c.lineWidth = Math.min(width, height) * .19;
  c.lineCap = 'round'; c.beginPath(); c.moveTo(width * .08, height * .82);
  c.bezierCurveTo(width * .63, height * .55, width * .2, height * .3, width * .85, height * .09); c.stroke(); c.restore();
  for (let i = 0; i < width * height / 550; i++) {
    const x = random() * width, y = random() * height;
    c.globalAlpha = .12 + random() * .12;
    ellipse(c, x, y, 5 + random() * 28, 3 + random() * 10, random() > .5 ? palette.grass : '#f0efb0');
  }
  c.globalAlpha = 1;
  for (let i = 0; i < width * height / 3400; i++) {
    const x = 22 + random() * (width - 44), y = 48 + random() * (height - 70);
    c.strokeStyle = palette.grass; c.globalAlpha = .55; c.lineWidth = 1;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x - 3, y - 5); c.moveTo(x, y); c.lineTo(x + 3, y - 6); c.stroke();
    if (i % 6 === 0) {
      c.globalAlpha = .8; ellipse(c, x, y - 7, 2.2, 2.2, palette.accent);
      ellipse(c, x + 2.5, y - 5.5, 1.8, 1.8, '#ffe6ab');
    }
  }
  c.globalAlpha = 1;
  // Декоративная листва лежит у края, не скрывая игровые объекты.
  const tree = (x: number, y: number, size: number) => {
    ellipse(c, x + 6, y + 9, size, size * .7, '#0c302449');
    const canopy = c.createRadialGradient(x - size * .25, y - size * .25, 1, x, y, size);
    canopy.addColorStop(0, palette.grass); canopy.addColorStop(1, palette.tree);
    ellipse(c, x, y, size, size * .8, canopy);
    for (let k = 0; k < 10; k++) {
      const a = random() * Math.PI * 2, r = random() * size * .65;
      c.globalAlpha = .18; ellipse(c, x + Math.cos(a) * r, y + Math.sin(a) * r, size * .26, size * .18, '#d4e4a2');
    }
    c.globalAlpha = 1;
  };
  for (let x = -8; x < width + 25; x += 64) { tree(x, -13, 38 + random() * 16); tree(x + 24, height + 15, 35 + random() * 18); }
  for (let y = 58; y < height; y += 83) { tree(-20, y, 34 + random() * 12); tree(width + 20, y + 30, 38 + random() * 12); }
  // Светлая дымка и виньетка объединяют рисунок.
  const light = c.createRadialGradient(width * .22, height * .15, 0, width * .4, height * .4, width * .9);
  light.addColorStop(0, '#fff8c023'); light.addColorStop(1, '#082b271d');
  c.fillStyle = light; c.fillRect(0, 0, width, height);
  tex.refresh(); return key;
}
