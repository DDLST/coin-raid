import Phaser from 'phaser';
import { background, createArtwork, createMysticArtwork } from './art';
import { clampPoint, clearLine, findPath, freePoint, makeGrid, moveCircle, regionTerrain, type Bounds, type NavGrid, type Point, type Terrain } from './world';
import { PROFILE_KEY, LEGACY_KEYS, SKINS, UPGRADES, WEAPONS, ARMORS, newProfile, purchase, weaponFor, armorFor, type Profile } from './progression';
import { DODGE_COST, DODGE_TIME, FLASK_HEAL, HURT_PROTECTION, ULTIMATE_MAX, slashConnects, stats } from './combat';
import { REGIONS, REGION_WIDTH, ROAD_WIDTH, WORLD_HEIGHT, WORLD_WIDTH, merchantPosition, checkpointPosition, regionEnd, regionStart, type EnemyKind, type EnemyAttack } from './regions';
import { ForestAudio } from './audio';
import { advanceQuests, newQuests, questEvent, rollLoot, LOOT_ODDS, type Quest, type Loot } from './quests';
import { parseSave, type RegionProgress, type Snapshot, type SavedChest } from './save';
const PLAYER_RADIUS=16, PICKUP_RADIUS=31, PATH_INTERVAL=.45, INTERACT_DISTANCE=112, BOSS_REWARD=28;
const STAMINA_DELAY=.48, WEATHER_DURATION=15, LIGHTNING_WARNING=1.2, LIGHTNING_RADIUS=48;
const INTRO_DURATION=4.6, MAX_MINIONS=18;
type GameState='ready'|'intro'|'playing'|'paused'|'dialog'|'shop'|'menu'|'map'|'loot'|'dying'|'lost'|'won';
type EnemyMode='chase'|'windup'|'charge'|'recover';
type Enemy={id:number;region:number;kind:EnemyKind;variant:number;sprite:Phaser.GameObjects.Image;shadow:Phaser.GameObjects.Ellipse;
 hp:number;maxHP:number;radius:number;damage:number;reward:number;speed:number;mode:EnemyMode;clock:number;nextPath:number;path:Point[];
 aim:Point;target:Point;hasHit:boolean;stun:number;flash:number;phase2:boolean;dead:boolean;move:EnemyAttack;moveIndex:number};
type Coin={region:number;sprite:Phaser.GameObjects.Image;value:number;phase:number};
type Projectile=Point&{vx:number;vy:number;life:number;damage:number;region:number;friendly:boolean;color:number;radius:number;blast:number;hits:Set<number>};
type Hazard=Point&{region:number;radius:number;warning:number;left:number;damage:number;kind:'poison'|'meteor'|'ring';fired:boolean};
type Chest=SavedChest&{sprite:Phaser.GameObjects.Image};
type Strike=Point&{left:number;phase:'warning'|'impact'};
type ShopTab='weapons'|'armors'|'upgrades'|'skins';
type MenuTab='overview'|'equipment'|'quests'|'settings';
export class GameScene extends Phaser.Scene {
 private player!:Phaser.GameObjects.Image;
 private playerShadow!:Phaser.GameObjects.Ellipse;
 private sword!:Phaser.GameObjects.Image;
 private armorSprite!:Phaser.GameObjects.Image;
 private combatInk!:Phaser.GameObjects.Graphics;
 private weatherInk!:Phaser.GameObjects.Graphics;
 private gateInk!:Phaser.GameObjects.Graphics;
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
 private hudLeft=0;private toastTimeout=0;private checkpoint:Point=checkpointPosition(0);private checkpointBannerLeft=0;
 private nearestMerchant=-1;private nearestChest=-1;private dialogMerchant=0;private dialogTarget='';private dialogTime=0;
 private shopTab:ShopTab='weapons';private shopPage=0;private menuTab:MenuTab='overview';private menuReturn:GameState='playing';private mapReturn:GameState='playing';
 private equipmentTab:'weapons'|'armors'|'skins'='weapons';private equipmentPage=0;
 private weather:'clear'|'rain'|'storm'='clear';private weatherLeft=0;private weatherNext=13;
 private wetZones:(Point&{radius:number})[]=[];private strike:Strike|null=null;private strikeNext=2;private slowed=0;
 private introLeft=0;private introBroken=false;private introResume=false;private guideLeft=0;
 private loot:Loot|null=null;private lootLeft=0;
 constructor(){super('GameScene');}
 create():void{
  createArtwork(this);createMysticArtwork(this);
  try{for(const key of LEGACY_KEYS)localStorage.removeItem(key);this.saved=parseSave(localStorage.getItem(PROFILE_KEY));}catch{this.storageAvailable=false;}
  this.drawWorld();this.gateInk=this.add.graphics().setDepth(700);this.weatherInk=this.add.graphics().setDepth(6);
  this.playerShadow=this.add.ellipse(140,550,35,14,0x09291b,.34).setDepth(8);
  this.player=this.add.image(140,550,'fox').setDisplaySize(72,72).setDepth(20);
  this.sword=this.add.image(0,0,'sword').setDisplaySize(100,100).setOrigin(.20,.89).setVisible(false).setDepth(21);
  this.armorSprite=this.add.image(140,550,'armor-ranger').setDisplaySize(72,72).setVisible(false).setDepth(22);
  this.combatInk=this.add.graphics().setDepth(500);
  if(!this.input.keyboard)throw new Error('Keyboard unavailable');
  this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,SHIFT,J,Q,E,P,ESC,ENTER,H,M,F,R,TAB') as Record<string,Phaser.Input.Keyboard.Key>;
  this.bindControls();this.configureCamera();this.newJourney(false);this.state='ready';
  this.showModal('ОСКОЛКИ ДУШИ · v5.0','Верни свою силу.','Туман ломает оружие. Собери осколки души, восстанови его и победи хозяина биома. За туманом ждут костёр, Брун и следующая область.','Начать путешествие ↗',true);
  this.refreshSaveUI();this.scale.on('resize',this.configureCamera,this);
  this.events.once('shutdown',()=>{this.listeners.abort();this.scale.off('resize',this.configureCamera,this);clearTimeout(this.toastTimeout);this.audio.destroy();});
 }
 private element<T extends HTMLElement=HTMLElement>(id:string):T{const e=document.getElementById(id);if(!e)throw new Error(`Missing UI: ${id}`);return e as T;}
 private regionBounds(index:number):Bounds{return{width:regionEnd(index),height:WORLD_HEIGHT,margin:42,top:65,left:regionStart(index)+42};}
 private playerBounds():Bounds{
  const p=this.progress[this.regionIndex];return{width:p.cleared?Math.min(WORLD_WIDTH,regionEnd(this.regionIndex)+ROAD_WIDTH+105):regionEnd(this.regionIndex),height:WORLD_HEIGHT,margin:35,top:65,left:p.bossDead?35:regionStart(this.regionIndex)+35};
 }
 private configureCamera():void{
  const cam=this.cameras.main;cam.setBounds(0,0,WORLD_WIDTH,WORLD_HEIGHT);cam.setZoom(Math.max(this.scale.width<700?.82:1,this.scale.height/WORLD_HEIGHT));
  if(this.player)cam.startFollow(this.player,true,.11,.11);this.setGuideText();
 }
 private bindControls():void{
  this.listeners=new AbortController();const signal=this.listeners.signal;
  const click=(id:string,fn:()=>void)=>this.element(id).addEventListener('click',fn,{signal});
  click('primary-button',()=>this.primaryAction());click('restart-button',()=>this.newJourney());click('new-button',()=>this.newJourney());
  click('menu-button',()=>this.toggleMenu());click('menu-close',()=>this.toggleMenu());click('pause-button',()=>{if(this.state==='menu'){this.toggleMenu();}this.togglePause();});
  click('help-button',()=>{if(this.state==='menu')this.toggleMenu();this.toggleGuide();});click('guide-close',()=>this.toggleGuide(false));
  click('map-button',()=>this.toggleMap());click('map-close',()=>this.toggleMap());click('fullscreen-button',()=>this.fullscreen());this.keys.F.on('down',()=>this.fullscreen());
  click('save-button',()=>this.saveProgress());click('modal-save',()=>this.saveProgress());click('load-button',()=>this.loadProgress());click('load-start',()=>this.loadProgress());
  click('delete-save',()=>{try{localStorage.removeItem(PROFILE_KEY);this.saved=null;this.refreshSaveUI();this.toast('Ручное сохранение удалено. Текущая игра продолжается.');}catch{this.toast('Браузер не разрешает удалить сохранение.');}});
  for(const b of document.querySelectorAll<HTMLButtonElement>('[data-menu-tab]'))b.addEventListener('click',()=>{this.menuTab=b.dataset.menuTab as MenuTab;this.renderMenu();},{signal});
  for(const b of document.querySelectorAll<HTMLButtonElement>('[data-equipment]'))b.addEventListener('click',()=>{this.equipmentTab=b.dataset.equipment as typeof this.equipmentTab;this.equipmentPage=0;this.renderEquipment();},{signal});
  click('equipment-prev',()=>{this.equipmentPage=Math.max(0,this.equipmentPage-1);this.renderEquipment();});click('equipment-next',()=>{this.equipmentPage++;this.renderEquipment();});
  this.element('equipment-items').addEventListener('click',e=>{const b=e.target instanceof Element?e.target.closest<HTMLButtonElement>('[data-equip]'):null;if(b?.dataset.equip)this.equip(b.dataset.equip);},{signal});
  click('quest-retry',()=>{const q=this.quests[this.regionIndex].find(q=>q.id==='sprint');if(q&&!q.complete){q.failed=false;q.progress=0;q.elapsed=0;this.renderMenu();this.toast('Испытание начнётся после закрытия меню.');}});
  for(const key of ['master','music','effects'] as const)this.element<HTMLInputElement>(`volume-${key}`).addEventListener('input',e=>{this.audio.unlock();this.audio.setSettings({[key]:Number((e.target as HTMLInputElement).value)/100});},{signal});
  click('mute-button',()=>{this.audio.unlock();this.audio.setSettings({muted:!this.audio.settings.muted});this.renderAudio();});
  click('interact-button',()=>this.interact());click('intro-skip',()=>this.finishIntro());click('loot-close',()=>{if(this.lootLeft>0)return;this.element('loot-overlay').hidden=true;this.state='playing';this.resetInput();});
  this.input.on('pointermove',(p:Phaser.Input.Pointer)=>{if(p.wasTouch||this.state!=='playing')return;this.mouse={x:p.x,y:p.y};});
  this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{if(this.state!=='playing'||p.button!==0||p.wasTouch)return;this.audio.unlock();this.mouse={x:p.x,y:p.y};this.updateAim();this.mouseHeld=true;this.attack();});
  this.input.on('pointerup',()=>{this.mouseHeld=false;});
  window.addEventListener('pointerup',()=>{this.mouseHeld=false;},{signal});
  window.addEventListener('blur',()=>{this.resetInput();if(this.state==='playing')this.togglePause();},{signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){this.resetInput();if(this.state==='playing')this.togglePause();}},{signal});
  click('dialog-trade',()=>this.openShop());click('dialog-road',()=>this.say('Войдёшь в новый биом - туман отрежет дорогу назад и разрушит оружие. Собирай силу: восстановится то оружие, которое ты выбрал. Победи хозяина биома и собери нужное число осколков, тогда откроется выход.'));
  click('dialog-combat',()=>this.say(`Дальше - ${REGIONS[Math.min(4,this.dialogMerchant+1)].bossName}. У каждого хозяина несколько приёмов. Красная печать - предупреждение, после атаки есть окно для удара. Магия и яд требуют защиты от чар. Абсолютное умение R заряжается от осколков и попаданий.`));
  click('dialog-leave',()=>this.leaveDialog());click('shop-close',()=>{this.element('shop-overlay').hidden=true;this.state='dialog';this.element('dialog-overlay').hidden=false;this.say('Береги силу. Покупки будут действовать в этой попытке; для следующего запуска нажми «Сохранить прогресс» в меню.');});
  for(const tab of ['weapons','armors','upgrades','skins'] as const)click(`tab-${tab}`,()=>{this.shopTab=tab;this.shopPage=0;this.renderShop();});
  click('shop-prev',()=>{this.shopPage=Math.max(0,this.shopPage-1);this.renderShop();});click('shop-next',()=>{this.shopPage++;this.renderShop();});
  this.element('shop-items').addEventListener('click',e=>{const b=e.target instanceof Element?e.target.closest<HTMLButtonElement>('[data-item]'):null;if(!b?.dataset.item||b.disabled)return;const before=stats(this.profile);this.element('shop-message').textContent=purchase(this.profile,b.dataset.item);this.applyEquipment(before);this.renderShop();this.updateHUD();},{signal});
 }
 update(_time:number,delta:number):void{
  const dt=Math.min(delta,40)/1000;
  this.audio.update(dt,this.state==='playing'||this.state==='intro',this.weather);
  if(this.checkpointBannerLeft>0){this.checkpointBannerLeft-=dt;if(this.checkpointBannerLeft<=0)this.element('checkpoint-banner').hidden=true;}
  if(Phaser.Input.Keyboard.JustDown(this.keys.H))this.toggleGuide();
  if(Phaser.Input.Keyboard.JustDown(this.keys.M))this.toggleMap();
  if(Phaser.Input.Keyboard.JustDown(this.keys.TAB)){this.toggleMenu();return;}
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
  this.elapsed+=dt;this.animationTime+=dt;const p=this.progress[this.regionIndex];if(!p.cleared)p.elapsed+=dt;
  advanceQuests(this.quests[this.regionIndex],dt);
  this.dodgeLeft=Math.max(0,this.dodgeLeft-dt);this.dodgeWait=Math.max(0,this.dodgeWait-dt);this.hurtLeft=Math.max(0,this.hurtLeft-dt);this.hurtFlash=Math.max(0,this.hurtFlash-dt);this.regenDelay=Math.max(0,this.regenDelay-dt);this.healWait=Math.max(0,this.healWait-dt);this.slowed=Math.max(0,this.slowed-dt);
  const weapon=weaponFor(this.profile);
  if(this.attackTime>=0){this.attackTime+=dt;if(this.attackTime>=weapon.duration)this.attackTime=-1;}
  if(this.regenDelay<=0&&this.attackTime<0&&this.dodgeLeft===0)this.stamina=Math.min(stats(this.profile).maxStamina,this.stamina+stats(this.profile).staminaRegen*dt);
  this.updateAim();if(this.keys.J.isDown||this.mouseHeld)this.attack();
  if(Phaser.Input.Keyboard.JustDown(this.keys.SPACE)||Phaser.Input.Keyboard.JustDown(this.keys.SHIFT))this.dodge();
  if(Phaser.Input.Keyboard.JustDown(this.keys.Q))this.heal();if(Phaser.Input.Keyboard.JustDown(this.keys.R))this.useUltimate();if(Phaser.Input.Keyboard.JustDown(this.keys.E))this.interact();
  if(this.state!=='playing')return;
  this.movePlayer(dt);this.updateAim();this.updateWeather(dt);
  if(!p.spawned&&p.elapsed>=REGIONS[this.regionIndex].bossTime)this.spawnBoss();
  this.updateEnemies(dt);this.updateHazards(dt);this.updateProjectiles(dt);this.resolveAttack();this.updateUltimate(dt);this.collectCoins();
  if(this.state!=='playing')return;
  this.checkProgress();this.updateCamp();this.drawActors();this.drawGates();
  if(this.guideLeft>0){this.guideLeft-=dt;if(this.guideLeft<=0)this.toggleGuide(false);}
  this.hudLeft-=dt;if(this.hudLeft<=0){this.updateHUD();this.hudLeft=.09;}
 }
  private drawWorld(): void {
    const road = this.add.graphics().setDepth(1);
    for (let i=0;i<REGIONS.length;i++) {
      const start = regionStart(i), region = REGIONS[i];
      const key = background(this,REGION_WIDTH,WORLD_HEIGHT,i+1,region.palette);
      this.add.image(start,0,key).setOrigin(0).setDepth(0);
      road.lineStyle(86,0xcbb991,.19); road.beginPath(); road.moveTo(start,WORLD_HEIGHT/2);
      road.lineTo(start+210,WORLD_HEIGHT/2); road.lineTo(start+500,WORLD_HEIGHT*.43); road.lineTo(start+870,WORLD_HEIGHT*.57); road.lineTo(start+REGION_WIDTH,WORLD_HEIGHT/2); road.strokePath();
      const terrain = regionTerrain(i,start,REGION_WIDTH,WORLD_HEIGHT); this.terrainByRegion.push(terrain); this.terrain.push(...terrain);
      this.nav.push(makeGrid(terrain,this.regionBounds(i),1,20)); this.bossNav.push(makeGrid(terrain,this.regionBounds(i),1,35));
      for (const t of terrain) this.add.image(t.x,t.y,t.kind).setOrigin(.5,t.kind==='tree'?.82:t.kind==='stump'?.61:.5)
        .setDisplaySize(t.kind==='tree'?125:t.kind==='puddle'?t.radius*2.5:82,t.kind==='tree'?125:t.kind==='puddle'?t.radius*2.5:82)
        .setDepth(t.kind==='puddle'?2:10+t.y*.01);
      this.add.text(start+106,WORLD_HEIGHT/2-115,`${i+1} · ${region.name}`,{fontFamily:'system-ui',fontSize:'15px',color:'#e8d299',backgroundColor:'#1e3f31',padding:{x:12,y:7}}).setDepth(3);
      this.fires.push(this.add.image(start+65,WORLD_HEIGHT/2+65,'fire').setDisplaySize(55,55).setDepth(12));
      if (i<REGIONS.length-1) {
        const camp = merchantPosition(i);
        const campKey = background(this,ROAD_WIDTH,WORLD_HEIGHT,20,REGIONS[0].palette);
        this.add.image(regionEnd(i),0,campKey).setOrigin(0).setDepth(0);
        road.lineStyle(88,0xd3bf86,.32); road.lineBetween(regionEnd(i),WORLD_HEIGHT/2,regionStart(i+1),WORLD_HEIGHT/2);
        this.add.image(camp.x,camp.y-110,'hut').setDisplaySize(155,155).setDepth(10+(camp.y-110)*.01);
        this.merchants.push(this.add.image(camp.x-36,camp.y,'merchant').setDisplaySize(78,78).setDepth(12+camp.y*.01));
        this.fires.push(this.add.image(camp.x+70,camp.y+35,'fire').setDisplaySize(60,60).setDepth(15));
        this.add.text(camp.x,camp.y-65,'БРУН · ЛАВКА',{fontFamily:'system-ui',fontSize:'12px',color:'#f3daa0',backgroundColor:'#1d3d31',padding:{x:9,y:5}}).setOrigin(.5).setDepth(17);
      }
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
    return clampPoint({x:this.player.x+this.velocity.x*time,y:this.player.y+this.velocity.y*time},this.regionBounds(e.region));
  }
  private walkEnemy(e:Enemy,target:Point,speed:number,dt:number): void {
    let aim=target;const bounds=this.regionBounds(e.region),terrain=this.terrainByRegion[e.region],grid=e.kind==='boss'?this.bossNav[e.region]:this.nav[e.region];
    if(!clearLine(e.sprite,target,e.radius,terrain,bounds)){
      if(e.nextPath<=0){e.path=findPath(e.sprite,target,grid);e.nextPath=PATH_INTERVAL;}
      while(e.path.length>1&&(Math.hypot(e.sprite.x-e.path[0].x,e.sprite.y-e.path[0].y)<14||clearLine(e.sprite,e.path[1],e.radius,terrain,bounds)))e.path.shift();
      if(e.path.length)aim=e.path[0];
    }else{e.path=[];e.nextPath=0;}
    const dx=aim.x-e.sprite.x,dy=aim.y-e.sprite.y,len=Math.hypot(dx,dy)||1,travel=Math.min(speed*dt,len);
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
  private resetWeather(): void {this.weather='clear';this.weatherLeft=0;this.weatherNext=12+Math.random()*9;this.wetZones=[];this.strike=null;this.strikeNext=2;this.slowed=0;this.weatherInk?.clear();}
  private groundSpeed(at:Point,player:boolean): number {
    if(player&&this.slowed>0)return .3;
    const wet=this.terrain.some(t=>t.kind==='puddle'&&Math.hypot(at.x-t.x,at.y-t.y)<t.radius)||this.wetZones.some(t=>Math.hypot(at.x-t.x,at.y-t.y)<t.radius);
    return wet?player?Math.min(.96,.68+this.profile.upgrades.boots*.14):.62:1;
  }
  private drawWeather(): void {
    const g=this.weatherInk;g.clear();if(this.weather==='clear')return;
    for(const z of this.wetZones){g.fillStyle(0x71b5be,.12);g.fillCircle(z.x,z.y,z.radius);g.lineStyle(1,0xade6e4,.3);g.strokeCircle(z.x,z.y,z.radius);}
    const v=this.cameras.main.worldView;g.lineStyle(1,0xc8e3e4,.38);
    for(let i=0;i<75;i++){const x=v.x+(i*83+this.animationTime*110)%v.width,y=v.y+(i*151+this.animationTime*410)%v.height;g.lineBetween(x,y,x-7,y+17);}
    if(this.strike){const s=this.strike;g.fillStyle(s.phase==='impact'?0xc8efff:0xc34c48,s.phase==='impact'?.55:.12+Math.sin(this.animationTime*16)*.05);g.fillCircle(s.x,s.y,LIGHTNING_RADIUS);g.lineStyle(3,s.phase==='impact'?0xe7faff:0xff8572,.85);g.strokeCircle(s.x,s.y,LIGHTNING_RADIUS);
      if(s.phase==='warning'){g.lineStyle(2,0xffd39b,.8);g.strokeCircle(s.x,s.y,LIGHTNING_RADIUS*(1-s.left/LIGHTNING_WARNING));}else{g.lineStyle(6,0xf1fcff,.9);g.beginPath();g.moveTo(s.x-10,s.y-190);g.lineTo(s.x+8,s.y-115);g.lineTo(s.x-10,s.y-85);g.lineTo(s.x,s.y);g.strokePath();}}
  }

 private newJourney(play=true):void{
  this.clearActors();this.profile=newProfile();this.progress=REGIONS.map(()=>({coins:0,elapsed:0,spawned:false,bossDead:false,cleared:false}));this.quests=REGIONS.map((_,i)=>newQuests(i));
  this.campVisits.clear();this.regionIndex=0;this.elapsed=0;this.score=0;this.kills=0;this.deaths=0;this.armed=false;this.ultimate=0;this.checkpoint=checkpointPosition(0);
  for(const id of ['dialog-overlay','shop-overlay','map-overlay','menu-overlay','loot-overlay','intro-overlay'])this.element(id).hidden=true;
  this.element('checkpoint-banner').hidden=true;this.checkpointBannerLeft=0;this.toggleGuide(false);this.startRegion(0,true);this.hideModal();
  if(play)this.beginIntro(false);else{this.state='ready';this.checkpointBannerLeft=0;this.element('checkpoint-banner').hidden=true;}
  this.refreshSaveUI();
 }
 private clearActors():void{
  for(const e of this.enemies){this.tweens.killTweensOf(e.sprite);e.sprite.destroy();e.shadow.destroy();}for(const c of this.coins)c.sprite.destroy();for(const c of this.chests)c.sprite.destroy();
  this.enemies=[];this.coins=[];this.chests=[];this.projectiles=[];this.hazards=[];this.ultimateLeft=0;
 }
 private startRegion(index:number,respawn=false):void{
  this.regionIndex=index;this.progress[index]={coins:0,elapsed:0,spawned:false,bossDead:false,cleared:false};
  const old=this.quests[index];this.quests[index]=newQuests(index).map(q=>old?.find(v=>v.id===q.id&&v.complete)??q);
  for(const e of this.enemies.filter(e=>e.region===index)){e.sprite.destroy();e.shadow.destroy();}this.enemies=this.enemies.filter(e=>e.region!==index);
  for(const c of this.coins.filter(c=>c.region===index))c.sprite.destroy();this.coins=this.coins.filter(c=>c.region!==index);
  this.projectiles=[];this.hazards=[];this.resetWeather();this.resetInput();this.mouse=null;this.attackTime=-1;this.ultimateLeft=0;this.ultimate=0;
  this.dodgeLeft=0;this.dodgeWait=0;this.hurtLeft=2.5;this.hurtFlash=0;this.face=0;this.movement={x:1,y:0};this.armed=false;this.profile.blade=false;
  this.player.setTexture(this.profile.skin).setAlpha(1).clearTint().setAngle(0).setScale(72/128).setFlipX(false);
  this.checkpoint=checkpointPosition(index);if(respawn)this.player.setPosition(this.checkpoint.x,this.checkpoint.y);
  this.cameras.main.centerOn(this.player.x,this.player.y);const s=stats(this.profile);this.hp=s.maxHP;this.stamina=s.maxStamina;this.flasks=s.flasks;
  const r=REGIONS[index];for(const group of r.roster)for(let n=0;n<group.count;n++)this.spawnEnemy(group.kind,index,n);
  for(let n=0;n<7;n++)this.spawnCoin(index,n===0);
  this.state='playing';this.audio.setRegion(index);this.drawGates();this.updateHUD();this.drawActors();this.reachCheckpoint(`Костёр · ${r.name}`);
  if(index>0&&!respawn)this.beginIntro(true);
 }
 private beginIntro(resume:boolean):void{
  this.audio.unlock();this.state='intro';this.introLeft=INTRO_DURATION;this.introBroken=false;this.introResume=resume;this.resetInput();this.armed=true;
  this.element('intro-overlay').hidden=false;this.element('intro-tag').textContent=REGIONS[this.regionIndex].name;
  this.element('intro-title').textContent=resume?'Новая земля. Та же древняя аура.':'Ты пришёл с оружием.';
  this.element('intro-text').textContent=`${weaponFor(this.profile).name} хранит твою силу. Но туман уже сомкнулся за спиной.`;
  this.checkpointBannerLeft=0;this.element('checkpoint-banner').hidden=true;this.drawActors();
 }
 private updateIntro(dt:number):void{
  this.introLeft-=dt;this.animationTime+=dt;
  if(this.introLeft<INTRO_DURATION-1.5&&!this.introBroken){this.introBroken=true;this.armed=false;this.profile.blade=false;this.audio.play('crack');this.cameras.main.shake(240,.005);this.particles(this.player.x+25,this.player.y,24,0xa6eaf1);
   this.element('intro-title').textContent='Аура места разрушила оружие.';this.element('intro-text').textContent=`Собери ${REGIONS[this.regionIndex].awaken} осколков собственной души. Они восстановят выбранное оружие. Нежить не даст сделать это спокойно.`;
  }
  this.drawActors();this.drawGates();if(this.introLeft<=0)this.finishIntro();
 }
 private finishIntro():void{
  if(this.state!=='intro')return;this.armed=false;this.profile.blade=false;this.element('intro-overlay').hidden=true;this.state='playing';this.resetInput();this.hurtLeft=2;
  this.reachCheckpoint(`Костёр · ${REGIONS[this.regionIndex].name}`);if(!this.introResume){this.toggleGuide(true);this.guideLeft=18;}this.updateHUD();
 }
 private reachCheckpoint(name:string):void{
  this.element('checkpoint-name').textContent=name;this.element('checkpoint-banner').hidden=false;this.checkpointBannerLeft=2.7;this.audio.play('checkpoint');
 }
 private respawn():void{
  const oldCheckpoint={...this.checkpoint},index=this.regionIndex,completed={...this.progress[index]};
  this.startRegion(index,true);
  if(completed.cleared){this.progress[index]=completed;this.armed=true;this.profile.blade=true;}
  this.player.setPosition(oldCheckpoint.x,oldCheckpoint.y);this.checkpoint=oldCheckpoint;
  const bounded=clampPoint(this.player,this.playerBounds());this.player.setPosition(bounded.x,bounded.y);
  this.reachCheckpoint(`Возрождение · ${REGIONS[index].name}`);this.toast('Костёр вернул тебя. Враги и сила незавершённого биома восстановлены; снаряжение осталось.');this.drawGates();this.updateHUD();
 }
 private spawnEnemy(kind:EnemyKind,index:number,variant=0,point?:Point):Enemy{
  const r=REGIONS[index],boss=kind==='boss',pos=point??this.freePosition(index,boss?34:20,310);
  const key=boss?r.bossTexture:kind;
  const hp=boss?r.bossHP:kind==='skeleton'?44+index*12:kind==='zombie'?66+index*16:kind==='necromancer'?58+index*17:kind==='vampire'?72+index*18:110+index*22;
  const size=boss?148:kind==='dragon'?103:kind==='zombie'?83:78;
  const sprite=this.add.image(pos.x,pos.y,key).setDisplaySize(size,size).setDepth(20+pos.y*.01);
  const shadow=this.add.ellipse(pos.x,pos.y+(boss?36:21),boss?66:kind==='dragon'?53:35,boss?22:14,0x092a27,.32).setDepth(8);
  const e:Enemy={id:this.nextId++,region:index,kind,variant,sprite,shadow,hp,maxHP:hp,radius:boss?34:kind==='dragon'?25:20,
   damage:boss?18+index*6:kind==='skeleton'?10+index*3:kind==='zombie'?14+index*4:kind==='vampire'?13+index*4:kind==='dragon'?16+index*4:11+index*3,
   reward:boss?BOSS_REWARD+index*10:kind==='skeleton'?5+index:kind==='zombie'?6+index*2:kind==='dragon'?12+index*2:9+index*2,
   speed:r.speed*(boss?.95:kind==='zombie'?.70:kind==='necromancer'?.72:kind==='vampire'?1.18:kind==='dragon'?.88:1),
   mode:'chase',clock:2.1+variant*.28,nextPath:0,path:[],aim:{x:1,y:0},target:{...pos},hasHit:false,stun:0,flash:0,phase2:false,dead:false,move:'slash',moveIndex:variant};
  this.enemies.push(e);return e;
 }
 private spawnBoss():void{
  const p=this.progress[this.regionIndex];if(p.spawned||p.bossDead)return;p.spawned=true;
  this.spawnEnemy('boss',this.regionIndex,0,this.freePosition(this.regionIndex,35,310));this.audio.play('boss');
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
  const before={x:this.player.x,y:this.player.y},moved=moveCircle(before,x*speed*dt,y*speed*dt,PLAYER_RADIUS,this.terrain,this.playerBounds());this.player.setPosition(moved.x,moved.y);
  this.velocity=dt>0?{x:(moved.x-before.x)/dt,y:(moved.y-before.y)/dt}:{x:0,y:0};
  this.audio.footstep(this.groundSpeed(this.player,true)<1?'water':REGIONS[this.regionIndex].ground,Math.hypot(this.velocity.x,this.velocity.y)>15&&this.dodgeLeft<=0);
  if(this.dodgeLeft>0&&Math.floor(this.animationTime*45)%3===0){const ghost=this.add.image(this.player.x,this.player.y,this.profile.skin).setDisplaySize(72,72).setAlpha(.20).setFlipX(this.player.flipX).setDepth(9);this.tweens.add({targets:ghost,alpha:0,duration:150,onComplete:()=>ghost.destroy()});}
 }
 private attack():void{
  if(this.state!=='playing')return;const w=weaponFor(this.profile);
  if(!this.armed){if(!this.mouseHeld)this.toast(`Нужно ${REGIONS[this.regionIndex].awaken} осколков силы, чтобы восстановить оружие.`);return;}
  if(this.attackTime>=0||this.dodgeLeft>0||this.stamina<w.cost||this.ultimateLeft>0)return;
  this.updateAim();this.combo=this.elapsed-this.lastAttack<1.2?(this.combo+1)%3:0;this.lastAttack=this.elapsed;
  this.attackTime=0;this.attackAngle=this.face;this.attackHits.clear();this.attackFired=false;this.stamina-=w.cost;this.regenDelay=STAMINA_DELAY;
 }
 private dodge():void{
  if(this.state!=='playing'||this.dodgeWait>0||this.stamina<DODGE_COST)return;const w=weaponFor(this.profile);
  if(this.attackTime>=0&&this.attackTime<w.activeEnd)return;
  this.attackTime=-1;this.dodgeLeft=DODGE_TIME;this.dodgeWait=stats(this.profile).dodgeCooldown;
  this.dodgeVector=Math.hypot(this.velocity.x,this.velocity.y)>5?this.movement:{x:Math.cos(this.face),y:Math.sin(this.face)};
  this.stamina-=DODGE_COST;this.regenDelay=STAMINA_DELAY;this.audio.play('dash');
 }
 private heal():void{
  if(this.state!=='playing'||this.healWait>0||this.attackTime>=0||this.dodgeLeft>0)return;
  if(this.flasks<=0){this.toast('Фляга пуста. Дойди до следующего костра или найди лечение в сундуке.');return;}
  if(this.hp>=stats(this.profile).maxHP)return;
  this.flasks--;this.hp=Math.min(stats(this.profile).maxHP,this.hp+FLASK_HEAL);this.healWait=1.1;this.audio.play('heal');this.particles(this.player.x,this.player.y,12,0xbdd785);this.updateHUD();
 }
 private resolveAttack():void{
  const w=weaponFor(this.profile);if(this.attackTime<w.windup||this.attackTime>w.activeEnd)return;
  if(!this.attackFired){this.attackFired=true;this.audio.play(w.type==='magic'?'cast':w.type==='thrust'?'thrust':w.type==='sweep'?'axe':'slash');
   if(w.type==='magic'){this.shoot(this.player,this.attackAngle,520,stats(this.profile).damage*(1+this.combo*.12),true,this.regionIndex,w.color,75);return;}}
  if(w.type==='magic')return;
  for(const e of this.enemies){if(e.dead||this.attackHits.has(e.id)||!slashConnects(this.player,this.attackAngle,e.sprite,e.radius,w.reach,w.arc)||!clearLine(this.player,e.sprite,3,this.terrain,this.playerBounds()))continue;
   this.attackHits.add(e.id);this.hitEnemy(e,stats(this.profile).damage*[1,1.15,1.4][this.combo],w.type==='sweep'?65:30);
  }
 }
 private hitEnemy(e:Enemy,amount:number,knockback=25):void{
  if(e.dead)return;const damage=Math.round(amount);e.hp=Math.max(0,e.hp-damage);e.flash=.15;e.stun=e.kind==='boss'?.035:e.kind==='dragon'?.12:.23;e.nextPath=0;
  if(e.kind!=='boss'){e.mode='recover';e.clock=.36;const dx=e.sprite.x-this.player.x,dy=e.sprite.y-this.player.y,len=Math.hypot(dx,dy)||1,moved=moveCircle(e.sprite,dx/len*knockback,dy/len*knockback,e.radius,this.terrainByRegion[e.region],this.regionBounds(e.region));e.sprite.setPosition(moved.x,moved.y);}
  this.ultimate=Math.min(ULTIMATE_MAX,this.ultimate+5);this.audio.play('hit');this.particles(e.sprite.x,e.sprite.y,5,0xbfe9d8);this.popup(e.sprite.x,e.sprite.y-28,String(damage),'#d9f1e5');this.onQuestEvent('hit');
  if(e.hp<=0)this.killEnemy(e);
 }
 private killEnemy(e:Enemy):void{
  if(e.dead)return;e.dead=true;this.kills++;this.score+=e.reward*40;this.grantCoins(e.reward,e.region,e.kind!=='boss');this.onQuestEvent('kill');
  this.hp=Math.min(stats(this.profile).maxHP,this.hp+this.profile.upgrades.recovery*2);
  this.popup(e.sprite.x,e.sprite.y-50,`+${e.reward} ◈`,'#baf3ec');this.tweens.add({targets:e.sprite,angle:e.sprite.flipX?-85:85,alpha:0,scaleX:e.sprite.scaleX*.7,scaleY:e.sprite.scaleY*.7,duration:430,onComplete:()=>{e.sprite.setVisible(false);e.shadow.setVisible(false);}});
  this.particles(e.sprite.x,e.sprite.y,12,0xade2df);
  if(e.kind==='boss'){this.progress[e.region].bossDead=true;this.toast(`${REGIONS[e.region].bossName} побеждён. +${e.reward} осколков души.`);this.checkProgress();}
 }
 private damagePlayer(amount:number,source:Point,magic=false):void{
  if(this.state!=='playing'||this.hurtLeft>0||this.dodgeLeft>0)return;const s=stats(this.profile),damage=Math.max(2,Math.round(amount*s.armor*(magic?s.ward:1)));
  this.hp=Math.max(0,this.hp-damage);this.hurtLeft=HURT_PROTECTION;this.hurtFlash=.22;this.attackTime=-1;this.onQuestEvent('hurt');this.audio.play('hurt');
  const dx=this.player.x-source.x,dy=this.player.y-source.y,len=Math.hypot(dx,dy)||1,moved=moveCircle(this.player,dx/len*25,dy/len*25,PLAYER_RADIUS,this.terrain,this.playerBounds());this.player.setPosition(moved.x,moved.y);
  this.cameras.main.shake(100,.0035);this.particles(this.player.x,this.player.y,7,0xd99591);this.popup(this.player.x,this.player.y-38,`-${damage}`,'#f0b0aa');
  this.updateHUD();if(this.hp<=0){this.deaths++;this.state='dying';this.deathLeft=.8;this.resetInput();this.sword.setVisible(false);this.armorSprite.setVisible(false);this.toast('Ты пал. Костёр хранит твоё эхо.');}
 }
 private useUltimate():void{
  if(this.state!=='playing'||!this.armed||this.ultimate<ULTIMATE_MAX||this.attackTime>=0||this.dodgeLeft>0)return;
  this.updateAim();this.ultimate=0;this.ultimateAngle=this.face;this.ultimateLeft=.86;this.ultimatePulse=0;this.hurtLeft=Math.max(this.hurtLeft,.45);this.audio.play('ultimate');
  const w=weaponFor(this.profile);this.toast(w.ultimate);this.particles(this.player.x,this.player.y,18,w.color);
  if(w.id==='staff')for(let n=0;n<8;n++)this.shoot(this.player,this.face+n*Math.PI/4,470,stats(this.profile).damage*2*(1+this.profile.upgrades.spirit*.2),true,this.regionIndex,w.color,85);
 }
 private updateUltimate(dt:number):void{
  if(this.ultimateLeft<=0)return;const before=this.ultimateLeft;this.ultimateLeft=Math.max(0,this.ultimateLeft-dt);const w=weaponFor(this.profile);
  const pulses=w.id==='axe'?3:1;
  while(this.ultimatePulse<pulses&&.86-this.ultimateLeft>=this.ultimatePulse*.25){this.ultimatePulse++;
   if(w.id==='staff')continue;const reach=w.id==='spear'?440:w.id==='axe'?150:185,arc=w.id==='spear'?.30:Math.PI;
   for(const e of this.enemies)if(!e.dead&&e.region===this.regionIndex&&slashConnects(this.player,this.ultimateAngle,e.sprite,e.radius,reach,arc)&&clearLine(this.player,e.sprite,3,this.terrain,this.playerBounds()))this.hitEnemy(e,stats(this.profile).damage*(w.id==='axe'?1:2.4)*(1+this.profile.upgrades.spirit*.2),55);
  }
  if(before>0&&this.ultimateLeft===0)this.ultimate=0;
 }
 private startEnemyAttack(e:Enemy):void{
  const moves:EnemyAttack[]=e.kind==='boss'?REGIONS[e.region].bossMoves:e.kind==='skeleton'?['slash','charge']:e.kind==='zombie'?['slash','poison']:e.kind==='necromancer'?['fan','summon']:e.kind==='vampire'?['blink','slash','fan']:['breath','charge','fan'];
  e.move=moves[e.moveIndex%moves.length];e.moveIndex++;e.target=this.predict(e);
  if(e.move==='blink'){const at=clampPoint({x:e.target.x-Math.cos(this.face)*100,y:e.target.y-Math.sin(this.face)*100},this.regionBounds(e.region));e.target=freePoint(at,e.radius,this.terrainByRegion[e.region],this.regionBounds(e.region))?at:{x:this.player.x,y:this.player.y};}
  const dx=e.target.x-e.sprite.x,dy=e.target.y-e.sprite.y,len=Math.hypot(dx,dy)||1;e.aim={x:dx/len,y:dy/len};e.mode='windup';e.hasHit=false;
  const complex=['summon','meteor','breath','blink','poison'].includes(e.move);e.clock=(e.kind==='boss'?(complex?1.15:.78):complex?.92:.48)*(e.phase2?.78:1);
 }
 private updateEnemies(dt:number):void{
  for(const e of [...this.enemies]){
   if(e.dead||e.region!==this.regionIndex)continue;e.stun=Math.max(0,e.stun-dt);e.flash=Math.max(0,e.flash-dt);e.nextPath-=dt;if(e.stun>0)continue;e.clock-=dt;
   const bounds=this.regionBounds(e.region),distance=Math.hypot(this.player.x-e.sprite.x,this.player.y-e.sprite.y);
   if(this.player.x<bounds.left!||this.player.x>regionEnd(e.region)||distance>850)continue;
   const slow=this.groundSpeed(e.sprite,false);
   if(e.kind==='boss'&&!e.phase2&&e.hp<=e.maxHP*.5){e.phase2=true;e.clock=Math.min(e.clock,.5);this.summonMinions(e,2);this.toast(`${REGIONS[e.region].bossName}: вторая фаза. Ускоренные приёмы и призванная нежить.`);}
   if(e.mode==='windup'){if(e.clock<=0)this.executeEnemyAttack(e);continue;}
   if(e.mode==='charge'){
    const speed=(e.kind==='boss'?(e.phase2?480:415):e.kind==='vampire'?405:e.kind==='dragon'?370:300)*slow;
    const moved=moveCircle(e.sprite,e.aim.x*speed*dt,e.aim.y*speed*dt,e.radius,this.terrainByRegion[e.region],bounds);e.sprite.setPosition(moved.x,moved.y).setFlipX(e.aim.x<0);
    if(!e.hasHit&&Math.hypot(e.sprite.x-this.player.x,e.sprite.y-this.player.y)<e.radius+PLAYER_RADIUS+9&&clearLine(e.sprite,this.player,3,this.terrainByRegion[e.region],bounds)){this.damagePlayer(e.damage,e.sprite);e.hasHit=true;}
    if(e.clock<=0){e.mode='recover';e.clock=e.kind==='boss'?(e.phase2?.64:.95):.85;}continue;
   }
   if(e.mode==='recover'){if(e.clock<=0){e.mode='chase';e.clock=e.kind==='boss'?(e.phase2?.8:1.2):e.kind==='necromancer'?2.7:1.1;}continue;}
   const ranged=e.kind==='necromancer'||e.kind==='dragon'||e.kind==='boss'&&(REGIONS[e.region].bossTexture==='necromancer'||REGIONS[e.region].bossTexture==='dragon');
   if(ranged&&distance<200){const dx=e.sprite.x-this.player.x,dy=e.sprite.y-this.player.y,len=Math.hypot(dx,dy)||1;this.walkEnemy(e,clampPoint({x:e.sprite.x+dx/len*150,y:e.sprite.y+dy/len*150},bounds),e.speed*slow,dt);}
   else if(!ranged||distance>350){let target=this.predict(e);if(e.kind==='skeleton'&&distance>120){const a=Math.atan2(target.y-e.sprite.y,target.x-e.sprite.x),side=Math.sin(e.id*3+this.elapsed*.8)*55;target=clampPoint({x:target.x-Math.sin(a)*side,y:target.y+Math.cos(a)*side},bounds);}this.walkEnemy(e,target,e.speed*(e.phase2?1.14:1)*slow,dt);}
   const reach=e.kind==='boss'?ranged?580:320:e.kind==='necromancer'||e.kind==='dragon'?520:e.kind==='vampire'?300:e.kind==='zombie'?125:100;
   if(e.clock<=0&&distance<reach)this.startEnemyAttack(e);
  }
 }
 private recoverEnemy(e:Enemy,seconds=1):void{e.mode='recover';e.clock=seconds*(e.phase2?.75:1);}
 private executeEnemyAttack(e:Enemy):void{
  const angle=Math.atan2(e.aim.y,e.aim.x),r=REGIONS[e.region];
  if(e.move==='charge'){e.mode='charge';e.clock=e.kind==='boss'?.62:.37;this.audio.play('dash');return;}
  if(e.move==='slash'){
   const reach=e.kind==='boss'?143:e.kind==='zombie'?86:92;
   if(slashConnects(e.sprite,angle,this.player,PLAYER_RADIUS,reach,1.2)&&clearLine(e.sprite,this.player,3,this.terrainByRegion[e.region],this.regionBounds(e.region))){
    const before=this.hp;this.damagePlayer(e.damage,e.sprite);if((e.kind==='vampire'||r.bossTexture==='vampire')&&this.hp<before)e.hp=Math.min(e.maxHP,e.hp+(before-this.hp)*.7);
   }
   this.audio.play(e.kind==='zombie'||e.kind==='vampire'?'bite':'slash');
  }else if(e.move==='slam'){
   if(Math.hypot(e.sprite.x-this.player.x,e.sprite.y-this.player.y)<155+PLAYER_RADIUS&&clearLine(e.sprite,this.player,3,this.terrainByRegion[e.region],this.regionBounds(e.region)))this.damagePlayer(e.damage*1.15,e.sprite);
   this.hazards.push({x:e.sprite.x,y:e.sprite.y,region:e.region,radius:155,warning:0,left:.35,damage:0,kind:'ring',fired:true});this.audio.play('axe');this.particles(e.sprite.x,e.sprite.y,16,0xb9c892);
  }else if(e.move==='poison'){
   const targets=e.kind==='boss'?[e.sprite,e.target]:[e.sprite];
   for(const p of targets)this.hazards.push({x:p.x,y:p.y,region:e.region,radius:e.kind==='boss'?100:72,warning:.5,left:5.5,damage:e.damage*.50,kind:'poison',fired:false});this.audio.play('bite');
  }else if(e.move==='summon'){this.summonMinions(e,e.kind==='boss'?(e.phase2?3:2):1);this.audio.play('cast');
  }else if(e.move==='fan'||e.move==='breath'){
   const count=e.move==='breath'?(e.phase2?7:5):e.kind==='boss'?5:3,spread=e.move==='breath'?.17:.23,color=e.move==='breath'?0xf4ad76:r.bossTexture==='vampire'||e.kind==='vampire'?0xda8db0:0xa6d9b9;
   for(let n=0;n<count;n++)this.shoot(e.sprite,angle+(n-(count-1)/2)*spread,e.move==='breath'?330:280,e.damage,false,e.region,color,0);
   this.audio.play(e.move==='breath'?'axe':'cast');
  }else if(e.move==='blink'){
   this.particles(e.sprite.x,e.sprite.y,9,0xc7aedc);const at=moveCircle(e.target,0,0,e.radius,this.terrainByRegion[e.region],this.regionBounds(e.region));e.sprite.setPosition(at.x,at.y);this.particles(at.x,at.y,9,0xc7aedc);
   const dx=this.player.x-at.x,dy=this.player.y-at.y,len=Math.hypot(dx,dy)||1;e.aim={x:dx/len,y:dy/len};e.move='slash';e.mode='windup';e.clock=.42;this.audio.play('dash');return;
  }else if(e.move==='meteor'){
   const count=e.phase2?5:3;for(let n=0;n<count;n++){
    const p=n===0?e.target:clampPoint({x:e.target.x+Math.cos(n*2.4)*125,y:e.target.y+Math.sin(n*2.4)*125},this.regionBounds(e.region));
    this.hazards.push({x:p.x,y:p.y,region:e.region,radius:58,warning:1.15+n*.12,left:1.7+n*.12,damage:e.damage*1.05,kind:'meteor',fired:false});
   }this.audio.play('cast');
  }
  this.recoverEnemy(e,e.move==='summon'?1.4:e.move==='breath'?1.3:.95);
 }
 private summonMinions(e:Enemy,count:number):void{
  const active=this.enemies.filter(v=>v.region===e.region&&!v.dead&&v.kind!=='boss').length;
  const available=Math.min(count,MAX_MINIONS-active);for(let n=0;n<available;n++){
   const angle=n*Math.PI*2/Math.max(1,available),candidate=clampPoint({x:e.sprite.x+Math.cos(angle)*90,y:e.sprite.y+Math.sin(angle)*90},this.regionBounds(e.region));
   const p=freePoint(candidate,22,this.terrainByRegion[e.region],this.regionBounds(e.region))?candidate:this.freePosition(e.region,22,200);
   const kind=e.region===1?'zombie':e.region===2?'vampire':'skeleton';const minion=this.spawnEnemy(kind,e.region,n,p);minion.stun=.75;minion.clock=2;
   this.hazards.push({...p,region:e.region,radius:30,warning:.7,left:1,damage:0,kind:'ring',fired:false});this.particles(p.x,p.y,8,0xb5ccef);
  }
 }
 private shoot(from:Point,angle:number,speed:number,damage:number,friendly:boolean,region:number,color:number,blast:number):void{
  this.projectiles.push({x:from.x+Math.cos(angle)*25,y:from.y+Math.sin(angle)*25,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:friendly?.86:2.8,damage,region,friendly,color,radius:friendly?8:7,blast,hits:new Set()});
 }
 private updateProjectiles(dt:number):void{
  for(const p of this.projectiles){p.life-=dt;const before={x:p.x,y:p.y};p.x+=p.vx*dt;p.y+=p.vy*dt;
   if(!clearLine(before,p,3,this.terrainByRegion[p.region],this.regionBounds(p.region)))p.life=0;if(p.life<=0)continue;
   if(p.friendly){const target=this.enemies.find(e=>!e.dead&&e.region===p.region&&!p.hits.has(e.id)&&Math.hypot(e.sprite.x-p.x,e.sprite.y-p.y)<e.radius+p.radius);
    if(target){p.hits.add(target.id);this.hitEnemy(target,p.damage,22);if(p.blast>0){this.particles(p.x,p.y,12,p.color);for(const e of this.enemies)if(e!==target&&!e.dead&&e.region===p.region&&Math.hypot(e.sprite.x-p.x,e.sprite.y-p.y)<p.blast+e.radius)this.hitEnemy(e,p.damage*.70,18);}p.life=0;}
   }else if(Math.hypot(p.x-this.player.x,p.y-this.player.y)<PLAYER_RADIUS+p.radius){this.damagePlayer(p.damage,p,true);p.life=0;}
  }this.projectiles=this.projectiles.filter(p=>p.life>0);
 }
 private updateHazards(dt:number):void{
  for(const h of this.hazards){h.left-=dt;const before=h.warning;h.warning-=dt;if(h.warning>0)continue;
   if(h.kind==='meteor'&&!h.fired){h.fired=true;this.audio.play('thunder');this.particles(h.x,h.y,14,0xffc699);if(Math.hypot(h.x-this.player.x,h.y-this.player.y)<h.radius+PLAYER_RADIUS)this.damagePlayer(h.damage,h,true);}
   if(h.kind==='poison'&&h.left>0&&Math.hypot(h.x-this.player.x,h.y-this.player.y)<h.radius+PLAYER_RADIUS){this.damagePlayer(h.damage,h,true);}
   if(before>0&&h.kind==='ring')h.fired=true;
  }this.hazards=this.hazards.filter(h=>h.left>0);
 }
 private grantCoins(value:number,index:number,countsForGoal=true):void{
  this.profile.coins+=value;this.score+=value*100;this.ultimate=Math.min(ULTIMATE_MAX,this.ultimate+Math.min(12,value*3));
  if(countsForGoal&&index===this.regionIndex)this.progress[index].coins+=value;
  if(!this.armed&&this.progress[this.regionIndex].coins>=REGIONS[this.regionIndex].awaken){this.armed=true;this.profile.blade=true;this.particles(this.player.x,this.player.y,24,weaponFor(this.profile).color);this.audio.play('checkpoint');this.toast(`СИЛА ВОССТАНОВЛЕНА · ${weaponFor(this.profile).name}. Наводи мышью и сражайся!`);}
  this.checkProgress();this.updateHUD();
 }
 private collectCoins():void{
  for(const c of [...this.coins]){
   if(c.region!==this.regionIndex||Math.hypot(c.sprite.x-this.player.x,c.sprite.y-this.player.y)>PICKUP_RADIUS+this.profile.upgrades.magnet*20)continue;
   const x=c.sprite.x,y=c.sprite.y;c.sprite.destroy();this.coins.splice(this.coins.indexOf(c),1);this.grantCoins(c.value,c.region);this.onQuestEvent('pickup');this.audio.play('pickup');this.particles(x,y,6,0xbef5ee);
   if(this.state==='playing'&&(!this.progress[c.region].cleared||this.quests[c.region].some(q=>q.id==='sprint'&&!q.complete)))this.spawnCoin(c.region);
  }
 }
 private checkProgress():void{
  const p=this.progress[this.regionIndex];if(!p.cleared&&p.coins>=REGIONS[this.regionIndex].coins&&p.bossDead){p.cleared=true;this.drawGates();
   if(this.regionIndex===REGIONS.length-1){this.state='won';this.resetInput();this.showModal('ТВОЯ ДУША СНОВА ЦЕЛА','Клятва исполнена.',`Пять хозяев повержены. Ты вернул свою силу. Прогресс сохранится только если нажмёшь кнопку сохранения.`,'Новое путешествие ↗',false);this.showStats();this.element('modal-save').hidden=false;this.audio.play('checkpoint');return;}
   this.toast('Туман рассеялся. Иди на восток: за границей ждут костёр и лавка Бруна.');}
  if(p.cleared&&this.regionIndex<REGIONS.length-1&&this.player.x>=regionStart(this.regionIndex+1)+45)this.startRegion(this.regionIndex+1);
 }
 private updateCamp():void{
  this.nearestMerchant=-1;this.nearestChest=-1;let nearest=INTERACT_DISTANCE;
  for(let i=0;i<this.merchants.length;i++){
   const eligible=i===this.regionIndex?this.progress[i].cleared:i<this.regionIndex&&this.progress[this.regionIndex].bossDead&&this.progress[i].cleared;
   if(!eligible)continue;const m=this.merchants[i],distance=Math.hypot(m.x-this.player.x,m.y-this.player.y);
   if(distance<150&&!this.campVisits.has(i)){this.campVisits.add(i);const s=stats(this.profile);this.hp=s.maxHP;this.stamina=s.maxStamina;this.flasks=s.flasks;if(i===this.regionIndex)this.checkpoint={x:m.x+70,y:m.y+35};this.particles(this.player.x,this.player.y,14,0x9be1b6);this.reachCheckpoint('Стоянка Бруна · фляги восстановлены');}
   if(distance<nearest){nearest=distance;this.nearestMerchant=i;}
  }
  this.chests.forEach((c,i)=>{if(c.opened||c.region!==this.regionIndex)return;const distance=Math.hypot(c.x-this.player.x,c.y-this.player.y);if(distance<nearest){nearest=distance;this.nearestChest=i;this.nearestMerchant=-1;}});
  this.element('interaction').hidden=this.nearestMerchant<0&&this.nearestChest<0;
  this.element('interact-button').textContent=this.nearestChest>=0?'E · Открыть сундук':'E · Поговорить с Бруном';
 }
 private interact():void{
  if(this.state!=='playing')return;this.updateCamp();
  if(this.nearestChest>=0){this.openChest(this.chests[this.nearestChest]);return;}
  if(this.nearestMerchant<0)return;this.dialogMerchant=this.nearestMerchant;this.state='dialog';this.resetInput();this.element('interaction').hidden=true;
  this.element<HTMLImageElement>('merchant-portrait').src=this.textures.getBase64('merchant');this.element('dialog-overlay').hidden=false;
  this.say(`Ты ещё держишься, лис. Я Брун. Твои осколки можно связать в оружие и броню. Дальше - ${REGIONS[this.dialogMerchant+1].name}. Купи защиту и выбери оружие до входа: назад туман не пустит.`);
 }
 private say(text:string):void{this.dialogTarget=text;this.dialogTime=0;this.element('dialog-text').textContent='';}
 private leaveDialog():void{this.element('dialog-overlay').hidden=true;this.state='playing';this.resetInput();}
 private onQuestEvent(event:'pickup'|'kill'|'hit'|'hurt'):void{
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
   else if(upgrade)this.profile.upgrades[upgrade.id]=Math.min(upgrade.prices.length,this.profile.upgrades[upgrade.id]+1);
  }
  this.applyEquipment(before);this.element('loot-result').textContent=loot.kind==='empty'?'Сундук пуст. Следующее эхо может быть щедрее.':`Получено: ${loot.name}`;this.element('loot-result').style.color=loot.color;
  this.element<HTMLButtonElement>('loot-close').disabled=false;this.audio.play(loot.kind==='empty'?'empty':'loot');this.updateHUD();
 }
 private openShop():void{
  if(this.state!=='dialog')return;this.state='shop';this.element('dialog-overlay').hidden=true;this.element('shop-overlay').hidden=false;this.shopPage=0;
  this.element('shop-message').textContent='Расходы не уменьшают собранную силу биома. Новое оружие меняет атаку и абсолютное умение.';this.renderShop();
 }
 private renderShop():void{
  const items=this.shopTab==='skins'?SKINS:this.shopTab==='weapons'?WEAPONS:this.shopTab==='armors'?ARMORS:UPGRADES;
  const pages=Math.ceil(items.length/4);this.shopPage=Math.min(pages-1,Math.max(0,this.shopPage));
  this.element('shop-wallet').textContent=`◈ ${this.profile.coins}`;this.element('shop-page').textContent=`${this.shopPage+1} / ${pages}`;
  this.element<HTMLButtonElement>('shop-prev').disabled=this.shopPage===0;this.element<HTMLButtonElement>('shop-next').disabled=this.shopPage===pages-1;
  for(const tab of ['skins','weapons','armors','upgrades']){this.element(`tab-${tab}`).classList.toggle('selected',tab===this.shopTab);}
  this.element('storage-status').textContent=this.storageAvailable?'Покупки сохранятся только по кнопке «Сохранить прогресс» в меню.':'Браузер запретил сохранение; покупки действуют в этой вкладке.';
  this.element('shop-items').innerHTML=this.itemCards(this.shopTab,this.shopPage,true);
 }
 private itemCards(tab:ShopTab,page:number,shop:boolean):string{
  const cards:string[]=[],p=this.profile;
  if(tab==='upgrades'){for(const u of UPGRADES.slice(page*4,page*4+4)){const rank=p.upgrades[u.id],max=rank>=u.prices.length;
   cards.push(`<article class="shop-card"><span class="upgrade-icon">${u.icon}</span><h3>${u.name}</h3><p>${u.description}<br>${rank} / ${u.prices.length}</p><button data-item="${u.id}" ${max?'disabled':''}>${max?'Максимум':`${u.prices[rank]} ◈`}</button></article>`);}
  }else{
   const items=tab==='skins'?SKINS:tab==='weapons'?WEAPONS:ARMORS;
   for(const item of items.slice(page*4,page*4+4)){
    const owned=tab==='skins'?p.owned.includes(item.id):tab==='weapons'?p.weapons.some(id=>id===item.id):p.armors.some(id=>id===item.id);
    const selected=(tab==='skins'?p.skin:tab==='weapons'?p.weapon:p.armor)===item.id;
    const info='description'in item?item.description:'Облик героя';
    const picture=tab==='skins'?`<img src="${this.textures.getBase64(item.id)}" alt="">`:tab==='weapons'?`<img src="${this.textures.getBase64(item.id)}" alt="">`:`<span class="upgrade-icon">${'icon'in item?item.icon:'◇'}</span>`;
    cards.push(`<article class="shop-card">${picture}<h3>${item.name}</h3><p>${info}</p><button ${shop?'data-item':'data-equip'}="${item.id}" ${selected||!shop&&!owned?'disabled':''}>${selected?'Выбрано':owned?'Надеть':shop?`${item.price} ◈`:'У Бруна'}</button></article>`);
   }
  }return cards.join('');
 }
 private applyEquipment(before:ReturnType<typeof stats>):void{
  const after=stats(this.profile);this.hp=Math.min(after.maxHP,this.hp+Math.max(0,after.maxHP-before.maxHP));this.stamina=Math.min(after.maxStamina,this.stamina+Math.max(0,after.maxStamina-before.maxStamina));
  this.flasks=Math.min(after.flasks,this.flasks+Math.max(0,after.flasks-before.flasks));this.player.setTexture(this.profile.skin);this.attackTime=-1;this.sword.setTexture(this.profile.weapon);this.drawActors();
 }
 private equip(id:string):void{
  const p=this.profile,before=stats(p);const weapon=WEAPONS.find(w=>w.id===id),armor=ARMORS.find(a=>a.id===id);
  if(weapon&&p.weapons.includes(weapon.id))p.weapon=weapon.id;else if(armor&&p.armors.includes(armor.id))p.armor=armor.id;else if(p.owned.includes(id))p.skin=id;else return;
  this.applyEquipment(before);this.renderEquipment();this.updateHUD();
 }
 private toggleMenu():void{
  if(this.state==='menu'){this.state=this.menuReturn;this.element('menu-overlay').hidden=true;this.resetInput();if(this.state==='paused')this.showPauseModal();return;}
  if(this.state!=='playing'&&this.state!=='paused')return;
  this.menuReturn=this.state;this.state='menu';this.resetInput();this.hideModal();this.toggleGuide(false);this.element('interaction').hidden=true;this.element('menu-overlay').hidden=false;this.renderMenu();
 }
 private renderMenu():void{
  this.updateHUD();this.drawMaps();this.refreshSaveUI();this.element('menu-wallet').textContent=`◈ ${this.profile.coins}`;
  for(const tab of ['overview','equipment','quests','settings'] as const)this.element(`menu-${tab}`).hidden=tab!==this.menuTab;
  for(const b of document.querySelectorAll<HTMLButtonElement>('[data-menu-tab]'))b.classList.toggle('selected',b.dataset.menuTab===this.menuTab);
  if(this.menuTab==='equipment')this.renderEquipment();if(this.menuTab==='quests')this.renderQuests();if(this.menuTab==='settings')this.renderAudio();
 }
 private renderEquipment():void{
  const items=this.equipmentTab==='weapons'?WEAPONS:this.equipmentTab==='armors'?ARMORS:SKINS,pages=Math.ceil(items.length/4);
  this.equipmentPage=Math.max(0,Math.min(pages-1,this.equipmentPage));this.element('equipment-items').innerHTML=this.itemCards(this.equipmentTab,this.equipmentPage,false);
  this.element('equipment-page').textContent=`${this.equipmentPage+1} / ${pages}`;this.element<HTMLButtonElement>('equipment-prev').disabled=this.equipmentPage===0;this.element<HTMLButtonElement>('equipment-next').disabled=this.equipmentPage===pages-1;
  for(const b of document.querySelectorAll<HTMLButtonElement>('[data-equipment]'))b.classList.toggle('selected',b.dataset.equipment===this.equipmentTab);
  const w=weaponFor(this.profile);this.element('equipment-detail').textContent=`${w.name}: урон ${Math.round(stats(this.profile).damage)}, дальность ${w.reach}, расход ${w.cost}. ${armorFor(this.profile).name}.`;
  this.element('ultimate-info').textContent=`R · ${w.ultimate}: ${w.ultimateHint}. Заряд ${Math.floor(this.ultimate)} / 100.`;
 }
 private renderQuests():void{
  this.element('quest-items').innerHTML=this.quests[this.regionIndex].map(q=>{
   const status=q.complete?'✓ Сундук на карте':q.failed?'Время вышло':q.id==='sprint'?`${q.progress}/${q.target} · ${Math.max(0,Math.ceil(q.limit-q.elapsed))} с`:`${q.progress}/${q.target}`;
   return`<article class="quest-card ${q.complete?'complete':q.failed?'failed':''}"><div><strong>${q.name}</strong><span>${status}</span></div><p>${q.description}</p></article>`;}).join('');
  this.element('quest-retry').hidden=!this.quests[this.regionIndex].some(q=>q.id==='sprint'&&q.failed);
 }
 private renderAudio():void{
  for(const key of ['master','music','effects'] as const)this.element<HTMLInputElement>(`volume-${key}`).value=String(Math.round(this.audio.settings[key]*100));
  this.element('mute-button').textContent=this.audio.settings.muted?'Включить звук':'Выключить звук';
 }
 private refreshSaveUI():void{
  this.element<HTMLButtonElement>('load-button').disabled=!this.saved;this.element('load-start').hidden=!this.saved||this.state!=='ready';
  this.element('save-status').textContent=!this.storageAvailable?'Браузер запретил сохранение.':this.saved?`Ручное сохранение: ${new Date(this.saved.savedAt).toLocaleString('ru-RU')}. Автосохранения нет.`:'Автосохранения нет. Нажми «Сохранить прогресс», чтобы вернуться к этой попытке.';
 }
 private snapshot():Snapshot{
  return{version:5,manual:true,savedAt:new Date().toISOString(),profile:this.profile,region:this.regionIndex,progress:this.progress,player:{x:this.player.x,y:this.player.y},checkpoint:this.checkpoint,
   hp:this.hp,stamina:this.stamina,flasks:this.flasks,armed:this.armed,ultimate:this.ultimate,elapsed:this.elapsed,score:this.score,kills:this.kills,deaths:this.deaths,
   enemies:this.enemies.filter(e=>!e.dead).map(e=>({kind:e.kind,region:e.region,x:e.sprite.x,y:e.sprite.y,hp:e.hp,phase2:e.phase2,variant:e.variant})),
   coins:this.coins.map(c=>({x:c.sprite.x,y:c.sprite.y,region:c.region})),quests:this.quests,chests:this.chests.map(c=>({x:c.x,y:c.y,region:c.region,quest:c.quest,opened:c.opened})),audio:{...this.audio.settings}};
 }
 private saveProgress():void{
  if(this.state!=='menu'&&this.state!=='paused'&&this.state!=='won')return;
  try{const raw=JSON.stringify(this.snapshot());localStorage.setItem(PROFILE_KEY,raw);this.saved=parseSave(raw);this.storageAvailable=true;this.refreshSaveUI();this.toast('Прогресс сохранён вручную: биом, позиция, вещи, задания и сундуки.');}
  catch{this.storageAvailable=false;this.refreshSaveUI();this.toast('Сохранить не удалось: браузер запретил запись.');}
 }
 private loadProgress():void{
  let saved:Snapshot|null=null;try{saved=parseSave(localStorage.getItem(PROFILE_KEY));}catch{this.storageAvailable=false;}
  if(!saved){this.saved=null;this.refreshSaveUI();this.toast('Ручного сохранения нет или оно повреждено.');return;}
  this.audio.unlock();this.clearActors();this.saved=saved;this.profile=saved.profile;this.progress=saved.progress;this.quests=saved.quests;this.regionIndex=saved.region;
  this.hp=Math.max(1,Math.min(stats(this.profile).maxHP,saved.hp));this.stamina=Math.min(stats(this.profile).maxStamina,saved.stamina);this.flasks=Math.min(stats(this.profile).flasks,saved.flasks);
  this.armed=saved.armed&&this.progress[saved.region].coins>=REGIONS[saved.region].awaken;this.profile.blade=this.armed;this.ultimate=saved.ultimate;this.elapsed=saved.elapsed;this.score=saved.score;this.kills=saved.kills;this.deaths=saved.deaths;
  this.campVisits.clear();for(let i=0;i<this.regionIndex;i++)this.campVisits.add(i);
  const bounds=this.playerBounds(),at=clampPoint(saved.player,bounds);this.checkpoint=clampPoint(saved.checkpoint,bounds);
  this.player.setPosition(at.x,at.y).setTexture(this.profile.skin).setAlpha(1).clearTint().setAngle(0);this.cameras.main.centerOn(at.x,at.y);
  for(const e of saved.enemies){const enemy=this.spawnEnemy(e.kind,e.region,e.variant,{x:e.x,y:e.y});enemy.hp=Math.min(enemy.maxHP,e.hp);enemy.phase2=e.phase2;}
  for(const c of saved.coins)this.spawnCoin(c.region,false,c);for(const c of saved.chests)this.spawnChest(c);
  const p=this.progress[this.regionIndex];if(p.spawned&&!p.bossDead&&!this.enemies.some(e=>e.region===this.regionIndex&&e.kind==='boss'))p.spawned=false;
  this.attackTime=-1;this.dodgeLeft=0;this.dodgeWait=0;this.hurtLeft=1.2;this.hurtFlash=0;this.healWait=0;this.regenDelay=0;this.ultimateLeft=0;this.mouse=null;this.resetInput();this.resetWeather();
  this.audio.setSettings(saved.audio);this.audio.setRegion(this.regionIndex);for(const id of ['menu-overlay','map-overlay','shop-overlay','dialog-overlay','loot-overlay','intro-overlay'])this.element(id).hidden=true;
  this.hideModal();this.state='playing';this.toggleGuide(false);this.drawGates();this.drawActors();this.updateHUD();this.refreshSaveUI();
  if(this.progress.every(v=>v.cleared)){this.state='won';this.showModal('ТВОЯ ДУША СНОВА ЦЕЛА','Клятва исполнена.','Это сохранение завершённого путешествия. Можно начать новое.','Новое путешествие ↗',false);this.showStats();this.element('modal-save').hidden=false;}
  this.toast('Загружено ручное сохранение.');
 }
 private setGuideText():void{
  const hint=this.element('overlay').querySelector('.control-hint');
  if(hint)hint.textContent='WASD - идти · мышь + ЛКМ - удар · Пробел - рывок · Q - лечить · R - умение · Tab - меню';
  const grid=this.element('guide').querySelector('.guide-grid');
  if(grid)grid.innerHTML='<span><b>WASD / стрелки</b> движение</span><span><b>Мышь + ЛКМ / J</b> прицеливание / удар</span><span><b>Space / Shift</b> уклонение</span><span><b>Q / R</b> лечение / умение</span><span><b>E / M</b> взаимодействие / карта</span><span><b>Tab / Esc · H · P</b> меню · справка · пауза</span>';
 }
 private toggleGuide(show?:boolean):void{const g=this.element('guide');g.hidden=show===undefined?!g.hidden:!show;if(!g.hidden)this.guideLeft=0;}
 private toggleMap():void{
  if(this.state==='map'){this.state=this.mapReturn;this.element('map-overlay').hidden=true;if(this.state==='menu')this.element('menu-overlay').hidden=false;return;}
  if(this.state!=='playing'&&this.state!=='paused'&&this.state!=='menu')return;this.mapReturn=this.state;this.state='map';this.resetInput();this.element('menu-overlay').hidden=true;this.element('map-overlay').hidden=false;this.drawMaps();
 }
 private drawMaps():void{
  const draw=(id:string,large:boolean)=>{const canvas=this.element<HTMLCanvasElement>(id),ctx=canvas.getContext('2d');if(!ctx)return;
   const w=canvas.width,h=canvas.height,pad=large?30:7,sx=(w-pad*2)/WORLD_WIDTH,sy=(h-pad*2)/WORLD_HEIGHT;ctx.clearRect(0,0,w,h);ctx.fillStyle='#102c24';ctx.fillRect(0,0,w,h);
   const point=(p:Point)=>({x:pad+p.x*sx,y:pad+p.y*sy});
   for(let i=0;i<REGIONS.length;i++){const p=point({x:regionStart(i),y:70}),width=REGION_WIDTH*sx,height=960*sy;
    ctx.fillStyle=i<=this.regionIndex?REGIONS[i].palette.ground:'#1c342b';ctx.fillRect(p.x,p.y,width,height);ctx.strokeStyle=this.progress[i].cleared?'#b9d78a':i===this.regionIndex?'#b1e9df':'#456254';ctx.lineWidth=large?2:1;ctx.strokeRect(p.x,p.y,width,height);
    if(large){ctx.fillStyle=i<=this.regionIndex?'#e0ead6':'#779085';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText(`${i+1}. ${REGIONS[i].name.split(' ').slice(0,2).join(' ')}`,p.x+width/2,19);ctx.font='10px system-ui';ctx.fillText(this.progress[i].cleared?'Пройдено':i===this.regionIndex?`${this.progress[i].coins}/${REGIONS[i].coins} ◈`:'Не исследовано',p.x+width/2,h-7);}
   }
   ctx.strokeStyle='#bcb18588';ctx.lineWidth=large?6:3;ctx.beginPath();const left=point({x:0,y:550}),right=point({x:WORLD_WIDTH,y:550});ctx.moveTo(left.x,left.y);ctx.lineTo(right.x,right.y);ctx.stroke();
   if(large)for(const t of this.terrain){if(t.x>regionEnd(this.regionIndex))continue;const p=point(t);ctx.fillStyle=t.kind==='puddle'?'#5b9291':'#263f30';ctx.beginPath();ctx.arc(p.x,p.y,Math.max(1,t.radius*sx),0,Math.PI*2);ctx.fill();}
   for(const c of this.coins){if(c.region!==this.regionIndex)continue;const p=point(c.sprite);ctx.fillStyle='#a8eeee';ctx.beginPath();ctx.arc(p.x,p.y,large?3:1.5,0,Math.PI*2);ctx.fill();}
   for(let i=0;i<=this.regionIndex;i++){const p=point(checkpointPosition(i));ctx.fillStyle='#f5c78d';ctx.fillRect(p.x-3,p.y-4,6,8);}
   this.merchants.forEach((m,i)=>{if(i>this.regionIndex)return;const p=point(m);ctx.fillStyle=this.progress[i].cleared?'#efd7ac':'#778b79';ctx.fillRect(p.x-3,p.y-4,6,8);});
   for(const c of this.chests){if(c.opened||c.region!==this.regionIndex)continue;const p=point(c);ctx.fillStyle='#d5bdf2';ctx.fillRect(p.x-4,p.y-4,8,8);ctx.strokeStyle='#fff2d0';ctx.lineWidth=1;ctx.strokeRect(p.x-4,p.y-4,8,8);}
   for(const e of this.enemies)if(e.kind==='boss'&&!e.dead&&e.region===this.regionIndex){const p=point(e.sprite);ctx.fillStyle='#e38d9a';ctx.beginPath();ctx.arc(p.x,p.y,large?6:3,0,Math.PI*2);ctx.fill();}
   const p=point(this.player);ctx.fillStyle='#f6aa65';ctx.strokeStyle='#fff2c7';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,large?6:3.4,0,Math.PI*2);ctx.fill();ctx.stroke();
  };draw('minimap',false);if(!this.element('map-overlay').hidden){draw('world-map',true);this.element('map-regions').innerHTML=REGIONS.map((r,i)=>`<span class="${i===this.regionIndex?'current':''}">${this.progress[i].cleared?'✓':i+1} · ${r.name}</span>`).join('');}
 }
 private togglePause():void{
  if(this.state==='playing'){this.state='paused';this.resetInput();this.showPauseModal();}
  else if(this.state==='paused'){this.state='playing';this.hideModal();this.resetInput();}
 }
 private showPauseModal():void{this.showModal('ПРИВАЛ','Мир ждёт тебя.','Время остановлено. Tab открывает вещи, задания и карту. Для следующего запуска сохрани прогресс вручную.','Снять паузу ↗',false);this.element('restart-button').hidden=false;this.element('modal-save').hidden=false;}
 private primaryAction():void{
  this.audio.unlock();if(this.state==='ready'){this.hideModal();this.beginIntro(false);}else if(this.state==='paused')this.togglePause();else if(this.state==='won')this.newJourney();
 }
 private showModal(tag:string,title:string,description:string,button:string,rules:boolean):void{
  this.element('modal-tag').textContent=tag;this.element('modal-title').textContent=title;this.element('modal-description').textContent=description;this.element('primary-button').textContent=button;
  this.element('start-rules').hidden=!rules;this.element('modal-stats').hidden=true;this.element('restart-button').hidden=true;this.element('modal-save').hidden=true;this.element('load-start').hidden=!rules||!this.saved;this.element('start-save-note').hidden=!rules;this.element('overlay').hidden=false;
 }
 private hideModal():void{this.element('overlay').hidden=true;}
 private showStats():void{const s=this.element('modal-stats');s.hidden=false;s.innerHTML=`<span><b>${this.score}</b> очков</span><span><b>${this.kills}</b> врагов</span><span><b>${this.deaths}</b> смертей</span><span><b>${Math.floor(this.elapsed)} с</b> в пути</span><span><b>${this.profile.coins} ◈</b> осколков</span>`;}
 private resetInput():void{this.velocity={x:0,y:0};this.mouseHeld=false;this.input.keyboard?.resetKeys();}
 private updateWeather(dt:number):void{
  this.weatherNext-=dt;
  if(this.weather==='clear'&&this.weatherNext<=0){this.weather=Math.random()<.5?'rain':'storm';this.weatherLeft=WEATHER_DURATION;
   this.wetZones=Array.from({length:3},()=>({...this.freePosition(this.regionIndex,20,0),radius:90+Math.random()*40}));this.strikeNext=1.5;
   this.toast(this.weather==='rain'?'Дождь: мокрые участки замедляют и лиса, и нежить.':'Гроза: красный круг отмечает место молнии. Выйди из него или используй уклонение.');}
  if(this.weather==='clear')return;this.weatherLeft-=dt;
  if(this.weather==='storm'){
   this.strikeNext-=dt;if(!this.strike&&this.strikeNext<=0){const target=Math.random()<.6?{x:this.player.x+this.velocity.x*.35,y:this.player.y+this.velocity.y*.35}:this.freePosition(this.regionIndex,30,0);this.strike={...clampPoint(target,this.regionBounds(this.regionIndex)),left:LIGHTNING_WARNING,phase:'warning'};}
   if(this.strike){this.strike.left-=dt;if(this.strike.left<=0){if(this.strike.phase==='warning'){
    this.strike.phase='impact';this.strike.left=.3;this.audio.play('thunder');
    if(Math.hypot(this.player.x-this.strike.x,this.player.y-this.strike.y)<LIGHTNING_RADIUS+PLAYER_RADIUS&&this.dodgeLeft<=0){this.slowed=1.8;this.damagePlayer(12+this.regionIndex*3,this.strike,true);}
    for(const e of this.enemies)if(!e.dead&&e.region===this.regionIndex&&Math.hypot(e.sprite.x-this.strike.x,e.sprite.y-this.strike.y)<LIGHTNING_RADIUS+e.radius){e.stun=e.kind==='boss'?.7:1.8;e.mode='recover';e.clock=e.stun;e.hp=Math.max(0,e.hp-10);e.flash=.2;if(e.hp===0)this.killEnemy(e);}
    this.particles(this.strike.x,this.strike.y,14,0xd4f1ff);
   }else{this.strike=null;this.strikeNext=2.2+Math.random()*1.5;}}}
  }
  if(this.weatherLeft<=0){this.weather='clear';this.weatherNext=15+Math.random()*12;this.wetZones=[];this.strike=null;}
 }
 private cone(g:Phaser.GameObjects.Graphics,at:Point,angle:number,radius:number,arc:number,color:number,alpha:number):void{
  const points:Point[]=[{x:at.x,y:at.y}];for(let n=0;n<=14;n++){const a=angle-arc+n/14*arc*2;points.push({x:at.x+Math.cos(a)*radius,y:at.y+Math.sin(a)*radius});}
  g.fillStyle(color,alpha);g.fillPoints(points.map(p=>new Phaser.Math.Vector2(p.x,p.y)),true);g.lineStyle(2,color,Math.min(.9,alpha*4));g.beginPath();g.arc(at.x,at.y,radius,angle-arc,angle+arc,false);g.strokePath();
 }
 private drawActors():void{
  const t=this.animationTime,w=weaponFor(this.profile),moving=Math.hypot(this.velocity.x,this.velocity.y)>10,run=moving?Math.sin(t*18):Math.sin(t*3)*.2;
  this.player.setFlipX(Math.cos(this.face)<0).setAngle(this.dodgeLeft>0?Math.sin(this.face)*22:this.attackTime>=0?Math.sin(this.attackTime/w.duration*Math.PI)*-10:run*3);
  this.player.setScale(72/128*(this.attackTime>=0?1.025:1),72/128*(this.dodgeLeft>0?.82:1+run*.025));this.player.setDepth(20+this.player.y*.01);
  this.playerShadow.setPosition(this.player.x,this.player.y+22).setScale(this.dodgeLeft>0?1.3:1);
  if(this.hurtFlash>0)this.player.setTint(0xff8c92);else this.player.clearTint();this.player.setAlpha(this.hurtLeft>0&&this.state==='playing'?.64+Math.sin(t*45)*.22:1);
  this.armorSprite.setVisible(this.profile.armor!=='travel'&&this.state!=='dying');if(this.profile.armor!=='travel')this.armorSprite.setTexture(`armor-${this.profile.armor}`).setPosition(this.player.x,this.player.y).setScale(this.player.scaleX,this.player.scaleY).setAngle(this.player.angle).setFlipX(this.player.flipX).setAlpha(this.player.alpha).setDepth(this.player.depth+.1);
  this.sword.setVisible(this.armed&&this.state!=='dying').setTexture(w.id).setDisplaySize(w.id==='spear'?126:106,w.id==='spear'?126:106).setTint(w.color);
  let swing=this.face+.7,extension=12;
  if(this.attackTime>=0){const progress=Math.max(0,Math.min(1,(this.attackTime-w.windup)/(w.activeEnd-w.windup)));
   if(w.type==='thrust'){swing=this.attackAngle;extension=this.attackTime<w.windup?8:12+Math.sin(progress*Math.PI)*47;}
   else if(w.type==='magic'){swing=this.attackAngle+.25-Math.sin(this.attackTime/w.duration*Math.PI)*.45;extension=16;}
   else if(this.attackTime<w.windup)swing=this.attackAngle+.7-this.attackTime/w.windup*(w.arc+.7);
   else if(this.attackTime<=w.activeEnd)swing=this.attackAngle-w.arc+progress*w.arc*2;
   else swing=this.attackAngle+w.arc-(this.attackTime-w.activeEnd)/(w.duration-w.activeEnd)*.4;
  }
  this.sword.setPosition(this.player.x+Math.cos(swing)*extension,this.player.y+Math.sin(swing)*extension+7).setRotation(swing+.98).setDepth(this.player.depth+1).setAlpha(this.attackTime>=0||this.state==='intro'?1:.7);
  const g=this.combatInk;g.clear();
  if(this.mouse&&this.state==='playing'){const at=this.cameras.main.getWorldPoint(this.mouse.x,this.mouse.y);g.lineStyle(1,0xb7f0e9,.62);g.strokeCircle(at.x,at.y,6);g.lineBetween(at.x-10,at.y,at.x-3,at.y);g.lineBetween(at.x+3,at.y,at.x+10,at.y);}
  if(this.attackTime>=0){const active=this.attackTime>=w.windup&&this.attackTime<=w.activeEnd,alpha=active?.50:this.attackTime<w.windup?.08:Math.max(0,.24*(1-(this.attackTime-w.activeEnd)/(w.duration-w.activeEnd)));
   if(w.type==='thrust'){g.lineStyle(active?10:2,w.color,alpha);g.lineBetween(this.player.x,this.player.y,this.player.x+Math.cos(this.attackAngle)*w.reach,this.player.y+Math.sin(this.attackAngle)*w.reach);}
   else if(w.type==='magic'){g.lineStyle(2,w.color,.65);g.strokeCircle(this.player.x+Math.cos(swing)*60,this.player.y+Math.sin(swing)*60,8+Math.sin(t*18)*3);}
   else{g.lineStyle(active?10:3,w.color,alpha);g.beginPath();g.arc(this.player.x,this.player.y,w.reach*.8,this.attackAngle-w.arc,this.attackAngle+w.arc,false);g.strokePath();if(active){g.lineStyle(2,0xf5ffeb,.85);g.lineBetween(this.player.x+Math.cos(swing)*22,this.player.y+Math.sin(swing)*22,this.player.x+Math.cos(swing)*w.reach,this.player.y+Math.sin(swing)*w.reach);}}
  }
  if(this.ultimateLeft>0){g.lineStyle(5,w.color,this.ultimateLeft/.86*.75);if(w.id==='spear')g.lineBetween(this.player.x,this.player.y,this.player.x+Math.cos(this.ultimateAngle)*440,this.player.y+Math.sin(this.ultimateAngle)*440);else g.strokeCircle(this.player.x,this.player.y,(w.id==='axe'?150:185)*(1-this.ultimateLeft/.86*.4));}
  for(const h of this.hazards){const warning=h.warning>0,color=h.kind==='poison'?0x9eba71:h.kind==='ring'?0xb7a5e3:warning?0xf38e83:0xffc485;
   g.fillStyle(color,warning?.10:.19);g.fillCircle(h.x,h.y,h.radius);g.lineStyle(warning?2:3,color,.7);g.strokeCircle(h.x,h.y,h.radius);
   if(warning){g.lineStyle(1,0xf2e6bb,.55);g.strokeCircle(h.x,h.y,h.radius*(1-Math.min(1,h.warning/1.7)));}
   else if(h.kind==='meteor'){g.lineStyle(5,0xffdcba,.8);g.lineBetween(h.x-5,h.y-80,h.x,h.y);}
  }
  for(const e of this.enemies){if(e.dead)continue;const walk=e.mode==='chase'||e.mode==='charge',bounce=walk?Math.sin(t*(e.mode==='charge'?25:13)+e.id):0,size=e.kind==='boss'?148:e.kind==='dragon'?103:e.kind==='zombie'?83:78;
   e.sprite.setAngle(e.mode==='windup'?Math.sin(t*24)*3:bounce*3).setScale(size/128,size/128*(1+bounce*.033)).setDepth(20+e.sprite.y*.01);
   e.shadow.setPosition(e.sprite.x,e.sprite.y+e.radius).setVisible(true);if(e.flash>0)e.sprite.setTint(0xdfffe1);else if(e.stun>0)e.sprite.setTint(0x99d1e4);else if(e.mode==='windup')e.sprite.setTint(0xf1beb6);else e.sprite.clearTint();
   if(e.mode==='windup'){const angle=Math.atan2(e.aim.y,e.aim.x);
    if(e.move==='slam'||e.move==='poison'){const radius=e.move==='slam'?155:e.kind==='boss'?100:72;g.lineStyle(2,0xf78f81,.8);g.fillStyle(0xe28d77,.10);g.fillCircle(e.sprite.x,e.sprite.y,radius);g.strokeCircle(e.sprite.x,e.sprite.y,radius);}
    else if(e.move==='blink'){g.lineStyle(2,0xd991b8,.8);g.fillStyle(0xb8698e,.12);g.fillCircle(e.target.x,e.target.y,58);g.strokeCircle(e.target.x,e.target.y,58);g.lineBetween(e.sprite.x,e.sprite.y,e.target.x,e.target.y);}
    else if(e.move==='summon'||e.move==='meteor'){g.lineStyle(2,e.move==='summon'?0xb9aad8:0xf2a98a,.8);g.strokeCircle(e.sprite.x,e.sprite.y,58);for(let n=0;n<6;n++){const a=t*1.5+n*Math.PI/3;g.fillStyle(0xdbc8ea,.6);g.fillCircle(e.sprite.x+Math.cos(a)*58,e.sprite.y+Math.sin(a)*58,3);}}
    else if(e.move==='fan'||e.move==='breath')this.cone(g,e.sprite,angle,240,e.move==='breath'?.55:.60,0xf0968c,.13);
    else if(e.move==='slash')this.cone(g,e.sprite,angle,e.kind==='boss'?143:92,1.2,0xf08c85,.15);
    else{g.lineStyle(3,0xf0968c,.65);g.lineBetween(e.sprite.x,e.sprite.y,e.sprite.x+e.aim.x*240,e.sprite.y+e.aim.y*240);g.strokeCircle(e.sprite.x,e.sprite.y,e.radius+8);}
   }
   if(e.hp<e.maxHP&&e.kind!=='boss'&&e.region===this.regionIndex){g.fillStyle(0x102a22,.8);g.fillRect(e.sprite.x-22,e.sprite.y-e.radius-28,44,4);g.fillStyle(0xcc9e9a,.9);g.fillRect(e.sprite.x-22,e.sprite.y-e.radius-28,44*e.hp/e.maxHP,4);}
   if(e.kind==='boss'){g.lineStyle(2,0xd9bda5,.55);g.strokeCircle(e.sprite.x,e.sprite.y,e.radius+14);const y=e.sprite.y-58;g.lineStyle(2,0xdfc7a2,.8);g.beginPath();g.moveTo(e.sprite.x-13,y);g.lineTo(e.sprite.x-12,y-10);g.lineTo(e.sprite.x-5,y-5);g.lineTo(e.sprite.x,y-15);g.lineTo(e.sprite.x+5,y-5);g.lineTo(e.sprite.x+12,y-10);g.lineTo(e.sprite.x+13,y);g.strokePath();}
  }
  for(const p of this.projectiles){g.fillStyle(p.color,.82);g.fillCircle(p.x,p.y,p.radius);g.lineStyle(2,p.color,.42);g.lineBetween(p.x,p.y,p.x-p.vx*.05,p.y-p.vy*.05);}
  for(const c of this.coins){c.sprite.setAngle(Math.sin(t*2+c.phase)*9).setScale(45/128,45/128*(.88+Math.sin(t*3+c.phase)*.10));g.lineStyle(1,0xbef2e7,.20);g.strokeCircle(c.sprite.x,c.sprite.y,22+Math.sin(t*2+c.phase)*3);}
  for(const c of this.chests)if(!c.opened){g.lineStyle(1,0xd8c4f0,.5+Math.sin(t*4)*.2);g.strokeCircle(c.x,c.y,35+Math.sin(t*2)*2);}
  this.fires.forEach((f,i)=>f.setAlpha(.83+Math.sin(t*9+i)*.14));this.drawWeather();
 }
 private drawGates():void{
  const g=this.gateInk;g.clear();if(!this.progress.length)return;const i=this.regionIndex,p=this.progress[i],color=REGIONS[i].fog,left=regionStart(i)+30,right=regionEnd(i)-30;
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
  this.element('flask-count').textContent=`Фляги: ${this.flasks}`;this.element('weapon-label').textContent=this.armed?w.name:`Оружие: сила ${Math.min(p.coins,r.awaken)}/${r.awaken}`;
  this.element('region-number').textContent=`БИОМ ${this.regionIndex+1} / 5`;this.element('region-name').textContent=r.name;this.element('coin-goal').textContent=`Сила биома: ${Math.min(p.coins,r.coins)} / ${r.coins}`;this.element('region-lore').textContent=r.lore;
  this.element('compact-souls').textContent=!this.armed?`◈ ${Math.min(p.coins,r.awaken)} / ${r.awaken} · оружие`:`◈ ${Math.min(p.coins,r.coins)} / ${r.coins}`;
  const seconds=Math.max(0,Math.ceil(r.bossTime-p.elapsed));this.element('boss-timer').textContent=p.bossDead?'Хозяин повержен':p.spawned?'Босс пробудился':`Босс ${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  const objective=p.cleared?'Туман рассеялся. Восточная стоянка открыта.':!this.armed?`Верни ${r.awaken} осколков силы, чтобы восстановить ${w.name.toLowerCase()}.`:p.bossDead?`Собери силу биома: ${p.coins} / ${r.coins}.`:p.spawned?`Собери ${r.coins} силы и победи хозяина биома.`:`Собирай силу, выполняй испытания. Хозяин проснётся через ${seconds} с.`;
  this.element('quest-text').textContent=objective;this.element('guide-objective').textContent=objective;
  const boss=this.enemies.find(e=>e.kind==='boss'&&e.region===this.regionIndex&&!e.dead);this.element('boss-hud').hidden=!boss;
  if(boss){const names:Record<EnemyAttack,string>={slash:'удар',charge:'рывок',slam:'волна',poison:'яд',summon:'призыв',fan:'чары',blink:'прыжок',meteor:'печати',breath:'дыхание'};
   this.element('boss-name').textContent=`${r.bossName}${boss.phase2?' · II':''}${boss.mode==='windup'?` · ${names[boss.move]}`:''}`;this.element('boss-hp-text').textContent=`${Math.ceil(boss.hp)} / ${boss.maxHP}`;this.element('boss-hp-fill').style.width=`${Math.max(0,boss.hp)/boss.maxHP*100}%`;
  }
  this.element('weather-label').textContent=this.slowed>0?'Молния · замедление':this.weather==='clear'?'Ясно':`${this.weather==='rain'?'Дождь':'Гроза'} · ${Math.ceil(this.weatherLeft)} с`;
  this.element('ultimate-ready').hidden=!this.armed||this.ultimate<ULTIMATE_MAX;
  let target:Point|null=null,label='';
  if(p.cleared&&this.regionIndex<4){const m=this.merchants[this.regionIndex];target=this.player.x<m.x+60?m:{x:regionStart(this.regionIndex+1)+70,y:550};label=this.player.x<m.x+60?'Костёр и лавка Бруна':'Следующий биом';}
  else if(p.coins<r.coins){const c=this.coins.filter(c=>c.region===this.regionIndex).sort((a,b)=>Math.hypot(a.sprite.x-this.player.x,a.sprite.y-this.player.y)-Math.hypot(b.sprite.x-this.player.x,b.sprite.y-this.player.y))[0];if(c)target=c.sprite;label='Ближайший осколок души';}
  else if(boss){target=boss.sprite;label='Победи хозяина биома';}else label=`Хозяин проснётся через ${seconds} с`;
  this.element('navigation-text').textContent=label;this.element('direction-arrow').hidden=!target;if(target)this.element('direction-arrow').style.transform=`rotate(${Math.atan2(target.y-this.player.y,target.x-this.player.x)*180/Math.PI}deg)`;
 }
}
