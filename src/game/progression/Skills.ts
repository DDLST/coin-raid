import { SKILL_TREE } from '../Constants';
import { type Profile } from './PlayerProgression';

export type WeaponStyle = 'sword' | 'spear' | 'axe' | 'staff';

export type SkillId = (typeof SKILL_TREE)[number]['id'];
export function learnSkill(p: Profile, id: string, seals: number): string {
  const skill = SKILL_TREE.find((s) => s.id === id);
  if (!skill) {
    return 'Приём не найден.';
  }
  if (p.skills.includes(skill.id)) {
    return 'В этот приём уже вложены искры.';
  }
  const previous = SKILL_TREE.find((s) => s.style === skill.style && s.tier === skill.tier - 1);
  if (previous && !p.skills.includes(previous.id)) {
    return 'Сначала изучи предыдущий приём этой ветви.';
  }
  if (seals < skill.seals) {
    return `Нужно разорвать ${skill.seals} печатей.`;
  }
  if (p.skillPoints < skill.points) {
    return 'Не хватает искр мастерства. Их дают боссы и поручения.';
  }
  const price = p.unlockedSkills.includes(skill.id) ? 0 : skill.price;
  if (p.coins < price) {
    return 'Не хватает осколков души.';
  }
  p.skillPoints -= skill.points;
  p.coins -= price;
  p.skills.push(skill.id);
  if (!p.unlockedSkills.includes(skill.id)) {
    p.unlockedSkills.push(skill.id);
  }
  return `Готово: ${skill.name}. Клавиша ${skill.key}. Купленный приём останется доступен после возврата искр.`;
}
export function refundBranch(p: Profile, style: WeaponStyle): number {
  const branch = SKILL_TREE.filter((s) => s.style === style && p.skills.includes(s.id));
  const ids = branch.map((s) => s.id);
  const points = branch.reduce((n, s) => n + s.points, 0);
  p.skills = p.skills.filter((id) => !ids.includes(id));
  p.disabledSkills = p.disabledSkills.filter((id) => !ids.includes(id));
  p.skillPoints += points;
  return points;
}
export function toggleSkill(p: Profile, id: string): void {
  const skill = SKILL_TREE.find((s) => s.id === id);
  if (!skill || !p.skills.includes(skill.id)) {
    return;
  }
  p.disabledSkills = p.disabledSkills.includes(skill.id)
    ? p.disabledSkills.filter((v) => v !== skill.id)
    : [...p.disabledSkills, skill.id];
}
