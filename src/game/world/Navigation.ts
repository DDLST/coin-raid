export type Point = { x: number; y: number };
export type Terrain = Point & {
  kind: 'tree' | 'stump' | 'puddle' | 'rock' | 'ruin';
  radius: number;
};
export type Bounds = {
  width: number;
  height: number;
  margin: number;
  top: number;
  left?: number;
};
export type NavGrid = {
  cell: number;
  cols: number;
  rows: number;
  free: boolean[];
  bounds: Bounds;
  originX: number;
};
const GRID_CELL = 24;

// Координаты в долях поля: каждый уровень имеет своё расположение препятствий.
const LAYOUTS: [Terrain['kind'], number, number][][] = [
  [
    ['tree', 0.5, 0.33],
    ['stump', 0.57, 0.72],
    ['puddle', 0.23, 0.29],
    ['puddle', 0.78, 0.6],
  ],
  [
    ['tree', 0.38, 0.27],
    ['tree', 0.65, 0.5],
    ['stump', 0.3, 0.78],
    ['stump', 0.73, 0.77],
    ['puddle', 0.48, 0.64],
  ],
  [
    ['tree', 0.46, 0.24],
    ['tree', 0.26, 0.69],
    ['stump', 0.61, 0.6],
    ['stump', 0.73, 0.35],
    ['puddle', 0.44, 0.84],
    ['puddle', 0.78, 0.7],
  ],
  [
    ['tree', 0.24, 0.35],
    ['tree', 0.5, 0.49],
    ['tree', 0.77, 0.65],
    ['stump', 0.55, 0.8],
    ['stump', 0.72, 0.26],
    ['puddle', 0.3, 0.79],
  ],
  [
    ['tree', 0.38, 0.24],
    ['tree', 0.62, 0.41],
    ['tree', 0.33, 0.75],
    ['stump', 0.74, 0.74],
    ['stump', 0.52, 0.69],
    ['puddle', 0.19, 0.37],
    ['puddle', 0.82, 0.45],
  ],
];

export function makeTerrain(level: number, bounds: Bounds, unit: number): Terrain[] {
  return LAYOUTS[level % LAYOUTS.length].map(([kind, x, y]) => ({
    kind,
    x: x * bounds.width,
    y: bounds.top + y * (bounds.height - bounds.top - bounds.margin),
    radius: (kind === 'tree' ? 25 : kind === 'stump' ? 21 : 46) * unit,
  }));
}

export function clampPoint(p: Point, bounds: Bounds): Point {
  return {
    x: Math.max(bounds.left ?? bounds.margin, Math.min(bounds.width - bounds.margin, p.x)),
    y: Math.max(bounds.top, Math.min(bounds.height - bounds.margin, p.y)),
  };
}

export function freePoint(p: Point, radius: number, terrain: Terrain[], bounds: Bounds): boolean {
  if (
    p.x < (bounds.left ?? bounds.margin) ||
    p.x > bounds.width - bounds.margin ||
    p.y < bounds.top ||
    p.y > bounds.height - bounds.margin
  )
    return false;
  return terrain.every(
    (t) => t.kind === 'puddle' || Math.hypot(p.x - t.x, p.y - t.y) >= radius + t.radius + 1,
  );
}

// Небольшие подшаги не позволяют рывку проскочить сквозь дерево.
export function moveCircle(
  p: Point,
  dx: number,
  dy: number,
  radius: number,
  terrain: Terrain[],
  bounds: Bounds,
): Point {
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / Math.max(4, radius * 0.5)));
  let result = { x: p.x, y: p.y };
  for (let step = 0; step < steps; step++) {
    result = clampPoint({ x: result.x + dx / steps, y: result.y + dy / steps }, bounds);
    for (let pass = 0; pass < 3; pass++)
      for (const t of terrain) {
        if (t.kind === 'puddle') continue;
        const x = result.x - t.x,
          y = result.y - t.y,
          d = Math.hypot(x, y),
          min = radius + t.radius + 1;
        if (d < min) {
          const nx = d > 0.001 ? x / d : 1,
            ny = d > 0.001 ? y / d : 0;
          result = clampPoint({ x: t.x + nx * min, y: t.y + ny * min }, bounds);
        }
      }
  }
  return result;
}

export function makeGrid(
  terrain: Terrain[],
  bounds: Bounds,
  unit: number,
  radius: number,
): NavGrid {
  const cell = GRID_CELL * unit,
    originX = bounds.left ?? 0,
    cols = Math.ceil((bounds.width - originX) / cell),
    rows = Math.ceil(bounds.height / cell);
  const free = Array.from({ length: cols * rows }, (_, i) =>
    freePoint(
      {
        x: originX + ((i % cols) + 0.5) * cell,
        y: (Math.floor(i / cols) + 0.5) * cell,
      },
      radius + cell * 0.3,
      terrain,
      bounds,
    ),
  );
  // Узкий зазор может дать одиночную клетку без выхода. Навигация использует
  // крупнейшую связную область, а не предлагает волку такую ложную цель.
  const visited = new Uint8Array(free.length);
  let largest: number[] = [];
  for (let start = 0; start < free.length; start++) {
    if (!free[start] || visited[start]) continue;
    const component = [start];
    visited[start] = 1;
    for (let at = 0; at < component.length; at++) {
      const current = component[at],
        x = current % cols,
        y = Math.floor(current / cols);
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const nx = x + dx,
            ny = y + dy,
            next = ny * cols + nx;
          if (nx < 0 || nx >= cols || ny < 0 || ny >= rows || !free[next] || visited[next])
            continue;
          if (dx && dy && (!free[y * cols + nx] || !free[ny * cols + x])) continue;
          visited[next] = 1;
          component.push(next);
        }
    }
    if (component.length > largest.length) largest = component;
  }
  const connected = new Set(largest);
  for (let i = 0; i < free.length; i++) free[i] = free[i] && connected.has(i);
  return { cell, cols, rows, free, bounds, originX };
}

function nearestCell(p: Point, grid: NavGrid): number {
  let best = -1,
    distance = Infinity;
  for (let i = 0; i < grid.free.length; i++)
    if (grid.free[i]) {
      const x = grid.originX + ((i % grid.cols) + 0.5) * grid.cell,
        y = (Math.floor(i / grid.cols) + 0.5) * grid.cell;
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < distance) {
        best = i;
        distance = d;
      }
    }
  return best;
}

// A*: восемь направлений, без срезания углов заблокированных клеток.
export function findPath(from: Point, to: Point, grid: NavGrid): Point[] {
  const start = nearestCell(from, grid),
    goal = nearestCell(to, grid);
  if (start < 0 || goal < 0) return [];
  const g = new Float64Array(grid.free.length).fill(Infinity),
    parent = new Int32Array(grid.free.length).fill(-1);
  const closed = new Uint8Array(grid.free.length),
    open = [start];
  g[start] = 0;
  const heuristic = (i: number) =>
    Math.hypot(
      (i % grid.cols) - (goal % grid.cols),
      Math.floor(i / grid.cols) - Math.floor(goal / grid.cols),
    );
  while (open.length) {
    let at = 0;
    for (let i = 1; i < open.length; i++)
      if (g[open[i]] + heuristic(open[i]) < g[open[at]] + heuristic(open[at])) at = i;
    const current = open.splice(at, 1)[0];
    if (current === goal) {
      const path: Point[] = [];
      for (let i = goal; i !== start; i = parent[i])
        path.push({
          x: grid.originX + ((i % grid.cols) + 0.5) * grid.cell,
          y: (Math.floor(i / grid.cols) + 0.5) * grid.cell,
        });
      return path.reverse();
    }
    closed[current] = 1;
    const x = current % grid.cols,
      y = Math.floor(current / grid.cols);
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx,
          ny = y + dy,
          next = ny * grid.cols + nx;
        if (
          nx < 0 ||
          nx >= grid.cols ||
          ny < 0 ||
          ny >= grid.rows ||
          !grid.free[next] ||
          closed[next]
        )
          continue;
        if (dx && dy && (!grid.free[y * grid.cols + nx] || !grid.free[ny * grid.cols + x]))
          continue;
        const cost = g[current] + Math.hypot(dx, dy);
        if (cost < g[next]) {
          g[next] = cost;
          parent[next] = current;
          if (!open.includes(next)) open.push(next);
        }
      }
  }
  return [];
}

export function clearLine(
  from: Point,
  to: Point,
  radius: number,
  terrain: Terrain[],
  bounds: Bounds,
): boolean {
  const steps = Math.max(
    1,
    Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / Math.max(5, radius)),
  );
  for (let i = 1; i <= steps; i++)
    if (
      !freePoint(
        {
          x: from.x + ((to.x - from.x) * i) / steps,
          y: from.y + ((to.y - from.y) * i) / steps,
        },
        radius,
        terrain,
        bounds,
      )
    )
      return false;
  return true;
}

// Детали восьми биомов: свободная центральная дорога и боковые участки для боя.
export function regionTerrain(
  index: number,
  start: number,
  width: number,
  height: number,
): Terrain[] {
  const base = makeTerrain(index, { width, height, margin: 65, top: 90 }, 1).map((t) => ({
    ...t,
    x: t.x + start,
  }));
  const extra: Terrain[] = [];
  const add = (kind: Terrain['kind'], x: number, y: number, radius: number) =>
    extra.push({ kind, x: start + x * width, y: y * height, radius });
  for (let i = 0; i < 8; i++) {
    const x = 0.12 + (i % 4) * 0.22,
      y = i < 4 ? 0.14 + (i % 2) * 0.08 : 0.82 + (i % 2) * 0.06;
    add(index === 1 || index === 3 ? 'ruin' : 'tree', x, y, index === 1 ? 29 : 25);
  }
  for (const [x, y] of [
    [0.15, 0.45],
    [0.84, 0.32],
    [0.8, 0.74],
  ])
    add(index === 1 || index === 3 ? 'rock' : 'stump', x, y, 24);
  if (index >= 4) {
    for (let i = 0; i < 6; i++)
      add(
        index === 5 ? 'ruin' : 'rock',
        0.18 + (i % 3) * 0.28,
        i < 3 ? 0.19 : 0.82,
        26 + index * 2,
      );
  }
  add('ruin', 0.65, 0.25, 54);
  if (index === 2)
    for (const [x, y] of [
      [0.25, 0.37],
      [0.57, 0.73],
      [0.75, 0.18],
    ])
      add('puddle', x, y, 66);
  return [...base, ...extra].filter(
    (t) => !(Math.abs(t.y - height / 2) < 85 && (t.x - start < 200 || t.x - start > width - 200)),
  );
}
