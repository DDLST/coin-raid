export type WeatherKind='clear'|'rain'|'storm'|'meteors'|'hurricane';
export const WEATHER_DURATION=15;
export const METEOR_WARNING=1.65, METEOR_RADIUS=65;
export const HURRICANE_RADIUS=125, HURRICANE_PULL=72;
export const WEATHER_NAMES:Record<WeatherKind,string>={clear:'Ясно',rain:'Дождь',storm:'Гроза',meteors:'Метеорный дождь',hurricane:'Ураган'};
export const WEATHER_HINTS:Record<WeatherKind,string>={clear:'',rain:'Дождь: мокрые участки замедляют лиса и противников.',storm:'Гроза: выйди из красного круга до удара молнии.',meteors:'Метеоры: огненный круг отмечает место падения. Камни поражают и врагов.',hurricane:'Ураган: обходи движущуюся воронку. Она тянет и лиса, и врагов; Пробел помогает вырваться.'};
export function randomWeather(region:number,value=Math.random()):Exclude<WeatherKind,'clear'>{
 const pool:Exclude<WeatherKind,'clear'>[]=region===3||region===7?['meteors','storm','hurricane','rain']:region===4||region===6?['hurricane','storm','rain','meteors']:['rain','storm','meteors','hurricane'];
 return pool[Math.min(3,Math.max(0,Math.floor(value*4)))];
}
