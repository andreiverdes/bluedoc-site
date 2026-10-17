// Store listings: variants. On the App Store page, the CPP: Runners tab names what the custom product page changes
// (the order of three sets, the promotional text); Compare to default puts each set's default page beside it.
import { panels, shotsReady } from '../fixtures/acme-fit-listing/listing.mjs';

export default {
  doc: 'acme-fit-listing',
  posterAt: -0.6,
  cursor: [820, 420],

  async setup(c) {
    await panels(c, { left: false });
    await c.ev(`BP.listing({platform: 'appstore'})`);
    await shotsReady(c);
  },

  async run(c) {
    await c.pause(800);
    await c.click('.bd-lst-vtab[data-variant=runners]', { ms: 700 });
    await c.waitFor(`BP.listing().variant === 'runners'`);
    await shotsReady(c);
    await c.pause(1000);
    await c.click('.bd-lst-cmpbtn', { ms: 650 });
    await c.waitFor(`BP.listing().compare === true`);
    await shotsReady(c);
    await c.pause(400);
    await c.ev(`(m => m.scrollTo({top: m.querySelector('.bd-lst-sec[data-row=phone]').offsetTop - 60, behavior: 'smooth'}))(document.querySelector('.bd-lst-main'))`);
    await c.pause(900);
    await shotsReady(c);
    await c.moveTo([900, 560], { ms: 700 });
    await c.pause(1400);
  },
};
