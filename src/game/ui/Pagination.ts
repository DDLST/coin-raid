import { UI_CONFIG } from '../Constants';

/** Единый размер страницы для магазина, экипировки и достижений. */
export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / UI_CONFIG.itemsPerPage));
}
export function pageRange(page: number): [number, number] {
  const start = Math.max(0, Math.floor(page)) * UI_CONFIG.itemsPerPage;
  return [start, start + UI_CONFIG.itemsPerPage];
}
