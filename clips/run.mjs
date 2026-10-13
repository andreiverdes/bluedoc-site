#!/usr/bin/env node
// npm run clips [-- <name> ...]: records clips/scenarios/<name>.mjs (all of them without a name) into public/clips/.
// Each run starts a bluedoc server of its own (BLUEDOC_HOME=/tmp/bd-clips, a free port, a fresh copy of the Acme
// examples) and a headless Chrome at 1280 × 800, DPR 2. See clips/README.md.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Actor } from './lib/actor.mjs';
import { Bluedoc } from './lib/bluedoc.mjs';
import { Chrome, Tab } from './lib/chrome.mjs';
import { encode, haveFfmpeg, Recorder, reviewFrames } from './lib/recorder.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const site = resolve(here, '..');
const OUT = join(site, 'public/clips');
const WORK = join(here, '.work');
const VIEW = { width: 1280, height: 800, dpr: 2 };
const BLUEDOC_REPO = resolve(process.env.BLUEDOC_REPO || join(site, '../bluedoc'));
const BLUEDOC_HOME = '/tmp/bd-clips';

function ensureFfmpeg() {
  if (haveFfmpeg()) return;
  console.error('ffmpeg is not installed.');
  if (spawnSync('brew', ['--version']).status === 0) {
    console.error('Installing it with Homebrew: brew install ffmpeg');
    if (spawnSync('brew', ['install', 'ffmpeg'], { stdio: 'inherit' }).status === 0 && haveFfmpeg()) return;
  }
  console.error('Install ffmpeg (with libx264, libvpx and libwebp) and run again.');
  process.exit(1);
}

const kb = (n) => (n >= 1 << 20 ? `${(n / (1 << 20)).toFixed(2)} MB` : `${Math.round(n / 1024)} KB`);

async function record(name, bd, chrome) {
  const file = join(here, 'scenarios', `${name}.mjs`);
  if (!existsSync(file)) throw new Error(`no scenario ${relative(site, file)}`);
  const sc = (await import(pathToFileURL(file).href)).default;
  const dir = join(WORK, name);
  const tab = await Tab.open(chrome, { ...VIEW, colorScheme: sc.colorScheme ?? 'dark' });
  await tab.call('Page.addScriptToEvaluateOnNewDocument', { source: readFileSync(join(here, 'lib/cursor.js'), 'utf8') });
  const actor = new Actor(tab, VIEW);
  chrome.errors.length = 0;

  await tab.go(await bd.urlFor(sc.doc, sc.query));
  await tab.waitFor('!!window.BP');
  if (sc.setup) await sc.setup(actor);
  await actor.place(sc.cursor ?? [VIEW.width * 0.62, VIEW.height * 0.58]);
  await actor.pause(400); // fonts, the first flow tokens and the cursor painted

  const rec = new Recorder(tab, dir, VIEW);
  await rec.start();
  await sc.run(actor);
  await rec.stop();
  await tab.call('Target.closeTarget', { targetId: (await tab.call('Target.getTargetInfo')).targetInfo.targetId }).catch(() => {});

  const stats = rec.resample();
  if (chrome.errors.length) console.warn(`  page errors: ${chrome.errors.join(' | ')}`);
  console.log(`  ${stats.seconds.toFixed(2)} s, ${stats.frames} frames at 30 fps from ${stats.painted} painted`);
  // a still page paints nothing; a gap while something moves is a dropped stretch (jank)
  if (stats.stalls.length) console.log(`  paint gaps over 100 ms (clip s, ms): ${stats.stalls.map(([t, ms]) => `${t}s ${ms}ms`).join(', ')}`);
  const files = await encode(rec.seq, stats.frames, OUT, name, { posterAt: sc.posterAt ?? 0 });
  for (const [f, n] of files) console.log(`  ${relative(site, f).padEnd(40)} ${kb(n).padStart(9)}`);
  const review = reviewFrames(rec.seq, join(dir, 'review'), stats.frames);
  console.log(`  review frames: ${relative(site, join(dir, 'review'))}/ (${review.map((f) => basename(f)).join(', ')})`);
  return files.reduce((s, [, n]) => s + n, 0);
}

async function main() {
  const all = readdirSync(join(here, 'scenarios')).filter((f) => f.endsWith('.mjs')).map((f) => f.slice(0, -4)).sort();
  const names = process.argv.slice(2).length ? process.argv.slice(2) : all;
  ensureFfmpeg();
  const bd = await Bluedoc.start({ repo: BLUEDOC_REPO, home: BLUEDOC_HOME, work: '/tmp/bd-clips-work' });
  console.log(`bluedoc at ${bd.origin} (BLUEDOC_HOME=${BLUEDOC_HOME})`);
  const chrome = await Chrome.launch(VIEW);
  let total = 0, failed = 0;
  try {
    for (const name of names) {
      console.log(`● ${name}`);
      try {
        total += await record(name, bd, chrome);
      } catch (e) {
        failed++;
        console.error(`  failed: ${e.stack || e}`);
      }
    }
  } finally {
    await chrome.close();
    await bd.stop();
  }
  console.log(`${names.length - failed}/${names.length} clips, ${kb(total)} in ${relative(site, OUT)}/`);
  process.exitCode = failed ? 1 : 0;
}

main().catch((e) => {
  console.error(e.stack || e);
  process.exit(1);
});
