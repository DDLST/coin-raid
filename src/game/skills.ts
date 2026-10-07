import type { Profile } from './progression';
export type WeaponStyle='sword'|'spear'|'axe'|'staff';
export const SKILL_TREE=[
 {id:'sword_cross',style:'sword',tier:1,name:'Перекрёстный удар',key:1,seals:1,points:1,price:30,cooldown:3,description:'Две быстрые дуги по прицелу. 28 выносливости.'},
 {id:'sword_lunge',style:'sword',tier:2,name:'Шаг дуэлянта',key:2,seals:3,points:1,price:65,cooldown:4,description:'Рывок вперёд и точный удар. 30 выносливости.'},
 {id:'sword_storm',style:'sword',tier:3,name:'Танец клинка',key:3,seals:5,points:2,price:120,cooldown:8,description:'Три широкие дуги; нужно выбрать безопасное окно. 45 выносливости.'},
 {id:'spear_pierce',style:'spear',tier:1,name:'Пробить строй',key:1,seals:1,points:1,price:35,cooldown:3,description:'Длинный узкий выпад по нескольким целям. 26 выносливости.'},
 {id:'spear_retreat',style:'spear',tier:2,name:'Отступающий выпад',key:2,seals:3,points:1,price:70,cooldown:4,description:'Шаг назад и ответный укол. 32 выносливости.'},
 {id:'spear_comet',style:'spear',tier:3,name:'Копьё кометы',key:3,seals:5,points:2,price:125,cooldown:8,description:'Пробивающий выпад на 330 единиц. 46 выносливости.'},
 {id:'axe_cleave',style:'axe',tier:1,name:'Рассечение',key:1,seals:2,points:1,price:45,cooldown:4,description:'Вертикальный удар с кровотечением. Узкий прицел, 36 выносливости.'},
 {id:'axe_leap',style:'axe',tier:2,name:'Падение клятвы',key:2,seals:3,points:1,price:80,cooldown:5,description:'Прыжок к цели и удар по земле. 42 выносливости.'},
 {id:'axe_fault',style:'axe',tier:3,name:'Разлом',key:3,seals:5,points:2,price:140,cooldown:9,description:'Рассекающая линия на 280 единиц. 50 выносливости.'},
 {id:'staff_fan',style:'staff',tier:1,name:'Веер эха',key:1,seals:3,points:1,price:50,cooldown:4,description:'Пять отдельных сгустков по разным направлениям. 30 выносливости.'},
 {id:'staff_ward',style:'staff',tier:2,name:'Круг защиты',key:2,seals:4,points:1,price:90,cooldown:7,description:'Волна отталкивает врагов, защита снижает урон на 35% в течение 3 секунд. 38 выносливости.'},
 {id:'staff_star',style:'staff',tier:3,name:'Падающая звезда',key:3,seals:6,points:2,price:155,cooldown:10,description:'Большая отложенная печать под мышью. 50 выносливости.'},
] as const;
export type SkillId=typeof SKILL_TREE[number]['id'];
export function learnSkill(p:Profile,id:string,seals:number):string{
 const skill=SKILL_TREE.find(s=>s.id===id);if(!skill)return 'Приём не найден.';
 if(p.skills.includes(skill.id))return 'В этот приём уже вложены искры.';
 const previous=SKILL_TREE.find(s=>s.style===skill.style&&s.tier===skill.tier-1);
 if(previous&&!p.skills.includes(previous.id))return 'Сначала изучи предыдущий приём этой ветви.';
 if(seals<skill.seals)return `Нужно разорвать ${skill.seals} печатей.`;
 if(p.skillPoints<skill.points)return 'Не хватает искр мастерства. Их дают боссы и поручения.';
 const price=p.unlockedSkills.includes(skill.id)?0:skill.price;
 if(p.coins<price)return 'Не хватает осколков души.';
 p.skillPoints-=skill.points;p.coins-=price;p.skills.push(skill.id);
 if(!p.unlockedSkills.includes(skill.id))p.unlockedSkills.push(skill.id);
 return `Готово: ${skill.name}. Клавиша ${skill.key}. Купленный приём останется доступен после возврата искр.`;
}
export function refundBranch(p:Profile,style:WeaponStyle):number{
 const branch=SKILL_TREE.filter(s=>s.style===style&&p.skills.includes(s.id)),ids=branch.map(s=>s.id),points=branch.reduce((n,s)=>n+s.points,0);
 p.skills=p.skills.filter(id=>!ids.includes(id));p.disabledSkills=p.disabledSkills.filter(id=>!ids.includes(id));p.skillPoints+=points;return points;
}
export function toggleSkill(p:Profile,id:string):void{
 const skill=SKILL_TREE.find(s=>s.id===id);if(!skill||!p.skills.includes(skill.id))return;
 p.disabledSkills=p.disabledSkills.includes(skill.id)?p.disabledSkills.filter(v=>v!==skill.id):[...p.disabledSkills,skill.id];
}
