import {
  REGIONS,
  regionStart,
  REGION_WIDTH,
  WORLD_HEIGHT,
  villagePosition,
  regionEnd,
  PROLOGUE_WIDTH,
  ROAD_WIDTH,
  VILLAGE_NAMES,
} from './WorldConfig';
import { regionTerrain, makeGrid } from './Navigation';
import { PEOPLE } from '../story/StoryContent';
import { housePoint } from '../village/VillageLayout';
import Phaser from 'phaser';
import { background, mergeScenery, biomeGround } from '../rendering/TextureFactory';
import { createBiomeMood } from '../rendering/Atmosphere';
import { houseName, resident } from '../village/Residents';
import type { GameScene } from '../GameScene';

/** Создание декораций биомов и деревень с ленивой загрузкой. */
export class WorldRenderer {
  constructor(private readonly context: GameScene) {}
  drawWorld(): void {
    const { worldState } = this.context;
    for (let i = 0; i < REGIONS.length; i++) {
      const terrain = regionTerrain(i, regionStart(i), REGION_WIDTH, WORLD_HEIGHT);
      worldState.terrainByRegion[i] = terrain;
      worldState.terrain.push(...terrain);
      worldState.nav[i] = makeGrid(terrain, this.context.world.regionBounds(i), 1, 20);
      worldState.bossNav[i] = makeGrid(terrain, this.context.world.regionBounds(i), 1, 35);
    }
    for (let i = -1; i < REGIONS.length - 1; i++) {
      for (const person of PEOPLE)
        worldState.terrain.push({
          kind: 'ruin',
          ...housePoint(i, person.role),
          radius: 94,
        });
      const center = villagePosition(i);
      worldState.terrain.push(
        { kind: 'ruin', x: center.x - 85, y: 458, radius: 28 },
        { kind: 'ruin', x: center.x - 300, y: 611, radius: 40 },
      );
    }
    this.ensureVillageArt(-1);
  }
  rememberScenery(before: Set<Phaser.GameObjects.GameObject>): void {
    const { worldState } = this.context;
    worldState.outdoorArt.push(
      ...(this.context.children.list.filter((o) => !before.has(o)) as typeof worldState.outdoorArt),
    );
  }
  ensureRegionArt(i: number): void {
    const { worldState } = this.context;
    if (worldState.drawnRegions.has(i)) return;
    worldState.drawnRegions.add(i);
    const before = new Set(this.context.children.list),
      road = this.context.add.graphics().setDepth(1);
    const start = regionStart(i),
      region = REGIONS[i],
      floorKey = background(this.context, REGION_WIDTH, WORLD_HEIGHT, i + 1, region.palette),
      floor = this.context.add.image(start, 0, floorKey).setOrigin(0).setDepth(0),
      terrainImages: Phaser.GameObjects.Image[] = [];
    road.lineStyle(86, 0xcbb991, 0.19);
    road.beginPath();
    road.moveTo(start, 550);
    road.lineTo(start + 210, 550);
    road.lineTo(start + 500, 473);
    road.lineTo(start + 870, 627);
    road.lineTo(start + REGION_WIDTH, 550);
    road.strokePath();
    mergeScenery(road, floorKey, start, REGION_WIDTH, WORLD_HEIGHT);
    biomeGround(this.context, start, i, REGION_WIDTH, WORLD_HEIGHT, region.palette, floorKey);
    const terrain = worldState.terrainByRegion[i];
    for (const t of terrain) {
      if (
        Math.abs(t.x - (start + REGION_WIDTH * 0.65)) < 1 &&
        Math.abs(t.y - WORLD_HEIGHT * 0.25) < 1
      )
        continue;
      terrainImages.push(
        this.context.add
          .image(t.x, t.y, t.kind)
          .setOrigin(0.5, t.kind === 'tree' ? 0.82 : t.kind === 'stump' ? 0.61 : 0.5)
          .setDisplaySize(
            t.kind === 'tree' ? 125 : t.kind === 'puddle' ? t.radius * 2.5 : 82,
            t.kind === 'tree' ? 125 : t.kind === 'puddle' ? t.radius * 2.5 : 82,
          )
          .setDepth(t.kind === 'puddle' ? 2 : 10 + t.y * 0.01),
      );
    }
    worldState.biomeMoods[i] = createBiomeMood(
      this.context,
      floor,
      terrainImages,
      start,
      REGION_WIDTH,
      WORLD_HEIGHT,
      i,
    );
    this.context.add
      .text(start + 106, 435, `${i + 1} · ${region.name}`, {
        fontFamily: 'system-ui',
        fontSize: '15px',
        color: '#e8d299',
        backgroundColor: '#1e3f31',
        padding: { x: 12, y: 7 },
      })
      .setDepth(3);
    this.rememberScenery(before);
  }
  ensureVillageArt(i: number): void {
    const { worldState } = this.context;
    if (i < -1 || i >= REGIONS.length - 1 || worldState.drawnVillages.has(i)) return;
    worldState.drawnVillages.add(i);
    const before = new Set(this.context.children.list),
      road = this.context.add.graphics().setDepth(1);
    const center = villagePosition(i),
      left = i < 0 ? 0 : regionEnd(i),
      width = i < 0 ? PROLOGUE_WIDTH : ROAD_WIDTH,
      palette = REGIONS[Math.max(0, i)].palette;
    const floorKey = background(this.context, width, WORLD_HEIGHT, 31 + i, palette);
    this.context.add.image(left, 0, floorKey).setOrigin(0).setDepth(0);
    road.lineStyle(100, 0xd3bf86, 0.24);
    road.lineBetween(left, 550, left + width, 550);
    road.lineStyle(42, 0xcbb691, 0.3);
    road.lineBetween(center.x - 205, 415, center.x - 205, 950);
    road.lineBetween(center.x + 205, 415, center.x + 205, 950);
    this.context.add
      .text(center.x, 480, VILLAGE_NAMES[i + 1], {
        fontFamily: 'system-ui',
        fontSize: '21px',
        color: '#f3e1ac',
        backgroundColor: '#163a30',
        padding: { x: 15, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(10);
    for (const [n, person] of PEOPLE.entries()) {
      const at = housePoint(i, person.role),
        door = { x: at.x, y: at.y + 130 };
      const roof = this.context.add
        .image(at.x, at.y, `building-${n}`)
        .setDisplaySize(240, 303)
        .setDepth(10);
      const label = this.context.add
        .text(door.x, door.y + 6, houseName(i, person.role), {
          fontFamily: 'system-ui',
          fontSize: '13px',
          color: '#f0e1b3',
          backgroundColor: '#15362acc',
          padding: { x: 7, y: 4 },
        })
        .setOrigin(0.5)
        .setDepth(12);
      worldState.houses.push({
        village: i,
        role: person.role,
        ...at,
        door,
        roof,
        label,
      });
      const sprite = this.context.add
        .image(at.x + 15, at.y - 27, resident(i, person.role).texture)
        .setDisplaySize(86, 86)
        .setDepth(20 + (at.y - 27) * 0.01)
        .setVisible(false);
      const gesture = this.context.add.graphics();
      worldState.villagers.push({
        village: i,
        role: person.role,
        sprite,
        gesture,
        near: false,
        greetUntil: 0,
      });
      if (i >= 0 && person.role === 'smith') worldState.merchants[i] = sprite;
      if (person.role === 'smith') {
        const ember = this.context.add
          .image(at.x - 56, at.y + 40, 'fire')
          .setDisplaySize(24, 30)
          .setAlpha(0.65)
          .setDepth(11);
        this.context.tweens.add({
          targets: ember,
          alpha: 0.95,
          yoyo: true,
          repeat: -1,
          duration: 450 + i * 13,
        });
      }
    }
    for (const [key, dx, y, size] of [
      ['village-well', -85, 442, 100],
      ['village-wagon', -300, 595, 132],
      ['village-shrine', 290, 660, 110],
      ['village-board', 95, 410, 100],
    ] as const) {
      this.context.add
        .image(center.x + dx, y, key)
        .setDisplaySize(size, size)
        .setDepth(9);
    }
    const garden = this.context.add.graphics().setDepth(4);
    for (let n = 0; n < 80; n++) {
      const side = n % 2 ? 1 : -1,
        x = center.x + side * (280 + ((n * 47) % 75)),
        y = 190 + ((n * 59) % 720);
      garden.lineStyle(1, 0x426c43, 0.8);
      garden.lineBetween(x, y, x - 2, y - 7);
      garden.fillStyle(n % 3 ? 0xd9c18d : 0xb48ab0, 0.85);
      garden.fillCircle(x - 2, y - 8, 2);
    }
    const detail = this.context.add.graphics().setDepth(4);
    detail.lineStyle(4, 0xb29c76, 0.65);
    for (let n = 0; n < 7; n++) {
      const x = center.x - 97 + n * 32;
      detail.lineBetween(x, 688, x, 726);
    }
    detail.lineBetween(center.x - 102, 705, center.x + 102, 705);
    for (const side of [-1, 1]) {
      detail.fillStyle(0xead085, 0.12);
      detail.fillCircle(center.x + side * 142, 545, 33);
      detail.lineStyle(3, 0x6d563e, 1);
      detail.lineBetween(center.x + side * 142, 520, center.x + side * 142, 580);
      detail.fillStyle(0xf3d796, 0.85);
      detail.fillRoundedRect(center.x + side * 142 - 8, 515, 16, 22, 4);
    }
    worldState.fires.push(
      this.context.add
        .image(center.x + 15, 655, 'fire')
        .setDisplaySize(64, 64)
        .setDepth(15),
    );
    this.context.add
      .text(left + width - 90, 500, 'ВОСТОК →', {
        fontFamily: 'system-ui',
        fontSize: '13px',
        color: '#cfdfc9',
      })
      .setOrigin(0.5)
      .setDepth(11);
    mergeScenery(road, floorKey, left, width, WORLD_HEIGHT);
    mergeScenery(garden, floorKey, left, width, WORLD_HEIGHT);
    mergeScenery(detail, floorKey, left, width, WORLD_HEIGHT);
    this.rememberScenery(before);
  }
}
