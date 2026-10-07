import type { Point } from './world';

// Boss moves never enter the ordinary mob attack dispatcher.
export const BOSS_MOVES=[
 ['oath-cross','blade-wheel','grave-spears'],
 ['tomb-cage','grave-hands','funeral-march'],
 ['blood-eclipse','mirror-hunt','blood-tethers'],
 ['ritual-star','soul-spiral','pyre-procession'],
 ['frost-maze','ice-pincers','crown-sweep'],
 ['memory-trap','spectral-waltz','silence-seal'],
 ['storm-grid','orbit-lances','sky-collapse'],
 ['dragon-sweep','world-fracture','soul-prison'],
] as const;
export type BossAttack=typeof BOSS_MOVES[number][number];
export const BOSS_NAMES:Record<BossAttack,string>={
 'oath-cross':'Крест забытой клятвы','blade-wheel':'Колесо клинков','grave-spears':'Могильные копья',
 'tomb-cage':'Гробовая клетка','grave-hands':'Руки из могил','funeral-march':'Похоронный марш',
 'blood-eclipse':'Кровавое затмение','mirror-hunt':'Охота отражений','blood-tethers':'Кровавые нити',
 'ritual-star':'Звезда костяного ритуала','soul-spiral':'Спираль душ','pyre-procession':'Шествие погребальных огней',
 'frost-maze':'Ледяной лабиринт','ice-pincers':'Ледяные тиски','crown-sweep':'Осколки короны',
 'memory-trap':'Ловушка памяти','spectral-waltz':'Призрачный вальс','silence-seal':'Печать безмолвия',
 'storm-grid':'Шахматы бури','orbit-lances':'Копья орбиты','sky-collapse':'Падение небес',
 'dragon-sweep':'Крылья пожирателя','world-fracture':'Разлом мира','soul-prison':'Темница душ',
};
const IDS=new Set<string>(BOSS_MOVES.flat());
export const isBossAttack=(move:string):move is BossAttack=>IDS.has(move);
export type BossStrike=Point&{
 shape:'line'|'ring'|'mark';radius:number;inner:number;angle:number;length:number;width:number;
 delay:number;visual:string;physical:boolean;scale:number;
};

// The warning and the damage use this exact same geometry. Targets lock on cast.
export function bossPattern(move:BossAttack,origin:Point,target:Point,rage=false):BossStrike[]{
 const out:BossStrike[]=[],angle=Math.atan2(target.y-origin.y,target.x-origin.x),extra=rage?1:0;
 const add=(p:Point,shape:BossStrike['shape'],radius:number,delay:number,visual:string,options:Partial<BossStrike>={})=>{
  out.push({x:p.x,y:p.y,shape,radius,inner:0,angle:0,length:0,width:0,delay,visual,physical:false,scale:.90,...options});
 };
 const mark=(p:Point,r:number,delay:number,visual='shot-violet')=>add(p,'mark',r,delay,visual);
 const ring=(p:Point,r:number,inner:number,delay:number,visual='shot-violet')=>add(p,'ring',r,delay,visual,{inner});
 const line=(p:Point,a:number,len:number,width:number,delay:number,visual='shot-bone',physical=false)=>add(p,'line',len/2,delay,visual,{angle:a,length:len,width,physical});
 const polar=(p:Point,a:number,d:number):Point=>({x:p.x+Math.cos(a)*d,y:p.y+Math.sin(a)*d});
 const between=(a:Point,b:Point,width:number,delay:number,visual='shot-bone',physical=false)=>line({x:(a.x+b.x)/2,y:(a.y+b.y)/2},Math.atan2(b.y-a.y,b.x-a.x),Math.hypot(b.x-a.x,b.y-a.y),width,delay,visual,physical);
 switch(move){
  case 'oath-cross':
   line(target,angle,390,32,0,'fx-slash',true);line(target,angle+Math.PI/2,390,32,.42,'fx-slash',true);
   if(rage)line(target,angle+Math.PI/4,420,28,.85,'fx-slash',true);break;
  case 'blade-wheel':
   for(let n=0;n<4+extra;n++)line(origin,angle+n*Math.PI/4,380,25,n*.27,'fx-slash',true);break;
  case 'grave-spears':
   for(let n=0;n<6+extra*2;n++)mark(polar(target,n*Math.PI*2/(6+extra*2),115),36,n*.15,'shot-bone');
   mark(target,48,1.3,'shot-bone');break;
  case 'tomb-cage':
   for(let n=0;n<4;n++)line(polar(target,n*Math.PI/2,142),n*Math.PI/2+Math.PI/2,210,35,n*.24,'shot-acid');
   if(rage)mark(target,55,1.2,'shot-acid');break;
  case 'grave-hands':
   for(let n=0;n<3+extra;n++)for(const side of [-1,1])mark({x:target.x+side*(160-n*43),y:target.y+(n-1)*70},46,n*.34,'shot-bone');break;
  case 'funeral-march':
   for(let n=0;n<4+extra;n++)line({x:target.x+(n-1.5)*80,y:target.y},Math.PI/2,410,30,n*.35,'shot-acid');break;
  case 'blood-eclipse':
   ring(target,225,95,0,'shot-bat');mark(target,62,1.3,'shot-bat');if(rage)ring(target,280,220,.50,'shot-bat');break;
  case 'mirror-hunt':
   for(let n=0;n<3+extra;n++){const a=angle+n*Math.PI*2/(3+extra);between(polar(target,a,195),polar(target,a+Math.PI,90),29,n*.39,'shot-bat');}break;
  case 'blood-tethers':
   for(let n=0;n<4+extra;n++)between(origin,polar(target,n*Math.PI*2/(4+extra),135),23,n*.23,'shot-bat');break;
  case 'ritual-star':{
   const vertices=Array.from({length:5},(_,n)=>polar(target,n*Math.PI*2/5-Math.PI/2,175));
   for(let n=0;n<5;n++)between(vertices[n],vertices[(n+2)%5],24,n*.18,'shot-fire');if(rage)ring(target,210,168,1,'shot-fire');break;
  }
  case 'soul-spiral':
   for(let n=0;n<8+extra*3;n++)mark(polar(target,n*.85,35+n*19),37,n*.14,'shot-violet');break;
  case 'pyre-procession':
   for(let n=0;n<3+extra;n++)line(polar(target,angle+Math.PI/2,(n-1)*95),angle,440,42,n*.4,'shot-fire');break;
  case 'frost-maze':
   for(let n=-2;n<=2;n++){if(n!==1)line({x:target.x+n*82,y:target.y},Math.PI/2,405,20,(n+2)*.15,'shot-ice');if(n!==-1)line({x:target.x,y:target.y+n*82},0,405,20,.75+(n+2)*.15,'shot-ice');}break;
  case 'ice-pincers':
   for(let n=0;n<3+extra;n++)for(const side of [-1,1])line({x:target.x+side*(185-n*42),y:target.y},Math.PI/2,285,25,n*.38,'shot-ice');break;
  case 'crown-sweep':
   for(let n=0;n<7+extra*2;n++)mark(polar(origin,angle-1.2+n*2.4/(6+extra*2),195),39,n*.17,'shot-ice');line(target,angle,340,30,1.5,'shot-ice',true);break;
  case 'memory-trap':
   for(let n=0;n<5+extra;n++)mark({x:origin.x+(target.x-origin.x)*n/4,y:origin.y+(target.y-origin.y)*n/4},55,n*.26,'shot-shadow');break;
  case 'spectral-waltz':
   for(let n=0;n<5+extra;n++)between(polar(target,angle+n*1.1,90),polar(target,angle+n*1.1,235),32,n*.30,'shot-shadow');break;
  case 'silence-seal':
   ring(target,205,90,0,'shot-shadow');for(const side of [-1,1])line({x:target.x+side*145,y:target.y},Math.PI/2,365,25,.7,'shot-shadow');if(rage)mark(target,58,1.65,'shot-shadow');break;
  case 'storm-grid':
   for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)if((x+y+2)%2===0)mark({x:target.x+x*112,y:target.y+y*112},48,(y+1)*.20,'shot-spirit');if(rage)mark({x:target.x+112,y:target.y},43,1.2,'shot-spirit');break;
  case 'orbit-lances':
   for(let n=0;n<6+extra;n++){const a=angle+n*Math.PI*2/(6+extra);line(polar(target,a,165),a+Math.PI/2,155,25,n*.19,'shot-spirit');}break;
  case 'sky-collapse':
   for(let n=0;n<3+extra;n++)ring(target,100+n*65,66+n*65,n*.43,'shot-spirit');break;
  case 'dragon-sweep':
   for(let n=0;n<3+extra;n++)line(polar(target,angle+Math.PI/2,(n-1)*105),angle+(n%2?.13:-.13),640,48,n*.35,'shot-fire');break;
  case 'world-fracture':{
   const vertices=Array.from({length:6+extra},(_,n)=>({x:target.x-300+n*115,y:target.y+(n%2?90:-90)}));
   for(let n=0;n<vertices.length-1;n++)between(vertices[n],vertices[n+1],43,n*.25,'fx-meteor');break;
  }
  case 'soul-prison':
   ring(target,245,105,0,'shot-violet');mark(target,77,1.6,'shot-fire');if(rage)ring(target,310,245,.65,'shot-violet');break;
 }
 return out;
}

export function bossStrikeHits(h:BossStrike,p:Point,playerRadius:number):boolean{
 const dx=p.x-h.x,dy=p.y-h.y;
 if(h.shape==='line'){
  const along=dx*Math.cos(h.angle)+dy*Math.sin(h.angle),across=-dx*Math.sin(h.angle)+dy*Math.cos(h.angle);
  return Math.abs(along)<=h.length/2+playerRadius&&Math.abs(across)<=h.width/2+playerRadius;
 }
 const distance=Math.hypot(dx,dy);
 return distance<=h.radius+playerRadius&&(h.shape!=='ring'||distance>=h.inner-playerRadius);
}
