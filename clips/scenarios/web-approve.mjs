// Websites: pick a hero version in place, then Approve website: the dialog lists the pick against the
// recommendation, and Approve sends it to the agent, which writes the picks into the site's source.
import { BOARD_READY, boardOnly, settle, startFixture, stepBack } from '../fixtures/acme-fit-site/fixture.mjs';

let site;

export default {
  doc: 'acme-site',
  posterAt: 3.4,
  cursor: [800, 560],

  async prepare(ctx) {
    site = await startFixture(ctx);
    return () => site.stop();
  },

  async setup(c) {
    await c.waitFor(BOARD_READY, 30_000);
    await boardOnly(c);
    await c.ev(`BP.board({section: ['home', 'hero']})`);
    await settle(c);
    await stepBack(c);
    await c.waitFor(`(e => e && !e.hidden && e.offsetWidth > 0)(document.querySelector('.bd-ab[data-ab=home] .bd-var'))`);
  },

  async run(c) {
    await c.pause(700);
    await c.click(`.bd-ab[data-ab=home] .bd-var button[data-id=c]`, { ms: 650 });
    await c.waitFor(`BP.board().artboards[0].page.variants.hero.shown === 'c'`);
    await c.pause(700);
    await c.click(`.bd-key.approve`, { ms: 700 });
    await c.waitFor(`!!document.querySelector('.bd-approve[open]')`);
    await c.pause(1300);
    await c.click(`.bd-approve[open] .bp-btn.ok`, { ms: 650 });
    await c.waitFor(`!document.querySelector('.bd-approve[open]') && document.querySelector('.bd-key.approve').classList.contains('done')`, 15_000);
    await c.pause(1300);
  },
};
