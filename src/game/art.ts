import Phaser from 'phaser';

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
  texture(scene, 'fox', c => {
    // Хвост, лапы, шерсть, уши и бирюзовый шарф.
    c.fillStyle = '#c66d3b'; c.beginPath(); c.moveTo(26, 42); c.quadraticCurveTo(1, 48, 9, 18);
    c.quadraticCurveTo(22, 21, 29, 38); c.fill();
    c.fillStyle = '#fff0ca'; c.beginPath(); c.moveTo(9, 18); c.quadraticCurveTo(11, 29, 18, 30);
    c.quadraticCurveTo(17, 23, 9, 18); c.fill();
    ellipse(c, 23, 53, 6, 6, '#613c32'); ellipse(c, 43, 53, 6, 6, '#613c32');
    const body = c.createLinearGradient(20, 28, 43, 52); body.addColorStop(0, '#e99b51'); body.addColorStop(1, '#c16b3f');
    ellipse(c, 33, 42, 17, 17, body);
    c.fillStyle = '#f2ad63'; c.beginPath(); c.moveTo(14, 30); c.lineTo(15, 5); c.lineTo(29, 18);
    c.quadraticCurveTo(34, 13, 41, 18); c.lineTo(54, 5); c.lineTo(54, 30); c.closePath(); c.fill();
    c.fillStyle = '#744637'; c.beginPath(); c.moveTo(18, 12); c.lineTo(19, 27); c.lineTo(27, 20); c.fill();
    c.beginPath(); c.moveTo(50, 12); c.lineTo(48, 27); c.lineTo(42, 20); c.fill();
    ellipse(c, 34, 29, 22, 19, '#efa359');
    c.fillStyle = '#ffedc5'; c.beginPath(); c.moveTo(12, 29); c.quadraticCurveTo(21, 28, 34, 39);
    c.quadraticCurveTo(46, 28, 56, 29); c.quadraticCurveTo(52, 49, 34, 48); c.quadraticCurveTo(16, 46, 12, 29); c.fill();
    ellipse(c, 25, 28, 2.7, 4, '#263e36'); ellipse(c, 44, 28, 2.7, 4, '#263e36');
    ellipse(c, 24.3, 26.7, .8, 1, '#fff7dd'); ellipse(c, 43.3, 26.7, .8, 1, '#fff7dd');
    ellipse(c, 34, 37, 3.6, 2.7, '#293d35');
    c.strokeStyle = '#95603d'; c.lineWidth = 1; c.beginPath(); c.moveTo(34, 39); c.lineTo(34, 42); c.stroke();
    c.strokeStyle = '#4aaba1'; c.lineWidth = 6; c.beginPath(); c.moveTo(18, 46); c.quadraticCurveTo(33, 53, 49, 46); c.stroke();
    c.fillStyle = '#61c8b2'; c.beginPath(); c.moveTo(40, 49); c.lineTo(55, 54); c.lineTo(52, 60); c.lineTo(39, 54); c.fill();
    ellipse(c, 16, 36, 3, 1.5, '#e69972'); ellipse(c, 51, 36, 3, 1.5, '#e69972');
  });
  const guards = [['warden', '#8665a7', '#b39ccb'], ['tracker', '#567eaf', '#88b7d0'], ['bramble', '#aa5f74', '#d7a1a0']];
  for (const [key, dark, light] of guards) {
    texture(scene, key, c => {
      c.strokeStyle = '#334535'; c.lineWidth = 3.5; c.lineCap = 'round';
      for (const side of [-1, 1]) for (const y of [31, 40, 48]) {
        c.beginPath(); c.moveTo(32 + side * 14, y); c.lineTo(32 + side * 24, y + 4); c.lineTo(32 + side * 26, y + 9); c.stroke();
      }
      const fill = c.createRadialGradient(25, 24, 3, 32, 38, 27); fill.addColorStop(0, light); fill.addColorStop(1, dark);
      ellipse(c, 32, 36, 22, 23, fill);
      c.strokeStyle = '#372e4d66'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(32, 13); c.lineTo(32, 49); c.stroke();
      ellipse(c, 32, 46, 17, 12, '#323b43');
      ellipse(c, 24, 44, 4.5, 5.4, '#ffe29c'); ellipse(c, 40, 44, 4.5, 5.4, '#ffe29c');
      ellipse(c, 25, 45, 1.8, 3, '#273a38'); ellipse(c, 39, 45, 1.8, 3, '#273a38');
      c.strokeStyle = dark; c.lineWidth = 3; c.beginPath(); c.moveTo(21, 19); c.quadraticCurveTo(12, 8, 18, 5);
      c.moveTo(43, 19); c.quadraticCurveTo(52, 8, 46, 5); c.stroke();
      ellipse(c, 19, 24, 4, 2.5, '#fff2d52a');
      c.fillStyle = '#e7d5b244'; c.beginPath(); c.moveTo(29, 24); c.lineTo(35, 24); c.lineTo(32, 30); c.fill();
    });
  }
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
