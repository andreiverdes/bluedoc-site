// Other: the hero stat on the home card. The acme-status card draws its one number, 18,420 orders placed in week 41;
// a click opens the page, whose TL;DR leads with the same number.
import { seedHome } from './_shared/home-seed.mjs';

const CARD = 'a.bd-card[href*="acme-status"]';

export default {
  doc: 'home',
  posterAt: 0.6,
  cursor: [1000, 640],

  async setup(c) {
    await seedHome(c);
    // the card row with acme-status in the middle of the frame
    await c.ev(`window.scrollTo({top: document.querySelector('${CARD}').getBoundingClientRect().top + scrollY - 230, behavior: 'instant'})`);
    await c.pause(400);
  },

  async run(c) {
    await c.pause(700);
    await c.moveTo({ sel: `${CARD} .bd-art`, x: 0.78, y: 0.86 }, { ms: 650 });
    await c.pause(1000);
    await c.click({ sel: `${CARD} .bd-card-t`, x: 0.3 }, { ms: 450 });
    await c.waitFor(`!!window.BP && BP.doc.id === 'acme-status'`);
    await c.pause(1400);
  },
};
