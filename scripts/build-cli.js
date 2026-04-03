const esbuild = require('esbuild');
const path = require('path');

async function build() {
  // CLI
  await esbuild.build({
    entryPoints: [path.join(__dirname, '..', 'packages', 'cli', 'src', 'index.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: path.join(__dirname, '..', 'packages', 'cli', 'dist', 'bundle.js'),
    external: [],
    conditions: ['node'],
    banner: {
      js: '#!/usr/bin/env node',
    },
  });

  // Copy to index.js for pkg
  const fs = require('fs');
  fs.copyFileSync(
    path.join(__dirname, '..', 'packages', 'cli', 'dist', 'bundle.js'),
    path.join(__dirname, '..', 'packages', 'cli', 'dist', 'index.js')
  );

  console.log('CLI build complete!');
}

build().catch(console.error);
