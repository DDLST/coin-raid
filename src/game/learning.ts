import type { Point } from './world';

export const BRIEFING_CARDS = [
  { icon:'◈', title:'Сила и духовное оружие', text:'Призрак ломает оружие при входе в биом. Светящиеся осколки возвращают силу. Набери квоту, победи босса и иди к следующей деревне.' },
  { icon:'⚔', title:'Красная метка - опасность', text:'Полоса HP сверху показывает здоровье, нижняя - выносливость. Красный сектор или круг предупреждает об атаке. Отойди или уклонись на Пробел.' },
  { icon:'✦', title:'Парирование и ответ', text:'Наводи мышью на врага. C или ПКМ меча отбивает удар. При точном парировании появляется золотая метка: ЛКМ наносит контрудар именно этому врагу.' },
  { icon:'☁', title:'Смотри под ноги', text:'Дождь создаёт мокрые участки. Гроза и метеоры отмечают место удара заранее. Ураган тянет к своей воронке. События могут задеть и противников.' },
  { icon:'▣', title:'Испытания и награды', text:'Выполняй задания, чтобы появился сундук. M покажет его место, E откроет. После смерти испытания непройденного биома начинаются снова, с новыми сундуками.' },
  { icon:'♜', title:'Деревня и ручное сохранение', text:'Костёр возвращает после смерти. В домах можно купить оружие, броню, +10 HP, выносливость и запас зелий. Tab → Сохранить прогресс. После обучения сам дойди до рощи.' },
] as const;

export const LESSON_CUES = [
  { keys:['W','A','S','D'], selector:'', label:'Дойди до отмеченного круга' },
  { keys:['W','A','S','D'], selector:'', label:'Подойди к каждому светящемуся осколку' },
  { keys:['МЫШЬ','ЛКМ'], selector:'', label:'Наведи прицел на отмеченного стража' },
  { keys:['C','ПКМ','ЛКМ'], selector:'#counter-ready', label:'Отбей замах, затем ударь золотую цель' },
  { keys:['ПРОБЕЛ','SHIFT'], selector:'', label:'Нажми уклонение и посмотри на выносливость' },
  { keys:['Q'], selector:'.hero-hud', label:'Выпей флягу и посмотри на полосу HP' },
  { keys:['R'], selector:'#ultimate-ready', label:'Используй подготовленное абсолютное умение' },
  { keys:['TAB'], selector:'#menu-button,[data-menu-tab="equipment"]', label:'Открой меню, затем подсвеченную вкладку «Вещи»' },
  { keys:['M'], selector:'#map-button,#map-close', label:'Открой карту, найди себя и закрой карту' },
  { keys:['E'], selector:'#interact-button,#dialog-trade,#dialog-skip', label:'Подойди к отмеченной двери, затем к кузнецу' },
  { keys:['МЫШЬ','ЛКМ','C','ПРОБЕЛ'], selector:'', label:'Победи двух отмеченных учебных скелетов' },
] as const;

export function lessonPoint(index:number,player:Point,coins:Point[],enemies:Point[],door:Point,npc:Point,inside:boolean):Point|null{
 const nearest=(points:Point[])=>[...points].sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y))[0]??null;
 return index===0?{x:305,y:550}:index===1?nearest(coins):index===2||index===3||index===10?nearest(enemies):index===9?inside?npc:door:null;
}
