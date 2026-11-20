// Other: the hero stat on the home card. The acme-status card draws its one number, 18,420 orders placed in week 41;
// a click opens the page, whose TL;DR leads with the same number, and a scroll shows it again in the numbers table
// over the orders-per-day chart.
import { HOME_READY, seedHome } from './_shared/home-seed.mjs';

const CARD = 'a.bd-card[href*="acme-status"]';

export default {
  doc: 'home',
  posterAt: 0.6,
  cursor: [1000, 640],

  async setup(c) {
    await seedHome(c);
    // 1.2's home renders from an index the fresh BLUEDOC_HOME builds on first start: wait until it is full, then load
    // the home again so every card carries the seeded states
    const indexed = `!/indexing \\d+ of \\d+|\\d+ of \\d+ indexed|Still indexing/.test(document.body.innerText)`;
    await c.waitFor(indexed, 90_000);
    await c.pause(1500);
    await c.goto('home');
    await c.waitFor(`${HOME_READY} && ${indexed}`, 90_000);
    // the home's Cards view (Rows is the other), the card row with acme-status in the middle of the frame
    await c.ev(`(() => { const b = [...document.querySelectorAll('button[role=radio]')].find((b) => b.textContent.trim() === 'Cards'); if (b && b.getAttribute('aria-checked') !== 'true') b.click(); })()`);
    await c.waitForSelector(CARD);
    await c.ev(`window.scrollTo({top: document.querySelector('${CARD}').getBoundingClientRect().top + scrollY - 230, behavior: 'instant'})`);
    await c.pause(600);
  },

  async run(c) {
    await c.pause(700);
    await c.moveTo({ sel: `${CARD} .bd-art`, x: 0.78, y: 0.86 }, { ms: 650 });
    await c.pause(1000);
    await c.click({ sel: `${CARD} .bd-card-t`, x: 0.3 }, { ms: 450 });
    await c.waitFor(`!!window.BP && BP.doc.id === 'acme-status'`);
    await c.pause(1300); // the TL;DR: 18,420 orders
    await c.wheel(await c.ev(`document.querySelector('#numbers').getBoundingClientRect().top - 64`), { ms: 600 });
    await c.pause(1300); // the same number in the table, the chart under it
  },
};
