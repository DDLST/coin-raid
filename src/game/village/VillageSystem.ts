import { INTERACT_DISTANCE, WORLD_WIDTH, WORLD_HEIGHT, VILLAGE_NAMES } from '../world/WorldConfig';
import { housePoint, type House, interiorArt } from './VillageLayout';
import { resident, houseName } from './Residents';
import { DELIVERIES } from '../story/StoryContent';
import { deliveryJournal } from '../quests/Journal';
import type { GameScene } from '../GameScene';

/** Дома, собеседники, взаимодействия, доставки и быстрое путешествие. */
export class VillageSystem {
  constructor(private readonly context: GameScene) {}
  updateCamp(): void {
    const { worldState, ui, visuals } = this.context;
    ui.nearestNPC = -1;
    ui.nearestChest = -1;
    ui.nearestProp = -1;
    ui.nearestHouse = -1;
    let nearest = INTERACT_DISTANCE;
    if (worldState.area === 'interior')
      worldState.villagers.forEach((n, i) => {
        if (n.village !== worldState.villageIndex || n.role !== worldState.interiorRole) return;
        const d = Math.hypot(visuals.player.x - n.sprite.x, visuals.player.y - n.sprite.y);
        if (d < nearest) {
          nearest = d;
          ui.nearestNPC = i;
        }
      });
    if (worldState.area === 'village' || worldState.area === 'tutorial')
      worldState.houses.forEach((h, i) => {
        if (h.village !== worldState.villageIndex) return;
        const d = Math.hypot(visuals.player.x - h.door.x, visuals.player.y - h.door.y);
        if (d < nearest) {
          nearest = d;
          ui.nearestHouse = i;
        }
      });
    worldState.chests.forEach((c, i) => {
      if (c.opened || c.region !== worldState.regionIndex || worldState.area !== 'biome') return;
      const d = Math.hypot(c.x - visuals.player.x, c.y - visuals.player.y);
      if (d < nearest) {
        nearest = d;
        ui.nearestChest = i;
      }
    });
    worldState.questProps.forEach((q, i) => {
      if (worldState.area !== 'biome') return;
      const d = Math.hypot(q.point.x - visuals.player.x, q.point.y - visuals.player.y);
      if (d < nearest) {
        nearest = d;
        ui.nearestProp = i;
        ui.nearestChest = -1;
      }
    });
    const leaving =
      worldState.area === 'interior' &&
      visuals.player.y >
        housePoint(worldState.villageIndex, worldState.interiorRole ?? 'smith').y + 70;
    this.context.element('interaction').hidden =
      ui.nearestNPC < 0 &&
      ui.nearestChest < 0 &&
      ui.nearestProp < 0 &&
      ui.nearestHouse < 0 &&
      !leaving;
    this.context.element('interact-button').textContent = leaving
      ? 'E · Выйти на улицу'
      : ui.nearestNPC >= 0
        ? `E · ${resident(worldState.villageIndex, worldState.villagers[ui.nearestNPC].role).name}: поговорить`
        : ui.nearestHouse >= 0
          ? `E · Войти: ${houseName(worldState.villageIndex, worldState.houses[ui.nearestHouse].role)}`
          : ui.nearestProp >= 0
            ? 'E · Прочесть / забрать'
            : 'E · Открыть сундук';
  }
  enterHouse(h: House, preserve = false): void {
    const { worldState, journey, visuals } = this.context;
    const previous = worldState.area;
    this.clearInterior();
    worldState.interiorRole = h.role;
    worldState.interiorReturn =
      previous === 'tutorial'
        ? 'tutorial'
        : worldState.interiorReturn === 'tutorial' && previous === 'interior'
          ? 'tutorial'
          : 'village';
    worldState.area = 'interior';
    worldState.outdoorArt.forEach((o) => o.setVisible(false));
    h.roof.setVisible(false);
    h.label.setVisible(false);
    worldState.interiorShade = this.context.add
      .rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 0x030d10, 0.92)
      .setOrigin(0)
      .setDepth(12.5);
    worldState.interiorLayer = interiorArt(this.context, h).setDepth(14);
    worldState.villagers.forEach((n) =>
      n.sprite.setVisible(n.village === h.village && n.role === h.role),
    );
    if (!preserve) visuals.player.setPosition(h.x, h.y + 85);
    this.context.controls.resetInput();
    this.context.world.configureCamera();
    this.context.actors.drawActors();
    this.context.menu.updateHUD();
    journey.dirty = true;
  }
  clearInterior(): void {
    const { worldState } = this.context;
    worldState.interiorLayer?.destroy(true);
    worldState.interiorLayer = null;
    worldState.interiorShade?.destroy();
    worldState.interiorShade = null;
    worldState.outdoorArt.forEach((o) => o.setVisible(true));
    for (const m of worldState.biomeMoods) if (m) m.inside = undefined;
    for (const h of worldState.houses) {
      h.roof.setVisible(true);
      h.label.setVisible(true);
    }
    worldState.villagers.forEach((n) => {
      n.sprite.setVisible(false);
      n.gesture.setVisible(false);
    });
    worldState.interiorRole = null;
  }
  exitHouse(): void {
    const { worldState, visuals } = this.context;
    const role = worldState.interiorRole;
    if (!role) return;
    const h = worldState.houses.find(
      (h) => h.role === role && h.village === worldState.villageIndex,
    )!;
    this.clearInterior();
    worldState.area = worldState.interiorReturn;
    visuals.player.setPosition(h.door.x, h.door.y + 27);
    this.context.controls.resetInput();
    this.context.world.configureCamera();
    if (this.context.tutorial.trainingArea()) this.context.tutorial.renderLesson();
    this.context.menu.updateHUD();
    this.context.actors.drawActors();
  }
  interact(): void {
    const { worldState, ui, visuals } = this.context;
    if (ui.state !== 'playing') return;
    this.updateCamp();
    if (
      worldState.area === 'interior' &&
      visuals.player.y >
        housePoint(worldState.villageIndex, worldState.interiorRole ?? 'smith').y + 70
    ) {
      this.exitHouse();
      return;
    }
    if (ui.nearestHouse >= 0) {
      this.enterHouse(worldState.houses[ui.nearestHouse]);
      return;
    }
    if (ui.nearestChest >= 0) {
      this.context.quests.openChest(worldState.chests[ui.nearestChest]);
      return;
    }
    if (ui.nearestProp >= 0) {
      this.context.quests.touchQuestProp(worldState.questProps[ui.nearestProp]);
      return;
    }
    if (ui.nearestNPC < 0) return;
    const npc = worldState.villagers[ui.nearestNPC],
      person = resident(npc.village, npc.role);
    ui.dialogRole = npc.role;
    ui.state = 'dialog';
    this.context.controls.resetInput();
    this.context.element('interaction').hidden = true;
    this.context.element<HTMLImageElement>('merchant-portrait').src =
      this.context.textures.getBase64(person.texture);
    this.context.element<HTMLImageElement>('merchant-portrait').alt =
      `${person.name} · ${person.job}`;
    this.context.element('dialog-name').textContent = `${person.name} · ${person.job}`;
    this.context.element('dialog-trade').textContent =
      npc.role === 'smith'
        ? 'Оружие'
        : npc.role === 'armorer'
          ? 'Доспехи'
          : npc.role === 'healer'
            ? 'Лечение и прокачка'
            : 'Усиления и облики';
    this.context.element('dialog-overlay').hidden = false;
    this.context.menu.syncGuide();
    this.say(person.lore);
    this.context.quests.renderQuestTalk();
    this.renderDeliveryTalk();
    this.context.tutorial.lessonEvent('talk');
  }
  say(text: string): void {
    const { ui } = this.context;
    ui.dialogTarget = text;
    ui.dialogTime = 0;
    this.context.element('dialog-text').textContent = '';
  }
  leaveDialog(): void {
    const { ui } = this.context;
    this.context.element('dialog-overlay').hidden = true;
    ui.state = 'playing';
    this.context.controls.resetInput();
    this.context.menu.syncGuide();
  }
  openTravel(): void {
    const { worldState, journey, ui } = this.context;
    if (ui.state !== 'menu' || (worldState.area !== 'village' && worldState.area !== 'interior')) {
      this.context.menu.toast('Переход доступен только из безопасной деревни.');
      return;
    }
    ui.state = 'travel';
    this.context.element('menu-overlay').hidden = true;
    this.context.element('travel-overlay').hidden = false;
    this.context.element('travel-items').innerHTML = [...journey.campVisits]
      .sort((a, b) => a - b)
      .map((i) => {
        const fare = 3 + Math.abs(i - worldState.villageIndex) * 2,
          here = i === worldState.villageIndex;
        return `<article class="travel-card"><strong>${VILLAGE_NAMES[i + 1]}</strong><small>${here ? 'Ты здесь' : `Дорога: ${fare} ◈`}</small><button data-travel="${i}" ${here || journey.profile.coins < fare ? 'disabled' : ''}>${here ? 'Текущая деревня' : 'Отправиться'}</button></article>`;
      })
      .join('');
  }
  closeTravel(): void {
    const { ui } = this.context;
    ui.state = 'menu';
    this.context.element('travel-overlay').hidden = true;
    this.context.element('menu-overlay').hidden = false;
    this.context.menu.renderMenu();
  }
  travelTo(index: number): void {
    const { worldState, journey, ui, visuals } = this.context;
    if (
      ui.state !== 'travel' ||
      !journey.campVisits.has(index) ||
      index === worldState.villageIndex
    )
      return;
    const fare = 3 + Math.abs(index - worldState.villageIndex) * 2;
    if (journey.profile.coins < fare) return;
    journey.profile.coins -= fare;
    this.context.element('travel-overlay').hidden = true;
    this.context.world.startVillage(index);
    visuals.player.setPosition(journey.checkpoint.x, journey.checkpoint.y);
    this.context.cameras.main.centerOn(visuals.player.x, visuals.player.y);
    journey.dirty = true;
    this.context.world.reachCheckpoint(VILLAGE_NAMES[index + 1]);
    this.context.menu.toast(
      `Дорога пройдена. ${resident(index, 'healer').name} поможет с лечением; смерть вернёт к этому костру.`,
    );
    this.context.menu.updateHUD();
  }
  renderDeliveryTalk(): void {
    const { worldState, journey, ui } = this.context;
    const def = DELIVERIES.find((d) => {
        const q = journey.deliveries.find((q) => q.id === d.id)!;
        return (
          !q.claimed &&
          this.context.seals() >= d.seals &&
          ((d.giver === ui.dialogRole && d.from === worldState.villageIndex) ||
            (q.accepted &&
              !q.delivered &&
              d.receiver === ui.dialogRole &&
              d.to === worldState.villageIndex))
        );
      }),
      b = this.context.element<HTMLButtonElement>('dialog-delivery');
    b.disabled = !def;
    const q = def && journey.deliveries.find((q) => q.id === def.id)!;
    b.textContent = !def
      ? 'Доставок пока нет'
      : q?.delivered
        ? 'Награда за доставку'
        : q?.accepted && def.receiver === ui.dialogRole
          ? 'Передать посылку'
          : q?.accepted
            ? 'О доставке'
            : 'Взять доставку';
  }
  talkDelivery(): void {
    const { worldState, journey, ui } = this.context;
    const def = DELIVERIES.find((d) => {
      const q = journey.deliveries.find((q) => q.id === d.id)!;
      return (
        !q.claimed &&
        this.context.seals() >= d.seals &&
        ((d.giver === ui.dialogRole && d.from === worldState.villageIndex) ||
          (q.accepted &&
            !q.delivered &&
            d.receiver === ui.dialogRole &&
            d.to === worldState.villageIndex))
      );
    });
    if (!def) return;
    const q = journey.deliveries.find((q) => q.id === def.id)!;
    if (q.delivered && def.giver === ui.dialogRole) {
      q.claimed = true;
      journey.profile.coins += def.reward;
      journey.profile.skillPoints++;
      this.context.audio.play('loot');
      this.say(
        `${def.response} Награда: ${def.reward} осколков и искра мастерства. Спасибо, что вернулся.`,
      );
    } else if (q.accepted && def.receiver === ui.dialogRole && def.to === worldState.villageIndex) {
      q.delivered = true;
      this.say(
        `${def.response} Теперь вернись в ${VILLAGE_NAMES[def.from + 1]}: ${resident(def.from, def.giver).name} выдаст награду.`,
      );
    } else {
      q.accepted = true;
      journey.profile.trackedQuest = `delivery:${q.id}`;
      this.say(
        `${def.name}. ${deliveryJournal(q).why} Посылка «${def.parcel}» в твоей сумке. Из деревни открой Tab → Путь → Дорога между деревнями. Запись и метка получателя: Задания → Доставки.`,
      );
    }
    this.context.quests.syncAchievements();
    journey.dirty = true;
    this.renderDeliveryTalk();
  }
}
