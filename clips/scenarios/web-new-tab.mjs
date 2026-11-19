// Websites: the external-link key in the Blog page's title bar opens the page at its dev server's own URL in a tab
// of its own (not bluedoc's proxy), where it runs as in any tab: the recording follows into the new tab.
import { BOARD_READY, boardOnly, settle, startFixture } from '../fixtures/acme-fit-site/fixture.mjs';

let site;

export default {
  doc: 'acme-site',
  posterAt: 0.5,
  cursor: [760, 560],

  async prepare(ctx) {
    site = await startFixture(ctx);
    return () => site.stop();
  },

  async setup(c) {
    await c.waitFor(BOARD_READY, 30_000);
    await boardOnly(c);
    // the Blog large enough that its title bar shows its keys (a page under 300 px on screen hides them)
    await c.ev(`BP.board({focus: 'blog'})`);
    await settle(c);
  },

  async run(c) {
    await c.pause(700);
    const tab = await c.followNewTab(() => c.click(`.bd-ab[data-ab=blog] .bd-ab-t button.opn`, { ms: 700 }));
    if (!(await tab.ev('location.href')).startsWith(site.origin + '/blog/')) throw new Error(`the new tab is at ${await tab.ev('location.href')}`);
    // the actor's selectors and waits stay on the board's tab after followNewTab: ask the new tab itself
    await tab.waitFor(`!!document.querySelector('#post-weekly-goals')`);
    await c.pause(500);
    const cover = await tab.ev(`(r => [r.left + r.width * 0.5, r.top + r.height * 0.6])(document.querySelector('#post-first-10k .cover').getBoundingClientRect())`);
    await c.moveTo(cover, { ms: 700 });
    await c.pause(1100);
  },
};
