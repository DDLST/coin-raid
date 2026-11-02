import Phaser from 'phaser';
import { BRIEFING_CARDS, GAME_CONFIG, PROFILE_KEY, REGIONS, SKILL_KEYS } from '../Constants';
import { stats } from '../combat/CombatRules';
import { type GameScene } from '../GameScene';
import { weaponFor } from '../progression/PlayerProgression';
import { learnSkill, refundBranch, toggleSkill } from '../progression/Skills';
import { resident } from '../village/Residents';
import { type MenuTab } from './InterfaceState';

/** Привязка DOM-кнопок, клавиатуры и мыши, сброс ввода и полноэкранный режим. */
export class InputController {
  private readonly disposers: (() => void)[] = [];
  constructor(private readonly context: GameScene) {}
  bindControls(): void {
    this.destroy();
    const { hero, worldState, journey, ui } = this.context;
    ui.listeners = new AbortController();
    const signal = ui.listeners.signal;
    const click = (id: string, fn: () => void) =>
      this.context.element(id).addEventListener('click', fn, { signal });
    click('primary-button', () => this.context.menu.primaryAction());
    click('restart-button', () => this.context.menu.requestNew());
    click('new-button', () => this.context.menu.requestNew());
    click('menu-button', () => this.context.menu.toggleMenu());
    click('menu-close', () => this.context.menu.toggleMenu());
    click('pause-button', () => {
      if (this.context.flow.state === 'menu') {
        this.context.menu.toggleMenu();
      }
      this.context.menu.togglePause();
    });
    click('help-button', () => {
      if (this.context.flow.state === 'menu') {
        this.context.menu.toggleMenu();
      }
      this.context.menu.toggleGuide();
    });
    click('guide-close', () => this.context.menu.toggleGuide(false));
    click('map-button', () => this.context.map.toggleMap());
    click('map-close', () => this.context.map.toggleMap());
    click('fullscreen-button', () => this.fullscreen());
    const fullscreen = () => this.fullscreen();
    ui.keys.F.on('down', fullscreen);
    this.disposers.push(() => ui.keys.F.off('down', fullscreen));
    click('save-button', () => this.context.saves.saveProgress());
    click('modal-save', () => this.context.saves.saveProgress());
    click('load-button', () => this.context.saves.loadProgress());
    click('load-start', () => this.context.saves.loadProgress());
    click('delete-save', () => {
      try {
        localStorage.removeItem(PROFILE_KEY);
        journey.saved = null;
        this.context.saves.refreshSaveUI();
        this.context.menu.toast('Ручное сохранение удалено. Текущая игра продолжается.');
      } catch {
        this.context.menu.toast('Браузер не разрешает удалить сохранение.');
      }
    });
    for (const b of document.querySelectorAll<HTMLButtonElement>('[data-menu-tab]')) {
      b.addEventListener(
        'click',
        () => {
          ui.menuTab = b.dataset.menuTab as MenuTab;
          this.context.menu.renderMenu();
          if (ui.menuTab === 'equipment') {
            this.context.tutorial.lessonEvent('inventory');
          }
        },
        { signal },
      );
    }
    for (const b of document.querySelectorAll<HTMLButtonElement>('[data-equipment]')) {
      b.addEventListener(
        'click',
        () => {
          ui.equipmentTab = b.dataset.equipment as typeof ui.equipmentTab;
          ui.equipmentPage = 0;
          this.context.menu.renderEquipment();
        },
        { signal },
      );
    }
    click('equipment-prev', () => {
      ui.equipmentPage = Math.max(0, ui.equipmentPage - 1);
      this.context.menu.renderEquipment();
    });
    click('equipment-next', () => {
      ui.equipmentPage++;
      this.context.menu.renderEquipment();
    });
    this.context.element('equipment-items').addEventListener(
      'click',
      (e) => {
        const b =
          e.target instanceof Element ? e.target.closest<HTMLButtonElement>('[data-equip]') : null;
        if (b?.dataset.equip) {
          this.context.economy.equip(b.dataset.equip);
        }
      },
      { signal },
    );
    for (const b of document.querySelectorAll<HTMLButtonElement>('[data-quest-view]')) {
      b.addEventListener(
        'click',
        () => {
          ui.questView = b.dataset.questView as typeof ui.questView;
          ui.questPage = 0;
          this.context.quests.renderQuests();
        },
        { signal },
      );
    }
    click('quest-prev', () => {
      ui.questPage = Math.max(0, ui.questPage - 1);
      this.context.quests.renderQuests();
    });
    click('quest-next', () => {
      ui.questPage++;
      this.context.quests.renderQuests();
    });
    this.context.element('quest-items').addEventListener(
      'click',
      (e) => {
        const b =
          e.target instanceof Element
            ? e.target.closest<HTMLButtonElement>('[data-track-quest]')
            : null;
        if (b?.dataset.trackQuest) {
          this.context.quests.trackQuest(b.dataset.trackQuest);
        }
      },
      { signal },
    );
    for (const b of document.querySelectorAll<HTMLButtonElement>('[data-map-mode]')) {
      b.addEventListener(
        'click',
        () => {
          ui.mapMode = b.dataset.mapMode as typeof ui.mapMode;
          if (ui.mapMode === 'local') {
            ui.mapFocusRegion = null;
            ui.mapFocusVillage = null;
          }
          this.context.map.drawMaps();
        },
        { signal },
      );
    }
    this.context.element('map-regions').addEventListener(
      'click',
      (e) => {
        const b =
          e.target instanceof Element
            ? e.target.closest<HTMLButtonElement>('[data-map-region]')
            : null;
        if (!b || b.disabled) {
          return;
        }
        ui.mapFocusRegion = Number(b.dataset.mapRegion);
        ui.mapFocusVillage = null;
        ui.mapMode = 'local';
        this.context.map.drawMaps();
      },
      { signal },
    );
    click('quest-retry', () => {
      const q = journey.quests[worldState.regionIndex].find((q) => q.id === 'sprint');
      if (q && !q.complete) {
        q.failed = false;
        q.progress = 0;
        q.elapsed = 0;
        journey.dirty = true;
        this.context.menu.renderMenu();
        this.context.menu.toast('Испытание начнётся после закрытия меню.');
      }
    });
    for (const key of ['master', 'music', 'effects'] as const) {
      this.context.element<HTMLInputElement>(`volume-${key}`).addEventListener(
        'input',
        (e) => {
          this.context.audio.unlock();
          this.context.audio.setSettings({
            [key]: Number((e.target as HTMLInputElement).value) / 100,
          });
          journey.dirty = true;
        },
        { signal },
      );
    }
    click('mute-button', () => {
      this.context.audio.unlock();
      this.context.audio.setSettings({
        muted: !this.context.audio.settings.muted,
      });
      journey.dirty = true;
      this.context.menu.renderAudio();
    });
    click('interact-button', () => this.context.village.interact());
    click('intro-skip', () => this.context.story.finishIntro());
    click('loot-close', () => {
      if (ui.lootLeft > 0) {
        return;
      }
      this.context.element('loot-overlay').hidden = true;
      this.context.flow.transitionTo('playing');
      this.resetInput();
    });
    this.bindPointer('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.wasTouch || this.context.flow.state !== 'playing') {
        return;
      }
      ui.mouse = { x: p.x, y: p.y };
    });
    this.bindPointer('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.context.flow.state !== 'playing' || p.wasTouch) {
        return;
      }
      this.context.audio.unlock();
      ui.mouse = { x: p.x, y: p.y };
      this.context.player.updateAim();
      if (p.button === 2) {
        this.context.combat.secondaryAttack();
        return;
      }
      if (p.button === 0) {
        ui.mouseHeld = true;
        this.context.combat.attack();
      }
    });
    this.context.input.mouse?.disableContextMenu();
    this.bindPointer('pointerup', () => {
      ui.mouseHeld = false;
    });
    window.addEventListener(
      'pointerup',
      () => {
        ui.mouseHeld = false;
      },
      { signal },
    );
    window.addEventListener(
      'blur',
      () => {
        this.resetInput();
        if (this.context.flow.state === 'playing') {
          this.context.menu.togglePause();
        }
      },
      { signal },
    );
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.hidden) {
          this.resetInput();
          if (this.context.flow.state === 'playing') {
            this.context.menu.togglePause();
          }
        }
      },
      { signal },
    );
    click('dialog-trade', () => this.context.economy.openShop());
    click('dialog-road', () =>
      this.context.village.say(resident(worldState.villageIndex, ui.dialogRole).lore),
    );
    click('dialog-combat', () =>
      this.context.village.say(
        `Впереди ${REGIONS[Math.min(REGIONS.length - 1, worldState.villageIndex + 1)].bossName}. Красная метка предупреждает об атаке. C парирует, а точное парирование открывает ЛКМ-контрудар. Меч также парирует на ПКМ; копьё делает тяжёлый выпад; секира бьёт вокруг; посох оставляет печать. Смерть вернёт тебя в последнюю посещённую деревню.`,
      ),
    );
    click('dialog-delivery', () => this.context.village.talkDelivery());
    click('travel-open', () => this.context.village.openTravel());
    click('travel-close', () => this.context.village.closeTravel());
    this.context.element('travel-items').addEventListener(
      'click',
      (e) => {
        const b =
          e.target instanceof Element ? e.target.closest<HTMLButtonElement>('[data-travel]') : null;
        if (b && !b.disabled) {
          this.context.village.travelTo(Number(b.dataset.travel));
        }
      },
      { signal },
    );
    this.context.element('skill-items').addEventListener(
      'click',
      (e) => {
        const b =
          e.target instanceof Element
            ? e.target.closest<HTMLButtonElement>('[data-skill], [data-skill-toggle]')
            : null;
        if (!b || b.disabled) {
          return;
        }
        if (b.dataset.skill) {
          this.context.element('skill-message').textContent = learnSkill(
            journey.profile,
            b.dataset.skill,
            this.context.seals(),
          );
          this.context.achievements.syncAchievements();
        } else if (b.dataset.skillToggle) {
          toggleSkill(journey.profile, b.dataset.skillToggle);
          this.context.element('skill-message').textContent =
            'Панель изменена. Перезарядка приёма сохраняется.';
        }
        journey.dirty = true;
        this.context.menu.renderSkills();
        this.context.hud.updateHUD();
      },
      { signal },
    );
    click('skill-reset', () => {
      const points = refundBranch(journey.profile, weaponFor(journey.profile).style);
      if (!points) {
        return;
      }
      hero.activeSkill = null;
      hero.attackTime = -1;
      this.context.element('skill-message').textContent =
        `Возвращено ${points} искр. Купленные приёмы сохранены; повторная оплата не нужна.`;
      journey.dirty = true;
      this.context.menu.renderSkills();
      this.context.hud.updateHUD();
    });
    click('achievement-prev', () => {
      ui.achievementPage = Math.max(0, ui.achievementPage - 1);
      this.context.achievements.renderAchievements();
    });
    click('achievement-next', () => {
      ui.achievementPage++;
      this.context.achievements.renderAchievements();
    });
    click('dialog-skip', () => {
      ui.dialogTime = ui.dialogTarget.length / GAME_CONFIG.dialogCharactersPerSecond + 1;
      this.context.element('dialog-text').textContent = ui.dialogTarget;
    });
    click('dialog-quest', () => this.context.quests.talkQuest());
    click('dialog-leave', () => this.context.village.leaveDialog());
    click('shop-close', () => {
      this.context.element('shop-overlay').hidden = true;
      this.context.flow.transitionTo('dialog');
      this.context.element('dialog-overlay').hidden = false;
      this.context.village.say(
        'Снаряжение останется после смерти. Перед закрытием сохрани путешествие вручную.',
      );
    });
    for (const tab of ['weapons', 'armors', 'upgrades', 'skins', 'supplies', 'growth'] as const) {
      click(`tab-${tab}`, () => {
        ui.shopTab = tab;
        ui.shopPage = 0;
        this.context.economy.renderShop();
      });
    }
    click('shop-prev', () => {
      ui.shopPage = Math.max(0, ui.shopPage - 1);
      this.context.economy.renderShop();
    });
    click('shop-next', () => {
      ui.shopPage++;
      this.context.economy.renderShop();
    });
    click('briefing-next', () => {
      if (ui.briefingPage < BRIEFING_CARDS.length - 1) {
        ui.briefingPage++;
        this.context.tutorial.renderBriefing();
      } else {
        this.context.tutorial.startLessons();
      }
    });
    click('briefing-start', () => this.context.tutorial.startLessons());
    click('training-yes', () => this.context.story.newJourney(true));
    click('training-no', () => this.context.story.newJourney(false));
    click('training-skip', () => this.context.tutorial.finishTutorial());
    click('story-next', () => this.context.story.advanceStory());
    click('story-skip', () => this.context.story.finishStory());
    click('quit-button', () => this.context.menu.confirmExit('title'));
    click('confirm-cancel', () => this.context.menu.cancelExit());
    click('confirm-save', () => {
      this.context.saves.saveProgress();
      if (!journey.dirty) {
        this.context.menu.commitExit();
      }
    });
    click('confirm-discard', () => this.context.menu.commitExit());
    window.addEventListener(
      'beforeunload',
      (e) => {
        if (journey.dirty) {
          e.preventDefault();
          e.returnValue = '';
        }
      },
      { signal },
    );
    this.context.element('shop-items').addEventListener(
      'click',
      (e) => {
        const b =
          e.target instanceof Element ? e.target.closest<HTMLButtonElement>('[data-item]') : null;
        if (!b?.dataset.item || b.disabled) {
          return;
        }
        const before = stats(journey.profile);
        journey.dirty = true;
        this.context.element('shop-message').textContent = this.context.economy.buyItem(
          b.dataset.item,
        );
        this.context.economy.applyEquipment(before);
        this.context.economy.renderShop();
        this.context.hud.updateHUD();
      },
      { signal },
    );
  }
  fullscreen(): void {
    const operation = document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen?.();
    operation?.catch(() =>
      this.context.menu.toast(
        'Игра уже занимает всю страницу. Полный экран недоступен в этом браузере.',
      ),
    );
  }
  resetInput(): void {
    const { hero, ui } = this.context;
    hero.velocity = { x: 0, y: 0 };
    ui.mouseHeld = false;
    this.context.input.keyboard?.resetKeys();
  }

  updateGlobal(): boolean {
    const { flow, ui } = this.context;
    const pressed = (name: string) => Phaser.Input.Keyboard.JustDown(ui.keys[name]);
    if (pressed('H')) {
      this.context.menu.toggleGuide();
    }
    if (pressed('M')) {
      this.context.map.toggleMap();
    }
    if (pressed('TAB')) {
      this.context.menu.toggleMenu();
      return true;
    }
    switch (flow.state) {
      case 'travel':
        if (pressed('ESC')) {
          this.context.village.closeTravel();
        }
        return false;
      case 'menu':
        if (pressed('ESC')) {
          this.context.menu.toggleMenu();
        }
        return false;
      case 'map':
        if (pressed('ESC')) {
          this.context.map.toggleMap();
        }
        return false;
      case 'dialog':
        if (pressed('ESC')) {
          this.context.village.leaveDialog();
        }
        return false;
      case 'shop':
        if (pressed('ESC')) {
          this.context.element('shop-close').click();
        }
        return false;
      case 'story':
      case 'confirm':
      case 'loot':
      case 'intro':
        return false;
    }
    if (pressed('ESC')) {
      if (flow.state === 'paused') {
        this.context.menu.togglePause();
      } else {
        this.context.menu.toggleMenu();
      }
      return true;
    }
    if (pressed('P')) {
      this.context.menu.togglePause();
    }
    if (pressed('ENTER') && !flow.playing) {
      this.context.menu.primaryAction();
    }
    return false;
  }

  updatePlaying(): void {
    const { ui } = this.context;
    const pressed = (name: string) => Phaser.Input.Keyboard.JustDown(ui.keys[name]);
    if (ui.keys.J.isDown || ui.mouseHeld) {
      this.context.combat.attack();
    }
    if (pressed('SPACE') || pressed('SHIFT')) {
      this.context.player.dodge();
    }
    if (pressed('C')) {
      this.context.combat.parry();
    }
    for (const [index, key] of SKILL_KEYS.entries()) {
      if (pressed(key)) {
        this.context.combat.useSkill(index + 1);
      }
    }
    if (pressed('Q')) {
      this.context.player.heal();
    }
    if (pressed('V')) {
      this.context.player.heal(true);
    }
    if (pressed('R')) {
      this.context.ultimate.useUltimate();
    }
    if (pressed('E')) {
      this.context.village.interact();
    }
  }

  private bindPointer(event: string, handler: (pointer: Phaser.Input.Pointer) => void): void {
    const input = this.context.input;
    input.on(event, handler);
    this.disposers.push(() => input.off(event, handler));
  }

  destroy(): void {
    this.context.ui.listeners?.abort();
    for (const dispose of this.disposers) {
      dispose();
    }
    this.disposers.length = 0;
  }
}
