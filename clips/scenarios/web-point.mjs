// Websites: Element (the dock's comment pin) on a post title on the live Blog, and write a comment; Request changes
// opens the send dialog with what goes to the agent: the comment on its section and element (On Post list › h2) and
// the hero pick still open.
import { BOARD_READY, boardOnly, inPage, settle, startFixture, stepBack } from '../fixtures/acme-fit-site/fixture.mjs';

let site;

export default {
  doc: 'acme-site',
  posterAt: -0.4,
  cursor: [1000, 600],

  async prepare(ctx) {
    site = await startFixture(ctx);
    return () => site.stop();
  },

  async setup(c) {
    await c.waitFor(BOARD_READY, 30_000);
    await boardOnly(c);
    await c.ev(`BP.board({section: ['blog', 'posts']})`);
    await settle(c);
    await stepBack(c);
  },

  async run(c) {
    await c.pause(700);
    await c.click(`.bd-key[data-m="point"]`, { ms: 600 });
    await c.pause(200);
    await c.click(await inPage(c, 'blog', '#post-first-10k .post-title', { fx: 0.35, fy: 0.3 }), { ms: 650 });
    await c.waitForSelector('.bd-cmp:not([hidden]) textarea');
    await c.pause(150);
    await c.type('Fit it on one line', { cps: 30 });
    await c.pause(200);
    await c.key('Enter', { meta: true });
    await c.waitFor(`BP.annotations().length === 1`);
    await c.pause(350);
    await c.click(`.bd-key.go`, { ms: 600 });
    await c.waitFor(`!!document.querySelector('dialog.bd-chgs[open]')`);
    await c.pause(1800);
  },
};
