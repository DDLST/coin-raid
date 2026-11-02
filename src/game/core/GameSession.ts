import { GAME_CONFIG } from '../Constants';
import { type GameScene } from '../GameScene';
import { advanceQuests } from '../quests/TrialRules';

/** Создание новой сессии и обновление времени путешествия. */
export class GameSession {
  constructor(private readonly context: GameScene) {}

  reset(): void {
    const { hero, journey, ui, worldState, flow } = this.context;
    this.context.world.clearActors();
    this.context.enemySpawner.reset();
    this.context.weather.resetWeather();
    this.context.controls.resetInput();
    hero.reset();
    journey.reset();
    this.context.menu.resetSession();
    this.context.music.reset();
    ui.resetSession();
    flow.reset();
    worldState.resetJourney();
  }

  advance(dt: number): void {
    const { journey, worldState, visuals } = this.context;
    journey.elapsed += dt;
    visuals.animationTime += dt;
    journey.dirty = true;
    if (worldState.area !== 'biome') {
      return;
    }
    const progress = journey.progress[worldState.regionIndex];
    if (!progress.cleared) {
      progress.elapsed += dt;
    }
    advanceQuests(journey.quests[worldState.regionIndex], dt);
  }

  updateMode(dt: number): void {
    switch (this.context.flow.state) {
      case 'story':
        this.context.story.updateStory(dt);
        break;
      case 'intro':
        this.context.story.updateIntro(dt);
        break;
      case 'dying':
        this.context.player.updateDeath(dt);
        break;
      case 'dialog':
        this.context.village.updateDialog(dt);
        break;
      case 'loot':
        this.context.loot.updateLoot(dt);
        break;
    }
  }

  updateHUD(dt: number): void {
    const { ui } = this.context;
    ui.hudLeft -= dt;
    if (ui.hudLeft > 0) {
      return;
    }
    this.context.hud.updateHUD();
    ui.hudLeft = GAME_CONFIG.hudInterval;
  }
}
