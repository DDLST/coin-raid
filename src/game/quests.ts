import { ARMORS, SKINS, UPGRADES, WEAPONS, isAttribute, itemUnlock, type Profile } from './progression';
export type Quest = { id: 'sprint' | 'triple' | 'focus'; name: string; description: string; progress: number; target: number; elapsed: number; limit: number; complete: boolean; failed: boolean; kills: number[] };
export function newQuests(region: number): Quest[] {
  return [
    { id: 'sprint', name: 'Сила на время', description: `Подбери ${8 + region} осколков за ${50 + region * 5} секунд.`, progress: 0, target: 8 + region, elapsed: 0, limit: 50 + region * 5, complete: false, failed: false, kills: [] },
    { id: 'triple', name: 'Разорвать строй', description: 'Победи 3 любых противников за 12 секунд.', progress: 0, target: 3, elapsed: 0, limit: 12, complete: false, failed: false, kills: [] },
    { id: 'focus', name: 'Чистая серия', description: 'Попади по врагам 6 раз, не получив урон.', progress: 0, target: 6, elapsed: 0, limit: 0, complete: false, failed: false, kills: [] },
  ];
}
export function advanceQuests(quests: Quest[], dt: number): void {
  for (const q of quests) if (!q.complete && !q.failed) { q.elapsed += dt;
    if (q.id === 'sprint' && q.elapsed > q.limit) q.failed = true;
    if (q.id === 'triple') { q.kills = q.kills.filter(t => q.elapsed - t <= q.limit); q.progress = q.kills.length; }
  }
}
export function questEvent(quests: Quest[], event: 'pickup' | 'kill' | 'hit' | 'hurt'): Quest[] {
  const completed: Quest[] = [];
  for (const q of quests) {
    if (q.complete || q.failed) continue;
    if (q.id === 'sprint' && event === 'pickup') q.progress++;
    if (q.id === 'triple' && event === 'kill') { q.kills = q.kills.filter(t => q.elapsed - t <= q.limit); q.kills.push(q.elapsed); q.progress = q.kills.length; }
    if (q.id === 'focus' && event === 'hit') q.progress++;
    if (q.id === 'focus' && event === 'hurt') q.progress = 0;
    if (q.progress >= q.target) { q.complete = true; completed.push(q); }
  }
  return completed;
}
export type Loot = { kind: 'empty' | 'souls' | 'heal' | 'item'; name: string; icon: string; value: number; item?: string; color: string };
export const LOOT_ODDS = 'Пусто 25% · сила 35% · лечение 20% · облик / улучшение 12% · оружие / броня 8%';
export function rollLoot(p: Profile, region: number, random = Math.random): Loot {
  const n = random();
  if (n < .25) return { kind: 'empty', name: 'Только древняя пыль', icon: '∅', value: 0, color: '#acb9b7' };
  if (n < .60) return { kind: 'souls', name: `${18 + region * 7} осколков души`, icon: '◈', value: 18 + region * 7, color: '#a7eef2' };
  if (n < .80) return { kind: 'heal', name: 'Полное лечение и заряд фляги', icon: '✚', value: 1, color: '#b3d99c' };
  const candidates = n < .92 ? [...SKINS.filter(s => !p.owned.includes(s.id)).map(s => ({ id: s.id, name: s.name, icon: '♧' })), ...UPGRADES.filter(u => (isAttribute(u.id)||p.upgrades[u.id] < u.prices.length) && region>=itemUnlock(u.id,p.upgrades[u.id])).map(u => ({ id: u.id, name: u.name, icon: u.icon }))]
    : [...WEAPONS.filter(w => !w.quest && !p.weapons.includes(w.id) && region>=itemUnlock(w.id)).map(w => ({ id: w.id, name: w.name, icon: w.icon })), ...ARMORS.filter(a => !p.armors.includes(a.id) && region>=itemUnlock(a.id)).map(a => ({ id: a.id, name: a.name, icon: a.icon }))];
  if (!candidates.length) return { kind: 'souls', name: '40 осколков души', icon: '◈', value: 40, color: '#e4c88c' };
  const item = candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))];
  return { kind: 'item', name: item.name, item: item.id, icon: item.icon, value: 0, color: n < .92 ? '#bac8f4' : '#e8c18f' };
}
