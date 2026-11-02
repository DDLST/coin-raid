import { DELIVERIES, LINES, REGIONS, VILLAGE_NAMES } from '../Constants';
import { type Delivery, lineReady, type QuestLine } from '../story/StoryProgress';
import { resident } from '../village/Residents';
import { type Point } from '../world/Navigation';

export type JournalEntry = {
  id: string;
  title: string;
  why: string;
  status: string;
  next: string;
  steps: string[];
  reward: string;
  done: boolean;
  available: boolean;
  point: Point | null;
  region: number;
  village: number | null;
};

export function lineJournal(
  q: QuestLine,
  bossDead: boolean,
): Omit<JournalEntry, 'point' | 'region' | 'village' | 'available'> {
  const d = LINES.find((d) => d.id === q.id)!;
  const person = resident(d.offered, d.giver);
  const ready = lineReady(q, bossDead);
  const steps =
    q.id === 'bell'
      ? [
          `${q.kills >= 2 ? '✓' : '○'} Некроманты: ${q.kills}/2`,
          `${q.artifact ? '✓' : '○'} Язык колокола`,
        ]
      : q.id === 'runes'
        ? [
            `${q.runes >= 1 ? '✓' : '○'} Луна`,
            `${q.runes >= 2 ? '✓' : '○'} Искра`,
            `${q.runes >= 3 ? '✓' : '○'} Корень`,
          ]
        : [`${q.escorted ? '✓' : '○'} Проводить огонёк к восточному костру`];
  steps.push(`${bossDead ? '✓' : '○'} ${REGIONS[d.region].bossName}`);
  const next = q.claimed
    ? 'Обещание выполнено. Награда уже в вещах.'
    : !q.accepted
      ? `Поговори: ${person.name}, ${VILLAGE_NAMES[d.offered + 1]}.`
      : ready
        ? `Вернись в ${VILLAGE_NAMES[d.offered + 1]}: ${person.name} ждёт тебя.`
        : q.id === 'bell' && q.kills < 2
          ? 'Победи некромантов после принятия поручения.'
          : q.id === 'bell' && !q.artifact
            ? 'Забери язык колокола у лунного алтаря (E).'
            : q.id === 'runes' && q.runes < 3
              ? `Следующая печать: ${['Луна', 'Искра', 'Корень'][q.runes]} (E). Ошибка сбросит порядок.`
              : q.id === 'wisp' && !q.escorted
                ? 'Подойди к огоньку; веди его на восток, держась ближе 155 шагов.'
                : `Победи хозяина: ${REGIONS[d.region].bossName}.`;
  return {
    id: `line:${q.id}`,
    title: d.name,
    why:
      q.id === 'bell'
        ? `Колокол возвращал людям имена. ${person.name} хочет вернуть память погибших стражей, которую заглушили некроманты.`
        : q.id === 'runes'
          ? `Хранитель оставил письма дочери в трёх печатях. ${person.name} ищет их, чтобы история семьи не исчезла в огне.`
          : `Огонёк хранит голос пропавшего ученика. ${person.name} просит вывести его из пепла к восточному огню.`,
    status: q.claimed
      ? 'Завершено'
      : !q.accepted
        ? 'Ещё не принято'
        : ready
          ? 'Готово к сдаче'
          : 'В дневнике',
    next,
    steps,
    reward: d.rewardName,
    done: q.claimed,
  };
}
export function deliveryJournal(
  q: Delivery,
): Omit<JournalEntry, 'point' | 'region' | 'village' | 'available'> {
  const d = DELIVERIES.find((d) => d.id === q.id)!;
  const giver = resident(d.from, d.giver);
  const receiver = resident(d.to, d.receiver);
  return {
    id: `delivery:${q.id}`,
    title: d.name,
    why:
      q.id === 'medicine'
        ? `${giver.name} приготовила настойки для раненых в ${VILLAGE_NAMES[d.to + 1]}. Передай сумку жителю: ${receiver.name}. Вернись к заказчице за наградой.`
        : `${giver.name} нашёл способ восстановить старый мост. Передай чертёж жителю: ${receiver.name}, ${VILLAGE_NAMES[d.to + 1]}. Затем вернись за наградой в ${VILLAGE_NAMES[d.from + 1]}.`,
    status: q.claimed
      ? 'Завершено'
      : q.delivered
        ? 'Посылка передана'
        : q.accepted
          ? 'Посылка в сумке'
          : `Откроется: ${d.seals} печатей`,
    next: q.claimed
      ? 'Люди получили помощь. Награда уже выдана.'
      : !q.accepted
        ? `Получить: ${giver.name}, ${VILLAGE_NAMES[d.from + 1]}.`
        : q.delivered
          ? `Награда: ${giver.name}, ${VILLAGE_NAMES[d.from + 1]}.`
          : `Доставить: ${receiver.name}, ${VILLAGE_NAMES[d.to + 1]} (E).`,
    steps: [
      `${q.accepted ? '✓' : '○'} Взять: ${d.parcel}`,
      `${q.delivered ? '✓' : '○'} Передать получателю`,
      `${q.claimed ? '✓' : '○'} Вернуться к заказчику`,
    ],
    reward: `${d.reward} ◈ и 1 искра мастерства`,
    done: q.claimed,
  };
}
