// Websites: an earlier revision of a live page shows its snapshot, never today's site. At rev B the pages are Live;
// View on rev A in Revisions opens rev A, each page labelled Snapshot · rev A, and a zoom into Home's hero shows it
// as it was (New: weekly goals, the week's stats). prepare does what the website guide says: `serve.py snapshot` at
// rev A, a real edit of the site's source, then `build.py patch` to rev B.
import { BOARD_READY, boardOnly, settle, startFixture, toRevB } from '../fixtures/acme-fit-site/fixture.mjs';

let site;

export default {
  doc: 'acme-site',
  posterAt: -0.4,
  cursor: [760, 560],

  async prepare(ctx) {
    site = await startFixture(ctx);
    toRevB(ctx, site);
    return () => site.stop();
  },

  async setup(c) {
    await c.waitFor(BOARD_READY, 30_000);
    await boardOnly(c);
    await c.ev(`BP.sidebar({section: 'revisions'})`);
    await c.ev(`BP.board({fit: true})`);
    await settle(c);
  },

  async run(c) {
    await c.pause(900);
    await c.click(`a.bp-btn[href*="rev=A"]:not([href*="diff"])`, { ms: 700 });
    await c.waitFor(`location.search.includes('rev=A') && !!window.BP && ${BOARD_READY}`, 20_000);
    await c.waitFor(`BP.board().artboards[0].page.badge === 'Snapshot · rev A'`);
    await settle(c);
    await c.pause(500);
    // pinch into rev A's Home about its top, so its title bar (Snapshot · rev A) stays above the hero
    await c.moveTo({ sel: '.bd-ab[data-ab=home] iframe.bd-ab-fr', x: 0.3, y: 0.004 }, { ms: 650 });
    await c.wheel(-75, { ctrl: true, ms: 550 });
    await c.pause(1500);
  },
};
