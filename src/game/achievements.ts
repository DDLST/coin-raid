// Награды отмечают действия в этой игре. Они сохраняются только вместе с ручным сохранением.
export const ACHIEVEMENTS=[
 {id:'boss_0',name:'Укротитель нежити',icon:'☠',description:'Победи первого хозяина. Ты разорвал первую цепь и вернул себе право идти дальше.',boss:0},
 {id:'boss_1',name:'Сильнее могил',icon:'♜',description:'Победи хозяина кладбища. Ни туман, ни страх не остановили тебя.',boss:1},
 {id:'boss_2',name:'Победитель кровавой луны',icon:'☾',description:'Победи Госпожу тумана. Ещё одна цепь твоей семьи разорвана.',boss:2},
 {id:'boss_3',name:'Пламя под твоей волей',icon:'♨',description:'Победи Архонта. Ты выдержал жар и научился читать его замахи.',boss:3},
 {id:'boss_4',name:'Крушитель ледяной короны',icon:'❄',description:'Победи ледяного хозяина. Даже холод не погасил твою клятву.',boss:4},
 {id:'boss_5',name:'Вернувший имена',icon:'✧',description:'Освободи крипту. Твой путь вернул надежду забытым душам.',boss:5},
 {id:'boss_6',name:'Усмиритель последней бури',icon:'ϟ',description:'Победи хозяина грозы. До семьи осталась последняя печать.',boss:6},
 {id:'boss_7',name:'Защитник своей семьи',icon:'♛',description:'Победи дракона. Ты прошёл весь путь и вернул тех, ради кого сражался.',boss:7},
 {id:'counter',name:'Первый ответ',icon:'⚔',description:'Попади контрударом после точного парирования. Теперь чужой замах становится твоим шансом.',boss:-1},
 {id:'skill',name:'На пути к мастерству',icon:'✦',description:'Изучи первый приём. Ты можешь менять сборку и пробовать свой стиль.',boss:-1},
 {id:'delivery',name:'Вестник надежды',icon:'✉',description:'Доставь посылку и вернись за наградой. Твоя помощь изменила жизнь деревни.',boss:-1},
 {id:'promise',name:'Сдержанное обещание',icon:'♧',description:'Заверши сюжетное поручение. Уникальная награда заслужена твоими действиями.',boss:-1},
 {id:'kills',name:'Не уступающий тьме',icon:'◇',description:'Победи 30 противников. Каждая победа приблизила тебя к дому.',boss:-1},
 {id:'return',name:'Ты не сдался',icon:'☀',description:'Вернись к костру после поражения. Это новая попытка, и твой опыт остаётся с тобой.',boss:-1},
 {id:'training',name:'Готов к дороге',icon:'➚',description:'Пройди все уроки Бруна. Ты готов встретить первую печать.',boss:-1},
] as const;
export type AchievementId=typeof ACHIEVEMENTS[number]['id'];
export type AchievementFacts={bosses:boolean[];counters:number;skills:number;deliveries:boolean;promise:boolean;kills:number;returned:boolean;trained:boolean};
export function earnedAchievements(f:AchievementFacts):AchievementId[]{
 return ACHIEVEMENTS.filter(a=>a.boss>=0?f.bosses[a.boss]:a.id==='counter'?f.counters>0:a.id==='skill'?f.skills>0:a.id==='delivery'?f.deliveries:a.id==='promise'?f.promise:a.id==='kills'?f.kills>=30:a.id==='return'?f.returned:f.trained).map(a=>a.id);
}
