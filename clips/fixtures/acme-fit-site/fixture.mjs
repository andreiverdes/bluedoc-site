// What the website clips (clips/scenarios/web-*.mjs) share: the Acme Fit site live on its own dev server, its doc in
// the run's docs folder, rev B made from a real source change, and the board's pages and their elements.
import { spawn } from 'node:child_process';
import { cpSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pickPort } from './server.mjs';

const here = import.meta.dirname;

/** True once every page on the board has loaded. */
export const BOARD_READY = `(b => !!b && b.artboards.every(a => a.ready))(BP.board())`;

/**
 * For a clip's prepare(ctx): the site copied to <ctx.work>/acme-fit-site, Vite there on a free port (never 4321 or
 * 8740), and site.bluedoc.json written to <ctx.docs>/acme-site.bluedoc.json in place of the example of that name, its
 * pages pointed at that port and board.root at the copy, then built once so its history has rev A.
 *
 * Vite runs in a process of its own: the harness runs bluedoc's scripts synchronously (ctx.py), and `serve.py
 * snapshot` loads the pages from Vite meanwhile.
 *
 * Returns {root, origin, doc, edit, stop}: edit(rel, [from, to], …) changes the copy's source (Vite hot-reloads it),
 * stop() ends Vite (return it from prepare).
 */
export async function startFixture(ctx) {
  const root = join(ctx.work, 'acme-fit-site');
  rmSync(root, { recursive: true, force: true });
  cpSync(here, root, { recursive: true, filter: (src) => !/[/\\]node_modules$|\.mjs$|\.bluedoc\.json$/.test(src) });
  // a random start, so clips recorded in parallel don't race for the same port
  const port = await pickPort(5200 + Math.floor(Math.random() * 600));
  const vite = spawn(process.execPath, [join(here, 'server.mjs'), String(port), root], { stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  await new Promise((ok, fail) => {
    vite.stdout.on('data', (d) => {
      log += d;
      if (log.includes('Acme Fit at')) ok();
    });
    vite.stderr.on('data', (d) => (log += d));
    vite.on('exit', (code) => fail(new Error(`the fixture's Vite exited (${code}):\n${log}`)));
  });
  const origin = `http://localhost:${port}`;

  // the example's own files make way for the fixture's doc
  for (const f of ['acme-site.bluedoc.json', 'acme-site.bluedoc.history.json', 'acme-site.design', 'acme-site.bluedoc.snapshots'])
    rmSync(join(ctx.docs, f), { recursive: true, force: true });
  const doc = JSON.parse(readFileSync(join(here, 'site.bluedoc.json'), 'utf8'));
  for (const s of doc.sections)
    for (const b of s.blocks ?? [])
      if (b.type === 'board') {
        b.root = relative(ctx.docs, root);
        for (const a of b.artboards) if (a.url) a.url = origin + new URL(a.url).pathname;
      }
  const path = join(ctx.docs, 'acme-site.bluedoc.json');
  writeFileSync(path, JSON.stringify(doc, null, 2) + '\n');
  ctx.py('build.py', path);

  return {
    root,
    origin,
    doc: path,
    edit(rel, ...swaps) {
      const f = join(root, rel);
      let text = readFileSync(f, 'utf8');
      for (const [from, to] of swaps) {
        if (!text.includes(from)) throw new Error(`${rel} has no ${JSON.stringify(from)}`);
        text = text.replace(from, to);
      }
      writeFileSync(f, text);
    },
    async stop() {
      if (vite.exitCode !== null) return;
      vite.kill('SIGTERM');
      await new Promise((ok) => vite.once('exit', ok));
    },
  };
}

/**
 * Rev A → rev B as the website guide has it: `serve.py snapshot` records rev A's live pages, the agent changes the
 * hero in the site's source (its copy, and a coach note in place of the week's stats on the phone), and `build.py
 * patch` records the change as rev B.
 */
export function toRevB(ctx, site) {
  ctx.py('serve.py', 'snapshot', site.doc, '--width', '1440');
  site.edit(
    'src/content/site.ts',
    ["kicker: 'New: weekly goals'", "kicker: 'New: coach notes'"],
    ["subline: 'Acme Fit logs runs, rides and lifts from your watch and phone, then shows your week at a glance.'",
      "subline: 'Acme Fit reads every run, ride and lift from your watch, then writes tomorrow’s plan for you.'"],
    ["cta: 'Start free trial'", "cta: 'Try 14 days free'"],
    ['ring: { done: 72', 'ring: { done: 86'],
  );
  site.edit(
    'src/components/Hero.ts',
    ['<ul class="stats">${hero.stats.map((s) => html`<li><b>${s.value}</b>${s.label}</li>`)}</ul>',
      '<p class="coach-note"><b>Coach</b>Easy 5K tomorrow: your legs did the work today.</p>'],
  );
  site.edit(
    'src/styles/site.css',
    ['.stats b {', '.coach-note { margin: 0 18px; padding: 14px 16px; border-radius: 16px; background: #fff; box-shadow: 0 8px 20px rgba(255, 90, 54, 0.14); font-size: 13px; line-height: 1.4; color: var(--soft); }\n.coach-note b { display: block; margin-bottom: 4px; color: #d9431f; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; }\n.stats b {'],
  );
  ctx.py('build.py', 'patch', site.doc, 'artboard:home', '--change', 'Hero: lead with coach notes; the trial button says how long it lasts.');
}

/** Hides the Pages panel and the right sidebar, so the board has the whole width; waits for the board to widen. */
export async function boardOnly(c) {
  await c.ev(`BP.sidebar({open: false})`);
  if (await c.ev(`BP.board().panel`)) {
    await c.ev(`document.querySelector('.bd-btb > button').click()`);
    await c.waitFor(`!BP.board().panel`);
  }
  await settle(c);
}

/** Waits until the board's stage has kept its width and zoom for 300 ms (a panel's slide, a pan or zoom done). */
export async function settle(c) {
  const probe = `[document.querySelector('.bd-board').clientWidth, BP.board().k, ...(r => [r.left, r.top])(document.querySelector('.bd-ab').getBoundingClientRect())].join()`;
  let last = await c.ev(probe), still = 0;
  while (still < 6) {
    await c.pause(50);
    const now = await c.ev(probe);
    still = now === last ? still + 1 : 0;
    last = now;
  }
}

/**
 * A pinch a step out from a section's fit, which puts the page's top under the board's toolbar: zooming about a
 * point above the bottom tray moves the page bar down into view.
 */
export async function stepBack(c) {
  await c.wheel(14, { ctrl: true, at: [640, 690], ms: 300 });
  await settle(c);
}

/**
 * expr evaluated in a live page's frame on the board (page: its artboard id). The frame is the page's proxy, another
 * port of the same site, so it runs in the doc page's process: expr runs in an isolated world of that frame.
 */
export async function inFrame(c, page, expr) {
  const src = await c.ev(`BP.board().artboards.find(a => a.id === ${JSON.stringify(page)}).page.src`);
  const { frameTree } = await c.tab.call('Page.getFrameTree');
  const frame = (frameTree.childFrames ?? []).map((t) => t.frame).find((f) => f.url.split('#')[0] === src);
  if (!frame) throw new Error(`no frame at ${src}`);
  const { executionContextId } = await c.tab.call('Page.createIsolatedWorld', { frameId: frame.id, worldName: 'clip' });
  const r = await c.tab.call('Runtime.evaluate', { contextId: executionContextId, returnByValue: true, expression: expr });
  return r.result.value;
}

/** Viewport point [x, y] of an element in a live page's frame (fx, fy: fractions of its box), at the board's zoom. */
export async function inPage(c, page, sel, { fx = 0.5, fy = 0.5 } = {}) {
  const p = await inFrame(c, page, `(r => r && [r.left + r.width * ${fx}, r.top + r.height * ${fy}])(document.querySelector(${JSON.stringify(sel)})?.getBoundingClientRect())`);
  if (!p) throw new Error(`no ${sel} in page ${page}`);
  return c.ev(`(f => { const r = f.getBoundingClientRect(), k = r.width / f.width; return [r.left + ${p[0]} * k, r.top + ${p[1]} * k]; })(document.querySelector('.bd-ab[data-ab=${page}] iframe.bd-ab-fr'))`);
}
