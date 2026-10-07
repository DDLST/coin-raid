import './style.css';
import { createGame } from './game/config';

let started=false;
const button=document.getElementById('primary-button') as HTMLButtonElement;
button.disabled=false;
button.addEventListener('click',()=>{
 if(started)return;started=true;button.disabled=true;
 document.getElementById('title-status')!.textContent='Подготовка мира…';
 const training=(document.getElementById('start-training') as HTMLInputElement).checked;
 requestAnimationFrame(()=>createGame('game',training));
});
document.getElementById('exit-button')!.addEventListener('click',()=>{
 if(window.opener)window.close();
 else document.getElementById('title-status')!.textContent='Чтобы выйти, закрой эту вкладку браузера.';
});
