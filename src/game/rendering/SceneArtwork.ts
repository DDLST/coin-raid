import { ARTWORK_READY_KEY, ATLAS_ASSETS, WEAPON_ART } from '../Constants';
import { type GameScene } from '../GameScene';
import {
  createAtlasArtwork,
  createCombatArtwork,
  createCreepyArtwork,
  createDetailArtwork,
  createEquipmentArtwork,
  createResidentArtwork,
} from './textures/AtlasTextures';
import { createArtwork } from './textures/BaseTextures';
import {
  createArmArtwork,
  createArmedMotionArtwork,
  createHeroArtwork,
  createRollArtwork,
  createStrideArtwork,
} from './textures/CharacterTextures';
import { createMysticArtwork } from './textures/EnemyTextures';
import { createVillageArtwork } from './textures/VillageTextures';
import { weaponTexture } from './WeaponAnimation';

/** Загрузка рисунков и создание графических объектов одной сцены. */
export function preloadSceneArtwork(scene: GameScene): void {
  scene.load.on('progress', (value: number) => {
    scene.element('title-status').textContent = `Подготовка мира: ${Math.round(value * 100)}%`;
  });
  scene.load.on('loaderror', () => {
    scene.element('title-status').textContent = 'Файл игры не загрузился. Обнови страницу.';
  });
  for (const atlas of ATLAS_ASSETS) {
    if (!scene.textures.exists(atlas.key)) {
      scene.load.image(atlas.key, atlas.url);
    }
  }
}

export function createSceneArtwork(scene: GameScene): void {
  if (!scene.textures.exists(ARTWORK_READY_KEY)) {
    createArtwork(scene);
    createMysticArtwork(scene);
    createVillageArtwork(scene);
    createAtlasArtwork(scene);
    createCreepyArtwork(scene);
    createHeroArtwork(scene);
    createDetailArtwork(scene);
    createCombatArtwork(scene);
    createEquipmentArtwork(scene);
    createArmArtwork(scene);
    createArmedMotionArtwork(scene);
    createStrideArtwork(scene);
    createRollArtwork(scene);
    createResidentArtwork(scene);
    scene.textures.createCanvas(ARTWORK_READY_KEY, 1, 1)?.refresh();
  }
  scene.scenery.drawWorld();
  scene.worldState.outdoorArt = [...scene.children.list] as typeof scene.worldState.outdoorArt;
  scene.visuals.gateInk = scene.add.graphics().setDepth(700);
  scene.visuals.weatherInk = scene.add.graphics().setDepth(6);
  scene.visuals.playerShadow = scene.add.ellipse(140, 550, 35, 14, 0x09291b, 0.34).setDepth(8);
  scene.visuals.player = scene.add
    .image(140, 550, 'fox')
    .setOrigin(0.5, 0.68)
    .setDisplaySize(92, 92)
    .setDepth(20);
  scene.visuals.arms = Array.from({ length: 2 }, () => ({
    upper: scene.add.image(0, 0, 'hero-upper').setOrigin(0.5, 0).setVisible(false),
    forearm: scene.add.image(0, 0, 'hero-forearm').setOrigin(0.5, 0).setVisible(false),
    hand: scene.add.image(0, 0, 'hand-grip').setOrigin(0.5, 0.35).setVisible(false),
  }));
  scene.visuals.sword = scene.add
    .image(0, 0, weaponTexture('sword'))
    .setDisplaySize(100, 100)
    .setOrigin(WEAPON_ART.sword.gripX, WEAPON_ART.sword.gripY)
    .setVisible(false)
    .setDepth(21);
  scene.visuals.armorSprite = scene.add
    .image(140, 550, 'armor-ranger')
    .setDisplaySize(72, 72)
    .setVisible(false)
    .setDepth(22);
  scene.visuals.combatInk = scene.add.graphics().setDepth(500);
  scene.visuals.reaperInk = scene.add.graphics().setDepth(740);
  scene.visuals.reaper = scene.add
    .image(0, 0, 'weapon-reaper')
    .setDisplaySize(225, 225)
    .setDepth(750)
    .setVisible(false);
  scene.visuals.stolenWeapon = scene.add
    .image(0, 0, weaponTexture('sword'))
    .setDepth(755)
    .setVisible(false);
}
