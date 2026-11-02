import Phaser from 'phaser';
import {
  BRIEFING_CARDS,
  LESSON_CUES,
  LESSONS,
  TUTORIAL_CONFIG,
  TUTORIAL_KEY_NAMES,
  ULTIMATE_MAX,
} from '../Constants';
import { stats } from '../combat/CombatRules';
import { type GameScene } from '../GameScene';
import { type Point } from '../world/Navigation';
import { regionStart } from '../world/WorldLayout';
import { trainingCoinPoints, trainingEnemyParameters } from './TrainingEnemyRules';
import { lessonPoint } from './TutorialLayout';

/** Вводные карточки, практические уроки и подсказки обучения. */
export class TutorialSystem {
  constructor(private readonly context: GameScene) {}
  trainingArea(): boolean {
    const { worldState } = this.context;
    return (
      worldState.area === 'tutorial' ||
      (worldState.area === 'interior' && worldState.interiorReturn === 'tutorial')
    );
  }
  renderBriefing(): void {
    const { ui } = this.context;
    const card = BRIEFING_CARDS[ui.briefingPage];
    this.context.element('briefing-icon').textContent = card.icon;
    this.context.element('briefing-title').textContent = card.title;
    this.context.element('briefing-text').textContent = card.text;
    this.context.element('briefing-page').textContent =
      `${ui.briefingPage + 1} / ${BRIEFING_CARDS.length}`;
    this.context.element('briefing-next').textContent =
      ui.briefingPage === BRIEFING_CARDS.length - 1 ? 'Начать практику ↗' : 'Следующая карточка ↗';
  }
  startLessons(): void {
    this.context.element('briefing-overlay').hidden = true;
    this.context.flow.transitionTo('playing');
    this.context.element('training-panel').hidden = false;
    this.prepareLesson();
    this.renderLesson();
    this.context.world.reachCheckpoint('Учебный двор Бруна');
    this.context.menu.syncGuide();
    this.context.hud.updateHUD();
  }
  teachingPoint(): Point | null {
    const { worldState, journey, visuals } = this.context;
    const h = worldState.houses.find((h) => h.village === -1 && h.role === 'smith')!;
    const npc = worldState.villagers.find((n) => n.village === -1 && n.role === 'smith')!.sprite;
    if (worldState.area === 'interior' && journey.lessonIndex === TUTORIAL_CONFIG.finalLesson) {
      return { x: h.x, y: h.y + 120 };
    }
    return lessonPoint(
      journey.lessonIndex,
      visuals.player,
      worldState.coins.map((c) => c.sprite),
      worldState.enemies.filter((e) => e.training && !e.dead).map((e) => e.sprite),
      h.door,
      npc,
      worldState.area === 'interior',
    );
  }
  drawTeachingCue(g: Phaser.GameObjects.Graphics): void {
    const { worldState, journey, visuals } = this.context;
    const training =
      this.trainingArea() && !journey.tutorialFinished && this.context.flow.state === 'playing';
    const route =
      worldState.area === 'village' &&
      worldState.villageIndex === -1 &&
      journey.progress[0].elapsed === 0 &&
      this.context.flow.state === 'playing';
    const target = training
      ? this.teachingPoint()
      : route
        ? { x: regionStart(0) + 55, y: 550 }
        : null;
    if (!target) {
      return;
    }
    const dx = target.x - visuals.player.x;
    const dy = target.y - visuals.player.y;
    const d = Math.hypot(dx, dy) || 1;
    const pulse = Math.sin(visuals.animationTime * 5) * 3;
    g.lineStyle(3, 0xead394, 0.85);
    g.strokeCircle(target.x, target.y, 27 + pulse);
    if (d > 60) {
      const a = Math.atan2(dy, dx);
      const x = visuals.player.x + (dx / d) * 65;
      const y = visuals.player.y + (dy / d) * 65;
      g.fillStyle(0xffdc91, 0.85);
      g.fillTriangle(
        x + Math.cos(a) * 12,
        y + Math.sin(a) * 12,
        x + Math.cos(a + 2.4) * 9,
        y + Math.sin(a + 2.4) * 9,
        x + Math.cos(a - 2.4) * 9,
        y + Math.sin(a - 2.4) * 9,
      );
    }
  }
  updateTeachingUI(): void {
    const { worldState, journey, ui } = this.context;
    const training = this.trainingArea() && !journey.tutorialFinished;
    const cue = LESSON_CUES[Math.min(journey.lessonIndex, LESSON_CUES.length - 1)];
    const wanted = new Set<Element>();
    if (training && cue.selector) {
      for (const element of document.querySelectorAll(cue.selector)) {
        wanted.add(element);
      }
    }
    if (
      training &&
      worldState.area === 'interior' &&
      journey.lessonIndex === TUTORIAL_CONFIG.finalLesson
    ) {
      wanted.add(this.context.element('interact-button'));
    }
    for (const element of document.querySelectorAll('.teaching-highlight')) {
      if (!wanted.has(element)) {
        element.classList.remove('teaching-highlight');
      }
    }
    for (const element of wanted) {
      element.classList.add('teaching-highlight');
    }
    const panel = this.context.element('training-panel');
    panel.hidden = !training;
    panel.classList.toggle('training-in-menu', this.context.flow.state !== 'playing');
    for (const key of this.context
      .element('lesson-keys')
      .querySelectorAll<HTMLElement>('[data-key]')) {
      const name = key.dataset.key!;
      const mapped: Record<string, string> = TUTORIAL_KEY_NAMES;
      key.classList.toggle(
        'pressed',
        ui.keys?.[mapped[name] ?? name]?.isDown === true || (name === 'ЛКМ' && ui.mouseHeld),
      );
    }
    const route = this.context.element('route-marker');
    const show =
      this.context.flow.state === 'playing' &&
      worldState.area === 'village' &&
      worldState.villageIndex === -1 &&
      journey.progress[0].elapsed === 0;
    route.hidden = !show;
    if (show) {
      const view = this.context.cameras.main.worldView;
      const x = (regionStart(0) + 55 - view.x) * this.context.cameras.main.zoom;
      const y = (550 - view.y) * this.context.cameras.main.zoom;
      route.style.left = `${Math.max(60, Math.min(this.context.scale.width - 100, x))}px`;
      route.style.top = `${Math.max(105, Math.min(this.context.scale.height - 110, y))}px`;
    }
  }
  beginTutorial(): void {
    const { hero, worldState, journey, ui, visuals } = this.context;
    worldState.area = 'tutorial';
    worldState.villageIndex = -1;
    visuals.player.setPosition(200, 550);
    hero.armed = false;
    journey.profile.blade = false;
    journey.progress[0].coins = 0;
    this.context.flow.transitionTo('playing');
    ui.briefingPage = 0;
    journey.lessonIndex = 0;
    journey.lessonProgress = 0;
    this.context.element('training-panel').hidden = true;
    worldState.interiorReturn = 'tutorial';
    this.context.menu.toggleGuide(true);
    this.context.element('briefing-overlay').hidden = true;
    this.startLessons();
    this.context.hud.updateHUD();
  }
  lessonEvent(event: string): void {
    const { journey } = this.context;
    if (
      !this.trainingArea() ||
      journey.tutorialFinished ||
      LESSONS[journey.lessonIndex]?.event !== event
    ) {
      return;
    }
    journey.lessonProgress++;
    if (journey.lessonProgress >= LESSONS[journey.lessonIndex].target) {
      journey.lessonIndex++;
      journey.lessonProgress = 0;
      if (journey.lessonIndex >= LESSONS.length) {
        journey.tutorialFinished = true;
        return;
      }
      this.prepareLesson();
    }
    this.renderLesson();
  }
  prepareLesson(): void {
    const { hero, worldState, journey } = this.context;
    if (journey.lessonIndex === TUTORIAL_CONFIG.coinLesson) {
      for (const point of trainingCoinPoints()) {
        this.context.economy.spawnCoin(0, false, point);
      }
    }
    if (journey.lessonIndex === TUTORIAL_CONFIG.attackLesson) {
      const e = this.context.enemies.spawnEnemy('skeleton', 0, 0, {
        x: 640,
        y: 550,
      });
      e.training = true;
      Object.assign(e, trainingEnemyParameters(journey.lessonIndex));
      e.hp = e.maxHP;
    }
    if (journey.lessonIndex === TUTORIAL_CONFIG.parryLesson) {
      const e = worldState.enemies.find((e) => e.training && !e.dead);
      if (e) {
        Object.assign(e, trainingEnemyParameters(journey.lessonIndex));
        e.mode = 'chase';
      }
    }
    if (journey.lessonIndex === TUTORIAL_CONFIG.dodgeLesson) {
      const e = worldState.enemies.find((e) => e.training && !e.dead);
      if (e) {
        Object.assign(e, trainingEnemyParameters(journey.lessonIndex));
      }
    }
    if (journey.lessonIndex === TUTORIAL_CONFIG.healLesson) {
      hero.hp = Math.max(1, hero.hp - TUTORIAL_CONFIG.trainingWound);
      this.context.menu.toast('Учебная рана. Используй Q, чтобы выпить флягу.');
    }
    if (journey.lessonIndex === TUTORIAL_CONFIG.ultimateLesson) {
      hero.ultimate = ULTIMATE_MAX;
    }
    if (journey.lessonIndex === TUTORIAL_CONFIG.finalLesson) {
      for (const e of worldState.enemies) {
        this.context.tweens.killTweensOf(e.sprite);
        e.sprite.destroy();
        e.shadow.destroy();
      }
      worldState.enemies = [];
      hero.hp = stats(journey.profile).maxHP;
      hero.stamina = stats(journey.profile).maxStamina;
      for (const point of [
        { x: 650, y: 760 },
        { x: 720, y: 530 },
      ]) {
        const e = this.context.enemies.spawnEnemy('skeleton', 0, 0, point);
        e.training = true;
        Object.assign(e, trainingEnemyParameters(journey.lessonIndex));
        e.hp = e.maxHP;
      }
    }
  }
  renderLesson(): void {
    const { worldState, journey } = this.context;
    const lesson = LESSONS[Math.min(journey.lessonIndex, LESSONS.length - 1)];
    this.context.element('lesson-title').textContent =
      `${journey.lessonIndex + 1}/${LESSONS.length} · ${lesson.title}`;
    this.context.element('lesson-hint').textContent =
      `${worldState.area === 'interior' && journey.lessonIndex === TUTORIAL_CONFIG.finalLesson ? 'Сначала выйди через дверь внизу на E. ' : ''}${lesson.hint} ${lesson.target > 1 ? `(${journey.lessonProgress}/${lesson.target})` : ''}`;
    const cue = LESSON_CUES[Math.min(journey.lessonIndex, LESSON_CUES.length - 1)];
    this.context.element('lesson-keys').innerHTML = (
      worldState.area === 'interior' && journey.lessonIndex === TUTORIAL_CONFIG.finalLesson
        ? ['E']
        : cue.keys
    )
      .map((key) => `<kbd data-key="${key}">${key}</kbd>`)
      .join('');
    this.context.element('lesson-target').textContent = cue.label;
    this.updateTeachingUI();
  }
  finishTutorial(): void {
    const { worldState, journey } = this.context;
    journey.tutorialFinished = true;
    journey.lessonIndex = LESSONS.length;
    this.context.achievements.syncAchievements();
    this.context.village.clearInterior();
    this.context.element('training-panel').hidden = true;
    for (const e of worldState.enemies.filter((e) => e.training)) {
      this.context.tweens.killTweensOf(e.sprite);
      e.sprite.destroy();
      e.shadow.destroy();
    }
    worldState.enemies = worldState.enemies.filter((e) => !e.training);
    for (const c of worldState.coins) {
      c.sprite.destroy();
    }
    worldState.coins = [];
    journey.profile.coins = 0;
    journey.progress[0].coins = 0;
    this.context.world.startVillage(-1, true);
    worldState.interiorReturn = 'village';
    this.updateTeachingUI();
    this.context.menu.toast(
      'Обучение завершено. Ты в безопасной деревне. Осмотрись, открой карту M и иди по указателю на восток к роще.',
    );
  }
  updateProgress(): boolean {
    const { worldState, journey, visuals } = this.context;
    if (worldState.area !== 'tutorial') {
      return false;
    }
    if (journey.lessonIndex === 0 && visuals.player.x > TUTORIAL_CONFIG.movementGoalX) {
      this.lessonEvent('move');
    }
    if (!journey.tutorialFinished) {
      return false;
    }
    this.finishTutorial();
    return true;
  }
}
