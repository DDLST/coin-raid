import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { extname } from 'node:path';

const catalog = JSON.parse(await readFile('guide/catalog.json', 'utf8'));
const groups = {
  core: 'Запуск и состояние',
  player: 'Герой',
  combat: 'Бой',
  enemies: 'Враги и боссы',
  world: 'Мир и погода',
  village: 'Деревни',
  economy: 'Торговля и осколки',
  progression: 'Развитие',
  quests: 'Задания и награды',
  story: 'История и обучение',
  rendering: 'Графика и анимация',
  audio: 'Музыка и звук',
  persistence: 'Сохранения',
  ui: 'Интерфейс и ввод',
  assets: 'Изображения и музыка',
  tooling: 'Сборка и настройки',
  tests: 'Проверки',
};
const entries = [];
for (const [path, meta] of Object.entries(catalog.files)) {
  const source = await readFile(path, 'utf8');
  const lines = source.split('\n');
  const symbols = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const exported = /^export\s+(?:async\s+)?(const|function|class|type|interface)\s+(\w+)/.exec(
      line,
    );
    const method =
      /^  (?:(?:public|private|protected|static|async|readonly)\s+)*(\w+)(?:<[^>]*>)?\(/.exec(line);
    const field =
      /^  (?:(?:public|private|protected|static|readonly)\s+)*(\w+)[!?]?(?:\s*:[^=;]+)?\s*=/.exec(
        line,
      );
    const declaredField =
      /^  (?:(?:public|private|protected|static|readonly)\s+)*(\w+)[!?]?\s*:\s*[^;=]+;/.exec(line);
    const match = exported || method || field || declaredField;
    if (!match) continue;
    const name = exported ? exported[2] : match[1];
    if (['constructor', 'if', 'for', 'while', 'switch', 'catch', 'return'].includes(name)) continue;
    const kind = exported ? exported[1] : method ? 'method' : 'field';
    const description =
      catalog.fieldHelp?.[path]?.[name] ||
      catalog.methodHelp[name] ||
      (name.startsWith('create') && name.endsWith('Artwork')
        ? 'Создаёт соответствующие текстуры персонажей, предметов или окружения.'
        : kind === 'field'
          ? 'Поле состояния или ссылка на систему.'
          : kind === 'type'
            ? 'Форма данных для проверки TypeScript.'
            : kind === 'const'
              ? 'Параметры, таблица данных или функция, объявленная константой.'
              : 'Объявление в этом модуле.');
    symbols.push({ name, kind, line: i + 1, description });
  }
  entries.push({
    path,
    ...meta,
    lines: lines.length - 1,
    source,
    symbols,
    size: Buffer.byteLength(source),
  });
}
async function assets(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = directory + '/' + item.name;
    if (item.isDirectory()) {
      await assets(path);
      continue;
    }
    const size = (await stat(path)).size;
    const music = extname(path) === '.mp3';
    entries.push({
      path,
      group: 'assets',
      description: music
        ? 'Музыкальная запись. Подключение и выбор режима — audio/Soundtrack.ts; авторы и лицензия — ASSET_CREDITS.md.'
        : 'Рисованный атлас или иллюстрация. Загрузка — GameScene.preload; нарезка — rendering/TextureFactory.ts; титульное изображение — src/style.css.',
      lines: 0,
      size,
      source: null,
      symbols: [],
    });
  }
}
await assets('src/assets');
entries.sort((a, b) => a.path.localeCompare(b.path, 'en'));
const data = {
  baseCommit: catalog.baseCommit,
  groups,
  files: entries,
  mechanics: catalog.mechanics,
};
for (const m of data.mechanics) {
  const file = entries.find((f) => f.path === m.file);
  if (!file) throw new Error('Unknown mechanic file: ' + m.file);
  const symbol = file.symbols.find((s) => s.name === m.symbol);
  if (!symbol) throw new Error('Unknown mechanic symbol: ' + m.symbol + ' in ' + m.file);
  m.line = symbol.line;
}
const json = JSON.stringify(data).replaceAll('<', '\\u003c');
const template = await readFile('scripts/templates/project-map.html', 'utf8');
await writeFile(
  'guide/index.html',
  template.replace('__PROJECT_DATA__', () => json),
);
let md = '# Индекс исходников RAID COIN\n\n';
md +=
  'Индекс создан из текущего кода командой `npm run docs:map`. В браузерной [карте проекта](index.html) можно искать механику, выбирать файл и читать код с номерами строк.\n\n';
md += 'База изменений: `' + catalog.baseCommit + '`.\n\n';
for (const [group, title] of Object.entries(groups)) {
  const files = entries.filter((f) => f.group === group);
  if (!files.length) continue;
  md += '## ' + title + '\n\n';
  for (const file of files) {
    md += '### [' + file.path + '](../' + file.path + ')\n\n' + file.description + '\n\n';
    if (!file.source) {
      md += 'Ресурс: ' + (file.size / 1024 / 1024).toFixed(2) + ' МиБ.\n\n';
      continue;
    }
    md += 'Строк: ' + file.lines + '.\n\n';
    if (!file.symbols.length) continue;
    md += '| Символ | Строка | Назначение |\n| --- | --- | --- |\n';
    for (const s of file.symbols)
      md +=
        '| `' +
        s.name +
        '` | [' +
        s.line +
        '](../' +
        file.path +
        '#L' +
        s.line +
        ') | ' +
        s.description.replaceAll('|', '/').replaceAll('\n', ' ') +
        ' |\n';
    md += '\n';
  }
}
await writeFile('guide/SOURCE_INDEX.md', md.trimEnd() + '\n');
console.log(
  `Карта обновлена: ${entries.filter((f) => f.source).length} файлов с кодом и настройками, ${entries.filter((f) => !f.source).length} ресурсов, ${catalog.mechanics.length} механик.`,
);
