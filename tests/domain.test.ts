import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stats, attackSpec, skillAttack, slashConnects } from '../src/game/combat/CombatRules';
import { enemyStats } from '../src/game/enemies/EnemyConfig';
import { BOSS_MOVES, bossPattern, bossStrikeHits } from '../src/game/enemies/BossPatterns';
import { REGIONS, ENEMY_KINDS } from '../src/game/world/WorldConfig';
import {
  newProfile,
  parseProfile,
  purchase,
  attributePrice,
} from '../src/game/progression/PlayerProgression';
import { SKILL_TREE, learnSkill, refundBranch, toggleSkill } from '../src/game/progression/Skills';
import { newQuests, questEvent, advanceQuests, rollLoot } from '../src/game/quests/TrialsAndLoot';
import { parseSave } from '../src/game/persistence/SaveSchema';
import { moveCircle, freePoint, makeGrid, findPath, clearLine } from '../src/game/world/Navigation';

const fixture = JSON.parse(readFileSync('tests/fixtures/v10-save.json', 'utf8'));

test('HP, выносливость и повторные покупки сохраняют прежние формулы', () => {
  const p = newProfile();
  assert.equal(stats(p).maxHP, 100);
  assert.equal(stats(p).maxStamina, 100);
  p.coins = 250;
  purchase(p, 'vitality');
  assert.equal(p.coins, 150);
  assert.equal(attributePrice(p, 'vitality'), 150);
  assert.equal(stats(p).maxHP, 110);
  purchase(p, 'vitality');
  assert.equal(p.coins, 0);
  assert.equal(p.healthLevel, 2);
  assert.equal(stats(p).maxHP, 120);
  assert.equal(attributePrice(p, 'vitality'), 200);
  purchase(p, 'focus');
  assert.equal(p.enduranceLevel, 0);
  p.coins = 100;
  purchase(p, 'focus');
  assert.equal(stats(p).maxStamina, 110);
  assert.equal(attributePrice(p, 'vitality'), 200);
});

test('Предмет требует печати, а повторное надевание не списывает деньги', () => {
  const p = newProfile();
  p.coins = 500;
  purchase(p, 'spear', 0);
  assert.equal(p.coins, 500);
  assert.equal(p.weapon, 'sword');
  purchase(p, 'spear', 1);
  assert.equal(p.weapon, 'spear');
  assert.equal(p.coins, 410);
  purchase(p, 'spear', 1);
  assert.equal(p.coins, 410);
  purchase(p, 'dawnblade', 8);
  assert.equal(p.weapons.includes('dawnblade'), false);
});

test('Сброс навыка возвращает искры и сохраняет уже оплаченное открытие', () => {
  const p = newProfile();
  p.coins = 500;
  p.skillPoints = 4;
  const first = SKILL_TREE.find((s) => s.style === 'sword' && s.tier === 1)!;
  learnSkill(p, first.id, 8);
  const coins = p.coins;
  const points = p.skillPoints;
  toggleSkill(p, first.id);
  assert.ok(p.disabledSkills.includes(first.id));
  assert.equal(refundBranch(p, 'sword'), first.points);
  assert.equal(p.skillPoints, points + first.points);
  assert.equal(p.disabledSkills.includes(first.id), false);
  assert.ok(p.unlockedSkills.includes(first.id));
  learnSkill(p, first.id, 8);
  assert.equal(p.coins, coins);
  assert.equal(p.skillPoints, points);
});

test('Временные окна всех оружейных приёмов корректны', () => {
  const p = newProfile();
  for (const weapon of ['sword', 'spear', 'axe', 'staff', 'dawnblade', 'runicstaff'] as const) {
    p.weapon = weapon;
    for (const heavy of [false, true])
      for (let combo = 0; combo < 3; combo++) {
        const s = attackSpec(p, heavy, combo);
        assert.ok(s.windup >= 0 && s.windup <= s.activeEnd && s.activeEnd <= s.duration);
        assert.ok(Number.isFinite(s.multiplier) && s.cost >= 0);
      }
  }
  for (const skill of SKILL_TREE) {
    const s = skillAttack(skill.id);
    assert.ok(s.windup <= s.activeEnd && s.activeEnd <= s.duration);
  }
  assert.equal(slashConnects({ x: 0, y: 0 }, 0, { x: 50, y: 0 }, 10, 60, 0.5), true);
  assert.equal(slashConnects({ x: 0, y: 0 }, 0, { x: -50, y: 0 }, 10, 60, 0.5), false);
});

test('У восьми боссов остаются 24 отдельных приёма и безопасный центр колец', () => {
  assert.equal(REGIONS.length, 8);
  const moves = BOSS_MOVES.flat();
  assert.equal(new Set(moves).size, 24);
  for (let i = 0; i < REGIONS.length; i++) {
    assert.deepEqual(REGIONS[i].bossMoves, [...BOSS_MOVES[i]]);
    for (const move of REGIONS[i].bossMoves)
      for (const rage of [false, true]) {
        const strikes = bossPattern(move, { x: 100, y: 100 }, { x: 300, y: 250 }, rage);
        assert.ok(strikes.length > 0);
        for (const strike of strikes) {
          assert.ok(Number.isFinite(strike.delay) && strike.delay >= 0);
          assert.ok(Number.isFinite(strike.x) && Number.isFinite(strike.y));
          if (strike.shape === 'ring' && strike.inner > 16)
            assert.equal(bossStrikeHits(strike, strike, 16), false);
          else assert.equal(bossStrikeHits(strike, strike, 0), true);
        }
      }
  }
});

test('Параметры всех 96 сочетаний враг–биом совпадают с исходной игрой v10', () => {
  const baseline = JSON.parse(readFileSync('tests/fixtures/v10-enemy-stats.json', 'utf8'));
  assert.equal(baseline.length, REGIONS.length * ENEMY_KINDS.length);
  for (const row of baseline) {
    const actual = enemyStats(row.kind, row.index);
    for (const key of ['hp', 'damage', 'reward', 'speed', 'radius'] as const) {
      assert.equal(actual[key], row[key], `${row.kind}, region ${row.index}, ${key}`);
    }
  }
});

test('Испытания учитывают таймер, сброс серии и однократную награду', () => {
  const quests = newQuests(0);
  for (let n = 0; n < 5; n++) questEvent(quests, 'hit');
  questEvent(quests, 'hurt');
  assert.equal(quests.find((q) => q.id === 'focus')!.progress, 0);
  let rewards = 0;
  for (let n = 0; n < 8; n++) rewards += questEvent(quests, 'pickup').length;
  assert.equal(rewards, 1);
  assert.deepEqual(questEvent(quests, 'pickup'), []);
  const timed = newQuests(0);
  advanceQuests(timed, 51);
  assert.equal(timed.find((q) => q.id === 'sprint')!.failed, true);
  for (const [random, kind] of [
    [0.1, 'empty'],
    [0.3, 'souls'],
    [0.7, 'heal'],
  ] as const)
    assert.equal(rollLoot(newProfile(), 0, () => random).kind, kind);
});

test('Реальное сохранение исходной v10 читается без потери ресурсов и профиля', () => {
  const save = parseSave(JSON.stringify(fixture));
  assert.ok(save);
  assert.equal(save.version, 7);
  assert.equal(save.hp, 77);
  assert.equal(save.stamina, 66);
  assert.equal(save.flasks, 1);
  assert.equal(save.profile.coins, 321);
  assert.equal(save.profile.healthLevel, 2);
  assert.equal(save.progress.length, 8);
  assert.equal(save.migrated, false);
  for (const version of [5, 6]) {
    const old = { ...fixture, version, progress: fixture.progress.slice(0, 5) };
    const migrated = parseSave(JSON.stringify(old));
    assert.ok(migrated);
    assert.equal(migrated.migrated, true);
    assert.equal(migrated.progress.length, 8);
  }
});

test('Повреждённые сохранения и неизвестные предметы не ломают загрузку', () => {
  for (const value of [null, '{', '{}', '[]', 'null', '{"version":99}'])
    assert.equal(parseSave(value), null);
  const p = parseProfile(
    JSON.stringify({
      coins: -10,
      healthLevel: -4,
      weapons: ['unknown'],
      weapon: 'unknown',
      skin: 'unknown',
      skills: ['oops'],
    }),
  );
  assert.equal(p.coins, 0);
  assert.equal(p.healthLevel, 0);
  assert.deepEqual(p.weapons, ['sword']);
  assert.equal(p.weapon, 'sword');
  assert.equal(p.skin, 'fox');
  assert.deepEqual(p.skills, []);
});

test('Рывок и A* обходят твёрдую преграду; лужа остаётся проходимой', () => {
  const bounds = { left: 10, width: 400, top: 10, height: 300, margin: 10 };
  const terrain = [{ kind: 'tree' as const, x: 180, y: 150, radius: 35 }];
  const from = { x: 50, y: 150 },
    target = { x: 310, y: 150 };
  const moved = moveCircle(from, 200, 0, 16, terrain, bounds);
  assert.ok(moved.x < 180);
  assert.equal(clearLine(from, target, 16, terrain, bounds), false);
  const grid = makeGrid(terrain, bounds, 1, 16);
  const route = findPath(from, target, grid);
  assert.ok(route.length > 0);
  assert.ok(route.every((point) => freePoint(point, 16, terrain, bounds)));
  assert.equal(
    freePoint({ x: 180, y: 150 }, 16, [{ kind: 'puddle', x: 180, y: 150, radius: 35 }], bounds),
    true,
  );
});
