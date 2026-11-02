import { ACHIEVEMENTS, REGIONS, UI_CONFIG } from '../Constants';
import { type GameScene } from '../GameScene';
import { earnedAchievements } from '../progression/Achievements';
import { pageCount, pageRange } from '../ui/Pagination';

/** Проверка достижений, очередь уведомлений и вкладка наград. */
export class AchievementSystem {
  constructor(private readonly context: GameScene) {}

  syncAchievements(notify = true): void {
    const { worldState, journey, ui } = this.context;
    const eligible = earnedAchievements({
      bosses: journey.progress.map((p) => p.bossDead),
      counters: journey.profile.counterWins,
      skills: journey.profile.unlockedSkills.length,
      deliveries: journey.deliveries.some((q) => q.claimed),
      promise: journey.lines.some((q) => q.claimed),
      kills: journey.kills,
      returned: journey.deaths > 0 && worldState.area === 'village',
      trained: journey.tutorialFinished,
    });
    for (const id of eligible) {
      if (!journey.profile.achievements.includes(id)) {
        journey.profile.achievements.push(id);
        if (notify) {
          ui.achievementQueue.push(id);
          journey.dirty = true;
        }
      }
    }
  }

  updateAchievementNotice(dt: number): void {
    const { ui } = this.context;
    const notice = this.context.element('achievement-banner');
    const visible = this.context.flow.state === 'playing' || this.context.flow.state === 'won';
    notice.hidden = !visible || ui.achievementLeft <= 0;
    if (!visible) {
      return;
    }
    ui.achievementLeft = Math.max(0, ui.achievementLeft - dt);
    notice.classList.toggle(
      'leaving',
      ui.achievementLeft > 0 && ui.achievementLeft < UI_CONFIG.achievementFade,
    );
    if (ui.achievementLeft <= 0 && ui.achievementQueue.length) {
      const id = ui.achievementQueue.shift();
      const a = ACHIEVEMENTS.find((a) => a.id === id)!;
      ui.achievementLeft = UI_CONFIG.achievementDuration;
      notice.classList.remove('leaving');
      notice.hidden = true;
      void notice.offsetWidth;
      this.context.element('achievement-name').textContent = a.name;
      this.context.element('achievement-detail').textContent =
        a.boss >= 0
          ? 'Печать разорвана · искра мастерства получена. Ты стал ближе к семье.'
          : `Ты справился! ${a.description}`;
      this.context.audio.play('achievement');
      notice.hidden = false;
    }
  }

  renderAchievements(): void {
    const { journey, ui } = this.context;
    const pages = pageCount(ACHIEVEMENTS.length);
    ui.achievementPage = Math.max(0, Math.min(pages - 1, ui.achievementPage));
    this.context.element('achievement-progress').textContent =
      `Твой путь: ${this.context.seals()}/${REGIONS.length} печатей · ${journey.profile.achievements.length}/${ACHIEVEMENTS.length} достижений`;
    this.context.element<HTMLProgressElement>('achievement-meter').max = REGIONS.length;
    this.context.element<HTMLProgressElement>('achievement-meter').value = this.context.seals();
    this.context.element('achievement-items').innerHTML = ACHIEVEMENTS.slice(
      ...pageRange(ui.achievementPage),
    )
      .map((a) => {
        const earned = journey.profile.achievements.includes(a.id);
        return `<article class="achievement-card ${earned ? 'earned' : ''}"><b>${earned ? a.icon : '◇'}</b><div><strong>${a.name}</strong><small>${earned ? 'Получено · твоя победа' : 'Впереди на твоём пути'}</small><p>${a.description}</p></div></article>`;
      })
      .join('');
    this.context.element('achievement-page').textContent = `${ui.achievementPage + 1} / ${pages}`;
    this.context.element<HTMLButtonElement>('achievement-prev').disabled = ui.achievementPage === 0;
    this.context.element<HTMLButtonElement>('achievement-next').disabled =
      ui.achievementPage === pages - 1;
  }
}
