export type Area = 'biome' | 'village' | 'tutorial' | 'interior';
export type Role = 'smith' | 'armorer' | 'healer' | 'trader';

export type LineId = 'bell' | 'runes' | 'wisp';
export type QuestLine = {
  id: LineId;
  accepted: boolean;
  kills: number;
  artifact: boolean;
  runes: number;
  escorted: boolean;
  claimed: boolean;
};
export const newLines = (): QuestLine[] =>
  ['bell', 'runes', 'wisp'].map((id) => ({
    id: id as LineId,
    accepted: false,
    kills: 0,
    artifact: false,
    runes: 0,
    escorted: false,
    claimed: false,
  }));

export function lineReady(q: QuestLine, bossDead: boolean): boolean {
  return (
    q.accepted &&
    !q.claimed &&
    bossDead &&
    (q.id === 'bell' ? q.kills >= 2 && q.artifact : q.id === 'runes' ? q.runes >= 3 : q.escorted)
  );
}

export type DeliveryId = 'medicine' | 'blueprint';
export type Delivery = {
  id: DeliveryId;
  accepted: boolean;
  delivered: boolean;
  claimed: boolean;
};
export const newDeliveries = (): Delivery[] => [
  { id: 'medicine', accepted: false, delivered: false, claimed: false },
  { id: 'blueprint', accepted: false, delivered: false, claimed: false },
];
