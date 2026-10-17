// Store listings: Approve listing. The dialog counts the machine-translated strings not accepted and the shots that
// still show mock-up UI, names the variants it covers and lists the style picks; after Approve the chip reads
// Approved · rev D.
import { panels, shotsReady } from '../fixtures/acme-fit-listing/listing.mjs';

export default {
  doc: 'acme-fit-listing',
  posterAt: 3.0,
  cursor: [800, 560],

  async setup(c) {
    await panels(c, { left: false });
  },

  async run(c) {
    await c.pause(800);
    await c.click('.bd-key.approve', { ms: 700 });
    await c.waitFor(`!!document.querySelector('.bd-approve[open]')`);
    await shotsReady(c);
    await c.pause(1800);
    await c.click('.bd-approve[open] .bp-btn.ok', { ms: 650 });
    await c.waitFor(`!document.querySelector('.bd-approve[open]') && document.querySelector('.bd-key.approve').classList.contains('done')`, 15_000);
    await shotsReady(c);
    await c.pause(1300);
  },
};
