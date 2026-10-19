import { build } from 'vite';
import { spawnSync } from 'node:child_process';
import { rm } from 'node:fs/promises';

// Vite разрешает те же импорты TypeScript, что и при сборке игры.
const output = '.test-build';
try {
  await build({
    configFile: false,
    logLevel: 'warn',
    plugins: [
      {
        name: 'test-asset-urls',
        enforce: 'pre',
        load(id) {
          if (/\.(mp3|webp)\?url$/.test(id)) return 'export default "test-asset";';
        },
      },
    ],
    build: {
      outDir: output,
      emptyOutDir: true,
      target: 'node20',
      minify: false,
      lib: { entry: 'tests/domain.test.ts', formats: ['es'], fileName: () => 'domain.test.mjs' },
      rolldownOptions: { external: [/^node:/] },
    },
  });
  const result = spawnSync(process.execPath, ['--test', `${output}/domain.test.mjs`], {
    stdio: 'inherit',
  });
  process.exitCode = result.status ?? 1;
} finally {
  await rm(output, { recursive: true, force: true });
}
