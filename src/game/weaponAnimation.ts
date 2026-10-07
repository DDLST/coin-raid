import { WEAPONS, type WeaponId } from './progression';
import type { SkillId } from './skills';

const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
const nearestAngle=(angle:number,reference:number)=>reference+Math.atan2(Math.sin(angle-reference),Math.cos(angle-reference));
// Each painting has its own measured hilt pivot. The hand always coincides with it.
export const WEAPON_ART:Record<WeaponId,{size:number;gripX:number;gripY:number;tipY:number}>={
 sword:{size:100,gripX:.5,gripY:.802,tipY:.04},
 dawnblade:{size:102,gripX:.5,gripY:.847,tipY:.04},
 spear:{size:148,gripX:.498,gripY:.671,tipY:.04},
 axe:{size:114,gripX:.5,gripY:.741,tipY:.04},
 staff:{size:124,gripX:.509,gripY:.715,tipY:.04},
 runicstaff:{size:122,gripX:.499,gripY:.761,tipY:.04},
};
export const WEAPON_SIZE=Object.fromEntries(WEAPONS.map(w=>[w.id,WEAPON_ART[w.id].size])) as Record<WeaponId,number>;
export const weaponTexture=(id:WeaponId)=>`held-${id}`;
export type WeaponMotion={combo?:number;skill?:SkillId|null;guard?:boolean;runPhase?:number;roll?:number;chain?:boolean};
// Grip centres on the existing four painted roll frames (128px character textures).
export const ROLL_GRIPS:Record<string,readonly (readonly [number,number])[]>={
 front:[[89,98],[64,112],[78,92],[123,115]],
 back:[[105,118],[84,64],[27,85],[122,117]],
 left:[[78,96],[80,89],[79,60],[100,99]],
 right:[[93,54],[54,92],[24,69],[102,100]],
};

export function weaponPose(id:WeaponId,face:number,time:number,windup:number,activeEnd:number,duration:number,arc:number,heavy=false,motion:WeaponMotion={}){
 const w=WEAPONS.find(w=>w.id===id)!,side=Math.cos(face)<0?-1:1,combo=motion.combo??0;
 const rest=w.style==='spear'?-1.25:w.style==='staff'?-1.48:side>0?-.95:-2.19;
 const aim=nearestAngle(face,rest),progress=time<0?0:ease(time/Math.max(.01,duration));
 let angle=rest,extension=0,power=0,lean=0,prepared=aim-arc-.40,end=aim+arc;
 const thrust=w.style==='spear'||motion.skill==='sword_lunge';
 if(w.style==='sword'){
  if(combo===1){prepared=aim+arc;end=aim-arc;}
  if(combo===2){prepared=aim-1.65;end=aim+.55;}
  if(motion.chain){const reverse=combo%2===1;prepared=aim+(reverse?arc:-arc);end=aim+(reverse?-arc:arc);}
 }
 if(w.style==='axe'){
  const cleave=combo===1||motion.skill==='axe_cleave'||motion.skill==='axe_fault';
  prepared=aim-(cleave?1.80:1.55);end=aim+(heavy?Math.PI*2:cleave?.42:arc);
 }
 const thrustAim=aim+(w.style==='spear'?[0,.10,-.10][combo]:0);
 if(thrust)prepared=thrustAim;
 if(time>=0){
  power=Math.sin(progress*Math.PI);
  if(time<windup){angle=rest+(prepared-rest)*ease(time/Math.max(.01,windup));if(thrust)extension=-3*ease(time/Math.max(.01,windup));}
  else if(time<=activeEnd){
   const t=ease((time-windup)/Math.max(.01,activeEnd-windup));
   angle=thrust?thrustAim:prepared+(end-prepared)*t;
   extension=thrust?-3+Math.sin(t*Math.PI)*(combo===2||heavy?16:12):combo===2?power*4:0;
  }else{
   const finish=thrust?thrustAim:end,target=nearestAngle(rest,finish);
   angle=finish+(target-finish)*ease((time-activeEnd)/Math.max(.01,duration-activeEnd));
   if(thrust)extension=-3*(1-ease((time-activeEnd)/Math.max(.01,duration-activeEnd)));
  }
  if(w.style==='staff'){
   const casting=aim+[-.35,.30,-.1][combo];
   angle=time<windup?rest+(casting-rest)*ease(time/Math.max(.01,windup)):time<=activeEnd?casting+Math.sin((time-windup)/Math.max(.01,activeEnd-windup)*Math.PI)*.16:casting+(nearestAngle(rest,casting)-casting)*ease((time-activeEnd)/Math.max(.01,duration-activeEnd));
   extension=power*(combo===2?7:4);
  }
  lean=side*power*(w.style==='axe'?7:thrust?4:combo===1?-4:5);
 }
 if(motion.guard){angle=aim-1.0;power=.35;extension=0;lean=side*-3;}
 const both=w.style==='spear'||w.style==='axe'||w.style==='sword'&&(combo===2&&time>=0||motion.guard===true);
 const bob=motion.runPhase===undefined?0:Math.sin(motion.runPhase)*1.8;
 let handX=side*(both?5:14)+Math.cos(face)*extension+Math.cos(angle)*power*3;
 let handY=-6+Math.sin(face)*extension*.55+Math.sin(angle)*power*3+bob;
 let otherX=-side*13,otherY=-4-bob,otherAngle=.12*side;
 const separation=w.style==='spear'?13:w.style==='axe'?9:-6;
 if(both){otherX=handX+Math.cos(angle)*separation;otherY=handY+Math.sin(angle)*separation;otherAngle=angle+Math.PI/2;}
 else if(w.style==='staff'&&time>=0){otherX=-side*10+Math.cos(face)*power*8;otherY=-13+Math.sin(face)*power*7;otherAngle=face+Math.PI/2;}
 if(motion.roll!==undefined){
  const turn=motion.roll*Math.PI*2;angle=face+Math.sin(turn)*.40;
  handX=side*(6+Math.cos(turn)*3);handY=-7-Math.sin(turn)*4;
  otherX=handX-Math.cos(angle)*5;otherY=handY-Math.sin(angle)*5;otherAngle=angle+Math.PI/2;lean=0;
 }
 return{handX,handY,otherX,otherY,otherAngle,rotation:angle+Math.PI/2,angle,lean,both,
  casting:w.style==='staff'&&time>=0,behind:Math.sin(face)<-.25&&time<0&&motion.roll===undefined};
}

// Painted upper arm and bracer meet at the elbow; neither segment floats.
export const UPPER_ARM_LENGTH=16,FOREARM_LENGTH=18;
export function armElbow(shoulder:{x:number;y:number},hand:{x:number;y:number},bend:number){
 const dx=hand.x-shoulder.x,dy=hand.y-shoulder.y,distance=Math.hypot(dx,dy),d=Math.max(3,Math.min(UPPER_ARM_LENGTH+FOREARM_LENGTH-.01,distance));
 const along=(UPPER_ARM_LENGTH**2-FOREARM_LENGTH**2+d*d)/(2*d),height=Math.sqrt(Math.max(0,UPPER_ARM_LENGTH**2-along*along));
 const ux=distance>.001?dx/distance:0,uy=distance>.001?dy/distance:1;
 return{x:shoulder.x+ux*along-uy*height*bend,y:shoulder.y+uy*along+ux*height*bend};
}
