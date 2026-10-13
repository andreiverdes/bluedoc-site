#!/usr/bin/env node
// npm run clips [-- <name> ...]: records clips/scenarios/<name>.mjs (all of them without a name) into public/clips/.
// Each scenario gets a fresh bluedoc server (its own BLUEDOC_HOME, a free port, a fresh copy of the Acme examples),
// recorded in headless Chrome at 1280 × 800, DPR 2. Runs in parallel don't collide: their paths are keyed by
// CLIPS_TAG (default: the scenario's name for one, else the pid). See clips/README.md.
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
const CURSOR = readFileSync(join(here, 'lib/cursor.js'), 'utf8');

function ensureFfmpeg() {
  if (haveFfmpeg()) return;
  console.error('ffmpeg is not installed.');
  if (spawnSync('brew', ['--version']).status === 0) {
    console.error('Installing it with Homebrew: brew install ffmpeg');
    if (spawnSync('brew', ['install', 'ffmpeg'], { stdio: 'inherit' }).status === 0 && haveFfmpeg()) return;
  }
  console.error('Install ffmpeg (with libx264 and libvpx) and run again.');
  process.exit(1);
}

const kb = (n) => (n >= 1 << 20 ? `${(n / (1 << 20)).toFixed(2)} MB` : `${Math.round(n / 1024)} KB`);

async function openTab(chrome, sc, targetId) {
  const opts = { ...VIEW, colorScheme: sc.colorScheme ?? 'dark' };
  const tab = targetId ? await Tab.attach(chrome, targetId, opts) : await Tab.open(chrome, opts);
  await tab.call('Page.addScriptToEvaluateOnNewDocument', { source: CURSOR });
  return tab;
}

async function record(name, tag, chrome) {
  const file = join(here, 'scenarios', `${name}.mjs`);
  if (!existsSync(file)) throw new Error(`no scenario ${relative(site, file)}`);
  const mod = await import(pathToFileURL(file).href);
  const sc = mod.default;
  const dir = join(WORK, name);

  // the docs sit in acme-shop/docs, so the home page names the project acme-shop
  const bd = await Bluedoc.start({ repo: BLUEDOC_REPO, home: `/tmp/bd-clips-${tag}`, work: `/tmp/bd-clips-work-${tag}/acme-shop` });
  console.log(`  bluedoc at ${bd.origin} (BLUEDOC_HOME=${bd.home}, docs in ${bd.docs})`);
  const tabs = [];
  let cleanup = null;
  try {
    if (sc.prepare) {
      cleanup = await sc.prepare({
        bd, tag, docs: bd.docs, work: bd.work, home: bd.home, repo: bd.repo, scripts: bd.scripts, env: bd.env,
        py: (...args) => bd.py(...args), site, clips: here,
      });
    }
    const tab = await openTab(chrome, sc);
    tabs.push(tab);
    let rec = null;
    const actor = new Actor(tab, VIEW, {
      bd,
      openTab: async (trigger) => {
        const id = await Tab.nextNewTarget(chrome, trigger);
        const t = await openTab(chrome, sc, id);
        tabs.push(t);
        // the cursor script runs on documents created from now on: reload if the page already loaded without it
        await t.waitFor("document.readyState === 'complete'", 30_000).catch(() => {});
        if (!(await t.ev('!!window.__clipCursor').catch(() => false))) await t.ev(CURSOR);
        if (rec) await rec.switchTo(t);
        return t;
      },
    });
    chrome.errors.length = 0;
    await (sc.url ? tab.go(await sc.url({ bd })) : actor.goto(sc.doc, sc.query));
    if (sc.setup) await sc.setup(actor);
    await actor.place(sc.cursor ?? [VIEW.width * 0.62, VIEW.height * 0.58]);
    await actor.pause(400); // fonts, the first flow tokens and the cursor painted

    rec = new Recorder(tab, dir, VIEW);
    await rec.start();
    await sc.run(actor);
    await rec.stop();

    const dropGlitches = mod.dropGlitches ?? sc.dropGlitches ?? false;
    const stats = await rec.resample({ dropGlitches });
    if (chrome.errors.length) console.warn(`  page errors: ${chrome.errors.join(' | ')}`);
    console.log(`  ${stats.seconds.toFixed(2)} s, ${stats.frames} frames at 30 fps from ${stats.painted} painted`);
    if (stats.offSize) console.log(`  ${stats.offSize} frames at another viewport size dropped (a full-screen change)`);
    if (stats.glitches.length) {
      console.log(`  ${dropGlitches ? 'dropped' : 'suspect'} glitch frames (unrastered dark tiles; clip s): ${stats.glitches.join(', ')}` +
        (dropGlitches ? '' : ': look at them; record again, or export dropGlitches = true if they are glitches'));
    }
    // a still page paints nothing; a gap while something moves is a dropped stretch (jank)
    if (stats.stalls.length) console.log(`  paint gaps over 100 ms (clip s, ms): ${stats.stalls.map(([t, ms]) => `${t}s ${ms}ms`).join(', ')}`);
    // a busy clip (a blueprint's grid and glow, a board glide) can trade a little quality for size
    const crf = mod.crf ?? sc.crf ?? 23;
    const files = await encode(rec.seq, stats.frames, OUT, name, { posterAt: sc.posterAt ?? 0, crf, webmCrf: mod.webmCrf ?? sc.webmCrf ?? crf + 13 });
    for (const [f, n] of files) console.log(`  ${relative(site, f).padEnd(40)} ${kb(n).padStart(9)}`);
    const review = reviewFrames(rec.seq, join(dir, 'review'), stats.frames);
    console.log(`  review frames: ${relative(site, join(dir, 'review'))}/ (${review.map((f) => basename(f)).join(', ')})`);
    return files.reduce((s, [, n]) => s + n, 0);
  } finally {
    for (const t of tabs) await t.close();
    if (typeof cleanup === 'function') await cleanup();
    await bd.stop();
  }
}

async function main() {
  const all = readdirSync(join(here, 'scenarios')).filter((f) => f.endsWith('.mjs')).map((f) => f.slice(0, -4)).sort();
  const names = process.argv.slice(2).length ? process.argv.slice(2) : all;
  const tag = (process.env.CLIPS_TAG || (names.length === 1 ? names[0] : `pid${process.pid}`)).replace(/[^\w.-]/g, '_');
  ensureFfmpeg();
  const chrome = await Chrome.launch(VIEW);
  let total = 0, failed = 0;
  try {
    for (const name of names) {
      console.log(`● ${name} (CLIPS_TAG=${tag})`);
      try {
        total += await record(name, tag, chrome);
      } catch (e) {
        failed++;
        console.error(`  failed: ${e.stack || e}`);
      }
    }
  } finally {
    await chrome.close();
  }
  console.log(`${names.length - failed}/${names.length} clips, ${kb(total)} written`);
  process.exitCode = failed ? 1 : 0;
}

main().catch((e) => {
  console.error(e.stack || e);
  process.exit(1);
});
