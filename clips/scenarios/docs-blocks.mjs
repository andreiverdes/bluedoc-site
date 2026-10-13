// Docs: the blocks between the drawings. A trackpad scroll runs from the terms through the 3 ways to test fulfilment
// (cards, one recommended), the caution callout over the runbook, to the troubleshooting table, where a row lights up.
const TOP = 76; // a section's heading just under the app bar
const to = (sel) => `(document.querySelector('${sel}').getBoundingClientRect().top - ${TOP})`;

export const crf = 26; // three scrolls of small text

export default {
  doc: 'acme-orders',
  posterAt: 0.3,
  cursor: [800, 600],

  async setup(c) {
    await c.waitForSelector('#trouble');
    await c.ev(`BP.sidebar({ open: false })`); // the page's own width, without the comments panel
    await c.pause(300);
    await c.ev(`scrollTo(0, document.querySelector('#terms').getBoundingClientRect().top + scrollY - ${TOP})`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(800); // the terms

    await c.wheel(await c.ev(to('#options')), { ms: 650 });
    await c.pause(1000); // three ways to test, one recommended

    await c.wheel(await c.ev(to('#run')), { ms: 600 });
    await c.pause(950); // the caution callout over the runbook

    await c.wheel(await c.ev(to('#trouble')), { ms: 700 });
    await c.pause(200);
    await c.moveTo({ sel: '#trouble tbody tr[data-r="1"]', x: 0.3 }, { ms: 500 });
    await c.pause(1100);
  },
};
