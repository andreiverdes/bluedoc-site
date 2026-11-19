// Every doc type: share a read-only link. On acme-saved-carts-plan the app bar's Share opens the share sheet; Share
// puts the doc in a secret gist and copies its bluedoc.ai link. The agent then writes rev 2: on reload the key reads
// Update with 1 → 2 in its well, and Update puts rev 2 in the same gist (the link stays). Share talks to bluedoc's
// stand-in gh (fixtures/share-standin), never GitHub; the minute bluedoc waits between two updates of a doc is skipped.
import { backdateBudget, standinServer } from '../fixtures/share-standin/standin.mjs';

const DOC = 'acme-saved-carts-plan';
const KEY = '.bd-bar-r .bd-shk';
const SHEET = 'dialog.bd-share:not(.bd-rvw, .bd-mkcs)';
let bd = null;

export default {
  url: () => bd.urlFor(DOC),
  posterAt: -1.2,
  cursor: [900, 300],

  async prepare(ctx) {
    bd = await standinServer({
      repo: ctx.repo, base: `/tmp/bd-clips-${ctx.tag}-share`,
    });
    return () => bd.stop();
  },

  async setup(c) {
    await c.waitFor('!!window.BP && !!document.querySelector(' + JSON.stringify(KEY) + ')');
    await c.ev('BP.sidebar({ open: false }), BP.contents({ open: false })');
    await c.pause(600);
  },

  async run(c) {
    await c.pause(600);
    await c.click(KEY, { ms: 600 });
    await c.waitForSelector(`${SHEET}[open] .go:not(:disabled)`);
    await c.pause(550);
    await c.click(`${SHEET} .go`, { ms: 500 });
    await c.waitForSelector(`${SHEET}[open] .lnk input`);

    // the agent's rev 2, while the reader reads the link; a minute later as the gist budget counts
    backdateBudget(bd.home, 120);
    const rev2 = bd.pyAsync('build.py', 'patch', bd.docPath(DOC), 'item:decisions/retention', '--json',
      JSON.stringify({ recommend: 'd90', sub: 'Recommend 90 days: covers monthly reorders; the sweeper can stretch it later.' }),
      '--change', 'Question 1 now recommends 90 days.');
    await c.pause(1100);
    await c.key('Escape');
    await rev2;
    await c.pause(250);
    await c.reload();
    await c.waitFor(`document.querySelector(${JSON.stringify(KEY)}).dataset.share === 'newer'`);
    await c.pause(800);
    await c.click(KEY, { ms: 550 });
    await c.waitForSelector(`${SHEET}[open] .go:not(:disabled)`);
    await c.pause(650);
    await c.click(`${SHEET} .go`, { ms: 450 });
    await c.waitFor(`document.querySelector(${JSON.stringify(KEY)}).dataset.share === 'shared'`);
    await c.pause(1300);
  },
};
