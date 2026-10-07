import { parseProfile, type Profile } from './progression';
import { ENEMY_KINDS, REGIONS, WORLD_HEIGHT, WORLD_WIDTH, PROLOGUE_WIDTH, ROAD_WIDTH, villagePosition, type EnemyKind } from './regions';
import { newQuests, type Quest } from './quests';
import { DEFAULT_AUDIO, type AudioSettings } from './audio';
import type { Point } from './world';
import { stats } from './combat';
import { newLines, newDeliveries, PEOPLE, LESSONS, type Area, type Role, type QuestLine, type Delivery } from './story';
export type RegionProgress={coins:number;elapsed:number;spawned:boolean;bossDead:boolean;cleared:boolean;income:number;rewarded:boolean};
export type SavedEnemy=Point&{kind:EnemyKind;region:number;hp:number;phase2:boolean;variant:number;training:boolean};
export type SavedChest=Point&{region:number;quest:string;opened:boolean};
export type Snapshot={version:7;manual:true;savedAt:string;profile:Profile;region:number;progress:RegionProgress[];
 player:Point;checkpoint:Point;hp:number;stamina:number;flasks:number;armed:boolean;ultimate:number;elapsed:number;score:number;kills:number;deaths:number;
 enemies:SavedEnemy[];coins:(Point&{region:number})[];quests:Quest[][];chests:SavedChest[];audio:AudioSettings;area:Area;villageIndex:number;lastVillage:number;
 lesson:number;lessonProgress:number;lines:QuestLine[];wisp:Point|null;villages:number[];deliveries:Delivery[];interiorRole:Role|null;interiorReturn:'village'|'tutorial';migrated:boolean};
const number=(v:unknown,max=1e7,fallback=0):number=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,v)):fallback;
const obj=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
const point=(v:unknown):Point=>{const p=obj(v);return{x:number(p.x,WORLD_WIDTH),y:number(p.y,WORLD_HEIGHT)}};
const validRegion=(v:unknown,max=REGIONS.length):v is number=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<max;
const villageNumber=(v:unknown):number=>typeof v==='number'&&Number.isFinite(v)?Math.max(-1,Math.min(REGIONS.length-2,Math.floor(v))):-1;
export function parseSave(raw:string|null):Snapshot|null{
 try{
  const d=obj(JSON.parse(raw??'null')),legacy=d.version===5||d.version===6;
  if((!legacy&&d.version!==7)||d.manual!==true||!Array.isArray(d.progress)||d.progress.length!==(legacy?5:REGIONS.length)||!validRegion(d.region,legacy?5:REGIONS.length)||!d.profile)return null;
  const rows=d.progress,finished=legacy&&rows.every(v=>obj(v).cleared===true&&obj(v).bossDead===true);const region=finished?REGIONS.length-1:d.region;
  const progress:RegionProgress[]=REGIONS.map((r,i)=>{const a=obj(rows[i]),bossDead=finished||a.bossDead===true,coins=Math.max(Math.floor(number(a.coins)),finished||legacy&&a.cleared===true?r.coins:0);return{coins,elapsed:number(a.elapsed),spawned:finished||a.spawned===true,bossDead,cleared:bossDead&&coins>=r.coins&&(finished||a.cleared===true),income:number(a.income,2000),rewarded:finished||a.rewarded===true||legacy&&a.bossDead===true}});
  let area:Area=!legacy||d.version===6?d.area==='village'||d.area==='tutorial'||d.area==='interior'?d.area:'biome':'biome';
  let villageIndex=legacy&&d.version===5?region-1:villageNumber(d.villageIndex);
  let lastVillage=legacy&&d.version===5?region-1:villageNumber(d.lastVillage);
  const restartLast=legacy&&!finished&&region===4;
  if(restartLast){area='village';villageIndex=3;lastVillage=3;progress[4]={coins:0,elapsed:0,spawned:false,bossDead:false,cleared:false,income:0,rewarded:false};}
  if(progress.slice(0,region).some(p=>!p.cleared))return null;
  const positioned=(v:unknown,i:number,isVillage=false)=>{const p=point(v);if(legacy){const oldRoad=d.version===5?280:620,oldPrologue=d.version===5?0:880;p.x+=PROLOGUE_WIDTH-oldPrologue+i*(ROAD_WIDTH-oldRoad);if(isVillage)p.x+=(ROAD_WIDTH-oldRoad)/2;if(isVillage&&i<0)p.x=point(v).x+(PROLOGUE_WIDTH-oldPrologue)/2;}return p;};
  const enemies:SavedEnemy[]=[];
  if(Array.isArray(d.enemies))for(const v of d.enemies.slice(0,180)){const e=obj(v);if(!ENEMY_KINDS.includes(e.kind as EnemyKind)||!validRegion(e.region,legacy?5:REGIONS.length)||restartLast&&e.region===4)continue;const hp=number(e.hp,6000);if(hp<=0)continue;enemies.push({...e.training===true?point(e):positioned(e,e.region),kind:e.kind as EnemyKind,region:e.region,hp,phase2:e.phase2===true,variant:Math.floor(number(e.variant,20)),training:e.training===true});}
  const coins:Snapshot['coins']=[];
  if(Array.isArray(d.coins))for(const v of d.coins.slice(0,100)){const c=obj(v);if(validRegion(c.region,legacy?5:REGIONS.length)&&!(restartLast&&c.region===4))coins.push({...area==='tutorial'?point(c):positioned(c,c.region),region:c.region});}
  const quests=REGIONS.map((_,i)=>newQuests(i));
  if(Array.isArray(d.quests))for(let i=0;i<REGIONS.length;i++){const row=d.quests[i];if(!Array.isArray(row))continue;for(const q of quests[i]){const a=obj(row.find(v=>obj(v).id===q.id));q.progress=Math.floor(number(a.progress,q.target));q.elapsed=number(a.elapsed);q.complete=a.complete===true&&q.progress>=q.target;q.failed=!q.complete&&q.id==='sprint'&&(a.failed===true||q.elapsed>q.limit);if(Array.isArray(a.kills))q.kills=a.kills.slice(-3).map(v=>number(v,q.elapsed)).filter(t=>q.elapsed-t<=q.limit);}}
  const chests:SavedChest[]=[];
  if(Array.isArray(d.chests))for(const v of d.chests.slice(0,24)){const c=obj(v);if(!validRegion(c.region)||typeof c.quest!=='string'||!quests[c.region].some(q=>q.id===c.quest&&q.complete)||chests.some(x=>x.region===c.region&&x.quest===c.quest))continue;chests.push({...positioned(c,c.region),region:c.region,quest:c.quest,opened:c.opened===true});}
  const a=obj(d.audio),audio={master:number(a.master,1,DEFAULT_AUDIO.master),music:number(a.music,1,DEFAULT_AUDIO.music),effects:number(a.effects,1,DEFAULT_AUDIO.effects),muted:a.muted===true};
  const lines=newLines();if(Array.isArray(d.lines))for(const q of lines){const a=obj(d.lines.find(v=>obj(v).id===q.id));q.accepted=a.accepted===true;q.kills=Math.floor(number(a.kills,2));q.artifact=a.artifact===true;q.runes=Math.floor(number(a.runes,3));q.escorted=a.escorted===true;q.claimed=q.accepted&&a.claimed===true;}
  const deliveries=newDeliveries();if(Array.isArray(d.deliveries))for(const q of deliveries){const a=obj(d.deliveries.find(v=>obj(v).id===q.id));q.accepted=a.accepted===true;q.delivered=q.accepted&&a.delivered===true;q.claimed=q.delivered&&a.claimed===true;}
  const villages=Array.isArray(d.villages)?[...new Set(d.villages.filter(v=>typeof v==='number'&&Number.isInteger(v)&&v>=-1&&v<REGIONS.length-1&&(v<0||progress[v].cleared)))] as number[]:Array.from({length:lastVillage+2},(_,i)=>i-1);
  if(!villages.includes(-1))villages.push(-1);if(!villages.includes(lastVillage))lastVillage=-1;
  if((area==='village'||area==='interior')&&villageIndex>=0&&!progress[villageIndex].cleared){villageIndex=-1;lastVillage=-1;}
  const profile=parseProfile(JSON.stringify(d.profile));if(legacy)profile.skillPoints=progress.filter(p=>p.bossDead).length;
  const player=restartLast?{x:villagePosition(3).x+15,y:645}:area==='tutorial'?point(d.player):positioned(d.player,area==='village'?villageIndex:region,area==='village');
  if(finished)player.x=Math.min(WORLD_WIDTH-80,PROLOGUE_WIDTH+(REGIONS.length-1)*(1280+ROAD_WIDTH)+200);
  const limits=stats(profile);
  return{version:7,manual:true,savedAt:typeof d.savedAt==='string'?d.savedAt:'',profile,region,progress,player,checkpoint:{x:villagePosition(lastVillage).x+15,y:645},hp:number(d.hp,limits.maxHP,limits.maxHP),stamina:number(d.stamina,limits.maxStamina,limits.maxStamina),flasks:Math.floor(number(d.flasks,limits.flasks,2)),armed:restartLast||d.armed===true,ultimate:number(d.ultimate,100),elapsed:number(d.elapsed),score:Math.floor(number(d.score)),kills:Math.floor(number(d.kills)),deaths:Math.floor(number(d.deaths)),enemies,coins,quests,chests,audio,area,villageIndex,lastVillage,lesson:Math.floor(number(d.lesson,LESSONS.length)),lessonProgress:Math.floor(number(d.lessonProgress,10)),lines,wisp:d.wisp?positioned(d.wisp,3):null,villages,deliveries,interiorRole:PEOPLE.some(p=>p.role===d.interiorRole)?d.interiorRole as Role:null,interiorReturn:d.interiorReturn==='tutorial'?'tutorial':'village',migrated:legacy};
 }catch{return null;}
}
