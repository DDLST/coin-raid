export type Area='biome'|'village'|'tutorial';
export type Role='smith'|'armorer'|'healer'|'trader';
export const PEOPLE=[
 {role:'smith' as Role,name:'Брун',job:'Кузнец',texture:'merchant',offset:-170,lore:'Я кую не сталь, а память. Пять хозяев держат печати дракона. Каждая победа разрывает одну цепь у темницы твоей семьи.'},
 {role:'armorer' as Role,name:'Мара',job:'Бронница',texture:'npc-armorer',offset:-50,lore:'Латы спасают от клинков, роба - от чар. Нельзя стать неуязвимым: считай выносливость и выходи из печатей прежде, чем они вспыхнут.'},
 {role:'healer' as Role,name:'Ива',job:'Лекарь',texture:'npc-healer',offset:70,lore:'Твои близкие живы. Дракон питается связями, которые мы бережём. Огонь поселений помнит тебя и возвращает после смерти.'},
 {role:'trader' as Role,name:'Лисандр',job:'Странник',texture:'npc-trader',offset:190,lore:'Дракон забрал семейную казну и превратил её в осколки. Они вернут силу оружию и оплатят помощь деревни. Деньги - средство, семья - причина пути.'},
];
export const OPENING=[
 {title:'Дом, который стоит вернуть.',text:'В маленьком доме у леса лис жил с семьёй. По вечерам они считали сбережения на новую жизнь и слушали дождь за окном.',scene:'home'},
 {title:'Ночь разорванного неба.',text:'Дракон пожиратель душ спустился на деревню. Он похитил семью, забрал казну и расколол силу лиса, чтобы никто не смог его остановить.',scene:'raid'},
 {title:'Пять печатей. Один путь.',text:'Брун рассказал: дракон держит пленников за пятью печатями. Каждую охраняет хозяин биома. Осколки души восстанавливают оружие, а деревни помогают пережить дорогу.',scene:'oath'},
 {title:'Ты идёшь за ними.',text:'Победи пять хозяев, доберись до дракона и освободи семью. Научись читать замах, беречь выносливость и возвращаться к людям после поражения.',scene:'road'},
] as const;
export const ENDING=[{title:'Последняя цепь разорвана.',text:'Дракон повержен. Пять печатей погасли, и дверь темницы открылась. Лис снова услышал знакомые голоса.',scene:'rescue'},{title:'Дом - это те, кого ты вернул.',text:'Семья спасена, украденная казна найдена. За спиной остался путь через туман, впереди - дорога домой. Сохрани завершённое путешествие, если хочешь оставить память об этой победе.',scene:'home'}] as const;
export const LESSONS=[
 {event:'move',title:'Первые шаги',hint:'WASD / стрелки. Дойди до светлого круга справа.',target:1},
 {event:'pickup',title:'Верни силу',hint:'Подбери 3 осколка на тропе. В биомах аура снова разрушит оружие.',target:3},
 {event:'hit',title:'Клинок и прицел',hint:'Наводи мышью на манекен. ЛКМ - удар. Попади 3 раза; движение и прицел независимы.',target:3},
 {event:'parry',title:'Второй приём',hint:'ПКМ с мечом - короткое парирование. У каждого оружия свой второй приём.',target:1},
 {event:'dodge',title:'Уклонение',hint:'Пробел / Shift. Рывок тратит выносливость; в нём урон не проходит.',target:1},
 {event:'heal',title:'Фляга',hint:'Q восстанавливает 38 HP. Заряды ограничены: их пополняют деревни и лекарь.',target:1},
 {event:'ultimate',title:'Абсолютная сила',hint:'R при полном заряде. Здесь заряд уже готов; в мире его дают осколки и попадания.',target:1},
 {event:'inventory',title:'Всё нужное в меню',hint:'Tab / Esc → Вещи. Здесь оружие, броня и заряд умения. Сохранение выполняется только по кнопке.',target:1},
 {event:'map',title:'Карта и задания',hint:'M открывает карту. В меню есть испытания, сундуки и сюжетные поручения.',target:1},
 {event:'talk',title:'Подготовка у людей',hint:'Подойди к Бруну и нажми E. Прочти о печатях или зайди в лавку. Реплики можно пропускать.',target:1},
 {event:'kill',title:'Проверка на нежити',hint:'Победи 2 учебных скелетов. Красная метка - предупреждение. После атаки у врага есть окно для твоего удара.',target:2},
] as const;
export type LineId='bell'|'runes'|'wisp';
export type QuestLine={id:LineId;accepted:boolean;kills:number;artifact:boolean;runes:number;escorted:boolean;claimed:boolean};
export const newLines=():QuestLine[]=>['bell','runes','wisp'].map(id=>({id:id as LineId,accepted:false,kills:0,artifact:false,runes:0,escorted:false,claimed:false}));
export const LINES=[
 {id:'bell' as LineId,name:'Голос забытых',giver:'smith' as Role,offered:0,region:2,reward:'dawnblade',rewardName:'Клинок Рассвета',description:'Победи 2 некромантов после принятия поручения, забери язык колокола у лунного алтаря в третьем биоме и победи Госпожу тумана.'},
 {id:'runes' as LineId,name:'Письма хранителя',giver:'trader' as Role,offered:1,region:3,reward:'runicstaff',rewardName:'Посох трёх печатей',description:'В четвёртом биоме прочти и активируй печати в порядке Луна → Искра → Корень. Неверная печать сбрасывает последовательность. Победи Архонта.'},
 {id:'wisp' as LineId,name:'Последний огонёк',giver:'healer' as Role,offered:2,region:3,reward:'emberseal',rewardName:'Пепельная печать: -18% магического урона',description:'Найди заблудившийся огонёк в четвёртом биоме и проведи к восточному костру. Он движется, пока ты рядом, и замирает, когда ты получаешь урон. Победи Архонта.'},
] as const;
export function lineReady(q:QuestLine,bossDead:boolean):boolean{return q.accepted&&!q.claimed&&bossDead&&(q.id==='bell'?q.kills>=2&&q.artifact:q.id==='runes'?q.runes>=3:q.escorted);}
