import { parseProfile, type Profile } from './progression';
import { ENEMY_KINDS, REGIONS, WORLD_HEIGHT, WORLD_WIDTH, PROLOGUE_WIDTH, ROAD_WIDTH, type EnemyKind } from './regions';
import { newQuests, type Quest } from './quests';
import { DEFAULT_AUDIO, type AudioSettings } from './audio';
import type { Point } from './world';
import { newLines, type Area, type QuestLine } from './story';
export type RegionProgress = { coins: number; elapsed: number; spawned: boolean; bossDead: boolean; cleared: boolean };
export type SavedEnemy = Point & { kind: EnemyKind; region: number; hp: number; phase2: boolean; variant: number; training:boolean };
export type SavedChest = Point & { region: number; quest: string; opened: boolean };
export type Snapshot = { version: 6; manual: true; savedAt: string; profile: Profile; region: number; progress: RegionProgress[];
  player: Point; checkpoint: Point; hp: number; stamina: number; flasks: number; armed: boolean; ultimate: number; elapsed: number; score: number; kills: number; deaths: number;
  enemies: SavedEnemy[]; coins: (Point & { region: number })[]; quests: Quest[][]; chests: SavedChest[]; audio: AudioSettings; area:Area; villageIndex:number; lastVillage:number; lesson:number; lessonProgress:number; lines:QuestLine[]; wisp:Point|null };
const number = (v: unknown, max = 1e7, fallback = 0): number => typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, v)) : fallback;
const obj = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};
const point = (v: unknown): Point => { const p = obj(v); return { x: number(p.x, WORLD_WIDTH), y: number(p.y, WORLD_HEIGHT) }; };
export function parseSave(raw: string | null): Snapshot | null {
  try {
    const d = obj(JSON.parse(raw ?? 'null'));
    if ((d.version !== 5 && d.version !== 6) || d.manual !== true || !Array.isArray(d.progress) || d.progress.length !== REGIONS.length || !Number.isInteger(d.region) || (d.region as number) < 0 || (d.region as number) >= REGIONS.length || !d.profile) return null;
    const region = d.region as number,old=d.version===5;
    const positioned=(value:unknown,i:number)=>{const p=point(value);if(old)p.x+=PROLOGUE_WIDTH+i*(ROAD_WIDTH-280);return p;};
    const progress = d.progress.map((v, i) => { const p = obj(v); const coins = Math.max(Math.floor(number(p.coins)),old&&p.cleared===true?REGIONS[i].coins:0); const bossDead = p.bossDead === true;
      return { coins, elapsed: number(p.elapsed), spawned: p.spawned === true, bossDead, cleared: bossDead && coins >= REGIONS[i].coins && p.cleared === true }; });
    if (progress.slice(0, region).some(p => !p.cleared)) return null;
    const enemies: SavedEnemy[] = [];
    if (Array.isArray(d.enemies)) for (const v of d.enemies.slice(0, 160)) { const e = obj(v);
      if (!ENEMY_KINDS.includes(e.kind as EnemyKind) || !Number.isInteger(e.region) || (e.region as number) < 0 || (e.region as number) >= REGIONS.length) continue;
      const hp = number(e.hp, 5000); if (hp <= 0) continue;
      enemies.push({ ...positioned(e,e.region as number), kind: e.kind as EnemyKind, region: e.region as number, hp, phase2: e.phase2 === true, variant: Math.floor(number(e.variant, 8)),training:!old&&e.training===true });
    }
    const coins: Snapshot['coins'] = [];
    if (Array.isArray(d.coins)) for (const v of d.coins.slice(0, 80)) { const c = obj(v); if (Number.isInteger(c.region) && (c.region as number) >= 0 && (c.region as number) < REGIONS.length) coins.push({ ...positioned(c,c.region as number), region: c.region as number }); }
    const quests = REGIONS.map((_, i) => newQuests(i));
    if (Array.isArray(d.quests)) for (let i = 0; i < REGIONS.length; i++) { const row = d.quests[i]; if (!Array.isArray(row)) continue;
      for (const q of quests[i]) { const input = row.find(v => obj(v).id === q.id); if (!input) continue; const a = obj(input);
        q.progress = Math.floor(number(a.progress, q.target)); q.elapsed = number(a.elapsed); q.complete = a.complete === true && q.progress >= q.target;
        q.failed = !q.complete && q.id === 'sprint' && (a.failed === true || q.elapsed > q.limit);
        if (Array.isArray(a.kills)) q.kills = a.kills.slice(-3).map(v => number(v, q.elapsed)).filter(t => q.elapsed - t <= q.limit);
      }
    }
    const chests: SavedChest[] = [];
    if (Array.isArray(d.chests)) for (const v of d.chests.slice(0, 15)) { const c = obj(v);
      if (!Number.isInteger(c.region) || (c.region as number) < 0 || (c.region as number) >= REGIONS.length || typeof c.quest !== 'string' || !quests[c.region as number].some(q => q.id === c.quest && q.complete)) continue;
      if (chests.some(x => x.region === c.region && x.quest === c.quest)) continue;
      chests.push({ ...positioned(c,c.region as number), region: c.region as number, quest: c.quest, opened: c.opened === true });
    }
    const a = obj(d.audio), audio = { master: number(a.master, 1, DEFAULT_AUDIO.master), music: number(a.music, 1, DEFAULT_AUDIO.music), effects: number(a.effects, 1, DEFAULT_AUDIO.effects), muted: a.muted === true };
    const area:Area=!old&&(d.area==='village'||d.area==='tutorial')?d.area:'biome';
    const villageIndex=old?region-1:Math.max(-1,Math.min(3,Math.floor(typeof d.villageIndex==='number'?d.villageIndex:-1)));
    const lastVillage=old?region-1:Math.max(-1,Math.min(3,Math.floor(typeof d.lastVillage==='number'?d.lastVillage:-1)));
    const lines=newLines();if(Array.isArray(d.lines))for(const q of lines){const found=d.lines.find(v=>obj(v).id===q.id),a=obj(found);q.accepted=a.accepted===true;q.kills=Math.floor(number(a.kills,2));q.artifact=a.artifact===true;q.runes=Math.floor(number(a.runes,3));q.escorted=a.escorted===true;q.claimed=q.accepted&&a.claimed===true;}
    return { version: 6, manual: true, savedAt: typeof d.savedAt === 'string' ? d.savedAt : '', profile: parseProfile(JSON.stringify(d.profile)), region, progress,
      player: positioned(d.player,region), checkpoint: positioned(d.checkpoint,region), hp: number(d.hp, 5000, 100), stamina: number(d.stamina, 5000, 100), flasks: Math.floor(number(d.flasks, 20, 2)),
      armed: d.armed === true, ultimate: number(d.ultimate, 100), elapsed: number(d.elapsed), score: Math.floor(number(d.score)), kills: Math.floor(number(d.kills)), deaths: Math.floor(number(d.deaths)), enemies, coins, quests, chests, audio,area,villageIndex,lastVillage,lesson:Math.floor(number(d.lesson,10)),lessonProgress:Math.floor(number(d.lessonProgress,10)),lines,wisp:d.wisp?point(d.wisp):null };
  } catch { return null; }
}
