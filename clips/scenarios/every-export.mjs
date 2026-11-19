// Every doc type: export. On acme-orders the app bar's ⋮ menu lists Export: HTML file (works offline), PDF and
// Markdown; Markdown saves acme-orders.md, made in the page from the doc as written, and the clip opens the saved file
// in an editor. The server is fixtures/share-standin's (its Share key talks to the stand-in gh, not GitHub).
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { mdEditor } from '../fixtures/md-editor/editor.mjs';
import { standinServer } from '../fixtures/share-standin/standin.mjs';

const DOC = 'acme-orders';
const MORE = '.bd-bar-r .bd-docm > .bd-ibtn';
const MENU = '.bd-bar-r .bd-docm .bd-selm';
// an Export row of the ⋮ menu (the same action as the Export key's, which sits in ⋮ above a phone)
const ITEM = (label) => ({ text: label, in: MENU });
let bd = null, editor = null, downloads = '';

export default {
  url: () => bd.urlFor(DOC),
  posterAt: 2.1,
  cursor: [880, 330],

  async prepare(ctx) {
    downloads = `/tmp/bd-clips-${ctx.tag}-export-dl`;
    rmSync(downloads, { recursive: true, force: true });
    mkdirSync(downloads, { recursive: true });
    bd = await standinServer({
      repo: ctx.repo, base: `/tmp/bd-clips-${ctx.tag}-export`,
    });
    editor = await mdEditor(join(downloads, `${DOC}.md`), '~/Downloads/acme-orders.md');
    return async () => {
      await editor.stop();
      await bd.stop();
    };
  },

  async setup(c) {
    await c.waitFor(`!!window.BP && !!document.querySelector(${JSON.stringify(MENU)})`);
    await c.ev('BP.sidebar({ open: false }), BP.contents({ open: false })');
    // the browser saves downloads in the run's folder (headless Chrome's own default is the user's Downloads)
    await c.tab.chrome.call('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
    await c.pause(600);
  },

  async run(c) {
    await c.pause(700);
    await c.click(MORE, { ms: 650 });
    await c.waitFor(`!document.querySelector(${JSON.stringify(MENU)}).hidden`);
    await c.pause(500);
    await c.moveTo(ITEM('HTML file'), { ms: 380 });
    await c.pause(350);
    await c.moveTo(ITEM('PDF'), { ms: 300 });
    await c.pause(350);
    await c.click(ITEM('Markdown'), { ms: 300 });
    const file = join(downloads, `${DOC}.md`);
    for (let i = 0; i < 100 && !(existsSync(file) && !readdirSync(downloads).some((f) => f.endsWith('.crdownload'))); i++) await sleep(50);
    if (!existsSync(file)) throw new Error(`no ${file} saved`);
    await c.pause(500);

    // the saved file, in an editor
    await c.tab.go(editor.url);
    await c.place([700, 500]);
    await c.pause(1200);
    await c.wheel(420, { ms: 1400 });
    await c.pause(1100);
  },
};
