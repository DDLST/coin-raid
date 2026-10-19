import { weaponFor, WEAPONS, ARMORS, SKINS, armorFor } from '../progression/PlayerProgression';
import {
  REGIONS,
  type EnemyAttack,
  VILLAGE_NAMES,
  villagePosition,
  regionStart,
} from '../world/WorldConfig';
import { SKILL_TREE } from '../progression/Skills';
import { stats, ULTIMATE_MAX } from '../combat/CombatRules';
import { houseName } from '../village/Residents';
import { LESSONS } from '../story/StoryContent';
import { BOSS_NAMES } from '../enemies/BossPatterns';
import { WEATHER_NAMES } from '../world/WeatherSystem';
import { type Point } from '../world/Navigation';
import type { GameScene } from '../GameScene';

/** Меню, HUD, пауза, справка, начальный экран и подтверждение выхода. */
export class MenuController {
  constructor(private readonly context: GameScene) {}

  toast(text: string): void {
    const { ui } = this.context;
    const t = this.context.element('toast');
    t.textContent = text;
    t.classList.add('visible');
    window.clearTimeout(ui.toastTimeout);
    ui.toastTimeout = window.setTimeout(() => t.classList.remove('visible'), 3200);
  }

  toggleMenu(): void {
    const { ui } = this.context;
    if (ui.state === 'menu') {
      ui.state = ui.menuReturn;
      this.context.element('menu-overlay').hidden = true;
      this.context.controls.resetInput();
      if (ui.state === 'paused') this.showPauseModal();
      this.syncGuide();
      return;
    }
    if (ui.state !== 'playing' && ui.state !== 'paused') return;
    ui.menuReturn = ui.state;
    ui.state = 'menu';
    this.context.controls.resetInput();
    this.hideModal();
    this.syncGuide();
    this.context.element('interaction').hidden = true;
    this.context.element('menu-overlay').hidden = false;
    this.renderMenu();
  }

  renderMenu(): void {
    const { worldState, journey, ui } = this.context;
    this.updateHUD();
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
    ] as const)
      this.context.element(`menu-${tab}`).hidden = tab !== ui.menuTab;
    for (const b of document.querySelectorAll<HTMLButtonElement>('[data-menu-tab]'))
      b.classList.toggle('selected', b.dataset.menuTab === ui.menuTab);
    if (ui.menuTab === 'equipment') this.renderEquipment();
    if (ui.menuTab === 'skills') this.renderSkills();
    if (ui.menuTab === 'quests') this.context.quests.renderQuests();
    if (ui.menuTab === 'achievements') this.context.quests.renderAchievements();
    if (ui.menuTab === 'settings') this.renderAudio();
  }

  renderSkills(): void {
    const { journey } = this.context;
    const style = weaponFor(journey.profile).style,
      seals = this.context.seals();
    this.context.element('skill-points').textContent =
      `Искры: ${journey.profile.skillPoints} · печати ${seals}/${REGIONS.length}`;
    this.context.element<HTMLButtonElement>('skill-reset').disabled = !SKILL_TREE.some(
      (s) => s.style === style && journey.profile.skills.includes(s.id),
    );
    this.context.element('skill-weapon').textContent =
      `Ветка: ${weaponFor(journey.profile).name}. Верни искры, чтобы сменить сборку; другая ветка выбирается во «Вещах».`;
    this.context.element('skill-items').innerHTML = SKILL_TREE.filter((s) => s.style === style)
      .map((s) => {
        const known = journey.profile.skills.includes(s.id),
          purchased = journey.profile.unlockedSkills.includes(s.id),
          disabled = journey.profile.disabledSkills.includes(s.id),
          price = purchased ? 0 : s.price,
          previous = SKILL_TREE.find((p) => p.style === style && p.tier === s.tier - 1),
          locked = seals < s.seals || (!!previous && !journey.profile.skills.includes(previous.id)),
          afford = journey.profile.coins >= price && journey.profile.skillPoints >= s.points;
        return `<article class="skill-card ${known ? 'complete' : ''}"><div><b>${s.key}</b><strong>${s.name}</strong></div><p>${s.description}</p><small>${known ? `${s.points} искр вложено · ${disabled ? 'снят с панели' : 'клавиша ' + s.key}` : `${s.seals} печатей · ${s.points} искр · ${price} ◈`}</small><button ${known ? 'data-skill-toggle' : 'data-skill'}="${s.id}" ${!known && (locked || !afford) ? 'disabled' : ''}>${known ? (disabled ? 'Вставить в панель' : 'Убрать из панели') : locked ? 'Ветка пока закрыта' : purchased ? 'Вложить искры' : 'Изучить'}</button></article>`;
      })
      .join('');
  }

  renderEquipment(): void {
    const { hero, journey, ui } = this.context;
    const items =
        ui.equipmentTab === 'weapons' ? WEAPONS : ui.equipmentTab === 'armors' ? ARMORS : SKINS,
      pages = Math.ceil(items.length / 4);
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
    for (const b of document.querySelectorAll<HTMLButtonElement>('[data-equipment]'))
      b.classList.toggle('selected', b.dataset.equipment === ui.equipmentTab);
    const w = weaponFor(journey.profile);
    this.context.element('equipment-detail').textContent =
      `${journey.profile.relics.includes('emberseal') ? 'Пепельная печать: -18% магии. ' : ''}${w.name}: урон ${Math.round(stats(journey.profile).damage)}, дальность ${w.reach}, расход ${w.cost}. ${armorFor(journey.profile).name}. ПКМ: ${w.description.split('ПКМ: ')[1] ?? w.description}`;
    this.context.element('ultimate-info').textContent =
      `R · ${w.ultimate}: ${w.ultimateHint}. Заряд ${Math.floor(hero.ultimate)} / 100.`;
  }

  renderAudio(): void {
    for (const key of ['master', 'music', 'effects'] as const)
      this.context.element<HTMLInputElement>(`volume-${key}`).value = String(
        Math.round(this.context.audio.settings[key] * 100),
      );
    this.context.element('audio-track').textContent = this.context.audio.trackTitle;
    this.context.element('mute-button').textContent = this.context.audio.settings.muted
      ? 'Включить звук'
      : 'Выключить звук';
  }

  setGuideText(): void {
    const hint = this.context.element('overlay').querySelector('.control-hint');
    if (hint)
      hint.textContent =
        'WASD - идти · мышь - прицел · ЛКМ / ПКМ - приёмы · C - парирование · Tab - меню';
    const grid = this.context.element('guide').querySelector('.guide-grid');
    if (grid)
      grid.innerHTML =
        '<span><b>WASD / стрелки</b> движение</span><span><b>Мышь + ЛКМ</b> удар по прицелу</span><span><b>ПКМ</b> второй приём оружия</span><span><b>C</b> парирование · затем ЛКМ</span><span><b>Space / Shift</b> уклонение</span><span><b>1 / 2 / 3 · R</b> навыки · абсолютное умение</span><span><b>Q / V</b> фляга / зелье</span><span><b>E · M</b> действие · карта</span><span><b>Tab / Esc · H · P</b> меню · справка · пауза</span>';
  }

  syncGuide(): void {
    const { ui } = this.context;
    this.context.element('guide').hidden = !ui.guideWanted || ui.state !== 'playing';
    if (ui.state !== 'playing' && ui.state !== 'won')
      this.context.element('achievement-banner').hidden = true;
  }

  toggleGuide(show?: boolean): void {
    const { ui } = this.context;
    ui.guideWanted = show ?? !ui.guideWanted;
    this.syncGuide();
  }

  togglePause(): void {
    const { ui } = this.context;
    if (ui.state === 'playing') {
      ui.state = 'paused';
      this.context.controls.resetInput();
      this.syncGuide();
      this.showPauseModal();
    } else if (ui.state === 'paused') {
      ui.state = 'playing';
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
    const { ui } = this.context;
    this.context.audio.unlock();
    if (ui.state === 'ready') {
      this.context.story.newJourney(
        this.context.element<HTMLInputElement>('start-training').checked,
      );
    } else if (ui.state === 'paused') this.togglePause();
    else if (ui.state === 'won') {
      this.hideModal();
      ui.state = 'playing';
      this.syncGuide();
      this.context.actors.drawActors();
      this.updateHUD();
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

  updateHUD(): void {
    const { hero, worldState, journey, ui, visuals } = this.context;
    if (!journey.progress.length) return;
    const s = stats(journey.profile),
      r = REGIONS[worldState.regionIndex],
      p = journey.progress[worldState.regionIndex],
      w = weaponFor(journey.profile);

    this.context.element('hp-text').textContent = `${Math.ceil(hero.hp)} / ${s.maxHP}`;
    this.context.element('hp-fill').style.width = `${(Math.max(0, hero.hp) / s.maxHP) * 100}%`;
    this.context.element('stamina-text').textContent = `${Math.floor(hero.stamina)}`;
    this.context.element('stamina-fill').style.width = `${(hero.stamina / s.maxStamina) * 100}%`;
    this.context.element('flask-count').textContent =
      `Q: ${hero.flasks} · V: ${journey.profile.potions}`;
    this.context.element('weapon-label').textContent = hero.armed
      ? w.name
      : `Оружие: сила ${Math.min(p.coins, r.awaken)}/${r.awaken}`;
    this.context.element('region-number').textContent =
      `БИОМ ${worldState.regionIndex + 1} / ${REGIONS.length}`;
    this.context.element('region-name').textContent = r.name;
    this.context.element('coin-goal').textContent =
      `Сила биома: ${Math.min(p.coins, r.coins)} / ${r.coins}`;
    this.context.element('region-lore').textContent = r.lore;
    this.context.element('compact-souls').textContent = !hero.armed
      ? `◈ ${Math.min(p.coins, r.awaken)} / ${r.awaken} · оружие`
      : `◈ ${Math.min(p.coins, r.coins)} / ${r.coins}`;

    const coinsLeft = Math.max(0, r.coins - p.coins);

    this.context
      .element('boss-timer')
      .classList.toggle(
        'timer-urgent',
        worldState.area === 'biome' && !p.spawned && !p.bossDead && coinsLeft <= 3,
      );

    this.context
      .element('boss-timer')
      .classList.toggle('timer-safe', worldState.area !== 'biome' || p.bossDead);

    this.context.element('boss-timer').textContent = p.bossDead
      ? 'Хозяин повержен'
      : p.spawned
        ? 'ФАЗА 2 · БОСС'
        : `Фаза 2: ${Math.min(p.coins, r.coins)}/${r.coins} ◈`;

    const objective =
      worldState.area === 'interior'
        ? `Внутри: ${houseName(worldState.villageIndex, worldState.interiorRole ?? 'smith')}. E у жителя - разговор, E у двери - выйти.`
        : worldState.area === 'village'
          ? 'Деревня безопасна. Войди в дверь дома на E. Tab - вещи, навыки, дорога и сохранение. Выход в следующий биом справа.'
          : worldState.area === 'tutorial'
            ? LESSONS[Math.min(journey.lessonIndex, LESSONS.length - 1)].hint
            : p.cleared
              ? 'Туман рассеялся. Восточная стоянка открыта.'
              : !hero.armed
                ? `Верни ${r.awaken} осколков силы, чтобы восстановить ${w.name.toLowerCase()}. Фаза 2 начнётся после сбора ${r.coins} монет.`
                : p.bossDead
                  ? `Собери силу биома: ${p.coins} / ${r.coins}.`
                  : p.spawned
                    ? 'ФАЗА 2: победи хозяина биома.'
                    : `Фаза 2 начнётся после сбора ${r.coins} монет. Собрано: ${Math.min(p.coins, r.coins)}/${r.coins}.`;

    this.context.element('quest-text').textContent = objective;
    const tracked =
      journey.profile.trackedQuest &&
      this.context.quests
        .journalEntries()
        .find((q) => q.id === journey.profile.trackedQuest && !q.done);

    this.context.element('guide-objective').textContent = tracked
      ? `${objective} Поручение: ${tracked.next}`
      : objective;

    this.context.element('guide-objective').hidden = this.context.tutorial.trainingArea();

    const boss = worldState.enemies.find(
      (e) => e.kind === 'boss' && e.region === worldState.regionIndex && !e.dead,
    );

    this.context.element('boss-hud').hidden = !boss || worldState.area !== 'biome';

    if (boss) {
      const names: Record<EnemyAttack, string> = {
        ...BOSS_NAMES,
        slash: 'удар',
        charge: 'рывок',
        slam: 'волна',
        poison: 'яд',
        summon: 'призыв',
        fan: 'чары',
        blink: 'прыжок',
        meteor: 'печати',
        breath: 'дыхание',
        combo: 'серия',
        nova: 'кольцо чар',
        snipe: 'прицельный выстрел',
        quake: 'волны земли',
        curse: 'проклятие',
      };

      this.context.element('boss-name').textContent =
        `${r.bossName}${boss.phase2 ? ' · II' : ''}${boss.mode === 'windup' ? ` · ${names[boss.move]}` : ''}`;
      this.context.element('boss-hp-text').textContent = `${Math.ceil(boss.hp)} / ${boss.maxHP}`;
      this.context.element('boss-hp-fill').style.width =
        `${(Math.max(0, boss.hp) / boss.maxHP) * 100}%`;
    }

    if (worldState.area !== 'biome') {
      this.context.element('boss-hud').hidden = true;
      this.context.element('boss-timer').textContent =
        worldState.area === 'tutorial' ? 'Обучение · без таймера' : 'Безопасная деревня';
      this.context.element('compact-souls').textContent =
        worldState.area === 'tutorial'
          ? `Урок ${journey.lessonIndex + 1}/${LESSONS.length}`
          : 'Подготовка к пути';
      this.context.element('region-number').textContent =
        worldState.area === 'tutorial' ? 'ПРЕДБИОМ' : 'ПОСЕЛЕНИЕ';
      this.context.element('region-name').textContent = VILLAGE_NAMES[worldState.villageIndex + 1];
      this.context.element('quest-text').textContent =
        worldState.area === 'tutorial'
          ? (LESSONS[journey.lessonIndex]?.hint ?? 'Обучение завершено')
          : 'Поговори с жителями, купи снаряжение и иди на восток. Семью держат за восемью печатями.';
      this.context.element('region-lore').textContent =
        'Кузнец · бронница · лекарь · странник. Смерть вернёт тебя к последней посещённой деревне.';
      this.context.element('coin-goal').textContent = 'Цель: спасти семью';
      this.context.element('weapon-label').textContent = weaponFor(journey.profile).name;
    }

    this.context.element('weather-label').textContent =
      hero.slowed > 0
        ? 'Молния · замедление'
        : worldState.weather === 'clear'
          ? 'Ясно'
          : `${WEATHER_NAMES[worldState.weather]} · ${Math.ceil(worldState.weatherLeft)} с`;

    this.syncGuide();
    this.context.element('counter-ready').hidden = hero.counterLeft <= 0 || ui.state !== 'playing';
    this.context.element('guide-skills').textContent =
      SKILL_TREE.filter(
        (s) =>
          s.style === w.style &&
          journey.profile.skills.includes(s.id) &&
          !journey.profile.disabledSkills.includes(s.id),
      )
        .map(
          (s) =>
            `${s.key} · ${s.name}${(hero.skillCooldowns[s.id] ?? 0) > 0 ? ' (' + Math.ceil(hero.skillCooldowns[s.id] ?? 0) + ' с)' : ''}`,
        )
        .join(' · ') || 'Приёмы изучаются в Tab → Навыки после побед над боссами.';
    this.context.element('ultimate-ready').hidden = !hero.armed || hero.ultimate < ULTIMATE_MAX;

    let target: Point | null = null,
      label = '';

    if (p.cleared && worldState.regionIndex < REGIONS.length - 1) {
      const m = villagePosition(worldState.regionIndex);
      target =
        visuals.player.x < m.x + 60
          ? villagePosition(worldState.regionIndex)
          : {
              x: regionStart(worldState.regionIndex + 1) + 70,
              y: 550,
            };
      label = visuals.player.x < m.x + 60 ? 'Костёр и деревня' : 'Следующий биом';
    } else if (p.coins < r.coins) {
      const c = worldState.coins
        .filter((c) => c.region === worldState.regionIndex)
        .sort(
          (a, b) =>
            Math.hypot(a.sprite.x - visuals.player.x, a.sprite.y - visuals.player.y) -
            Math.hypot(b.sprite.x - visuals.player.x, b.sprite.y - visuals.player.y),
        )[0];

      if (c) target = c.sprite;
      label = 'Ближайший осколок души';
    } else if (boss) {
      target = boss.sprite;
      label = 'Победи хозяина биома';
    } else label = p.bossDead ? 'Биом очищается' : 'ФАЗА 2 · хозяин пробуждается';

    if (worldState.area !== 'biome') {
      target = {
        x: regionStart(worldState.villageIndex + 1) + 80,
        y: 550,
      };
      label =
        worldState.area === 'tutorial'
          ? (LESSONS[journey.lessonIndex]?.title ?? 'В биом')
          : 'Восток · следующий биом';
    }

    this.context.element('navigation-text').textContent = label;
    this.context.element('direction-arrow').hidden = !target;

    if (target)
      this.context.element('direction-arrow').style.transform =
        `rotate(${(Math.atan2(target.y - visuals.player.y, target.x - visuals.player.x) * 180) / Math.PI}deg)`;
  }

  showTitle(): void {
    const { journey, ui } = this.context;
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
    ])
      this.context.element(id).hidden = true;

    this.context.controls.resetInput();
    ui.state = 'ready';
    journey.dirty = false;
    this.context.bosses.resetBossCountdown();
    this.context.element('guide').hidden = true;
    this.context.element('training-panel').hidden = true;

    this.showModal(
      'ОСКОЛКИ ДУШИ · v10.0',
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
    if (journey.dirty) this.confirmExit('new');
    else this.askTraining();
  }

  confirmExit(target: 'title' | 'new'): void {
    const { ui } = this.context;
    ui.confirmReturn = ui.state;
    ui.confirmTarget = target;
    ui.state = 'confirm';
    this.context.controls.resetInput();
    this.context.element('confirm-overlay').hidden = false;
    this.context.element('confirm-title').textContent =
      target === 'new' ? 'Начать новое путешествие?' : 'Завершить путешествие?';
  }

  cancelExit(): void {
    const { ui } = this.context;
    this.context.element('confirm-overlay').hidden = true;
    ui.state = ui.confirmReturn;
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
    ])
      this.context.element(id).hidden = true;
    journey.dirty = false;
    this.hideModal();
    if (ui.confirmTarget === 'new') this.askTraining();
    else this.showTitle();
  }
}
