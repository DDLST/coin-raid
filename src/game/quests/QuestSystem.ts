import { newQuests, questEvent, rollLoot, LOOT_ODDS } from './TrialsAndLoot';
import { type SavedChest } from '../persistence/SaveSchema';
import { type Chest } from '../world/WorldState';
import { INTERACT_DISTANCE, regionStart, VILLAGE_NAMES, regionEnd } from '../world/WorldConfig';
import { stats } from '../combat/CombatRules';
import { SKINS, WEAPONS, ARMORS, UPGRADES, isAttribute } from '../progression/PlayerProgression';
import { earnedAchievements, ACHIEVEMENTS } from '../progression/Achievements';
import { type JournalEntry, lineJournal, deliveryJournal, QUEST_NOTES } from './Journal';
import { LINES, lineReady, DELIVERIES } from '../story/StoryContent';
import { type Point, findPath, moveCircle } from '../world/Navigation';
import { housePoint } from '../village/VillageLayout';
import { resident } from '../village/Residents';
import type { GameScene } from '../GameScene';

/** Испытания, сундуки, сюжетные поручения, журнал и достижения. */
export class QuestSystem {
  constructor(private readonly context: GameScene) {}
  resetAttemptRewards(index: number): void {
    const { worldState, journey } = this.context;
    for (const chest of worldState.chests.filter((c) => c.region === index)) chest.sprite.destroy();
    worldState.chests = worldState.chests.filter((c) => c.region !== index);
    journey.quests[index] = newQuests(index);
    if (journey.profile.trackedQuest.startsWith('trial:')) journey.profile.trackedQuest = '';
  }
  onQuestEvent(event: 'pickup' | 'kill' | 'hit' | 'hurt'): void {
    const { worldState, journey } = this.context;
    if (worldState.area !== 'biome') return;
    for (const q of questEvent(journey.quests[worldState.regionIndex], event)) {
      const pos = this.context.world.freePosition(worldState.regionIndex, 25, 80);
      this.spawnChest({
        ...pos,
        region: worldState.regionIndex,
        quest: q.id,
        opened: false,
      });
      this.context.audio.play('loot');
      this.context.menu.toast(`Испытание «${q.name}» пройдено. Сундук появился на карте ▣.`);
    }
  }
  spawnChest(data: SavedChest): void {
    const { worldState } = this.context;
    if (worldState.chests.some((c) => c.region === data.region && c.quest === data.quest)) return;
    const sprite = this.context.add
      .image(data.x, data.y, data.opened ? 'chest-open' : 'chest')
      .setDisplaySize(69, 69)
      .setDepth(18 + data.y * 0.01);
    if (data.opened) sprite.setAlpha(0.55);
    worldState.chests.push({ ...data, sprite });
  }
  openChest(chest: Chest): void {
    const { worldState, journey, ui, visuals } = this.context;
    if (
      chest.opened ||
      Math.hypot(chest.x - visuals.player.x, chest.y - visuals.player.y) > INTERACT_DISTANCE
    )
      return;
    chest.opened = true;
    chest.sprite.setTexture('chest-open').setAlpha(0.55);
    ui.state = 'loot';
    this.context.controls.resetInput();
    this.context.element('interaction').hidden = true;
    ui.loot = rollLoot(journey.profile, worldState.regionIndex);
    ui.lootLeft = 2.45;
    this.context.element('loot-overlay').hidden = false;
    this.context.element('loot-odds').textContent = LOOT_ODDS;
    this.context.element('loot-result').textContent = 'Эхо выбирает награду…';
    this.context.element<HTMLButtonElement>('loot-close').disabled = true;
    const entries = Array.from({ length: 18 }, (_, i) =>
      i === 14 ? ui.loot! : rollLoot(journey.profile, worldState.regionIndex),
    );
    const track = this.context.element('roll-track');
    track.style.transition = 'none';
    track.style.transform = 'translateX(0px)';
    track.innerHTML = entries
      .map(
        (item) =>
          `<div class="roll-cell" style="color:${item.color}"><b>${item.icon}</b><span>${item.name}</span></div>`,
      )
      .join('');
    void track.offsetWidth;
    const width =
      this.context.element('loot-overlay').querySelector('.roulette')?.clientWidth ?? 350;
    track.style.transition = 'transform 2.3s cubic-bezier(.15,.66,.17,1)';
    track.style.transform = `translateX(${width / 2 - 14 * 96 - 44}px)`;
    this.context.audio.play('loot');
  }
  applyLoot(): void {
    const { hero, worldState, journey, ui } = this.context;
    const loot = ui.loot;
    if (!loot) return;
    ui.loot = null;
    const before = stats(journey.profile);
    if (loot.kind === 'souls')
      this.context.economy.grantCoins(loot.value, worldState.regionIndex, false);
    else if (loot.kind === 'heal') {
      hero.hp = stats(journey.profile).maxHP;
      hero.flasks = Math.min(stats(journey.profile).flasks, hero.flasks + 1);
    } else if (loot.kind === 'item' && loot.item) {
      const skin = SKINS.find((s) => s.id === loot.item),
        weapon = WEAPONS.find((w) => w.id === loot.item),
        armor = ARMORS.find((a) => a.id === loot.item),
        upgrade = UPGRADES.find((u) => u.id === loot.item);
      if (skin && !journey.profile.owned.includes(skin.id)) journey.profile.owned.push(skin.id);
      else if (weapon && !journey.profile.weapons.includes(weapon.id))
        journey.profile.weapons.push(weapon.id);
      else if (armor && !journey.profile.armors.includes(armor.id))
        journey.profile.armors.push(armor.id);
      else if (upgrade && isAttribute(upgrade.id)) {
        if (upgrade.id === 'vitality') journey.profile.healthLevel++;
        else journey.profile.enduranceLevel++;
      } else if (upgrade)
        journey.profile.upgrades[upgrade.id] = Math.min(
          upgrade.prices.length,
          journey.profile.upgrades[upgrade.id] + 1,
        );
    }
    this.context.economy.applyEquipment(before);
    this.context.element('loot-result').textContent =
      loot.kind === 'empty'
        ? 'Сундук пуст. Следующее эхо может быть щедрее.'
        : `Получено: ${loot.name}`;
    this.context.element('loot-result').style.color = loot.color;
    this.context.element<HTMLButtonElement>('loot-close').disabled = false;
    this.context.audio.play(loot.kind === 'empty' ? 'empty' : 'loot');
    this.context.menu.updateHUD();
  }
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
    for (const id of eligible)
      if (!journey.profile.achievements.includes(id)) {
        journey.profile.achievements.push(id);
        if (notify) {
          ui.achievementQueue.push(id);
          journey.dirty = true;
        }
      }
  }
  updateAchievementNotice(dt: number): void {
    const { ui } = this.context;
    const notice = this.context.element('achievement-banner'),
      visible = ui.state === 'playing' || ui.state === 'won';
    notice.hidden = !visible || ui.achievementLeft <= 0;
    if (!visible) return;
    ui.achievementLeft = Math.max(0, ui.achievementLeft - dt);
    notice.classList.toggle('leaving', ui.achievementLeft > 0 && ui.achievementLeft < 0.45);
    if (ui.achievementLeft <= 0 && ui.achievementQueue.length) {
      const id = ui.achievementQueue.shift(),
        a = ACHIEVEMENTS.find((a) => a.id === id)!;
      ui.achievementLeft = 4.5;
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
    const pages = Math.ceil(ACHIEVEMENTS.length / 4);
    ui.achievementPage = Math.max(0, Math.min(pages - 1, ui.achievementPage));
    this.context.element('achievement-progress').textContent =
      `Твой путь: ${this.context.seals()}/8 печатей · ${journey.profile.achievements.length}/${ACHIEVEMENTS.length} достижений`;
    this.context.element<HTMLProgressElement>('achievement-meter').value = this.context.seals();
    this.context.element('achievement-items').innerHTML = ACHIEVEMENTS.slice(
      ui.achievementPage * 4,
      ui.achievementPage * 4 + 4,
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
  journalEntries(): JournalEntry[] {
    const { worldState, journey } = this.context;
    const entries: JournalEntry[] = [];
    for (const q of journey.lines) {
      const d = LINES.find((d) => d.id === q.id)!,
        row = lineJournal(q, journey.progress[d.region].bossDead),
        ready = lineReady(q, journey.progress[d.region].bossDead);
      const visit = d.offered;
      let village: number | null = !q.accepted ? d.offered : ready ? visit : null,
        point: Point | null =
          village !== null
            ? housePoint(village, d.giver)
            : { x: regionStart(d.region) + 640, y: 550 };
      if (q.claimed) point = null;
      else if (q.accepted && !ready) {
        const prop = worldState.questProps.find(
          (p) => p.id === q.id && (q.id !== 'runes' || p.order === q.runes),
        );
        if (q.id === 'bell' && q.kills < 2) {
          point = worldState.enemies.find(
            (e) => e.kind === 'necromancer' && !e.dead && e.region === d.region,
          )?.sprite ?? { x: regionStart(d.region) + 500, y: 600 };
        } else if (q.id === 'bell' && !q.artifact)
          point = prop?.point ?? { x: regionStart(d.region) + 950, y: 280 };
        else if (q.id === 'runes' && q.runes < 3)
          point =
            prop?.point ??
            [
              { x: regionStart(d.region) + 300, y: 250 },
              { x: regionStart(d.region) + 680, y: 830 },
              { x: regionStart(d.region) + 1040, y: 300 },
            ][q.runes];
        else if (q.id === 'wisp' && !q.escorted)
          point = worldState.wisp ?? {
            x: regionStart(d.region) + 180,
            y: 700,
          };
        else
          point = worldState.enemies.find(
            (e) => e.kind === 'boss' && !e.dead && e.region === d.region,
          )?.sprite ?? { x: regionStart(d.region) + 720, y: 550 };
      }
      entries.push({
        ...row,
        available: q.accepted || this.context.seals() > d.offered,
        point,
        region: d.region,
        village,
      });
    }
    for (const q of journey.deliveries) {
      const d = DELIVERIES.find((d) => d.id === q.id)!,
        village = q.accepted && !q.delivered ? d.to : d.from,
        role = q.accepted && !q.delivered ? d.receiver : d.giver;
      entries.push({
        ...deliveryJournal(q),
        available: this.context.seals() >= d.seals,
        point: q.claimed ? null : housePoint(village, role),
        region: Math.max(0, village + 1),
        village,
      });
    }
    for (const q of journey.quests[worldState.regionIndex]) {
      const chest = worldState.chests.find(
          (c) => c.region === worldState.regionIndex && c.quest === q.id,
        ),
        opened = chest?.opened === true;
      entries.push({
        id: `trial:${q.id}`,
        title: q.name,
        why: q.description,
        status: opened
          ? 'Награда открыта'
          : q.complete
            ? 'Сундук появился'
            : q.failed
              ? 'Время вышло'
              : `${q.progress}/${q.target}${q.id === 'sprint' ? ' · ' + Math.max(0, Math.ceil(q.limit - q.elapsed)) + ' с' : ''}`,
        next: opened
          ? 'Испытание завершено.'
          : q.complete
            ? 'Дойди до сундука на карте и открой на E.'
            : q.failed
              ? 'Нажми «Повторить сбор на время», затем закрой меню.'
              : q.description,
        steps: [
          `${q.complete ? '✓' : '○'} Выполнить испытание`,
          `${opened ? '✓' : '○'} Открыть сундук`,
        ],
        reward: 'Сундук: сила, лечение или предмет; он может оказаться пустым.',
        done: opened,
        available: true,
        point:
          q.complete && !opened && chest
            ? { x: chest.x, y: chest.y }
            : q.complete
              ? null
              : {
                  x: regionStart(worldState.regionIndex) + 640,
                  y: 550,
                },
        region: worldState.regionIndex,
        village: null,
      });
    }
    return entries;
  }
  trackQuest(id: string): void {
    const { journey, ui } = this.context;
    const entry = this.journalEntries().find((q) => q.id === id);
    if (!entry || !entry.available || entry.done) return;
    journey.profile.trackedQuest = id;
    journey.dirty = true;
    ui.mapMode = 'local';
    ui.mapFocusVillage = entry.village;
    ui.mapFocusRegion = entry.village === null ? entry.region : null;
    this.renderQuests();
    this.context.map.toggleMap();
  }
  renderQuests(): void {
    const { worldState, journey, ui } = this.context;
    for (const b of document.querySelectorAll<HTMLButtonElement>('[data-quest-view]'))
      b.classList.toggle('selected', b.dataset.questView === ui.questView);
    const prefix =
        ui.questView === 'story' ? 'line:' : ui.questView === 'delivery' ? 'delivery:' : 'trial:',
      rows = this.journalEntries().filter((q) => q.id.startsWith(prefix));
    ui.questPage = Math.max(0, Math.min(rows.length - 1, ui.questPage));
    const q = rows[ui.questPage],
      tracked = journey.profile.trackedQuest === q.id;
    this.context.element('quest-items').innerHTML =
      `<article class="quest-card journal-card ${q.done ? 'complete' : ''}"><div><strong>${q.title}</strong><span>${q.status}</span></div><p class="journal-why">${q.why}</p><p class="journal-next"><b>Следующий шаг:</b> ${q.next}</p><div class="journal-steps">${q.steps.map((s) => `<span>${s}</span>`).join('')}</div><footer><small>Награда: ${q.reward}</small><button data-track-quest="${q.id}" ${q.done || !q.available ? 'disabled' : ''}>${q.done ? 'Выполнено' : !q.available ? 'Пока недоступно' : tracked ? 'Цель на карте · M' : 'Отметить на карте'}</button></footer></article>`;
    this.context.element('quest-page').textContent = `${ui.questPage + 1} / ${rows.length}`;
    this.context.element<HTMLButtonElement>('quest-prev').disabled = ui.questPage === 0;
    this.context.element<HTMLButtonElement>('quest-next').disabled =
      ui.questPage === rows.length - 1;
    this.context.element('quest-retry').hidden =
      q.id !== 'trial:sprint' ||
      !journey.quests[worldState.regionIndex].some((q) => q.id === 'sprint' && q.failed);
  }
  renderQuestTalk(): void {
    const { worldState, journey, ui } = this.context;
    const def = LINES.find(
        (d) =>
          d.giver === ui.dialogRole &&
          worldState.villageIndex === d.offered &&
          !journey.lines.find((q) => q.id === d.id)!.claimed,
      ),
      button = this.context.element<HTMLButtonElement>('dialog-quest');
    button.disabled = !def;
    button.textContent = !def
      ? 'Поручений пока нет'
      : lineReady(
            journey.lines.find((q) => q.id === def.id)!,
            journey.progress[def.region].bossDead,
          )
        ? 'Сдать поручение'
        : journey.lines.find((q) => q.id === def.id)!.accepted
          ? 'О поручении'
          : 'Взять поручение';
  }
  talkQuest(): void {
    const { worldState, journey, ui } = this.context;
    const def = LINES.find(
      (d) =>
        d.giver === ui.dialogRole &&
        worldState.villageIndex === d.offered &&
        !journey.lines.find((q) => q.id === d.id)!.claimed,
    );
    if (!def) return;
    const q = journey.lines.find((q) => q.id === def.id)!;
    if (lineReady(q, journey.progress[def.region].bossDead)) {
      q.claimed = true;
      if (def.reward === 'emberseal') {
        if (!journey.profile.relics.includes(def.reward)) journey.profile.relics.push(def.reward);
      } else {
        const weapon = WEAPONS.find((w) => w.id === def.reward)!;
        if (!journey.profile.weapons.includes(weapon.id)) journey.profile.weapons.push(weapon.id);
      }
      this.context.audio.play('loot');
      this.context.village.say(
        `${QUEST_NOTES[q.id].thanks} Награда: ${def.rewardName}. Tab → Вещи.`,
      );
      this.context.menu.toast(`Получен уникальный предмет: ${def.rewardName}`);
    } else {
      const fresh = !q.accepted;
      q.accepted = true;
      journey.profile.trackedQuest = `line:${q.id}`;
      const note = lineJournal(q, journey.progress[def.region].bossDead);
      this.context.village.say(
        fresh
          ? `${QUEST_NOTES[q.id].offer} Запись: Tab → Задания → Дневник. Там следующий шаг и метка карты.`
          : `${note.next} ${def.description} После победы вернись ко мне в эту деревню.`,
      );
      this.makeQuestProps();
    }
    this.syncAchievements();
    this.renderQuestTalk();
    journey.dirty = true;
  }
  makeQuestProps(wispAt: Point | null = null): void {
    const { worldState, journey } = this.context;
    for (const q of worldState.questProps) q.sprite.destroy();
    worldState.questProps = [];
    worldState.wisp?.destroy();
    worldState.wisp = null;
    worldState.wispPath = [];
    if (worldState.area !== 'biome') return;
    const start = regionStart(worldState.regionIndex);
    for (const def of LINES) {
      const q = journey.lines.find((q) => q.id === def.id)!;
      if (!q.accepted || q.claimed || def.region !== worldState.regionIndex) continue;
      if (q.id === 'bell' && !q.artifact) {
        const point = this.context.world.freeNear({ x: start + 950, y: 280 }),
          sprite = this.context.add
            .image(point.x, point.y, 'bell')
            .setDisplaySize(62, 62)
            .setDepth(25);
        worldState.questProps.push({
          id: q.id,
          order: 0,
          point,
          sprite,
        });
      }
      if (q.id === 'runes')
        for (const [order, at] of [
          { x: start + 300, y: 250 },
          { x: start + 680, y: 830 },
          { x: start + 1040, y: 300 },
        ].entries()) {
          const point = this.context.world.freeNear(at),
            sprite = this.context.add
              .image(point.x, point.y, `rune-${order}`)
              .setDisplaySize(72, 72)
              .setDepth(25);
          if (order < q.runes) sprite.setTint(0x82d8b3);
          worldState.questProps.push({
            id: q.id,
            order,
            point,
            sprite,
          });
        }
      if (q.id === 'wisp' && !q.escorted) {
        const point = wispAt ?? this.context.world.freeNear({ x: start + 180, y: 700 });
        worldState.wisp = this.context.add
          .image(point.x, point.y, 'wisp')
          .setDisplaySize(52, 52)
          .setDepth(28);
        worldState.wispPathLeft = 0;
        worldState.wispFear = 0;
      }
    }
  }
  touchQuestProp(prop: (typeof this.context.worldState.questProps)[number]): void {
    const { worldState, journey } = this.context;
    const q = journey.lines.find((q) => q.id === prop.id)!;
    if (q.id === 'bell') {
      q.artifact = true;
      prop.sprite.destroy();
      worldState.questProps = worldState.questProps.filter((p) => p !== prop);
      this.context.menu.toast(
        `Язык колокола найден. Разорви лунную печать, затем вернись в ${VILLAGE_NAMES[1]}: ${resident(0, 'smith').name} ждёт тебя.`,
      );
    }
    if (q.id === 'runes') {
      if (prop.order < q.runes) {
        this.context.menu.toast('Эта печать уже активирована.');
        return;
      }
      if (prop.order === q.runes) {
        q.runes++;
        prop.sprite.setTint(0x82d8b3);
        this.context.audio.play('checkpoint');
        this.context.menu.toast(
          [
            'Луна: «Помни, ради кого идёшь».',
            'Искра: «Сила без памяти становится проклятием».',
            'Корень: «Возвращение важнее мести».',
          ][prop.order],
        );
      } else {
        q.runes = 0;
        for (const p of worldState.questProps) if (p.id === 'runes') p.sprite.clearTint();
        this.context.audio.play('empty');
        this.context.menu.toast('Круг замкнулся. Порядок: Луна → Искра → Корень.');
      }
    }
  }
  updateWisp(dt: number): void {
    const { worldState, journey, visuals } = this.context;
    if (!worldState.wisp || worldState.area !== 'biome') return;
    const q = journey.lines.find((q) => q.id === 'wisp')!;
    worldState.wispFear = Math.max(0, worldState.wispFear - dt);
    worldState.wispPathLeft -= dt;
    if (
      Math.hypot(worldState.wisp.x - visuals.player.x, worldState.wisp.y - visuals.player.y) <
        155 &&
      worldState.wispFear <= 0
    ) {
      const goal = this.context.world.freeNear({
        x: regionEnd(3) - 80,
        y: 615,
      });
      if (worldState.wispPathLeft <= 0) {
        worldState.wispPath = findPath(worldState.wisp, goal, worldState.nav[3]);
        worldState.wispPathLeft = 0.7;
      }
      while (
        worldState.wispPath[0] &&
        Math.hypot(
          worldState.wisp.x - worldState.wispPath[0].x,
          worldState.wisp.y - worldState.wispPath[0].y,
        ) < 16
      )
        worldState.wispPath.shift();
      const target = worldState.wispPath[0] ?? goal,
        dx = target.x - worldState.wisp.x,
        dy = target.y - worldState.wisp.y,
        len = Math.hypot(dx, dy) || 1,
        point = moveCircle(
          worldState.wisp,
          (dx / len) * 125 * dt,
          (dy / len) * 125 * dt,
          12,
          worldState.terrainByRegion[3],
          this.context.world.regionBounds(3),
        );
      worldState.wisp.setPosition(point.x, point.y);
      if (Math.hypot(point.x - goal.x, point.y - goal.y) < 35) {
        q.escorted = true;
        worldState.wisp.destroy();
        worldState.wisp = null;
        this.context.audio.play('checkpoint');
        this.context.menu.toast(
          `Огонёк достиг костра. После победы над Архонтом вернись в ${VILLAGE_NAMES[3]}: ${resident(2, 'healer').name} ждёт тебя.`,
        );
      }
    }
  }
}
