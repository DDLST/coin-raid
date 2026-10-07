import Phaser from 'phaser';
import type { Point, Bounds, Terrain } from './world';
import { PEOPLE, type Role } from './story';
import { villagePosition } from './regions';
export type House={village:number;role:Role;x:number;y:number;door:Point;roof:Phaser.GameObjects.Image;label:Phaser.GameObjects.Text};
export const HOUSE_NAMES:Record<Role,string>={smith:'Кузница Бруна',armorer:'Мастерская Мары',healer:'Дом настоек Ивы',trader:'Лавка Лисандра'};
export function housePoint(village:number,role:Role):Point{const at=villagePosition(village),index=PEOPLE.findIndex(n=>n.role===role);return{x:at.x+(index%2?205:-205),y:index<2?285:805};}
export function interiorBounds(h:Point):Bounds{return{left:h.x-108,width:h.x+126,top:h.y-115,height:h.y+135,margin:18};}
export function interiorObstacles(h:Point):Terrain[]{return[{kind:'ruin',x:h.x-72,y:h.y-70,radius:26},{kind:'ruin',x:h.x+77,y:h.y-70,radius:27}];}
export function interiorArt(scene:Phaser.Scene,h:House):Phaser.GameObjects.Container{
 const group=scene.add.container(h.x,h.y).setDepth(13),g=scene.add.graphics();group.add(g);
 const color=h.role==='smith'?0x9d7050:h.role==='armorer'?0x547c80:h.role==='healer'?0x5b8160:0x7b587f;
 g.fillStyle(0x151b20,1);g.fillRoundedRect(-137,-145,274,297,14);g.fillStyle(0x785e43,1);g.fillRect(-119,-127,238,259);
 for(let row=0;row<14;row++){g.lineStyle(1,0x372f29,.65);g.lineBetween(-118,-126+row*19,118,-126+row*19);for(let col=0;col<4;col++){const x=-118+col*64+(row%2)*24;g.lineBetween(x,-126+row*19,x,-108+row*19);}}
 g.fillStyle(color,.66);g.fillRoundedRect(-66,-20,132,98,8);g.lineStyle(3,0xe2c687,.60);g.strokeRoundedRect(-66,-20,132,98,8);
 g.fillStyle(0xbaa47a,1);g.fillRoundedRect(-106,-110,64,58,7);g.fillRoundedRect(45,-110,63,58,7);g.fillStyle(0x513d2d,1);g.fillRect(-108,-56,68,8);g.fillRect(43,-56,67,8);
 g.fillStyle(0xdeb56a,1);g.fillRect(-29,113,58,26);g.lineStyle(3,0x513c2c,1);g.lineBetween(-30,139,30,139);
 if(h.role==='smith'){const fire=scene.add.image(-76,-81,'fire').setDisplaySize(48,55);group.add(fire);g.fillStyle(0x323d43,1);g.fillRect(56,-94,42,12);g.fillRect(69,-82,18,26);g.fillStyle(0xe19656,.30);g.fillCircle(-77,-77,39);}
 if(h.role==='armorer'){const suit=scene.add.image(-73,-78,'armor-iron').setDisplaySize(62,62);group.add(suit);g.lineStyle(5,0xc7b993,1);g.strokeCircle(78,-83,18);g.lineBetween(60,-65,93,-97);}
 if(h.role==='healer'){for(let i=0;i<5;i++){g.fillStyle(i%2?0xb5e891:0x7ec9d5,.9);g.fillRoundedRect(-98+i*11,-93+(i%2)*8,7,21,3);g.fillStyle(0x553f2d,1);g.fillRect(-97+i*11,-98+(i%2)*8,5,5);}g.fillStyle(0x529760,1);for(let i=0;i<9;i++)g.fillEllipse(60+(i%3)*15,-94+Math.floor(i/3)*13,13,7);}
 if(h.role==='trader'){const chest=scene.add.image(-75,-78,'chest').setDisplaySize(56,56);group.add(chest);g.fillStyle(0xe6d4a4,1);g.fillRect(51,-101,49,31);g.lineStyle(2,0x7b8168,1);g.lineBetween(57,-95,81,-77);g.lineBetween(81,-77,94,-92);}
 const title=scene.add.text(0,-158,HOUSE_NAMES[h.role],{fontFamily:'system-ui',fontSize:'16px',fontStyle:'bold',color:'#f5dfb2',backgroundColor:'#172b25',padding:{x:10,y:6}}).setOrigin(.5);group.add(title);
 group.add(scene.add.text(0,132,'E · выйти',{fontFamily:'system-ui',fontSize:'12px',color:'#3e3325'}).setOrigin(.5));return group;
}
