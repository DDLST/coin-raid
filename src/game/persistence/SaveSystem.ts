import {
  GAME_CONFIG,
  LEGACY_KEYS,
  LESSONS,
  PROFILE_KEY,
  REGIONS,
  TUTORIAL_CONFIG,
} from '../Constants';
import { stats } from '../combat/CombatRules';
import { type GameScene } from '../GameScene';
import { trainingEnemyParameters } from '../story/TrainingEnemyRules';
import { clampPoint } from '../world/Navigation';
import { villagePosition } from '../world/WorldLayout';
import { parseSave, type Snapshot } from './SaveSchema';

/** Ручная запись, загрузка и отображение состояния сохранения. */
export class SaveSystem {
  constructor(private readonly context: GameScene) {}
  initialize(): void {
    const { journey } = this.context;
    try {
      for (const key of LEGACY_KEYS) {
        localStorage.removeItem(key);
      }
      journey.saved = parseSave(localStorage.getItem(PROFILE_KEY));
    } catch {
      journey.storageAvailable = false;
    }
  }
  refreshSaveUI(): void {
    const { journey } = this.context;
    this.context.element<HTMLButtonElement>('load-button').disabled = !journey.saved;
    this.context.element('load-start').hidden = true;
    this.context.element('save-status').textContent = !journey.storageAvailable
      ? 'Браузер запретил сохранение.'
      : journey.saved
        ? `Ручное сохранение: ${new Date(journey.saved.savedAt).toLocaleString('ru-RU')}. Автосохранения нет.`
        : 'Автосохранения нет. Нажми «Сохранить прогресс», чтобы вернуться к этой попытке.';
  }
  snapshot(): Snapshot {
    const { hero, worldState, journey, visuals } = this.context;
    return {
      version: 7,
      manual: true,
      savedAt: new Date().toISOString(),
      profile: journey.profile,
      region: worldState.regionIndex,
      progress: journey.progress,
      player: {
        x: visuals.player.x,
        y: visuals.player.y,
      },
      checkpoint: journey.checkpoint,
      hp: hero.hp,
      stamina: hero.stamina,
      flasks: hero.flasks,
      armed: hero.armed,
      ultimate: hero.ultimate,
      elapsed: journey.elapsed,
      score: journey.score,
      kills: journey.kills,
      deaths: journey.deaths,
      enemies: worldState.enemies
        .filter((e) => !e.dead)
        .map((e) => ({
          kind: e.kind,
          region: e.region,
          x: e.sprite.x,
          y: e.sprite.y,
          hp: e.hp,
          phase2: e.phase2,
          variant: e.variant,
          training: e.training,
        })),
      coins: worldState.coins.map((c) => ({
        x: c.sprite.x,
        y: c.sprite.y,
        region: c.region,
      })),
      quests: journey.quests,
      chests: worldState.chests.map((c) => ({
        x: c.x,
        y: c.y,
        region: c.region,
        quest: c.quest,
        opened: c.opened,
      })),
      audio: { ...this.context.audio.settings },
      area: worldState.area,
      villageIndex: worldState.villageIndex,
      lastVillage: worldState.lastVillage,
      lesson: journey.lessonIndex,
      lessonProgress: journey.lessonProgress,
      lines: journey.lines,
      wisp: worldState.wisp
        ? {
            x: worldState.wisp.x,
            y: worldState.wisp.y,
          }
        : null,
      villages: [...journey.campVisits],
      deliveries: journey.deliveries,
      interiorRole: worldState.interiorRole,
      interiorReturn: worldState.interiorReturn,
      migrated: false,
    };
  }
  saveProgress(): void {
    const { journey } = this.context;
    if (
      this.context.flow.state !== 'menu' &&
      this.context.flow.state !== 'paused' &&
      this.context.flow.state !== 'won' &&
      this.context.flow.state !== 'confirm'
    ) {
      return;
    }
    try {
      const raw = JSON.stringify(this.snapshot());
      localStorage.setItem(PROFILE_KEY, raw);
      journey.saved = parseSave(raw);
      journey.storageAvailable = true;
      journey.dirty = false;
      this.refreshSaveUI();
      this.context.menu.toast('Прогресс сохранён вручную: биом, позиция, вещи, задания и сундуки.');
    } catch {
      journey.storageAvailable = false;
      this.refreshSaveUI();
      this.context.menu.toast('Сохранить не удалось: браузер запретил запись.');
    }
  }
  loadProgress(): void {
    const { hero, worldState, journey, ui, visuals } = this.context;
    ui.achievementQueue = [];
    ui.achievementLeft = 0;
    this.context.element('achievement-banner').hidden = true;
    let saved: Snapshot | null = null;
    try {
      saved = parseSave(localStorage.getItem(PROFILE_KEY));
    } catch {
      journey.storageAvailable = false;
    }
    if (!saved) {
      journey.saved = null;
      this.refreshSaveUI();
      this.context.menu.toast('Ручного сохранения нет или оно повреждено.');
      return;
    }
    this.context.audio.unlock();
    this.context.session.reset();
    journey.saved = saved;
    journey.profile = saved.profile;
    journey.progress = saved.progress;
    journey.quests = saved.quests;
    worldState.regionIndex = saved.region;
    worldState.area = saved.area;
    worldState.villageIndex = saved.villageIndex;
    worldState.lastVillage = saved.lastVillage;
    journey.lessonIndex = saved.lesson;
    journey.lessonProgress = saved.lessonProgress;
    journey.lines = saved.lines;
    journey.deliveries = saved.deliveries;
    worldState.interiorReturn = saved.interiorReturn;
    journey.dirty = false;
    hero.hp = Math.max(1, Math.min(stats(journey.profile).maxHP, saved.hp));
    hero.stamina = Math.min(stats(journey.profile).maxStamina, saved.stamina);
    hero.flasks = Math.min(stats(journey.profile).flasks, saved.flasks);
    hero.armed =
      saved.armed &&
      (worldState.area === 'village' ||
        (worldState.area === 'interior' && !this.context.tutorial.trainingArea()) ||
        journey.progress[saved.region].coins >=
          (worldState.area === 'tutorial'
            ? TUTORIAL_CONFIG.weaponCoins
            : REGIONS[saved.region].awaken));
    journey.profile.blade = hero.armed;
    hero.ultimate = saved.ultimate;
    journey.elapsed = saved.elapsed;
    journey.score = saved.score;
    journey.kills = saved.kills;
    journey.deaths = saved.deaths;
    journey.campVisits = new Set(saved.villages);
    this.context.scenery.ensureVillageArt(worldState.villageIndex);
    if (worldState.area === 'biome') {
      this.context.scenery.ensureRegionArt(worldState.regionIndex);
    }
    if (worldState.area === 'interior') {
      const h = worldState.houses.find(
        (h) => h.village === worldState.villageIndex && h.role === saved.interiorRole,
      );
      if (h) {
        this.context.village.enterHouse(h, true);
        worldState.interiorReturn = saved.interiorReturn;
      } else {
        worldState.area = 'village';
      }
    }
    const bounds = this.context.world.playerBounds();
    const at = clampPoint(saved.player, bounds);
    journey.checkpoint = {
      x: villagePosition(worldState.lastVillage).x + 15,
      y: 645,
    };
    visuals.player
      .setPosition(at.x, at.y)
      .setTexture(journey.profile.skin)
      .setAlpha(1)
      .clearTint()
      .setAngle(0);
    this.context.cameras.main.centerOn(at.x, at.y);
    for (const e of saved.enemies) {
      const enemy = this.context.enemies.spawnEnemy(e.kind, e.region, e.variant, {
        x: e.x,
        y: e.y,
      });
      enemy.phase2 = e.phase2;
      enemy.training = e.training;
      if (e.training) {
        Object.assign(enemy, trainingEnemyParameters(journey.lessonIndex, true));
      }
      enemy.hp = Math.min(enemy.maxHP, e.hp);
    }
    for (const c of saved.coins) {
      this.context.economy.spawnCoin(c.region, false, c);
    }
    for (const c of saved.chests) {
      this.context.loot.spawnChest(c);
    }
    const p = journey.progress[worldState.regionIndex];
    if (
      p.spawned &&
      !p.bossDead &&
      !worldState.enemies.some((e) => e.region === worldState.regionIndex && e.kind === 'boss')
    ) {
      p.spawned = false;
    }
    hero.hurtLeft = GAME_CONFIG.loadProtection;
    this.context.audio.setSettings(saved.audio);
    this.context.audio.setRegion(worldState.regionIndex);
    this.context.flow.transitionTo('playing');
    this.context.world.configureCamera();
    this.context.element('training-panel').hidden = !this.context.tutorial.trainingArea();
    if (this.context.tutorial.trainingArea()) {
      this.context.tutorial.renderLesson();
    }
    this.context.quests.makeQuestProps(saved.wisp);
    ui.guideWanted = true;
    this.context.menu.syncGuide();
    journey.dirty = false;
    this.context.actors.drawGates();
    this.context.actors.drawActors();
    this.context.hud.updateHUD();
    this.refreshSaveUI();
    if (journey.progress.every((v) => v.cleared)) {
      this.context.flow.transitionTo('won');
      this.context.menu.showModal(
        'СЕМЬЯ СПАСЕНА',
        'Дом снова ждёт тебя.',
        'Печати разорваны. Очищенные земли и деревни доступны для исследования.',
        'Исследовать очищенный мир',
        false,
      );
      this.context.menu.showStats();
      this.context.element('modal-save').hidden = false;
    }
    journey.tutorialFinished = journey.lessonIndex >= LESSONS.length;
    this.context.tutorial.updateTeachingUI();
    this.context.achievements.syncAchievements(false);
    this.context.menu.toast(
      saved.migrated
        ? 'Сохранение v6 перенесено в расширенный мир. Для записи обновления нажми «Сохранить прогресс».'
        : 'Загружено ручное сохранение.',
    );
  }
}
