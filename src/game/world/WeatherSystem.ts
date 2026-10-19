import { type Point, clampPoint, type Terrain, type Bounds, moveCircle } from './Navigation';
import { PLAYER_RADIUS } from '../combat/CombatRules';
import type { GameScene } from '../GameScene';

/** Дождь, гроза, метеоры, ураган и замедление от поверхности. */
export const LIGHTNING_WARNING = 1.2;
export const LIGHTNING_RADIUS = 48;
export type Strike = Point & {
  left: number;
  phase: 'warning' | 'impact';
};
export class WeatherSystem {
  constructor(private readonly context: GameScene) {}
  drawWeather(): void {
    const { worldState, visuals } = this.context;
    const g = visuals.weatherInk;
    g.clear();
    if (worldState.weather === 'clear') return;
    for (const z of worldState.wetZones) {
      g.fillStyle(0x71b5be, 0.12);
      g.fillCircle(z.x, z.y, z.radius);
      g.lineStyle(1, 0xade6e4, 0.3);
      g.strokeCircle(z.x, z.y, z.radius);
    }
    const v = this.context.cameras.main.worldView;
    if (worldState.weather === 'rain' || worldState.weather === 'storm') {
      g.lineStyle(1, 0xa9b8c8, 0.42);
      for (let i = 0; i < 75; i++) {
        const x = v.x + ((i * 83 + visuals.animationTime * 110) % v.width),
          y = v.y + ((i * 151 + visuals.animationTime * 410) % v.height);
        g.lineBetween(x, y, x - 7, y + 17);
      }
    }
    if (worldState.weather === 'meteors') {
      for (let n = 0; n < 14; n++) {
        const x = v.x + ((n * 157 + visuals.animationTime * 67) % v.width),
          y = v.y + ((n * 109 + visuals.animationTime * 45) % v.height);
        g.fillStyle(0xc77451, 0.4);
        g.fillCircle(x, y, 1.7);
      }
    }
    if (worldState.hurricane) {
      const z = worldState.hurricane;
      g.fillStyle(0x766e88, 0.08);
      g.fillCircle(z.x, z.y, HURRICANE_RADIUS);
      g.lineStyle(2, 0xb0a2ba, 0.5);
      g.strokeCircle(z.x, z.y, HURRICANE_RADIUS);
      this.context.effects.drawCombatImage(
        'fx-hurricane',
        z.x,
        z.y - 25,
        240,
        Math.sin(visuals.animationTime * 0.8) * 0.12,
        0.8,
      );
      for (let n = 0; n < 16; n++) {
        const a = visuals.animationTime * 3 + n * 0.8,
          r = 25 + n * 5;
        g.fillStyle(n % 2 ? 0x9a9c85 : 0x66606f, 0.6);
        g.fillEllipse(z.x + Math.cos(a) * r, z.y + Math.sin(a) * r * 0.65, 5, 2);
      }
    }
    if (worldState.strike) {
      const z = worldState.strike;
      g.fillStyle(
        z.phase === 'impact' ? 0xc8efff : 0xc34c48,
        z.phase === 'impact' ? 0.55 : 0.12 + Math.sin(visuals.animationTime * 16) * 0.05,
      );
      g.fillCircle(z.x, z.y, LIGHTNING_RADIUS);
      g.lineStyle(3, z.phase === 'impact' ? 0xe7faff : 0xff8572, 0.85);
      g.strokeCircle(z.x, z.y, LIGHTNING_RADIUS);
      if (z.phase === 'warning') {
        g.lineStyle(2, 0xffd39b, 0.8);
        g.strokeCircle(z.x, z.y, LIGHTNING_RADIUS * (1 - z.left / LIGHTNING_WARNING));
      } else {
        g.lineStyle(6, 0xe6edff, 0.9);
        g.beginPath();
        g.moveTo(z.x - 10, z.y - 190);
        g.lineTo(z.x + 8, z.y - 115);
        g.lineTo(z.x - 10, z.y - 85);
        g.lineTo(z.x, z.y);
        g.strokePath();
      }
    }
  }
  groundSpeed(at: Point, player: boolean): number {
    const { hero, worldState, journey } = this.context;
    if (player && hero.slowed > 0) return 0.3;
    if (
      player &&
      worldState.hazards.some(
        (h) =>
          h.kind === 'curse' && h.warning <= 0 && Math.hypot(at.x - h.x, at.y - h.y) < h.radius,
      )
    )
      return 0.78;
    const wet =
      worldState.terrain.some(
        (t) => t.kind === 'puddle' && Math.hypot(at.x - t.x, at.y - t.y) < t.radius,
      ) || worldState.wetZones.some((t) => Math.hypot(at.x - t.x, at.y - t.y) < t.radius);
    return wet ? (player ? Math.min(0.96, 0.68 + journey.profile.upgrades.boots * 0.14) : 0.62) : 1;
  }
  resetWeather(): void {
    const { hero, worldState, visuals } = this.context;
    worldState.weather = 'clear';
    worldState.weatherLeft = 0;
    worldState.weatherNext = 12 + Math.random() * 9;
    worldState.wetZones = [];
    worldState.strike = null;
    worldState.hurricane = null;
    worldState.strikeNext = 2;
    worldState.windSoundLeft = 0;
    hero.slowed = 0;
    visuals.weatherInk?.clear();
  }
  updateWeather(dt: number): void {
    const { hero, worldState, journey, visuals } = this.context;
    if (journey.progress[worldState.regionIndex].cleared) {
      if (worldState.weather !== 'clear') this.resetWeather();
      return;
    }
    worldState.weatherNext -= dt;
    if (worldState.weather === 'clear' && worldState.weatherNext <= 0) {
      worldState.weather = randomWeather(worldState.regionIndex);
      worldState.weatherLeft = WEATHER_DURATION;
      worldState.strikeNext = 1.5;
      worldState.wetZones =
        worldState.weather === 'rain' || worldState.weather === 'storm'
          ? Array.from({ length: 3 }, () => ({
              ...this.context.world.freePosition(worldState.regionIndex, 20, 0),
              radius: 90 + Math.random() * 40,
            }))
          : [];
      if (worldState.weather === 'hurricane')
        worldState.hurricane = {
          ...this.context.world.freePosition(worldState.regionIndex, 30, 220),
          phase: 0,
        };
      this.context.menu.toast(WEATHER_HINTS[worldState.weather]);
    }
    if (worldState.weather === 'clear') return;
    worldState.weatherLeft -= dt;
    if (worldState.weather === 'storm') {
      worldState.strikeNext -= dt;
      if (!worldState.strike && worldState.strikeNext <= 0) {
        const target =
          Math.random() < 0.6
            ? {
                x: visuals.player.x + hero.velocity.x * 0.35,
                y: visuals.player.y + hero.velocity.y * 0.35,
              }
            : this.context.world.freePosition(worldState.regionIndex, 30, 0);
        worldState.strike = {
          ...clampPoint(target, this.context.world.regionBounds(worldState.regionIndex)),
          left: LIGHTNING_WARNING,
          phase: 'warning',
        };
      }
      if (worldState.strike) {
        worldState.strike.left -= dt;
        if (worldState.strike.left <= 0) {
          if (worldState.strike.phase === 'warning') {
            worldState.strike.phase = 'impact';
            worldState.strike.left = 0.3;
            this.context.audio.play('thunder');
            if (
              Math.hypot(
                visuals.player.x - worldState.strike.x,
                visuals.player.y - worldState.strike.y,
              ) <
                LIGHTNING_RADIUS + PLAYER_RADIUS &&
              hero.dodgeLeft <= 0
            ) {
              hero.slowed = 1.8;
              this.context.player.damagePlayer(
                12 + worldState.regionIndex * 3,
                worldState.strike,
                true,
              );
            }
            this.context.effects.weatherHitEnemies(worldState.strike, LIGHTNING_RADIUS, 10);
            this.context.effects.particles(worldState.strike.x, worldState.strike.y, 14, 0xc4d8eb);
          } else {
            worldState.strike = null;
            worldState.strikeNext = 2.2 + Math.random() * 1.5;
          }
        }
      }
    } else if (worldState.weather === 'meteors') {
      worldState.strikeNext -= dt;
      if (worldState.strikeNext <= 0) {
        const target =
            Math.random() < 0.55
              ? {
                  x: visuals.player.x + hero.velocity.x * 0.4,
                  y: visuals.player.y + hero.velocity.y * 0.4,
                }
              : this.context.world.freePosition(worldState.regionIndex, 30, 0),
          at = clampPoint(target, this.context.world.regionBounds(worldState.regionIndex));
        worldState.hazards.push({
          ...at,
          region: worldState.regionIndex,
          radius: METEOR_RADIUS,
          warning: METEOR_WARNING,
          left: METEOR_WARNING + 0.6,
          damage: 16 + worldState.regionIndex * 2,
          kind: 'meteor',
          fired: false,
          environment: true,
        });
        worldState.strikeNext = 2.9 + Math.random();
      }
    } else if (worldState.weather === 'hurricane' && worldState.hurricane) {
      const z = worldState.hurricane;
      z.phase += dt;
      const at = clampPoint(
        {
          x: z.x + Math.cos(z.phase * 0.7) * 38 * dt,
          y: z.y + Math.sin(z.phase * 0.9) * 31 * dt,
        },
        this.context.world.regionBounds(worldState.regionIndex),
      );
      z.x = at.x;
      z.y = at.y;
      const pull = (point: Point, radius: number, terrain: Terrain[], bounds: Bounds) => {
        const dx = z.x - point.x,
          dy = z.y - point.y,
          d = Math.hypot(dx, dy);
        return d < HURRICANE_RADIUS && d > 8
          ? moveCircle(
              point,
              (dx / d) * HURRICANE_PULL * dt,
              (dy / d) * HURRICANE_PULL * dt,
              radius,
              terrain,
              bounds,
            )
          : point;
      };
      if (hero.dodgeLeft <= 0) {
        const moved = pull(
          visuals.player,
          PLAYER_RADIUS,
          this.context.world.activeTerrain(),
          this.context.world.playerBounds(),
        );
        visuals.player.setPosition(moved.x, moved.y);
        if (Math.hypot(z.x - visuals.player.x, z.y - visuals.player.y) < 37)
          this.context.player.damagePlayer(6 + worldState.regionIndex, z, true);
      }
      for (const e of worldState.enemies)
        if (!e.dead && e.region === worldState.regionIndex) {
          const moved = pull(
            e.sprite,
            e.radius,
            worldState.terrainByRegion[e.region],
            this.context.enemies.enemyBounds(e),
          );
          e.sprite.setPosition(moved.x, moved.y);
          if (Math.hypot(z.x - e.sprite.x, z.y - e.sprite.y) < 37)
            e.hp = Math.max(0, e.hp - 7 * dt);
          if (e.hp === 0) this.context.combat.killEnemy(e);
        }
      worldState.windSoundLeft -= dt;
      if (worldState.windSoundLeft <= 0) {
        this.context.audio.play('wind');
        worldState.windSoundLeft = 1.8;
      }
    }
    if (worldState.weatherLeft <= 0) {
      worldState.weather = 'clear';
      worldState.weatherNext = 15 + Math.random() * 12;
      worldState.wetZones = [];
      worldState.strike = null;
      worldState.hurricane = null;
    }
  }
}
export type WeatherKind = 'clear' | 'rain' | 'storm' | 'meteors' | 'hurricane';
export const WEATHER_DURATION = 15;
export const METEOR_WARNING = 1.65,
  METEOR_RADIUS = 65;
export const HURRICANE_RADIUS = 125,
  HURRICANE_PULL = 72;
export const WEATHER_NAMES: Record<WeatherKind, string> = {
  clear: 'Ясно',
  rain: 'Дождь',
  storm: 'Гроза',
  meteors: 'Метеорный дождь',
  hurricane: 'Ураган',
};
export const WEATHER_HINTS: Record<WeatherKind, string> = {
  clear: '',
  rain: 'Дождь: мокрые участки замедляют лиса и противников.',
  storm: 'Гроза: выйди из красного круга до удара молнии.',
  meteors: 'Метеоры: огненный круг отмечает место падения. Камни поражают и врагов.',
  hurricane:
    'Ураган: обходи движущуюся воронку. Она тянет и лиса, и врагов; Пробел помогает вырваться.',
};
export function randomWeather(
  region: number,
  value = Math.random(),
): Exclude<WeatherKind, 'clear'> {
  const pool: Exclude<WeatherKind, 'clear'>[] =
    region === 3 || region === 7
      ? ['meteors', 'storm', 'hurricane', 'rain']
      : region === 4 || region === 6
        ? ['hurricane', 'storm', 'rain', 'meteors']
        : ['rain', 'storm', 'meteors', 'hurricane'];
  return pool[Math.min(3, Math.max(0, Math.floor(value * 4)))];
}
