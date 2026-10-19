import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  REGIONS,
  regionStart,
  REGION_WIDTH,
  regionEnd,
  villagePosition,
  PROLOGUE_WIDTH,
  ROAD_WIDTH,
  VILLAGE_NAMES,
} from '../world/WorldConfig';
import { type Point } from '../world/Navigation';
import { resident } from '../village/Residents';
import type { GameScene } from '../GameScene';

/** Локальная карта, карта мира и выбор области. */
export class MapController {
  constructor(private readonly context: GameScene) {}
  toggleMap(): void {
    const { ui } = this.context;
    if (ui.state === 'map') {
      ui.state = ui.mapReturn;
      this.context.element('map-overlay').hidden = true;
      if (ui.state === 'menu') this.context.element('menu-overlay').hidden = false;
      this.context.menu.syncGuide();
      return;
    }
    if (ui.state !== 'playing' && ui.state !== 'paused' && ui.state !== 'menu') return;
    ui.mapReturn = ui.state;
    ui.state = 'map';
    this.context.tutorial.lessonEvent('map');
    this.context.controls.resetInput();
    this.context.element('menu-overlay').hidden = true;
    this.context.element('map-overlay').hidden = false;
    this.context.menu.syncGuide();
    this.drawMaps();
  }
  drawMaps(): void {
    const { worldState, journey, ui, visuals } = this.context;
    const draw = (id: string, large: boolean) => {
      const canvas = this.context.element<HTMLCanvasElement>(id),
        ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = canvas.width,
        h = canvas.height,
        pad = large ? 30 : 7,
        sx = (w - pad * 2) / WORLD_WIDTH,
        sy = (h - pad * 2) / WORLD_HEIGHT;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#102c24';
      ctx.fillRect(0, 0, w, h);
      const point = (p: Point) => ({ x: pad + p.x * sx, y: pad + p.y * sy });
      for (let i = 0; i < REGIONS.length; i++) {
        const p = point({ x: regionStart(i), y: 70 }),
          width = REGION_WIDTH * sx,
          height = 960 * sy;
        ctx.fillStyle =
          i <= worldState.regionIndex || journey.progress[i].cleared
            ? REGIONS[i].palette.ground
            : '#1c342b';
        ctx.fillRect(p.x, p.y, width, height);
        ctx.strokeStyle = journey.progress[i].cleared
          ? '#b9d78a'
          : i === worldState.regionIndex
            ? '#b1e9df'
            : '#456254';
        ctx.lineWidth = large ? 2 : 1;
        ctx.strokeRect(p.x, p.y, width, height);
        if (large) {
          ctx.fillStyle = i <= worldState.regionIndex ? '#e0ead6' : '#779085';
          ctx.font = 'bold 11px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(
            `${i + 1} · ${REGIONS[i].name.split(' ')[0]}`,
            p.x + width / 2,
            19,
            width - 4,
          );
          ctx.font = '10px system-ui';
          ctx.fillText(
            journey.progress[i].cleared
              ? 'Пройдено'
              : i === worldState.regionIndex
                ? `${journey.progress[i].coins}/${REGIONS[i].coins} ◈`
                : 'Не исследовано',
            p.x + width / 2,
            h - 7,
          );
        }
      }
      ctx.strokeStyle = '#bcb18588';
      ctx.lineWidth = large ? 6 : 3;
      ctx.beginPath();
      const left = point({ x: 0, y: 550 }),
        right = point({ x: WORLD_WIDTH, y: 550 });
      ctx.moveTo(left.x, left.y);
      ctx.lineTo(right.x, right.y);
      ctx.stroke();
      if (large)
        for (const t of worldState.terrain) {
          if (t.x > regionEnd(worldState.regionIndex)) continue;
          const p = point(t);
          ctx.fillStyle = t.kind === 'puddle' ? '#5b9291' : '#263f30';
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, t.radius * sx), 0, Math.PI * 2);
          ctx.fill();
        }
      for (const c of worldState.coins) {
        if (c.region !== worldState.regionIndex) continue;
        const p = point(c.sprite);
        ctx.fillStyle = '#a8eeee';
        ctx.beginPath();
        ctx.arc(p.x, p.y, large ? 3 : 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const i of journey.campVisits) {
        const p = point(villagePosition(i));
        ctx.fillStyle = '#f5c78d';
        ctx.fillRect(p.x - 3, p.y - 4, 6, 8);
      }
      worldState.merchants.forEach((m, i) => {
        if (i > worldState.regionIndex) return;
        const p = point(m);
        ctx.fillStyle = journey.progress[i].cleared ? '#efd7ac' : '#778b79';
        ctx.fillRect(p.x - 3, p.y - 4, 6, 8);
      });
      for (const c of worldState.chests) {
        if (c.opened || c.region !== worldState.regionIndex) continue;
        const p = point(c);
        ctx.fillStyle = '#d5bdf2';
        ctx.fillRect(p.x - 4, p.y - 4, 8, 8);
        ctx.strokeStyle = '#fff2d0';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x - 4, p.y - 4, 8, 8);
      }
      for (const e of worldState.enemies)
        if (e.kind === 'boss' && !e.dead && e.region === worldState.regionIndex) {
          const p = point(e.sprite);
          ctx.fillStyle = '#e38d9a';
          ctx.beginPath();
          ctx.arc(p.x, p.y, large ? 6 : 3, 0, Math.PI * 2);
          ctx.fill();
        }
      for (const q of worldState.questProps) {
        const p = point(q.point);
        ctx.fillStyle = '#f3d294';
        ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
      }
      if (worldState.wisp) {
        const p = point(worldState.wisp);
        ctx.fillStyle = '#ffe6a1';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      const p = point(visuals.player);
      ctx.fillStyle = '#f6aa65';
      ctx.strokeStyle = '#fff2c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, large ? 6 : 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    };
    draw('minimap', false);
    if (!this.context.element('map-overlay').hidden) {
      if (ui.mapMode === 'local') this.drawLocalMap();
      else {
        draw('world-map', true);
        const canvas = this.context.element<HTMLCanvasElement>('world-map'),
          c = canvas.getContext('2d');
        if (c)
          for (const [i, q] of this.context.quests
            .journalEntries()
            .filter((q) => q.available && !q.done && q.point)
            .entries()) {
            const x = 30 + (q.point!.x * (canvas.width - 60)) / WORLD_WIDTH,
              y = 30 + (q.point!.y * (canvas.height - 60)) / WORLD_HEIGHT;
            c.fillStyle = q.id === journey.profile.trackedQuest ? '#ffe1a0' : '#c5b1e4';
            c.strokeStyle = '#172c2a';
            c.lineWidth = 2;
            c.beginPath();
            c.arc(x, y, 11, 0, Math.PI * 2);
            c.fill();
            c.stroke();
            c.fillStyle = '#142b28';
            c.textAlign = 'center';
            c.font = 'bold 13px system-ui';
            c.fillText(String(i + 1), x, y + 4);
          }
        this.context.element('map-title').textContent = 'Восемь печатей · путь к семье';
      }
      for (const b of document.querySelectorAll<HTMLButtonElement>('[data-map-mode]'))
        b.classList.toggle('selected', b.dataset.mapMode === ui.mapMode);
      this.context.element('map-regions').innerHTML = REGIONS.map(
        (r, i) =>
          `<button data-map-region="${i}" ${i > worldState.regionIndex && !journey.progress[i].cleared ? 'disabled' : ''} class="${i === (ui.mapFocusRegion ?? worldState.regionIndex) ? 'current' : ''}">${journey.progress[i].cleared ? '✓' : i + 1} · ${r.name}</button>`,
      ).join('');
    }
  }
  drawLocalMap(): void {
    const { hero, worldState, journey, ui, visuals } = this.context;
    const canvas = this.context.element<HTMLCanvasElement>('world-map'),
      c = canvas.getContext('2d');
    if (!c) return;
    const w = canvas.width,
      h = canvas.height,
      region = ui.mapFocusRegion ?? worldState.regionIndex;
    const village =
      ui.mapFocusVillage ??
      (ui.mapFocusRegion === null && worldState.area !== 'biome' ? worldState.villageIndex : null);
    const isVillage = village !== null,
      start = isVillage ? (village! < 0 ? 0 : regionEnd(village!)) : regionStart(region),
      width = isVillage ? (village! < 0 ? PROLOGUE_WIDTH : ROAD_WIDTH) : REGION_WIDTH;
    const title = isVillage ? VILLAGE_NAMES[village! + 1] : REGIONS[region].name,
      scale = Math.min(620 / width, (h - 70) / WORLD_HEIGHT),
      mx = 40 + (620 - width * scale) / 2,
      my = 43;
    const pos = (p: Point) => ({
        x: mx + (p.x - start) * scale,
        y: my + p.y * scale,
      }),
      inside = (p: Point) =>
        p.x >= start && p.x <= start + width && p.y >= 0 && p.y <= WORLD_HEIGHT;
    c.clearRect(0, 0, w, h);
    c.fillStyle = '#112824';
    c.fillRect(0, 0, w, h);
    c.fillStyle = isVillage ? '#526e4d' : REGIONS[region].palette.ground;
    c.fillRect(mx, my, width * scale, WORLD_HEIGHT * scale);
    c.strokeStyle = '#c2c5a63b';
    c.lineWidth = 1;
    for (let n = 0; n <= 5; n++) {
      const x = mx + (width * scale * n) / 5,
        y = my + (WORLD_HEIGHT * scale * n) / 5;
      c.beginPath();
      c.moveTo(x, my);
      c.lineTo(x, my + WORLD_HEIGHT * scale);
      c.moveTo(mx, y);
      c.lineTo(mx + width * scale, y);
      c.stroke();
    }
    c.strokeStyle = '#d6c694';
    c.lineWidth = 3;
    c.strokeRect(mx, my, width * scale, WORLD_HEIGHT * scale);
    c.strokeStyle = '#bbac8299';
    c.lineWidth = isVillage ? 18 : 10;
    c.beginPath();
    const a = pos({ x: start, y: 550 }),
      b = pos({ x: start + width, y: 550 });
    c.moveTo(a.x, a.y);
    c.lineTo(b.x, b.y);
    c.stroke();
    if (isVillage) {
      const at = villagePosition(village!);
      c.lineWidth = 10;
      c.beginPath();
      const a = pos({ x: at.x, y: 160 }),
        b = pos({ x: at.x, y: 970 });
      c.moveTo(a.x, a.y);
      c.lineTo(b.x, b.y);
      c.stroke();
    }
    for (const t of worldState.terrain)
      if (inside(t)) {
        const p = pos(t),
          r = Math.max(2, t.radius * scale);
        c.fillStyle =
          t.kind === 'puddle'
            ? '#74adba'
            : t.kind === 'tree'
              ? '#253e2b'
              : t.kind === 'stump'
                ? '#9a7b4b'
                : '#768879';
        c.strokeStyle = '#0d292662';
        c.lineWidth = 1;
        c.beginPath();
        c.ellipse(p.x, p.y, r, r * 0.83, 0, 0, Math.PI * 2);
        c.fill();
        c.stroke();
      }
    const dot = (p: Point, color: string, size: number) => {
      if (!inside(p)) return;
      const q = pos(p);
      c.fillStyle = color;
      c.beginPath();
      c.arc(q.x, q.y, size, 0, Math.PI * 2);
      c.fill();
    };
    if (isVillage) {
      for (const house of worldState.houses.filter((h) => h.village === village)) {
        const p = pos(house),
          role = resident(village!, house.role),
          color =
            house.role === 'smith'
              ? '#d89252'
              : house.role === 'armorer'
                ? '#9db9d4'
                : house.role === 'healer'
                  ? '#a4d498'
                  : '#c8abdf';
        c.fillStyle = color;
        c.fillRect(p.x - 29, p.y - 29, 58, 57);
        c.strokeStyle = '#e9dfb3';
        c.lineWidth = 2;
        c.strokeRect(p.x - 29, p.y - 29, 58, 57);
        const door = pos(house.door);
        c.fillStyle = '#f8dea2';
        c.fillRect(door.x - 5, door.y - 4, 10, 6);
        c.textAlign = 'center';
        c.font = 'bold 14px system-ui';
        c.fillStyle = '#edecd5';
        c.fillText(`${role.name} · ${role.job}`, p.x, p.y + 48);
      }
      const at = villagePosition(village!);
      dot({ x: at.x + 15, y: 655 }, '#ffd690', 7);
      dot({ x: at.x - 85, y: 442 }, '#88cbd7', 5);
      dot({ x: at.x - 300, y: 611 }, '#d2ac71', 6);
    } else {
      for (const coin of worldState.coins) dot(coin.sprite, '#b6f5ed', 3);
      for (const e of worldState.enemies)
        if (!e.dead && e.region === region)
          dot(e.sprite, e.kind === 'boss' ? '#fc8f99' : '#e39389', e.kind === 'boss' ? 8 : 3.5);
      if (!journey.progress[region].bossDead) {
        c.fillStyle = '#bdbbdf99';
        c.fillRect(mx - 2, my, 6, WORLD_HEIGHT * scale);
        c.fillRect(mx + width * scale - 4, my, 6, WORLD_HEIGHT * scale);
      }
      if (region === 3 && journey.lines.some((q) => q.id === 'wisp' && q.accepted && !q.claimed)) {
        dot({ x: regionEnd(3) - 80, y: 615 }, '#ffe3a0', 7);
        const p = pos({ x: regionEnd(3) - 80, y: 615 });
        c.textAlign = 'right';
        c.font = '13px system-ui';
        c.fillStyle = '#ffe3a0';
        c.fillText('Костёр огонька', p.x - 10, p.y - 10);
      }
    }
    for (const chest of worldState.chests)
      if (!chest.opened && inside(chest)) {
        const p = pos(chest);
        c.fillStyle = '#d8bbf6';
        c.fillRect(p.x - 6, p.y - 5, 12, 10);
        c.strokeStyle = '#f4e5b7';
        c.strokeRect(p.x - 6, p.y - 5, 12, 10);
      }
    const all = this.context.quests
        .journalEntries()
        .filter((q) => q.available && !q.done && q.point),
      local = all.filter((q) => inside(q.point!)),
      selected = all.find((q) => q.id === journey.profile.trackedQuest);
    for (const q of local) {
      const p = pos(q.point!),
        n = all.indexOf(q) + 1,
        tracked = q.id === journey.profile.trackedQuest;
      c.fillStyle = tracked ? '#ffdfa0' : '#d2bde9';
      c.strokeStyle = '#18332a';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(p.x, p.y, tracked ? 13 : 10, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.fillStyle = '#1e322a';
      c.textAlign = 'center';
      c.font = 'bold 14px system-ui';
      c.fillText(String(n), p.x, p.y + 5);
    }
    if (inside(visuals.player)) {
      const p = pos(visuals.player);
      c.save();
      c.translate(p.x, p.y);
      c.rotate(hero.face);
      c.fillStyle = '#ffb87a';
      c.strokeStyle = '#fff2cb';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(11, 0);
      c.lineTo(-7, -6);
      c.lineTo(-3, 0);
      c.lineTo(-7, 6);
      c.closePath();
      c.fill();
      c.stroke();
      c.restore();
    }
    c.textAlign = 'left';
    c.font = 'bold 19px system-ui';
    c.fillStyle = '#e9e2c4';
    c.fillText(title, mx, 27);
    c.font = '12px system-ui';
    c.fillStyle = '#a7c8b9';
    c.fillText('СЕВЕР ↑ · ВОСТОК →', mx, h - 9);
    c.strokeStyle = '#90b4a14a';
    c.beginPath();
    c.moveTo(695, 24);
    c.lineTo(695, h - 20);
    c.stroke();
    const wrap = (
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      size = 15,
      color = '#c5d7c8',
    ) => {
      c.font = `${size}px system-ui`;
      c.fillStyle = color;
      let line = '',
        offset = 0;
      for (const word of text.split(' ')) {
        const next = line ? line + ' ' + word : word;
        if (c.measureText(next).width > maxWidth && line) {
          c.fillText(line, x, y + offset);
          offset += size + 6;
          line = word;
        } else line = next;
      }
      if (line) {
        c.fillText(line, x, y + offset);
        offset += size + 6;
      }
      return y + offset;
    };
    c.font = 'bold 18px system-ui';
    c.fillStyle = '#f0d89d';
    c.fillText('ЦЕЛЬ ДНЕВНИКА', 722, 39);
    let y = 67;
    if (selected) {
      c.font = 'bold 17px system-ui';
      c.fillStyle = '#f0e5c4';
      c.fillText(`${all.indexOf(selected) + 1}. ${selected.title}`, 722, y);
      y = wrap(selected.next, 722, y + 27, 340, 16);
      if (!inside(selected.point!))
        y = wrap(
          'Цель в другой области. Вернись в дневник и нажми «Цель на карте», чтобы открыть её место.',
          722,
          y + 8,
          340,
          13,
          '#e1b795',
        );
    } else
      y = wrap(
        'Tab → Задания: выбери поручение и отметь цель. Номера на карте соответствуют записям ниже.',
        722,
        y,
        340,
        15,
      );
    y += 19;
    c.font = 'bold 16px system-ui';
    c.fillStyle = '#c4d7c2';
    c.fillText('В ЭТОЙ ОБЛАСТИ', 722, y);
    y += 25;
    for (const q of local.slice(0, 3)) {
      y = wrap(`${all.indexOf(q) + 1}. ${q.title}`, 722, y, 340, 14, '#e9d5ae');
      y = wrap(q.status, 740, y, 320, 12, '#a3c4b4') + 7;
    }
    if (!local.length)
      y = wrap(
        isVillage
          ? 'Жители отмечены у домов. Подойди к двери и нажми E.'
          : 'Оранжевый указатель - ты. Красные точки - враги, светлые - сила.',
        722,
        y,
        340,
        14,
      );
    if (isVillage && village === -1 && journey.progress[0].elapsed === 0) {
      const x = mx + width * scale - 9,
        y = my + 550 * scale;
      c.fillStyle = '#ffdb93';
      c.beginPath();
      c.moveTo(x + 10, y);
      c.lineTo(x - 8, y - 8);
      c.lineTo(x - 8, y + 8);
      c.closePath();
      c.fill();
      c.textAlign = 'right';
      c.font = 'bold 14px system-ui';
      c.fillText('К первой роще →', x - 12, y - 14);
    }
    this.context.element('map-title').textContent = isVillage
      ? `Деревня · ${title}`
      : `Биом ${region + 1} · ${title}`;
  }
}
