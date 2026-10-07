import track0 from '../assets/music/boss-battle-10-metal.mp3?url';
import track1 from '../assets/music/boss-battle-2-symphonic-metal.mp3?url';
import track2 from '../assets/music/boss-battle-9-metal.mp3?url';
import track3 from '../assets/music/choir-1.mp3?url';
import track4 from '../assets/music/choir-2.mp3?url';
import track5 from '../assets/music/choir-3.mp3?url';
import track6 from '../assets/music/fairy-adventure.mp3?url';
import track7 from '../assets/music/fight-for-better-future-rockmetal.mp3?url';
import track8 from '../assets/music/heavy-battle-1.mp3?url';
import track9 from '../assets/music/heavy-battle-2.mp3?url';
export const TRACKS={
 'boss-battle-10-metal':{url:track0,name:'Boss Battle 10',author:'nene',seconds:42.732},
 'boss-battle-2-symphonic-metal':{url:track1,name:'Symphonic Boss Battle 2',author:'nene',seconds:26.532},
 'boss-battle-9-metal':{url:track2,name:'Boss Battle 9',author:'nene',seconds:42.516},
 'choir-1':{url:track3,name:'Fantasy Choir I',author:'César da Rocha (cesisco)',seconds:91.296},
 'choir-2':{url:track4,name:'Fantasy Choir II',author:'César da Rocha (cesisco)',seconds:53.172},
 'choir-3':{url:track5,name:'Fantasy Choir III',author:'César da Rocha (cesisco)',seconds:126.180},
 'fairy-adventure':{url:track6,name:'Fairy Adventure',author:'MintoDog',seconds:144.036},
 'fight-for-better-future-rockmetal':{url:track7,name:'Fight for Better Future',author:'nene',seconds:68.184},
 'heavy-battle-1':{url:track8,name:'Heavy Battle I',author:'MintoDog',seconds:80.892},
 'heavy-battle-2':{url:track9,name:'Heavy Battle II',author:'MintoDog',seconds:83.088},
} as const;
export type TrackId=keyof typeof TRACKS;
export type MusicMode='explore'|'combat'|'boss'|'rage'|'village'|'story';
export const THEMES:Record<'explore'|'combat'|'boss'|'rage',TrackId>[]=[
 {explore:'choir-2',combat:'boss-battle-2-symphonic-metal',boss:'boss-battle-10-metal',rage:'boss-battle-9-metal'},
 {explore:'choir-3',combat:'heavy-battle-1',boss:'boss-battle-9-metal',rage:'boss-battle-10-metal'},
 {explore:'choir-1',combat:'boss-battle-9-metal',boss:'boss-battle-2-symphonic-metal',rage:'boss-battle-10-metal'},
 {explore:'heavy-battle-1',combat:'fight-for-better-future-rockmetal',boss:'boss-battle-10-metal',rage:'boss-battle-9-metal'},
 {explore:'choir-2',combat:'heavy-battle-2',boss:'boss-battle-2-symphonic-metal',rage:'boss-battle-10-metal'},
 {explore:'choir-3',combat:'boss-battle-2-symphonic-metal',boss:'boss-battle-9-metal',rage:'boss-battle-10-metal'},
 {explore:'heavy-battle-2',combat:'boss-battle-9-metal',boss:'boss-battle-10-metal',rage:'boss-battle-2-symphonic-metal'},
 {explore:'choir-1',combat:'fight-for-better-future-rockmetal',boss:'boss-battle-9-metal',rage:'boss-battle-10-metal'},
];
export const soundtrack=(region:number,mode:MusicMode):TrackId=>mode==='village'?'fairy-adventure':mode==='story'?'choir-1':THEMES[Math.max(0,Math.min(THEMES.length-1,region))][mode];
// Два media-элемента декодируют только текущую и затухающую запись.
export class RecordedMusic{
 failed=false;current:TrackId|null=null;
 private slots:{element:HTMLAudioElement;gain:GainNode;source:MediaElementAudioSourceNode;key:TrackId|null;stopAt:number}[]=[];
 private active=-1;private playing=false;private positions=new Map<TrackId,number>();
 constructor(private context:AudioContext,private bus:AudioNode){}
 update(dt:number,playing:boolean,region:number,mode:MusicMode):void{
  for(const slot of this.slots)if(slot.stopAt>0){slot.stopAt-=dt;if(slot.stopAt<=0){slot.element.pause();slot.stopAt=0;}}
  if(!playing){if(this.playing)for(const slot of this.slots)slot.element.pause();this.playing=false;return;}
  const id=soundtrack(region,mode);
  if(id!==this.current){const old=this.slots[this.active];if(old){if(old.key)this.positions.set(old.key,old.element.currentTime);old.gain.gain.setTargetAtTime(0,this.context.currentTime,.20);old.stopAt=.8;}
   this.active=this.active===0?1:0;let slot=this.slots[this.active];
   if(!slot){const element=new Audio();element.preload='metadata';element.loop=true;const gain=this.context.createGain();gain.gain.value=0;const source=this.context.createMediaElementSource(element);source.connect(gain).connect(this.bus);slot={element,gain,source,key:null,stopAt:0};this.slots[this.active]=slot;}
   slot.stopAt=0;slot.element.pause();slot.key=id;slot.element.src=TRACKS[id].url;slot.element.loop=true;slot.element.addEventListener('loadedmetadata',()=>{if(slot.key===id)slot.element.currentTime=Math.min(this.positions.get(id)??0,Math.max(0,slot.element.duration-.1));},{once:true});slot.element.onerror=()=>{if(slot.key===this.current)this.failed=true;};slot.gain.gain.setTargetAtTime(mode==='village'?.54:mode==='explore'?.72:mode==='combat'?.92:1.10,this.context.currentTime,.25);this.current=id;this.playing=false;
  }
  if(!this.playing){const slot=this.slots[this.active];if(slot)void slot.element.play().catch((error:unknown)=>{if(!(error instanceof DOMException&&error.name==='AbortError')&&slot.key===id&&this.current===id)this.failed=true;});this.playing=true;}
 }
 get title():string{return this.current?`${TRACKS[this.current].name} · ${TRACKS[this.current].author}`:'Музыка включится после действия игрока';}
 destroy():void{for(const slot of this.slots){slot.element.pause();slot.element.removeAttribute('src');slot.element.load();slot.source.disconnect();slot.gain.disconnect();}this.slots=[];}
}
