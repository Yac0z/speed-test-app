const esbuild = require('esbuild');
const path = require('path');

async function build() {
  // Build server with everything bundled
  await esbuild.build({
    entryPoints: [path.join(__dirname, '..', 'packages', 'server', 'src', 'index.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: path.join(__dirname, '..', 'packages', 'server', 'dist', 'index.js'),
    external: [],
    conditions: ['node'],
  });
  console.log('Server build complete!');
}

build().catch(console.error);
