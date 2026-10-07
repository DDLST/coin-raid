import Phaser from 'phaser';
import { SKINS } from './progression';

export type Palette = {
  ground: string; light: string; grass: string; tree: string; accent: string;
};

// Текстуры и атласы входят в сборку; обращения к внешним CDN не нужны.
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
  // Чёткий грунт: мелкие камни, листья, трещины и отдельные травинки.
  const rocky=[2,5,6,7].includes(level),ash=level===4;
  if(rocky){
    const tile=level===6?56:74;
    for(let row=0;row<height/tile;row++)for(let col=-1;col<width/tile;col++){
      const x=col*tile+(row%2)*tile/2,y=row*tile;
      c.fillStyle=palette.grass;c.globalAlpha=.11+random()*.09;c.fillRect(x+2,y+2,tile-4,tile-4);
      c.globalAlpha=.35;c.strokeStyle=palette.tree;c.lineWidth=1;c.strokeRect(x+1,y+1,tile-2,tile-2);
      c.strokeStyle=palette.accent;c.globalAlpha=.18;c.beginPath();c.moveTo(x+4,y+3);c.lineTo(x+tile-5,y+3);c.stroke();
      if(random()<.3){c.globalAlpha=.38;c.strokeStyle=palette.tree;c.beginPath();c.moveTo(x+tile*.2,y+10);c.lineTo(x+tile*.45,y+tile*.55);c.lineTo(x+tile*.7,y+tile*.7);c.stroke();}
    }
  }
  for(let n=0;n<width*height/280;n++){
    const x=random()*width,y=random()*height,v=random();c.globalAlpha=.22+random()*.3;
    if(v<.45){c.fillStyle=v<.2?palette.tree:palette.accent;c.fillRect(x,y,1+random()*3,1+random()*2);}
    else if(v<.67){c.fillStyle=ash?'#26272f':palette.tree;c.beginPath();c.moveTo(x,y);c.lineTo(x+3,y-3);c.lineTo(x+8,y-1);c.lineTo(x+6,y+3);c.closePath();c.fill();c.globalAlpha=.25;c.strokeStyle=palette.accent;c.lineWidth=1;c.beginPath();c.moveTo(x+2,y-2);c.lineTo(x+6,y-1);c.stroke();}
    else if(!rocky&&!ash){
      c.strokeStyle=palette.grass;c.lineWidth=1;for(let blade=0;blade<3;blade++){c.beginPath();c.moveTo(x+blade*2,y);c.lineTo(x+blade*3-3,y-4-random()*5);c.stroke();}
      if(n%13===0){c.globalAlpha=.8;ellipse(c,x,y-5,2,1,level===3?'#ba8ca8':'#dccf89');}
    }else{c.strokeStyle=palette.tree;c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x+6,y+4);c.lineTo(x+10,y+2);c.stroke();}
  }
  c.globalAlpha = 1;
  if(level>=30){
    // Брусчатка вдоль дорог, с травой между швами.
    for(let row=0;row<height/19;row++)for(let col=-1;col<width/31;col++){
      const x=col*31+(row%2)*15,y=row*19;
      const onRoad=Math.abs(y+9-550)<47||y>405&&y<947&&(Math.abs(x+15-(width/2-205))<21||Math.abs(x+15-(width/2+205))<21);
      if(!onRoad)continue;
      c.globalAlpha=.44;c.fillStyle=random()<.5?'#8c9180':'#afa88b';
      c.beginPath();c.moveTo(x+2,y+3);c.lineTo(x+26,y+1);c.lineTo(x+29,y+12);c.lineTo(x+22,y+17);c.lineTo(x+4,y+16);c.closePath();c.fill();
      c.globalAlpha=.5;c.strokeStyle='#4d6550';c.lineWidth=1;c.stroke();c.globalAlpha=.30;c.strokeStyle='#e3d5ae';c.beginPath();c.moveTo(x+4,y+3);c.lineTo(x+24-random()*8,y+2);c.stroke();
    }
    c.globalAlpha=1;
  }
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

export function createMysticArtwork(scene: Phaser.Scene): void {
  texture(scene, 'soul', c => {
    const glow=c.createRadialGradient(32,31,1,32,31,30);glow.addColorStop(0,'#c1fbefaa');glow.addColorStop(1,'#82cedc00');ellipse(c,32,31,30,30,glow);
    c.fillStyle='#7dccdf';c.beginPath();c.moveTo(32,7);c.lineTo(48,28);c.lineTo(39,47);c.lineTo(31,56);c.lineTo(19,43);c.lineTo(15,28);c.fill();
    c.fillStyle='#d2ffff';c.beginPath();c.moveTo(32,7);c.lineTo(33,32);c.lineTo(19,43);c.lineTo(15,28);c.fill();
    c.fillStyle='#a5e9e0';c.beginPath();c.moveTo(33,32);c.lineTo(48,28);c.lineTo(39,47);c.lineTo(31,56);c.fill();
    c.strokeStyle='#e8ffed';c.lineWidth=1.3;c.beginPath();c.moveTo(32,14);c.lineTo(25,29);c.lineTo(31,39);c.lineTo(28,48);c.stroke();
    ellipse(c,32,30,3,4,'#ffffff');
  });
  texture(scene, 'skeleton', c => {
    ellipse(c,32,58,21,4,'#09232a44');
    c.strokeStyle='#596b72';c.lineWidth=7;c.beginPath();c.moveTo(23,42);c.lineTo(21,53);c.lineTo(16,59);c.moveTo(42,42);c.lineTo(46,54);c.lineTo(51,59);c.stroke();
    c.strokeStyle='#c9cbb4';c.lineWidth=4;c.beginPath();c.moveTo(20,33);c.lineTo(11,42);c.lineTo(8,28);c.moveTo(44,32);c.lineTo(54,40);c.lineTo(57,28);c.stroke();
    ellipse(c,32,37,13,13,'#46545f');c.strokeStyle='#93a7aa';c.lineWidth=2;c.strokeRect(22,29,21,18);
    c.strokeStyle='#b5d4ca';c.lineWidth=1.4;for(const y of [32,36,40]){c.beginPath();c.moveTo(25,y);c.lineTo(39,y);c.stroke();}
    ellipse(c,32,19,15,14,'#dddec5');c.fillStyle='#b7c4b5';c.fillRect(23,26,18,8);c.fillStyle='#334a53';c.fillRect(23,15,6,7);c.fillRect(35,15,6,7);
    ellipse(c,26,19,2,2,'#9ae9ed');ellipse(c,38,19,2,2,'#9ae9ed');c.fillStyle='#58685f';c.beginPath();c.moveTo(32,21);c.lineTo(29,26);c.lineTo(35,26);c.fill();
    c.strokeStyle='#536460';c.lineWidth=1;for(const x of [26,30,34,38]){c.beginPath();c.moveTo(x,29);c.lineTo(x,33);c.stroke();}
    c.strokeStyle='#8faeb3';c.lineWidth=4;c.beginPath();c.moveTo(56,42);c.lineTo(59,12);c.stroke();c.strokeStyle='#a1cdbb';c.lineWidth=3;c.beginPath();c.moveTo(52,32);c.lineTo(62,32);c.stroke();
    c.fillStyle='#5c7164';c.beginPath();c.moveTo(19,28);c.lineTo(9,31);c.lineTo(13,39);c.lineTo(23,34);c.fill();
  });
  texture(scene, 'zombie', c => {
    ellipse(c,32,56,23,5,'#15352e44');ellipse(c,22,51,7,9,'#4c5c49');ellipse(c,43,51,7,9,'#485447');
    ellipse(c,32,39,21,18,'#546b57');c.fillStyle='#758277';c.beginPath();c.moveTo(14,27);c.lineTo(29,23);c.lineTo(46,29);c.lineTo(52,46);c.lineTo(44,49);c.lineTo(38,43);c.lineTo(30,53);c.lineTo(13,45);c.fill();
    c.strokeStyle='#768e69';c.lineWidth=8;c.beginPath();c.moveTo(13,30);c.lineTo(7,39);c.lineTo(5,50);c.moveTo(46,30);c.lineTo(55,38);c.lineTo(60,45);c.stroke();
    ellipse(c,31,21,18,18,'#91a279');ellipse(c,23,17,5,5,'#395341');ellipse(c,40,17,5,4,'#395341');ellipse(c,23,17,2,2,'#d7d683');ellipse(c,40,17,2,2,'#d7d683');
    c.fillStyle='#4d5f49';c.beginPath();c.moveTo(22,29);c.lineTo(44,27);c.lineTo(42,35);c.lineTo(25,34);c.fill();c.fillStyle='#dedfc3';c.fillRect(27,28,4,4);c.fillRect(36,28,3,4);
    c.strokeStyle='#5c7961';c.lineWidth=2;c.beginPath();c.moveTo(31,5);c.lineTo(27,10);c.lineTo(31,13);c.stroke();ellipse(c,42,7,5,3,'#adc699');
    c.strokeStyle='#b29c80';c.lineWidth=2;c.beginPath();c.moveTo(18,37);c.lineTo(24,42);c.moveTo(35,38);c.lineTo(42,41);c.stroke();
  });
  texture(scene, 'vampire', c => {
    c.fillStyle='#332d49';c.beginPath();c.moveTo(32,18);c.bezierCurveTo(2,17,1,43,7,57);c.lineTo(23,50);c.lineTo(32,61);c.lineTo(43,49);c.lineTo(61,56);c.bezierCurveTo(63,35,57,17,32,18);c.fill();
    c.fillStyle='#885064';c.beginPath();c.moveTo(32,27);c.lineTo(11,55);c.lineTo(29,48);c.lineTo(45,52);c.lineTo(55,55);c.lineTo(40,28);c.fill();
    ellipse(c,31,21,14,17,'#c6c9dc');c.fillStyle='#26263b';c.beginPath();c.moveTo(16,19);c.lineTo(20,3);c.quadraticCurveTo(36,-3,47,10);c.lineTo(47,22);c.lineTo(36,10);c.lineTo(31,17);c.lineTo(25,10);c.fill();
    ellipse(c,25,21,2.6,2,'#b7425d');ellipse(c,38,21,2.6,2,'#b7425d');c.strokeStyle='#73637f';c.lineWidth=1.5;c.beginPath();c.moveTo(26,30);c.lineTo(38,30);c.stroke();
    c.fillStyle='#f4f0e4';c.beginPath();c.moveTo(27,29);c.lineTo(29,35);c.lineTo(30,30);c.moveTo(35,30);c.lineTo(36,35);c.lineTo(38,29);c.fill();
    ellipse(c,32,42,7,12,'#3b3650');ellipse(c,32,38,3,4,'#d3647a');c.strokeStyle='#d1bacd';c.lineWidth=4;c.beginPath();c.moveTo(24,37);c.lineTo(14,44);c.moveTo(40,37);c.lineTo(51,43);c.stroke();
  });
  texture(scene, 'necromancer', c => {
    c.fillStyle='#233c42';c.beginPath();c.moveTo(22,18);c.lineTo(13,56);c.lineTo(23,59);c.lineTo(30,55);c.lineTo(38,60);c.lineTo(50,56);c.lineTo(41,18);c.fill();
    c.fillStyle='#4b6971';c.beginPath();c.moveTo(28,25);c.lineTo(24,57);c.lineTo(33,53);c.lineTo(39,58);c.lineTo(35,24);c.fill();
    c.fillStyle='#263947';c.beginPath();c.moveTo(16,26);c.lineTo(21,8);c.lineTo(32,1);c.lineTo(45,10);c.lineTo(48,27);c.fill();ellipse(c,32,19,10,11,'#071e23');
    c.strokeStyle='#a2dcd0';c.lineWidth=2;c.beginPath();c.moveTo(25,17);c.lineTo(29,18);c.moveTo(35,18);c.lineTo(39,17);c.stroke();
    c.fillStyle='#d6dac0';c.fillRect(28,25,8,3);c.fillRect(30,29,4,3);ellipse(c,13,34,5,4,'#a8b7a0');
    c.strokeStyle='#917959';c.lineWidth=4;c.beginPath();c.moveTo(54,58);c.lineTo(55,13);c.stroke();
    const glow=c.createRadialGradient(55,11,1,55,11,12);glow.addColorStop(0,'#d1ffde');glow.addColorStop(.4,'#86d9ae');glow.addColorStop(1,'#86d9ae00');ellipse(c,55,11,12,12,glow);
    c.strokeStyle='#b9bea3';c.lineWidth=2;c.beginPath();c.moveTo(18,37);c.lineTo(20,49);c.moveTo(41,38);c.lineTo(44,51);c.stroke();
    c.fillStyle='#a1cbbb';for(const y of [36,43,50])c.fillRect(30,y,4,2);
  });
  texture(scene, 'dragon', c => {
    c.fillStyle='#4b5674';c.beginPath();c.moveTo(25,29);c.lineTo(1,5);c.lineTo(5,28);c.lineTo(12,21);c.lineTo(16,40);c.lineTo(25,37);c.moveTo(40,29);c.lineTo(62,5);c.lineTo(61,30);c.lineTo(53,22);c.lineTo(47,42);c.lineTo(39,36);c.fill();
    c.strokeStyle='#819aaa';c.lineWidth=1.2;c.beginPath();c.moveTo(25,30);c.lineTo(3,8);c.moveTo(40,30);c.lineTo(61,8);c.stroke();
    c.fillStyle='#43566a';c.beginPath();c.moveTo(29,46);c.quadraticCurveTo(5,59,9,41);c.lineTo(2,46);c.quadraticCurveTo(8,65,33,56);c.fill();
    ellipse(c,33,42,15,17,'#728591');ellipse(c,33,45,9,12,'#b7bfa2');ellipse(c,22,55,7,5,'#43545d');ellipse(c,45,55,7,5,'#43545d');
    c.fillStyle='#b9c8b1';c.beginPath();c.moveTo(19,17);c.lineTo(18,2);c.lineTo(26,13);c.moveTo(42,14);c.lineTo(47,1);c.lineTo(47,20);c.fill();
    ellipse(c,33,23,17,18,'#7a9492');c.fillStyle='#4c656d';c.beginPath();c.moveTo(32,7);c.lineTo(29,15);c.lineTo(35,15);c.fill();
    ellipse(c,25,21,3,3,'#e9c481');ellipse(c,41,21,3,3,'#e9c481');ellipse(c,25,21,1,2,'#213b43');ellipse(c,41,21,1,2,'#213b43');
    ellipse(c,33,32,14,9,'#8fa6a0');ellipse(c,28,31,1.6,2,'#3d5c5d');ellipse(c,39,31,1.6,2,'#3d5c5d');
    c.strokeStyle='#405453';c.lineWidth=1.4;c.beginPath();c.moveTo(23,36);c.quadraticCurveTo(33,41,44,36);c.stroke();
    c.fillStyle='#e7e1c2';for(const x of [26,39]){c.beginPath();c.moveTo(x,37);c.lineTo(x+2,41);c.lineTo(x+3,37);c.fill();}
    ellipse(c,32,13,2,3,'#bddff0');
  });
  texture(scene, 'spear', c => {
    c.strokeStyle='#63999c';c.lineWidth=4;c.beginPath();c.moveTo(9,60);c.lineTo(48,12);c.stroke();c.strokeStyle='#b2e8e7';c.lineWidth=1;c.beginPath();c.moveTo(10,58);c.lineTo(47,13);c.stroke();
    c.fillStyle='#bcdaf2';c.beginPath();c.moveTo(42,16);c.lineTo(54,1);c.lineTo(54,13);c.lineTo(47,22);c.fill();c.strokeStyle='#fcffe8';c.lineWidth=1.5;c.beginPath();c.moveTo(47,17);c.lineTo(53,4);c.stroke();
    c.strokeStyle='#d6bb83';c.lineWidth=3;c.beginPath();c.moveTo(22,36);c.lineTo(27,40);c.stroke();
  });
  texture(scene, 'axe', c => {
    c.strokeStyle='#9d785b';c.lineWidth=5;c.beginPath();c.moveTo(12,59);c.lineTo(46,12);c.stroke();c.fillStyle='#a3d3ce';c.beginPath();c.moveTo(38,12);c.quadraticCurveTo(28,10,29,2);c.lineTo(51,7);c.lineTo(61,16);c.quadraticCurveTo(67,28,53,33);c.lineTo(42,17);c.fill();
    c.strokeStyle='#eef4d2';c.lineWidth=2;c.beginPath();c.moveTo(61,16);c.quadraticCurveTo(63,26,53,31);c.stroke();c.strokeStyle='#c4b06d';c.lineWidth=3;c.beginPath();c.moveTo(34,22);c.lineTo(45,30);c.stroke();
  });
  texture(scene, 'staff', c => {
    c.strokeStyle='#798ca5';c.lineWidth=5;c.beginPath();c.moveTo(12,59);c.lineTo(44,20);c.lineTo(46,12);c.stroke();
    const glow=c.createRadialGradient(49,12,1,49,12,15);glow.addColorStop(0,'#ebd9ff');glow.addColorStop(.4,'#b798e6');glow.addColorStop(1,'#b798e600');ellipse(c,49,12,15,15,glow);
    c.strokeStyle='#9bced3';c.lineWidth=3;c.beginPath();c.arc(49,12,10,.7,4.1);c.stroke();ellipse(c,49,12,5,6,'#e4cdff');
  });
  for(const [id,color,trim] of [['ranger','#6c8061','#b8cb98'],['iron','#8297a7','#c6d1d9'],['robe','#a18abf','#d3caf4']])texture(scene,`armor-${id}`,c=>{
    c.fillStyle=color;c.beginPath();c.moveTo(19,44);c.lineTo(26,41);c.lineTo(33,47);c.lineTo(42,41);c.lineTo(47,47);c.lineTo(42,56);c.lineTo(24,56);c.fill();
    c.strokeStyle=trim;c.lineWidth=2;c.beginPath();c.moveTo(22,46);c.lineTo(25,54);c.lineTo(41,54);c.lineTo(45,47);c.stroke();ellipse(c,33,50,3,3,trim);
    if(id==='iron'){ellipse(c,17,46,6,5,color);ellipse(c,49,46,6,5,color);}if(id==='robe'){c.strokeStyle=trim;c.lineWidth=1;c.beginPath();c.moveTo(25,47);c.lineTo(33,54);c.lineTo(42,47);c.stroke();}
  });
  for(const opened of [false,true])texture(scene,opened?'chest-open':'chest',c=>{
    ellipse(c,32,55,25,6,'#0a292b44');c.fillStyle='#596554';c.fillRect(9,28,46,27);c.fillStyle='#849474';c.fillRect(12,31,40,20);c.fillStyle='#bdc59a';c.fillRect(16,29,4,26);c.fillRect(44,29,4,26);
    c.fillStyle='#4a6657';c.beginPath();c.moveTo(9,28);c.quadraticCurveTo(8,11,32,11);c.quadraticCurveTo(56,11,55,28);c.fill();c.strokeStyle='#c1cca3';c.lineWidth=2;c.beginPath();c.moveTo(10,28);c.lineTo(54,28);c.stroke();
    ellipse(c,32,35,7,9,opened?'#677877':'#9ad8d5');c.fillStyle=opened?'#344c45':'#e6ffea';c.beginPath();c.moveTo(32,29);c.lineTo(36,35);c.lineTo(32,42);c.lineTo(28,35);c.fill();
    if(opened){c.fillStyle='#273c35';c.fillRect(12,23,40,9);}
  });
}

export function createVillageArtwork(scene:Phaser.Scene):void{
  for(const [key,coat,trim,tool] of [['npc-armorer','#785b76','#dfb6ca','▣'],['npc-healer','#608e7e','#a5e3cd','✚'],['npc-trader','#887555','#e4cea2','◈']])texture(scene,key,c=>{
    ellipse(c,32,57,20,4,'#102a2244');ellipse(c,22,54,7,7,'#413f38');ellipse(c,43,54,7,7,'#413f38');ellipse(c,32,39,21,20,coat);ellipse(c,32,21,15,15,'#b89c73');
    c.fillStyle=coat;c.beginPath();c.moveTo(15,18);c.lineTo(20,4);c.lineTo(36,0);c.lineTo(48,14);c.lineTo(51,20);c.fill();ellipse(c,25,22,2,3,'#203932');ellipse(c,39,22,2,3,'#203932');
    c.strokeStyle=trim;c.lineWidth=3;c.strokeRect(22,34,20,17);c.fillStyle=trim;c.font='bold 20px sans-serif';c.textAlign='center';c.fillText(tool,32,50);ellipse(c,11,40,5,5,'#b89c73');ellipse(c,54,40,5,5,'#b89c73');
  });
  texture(scene,'dawnblade',c=>{c.strokeStyle='#eac783';c.lineWidth=6;c.beginPath();c.moveTo(13,56);c.lineTo(47,14);c.stroke();c.strokeStyle='#fff3c7';c.lineWidth=2;c.beginPath();c.moveTo(17,52);c.lineTo(51,6);c.stroke();c.strokeStyle='#9ecbca';c.lineWidth=4;c.beginPath();c.moveTo(20,39);c.lineTo(35,51);c.stroke();ellipse(c,29,42,5,5,'#fbec9e');});
  texture(scene,'runicstaff',c=>{c.strokeStyle='#91c7b1';c.lineWidth=5;c.beginPath();c.moveTo(13,58);c.lineTo(44,19);c.stroke();for(let i=0;i<3;i++){const a=i*Math.PI*2/3;ellipse(c,45+Math.cos(a)*10,14+Math.sin(a)*10,5,5,'#d0fff0');}ellipse(c,45,14,8,8,'#69d3b5');c.strokeStyle='#f3e1a9';c.lineWidth=1.5;c.beginPath();c.arc(45,14,15,0,Math.PI*2);c.stroke();});
  texture(scene,'bell',c=>{c.fillStyle='#a99560';c.beginPath();c.moveTo(16,48);c.lineTo(21,18);c.quadraticCurveTo(31,3,43,18);c.lineTo(49,48);c.fill();ellipse(c,32,48,20,6,'#e5ce85');ellipse(c,32,48,13,3,'#6c6455');ellipse(c,32,51,4,7,'#f2e0a6');c.strokeStyle='#eddca6';c.lineWidth=2;c.beginPath();c.arc(32,28,7,0,Math.PI*2);c.stroke();});
  for(let i=0;i<3;i++)texture(scene,`rune-${i}`,c=>{ellipse(c,32,53,22,7,'#102f2544');c.fillStyle='#526b65';c.beginPath();c.moveTo(11,51);c.lineTo(15,12);c.lineTo(26,4);c.lineTo(47,12);c.lineTo(54,52);c.fill();c.strokeStyle=['#d6bae7','#f5c495','#ade2b4'][i];c.lineWidth=3;c.beginPath();if(i===0){c.arc(32,28,11,.5,5.4);c.stroke();}else if(i===1){c.moveTo(32,15);c.lineTo(26,30);c.lineTo(38,29);c.lineTo(30,42);c.stroke();}else{c.moveTo(32,15);c.lineTo(32,42);c.moveTo(19,25);c.lineTo(32,33);c.lineTo(44,24);c.stroke();}});
  texture(scene,'wisp',c=>{const glow=c.createRadialGradient(32,32,1,32,32,30);glow.addColorStop(0,'#fff6bf');glow.addColorStop(.4,'#e7c48488');glow.addColorStop(1,'#e7c48400');ellipse(c,32,32,30,30,glow);ellipse(c,32,32,9,13,'#fff1b1');ellipse(c,28,29,1,2,'#766b52');ellipse(c,36,29,1,2,'#766b52');});
}

// Атласы загружаются локально; нарезка выполняется движком при создании сцены.
export function createAtlasArtwork(scene:Phaser.Scene):void{
 const village=scene.textures.get('village-atlas').getSourceImage() as CanvasImageSource;
 const keys=['merchant','npc-armorer','npc-healer','npc-trader'];
 for(let i=0;i<4;i++){
  if(scene.textures.exists(keys[i]))scene.textures.remove(keys[i]);
  const npc=scene.textures.createCanvas(keys[i],128,128);if(!npc)throw Error('NPC texture unavailable');
  npc.getContext().drawImage(village,i*384,485,384,539,20,1,88,125);npc.refresh();
  const building=scene.textures.createCanvas(`building-${i}`,384,485);if(!building)throw Error('Building texture unavailable');building.getContext().drawImage(village,i*384,0,384,485,0,0,384,485);building.refresh();
 }
 const biomes=scene.textures.get('biome-atlas').getSourceImage() as CanvasImageSource;
 for(let i=0;i<8;i++){const t=scene.textures.createCanvas(`landmark-${i}`,384,512);if(!t)throw Error('Landmark texture unavailable');t.getContext().drawImage(biomes,(i%4)*384,Math.floor(i/4)*512,384,512,0,0,384,512);t.refresh();}
 texture(scene,'wraith',c=>{const aura=c.createRadialGradient(32,30,2,32,30,30);aura.addColorStop(0,'#c8bcf044');aura.addColorStop(1,'#8f74c800');ellipse(c,32,30,30,30,aura);c.fillStyle='#79708d';c.beginPath();c.moveTo(8,60);c.lineTo(14,22);c.quadraticCurveTo(18,4,32,4);c.quadraticCurveTo(47,5,51,23);c.lineTo(58,60);c.lineTo(47,52);c.lineTo(39,61);c.lineTo(32,54);c.lineTo(23,61);c.lineTo(16,52);c.fill();ellipse(c,32,24,12,14,'#202131');ellipse(c,26,22,3,2,'#c8a3ff');ellipse(c,38,22,3,2,'#c8a3ff');c.strokeStyle='#c2a1ec';c.lineWidth=2;c.beginPath();c.moveTo(18,41);c.lineTo(32,47);c.lineTo(45,39);c.stroke();});
 texture(scene,'knight',c=>{ellipse(c,32,57,23,5,'#141d2b44');ellipse(c,23,53,8,9,'#465766');ellipse(c,42,53,8,9,'#465766');c.fillStyle='#586b7d';c.fillRect(15,28,32,25);c.strokeStyle='#d3b76f';c.lineWidth=2;c.strokeRect(17,29,28,22);ellipse(c,32,19,18,16,'#667989');c.fillStyle='#263341';c.fillRect(18,17,28,7);ellipse(c,25,20,3,1,'#efb898');ellipse(c,38,20,3,1,'#efb898');c.fillStyle='#93b2c1';c.beginPath();c.moveTo(41,30);c.lineTo(62,31);c.lineTo(58,49);c.lineTo(51,57);c.lineTo(42,48);c.fill();c.strokeStyle='#e5d199';c.lineWidth=2;c.beginPath();c.moveTo(51,35);c.lineTo(51,51);c.moveTo(46,40);c.lineTo(56,40);c.stroke();c.strokeStyle='#dce4d9';c.lineWidth=3;c.beginPath();c.moveTo(9,51);c.lineTo(6,18);c.stroke();c.strokeStyle='#bb9657';c.lineWidth=3;c.beginPath();c.moveTo(1,40);c.lineTo(14,38);c.stroke();});
}

// Страшные противники и страж оружия используют отдельные кадры рисованного атласа.
export function createCreepyArtwork(scene:Phaser.Scene):void{
 const atlas=scene.textures.get('creep-atlas').getSourceImage() as CanvasImageSource;
 const keys=['skeleton','zombie','necromancer','vampire','dragon','wraith','knight','weapon-reaper'];
 for(const [i,key]of keys.entries()){
  if(scene.textures.exists(key))scene.textures.remove(key);
  const t=scene.textures.createCanvas(key,128,128);if(!t)throw Error('Monster texture unavailable');
  const c=t.getContext();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(atlas,(i%4)*384,Math.floor(i/4)*512,384,512,16,0,96,128);t.refresh();
 }
}

export function biomeGround(scene:Phaser.Scene,start:number,index:number,width:number,height:number,palette:Palette):void{
 const g=scene.add.graphics().setDepth(2);let seed=4921+index*917;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const stone=index===1||index===4||index===5||index===6;
 if(stone){for(let n=0;n<140;n++){const x=start+90+random()*(width-180),y=100+random()*(height-200);g.fillStyle(index===4?0xbbd8dc:index===5?0x686076:0xa79b84,.12);g.fillRoundedRect(x,y,24+random()*40,15+random()*24,5);g.lineStyle(1,0x142834,.17);g.strokeRoundedRect(x,y,24,16,4);}}
 if(index===2){g.fillStyle(0x4c7880,.25);for(let n=0;n<14;n++)g.fillEllipse(start+random()*width,120+random()*800,60+random()*80,25+random()*40);}
 if(index===3){g.lineStyle(2,0xf2965f,.2);for(let n=0;n<22;n++){const x=start+random()*width,y=80+random()*940;g.beginPath();g.moveTo(x,y);g.lineTo(x+19,y+17);g.lineTo(x+9,y+35);g.strokePath();}}
 if(index===4){g.lineStyle(2,0xcfeaf6,.35);for(let n=0;n<95;n++){const x=start+random()*width,y=80+random()*940;g.lineBetween(x-3,y,x+3,y);g.lineBetween(x,y-3,x,y+3);}}
 if(index===5){g.lineStyle(2,0xb19ac9,.18);for(let n=0;n<20;n++){const x=start+random()*width,y=90+random()*900;g.strokeCircle(x,y,14);g.lineBetween(x-10,y-10,x+10,y+10);}}
 if(index===6){g.lineStyle(2,0xb3d4da,.25);for(let n=0;n<15;n++){const x=start+random()*width,y=80+random()*920;g.beginPath();g.moveTo(x,y);g.lineTo(x-10,y+16);g.lineTo(x+8,y+15);g.lineTo(x-2,y+31);g.strokePath();}}
 if(index===7){g.lineStyle(4,0x9edccb,.22);g.strokeEllipse(start+width*.62,height*.50,230,175);g.lineStyle(2,0xdad3ac,.28);g.strokeEllipse(start+width*.62,height*.50,195,148);}
 const landmark=scene.add.image(start+width*.65,height*.25,`landmark-${index}`).setOrigin(.5,.85).setDisplaySize(250,334).setDepth(7);
 if(index===0||index===2||index===7){const lamp=scene.add.ellipse(start+width*.65,height*.18,170,60,parseInt(palette.accent.slice(1),16),.07).setDepth(3);scene.tweens.add({targets:lamp,alpha:.02,duration:1700,yoyo:true,repeat:-1});}
 landmark.setAlpha(.97);
}

// Направление и поза героя - настоящие отдельные кадры, экипировка рисуется поверх.
export function createHeroArtwork(scene:Phaser.Scene):void{
 const atlas=scene.textures.get('hero-atlas').getSourceImage() as CanvasImageSource;
 const directions=['front','back','left','right'];
 for(const skin of SKINS)for(let pose=0;pose<2;pose++)for(let dir=0;dir<4;dir++){
  const key=pose===0&&dir===0?skin.id:`${skin.id}-${directions[dir]}${pose?'-run':''}`;
  const t=scene.textures.createCanvas(key,128,128);if(!t)throw Error('Hero texture unavailable');
  const c=t.getContext();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  if(skin.id==='fox-moon')c.filter='grayscale(1) brightness(1.4)';
  else if(skin.id==='fox-ash')c.filter='grayscale(.85) brightness(.75)';
  else if(skin.id==='fox-ember')c.filter='saturate(1.5)';
  c.drawImage(atlas,dir*384,pose*512,384,512,16,0,96,128);c.filter='none';
  if(!['fox','fox-moon','fox-ash','fox-ember'].includes(skin.id)){c.globalCompositeOperation='source-atop';c.globalAlpha=.27;c.fillStyle=skin.scarf;c.fillRect(0,0,128,128);c.globalAlpha=1;c.globalCompositeOperation='source-over';}
  t.refresh();
 }
}
export function createDetailArtwork(scene:Phaser.Scene):void{
 const atlas=scene.textures.get('details-atlas').getSourceImage() as CanvasImageSource;
 for(const [i,key]of ['archer','alchemist','shade','gargoyle','village-well','village-wagon','village-shrine','village-board'].entries()){
  const t=scene.textures.createCanvas(key,128,128);if(!t)throw Error('Detail texture unavailable');
  t.getContext().drawImage(atlas,(i%4)*384,Math.floor(i/4)*512,384,512,16,0,96,128);t.refresh();
 }
 const interior=scene.textures.get('interiors-atlas').getSourceImage() as HTMLImageElement,cell=interior.width/2;
 for(const [i,role]of ['smith','armorer','healer','trader'].entries()){
  const t=scene.textures.createCanvas(`interior-${role}`,cell,cell);if(!t)throw Error('Interior texture unavailable');
  t.getContext().drawImage(interior,(i%2)*cell,Math.floor(i/2)*cell,cell,cell,0,0,cell,cell);t.refresh();
 }
}

// Границы рисунков проверены по готовому атласу: длинное оружие занимает две более высокие строки.
export function createCombatArtwork(scene:Phaser.Scene):void{
 const atlas=scene.textures.get('combat-atlas').getSourceImage() as HTMLImageElement;
 const rows=[0,376,746,947,1254].map(v=>v*atlas.height/1254),cell=atlas.width/4;
 const keys=['sword','spear','axe','staff','dawnblade','runicstaff','shot-violet','shot-bone','shot-acid','shot-bat','shot-ice','shot-fire','fx-meteor','fx-hurricane','fx-slash','shot-shadow'];
 for(const [i,key]of keys.entries()){
  if(scene.textures.exists(key))scene.textures.remove(key);
  const t=scene.textures.createCanvas(key,128,128);if(!t)throw Error('Combat texture unavailable');
  const row=Math.floor(i/4),height=rows[row+1]-rows[row],c=t.getContext();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  c.drawImage(atlas,(i%4)*cell,rows[row],cell,height,0,0,128,128);t.refresh();
 }
 const spirit=scene.textures.createCanvas('shot-spirit',128,128);if(!spirit)throw Error('Spirit texture unavailable');spirit.getContext().drawImage(scene.textures.get('shot-violet').getSourceImage() as CanvasImageSource,0,0);spirit.refresh();
}

// Equipment has independently measured rectangles; an equal-grid crop would cut the hilts.
export function createEquipmentArtwork(scene:Phaser.Scene):void{
 const atlas=scene.textures.get('equipment-atlas').getSourceImage() as HTMLImageElement;
 const frames:[string,number,number,number,number][]=[
  ['sword',170,0,154,432],['spear',515,0,90,432],['axe',741,0,286,433],['staff',1127,0,172,433],
  ['dawnblade',150,433,192,383],['runicstaff',471,433,179,383],
  ['arm-upper',802,445,170,366],['arm-bracer',1155,439,140,370],
  ['hand-palm',149,817,174,265],['hand-grip',478,817,170,265],
  ['hand-open',803,814,205,272],['hand-open-back',1132,815,209,271],
 ];
 for(const [key,x,y,width,height]of frames){
  const equipment=!key.startsWith('arm-')&&!key.startsWith('hand-'),size=equipment?256:128;
  const t=scene.textures.createCanvas(equipment?`held-${key}`:key,size,size);if(!t)throw Error('Equipment texture unavailable');
  const c=t.getContext();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  if(equipment){const scale=240/height;c.drawImage(atlas,x,y,width,height,(256-width*scale)/2,8,width*scale,240);}
  else c.drawImage(atlas,x,y,width,height,0,0,128,128);
  t.refresh();
 }
}

export function createArmedMotionArtwork(scene:Phaser.Scene):void{
 const atlas=scene.textures.get('armed-motion-atlas').getSourceImage() as HTMLImageElement;
 // x/y/width/height/spine-x, measured on the painted bodies. Tails cross grid guides.
 const frames=[
  [[34,9,185,272,151],[303,7,191,278,430],[580,8,184,278,704],[866,9,192,277,991],[1173,8,176,277,1286]],
  [[75,288,189,268,137],[363,289,191,272,420],[635,290,192,270,692],[926,291,194,270,985],[1218,290,172,271,1277]],
  [[43,564,225,260,123],[315,562,266,265,432],[610,562,246,262,702],[868,564,268,263,982],[1174,563,221,261,1268]],
  [[32,826,209,261,161],[306,824,257,259,446],[587,824,219,264,716],[881,825,250,261,1014],[1164,823,207,266,1287]],
 ];
 for(const skin of SKINS)for(const [row,direction]of ['front','back','left','right'].entries())for(let phase=0;phase<5;phase++){
  const key=`${skin.id}-armed-${direction}${phase?`-step-${phase-1}`:''}`;
  const t=scene.textures.createCanvas(key,128,128);if(!t)throw Error('Armed body texture unavailable');const c=t.getContext();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  if(skin.id==='fox-moon')c.filter='grayscale(1) brightness(1.4)';else if(skin.id==='fox-ash')c.filter='grayscale(.85) brightness(.75)';else if(skin.id==='fox-ember')c.filter='saturate(1.5)';
  const [x,y,width,height,spine]=frames[row][phase],scale=116/height;
  c.drawImage(atlas,x,y,width,height,64+(x-spine)*scale,8,width*scale,116);c.filter='none';
  if(!['fox','fox-moon','fox-ash','fox-ember'].includes(skin.id)){c.globalCompositeOperation='source-atop';c.globalAlpha=.27;c.fillStyle=skin.scarf;c.fillRect(0,0,128,128);c.globalAlpha=1;c.globalCompositeOperation='source-over';}
  t.refresh();
 }
 for(const skin of SKINS){
  const t=scene.textures.createCanvas(`${skin.id}-arm-upper`,128,128);if(!t)throw Error('Arm texture unavailable');const c=t.getContext();
  if(skin.id==='fox-moon')c.filter='grayscale(1) brightness(1.4)';else if(skin.id==='fox-ash')c.filter='grayscale(.85) brightness(.75)';else if(skin.id==='fox-ember')c.filter='saturate(1.5)';
  c.drawImage(scene.textures.get('arm-upper').getSourceImage() as CanvasImageSource,0,0);c.filter='none';
  if(!['fox','fox-moon','fox-ash','fox-ember'].includes(skin.id)){c.globalCompositeOperation='source-atop';c.globalAlpha=.27;c.fillStyle=skin.scarf;c.fillRect(0,0,128,128);c.globalAlpha=1;c.globalCompositeOperation='source-over';}
  t.refresh();
 }
}

export function createStrideArtwork(scene:Phaser.Scene):void{createMotionArtwork(scene,'stride-atlas','step');}
export function createRollArtwork(scene:Phaser.Scene):void{createMotionArtwork(scene,'roll-atlas','roll');}
function createMotionArtwork(scene:Phaser.Scene,atlasKey:string,motion:string):void{
 const atlas=scene.textures.get(atlasKey).getSourceImage() as HTMLImageElement,cell=atlas.width/4;
 for(const skin of SKINS)for(const [row,direction]of ['front','back','left','right'].entries())for(let phase=0;phase<4;phase++){
  const t=scene.textures.createCanvas(`${skin.id}-${direction}-${motion}-${phase}`,128,128);if(!t)throw Error('Motion texture unavailable');
  const c=t.getContext();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  if(skin.id==='fox-moon')c.filter='grayscale(1) brightness(1.4)';else if(skin.id==='fox-ash')c.filter='grayscale(.85) brightness(.75)';else if(skin.id==='fox-ember')c.filter='saturate(1.5)';
  c.drawImage(atlas,phase*cell,row*cell,cell,cell,0,0,128,128);c.filter='none';
  if(!['fox','fox-moon','fox-ash','fox-ember'].includes(skin.id)){c.globalCompositeOperation='source-atop';c.globalAlpha=.27;c.fillStyle=skin.scarf;c.fillRect(0,0,128,128);c.globalAlpha=1;c.globalCompositeOperation='source-over';}
  t.refresh();
 }
}

export function createResidentArtwork(scene:Phaser.Scene):void{
 const atlas=scene.textures.get('resident-atlas').getSourceImage() as HTMLImageElement,width=atlas.width/4,height=atlas.height/2;
 const roles=['smith','armorer','healer','trader'],colors=['#b28255','#7e98b4','#78a681','#a98aaa'];
 for(let species=0;species<8;species++)for(const [role,name]of roles.entries()){
  const t=scene.textures.createCanvas(`resident-${species}-${name}`,128,128);if(!t)throw Error('Resident texture unavailable');const c=t.getContext();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  c.drawImage(atlas,(species%4)*width,Math.floor(species/4)*height,width,height,16,0,96,128);c.globalCompositeOperation='source-atop';c.globalAlpha=.16;c.fillStyle=colors[role];c.fillRect(15,47,98,49);c.globalAlpha=1;c.globalCompositeOperation='source-over';
  if(name==='smith'){c.strokeStyle='#514338';c.lineWidth=3;c.beginPath();c.moveTo(96,82);c.lineTo(105,64);c.stroke();c.fillStyle='#8f9899';c.fillRect(98,59,15,7);}
  else if(name==='armorer'){c.fillStyle='#63798a';c.beginPath();c.moveTo(92,64);c.lineTo(111,66);c.lineTo(111,80);c.lineTo(102,88);c.lineTo(92,80);c.closePath();c.fill();c.strokeStyle='#c5b98e';c.lineWidth=2;c.stroke();}
  else if(name==='healer'){c.fillStyle='#568665';c.fillRect(99,66,6,5);ellipse(c,102,79,8,10,'#7aac83');ellipse(c,101,77,3,5,'#b9d6a4');}
  else{ellipse(c,101,84,10,12,'#8b684b');c.strokeStyle='#c2ab71';c.lineWidth=2;c.strokeRect(94,80,13,8);}
  t.refresh();
 }
}
