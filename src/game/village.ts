import Phaser from 'phaser';
import type { Point, Bounds, Terrain } from './world';
import { PEOPLE, type Role } from './story';
import { villagePosition } from './regions';
export type House={village:number;role:Role;x:number;y:number;door:Point;roof:Phaser.GameObjects.Image;label:Phaser.GameObjects.Text};
export const HOUSE_NAMES:Record<Role,string>={smith:'Кузница Бруна',armorer:'Мастерская Мары',healer:'Дом настоек Ивы',trader:'Лавка Лисандра'};
export function housePoint(village:number,role:Role):Point{const at=villagePosition(village),index=PEOPLE.findIndex(n=>n.role===role);return{x:at.x+(index%2?205:-205),y:index<2?285:805};}
export function interiorBounds(h:Point):Bounds{return{left:h.x-143,width:h.x+143,top:h.y-143,height:h.y+143,margin:18};}
export function interiorObstacles(h:Point):Terrain[]{return[{kind:'ruin',x:h.x-72,y:h.y-70,radius:26},{kind:'ruin',x:h.x+77,y:h.y-70,radius:27}];}
export function interiorArt(scene:Phaser.Scene,h:House):Phaser.GameObjects.Container{
 const group=scene.add.container(h.x,h.y).setDepth(13);
 group.add(scene.add.image(0,0,`interior-${h.role}`).setDisplaySize(350,350));
 const title=scene.add.text(0,-183,HOUSE_NAMES[h.role],{fontFamily:'system-ui',fontSize:'17px',fontStyle:'bold',color:'#f5dfb2',backgroundColor:'#172b25',padding:{x:10,y:6}}).setOrigin(.5);group.add(title);
 if(h.role==='smith'){
  const glow=scene.add.ellipse(-94,-95,65,52,0xff9c43,.13);group.add(glow);
  scene.tweens.add({targets:glow,alpha:.28,yoyo:true,repeat:-1,duration:460});
 }
 return group;
}
