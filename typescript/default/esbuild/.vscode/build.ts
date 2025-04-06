import * as esbuild from 'esbuild';
import { exec } from 'child_process';
import alias from 'esbuild-plugin-alias';

esbuild.build({
  entryPoints: ['src/main.ts'],
  platform: 'browser',
  bundle: true,
  loader: { '.ts': 'tsx', '.tsx': 'tsx', '.css': 'css', '.png': 'file' },
  splitting: true,
  format: 'esm',
  minify: true,
  logLevel: 'info',
  color: true,
  outdir: 'build',
  plugins: [alias({ '@': 'src' })],
}).then(() => {
  exec('node .vscode/pack-zip.ts', (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
  });
}).catch(() => process.exit(1));