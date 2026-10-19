import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { createServer as createHttpServer } from 'node:http';
import { resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const server = await createServer({ server: { host: '127.0.0.1', port: 4173, strictPort: true } });
await server.listen();
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined,
  args: ['--disable-dev-shm-usage', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const errors = [];
const staticServers = [];
let passed = 0;
async function check(name, action) {
  await action();
  passed++;
  console.log(`✓ ${name}`);
}
async function staticServer(directory, prefix) {
  const root = resolve(directory);
  const mime = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg',
  };
  const http = createHttpServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (!url.pathname.startsWith(prefix)) {
        res.writeHead(404).end();
        return;
      }
      const filename = resolve(
        root,
        decodeURIComponent(url.pathname.slice(prefix.length)) || 'index.html',
      );
      if (!filename.startsWith(root + '/') && filename !== root) {
        res.writeHead(403).end();
        return;
      }
      res.setHeader('Content-Type', mime[extname(filename)] || 'application/octet-stream');
      res.end(await readFile(filename));
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve) => http.listen(0, '127.0.0.1', resolve));
  staticServers.push(http);
  return `http://127.0.0.1:${http.address().port}${prefix}`;
}
async function keyUntil(page, key, condition) {
  await page.keyboard.down(key);
  try {
    await page.waitForFunction(condition);
  } finally {
    await page.keyboard.up(key);
  }
}
async function startFromTitle(page) {
  await page.locator('#start-training').uncheck();
  await page.locator('#primary-button').click();
  await page.locator('#story-skip').click();
  await page.locator('#intro-skip').click();
  await page.waitForFunction(() => document.querySelector('#intro-overlay').hidden);
}
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://127.0.0.1:4173');
  await page.evaluate(async () => {
    const { createGame } = await import('/src/game/createGame.ts');
    window.testGame = createGame('game', false);
  });
  await page.waitForFunction(() => window.testGame?.scene?.getScene('GameScene')?.visuals.player);
  await page.locator('#story-skip').click();
  await page.locator('#intro-skip').click();

  await check('WASD перемещает героя; Tab и M открывают и закрывают окна', async () => {
    await page.evaluate(() =>
      window.testGame.scene.getScene('GameScene').world.startVillage(-1, true),
    );
    const x = await page.evaluate(
      () => window.testGame.scene.getScene('GameScene').visuals.player.x,
    );
    await page.keyboard.down('d');
    await page.waitForFunction(
      (x) => window.testGame.scene.getScene('GameScene').visuals.player.x > x + 10,
      x,
    );
    await page.keyboard.up('d');
    assert.ok(
      (await page.evaluate(() => window.testGame.scene.getScene('GameScene').visuals.player.x)) >
        x + 5,
    );
    await keyUntil(
      page,
      'Tab',
      () => window.testGame.scene.getScene('GameScene').ui.state === 'menu',
    );
    for (const tab of ['equipment', 'skills', 'quests', 'achievements', 'settings', 'overview'])
      await page.locator(`[data-menu-tab="${tab}"]`).click();
    await keyUntil(
      page,
      'Tab',
      () => window.testGame.scene.getScene('GameScene').ui.state === 'playing',
    );
    await keyUntil(page, 'm', () => window.testGame.scene.getScene('GameScene').ui.state === 'map');
    await page.locator('#map-close').click();
    await page.waitForFunction(
      () => window.testGame.scene.getScene('GameScene').ui.state === 'playing',
    );
    await page.setViewportSize({ width: 960, height: 600 });
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  await check(
    'Урон, защита после попадания, фляга и уклонение сохраняют поведение v10',
    async () => {
      const r = await page.evaluate(() => {
        const s = window.testGame.scene.getScene('GameScene');
        s.ui.state = 'playing';
        s.hero.hp = 100;
        s.hero.hurtLeft = 0;
        s.hero.dodgeLeft = 0;
        s.hero.guardLeft = 0;
        const source = { x: s.visuals.player.x + 100, y: s.visuals.player.y };
        s.player.damagePlayer(20, source);
        const damaged = s.hero.hp;
        s.player.damagePlayer(20, source);
        const protectedHP = s.hero.hp;
        s.hero.hp = 40;
        s.hero.healWait = 0;
        s.hero.attackTime = -1;
        s.hero.flasks = 2;
        s.player.heal();
        const healed = s.hero.hp,
          flasks = s.hero.flasks;
        s.hero.stamina = 100;
        s.hero.dodgeWait = 0;
        s.player.dodge();
        s.hero.hurtLeft = 0;
        s.player.damagePlayer(20, source);
        return {
          damaged,
          protectedHP,
          healed,
          flasks,
          stamina: s.hero.stamina,
          afterDodge: s.hero.hp,
        };
      });
      assert.deepEqual(r, {
        damaged: 80,
        protectedHP: 80,
        healed: 78,
        flasks: 1,
        stamina: 75,
        afterDodge: 78,
      });
    },
  );

  await check(
    'Убийство босса выдаёт награду один раз и открывает область после квоты',
    async () => {
      const r = await page.evaluate(async () => {
        const s = window.testGame.scene.getScene('GameScene');
        const { REGIONS } = await import('/src/game/world/WorldConfig.ts');
        s.world.startRegion(0, true);
        s.hero.armed = true;
        s.journey.profile.blade = true;
        s.enemies.spawnBoss();
        const boss = s.worldState.enemies.find((e) => e.kind === 'boss' && !e.dead);
        s.combat.killEnemy(boss);
        const sparks = s.journey.profile.skillPoints,
          coins = s.journey.profile.coins;
        s.combat.killEnemy(boss);
        const duplicateSafe =
          sparks === s.journey.profile.skillPoints && coins === s.journey.profile.coins;
        s.journey.progress[0].coins = REGIONS[0].coins;
        s.world.checkProgress();
        return {
          sparks,
          duplicateSafe,
          cleared: s.journey.progress[0].cleared,
          bossDead: s.journey.progress[0].bossDead,
        };
      });
      assert.deepEqual(r, { sparks: 1, duplicateSafe: true, cleared: true, bossDead: true });
    },
  );

  await check('Все восемь боссов выполняют три приёма в обеих фазах', async () => {
    const count = await page.evaluate(() => {
      const s = window.testGame.scene.getScene('GameScene');
      let checked = 0;
      for (let i = 0; i < 8; i++) {
        s.world.startRegion(i, true);
        s.enemies.spawnBoss();
        const boss = s.worldState.enemies.find(
          (e) => e.kind === 'boss' && e.region === i && !e.dead,
        );
        for (const phase2 of [false, true])
          for (let move = 0; move < 3; move++) {
            boss.phase2 = phase2;
            boss.moveIndex = move;
            s.bosses.startBossAttack(boss);
            s.worldState.hazards = [];
            s.bosses.executeBossAttack(boss);
            if (
              !s.worldState.hazards.length ||
              s.worldState.hazards.some((h) => h.kind !== 'boss' || h.ownerId !== boss.id)
            )
              throw Error('Invalid boss hazards');
            checked++;
          }
      }
      return checked;
    });
    assert.equal(count, 48);
  });

  await check(
    'Лимит наземных осколков сохраняет доход за убийство; сундук не выдаёт лут повторно',
    async () => {
      const r = await page.evaluate(async () => {
        const s = window.testGame.scene.getScene('GameScene');
        const { REGION_INCOME } = await import('/src/game/world/WorldConfig.ts');
        s.world.startRegion(0, true);
        s.journey.progress[0].income = REGION_INCOME[0];
        const ground = s.economy.grantCoins(2, 0),
          enemy = s.economy.grantCoins(5, 0, true, true);
        const focus = s.journey.quests[0].find((q) => q.id === 'focus');
        focus.progress = 5;
        s.quests.onQuestEvent('hit');
        const chest = s.worldState.chests.find((c) => c.quest === 'focus');
        s.visuals.player.setPosition(chest.x, chest.y);
        s.quests.openChest(chest);
        s.quests.applyLoot();
        const coins = s.journey.profile.coins;
        s.quests.openChest(chest);
        s.quests.applyLoot();
        return {
          ground,
          enemy,
          opened: chest.opened,
          repeatSafe: coins === s.journey.profile.coins,
        };
      });
      assert.deepEqual(r, { ground: 0, enemy: 5, opened: true, repeatSafe: true });
      await page.evaluate(() => {
        const s = window.testGame.scene.getScene('GameScene');
        s.element('loot-overlay').hidden = true;
        s.ui.state = 'playing';
      });
    },
  );

  await check('Дом лекаря, диалог и реальная кнопка покупки +10 HP работают', async () => {
    await page.evaluate(() => {
      const s = window.testGame.scene.getScene('GameScene');
      s.world.startVillage(-1, true);
      s.journey.profile.coins = 500;
      s.journey.profile.healthLevel = 0;
      const house = s.worldState.houses.find((h) => h.village === -1 && h.role === 'healer');
      s.village.enterHouse(house);
      const npc = s.worldState.villagers.find((n) => n.village === -1 && n.role === 'healer');
      s.visuals.player.setPosition(npc.sprite.x, npc.sprite.y + 50);
      s.village.updateCamp();
      s.village.interact();
    });
    await page.locator('#dialog-trade').click();
    await page.locator('#tab-growth').click();
    await page.locator('[data-item="vitality"]').click();
    const r = await page.evaluate(() => {
      const s = window.testGame.scene.getScene('GameScene');
      return { level: s.journey.profile.healthLevel, coins: s.journey.profile.coins };
    });
    assert.deepEqual(r, { level: 1, coins: 400 });
    await page.locator('#shop-close').click();
    await page.locator('#dialog-leave').click();
  });

  await check('Сохранение исходной v10 загружается; повторная ручная запись читается', async () => {
    const fixture = JSON.parse(await readFile('tests/fixtures/v10-save.json', 'utf8'));
    await page.evaluate((fixture) => {
      localStorage.setItem('raid-coin-manual-v5', JSON.stringify(fixture));
      const s = window.testGame.scene.getScene('GameScene');
      s.saves.loadProgress();
    }, fixture);
    const loaded = await page.evaluate(() => {
      const s = window.testGame.scene.getScene('GameScene');
      return {
        hp: s.hero.hp,
        coins: s.journey.profile.coins,
        healthLevel: s.journey.profile.healthLevel,
      };
    });
    assert.deepEqual(loaded, { hp: 77, coins: 321, healthLevel: 2 });
    await page.locator('#menu-button').click();
    await page.locator('#save-button').click();
    const saved = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('raid-coin-manual-v5')),
    );
    assert.equal(saved.version, 7);
    assert.equal(saved.profile.coins, 321);
    assert.equal(saved.manual, true);
    await page.locator('#menu-close').click();
  });

  await check('Смерть возвращает в деревню и сохраняет покупки', async () => {
    const r = await page.evaluate(() => {
      const s = window.testGame.scene.getScene('GameScene');
      s.world.startRegion(0, true);
      s.hero.hp = 1;
      s.hero.hurtLeft = 0;
      s.hero.dodgeLeft = 0;
      s.hero.guardLeft = 0;
      const coins = s.journey.profile.coins,
        level = s.journey.profile.healthLevel;
      s.player.damagePlayer(10000, { x: s.visuals.player.x + 100, y: s.visuals.player.y }, true);
      const died = s.ui.state === 'dying';
      s.world.respawn();
      return {
        died,
        village: s.worldState.area === 'village',
        coinsKept: s.journey.profile.coins === coins,
        levelKept: s.journey.profile.healthLevel === level,
        hp: s.hero.hp,
      };
    });
    assert.deepEqual(r, { died: true, village: true, coinsKept: true, levelKept: true, hp: 120 });
  });

  await check('Обучение начинает практические уроки и завершает их в предбиоме', async () => {
    await page.evaluate(() => {
      const s = window.testGame.scene.getScene('GameScene');
      s.story.newJourney(true);
      s.story.finishStory();
      s.tutorial.startLessons();
    });
    const r = await page.evaluate(() => {
      const s = window.testGame.scene.getScene('GameScene');
      const began = s.worldState.area === 'tutorial';
      s.tutorial.finishTutorial();
      return { began, area: s.worldState.area, finished: s.journey.tutorialFinished };
    });
    assert.deepEqual(r, { began: true, area: 'village', finished: true });
  });

  for (const folder of ['dist', 'docs'])
    await check(`${folder}/ запускается из подпапки /coin-raid/`, async () => {
      const url = await staticServer(folder, '/coin-raid/');
      const built = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      built.on('pageerror', (e) => errors.push(`${folder}: ${e.message}`));
      const failed = [];
      built.on('response', (r) => {
        if (r.status() >= 400) failed.push(r.url());
      });
      await built.goto(url);
      await startFromTitle(built);
      await built.locator('#menu-button').click();
      assert.equal(await built.locator('#menu-overlay').isVisible(), true);
      assert.deepEqual(failed, []);
      await built.close();
    });

  await check('PLAY.html запускает игру через file:// без обращений к интернету', async () => {
    const offline = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const network = [];
    offline.on('pageerror', (e) => errors.push(`offline: ${e.message}`));
    await offline.route(/^https?:/, (route) => {
      network.push(route.request().url());
      return route.abort();
    });
    await offline.goto(pathToFileURL(resolve('PLAY.html')).href);
    await startFromTitle(offline);
    await offline.locator('#menu-button').click();
    assert.equal(await offline.locator('#menu-overlay').isVisible(), true);
    assert.deepEqual(network, []);
    await offline.close();
  });
  await check(
    'Карта проекта открывает HP, код и точную строку, поиск находит обработчик урона',
    async () => {
      const guide = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      guide.on('pageerror', (e) => errors.push(`guide: ${e.message}`));
      await guide.goto(pathToFileURL(resolve('guide/index.html')).href);
      await guide.locator('[data-mechanic="0"]').click();
      assert.match(await guide.locator('#reader h2').textContent(), /PlayerState/);
      assert.match(await guide.locator('.source .selected').textContent(), /hp = 100/);
      await guide.locator('#search').fill('damagePlayer');
      await guide.locator('#list [data-file="src/game/player/PlayerController.ts"]').click();
      await guide.locator('.symbol-buttons button', { hasText: /^damagePlayer$/ }).click();
      assert.match(await guide.locator('.source .selected').textContent(), /damagePlayer/);
      await guide.close();
    },
  );
  assert.deepEqual(errors, [], 'Ошибки JavaScript в браузере');
  console.log(`\n${passed} сценариев пройдено. Ошибок JavaScript: 0.`);
} finally {
  await browser.close();
  await server.close();
  await Promise.all(staticServers.map((http) => new Promise((resolve) => http.close(resolve))));
}
