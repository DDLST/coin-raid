import {
  INTRO_DURATION,
  WEAPON_BREAK_AT,
  WEAPON_STEAL_AT,
  newLines,
  newDeliveries,
  ENDING,
  OPENING,
} from './StoryContent';
import { weaponFor, newProfile } from '../progression/PlayerProgression';
import { WEAPON_ART, weaponTexture } from '../rendering/WeaponAnimation';
import { REGIONS, regionStart } from '../world/WorldConfig';
import Phaser from 'phaser';
import { newQuests } from '../quests/TrialsAndLoot';
import type { GameScene } from '../GameScene';

/** Новое путешествие, сюжетные сцены и похищение оружия. */
export class StorySystem {
  constructor(private readonly context: GameScene) {}
  newJourney(training = false): void {
    const { journey, ui } = this.context;
    this.context.audio.unlock();
    this.resetJourney();
    ui.guideWanted = true;
    journey.wantsTraining = training;
    journey.dirty = true;
    this.context.world.startVillage(-1, true);
    this.beginStory(false);
  }
  beginIntro(resume: boolean): void {
    const { hero, worldState, journey, ui, visuals } = this.context;
    this.context.audio.unlock();
    ui.state = 'intro';
    journey.introLeft = INTRO_DURATION;
    journey.introBroken = false;
    journey.introResume = resume;
    this.context.controls.resetInput();
    hero.armed = true;
    this.clearReaper();
    visuals.reaper
      .setVisible(true)
      .setAlpha(0)
      .setPosition(visuals.player.x + 270, visuals.player.y - 145);
    const w = weaponFor(journey.profile),
      art = WEAPON_ART[w.id];
    visuals.stolenWeapon
      .setTexture(weaponTexture(w.id))
      .clearTint()
      .setDisplaySize(art.size, art.size)
      .setOrigin(art.gripX, art.gripY);
    this.context.element('intro-overlay').hidden = false;
    this.context.menu.syncGuide();
    this.context.element('intro-tag').textContent = REGIONS[worldState.regionIndex].name;
    this.context.element('intro-title').textContent = resume
      ? 'Страж следующей печати.'
      : 'В тумане кто-то ждёт тебя.';
    this.context.element('intro-text').textContent =
      `${w.name} хранит твою память. Призрак печати пришёл разорвать её связь с оружием.`;
    ui.checkpointBannerLeft = 0;
    this.context.element('checkpoint-banner').hidden = true;
    this.context.audio.play('howl');
    this.context.actors.drawActors();
  }
  clearReaper(): void {
    const { visuals } = this.context;
    visuals.reaper?.setVisible(false).setAlpha(0);
    visuals.stolenWeapon?.setVisible(false);
    visuals.reaperInk?.clear();
  }
  updateIntro(dt: number): void {
    const { hero, worldState, journey, visuals } = this.context;
    journey.introLeft -= dt;
    visuals.animationTime += dt;
    const t = INTRO_DURATION - journey.introLeft;
    const approach = Math.min(1, t / 1.5),
      ease = 1 - (1 - approach) ** 3,
      leave = Math.max(0, t - 3.3);
    visuals.reaper
      .setPosition(
        visuals.player.x + 270 - 175 * ease + leave * 38,
        visuals.player.y - 145 + 85 * ease - leave * 28 + Math.sin(t * 4) * 7,
      )
      .setAlpha(Math.min(1, t / 0.65) * Math.max(0, 1 - leave / 2.7))
      .setRotation(Math.sin(t * 2) * 0.035);
    if (t >= WEAPON_BREAK_AT && !journey.introBroken) {
      journey.introBroken = true;
      hero.armed = false;
      journey.profile.blade = false;
      visuals.stolenWeapon.setVisible(false);
      this.context.audio.play('crack');
      this.context.cameras.main.shake(240, 0.005);
      this.context.effects.particles(visuals.reaper.x + 43, visuals.reaper.y - 24, 32, 0xa6eaf1);
      this.context.element('intro-title').textContent = 'Он расколол оружие, но не твою клятву.';
      this.context.element('intro-text').textContent =
        `Собери ${REGIONS[worldState.regionIndex].awaken} осколков собственной души. Они восстановят выбранное оружие. Разорви печать босса, чтобы вернуть силу и продолжить путь к семье.`;
    }
    this.context.actors.drawActors();
    this.context.actors.drawGates();
    const g = visuals.reaperInk;
    g.clear();
    if (t < 5.9) {
      const fade = visuals.reaper.alpha;
      g.fillStyle(0x12132a, 0.13 * fade);
      g.fillEllipse(visuals.reaper.x, visuals.reaper.y + 44, 165, 75);
      g.lineStyle(2, 0x9dcfe9, 0.24 * fade);
      g.strokeEllipse(visuals.reaper.x, visuals.reaper.y + 52, 116, 36);
      for (let i = 0; i < 9; i++) {
        const a = t * 1.6 + i * 0.7,
          x = visuals.reaper.x + Math.cos(a) * (50 + i * 5),
          y = visuals.reaper.y + Math.sin(a * 0.8) * (30 + i * 3);
        g.fillStyle(i % 2 ? 0x94d6e0 : 0x50678e, 0.2 * fade);
        g.fillCircle(x, y, 3 + i * 0.7);
      }
    }
    if (t >= WEAPON_STEAL_AT && !journey.introBroken) {
      const f = Math.min(1, (t - WEAPON_STEAL_AT) / (WEAPON_BREAK_AT - WEAPON_STEAL_AT)),
        hand = {
          x: visuals.reaper.x + 45,
          y: visuals.reaper.y - 24,
        };
      visuals.sword.setVisible(false);
      visuals.stolenWeapon
        .setVisible(true)
        .setPosition(
          Phaser.Math.Linear(visuals.player.x + 22, hand.x, f),
          Phaser.Math.Linear(visuals.player.y + 5, hand.y, f) - Math.sin(f * Math.PI) * 32,
        )
        .setRotation(0.98 + f * 2.6)
        .setAlpha(1);
      g.lineStyle(3, 0xbceef6, 0.5);
      g.beginPath();
      g.moveTo(visuals.player.x, visuals.player.y - 12);
      for (let n = 1; n <= 12; n++) {
        const u = n / 12,
          v = 1 - u;
        g.lineTo(
          v * v * visuals.player.x + 2 * v * u * (visuals.player.x + 90) + u * u * hand.x,
          v * v * (visuals.player.y - 12) + 2 * v * u * (visuals.player.y - 75) + u * u * hand.y,
        );
      }
      g.strokePath();
      if (t >= 1.5) {
        this.context.element('intro-title').textContent = 'Призрак вырывает твою силу.';
        this.context.element('intro-text').textContent =
          'Он ломает любое оружие, которое ты принёс. Его нельзя остановить клинком: сначала верни себе осколки памяти.';
      }
    }
    if (journey.introLeft <= 0) this.finishIntro();
  }
  finishIntro(): void {
    const { hero, journey, ui, visuals } = this.context;
    if (ui.state !== 'intro') return;
    this.clearReaper();
    visuals.sword.setVisible(false);
    hero.armed = false;
    journey.profile.blade = false;
    this.context.element('intro-overlay').hidden = true;
    ui.state = 'playing';
    this.context.controls.resetInput();
    hero.hurtLeft = 2;
    this.context.menu.toast('Туман сомкнулся. Верни силу и победи хозяина печати.');
    this.context.menu.syncGuide();
    this.context.menu.updateHUD();
  }
  resetJourney(): void {
    const { hero, worldState, journey, ui } = this.context;
    ui.achievementQueue = [];
    ui.achievementLeft = 0;
    ui.achievementPage = 0;
    this.context.element('achievement-banner').hidden = true;
    this.context.world.clearActors();
    journey.profile = newProfile();
    journey.progress = REGIONS.map(() => ({
      coins: 0,
      elapsed: 0,
      spawned: false,
      bossDead: false,
      cleared: false,
      income: 0,
      rewarded: false,
    }));
    journey.quests = REGIONS.map((_, i) => newQuests(i));
    journey.lines = newLines();
    journey.deliveries = newDeliveries();
    journey.campVisits.clear();
    worldState.regionIndex = 0;
    worldState.villageIndex = -1;
    worldState.lastVillage = -1;
    journey.elapsed = 0;
    journey.score = 0;
    journey.kills = 0;
    journey.deaths = 0;
    hero.ultimate = 0;
    hero.combo = 0;
    hero.strideDistance = 0;
    for (const n of worldState.villagers) {
      n.near = false;
      n.greetUntil = 0;
    }
    hero.lastAttack = -10;
    hero.attackTime = -1;
    hero.healWait = 0;
    hero.regenDelay = 0;
    journey.lessonIndex = 0;
    journey.lessonProgress = 0;
    journey.tutorialFinished = false;
    hero.guardLeft = 0;
    journey.dirty = false;
    for (const id of [
      'briefing-overlay',
      'dialog-overlay',
      'shop-overlay',
      'map-overlay',
      'menu-overlay',
      'loot-overlay',
      'intro-overlay',
      'story-overlay',
      'training-overlay',
      'confirm-overlay',
      'travel-overlay',
      'training-panel',
    ])
      this.context.element(id).hidden = true;
    this.context.element('guide').hidden = true;
    this.context.menu.hideModal();
  }
  beginStory(closing: boolean): void {
    const { journey, ui } = this.context;
    journey.storyClosing = closing;
    journey.storyIndex = 0;
    journey.storyTime = 0;
    ui.state = 'story';
    this.context.controls.resetInput();
    this.context.menu.hideModal();
    this.context.element('story-overlay').hidden = false;
    this.context.menu.syncGuide();
    this.context.element('training-overlay').hidden = true;
    this.renderStoryText();
    this.drawStory();
  }
  renderStoryText(): void {
    const { journey } = this.context;
    const frames = journey.storyClosing ? ENDING : OPENING,
      frame = frames[journey.storyIndex];
    this.context.element('story-title').textContent = frame.title;
    this.context.element('story-text').textContent = frame.text;
    this.context.element('story-page').textContent = `${journey.storyIndex + 1} / ${frames.length}`;
    this.context.element('story-next').textContent =
      journey.storyIndex === frames.length - 1 ? 'В путь ↗' : 'Дальше ↗';
  }
  advanceStory(): void {
    const { journey } = this.context;
    const frames = journey.storyClosing ? ENDING : OPENING;
    if (journey.storyIndex >= frames.length - 1) {
      this.finishStory();
      return;
    }
    journey.storyIndex++;
    journey.storyTime = 0;
    this.renderStoryText();
  }
  updateStory(dt: number): void {
    const { journey } = this.context;
    journey.storyTime += dt;
    this.drawStory();
    if (journey.storyTime >= 12) this.advanceStory();
  }
  finishStory(): void {
    const { journey, ui, visuals } = this.context;
    this.context.element('story-overlay').hidden = true;
    if (journey.storyClosing) {
      ui.state = 'won';
      this.context.menu.showModal(
        'СЕМЬЯ СПАСЕНА',
        'Дом снова ждёт тебя.',
        'Восемь печатей разорваны. Дракон побеждён, семья и украденная казна возвращены. Сохрани завершённый путь по кнопке.',
        'Исследовать очищенный мир',
        false,
      );
      this.context.menu.showStats();
      this.context.element('modal-save').hidden = false;
      this.context.element('restart-button').hidden = false;
      return;
    }
    if (journey.wantsTraining) this.context.tutorial.beginTutorial();
    else {
      visuals.player.setPosition(regionStart(0) + 100, 588);
      this.context.world.startRegion(0, true);
      this.beginIntro(false);
    }
  }
  drawStory(): void {
    const { journey } = this.context;
    const canvas = this.context.element<HTMLCanvasElement>('story-canvas'),
      c = canvas.getContext('2d');
    if (!c) return;
    const width = canvas.width,
      height = canvas.height,
      t = journey.storyTime,
      frame = (journey.storyClosing ? ENDING : OPENING)[journey.storyIndex],
      panel = journey.storyClosing ? 0 : journey.storyIndex,
      raid = frame.scene === 'raid',
      ghost = frame.scene === 'oath';
    const atlas = this.context.textures.get('story-atlas').getSourceImage() as CanvasImageSource,
      zoom = 1 + Math.min(0.065, t * 0.005),
      cropW = 768 / zoom,
      cropH = (cropW * height) / width,
      sx = (panel % 2) * 768 + (768 - cropW) / 2 + Math.sin(t * 0.14) * 5,
      sy = Math.floor(panel / 2) * 512 + (512 - cropH) / 2;
    c.clearRect(0, 0, width, height);
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    c.drawImage(atlas, sx, sy, cropW, cropH, 0, 0, width, height);
    // Небольшой параллакс, пепел и свечение дополняют рисунок, текст остаётся вне кадра.
    for (let i = 0; i < 28; i++) {
      const x = (i * 97 + t * (raid ? -15 : ghost ? 8 : 4)) % width,
        y = (i * 61 - t * (raid ? 20 : 8) + height * 2) % height;
      c.globalAlpha = 0.2 + Math.sin(t * 1.5 + i) * 0.13;
      c.fillStyle = raid ? '#ffa97e' : ghost ? '#9beaff' : '#ffdfa1';
      c.beginPath();
      c.arc(x, y, raid ? 1.8 : 1.3, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
    if (raid) {
      c.fillStyle = `rgba(204,51,32,${0.03 + 0.025 * Math.sin(t * 3)})`;
      c.fillRect(0, 0, width, height);
    }
    if (ghost) {
      const pulse = 0.12 + 0.05 * Math.sin(t * 3);
      c.fillStyle = `rgba(112,222,255,${pulse})`;
      c.beginPath();
      c.ellipse(width * 0.57, height * 0.56, 55 + Math.sin(t * 2) * 5, 35, 0, 0, Math.PI * 2);
      c.fill();
    }
    if (frame.scene === 'road') {
      for (let i = 0; i < REGIONS.length; i++) {
        const x = width * 0.48 + i * 55,
          y = height * 0.88 + Math.sin(t + i) * 2;
        c.strokeStyle = [
          '#83ccb1',
          '#e8ca87',
          '#c39ed8',
          '#e5a480',
          '#8cc7db',
          '#b18bcc',
          '#d4d4c9',
          '#c38aa1',
        ][i];
        c.lineWidth = 2;
        c.beginPath();
        c.arc(x, y, 13, 0, Math.PI * 2);
        c.stroke();
        c.fillStyle = '#f4e7c8';
        c.font = 'bold 13px system-ui';
        c.textAlign = 'center';
        c.fillText(String(i + 1), x, y + 4);
      }
    }
    const shade = c.createLinearGradient(0, 0, 0, height);
    shade.addColorStop(0, '#07101522');
    shade.addColorStop(0.6, '#07101500');
    shade.addColorStop(1, '#07101570');
    c.fillStyle = shade;
    c.fillRect(0, 0, width, height);
  }
}
