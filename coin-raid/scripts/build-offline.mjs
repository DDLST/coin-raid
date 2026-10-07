import { build } from 'vite';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

// Собираем тот же TypeScript + Phaser в обычный скрипт без внешних файлов.
const output = resolve('.offline-build');
await build({
  configFile: false,
  build: {
    outDir: output,
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: resolve('src/main.ts'),
      name: 'CoinRaid',
      formats: ['iife'],
      fileName: () => 'game.js',
      cssFileName: 'game',
    },
  },
});
const code = (await readFile(resolve(output, 'game.js'), 'utf8'))
  .replace(/<\/script/gi, '<\\/script');
const css = await readFile(resolve(output, 'game.css'), 'utf8');
const courseLicense = await readFile('LICENSE', 'utf8');
const phaserLicense = await readFile('node_modules/phaser/LICENSE.md', 'utf8');
const source = await readFile('index.html', 'utf8');
const html = source
  .replace('</head>', `<style>${css}</style>\n<!-- ${courseLicense}\nPhaser: ${phaserLicense} -->\n</head>`)
  .replace('<script type="module" src="/src/main.ts"></script>', () => `<script>${code}</script>`);
await mkdir('docs', { recursive: true });
await writeFile('docs/index.html', html);
await writeFile('docs/.nojekyll', '');
await rm(output, { recursive: true, force: true });
console.log('Готово: docs/index.html. Можно открыть напрямую или опубликовать на GitHub Pages.');
