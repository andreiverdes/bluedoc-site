// Copies a bluedoc checkout's page template and board router into public/g/, where the shared-doc viewer (/g/,
// src/pages/g/index.astro) draws every shared doc with them, and records the bluedoc version they came from in
// public/g/version.json (a doc shared from a newer bluedoc gets a note). Each bluedoc release runs it:
//   npm run sync-template -- <path to the bluedoc repo>
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const out = join(root, 'public/g');

const arg = process.argv[2];
if (!arg) {
  console.error('usage: npm run sync-template -- <path to the bluedoc repo>');
  process.exit(2);
}
const repo = resolve(arg);
const assets = join(repo, 'skills/bluedoc/assets');
const template = join(assets, 'template.html');
const geo = join(assets, 'board-geo.js');
const pkg = join(repo, 'package.json');
for (const f of [template, geo, pkg]) {
  if (!existsSync(f)) {
    console.error(`${f} not found: is ${repo} a bluedoc checkout?`);
    process.exit(1);
  }
}

const { version } = JSON.parse(readFileSync(pkg, 'utf8'));
if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`${pkg} has no version like 1.2.3`);
  process.exit(1);
}
// the viewer fills these placeholders and sets window.bluedocShare, which keeps the page off the server routes:
// a template without them would draw a page that thinks it is served
const html = readFileSync(template, 'utf8');
const missing = ['__BLUEDOC_DOC__', '__BLUEDOC_TITLE__', '/*__BOARD_GEO__*/', 'window.bluedocShare'].filter((s) => !html.includes(s));
if (missing.length) {
  console.error(`${template} lacks ${missing.join(', ')}: it predates shared docs (bluedoc 1.0.37)`);
  process.exit(1);
}

mkdirSync(out, { recursive: true });
copyFileSync(template, join(out, 'template.html'));
copyFileSync(geo, join(out, 'board-geo.js'));
writeFileSync(join(out, 'version.json'), `${JSON.stringify({ version }, null, 2)}\n`);
console.log(`public/g: template.html and board-geo.js from bluedoc ${version}`);
