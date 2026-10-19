import { type Point, freePoint } from '../world/Navigation';
import { PLAYER_RADIUS, ULTIMATE_MAX, stats } from '../combat/CombatRules';
import {
  regionStart,
  WORLD_HEIGHT,
  REGION_INCOME,
  REGIONS,
  PICKUP_RADIUS,
} from '../world/WorldConfig';
import {
  weaponFor,
  SKINS,
  WEAPONS,
  ARMORS,
  UPGRADES,
  isAttribute,
  attributeLevel,
  attributePrice,
  itemUnlock,
  purchase,
} from '../progression/PlayerProgression';
import { houseName, resident, villageTradition, villageStock } from '../village/Residents';
import { SUPPLIES } from './ShopCatalog';
import { type ShopTab } from '../ui/InterfaceState';
import { weaponTexture } from '../rendering/WeaponAnimation';
import type { GameScene } from '../GameScene';

/** Сбор осколков, кошелёк, ассортимент, покупки и экипировка. */
export class EconomySystem {
  constructor(private readonly context: GameScene) {}
  spawnCoin(index: number, near = false, point?: Point): void {
    const { worldState } = this.context;
    let pos = point ?? this.context.world.freePosition(index, PLAYER_RADIUS, 50);
    if (near) {
      const at = { x: regionStart(index) + 260, y: WORLD_HEIGHT / 2 };
      if (
        freePoint(at, 30, worldState.terrainByRegion[index], this.context.world.regionBounds(index))
      )
        pos = at;
    }
    worldState.coins.push({
      region: index,
      sprite: this.context.add.image(pos.x, pos.y, 'soul').setDisplaySize(45, 45).setDepth(9),
      value: 1,
      phase: Math.random() * 6.28,
    });
  }
  grantCoins(value: number, index: number, countsForGoal = true, fromEnemy = false): number {
    const { hero, worldState, journey, visuals } = this.context;
    const p = journey.progress[index],
      paid =
        countsForGoal && !fromEnemy && worldState.area === 'biome'
          ? Math.max(0, Math.min(value, REGION_INCOME[index] - p.income))
          : value;
    if (countsForGoal && !fromEnemy && worldState.area === 'biome') {
      p.income += paid;
      if (p.income === REGION_INCOME[index] && p.income - paid < REGION_INCOME[index])
        this.context.menu.toast(
          'Осколки на земле теперь возвращают только силу. Победы над врагами всегда пополняют кошелёк: накопи на HP, выносливость или зелья.',
        );
    }
    journey.profile.coins += paid;
    journey.score += value * 100;
    hero.ultimate = Math.min(ULTIMATE_MAX, hero.ultimate + Math.min(12, value * 3));
    if (
      countsForGoal &&
      index === worldState.regionIndex &&
      (worldState.area === 'biome' || worldState.area === 'tutorial')
    )
      p.coins += value;
    if (
      !hero.armed &&
      p.coins >= (worldState.area === 'tutorial' ? 3 : REGIONS[worldState.regionIndex].awaken)
    ) {
      hero.armed = true;
      journey.profile.blade = true;
      this.context.effects.particles(
        visuals.player.x,
        visuals.player.y,
        24,
        weaponFor(journey.profile).color,
      );
      this.context.audio.play('checkpoint');
      this.context.menu.toast(
        `СИЛА ВОССТАНОВЛЕНА · ${weaponFor(journey.profile).name}. Наводи мышью и сражайся!`,
      );
    }
    this.context.world.checkProgress();
    this.context.menu.updateHUD();
    return paid;
  }
  collectCoins(): void {
    const { worldState, journey, ui, visuals } = this.context;
    for (const c of [...worldState.coins]) {
      if (
        c.region !== worldState.regionIndex ||
        Math.hypot(c.sprite.x - visuals.player.x, c.sprite.y - visuals.player.y) >
          PICKUP_RADIUS + journey.profile.upgrades.magnet * 20
      )
        continue;
      const x = c.sprite.x,
        y = c.sprite.y;
      c.sprite.destroy();
      worldState.coins.splice(worldState.coins.indexOf(c), 1);
      this.grantCoins(c.value, c.region);
      this.context.quests.onQuestEvent('pickup');
      this.context.audio.play('pickup');
      this.context.effects.particles(x, y, 6, 0xbef5ee);
      this.context.tutorial.lessonEvent('pickup');
      if (
        worldState.area === 'biome' &&
        ui.state === 'playing' &&
        (!journey.progress[c.region].cleared ||
          journey.quests[c.region].some((q) => q.id === 'sprint' && !q.complete))
      )
        this.spawnCoin(c.region);
    }
  }
  openShop(): void {
    const { worldState, ui } = this.context;
    if (ui.state !== 'dialog') return;
    ui.shopTab =
      ui.dialogRole === 'smith'
        ? 'weapons'
        : ui.dialogRole === 'armorer'
          ? 'armors'
          : ui.dialogRole === 'healer'
            ? 'supplies'
            : 'upgrades';
    ui.state = 'shop';
    this.context.element('dialog-overlay').hidden = true;
    this.context.element('shop-overlay').hidden = false;
    ui.shopPage = 0;
    this.context.element('shop-eyebrow').textContent = houseName(
      worldState.villageIndex,
      ui.dialogRole,
    );
    this.context.element('shop-title').textContent = resident(
      worldState.villageIndex,
      ui.dialogRole,
    ).job;
    this.context.element('shop-close').textContent =
      `Назад: ${resident(worldState.villageIndex, ui.dialogRole).name} ↗`;
    for (const tab of ['weapons', 'armors', 'supplies', 'upgrades', 'skins', 'growth'])
      this.context.element(`tab-${tab}`).hidden =
        ui.dialogRole === 'smith'
          ? tab !== 'weapons'
          : ui.dialogRole === 'armorer'
            ? tab !== 'armors'
            : ui.dialogRole === 'healer'
              ? !['supplies', 'growth'].includes(tab)
              : !['upgrades', 'skins'].includes(tab);
    this.context.element('shop-message').textContent =
      ui.dialogRole === 'healer' || ui.dialogRole === 'trader'
        ? 'HP и выносливость: +10 за 100 ◈, затем 150, 200… Усиления сохраняются после смерти. Зелья - в сумке, клавиша V.'
        : 'Покупки сохраняются после смерти. У лекаря и странника можно постоянно повышать HP и выносливость.';
    if (ui.dialogRole === 'smith')
      this.context.element('shop-message').textContent = villageTradition(worldState.villageIndex);
    this.renderShop();
  }
  renderShop(): void {
    const { worldState, journey, ui } = this.context;
    const items =
      ui.shopTab === 'skins'
        ? SKINS
        : ui.shopTab === 'weapons'
          ? WEAPONS.filter((w) => !w.quest && villageStock(worldState.villageIndex).includes(w.id))
          : ui.shopTab === 'armors'
            ? ARMORS
            : ui.shopTab === 'supplies'
              ? SUPPLIES
              : ui.shopTab === 'growth'
                ? UPGRADES.filter((u) => isAttribute(u.id))
                : UPGRADES;
    const pages = Math.max(1, Math.ceil(items.length / 4));
    ui.shopPage = Math.min(pages - 1, Math.max(0, ui.shopPage));
    this.context.element('shop-wallet').textContent = `◈ ${journey.profile.coins}`;
    this.context.element('shop-page').textContent = `${ui.shopPage + 1} / ${pages}`;
    this.context.element<HTMLButtonElement>('shop-prev').disabled = ui.shopPage === 0;
    this.context.element<HTMLButtonElement>('shop-next').disabled = ui.shopPage === pages - 1;
    for (const tab of ['skins', 'weapons', 'armors', 'upgrades', 'supplies', 'growth']) {
      this.context.element(`tab-${tab}`).classList.toggle('selected', tab === ui.shopTab);
    }
    this.context.element('storage-status').textContent = journey.storageAvailable
      ? 'Покупки сохранятся только по кнопке «Сохранить прогресс» в меню.'
      : 'Браузер запретил сохранение; покупки действуют в этой вкладке.';
    this.context.element('shop-items').classList.toggle('growth-items', ui.shopTab === 'growth');
    this.context.element('shop-items').innerHTML = this.itemCards(ui.shopTab, ui.shopPage, true);
  }
  itemCards(tab: ShopTab, page: number, shop: boolean): string {
    const { worldState, journey } = this.context;
    const cards: string[] = [],
      p = journey.profile;
    if (tab === 'supplies') {
      return SUPPLIES.map(
        (i) =>
          `<article class="shop-card"><span class="upgrade-icon">${i.icon}</span><h3>${i.name}</h3><p>${i.description}</p><button data-item="${i.id}" ${p.coins < i.price || (i.id === 'field-potion' && p.potions >= 99) ? 'disabled' : ''}>${i.price} ◈</button></article>`,
      ).join('');
    }
    if (tab === 'upgrades' || tab === 'growth') {
      for (const u of (tab === 'growth'
        ? UPGRADES.filter((u) => isAttribute(u.id))
        : UPGRADES
      ).slice(page * 4, page * 4 + 4)) {
        const repeat = isAttribute(u.id),
          rank = repeat ? attributeLevel(p, u.id) : p.upgrades[u.id],
          max = !repeat && rank >= u.prices.length,
          price = repeat ? attributePrice(p, u.id) : u.prices[rank],
          gate = itemUnlock(u.id, rank),
          locked = this.context.seals() < gate;
        cards.push(
          `<article class="shop-card"><span class="upgrade-icon">${u.icon}</span><h3>${u.name}</h3><p>${u.description}<br>${repeat ? 'Куплено: ' + rank : rank + ' / ' + u.prices.length}</p><button data-item="${u.id}" ${max || locked || p.coins < price ? 'disabled' : ''}>${max ? 'Максимум' : locked ? `${gate} печатей · ${price} ◈` : `${price} ◈`}</button></article>`,
        );
      }
    } else {
      const items =
        tab === 'skins'
          ? SKINS
          : tab === 'weapons'
            ? shop
              ? WEAPONS.filter(
                  (w) => !w.quest && villageStock(worldState.villageIndex).includes(w.id),
                )
              : WEAPONS
            : ARMORS;
      for (const item of items.slice(page * 4, page * 4 + 4)) {
        const owned =
          tab === 'skins'
            ? p.owned.includes(item.id)
            : tab === 'weapons'
              ? p.weapons.some((id) => id === item.id)
              : p.armors.some((id) => id === item.id);
        const gate = itemUnlock(item.id),
          locked = shop && !owned && this.context.seals() < gate;
        const selected =
          (tab === 'skins' ? p.skin : tab === 'weapons' ? p.weapon : p.armor) === item.id;
        const info = 'description' in item ? item.description : 'Облик героя';
        const picture =
          tab === 'skins'
            ? `<img src="${this.context.textures.getBase64(item.id)}" alt="">`
            : tab === 'weapons'
              ? `<img src="${this.context.textures.getBase64(`held-${item.id}`)}" alt="">`
              : `<span class="upgrade-icon">${'icon' in item ? item.icon : '◇'}</span>`;
        cards.push(
          `<article class="shop-card">${picture}<h3>${item.name}</h3><p>${info}</p><button ${shop ? 'data-item' : 'data-equip'}="${item.id}" ${selected || (!shop && !owned) || locked || (shop && !owned && p.coins < item.price) ? 'disabled' : ''}>${selected ? 'Выбрано' : owned ? 'Надеть' : locked ? `${gate} печатей · ${item.price} ◈` : shop ? `${item.price} ◈` : 'quest' in item && item.quest ? 'За поручение' : 'В деревне'}</button></article>`,
        );
      }
    }
    return cards.join('');
  }
  applyEquipment(before: ReturnType<typeof stats>): void {
    const { hero, journey, visuals } = this.context;
    const after = stats(journey.profile);
    hero.hp = Math.min(after.maxHP, hero.hp + Math.max(0, after.maxHP - before.maxHP));
    hero.stamina = Math.min(
      after.maxStamina,
      hero.stamina + Math.max(0, after.maxStamina - before.maxStamina),
    );
    hero.flasks = Math.min(after.flasks, hero.flasks + Math.max(0, after.flasks - before.flasks));
    visuals.player.setTexture(journey.profile.skin);
    hero.attackTime = -1;
    visuals.sword.setTexture(weaponTexture(journey.profile.weapon));
    this.context.actors.drawActors();
  }
  equip(id: string): void {
    const { journey } = this.context;
    const p = journey.profile,
      before = stats(p);
    const weapon = WEAPONS.find((w) => w.id === id),
      armor = ARMORS.find((a) => a.id === id);
    if (weapon && p.weapons.includes(weapon.id)) p.weapon = weapon.id;
    else if (armor && p.armors.includes(armor.id)) p.armor = armor.id;
    else if (p.owned.includes(id)) p.skin = id;
    else return;
    journey.dirty = true;
    this.applyEquipment(before);
    this.context.menu.renderEquipment();
    this.context.menu.updateHUD();
  }
  buyItem(id: string): string {
    const { hero, worldState, journey } = this.context;
    const item = SUPPLIES.find((i) => i.id === id);
    if (!item) {
      const weapon = WEAPONS.find((w) => w.id === id);
      if (
        weapon &&
        !journey.profile.weapons.includes(weapon.id) &&
        !villageStock(worldState.villageIndex).includes(weapon.id)
      )
        return 'В этой деревне такое оружие не куют. Посмотри другие посещённые поселения на карте.';
      return purchase(journey.profile, id, this.context.seals());
    }
    if (id === 'field-potion' && journey.profile.potions >= 99) return 'В сумке уже 99 зелий.';
    if (id === 'heal-service' && hero.hp >= stats(journey.profile).maxHP)
      return 'Здоровье уже полное.';
    if (id === 'refill' && hero.flasks >= stats(journey.profile).flasks)
      return 'Все фляги наполнены.';
    if (
      id === 'rest-service' &&
      hero.hp >= stats(journey.profile).maxHP &&
      hero.flasks >= stats(journey.profile).flasks
    )
      return 'Ты уже готов к пути.';
    if (journey.profile.coins < item.price) return 'Не хватает осколков.';
    journey.profile.coins -= item.price;
    if (id === 'field-potion') {
      journey.profile.potions++;
      return `Зелье в сумке: ${journey.profile.potions}. V - выпить в бою.`;
    }
    if (id === 'heal-service') hero.hp = Math.min(stats(journey.profile).maxHP, hero.hp + 50);
    else if (id === 'refill') hero.flasks++;
    else {
      hero.hp = stats(journey.profile).maxHP;
      hero.flasks = stats(journey.profile).flasks;
    }
    this.context.audio.play('heal');
    return `${item.name}: готово.`;
  }
}
