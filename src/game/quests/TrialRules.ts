import { TRIAL_CONFIG } from '../Constants';

export type Quest = {
  id: 'sprint' | 'triple' | 'focus';
  name: string;
  description: string;
  progress: number;
  target: number;
  elapsed: number;
  limit: number;
  complete: boolean;
  failed: boolean;
  kills: number[];
};
export function newQuests(region: number): Quest[] {
  return [
    {
      id: 'sprint',
      name: 'Сила на время',
      description: `Подбери ${TRIAL_CONFIG.sprintTarget + region * TRIAL_CONFIG.sprintTargetPerRegion} осколков за ${TRIAL_CONFIG.sprintSeconds + region * TRIAL_CONFIG.sprintSecondsPerRegion} секунд.`,
      progress: 0,
      target: TRIAL_CONFIG.sprintTarget + region * TRIAL_CONFIG.sprintTargetPerRegion,
      elapsed: 0,
      limit: TRIAL_CONFIG.sprintSeconds + region * TRIAL_CONFIG.sprintSecondsPerRegion,
      complete: false,
      failed: false,
      kills: [],
    },
    {
      id: 'triple',
      name: 'Разорвать строй',
      description: `Победи ${TRIAL_CONFIG.tripleKills} любых противников за ${TRIAL_CONFIG.tripleSeconds} секунд.`,
      progress: 0,
      target: TRIAL_CONFIG.tripleKills,
      elapsed: 0,
      limit: TRIAL_CONFIG.tripleSeconds,
      complete: false,
      failed: false,
      kills: [],
    },
    {
      id: 'focus',
      name: 'Чистая серия',
      description: `Попади по врагам ${TRIAL_CONFIG.focusHits} раз, не получив урон.`,
      progress: 0,
      target: TRIAL_CONFIG.focusHits,
      elapsed: 0,
      limit: 0,
      complete: false,
      failed: false,
      kills: [],
    },
  ];
}
export function advanceQuests(quests: Quest[], dt: number): void {
  for (const quest of quests) {
    if (!quest.complete && !quest.failed) {
      quest.elapsed += dt;
      if (quest.id === 'sprint' && quest.elapsed > quest.limit) {
        quest.failed = true;
      }
      if (quest.id === 'triple') {
        quest.kills = quest.kills.filter((t) => quest.elapsed - t <= quest.limit);
        quest.progress = quest.kills.length;
      }
    }
  }
}
export function questEvent(quests: Quest[], event: 'pickup' | 'kill' | 'hit' | 'hurt'): Quest[] {
  const completed: Quest[] = [];
  for (const quest of quests) {
    if (quest.complete || quest.failed) {
      continue;
    }
    if (quest.id === 'sprint' && event === 'pickup') {
      quest.progress++;
    }
    if (quest.id === 'triple' && event === 'kill') {
      quest.kills = quest.kills.filter((t) => quest.elapsed - t <= quest.limit);
      quest.kills.push(quest.elapsed);
      quest.progress = quest.kills.length;
    }
    if (quest.id === 'focus' && event === 'hit') {
      quest.progress++;
    }
    if (quest.id === 'focus' && event === 'hurt') {
      quest.progress = 0;
    }
    if (quest.progress >= quest.target) {
      quest.complete = true;
      completed.push(quest);
    }
  }
  return completed;
}
