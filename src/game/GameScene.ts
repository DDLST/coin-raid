import Phaser from 'phaser';
import { GAME_CONFIG } from './Constants';
import { AudioDirector } from './audio/AudioDirector';
import { ForestAudio } from './audio/GameAudio';
import { CombatSystem } from './combat/CombatSystem';
import { HazardSystem } from './combat/HazardSystem';
import { ProjectileSystem } from './combat/ProjectileSystem';
import { UltimateSystem } from './combat/UltimateSystem';
import { BossAwakeningSystem } from './core/BossAwakeningSystem';
import { GameSession } from './core/GameSession';
import { GameStateSystem } from './core/GameStateSystem';
import { JourneyState } from './core/JourneyState';
import { EconomySystem } from './economy/EconomySystem';
import { BossSystem } from './enemies/BossSystem';
import { EnemyAttackSystem } from './enemies/EnemyAttackSystem';
import { EnemyDefeatSystem } from './enemies/EnemyDefeatSystem';
import { EnemySpawnSystem } from './enemies/EnemySpawnSystem';
import { EnemySystem } from './enemies/EnemySystem';
import { SaveSystem } from './persistence/SaveSystem';
import { PlayerController } from './player/PlayerController';
import { PlayerState } from './player/PlayerState';
import { AchievementSystem } from './quests/AchievementSystem';
import { LootSystem } from './quests/LootSystem';
import { QuestSystem } from './quests/QuestSystem';
import { ActorRenderer } from './rendering/ActorRenderer';
import { CombatEffectRenderer } from './rendering/CombatEffectRenderer';
import { RenderState } from './rendering/RenderState';
import { createSceneArtwork, preloadSceneArtwork } from './rendering/SceneArtwork';
import { StorySystem } from './story/StorySystem';
import { TutorialSystem } from './story/TutorialSystem';
import { HudController } from './ui/HudController';
import { InputController } from './ui/InputController';
import { InterfaceState } from './ui/InterfaceState';
import { MapController } from './ui/MapController';
import { MenuController } from './ui/MenuController';
import { VillageSystem } from './village/VillageSystem';
import { WeatherSystem } from './world/WeatherSystem';
import { WorldRenderer } from './world/WorldRenderer';
import { WorldState } from './world/WorldState';
import { WorldSystem } from './world/WorldSystem';

/** Связывает системы игры и задаёт порядок их обновления. */
export class GameScene extends Phaser.Scene {
  readonly session = new GameSession(this);
  readonly music = new AudioDirector(this);
  readonly bossAwakening = new BossAwakeningSystem(this);
  readonly enemySpawner = new EnemySpawnSystem(this);
  readonly flow = new GameStateSystem(() => this.syncWorldClock());
  readonly hero = new PlayerState();
  readonly worldState = new WorldState();
  readonly journey = new JourneyState();
  readonly ui = new InterfaceState();
  readonly visuals = new RenderState();
  readonly player = new PlayerController(this);
  readonly ultimate = new UltimateSystem(this);
  readonly defeats = new EnemyDefeatSystem(this);
  readonly enemyAttacks = new EnemyAttackSystem(this);
  readonly hud = new HudController(this);
  readonly combat = new CombatSystem(this);
  readonly projectiles = new ProjectileSystem(this);
  readonly hazards = new HazardSystem(this);
  readonly effects = new CombatEffectRenderer(this);
  readonly enemies = new EnemySystem(this);
  readonly bosses = new BossSystem(this);
  readonly world = new WorldSystem(this);
  readonly scenery = new WorldRenderer(this);
  readonly village = new VillageSystem(this);
  readonly economy = new EconomySystem(this);
  readonly achievements = new AchievementSystem(this);
  readonly loot = new LootSystem(this);
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
    preloadSceneArtwork(this);
  }
  create(): void {
    this.worldState.resetScene();
    this.visuals.resetScene();
    createSceneArtwork(this);
    this.saves.initialize();
    if (!this.input.keyboard) {
      throw new Error('Keyboard unavailable');
    }
    this.ui.keys = this.input.keyboard.addKeys(GAME_CONFIG.keys) as Record<
      string,
      Phaser.Input.Keyboard.Key
    >;
    this.controls.bindControls();
    this.world.configureCamera();
    if (this.initialTraining === null) {
      this.story.resetJourney();
      this.world.startVillage(-1, true);
      this.menu.showTitle();
    } else {
      this.story.newJourney(this.initialTraining);
    }
    this.saves.refreshSaveUI();
    this.scale.on('resize', this.world.configureCamera, this.world);
    this.events.once('shutdown', () => {
      this.controls.destroy();
      this.projectiles.reset();
      this.hazards.reset();
      this.effects.reset();
      this.scale.off('resize', this.world.configureCamera, this.world);
      clearTimeout(this.ui.toastTimeout);
      this.audio.destroy();
    });
  }
  element<T extends HTMLElement = HTMLElement>(id: string): T {
    const e = document.getElementById(id);
    if (!e) {
      throw new Error(`Missing UI: ${id}`);
    }
    return e as T;
  }
  seals(): number {
    return this.journey.progress.filter((p) => p.bossDead).length;
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(delta, GAME_CONFIG.maxFrameMs) / 1000;
    this.music.update(dt);
    this.menu.updateNotices(dt);
    this.tutorial.updateTeachingUI();
    this.bosses.updateBossCountdown(dt);
    if (this.controls.updateGlobal()) {
      return;
    }
    if (!this.flow.playing) {
      this.session.updateMode(dt);
      return;
    }
    this.session.advance(dt);
    this.player.updateTimers(dt);
    this.combat.updateTimers(dt);
    this.effects.updateEffects(dt);
    this.player.regenerateStamina(dt);
    this.player.updateAim();
    this.controls.updatePlaying();
    if (!this.flow.playing) {
      return;
    }
    this.player.movePlayer(dt);
    this.player.updateAim();
    if (this.worldState.area === 'biome') {
      this.weather.updateWeather(dt);
    }
    this.bossAwakening.update();
    this.enemySpawner.updateWaves(dt);
    this.enemies.updateEnemies(dt);
    this.hazards.update(dt);
    this.projectiles.update(dt);
    this.combat.resolveAttack();
    this.ultimate.updateUltimate(dt);
    this.economy.collectCoins();
    this.quests.updateWisp(dt);
    if (!this.flow.playing) {
      return;
    }
    if (this.tutorial.updateProgress()) {
      return;
    }
    this.world.checkProgress();
    this.village.updateCamp();
    this.actors.drawActors();
    this.actors.drawGates();
    this.session.updateHUD(dt);
  }
  private syncWorldClock(): void {
    if (this.flow.playing || this.flow.cinematic) {
      this.tweens.resumeAll();
    } else {
      this.tweens.pauseAll();
    }
  }
}
