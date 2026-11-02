import { TUTORIAL_CONFIG } from '../Constants';

/** Параметры урока применяются одинаково при запуске и восстановлении сохранения. */
export function trainingEnemyParameters(lesson: number, restored = false) {
  const final = lesson >= TUTORIAL_CONFIG.finalLesson;
  const active = final || lesson === TUTORIAL_CONFIG.parryLesson;
  return {
    maxHP: final ? TUTORIAL_CONFIG.finalHealth : TUTORIAL_CONFIG.trainingHealth,
    damage: TUTORIAL_CONFIG.enemyDamage,
    stun: active ? 0 : TUTORIAL_CONFIG.stationaryStun,
    speed: final ? TUTORIAL_CONFIG.finalSpeed : active ? TUTORIAL_CONFIG.enemySpeed : 0,
    clock: final
      ? TUTORIAL_CONFIG.finalClock
      : restored
        ? TUTORIAL_CONFIG.restoredEnemyClock
        : TUTORIAL_CONFIG.enemyClock,
  };
}
export function trainingCoinPoints() {
  return Array.from({ length: TUTORIAL_CONFIG.weaponCoins }, (_, index) => ({
    x: TUTORIAL_CONFIG.coinStartX + index * TUTORIAL_CONFIG.coinSpacing,
    y: TUTORIAL_CONFIG.coinY,
  }));
}
