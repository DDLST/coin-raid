import Phaser from 'phaser';
import { background, createArtwork } from './art';
import { clampPoint, clearLine, findPath, freePoint, makeGrid, moveCircle, regionTerrain, type Bounds, type NavGrid, type Point, type Terrain } from './world';
import { PROFILE_KEY, SKINS, UPGRADES, newProfile, parseProfile, purchase, type Profile } from './progression';
import { ATTACK_ACTIVE_END, ATTACK_COST, ATTACK_DURATION, ATTACK_REACH, ATTACK_WINDUP, DODGE_COST, DODGE_TIME, FLASK_HEAL, HURT_PROTECTION, slashConnects, stats } from './combat';
import { REGIONS, REGION_WIDTH, ROAD_WIDTH, REGION_STEP, WORLD_HEIGHT, WORLD_WIDTH, merchantPosition, regionEnd, regionStart } from './regions';

const PLAYER_RADIUS = 16;
const PICKUP_RADIUS = 29;
const PATH_INTERVAL = .38;
const INTERACT_DISTANCE = 112;
const BOSS_REWARD = 25;
const BEST_KEY = 'raid-coin-best-v4';
const STAMINA_DELAY = .45;
const WEATHER_DURATION = 12;
const LIGHTNING_WARNING = 1.2;
const LIGHTNING_RADIUS = 48;

type GameState = 'ready' | 'playing' | 'paused' | 'dialog' | 'shop' | 'map' | 'dying' | 'lost' | 'won';
type EnemyKind = 'wolf' | 'boar' | 'hunter' | 'boss';
type EnemyMode = 'chase' | 'flee' | 'windup' | 'charge' | 'recover';
type Enemy = { id: number; region: number; kind: EnemyKind; sprite: Phaser.GameObjects.Image; shadow: Phaser.GameObjects.Ellipse;
  hp: number; maxHP: number; radius: number; damage: number; reward: number; speed: number; mode: EnemyMode;
  clock: number; nextPath: number; path: Point[]; aim: Point; hasHit: boolean; stun: number; flash: number; phase2: boolean; dead: boolean };
type Coin = { region: number; sprite: Phaser.GameObjects.Image; value: number; phase: number };
type RegionProgress = { coins: number; elapsed: number; spawned: boolean; bossDead: boolean; cleared: boolean };
type Projectile = Point & { vx: number; vy: number; life: number; damage: number; region: number };
type WetZone = Point & { radius: number };
type Strike = Point & { left: number; phase: 'warning' | 'impact' };

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Image;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private sword!: Phaser.GameObjects.Image;
  private combatInk!: Phaser.GameObjects.Graphics;
  private weatherInk!: Phaser.GameObjects.Graphics;
  private gateInk!: Phaser.GameObjects.Graphics;
  private terrain: Terrain[] = [];
  private terrainByRegion: Terrain[][] = [];
  private nav: NavGrid[] = [];
  private bossNav: NavGrid[] = [];
  private enemies: Enemy[] = [];
  private coins: Coin[] = [];
  private projectiles: Projectile[] = [];
  private merchants: Phaser.GameObjects.Image[] = [];
  private fires: Phaser.GameObjects.Image[] = [];
  private progress: RegionProgress[] = [];
  private campVisits = new Set<number>();
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private listeners!: AbortController;
  private state: GameState = 'ready';
  private regionIndex = 0;
  private profile: Profile = newProfile();
  private storageAvailable = true;
  private hp = 100;
  private stamina = 100;
  private flasks = 2;
  private armed = false;
  private score = 0;
  private kills = 0;
  private deaths = 0;
  private best = 0;
  private elapsed = 0;
  private animationTime = 0;
  private face = 0;
  private velocity: Point = { x: 0, y: 0 };
  private movement: Point = { x: 1, y: 0 };
  private touch: Point = { x: 0, y: 0 };
  private joystickPointer: number | null = null;
  private attackPointer: number | null = null;
  private attackHeld = false;
  private attackTime = -1;
  private attackAngle = 0;
  private attackHits = new Set<number>();
  private combo = 0;
  private lastAttack = -10;
  private dodgeLeft = 0;
  private dodgeWait = 0;
  private dodgeVector: Point = { x: 1, y: 0 };
  private hurtLeft = 0;
  private hurtFlash = 0;
  private regenDelay = 0;
  private healWait = 0;
  private deathLeft = 0;
  private nextId = 1;
  private hudLeft = 0;
  private toastTimeout = 0;
  private nearestMerchant = -1;
  private dialogMerchant = 0;
  private dialogTarget = '';
  private dialogTime = 0;
  private shopTab: 'skins' | 'upgrades' = 'upgrades';
  private shopPage = 0;
  private mapReturn: GameState = 'playing';
  private weather: 'clear' | 'rain' | 'storm' = 'clear';
  private weatherLeft = 0;
  private weatherNext = 13;
  private wetZones: WetZone[] = [];
  private strike: Strike | null = null;
  private strikeNext = 2;
  private slowed = 0;

  constructor() { super('GameScene'); }

  create(): void {
    createArtwork(this);
    try { this.profile = parseProfile(localStorage.getItem(PROFILE_KEY)); this.best = Number(localStorage.getItem(BEST_KEY)) || 0; }
    catch { this.storageAvailable = false; }
    this.drawWorld();
    this.gateInk = this.add.graphics().setDepth(5);
    this.weatherInk = this.add.graphics().setDepth(6);
    this.playerShadow = this.add.ellipse(140, WORLD_HEIGHT / 2 + 22, 35, 14, 0x09291b, .34).setDepth(8);
    this.player = this.add.image(140, WORLD_HEIGHT / 2, this.profile.skin).setDisplaySize(72,72).setDepth(20);
    this.sword = this.add.image(0,0,'sword').setDisplaySize(100,100).setOrigin(.20,.89).setVisible(false).setDepth(21);
    this.combatInk = this.add.graphics().setDepth(500);
    if (!this.input.keyboard) throw new Error('Keyboard unavailable');
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,SHIFT,J,Q,E,P,ESC,ENTER,H,M,F,R') as Record<string, Phaser.Input.Keyboard.Key>;
    this.bindControls(); this.configureCamera(); this.newJourney(false);
    this.state = 'ready';
    this.showModal('ЛЕСНАЯ КЛЯТВА', 'Золото. Клинок. Путь.',
      'Собери золото, получи клинок и победи босса. Затем иди по дороге к костру и торговцу. Пять областей, один мир.', 'Войти в лес', true);
    this.scale.on('resize', this.configureCamera, this);
    this.events.once('shutdown', () => { this.listeners.abort(); this.scale.off('resize', this.configureCamera, this); window.clearTimeout(this.toastTimeout); });
  }

  private element<T extends HTMLElement = HTMLElement>(id: string): T {
    const value = document.getElementById(id); if (!value) throw new Error(`Missing UI: ${id}`); return value as T;
  }
  private regionBounds(index: number): Bounds { return { width: regionEnd(index), height: WORLD_HEIGHT, margin: 42, top: 65, left: regionStart(index)+42 }; }
  private playerBounds(): Bounds {
    const p = this.progress[this.regionIndex];
    return { width: p.cleared ? Math.min(WORLD_WIDTH,regionEnd(this.regionIndex)+ROAD_WIDTH+105) : regionEnd(this.regionIndex),
      height: WORLD_HEIGHT, margin: 35, top: 65, left: 35 };
  }
  private configureCamera(): void {
    const cam = this.cameras.main;
    cam.setBounds(0,0,WORLD_WIDTH,WORLD_HEIGHT);
    cam.setZoom(Math.max(this.scale.width<700 ? .82 : 1, this.scale.height/WORLD_HEIGHT));
    if (this.player) cam.startFollow(this.player,true,.11,.11);
    if (this.element('guide')) this.setGuideText();
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
      this.add.image(start+65,WORLD_HEIGHT/2+65,'fire').setDisplaySize(55,55).setDepth(12);
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

  private bindControls(): void {
    this.listeners = new AbortController(); const signal = this.listeners.signal;
    this.element('primary-button').addEventListener('click',()=>this.primaryAction(),{signal});
    this.element('restart-button').addEventListener('click',()=>this.newJourney(),{signal});
    this.element('pause-button').addEventListener('click',()=>this.togglePause(),{signal});
    this.element('help-button').addEventListener('click',()=>this.toggleGuide(),{signal});
    this.element('guide-close').addEventListener('click',()=>this.toggleGuide(false),{signal});
    this.element('map-button').addEventListener('click',()=>this.toggleMap(),{signal});
    this.element('map-close').addEventListener('click',()=>this.toggleMap(),{signal});
    this.element('fullscreen-button').addEventListener('click',()=>this.fullscreen(),{signal});
    this.keys.F.on('down',()=>this.fullscreen());
    this.element('interact-button').addEventListener('click',()=>this.interact(),{signal});
    this.element('dodge-button').addEventListener('pointerdown',e=>{e.preventDefault();this.dodge();},{signal});
    this.element('heal-button').addEventListener('pointerdown',e=>{e.preventDefault();this.heal();},{signal});
    const attack = this.element('attack-button');
    attack.addEventListener('pointerdown',e=>{e.preventDefault();this.attackPointer=e.pointerId;this.attackHeld=true;attack.setPointerCapture(e.pointerId);this.attack();},{signal});
    const attackUp = (e: PointerEvent) => {if(e.pointerId===this.attackPointer){this.attackHeld=false;this.attackPointer=null;}};
    attack.addEventListener('pointerup',attackUp,{signal}); attack.addEventListener('pointercancel',attackUp,{signal});attack.addEventListener('lostpointercapture',attackUp,{signal});
    this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{
      if(this.state!=='playing'||p.button!==0)return;
      const at = this.cameras.main.getWorldPoint(p.x,p.y);if(this.attackTime<0&&this.dodgeLeft<=0)this.face=Math.atan2(at.y-this.player.y,at.x-this.player.x);this.attack();
    });
    const joystick=this.element('joystick');
    const release=(event?:PointerEvent)=>{if(event&&event.pointerId!==this.joystickPointer)return;this.joystickPointer=null;this.touch={x:0,y:0};this.element('joystick-knob').style.transform='';};
    const move=(e:PointerEvent)=>{if(e.pointerId!==this.joystickPointer)return;const r=joystick.getBoundingClientRect(),limit=r.width*.3;let x=(e.clientX-r.left-r.width/2)/limit,y=(e.clientY-r.top-r.height/2)/limit;const d=Math.hypot(x,y);if(d>1){x/=d;y/=d;}this.touch={x:Math.abs(x)>.1?x:0,y:Math.abs(y)>.1?y:0};this.element('joystick-knob').style.transform=`translate(${x*limit}px,${y*limit}px)`;};
    joystick.addEventListener('pointerdown',e=>{if(this.joystickPointer!==null)return;e.preventDefault();this.joystickPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);move(e);},{signal});
    joystick.addEventListener('pointermove',move,{signal});joystick.addEventListener('pointerup',release,{signal});joystick.addEventListener('pointercancel',release,{signal});joystick.addEventListener('lostpointercapture',release,{signal});
    window.addEventListener('blur',()=>{this.resetInput();if(this.state==='playing')this.togglePause();},{signal});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){this.resetInput();if(this.state==='playing')this.togglePause();}},{signal});
    this.element('dialog-trade').addEventListener('click',()=>this.openShop(),{signal});
    this.element('dialog-road').addEventListener('click',()=>this.say(`Дорога идёт на восток. Дальше - ${REGIONS[Math.min(this.dialogMerchant+1,REGIONS.length-1)].name}. Сначала собери золото и победи босса. На карте M видны выход, монеты и стоянки.`),{signal});
    this.element('dialog-combat').addEventListener('click',()=>this.say('Не бей без остановки. Сохрани выносливость для уклонения. Красная зона показывает замах; после атаки босс отдыхает. На половине здоровья он становится опаснее. Фляга Q лечит, а костёр пополняет её.'),{signal});
    this.element('dialog-leave').addEventListener('click',()=>this.leaveDialog(),{signal});
    this.element('shop-close').addEventListener('click',()=>{this.element('shop-overlay').hidden=true;this.state='dialog';this.element('dialog-overlay').hidden=false;this.say('Всё готово. Береги клинок и не забывай о выносливости.');},{signal});
    for(const tab of ['skins','upgrades'] as const)this.element(`tab-${tab}`).addEventListener('click',()=>{this.shopTab=tab;this.shopPage=0;this.renderShop();},{signal});
    this.element('shop-prev').addEventListener('click',()=>{this.shopPage=Math.max(0,this.shopPage-1);this.renderShop();},{signal});
    this.element('shop-next').addEventListener('click',()=>{this.shopPage++;this.renderShop();},{signal});
    this.element('shop-items').addEventListener('click',e=>{const b=e.target instanceof Element?e.target.closest<HTMLButtonElement>('[data-item]'):null;if(!b?.dataset.item||b.disabled)return;const before=stats(this.profile);this.element('shop-message').textContent=purchase(this.profile,b.dataset.item);const after=stats(this.profile);this.hp=Math.min(after.maxHP,this.hp+after.maxHP-before.maxHP);this.stamina=Math.min(after.maxStamina,this.stamina+after.maxStamina-before.maxStamina);this.flasks+=after.flasks-before.flasks;this.player.setTexture(this.profile.skin);this.saveProfile();this.renderShop();this.updateHUD();},{signal});
  }

  update(_time:number,delta:number): void {
    const dt=Math.min(delta,40)/1000;
    if(Phaser.Input.Keyboard.JustDown(this.keys.H))this.toggleGuide();
    if(Phaser.Input.Keyboard.JustDown(this.keys.M))this.toggleMap();
    if(this.state==='map'){if(Phaser.Input.Keyboard.JustDown(this.keys.ESC))this.toggleMap();return;}
    if(this.state==='dialog'){this.dialogTime+=dt;this.element('dialog-text').textContent=this.dialogTarget.slice(0,Math.floor(this.dialogTime*85));if(Phaser.Input.Keyboard.JustDown(this.keys.ESC))this.leaveDialog();return;}
    if(this.state==='shop'){if(Phaser.Input.Keyboard.JustDown(this.keys.ESC)){this.element('shop-close').click();}return;}
    if(Phaser.Input.Keyboard.JustDown(this.keys.P)||Phaser.Input.Keyboard.JustDown(this.keys.ESC))this.togglePause();
    if(Phaser.Input.Keyboard.JustDown(this.keys.ENTER)&&this.state!=='playing')this.primaryAction();
    if((this.state==='lost'||this.state==='won')&&Phaser.Input.Keyboard.JustDown(this.keys.R))this.primaryAction();
    if(this.state==='dying'){
      this.deathLeft-=dt;this.animationTime+=dt;this.player.setAngle(Math.min(85,(.8-this.deathLeft)*110)).setAlpha(Math.max(.2,this.deathLeft/.8));
      if(this.deathLeft<=0){this.state='lost';this.showModal('У КОСТРА ОСТАЛСЯ СВЕТ','Путь ещё не окончен.',`Область ${this.regionIndex+1}: ${REGIONS[this.regionIndex].name}. Кошелёк и покупки сохранены. Возродись у входа и попробуй снова.`,'Возродиться у костра',false);this.saveBest();this.showStats();}
      return;
    }
    if(this.state!=='playing')return;
    this.elapsed+=dt;this.animationTime+=dt;const p=this.progress[this.regionIndex];if(!p.cleared)p.elapsed+=dt;
    this.dodgeLeft=Math.max(0,this.dodgeLeft-dt);this.dodgeWait=Math.max(0,this.dodgeWait-dt);this.hurtLeft=Math.max(0,this.hurtLeft-dt);this.hurtFlash=Math.max(0,this.hurtFlash-dt);this.regenDelay=Math.max(0,this.regenDelay-dt);this.healWait=Math.max(0,this.healWait-dt);this.slowed=Math.max(0,this.slowed-dt);
    if(this.attackTime>=0){this.attackTime+=dt;if(this.attackTime>=ATTACK_DURATION)this.attackTime=-1;}
    if(this.regenDelay<=0&&this.attackTime<0&&this.dodgeLeft===0)this.stamina=Math.min(stats(this.profile).maxStamina,this.stamina+stats(this.profile).staminaRegen*dt);
    if(this.keys.J.isDown||this.attackHeld)this.attack();
    if(Phaser.Input.Keyboard.JustDown(this.keys.SPACE)||Phaser.Input.Keyboard.JustDown(this.keys.SHIFT))this.dodge();
    if(Phaser.Input.Keyboard.JustDown(this.keys.Q))this.heal();
    if(Phaser.Input.Keyboard.JustDown(this.keys.E))this.interact();
    if(this.state!=='playing')return;
    this.movePlayer(dt);this.updateWeather(dt);
    if(!p.spawned&&p.elapsed>=REGIONS[this.regionIndex].bossTime)this.spawnBoss();
    this.updateEnemies(dt);this.updateProjectiles(dt);this.resolveAttack();this.collectCoins();
    if(this.state!=='playing')return;
    this.checkProgress();this.updateCamp();this.drawActors();
    this.hudLeft-=dt;if(this.hudLeft<=0){this.updateHUD();this.drawMaps();this.hudLeft=.07;}
  }

  private newJourney(play=true): void {
    for(const e of this.enemies){e.sprite.destroy();e.shadow.destroy();}for(const c of this.coins)c.sprite.destroy();
    this.enemies=[];this.coins=[];this.projectiles=[];this.progress=REGIONS.map(()=>({coins:0,elapsed:0,spawned:false,bossDead:false,cleared:false}));
    this.campVisits.clear();this.regionIndex=0;this.elapsed=0;this.score=0;this.kills=0;this.deaths=0;this.armed=this.profile.blade;
    this.hp=stats(this.profile).maxHP;this.stamina=stats(this.profile).maxStamina;this.flasks=stats(this.profile).flasks;
    this.startRegion(0,true);if(play)this.hideModal();this.state=play?'playing':'ready';
    this.element('dialog-overlay').hidden=true;this.element('shop-overlay').hidden=true;this.element('map-overlay').hidden=true;
    this.toast(this.armed?'Клинок с тобой. Собери золото и победи вожака.':'Собери 14 монет. Лес подарит тебе клинок.');
  }

  private startRegion(index:number,respawn=false): void {
    this.regionIndex=index;this.progress[index]={coins:0,elapsed:0,spawned:false,bossDead:false,cleared:false};
    for(const e of this.enemies.filter(e=>e.region===index)){e.sprite.destroy();e.shadow.destroy();}this.enemies=this.enemies.filter(e=>e.region!==index);
    for(const c of this.coins.filter(c=>c.region===index))c.sprite.destroy();this.coins=this.coins.filter(c=>c.region!==index);
    this.projectiles=[];this.resetWeather();this.resetInput();this.attackTime=-1;this.dodgeLeft=0;this.dodgeWait=0;this.hurtLeft=1.4;this.hurtFlash=0;this.face=0;this.velocity={x:0,y:0};this.movement={x:1,y:0};
    this.player.setTexture(this.profile.skin).setAlpha(1).clearTint().setAngle(0).setScale(72/128).setFlipX(false);
    if(respawn){this.player.setPosition(regionStart(index)+145,WORLD_HEIGHT/2);this.cameras.main.centerOn(this.player.x,this.player.y);}
    this.hp=stats(this.profile).maxHP;this.stamina=stats(this.profile).maxStamina;this.flasks=stats(this.profile).flasks;
    const r=REGIONS[index];
    for(let n=0;n<r.wolves;n++)this.spawnEnemy('wolf',index,n);
    for(let n=0;n<r.boars;n++)this.spawnEnemy('boar',index,n);
    for(let n=0;n<r.hunters;n++)this.spawnEnemy('hunter',index,n);
    for(let n=0;n<6;n++)this.spawnCoin(index,n===0);
    this.state='playing';this.drawGates();this.updateHUD();this.drawActors();this.drawMaps();
    if(index>0&&!respawn)this.toast(`${index+1} · ${r.name}. Врагов больше; ${r.bossName} появится через ${r.bossTime} с.`);
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

  private spawnEnemy(kind:EnemyKind,index:number,variant=0,point?:Point): Enemy {
    const r=REGIONS[index],boss=kind==='boss';
    const pos=point??this.freePosition(index,boss?34:20,240);
    const key=boss?r.bossTexture:kind==='wolf'?['wolf-grey','wolf-snow','wolf-brown'][variant%3]:kind;
    const hp=boss?r.bossHP:kind==='wolf'?40+index*12:kind==='boar'?70+index*23:55+index*15;
    const sprite=this.add.image(pos.x,pos.y,key).setDisplaySize(boss?138:kind==='boar'?81:74,boss?138:kind==='boar'?81:74).setDepth(11+pos.y*.01);
    const shadow=this.add.ellipse(pos.x,pos.y+(boss?35:21),boss?63:35,boss?22:13,0x0b291f,.34).setDepth(8);
    const e:Enemy={id:this.nextId++,region:index,kind,sprite,shadow,hp,maxHP:hp,radius:boss?34:20,
      damage:boss?17+index*6:kind==='wolf'?8+index*3:kind==='boar'?13+index*4:10+index*3,
      reward:boss?BOSS_REWARD+index*8:kind==='wolf'?4+index:kind==='boar'?7+index*2:8+index*2,
      speed:r.speed*(boss?.9:kind==='boar'?.82:kind==='hunter'?.75:1),mode:'chase',clock:1.2+variant*.25,nextPath:0,path:[],aim:{x:1,y:0},hasHit:false,stun:0,flash:0,phase2:false,dead:false};
    this.enemies.push(e);return e;
  }
  private spawnBoss(): void {
    const p=this.progress[this.regionIndex];if(p.spawned||p.bossDead)return;p.spawned=true;
    this.spawnEnemy('boss',this.regionIndex,0,this.freePosition(this.regionIndex,35,280));
    this.toast(`${REGIONS[this.regionIndex].bossName} здесь. Смотри на замах, оставляй силы для уклонения.`);
    this.cameras.main.shake(180,.0025);this.updateHUD();
  }
  private spawnCoin(index:number,near=false): void {
    let pos=this.freePosition(index,PLAYER_RADIUS,60);
    if(near){const point={x:regionStart(index)+275,y:WORLD_HEIGHT/2};if(freePoint(point,30,this.terrainByRegion[index],this.regionBounds(index)))pos=point;}
    const sprite=this.add.image(pos.x,pos.y,'coin').setDisplaySize(46,46).setDepth(9);
    this.coins.push({region:index,sprite,value:1,phase:Math.random()*6.28});
  }

  private movePlayer(dt:number): void {
    let x=this.touch.x,y=this.touch.y;
    if(this.keys.LEFT.isDown||this.keys.A.isDown)x-=1;if(this.keys.RIGHT.isDown||this.keys.D.isDown)x+=1;
    if(this.keys.UP.isDown||this.keys.W.isDown)y-=1;if(this.keys.DOWN.isDown||this.keys.S.isDown)y+=1;
    const len=Math.hypot(x,y);if(len>.05){x/=Math.max(1,len);y/=Math.max(1,len);this.movement={x:x/Math.hypot(x,y),y:y/Math.hypot(x,y)};if(this.attackTime<0)this.face=Math.atan2(y,x);}
    if(this.dodgeLeft>0){x=this.dodgeVector.x;y=this.dodgeVector.y;}
    const speed=stats(this.profile).speed*(this.dodgeLeft>0?2.7:this.attackTime>=0?.48:1)*this.groundSpeed(this.player,true);
    const before={x:this.player.x,y:this.player.y};const moved=moveCircle(before,x*speed*dt,y*speed*dt,PLAYER_RADIUS,this.terrain,this.playerBounds());this.player.setPosition(moved.x,moved.y);
    this.velocity=dt>0?{x:(moved.x-before.x)/dt,y:(moved.y-before.y)/dt}:{x:0,y:0};
    if(this.dodgeLeft>0&&Math.floor(this.animationTime*45)%3===0){const ghost=this.add.image(this.player.x,this.player.y,this.profile.skin).setDisplaySize(72,72).setAlpha(.2).setFlipX(this.player.flipX).setDepth(9);this.tweens.add({targets:ghost,alpha:0,duration:150,onComplete:()=>ghost.destroy()});}
  }

  private attack(): void {
    if(this.state!=='playing')return;
    if(!this.armed){if(!this.attackHeld)this.toast(`Клинок появится после ${REGIONS[0].coins} монет. Пока уходи от волков.`);return;}
    if(this.attackTime>=0||this.dodgeLeft>0||this.stamina<ATTACK_COST)return;
    this.combo=this.elapsed-this.lastAttack<1.1?(this.combo+1)%3:0;this.lastAttack=this.elapsed;
    this.attackTime=0;this.attackAngle=this.face;this.attackHits.clear();this.stamina-=ATTACK_COST;this.regenDelay=STAMINA_DELAY;
  }
  private dodge(): void {
    if(this.state!=='playing'||this.dodgeWait>0||this.stamina<DODGE_COST)return;
    if(this.attackTime>=0&&this.attackTime<ATTACK_ACTIVE_END)return;
    this.attackTime=-1;this.dodgeLeft=DODGE_TIME;this.dodgeWait=stats(this.profile).dodgeCooldown;
    this.dodgeVector=Math.hypot(this.velocity.x,this.velocity.y)>5?this.movement:{x:Math.cos(this.face),y:Math.sin(this.face)};
    this.stamina-=DODGE_COST;this.regenDelay=STAMINA_DELAY;
  }
  private heal(): void {
    if(this.state!=='playing'||this.healWait>0||this.attackTime>=0||this.dodgeLeft>0)return;
    if(this.flasks<=0){this.toast('Фляга пуста. Заряды пополняются у костра на дороге.');return;}
    if(this.hp>=stats(this.profile).maxHP)return;
    this.flasks--;this.hp=Math.min(stats(this.profile).maxHP,this.hp+FLASK_HEAL);this.healWait=1.1;this.particles(this.player.x,this.player.y,12,0xbdd785);this.toast(`Фляга: +${FLASK_HEAL} HP.`);this.updateHUD();
  }

  private resolveAttack(): void {
    if(this.attackTime<ATTACK_WINDUP||this.attackTime>ATTACK_ACTIVE_END)return;
    for(const e of this.enemies){
      if(e.dead||this.attackHits.has(e.id)||!slashConnects(this.player,this.attackAngle,e.sprite,e.radius))continue;
      if(!clearLine(this.player,e.sprite,3,this.terrain,this.playerBounds()))continue;
      this.attackHits.add(e.id);const damage=Math.round(stats(this.profile).damage*[1,1.15,1.4][this.combo]);
      e.hp=Math.max(0,e.hp-damage);e.flash=.13;e.stun=e.kind==='boss'?.08:.26;e.nextPath=0;
      if(e.kind!=='boss'){e.mode='recover';e.clock=.4;const dx=e.sprite.x-this.player.x,dy=e.sprite.y-this.player.y,len=Math.hypot(dx,dy)||1;const pushed=moveCircle(e.sprite,dx/len*42,dy/len*42,e.radius,this.terrainByRegion[e.region],this.regionBounds(e.region));e.sprite.setPosition(pushed.x,pushed.y);}
      this.particles(e.sprite.x,e.sprite.y,6,0xffdeb0);this.popup(e.sprite.x,e.sprite.y-35,String(damage),'#ffe8bb');
      if(e.hp<=0)this.killEnemy(e);
    }
  }
  private killEnemy(e:Enemy): void {
    if(e.dead)return;e.dead=true;this.kills++;this.score+=e.reward*40;
    this.grantCoins(e.reward,e.region,e.kind!=='boss');this.popup(e.sprite.x,e.sprite.y-58,`+${e.reward} ✦`,'#f5d589');
    this.tweens.add({targets:e.sprite,angle:e.sprite.flipX?-85:85,alpha:0,scaleX:e.sprite.scaleX*.7,scaleY:e.sprite.scaleY*.7,duration:430,onComplete:()=>{e.sprite.setVisible(false);e.shadow.setVisible(false);}});
    this.particles(e.sprite.x,e.sprite.y,13,0xe3c68b);
    if(e.kind==='boss'){this.progress[e.region].bossDead=true;this.toast(`${REGIONS[e.region].bossName} побеждён. +${e.reward} монет.`);this.checkProgress();}
  }
  private damagePlayer(amount:number,source:Point): void {
    if(this.state!=='playing'||this.hurtLeft>0||this.dodgeLeft>0)return;
    const damage=Math.max(2,Math.round(amount*stats(this.profile).armor));this.hp=Math.max(0,this.hp-damage);
    this.hurtLeft=HURT_PROTECTION;this.hurtFlash=.22;this.attackTime=-1;
    const dx=this.player.x-source.x,dy=this.player.y-source.y,len=Math.hypot(dx,dy)||1;
    const moved=moveCircle(this.player,dx/len*26,dy/len*26,PLAYER_RADIUS,this.terrain,this.playerBounds());this.player.setPosition(moved.x,moved.y);
    this.cameras.main.shake(120,.004);this.particles(this.player.x,this.player.y,8,0xe8a783);this.popup(this.player.x,this.player.y-45,`−${damage}`,'#ffb597');
    this.updateHUD();if(this.hp<=0){this.deaths++;this.state='dying';this.deathLeft=.8;this.resetInput();this.sword.setVisible(false);}
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
  private startEnemyAttack(e:Enemy): void {
    const p=this.predict(e),dx=p.x-e.sprite.x,dy=p.y-e.sprite.y,len=Math.hypot(dx,dy)||1;
    e.aim={x:dx/len,y:dy/len};e.mode='windup';e.hasHit=false;
    e.clock=e.kind==='boss'?(e.phase2?.62:.9):e.kind==='boar'?.65:.42;
  }
  private updateEnemies(dt:number): void {
    for(const e of this.enemies){
      if(e.dead)continue;e.stun=Math.max(0,e.stun-dt);e.flash=Math.max(0,e.flash-dt);e.nextPath-=dt;e.clock-=dt;
      if(e.stun>0)continue;
      const bounds=this.regionBounds(e.region);
      if(this.player.x<bounds.left!||this.player.x>regionEnd(e.region)||Math.hypot(this.player.x-e.sprite.x,this.player.y-e.sprite.y)>780)continue;
      const distance=Math.hypot(this.player.x-e.sprite.x,this.player.y-e.sprite.y),slow=this.groundSpeed(e.sprite,false);
      if(e.kind==='boss'&&!e.phase2&&e.hp<e.maxHP*.5){e.phase2=true;e.clock=.2;for(let n=0;n<2;n++)this.spawnEnemy(e.region<2?'wolf':'boar',e.region,n);this.toast(`${REGIONS[e.region].bossName}: ярость! Быстрее атаки и подкрепление.`);}
      if(e.kind==='wolf'&&this.armed){
        e.mode='flee';const dx=e.sprite.x-this.player.x,dy=e.sprite.y-this.player.y,len=Math.hypot(dx,dy)||1;
        const spread=Math.sin(e.id*7.1)*80;const target=clampPoint({x:e.sprite.x+dx/len*300-dy/len*spread,y:e.sprite.y+dy/len*300+dx/len*spread},bounds);
        if(distance<470)this.walkEnemy(e,target,e.speed*1.14*slow,dt);continue;
      }
      if(e.mode==='flee')e.mode='chase';
      if(e.mode==='windup'){
        if(e.clock<=0){
          if(e.kind==='boss'&&REGIONS[e.region].bossAttack==='slam'){
            if(distance<155)this.damagePlayer(e.damage*(e.phase2?1.2:1),e.sprite);
            this.particles(e.sprite.x,e.sprite.y,18,0xe6ba7b);e.mode='recover';e.clock=e.phase2?.72:1.15;
          }else{e.mode='charge';e.clock=e.kind==='boss'?.58:.3;}
        }
      }else if(e.mode==='charge'){
        const speed=(e.kind==='boss'?(e.phase2?455:390):e.kind==='boar'?370:275)*slow;
        const moved=moveCircle(e.sprite,e.aim.x*speed*dt,e.aim.y*speed*dt,e.radius,this.terrainByRegion[e.region],bounds);e.sprite.setPosition(moved.x,moved.y);
        if(!e.hasHit&&Math.hypot(e.sprite.x-this.player.x,e.sprite.y-this.player.y)<e.radius+PLAYER_RADIUS+8){this.damagePlayer(e.damage,e.sprite);e.hasHit=true;}
        if(e.clock<=0){e.mode='recover';e.clock=e.kind==='boss'?(e.phase2?.65:1.05):.9;}
      }else if(e.mode==='recover'){
        if(e.clock<=0){e.mode='chase';e.clock=e.kind==='boss'?(e.phase2?.8:1.2):1.5;}
      }else if(e.kind==='hunter'){
        if(distance<210){const dx=e.sprite.x-this.player.x,dy=e.sprite.y-this.player.y,len=Math.hypot(dx,dy)||1;this.walkEnemy(e,clampPoint({x:e.sprite.x+dx/len*160,y:e.sprite.y+dy/len*160},bounds),e.speed*slow,dt);}
        else if(distance>390)this.walkEnemy(e,this.predict(e),e.speed*slow,dt);
        if(e.clock<=0){const p=this.predict(e),dx=p.x-e.sprite.x,dy=p.y-e.sprite.y,len=Math.hypot(dx,dy)||1;this.projectiles.push({x:e.sprite.x,y:e.sprite.y,vx:dx/len*305,vy:dy/len*305,life:2,damage:e.damage,region:e.region});e.clock=3.2-e.region*.2;}
      }else{
        this.walkEnemy(e,this.predict(e),e.speed*(e.phase2?1.18:1)*slow,dt);
        if(e.clock<=0&&distance<(e.kind==='boss'?260:e.kind==='boar'?185:65))this.startEnemyAttack(e);
      }
    }
  }
  private updateProjectiles(dt:number): void {
    for(const p of this.projectiles){p.life-=dt;const before={x:p.x,y:p.y};p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(!clearLine(before,p,3,this.terrainByRegion[p.region],this.regionBounds(p.region)))p.life=0;
      if(p.life>0&&Math.hypot(p.x-this.player.x,p.y-this.player.y)<22){this.damagePlayer(p.damage,p);p.life=0;}}
    this.projectiles=this.projectiles.filter(p=>p.life>0);
  }

  private grantCoins(value:number,index:number,countsForGoal=true): void {
    this.profile.coins+=value;this.score+=value*100;if(countsForGoal&&index===this.regionIndex)this.progress[index].coins+=value;this.saveProfile();
    const first=this.progress[0];if(!this.armed&&first.coins>=REGIONS[0].coins){this.armed=true;this.profile.blade=true;this.saveProfile();
      for(const e of this.enemies)if(e.kind==='wolf'){e.mode='flee';e.nextPath=0;}
      this.particles(this.player.x,this.player.y,20,0xffe3a1);this.toast('КЛИНОК ПОЛУЧЕН. ЛКМ / J или ⚔ - удар. Теперь волки убегают!');}
    this.checkProgress();this.updateHUD();
  }
  private collectCoins(): void {
    for(const c of [...this.coins]){
      if(Math.hypot(c.sprite.x-this.player.x,c.sprite.y-this.player.y)>PICKUP_RADIUS)continue;
      const x=c.sprite.x,y=c.sprite.y;c.sprite.destroy();this.coins.splice(this.coins.indexOf(c),1);this.grantCoins(c.value,c.region);this.particles(x,y,7,0xffdda0);
      const p=this.progress[c.region];if(c.region===this.regionIndex&&!p.cleared&&p.coins+this.coins.filter(v=>v.region===c.region).length<REGIONS[c.region].coins)this.spawnCoin(c.region);
    }
  }
  private checkProgress(): void {
    const p=this.progress[this.regionIndex];if(!p.cleared&&p.coins>=REGIONS[this.regionIndex].coins&&p.bossDead){
      p.cleared=true;this.drawGates();
      if(this.regionIndex===REGIONS.length-1){this.state='won';this.resetInput();this.showModal('ВСЕ ПЯТЬ ОБЛАСТЕЙ ОСВОБОЖДЕНЫ','Лесная клятва исполнена.',`Ты собрал золото и победил всех пяти боссов. Монеты, скины и улучшения останутся с тобой.`,'Новое путешествие',false);this.saveBest();this.showStats();return;}
      this.toast('Выход открыт. Иди на восток: на дороге ждут костёр и Брун.');
    }
    if(p.cleared&&this.regionIndex<REGIONS.length-1&&this.player.x>=regionStart(this.regionIndex+1)+45)this.startRegion(this.regionIndex+1);
  }

  private updateCamp(): void {
    this.nearestMerchant=-1;let nearest=INTERACT_DISTANCE;
    this.merchants.forEach((m,i)=>{const distance=Math.hypot(m.x-this.player.x,m.y-this.player.y);
      if(!this.progress[i].cleared)return;
      if(distance<150&&!this.campVisits.has(i)){this.campVisits.add(i);const s=stats(this.profile);this.hp=s.maxHP;this.stamina=s.maxStamina;this.flasks=s.flasks;this.particles(this.player.x,this.player.y,14,0x9be1b6);this.toast('Костёр: здоровье, выносливость и фляги восстановлены. Подойди к Бруну.');}
      if(distance<nearest){nearest=distance;this.nearestMerchant=i;}
    });
    this.element('interaction').hidden=this.nearestMerchant<0;
  }
  private interact(): void {
    if(this.state!=='playing'||this.nearestMerchant<0)return;
    const m=this.merchants[this.nearestMerchant];if(Math.hypot(m.x-this.player.x,m.y-this.player.y)>INTERACT_DISTANCE)return;
    this.dialogMerchant=this.nearestMerchant;this.state='dialog';this.resetInput();
    this.element<HTMLImageElement>('merchant-portrait').src=this.textures.getBase64('merchant');
    this.element('dialog-overlay').hidden=false;
    this.say(`Добрался, лис! Я Брун. У костра можно перевести дух. Дальше - ${REGIONS[this.dialogMerchant+1].name}. За золото заточу клинок, укреплю броню или подберу новый плащ. Что нужно?`);
  }
  private say(text:string): void {this.dialogTarget=text;this.dialogTime=0;this.element('dialog-text').textContent='';}
  private leaveDialog(): void {this.element('dialog-overlay').hidden=true;this.state='playing';this.resetInput();}
  private openShop(): void {
    if(this.state!=='dialog')return;this.state='shop';this.element('dialog-overlay').hidden=true;this.element('shop-overlay').hidden=false;
    this.shopPage=0;this.element('shop-message').textContent='Покупки сохраняются. Расходы не уменьшают цель области.';this.renderShop();
  }
  private renderShop(): void {
    const items=this.shopTab==='skins'?SKINS:UPGRADES;
    const pages=Math.ceil(items.length/4);this.shopPage=Math.min(pages-1,Math.max(0,this.shopPage));
    this.element('shop-wallet').textContent=`${this.profile.coins} монет`;
    this.element('shop-page').textContent=`${this.shopPage+1} / ${pages}`;
    this.element<HTMLButtonElement>('shop-prev').disabled=this.shopPage===0;this.element<HTMLButtonElement>('shop-next').disabled=this.shopPage===pages-1;
    for(const tab of ['skins','upgrades']){this.element(`tab-${tab}`).classList.toggle('selected',tab===this.shopTab);this.element(`tab-${tab}`).setAttribute('aria-selected',String(tab===this.shopTab));}
    this.element('storage-status').textContent=this.storageAvailable?'Сохранение в этом браузере':'Сохранение недоступно: покупки действуют до закрытия игры';
    const cards: string[]=[];
    if(this.shopTab==='skins')for(const s of SKINS.slice(this.shopPage*4,this.shopPage*4+4)){
      const owned=this.profile.owned.includes(s.id),selected=this.profile.skin===s.id;
      cards.push(`<article class="shop-card"><img src="${this.textures.getBase64(s.id)}" alt=""><h3>${s.name}</h3><p>${selected?'Сейчас на лисе':owned?'Уже в коллекции':'Новый облик героя'}</p><button data-item="${s.id}" ${selected?'disabled':''}>${selected?'Выбран':owned?'Надеть':`${s.price} ◉`}</button></article>`);
    }else for(const u of UPGRADES.slice(this.shopPage*4,this.shopPage*4+4)){
      const rank=this.profile.upgrades[u.id],max=rank>=u.prices.length;
      cards.push(`<article class="shop-card"><span class="upgrade-icon">${u.icon}</span><h3>${u.name}</h3><p>${u.description}<br>Ступень ${rank} / ${u.prices.length}</p><button data-item="${u.id}" ${max?'disabled':''}>${max?'Максимум':`${u.prices[rank]} ◉`}</button></article>`);
    }
    this.element('shop-items').innerHTML=cards.join('');
  }

  private setGuideText(): void {
    const touch=window.matchMedia('(pointer: coarse)').matches||this.scale.width<=700;
    const hint=this.element('overlay').querySelector('.control-hint');if(hint)hint.textContent=touch?'Левый круг - идти · ⚔ - удар · ϟ - уклонение · ♜ - лечение':'WASD - движение · ЛКМ/J - удар · Пробел - уклонение · Q - лечение';
    this.element('interact-button').textContent=touch?'Поговорить с Бруном':'E · Поговорить с Бруном';
    const grid=this.element('guide').querySelector('.guide-grid');
    if(grid)grid.innerHTML=touch?'<span><b>Левый круг</b> идти</span><span><b>⚔</b> удар по направлению</span><span><b>ϟ</b> уклонение</span><span><b>♜</b> фляга лечения</span><span><b>У Бруна</b> кнопка разговора</span><span><b>Сверху</b> карта, помощь, пауза</span>':'<span><b>WASD / стрелки</b> идти</span><span><b>ЛКМ / J</b> удар</span><span><b>Space / Shift</b> уклонение</span><span><b>Q</b> фляга лечения</span><span><b>E</b> говорить с Бруном</span><span><b>M / H / P</b> карта / помощь / пауза</span>';
  }
  private toggleGuide(show?:boolean): void {const g=this.element('guide');g.hidden=show===undefined?!g.hidden:!show;}
  private toggleMap(): void {
    if(this.state==='map'){this.state=this.mapReturn;this.element('map-overlay').hidden=true;return;}
    if(this.state!=='playing'&&this.state!=='paused')return;
    this.mapReturn=this.state;this.state='map';this.resetInput();this.element('map-overlay').hidden=false;this.drawMaps();
  }
  private drawMaps(): void {
    const draw=(id:string,large:boolean)=>{
      const canvas=this.element<HTMLCanvasElement>(id),ctx=canvas.getContext('2d');if(!ctx)return;
      const w=canvas.width,h=canvas.height,pad=large?30:6,sx=(w-pad*2)/WORLD_WIDTH,sy=(h-pad*2)/WORLD_HEIGHT;
      ctx.clearRect(0,0,w,h);ctx.fillStyle='#102c24';ctx.fillRect(0,0,w,h);
      const point=(p:Point)=>({x:pad+p.x*sx,y:pad+p.y*sy});
      ctx.lineWidth=large?12:4;ctx.strokeStyle='#bcb185';ctx.beginPath();const left=point({x:0,y:550}),right=point({x:WORLD_WIDTH,y:550});ctx.moveTo(left.x,left.y);ctx.lineTo(right.x,right.y);ctx.stroke();
      for(let i=0;i<REGIONS.length;i++){
        const p=point({x:regionStart(i),y:50}),width=REGION_WIDTH*sx,height=1000*sy;
        ctx.fillStyle=i<=this.regionIndex?REGIONS[i].palette.ground:'#1c342b';ctx.fillRect(p.x,p.y,width,height);
        ctx.strokeStyle=this.progress[i].cleared?'#b9d78a':i===this.regionIndex?'#ebd398':'#456254';ctx.lineWidth=large?2:1;ctx.strokeRect(p.x,p.y,width,height);
        if(large){ctx.fillStyle=i<=this.regionIndex?'#f2e5b8':'#779085';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText(`${i+1}. ${REGIONS[i].name}`,p.x+width/2,19);ctx.font='11px system-ui';ctx.fillText(this.progress[i].cleared?'Пройдено':i===this.regionIndex?`${this.progress[i].coins}/${REGIONS[i].coins} ◉`:'Не исследовано',p.x+width/2,h-7);}
      }
      ctx.lineWidth=large?7:3;ctx.strokeStyle='#bcb18588';ctx.beginPath();ctx.moveTo(left.x,left.y);ctx.lineTo(right.x,right.y);ctx.stroke();
      if(large)for(const t of this.terrain){const p=point(t);ctx.fillStyle=t.kind==='puddle'?'#5b9291':'#263f30';ctx.beginPath();ctx.arc(p.x,p.y,Math.max(1,t.radius*sx),0,Math.PI*2);ctx.fill();}
      for(const c of this.coins){if(c.region>this.regionIndex)continue;const p=point(c.sprite);ctx.fillStyle='#f6cd6b';ctx.beginPath();ctx.arc(p.x,p.y,large?3:1.4,0,Math.PI*2);ctx.fill();}
      this.merchants.forEach((m,i)=>{const p=point(m);ctx.fillStyle=this.progress[i].cleared?'#efd7ac':'#778b79';ctx.fillRect(p.x-3,p.y-4,6,8);});
      for(const e of this.enemies)if(e.kind==='boss'&&!e.dead){const p=point(e.sprite);ctx.fillStyle='#ef7761';ctx.beginPath();ctx.arc(p.x,p.y,large?6:3,0,Math.PI*2);ctx.fill();}
      const p=point(this.player);ctx.fillStyle='#f6aa65';ctx.strokeStyle='#fff2c7';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,large?6:3.4,0,Math.PI*2);ctx.fill();ctx.stroke();
      if(!large){const cam=this.cameras.main,at=point({x:cam.worldView.x,y:cam.worldView.y});ctx.strokeStyle='#eff8dc66';ctx.lineWidth=1;ctx.strokeRect(at.x,at.y,cam.worldView.width*sx,cam.worldView.height*sy);}
    };
    draw('minimap',false);if(!this.element('map-overlay').hidden){draw('world-map',true);this.element('map-regions').innerHTML=REGIONS.map((r,i)=>`<span class="${i===this.regionIndex?'current':''}">${this.progress[i].cleared?'✓':i+1} · ${r.name}</span>`).join('');}
  }
  private fullscreen(): void {
    const operation=document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();
    operation?.catch(()=>this.toast('Игра уже занимает всю страницу. Полный экран недоступен в этом браузере.'));
  }
  private togglePause(): void {
    if(this.state==='playing'){this.state='paused';this.resetInput();this.showModal('ПРИВАЛ','Время остановилось.','Можно посмотреть карту или вспомнить управление. Путь продолжится с этого же места.','Снять паузу',false);this.element('restart-button').hidden=false;}
    else if(this.state==='paused'){this.state='playing';this.hideModal();this.resetInput();}
  }
  private primaryAction(): void {
    if(this.state==='ready'){this.state='playing';this.hideModal();this.toast(this.armed?'Клинок с тобой. Собери 14 монет и победи вожака.':'Первые 14 монет откроют клинок. Босс появится через 45 секунд.');}
    else if(this.state==='paused')this.togglePause();
    else if(this.state==='lost'){this.deaths++;this.startRegion(this.regionIndex,true);this.hideModal();}
    else if(this.state==='won')this.newJourney();
  }
  private showModal(tag:string,title:string,description:string,button:string,rules:boolean): void {
    this.element('modal-tag').textContent=tag;this.element('modal-title').textContent=title;this.element('modal-description').textContent=description;
    this.element('primary-button').textContent=button;this.element('start-rules').hidden=!rules;this.element('modal-stats').hidden=true;this.element('restart-button').hidden=true;this.element('overlay').hidden=false;
  }
  private hideModal(): void {this.element('overlay').hidden=true;}
  private showStats(): void {const s=this.element('modal-stats');s.hidden=false;s.innerHTML=`<span><b>${this.score}</b> очков</span><span><b>${this.best}</b> рекорд</span><span><b>${this.kills}</b> врагов</span><span><b>${Math.floor(this.elapsed)} с</b> в пути</span><span><b>${this.profile.coins} ◉</b> в кошельке</span>`;}
  private resetInput(): void {
    this.touch={x:0,y:0};this.velocity={x:0,y:0};this.joystickPointer=null;this.attackPointer=null;this.attackHeld=false;
    this.element('joystick-knob').style.transform='';this.input.keyboard?.resetKeys();
  }

  private resetWeather(): void {this.weather='clear';this.weatherLeft=0;this.weatherNext=12+Math.random()*9;this.wetZones=[];this.strike=null;this.strikeNext=2;this.slowed=0;this.weatherInk?.clear();}
  private updateWeather(dt:number): void {
    this.weatherNext-=dt;
    if(this.weather==='clear'&&this.weatherNext<=0){
      this.weather=Math.random()<.5?'rain':'storm';this.weatherLeft=WEATHER_DURATION;
      this.wetZones=Array.from({length:3},()=>({...this.freePosition(this.regionIndex,20,0),radius:90+Math.random()*40}));
      this.strikeNext=1.5;this.toast(this.weather==='rain'?'Дождь: голубые участки замедляют того, кто в них попал.':'Гроза: выйди из красного круга. Молния оглушает врагов и замедляет лиса.');
    }
    if(this.weather!=='clear'){
      this.weatherLeft-=dt;
      if(this.weather==='storm'){
        this.strikeNext-=dt;
        if(!this.strike&&this.strikeNext<=0){const target=Math.random()<.6?{x:this.player.x+this.velocity.x*.35,y:this.player.y+this.velocity.y*.35}:this.freePosition(this.regionIndex,30,0);const at=clampPoint(target,this.regionBounds(this.regionIndex));this.strike={...at,left:LIGHTNING_WARNING,phase:'warning'};}
        if(this.strike){this.strike.left-=dt;if(this.strike.left<=0){
          if(this.strike.phase==='warning'){
            this.strike.phase='impact';this.strike.left=.3;
            if(Math.hypot(this.player.x-this.strike.x,this.player.y-this.strike.y)<LIGHTNING_RADIUS+PLAYER_RADIUS&&this.dodgeLeft<=0){this.slowed=1.8;this.toast('Молния! Движение замедлено на 1,8 с.');}
            for(const e of this.enemies)if(!e.dead&&Math.hypot(e.sprite.x-this.strike.x,e.sprite.y-this.strike.y)<LIGHTNING_RADIUS+e.radius){e.stun=e.kind==='boss'?1.2:2.4;e.mode='recover';e.clock=e.stun;}
            this.particles(this.strike.x,this.strike.y,14,0xd4f1ff);
          }else{this.strike=null;this.strikeNext=2.1+Math.random()*1.4;}
        }}
      }
      if(this.weatherLeft<=0){this.weather='clear';this.weatherNext=14+Math.random()*12;this.wetZones=[];this.strike=null;}
    }
  }
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

  private drawActors(): void {
    const t=this.animationTime,moving=Math.hypot(this.velocity.x,this.velocity.y)>10,run=moving?Math.sin(t*18):Math.sin(t*3)*.2;
    this.player.setFlipX(Math.cos(this.face)<0).setAngle(this.dodgeLeft>0?Math.sin(this.face)*22:this.attackTime>=0?Math.sin(this.attackTime/ATTACK_DURATION*Math.PI)*-12:run*3);
    this.player.setScale(72/128*(this.attackTime>=0?1.02:1),72/128*(this.dodgeLeft>0?.82:1+run*.02));
    this.player.setDepth(20+this.player.y*.01);this.playerShadow.setPosition(this.player.x,this.player.y+22).setScale(this.dodgeLeft>0?1.3:1);
    if(this.hurtFlash>0)this.player.setTint(0xff8074);else this.player.clearTint();this.player.setAlpha(this.hurtLeft>0?.55+Math.sin(t*45)*.25:1);
    this.sword.setVisible(this.armed);let swing=this.face+.8;
    if(this.attackTime>=0){
      if(this.attackTime<ATTACK_WINDUP)swing=this.attackAngle+.8-this.attackTime/ATTACK_WINDUP*1.9;
      else if(this.attackTime<=ATTACK_ACTIVE_END)swing=this.attackAngle-1.1+(this.attackTime-ATTACK_WINDUP)/(ATTACK_ACTIVE_END-ATTACK_WINDUP)*2.2;
      else swing=this.attackAngle+1.1-(this.attackTime-ATTACK_ACTIVE_END)/(ATTACK_DURATION-ATTACK_ACTIVE_END)*.3;
    }
    this.sword.setPosition(this.player.x+Math.cos(swing)*10,this.player.y+Math.sin(swing)*10+8).setRotation(swing+.98).setDepth(this.player.depth+1).setAlpha(this.attackTime>=0?1:.7);
    const g=this.combatInk;g.clear();
    if(this.attackTime>=0){
      const active=this.attackTime>=ATTACK_WINDUP&&this.attackTime<=ATTACK_ACTIVE_END;
      const alpha=active?.7:this.attackTime<ATTACK_WINDUP?.12:Math.max(0,.3*(1-(this.attackTime-ATTACK_ACTIVE_END)/(ATTACK_DURATION-ATTACK_ACTIVE_END)));
      g.lineStyle(active?11:3,active?0xffe4a4:0xcbe5c2,alpha);g.beginPath();g.arc(this.player.x,this.player.y,ATTACK_REACH*.8,this.attackAngle-1.05,this.attackAngle+1.05,false);g.strokePath();
      if(active){g.lineStyle(3,0xfff6d7,.95);g.lineBetween(this.player.x+Math.cos(swing)*25,this.player.y+Math.sin(swing)*25,this.player.x+Math.cos(swing)*99,this.player.y+Math.sin(swing)*99);}
    }
    for(const e of this.enemies){if(e.dead)continue;
      const walk=e.mode==='chase'||e.mode==='flee'||e.mode==='charge',bounce=walk?Math.sin(t*(e.mode==='charge'?25:14)+e.id):0;
      e.sprite.setAngle(e.mode==='windup'?Math.sin(t*28)*4:bounce*3).setScale((e.kind==='boss'?138:e.kind==='boar'?81:74)/128,((e.kind==='boss'?138:e.kind==='boar'?81:74)/128)*(1+bounce*.035)).setDepth(20+e.sprite.y*.01);
      e.shadow.setPosition(e.sprite.x,e.sprite.y+e.radius).setVisible(true);
      if(e.flash>0)e.sprite.setTint(0xffe8be);else if(e.stun>0)e.sprite.setTint(0x9bd7e5);else if(e.mode==='windup')e.sprite.setTint(0xf4ac92);else e.sprite.clearTint();
      const shooting=e.kind==='hunter'&&e.clock<.6;
      if(e.mode==='windup'||shooting){const slam=e.kind==='boss'&&REGIONS[e.region].bossAttack==='slam';
        g.lineStyle(2,0xff7867,.7);g.fillStyle(0xcc5548,.12);if(slam){g.fillCircle(e.sprite.x,e.sprite.y,155);g.strokeCircle(e.sprite.x,e.sprite.y,155);}else{const aim=shooting?this.predict(e):{x:e.sprite.x+e.aim.x*210,y:e.sprite.y+e.aim.y*210};g.lineBetween(e.sprite.x,e.sprite.y,aim.x,aim.y);g.strokeCircle(e.sprite.x,e.sprite.y,e.radius+7);}
      }
      if(e.hp<e.maxHP&&e.kind!=='boss'){const width=44;g.fillStyle(0x102a22,.85);g.fillRect(e.sprite.x-width/2,e.sprite.y-e.radius-28,width,5);g.fillStyle(0xea9c83,.95);g.fillRect(e.sprite.x-width/2,e.sprite.y-e.radius-28,width*e.hp/e.maxHP,5);}
      if(e.stun>0){g.lineStyle(2,0xa6ebff,.8);g.strokeCircle(e.sprite.x,e.sprite.y-e.radius-14,5);}
    }
    for(const p of this.projectiles){const angle=Math.atan2(p.vy,p.vx);g.lineStyle(3,0xf6dbab,.9);g.lineBetween(p.x,p.y,p.x-Math.cos(angle)*15,p.y-Math.sin(angle)*15);}
    for(const c of this.coins)c.sprite.setAngle(Math.sin(t*2+c.phase)*10).setScale(46/128,46/128*(.85+Math.sin(t*3+c.phase)*.1));
    this.fires.forEach((f,i)=>f.setAlpha(.82+Math.sin(t*9+i)*.15));this.drawWeather();
  }
  private drawGates(): void {
    const g=this.gateInk;g.clear();for(let i=0;i<REGIONS.length-1;i++){
      const x=regionEnd(i)-32,closed=!this.progress[i].cleared;
      if(closed){g.lineStyle(7,i===this.regionIndex?0xb87755:0x3a5543,.7);g.lineBetween(x,65,x,WORLD_HEIGHT-35);g.lineStyle(3,0xead2a0,.28);for(let y=80;y<WORLD_HEIGHT-35;y+=42)g.lineBetween(x-14,y,x+14,y+20);
        g.fillStyle(0x753d34,.95);g.fillCircle(x,WORLD_HEIGHT/2,25);g.lineStyle(2,0xe1b778,.8);g.strokeCircle(x,WORLD_HEIGHT/2,25);
      }else{g.fillStyle(0xc7c48c,.8);g.fillRect(x-7,WORLD_HEIGHT/2-115,14,60);g.fillRect(x-7,WORLD_HEIGHT/2+55,14,60);}
    }
  }
  private updateHUD(): void {
    if(!this.progress.length)return;const s=stats(this.profile),r=REGIONS[this.regionIndex],p=this.progress[this.regionIndex];
    this.element('hp-text').textContent=`${Math.ceil(this.hp)} / ${s.maxHP}`;this.element('hp-fill').style.width=`${Math.max(0,this.hp)/s.maxHP*100}%`;
    this.element('stamina-text').textContent=`${Math.floor(this.stamina)} / ${s.maxStamina}`;this.element('stamina-fill').style.width=`${this.stamina/s.maxStamina*100}%`;
    this.element('wallet-count').textContent=`${this.profile.coins} ◉`;this.element('flask-count').textContent=`✚ ${this.flasks}`;this.element('weapon-label').textContent=this.armed?'КЛИНОК ПОЛУЧЕН':'КЛИНОК ЗА 14 МОНЕТ';
    this.element('region-number').textContent=`ОБЛАСТЬ ${this.regionIndex+1} / 5`;this.element('region-name').textContent=r.name;this.element('coin-goal').textContent=`Золото: ${Math.min(p.coins,r.coins)} / ${r.coins}`;
    const seconds=Math.max(0,Math.ceil(r.bossTime-p.elapsed));this.element('boss-timer').textContent=p.bossDead?'Босс побеждён':p.spawned?'Босс в области':`Босс через ${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    const objective=p.cleared?'Выход открыт: иди на восток':!this.armed?'Собери 14 монет, чтобы получить клинок':p.spawned?'Собери золото и победи босса':'Собирай золото. Готовься к боссу';
    this.element('quest-text').textContent=objective;this.element('guide-objective').textContent=objective;
    const boss=this.enemies.find(e=>e.kind==='boss'&&e.region===this.regionIndex&&!e.dead);this.element('boss-hud').hidden=!boss;
    if(boss){this.element('boss-name').textContent=`${r.bossName}${boss.phase2?' · ЯРОСТЬ':''}`;this.element('boss-hp-text').textContent=`${Math.ceil(boss.hp)} / ${boss.maxHP}`;this.element('boss-hp-fill').style.width=`${Math.max(0,boss.hp)/boss.maxHP*100}%`;}
    this.element('weather-label').textContent=this.slowed>0?'⚡ Замедление':this.weather==='clear'?'Ясно':`${this.weather==='rain'?'Дождь':'Гроза'} · ${Math.ceil(this.weatherLeft)} с`;
    this.element('attack-button').classList.toggle('locked',!this.armed);this.element('action-status').textContent=this.armed?'Сохрани выносливость для уклонения':'Собери 14 монет, чтобы открыть оружие';
    let target:Point|null=null,label='';
    if(p.cleared&&this.regionIndex<4){const m=this.merchants[this.regionIndex];target=this.player.x<m.x+60?m:{x:regionStart(this.regionIndex+1)+70,y:550};label=this.player.x<m.x+60?'Костёр и лавка Бруна':'Следующая область';}
    else if(p.coins<r.coins){const c=this.coins.filter(c=>c.region===this.regionIndex).sort((a,b)=>Math.hypot(a.sprite.x-this.player.x,a.sprite.y-this.player.y)-Math.hypot(b.sprite.x-this.player.x,b.sprite.y-this.player.y))[0];if(c)target=c.sprite;label='Ближайшая монета';}
    else if(boss){target=boss.sprite;label='Победи босса';}else label=`Босс появится через ${seconds} с`;
    this.element('navigation-text').textContent=label;this.element('direction-arrow').hidden=!target;
    if(target)this.element('direction-arrow').style.transform=`rotate(${Math.atan2(target.y-this.player.y,target.x-this.player.x)*180/Math.PI}deg)`;
  }
  private particles(x:number,y:number,count:number,color:number): void {
    for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,d=15+Math.random()*50;const dot=this.add.circle(x,y,2+Math.random()*2,color,.9).setDepth(600);this.tweens.add({targets:dot,x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,alpha:0,scale:.2,duration:250+Math.random()*220,onComplete:()=>dot.destroy()});}
  }
  private popup(x:number,y:number,text:string,color:string): void {const label=this.add.text(x,y-35,text,{fontFamily:'system-ui',fontSize:'17px',fontStyle:'bold',color,stroke:'#203329',strokeThickness:3}).setOrigin(.5).setDepth(650);this.tweens.add({targets:label,y:y-85,alpha:0,duration:700,onComplete:()=>label.destroy()});}
  private toast(text:string): void {const t=this.element('toast');t.textContent=text;t.classList.add('visible');window.clearTimeout(this.toastTimeout);this.toastTimeout=window.setTimeout(()=>t.classList.remove('visible'),4100);}
  private saveProfile(): void {if(!this.storageAvailable)return;try{localStorage.setItem(PROFILE_KEY,JSON.stringify(this.profile));}catch{this.storageAvailable=false;}}
  private saveBest(): void {if(this.score<=this.best)return;this.best=this.score;try{localStorage.setItem(BEST_KEY,String(this.best));}catch{/* Рекорд текущей вкладки остаётся доступным. */}}
}
