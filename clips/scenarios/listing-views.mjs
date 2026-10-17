// Store listings: Sections | Store preview | Ads. The preview draws the product page and a search result at phone
// width (a mock, and labelled one); Ads holds the Google App campaign's headlines, descriptions and images.
import { panels, shotsReady } from '../fixtures/acme-fit-listing/listing.mjs';

export default {
  doc: 'acme-fit-listing',
  posterAt: 2.4,
  cursor: [800, 500],

  async setup(c) {
    await panels(c, { left: false });
  },

  async run(c) {
    await c.pause(800);
    await c.click('.bd-lst-btb [data-view=preview]', { ms: 650 });
    await c.waitFor(`BP.listing().view === 'preview'`);
    await shotsReady(c);
    await c.pause(1500);
    await c.click('.bd-lst-btb [data-view=ads]', { ms: 500 });
    await c.waitFor(`BP.listing().view === 'ads'`);
    await shotsReady(c);
    await c.pause(1500);
    await c.click('.bd-lst-btb [data-view=sections]', { ms: 550 });
    await c.waitFor(`BP.listing().view === 'sections'`);
    await shotsReady(c);
    await c.pause(800);
  },
};
