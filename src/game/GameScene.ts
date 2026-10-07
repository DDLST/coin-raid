import Phaser from 'phaser';
import { background, createArtwork, createMysticArtwork, createVillageArtwork, createAtlasArtwork, createCreepyArtwork, createHeroArtwork, createDetailArtwork, createCombatArtwork, createEquipmentArtwork, createArmedMotionArtwork, createStrideArtwork, createRollArtwork, createResidentArtwork, biomeGround } from './art';
import villageAtlas from '../assets/village-atlas.webp?url';
import biomeAtlas from '../assets/biome-atlas.webp?url';
import storyAtlas from '../assets/story-atlas.webp?url';
import creepAtlas from '../assets/creep-atlas.webp?url';
import heroAtlas from '../assets/hero-atlas.webp?url';
import interiorsAtlas from '../assets/interiors-atlas.webp?url';
import detailsAtlas from '../assets/details-atlas.webp?url';
import combatAtlas from '../assets/combat-atlas.webp?url';
import strideAtlas from '../assets/stride-atlas.webp?url';
import residentAtlas from '../assets/resident-atlas.webp?url';
import rollAtlas from '../assets/roll-atlas.webp?url';
import equipmentAtlas from '../assets/equipment-atlas.webp?url';
import armedMotionAtlas from '../assets/armed-motion-atlas.webp?url';
import { clampPoint, clearLine, findPath, freePoint, makeGrid, moveCircle, regionTerrain, type Bounds, type NavGrid, type Point, type Terrain } from './world';
import { PROFILE_KEY, LEGACY_KEYS, SKINS, UPGRADES, WEAPONS, ARMORS, newProfile, purchase, itemUnlock, isAttribute, attributeLevel, attributePrice, weaponFor, armorFor, type Profile } from './progression';
import { DODGE_COST, DODGE_TIME, FLASK_HEAL, POTION_HEAL, HURT_PROTECTION, ULTIMATE_MAX, slashConnects, stats, attackSpec, skillAttack } from './combat';
import { REGIONS, REGION_INCOME, REGION_WIDTH, ROAD_WIDTH, WORLD_HEIGHT, WORLD_WIDTH, regionEnd, regionStart, villagePosition, VILLAGE_NAMES, PROLOGUE_WIDTH, type EnemyKind, type EnemyAttack } from './regions';
import { ForestAudio } from './audio';
import { advanceQuests, newQuests, questEvent, rollLoot, LOOT_ODDS, type Quest, type Loot } from './quests';
import { OPENING, ENDING, LESSONS, PEOPLE, LINES, DELIVERIES, newLines, newDeliveries, lineReady, type Area, type Role, type QuestLine, type LineId, type Delivery } from './story';
import { parseSave, type RegionProgress, type Snapshot, type SavedChest } from './save';
import { SKILL_TREE, learnSkill, refundBranch, toggleSkill, type SkillId } from './skills';
import { ACHIEVEMENTS, earnedAchievements, type AchievementId } from './achievements';
import { QUEST_NOTES, lineJournal, deliveryJournal, type JournalEntry } from './journal';
import { housePoint, interiorArt, interiorBounds, interiorObstacles, type House } from './village';
import { BRIEFING_CARDS, LESSON_CUES, lessonPoint } from './learning';
import { resident, houseName, villageStock, villageTradition } from './residents';
import { WEATHER_DURATION, WEATHER_NAMES, WEATHER_HINTS, randomWeather, METEOR_WARNING, METEOR_RADIUS, HURRICANE_RADIUS, HURRICANE_PULL, type WeatherKind } from './events';
import { weaponPose, weaponTexture, WEAPON_ART, ROLL_GRIPS, armElbow } from './weaponAnimation';
import { createBiomeMood, setBiomeMood, type BiomeMood } from './mood';
const PLAYER_RADIUS=16, PICKUP_RADIUS=31, PATH_INTERVAL=.45, INTERACT_DISTANCE=112, BOSS_REWARD=45;
const STAMINA_DELAY=.48, LIGHTNING_WARNING=1.2, LIGHTNING_RADIUS=48;
const INTRO_DURATION=6.3, WEAPON_STEAL_AT=1.2, WEAPON_BREAK_AT=2.6, MAX_MINIONS=18;
const PARRY_DURATION=.24, PERFECT_PARRY=.14, COUNTER_WINDOW=1.15, WAVE_FIRST=4, WAVE_SIZE=3;
type GameState='ready'|'intro'|'playing'|'paused'|'dialog'|'shop'|'menu'|'map'|'loot'|'dying'|'lost'|'won'|'story'|'choice'|'confirm'|'travel'|'briefing';
type EnemyMode='chase'|'windup'|'charge'|'recover';
type Enemy={id:number;region:number;kind:EnemyKind;variant:number;sprite:Phaser.GameObjects.Image;shadow:Phaser.GameObjects.Ellipse;
 hp:number;maxHP:number;radius:number;damage:number;reward:number;speed:number;mode:EnemyMode;clock:number;nextPath:number;path:Point[];
 aim:Point;target:Point;hasHit:boolean;stun:number;flash:number;phase2:boolean;dead:boolean;move:EnemyAttack;moveIndex:number;training:boolean;chain:number;bleed:number;bleedTick:number;recoil:number;voiceLeft:number};
type Coin={region:number;sprite:Phaser.GameObjects.Image;value:number;phase:number};
type Projectile=Point&{vx:number;vy:number;life:number;damage:number;region:number;friendly:boolean;color:number;radius:number;blast:number;visual:string;hits:Set<number>};
type Hazard=Point&{region:number;radius:number;warning:number;left:number;damage:number;kind:'poison'|'meteor'|'ring'|'sigil'|'wave'|'curse';fired:boolean;environment?:boolean};
type Chest=SavedChest&{sprite:Phaser.GameObjects.Image};
type Strike=Point&{left:number;phase:'warning'|'impact'};
type ShopTab='weapons'|'armors'|'upgrades'|'skins'|'supplies'|'growth';
const POTION_PRICE=25, THIRD_BIOME_DAMAGE=.74, THIRD_BIOME_WINDUP=1.18;
const SUPPLIES=[{id:'field-potion',name:'Дорожное зелье',icon:'⚗',price:POTION_PRICE,description:'В сумку: V лечит 55 HP или 30% максимума. Не занимает заряд фляги.'},{id:'heal-service',name:'Перевязка',icon:'✚',price:8,description:'Восстановить 50 HP'},{id:'refill',name:'Заряд фляги',icon:'♜',price:10,description:'Добавить 1 заряд, до максимума'},{id:'rest-service',name:'Полное лечение',icon:'☀',price:18,description:'Восстановить HP и все фляги'}];
type MenuTab='overview'|'equipment'|'skills'|'quests'|'achievements'|'settings';
export class GameScene extends Phaser.Scene {
 private player!:Phaser.GameObjects.Image;
 private playerShadow!:Phaser.GameObjects.Ellipse;
 private sword!:Phaser.GameObjects.Image;
 private armorSprite!:Phaser.GameObjects.Image;
 private combatInk!:Phaser.GameObjects.Graphics;
 private weatherInk!:Phaser.GameObjects.Graphics;
 private gateInk!:Phaser.GameObjects.Graphics;
 private reaper!:Phaser.GameObjects.Image;private stolenWeapon!:Phaser.GameObjects.Image;private reaperInk!:Phaser.GameObjects.Graphics;
 private terrain:Terrain[]=[];
 private terrainByRegion:Terrain[][]=[];
 private nav:NavGrid[]=[];
 private bossNav:NavGrid[]=[];
 private enemies:Enemy[]=[];
 private coins:Coin[]=[];
 private projectiles:Projectile[]=[];
 private hazards:Hazard[]=[];
 private chests:Chest[]=[];
 private merchants:Phaser.GameObjects.Image[]=[];
 private fires:Phaser.GameObjects.Image[]=[];
 private progress:RegionProgress[]=[];
 private quests:Quest[][]=[];
 private campVisits=new Set<number>();
 private keys!:Record<string,Phaser.Input.Keyboard.Key>;
 private listeners!:AbortController;
 private state:GameState='ready';
 private regionIndex=0;
 private area:Area='village';private villageIndex=-1;private lastVillage=-1;
 private villagers:{village:number;role:Role;sprite:Phaser.GameObjects.Image;gesture:Phaser.GameObjects.Graphics;near:boolean;greetUntil:number}[]=[];private nearestNPC=-1;private dialogRole:Role='smith';
 private houses:House[]=[];private nearestHouse=-1;private interiorRole:Role|null=null;private interiorReturn:'village'|'tutorial'='village';
 private interiorLayer:Phaser.GameObjects.Container|null=null;private interiorShade:Phaser.GameObjects.Rectangle|null=null;
 private outdoorArt:(Phaser.GameObjects.GameObject&Phaser.GameObjects.Components.Visible)[]=[];
 private deliveries:Delivery[]=newDeliveries();
 private lines:QuestLine[]=newLines();private questProps:{id:LineId;order:number;point:Point;sprite:Phaser.GameObjects.Image}[]=[];private nearestProp=-1;
 private wisp:Phaser.GameObjects.Image|null=null;private wispFear=0;private wispPath:Point[]=[];private wispPathLeft=0;
 private questView:'trials'|'story'|'delivery'='trials';private questPage=0;
 private mapMode:'local'|'world'='local';private mapFocusRegion:number|null=null;private mapFocusVillage:number|null=null;
 private lessonIndex=0;private lessonProgress=0;private tutorialFinished=false;private wantsTraining=false;
 private storyClosing=false;private storyIndex=0;private storyTime=0;
 private dirty=false;private confirmReturn:GameState='playing';private confirmTarget:'title'|'new'='title';
 private guardLeft=0;private heavyAttack=false;
 private counterTarget=-1;private counterLeft=0;private counterStrike=false;private strikeTarget=-1;
 private activeSkill:SkillId|null=null;private attackPulse=-1;private skillCooldowns:Partial<Record<SkillId,number>>={};private shieldLeft=0;
 private achievementQueue:AchievementId[]=[];private achievementLeft=0;private achievementPage=0;
 private combatMusicLeft=0;private waveClock=WAVE_FIRST;private waveNumber=0;private pruneLeft=1;
 private effects:{x:number;y:number;angle:number;kind:'slash'|'ring'|'thrust';color:number;life:number;max:number;radius:number}[]=[];

 private profile:Profile=newProfile();
 private saved:Snapshot|null=null;
 private storageAvailable=true;
 private audio=new ForestAudio();
 private hp=100;private stamina=100;private flasks=2;private armed=false;
 private ultimate=0;private ultimateLeft=0;private ultimatePulse=0;private ultimateAngle=0;
 private score=0;private kills=0;private deaths=0;private elapsed=0;private animationTime=0;
 private face=0;private velocity:Point={x:0,y:0};private movement:Point={x:1,y:0};
 private mouse:Point|null=null;
 private mouseHeld=false;
 private attackTime=-1;private attackAngle=0;private attackFired=false;private attackHits=new Set<number>();
 private combo=0;private lastAttack=-10;private dodgeLeft=0;private dodgeWait=0;private dodgeVector:Point={x:1,y:0};
 private hurtLeft=0;private hurtFlash=0;private regenDelay=0;private healWait=0;private deathLeft=0;private nextId=1;
 private hudLeft=0;private toastTimeout=0;private checkpoint:Point={x:villagePosition(-1).x+15,y:645};private checkpointBannerLeft=0;
 private nearestChest=-1;private dialogTarget='';private dialogTime=0;
 private shopTab:ShopTab='weapons';private shopPage=0;private menuTab:MenuTab='overview';private menuReturn:GameState='playing';private mapReturn:GameState='playing';
 private equipmentTab:'weapons'|'armors'|'skins'='weapons';private equipmentPage=0;
 private weather:WeatherKind='clear';private weatherLeft=0;private weatherNext=13;
 private wetZones:(Point&{radius:number})[]=[];private strike:Strike|null=null;private strikeNext=2;private slowed=0;
 private introLeft=0;private introBroken=false;private introResume=false;private guideWanted=true;
 private arms:{upper:Phaser.GameObjects.Image;forearm:Phaser.GameObjects.Image;hand:Phaser.GameObjects.Image}[]=[];
 private weaponTrail:Point[]=[];private trailWeapon='';private trailAttack=-1;
 private attackImages:Phaser.GameObjects.Image[]=[];private attackImageCursor=0;
 private biomeMoods:BiomeMood[]=[];private strideDistance=0;private briefingPage=0;
 private hurricane:(Point&{phase:number})|null=null;private windSoundLeft=0;
 private loot:Loot|null=null;private lootLeft=0;
 constructor(){super('GameScene');}
 preload():void{this.load.image('village-atlas',villageAtlas);this.load.image('biome-atlas',biomeAtlas);this.load.image('story-atlas',storyAtlas);this.load.image('creep-atlas',creepAtlas);this.load.image('hero-atlas',heroAtlas);this.load.image('interiors-atlas',interiorsAtlas);this.load.image('details-atlas',detailsAtlas);this.load.image('combat-atlas',combatAtlas);this.load.image('stride-atlas',strideAtlas);this.load.image('resident-atlas',residentAtlas);this.load.image('roll-atlas',rollAtlas);this.load.image('equipment-atlas',equipmentAtlas);this.load.image('armed-motion-atlas',armedMotionAtlas);}
 create():void{
  createArtwork(this);createMysticArtwork(this);createVillageArtwork(this);createAtlasArtwork(this);createCreepyArtwork(this);createHeroArtwork(this);createDetailArtwork(this);createCombatArtwork(this);createEquipmentArtwork(this);createArmedMotionArtwork(this);createStrideArtwork(this);createRollArtwork(this);createResidentArtwork(this);
  try{for(const key of LEGACY_KEYS)localStorage.removeItem(key);this.saved=parseSave(localStorage.getItem(PROFILE_KEY));}catch{this.storageAvailable=false;}
  this.drawWorld();this.outdoorArt=[...this.children.list] as typeof this.outdoorArt;this.gateInk=this.add.graphics().setDepth(700);this.weatherInk=this.add.graphics().setDepth(6);
  this.playerShadow=this.add.ellipse(140,550,35,14,0x09291b,.34).setDepth(8);
  this.player=this.add.image(140,550,'fox').setOrigin(.5,.68).setDisplaySize(92,92).setDepth(20);
  this.arms=Array.from({length:2},()=>({upper:this.add.image(0,0,'arm-upper').setOrigin(.5,0).setVisible(false),forearm:this.add.image(0,0,'arm-bracer').setOrigin(.5,0).setVisible(false),hand:this.add.image(0,0,'hand-grip').setOrigin(.5,.35).setVisible(false)}));
  this.sword=this.add.image(0,0,weaponTexture('sword')).setDisplaySize(100,100).setOrigin(WEAPON_ART.sword.gripX,WEAPON_ART.sword.gripY).setVisible(false).setDepth(21);
  this.armorSprite=this.add.image(140,550,'armor-ranger').setDisplaySize(72,72).setVisible(false).setDepth(22);
  this.combatInk=this.add.graphics().setDepth(500);this.reaperInk=this.add.graphics().setDepth(740);this.reaper=this.add.image(0,0,'weapon-reaper').setDisplaySize(225,225).setDepth(750).setVisible(false);this.stolenWeapon=this.add.image(0,0,weaponTexture('sword')).setDepth(755).setVisible(false);
  if(!this.input.keyboard)throw new Error('Keyboard unavailable');
  this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,SHIFT,J,Q,V,E,P,ESC,ENTER,H,M,F,R,TAB,C,ONE,TWO,THREE') as Record<string,Phaser.Input.Keyboard.Key>;
  this.bindControls();this.configureCamera();this.resetJourney();this.startVillage(-1,true);this.showTitle();
  this.refreshSaveUI();this.scale.on('resize',this.configureCamera,this);
  this.events.once('shutdown',()=>{this.listeners.abort();this.scale.off('resize',this.configureCamera,this);clearTimeout(this.toastTimeout);this.audio.destroy();});
 }
 private element<T extends HTMLElement=HTMLElement>(id:string):T{const e=document.getElementById(id);if(!e)throw new Error(`Missing UI: ${id}`);return e as T;}
 private regionBounds(index:number):Bounds{return{width:regionEnd(index),height:WORLD_HEIGHT,margin:35,top:65,left:regionStart(index)+35};}
 private playerBounds():Bounds{
  if(this.area==='interior')return interiorBounds(housePoint(this.villageIndex,this.interiorRole??'smith'));
  if(this.area!=='biome')return{width:this.area==='tutorial'?PROLOGUE_WIDTH-20:regionStart(this.villageIndex+1)+100,height:WORLD_HEIGHT,margin:35,top:65,left:this.villageIndex<0?35:regionEnd(this.villageIndex)+25};
  const p=this.progress[this.regionIndex];return{width:p.cleared?Math.min(WORLD_WIDTH,regionEnd(this.regionIndex)+ROAD_WIDTH+105):regionEnd(this.regionIndex),height:WORLD_HEIGHT,margin:35,top:65,left:p.bossDead?(this.regionIndex===0?35:regionEnd(this.regionIndex-1)+25):regionStart(this.regionIndex)+35};
 }
 private activeTerrain():Terrain[]{return this.area==='interior'?interiorObstacles(housePoint(this.villageIndex,this.interiorRole??'smith')):this.terrain;}
 private seals():number{return this.progress.filter(p=>p.bossDead).length;}
 private trainingArea():boolean{return this.area==='tutorial'||this.area==='interior'&&this.interiorReturn==='tutorial';}
 private configureCamera():void{
  const cam=this.cameras.main;cam.setBounds(0,0,WORLD_WIDTH,WORLD_HEIGHT);cam.setZoom(this.area==='interior'?Math.min(1.7,this.scale.height/430):Math.max(this.scale.width<700?.82:1,this.scale.height/WORLD_HEIGHT));
  if(this.area==='interior'){const at=housePoint(this.villageIndex,this.interiorRole??'smith');cam.stopFollow();cam.centerOn(at.x,at.y+5);}else if(this.player)cam.startFollow(this.player,true,.11,.11);this.setGuideText();
 }
 private bindControls():void{
  this.listeners=new AbortController();const signal=this.listeners.signal;
  const click=(id:string,fn:()=>void)=>this.element(id).addEventListener('click',fn,{signal});
  click('primary-button',()=>this.primaryAction());click('restart-button',()=>this.requestNew());click('new-button',()=>this.requestNew());
  click('menu-button',()=>this.toggleMenu());click('menu-close',()=>this.toggleMenu());click('pause-button',()=>{if(this.state==='menu'){this.toggleMenu();}this.togglePause();});
  click('help-button',()=>{if(this.state==='menu')this.toggleMenu();this.toggleGuide();});click('guide-close',()=>this.toggleGuide(false));
  click('map-button',()=>this.toggleMap());click('map-close',()=>this.toggleMap());click('fullscreen-button',()=>this.fullscreen());this.keys.F.on('down',()=>this.fullscreen());
  click('save-button',()=>this.saveProgress());click('modal-save',()=>this.saveProgress());click('load-button',()=>this.loadProgress());click('load-start',()=>this.loadProgress());
  click('delete-save',()=>{try{localStorage.removeItem(PROFILE_KEY);this.saved=null;this.refreshSaveUI();this.toast('Ручное сохранение удалено. Текущая игра продолжается.');}catch{this.toast('Браузер не разрешает удалить сохранение.');}});
  for(const b of document.querySelectorAll<HTMLButtonElement>('[data-menu-tab]'))b.addEventListener('click',()=>{this.menuTab=b.dataset.menuTab as MenuTab;this.renderMenu();if(this.menuTab==='equipment')this.lessonEvent('inventory');},{signal});
  for(const b of document.querySelectorAll<HTMLButtonElement>('[data-equipment]'))b.addEventListener('click',()=>{this.equipmentTab=b.dataset.equipment as typeof this.equipmentTab;this.equipmentPage=0;this.renderEquipment();},{signal});
  click('equipment-prev',()=>{this.equipmentPage=Math.max(0,this.equipmentPage-1);this.renderEquipment();});click('equipment-next',()=>{this.equipmentPage++;this.renderEquipment();});
  this.element('equipment-items').addEventListener('click',e=>{const b=e.target instanceof Element?e.target.closest<HTMLButtonElement>('[data-equip]'):null;if(b?.dataset.equip)this.equip(b.dataset.equip);},{signal});
  for(const b of document.querySelectorAll<HTMLButtonElement>('[data-quest-view]'))b.addEventListener('click',()=>{this.questView=b.dataset.questView as typeof this.questView;this.questPage=0;this.renderQuests();},{signal});
  click('quest-prev',()=>{this.questPage=Math.max(0,this.questPage-1);this.renderQuests();});click('quest-next',()=>{this.questPage++;this.renderQuests();});
  this.element('quest-items').addEventListener('click',e=>{const b=e.target instanceof Element?e.target.closest<HTMLButtonElement>('[data-track-quest]'):null;if(b?.dataset.trackQuest)this.trackQuest(b.dataset.trackQuest);},{signal});
  for(const b of document.querySelectorAll<HTMLButtonElement>('[data-map-mode]'))b.addEventListener('click',()=>{this.mapMode=b.dataset.mapMode as typeof this.mapMode;if(this.mapMode==='local'){this.mapFocusRegion=null;this.mapFocusVillage=null;}this.drawMaps();},{signal});
  this.element('map-regions').addEventListener('click',e=>{const b=e.target instanceof Element?e.target.closest<HTMLButtonElement>('[data-map-region]'):null;if(!b||b.disabled)return;this.mapFocusRegion=Number(b.dataset.mapRegion);this.mapFocusVillage=null;this.mapMode='local';this.drawMaps();},{signal});
  click('quest-retry',()=>{const q=this.quests[this.regionIndex].find(q=>q.id==='sprint');if(q&&!q.complete){q.failed=false;q.progress=0;q.elapsed=0;this.dirty=true;this.renderMenu();this.toast('Испытание начнётся после закрытия меню.');}});
  for(const key of ['master','music','effects'] as const)this.element<HTMLInputElement>(`volume-${key}`).addEventListener('input',e=>{this.audio.unlock();this.audio.setSettings({[key]:Number((e.target as HTMLInputElement).value)/100});this.dirty=true;},{signal});
  click('mute-button',()=>{this.audio.unlock();this.audio.setSettings({muted:!this.audio.settings.muted});this.dirty=true;this.renderAudio();});
  click('interact-button',()=>this.interact());click('intro-skip',()=>this.finishIntro());click('loot-close',()=>{if(this.lootLeft>0)return;this.element('loot-overlay').hidden=true;this.state='playing';this.resetInput();});
  this.input.on('pointermove',(p:Phaser.Input.Pointer)=>{if(p.wasTouch||this.state!=='playing')return;this.mouse={x:p.x,y:p.y};});
  this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{if(this.state!=='playing'||p.wasTouch)return;this.audio.unlock();this.mouse={x:p.x,y:p.y};this.updateAim();if(p.button===2){this.secondaryAttack();return;}if(p.button===0){this.mouseHeld=true;this.attack();}});
  this.input.mouse?.disableContextMenu();
  this.input.on('pointerup',()=>{this.mouseHeld=false;});
  window.addEventListener('pointerup',()=>{this.mouseHeld=false;},{signal});
  window.addEventListener('blur',()=>{this.resetInput();if(this.state==='playing')this.togglePause();},{signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){this.resetInput();if(this.state==='playing')this.togglePause();}},{signal});
  click('dialog-trade',()=>this.openShop());click('dialog-road',()=>this.say(resident(this.villageIndex,this.dialogRole).lore));
  click('dialog-combat',()=>this.say(`Впереди ${REGIONS[Math.min(REGIONS.length-1,this.villageIndex+1)].bossName}. Красная метка предупреждает об атаке. C парирует, а точное парирование открывает ЛКМ-контрудар. Меч также парирует на ПКМ; копьё делает тяжёлый выпад; секира бьёт вокруг; посох оставляет печать. Смерть вернёт тебя в последнюю посещённую деревню.`));
  click('dialog-delivery',()=>this.talkDelivery());
  click('travel-open',()=>this.openTravel());click('travel-close',()=>this.closeTravel());
  this.element('travel-items').addEventListener('click',e=>{const b=e.target instanceof Element?e.target.closest<HTMLButtonElement>('[data-travel]'):null;if(b&&!b.disabled)this.travelTo(Number(b.dataset.travel));},{signal});
  this.element('skill-items').addEventListener('click',e=>{const b=e.target instanceof Element?e.target.closest<HTMLButtonElement>('[data-skill], [data-skill-toggle]'):null;if(!b||b.disabled)return;if(b.dataset.skill){this.element('skill-message').textContent=learnSkill(this.profile,b.dataset.skill,this.seals());this.syncAchievements();}else if(b.dataset.skillToggle){toggleSkill(this.profile,b.dataset.skillToggle);this.element('skill-message').textContent='Панель изменена. Перезарядка приёма сохраняется.';}this.dirty=true;this.renderSkills();this.updateHUD();},{signal});
  click('skill-reset',()=>{const points=refundBranch(this.profile,weaponFor(this.profile).style);if(!points)return;this.activeSkill=null;this.attackTime=-1;this.element('skill-message').textContent=`Возвращено ${points} искр. Купленные приёмы сохранены; повторная оплата не нужна.`;this.dirty=true;this.renderSkills();this.updateHUD();});
  click('achievement-prev',()=>{this.achievementPage=Math.max(0,this.achievementPage-1);this.renderAchievements();});click('achievement-next',()=>{this.achievementPage++;this.renderAchievements();});
  click('dialog-skip',()=>{this.dialogTime=this.dialogTarget.length/78+1;this.element('dialog-text').textContent=this.dialogTarget;});click('dialog-quest',()=>this.talkQuest());
  click('dialog-leave',()=>this.leaveDialog());click('shop-close',()=>{this.element('shop-overlay').hidden=true;this.state='dialog';this.element('dialog-overlay').hidden=false;this.say('Снаряжение останется после смерти. Перед закрытием сохрани путешествие вручную.');});
  for(const tab of ['weapons','armors','upgrades','skins','supplies','growth'] as const)click(`tab-${tab}`,()=>{this.shopTab=tab;this.shopPage=0;this.renderShop();});
  click('shop-prev',()=>{this.shopPage=Math.max(0,this.shopPage-1);this.renderShop();});click('shop-next',()=>{this.shopPage++;this.renderShop();});
  click('briefing-next',()=>{if(this.briefingPage<BRIEFING_CARDS.length-1){this.briefingPage++;this.renderBriefing();}else this.startLessons();});click('briefing-start',()=>this.startLessons());
  click('training-yes',()=>this.newJourney(true));click('training-no',()=>this.newJourney(false));click('training-skip',()=>this.finishTutorial());
  click('story-next',()=>this.advanceStory());click('story-skip',()=>this.finishStory());click('quit-button',()=>this.confirmExit('title'));
  click('confirm-cancel',()=>this.cancelExit());click('confirm-save',()=>{const previous=this.state;this.state='paused';this.saveProgress();this.state=previous;if(!this.dirty)this.commitExit();});click('confirm-discard',()=>this.commitExit());
  window.addEventListener('beforeunload',e=>{if(this.dirty){e.preventDefault();e.returnValue='';}},{signal});
  this.element('shop-items').addEventListener('click',e=>{const b=e.target instanceof Element?e.target.closest<HTMLButtonElement>('[data-item]'):null;if(!b?.dataset.item||b.disabled)return;const before=stats(this.profile);this.dirty=true;this.element('shop-message').textContent=this.buyItem(b.dataset.item);this.applyEquipment(before);this.renderShop();this.updateHUD();},{signal});
 }
 update(_time:number,delta:number):void{
  const dt=Math.min(delta,40)/1000;
  const live=this.state==='playing'||this.state==='intro'||this.state==='story';const boss=this.enemies.some(e=>!e.dead&&e.kind==='boss'&&e.region===this.regionIndex);const threat=this.area==='biome'&&this.enemies.some(e=>!e.dead&&e.region===this.regionIndex&&Math.hypot(e.sprite.x-this.player.x,e.sprite.y-this.player.y)<420);this.combatMusicLeft=threat?3:Math.max(0,this.combatMusicLeft-dt);this.audio.update(dt,live,this.weather,this.state==='story'?'story':this.area==='village'||this.area==='interior'?'village':this.area==='biome'&&boss?(this.enemies.some(e=>e.kind==='boss'&&!e.dead&&e.phase2&&e.region===this.regionIndex)?'rage':'boss'):this.combatMusicLeft>0?'combat':'explore');
  if(this.checkpointBannerLeft>0){this.checkpointBannerLeft-=dt;if(this.checkpointBannerLeft<=0)this.element('checkpoint-banner').hidden=true;}
  this.updateAchievementNotice(dt);this.updateTeachingUI();
  if(Phaser.Input.Keyboard.JustDown(this.keys.H))this.toggleGuide();
  if(Phaser.Input.Keyboard.JustDown(this.keys.M))this.toggleMap();
  if(Phaser.Input.Keyboard.JustDown(this.keys.TAB)){this.toggleMenu();return;}
  if(this.state==='story'){this.updateStory(dt);return;}if(this.state==='choice'||this.state==='confirm'||this.state==='briefing')return;
  if(this.state==='travel'){if(Phaser.Input.Keyboard.JustDown(this.keys.ESC))this.closeTravel();return;}
  if(this.state==='menu'){if(Phaser.Input.Keyboard.JustDown(this.keys.ESC))this.toggleMenu();return;}
  if(this.state==='map'){if(Phaser.Input.Keyboard.JustDown(this.keys.ESC))this.toggleMap();return;}
  if(this.state==='dialog'){this.dialogTime+=dt;this.element('dialog-text').textContent=this.dialogTarget.slice(0,Math.floor(this.dialogTime*78));if(Phaser.Input.Keyboard.JustDown(this.keys.ESC))this.leaveDialog();return;}
  if(this.state==='shop'){if(Phaser.Input.Keyboard.JustDown(this.keys.ESC))this.element('shop-close').click();return;}
  if(this.state==='loot'){this.lootLeft-=dt;if(this.lootLeft<=0&&this.loot){this.applyLoot();}return;}
  if(this.state==='intro'){this.updateIntro(dt);return;}
  if(Phaser.Input.Keyboard.JustDown(this.keys.ESC)){if(this.state==='paused')this.togglePause();else this.toggleMenu();return;}
  if(Phaser.Input.Keyboard.JustDown(this.keys.P))this.togglePause();
  if(Phaser.Input.Keyboard.JustDown(this.keys.ENTER)&&this.state!=='playing')this.primaryAction();
  if(this.state==='dying'){this.deathLeft-=dt;this.animationTime+=dt;this.player.setAngle(Math.min(85,(.8-this.deathLeft)*110)).setAlpha(Math.max(.2,this.deathLeft/.8));this.armorSprite.setVisible(false);if(this.deathLeft<=0)this.respawn();return;}
  if(this.state!=='playing')return;
  this.elapsed+=dt;this.animationTime+=dt;this.dirty=true;const p=this.progress[this.regionIndex];if(this.area==='biome'&&!p.cleared)p.elapsed+=dt;
  if(this.area==='biome')advanceQuests(this.quests[this.regionIndex],dt);this.guardLeft=Math.max(0,this.guardLeft-dt);this.counterLeft=Math.max(0,this.counterLeft-dt);if(this.counterLeft===0)this.counterTarget=-1;this.shieldLeft=Math.max(0,this.shieldLeft-dt);for(const id of Object.keys(this.skillCooldowns) as SkillId[])this.skillCooldowns[id]=Math.max(0,(this.skillCooldowns[id]??0)-dt);this.effects=this.effects.filter(e=>(e.life-=dt)>0);
  this.dodgeLeft=Math.max(0,this.dodgeLeft-dt);this.dodgeWait=Math.max(0,this.dodgeWait-dt);this.hurtLeft=Math.max(0,this.hurtLeft-dt);this.hurtFlash=Math.max(0,this.hurtFlash-dt);this.regenDelay=Math.max(0,this.regenDelay-dt);this.healWait=Math.max(0,this.healWait-dt);this.slowed=Math.max(0,this.slowed-dt);
  const weapon=this.currentAttackSpec();
  if(this.attackTime>=0){this.attackTime+=dt;if(this.attackTime>=weapon.duration){this.attackTime=-1;this.activeSkill=null;this.counterStrike=false;}}
  if(this.regenDelay<=0&&this.attackTime<0&&this.dodgeLeft===0)this.stamina=Math.min(stats(this.profile).maxStamina,this.stamina+stats(this.profile).staminaRegen*dt);
  this.updateAim();if(this.keys.J.isDown||this.mouseHeld)this.attack();
  if(Phaser.Input.Keyboard.JustDown(this.keys.SPACE)||Phaser.Input.Keyboard.JustDown(this.keys.SHIFT))this.dodge();
  if(Phaser.Input.Keyboard.JustDown(this.keys.C))this.parry();for(const [i,key]of ['ONE','TWO','THREE'].entries())if(Phaser.Input.Keyboard.JustDown(this.keys[key]))this.useSkill(i+1);
  if(Phaser.Input.Keyboard.JustDown(this.keys.Q))this.heal();if(Phaser.Input.Keyboard.JustDown(this.keys.V))this.heal(true);if(Phaser.Input.Keyboard.JustDown(this.keys.R))this.useUltimate();if(Phaser.Input.Keyboard.JustDown(this.keys.E))this.interact();
  if(this.state!=='playing')return;
  this.movePlayer(dt);this.updateAim();if(this.area==='biome')this.updateWeather(dt);
  if(this.area==='biome'&&!p.spawned&&p.elapsed>=REGIONS[this.regionIndex].bossTime)this.spawnBoss();
  this.updateWaves(dt);this.updateEnemies(dt);this.updateHazards(dt);this.updateProjectiles(dt);this.resolveAttack();this.updateUltimate(dt);this.collectCoins();this.updateWisp(dt);
  if(this.state!=='playing')return;
  if(this.area==='tutorial'){if(this.lessonIndex===0&&this.player.x>285)this.lessonEvent('move');if(this.tutorialFinished){this.finishTutorial();return;}}
  this.checkProgress();this.updateCamp();this.drawActors();this.drawGates();
  this.hudLeft-=dt;if(this.hudLeft<=0){this.updateHUD();this.hudLeft=.09;}
 }
 private drawWorld():void{
  const road=this.add.graphics().setDepth(1);
  for(let i=0;i<REGIONS.length;i++){
   const start=regionStart(i),region=REGIONS[i],floor=this.add.image(start,0,background(this,REGION_WIDTH,WORLD_HEIGHT,i+1,region.palette)).setOrigin(0).setDepth(0),terrainImages:Phaser.GameObjects.Image[]=[];
   road.lineStyle(86,0xcbb991,.19);road.beginPath();road.moveTo(start,550);road.lineTo(start+210,550);road.lineTo(start+500,473);road.lineTo(start+870,627);road.lineTo(start+REGION_WIDTH,550);road.strokePath();
   biomeGround(this,start,i,REGION_WIDTH,WORLD_HEIGHT,region.palette);
   const terrain=regionTerrain(i,start,REGION_WIDTH,WORLD_HEIGHT);this.terrainByRegion.push(terrain);this.terrain.push(...terrain);
   this.nav.push(makeGrid(terrain,this.regionBounds(i),1,20));this.bossNav.push(makeGrid(terrain,this.regionBounds(i),1,35));
   for(const t of terrain){if(Math.abs(t.x-(start+REGION_WIDTH*.65))<1&&Math.abs(t.y-WORLD_HEIGHT*.25)<1)continue;
    terrainImages.push(this.add.image(t.x,t.y,t.kind).setOrigin(.5,t.kind==='tree'?.82:t.kind==='stump'?.61:.5).setDisplaySize(t.kind==='tree'?125:t.kind==='puddle'?t.radius*2.5:82,t.kind==='tree'?125:t.kind==='puddle'?t.radius*2.5:82).setDepth(t.kind==='puddle'?2:10+t.y*.01));
   }
   this.biomeMoods.push(createBiomeMood(this,floor,terrainImages,start,REGION_WIDTH,WORLD_HEIGHT,i));
   this.add.text(start+106,435,`${i+1} · ${region.name}`,{fontFamily:'system-ui',fontSize:'15px',color:'#e8d299',backgroundColor:'#1e3f31',padding:{x:12,y:7}}).setDepth(3);
  }
  for(let i=-1;i<REGIONS.length-1;i++){
   const center=villagePosition(i),left=i<0?0:regionEnd(i),width=i<0?PROLOGUE_WIDTH:ROAD_WIDTH,palette=REGIONS[Math.max(0,i)].palette;
   this.add.image(left,0,background(this,width,WORLD_HEIGHT,31+i,palette)).setOrigin(0).setDepth(0);
   road.lineStyle(100,0xd3bf86,.24);road.lineBetween(left,550,left+width,550);road.lineStyle(42,0xcbb691,.30);road.lineBetween(center.x-205,415,center.x-205,950);road.lineBetween(center.x+205,415,center.x+205,950);
   this.add.text(center.x,480,VILLAGE_NAMES[i+1],{fontFamily:'system-ui',fontSize:'21px',color:'#f3e1ac',backgroundColor:'#163a30',padding:{x:15,y:8}}).setOrigin(.5).setDepth(10);
   for(const [n,person]of PEOPLE.entries()){
    const at=housePoint(i,person.role),door={x:at.x,y:at.y+130};
    const roof=this.add.image(at.x,at.y,`building-${n}`).setDisplaySize(240,303).setDepth(10);
    const label=this.add.text(door.x,door.y+6,houseName(i,person.role),{fontFamily:'system-ui',fontSize:'13px',color:'#f0e1b3',backgroundColor:'#15362acc',padding:{x:7,y:4}}).setOrigin(.5).setDepth(12);
    this.houses.push({village:i,role:person.role,...at,door,roof,label});this.terrain.push({kind:'ruin',...at,radius:94});
    const sprite=this.add.image(at.x+15,at.y-27,resident(i,person.role).texture).setDisplaySize(86,86).setDepth(20+(at.y-27)*.01).setVisible(false);const gesture=this.add.graphics();this.villagers.push({village:i,role:person.role,sprite,gesture,near:false,greetUntil:0});if(i>=0&&person.role==='smith')this.merchants.push(sprite);
    if(person.role==='smith'){const ember=this.add.image(at.x-56,at.y+40,'fire').setDisplaySize(24,30).setAlpha(.65).setDepth(11);this.tweens.add({targets:ember,alpha:.95,yoyo:true,repeat:-1,duration:450+i*13});}
   }
   for(const [key,dx,y,size]of [['village-well',-85,442,100],['village-wagon',-300,595,132],['village-shrine',290,660,110],['village-board',95,410,100]] as const){
    this.add.image(center.x+dx,y,key).setDisplaySize(size,size).setDepth(9);
    if(key==='village-well'||key==='village-wagon')this.terrain.push({kind:'ruin',x:center.x+dx,y:y+16,radius:key==='village-well'?28:40});
   }
   const garden=this.add.graphics().setDepth(4);
   for(let n=0;n<80;n++){const side=n%2?1:-1,x=center.x+side*(280+(n*47%75)),y=190+(n*59%720);garden.lineStyle(1,0x426c43,.8);garden.lineBetween(x,y,x-2,y-7);garden.fillStyle(n%3?0xd9c18d:0xb48ab0,.85);garden.fillCircle(x-2,y-8,2);}
   const detail=this.add.graphics().setDepth(4);detail.lineStyle(4,0xb29c76,.65);for(let n=0;n<7;n++){const x=center.x-97+n*32;detail.lineBetween(x,688,x,726);}detail.lineBetween(center.x-102,705,center.x+102,705);
   for(const side of [-1,1]){detail.fillStyle(0xead085,.12);detail.fillCircle(center.x+side*142,545,33);detail.lineStyle(3,0x6d563e,1);detail.lineBetween(center.x+side*142,520,center.x+side*142,580);detail.fillStyle(0xf3d796,.85);detail.fillRoundedRect(center.x+side*142-8,515,16,22,4);}
   this.fires.push(this.add.image(center.x+15,655,'fire').setDisplaySize(64,64).setDepth(15));
   this.add.text(left+width-90,500,'ВОСТОК →',{fontFamily:'system-ui',fontSize:'13px',color:'#cfdfc9'}).setOrigin(.5).setDepth(11);
  }
 }
  private freePosition(index:number,radius:number,away=0): Point {
    const bounds=this.regionBounds(index),terrain=this.terrainByRegion[index];
    for(let n=0;n<100;n++){
      const point={x:Phaser.Math.FloatBetween(regionStart(index)+110,regionEnd(index)-105),y:Phaser.Math.FloatBetween(140,WORLD_HEIGHT-130)};
      if(freePoint(point,radius+8,terrain,bounds)&&Math.hypot(point.x-this.player.x,point.y-this.player.y)>away)return point;
    }
    const grid=radius>25?this.bossNav[index]:this.nav[index];const id=grid.free.findIndex(Boolean);
    return {x:grid.originX+(id%grid.cols+.5)*grid.cell,y:(Math.floor(id/grid.cols)+.5)*grid.cell};
  }

  private predict(e:Enemy): Point {
    const d=Math.hypot(e.sprite.x-this.player.x,e.sprite.y-this.player.y),speed=Math.hypot(this.velocity.x,this.velocity.y);
    const time=speed?Math.min(.6+e.id%3*.08,d/450,150/speed):0;
    return clampPoint({x:this.player.x+this.velocity.x*time,y:this.player.y+this.velocity.y*time},this.enemyBounds(e));
  }
  private walkEnemy(e:Enemy,target:Point,speed:number,dt:number): void {
    let aim=target;const bounds=this.enemyBounds(e),terrain=this.terrainByRegion[e.region],grid=e.kind==='boss'?this.bossNav[e.region]:this.nav[e.region];
    if(!clearLine(e.sprite,target,e.radius,terrain,bounds)){
      if(e.nextPath<=0){e.path=findPath(e.sprite,target,grid);e.nextPath=PATH_INTERVAL;}
      while(e.path.length>1&&(Math.hypot(e.sprite.x-e.path[0].x,e.sprite.y-e.path[0].y)<14||clearLine(e.sprite,e.path[1],e.radius,terrain,bounds)))e.path.shift();
      if(e.path.length)aim=e.path[0];
    }else{e.path=[];e.nextPath=0;}
    const dx=aim.x-e.sprite.x,dy=aim.y-e.sprite.y,len=Math.hypot(dx,dy)||1,travel=Math.min(speed*dt,len);
    if(e.mode==='chase')e.aim={x:dx/len,y:dy/len};
    const moved=moveCircle(e.sprite,dx/len*travel,dy/len*travel,e.radius,terrain,bounds);e.sprite.setPosition(moved.x,moved.y).setFlipX(dx<0);
  }
  private fullscreen(): void {
    const operation=document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();
    operation?.catch(()=>this.toast('Игра уже занимает всю страницу. Полный экран недоступен в этом браузере.'));
  }
  private particles(x:number,y:number,count:number,color:number): void {
    for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,d=15+Math.random()*50;const dot=this.add.circle(x,y,2+Math.random()*2,color,.9).setDepth(600);this.tweens.add({targets:dot,x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,alpha:0,scale:.2,duration:250+Math.random()*220,onComplete:()=>dot.destroy()});}
  }
  private popup(x:number,y:number,text:string,color:string): void {const label=this.add.text(x,y-35,text,{fontFamily:'system-ui',fontSize:'17px',fontStyle:'bold',color,stroke:'#203329',strokeThickness:3}).setOrigin(.5).setDepth(650);this.tweens.add({targets:label,y:y-85,alpha:0,duration:700,onComplete:()=>label.destroy()});}
  private toast(text:string): void {const t=this.element('toast');t.textContent=text;t.classList.add('visible');window.clearTimeout(this.toastTimeout);this.toastTimeout=window.setTimeout(()=>t.classList.remove('visible'),3200);}
  private resetWeather(): void {this.weather='clear';this.weatherLeft=0;this.weatherNext=12+Math.random()*9;this.wetZones=[];this.strike=null;this.hurricane=null;this.strikeNext=2;this.windSoundLeft=0;this.slowed=0;this.weatherInk?.clear();}
  private groundSpeed(at:Point,player:boolean): number {
    if(player&&this.slowed>0)return .3;
    if(player&&this.hazards.some(h=>h.kind==='curse'&&h.warning<=0&&Math.hypot(at.x-h.x,at.y-h.y)<h.radius))return .78;
    const wet=this.terrain.some(t=>t.kind==='puddle'&&Math.hypot(at.x-t.x,at.y-t.y)<t.radius)||this.wetZones.some(t=>Math.hypot(at.x-t.x,at.y-t.y)<t.radius);
    return wet?player?Math.min(.96,.68+this.profile.upgrades.boots*.14):.62:1;
  }
  private drawWeather(): void {
  const g=this.weatherInk;g.clear();if(this.weather==='clear')return;
  for(const z of this.wetZones){g.fillStyle(0x71b5be,.12);g.fillCircle(z.x,z.y,z.radius);g.lineStyle(1,0xade6e4,.3);g.strokeCircle(z.x,z.y,z.radius);}
  const v=this.cameras.main.worldView;
  if(this.weather==='rain'||this.weather==='storm'){g.lineStyle(1,0xa9b8c8,.42);for(let i=0;i<75;i++){const x=v.x+(i*83+this.animationTime*110)%v.width,y=v.y+(i*151+this.animationTime*410)%v.height;g.lineBetween(x,y,x-7,y+17);}}
  if(this.weather==='meteors'){for(let n=0;n<14;n++){const x=v.x+(n*157+this.animationTime*67)%v.width,y=v.y+(n*109+this.animationTime*45)%v.height;g.fillStyle(0xc77451,.4);g.fillCircle(x,y,1.7);}}
  if(this.hurricane){const z=this.hurricane;g.fillStyle(0x766e88,.08);g.fillCircle(z.x,z.y,HURRICANE_RADIUS);g.lineStyle(2,0xb0a2ba,.5);g.strokeCircle(z.x,z.y,HURRICANE_RADIUS);this.drawCombatImage('fx-hurricane',z.x,z.y-25,240,Math.sin(this.animationTime*.8)*.12,.80);for(let n=0;n<16;n++){const a=this.animationTime*3+n*.8,r=25+n*5;g.fillStyle(n%2?0x9a9c85:0x66606f,.6);g.fillEllipse(z.x+Math.cos(a)*r,z.y+Math.sin(a)*r*.65,5,2);}}
  if(this.strike){const z=this.strike;g.fillStyle(z.phase==='impact'?0xc8efff:0xc34c48,z.phase==='impact'?.55:.12+Math.sin(this.animationTime*16)*.05);g.fillCircle(z.x,z.y,LIGHTNING_RADIUS);g.lineStyle(3,z.phase==='impact'?0xe7faff:0xff8572,.85);g.strokeCircle(z.x,z.y,LIGHTNING_RADIUS);
   if(z.phase==='warning'){g.lineStyle(2,0xffd39b,.8);g.strokeCircle(z.x,z.y,LIGHTNING_RADIUS*(1-z.left/LIGHTNING_WARNING));}else{g.lineStyle(6,0xe6edff,.9);g.beginPath();g.moveTo(z.x-10,z.y-190);g.lineTo(z.x+8,z.y-115);g.lineTo(z.x-10,z.y-85);g.lineTo(z.x,z.y);g.strokePath();}}
 }

 private newJourney(training=false):void{this.resetJourney();this.guideWanted=true;this.wantsTraining=training;this.dirty=true;this.startVillage(-1,true);this.beginStory(false);}

 private clearActors():void{
  this.clearReaper();this.hideArms();this.weaponTrail=[];for(const image of this.attackImages)image.setVisible(false);
  this.clearInterior();this.counterTarget=-1;this.counterLeft=0;this.counterStrike=false;this.activeSkill=null;this.skillCooldowns={};this.shieldLeft=0;
  for(const q of this.questProps)q.sprite.destroy();this.questProps=[];this.wisp?.destroy();this.wisp=null;this.effects=[];
  for(const e of this.enemies){this.tweens.killTweensOf(e.sprite);e.sprite.destroy();e.shadow.destroy();}for(const c of this.coins)c.sprite.destroy();for(const c of this.chests)c.sprite.destroy();
  this.enemies=[];this.coins=[];this.chests=[];this.projectiles=[];this.hazards=[];this.ultimateLeft=0;
 }
 private startRegion(index:number,respawn=false,preserve=false):void{
  this.clearInterior();this.area='biome';this.regionIndex=index;this.configureCamera();this.waveClock=WAVE_FIRST;this.waveNumber=0;this.combatMusicLeft=0;this.element('training-panel').hidden=true;this.updateTeachingUI();
  if(!preserve){this.progress[index]={coins:0,elapsed:0,spawned:false,bossDead:false,cleared:false,income:this.progress[index]?.income??0,rewarded:this.progress[index]?.rewarded??false};const old=this.quests[index];this.quests[index]=newQuests(index).map(q=>old?.find(v=>v.id===q.id&&v.complete)??q);
   for(const e of this.enemies.filter(e=>e.region===index)){this.tweens.killTweensOf(e.sprite);e.sprite.destroy();e.shadow.destroy();}this.enemies=this.enemies.filter(e=>e.region!==index);
   for(const c of this.coins.filter(c=>c.region===index))c.sprite.destroy();this.coins=this.coins.filter(c=>c.region!==index);
   for(const group of REGIONS[index].roster)for(let n=0;n<group.count;n++)this.spawnEnemy(group.kind,index,n);for(let n=0;n<7;n++)this.spawnCoin(index,n===0);
  }
  this.projectiles=[];this.hazards=[];this.effects=[];this.guardLeft=0;this.counterLeft=0;this.counterTarget=-1;this.counterStrike=false;this.activeSkill=null;this.shieldLeft=0;this.combo=0;this.lastAttack=this.elapsed-10;this.healWait=0;this.regenDelay=0;this.resetWeather();this.resetInput();this.mouse=null;this.attackTime=-1;this.ultimateLeft=0;this.ultimate=0;
  this.dodgeLeft=0;this.dodgeWait=0;this.hurtLeft=2;this.hurtFlash=0;this.face=0;this.movement={x:1,y:0};this.armed=preserve&&this.progress[index].coins>=REGIONS[index].awaken;this.profile.blade=this.armed;
  this.player.setTexture(this.profile.skin).setAlpha(1).clearTint().setAngle(0).setScale(72/128).setFlipX(false);
  if(respawn)this.player.setPosition(regionStart(index)+100,588);const at=clampPoint(this.player,this.playerBounds());this.player.setPosition(at.x,at.y);this.cameras.main.centerOn(at.x,at.y);
  this.state='playing';this.audio.setRegion(index);this.makeQuestProps();this.drawGates();this.drawActors();this.updateHUD();
  if(!respawn&&!preserve)this.beginIntro(true);
 }

 private beginIntro(resume:boolean):void{
  this.audio.unlock();this.state='intro';this.introLeft=INTRO_DURATION;this.introBroken=false;this.introResume=resume;this.resetInput();this.armed=true;
  this.clearReaper();this.reaper.setVisible(true).setAlpha(0).setPosition(this.player.x+270,this.player.y-145);
  const w=weaponFor(this.profile),art=WEAPON_ART[w.id];this.stolenWeapon.setTexture(weaponTexture(w.id)).clearTint().setDisplaySize(art.size,art.size).setOrigin(art.gripX,art.gripY);
  this.element('intro-overlay').hidden=false;this.syncGuide();this.element('intro-tag').textContent=REGIONS[this.regionIndex].name;
  this.element('intro-title').textContent=resume?'Страж следующей печати.':'В тумане кто-то ждёт тебя.';
  this.element('intro-text').textContent=`${w.name} хранит твою память. Призрак печати пришёл разорвать её связь с оружием.`;
  this.checkpointBannerLeft=0;this.element('checkpoint-banner').hidden=true;this.audio.play('howl');this.drawActors();
 }
 private clearReaper():void{this.reaper?.setVisible(false).setAlpha(0);this.stolenWeapon?.setVisible(false);this.reaperInk?.clear();}
 private updateIntro(dt:number):void{
  this.introLeft-=dt;this.animationTime+=dt;const t=INTRO_DURATION-this.introLeft;
  const approach=Math.min(1,t/1.5),ease=1-(1-approach)**3,leave=Math.max(0,t-3.3);
  this.reaper.setPosition(this.player.x+270-175*ease+leave*38,this.player.y-145+85*ease-leave*28+Math.sin(t*4)*7).setAlpha(Math.min(1,t/.65)*Math.max(0,1-leave/2.7)).setRotation(Math.sin(t*2)*.035);
  if(t>=WEAPON_BREAK_AT&&!this.introBroken){this.introBroken=true;this.armed=false;this.profile.blade=false;this.stolenWeapon.setVisible(false);this.audio.play('crack');this.cameras.main.shake(240,.005);this.particles(this.reaper.x+43,this.reaper.y-24,32,0xa6eaf1);
   this.element('intro-title').textContent='Он расколол оружие, но не твою клятву.';this.element('intro-text').textContent=`Собери ${REGIONS[this.regionIndex].awaken} осколков собственной души. Они восстановят выбранное оружие. Разорви печать босса, чтобы вернуть силу и продолжить путь к семье.`;
  }
  this.drawActors();this.drawGates();const g=this.reaperInk;g.clear();
  if(t<5.9){const fade=this.reaper.alpha;g.fillStyle(0x12132a,.13*fade);g.fillEllipse(this.reaper.x,this.reaper.y+44,165,75);g.lineStyle(2,0x9dcfe9,.24*fade);g.strokeEllipse(this.reaper.x,this.reaper.y+52,116,36);
   for(let i=0;i<9;i++){const a=t*1.6+i*.7,x=this.reaper.x+Math.cos(a)*(50+i*5),y=this.reaper.y+Math.sin(a*.8)*(30+i*3);g.fillStyle(i%2?0x94d6e0:0x50678e,.2*fade);g.fillCircle(x,y,3+i*.7);}
  }
  if(t>=WEAPON_STEAL_AT&&!this.introBroken){const f=Math.min(1,(t-WEAPON_STEAL_AT)/(WEAPON_BREAK_AT-WEAPON_STEAL_AT)),hand={x:this.reaper.x+45,y:this.reaper.y-24};this.sword.setVisible(false);
   this.stolenWeapon.setVisible(true).setPosition(Phaser.Math.Linear(this.player.x+22,hand.x,f),Phaser.Math.Linear(this.player.y+5,hand.y,f)-Math.sin(f*Math.PI)*32).setRotation(.98+f*2.6).setAlpha(1);
   g.lineStyle(3,0xbceef6,.5);g.beginPath();g.moveTo(this.player.x,this.player.y-12);for(let n=1;n<=12;n++){const u=n/12,v=1-u;g.lineTo(v*v*this.player.x+2*v*u*(this.player.x+90)+u*u*hand.x,v*v*(this.player.y-12)+2*v*u*(this.player.y-75)+u*u*hand.y);}g.strokePath();
   if(t>=1.5){this.element('intro-title').textContent='Призрак вырывает твою силу.';this.element('intro-text').textContent='Он ломает любое оружие, которое ты принёс. Его нельзя остановить клинком: сначала верни себе осколки памяти.';}
  }
  if(this.introLeft<=0)this.finishIntro();
 }
 private finishIntro():void{
  if(this.state!=='intro')return;this.clearReaper();this.sword.setVisible(false);this.armed=false;this.profile.blade=false;this.element('intro-overlay').hidden=true;this.state='playing';this.resetInput();this.hurtLeft=2;
  this.toast('Туман сомкнулся. Верни силу и победи хозяина печати.');this.syncGuide();this.updateHUD();
 }
 private reachCheckpoint(name:string):void{
  this.element('checkpoint-name').textContent=name;this.element('checkpoint-banner').hidden=false;this.checkpointBannerLeft=2.7;this.audio.play('checkpoint');
 }
 private respawn():void{
  const index=this.regionIndex,done={...this.progress[index]},tutorial=this.area==='tutorial';
  if(tutorial){this.hp=stats(this.profile).maxHP;this.player.setPosition(210,550);this.state='playing';this.player.setAlpha(1).setAngle(0);this.hurtLeft=2;this.toast('Учебный костёр вернул тебя. Продолжай текущий урок.');return;}
  if(!done.cleared){this.resetAttemptRewards(index);this.startRegion(index,true);}else this.progress[index]=done;
  this.startVillage(this.lastVillage,true);this.syncAchievements();this.toast('Ты вернулся в последнюю посещённую деревню. Купи снаряжение или поговори с лекарем перед новой попыткой.');
 }

 private resetAttemptRewards(index:number):void{
  for(const chest of this.chests.filter(c=>c.region===index))chest.sprite.destroy();
  this.chests=this.chests.filter(c=>c.region!==index);this.quests[index]=newQuests(index);
  if(this.profile.trackedQuest.startsWith('trial:'))this.profile.trackedQuest='';
 }
 private enemyProjectile(e:Enemy):string{
  const kind=e.kind==='boss'?REGIONS[e.region].bossTexture:e.kind;
  return e.move==='breath'||kind==='dragon'?'shot-fire':kind==='vampire'?'shot-bat':kind==='alchemist'||kind==='zombie'?'shot-acid':kind==='skeleton'||kind==='archer'?'shot-bone':kind==='knight'&&e.region===4?'shot-ice':kind==='wraith'||kind==='shade'?'shot-shadow':'shot-violet';
 }
 private drawCombatImage(key:string,x:number,y:number,size:number,angle=0,alpha=1):void{
  let image=this.attackImages[this.attackImageCursor];if(!image){image=this.add.image(x,y,key).setDepth(510);this.attackImages.push(image);}
  this.attackImageCursor++;image.setTexture(key).setVisible(true).setPosition(x,y).setDisplaySize(size,size).setRotation(angle).setAlpha(Math.max(0,Math.min(1,alpha))).clearTint();
 }
 private weatherHitEnemies(at:Point,radius:number,damage:number):void{
  for(const e of this.enemies)if(!e.dead&&e.region===this.regionIndex&&Math.hypot(e.sprite.x-at.x,e.sprite.y-at.y)<radius+e.radius){e.hp=Math.max(0,e.hp-damage);e.flash=.2;e.stun=Math.max(e.stun,e.kind==='boss'?.25:.6);if(e.hp===0)this.killEnemy(e);}
 }
 private spawnEnemy(kind:EnemyKind,index:number,variant=0,point?:Point):Enemy{
  const r=REGIONS[index],boss=kind==='boss',pos=point??this.freePosition(index,boss?34:20,310),key=boss?r.bossTexture:kind;
  const baseHP:Record<EnemyKind,number>={skeleton:64,zombie:94,necromancer:78,vampire:92,dragon:138,wraith:100,knight:140,archer:65,alchemist:84,shade:96,gargoyle:155,boss:r.bossHP};
  const hp=boss?r.bossHP:baseHP[kind]+index*(kind==='skeleton'?14:kind==='dragon'||kind==='knight'?24:18),size=boss?148:kind==='dragon'?103:kind==='zombie'||kind==='knight'?83:78;
  const sprite=this.add.image(pos.x,pos.y,key).setDisplaySize(size,size).setDepth(20+pos.y*.01),shadow=this.add.ellipse(pos.x,pos.y+(boss?36:21),boss?66:kind==='dragon'?53:35,boss?22:14,0x092a27,.32).setDepth(8);
  const e:Enemy={id:this.nextId++,region:index,kind,variant,sprite,shadow,hp,maxHP:hp,radius:boss?34:kind==='dragon'?25:20,
   damage:(boss?23+index*4:kind==='skeleton'||kind==='archer'?14+index*2:kind==='zombie'||kind==='knight'||kind==='gargoyle'?17+index*2:kind==='vampire'||kind==='dragon'||kind==='shade'?16+index*2:11+index*2)*(index===2?THIRD_BIOME_DAMAGE:1),
   reward:boss?BOSS_REWARD+index*13:kind==='skeleton'?5+index:kind==='zombie'?6+index*2:kind==='dragon'?12+index*2:9+index*2,
   speed:r.speed*(boss?.95:kind==='zombie'?.70:kind==='necromancer'||kind==='alchemist'?.72:kind==='vampire'||kind==='shade'?1.18:kind==='gargoyle'?.76:kind==='dragon'?.88:kind==='knight'?.90:1),
   mode:'chase',clock:1.7+variant*.22,nextPath:0,path:[],aim:{x:1,y:0},target:{...pos},hasHit:false,stun:0,flash:0,phase2:false,dead:false,move:'slash',moveIndex:variant,training:false,chain:0,bleed:0,bleedTick:1,recoil:0,voiceLeft:0};
  this.enemies.push(e);return e;
 }
 private updateWaves(dt:number):void{
  this.pruneLeft-=dt;if(this.pruneLeft<=0){this.pruneLeft=1;this.enemies=this.enemies.filter(e=>{if(!e.dead||e.sprite.visible)return true;e.sprite.destroy();e.shadow.destroy();return false;});}
  if(this.area!=='biome'||this.progress[this.regionIndex].bossDead)return;
  this.waveClock-=dt;const active=this.enemies.filter(e=>e.region===this.regionIndex&&!e.dead&&e.kind!=='boss').length,cap=Math.min(MAX_MINIONS,12+this.regionIndex);
  if(this.waveClock>0&&active>0)return;this.waveClock=Math.max(5,9-this.regionIndex*.45);this.waveNumber++;
  const roster=REGIONS[this.regionIndex].roster.flatMap(g=>Array.from({length:g.count},()=>g.kind));
  for(let n=0;n<Math.min(WAVE_SIZE,cap-active);n++){
   const kind=roster[(this.waveNumber*3+n)%roster.length],at=this.freePosition(this.regionIndex,kind==='dragon'?25:20,240),e=this.spawnEnemy(kind,this.regionIndex,this.waveNumber+n,at);e.stun=.95;e.clock=1.2;
   this.hazards.push({...at,region:this.regionIndex,radius:32,warning:.9,left:1.2,damage:0,kind:'ring',fired:false});this.particles(at.x,at.y,5,REGIONS[this.regionIndex].fog);
  }
 }
 private spawnBoss():void{
  const p=this.progress[this.regionIndex];if(p.spawned||p.bossDead)return;p.spawned=true;
  const boss=this.spawnEnemy('boss',this.regionIndex,0,this.freePosition(this.regionIndex,35,310));boss.voiceLeft=1.2;boss.stun=.7;this.audio.play('boss');this.audio.play('roar');
  this.toast(`${REGIONS[this.regionIndex].bossName} пробудился. Несколько приёмов, вторая фаза на половине HP.`);this.cameras.main.shake(180,.0025);this.updateHUD();
 }
 private spawnCoin(index:number,near=false,point?:Point):void{
  let pos=point??this.freePosition(index,PLAYER_RADIUS,50);
  if(near){const at={x:regionStart(index)+260,y:WORLD_HEIGHT/2};if(freePoint(at,30,this.terrainByRegion[index],this.regionBounds(index)))pos=at;}
  this.coins.push({region:index,sprite:this.add.image(pos.x,pos.y,'soul').setDisplaySize(45,45).setDepth(9),value:1,phase:Math.random()*6.28});
 }
 private updateAim():void{
  if(this.attackTime>=0||this.dodgeLeft>0)return;
  if(this.mouse){const at=this.cameras.main.getWorldPoint(this.mouse.x,this.mouse.y);if(Math.hypot(at.x-this.player.x,at.y-this.player.y)>8)this.face=Math.atan2(at.y-this.player.y,at.x-this.player.x);}
 }
 private movePlayer(dt:number):void{
  let x=0,y=0;if(this.keys.LEFT.isDown||this.keys.A.isDown)x--;if(this.keys.RIGHT.isDown||this.keys.D.isDown)x++;if(this.keys.UP.isDown||this.keys.W.isDown)y--;if(this.keys.DOWN.isDown||this.keys.S.isDown)y++;
  const len=Math.hypot(x,y);if(len>.05){x/=Math.max(1,len);y/=Math.max(1,len);this.movement={x:x/(Math.hypot(x,y)||1),y:y/(Math.hypot(x,y)||1)};if(this.attackTime<0&&!this.mouse)this.face=Math.atan2(y,x);}
  if(this.dodgeLeft>0){x=this.dodgeVector.x;y=this.dodgeVector.y;}
  const speed=stats(this.profile).speed*(this.dodgeLeft>0?2.7:this.attackTime>=0?.40:1)*this.groundSpeed(this.player,true);
  const before={x:this.player.x,y:this.player.y},moved=moveCircle(before,x*speed*dt,y*speed*dt,PLAYER_RADIUS,this.activeTerrain(),this.playerBounds());this.player.setPosition(moved.x,moved.y);
  this.strideDistance+=Math.hypot(moved.x-before.x,moved.y-before.y);
  this.velocity=dt>0?{x:(moved.x-before.x)/dt,y:(moved.y-before.y)/dt}:{x:0,y:0};
  this.audio.footstep(this.groundSpeed(this.player,true)<1?'water':this.area==='interior'?'stone':REGIONS[this.regionIndex].ground,Math.hypot(this.velocity.x,this.velocity.y)>15&&this.dodgeLeft<=0);
  if(this.dodgeLeft>0&&Math.floor(this.animationTime*45)%3===0){const ghost=this.add.image(this.player.x,this.player.y,this.player.texture.key).setOrigin(.5,.68).setDisplaySize(92,92).setAlpha(.20).setDepth(9);this.tweens.add({targets:ghost,alpha:0,duration:150,onComplete:()=>ghost.destroy()});}
 }
 private currentAttackSpec():ReturnType<typeof attackSpec>&{pulses:number}{
  if(this.counterStrike)return{reach:170,arc:.70,cost:20,windup:.10,activeEnd:.27,duration:.58,multiplier:2.6,step:0,pulses:1};
  if(this.activeSkill)return skillAttack(this.activeSkill);
  const a=attackSpec(this.profile,this.heavyAttack,this.combo);
  if(weaponFor(this.profile).style==='axe'&&!this.heavyAttack&&this.combo===1)return{...a,arc:.50,reach:a.reach+12,multiplier:1.35,pulses:1};
  return{...a,pulses:1};
 }
 private attack():void{
  if(this.state!=='playing')return;const w=weaponFor(this.profile);
  if(!this.armed){if(!this.mouseHeld)this.toast(`Нужно ${REGIONS[this.regionIndex].awaken} осколков силы, чтобы восстановить оружие.`);return;}
  if(this.attackTime>=0||this.dodgeLeft>0||this.guardLeft>0||this.ultimateLeft>0)return;
  const counter=this.enemies.find(e=>e.id===this.counterTarget&&!e.dead);
  if(counter&&this.counterLeft>0&&this.stamina>=20&&Math.hypot(counter.sprite.x-this.player.x,counter.sprite.y-this.player.y)<240&&clearLine(this.player,counter.sprite,3,this.activeTerrain(),this.playerBounds())){
   this.face=Math.atan2(counter.sprite.y-this.player.y,counter.sprite.x-this.player.x);const distance=Math.hypot(counter.sprite.x-this.player.x,counter.sprite.y-this.player.y),step=Math.min(70,Math.max(0,distance-95)),at=moveCircle(this.player,Math.cos(this.face)*step,Math.sin(this.face)*step,PLAYER_RADIUS,this.activeTerrain(),this.playerBounds());this.player.setPosition(at.x,at.y);
   this.counterStrike=true;this.strikeTarget=counter.id;this.counterLeft=0;this.counterTarget=-1;this.activeSkill=null;this.heavyAttack=false;this.stamina-=20;
  }else{
   if(this.stamina<w.cost)return;this.updateAim();this.combo=this.elapsed-this.lastAttack<1.2?(this.combo+1)%3:0;this.lastAttack=this.elapsed;this.heavyAttack=false;this.activeSkill=null;this.counterStrike=false;this.strikeTarget=-1;this.stamina-=w.cost;
  }
  this.attackTime=0;this.attackAngle=this.face;this.attackHits.clear();this.attackFired=false;this.attackPulse=-1;this.regenDelay=STAMINA_DELAY;
 }
 private parry():void{
  if(this.state!=='playing'||!this.armed||this.attackTime>=0||this.dodgeLeft>0||this.guardLeft>0||this.ultimateLeft>0||this.stamina<12)return;
  this.updateAim();this.stamina-=12;this.regenDelay=STAMINA_DELAY;this.mouseHeld=false;this.guardLeft=PARRY_DURATION;this.addEffect('ring',this.player,0xffe3a1,45);
 }
 private useSkill(key:number):void{
  const w=weaponFor(this.profile),skill=SKILL_TREE.find(s=>s.style===w.style&&s.key===key);
  if(!skill||!this.profile.skills.includes(skill.id)||this.profile.disabledSkills.includes(skill.id)){this.toast('Приём не установлен. Tab → Навыки: изучи его или вставь в панель.');return;}
  if(this.state!=='playing'||!this.armed||this.attackTime>=0||this.dodgeLeft>0||this.guardLeft>0||this.ultimateLeft>0||(this.skillCooldowns[skill.id]??0)>0)return;
  const a=skillAttack(skill.id);if(this.stamina<a.cost){this.toast('Недостаточно выносливости.');return;}
  this.updateAim();this.stamina-=a.cost;this.activeSkill=skill.id;this.counterStrike=false;this.heavyAttack=false;this.skillCooldowns[skill.id]=skill.cooldown;this.attackTime=0;this.attackAngle=this.face;this.attackPulse=-1;this.attackHits.clear();this.attackFired=false;this.regenDelay=STAMINA_DELAY;
 }
 private dodge():void{
  if(this.state!=='playing'||this.dodgeWait>0||this.stamina<DODGE_COST)return;const w=this.currentAttackSpec();
  if(this.attackTime>=0&&this.attackTime<w.activeEnd)return;
  this.attackTime=-1;this.dodgeLeft=DODGE_TIME;this.dodgeWait=stats(this.profile).dodgeCooldown;
  this.dodgeVector=Math.hypot(this.velocity.x,this.velocity.y)>5?this.movement:{x:Math.cos(this.face),y:Math.sin(this.face)};
  this.stamina-=DODGE_COST;this.regenDelay=STAMINA_DELAY;this.audio.play('dash');this.lessonEvent('dodge');
 }
 private heal(potion=false):void{
  if(this.state!=='playing'||this.healWait>0||this.attackTime>=0||this.dodgeLeft>0)return;
  if(potion?this.profile.potions<=0:this.flasks<=0){this.toast(potion?'Зелий нет. Купи запас у лекаря в деревне.':'Фляга пуста. V - зелье из сумки; Лекарь продаёт запас.');return;}
  if(this.hp>=stats(this.profile).maxHP)return;
  if(potion)this.profile.potions--;else this.flasks--;this.dirty=true;this.hp=Math.min(stats(this.profile).maxHP,this.hp+(potion?Math.max(POTION_HEAL,stats(this.profile).maxHP*.30):FLASK_HEAL));this.healWait=1.1;this.audio.play('heal');this.particles(this.player.x,this.player.y,12,0xbdd785);this.updateHUD();this.lessonEvent('heal');
 }
 private resolveAttack():void{
  const w=weaponFor(this.profile),a=this.currentAttackSpec();if(this.attackTime<a.windup||this.attackTime>a.activeEnd)return;
  const pulse=Math.min(a.pulses-1,Math.floor((this.attackTime-a.windup)/Math.max(.01,a.activeEnd-a.windup)*a.pulses));
  if(pulse!==this.attackPulse){this.attackPulse=pulse;this.attackHits.clear();if(this.counterStrike)this.audio.play('parry');this.audio.weaponSound(w.id);
   this.addEffect(this.activeSkill==='axe_leap'||this.activeSkill==='staff_ward'||this.heavyAttack&&w.style==='axe'?'ring':w.style==='spear'||this.activeSkill==='axe_fault'?'thrust':'slash',this.player,this.counterStrike?0xffe7a1:w.color,a.reach,this.attackAngle+(pulse%2?.18:-.18));
  }
  if(!this.attackFired){this.attackFired=true;
   if(a.step){
    let step=a.step;
    if(step>0&&a.arc<1)for(const e of this.enemies){
     if(e.dead||e.region!==this.regionIndex||!slashConnects(this.player,this.attackAngle,e.sprite,e.radius,step+e.radius,.55))continue;
     step=Math.min(step,Math.max(0,Math.hypot(e.sprite.x-this.player.x,e.sprite.y-this.player.y)-e.radius-PLAYER_RADIUS-4));
    }
    const moved=moveCircle(this.player,Math.cos(this.attackAngle)*step,Math.sin(this.attackAngle)*step,PLAYER_RADIUS,this.activeTerrain(),this.playerBounds());this.player.setPosition(moved.x,moved.y);
   }
   if(w.type==='magic'&&!this.counterStrike){
    if(this.activeSkill==='staff_ward'){this.shieldLeft=3;for(const e of this.enemies)if(!e.dead&&e.region===this.regionIndex&&Math.hypot(e.sprite.x-this.player.x,e.sprite.y-this.player.y)<130+e.radius&&clearLine(this.player,e.sprite,3,this.activeTerrain(),this.playerBounds()))this.hitEnemy(e,stats(this.profile).damage*a.multiplier,85);}
    else if(this.heavyAttack||this.activeSkill==='staff_star'){
     const target=this.mouse?this.cameras.main.getWorldPoint(this.mouse.x,this.mouse.y):{x:this.player.x+Math.cos(this.attackAngle)*220,y:this.player.y+Math.sin(this.attackAngle)*220},d=Math.hypot(target.x-this.player.x,target.y-this.player.y)||1,range=this.activeSkill==='staff_star'?420:340,point=clampPoint({x:this.player.x+(target.x-this.player.x)*Math.min(1,range/d),y:this.player.y+(target.y-this.player.y)*Math.min(1,range/d)},this.playerBounds());
     if(clearLine(this.player,point,3,this.activeTerrain(),this.playerBounds()))this.hazards.push({...point,region:this.regionIndex,radius:this.activeSkill==='staff_star'?150:92,warning:this.activeSkill==='staff_star'?.9:.65,left:1.4,damage:stats(this.profile).damage*a.multiplier,kind:'sigil',fired:false});
    }else{const shots=this.activeSkill==='staff_fan'?5:w.id==='runicstaff'?3:1;for(let n=0;n<shots;n++)this.shoot(this.player,this.attackAngle+(n-(shots-1)/2)*.17,520,stats(this.profile).damage*a.multiplier,true,this.regionIndex,w.color,this.activeSkill==='staff_fan'?35:65);}return;
   }
  }
  if(w.type==='magic'&&!this.counterStrike)return;
  for(const e of [...this.enemies]){if(e.dead||this.attackHits.has(e.id)||e.region!==this.regionIndex||this.counterStrike&&e.id!==this.strikeTarget||this.trainingArea()!==e.training||!slashConnects(this.player,this.attackAngle,e.sprite,e.radius,a.reach,a.arc)||!clearLine(this.player,e.sprite,3,this.activeTerrain(),this.playerBounds()))continue;
   this.attackHits.add(e.id);this.hitEnemy(e,stats(this.profile).damage*a.multiplier,this.counterStrike?65:w.type==='sweep'?this.heavyAttack?80:52:22);
   if(this.activeSkill==='axe_cleave'&&!e.dead){e.bleed=3;e.bleedTick=1;}
   if(this.counterStrike){this.profile.counterWins++;this.syncAchievements();this.particles(e.sprite.x,e.sprite.y,22,0xffe8a3);this.cameras.main.shake(80,.003);this.popup(e.sprite.x,e.sprite.y-80,'КОНТРУДАР','#ffe6a0');this.lessonEvent('counter');}
  }
 }
 private hitEnemy(e:Enemy,amount:number,knockback=25):void{
  if(e.dead)return;
  const front=Math.abs(Phaser.Math.Angle.Wrap(Math.atan2(this.player.y-e.sprite.y,this.player.x-e.sprite.x)-Math.atan2(e.aim.y,e.aim.x)))<1.05;
  const shield=e.kind==='knight'&&e.mode==='chase'&&e.stun<=0&&front&&!this.counterStrike&&this.activeSkill!=='axe_cleave';
  const damage=Math.max(1,Math.round(amount*(shield?.38:1)));e.hp=Math.max(0,e.hp-damage);e.flash=.15;e.stun=shield?.03:e.kind==='boss'?.035:e.kind==='dragon'?.12:.23;e.nextPath=0;
  if(shield){this.audio.play('parry');this.addEffect('ring',e.sprite,0xaad7e5,30);}else if(e.kind!=='boss'){e.mode='recover';e.clock=.36;const dx=e.sprite.x-this.player.x,dy=e.sprite.y-this.player.y,len=Math.hypot(dx,dy)||1,moved=moveCircle(e.sprite,dx/len*knockback,dy/len*knockback,e.radius,this.terrainByRegion[e.region],this.enemyBounds(e));e.sprite.setPosition(moved.x,moved.y);}
  this.ultimate=Math.min(ULTIMATE_MAX,this.ultimate+5);this.audio.weaponSound(this.profile.weapon,true);this.particles(e.sprite.x,e.sprite.y,5,0xbfe9d8);this.popup(e.sprite.x,e.sprite.y-28,String(damage),'#d9f1e5');if(this.profile.weapon==='dawnblade')this.hp=Math.min(stats(this.profile).maxHP,this.hp+2);this.onQuestEvent('hit');this.lessonEvent('hit');
  if(e.hp<=0)this.killEnemy(e);
 }
 private killEnemy(e:Enemy):void{
  if(e.dead)return;e.dead=true;this.kills++;if(!e.training&&e.kind==='necromancer'){const q=this.lines.find(q=>q.id==='bell')!;if(q.accepted&&!q.claimed)q.kills=Math.min(2,q.kills+1);}this.score+=e.reward*40;
  let paid=0;if(!e.training){if(e.kind==='boss'){const p=this.progress[e.region];p.bossDead=true;if(!p.rewarded){p.rewarded=true;paid=this.grantCoins(e.reward,e.region,false);this.profile.skillPoints++;}}else paid=this.grantCoins(e.reward,e.region,true,true);}
  this.onQuestEvent('kill');this.lessonEvent('kill');this.hp=Math.min(stats(this.profile).maxHP,this.hp+this.profile.upgrades.recovery*2);
  this.popup(e.sprite.x,e.sprite.y-50,e.training?'Учебная победа':paid?`+${paid} ◈`:'Сила биома +','#baf3ec');this.tweens.add({targets:e.sprite,angle:e.sprite.flipX?-85:85,alpha:0,scaleX:e.sprite.scaleX*.7,scaleY:e.sprite.scaleY*.7,duration:430,onComplete:()=>{e.sprite.setVisible(false);e.shadow.setVisible(false);}});this.particles(e.sprite.x,e.sprite.y,12,0xade2df);
  this.syncAchievements();
  if(e.kind==='boss'){if(paid)this.popup(e.sprite.x,e.sprite.y-105,'+1 ИСКРА МАСТЕРСТВА','#ffe0a0');this.toast(`Ты разорвал печать! ${REGIONS[e.region].bossName} побеждён. Награда: ${paid} осколков${paid?', +1 искра':''}. Tab → Навыки: выбери новый приём.`);this.checkProgress();}
 }
 private damagePlayer(amount:number,source:Point,magic=false,attacker?:Enemy):void{
  if(this.state!=='playing'||this.hurtLeft>0||this.dodgeLeft>0)return;
  const front=Math.abs(Phaser.Math.Angle.Wrap(Math.atan2(source.y-this.player.y,source.x-this.player.x)-this.face))<1.1;
  if(this.guardLeft>0&&!magic&&front){
   const perfect=this.guardLeft>=PARRY_DURATION-PERFECT_PARRY;this.guardLeft=0;
   if(perfect&&attacker&&!attacker.dead){this.counterTarget=attacker.id;this.counterLeft=COUNTER_WINDOW;attacker.stun=attacker.kind==='boss'?.65:1.15;attacker.mode='recover';attacker.clock=attacker.stun;this.ultimate=Math.min(100,this.ultimate+18);this.audio.play('parry');this.addEffect('ring',this.player,0xffedab,70);this.toast('Точное парирование! ЛКМ - контрудар по отмеченному врагу.');return;}
   amount*=.45;this.audio.play('parry');this.addEffect('ring',this.player,0xe3cf99,45);
  }
  const a=stats(this.profile),damage=Math.max(2,Math.round(amount*a.armor*(magic?a.ward:1)*(this.shieldLeft>0?.65:1)));
  this.hp=Math.max(0,this.hp-damage);this.hurtLeft=HURT_PROTECTION;this.hurtFlash=.22;this.attackTime=-1;this.counterLeft=0;this.counterTarget=-1;this.onQuestEvent('hurt');this.wispFear=1.4;this.audio.play('hurt');
  const dx=this.player.x-source.x,dy=this.player.y-source.y,len=Math.hypot(dx,dy)||1,moved=moveCircle(this.player,dx/len*25,dy/len*25,PLAYER_RADIUS,this.activeTerrain(),this.playerBounds());this.player.setPosition(moved.x,moved.y);
  this.cameras.main.shake(100,.0035);this.particles(this.player.x,this.player.y,7,0xd99591);this.popup(this.player.x,this.player.y-38,`-${damage}`,'#f0b0aa');
  this.updateHUD();if(this.hp<=0){this.deaths++;this.state='dying';this.deathLeft=.8;this.resetInput();this.drawActors();this.toast('Ты пал. Костёр хранит твоё эхо.');}
 }
 private useUltimate():void{
  if(this.state!=='playing'||!this.armed||this.ultimate<ULTIMATE_MAX||this.attackTime>=0||this.dodgeLeft>0)return;
  this.updateAim();this.ultimate=0;this.ultimateAngle=this.face;this.ultimateLeft=.86;this.ultimatePulse=0;this.hurtLeft=Math.max(this.hurtLeft,.45);this.audio.play('ultimate');this.lessonEvent('ultimate');if(this.profile.weapon==='dawnblade')this.hp=Math.min(stats(this.profile).maxHP,this.hp+20);
  const w=weaponFor(this.profile);this.toast(w.ultimate);this.particles(this.player.x,this.player.y,18,w.color);
  if(w.style==='staff')for(let n=0;n<(w.id==='runicstaff'?12:8);n++)this.shoot(this.player,this.face+n*Math.PI*2/(w.id==='runicstaff'?12:8),470,stats(this.profile).damage*2*(1+this.profile.upgrades.spirit*.2),true,this.regionIndex,w.color,85);
 }
 private updateUltimate(dt:number):void{
  if(this.ultimateLeft<=0)return;const before=this.ultimateLeft;this.ultimateLeft=Math.max(0,this.ultimateLeft-dt);const w=weaponFor(this.profile);
  const pulses=w.style==='axe'?3:w.style==='sword'?2:1;
  while(this.ultimatePulse<pulses&&.86-this.ultimateLeft>=this.ultimatePulse*.25){this.ultimatePulse++;
   if(w.style==='staff')continue;const reach=w.style==='spear'?440:w.style==='axe'?150:185,arc=w.style==='spear'?.30:Math.PI;
   for(const e of this.enemies)if(!e.dead&&e.region===this.regionIndex&&slashConnects(this.player,this.ultimateAngle,e.sprite,e.radius,reach,arc)&&clearLine(this.player,e.sprite,3,this.terrain,this.playerBounds()))this.hitEnemy(e,stats(this.profile).damage*(w.style==='axe'?1:2.4)*(1+this.profile.upgrades.spirit*.2),55);
  }
  if(before>0&&this.ultimateLeft===0)this.ultimate=Math.min(100,this.ultimate);
 }
 private startEnemyAttack(e:Enemy):void{
  const moves:Record<Exclude<EnemyKind,'boss'>,EnemyAttack[]>={skeleton:['slash','combo','snipe'],zombie:['combo','poison','slam'],necromancer:['fan','summon','curse','snipe'],vampire:['blink','combo','fan','nova'],dragon:['breath','charge','meteor'],wraith:['blink','curse','nova'],knight:['combo','snipe','charge','quake'],archer:['snipe','fan'],alchemist:['poison','curse','fan'],shade:['blink','combo','charge'],gargoyle:['charge','quake','slam']};
  const choices=e.training?['slash'] as EnemyAttack[]:e.kind==='boss'?REGIONS[e.region].bossMoves:moves[e.kind];e.move=choices[e.moveIndex%choices.length];e.moveIndex++;e.chain=0;e.target=this.predict(e);
  if(e.move==='blink'){const at=clampPoint({x:e.target.x-Math.cos(this.face)*100,y:e.target.y-Math.sin(this.face)*100},this.enemyBounds(e));e.target=freePoint(at,e.radius,this.terrainByRegion[e.region],this.enemyBounds(e))?at:{x:this.player.x,y:this.player.y};}
  const dx=e.target.x-e.sprite.x,dy=e.target.y-e.sprite.y,len=Math.hypot(dx,dy)||1;e.aim={x:dx/len,y:dy/len};e.mode='windup';e.hasHit=false;
  const complex=['summon','meteor','breath','blink','poison','nova','snipe','curse','quake'].includes(e.move);e.clock=e.training?.9:(e.kind==='boss'?(complex?1.15:.84):complex?.92:.62)*(e.phase2?.78:1)*(e.region===2?THIRD_BIOME_WINDUP:1);
 }
 private updateEnemies(dt:number):void{
  for(const e of [...this.enemies]){
   if(e.dead||e.region!==this.regionIndex||this.area!=='biome'&&this.area!=='tutorial'||(this.area==='tutorial')!==e.training)continue;e.recoil=Math.max(0,e.recoil-dt);e.voiceLeft=Math.max(0,e.voiceLeft-dt);e.stun=Math.max(0,e.stun-dt);e.flash=Math.max(0,e.flash-dt);e.nextPath-=dt;if(e.bleed>0){e.bleed-=dt;e.bleedTick-=dt;if(e.bleedTick<=0){e.bleedTick=1;e.hp=Math.max(0,e.hp-stats(this.profile).damage*.18);e.flash=.1;this.particles(e.sprite.x,e.sprite.y,3,0xe3a287);if(e.hp===0)this.killEnemy(e);}}if(e.dead)continue;if(e.stun>0)continue;e.clock-=dt;
   const bounds=this.enemyBounds(e),distance=Math.hypot(this.player.x-e.sprite.x,this.player.y-e.sprite.y);
   if(this.player.x<bounds.left!||this.player.x>bounds.width-bounds.margin||distance>1100)continue;
   const slow=this.groundSpeed(e.sprite,false);
   if(e.kind==='boss'&&!e.phase2&&e.hp<=e.maxHP*.5){e.phase2=true;e.voiceLeft=.9;this.audio.play('roar');e.clock=Math.min(e.clock,.5);this.summonMinions(e,2);this.toast(`${REGIONS[e.region].bossName}: вторая фаза. Ускоренные приёмы и призванная нежить.`);}
   if(e.mode==='windup'){if(e.clock<=0)this.executeEnemyAttack(e);continue;}
   if(e.mode==='charge'){
    const speed=(e.kind==='boss'?(e.phase2?480:415):e.kind==='vampire'?405:e.kind==='dragon'?370:300)*slow;
    const moved=moveCircle(e.sprite,e.aim.x*speed*dt,e.aim.y*speed*dt,e.radius,this.terrainByRegion[e.region],bounds);e.sprite.setPosition(moved.x,moved.y).setFlipX(e.aim.x<0);
    if(!e.hasHit&&Math.hypot(e.sprite.x-this.player.x,e.sprite.y-this.player.y)<e.radius+PLAYER_RADIUS+9&&clearLine(e.sprite,this.player,3,this.terrainByRegion[e.region],bounds)){this.damagePlayer(e.damage,e.sprite,false,e);e.hasHit=true;}
    if(e.clock<=0){e.mode='recover';e.clock=e.kind==='boss'?(e.phase2?.64:.95):.85;}continue;
   }
   if(e.mode==='recover'){if(e.clock<=0){e.mode='chase';e.clock=e.kind==='boss'?(e.phase2?.8:1.2):e.kind==='necromancer'?1.9:Math.max(.5,.88-e.region*.06);}continue;}
   const ranged=e.kind==='archer'||e.kind==='alchemist'||e.kind==='necromancer'||e.kind==='dragon'||e.kind==='wraith'||e.kind==='boss'&&(REGIONS[e.region].bossTexture==='necromancer'||REGIONS[e.region].bossTexture==='dragon');
   if(ranged&&distance<200){const dx=e.sprite.x-this.player.x,dy=e.sprite.y-this.player.y,len=Math.hypot(dx,dy)||1;this.walkEnemy(e,clampPoint({x:e.sprite.x+dx/len*150,y:e.sprite.y+dy/len*150},bounds),e.speed*slow,dt);}
   else if(!ranged||distance>350){let target=this.predict(e);if(e.kind==='skeleton'&&distance>120){const a=Math.atan2(target.y-e.sprite.y,target.x-e.sprite.x),side=Math.sin(e.id*3+this.elapsed*.8)*55;target=clampPoint({x:target.x-Math.sin(a)*side,y:target.y+Math.cos(a)*side},bounds);}this.walkEnemy(e,target,e.speed*(e.phase2?1.14:1)*slow,dt);}
   const reach=e.kind==='boss'?ranged?580:320:e.kind==='necromancer'||e.kind==='dragon'||e.kind==='archer'||e.kind==='alchemist'?520:e.kind==='wraith'?400:e.kind==='vampire'||e.kind==='shade'||e.kind==='gargoyle'?300:e.kind==='knight'?210:e.kind==='zombie'?125:110;
   if(e.clock<=0&&distance<reach)this.startEnemyAttack(e);
  }
 }
 private recoverEnemy(e:Enemy,seconds=1):void{e.mode='recover';e.clock=seconds*(e.phase2?.75:1);}
 private executeEnemyAttack(e:Enemy):void{
  e.recoil=.26;if(e.move==='breath'||e.move==='charge'&&e.kind==='boss'){e.voiceLeft=.75;this.audio.play('roar');}
  const angle=Math.atan2(e.aim.y,e.aim.x),r=REGIONS[e.region],boss=e.kind==='boss';
  if(e.move==='charge'){e.mode='charge';e.clock=boss?.62:.37;this.audio.play('dash');return;}
  if(e.move==='slash'||e.move==='combo'){
   const reach=boss?143:e.kind==='zombie'?86:e.kind==='knight'?112:92;
   this.addEffect('slash',e.sprite,0xf49a8b,reach,angle);
   if(slashConnects(e.sprite,angle,this.player,PLAYER_RADIUS,reach,1.2)&&clearLine(e.sprite,this.player,3,this.terrainByRegion[e.region],this.enemyBounds(e))){const before=this.hp;this.damagePlayer(e.damage*(e.move==='combo'&&e.chain===2?1.15:1),e.sprite,false,e);if((e.kind==='vampire'||boss&&r.bossTexture==='vampire')&&this.hp<before)e.hp=Math.min(e.maxHP,e.hp+(before-this.hp)*.7);}
   this.audio.play(e.kind==='zombie'||e.kind==='vampire'?'bite':'slash');
   if(e.stun>.05)return;
   if(e.move==='combo'&&++e.chain<(boss?3:2)){e.target=this.predict(e);const dx=e.target.x-e.sprite.x,dy=e.target.y-e.sprite.y,len=Math.hypot(dx,dy)||1;e.aim={x:dx/len,y:dy/len};e.mode='windup';e.clock=boss?.38:.44;return;}
  }else if(e.move==='slam'){
   if(Math.hypot(e.sprite.x-this.player.x,e.sprite.y-this.player.y)<155+PLAYER_RADIUS&&clearLine(e.sprite,this.player,3,this.terrainByRegion[e.region],this.enemyBounds(e)))this.damagePlayer(e.damage*1.15,e.sprite,false,e);
   this.hazards.push({x:e.sprite.x,y:e.sprite.y,region:e.region,radius:155,warning:0,left:.35,damage:0,kind:'ring',fired:true});this.audio.play('axe');this.particles(e.sprite.x,e.sprite.y,16,0xb9c892);
  }else if(e.move==='poison'||e.move==='curse'){
   const targets=e.move==='curse'?[e.target]:boss?[e.sprite,e.target]:[e.sprite];for(const p of targets)this.hazards.push({x:p.x,y:p.y,region:e.region,radius:e.move==='curse'||boss?100:72,warning:e.move==='curse'?.9:.5,left:e.move==='curse'?4.5:5.5,damage:e.damage*(e.move==='curse'?.38:.50),kind:e.move==='curse'?'curse':'poison',fired:false});this.audio.play('cast');
  }else if(e.move==='summon'){this.summonMinions(e,boss?(e.phase2?3:2):1);this.audio.play('cast');
  }else if(e.move==='fan'||e.move==='breath'||e.move==='nova'||e.move==='snipe'){
   const count=e.move==='nova'?(e.phase2?14:10):e.move==='snipe'?1:e.move==='breath'?(e.phase2?9:6):boss?(e.phase2?7:5):4;
   for(let n=0;n<count;n++){const shot=e.move==='nova'?angle+n*Math.PI*2/count:angle+(n-(count-1)/2)*(e.move==='breath'?.16:.23),speed=e.move==='snipe'?490:e.move==='nova'?225:e.move==='breath'?335:290;this.shoot(e.sprite,shot,speed,e.damage*(e.move==='snipe'?1.2:1),false,e.region,e.move==='breath'?0xf4ad76:e.move==='snipe'?0xd0e9f4:0xcf9bdc,0,this.enemyProjectile(e));}this.audio.play('cast');
  }else if(e.move==='quake'){
   for(let n=0;n<(boss&&e.phase2?3:1);n++)this.hazards.push({x:e.sprite.x,y:e.sprite.y,region:e.region,radius:20,warning:.55+n*.55,left:2.5+n*.55,damage:e.damage*1.1,kind:'wave',fired:false});this.audio.play('axe');
  }else if(e.move==='blink'){
   this.particles(e.sprite.x,e.sprite.y,9,0xc7aedc);const at=moveCircle(e.target,0,0,e.radius,this.terrainByRegion[e.region],this.enemyBounds(e));e.sprite.setPosition(at.x,at.y);this.particles(at.x,at.y,9,0xc7aedc);const dx=this.player.x-at.x,dy=this.player.y-at.y,len=Math.hypot(dx,dy)||1;e.aim={x:dx/len,y:dy/len};e.move=boss||e.kind==='vampire'?'combo':'slash';e.chain=0;e.mode='windup';e.clock=.48;this.audio.play('dash');return;
  }else if(e.move==='meteor'){
   const count=e.phase2?6:3;for(let n=0;n<count;n++){const p=n===0?e.target:clampPoint({x:e.target.x+Math.cos(n*2.4)*125,y:e.target.y+Math.sin(n*2.4)*125},this.enemyBounds(e));this.hazards.push({x:p.x,y:p.y,region:e.region,radius:58,warning:1.15+n*.12,left:1.7+n*.12,damage:e.damage*1.05,kind:'meteor',fired:false});}this.audio.play('cast');
  }
  this.recoverEnemy(e,e.move==='summon'?1.4:e.move==='breath'?1.3:e.move==='snipe'?1.2:.95);
 }
 private summonMinions(e:Enemy,count:number):void{
  if(this.progress[e.region].bossDead||e.training)return;
  const active=this.enemies.filter(v=>v.region===e.region&&!v.dead&&v.kind!=='boss').length;
  const available=Math.min(count,MAX_MINIONS-active);for(let n=0;n<available;n++){
   const angle=n*Math.PI*2/Math.max(1,available),candidate=clampPoint({x:e.sprite.x+Math.cos(angle)*90,y:e.sprite.y+Math.sin(angle)*90},this.enemyBounds(e));
   const p=freePoint(candidate,22,this.terrainByRegion[e.region],this.enemyBounds(e))?candidate:this.freePosition(e.region,22,200);
   const kind=REGIONS[e.region].roster[(n+e.moveIndex)%REGIONS[e.region].roster.length].kind;const minion=this.spawnEnemy(kind,e.region,n,p);minion.stun=.75;minion.clock=2;
   this.hazards.push({...p,region:e.region,radius:30,warning:.7,left:1,damage:0,kind:'ring',fired:false});this.particles(p.x,p.y,8,0xb5ccef);
  }
 }
 private shoot(from:Point,angle:number,speed:number,damage:number,friendly:boolean,region:number,color:number,blast:number,visual=friendly?'shot-spirit':'shot-violet'):void{
  this.projectiles.push({x:from.x+Math.cos(angle)*25,y:from.y+Math.sin(angle)*25,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:friendly?.86:2.8,damage,region,friendly,color,radius:friendly?8:7,blast,visual,hits:new Set()});
 }
 private updateProjectiles(dt:number):void{
  for(const p of this.projectiles){p.life-=dt;const before={x:p.x,y:p.y};p.x+=p.vx*dt;p.y+=p.vy*dt;
   if(!clearLine(before,p,3,this.terrainByRegion[p.region],this.regionBounds(p.region)))p.life=0;if(p.life<=0)continue;
   if(p.friendly){const target=this.enemies.find(e=>!e.dead&&e.region===p.region&&!p.hits.has(e.id)&&Math.hypot(e.sprite.x-p.x,e.sprite.y-p.y)<e.radius+p.radius);
    if(target){p.hits.add(target.id);this.hitEnemy(target,p.damage,22);if(p.blast>0){this.particles(p.x,p.y,12,p.color);for(const e of this.enemies)if(e!==target&&!e.dead&&e.region===p.region&&Math.hypot(e.sprite.x-p.x,e.sprite.y-p.y)<p.blast+e.radius&&clearLine(p,e.sprite,3,this.terrainByRegion[p.region],this.regionBounds(p.region)))this.hitEnemy(e,p.damage*.70,18);}p.life=0;}
   }else if(Math.hypot(p.x-this.player.x,p.y-this.player.y)<PLAYER_RADIUS+p.radius){this.damagePlayer(p.damage,p,true);p.life=0;}
  }this.projectiles=this.projectiles.filter(p=>p.life>0);
 }
 private updateHazards(dt:number):void{
  for(const h of this.hazards){h.left-=dt;const before=h.warning;h.warning-=dt;if(h.warning>0)continue;
   if(h.kind==='sigil'&&!h.fired){h.fired=true;this.addEffect('ring',h,weaponFor(this.profile).color,h.radius);for(const e of this.enemies)if(!e.dead&&e.region===h.region&&Math.hypot(e.sprite.x-h.x,e.sprite.y-h.y)<h.radius+e.radius&&clearLine(h,e.sprite,3,this.activeTerrain(),this.playerBounds()))this.hitEnemy(e,h.damage,40);}
   if(h.kind==='meteor'&&!h.fired){h.fired=true;this.audio.play('meteor');this.particles(h.x,h.y,14,0xffc699);if(h.environment)this.weatherHitEnemies(h,h.radius,h.damage*.8);if(Math.hypot(h.x-this.player.x,h.y-this.player.y)<h.radius+PLAYER_RADIUS)this.damagePlayer(h.damage,h,true);}
   if((h.kind==='poison'||h.kind==='curse')&&h.left>0&&Math.hypot(h.x-this.player.x,h.y-this.player.y)<h.radius+PLAYER_RADIUS)this.damagePlayer(h.damage,h,true);
   if(h.kind==='wave'){h.radius+=180*dt;const d=Math.hypot(h.x-this.player.x,h.y-this.player.y);if(!h.fired&&Math.abs(d-h.radius)<PLAYER_RADIUS+12){this.damagePlayer(h.damage,h,true);if(this.hurtLeft>0)h.fired=true;}}
   if(before>0&&h.kind==='ring')h.fired=true;
  }this.hazards=this.hazards.filter(h=>h.left>0);
 }
 private grantCoins(value:number,index:number,countsForGoal=true,fromEnemy=false):number{
  const p=this.progress[index],paid=countsForGoal&&!fromEnemy&&this.area==='biome'?Math.max(0,Math.min(value,REGION_INCOME[index]-p.income)):value;
  if(countsForGoal&&!fromEnemy&&this.area==='biome'){p.income+=paid;if(p.income===REGION_INCOME[index]&&p.income-paid<REGION_INCOME[index])this.toast('Осколки на земле теперь возвращают только силу. Победы над врагами всегда пополняют кошелёк: накопи на HP, выносливость или зелья.');}
  this.profile.coins+=paid;this.score+=value*100;this.ultimate=Math.min(ULTIMATE_MAX,this.ultimate+Math.min(12,value*3));
  if(countsForGoal&&index===this.regionIndex&&(this.area==='biome'||this.area==='tutorial'))p.coins+=value;
  if(!this.armed&&p.coins>=(this.area==='tutorial'?3:REGIONS[this.regionIndex].awaken)){this.armed=true;this.profile.blade=true;this.particles(this.player.x,this.player.y,24,weaponFor(this.profile).color);this.audio.play('checkpoint');this.toast(`СИЛА ВОССТАНОВЛЕНА · ${weaponFor(this.profile).name}. Наводи мышью и сражайся!`);}
  this.checkProgress();this.updateHUD();return paid;
 }
 private collectCoins():void{
  for(const c of [...this.coins]){
   if(c.region!==this.regionIndex||Math.hypot(c.sprite.x-this.player.x,c.sprite.y-this.player.y)>PICKUP_RADIUS+this.profile.upgrades.magnet*20)continue;
   const x=c.sprite.x,y=c.sprite.y;c.sprite.destroy();this.coins.splice(this.coins.indexOf(c),1);this.grantCoins(c.value,c.region);this.onQuestEvent('pickup');this.audio.play('pickup');this.particles(x,y,6,0xbef5ee);
   this.lessonEvent('pickup');if(this.area==='biome'&&this.state==='playing'&&(!this.progress[c.region].cleared||this.quests[c.region].some(q=>q.id==='sprint'&&!q.complete)))this.spawnCoin(c.region);
  }
 }
 private checkProgress():void{
  if(this.area==='tutorial'||this.area==='interior')return;
  if(this.area==='village'){const next=this.villageIndex+1;if(next<REGIONS.length&&this.player.x>=regionStart(next)+45){const p=this.progress[next];this.startRegion(next,false,p.elapsed>0||p.bossDead);}return;}
  const p=this.progress[this.regionIndex];if(!p.cleared&&p.coins>=REGIONS[this.regionIndex].coins&&p.bossDead){p.cleared=true;this.resetWeather();this.drawGates();if(this.regionIndex===REGIONS.length-1){this.beginStory(true);return;}this.toast('Печать разорвана. Иди на восток в деревню: там ждут кузнец, бронница, лекарь и странник.');}
  if(p.cleared&&this.regionIndex<REGIONS.length-1&&this.player.x>=regionEnd(this.regionIndex)+70){this.startVillage(this.regionIndex);return;}
  if(p.bossDead&&this.player.x<regionStart(this.regionIndex)-55)this.startVillage(this.regionIndex-1);
 }

 private updateCamp():void{
  this.nearestNPC=-1;this.nearestChest=-1;this.nearestProp=-1;this.nearestHouse=-1;let nearest=INTERACT_DISTANCE;
  if(this.area==='interior')this.villagers.forEach((n,i)=>{if(n.village!==this.villageIndex||n.role!==this.interiorRole)return;const d=Math.hypot(this.player.x-n.sprite.x,this.player.y-n.sprite.y);if(d<nearest){nearest=d;this.nearestNPC=i;}});
  if(this.area==='village'||this.area==='tutorial')this.houses.forEach((h,i)=>{if(h.village!==this.villageIndex)return;const d=Math.hypot(this.player.x-h.door.x,this.player.y-h.door.y);if(d<nearest){nearest=d;this.nearestHouse=i;}});
  this.chests.forEach((c,i)=>{if(c.opened||c.region!==this.regionIndex||this.area!=='biome')return;const d=Math.hypot(c.x-this.player.x,c.y-this.player.y);if(d<nearest){nearest=d;this.nearestChest=i;}});
  this.questProps.forEach((q,i)=>{if(this.area!=='biome')return;const d=Math.hypot(q.point.x-this.player.x,q.point.y-this.player.y);if(d<nearest){nearest=d;this.nearestProp=i;this.nearestChest=-1;}});
  const leaving=this.area==='interior'&&this.player.y>housePoint(this.villageIndex,this.interiorRole??'smith').y+70;
  this.element('interaction').hidden=this.nearestNPC<0&&this.nearestChest<0&&this.nearestProp<0&&this.nearestHouse<0&&!leaving;
  this.element('interact-button').textContent=leaving?'E · Выйти на улицу':this.nearestNPC>=0?`E · ${resident(this.villageIndex,this.villagers[this.nearestNPC].role).name}: поговорить`:this.nearestHouse>=0?`E · Войти: ${houseName(this.villageIndex,this.houses[this.nearestHouse].role)}`:this.nearestProp>=0?'E · Прочесть / забрать':'E · Открыть сундук';
 }
 private enterHouse(h:House,preserve=false):void{
  const previous=this.area;this.clearInterior();this.interiorRole=h.role;this.interiorReturn=previous==='tutorial'?'tutorial':this.interiorReturn==='tutorial'&&previous==='interior'?'tutorial':'village';this.area='interior';
  this.outdoorArt.forEach(o=>o.setVisible(false));h.roof.setVisible(false);h.label.setVisible(false);this.interiorShade=this.add.rectangle(0,0,WORLD_WIDTH,WORLD_HEIGHT,0x030d10,.92).setOrigin(0).setDepth(12.5);
  this.interiorLayer=interiorArt(this,h).setDepth(14);this.villagers.forEach(n=>n.sprite.setVisible(n.village===h.village&&n.role===h.role));
  if(!preserve)this.player.setPosition(h.x,h.y+85);this.resetInput();this.configureCamera();this.drawActors();this.updateHUD();this.dirty=true;
 }
 private clearInterior():void{
  this.interiorLayer?.destroy(true);this.interiorLayer=null;this.interiorShade?.destroy();this.interiorShade=null;this.outdoorArt.forEach(o=>o.setVisible(true));for(const h of this.houses){h.roof.setVisible(true);h.label.setVisible(true);}this.villagers.forEach(n=>{n.sprite.setVisible(false);n.gesture.setVisible(false);});this.interiorRole=null;
 }
 private exitHouse():void{
  const role=this.interiorRole;if(!role)return;const h=this.houses.find(h=>h.role===role&&h.village===this.villageIndex)!;this.clearInterior();this.area=this.interiorReturn;this.player.setPosition(h.door.x,h.door.y+27);this.resetInput();this.configureCamera();if(this.trainingArea())this.renderLesson();this.updateHUD();this.drawActors();
 }
 private interact():void{
  if(this.state!=='playing')return;this.updateCamp();
  if(this.area==='interior'&&this.player.y>housePoint(this.villageIndex,this.interiorRole??'smith').y+70){this.exitHouse();return;}
  if(this.nearestHouse>=0){this.enterHouse(this.houses[this.nearestHouse]);return;}
  if(this.nearestChest>=0){this.openChest(this.chests[this.nearestChest]);return;}if(this.nearestProp>=0){this.touchQuestProp(this.questProps[this.nearestProp]);return;}if(this.nearestNPC<0)return;
  const npc=this.villagers[this.nearestNPC],person=resident(npc.village,npc.role);this.dialogRole=npc.role;this.state='dialog';this.resetInput();this.element('interaction').hidden=true;
  this.element<HTMLImageElement>('merchant-portrait').src=this.textures.getBase64(person.texture);this.element<HTMLImageElement>('merchant-portrait').alt=`${person.name} · ${person.job}`;this.element('dialog-name').textContent=`${person.name} · ${person.job}`;this.element('dialog-trade').textContent=npc.role==='smith'?'Оружие':npc.role==='armorer'?'Доспехи':npc.role==='healer'?'Лечение и прокачка':'Усиления и облики';
  this.element('dialog-overlay').hidden=false;this.syncGuide();this.say(person.lore);this.renderQuestTalk();this.renderDeliveryTalk();this.lessonEvent('talk');
 }
 private say(text:string):void{this.dialogTarget=text;this.dialogTime=0;this.element('dialog-text').textContent='';}
 private leaveDialog():void{this.element('dialog-overlay').hidden=true;this.state='playing';this.resetInput();this.syncGuide();}
 private onQuestEvent(event:'pickup'|'kill'|'hit'|'hurt'):void{
  if(this.area!=='biome')return;
  for(const q of questEvent(this.quests[this.regionIndex],event)){const pos=this.freePosition(this.regionIndex,25,80);this.spawnChest({...pos,region:this.regionIndex,quest:q.id,opened:false});this.audio.play('loot');this.toast(`Испытание «${q.name}» пройдено. Сундук появился на карте ▣.`);}
 }
 private spawnChest(data:SavedChest):void{
  if(this.chests.some(c=>c.region===data.region&&c.quest===data.quest))return;
  const sprite=this.add.image(data.x,data.y,data.opened?'chest-open':'chest').setDisplaySize(69,69).setDepth(18+data.y*.01);if(data.opened)sprite.setAlpha(.55);
  this.chests.push({...data,sprite});
 }
 private openChest(chest:Chest):void{
  if(chest.opened||Math.hypot(chest.x-this.player.x,chest.y-this.player.y)>INTERACT_DISTANCE)return;
  chest.opened=true;chest.sprite.setTexture('chest-open').setAlpha(.55);this.state='loot';this.resetInput();this.element('interaction').hidden=true;
  this.loot=rollLoot(this.profile,this.regionIndex);this.lootLeft=2.45;this.element('loot-overlay').hidden=false;this.element('loot-odds').textContent=LOOT_ODDS;
  this.element('loot-result').textContent='Эхо выбирает награду…';this.element<HTMLButtonElement>('loot-close').disabled=true;
  const entries=Array.from({length:18},(_,i)=>i===14?this.loot!:rollLoot(this.profile,this.regionIndex));
  const track=this.element('roll-track');track.style.transition='none';track.style.transform='translateX(0px)';track.innerHTML=entries.map(item=>`<div class="roll-cell" style="color:${item.color}"><b>${item.icon}</b><span>${item.name}</span></div>`).join('');
  void track.offsetWidth;const width=this.element('loot-overlay').querySelector('.roulette')?.clientWidth??350;
  track.style.transition='transform 2.3s cubic-bezier(.15,.66,.17,1)';track.style.transform=`translateX(${width/2-14*96-44}px)`;this.audio.play('loot');
 }
 private applyLoot():void{
  const loot=this.loot;if(!loot)return;this.loot=null;const before=stats(this.profile);
  if(loot.kind==='souls')this.grantCoins(loot.value,this.regionIndex,false);
  else if(loot.kind==='heal'){this.hp=stats(this.profile).maxHP;this.flasks=Math.min(stats(this.profile).flasks,this.flasks+1);}
  else if(loot.kind==='item'&&loot.item){const skin=SKINS.find(s=>s.id===loot.item),weapon=WEAPONS.find(w=>w.id===loot.item),armor=ARMORS.find(a=>a.id===loot.item),upgrade=UPGRADES.find(u=>u.id===loot.item);
   if(skin&&!this.profile.owned.includes(skin.id))this.profile.owned.push(skin.id);
   else if(weapon&&!this.profile.weapons.includes(weapon.id))this.profile.weapons.push(weapon.id);
   else if(armor&&!this.profile.armors.includes(armor.id))this.profile.armors.push(armor.id);
   else if(upgrade&&isAttribute(upgrade.id)){if(upgrade.id==='vitality')this.profile.healthLevel++;else this.profile.enduranceLevel++;}
   else if(upgrade)this.profile.upgrades[upgrade.id]=Math.min(upgrade.prices.length,this.profile.upgrades[upgrade.id]+1);
  }
  this.applyEquipment(before);this.element('loot-result').textContent=loot.kind==='empty'?'Сундук пуст. Следующее эхо может быть щедрее.':`Получено: ${loot.name}`;this.element('loot-result').style.color=loot.color;
  this.element<HTMLButtonElement>('loot-close').disabled=false;this.audio.play(loot.kind==='empty'?'empty':'loot');this.updateHUD();
 }
 private openShop():void{
  if(this.state!=='dialog')return;this.shopTab=this.dialogRole==='smith'?'weapons':this.dialogRole==='armorer'?'armors':this.dialogRole==='healer'?'supplies':'upgrades';this.state='shop';this.element('dialog-overlay').hidden=true;this.element('shop-overlay').hidden=false;this.shopPage=0;
  this.element('shop-eyebrow').textContent=houseName(this.villageIndex,this.dialogRole);this.element('shop-title').textContent=resident(this.villageIndex,this.dialogRole).job;this.element('shop-close').textContent=`Назад: ${resident(this.villageIndex,this.dialogRole).name} ↗`;for(const tab of ['weapons','armors','supplies','upgrades','skins','growth'])this.element(`tab-${tab}`).hidden=this.dialogRole==='smith'?tab!=='weapons':this.dialogRole==='armorer'?tab!=='armors':this.dialogRole==='healer'?!['supplies','growth'].includes(tab):!['upgrades','skins'].includes(tab);
  this.element('shop-message').textContent=this.dialogRole==='healer'||this.dialogRole==='trader'?'HP и выносливость: +10 за 100 ◈, затем 150, 200… Усиления сохраняются после смерти. Зелья - в сумке, клавиша V.':'Покупки сохраняются после смерти. У лекаря и странника можно постоянно повышать HP и выносливость.';if(this.dialogRole==='smith')this.element('shop-message').textContent=villageTradition(this.villageIndex);this.renderShop();
 }
 private renderShop():void{
  const items=this.shopTab==='skins'?SKINS:this.shopTab==='weapons'?WEAPONS.filter(w=>!w.quest&&villageStock(this.villageIndex).includes(w.id)):this.shopTab==='armors'?ARMORS:this.shopTab==='supplies'?SUPPLIES:this.shopTab==='growth'?UPGRADES.filter(u=>isAttribute(u.id)):UPGRADES;
  const pages=Math.max(1,Math.ceil(items.length/4));this.shopPage=Math.min(pages-1,Math.max(0,this.shopPage));
  this.element('shop-wallet').textContent=`◈ ${this.profile.coins}`;this.element('shop-page').textContent=`${this.shopPage+1} / ${pages}`;
  this.element<HTMLButtonElement>('shop-prev').disabled=this.shopPage===0;this.element<HTMLButtonElement>('shop-next').disabled=this.shopPage===pages-1;
  for(const tab of ['skins','weapons','armors','upgrades','supplies','growth']){this.element(`tab-${tab}`).classList.toggle('selected',tab===this.shopTab);}
  this.element('storage-status').textContent=this.storageAvailable?'Покупки сохранятся только по кнопке «Сохранить прогресс» в меню.':'Браузер запретил сохранение; покупки действуют в этой вкладке.';
  this.element('shop-items').classList.toggle('growth-items',this.shopTab==='growth');this.element('shop-items').innerHTML=this.itemCards(this.shopTab,this.shopPage,true);
 }
 private itemCards(tab:ShopTab,page:number,shop:boolean):string{
  const cards:string[]=[],p=this.profile;
  if(tab==='supplies'){return SUPPLIES.map(i=>`<article class="shop-card"><span class="upgrade-icon">${i.icon}</span><h3>${i.name}</h3><p>${i.description}</p><button data-item="${i.id}" ${p.coins<i.price||i.id==='field-potion'&&p.potions>=99?'disabled':''}>${i.price} ◈</button></article>`).join('');}
  if(tab==='upgrades'||tab==='growth'){for(const u of (tab==='growth'?UPGRADES.filter(u=>isAttribute(u.id)):UPGRADES).slice(page*4,page*4+4)){const repeat=isAttribute(u.id),rank=repeat?attributeLevel(p,u.id):p.upgrades[u.id],max=!repeat&&rank>=u.prices.length,price=repeat?attributePrice(p,u.id):u.prices[rank],gate=itemUnlock(u.id,rank),locked=this.seals()<gate;
   cards.push(`<article class="shop-card"><span class="upgrade-icon">${u.icon}</span><h3>${u.name}</h3><p>${u.description}<br>${repeat?'Куплено: '+rank:rank+' / '+u.prices.length}</p><button data-item="${u.id}" ${max||locked||p.coins<price?'disabled':''}>${max?'Максимум':locked?`${gate} печатей · ${price} ◈`:`${price} ◈`}</button></article>`);}
  }else{
   const items=tab==='skins'?SKINS:tab==='weapons'?(shop?WEAPONS.filter(w=>!w.quest&&villageStock(this.villageIndex).includes(w.id)):WEAPONS):ARMORS;
   for(const item of items.slice(page*4,page*4+4)){
    const owned=tab==='skins'?p.owned.includes(item.id):tab==='weapons'?p.weapons.some(id=>id===item.id):p.armors.some(id=>id===item.id);
    const gate=itemUnlock(item.id),locked=shop&&!owned&&this.seals()<gate;
    const selected=(tab==='skins'?p.skin:tab==='weapons'?p.weapon:p.armor)===item.id;
    const info='description'in item?item.description:'Облик героя';
    const picture=tab==='skins'?`<img src="${this.textures.getBase64(item.id)}" alt="">`:tab==='weapons'?`<img src="${this.textures.getBase64(`held-${item.id}`)}" alt="">`:`<span class="upgrade-icon">${'icon'in item?item.icon:'◇'}</span>`;
    cards.push(`<article class="shop-card">${picture}<h3>${item.name}</h3><p>${info}</p><button ${shop?'data-item':'data-equip'}="${item.id}" ${selected||!shop&&!owned||locked||shop&&!owned&&p.coins<item.price?'disabled':''}>${selected?'Выбрано':owned?'Надеть':locked?`${gate} печатей · ${item.price} ◈`:shop?`${item.price} ◈`:'quest'in item&&item.quest?'За поручение':'В деревне'}</button></article>`);
   }
  }return cards.join('');
 }
 private applyEquipment(before:ReturnType<typeof stats>):void{
  const after=stats(this.profile);this.hp=Math.min(after.maxHP,this.hp+Math.max(0,after.maxHP-before.maxHP));this.stamina=Math.min(after.maxStamina,this.stamina+Math.max(0,after.maxStamina-before.maxStamina));
  this.flasks=Math.min(after.flasks,this.flasks+Math.max(0,after.flasks-before.flasks));this.player.setTexture(this.profile.skin);this.attackTime=-1;this.sword.setTexture(weaponTexture(this.profile.weapon));this.drawActors();
 }
 private equip(id:string):void{
  const p=this.profile,before=stats(p);const weapon=WEAPONS.find(w=>w.id===id),armor=ARMORS.find(a=>a.id===id);
  if(weapon&&p.weapons.includes(weapon.id))p.weapon=weapon.id;else if(armor&&p.armors.includes(armor.id))p.armor=armor.id;else if(p.owned.includes(id))p.skin=id;else return;
  this.dirty=true;this.applyEquipment(before);this.renderEquipment();this.updateHUD();
 }
 private toggleMenu():void{
  if(this.state==='menu'){this.state=this.menuReturn;this.element('menu-overlay').hidden=true;this.resetInput();if(this.state==='paused')this.showPauseModal();this.syncGuide();return;}
  if(this.state!=='playing'&&this.state!=='paused')return;
  this.menuReturn=this.state;this.state='menu';this.resetInput();this.hideModal();this.syncGuide();this.element('interaction').hidden=true;this.element('menu-overlay').hidden=false;this.renderMenu();
 }
 private renderMenu():void{
  this.updateHUD();this.drawMaps();this.refreshSaveUI();this.element<HTMLButtonElement>('travel-open').disabled=this.area!=='village'&&this.area!=='interior';this.element('menu-wallet').textContent=`◈ ${this.profile.coins}`;
  for(const tab of ['overview','equipment','skills','quests','achievements','settings'] as const)this.element(`menu-${tab}`).hidden=tab!==this.menuTab;
  for(const b of document.querySelectorAll<HTMLButtonElement>('[data-menu-tab]'))b.classList.toggle('selected',b.dataset.menuTab===this.menuTab);
  if(this.menuTab==='equipment')this.renderEquipment();if(this.menuTab==='skills')this.renderSkills();if(this.menuTab==='quests')this.renderQuests();if(this.menuTab==='achievements')this.renderAchievements();if(this.menuTab==='settings')this.renderAudio();
 }
 private renderSkills():void{
  const style=weaponFor(this.profile).style,seals=this.seals();this.element('skill-points').textContent=`Искры: ${this.profile.skillPoints} · печати ${seals}/${REGIONS.length}`;
  this.element<HTMLButtonElement>('skill-reset').disabled=!SKILL_TREE.some(s=>s.style===style&&this.profile.skills.includes(s.id));
  this.element('skill-weapon').textContent=`Ветка: ${weaponFor(this.profile).name}. Верни искры, чтобы сменить сборку; другая ветка выбирается во «Вещах».`;
  this.element('skill-items').innerHTML=SKILL_TREE.filter(s=>s.style===style).map(s=>{const known=this.profile.skills.includes(s.id),purchased=this.profile.unlockedSkills.includes(s.id),disabled=this.profile.disabledSkills.includes(s.id),price=purchased?0:s.price,previous=SKILL_TREE.find(p=>p.style===style&&p.tier===s.tier-1),locked=seals<s.seals||!!previous&&!this.profile.skills.includes(previous.id),afford=this.profile.coins>=price&&this.profile.skillPoints>=s.points;return `<article class="skill-card ${known?'complete':''}"><div><b>${s.key}</b><strong>${s.name}</strong></div><p>${s.description}</p><small>${known?`${s.points} искр вложено · ${disabled?'снят с панели':'клавиша '+s.key}`:`${s.seals} печатей · ${s.points} искр · ${price} ◈`}</small><button ${known?'data-skill-toggle':'data-skill'}="${s.id}" ${!known&&(locked||!afford)?'disabled':''}>${known?disabled?'Вставить в панель':'Убрать из панели':locked?'Ветка пока закрыта':purchased?'Вложить искры':'Изучить'}</button></article>`;}).join('');
 }
 private syncAchievements(notify=true):void{
  const eligible=earnedAchievements({bosses:this.progress.map(p=>p.bossDead),counters:this.profile.counterWins,skills:this.profile.unlockedSkills.length,deliveries:this.deliveries.some(q=>q.claimed),promise:this.lines.some(q=>q.claimed),kills:this.kills,returned:this.deaths>0&&this.area==='village',trained:this.tutorialFinished});
  for(const id of eligible)if(!this.profile.achievements.includes(id)){this.profile.achievements.push(id);if(notify){this.achievementQueue.push(id);this.dirty=true;}}
 }
 private updateAchievementNotice(dt:number):void{
  const notice=this.element('achievement-banner'),visible=this.state==='playing'||this.state==='won';notice.hidden=!visible||this.achievementLeft<=0;
  if(!visible)return;
  this.achievementLeft=Math.max(0,this.achievementLeft-dt);notice.classList.toggle('leaving',this.achievementLeft>0&&this.achievementLeft<.45);
  if(this.achievementLeft<=0&&this.achievementQueue.length){const id=this.achievementQueue.shift(),a=ACHIEVEMENTS.find(a=>a.id===id)!;this.achievementLeft=4.5;notice.classList.remove('leaving');notice.hidden=true;void notice.offsetWidth;this.element('achievement-name').textContent=a.name;this.element('achievement-detail').textContent=a.boss>=0?'Печать разорвана · искра мастерства получена. Ты стал ближе к семье.':`Ты справился! ${a.description}`;this.audio.play('achievement');notice.hidden=false;}
 }
 private renderAchievements():void{
  const pages=Math.ceil(ACHIEVEMENTS.length/4);this.achievementPage=Math.max(0,Math.min(pages-1,this.achievementPage));
  this.element('achievement-progress').textContent=`Твой путь: ${this.seals()}/8 печатей · ${this.profile.achievements.length}/${ACHIEVEMENTS.length} достижений`;
  this.element<HTMLProgressElement>('achievement-meter').value=this.seals();
  this.element('achievement-items').innerHTML=ACHIEVEMENTS.slice(this.achievementPage*4,this.achievementPage*4+4).map(a=>{const earned=this.profile.achievements.includes(a.id);return `<article class="achievement-card ${earned?'earned':''}"><b>${earned?a.icon:'◇'}</b><div><strong>${a.name}</strong><small>${earned?'Получено · твоя победа':'Впереди на твоём пути'}</small><p>${a.description}</p></div></article>`;}).join('');
  this.element('achievement-page').textContent=`${this.achievementPage+1} / ${pages}`;this.element<HTMLButtonElement>('achievement-prev').disabled=this.achievementPage===0;this.element<HTMLButtonElement>('achievement-next').disabled=this.achievementPage===pages-1;
 }
 private renderEquipment():void{
  const items=this.equipmentTab==='weapons'?WEAPONS:this.equipmentTab==='armors'?ARMORS:SKINS,pages=Math.ceil(items.length/4);
  this.equipmentPage=Math.max(0,Math.min(pages-1,this.equipmentPage));this.element('equipment-items').innerHTML=this.itemCards(this.equipmentTab,this.equipmentPage,false);
  this.element('equipment-page').textContent=`${this.equipmentPage+1} / ${pages}`;this.element<HTMLButtonElement>('equipment-prev').disabled=this.equipmentPage===0;this.element<HTMLButtonElement>('equipment-next').disabled=this.equipmentPage===pages-1;
  for(const b of document.querySelectorAll<HTMLButtonElement>('[data-equipment]'))b.classList.toggle('selected',b.dataset.equipment===this.equipmentTab);
  const w=weaponFor(this.profile);this.element('equipment-detail').textContent=`${this.profile.relics.includes('emberseal')?'Пепельная печать: -18% магии. ':''}${w.name}: урон ${Math.round(stats(this.profile).damage)}, дальность ${w.reach}, расход ${w.cost}. ${armorFor(this.profile).name}. ПКМ: ${w.description.split('ПКМ: ')[1]??w.description}`;
  this.element('ultimate-info').textContent=`R · ${w.ultimate}: ${w.ultimateHint}. Заряд ${Math.floor(this.ultimate)} / 100.`;
 }
 private journalEntries():JournalEntry[]{
  const entries:JournalEntry[]=[];
  for(const q of this.lines){
   const d=LINES.find(d=>d.id===q.id)!,row=lineJournal(q,this.progress[d.region].bossDead),ready=lineReady(q,this.progress[d.region].bossDead);
   const visit=d.offered;
   let village:number|null=!q.accepted?d.offered:ready?visit:null,point:Point|null=village!==null?housePoint(village,d.giver):{x:regionStart(d.region)+640,y:550};
   if(q.claimed)point=null;
   else if(q.accepted&&!ready){
    const prop=this.questProps.find(p=>p.id===q.id&&(q.id!=='runes'||p.order===q.runes));
    if(q.id==='bell'&&q.kills<2){point=this.enemies.find(e=>e.kind==='necromancer'&&!e.dead&&e.region===d.region)?.sprite??{x:regionStart(d.region)+500,y:600};}
    else if(q.id==='bell'&&!q.artifact)point=prop?.point??{x:regionStart(d.region)+950,y:280};
    else if(q.id==='runes'&&q.runes<3)point=prop?.point??[{x:regionStart(d.region)+300,y:250},{x:regionStart(d.region)+680,y:830},{x:regionStart(d.region)+1040,y:300}][q.runes];
    else if(q.id==='wisp'&&!q.escorted)point=this.wisp??{x:regionStart(d.region)+180,y:700};
    else point=this.enemies.find(e=>e.kind==='boss'&&!e.dead&&e.region===d.region)?.sprite??{x:regionStart(d.region)+720,y:550};
   }
   entries.push({...row,available:q.accepted||this.seals()>d.offered,point,region:d.region,village});
  }
  for(const q of this.deliveries){const d=DELIVERIES.find(d=>d.id===q.id)!,village=q.accepted&&!q.delivered?d.to:d.from,role=q.accepted&&!q.delivered?d.receiver:d.giver;entries.push({...deliveryJournal(q),available:this.seals()>=d.seals,point:q.claimed?null:housePoint(village,role),region:Math.max(0,village+1),village});}
  for(const q of this.quests[this.regionIndex]){
   const chest=this.chests.find(c=>c.region===this.regionIndex&&c.quest===q.id),opened=chest?.opened===true;
   entries.push({id:`trial:${q.id}`,title:q.name,why:q.description,status:opened?'Награда открыта':q.complete?'Сундук появился':q.failed?'Время вышло':`${q.progress}/${q.target}${q.id==='sprint'?' · '+Math.max(0,Math.ceil(q.limit-q.elapsed))+' с':''}`,next:opened?'Испытание завершено.':q.complete?'Дойди до сундука на карте и открой на E.':q.failed?'Нажми «Повторить сбор на время», затем закрой меню.':q.description,steps:[`${q.complete?'✓':'○'} Выполнить испытание`,`${opened?'✓':'○'} Открыть сундук`],reward:'Сундук: сила, лечение или предмет; он может оказаться пустым.',done:opened,available:true,point:q.complete&&!opened&&chest?{x:chest.x,y:chest.y}:q.complete?null:{x:regionStart(this.regionIndex)+640,y:550},region:this.regionIndex,village:null});
  }
  return entries;
 }
 private trackQuest(id:string):void{
  const entry=this.journalEntries().find(q=>q.id===id);if(!entry||!entry.available||entry.done)return;
  this.profile.trackedQuest=id;this.dirty=true;this.mapMode='local';this.mapFocusVillage=entry.village;this.mapFocusRegion=entry.village===null?entry.region:null;
  this.renderQuests();this.toggleMap();
 }
 private renderQuests():void{
  for(const b of document.querySelectorAll<HTMLButtonElement>('[data-quest-view]'))b.classList.toggle('selected',b.dataset.questView===this.questView);
  const prefix=this.questView==='story'?'line:':this.questView==='delivery'?'delivery:':'trial:',rows=this.journalEntries().filter(q=>q.id.startsWith(prefix));
  this.questPage=Math.max(0,Math.min(rows.length-1,this.questPage));const q=rows[this.questPage],tracked=this.profile.trackedQuest===q.id;
  this.element('quest-items').innerHTML=`<article class="quest-card journal-card ${q.done?'complete':''}"><div><strong>${q.title}</strong><span>${q.status}</span></div><p class="journal-why">${q.why}</p><p class="journal-next"><b>Следующий шаг:</b> ${q.next}</p><div class="journal-steps">${q.steps.map(s=>`<span>${s}</span>`).join('')}</div><footer><small>Награда: ${q.reward}</small><button data-track-quest="${q.id}" ${q.done||!q.available?'disabled':''}>${q.done?'Выполнено':!q.available?'Пока недоступно':tracked?'Цель на карте · M':'Отметить на карте'}</button></footer></article>`;
  this.element('quest-page').textContent=`${this.questPage+1} / ${rows.length}`;this.element<HTMLButtonElement>('quest-prev').disabled=this.questPage===0;this.element<HTMLButtonElement>('quest-next').disabled=this.questPage===rows.length-1;
  this.element('quest-retry').hidden=q.id!=='trial:sprint'||!this.quests[this.regionIndex].some(q=>q.id==='sprint'&&q.failed);
 }

 private renderAudio():void{
  for(const key of ['master','music','effects'] as const)this.element<HTMLInputElement>(`volume-${key}`).value=String(Math.round(this.audio.settings[key]*100));
  this.element('audio-track').textContent=this.audio.trackTitle;
  this.element('mute-button').textContent=this.audio.settings.muted?'Включить звук':'Выключить звук';
 }
 private refreshSaveUI():void{
  this.element<HTMLButtonElement>('load-button').disabled=!this.saved;this.element('load-start').hidden=!this.saved||this.state!=='ready';
  this.element('save-status').textContent=!this.storageAvailable?'Браузер запретил сохранение.':this.saved?`Ручное сохранение: ${new Date(this.saved.savedAt).toLocaleString('ru-RU')}. Автосохранения нет.`:'Автосохранения нет. Нажми «Сохранить прогресс», чтобы вернуться к этой попытке.';
 }
 private snapshot():Snapshot{
  return{version:7,manual:true,savedAt:new Date().toISOString(),profile:this.profile,region:this.regionIndex,progress:this.progress,player:{x:this.player.x,y:this.player.y},checkpoint:this.checkpoint,
   hp:this.hp,stamina:this.stamina,flasks:this.flasks,armed:this.armed,ultimate:this.ultimate,elapsed:this.elapsed,score:this.score,kills:this.kills,deaths:this.deaths,
   enemies:this.enemies.filter(e=>!e.dead).map(e=>({kind:e.kind,region:e.region,x:e.sprite.x,y:e.sprite.y,hp:e.hp,phase2:e.phase2,variant:e.variant,training:e.training})),
   coins:this.coins.map(c=>({x:c.sprite.x,y:c.sprite.y,region:c.region})),quests:this.quests,chests:this.chests.map(c=>({x:c.x,y:c.y,region:c.region,quest:c.quest,opened:c.opened})),audio:{...this.audio.settings},area:this.area,villageIndex:this.villageIndex,lastVillage:this.lastVillage,lesson:this.lessonIndex,lessonProgress:this.lessonProgress,lines:this.lines,wisp:this.wisp?{x:this.wisp.x,y:this.wisp.y}:null,villages:[...this.campVisits],deliveries:this.deliveries,interiorRole:this.interiorRole,interiorReturn:this.interiorReturn,migrated:false};
 }
 private saveProgress():void{
  if(this.state!=='menu'&&this.state!=='paused'&&this.state!=='won')return;
  try{const raw=JSON.stringify(this.snapshot());localStorage.setItem(PROFILE_KEY,raw);this.saved=parseSave(raw);this.storageAvailable=true;this.dirty=false;this.refreshSaveUI();this.toast('Прогресс сохранён вручную: биом, позиция, вещи, задания и сундуки.');}
  catch{this.storageAvailable=false;this.refreshSaveUI();this.toast('Сохранить не удалось: браузер запретил запись.');}
 }
 private loadProgress():void{
  this.achievementQueue=[];this.achievementLeft=0;this.element('achievement-banner').hidden=true;
  let saved:Snapshot|null=null;try{saved=parseSave(localStorage.getItem(PROFILE_KEY));}catch{this.storageAvailable=false;}
  if(!saved){this.saved=null;this.refreshSaveUI();this.toast('Ручного сохранения нет или оно повреждено.');return;}
  this.audio.unlock();this.clearActors();this.saved=saved;this.profile=saved.profile;this.progress=saved.progress;this.quests=saved.quests;this.regionIndex=saved.region;this.area=saved.area;this.villageIndex=saved.villageIndex;this.lastVillage=saved.lastVillage;this.lessonIndex=saved.lesson;this.lessonProgress=saved.lessonProgress;this.lines=saved.lines;this.deliveries=saved.deliveries;this.interiorReturn=saved.interiorReturn;this.dirty=false;
  this.hp=Math.max(1,Math.min(stats(this.profile).maxHP,saved.hp));this.stamina=Math.min(stats(this.profile).maxStamina,saved.stamina);this.flasks=Math.min(stats(this.profile).flasks,saved.flasks);
  this.armed=saved.armed&&(this.area==='village'||this.area==='interior'&&!this.trainingArea()||this.progress[saved.region].coins>=(this.area==='tutorial'?3:REGIONS[saved.region].awaken));this.profile.blade=this.armed;this.ultimate=saved.ultimate;this.elapsed=saved.elapsed;this.score=saved.score;this.kills=saved.kills;this.deaths=saved.deaths;
  this.campVisits=new Set(saved.villages);
  if(this.area==='interior'){const h=this.houses.find(h=>h.village===this.villageIndex&&h.role===saved.interiorRole);if(h){this.enterHouse(h,true);this.interiorReturn=saved.interiorReturn;}else this.area='village';}
  const bounds=this.playerBounds(),at=clampPoint(saved.player,bounds);this.checkpoint={x:villagePosition(this.lastVillage).x+15,y:645};
  this.player.setPosition(at.x,at.y).setTexture(this.profile.skin).setAlpha(1).clearTint().setAngle(0);this.cameras.main.centerOn(at.x,at.y);
  for(const e of saved.enemies){const enemy=this.spawnEnemy(e.kind,e.region,e.variant,{x:e.x,y:e.y});enemy.hp=Math.min(enemy.maxHP,e.hp);enemy.phase2=e.phase2;enemy.training=e.training;if(e.training&&this.lessonIndex<10&&this.lessonIndex!==3){enemy.stun=999;enemy.speed=0;}else if(e.training){enemy.damage=5;enemy.speed=65;enemy.clock=.8;}}
  for(const c of saved.coins)this.spawnCoin(c.region,false,c);for(const c of saved.chests)this.spawnChest(c);
  const p=this.progress[this.regionIndex];if(p.spawned&&!p.bossDead&&!this.enemies.some(e=>e.region===this.regionIndex&&e.kind==='boss'))p.spawned=false;
  this.attackTime=-1;this.counterLeft=0;this.counterTarget=-1;this.counterStrike=false;this.activeSkill=null;this.skillCooldowns={};this.shieldLeft=0;this.waveClock=WAVE_FIRST;this.dodgeLeft=0;this.dodgeWait=0;this.hurtLeft=1.2;this.hurtFlash=0;this.healWait=0;this.regenDelay=0;this.ultimateLeft=0;this.mouse=null;this.resetInput();this.resetWeather();
  this.audio.setSettings(saved.audio);this.audio.setRegion(this.regionIndex);for(const id of ['menu-overlay','map-overlay','shop-overlay','dialog-overlay','loot-overlay','intro-overlay'])this.element(id).hidden=true;
  this.hideModal();this.state='playing';this.configureCamera();this.element('training-panel').hidden=!this.trainingArea();if(this.trainingArea())this.renderLesson();this.makeQuestProps(saved.wisp);this.guideWanted=true;this.syncGuide();this.dirty=false;this.drawGates();this.drawActors();this.updateHUD();this.refreshSaveUI();
  if(this.progress.every(v=>v.cleared)){this.state='won';this.showModal('СЕМЬЯ СПАСЕНА','Дом снова ждёт тебя.','Это сохранение завершённого путешествия. Можно начать новое.','Новое путешествие ↗',false);this.showStats();this.element('modal-save').hidden=false;}
  this.tutorialFinished=this.lessonIndex>=LESSONS.length;this.updateTeachingUI();this.syncAchievements(false);this.toast(saved.migrated?'Сохранение v6 перенесено в расширенный мир. Для записи обновления нажми «Сохранить прогресс».':'Загружено ручное сохранение.');
 }
 private setGuideText():void{
  const hint=this.element('overlay').querySelector('.control-hint');if(hint)hint.textContent='WASD - идти · мышь - прицел · ЛКМ / ПКМ - приёмы · C - парирование · Tab - меню';
  const grid=this.element('guide').querySelector('.guide-grid');if(grid)grid.innerHTML='<span><b>WASD / стрелки</b> движение</span><span><b>Мышь + ЛКМ</b> удар по прицелу</span><span><b>ПКМ</b> второй приём оружия</span><span><b>C</b> парирование · затем ЛКМ</span><span><b>Space / Shift</b> уклонение</span><span><b>1 / 2 / 3 · R</b> навыки · абсолютное умение</span><span><b>Q / V</b> фляга / зелье</span><span><b>E · M</b> действие · карта</span><span><b>Tab / Esc · H · P</b> меню · справка · пауза</span>';
 }
 private syncGuide():void{this.element('guide').hidden=!this.guideWanted||this.state!=='playing';if(this.state!=='playing'&&this.state!=='won')this.element('achievement-banner').hidden=true;}
 private toggleGuide(show?:boolean):void{this.guideWanted=show??!this.guideWanted;this.syncGuide();}
 private toggleMap():void{
  if(this.state==='map'){this.state=this.mapReturn;this.element('map-overlay').hidden=true;if(this.state==='menu')this.element('menu-overlay').hidden=false;this.syncGuide();return;}
  if(this.state!=='playing'&&this.state!=='paused'&&this.state!=='menu')return;this.mapReturn=this.state;this.state='map';this.lessonEvent('map');this.resetInput();this.element('menu-overlay').hidden=true;this.element('map-overlay').hidden=false;this.syncGuide();this.drawMaps();
 }
 private drawMaps():void{
  const draw=(id:string,large:boolean)=>{const canvas=this.element<HTMLCanvasElement>(id),ctx=canvas.getContext('2d');if(!ctx)return;
   const w=canvas.width,h=canvas.height,pad=large?30:7,sx=(w-pad*2)/WORLD_WIDTH,sy=(h-pad*2)/WORLD_HEIGHT;ctx.clearRect(0,0,w,h);ctx.fillStyle='#102c24';ctx.fillRect(0,0,w,h);
   const point=(p:Point)=>({x:pad+p.x*sx,y:pad+p.y*sy});
   for(let i=0;i<REGIONS.length;i++){const p=point({x:regionStart(i),y:70}),width=REGION_WIDTH*sx,height=960*sy;
    ctx.fillStyle=i<=this.regionIndex||this.progress[i].cleared?REGIONS[i].palette.ground:'#1c342b';ctx.fillRect(p.x,p.y,width,height);ctx.strokeStyle=this.progress[i].cleared?'#b9d78a':i===this.regionIndex?'#b1e9df':'#456254';ctx.lineWidth=large?2:1;ctx.strokeRect(p.x,p.y,width,height);
    if(large){ctx.fillStyle=i<=this.regionIndex?'#e0ead6':'#779085';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText(`${i+1} · ${REGIONS[i].name.split(' ')[0]}`,p.x+width/2,19,width-4);ctx.font='10px system-ui';ctx.fillText(this.progress[i].cleared?'Пройдено':i===this.regionIndex?`${this.progress[i].coins}/${REGIONS[i].coins} ◈`:'Не исследовано',p.x+width/2,h-7);}
   }
   ctx.strokeStyle='#bcb18588';ctx.lineWidth=large?6:3;ctx.beginPath();const left=point({x:0,y:550}),right=point({x:WORLD_WIDTH,y:550});ctx.moveTo(left.x,left.y);ctx.lineTo(right.x,right.y);ctx.stroke();
   if(large)for(const t of this.terrain){if(t.x>regionEnd(this.regionIndex))continue;const p=point(t);ctx.fillStyle=t.kind==='puddle'?'#5b9291':'#263f30';ctx.beginPath();ctx.arc(p.x,p.y,Math.max(1,t.radius*sx),0,Math.PI*2);ctx.fill();}
   for(const c of this.coins){if(c.region!==this.regionIndex)continue;const p=point(c.sprite);ctx.fillStyle='#a8eeee';ctx.beginPath();ctx.arc(p.x,p.y,large?3:1.5,0,Math.PI*2);ctx.fill();}
   for(const i of this.campVisits){const p=point(villagePosition(i));ctx.fillStyle='#f5c78d';ctx.fillRect(p.x-3,p.y-4,6,8);}
   this.merchants.forEach((m,i)=>{if(i>this.regionIndex)return;const p=point(m);ctx.fillStyle=this.progress[i].cleared?'#efd7ac':'#778b79';ctx.fillRect(p.x-3,p.y-4,6,8);});
   for(const c of this.chests){if(c.opened||c.region!==this.regionIndex)continue;const p=point(c);ctx.fillStyle='#d5bdf2';ctx.fillRect(p.x-4,p.y-4,8,8);ctx.strokeStyle='#fff2d0';ctx.lineWidth=1;ctx.strokeRect(p.x-4,p.y-4,8,8);}
   for(const e of this.enemies)if(e.kind==='boss'&&!e.dead&&e.region===this.regionIndex){const p=point(e.sprite);ctx.fillStyle='#e38d9a';ctx.beginPath();ctx.arc(p.x,p.y,large?6:3,0,Math.PI*2);ctx.fill();}
   for(const q of this.questProps){const p=point(q.point);ctx.fillStyle='#f3d294';ctx.fillRect(p.x-3,p.y-3,6,6);}
   if(this.wisp){const p=point(this.wisp);ctx.fillStyle='#ffe6a1';ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.fill();}
   const p=point(this.player);ctx.fillStyle='#f6aa65';ctx.strokeStyle='#fff2c7';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,large?6:3.4,0,Math.PI*2);ctx.fill();ctx.stroke();
  };draw('minimap',false);
  if(!this.element('map-overlay').hidden){
   if(this.mapMode==='local')this.drawLocalMap();else{
    draw('world-map',true);
    const canvas=this.element<HTMLCanvasElement>('world-map'),c=canvas.getContext('2d');
    if(c)for(const [i,q]of this.journalEntries().filter(q=>q.available&&!q.done&&q.point).entries()){
     const x=30+q.point!.x*(canvas.width-60)/WORLD_WIDTH,y=30+q.point!.y*(canvas.height-60)/WORLD_HEIGHT;
     c.fillStyle=q.id===this.profile.trackedQuest?'#ffe1a0':'#c5b1e4';c.strokeStyle='#172c2a';c.lineWidth=2;c.beginPath();c.arc(x,y,11,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#142b28';c.textAlign='center';c.font='bold 13px system-ui';c.fillText(String(i+1),x,y+4);
    }
    this.element('map-title').textContent='Восемь печатей · путь к семье';
   }
   for(const b of document.querySelectorAll<HTMLButtonElement>('[data-map-mode]'))b.classList.toggle('selected',b.dataset.mapMode===this.mapMode);
   this.element('map-regions').innerHTML=REGIONS.map((r,i)=>`<button data-map-region="${i}" ${i>this.regionIndex&&!this.progress[i].cleared?'disabled':''} class="${i===(this.mapFocusRegion??this.regionIndex)?'current':''}">${this.progress[i].cleared?'✓':i+1} · ${r.name}</button>`).join('');
  }
 }
 private drawLocalMap():void{
  const canvas=this.element<HTMLCanvasElement>('world-map'),c=canvas.getContext('2d');if(!c)return;
  const w=canvas.width,h=canvas.height,region=this.mapFocusRegion??this.regionIndex;
  const village=this.mapFocusVillage??(this.mapFocusRegion===null&&this.area!=='biome'?this.villageIndex:null);
  const isVillage=village!==null,start=isVillage?village!<0?0:regionEnd(village!):regionStart(region),width=isVillage?village!<0?PROLOGUE_WIDTH:ROAD_WIDTH:REGION_WIDTH;
  const title=isVillage?VILLAGE_NAMES[village!+1]:REGIONS[region].name,scale=Math.min(620/width,(h-70)/WORLD_HEIGHT),mx=40+(620-width*scale)/2,my=43;
  const pos=(p:Point)=>({x:mx+(p.x-start)*scale,y:my+p.y*scale}),inside=(p:Point)=>p.x>=start&&p.x<=start+width&&p.y>=0&&p.y<=WORLD_HEIGHT;
  c.clearRect(0,0,w,h);c.fillStyle='#112824';c.fillRect(0,0,w,h);c.fillStyle=isVillage?'#526e4d':REGIONS[region].palette.ground;c.fillRect(mx,my,width*scale,WORLD_HEIGHT*scale);
  c.strokeStyle='#c2c5a63b';c.lineWidth=1;
  for(let n=0;n<=5;n++){const x=mx+width*scale*n/5,y=my+WORLD_HEIGHT*scale*n/5;c.beginPath();c.moveTo(x,my);c.lineTo(x,my+WORLD_HEIGHT*scale);c.moveTo(mx,y);c.lineTo(mx+width*scale,y);c.stroke();}
  c.strokeStyle='#d6c694';c.lineWidth=3;c.strokeRect(mx,my,width*scale,WORLD_HEIGHT*scale);
  c.strokeStyle='#bbac8299';c.lineWidth=isVillage?18:10;c.beginPath();const a=pos({x:start,y:550}),b=pos({x:start+width,y:550});c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
  if(isVillage){const at=villagePosition(village!);c.lineWidth=10;c.beginPath();const a=pos({x:at.x,y:160}),b=pos({x:at.x,y:970});c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
  for(const t of this.terrain)if(inside(t)){
   const p=pos(t),r=Math.max(2,t.radius*scale);c.fillStyle=t.kind==='puddle'?'#74adba':t.kind==='tree'?'#253e2b':t.kind==='stump'?'#9a7b4b':'#768879';c.strokeStyle='#0d292662';c.lineWidth=1;c.beginPath();c.ellipse(p.x,p.y,r,r*.83,0,0,Math.PI*2);c.fill();c.stroke();
  }
  const dot=(p:Point,color:string,size:number)=>{if(!inside(p))return;const q=pos(p);c.fillStyle=color;c.beginPath();c.arc(q.x,q.y,size,0,Math.PI*2);c.fill();};
  if(isVillage){
   for(const house of this.houses.filter(h=>h.village===village)){
    const p=pos(house),role=resident(village!,house.role),color=house.role==='smith'?'#d89252':house.role==='armorer'?'#9db9d4':house.role==='healer'?'#a4d498':'#c8abdf';
    c.fillStyle=color;c.fillRect(p.x-29,p.y-29,58,57);c.strokeStyle='#e9dfb3';c.lineWidth=2;c.strokeRect(p.x-29,p.y-29,58,57);const door=pos(house.door);c.fillStyle='#f8dea2';c.fillRect(door.x-5,door.y-4,10,6);c.textAlign='center';c.font='bold 14px system-ui';c.fillStyle='#edecd5';c.fillText(`${role.name} · ${role.job}`,p.x,p.y+48);
   }
   const at=villagePosition(village!);dot({x:at.x+15,y:655},'#ffd690',7);dot({x:at.x-85,y:442},'#88cbd7',5);dot({x:at.x-300,y:611},'#d2ac71',6);
  }else{
   for(const coin of this.coins)dot(coin.sprite,'#b6f5ed',3);
   for(const e of this.enemies)if(!e.dead&&e.region===region)dot(e.sprite,e.kind==='boss'?'#fc8f99':'#e39389',e.kind==='boss'?8:3.5);
   if(!this.progress[region].bossDead){c.fillStyle='#bdbbdf99';c.fillRect(mx-2,my,6,WORLD_HEIGHT*scale);c.fillRect(mx+width*scale-4,my,6,WORLD_HEIGHT*scale);}
   if(region===3&&this.lines.some(q=>q.id==='wisp'&&q.accepted&&!q.claimed)){dot({x:regionEnd(3)-80,y:615},'#ffe3a0',7);const p=pos({x:regionEnd(3)-80,y:615});c.textAlign='right';c.font='13px system-ui';c.fillStyle='#ffe3a0';c.fillText('Костёр огонька',p.x-10,p.y-10);}
  }
  for(const chest of this.chests)if(!chest.opened&&inside(chest)){const p=pos(chest);c.fillStyle='#d8bbf6';c.fillRect(p.x-6,p.y-5,12,10);c.strokeStyle='#f4e5b7';c.strokeRect(p.x-6,p.y-5,12,10);}
  const all=this.journalEntries().filter(q=>q.available&&!q.done&&q.point),local=all.filter(q=>inside(q.point!)),selected=all.find(q=>q.id===this.profile.trackedQuest);
  for(const q of local){const p=pos(q.point!),n=all.indexOf(q)+1,tracked=q.id===this.profile.trackedQuest;c.fillStyle=tracked?'#ffdfa0':'#d2bde9';c.strokeStyle='#18332a';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,tracked?13:10,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#1e322a';c.textAlign='center';c.font='bold 14px system-ui';c.fillText(String(n),p.x,p.y+5);}
  if(inside(this.player)){const p=pos(this.player);c.save();c.translate(p.x,p.y);c.rotate(this.face);c.fillStyle='#ffb87a';c.strokeStyle='#fff2cb';c.lineWidth=2;c.beginPath();c.moveTo(11,0);c.lineTo(-7,-6);c.lineTo(-3,0);c.lineTo(-7,6);c.closePath();c.fill();c.stroke();c.restore();}
  c.textAlign='left';c.font='bold 19px system-ui';c.fillStyle='#e9e2c4';c.fillText(title,mx,27);c.font='12px system-ui';c.fillStyle='#a7c8b9';c.fillText('СЕВЕР ↑ · ВОСТОК →',mx,h-9);
  c.strokeStyle='#90b4a14a';c.beginPath();c.moveTo(695,24);c.lineTo(695,h-20);c.stroke();
  const wrap=(text:string,x:number,y:number,maxWidth:number,size=15,color='#c5d7c8')=>{c.font=`${size}px system-ui`;c.fillStyle=color;let line='',offset=0;for(const word of text.split(' ')){const next=line?line+' '+word:word;if(c.measureText(next).width>maxWidth&&line){c.fillText(line,x,y+offset);offset+=size+6;line=word;}else line=next;}if(line){c.fillText(line,x,y+offset);offset+=size+6;}return y+offset;};
  c.font='bold 18px system-ui';c.fillStyle='#f0d89d';c.fillText('ЦЕЛЬ ДНЕВНИКА',722,39);let y=67;
  if(selected){c.font='bold 17px system-ui';c.fillStyle='#f0e5c4';c.fillText(`${all.indexOf(selected)+1}. ${selected.title}`,722,y);y=wrap(selected.next,722,y+27,340,16);if(!inside(selected.point!))y=wrap('Цель в другой области. Вернись в дневник и нажми «Цель на карте», чтобы открыть её место.',722,y+8,340,13,'#e1b795');}
  else y=wrap('Tab → Задания: выбери поручение и отметь цель. Номера на карте соответствуют записям ниже.',722,y,340,15);
  y+=19;c.font='bold 16px system-ui';c.fillStyle='#c4d7c2';c.fillText('В ЭТОЙ ОБЛАСТИ',722,y);y+=25;
  for(const q of local.slice(0,3)){y=wrap(`${all.indexOf(q)+1}. ${q.title}`,722,y,340,14,'#e9d5ae');y=wrap(q.status,740,y,320,12,'#a3c4b4')+7;}
  if(!local.length)y=wrap(isVillage?'Жители отмечены у домов. Подойди к двери и нажми E.':'Оранжевый указатель - ты. Красные точки - враги, светлые - сила.',722,y,340,14);
  if(isVillage&&village===-1&&this.progress[0].elapsed===0){const x=mx+width*scale-9,y=my+550*scale;c.fillStyle='#ffdb93';c.beginPath();c.moveTo(x+10,y);c.lineTo(x-8,y-8);c.lineTo(x-8,y+8);c.closePath();c.fill();c.textAlign='right';c.font='bold 14px system-ui';c.fillText('К первой роще →',x-12,y-14);}
  this.element('map-title').textContent=isVillage?`Деревня · ${title}`:`Биом ${region+1} · ${title}`;
 }

 private togglePause():void{
  if(this.state==='playing'){this.state='paused';this.resetInput();this.syncGuide();this.showPauseModal();}
  else if(this.state==='paused'){this.state='playing';this.hideModal();this.resetInput();this.syncGuide();}
 }
 private showPauseModal():void{this.showModal('ПРИВАЛ','Мир ждёт тебя.','Время остановлено. Tab открывает вещи, задания и карту. Для следующего запуска сохрани прогресс вручную.','Снять паузу ↗',false);this.element('restart-button').hidden=false;this.element('modal-save').hidden=false;}
 private primaryAction():void{
  this.audio.unlock();if(this.state==='ready'){this.askTraining();}else if(this.state==='paused')this.togglePause();else if(this.state==='won')this.requestNew();
 }
 private showModal(tag:string,title:string,description:string,button:string,rules:boolean):void{
  this.element('modal-tag').textContent=tag;this.element('modal-title').textContent=title;this.element('modal-description').textContent=description;this.element('primary-button').textContent=button;
  this.element('start-rules').hidden=!rules;this.element('modal-stats').hidden=true;this.element('restart-button').hidden=true;this.element('modal-save').hidden=true;this.element('load-start').hidden=!rules||!this.saved;this.element('start-save-note').hidden=!rules;this.element('overlay').hidden=false;
 }
 private hideModal():void{this.element('overlay').hidden=true;}
 private showStats():void{const s=this.element('modal-stats');s.hidden=false;s.innerHTML=`<span><b>${this.score}</b> очков</span><span><b>${this.kills}</b> врагов</span><span><b>${this.deaths}</b> смертей</span><span><b>${Math.floor(this.elapsed)} с</b> в пути</span><span><b>${this.profile.coins} ◈</b> осколков</span>`;}
 private resetInput():void{this.velocity={x:0,y:0};this.mouseHeld=false;this.input.keyboard?.resetKeys();}
 private updateWeather(dt:number):void{
  if(this.progress[this.regionIndex].cleared){if(this.weather!=='clear')this.resetWeather();return;}
  this.weatherNext-=dt;
  if(this.weather==='clear'&&this.weatherNext<=0){
   this.weather=randomWeather(this.regionIndex);this.weatherLeft=WEATHER_DURATION;this.strikeNext=1.5;
   this.wetZones=this.weather==='rain'||this.weather==='storm'?Array.from({length:3},()=>({...this.freePosition(this.regionIndex,20,0),radius:90+Math.random()*40})):[];
   if(this.weather==='hurricane')this.hurricane={...this.freePosition(this.regionIndex,30,220),phase:0};
   this.toast(WEATHER_HINTS[this.weather]);
  }
  if(this.weather==='clear')return;this.weatherLeft-=dt;
  if(this.weather==='storm'){
   this.strikeNext-=dt;if(!this.strike&&this.strikeNext<=0){const target=Math.random()<.6?{x:this.player.x+this.velocity.x*.35,y:this.player.y+this.velocity.y*.35}:this.freePosition(this.regionIndex,30,0);this.strike={...clampPoint(target,this.regionBounds(this.regionIndex)),left:LIGHTNING_WARNING,phase:'warning'};}
   if(this.strike){this.strike.left-=dt;if(this.strike.left<=0){if(this.strike.phase==='warning'){
    this.strike.phase='impact';this.strike.left=.3;this.audio.play('thunder');
    if(Math.hypot(this.player.x-this.strike.x,this.player.y-this.strike.y)<LIGHTNING_RADIUS+PLAYER_RADIUS&&this.dodgeLeft<=0){this.slowed=1.8;this.damagePlayer(12+this.regionIndex*3,this.strike,true);}
    this.weatherHitEnemies(this.strike,LIGHTNING_RADIUS,10);this.particles(this.strike.x,this.strike.y,14,0xc4d8eb);
   }else{this.strike=null;this.strikeNext=2.2+Math.random()*1.5;}}}
  }else if(this.weather==='meteors'){
   this.strikeNext-=dt;if(this.strikeNext<=0){const target=Math.random()<.55?{x:this.player.x+this.velocity.x*.4,y:this.player.y+this.velocity.y*.4}:this.freePosition(this.regionIndex,30,0),at=clampPoint(target,this.regionBounds(this.regionIndex));
    this.hazards.push({...at,region:this.regionIndex,radius:METEOR_RADIUS,warning:METEOR_WARNING,left:METEOR_WARNING+.6,damage:16+this.regionIndex*2,kind:'meteor',fired:false,environment:true});this.strikeNext=2.9+Math.random();}
  }else if(this.weather==='hurricane'&&this.hurricane){
   const z=this.hurricane;z.phase+=dt;const at=clampPoint({x:z.x+Math.cos(z.phase*.7)*38*dt,y:z.y+Math.sin(z.phase*.9)*31*dt},this.regionBounds(this.regionIndex));z.x=at.x;z.y=at.y;
   const pull=(point:Point,radius:number,terrain:Terrain[],bounds:Bounds)=>{const dx=z.x-point.x,dy=z.y-point.y,d=Math.hypot(dx,dy);return d<HURRICANE_RADIUS&&d>8?moveCircle(point,dx/d*HURRICANE_PULL*dt,dy/d*HURRICANE_PULL*dt,radius,terrain,bounds):point;};
   if(this.dodgeLeft<=0){const moved=pull(this.player,PLAYER_RADIUS,this.activeTerrain(),this.playerBounds());this.player.setPosition(moved.x,moved.y);if(Math.hypot(z.x-this.player.x,z.y-this.player.y)<37)this.damagePlayer(6+this.regionIndex,z,true);}
   for(const e of this.enemies)if(!e.dead&&e.region===this.regionIndex){const moved=pull(e.sprite,e.radius,this.terrainByRegion[e.region],this.enemyBounds(e));e.sprite.setPosition(moved.x,moved.y);if(Math.hypot(z.x-e.sprite.x,z.y-e.sprite.y)<37)e.hp=Math.max(0,e.hp-7*dt);if(e.hp===0)this.killEnemy(e);}
   this.windSoundLeft-=dt;if(this.windSoundLeft<=0){this.audio.play('wind');this.windSoundLeft=1.8;}
  }
  if(this.weatherLeft<=0){this.weather='clear';this.weatherNext=15+Math.random()*12;this.wetZones=[];this.strike=null;this.hurricane=null;}
 }
 private cone(g:Phaser.GameObjects.Graphics,at:Point,angle:number,radius:number,arc:number,color:number,alpha:number):void{
  const points:Point[]=[{x:at.x,y:at.y}];for(let n=0;n<=14;n++){const a=angle-arc+n/14*arc*2;points.push({x:at.x+Math.cos(a)*radius,y:at.y+Math.sin(a)*radius});}
  g.fillStyle(color,alpha);g.fillPoints(points.map(p=>new Phaser.Math.Vector2(p.x,p.y)),true);g.lineStyle(2,color,Math.min(.9,alpha*4));g.beginPath();g.arc(at.x,at.y,radius,angle-arc,angle+arc,false);g.strokePath();
 }
 private animateResidents():void{
  const t=this.animationTime,fur=[0xb9aea1,0xc1b6a1,0xb6a284,0x949aa4,0xc3b9a2,0x697583,0x9e8263,0xba8261];
  for(const n of this.villagers){
   const inside=this.area==='interior'&&n.village===this.villageIndex&&n.role===this.interiorRole;
   const outside=(this.area==='village'||this.area==='tutorial')&&n.village===this.villageIndex;
   const visible=inside||outside;n.sprite.setVisible(visible);n.gesture.clear().setVisible(visible);if(!visible){n.near=false;continue;}
   const h=this.houses.find(h=>h.village===n.village&&h.role===n.role)!;
   const at=inside?{x:h.x+15,y:h.y-27}:{x:h.door.x+65,y:h.door.y+20};
   n.sprite.setPosition(at.x,at.y).setScale(86/128,86/128*(1+Math.sin(t*2+n.village+n.role.length)*.006)).setDepth(20+at.y*.01);
   const distance=Math.hypot(this.player.x-at.x,this.player.y-at.y);
   if(this.state==='playing'&&distance<195&&!n.near){n.near=true;n.greetUntil=t+1.8;}
   if(distance>260)n.near=false;
   if(n.greetUntil<=t)continue;
   const species=Number(n.sprite.texture.key.split('-')[1]),side=this.player.x<at.x?-1:1,elbow={x:at.x+side*23,y:at.y-5},hand={x:at.x+side*(28+Math.sin((n.greetUntil-t)*12)*5),y:at.y-30};
   const g=n.gesture;g.setDepth(n.sprite.depth+.1).lineStyle(5,0x594e43,1);g.lineBetween(at.x+side*12,at.y-10,elbow.x,elbow.y);g.fillStyle(0x594e43,1);g.fillCircle(elbow.x,elbow.y,2.5);g.lineBetween(elbow.x,elbow.y,hand.x,hand.y);g.fillStyle(fur[species]??0xb9aea1,1);g.fillEllipse(hand.x,hand.y,7,8);g.lineStyle(1,0xe8d4a4,.6);g.lineBetween(hand.x+side*9,hand.y-4,hand.x+side*14,hand.y-7);
  }
 }
 private hideArms():void{for(const arm of this.arms)for(const part of [arm.upper,arm.forearm,arm.hand])part.setVisible(false);}
 private bodyPoint(x:number,y:number,lift:number):Point{
  const a=this.player.rotation;return{x:this.player.x+Math.cos(a)*x-Math.sin(a)*y,y:this.player.y-lift+Math.sin(a)*x+Math.cos(a)*y};
 }
 private drawArm(index:number,shoulder:Point,grip:Point,rotation:number,depth:number,open=false,side=1):void{
  const parts=this.arms[index],angle=rotation-Math.PI/2,wrist={x:grip.x-Math.cos(angle)*7,y:grip.y-Math.sin(angle)*7};
  const elbow=armElbow(shoulder,wrist,(index===0?1:-1)*side),alpha=this.player.alpha;
  const segment=(image:Phaser.GameObjects.Image,from:Point,to:Point,width:number)=>image.setVisible(true).setPosition(from.x,from.y).setDisplaySize(width,Math.hypot(to.x-from.x,to.y-from.y)+1.3).setRotation(Math.atan2(to.y-from.y,to.x-from.x)-Math.PI/2).setDepth(depth).setAlpha(alpha);
  parts.upper.setTexture(`${this.profile.skin}-arm-upper`);segment(parts.upper,shoulder,elbow,8.5);segment(parts.forearm,elbow,wrist,7.7);
  parts.hand.setVisible(true).setTexture(open?'hand-open':index===0?'hand-grip':'hand-palm').setOrigin(.5,.35).setPosition(grip.x,grip.y).setDisplaySize(open?12:10,15).setRotation(rotation).setDepth(depth+.32).setAlpha(alpha);
  for(const part of [parts.upper,parts.forearm,parts.hand])if(this.hurtFlash>0)part.setTint(0xff8c92);else part.clearTint();
 }
 private drawActors():void{
  const t=this.animationTime,item=weaponFor(this.profile),spec=this.currentAttackSpec(),w={...item,...spec},moving=Math.hypot(this.velocity.x,this.velocity.y)>10;
  const facing=this.dodgeLeft>0?Math.atan2(this.dodgeVector.y,this.dodgeVector.x):this.ultimateLeft>0?this.ultimateAngle:this.attackTime>=0?this.attackAngle:this.face;
  const direction=Math.abs(Math.cos(facing))>.72?(Math.cos(facing)<0?'left':'right'):Math.sin(facing)<0?'back':'front';
  const rollPhase=Math.min(3,Math.floor((1-this.dodgeLeft/DODGE_TIME)*4));
  const held=this.armed&&this.state!=='dying'&&!(this.state==='intro'&&INTRO_DURATION-this.introLeft>=WEAPON_STEAL_AT);
  let poseTime=this.attackTime,poseAngle=this.attackTime>=0?this.attackAngle:this.face,poseSpec={windup:w.windup,activeEnd:w.activeEnd,duration:w.duration,arc:w.arc},poseHeavy=this.heavyAttack,poseCombo=this.combo,chain=false;
  if(spec.pulses>1&&poseTime>=w.windup&&poseTime<=w.activeEnd){const pulse=Math.min(spec.pulses-.00001,(poseTime-w.windup)/Math.max(.01,w.activeEnd-w.windup)*spec.pulses);poseCombo=Math.floor(pulse);poseTime=pulse%1;poseSpec={windup:0,activeEnd:1,duration:1,arc:w.arc};chain=true;}
  if(this.ultimateLeft>0){const total=.86-this.ultimateLeft,cycle=w.style==='axe'||w.style==='sword'?.28:.86;poseTime=total%cycle;poseAngle=this.ultimateAngle;poseSpec={windup:cycle*.2,activeEnd:cycle*.7,duration:cycle,arc:w.style==='spear'?.3:1.4};poseHeavy=w.style==='axe';}
  const pose=weaponPose(w.id,poseAngle,poseTime,poseSpec.windup,poseSpec.activeEnd,poseSpec.duration,poseSpec.arc,poseHeavy,{combo:poseCombo,skill:this.activeSkill,guard:this.guardLeft>0,runPhase:moving?this.strideDistance/19*Math.PI/2:undefined,roll:this.dodgeLeft>0?1-this.dodgeLeft/DODGE_TIME:undefined,chain});
  if(this.dodgeLeft>0){const [x,y]=ROLL_GRIPS[direction][rollPhase];pose.handX=(x-64)*92/128;pose.handY=(y-128*.68)*92/128;pose.rotation=facing+Math.PI/2+Math.sin((1-this.dodgeLeft/DODGE_TIME)*Math.PI*2)*.4;}
  const step=Math.floor(this.strideDistance/19)%4,key=this.dodgeLeft>0?`${this.profile.skin}-${direction}-roll-${rollPhase}`:held?`${this.profile.skin}-armed-${direction}${moving?`-step-${step}`:''}`:moving?`${this.profile.skin}-${direction}-step-${step}`:direction==='front'?this.profile.skin:`${this.profile.skin}-${direction}`;
  const lift=this.activeSkill==='axe_leap'&&this.attackTime>=0?Math.sin(Math.min(1,this.attackTime/w.duration)*Math.PI)*12:0;
  this.player.setTexture(key).setOrigin(.5,.68+lift/92).setFlipX(false).setAngle(held?pose.lean:0).setScale(92/128,92/128*(moving||this.dodgeLeft>0?1:1+Math.sin(t*2.5)*.004)).setDepth(20+this.player.y*.01);
  this.playerShadow.setDepth(this.area==='interior'?15:8).setPosition(this.player.x,this.player.y+27).setScale(this.dodgeLeft>0?1.3:1);
  if(this.hurtFlash>0)this.player.setTint(0xff8c92);else this.player.clearTint();this.player.setAlpha(this.hurtLeft>0&&this.state==='playing'?.84+Math.sin(t*32)*.10:1);
  this.armorSprite.setVisible(this.profile.armor!=='travel'&&this.state!=='dying'&&this.dodgeLeft<=0);if(this.profile.armor!=='travel')this.armorSprite.setTexture(`armor-${this.profile.armor}`).setPosition(this.player.x,this.player.y-3-lift).setDisplaySize(34,34).setAngle(this.player.angle).setAlpha(this.player.alpha*.82).setDepth(this.player.depth+.1);
  const swing=pose.angle;
  const hand=this.bodyPoint(pose.handX,pose.handY,lift),art=WEAPON_ART[w.id],rotation=pose.rotation+this.player.rotation,weaponDepth=this.player.depth+(pose.behind?-.15:.5);
  this.sword.setVisible(held).setTexture(weaponTexture(w.id)).clearTint().setDisplaySize(art.size,art.size).setOrigin(art.gripX,art.gripY).setPosition(hand.x,hand.y).setRotation(rotation).setDepth(weaponDepth).setAlpha(this.player.alpha);
  this.hideArms();
  if(held){
   if(this.dodgeLeft>0)this.arms[0].hand.setVisible(true).setTexture('hand-grip').setPosition(hand.x,hand.y).setDisplaySize(10,15).setRotation(rotation).setDepth(weaponDepth+.08).setAlpha(this.player.alpha);
   else{
    const side=Math.cos(facing)<0?-1:1,profile=direction==='left'||direction==='right';
    this.drawArm(0,this.bodyPoint(side*(profile?-8:11),-27,lift),hand,rotation,weaponDepth-.24,false,side);
    this.drawArm(1,this.bodyPoint(profile?-side*3:-side*11,-27,lift),this.bodyPoint(pose.otherX,pose.otherY,lift),pose.both?rotation:pose.casting?pose.otherAngle+this.player.rotation:Math.PI+this.player.rotation,pose.both?weaponDepth-.25:this.player.depth+(direction==='back'||profile?-.20:.18),pose.casting,side);
   }
  }
  this.animateResidents();
  for(let i=0;i<this.biomeMoods.length;i++)setBiomeMood(this.biomeMoods[i],this.progress[i]?.cleared===true,this.area==='interior');
  this.attackImageCursor=0;
  const g=this.combatInk;g.clear();
  const active=this.attackTime>=w.windup&&this.attackTime<=w.activeEnd||this.ultimateLeft>0&&poseTime>=poseSpec.windup&&poseTime<=poseSpec.activeEnd;
  const tipDistance=(art.gripY-art.tipY)*art.size,tip={x:hand.x+Math.cos(rotation-Math.PI/2)*tipDistance,y:hand.y+Math.sin(rotation-Math.PI/2)*tipDistance};
  if(!held||!active||this.trailWeapon!==w.id||this.attackTime<this.trailAttack)this.weaponTrail=[];
  this.trailWeapon=w.id;this.trailAttack=this.attackTime;
  if(held&&active){
   const last=this.weaponTrail.at(-1);if(!last||Math.hypot(tip.x-last.x,tip.y-last.y)>.5)this.weaponTrail.push(tip);if(this.weaponTrail.length>7)this.weaponTrail.shift();
   for(let i=1;i<this.weaponTrail.length;i++){const from=this.weaponTrail[i-1],to=this.weaponTrail[i];g.lineStyle(2+i*.7,w.color,i/this.weaponTrail.length*.45);g.lineBetween(from.x,from.y,to.x,to.y);}
  }
  if(held&&w.style==='staff'&&(this.attackTime>=0||this.ultimateLeft>0))this.drawCombatImage(w.id==='runicstaff'?'shot-spirit':'shot-violet',tip.x,tip.y,25+Math.sin(t*30)*3,swing,active?.75:.30);
  for(const fx of this.effects){const fade=fx.life/fx.max,reach=fx.radius*(1+(1-fade)*.25);g.lineStyle(9*fade+1,fx.color,fade*.65);if(fx.kind==='slash')this.drawCombatImage('fx-slash',fx.x+Math.cos(fx.angle)*reach*.52,fx.y+Math.sin(fx.angle)*reach*.52,reach*1.2,fx.angle,fade*.75);if(fx.kind==='ring')g.strokeCircle(fx.x,fx.y,reach);else if(fx.kind==='thrust')g.lineBetween(fx.x,fx.y,fx.x+Math.cos(fx.angle)*reach,fx.y+Math.sin(fx.angle)*reach);else{g.beginPath();g.arc(fx.x,fx.y,reach,fx.angle-.8,fx.angle+.8,false);g.strokePath();}}
  if(this.counterLeft>0){const e=this.enemies.find(e=>e.id===this.counterTarget&&!e.dead);if(e){g.lineStyle(3,0xffe4a0,.8);g.strokeCircle(e.sprite.x,e.sprite.y,e.radius+20+Math.sin(t*16)*3);g.lineBetween(this.player.x,this.player.y,e.sprite.x,e.sprite.y);}}
  if(this.shieldLeft>0){g.lineStyle(3,0xb1e8ec,.6);g.strokeCircle(this.player.x,this.player.y,43+Math.sin(t*5)*3);}
  if(this.guardLeft>0)this.cone(g,this.player,this.face,60,1.1,0xffe3a1,.22);
  this.drawTeachingCue(g);
  if(this.mouse&&this.state==='playing'){const at=this.cameras.main.getWorldPoint(this.mouse.x,this.mouse.y);g.lineStyle(1,0xb7f0e9,.62);g.strokeCircle(at.x,at.y,6);g.lineBetween(at.x-10,at.y,at.x-3,at.y);g.lineBetween(at.x+3,at.y,at.x+10,at.y);}
  if(this.attackTime>=0){const active=this.attackTime>=w.windup&&this.attackTime<=w.activeEnd,alpha=active?.50:this.attackTime<w.windup?.08:Math.max(0,.24*(1-(this.attackTime-w.activeEnd)/(w.duration-w.activeEnd)));
   if(w.type==='thrust'||this.activeSkill==='axe_fault'){g.lineStyle(active?2:1,w.color,alpha*.4);g.lineBetween(hand.x,hand.y,this.player.x+Math.cos(this.attackAngle)*w.reach,this.player.y+Math.sin(this.attackAngle)*w.reach);}
   else if(w.type!=='magic'){g.lineStyle(active?4:2,w.color,alpha*.55);g.beginPath();g.arc(this.player.x,this.player.y,w.reach*.8,this.attackAngle-w.arc,this.attackAngle+w.arc,false);g.strokePath();if(active){g.lineStyle(1,0xf5ffeb,.40);g.lineBetween(hand.x,hand.y,tip.x,tip.y);}}
  }
  if(this.ultimateLeft>0){g.lineStyle(5,w.color,this.ultimateLeft/.86*.75);if(w.style==='spear')g.lineBetween(this.player.x,this.player.y,this.player.x+Math.cos(this.ultimateAngle)*440,this.player.y+Math.sin(this.ultimateAngle)*440);else g.strokeCircle(this.player.x,this.player.y,(w.style==='axe'?150:185)*(1-this.ultimateLeft/.86*.4));}
  for(const h of this.hazards){const warning=h.warning>0,color=h.kind==='sigil'?weaponFor(this.profile).color:h.kind==='poison'?0x9eba71:h.kind==='curse'?0xb19cdb:h.kind==='wave'?0xe5ca9e:h.kind==='ring'?0xb7a5e3:warning?0xf38e83:0xffc485;
   g.fillStyle(color,warning?.10:.19);if(h.kind!=='wave')g.fillCircle(h.x,h.y,h.radius);g.lineStyle(warning?2:3,color,.7);g.strokeCircle(h.x,h.y,h.radius);
   if(warning){g.lineStyle(1,0xf2e6bb,.55);g.strokeCircle(h.x,h.y,h.radius*(1-Math.min(1,h.warning/1.7)));}
   if(h.kind==='meteor'){const fraction=warning?Math.min(1,h.warning/(h.environment?METEOR_WARNING:1.8)):0;this.drawCombatImage('fx-meteor',h.x-fraction*105,h.y-fraction*230,warning?92:116,.12,warning?.9:Math.max(0,h.left)*.7);}
   if(h.kind==='poison'||h.kind==='curse'){this.drawCombatImage(h.kind==='poison'?'shot-acid':'shot-violet',h.x,h.y,50+Math.sin(t*5)*6,t*.1,warning?.35:.6);}
  }
  for(const e of this.enemies){if(e.dead)continue;const walk=e.mode==='chase'||e.mode==='charge',bounce=walk?Math.sin(t*(e.mode==='charge'?25:13)+e.id):0,size=e.kind==='boss'?148:e.kind==='dragon'?103:e.kind==='zombie'?83:78;
   const anticipates=e.mode==='windup',kick=e.recoil/.26,breathing=Math.sin(t*2.2+e.id)*.006,roaring=e.voiceLeft>0;
   e.sprite.setAngle(anticipates?-e.aim.x*7:e.mode==='charge'?e.aim.x*9:kick*e.aim.x*8+bounce*1.2).setScale(size/128*(roaring?1.035:1),size/128*(1+breathing+(anticipates?-.04:0)+kick*.025+(roaring?.025:0))).setDepth(20+e.sprite.y*.01);
   const mouth={x:e.sprite.x+e.aim.x*(e.radius*.52),y:e.sprite.y-e.radius*.52};
   if(roaring){g.fillStyle(0x120c1e,.8);g.fillEllipse(mouth.x,mouth.y,12,6+Math.sin(t*16)*2);for(let n=0;n<2;n++){const r=15+((1.2-e.voiceLeft)*42+n*15)%40;g.lineStyle(2,0xbfc4ce,(1-r/60)*.30);g.strokeEllipse(mouth.x,mouth.y,r,r*.42);}}
   if(['fan','breath','nova','snipe','summon'].includes(e.move)&&(anticipates||kick>0)){const angle=Math.atan2(e.aim.y,e.aim.x);this.drawCombatImage(this.enemyProjectile(e),mouth.x+e.aim.x*12,mouth.y+e.aim.y*12,anticipates?19+Math.sin(t*15)*3:31,angle,anticipates?.5:kick*.7);}
   e.shadow.setPosition(e.sprite.x,e.sprite.y+e.radius).setVisible(true);if(e.flash>0)e.sprite.setTint(0xdfffe1);else if(e.stun>0)e.sprite.setTint(0x99d1e4);else if(e.mode==='windup')e.sprite.setTint(0xf1beb6);else e.sprite.clearTint();
   if(e.mode==='windup'){const angle=Math.atan2(e.aim.y,e.aim.x);
    if(e.move==='slam'||e.move==='poison'||e.move==='quake'||e.move==='nova'){const radius=e.move==='nova'?190:e.move==='quake'?160:e.move==='slam'?155:e.kind==='boss'?100:72;g.lineStyle(2,0xf78f81,.8);g.fillStyle(0xe28d77,.10);g.fillCircle(e.sprite.x,e.sprite.y,radius);g.strokeCircle(e.sprite.x,e.sprite.y,radius);}
    else if(e.move==='curse'){g.lineStyle(2,0xc9a0e9,.85);g.fillStyle(0x9d70bd,.12);g.fillCircle(e.target.x,e.target.y,100);g.strokeCircle(e.target.x,e.target.y,100);g.lineBetween(e.sprite.x,e.sprite.y,e.target.x,e.target.y);}
    else if(e.move==='blink'){g.lineStyle(2,0xd991b8,.8);g.fillStyle(0xb8698e,.12);g.fillCircle(e.target.x,e.target.y,58);g.strokeCircle(e.target.x,e.target.y,58);g.lineBetween(e.sprite.x,e.sprite.y,e.target.x,e.target.y);}
    else if(e.move==='summon'||e.move==='meteor'){g.lineStyle(2,e.move==='summon'?0xb9aad8:0xf2a98a,.8);g.strokeCircle(e.sprite.x,e.sprite.y,58);for(let n=0;n<6;n++){const a=t*1.5+n*Math.PI/3;g.fillStyle(0xdbc8ea,.6);g.fillCircle(e.sprite.x+Math.cos(a)*58,e.sprite.y+Math.sin(a)*58,3);}}
    else if(e.move==='fan'||e.move==='breath')this.cone(g,e.sprite,angle,240,e.move==='breath'?.55:.60,0xf0968c,.13);
    else if(e.move==='slash'||e.move==='combo')this.cone(g,e.sprite,angle,e.kind==='boss'?143:92,1.2,0xf08c85,.15);
    else{g.lineStyle(3,0xf0968c,.65);g.lineBetween(e.sprite.x,e.sprite.y,e.sprite.x+e.aim.x*240,e.sprite.y+e.aim.y*240);g.strokeCircle(e.sprite.x,e.sprite.y,e.radius+8);}
   }
   if(e.hp<e.maxHP&&e.kind!=='boss'&&e.region===this.regionIndex){g.fillStyle(0x102a22,.8);g.fillRect(e.sprite.x-22,e.sprite.y-e.radius-28,44,4);g.fillStyle(0xcc9e9a,.9);g.fillRect(e.sprite.x-22,e.sprite.y-e.radius-28,44*e.hp/e.maxHP,4);}
   if(e.kind==='boss'){g.lineStyle(2,0xd9bda5,.55);g.strokeCircle(e.sprite.x,e.sprite.y,e.radius+14);const y=e.sprite.y-58;g.lineStyle(2,0xdfc7a2,.8);g.beginPath();g.moveTo(e.sprite.x-13,y);g.lineTo(e.sprite.x-12,y-10);g.lineTo(e.sprite.x-5,y-5);g.lineTo(e.sprite.x,y-15);g.lineTo(e.sprite.x+5,y-5);g.lineTo(e.sprite.x+12,y-10);g.lineTo(e.sprite.x+13,y);g.strokePath();}
  }
  for(const p of this.projectiles){const angle=Math.atan2(p.vy,p.vx),size=p.visual==='shot-bone'?49:p.visual==='shot-bat'?57:44;this.drawCombatImage(p.visual,p.x,p.y,size*(1+Math.sin(t*17+p.x*.01)*.09),angle,.96);g.lineStyle(2,p.color,.28);g.lineBetween(p.x,p.y,p.x-p.vx*.07,p.y-p.vy*.07);}
  for(const c of this.coins){c.sprite.setAngle(Math.sin(t*2+c.phase)*9).setScale(45/128,45/128*(.88+Math.sin(t*3+c.phase)*.10));g.lineStyle(1,0xbef2e7,.20);g.strokeCircle(c.sprite.x,c.sprite.y,22+Math.sin(t*2+c.phase)*3);}
  for(const c of this.chests)if(!c.opened){g.lineStyle(1,0xd8c4f0,.5+Math.sin(t*4)*.2);g.strokeCircle(c.x,c.y,35+Math.sin(t*2)*2);}
  for(const q of this.questProps){q.sprite.setAngle(Math.sin(t*2+q.order)*3);g.lineStyle(2,0xe6ca86,.55);g.strokeCircle(q.point.x,q.point.y,31+Math.sin(t*3)*3);}
  if(this.wisp){g.lineStyle(1,0xf9d491,.3);g.strokeCircle(this.wisp.x,this.wisp.y,155);}
  this.fires.forEach((f,i)=>f.setAlpha(.83+Math.sin(t*9+i)*.14));this.drawWeather();for(let i=this.attackImageCursor;i<this.attackImages.length;i++)this.attackImages[i].setVisible(false);this.updateTeachingUI();
 }
 private drawGates():void{
  const g=this.gateInk;g.clear();if(!this.progress.length||this.area!=='biome')return;const i=this.regionIndex,p=this.progress[i],color=REGIONS[i].fog,left=regionStart(i)+30,right=regionEnd(i)-30;
  const wall=(x:number)=>{g.fillStyle(color,.18);g.fillRect(x-34,65,68,WORLD_HEIGHT-100);g.lineStyle(3,color,.48);g.lineBetween(x,65,x,WORLD_HEIGHT-35);
   for(let n=0;n<25;n++){const y=65+n*42,drift=Math.sin(this.animationTime*1.2+n*1.8)*14;g.fillStyle(color,.10+.08*(1+Math.sin(n+this.animationTime))/2);g.fillEllipse(x+drift,y,65+Math.sin(n)*17,82);}
   g.lineStyle(2,0xdfe3d0,.45);g.strokeCircle(x,550,28);g.beginPath();g.moveTo(x-12,550);g.lineTo(x,532);g.lineTo(x+12,550);g.lineTo(x,568);g.closePath();g.strokePath();};
  if(!p.bossDead){g.fillStyle(0x0a2226,.42);g.fillRect(0,0,Math.max(0,left),WORLD_HEIGHT);wall(left);}
  if(!p.cleared){g.fillStyle(color,.10);g.fillRect(right,0,WORLD_WIDTH-right,WORLD_HEIGHT);wall(right);}
 }
 private updateHUD():void{
  if(!this.progress.length)return;const s=stats(this.profile),r=REGIONS[this.regionIndex],p=this.progress[this.regionIndex],w=weaponFor(this.profile);
  this.element('hp-text').textContent=`${Math.ceil(this.hp)} / ${s.maxHP}`;this.element('hp-fill').style.width=`${Math.max(0,this.hp)/s.maxHP*100}%`;
  this.element('stamina-text').textContent=`${Math.floor(this.stamina)}`;this.element('stamina-fill').style.width=`${this.stamina/s.maxStamina*100}%`;
  this.element('flask-count').textContent=`Q: ${this.flasks} · V: ${this.profile.potions}`;this.element('weapon-label').textContent=this.armed?w.name:`Оружие: сила ${Math.min(p.coins,r.awaken)}/${r.awaken}`;
  this.element('region-number').textContent=`БИОМ ${this.regionIndex+1} / ${REGIONS.length}`;this.element('region-name').textContent=r.name;this.element('coin-goal').textContent=`Сила биома: ${Math.min(p.coins,r.coins)} / ${r.coins}`;this.element('region-lore').textContent=r.lore;
  this.element('compact-souls').textContent=!this.armed?`◈ ${Math.min(p.coins,r.awaken)} / ${r.awaken} · оружие`:`◈ ${Math.min(p.coins,r.coins)} / ${r.coins}`;
  const seconds=Math.max(0,Math.ceil(r.bossTime-p.elapsed));this.element('boss-timer').textContent=p.bossDead?'Хозяин повержен':p.spawned?'Босс пробудился':`Босс ${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  const objective=this.area==='interior'?`Внутри: ${houseName(this.villageIndex,this.interiorRole??'smith')}. E у жителя - разговор, E у двери - выйти.`:this.area==='village'?'Деревня безопасна. Войди в дверь дома на E. Tab - вещи, навыки, дорога и сохранение. Выход в следующий биом справа.':this.area==='tutorial'?LESSONS[Math.min(this.lessonIndex,LESSONS.length-1)].hint:p.cleared?'Туман рассеялся. Восточная стоянка открыта.':!this.armed?`Верни ${r.awaken} осколков силы, чтобы восстановить ${w.name.toLowerCase()}.`:p.bossDead?`Собери силу биома: ${p.coins} / ${r.coins}.`:p.spawned?`Собери ${r.coins} силы и победи хозяина биома.`:`Собирай силу, выполняй испытания. Хозяин проснётся через ${seconds} с.`;
  this.element('quest-text').textContent=objective;const tracked=this.profile.trackedQuest&&this.journalEntries().find(q=>q.id===this.profile.trackedQuest&&!q.done);this.element('guide-objective').textContent=tracked?`${objective} Поручение: ${tracked.next}`:objective;this.element('guide-objective').hidden=this.trainingArea();
  const boss=this.enemies.find(e=>e.kind==='boss'&&e.region===this.regionIndex&&!e.dead);this.element('boss-hud').hidden=!boss||this.area!=='biome';
  if(boss){const names:Record<EnemyAttack,string>={slash:'удар',charge:'рывок',slam:'волна',poison:'яд',summon:'призыв',fan:'чары',blink:'прыжок',meteor:'печати',breath:'дыхание',combo:'серия',nova:'кольцо чар',snipe:'прицельный выстрел',quake:'волны земли',curse:'проклятие'};
   this.element('boss-name').textContent=`${r.bossName}${boss.phase2?' · II':''}${boss.mode==='windup'?` · ${names[boss.move]}`:''}`;this.element('boss-hp-text').textContent=`${Math.ceil(boss.hp)} / ${boss.maxHP}`;this.element('boss-hp-fill').style.width=`${Math.max(0,boss.hp)/boss.maxHP*100}%`;
  }
  if(this.area!=='biome'){this.element('boss-hud').hidden=true;this.element('boss-timer').textContent=this.area==='tutorial'?'Обучение · без таймера':'Безопасная деревня';this.element('compact-souls').textContent=this.area==='tutorial'?`Урок ${this.lessonIndex+1}/${LESSONS.length}`:'Подготовка к пути';this.element('region-number').textContent=this.area==='tutorial'?'ПРЕДБИОМ':'ПОСЕЛЕНИЕ';this.element('region-name').textContent=VILLAGE_NAMES[this.villageIndex+1];this.element('quest-text').textContent=this.area==='tutorial'?LESSONS[this.lessonIndex]?.hint??'Обучение завершено':'Поговори с жителями, купи снаряжение и иди на восток. Семью держат за восемью печатями.';this.element('region-lore').textContent='Кузнец · бронница · лекарь · странник. Смерть вернёт тебя к последней посещённой деревне.';this.element('coin-goal').textContent='Цель: спасти семью';this.element('weapon-label').textContent=weaponFor(this.profile).name;}
  this.element('weather-label').textContent=this.slowed>0?'Молния · замедление':this.weather==='clear'?'Ясно':`${WEATHER_NAMES[this.weather]} · ${Math.ceil(this.weatherLeft)} с`;
  this.syncGuide();this.element('counter-ready').hidden=this.counterLeft<=0||this.state!=='playing';
  this.element('guide-skills').textContent=SKILL_TREE.filter(s=>s.style===w.style&&this.profile.skills.includes(s.id)&&!this.profile.disabledSkills.includes(s.id)).map(s=>`${s.key} · ${s.name}${(this.skillCooldowns[s.id]??0)>0?' ('+Math.ceil(this.skillCooldowns[s.id]??0)+' с)':''}`).join(' · ')||'Приёмы изучаются в Tab → Навыки после побед над боссами.';
  this.element('ultimate-ready').hidden=!this.armed||this.ultimate<ULTIMATE_MAX;
  let target:Point|null=null,label='';
  if(p.cleared&&this.regionIndex<REGIONS.length-1){const m=this.merchants[this.regionIndex];target=this.player.x<m.x+60?villagePosition(this.regionIndex):{x:regionStart(this.regionIndex+1)+70,y:550};label=this.player.x<m.x+60?'Костёр и деревня':'Следующий биом';}
  else if(p.coins<r.coins){const c=this.coins.filter(c=>c.region===this.regionIndex).sort((a,b)=>Math.hypot(a.sprite.x-this.player.x,a.sprite.y-this.player.y)-Math.hypot(b.sprite.x-this.player.x,b.sprite.y-this.player.y))[0];if(c)target=c.sprite;label='Ближайший осколок души';}
  else if(boss){target=boss.sprite;label='Победи хозяина биома';}else label=`Хозяин проснётся через ${seconds} с`;
  if(this.area!=='biome'){target={x:regionStart(this.villageIndex+1)+80,y:550};label=this.area==='tutorial'?LESSONS[this.lessonIndex]?.title??'В биом':'Восток · следующий биом';}
  this.element('navigation-text').textContent=label;this.element('direction-arrow').hidden=!target;if(target)this.element('direction-arrow').style.transform=`rotate(${Math.atan2(target.y-this.player.y,target.x-this.player.x)*180/Math.PI}deg)`;
 }
 private resetJourney():void{
  this.achievementQueue=[];this.achievementLeft=0;this.achievementPage=0;this.element('achievement-banner').hidden=true;
  this.clearActors();this.profile=newProfile();this.progress=REGIONS.map(()=>({coins:0,elapsed:0,spawned:false,bossDead:false,cleared:false,income:0,rewarded:false}));this.quests=REGIONS.map((_,i)=>newQuests(i));this.lines=newLines();this.deliveries=newDeliveries();this.campVisits.clear();this.regionIndex=0;this.villageIndex=-1;this.lastVillage=-1;this.elapsed=0;this.score=0;this.kills=0;this.deaths=0;this.ultimate=0;this.combo=0;this.strideDistance=0;for(const n of this.villagers){n.near=false;n.greetUntil=0;}this.lastAttack=-10;this.attackTime=-1;this.healWait=0;this.regenDelay=0;this.lessonIndex=0;this.lessonProgress=0;this.tutorialFinished=false;this.guardLeft=0;this.dirty=false;
  for(const id of ['briefing-overlay','dialog-overlay','shop-overlay','map-overlay','menu-overlay','loot-overlay','intro-overlay','story-overlay','training-overlay','confirm-overlay','travel-overlay','training-panel'])this.element(id).hidden=true;this.element('guide').hidden=true;this.hideModal();
 }
 private showTitle():void{
  this.state='ready';this.dirty=false;this.element('guide').hidden=true;this.element('training-panel').hidden=true;this.showModal('RAID COIN · v9.1','За тех, кого любишь.','Дракон похитил семью лиса и расколол его силу. Пройди восемь печатей, верни оружие и освободи близких.','Новая игра ↗',true);this.element('load-start').textContent='Продолжить путешествие';this.refreshSaveUI();
 }
 private askTraining():void{this.hideModal();this.state='choice';this.element('training-overlay').hidden=false;}
 private requestNew():void{if(this.dirty)this.confirmExit('new');else this.askTraining();}
 private confirmExit(target:'title'|'new'):void{
  this.confirmReturn=this.state;this.confirmTarget=target;this.state='confirm';this.resetInput();this.element('confirm-overlay').hidden=false;this.element('confirm-title').textContent=target==='new'?'Начать новое путешествие?':'Завершить путешествие?';
 }
 private cancelExit():void{this.element('confirm-overlay').hidden=true;this.state=this.confirmReturn;}
 private commitExit():void{
  this.element('confirm-overlay').hidden=true;for(const id of ['menu-overlay','shop-overlay','dialog-overlay','map-overlay','loot-overlay'])this.element(id).hidden=true;this.dirty=false;this.hideModal();if(this.confirmTarget==='new')this.askTraining();else this.showTitle();
 }
 private startVillage(index:number,revive=false):void{
  this.clearInterior();this.area='village';this.villageIndex=index;this.lastVillage=index;this.regionIndex=Math.min(REGIONS.length-1,index+1);this.state='playing';this.armed=true;this.profile.blade=true;this.projectiles=[];this.hazards=[];this.attackTime=-1;this.ultimateLeft=0;this.guardLeft=0;this.counterLeft=0;this.counterTarget=-1;this.counterStrike=false;this.activeSkill=null;this.shieldLeft=0;this.resetWeather();this.resetInput();this.sword.setVisible(true);this.element('training-panel').hidden=true;this.wisp?.setVisible(false);
  const center=villagePosition(index);this.checkpoint={x:center.x+15,y:center.y+95};
  if(revive){this.player.setPosition(this.checkpoint.x,this.checkpoint.y).setAlpha(1).setAngle(0).clearTint();this.hp=stats(this.profile).maxHP;this.stamina=stats(this.profile).maxStamina;this.flasks=stats(this.profile).flasks;this.hurtLeft=2;}
  if(!this.campVisits.has(index)){this.campVisits.add(index);this.hp=stats(this.profile).maxHP;this.stamina=stats(this.profile).maxStamina;this.flasks=stats(this.profile).flasks;this.reachCheckpoint(VILLAGE_NAMES[index+1]);}
  else if(revive)this.reachCheckpoint(`Возрождение · ${VILLAGE_NAMES[index+1]}`);
  this.audio.setRegion(this.regionIndex);this.configureCamera();this.cameras.main.centerOn(this.player.x,this.player.y);this.syncGuide();this.drawGates();this.drawActors();this.updateHUD();
 }
 private openTravel():void{
  if(this.state!=='menu'||this.area!=='village'&&this.area!=='interior'){this.toast('Переход доступен только из безопасной деревни.');return;}
  this.state='travel';this.element('menu-overlay').hidden=true;this.element('travel-overlay').hidden=false;
  this.element('travel-items').innerHTML=[...this.campVisits].sort((a,b)=>a-b).map(i=>{const fare=3+Math.abs(i-this.villageIndex)*2,here=i===this.villageIndex;return `<article class="travel-card"><strong>${VILLAGE_NAMES[i+1]}</strong><small>${here?'Ты здесь':`Дорога: ${fare} ◈`}</small><button data-travel="${i}" ${here||this.profile.coins<fare?'disabled':''}>${here?'Текущая деревня':'Отправиться'}</button></article>`;}).join('');
 }
 private closeTravel():void{this.state='menu';this.element('travel-overlay').hidden=true;this.element('menu-overlay').hidden=false;this.renderMenu();}
 private travelTo(index:number):void{
  if(this.state!=='travel'||!this.campVisits.has(index)||index===this.villageIndex)return;const fare=3+Math.abs(index-this.villageIndex)*2;if(this.profile.coins<fare)return;
  this.profile.coins-=fare;this.element('travel-overlay').hidden=true;this.startVillage(index);this.player.setPosition(this.checkpoint.x,this.checkpoint.y);this.cameras.main.centerOn(this.player.x,this.player.y);this.dirty=true;this.reachCheckpoint(VILLAGE_NAMES[index+1]);this.toast(`Дорога пройдена. ${resident(index,'healer').name} поможет с лечением; смерть вернёт к этому костру.`);this.updateHUD();
 }
 private renderDeliveryTalk():void{
  const def=DELIVERIES.find(d=>{const q=this.deliveries.find(q=>q.id===d.id)!;return !q.claimed&&this.seals()>=d.seals&&(d.giver===this.dialogRole&&d.from===this.villageIndex||q.accepted&&!q.delivered&&d.receiver===this.dialogRole&&d.to===this.villageIndex);}),b=this.element<HTMLButtonElement>('dialog-delivery');b.disabled=!def;
  const q=def&&this.deliveries.find(q=>q.id===def.id)!;b.textContent=!def?'Доставок пока нет':q?.delivered?'Награда за доставку':q?.accepted&&def.receiver===this.dialogRole?'Передать посылку':q?.accepted?'О доставке':'Взять доставку';
 }
 private talkDelivery():void{
  const def=DELIVERIES.find(d=>{const q=this.deliveries.find(q=>q.id===d.id)!;return !q.claimed&&this.seals()>=d.seals&&(d.giver===this.dialogRole&&d.from===this.villageIndex||q.accepted&&!q.delivered&&d.receiver===this.dialogRole&&d.to===this.villageIndex);});if(!def)return;const q=this.deliveries.find(q=>q.id===def.id)!;
  if(q.delivered&&def.giver===this.dialogRole){q.claimed=true;this.profile.coins+=def.reward;this.profile.skillPoints++;this.audio.play('loot');this.say(`${def.response} Награда: ${def.reward} осколков и искра мастерства. Спасибо, что вернулся.`);}
  else if(q.accepted&&def.receiver===this.dialogRole&&def.to===this.villageIndex){q.delivered=true;this.say(`${def.response} Теперь вернись в ${VILLAGE_NAMES[def.from+1]}: ${resident(def.from,def.giver).name} выдаст награду.`);}
  else{q.accepted=true;this.profile.trackedQuest=`delivery:${q.id}`;this.say(`${def.name}. ${deliveryJournal(q).why} Посылка «${def.parcel}» в твоей сумке. Из деревни открой Tab → Путь → Дорога между деревнями. Запись и метка получателя: Задания → Доставки.`);}
  this.syncAchievements();this.dirty=true;this.renderDeliveryTalk();
 }
 private enemyBounds(e:Enemy):Bounds{return e.training?{width:PROLOGUE_WIDTH-20,height:WORLD_HEIGHT,margin:35,top:65,left:35}:this.regionBounds(e.region);}
 private secondaryAttack():void{
  if(weaponFor(this.profile).style==='sword'){this.parry();return;}
  if(this.state!=='playing'||!this.armed||this.attackTime>=0||this.dodgeLeft>0||this.guardLeft>0||this.ultimateLeft>0)return;
  const a=attackSpec(this.profile,true);if(this.stamina<a.cost)return;this.updateAim();this.stamina-=a.cost;this.regenDelay=STAMINA_DELAY;this.mouseHeld=false;this.activeSkill=null;this.counterStrike=false;this.heavyAttack=true;this.attackTime=0;this.attackAngle=this.face;this.attackFired=false;this.attackPulse=-1;this.attackHits.clear();this.combo=0;
 }
 private addEffect(kind:'slash'|'ring'|'thrust',at:Point,color:number,radius:number,angle=this.face):void{this.effects.push({x:at.x,y:at.y,kind,color,radius,angle,life:.32,max:.32});}
 private buyItem(id:string):string{
  const item=SUPPLIES.find(i=>i.id===id);if(!item){const weapon=WEAPONS.find(w=>w.id===id);if(weapon&&!this.profile.weapons.includes(weapon.id)&&!villageStock(this.villageIndex).includes(weapon.id))return 'В этой деревне такое оружие не куют. Посмотри другие посещённые поселения на карте.';return purchase(this.profile,id,this.seals());}
  if(id==='field-potion'&&this.profile.potions>=99)return 'В сумке уже 99 зелий.';
  if(id==='heal-service'&&this.hp>=stats(this.profile).maxHP)return 'Здоровье уже полное.';if(id==='refill'&&this.flasks>=stats(this.profile).flasks)return 'Все фляги наполнены.';if(id==='rest-service'&&this.hp>=stats(this.profile).maxHP&&this.flasks>=stats(this.profile).flasks)return 'Ты уже готов к пути.';if(this.profile.coins<item.price)return 'Не хватает осколков.';
  this.profile.coins-=item.price;if(id==='field-potion'){this.profile.potions++;return `Зелье в сумке: ${this.profile.potions}. V - выпить в бою.`;}if(id==='heal-service')this.hp=Math.min(stats(this.profile).maxHP,this.hp+50);else if(id==='refill')this.flasks++;else{this.hp=stats(this.profile).maxHP;this.flasks=stats(this.profile).flasks;}this.audio.play('heal');return `${item.name}: готово.`;
 }
 private beginStory(closing:boolean):void{this.storyClosing=closing;this.storyIndex=0;this.storyTime=0;this.state='story';this.resetInput();this.hideModal();this.element('story-overlay').hidden=false;this.syncGuide();this.element('training-overlay').hidden=true;this.renderStoryText();this.drawStory();}
 private renderStoryText():void{const frames=this.storyClosing?ENDING:OPENING,frame=frames[this.storyIndex];this.element('story-title').textContent=frame.title;this.element('story-text').textContent=frame.text;this.element('story-page').textContent=`${this.storyIndex+1} / ${frames.length}`;this.element('story-next').textContent=this.storyIndex===frames.length-1?'В путь ↗':'Дальше ↗';}
 private advanceStory():void{const frames=this.storyClosing?ENDING:OPENING;if(this.storyIndex>=frames.length-1){this.finishStory();return;}this.storyIndex++;this.storyTime=0;this.renderStoryText();}
 private updateStory(dt:number):void{this.storyTime+=dt;this.drawStory();if(this.storyTime>=12)this.advanceStory();}
 private finishStory():void{
  this.element('story-overlay').hidden=true;if(this.storyClosing){this.state='won';this.showModal('СЕМЬЯ СПАСЕНА','Дом снова ждёт тебя.','Восемь печатей разорваны. Дракон побеждён, семья и украденная казна возвращены. Сохрани завершённый путь по кнопке.','Новая игра ↗',false);this.showStats();this.element('modal-save').hidden=false;return;}
  if(this.wantsTraining)this.beginTutorial();else{this.player.setPosition(regionStart(0)+100,588);this.startRegion(0,true);this.beginIntro(false);}
 }
 private drawStory():void{
  const canvas=this.element<HTMLCanvasElement>('story-canvas'),c=canvas.getContext('2d');if(!c)return;
  const width=canvas.width,height=canvas.height,t=this.storyTime,frame=(this.storyClosing?ENDING:OPENING)[this.storyIndex],panel=this.storyClosing?0:this.storyIndex,raid=frame.scene==='raid',ghost=frame.scene==='oath';
  const atlas=this.textures.get('story-atlas').getSourceImage() as CanvasImageSource,zoom=1+Math.min(.065,t*.005),cropW=768/zoom,cropH=cropW*height/width,sx=panel%2*768+(768-cropW)/2+Math.sin(t*.14)*5,sy=Math.floor(panel/2)*512+(512-cropH)/2;
  c.clearRect(0,0,width,height);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(atlas,sx,sy,cropW,cropH,0,0,width,height);
  // Небольшой параллакс, пепел и свечение дополняют рисунок, текст остаётся вне кадра.
  for(let i=0;i<28;i++){const x=(i*97+t*(raid?-15:ghost?8:4))%width,y=(i*61-t*(raid?20:8)+height*2)%height;c.globalAlpha=.20+Math.sin(t*1.5+i)*.13;c.fillStyle=raid?'#ffa97e':ghost?'#9beaff':'#ffdfa1';c.beginPath();c.arc(x,y,raid?1.8:1.3,0,Math.PI*2);c.fill();}
  c.globalAlpha=1;
  if(raid){c.fillStyle=`rgba(204,51,32,${.03+.025*Math.sin(t*3)})`;c.fillRect(0,0,width,height);}
  if(ghost){const pulse=.12+.05*Math.sin(t*3);c.fillStyle=`rgba(112,222,255,${pulse})`;c.beginPath();c.ellipse(width*.57,height*.56,55+Math.sin(t*2)*5,35,0,0,Math.PI*2);c.fill();}
  if(frame.scene==='road'){for(let i=0;i<REGIONS.length;i++){const x=width*.48+i*55,y=height*.88+Math.sin(t+i)*2;c.strokeStyle=['#83ccb1','#e8ca87','#c39ed8','#e5a480','#8cc7db','#b18bcc','#d4d4c9','#c38aa1'][i];c.lineWidth=2;c.beginPath();c.arc(x,y,13,0,Math.PI*2);c.stroke();c.fillStyle='#f4e7c8';c.font='bold 13px system-ui';c.textAlign='center';c.fillText(String(i+1),x,y+4);}}
  const shade=c.createLinearGradient(0,0,0,height);shade.addColorStop(0,'#07101522');shade.addColorStop(.6,'#07101500');shade.addColorStop(1,'#07101570');c.fillStyle=shade;c.fillRect(0,0,width,height);
 }
 private renderBriefing():void{
  const card=BRIEFING_CARDS[this.briefingPage];this.element('briefing-icon').textContent=card.icon;this.element('briefing-title').textContent=card.title;this.element('briefing-text').textContent=card.text;this.element('briefing-page').textContent=`${this.briefingPage+1} / ${BRIEFING_CARDS.length}`;this.element('briefing-next').textContent=this.briefingPage===BRIEFING_CARDS.length-1?'Начать практику ↗':'Следующая карточка ↗';
 }
 private startLessons():void{
  this.element('briefing-overlay').hidden=true;this.state='playing';this.element('training-panel').hidden=false;this.prepareLesson();this.renderLesson();this.reachCheckpoint('Учебный двор Бруна');this.syncGuide();this.updateHUD();
 }
 private teachingPoint():Point|null{
  const h=this.houses.find(h=>h.village===-1&&h.role==='smith')!,npc=this.villagers.find(n=>n.village===-1&&n.role==='smith')!.sprite;
  if(this.area==='interior'&&this.lessonIndex===10)return{x:h.x,y:h.y+120};
  return lessonPoint(this.lessonIndex,this.player,this.coins.map(c=>c.sprite),this.enemies.filter(e=>e.training&&!e.dead).map(e=>e.sprite),h.door,npc,this.area==='interior');
 }
 private drawTeachingCue(g:Phaser.GameObjects.Graphics):void{
  const training=this.trainingArea()&&!this.tutorialFinished&&this.state==='playing',route=this.area==='village'&&this.villageIndex===-1&&this.progress[0].elapsed===0&&this.state==='playing';
  const target=training?this.teachingPoint():route?{x:regionStart(0)+55,y:550}:null;if(!target)return;
  const dx=target.x-this.player.x,dy=target.y-this.player.y,d=Math.hypot(dx,dy)||1,pulse=Math.sin(this.animationTime*5)*3;
  g.lineStyle(3,0xead394,.85);g.strokeCircle(target.x,target.y,27+pulse);if(d>60){const a=Math.atan2(dy,dx),x=this.player.x+dx/d*65,y=this.player.y+dy/d*65;g.fillStyle(0xffdc91,.85);g.fillTriangle(x+Math.cos(a)*12,y+Math.sin(a)*12,x+Math.cos(a+2.4)*9,y+Math.sin(a+2.4)*9,x+Math.cos(a-2.4)*9,y+Math.sin(a-2.4)*9);}
 }
 private updateTeachingUI():void{
  const training=this.trainingArea()&&!this.tutorialFinished&&this.state!=='briefing',cue=LESSON_CUES[Math.min(this.lessonIndex,LESSON_CUES.length-1)],wanted=new Set<Element>();
  if(training&&cue.selector)for(const element of document.querySelectorAll(cue.selector))wanted.add(element);
  if(training&&this.area==='interior'&&this.lessonIndex===10)wanted.add(this.element('interact-button'));
  for(const element of document.querySelectorAll('.teaching-highlight'))if(!wanted.has(element))element.classList.remove('teaching-highlight');for(const element of wanted)element.classList.add('teaching-highlight');
  const panel=this.element('training-panel');panel.hidden=!training;panel.classList.toggle('training-in-menu',this.state!=='playing');
  for(const key of this.element('lesson-keys').querySelectorAll<HTMLElement>('[data-key]')){const name=key.dataset.key!,mapped:Record<string,string>={'ПРОБЕЛ':'SPACE','TAB':'TAB','SHIFT':'SHIFT'};key.classList.toggle('pressed',this.keys?.[mapped[name]??name]?.isDown===true||name==='ЛКМ'&&this.mouseHeld);}
  const route=this.element('route-marker'),show=this.state==='playing'&&this.area==='village'&&this.villageIndex===-1&&this.progress[0].elapsed===0;route.hidden=!show;
  if(show){const view=this.cameras.main.worldView,x=(regionStart(0)+55-view.x)*this.cameras.main.zoom,y=(550-view.y)*this.cameras.main.zoom;route.style.left=`${Math.max(60,Math.min(this.scale.width-100,x))}px`;route.style.top=`${Math.max(105,Math.min(this.scale.height-110,y))}px`;}
 }
 private beginTutorial():void{
  this.area='tutorial';this.villageIndex=-1;this.player.setPosition(200,550);this.armed=false;this.profile.blade=false;this.progress[0].coins=0;this.state='briefing';this.briefingPage=0;this.lessonIndex=0;this.lessonProgress=0;this.element('training-panel').hidden=true;this.interiorReturn='tutorial';this.toggleGuide(true);this.element('briefing-overlay').hidden=false;this.renderBriefing();this.updateHUD();
 }
 private lessonEvent(event:string):void{if(!this.trainingArea()||this.tutorialFinished||LESSONS[this.lessonIndex]?.event!==event)return;this.lessonProgress++;if(this.lessonProgress>=LESSONS[this.lessonIndex].target){this.lessonIndex++;this.lessonProgress=0;if(this.lessonIndex>=LESSONS.length){this.tutorialFinished=true;return;}this.prepareLesson();}this.renderLesson();}
 private prepareLesson():void{
  if(this.lessonIndex===1)for(const x of [375,435,495])this.spawnCoin(0,false,{x,y:550});
  if(this.lessonIndex===2){const e=this.spawnEnemy('skeleton',0,0,{x:640,y:550});e.training=true;e.stun=999;e.speed=0;e.hp=e.maxHP=600;}
  if(this.lessonIndex===3){const e=this.enemies.find(e=>e.training&&!e.dead);if(e){e.stun=0;e.damage=5;e.speed=65;e.clock=.7;e.mode='chase';}}
  if(this.lessonIndex===4){const e=this.enemies.find(e=>e.training&&!e.dead);if(e){e.stun=999;e.speed=0;}}
  if(this.lessonIndex===5){this.hp=Math.max(1,this.hp-45);this.toast('Учебная рана. Используй Q, чтобы выпить флягу.');}
  if(this.lessonIndex===6)this.ultimate=100;
  if(this.lessonIndex===10){for(const e of this.enemies){this.tweens.killTweensOf(e.sprite);e.sprite.destroy();e.shadow.destroy();}this.enemies=[];this.hp=stats(this.profile).maxHP;this.stamina=stats(this.profile).maxStamina;for(const point of [{x:650,y:760},{x:720,y:530}]){const e=this.spawnEnemy('skeleton',0,0,point);e.training=true;e.hp=e.maxHP=35;e.damage=5;e.speed=115;e.clock=2;}}
 }
 private renderLesson():void{const lesson=LESSONS[Math.min(this.lessonIndex,LESSONS.length-1)];this.element('lesson-title').textContent=`${this.lessonIndex+1}/${LESSONS.length} · ${lesson.title}`;this.element('lesson-hint').textContent=`${this.area==='interior'&&this.lessonIndex===10?'Сначала выйди через дверь внизу на E. ':''}${lesson.hint} ${lesson.target>1?`(${this.lessonProgress}/${lesson.target})`:''}`;const cue=LESSON_CUES[Math.min(this.lessonIndex,LESSON_CUES.length-1)];this.element('lesson-keys').innerHTML=(this.area==='interior'&&this.lessonIndex===10?['E']:cue.keys).map(key=>`<kbd data-key="${key}">${key}</kbd>`).join('');this.element('lesson-target').textContent=cue.label;this.updateTeachingUI();}
 private finishTutorial():void{
  this.tutorialFinished=true;this.lessonIndex=LESSONS.length;this.syncAchievements();this.clearInterior();this.element('training-panel').hidden=true;
  for(const e of this.enemies.filter(e=>e.training)){this.tweens.killTweensOf(e.sprite);e.sprite.destroy();e.shadow.destroy();}this.enemies=this.enemies.filter(e=>!e.training);
  for(const c of this.coins)c.sprite.destroy();this.coins=[];this.profile.coins=0;this.progress[0].coins=0;this.startVillage(-1,true);this.interiorReturn='village';this.updateTeachingUI();
  this.toast('Обучение завершено. Ты в безопасной деревне. Осмотрись, открой карту M и иди по указателю на восток к роще.');
 }
 private renderQuestTalk():void{const def=LINES.find(d=>d.giver===this.dialogRole&&this.villageIndex===d.offered&&!this.lines.find(q=>q.id===d.id)!.claimed),button=this.element<HTMLButtonElement>('dialog-quest');button.disabled=!def;button.textContent=!def?'Поручений пока нет':lineReady(this.lines.find(q=>q.id===def.id)!,this.progress[def.region].bossDead)?'Сдать поручение':this.lines.find(q=>q.id===def.id)!.accepted?'О поручении':'Взять поручение';}
 private talkQuest():void{
  const def=LINES.find(d=>d.giver===this.dialogRole&&this.villageIndex===d.offered&&!this.lines.find(q=>q.id===d.id)!.claimed);if(!def)return;const q=this.lines.find(q=>q.id===def.id)!;
  if(lineReady(q,this.progress[def.region].bossDead)){q.claimed=true;if(def.reward==='emberseal'){if(!this.profile.relics.includes(def.reward))this.profile.relics.push(def.reward);}else{const weapon=WEAPONS.find(w=>w.id===def.reward)!;if(!this.profile.weapons.includes(weapon.id))this.profile.weapons.push(weapon.id);}this.audio.play('loot');this.say(`${QUEST_NOTES[q.id].thanks} Награда: ${def.rewardName}. Tab → Вещи.`);this.toast(`Получен уникальный предмет: ${def.rewardName}`);}
  else{const fresh=!q.accepted;q.accepted=true;this.profile.trackedQuest=`line:${q.id}`;const note=lineJournal(q,this.progress[def.region].bossDead);this.say(fresh?`${QUEST_NOTES[q.id].offer} Запись: Tab → Задания → Дневник. Там следующий шаг и метка карты.`:`${note.next} ${def.description} После победы вернись ко мне в эту деревню.`);this.makeQuestProps();}this.syncAchievements();this.renderQuestTalk();this.dirty=true;
 }
 private freeNear(at:Point):Point{const terrain=this.terrainByRegion[this.regionIndex],bounds=this.regionBounds(this.regionIndex);if(freePoint(at,25,terrain,bounds))return at;const grid=this.nav[this.regionIndex];let result=at,distance=Infinity;grid.free.forEach((free,i)=>{if(!free)return;const p={x:grid.originX+(i%grid.cols+.5)*grid.cell,y:(Math.floor(i/grid.cols)+.5)*grid.cell},d=Phaser.Math.Distance.Between(at.x,at.y,p.x,p.y);if(d<distance){distance=d;result=p;}});return result;}
 private makeQuestProps(wispAt:Point|null=null):void{
  for(const q of this.questProps)q.sprite.destroy();this.questProps=[];this.wisp?.destroy();this.wisp=null;this.wispPath=[];if(this.area!=='biome')return;
  const start=regionStart(this.regionIndex);for(const def of LINES){const q=this.lines.find(q=>q.id===def.id)!;if(!q.accepted||q.claimed||def.region!==this.regionIndex)continue;
   if(q.id==='bell'&&!q.artifact){const point=this.freeNear({x:start+950,y:280}),sprite=this.add.image(point.x,point.y,'bell').setDisplaySize(62,62).setDepth(25);this.questProps.push({id:q.id,order:0,point,sprite});}
   if(q.id==='runes')for(const [order,at]of [{x:start+300,y:250},{x:start+680,y:830},{x:start+1040,y:300}].entries()){const point=this.freeNear(at),sprite=this.add.image(point.x,point.y,`rune-${order}`).setDisplaySize(72,72).setDepth(25);if(order<q.runes)sprite.setTint(0x82d8b3);this.questProps.push({id:q.id,order,point,sprite});}
   if(q.id==='wisp'&&!q.escorted){const point=wispAt??this.freeNear({x:start+180,y:700});this.wisp=this.add.image(point.x,point.y,'wisp').setDisplaySize(52,52).setDepth(28);this.wispPathLeft=0;this.wispFear=0;}
  }
 }
 private touchQuestProp(prop:typeof this.questProps[number]):void{const q=this.lines.find(q=>q.id===prop.id)!;
  if(q.id==='bell'){q.artifact=true;prop.sprite.destroy();this.questProps=this.questProps.filter(p=>p!==prop);this.toast(`Язык колокола найден. Разорви лунную печать, затем вернись в ${VILLAGE_NAMES[1]}: ${resident(0,'smith').name} ждёт тебя.`);}
  if(q.id==='runes'){if(prop.order<q.runes){this.toast('Эта печать уже активирована.');return;}if(prop.order===q.runes){q.runes++;prop.sprite.setTint(0x82d8b3);this.audio.play('checkpoint');this.toast(['Луна: «Помни, ради кого идёшь».','Искра: «Сила без памяти становится проклятием».','Корень: «Возвращение важнее мести».'][prop.order]);}else{q.runes=0;for(const p of this.questProps)if(p.id==='runes')p.sprite.clearTint();this.audio.play('empty');this.toast('Круг замкнулся. Порядок: Луна → Искра → Корень.');}}
 }
 private updateWisp(dt:number):void{if(!this.wisp||this.area!=='biome')return;const q=this.lines.find(q=>q.id==='wisp')!;this.wispFear=Math.max(0,this.wispFear-dt);this.wispPathLeft-=dt;
  if(Math.hypot(this.wisp.x-this.player.x,this.wisp.y-this.player.y)<155&&this.wispFear<=0){const goal=this.freeNear({x:regionEnd(3)-80,y:615});if(this.wispPathLeft<=0){this.wispPath=findPath(this.wisp,goal,this.nav[3]);this.wispPathLeft=.7;}while(this.wispPath[0]&&Math.hypot(this.wisp.x-this.wispPath[0].x,this.wisp.y-this.wispPath[0].y)<16)this.wispPath.shift();const target=this.wispPath[0]??goal,dx=target.x-this.wisp.x,dy=target.y-this.wisp.y,len=Math.hypot(dx,dy)||1,point=moveCircle(this.wisp,dx/len*125*dt,dy/len*125*dt,12,this.terrainByRegion[3],this.regionBounds(3));this.wisp.setPosition(point.x,point.y);if(Math.hypot(point.x-goal.x,point.y-goal.y)<35){q.escorted=true;this.wisp.destroy();this.wisp=null;this.audio.play('checkpoint');this.toast(`Огонёк достиг костра. После победы над Архонтом вернись в ${VILLAGE_NAMES[3]}: ${resident(2,'healer').name} ждёт тебя.`);}}
 }


}
