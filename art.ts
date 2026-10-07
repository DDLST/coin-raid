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
    if (skin.id === 'fox-royal') { c.fillStyle='#f4d578';c.beginPath();c.moveTo(23,15);c.lineTo(20,6);c.lineTo(29,10);c.lineTo(34,3);c.lineTo(40,10);c.lineTo(49,6);c.lineTo(46,15);c.fill(); }
    if (skin.id === 'fox-star') for (const [x,y] of [[21,20],[47,19],[28,47]]) { c.fillStyle='#f5e1a4';c.fillRect(x,y,2,2); }
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
  texture(scene, 'boar', c => {
    const fur=c.createLinearGradient(15,10,48,56);fur.addColorStop(0,'#b69874');fur.addColorStop(1,'#635243');
    for(const x of [17,26,42,50]) ellipse(c,x,54,4,6,'#303a33');
    ellipse(c,32,35,25,22,fur); c.fillStyle='#655246';c.beginPath();c.moveTo(10,27);c.lineTo(7,12);c.lineTo(23,20);c.moveTo(43,20);c.lineTo(59,12);c.lineTo(55,28);c.fill();
    ellipse(c,33,41,20,15,'#a98467');ellipse(c,33,44,11,8,'#d6b092');ellipse(c,28,44,2,3,'#574c45');ellipse(c,38,44,2,3,'#574c45');
    ellipse(c,21,30,3,4,'#ebc878');ellipse(c,45,30,3,4,'#ebc878');ellipse(c,21,31,1.5,2.5,'#252f2c');ellipse(c,45,31,1.5,2.5,'#252f2c');
    c.fillStyle='#f3e6c6';c.beginPath();c.moveTo(17,44);c.quadraticCurveTo(13,60,24,51);c.lineTo(22,44);c.moveTo(48,44);c.quadraticCurveTo(53,60,42,51);c.lineTo(44,44);c.fill();
    c.strokeStyle='#5a4c3f';c.lineWidth=3;c.beginPath();c.moveTo(29,11);c.lineTo(33,5);c.lineTo(37,13);c.stroke();
  });
  texture(scene, 'bear', c => {
    const fur=c.createRadialGradient(24,21,2,32,33,30);fur.addColorStop(0,'#b7a388');fur.addColorStop(1,'#645c51');
    ellipse(c,32,43,24,20,fur);ellipse(c,18,55,8,6,'#413f37');ellipse(c,46,55,8,6,'#413f37');
    ellipse(c,13,14,10,10,'#736b5b');ellipse(c,51,14,10,10,'#736b5b');ellipse(c,32,27,26,24,fur);
    ellipse(c,32,39,15,12,'#d2c6a9');ellipse(c,32,35,6,4,'#333e38');ellipse(c,22,24,3,4,'#ead389');ellipse(c,43,24,3,4,'#ead389');
    ellipse(c,22,25,1.5,2.5,'#28352f');ellipse(c,43,25,1.5,2.5,'#28352f');
    c.strokeStyle='#6e6355';c.lineWidth=2;c.beginPath();c.moveTo(32,39);c.lineTo(32,44);c.moveTo(26,43);c.quadraticCurveTo(32,47,39,43);c.stroke();
  });
  texture(scene, 'hunter', c => {
    c.fillStyle='#333f46';c.beginPath();c.moveTo(15,59);c.lineTo(20,27);c.lineTo(9,30);c.lineTo(26,5);c.lineTo(40,5);c.lineTo(55,31);c.lineTo(46,28);c.lineTo(51,59);c.fill();
    c.fillStyle='#526a65';c.beginPath();c.moveTo(21,59);c.lineTo(24,31);c.lineTo(42,31);c.lineTo(46,59);c.fill();
    ellipse(c,33,23,14,17,'#647d70');ellipse(c,33,24,10,12,'#1d3132');
    ellipse(c,29,23,2,2,'#ffd495');ellipse(c,37,23,2,2,'#ffd495');
    c.strokeStyle='#ad9463';c.lineWidth=3;c.beginPath();c.arc(45,40,16,-1.2,1.2);c.stroke();c.strokeStyle='#efdfbd';c.lineWidth=1;c.beginPath();c.moveTo(51,25);c.lineTo(51,55);c.stroke();
    c.fillStyle='#acbd9d';c.fillRect(25,36,16,3);
  });
  texture(scene, 'merchant', c => {
    ellipse(c,32,46,23,17,'#667752');ellipse(c,18,55,6,6,'#3a4a37');ellipse(c,46,55,6,6,'#3a4a37');
    ellipse(c,15,16,8,9,'#8b8f7c');ellipse(c,49,16,8,9,'#8b8f7c');ellipse(c,32,27,23,22,'#d4d3b8');
    c.fillStyle='#454f48';c.beginPath();c.moveTo(14,12);c.lineTo(25,31);c.lineTo(22,46);c.lineTo(12,30);c.fill();c.beginPath();c.moveTo(50,12);c.lineTo(39,31);c.lineTo(42,46);c.lineTo(52,30);c.fill();
    ellipse(c,23,27,3,4,'#203c32');ellipse(c,41,27,3,4,'#203c32');ellipse(c,32,39,4,3,'#33473a');
    c.fillStyle='#aa8551';c.beginPath();c.moveTo(7,17);c.quadraticCurveTo(32,-2,57,17);c.lineTo(53,21);c.lineTo(10,21);c.fill();c.fillStyle='#e0c47e';c.fillRect(18,11,28,4);
    ellipse(c,51,49,8,11,'#a0804d');c.strokeStyle='#d3ba7c';c.lineWidth=2;c.strokeRect(44,44,13,10);
  });
  texture(scene, 'sword', c => {
    c.fillStyle='#b5d0c6';c.beginPath();c.moveTo(18,44);c.lineTo(42,8);c.lineTo(51,3);c.lineTo(49,14);c.lineTo(24,49);c.fill();
    c.strokeStyle='#f2f1d5';c.lineWidth=2;c.beginPath();c.moveTo(22,43);c.lineTo(46,10);c.stroke();
    c.strokeStyle='#e2ba63';c.lineWidth=5;c.beginPath();c.moveTo(12,40);c.lineTo(29,53);c.stroke();c.strokeStyle='#846147';c.lineWidth=5;c.beginPath();c.moveTo(19,47);c.lineTo(12,57);c.stroke();ellipse(c,10,59,4,3,'#ddba6e');
  });
  texture(scene, 'rock', c => {
    c.fillStyle='#77847b';c.beginPath();c.moveTo(7,43);c.lineTo(13,24);c.lineTo(35,11);c.lineTo(54,23);c.lineTo(60,44);c.lineTo(40,55);c.lineTo(16,53);c.fill();
    c.fillStyle='#aeb5a0';c.beginPath();c.moveTo(13,24);c.lineTo(35,11);c.lineTo(40,30);c.lineTo(17,35);c.fill();c.fillStyle='#566b61';c.beginPath();c.moveTo(40,30);c.lineTo(54,23);c.lineTo(60,44);c.lineTo(40,55);c.fill();ellipse(c,14,48,8,3,'#88975e');
  });
  texture(scene, 'ruin', c => {
    ellipse(c,32,53,26,7,'#193d3144');c.fillStyle='#788176';c.fillRect(14,14,14,40);c.fillRect(37,8,13,46);c.fillStyle='#abb09a';c.fillRect(12,10,17,8);c.fillRect(35,5,18,8);c.fillStyle='#8c977e';c.fillRect(13,42,36,9);c.strokeStyle='#56685b';c.lineWidth=2;c.beginPath();c.moveTo(19,19);c.lineTo(17,27);c.lineTo(22,36);c.moveTo(43,14);c.lineTo(39,32);c.stroke();ellipse(c,25,50,9,3,'#82a260');
  });
  texture(scene, 'hut', c => {
    c.fillStyle='#815f43';c.fillRect(8,27,48,28);c.fillStyle='#aa9363';c.fillRect(12,29,40,23);c.fillStyle='#3c5146';c.fillRect(28,36,10,19);c.fillStyle='#ebca75';c.fillRect(15,34,9,9);c.fillRect(42,34,8,9);
    c.fillStyle='#57684d';c.beginPath();c.moveTo(3,29);c.lineTo(32,4);c.lineTo(61,29);c.fill();c.strokeStyle='#95a96d';c.lineWidth=3;c.beginPath();c.moveTo(9,25);c.lineTo(32,8);c.lineTo(53,25);c.stroke();c.fillStyle='#e5bd71';c.fillRect(9,48,46,4);
  });
  texture(scene, 'fire', c => {
    c.strokeStyle='#735b42';c.lineWidth=6;c.beginPath();c.moveTo(16,48);c.lineTo(48,57);c.moveTo(48,48);c.lineTo(16,57);c.stroke();
    c.fillStyle='#f3b75d';c.beginPath();c.moveTo(18,48);c.quadraticCurveTo(13,30,32,10);c.quadraticCurveTo(26,32,43,26);c.quadraticCurveTo(55,49,33,53);c.fill();c.fillStyle='#ffe8a2';c.beginPath();c.moveTo(26,48);c.quadraticCurveTo(24,36,35,28);c.quadraticCurveTo(46,49,33,52);c.fill();
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
  for (let i = 0; i < width * height / 1700; i++) {
    const x = random() * width, y = random() * height;
    c.globalAlpha = .07 + random() * .10;
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
  // Детали биомов не имеют коллизий: это грунт, растения и следы прошлого.
  if (level === 2) {
    c.strokeStyle = '#e4d5a53b'; c.lineWidth = 2;
    for (let i = 0; i < 18; i++) { const x=140+random()*(width-280), y=130+random()*(height-260);c.strokeRect(x,y,26+random()*25,19+random()*19); }
  }
  if (level === 3) for (let i=0;i<70;i++) {
    const x=random()*width,y=random()*height;c.strokeStyle='#b2c5a966';c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(x-4,y-15);c.moveTo(x,y);c.lineTo(x+5,y-19);c.stroke();
    if(i%5===0){ellipse(c,x+4,y-17,5,3,'#d1cb9b');ellipse(c,x-5,y-11,4,3,'#a18caf');}
  }
  if (level === 4) for (let i=0;i<32;i++) {
    const x=random()*width,y=random()*height;c.strokeStyle='#302e3838';c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(x+13,y+14);c.lineTo(x+9,y+28);c.stroke();
    if(i%3===0)ellipse(c,x+6,y+3,2,2,'#f7c185');
  }
  if (level === 5) {
    const x=width*.64,y=height*.5;c.strokeStyle='#e0dba73b';c.lineWidth=4;c.beginPath();c.ellipse(x,y,115,80,0,0,Math.PI*2);c.stroke();
    c.lineWidth=2;c.beginPath();c.ellipse(x,y,93,64,0,0,Math.PI*2);c.stroke();
    for(let i=0;i<8;i++){const a=i*Math.PI/4;ellipse(c,x+Math.cos(a)*105,y+Math.sin(a)*72,4,4,'#eadbaa99');}
  }
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
