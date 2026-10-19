import { type Bounds, type Terrain, type Point, freePoint, clampPoint } from './Navigation';
import {
  regionEnd,
  WORLD_HEIGHT,
  regionStart,
  PROLOGUE_WIDTH,
  WORLD_WIDTH,
  ROAD_WIDTH,
  REGIONS,
  villagePosition,
  VILLAGE_NAMES,
} from './WorldConfig';
import { interiorBounds, housePoint, interiorObstacles } from '../village/VillageLayout';
import Phaser from 'phaser';
import { WAVE_FIRST } from '../enemies/EnemyConfig';
import { newQuests } from '../quests/TrialsAndLoot';
import { stats } from '../combat/CombatRules';
import type { GameScene } from '../GameScene';

/** Границы, переходы между областями, камера, контрольные точки и возрождение. */
export class WorldSystem {
  constructor(private readonly context: GameScene) {}
  regionBounds(index: number): Bounds {
    return {
      width: regionEnd(index),
      height: WORLD_HEIGHT,
      margin: 35,
      top: 65,
      left: regionStart(index) + 35,
    };
  }
  playerBounds(): Bounds {
    const { worldState, journey } = this.context;
    if (worldState.area === 'interior')
      return interiorBounds(
        housePoint(worldState.villageIndex, worldState.interiorRole ?? 'smith'),
      );
    if (worldState.area !== 'biome')
      return {
        width:
          worldState.area === 'tutorial'
            ? PROLOGUE_WIDTH - 20
            : regionStart(worldState.villageIndex + 1) + 100,
        height: WORLD_HEIGHT,
        margin: 35,
        top: 65,
        left:
          worldState.villageIndex < 0
            ? 35
            : journey.progress[worldState.villageIndex]?.cleared
              ? regionEnd(worldState.villageIndex) - 140
              : regionEnd(worldState.villageIndex) + 25,
      };
    const p = journey.progress[worldState.regionIndex];
    return {
      width: p.cleared
        ? Math.min(WORLD_WIDTH, regionEnd(worldState.regionIndex) + ROAD_WIDTH + 105)
        : regionEnd(worldState.regionIndex),
      height: WORLD_HEIGHT,
      margin: 35,
      top: 65,
      left: p.bossDead
        ? worldState.regionIndex === 0
          ? 35
          : regionEnd(worldState.regionIndex - 1) + 25
        : regionStart(worldState.regionIndex) + 35,
    };
  }
  activeTerrain(): Terrain[] {
    const { worldState } = this.context;
    return worldState.area === 'interior'
      ? interiorObstacles(housePoint(worldState.villageIndex, worldState.interiorRole ?? 'smith'))
      : worldState.terrain;
  }
  configureCamera(): void {
    const { worldState, visuals } = this.context;
    const cam = this.context.cameras.main;
    cam.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    cam.setZoom(
      worldState.area === 'interior'
        ? Math.min(1.7, this.context.scale.height / 430)
        : Math.max(
            this.context.scale.width < 700 ? 0.82 : 1,
            this.context.scale.height / WORLD_HEIGHT,
          ),
    );
    if (worldState.area === 'interior') {
      const at = housePoint(worldState.villageIndex, worldState.interiorRole ?? 'smith');
      cam.stopFollow();
      cam.centerOn(at.x, at.y + 5);
    } else if (visuals.player) cam.startFollow(visuals.player, true, 0.11, 0.11);
    this.context.menu.setGuideText();
  }
  freePosition(index: number, radius: number, away = 0): Point {
    const { worldState, visuals } = this.context;
    const bounds = this.regionBounds(index),
      terrain = worldState.terrainByRegion[index];
    for (let n = 0; n < 100; n++) {
      const point = {
        x: Phaser.Math.FloatBetween(regionStart(index) + 110, regionEnd(index) - 105),
        y: Phaser.Math.FloatBetween(140, WORLD_HEIGHT - 130),
      };
      if (
        freePoint(point, radius + 8, terrain, bounds) &&
        Math.hypot(point.x - visuals.player.x, point.y - visuals.player.y) > away
      )
        return point;
    }
    const grid = radius > 25 ? worldState.bossNav[index] : worldState.nav[index];
    const id = grid.free.findIndex(Boolean);
    return {
      x: grid.originX + ((id % grid.cols) + 0.5) * grid.cell,
      y: (Math.floor(id / grid.cols) + 0.5) * grid.cell,
    };
  }
  clearActors(): void {
    const { hero, worldState, visuals } = this.context;
    this.context.story.clearReaper();
    this.context.actors.hideArms();
    visuals.weaponTrail = [];
    for (const image of visuals.attackImages) image.setVisible(false);
    this.context.village.clearInterior();
    hero.counterTarget = -1;
    hero.counterLeft = 0;
    hero.counterStrike = false;
    hero.activeSkill = null;
    hero.skillCooldowns = {};
    hero.shieldLeft = 0;
    for (const q of worldState.questProps) q.sprite.destroy();
    worldState.questProps = [];
    worldState.wisp?.destroy();
    worldState.wisp = null;
    visuals.effects = [];
    for (const e of worldState.enemies) {
      this.context.tweens.killTweensOf(e.sprite);
      e.sprite.destroy();
      e.shadow.destroy();
    }
    for (const c of worldState.coins) c.sprite.destroy();
    for (const c of worldState.chests) c.sprite.destroy();
    worldState.enemies = [];
    worldState.coins = [];
    worldState.chests = [];
    worldState.projectiles = [];
    worldState.hazards = [];
    hero.ultimateLeft = 0;
  }
  startRegion(index: number, respawn = false, preserve = false): void {
    const { hero, worldState, journey, ui, visuals } = this.context;
    this.context.village.clearInterior();
    this.context.scenery.ensureRegionArt(index);
    this.context.bosses.resetBossCountdown();
    worldState.area = 'biome';
    worldState.regionIndex = index;
    this.configureCamera();
    journey.waveClock = WAVE_FIRST;
    journey.waveNumber = 0;
    journey.combatMusicLeft = 0;
    this.context.element('training-panel').hidden = true;
    this.context.tutorial.updateTeachingUI();
    if (!preserve) {
      journey.progress[index] = {
        coins: 0,
        elapsed: 0,
        spawned: false,
        bossDead: false,
        cleared: false,
        income: journey.progress[index]?.income ?? 0,
        rewarded: journey.progress[index]?.rewarded ?? false,
      };
      const old = journey.quests[index];
      journey.quests[index] = newQuests(index).map(
        (q) => old?.find((v) => v.id === q.id && v.complete) ?? q,
      );
      for (const e of worldState.enemies.filter((e) => e.region === index)) {
        this.context.tweens.killTweensOf(e.sprite);
        e.sprite.destroy();
        e.shadow.destroy();
      }
      worldState.enemies = worldState.enemies.filter((e) => e.region !== index);
      for (const c of worldState.coins.filter((c) => c.region === index)) c.sprite.destroy();
      worldState.coins = worldState.coins.filter((c) => c.region !== index);
      for (const group of REGIONS[index].roster)
        for (let n = 0; n < group.count; n++) this.context.enemies.spawnEnemy(group.kind, index, n);
      for (let n = 0; n < 7; n++) this.context.economy.spawnCoin(index, n === 0);
    }
    worldState.projectiles = [];
    worldState.hazards = [];
    visuals.effects = [];
    hero.guardLeft = 0;
    hero.counterLeft = 0;
    hero.counterTarget = -1;
    hero.counterStrike = false;
    hero.activeSkill = null;
    hero.shieldLeft = 0;
    hero.combo = 0;
    hero.lastAttack = journey.elapsed - 10;
    hero.healWait = 0;
    hero.regenDelay = 0;
    this.context.weather.resetWeather();
    this.context.controls.resetInput();
    ui.mouse = null;
    hero.attackTime = -1;
    hero.ultimateLeft = 0;
    hero.ultimate = 0;
    hero.dodgeLeft = 0;
    hero.dodgeWait = 0;
    hero.hurtLeft = 2;
    hero.hurtFlash = 0;
    hero.face = 0;
    hero.movement = { x: 1, y: 0 };
    hero.armed = preserve && journey.progress[index].coins >= REGIONS[index].awaken;
    journey.profile.blade = hero.armed;
    visuals.player
      .setTexture(journey.profile.skin)
      .setAlpha(1)
      .clearTint()
      .setAngle(0)
      .setScale(72 / 128)
      .setFlipX(false);
    if (respawn) visuals.player.setPosition(regionStart(index) + 100, 588);
    const at = clampPoint(visuals.player, this.playerBounds());
    visuals.player.setPosition(at.x, at.y);
    this.context.cameras.main.centerOn(at.x, at.y);
    ui.state = 'playing';
    this.context.audio.setRegion(index);
    this.context.quests.makeQuestProps();
    this.context.actors.drawGates();
    this.context.actors.drawActors();
    this.context.menu.updateHUD();
    if (!respawn && !preserve) this.context.story.beginIntro(true);
  }
  reachCheckpoint(name: string): void {
    const { ui } = this.context;
    this.context.element('checkpoint-name').textContent = name;
    this.context.element('checkpoint-banner').hidden = false;
    ui.checkpointBannerLeft = 2.7;
    this.context.audio.play('checkpoint');
  }
  respawn(): void {
    const { hero, worldState, journey, ui, visuals } = this.context;
    const index = worldState.regionIndex,
      done = { ...journey.progress[index] },
      tutorial = worldState.area === 'tutorial';
    if (tutorial) {
      hero.hp = stats(journey.profile).maxHP;
      visuals.player.setPosition(210, 550);
      ui.state = 'playing';
      visuals.player.setAlpha(1).setAngle(0);
      hero.hurtLeft = 2;
      this.context.menu.toast('Учебный костёр вернул тебя. Продолжай текущий урок.');
      return;
    }
    if (!done.cleared) {
      this.context.quests.resetAttemptRewards(index);
      this.startRegion(index, true);
    } else journey.progress[index] = done;
    this.startVillage(worldState.lastVillage, true);
    this.context.quests.syncAchievements();
    this.context.menu.toast(
      'Ты вернулся в последнюю посещённую деревню. Купи снаряжение или поговори с лекарем перед новой попыткой.',
    );
  }
  checkProgress(): void {
    const { worldState, journey, visuals } = this.context;
    if (worldState.area === 'tutorial' || worldState.area === 'interior') return;
    if (worldState.area === 'village') {
      if (
        worldState.villageIndex >= 0 &&
        journey.progress[worldState.villageIndex].cleared &&
        visuals.player.x < regionEnd(worldState.villageIndex) - 45
      ) {
        this.startRegion(worldState.villageIndex, false, true);
        return;
      }
      const next = worldState.villageIndex + 1;
      if (next < REGIONS.length && visuals.player.x >= regionStart(next) + 45) {
        const p = journey.progress[next];
        this.startRegion(next, false, p.elapsed > 0 || p.bossDead);
      }
      return;
    }
    const p = journey.progress[worldState.regionIndex];
    if (!p.cleared && p.coins >= REGIONS[worldState.regionIndex].coins && p.bossDead) {
      p.cleared = true;
      this.context.scenery.ensureVillageArt(worldState.regionIndex);
      this.context.weather.resetWeather();
      this.context.actors.drawGates();
      if (worldState.regionIndex === REGIONS.length - 1) {
        this.context.story.beginStory(true);
        return;
      }
      this.context.menu.toast(
        'Печать разорвана. Иди на восток в деревню: там ждут кузнец, бронница, лекарь и странник.',
      );
    }
    if (
      p.cleared &&
      worldState.regionIndex < REGIONS.length - 1 &&
      visuals.player.x >= regionEnd(worldState.regionIndex) + 70
    ) {
      this.startVillage(worldState.regionIndex);
      return;
    }
    if (p.bossDead && visuals.player.x < regionStart(worldState.regionIndex) - 55)
      this.startVillage(worldState.regionIndex - 1);
  }
  startVillage(index: number, revive = false): void {
    const { hero, worldState, journey, ui, visuals } = this.context;
    this.context.village.clearInterior();
    this.context.scenery.ensureVillageArt(index);
    this.context.bosses.resetBossCountdown();
    worldState.area = 'village';
    worldState.villageIndex = index;
    worldState.lastVillage = index;
    worldState.regionIndex = Math.min(REGIONS.length - 1, index + 1);
    ui.state = 'playing';
    hero.armed = true;
    journey.profile.blade = true;
    worldState.projectiles = [];
    worldState.hazards = [];
    hero.attackTime = -1;
    hero.ultimateLeft = 0;
    hero.guardLeft = 0;
    hero.counterLeft = 0;
    hero.counterTarget = -1;
    hero.counterStrike = false;
    hero.activeSkill = null;
    hero.shieldLeft = 0;
    this.context.weather.resetWeather();
    this.context.controls.resetInput();
    visuals.sword.setVisible(true);
    this.context.element('training-panel').hidden = true;
    worldState.wisp?.setVisible(false);
    const center = villagePosition(index);
    journey.checkpoint = { x: center.x + 15, y: center.y + 95 };
    if (revive) {
      visuals.player
        .setPosition(journey.checkpoint.x, journey.checkpoint.y)
        .setAlpha(1)
        .setAngle(0)
        .clearTint();
      hero.hp = stats(journey.profile).maxHP;
      hero.stamina = stats(journey.profile).maxStamina;
      hero.flasks = stats(journey.profile).flasks;
      hero.hurtLeft = 2;
    }
    if (!journey.campVisits.has(index)) {
      journey.campVisits.add(index);
      hero.hp = stats(journey.profile).maxHP;
      hero.stamina = stats(journey.profile).maxStamina;
      hero.flasks = stats(journey.profile).flasks;
      this.reachCheckpoint(VILLAGE_NAMES[index + 1]);
    } else if (revive) this.reachCheckpoint(`Возрождение · ${VILLAGE_NAMES[index + 1]}`);
    this.context.audio.setRegion(worldState.regionIndex);
    this.configureCamera();
    this.context.cameras.main.centerOn(visuals.player.x, visuals.player.y);
    this.context.menu.syncGuide();
    this.context.actors.drawGates();
    this.context.actors.drawActors();
    this.context.menu.updateHUD();
  }
  freeNear(at: Point): Point {
    const { worldState } = this.context;
    const terrain = worldState.terrainByRegion[worldState.regionIndex],
      bounds = this.regionBounds(worldState.regionIndex);
    if (freePoint(at, 25, terrain, bounds)) return at;
    const grid = worldState.nav[worldState.regionIndex];
    let result = at,
      distance = Infinity;
    grid.free.forEach((free, i) => {
      if (!free) return;
      const p = {
          x: grid.originX + ((i % grid.cols) + 0.5) * grid.cell,
          y: (Math.floor(i / grid.cols) + 0.5) * grid.cell,
        },
        d = Phaser.Math.Distance.Between(at.x, at.y, p.x, p.y);
      if (d < distance) {
        distance = d;
        result = p;
      }
    });
    return result;
  }
}
