// Designs: Export PNG sets. The button renders every PNG, Contents.json and the adaptive-icon XML and saves them
// beside the doc; the page says so in a toast ("Saved 32 files to acme-fit-design.icons/app-icon"). The card that
// follows is drawn by this scenario (the page shows no file list): it lists the folder the export wrote, read from
// the temp docs folder after the save.
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { panels, settled, view } from '../fixtures/acme-fit-design/board.mjs';

/** The files under dir, grouped by folder: [[folder, [names]]]. */
function tree(dir) {
  const out = new Map();
  const walk = (d) => {
    for (const n of readdirSync(d).sort()) {
      const p = join(d, n);
      if (statSync(p).isDirectory()) walk(p);
      else {
        const k = relative(dir, d) + '/';
        out.set(k, [...(out.get(k) || []), n]);
      }
    }
  };
  walk(dir);
  return [...out];
}

const esc = (s) => s.replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[ch]);

function card(dir) {
  const groups = tree(dir), count = groups.reduce((n, [, f]) => n + f.length, 0);
  const rows = groups.map(([folder, files]) => {
    const pngs = files.every((f) => f.endsWith('.png')) && files.length > 3;
    const what = pngs ? `${files.length} PNGs` : files.join(' · ');
    return `<div class="r"><span class="f">${esc(folder)}</span><span class="w">${esc(what)}</span></div>`;
  });
  return `<div id="clip-ix-card"><div class="h"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>
    <b>acme-fit-design.icons/app-icon/</b><span class="n">${count} files</span></div>${rows.join('')}</div>`;
}

const CSS = `#clip-ix-card { position: fixed; right: 20px; top: 150px; width: 430px; z-index: 50; padding: 14px 16px 12px;
  border-radius: 14px; background: #15171c; box-shadow: 0 0 0 1px #2b2e36, 0 18px 50px rgb(0 0 0 / .45); color: #e6e7ea;
  font: 12px/1.35 ui-monospace, 'SF Mono', Menlo, monospace; opacity: 0; translate: 0 8px; transition: opacity .35s, translate .35s; }
#clip-ix-card.on { opacity: 1; translate: 0 0; }
#clip-ix-card .h { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font: 600 13px/1.3 Inter, system-ui, sans-serif; color: #f2f3f5; }
#clip-ix-card .h svg { color: #7aa7ff; flex: none; }
#clip-ix-card .h .n { margin-left: auto; font-weight: 500; color: #9aa0ab; }
#clip-ix-card .r { display: flex; gap: 10px; padding: 5px 0; border-top: 1px solid #23262d; }
#clip-ix-card .f { flex: none; width: 232px; color: #c9ccd3; }
#clip-ix-card .w { color: #8f96a3; overflow-wrap: anywhere; }`;

export default {
  doc: 'acme-fit-design',
  posterAt: -0.5,
  cursor: [700, 640],

  async setup(c) {
    await panels(c);
    await view(c, { x: 640, y: 4500, k: 0.6, to: [405, 450] });
    await settled(c);
    await c.addStyle(CSS);
  },

  async run(c) {
    await c.pause(800);
    await c.click('.bd-ab[data-ab="app-icon"] .bd-ab-t .ixp', { ms: 700 });
    await c.waitFor(`/Saved \\d+ files/.test(document.getElementById('bp-toast').textContent)`, 20_000);
    const dir = join(c.bd.docs, 'acme-fit-design.icons/app-icon');
    if (!existsSync(dir)) throw new Error(`the export wrote nothing to ${dir}`);
    await c.pause(600);
    await c.ev(`document.body.insertAdjacentHTML('beforeend', ${JSON.stringify(card(dir))}); requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById('clip-ix-card').classList.add('on')))`);
    await c.moveTo([700, 640], { ms: 700 });
    await c.pause(1700);
  },
};
