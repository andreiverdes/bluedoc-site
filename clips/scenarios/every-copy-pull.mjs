// Every doc type: a copy of a shared doc takes its sharer's updates. A colleague copied acme-dev's shared
// acme-saved-carts-plan (`serve.py import <link>`) and changed its Approach lead; acme-dev then shared rev 2, which
// changes the same lead and the Steps lead. The copy's strip says "acme-dev updated this to rev 2": Compare draws
// their rev over the copy, Pull merges it into the copy's rev 3 and keeps the colleague's lead where both changed,
// and Review's Take theirs puts acme-dev's in. Two homes of their own share bluedoc's stand-in gh
// (fixtures/share-standin), never GitHub.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { backdateBudget, linkIn, standinServer } from '../fixtures/share-standin/standin.mjs';

const DOC = 'acme-saved-carts-plan';
let sharer = null, copy = null;

export default {
  url: () => copy.urlFor(`plans/${DOC}`),
  posterAt: 3.9,
  cursor: [900, 420],

  async prepare(ctx) {
    const gh = `/tmp/bd-clips-${ctx.tag}-copy-gh`;
    // acme-dev shares rev 1, with their pick on the retention question
    sharer = await standinServer({ repo: ctx.repo, base: `/tmp/bd-clips-${ctx.tag}-copy-sharer`, gh });
    const doc = sharer.docPath(DOC);
    const { json } = await sharer.req('GET', `/__bluedoc/url?doc=${encodeURIComponent(doc)}`);
    await sharer.req('PUT', '/__bluedoc/state', { path: json.url, ops: [['decisions:retention', '=d180|']] });
    const link = linkIn(sharer.py('serve.py', 'share', doc, '--answers', 'picks'));

    // the colleague's copy, and their own rev 2: who decides how long carts last
    copy = await standinServer({ repo: ctx.repo, base: `/tmp/bd-clips-${ctx.tag}-copy-colleague`, gh, keepGh: true, projects: { 'acme-shop': [] } });
    copy.py('serve.py', 'import', link, '--to', join(copy.docs, 'plans'));
    const mine = copy.docPath(`plans/${DOC}`);
    copy.py('build.py', 'patch', mine, `section:approach`, '--set', "lead=Acme's mobile team decides how long carts last; orders-api stores them per account.",
      '--change', 'Named the owner.');

    // acme-dev's rev 2: the same lead and the Steps lead; shared again a minute later
    sharer.py('build.py', 'patch', doc, 'section:approach', '--set', 'lead=Carts last 180 days, then the sweeper deletes them; orders-api stores them per account.',
      '--change', 'Said how long carts last.');
    sharer.py('build.py', 'patch', doc, 'section:steps', '--no-bump', '--set', 'lead=The API first, behind a flag; the UI follows in the same week.',
      '--change', 'The API goes first, behind a flag.');
    backdateBudget(sharer.home, 120);
    sharer.py('serve.py', 'share', doc, '--answers', 'picks');

    // the copy's page checks the gist now, not in 15 minutes
    const cf = join(copy.home, 'copies.json');
    const copies = JSON.parse(readFileSync(cf, 'utf8'));
    for (const r of Object.values(copies)) r.checked = 0;
    writeFileSync(cf, JSON.stringify(copies, null, 1));
    return async () => {
      await copy.stop();
      await sharer.stop();
    };
  },

  async setup(c) {
    await c.waitFor(`!!window.BP && !!document.querySelector('.bd-revbar.upd.new')`, 20_000);
    await c.ev('BP.sidebar({ open: false }), BP.contents({ open: false })');
    await c.pause(700);
  },

  async run(c) {
    await c.pause(900);
    // Compare: their rev, marked against the copy; its Changes list leads to the Approach lead both changed
    await c.click({ text: 'Compare', in: '.bd-revbar.upd.new' }, { ms: 650 });
    await c.waitFor(`!!window.BP && !!document.querySelector('.bd-revbar.upd.cmp') && !!document.querySelector('.bd-chl li button')`);
    await c.place([c.x, c.y]);
    await c.click('.bd-chl li:first-child button', { ms: 650 });
    await c.pause(1400);

    // Pull: the merge is the copy's rev 3; both changed the Approach lead, so it waits under Review
    await c.click('.bd-revbar.upd.cmp .bp-btn.primary', { ms: 650 });
    await c.waitFor(`!!window.BP && !!document.querySelector('.bd-revbar.upd.rv')`);
    await c.place([c.x, c.y]);
    await c.pause(700);
    await c.click('.bd-revbar.upd.rv .bp-btn', { ms: 600 });
    await c.waitForSelector('dialog.bd-rvw[open] .rvr .cp');
    await c.pause(700);
    await c.click('dialog.bd-rvw .rvr .cp', { ms: 500 });
    await c.waitFor(`document.querySelector('dialog.bd-rvw .rvl')?.textContent.includes('Nothing left')`);
    await c.pause(1200);
  },
};
