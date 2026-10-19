import { ForestAudio } from './audio/GameAudio';
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
import {
  createArtwork,
  createMysticArtwork,
  createVillageArtwork,
  createAtlasArtwork,
  createCreepyArtwork,
  createHeroArtwork,
  createDetailArtwork,
  createCombatArtwork,
  createEquipmentArtwork,
  createArmArtwork,
  createArmedMotionArtwork,
  createStrideArtwork,
  createRollArtwork,
  createResidentArtwork,
} from './rendering/TextureFactory';
import { LEGACY_KEYS, PROFILE_KEY } from './progression/PlayerProgression';
import { parseSave } from './persistence/SaveSchema';
import { weaponTexture, WEAPON_ART } from './rendering/WeaponAnimation';
import Phaser from 'phaser';
import { advanceQuests } from './quests/TrialsAndLoot';
import { type SkillId } from './progression/Skills';
import { stats } from './combat/CombatRules';
import { REGIONS } from './world/WorldConfig';
import { PlayerState } from './player/PlayerState';
import { WorldState } from './world/WorldState';
import { JourneyState } from './core/JourneyState';
import { InterfaceState } from './ui/InterfaceState';
import { RenderState } from './rendering/RenderState';
import { PlayerController } from './player/PlayerController';
import { CombatSystem } from './combat/CombatSystem';
import { CombatEffects } from './combat/CombatEffects';
import { EnemySystem } from './enemies/EnemySystem';
import { BossSystem } from './enemies/BossSystem';
import { WorldSystem } from './world/WorldSystem';
import { WorldRenderer } from './world/WorldRenderer';
import { VillageSystem } from './village/VillageSystem';
import { EconomySystem } from './economy/EconomySystem';
import { QuestSystem } from './quests/QuestSystem';
import { MenuController } from './ui/MenuController';
import { MapController } from './ui/MapController';
import { InputController } from './ui/InputController';
import { SaveSystem } from './persistence/SaveSystem';
import { StorySystem } from './story/StorySystem';
import { TutorialSystem } from './story/TutorialSystem';
import { ActorRenderer } from './rendering/ActorRenderer';
import { WeatherSystem } from './world/WeatherSystem';

/** Связывает системы игры и задаёт порядок их обновления. */
export class GameScene extends Phaser.Scene {
  readonly hero = new PlayerState();
  readonly worldState = new WorldState();
  readonly journey = new JourneyState();
  readonly ui = new InterfaceState();
  readonly visuals = new RenderState();
  readonly player = new PlayerController(this);
  readonly combat = new CombatSystem(this);
  readonly effects = new CombatEffects(this);
  readonly enemies = new EnemySystem(this);
  readonly bosses = new BossSystem(this);
  readonly world = new WorldSystem(this);
  readonly scenery = new WorldRenderer(this);
  readonly village = new VillageSystem(this);
  readonly economy = new EconomySystem(this);
  readonly quests = new QuestSystem(this);
  readonly menu = new MenuController(this);
  readonly map = new MapController(this);
  readonly controls = new InputController(this);
  readonly saves = new SaveSystem(this);
  readonly story = new StorySystem(this);
  readonly tutorial = new TutorialSystem(this);
  readonly actors = new ActorRenderer(this);
  readonly weather = new WeatherSystem(this);
  audio = new ForestAudio();
  constructor(private initialTraining: boolean | null = null) {
    super('GameScene');
  }
  preload(): void {
    this.load.on('progress', (value: number) => {
      this.element('title-status').textContent = `Подготовка мира: ${Math.round(value * 100)}%`;
    });
    this.load.on('loaderror', () => {
      this.element('title-status').textContent = 'Файл игры не загрузился. Обнови страницу.';
    });
    this.load.image('village-atlas', villageAtlas);
    this.load.image('biome-atlas', biomeAtlas);
    this.load.image('story-atlas', storyAtlas);
    this.load.image('creep-atlas', creepAtlas);
    this.load.image('hero-atlas', heroAtlas);
    this.load.image('interiors-atlas', interiorsAtlas);
    this.load.image('details-atlas', detailsAtlas);
    this.load.image('combat-atlas', combatAtlas);
    this.load.image('stride-atlas', strideAtlas);
    this.load.image('resident-atlas', residentAtlas);
    this.load.image('roll-atlas', rollAtlas);
    this.load.image('equipment-atlas', equipmentAtlas);
    this.load.image('armed-motion-atlas', armedMotionAtlas);
  }
  create(): void {
    createArtwork(this);
    createMysticArtwork(this);
    createVillageArtwork(this);
    createAtlasArtwork(this);
    createCreepyArtwork(this);
    createHeroArtwork(this);
    createDetailArtwork(this);
    createCombatArtwork(this);
    createEquipmentArtwork(this);
    createArmArtwork(this);
    createArmedMotionArtwork(this);
    createStrideArtwork(this);
    createRollArtwork(this);
    createResidentArtwork(this);
    try {
      for (const key of LEGACY_KEYS) localStorage.removeItem(key);
      this.journey.saved = parseSave(localStorage.getItem(PROFILE_KEY));
    } catch {
      this.journey.storageAvailable = false;
    }
    this.scenery.drawWorld();
    this.worldState.outdoorArt = [...this.children.list] as typeof this.worldState.outdoorArt;
    this.visuals.gateInk = this.add.graphics().setDepth(700);
    this.visuals.weatherInk = this.add.graphics().setDepth(6);
    this.visuals.playerShadow = this.add.ellipse(140, 550, 35, 14, 0x09291b, 0.34).setDepth(8);
    this.visuals.player = this.add
      .image(140, 550, 'fox')
      .setOrigin(0.5, 0.68)
      .setDisplaySize(92, 92)
      .setDepth(20);
    this.visuals.arms = Array.from({ length: 2 }, () => ({
      upper: this.add.image(0, 0, 'hero-upper').setOrigin(0.5, 0).setVisible(false),
      forearm: this.add.image(0, 0, 'hero-forearm').setOrigin(0.5, 0).setVisible(false),
      hand: this.add.image(0, 0, 'hand-grip').setOrigin(0.5, 0.35).setVisible(false),
    }));
    this.visuals.sword = this.add
      .image(0, 0, weaponTexture('sword'))
      .setDisplaySize(100, 100)
      .setOrigin(WEAPON_ART.sword.gripX, WEAPON_ART.sword.gripY)
      .setVisible(false)
      .setDepth(21);
    this.visuals.armorSprite = this.add
      .image(140, 550, 'armor-ranger')
      .setDisplaySize(72, 72)
      .setVisible(false)
      .setDepth(22);
    this.visuals.combatInk = this.add.graphics().setDepth(500);
    this.visuals.reaperInk = this.add.graphics().setDepth(740);
    this.visuals.reaper = this.add
      .image(0, 0, 'weapon-reaper')
      .setDisplaySize(225, 225)
      .setDepth(750)
      .setVisible(false);
    this.visuals.stolenWeapon = this.add
      .image(0, 0, weaponTexture('sword'))
      .setDepth(755)
      .setVisible(false);
    if (!this.input.keyboard) throw new Error('Keyboard unavailable');
    this.ui.keys = this.input.keyboard.addKeys(
      'W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,SHIFT,J,Q,V,E,P,ESC,ENTER,H,M,F,R,TAB,C,ONE,TWO,THREE',
    ) as Record<string, Phaser.Input.Keyboard.Key>;
    this.controls.bindControls();
    this.world.configureCamera();
    if (this.initialTraining === null) {
      this.story.resetJourney();
      this.world.startVillage(-1, true);
      this.menu.showTitle();
    } else this.story.newJourney(this.initialTraining);
    this.saves.refreshSaveUI();
    this.scale.on('resize', this.world.configureCamera, this.world);
    this.events.once('shutdown', () => {
      this.ui.listeners.abort();
      this.scale.off('resize', this.world.configureCamera, this.world);
      clearTimeout(this.ui.toastTimeout);
      this.audio.destroy();
    });
  }
  element<T extends HTMLElement = HTMLElement>(id: string): T {
    const e = document.getElementById(id);
    if (!e) throw new Error(`Missing UI: ${id}`);
    return e as T;
  }
  seals(): number {
    return this.journey.progress.filter((p) => p.bossDead).length;
  }
  update(_time: number, delta: number): void {
    const dt = Math.min(delta, 40) / 1000;
    const live =
      this.ui.state === 'playing' || this.ui.state === 'intro' || this.ui.state === 'story';
    const boss = this.worldState.enemies.some(
      (e) => !e.dead && e.kind === 'boss' && e.region === this.worldState.regionIndex,
    );
    const threat =
      this.worldState.area === 'biome' &&
      this.worldState.enemies.some(
        (e) =>
          !e.dead &&
          e.region === this.worldState.regionIndex &&
          Math.hypot(e.sprite.x - this.visuals.player.x, e.sprite.y - this.visuals.player.y) < 420,
      );
    this.journey.combatMusicLeft = threat ? 3 : Math.max(0, this.journey.combatMusicLeft - dt);
    this.audio.update(
      dt,
      live,
      this.worldState.weather,
      this.ui.state === 'story'
        ? 'story'
        : this.worldState.area === 'village' || this.worldState.area === 'interior'
          ? 'village'
          : this.worldState.area === 'biome' && boss
            ? this.worldState.enemies.some(
                (e) =>
                  e.kind === 'boss' &&
                  !e.dead &&
                  e.phase2 &&
                  e.region === this.worldState.regionIndex,
              )
              ? 'rage'
              : 'boss'
            : this.journey.combatMusicLeft > 0
              ? 'combat'
              : 'explore',
    );
    if (this.ui.checkpointBannerLeft > 0) {
      this.ui.checkpointBannerLeft -= dt;
      if (this.ui.checkpointBannerLeft <= 0) this.element('checkpoint-banner').hidden = true;
    }
    this.quests.updateAchievementNotice(dt);
    this.tutorial.updateTeachingUI();
    this.bosses.updateBossCountdown(dt);
    if (Phaser.Input.Keyboard.JustDown(this.ui.keys.H)) this.menu.toggleGuide();
    if (Phaser.Input.Keyboard.JustDown(this.ui.keys.M)) this.map.toggleMap();
    if (Phaser.Input.Keyboard.JustDown(this.ui.keys.TAB)) {
      this.menu.toggleMenu();
      return;
    }
    if (this.ui.state === 'story') {
      this.story.updateStory(dt);
      return;
    }
    if (this.ui.state === 'choice' || this.ui.state === 'confirm' || this.ui.state === 'briefing')
      return;
    if (this.ui.state === 'travel') {
      if (Phaser.Input.Keyboard.JustDown(this.ui.keys.ESC)) this.village.closeTravel();
      return;
    }
    if (this.ui.state === 'menu') {
      if (Phaser.Input.Keyboard.JustDown(this.ui.keys.ESC)) this.menu.toggleMenu();
      return;
    }
    if (this.ui.state === 'map') {
      if (Phaser.Input.Keyboard.JustDown(this.ui.keys.ESC)) this.map.toggleMap();
      return;
    }
    if (this.ui.state === 'dialog') {
      this.ui.dialogTime += dt;
      this.element('dialog-text').textContent = this.ui.dialogTarget.slice(
        0,
        Math.floor(this.ui.dialogTime * 78),
      );
      if (Phaser.Input.Keyboard.JustDown(this.ui.keys.ESC)) this.village.leaveDialog();
      return;
    }
    if (this.ui.state === 'shop') {
      if (Phaser.Input.Keyboard.JustDown(this.ui.keys.ESC)) this.element('shop-close').click();
      return;
    }
    if (this.ui.state === 'loot') {
      this.ui.lootLeft -= dt;
      if (this.ui.lootLeft <= 0 && this.ui.loot) {
        this.quests.applyLoot();
      }
      return;
    }
    if (this.ui.state === 'intro') {
      this.story.updateIntro(dt);
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(this.ui.keys.ESC)) {
      if (this.ui.state === 'paused') this.menu.togglePause();
      else this.menu.toggleMenu();
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(this.ui.keys.P)) this.menu.togglePause();
    if (Phaser.Input.Keyboard.JustDown(this.ui.keys.ENTER) && this.ui.state !== 'playing')
      this.menu.primaryAction();
    if (this.ui.state === 'dying') {
      this.hero.deathLeft -= dt;
      this.visuals.animationTime += dt;
      this.visuals.player
        .setAngle(Math.min(85, (0.8 - this.hero.deathLeft) * 110))
        .setAlpha(Math.max(0.2, this.hero.deathLeft / 0.8));
      this.visuals.armorSprite.setVisible(false);
      if (this.hero.deathLeft <= 0) this.world.respawn();
      return;
    }
    if (this.ui.state !== 'playing') return;
    this.journey.elapsed += dt;
    this.visuals.animationTime += dt;
    this.journey.dirty = true;
    const p = this.journey.progress[this.worldState.regionIndex];
    if (this.worldState.area === 'biome' && !p.cleared) p.elapsed += dt;
    if (this.worldState.area === 'biome')
      advanceQuests(this.journey.quests[this.worldState.regionIndex], dt);
    this.hero.guardLeft = Math.max(0, this.hero.guardLeft - dt);
    this.hero.counterLeft = Math.max(0, this.hero.counterLeft - dt);
    if (this.hero.counterLeft === 0) this.hero.counterTarget = -1;
    this.hero.shieldLeft = Math.max(0, this.hero.shieldLeft - dt);
    for (const id of Object.keys(this.hero.skillCooldowns) as SkillId[])
      this.hero.skillCooldowns[id] = Math.max(0, (this.hero.skillCooldowns[id] ?? 0) - dt);
    this.visuals.effects = this.visuals.effects.filter((e) => (e.life -= dt) > 0);
    this.hero.dodgeLeft = Math.max(0, this.hero.dodgeLeft - dt);
    this.hero.dodgeWait = Math.max(0, this.hero.dodgeWait - dt);
    this.hero.hurtLeft = Math.max(0, this.hero.hurtLeft - dt);
    this.hero.hurtFlash = Math.max(0, this.hero.hurtFlash - dt);
    this.hero.regenDelay = Math.max(0, this.hero.regenDelay - dt);
    this.hero.healWait = Math.max(0, this.hero.healWait - dt);
    this.hero.slowed = Math.max(0, this.hero.slowed - dt);
    const weapon = this.combat.currentAttackSpec();
    if (this.hero.attackTime >= 0) {
      this.hero.attackTime += dt;
      if (this.hero.attackTime >= weapon.duration) {
        this.hero.attackTime = -1;
        this.hero.activeSkill = null;
        this.hero.counterStrike = false;
      }
    }
    if (this.hero.regenDelay <= 0 && this.hero.attackTime < 0 && this.hero.dodgeLeft === 0)
      this.hero.stamina = Math.min(
        stats(this.journey.profile).maxStamina,
        this.hero.stamina + stats(this.journey.profile).staminaRegen * dt,
      );
    this.player.updateAim();
    if (this.ui.keys.J.isDown || this.ui.mouseHeld) this.combat.attack();
    if (
      Phaser.Input.Keyboard.JustDown(this.ui.keys.SPACE) ||
      Phaser.Input.Keyboard.JustDown(this.ui.keys.SHIFT)
    )
      this.player.dodge();
    if (Phaser.Input.Keyboard.JustDown(this.ui.keys.C)) this.combat.parry();
    for (const [i, key] of ['ONE', 'TWO', 'THREE'].entries())
      if (Phaser.Input.Keyboard.JustDown(this.ui.keys[key])) this.combat.useSkill(i + 1);
    if (Phaser.Input.Keyboard.JustDown(this.ui.keys.Q)) this.player.heal();
    if (Phaser.Input.Keyboard.JustDown(this.ui.keys.V)) this.player.heal(true);
    if (Phaser.Input.Keyboard.JustDown(this.ui.keys.R)) this.combat.useUltimate();
    if (Phaser.Input.Keyboard.JustDown(this.ui.keys.E)) this.village.interact();
    if (this.ui.state !== 'playing') return;
    this.player.movePlayer(dt);
    this.player.updateAim();
    if (this.worldState.area === 'biome') this.weather.updateWeather(dt);
    if (
      this.worldState.area === 'biome' &&
      !p.spawned &&
      p.elapsed >= REGIONS[this.worldState.regionIndex].bossTime
    )
      this.enemies.spawnBoss();
    this.enemies.updateWaves(dt);
    this.enemies.updateEnemies(dt);
    this.effects.updateHazards(dt);
    this.effects.updateProjectiles(dt);
    this.combat.resolveAttack();
    this.combat.updateUltimate(dt);
    this.economy.collectCoins();
    this.quests.updateWisp(dt);
    if (this.ui.state !== 'playing') return;
    if (this.worldState.area === 'tutorial') {
      if (this.journey.lessonIndex === 0 && this.visuals.player.x > 285)
        this.tutorial.lessonEvent('move');
      if (this.journey.tutorialFinished) {
        this.tutorial.finishTutorial();
        return;
      }
    }
    this.world.checkProgress();
    this.village.updateCamp();
    this.actors.drawActors();
    this.actors.drawGates();
    this.ui.hudLeft -= dt;
    if (this.ui.hudLeft <= 0) {
      this.menu.updateHUD();
      this.ui.hudLeft = 0.09;
    }
  }
}
