import {
  ARMORS,
  INTERACT_DISTANCE,
  LOOT_ODDS,
  SKINS,
  UI_CONFIG,
  UPGRADES,
  WEAPONS,
} from '../Constants';
import { stats } from '../combat/CombatRules';
import { type GameScene } from '../GameScene';
import { type SavedChest } from '../persistence/SaveSchema';
import { isAttribute } from '../progression/PlayerProgression';
import { type Chest } from '../world/WorldState';
import { rollLoot } from './LootRollRules';
import { newQuests } from './TrialRules';

/** Сундуки, выбор награды и её однократное начисление. */
export class LootSystem {
  constructor(private readonly context: GameScene) {}

  resetAttemptRewards(index: number): void {
    const { worldState, journey } = this.context;
    for (const chest of worldState.chests.filter((c) => c.region === index)) {
      chest.sprite.destroy();
    }
    worldState.chests = worldState.chests.filter((c) => c.region !== index);
    journey.quests[index] = newQuests(index);
    if (journey.profile.trackedQuest.startsWith('trial:')) {
      journey.profile.trackedQuest = '';
    }
  }

  spawnChest(data: SavedChest): void {
    const { worldState } = this.context;
    if (worldState.chests.some((c) => c.region === data.region && c.quest === data.quest)) {
      return;
    }
    const sprite = this.context.add
      .image(data.x, data.y, data.opened ? 'chest-open' : 'chest')
      .setDisplaySize(69, 69)
      .setDepth(18 + data.y * 0.01);
    if (data.opened) {
      sprite.setAlpha(0.55);
    }
    worldState.chests.push({ ...data, sprite });
  }

  openChest(chest: Chest): void {
    const { worldState, journey, ui, visuals } = this.context;
    if (
      chest.opened ||
      Math.hypot(chest.x - visuals.player.x, chest.y - visuals.player.y) > INTERACT_DISTANCE
    ) {
      return;
    }
    chest.opened = true;
    chest.sprite.setTexture('chest-open').setAlpha(0.55);
    this.context.flow.transitionTo('loot');
    this.context.controls.resetInput();
    this.context.element('interaction').hidden = true;
    ui.loot = rollLoot(journey.profile, worldState.regionIndex);
    ui.lootLeft = UI_CONFIG.lootDuration;
    this.context.element('loot-overlay').hidden = false;
    this.context.element('loot-odds').textContent = LOOT_ODDS;
    this.context.element('loot-result').textContent = 'Эхо выбирает награду…';
    this.context.element<HTMLButtonElement>('loot-close').disabled = true;
    const entries = Array.from({ length: UI_CONFIG.lootEntries }, (_, i) =>
      i === UI_CONFIG.lootWinner ? ui.loot! : rollLoot(journey.profile, worldState.regionIndex),
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
      this.context.element('loot-overlay').querySelector('.roulette')?.clientWidth ??
      UI_CONFIG.lootFallbackWidth;
    track.style.transition = UI_CONFIG.lootTransition;
    track.style.transform = `translateX(${width / 2 - UI_CONFIG.lootWinner * UI_CONFIG.lootCellWidth - UI_CONFIG.lootCellCenter}px)`;
    this.context.audio.play('loot');
  }

  applyLoot(): void {
    const { hero, worldState, journey, ui } = this.context;
    const loot = ui.loot;
    if (!loot) {
      return;
    }
    ui.loot = null;
    const before = stats(journey.profile);
    if (loot.kind === 'souls') {
      this.context.economy.grantCoins(loot.value, worldState.regionIndex, false);
    } else if (loot.kind === 'heal') {
      hero.hp = stats(journey.profile).maxHP;
      hero.flasks = Math.min(stats(journey.profile).flasks, hero.flasks + 1);
    } else if (loot.kind === 'item' && loot.item) {
      const skin = SKINS.find((s) => s.id === loot.item);
      const weapon = WEAPONS.find((w) => w.id === loot.item);
      const armor = ARMORS.find((a) => a.id === loot.item);
      const upgrade = UPGRADES.find((u) => u.id === loot.item);
      if (skin && !journey.profile.owned.includes(skin.id)) {
        journey.profile.owned.push(skin.id);
      } else if (weapon && !journey.profile.weapons.includes(weapon.id)) {
        journey.profile.weapons.push(weapon.id);
      } else if (armor && !journey.profile.armors.includes(armor.id)) {
        journey.profile.armors.push(armor.id);
      } else if (upgrade && isAttribute(upgrade.id)) {
        if (upgrade.id === 'vitality') {
          journey.profile.healthLevel++;
        } else {
          journey.profile.enduranceLevel++;
        }
      } else if (upgrade) {
        journey.profile.upgrades[upgrade.id] = Math.min(
          upgrade.prices.length,
          journey.profile.upgrades[upgrade.id] + 1,
        );
      }
    }
    this.context.economy.applyEquipment(before);
    this.context.element('loot-result').textContent =
      loot.kind === 'empty'
        ? 'Сундук пуст. Следующее эхо может быть щедрее.'
        : `Получено: ${loot.name}`;
    this.context.element('loot-result').style.color = loot.color;
    this.context.element<HTMLButtonElement>('loot-close').disabled = false;
    this.context.audio.play(loot.kind === 'empty' ? 'empty' : 'loot');
    this.context.hud.updateHUD();
  }

  updateLoot(dt: number): void {
    const { ui } = this.context;
    ui.lootLeft -= dt;
    if (ui.lootLeft <= 0 && ui.loot) {
      this.applyLoot();
    }
  }
}
