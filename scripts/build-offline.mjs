import { build } from 'vite';
import { readFile, writeFile, rm, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { mkdir } from 'node:fs/promises';

const source=await readFile('index.html','utf8');
const courseLicense=await readFile('LICENSE','utf8');
const phaserLicense=await readFile('node_modules/phaser/LICENSE.md','utf8');
const credits=`<!-- ${courseLicense}\nPhaser: ${phaserLicense} -->`;

// Pages: small HTML, cached images, and music downloaded only when played.
await rm(resolve('docs'),{recursive:true,force:true});
await build({
 configFile:false,base:'./',
 experimental:{renderBuiltUrl(filename,{hostType}){
  return hostType==='js'?{runtime:`new URL(${JSON.stringify(filename)}, document.baseURI).href`}:{relative:true};
 }},
 build:{outDir:'docs',emptyOutDir:true,assetsInlineLimit:0,cssCodeSplit:false,
  rolldownOptions:{input:resolve('src/main.ts'),output:{format:'iife',entryFileNames:'assets/game-[hash].js',assetFileNames:'assets/[name]-[hash][extname]',codeSplitting:false}},
 },
});
const files=await readdir('docs/assets'),styles=files.filter(f=>f.endsWith('.css')),scripts=files.filter(f=>f.startsWith('game-')&&f.endsWith('.js'));
if(styles.length!==1||scripts.length!==1)throw Error('Expected exactly one Pages stylesheet and game script');
const [cssFile]=styles,[jsFile]=scripts;
const pages=source.replace('</head>',`<link rel="stylesheet" href="./assets/${cssFile}">\n${credits}\n</head>`)
 .replace('<script type="module" src="/src/main.ts"></script>',`<script defer src="./assets/${jsFile}"></script>`);
await writeFile('docs/index.html',pages);await writeFile('docs/.nojekyll','');

// Double-click/offline version: small launcher and ordered local resource scripts.
const output=resolve('.offline-build');
await build({configFile:false,build:{outDir:output,emptyOutDir:true,cssCodeSplit:false,
 lib:{entry:resolve('src/main.ts'),name:'CoinRaid',formats:['iife'],fileName:()=> 'game.js',cssFileName:'game'},
}});
const originalCode=await readFile(resolve(output,'game.js'),'utf8');
const css=await readFile(resolve(output,'game.css'),'utf8');
const assets=new Map();
const code=originalCode.replace(/(["'\x60])(data:(?:image|audio)\/[\w.+-]+;base64,[A-Za-z0-9+/=]+)\1/g,(_literal,_quote,url)=>{
 if(!assets.has(url))assets.set(url,`asset${assets.size}`);
 return `globalThis.__RAID_LOCAL_ASSETS__[${JSON.stringify(assets.get(url))}]`;
});
if(!assets.size)throw Error('Offline resource literals missing');
const MAX_RESOURCE_SCRIPT_BYTES=4*1024*1024;
const packHeader='globalThis.__RAID_LOCAL_ASSETS__ ??= {};\n';
const offlineDirectory=resolve('play');
await rm(offlineDirectory,{recursive:true,force:true});await mkdir(offlineDirectory,{recursive:true});
const resourceScripts=[];
let current=packHeader;
const savePack=async()=>{
 const hash=createHash('sha256').update(current).digest('hex').slice(0,10);
 const file=`assets-${resourceScripts.length+1}-${hash}.js`;
 await writeFile(resolve(offlineDirectory,file),current);resourceScripts.push(file);current=packHeader;
};
for(const [url,key]of assets){
 const statement=`globalThis.__RAID_LOCAL_ASSETS__[${JSON.stringify(key)}]=${JSON.stringify(url)};\n`;
 if(Buffer.byteLength(packHeader+statement)>MAX_RESOURCE_SCRIPT_BYTES)throw Error(`Offline asset ${key} exceeds script limit`);
 if(Buffer.byteLength(current+statement)>MAX_RESOURCE_SCRIPT_BYTES)await savePack();
 current+=statement;
}
if(current!==packHeader)await savePack();
const gameFile=`game-${createHash('sha256').update(code).digest('hex').slice(0,10)}.js`;
if(Buffer.byteLength(code)>MAX_RESOURCE_SCRIPT_BYTES)throw Error('Offline engine exceeds script limit');
await writeFile(resolve(offlineDirectory,gameFile),code);
const tags=[...resourceScripts,gameFile].map(file=>`<script defer src="./play/${file}"></script>`).join('\n');
const offline=source.replace('</head>',`<style>${css}</style>\n${credits}\n</head>`)
 .replace('<script type="module" src="/src/main.ts"></script>',()=>tags);
await writeFile('PLAY.html',offline);await rm(output,{recursive:true,force:true});
console.log(`Готово: docs/ для сайта; PLAY.html + play/ для запуска без интернета (${resourceScripts.length} частей ресурсов).`);
