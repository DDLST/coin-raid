export type Area='biome'|'village'|'tutorial'|'interior';
export type Role='smith'|'armorer'|'healer'|'trader';
export const PEOPLE=[
 {role:'smith' as Role,name:'Брун',job:'Кузнец',texture:'merchant',offset:-170,lore:'Я кую не сталь, а память. Восемь хозяев держат печати дракона. Каждая победа разрывает одну цепь у темницы твоей семьи.'},
 {role:'armorer' as Role,name:'Мара',job:'Бронница',texture:'npc-armorer',offset:-50,lore:'Латы спасают от клинков, роба - от чар. Нельзя стать неуязвимым: считай выносливость и выходи из печатей прежде, чем они вспыхнут.'},
 {role:'healer' as Role,name:'Ива',job:'Лекарь',texture:'npc-healer',offset:70,lore:'Твои близкие живы. Дракон питается связями, которые мы бережём. Огонь поселений помнит тебя и возвращает после смерти.'},
 {role:'trader' as Role,name:'Лисандр',job:'Странник',texture:'npc-trader',offset:190,lore:'Дракон забрал семейную казну и превратил её в осколки. Они вернут силу оружию и оплатят помощь деревни. Деньги - средство, семья - причина пути.'},
];
export const OPENING=[
 {title:'Дом, который стоит вернуть.',text:'Каждый вечер лис возвращался к маленькому дому у леса. Его ждали любимая и ребёнок, тёплый свет и смех за столом. Меч висел у двери, а в семейной шкатулке росли сбережения на будущее. Он ещё не знал, что обычный вечер станет тем, ради чего придётся пройти через тьму.',scene:'home'},
 {title:'Ночь разорванного неба.',text:'Небо расколол рёв. Дракон, пожиратель душ, похитил семью: светящиеся клетки исчезли в дыму вместе с любимыми голосами. Он забрал казну и рассеял силу лиса по своим землям. Семья жива, но каждая ночь питает цепи дракона. Времени на ожидание нет.',scene:'raid'},
 {title:'Восемь печатей. Один путь.',text:'Брун нашёл лиса среди развалин. Восемь хозяев держат цепи темницы, а призраки печатей ломают оружие у границ каждой земли. Но память нельзя украсть навсегда: осколки души вернут выбранному оружию силу. Победа над хозяином даст искру мастерства и разорвёт ещё одну цепь.',scene:'oath'},
 {title:'Ты идёшь за ними.',text:'Кузнец приготовит оружие, бронница укрепит плащ, лекарь пополнит флягу. Помогай людям: их истории и поручения открывают особые награды. Костры вернут тебя после поражения. Пройди восемь земель, сразись с драконом и верни семью домой. Клятва начинается с первого шага.',scene:'road'},
] as const;
export const ENDING=[{title:'Последняя цепь разорвана.',text:'Дракон повержен. Восемь печатей погасли, и дверь темницы открылась. Лис снова услышал знакомые голоса.',scene:'rescue'},{title:'Дом - это те, кого ты вернул.',text:'Семья спасена, украденная казна найдена. За спиной остался путь через туман, впереди - дорога домой. Сохрани завершённое путешествие, если хочешь оставить память об этой победе.',scene:'home'}] as const;
export const LESSONS=[
 {event:'move',title:'Первые шаги',hint:'WASD / стрелки. Дойди до светлого круга справа.',target:1},
 {event:'pickup',title:'Верни силу',hint:'Подбери 3 осколка на тропе. В биомах аура снова разрушит оружие.',target:3},
 {event:'hit',title:'Клинок и прицел',hint:'Наводи мышью на манекен. ЛКМ - удар. Попади 3 раза; движение и прицел независимы.',target:3},
 {event:'counter',title:'Парирование и контрудар',hint:'Наведи мышь на стража. Отбей его замах на ПКМ / C, затем нажми ЛКМ в золотом окне для контрудара.',target:1},
 {event:'dodge',title:'Уклонение',hint:'Пробел / Shift. Рывок тратит выносливость; в нём урон не проходит.',target:1},
 {event:'heal',title:'Фляга',hint:'Q восстанавливает 38 HP. Заряды ограничены: их пополняют деревни и лекарь.',target:1},
 {event:'ultimate',title:'Абсолютная сила',hint:'R при полном заряде. Здесь заряд уже готов; в мире его дают осколки и попадания.',target:1},
 {event:'inventory',title:'Всё нужное в меню',hint:'Tab / Esc → Вещи. Здесь оружие, броня и заряд умения. Сохранение выполняется только по кнопке.',target:1},
 {event:'map',title:'Карта и задания',hint:'M открывает карту. В меню есть испытания, сундуки и сюжетные поручения.',target:1},
 {event:'talk',title:'Подготовка у людей',hint:'Подойди к двери кузницы, нажми E, войди и поговори с Бруном. Прочти о печатях или зайди в лавку. Реплики можно пропускать.',target:1},
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

export type DeliveryId='medicine'|'blueprint';
export type Delivery={id:DeliveryId;accepted:boolean;delivered:boolean;claimed:boolean};
export const newDeliveries=():Delivery[]=>[{id:'medicine',accepted:false,delivered:false,claimed:false},{id:'blueprint',accepted:false,delivered:false,claimed:false}];
export const DELIVERIES=[
 {id:'medicine' as DeliveryId,name:'Свет для больных',giver:'healer' as Role,from:1,to:0,receiver:'armorer' as Role,seals:2,parcel:'Сумка настоек Ивы',reward:35,description:'Ива приготовила настойки для раненых Серебряного дыма. Доставь сумку Маре в деревню после первого биома; вернись к Иве за наградой.',response:'Спасибо. Эти настойки помогут моим людям пережить ночь.'},
 {id:'blueprint' as DeliveryId,name:'Мост над тишиной',giver:'smith' as Role,from:4,to:2,receiver:'trader' as Role,seals:5,parcel:'Чертёж мостовых скоб',reward:65,description:'Брун нашёл способ восстановить старый мост. Передай чертёж Лисандру на Лунной переправе, затем вернись к Бруну в Посёлок забытых имён.',response:'Теперь караван сможет пройти. Верну мастеру его искру надежды.'},
] as const;
