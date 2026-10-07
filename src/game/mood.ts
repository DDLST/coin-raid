import Phaser from 'phaser';
import { bakeScenery } from './art';
export type BiomeMood={floor:Phaser.GameObjects.Image;terrain:Phaser.GameObjects.Image[];shade:Phaser.GameObjects.Rectangle;graves:Phaser.GameObjects.Image;flowers:Phaser.GameObjects.Image;cleared?:boolean;inside?:boolean};
export function createBiomeMood(scene:Phaser.Scene,floor:Phaser.GameObjects.Image,terrain:Phaser.GameObjects.Image[],start:number,width:number,height:number,index:number):BiomeMood{
 const shade=scene.add.rectangle(start,0,width,height,0x10101c,.25).setOrigin(0).setDepth(5);
 const graves=scene.add.graphics().setDepth(4),flowers=scene.add.graphics().setDepth(4);let seed=7111+index*113;
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let n=0;n<30;n++){
  const x=start+65+random()*(width-130),y=120+random()*(height-240);
  graves.fillStyle(0x2b2532,.38);graves.fillEllipse(x,y+12,48,23);
  graves.fillStyle(0x3e4146,.9);graves.fillRoundedRect(x-10,y-22,20,35,5);graves.lineStyle(2,0x777b77,.65);graves.lineBetween(x-6,y-11,x+6,y-11);graves.lineBetween(x,y-17,x,y+2);
  graves.lineStyle(1,0x241c24,.7);graves.lineBetween(x+3,y+1,x-1,y+7);graves.lineBetween(x-1,y+7,x+4,y+11);
 }
 for(let n=0;n<270;n++){
  const x=start+30+random()*(width-60),y=80+random()*(height-130);
  flowers.lineStyle(1,0x587349,.75);flowers.lineBetween(x,y,x-1,y-6);flowers.fillStyle([0xbab591,0xb398a1,0xd1c7ad,0x879fb1][n%4],.85);flowers.fillCircle(x-1,y-7,1.5+random());
 }
 const gravesImage=bakeScenery(scene,graves,`graves-${index}`,start,width,height,4);
 const flowersImage=bakeScenery(scene,flowers,`flowers-${index}`,start,width,height,4).setVisible(false);
 return{floor,terrain,shade,graves:gravesImage,flowers:flowersImage};
}
export function setBiomeMood(m:BiomeMood,cleared:boolean,inside=false):void{
 if(m.cleared===cleared&&m.inside===inside)return;m.cleared=cleared;m.inside=inside;
 m.floor.setTint(cleared?0xe1e6d4:0x8b9493);for(const image of m.terrain)cleared?image.clearTint():image.setTint(0x879191);
 m.shade.setVisible(!cleared&&!inside);m.graves.setVisible(!cleared&&!inside);m.flowers.setVisible(cleared&&!inside);
}
