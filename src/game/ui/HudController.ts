import {
  BOSS_NAMES,
  GAME_CONFIG,
  LESSONS,
  REGIONS,
  SKILL_TREE,
  ULTIMATE_MAX,
  VILLAGE_NAMES,
  WEATHER_NAMES,
} from '../Constants';
import { stats } from '../combat/CombatRules';
import { type GameScene } from '../GameScene';
import { weaponFor } from '../progression/PlayerProgression';
import { houseName } from '../village/Residents';
import { type Point } from '../world/Navigation';
import { type EnemyAttack, regionStart, villagePosition } from '../world/WorldLayout';

/** Жизненные показатели, цель, сведения о боссе и направляющая стрелка. */
export class HudController {
  constructor(private readonly context: GameScene) {}

  updateHUD(): void {
    const { hero, worldState, journey, visuals } = this.context;
    if (!journey.progress.length) {
      return;
    }
    const s = stats(journey.profile);
    const r = REGIONS[worldState.regionIndex];
    const p = journey.progress[worldState.regionIndex];
    const w = weaponFor(journey.profile);

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
        worldState.area === 'biome' &&
          !p.spawned &&
          !p.bossDead &&
          coinsLeft <= GAME_CONFIG.bossUrgentCoins,
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

    this.context.menu.syncGuide();
    this.context.element('counter-ready').hidden =
      hero.counterLeft <= 0 || this.context.flow.state !== 'playing';
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

    let target: Point | null = null;
    let label = '';

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

      if (c) {
        target = c.sprite;
      }
      label = 'Ближайший осколок души';
    } else if (boss) {
      target = boss.sprite;
      label = 'Победи хозяина биома';
    } else {
      label = p.bossDead ? 'Биом очищается' : 'ФАЗА 2 · хозяин пробуждается';
    }

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

    if (target) {
      this.context.element('direction-arrow').style.transform =
        `rotate(${(Math.atan2(target.y - visuals.player.y, target.x - visuals.player.x) * 180) / Math.PI}deg)`;
    }
  }
}
