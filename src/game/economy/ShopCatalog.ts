export const POTION_PRICE = 25;
export const SUPPLIES = [
  {
    id: 'field-potion',
    name: 'Дорожное зелье',
    icon: '⚗',
    price: POTION_PRICE,
    description: 'В сумку: V лечит 55 HP или 30% максимума. Не занимает заряд фляги.',
  },
  {
    id: 'heal-service',
    name: 'Перевязка',
    icon: '✚',
    price: 8,
    description: 'Восстановить 50 HP',
  },
  {
    id: 'refill',
    name: 'Заряд фляги',
    icon: '♜',
    price: 10,
    description: 'Добавить 1 заряд, до максимума',
  },
  {
    id: 'rest-service',
    name: 'Полное лечение',
    icon: '☀',
    price: 18,
    description: 'Восстановить HP и все фляги',
  },
];
