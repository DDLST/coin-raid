import {
  ARMORS,
  GAME_CONFIG,
  REGIONS,
  SESSION_OVERLAYS,
  SKILL_TREE,
  SKINS,
  ULTIMATE_MAX,
  WEAPONS,
} from '../Constants';
import { stats } from '../combat/CombatRules';
import { type GameScene } from '../GameScene';
import { armorFor, weaponFor } from '../progression/PlayerProgression';
import { pageCount } from './Pagination';

/** Меню, пауза, справка, начальный экран и подтверждение выхода. */
export class MenuController {
  constructor(private readonly context: GameScene) {}

  toast(text: string): void {
    const { ui } = this.context;
    const t = this.context.element('toast');
    t.textContent = text;
    t.classList.add('visible');
    window.clearTimeout(ui.toastTimeout);
    ui.toastTimeout = window.setTimeout(
      () => t.classList.remove('visible'),
      GAME_CONFIG.toastDurationMs,
    );
  }

  toggleMenu(): void {
    const { ui } = this.context;
    if (this.context.flow.state === 'menu') {
      this.context.flow.transitionTo(ui.menuReturn);
      this.context.element('menu-overlay').hidden = true;
      this.context.controls.resetInput();
      if (ui.menuReturn === 'paused') {
        this.showPauseModal();
      }
      this.syncGuide();
      return;
    }
    if (this.context.flow.state !== 'playing' && this.context.flow.state !== 'paused') {
      return;
    }
    ui.menuReturn = this.context.flow.state;
    this.context.flow.transitionTo('menu');
    this.context.controls.resetInput();
    this.hideModal();
    this.syncGuide();
    this.context.element('interaction').hidden = true;
    this.context.element('menu-overlay').hidden = false;
    this.renderMenu();
  }

  renderMenu(): void {
    const { worldState, journey, ui } = this.context;
    this.context.hud.updateHUD();
    this.context.map.drawMaps();
    this.context.saves.refreshSaveUI();
    this.context.element<HTMLButtonElement>('travel-open').disabled =
      worldState.area !== 'village' && worldState.area !== 'interior';
    this.context.element('menu-wallet').textContent = `◈ ${journey.profile.coins}`;
    for (const tab of [
      'overview',
      'equipment',
      'skills',
      'quests',
      'achievements',
      'settings',
    ] as const) {
      this.context.element(`menu-${tab}`).hidden = tab !== ui.menuTab;
    }
    for (const b of document.querySelectorAll<HTMLButtonElement>('[data-menu-tab]')) {
      b.classList.toggle('selected', b.dataset.menuTab === ui.menuTab);
    }
    if (ui.menuTab === 'equipment') {
      this.renderEquipment();
    }
    if (ui.menuTab === 'skills') {
      this.renderSkills();
    }
    if (ui.menuTab === 'quests') {
      this.context.quests.renderQuests();
    }
    if (ui.menuTab === 'achievements') {
      this.context.achievements.renderAchievements();
    }
    if (ui.menuTab === 'settings') {
      this.renderAudio();
    }
  }

  renderSkills(): void {
    const { journey } = this.context;
    const style = weaponFor(journey.profile).style;
    const seals = this.context.seals();
    this.context.element('skill-points').textContent =
      `Искры: ${journey.profile.skillPoints} · печати ${seals}/${REGIONS.length}`;
    this.context.element<HTMLButtonElement>('skill-reset').disabled = !SKILL_TREE.some(
      (s) => s.style === style && journey.profile.skills.includes(s.id),
    );
    this.context.element('skill-weapon').textContent =
      `Ветка: ${weaponFor(journey.profile).name}. Верни искры, чтобы сменить сборку; другая ветка выбирается во «Вещах».`;
    this.context.element('skill-items').innerHTML = SKILL_TREE.filter((s) => s.style === style)
      .map((s) => {
        const known = journey.profile.skills.includes(s.id);
        const purchased = journey.profile.unlockedSkills.includes(s.id);
        const disabled = journey.profile.disabledSkills.includes(s.id);
        const price = purchased ? 0 : s.price;
        const previous = SKILL_TREE.find((p) => p.style === style && p.tier === s.tier - 1);
        const locked =
          seals < s.seals || (!!previous && !journey.profile.skills.includes(previous.id));
        const afford = journey.profile.coins >= price && journey.profile.skillPoints >= s.points;
        return `<article class="skill-card ${known ? 'complete' : ''}"><div><b>${s.key}</b><strong>${s.name}</strong></div><p>${s.description}</p><small>${known ? `${s.points} искр вложено · ${disabled ? 'снят с панели' : 'клавиша ' + s.key}` : `${s.seals} печатей · ${s.points} искр · ${price} ◈`}</small><button ${known ? 'data-skill-toggle' : 'data-skill'}="${s.id}" ${!known && (locked || !afford) ? 'disabled' : ''}>${known ? (disabled ? 'Вставить в панель' : 'Убрать из панели') : locked ? 'Ветка пока закрыта' : purchased ? 'Вложить искры' : 'Изучить'}</button></article>`;
      })
      .join('');
  }

  renderEquipment(): void {
    const { hero, journey, ui } = this.context;
    const items =
      ui.equipmentTab === 'weapons' ? WEAPONS : ui.equipmentTab === 'armors' ? ARMORS : SKINS;
    const pages = pageCount(items.length);
    ui.equipmentPage = Math.max(0, Math.min(pages - 1, ui.equipmentPage));
    this.context.element('equipment-items').innerHTML = this.context.economy.itemCards(
      ui.equipmentTab,
      ui.equipmentPage,
      false,
    );
    this.context.element('equipment-page').textContent = `${ui.equipmentPage + 1} / ${pages}`;
    this.context.element<HTMLButtonElement>('equipment-prev').disabled = ui.equipmentPage === 0;
    this.context.element<HTMLButtonElement>('equipment-next').disabled =
      ui.equipmentPage === pages - 1;
    for (const b of document.querySelectorAll<HTMLButtonElement>('[data-equipment]')) {
      b.classList.toggle('selected', b.dataset.equipment === ui.equipmentTab);
    }
    const w = weaponFor(journey.profile);
    this.context.element('equipment-detail').textContent =
      `${journey.profile.relics.includes('emberseal') ? 'Пепельная печать: -18% магии. ' : ''}${w.name}: урон ${Math.round(stats(journey.profile).damage)}, дальность ${w.reach}, расход ${w.cost}. ${armorFor(journey.profile).name}. ПКМ: ${w.description.split('ПКМ: ')[1] ?? w.description}`;
    this.context.element('ultimate-info').textContent =
      `R · ${w.ultimate}: ${w.ultimateHint}. Заряд ${Math.floor(hero.ultimate)} / ${ULTIMATE_MAX}.`;
  }

  renderAudio(): void {
    for (const key of ['master', 'music', 'effects'] as const) {
      this.context.element<HTMLInputElement>(`volume-${key}`).value = String(
        Math.round(this.context.audio.settings[key] * 100),
      );
    }
    this.context.element('audio-track').textContent = this.context.audio.trackTitle;
    this.context.element('mute-button').textContent = this.context.audio.settings.muted
      ? 'Включить звук'
      : 'Выключить звук';
  }

  setGuideText(): void {
    const hint = this.context.element('overlay').querySelector('.control-hint');
    if (hint) {
      hint.textContent =
        'WASD - идти · мышь - прицел · ЛКМ / ПКМ - приёмы · C - парирование · Tab - меню';
    }
    const grid = this.context.element('guide').querySelector('.guide-grid');
    if (grid) {
      grid.innerHTML =
        '<span><b>WASD / стрелки</b> движение</span><span><b>Мышь + ЛКМ</b> удар по прицелу</span><span><b>ПКМ</b> второй приём оружия</span><span><b>C</b> парирование · затем ЛКМ</span><span><b>Space / Shift</b> уклонение</span><span><b>1 / 2 / 3 · R</b> навыки · абсолютное умение</span><span><b>Q / V</b> фляга / зелье</span><span><b>E · M</b> действие · карта</span><span><b>Tab / Esc · H · P</b> меню · справка · пауза</span>';
    }
  }

  syncGuide(): void {
    const { ui } = this.context;
    this.context.element('guide').hidden = !ui.guideWanted || this.context.flow.state !== 'playing';
    if (this.context.flow.state !== 'playing' && this.context.flow.state !== 'won') {
      this.context.element('achievement-banner').hidden = true;
    }
  }

  toggleGuide(show?: boolean): void {
    const { ui } = this.context;
    ui.guideWanted = show ?? !ui.guideWanted;
    this.syncGuide();
  }

  togglePause(): void {
    if (this.context.flow.state === 'playing') {
      this.context.flow.transitionTo('paused');
      this.context.controls.resetInput();
      this.syncGuide();
      this.showPauseModal();
    } else if (this.context.flow.state === 'paused') {
      this.context.flow.transitionTo('playing');
      this.hideModal();
      this.context.controls.resetInput();
      this.syncGuide();
    }
  }

  showPauseModal(): void {
    this.showModal(
      'ПРИВАЛ',
      'Мир ждёт тебя.',
      'Время остановлено. Tab открывает вещи, задания и карту. Для следующего запуска сохрани прогресс вручную.',
      'Снять паузу ↗',
      false,
    );
    this.context.element('restart-button').hidden = false;
    this.context.element('modal-save').hidden = false;
  }

  primaryAction(): void {
    this.context.audio.unlock();
    if (this.context.flow.state === 'ready') {
      this.context.story.newJourney(
        this.context.element<HTMLInputElement>('start-training').checked,
      );
    } else if (this.context.flow.state === 'paused') {
      this.togglePause();
    } else if (this.context.flow.state === 'won') {
      this.hideModal();
      this.context.flow.transitionTo('playing');
      this.syncGuide();
      this.context.actors.drawActors();
      this.context.hud.updateHUD();
    }
  }

  showModal(tag: string, title: string, description: string, button: string, rules: boolean): void {
    this.context.element<HTMLButtonElement>('primary-button').disabled = false;
    this.context.element('modal-tag').textContent = tag;
    this.context.element('modal-title').textContent = title;
    this.context.element('modal-description').textContent = description;
    this.context.element('primary-button').textContent = button;
    this.context.element('start-rules').hidden = !rules;
    this.context.element('modal-stats').hidden = true;
    this.context.element('restart-button').hidden = true;
    this.context.element('modal-save').hidden = true;
    this.context.element('load-start').hidden = true;
    this.context.element('start-save-note').hidden = !rules;
    this.context.element('overlay').hidden = false;
    this.context.element('title-options').hidden = true;
    document.body.classList.remove('at-title');
  }

  hideModal(): void {
    this.context.element('overlay').hidden = true;
    document.body.classList.remove('at-title');
    this.context.scene.setVisible(true);
  }

  showStats(): void {
    const { journey } = this.context;
    const s = this.context.element('modal-stats');
    s.hidden = false;
    s.innerHTML = `<span><b>${journey.score}</b> очков</span><span><b>${journey.kills}</b> врагов</span><span><b>${journey.deaths}</b> смертей</span><span><b>${Math.floor(journey.elapsed)} с</b> в пути</span><span><b>${journey.profile.coins} ◈</b> осколков</span>`;
  }

  showTitle(): void {
    const { journey } = this.context;
    for (const id of [
      'briefing-overlay',
      'dialog-overlay',
      'shop-overlay',
      'map-overlay',
      'loot-overlay',
      'intro-overlay',
      'story-overlay',
      'training-overlay',
      'confirm-overlay',
      'travel-overlay',
    ]) {
      this.context.element(id).hidden = true;
    }

    this.context.controls.resetInput();
    this.context.flow.transitionTo('ready');
    journey.dirty = false;
    this.context.bosses.resetBossCountdown();
    this.context.element('guide').hidden = true;
    this.context.element('training-panel').hidden = true;

    this.showModal(
      'ОСКОЛКИ ДУШИ · v10.1',
      'RAID COIN',
      'Восемь печатей. Одна клятва. Верни силу и спаси семью.',
      'Новая игра',
      false,
    );

    document.body.classList.add('at-title');
    this.context.scene.setVisible(false);
    this.context.element('title-options').hidden = false;
    this.context.element('title-status').textContent = '';
    this.context.element<HTMLButtonElement>('primary-button').disabled = false;
    this.context.saves.refreshSaveUI();
  }

  askTraining(): void {
    this.showTitle();
  }

  requestNew(): void {
    const { journey } = this.context;
    if (journey.dirty) {
      this.confirmExit('new');
    } else {
      this.askTraining();
    }
  }

  confirmExit(target: 'title' | 'new'): void {
    const { ui } = this.context;
    ui.confirmReturn = this.context.flow.state;
    ui.confirmTarget = target;
    this.context.flow.transitionTo('confirm');
    this.context.controls.resetInput();
    this.context.element('confirm-overlay').hidden = false;
    this.context.element('confirm-title').textContent =
      target === 'new' ? 'Начать новое путешествие?' : 'Завершить путешествие?';
  }

  cancelExit(): void {
    const { ui } = this.context;
    this.context.element('confirm-overlay').hidden = true;
    this.context.flow.transitionTo(ui.confirmReturn);
  }

  commitExit(): void {
    const { journey, ui } = this.context;
    this.context.element('confirm-overlay').hidden = true;
    for (const id of [
      'menu-overlay',
      'shop-overlay',
      'dialog-overlay',
      'map-overlay',
      'loot-overlay',
    ]) {
      this.context.element(id).hidden = true;
    }
    journey.dirty = false;
    this.hideModal();
    if (ui.confirmTarget === 'new') {
      this.askTraining();
    } else {
      this.showTitle();
    }
  }

  resetSession(): void {
    window.clearTimeout(this.context.ui.toastTimeout);
    for (const id of SESSION_OVERLAYS) {
      this.context.element(id).hidden = true;
    }
    this.context.element('guide').hidden = true;
    this.context.element('toast').classList.remove('visible');
    this.hideModal();
  }
  updateNotices(dt: number): void {
    const { ui } = this.context;
    if (this.context.flow.playing && ui.checkpointBannerLeft > 0) {
      ui.checkpointBannerLeft = Math.max(0, ui.checkpointBannerLeft - dt);
      if (ui.checkpointBannerLeft === 0) {
        this.context.element('checkpoint-banner').hidden = true;
      }
    }
    this.context.achievements.updateAchievementNotice(dt);
  }
}
