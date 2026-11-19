// Other: a weekly status page. It opens on the title and the TL;DR; a trackpad scroll runs through the week-over-week
// numbers (a row lights up), the orders-per-day chart (Thursday's dip, its values on hover), the incident, and the
// one open decision for next week with its recommendation.
const TOP = 64; // a section's heading just under the app bar
const to = (sel) => `(document.querySelector('${sel}').getBoundingClientRect().top - ${TOP})`;
const CHART = '#numbers .bp-chart';

export default {
  doc: 'acme-status',
  posterAt: 0.3,
  cursor: [1150, 330], // right of the text; after the first scroll, on a table row (lower, the chart would show a tooltip)

  async setup(c) {
    await c.waitForSelector('#next');
    await c.ev(`BP.sidebar({ open: false })`); // the page's own width, without the comments panel
    await c.waitFor(`!BP.sidebar().open`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(800); // the title, the TL;DR

    await c.wheel(await c.ev(to('#numbers')), { ms: 600 });
    await c.pause(200);
    await c.moveTo({ sel: '#numbers tbody tr[data-r="0"]', x: 0.3 }, { ms: 500 });
    await c.pause(600); // orders up 6%

    // the chart under the table: Thursday's dip, both weeks' values
    await c.wheel(await c.ev(`(document.querySelector('${CHART}').getBoundingClientRect().top - 200)`), { ms: 500 });
    await c.moveTo({ sel: CHART, x: 0.515, y: 0.45 }, { ms: 500 });
    await c.pause(1000);

    await c.wheel(await c.ev(to('#incidents')), { ms: 500 });
    await c.pause(600); // the incident and its note

    await c.wheel(await c.ev(to('#next')), { ms: 500 });
    await c.pause(150);
    await c.moveTo({ sel: '#next .bp-opt:has(.rec) .rec', y: 0.6 }, { ms: 550 });
    await c.pause(1000); // the decision with its recommendation
  },
};
