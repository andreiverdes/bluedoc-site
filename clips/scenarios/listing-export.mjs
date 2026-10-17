// Store listings: Export to… ZIP (fastlane). While it runs the key shows its progress (files done of total, a bar);
// then the browser saves the ZIP. The card that follows is drawn by this scenario (the page shows no file list): it
// lists the ZIP the export wrote, read from the download folder.
// To keep the clip short the export is narrowed to one platform and locale, as build.py --platform/--locale and the
// server's &platform=&locale= do: the page's request gets those two parameters added (Google Play, en-US: 59 PNGs).
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { panels, shotsReady } from '../fixtures/acme-fit-listing/listing.mjs';

let downloads;

const NARROW = `(() => {
  const f = window.fetch;
  window.fetch = (u, o) => f(typeof u === 'string' && /^\\/__bluedoc\\/listing\\?/.test(u) ? u + '&platform=play&locale=en-US' : u, o);
})()`;

/**
 * The ZIP's files by folder, as [folder, what] rows: fastlane's folders under fastlane/metadata/ one by one, each
 * variant's (variants/<id>/) as one row, files at the top level last.
 */
function groups(zip) {
  const r = spawnSync('unzip', ['-Z1', zip], { encoding: 'utf8' });
  const names = r.stdout.split('\n').filter((n) => n && !n.endsWith('/'));
  const out = new Map();
  for (const n of names) {
    const parts = n.split('/');
    const k = parts[0] === 'variants' ? parts.slice(0, 2).join('/') + '/' : parts.length > 1 ? parts.slice(0, -1).join('/').replace(/^fastlane\/metadata\//, '') + '/' : '';
    const g = out.get(k) || { n: 0, pngs: 0, files: [] };
    g.n++;
    if (n.endsWith('.png')) g.pngs++;
    g.files.push(parts.at(-1));
    out.set(k, g);
  }
  const what = (k, g) => (k.startsWith('variants/') ? `${g.n} files` : g.pngs === g.n && g.n > 2 ? `${g.n} PNGs` : g.files.join(' · '));
  const rows = [...out].sort(([a], [b]) => (a === '') - (b === '') || a.startsWith('variants/') - b.startsWith('variants/'));
  return { total: names.length, rows: rows.map(([k, g]) => [k || 'the ZIP’s top level', what(k, g)]) };
}

const esc = (s) => s.replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[ch]);

function card(name, { total, rows }) {
  return `<div id="clip-lx-card"><div class="h"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
    <b>${esc(name)}</b><span class="n">${total} files</span></div>${rows
    .map(([k, w]) => `<div class="r"><span class="f">${esc(k)}</span><span class="w">${esc(w)}</span></div>`)
    .join('')}</div>`;
}

const CSS = `#clip-lx-card { position: fixed; right: 20px; top: 150px; width: 580px; z-index: 50; padding: 14px 16px 12px;
  border-radius: 14px; background: #15171c; box-shadow: 0 0 0 1px #2b2e36, 0 18px 50px rgb(0 0 0 / .45); color: #e6e7ea;
  font: 12px/1.35 ui-monospace, 'SF Mono', Menlo, monospace; opacity: 0; translate: 0 8px; transition: opacity .35s, translate .35s; }
#clip-lx-card.on { opacity: 1; translate: 0 0; }
#clip-lx-card .h { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font: 600 13px/1.3 Inter, system-ui, sans-serif; color: #f2f3f5; }
#clip-lx-card .h svg { color: #7aa7ff; flex: none; }
#clip-lx-card .h .n { margin-left: auto; font-weight: 500; color: #9aa0ab; }
#clip-lx-card .r { display: flex; gap: 10px; padding: 5px 0; border-top: 1px solid #23262d; }
#clip-lx-card .f { flex: none; width: 330px; color: #c9ccd3; overflow-wrap: anywhere; }
#clip-lx-card .w { color: #8f96a3; overflow-wrap: anywhere; }`;

export default {
  doc: 'acme-fit-listing',
  posterAt: 2.6,
  cursor: [760, 470],

  async prepare(ctx) {
    downloads = join(ctx.work, 'downloads');
    rmSync(downloads, { recursive: true, force: true });
    mkdirSync(downloads, { recursive: true });
  },

  async setup(c) {
    await c.tab.chrome.call('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
    await panels(c, { left: false });
    await c.ev(NARROW);
    await c.addStyle(CSS);
  },

  async run(c) {
    await c.pause(800);
    await c.click('.bd-lstx .bd-expb', { ms: 700 });
    await c.waitFor(`!document.querySelector('.bd-lstx .bd-expm').hidden`);
    await shotsReady(c);
    await c.pause(400);
    await c.moveTo('.bd-lstx [data-format=zip]', { ms: 450 });
    await c.pause(400);
    await c.click('.bd-lstx [data-format=zip]', { ms: 200 });
    await c.waitFor(`document.querySelector('.bd-lstx').classList.contains('busy')`);
    await c.moveTo([1000, 420], { ms: 700 });
    await c.waitFor(`document.querySelector('.bd-lstx').classList.contains('ok')`, 60_000);
    let zip = null;
    for (let i = 0; i < 50 && !zip; i++) {
      zip = readdirSync(downloads).find((f) => f.endsWith('.zip'));
      if (!zip) await c.pause(100);
    }
    if (!zip) throw new Error(`the export saved no ZIP in ${downloads}`);
    await c.pause(500);
    await c.ev(`document.body.insertAdjacentHTML('beforeend', ${JSON.stringify(card(zip, groups(join(downloads, zip))))}); requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById('clip-lx-card').classList.add('on')))`);
    await c.pause(2200);
  },
};
