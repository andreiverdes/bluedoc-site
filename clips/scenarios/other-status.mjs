// Other: a weekly status page. It opens on the hero stat and the TL;DR; a trackpad scroll runs through the
// week-over-week numbers (a row lights up), the incident, and the Week 42 tasks with the one open decision.
const TOP = 64; // a section's heading just under the app bar
const to = (sel) => `(document.querySelector('${sel}').getBoundingClientRect().top - ${TOP})`;

export default {
  doc: 'acme-status',
  posterAt: 0.3,
  cursor: [1150, 560], // in the gutter right of the page, clear of the text

  async setup(c) {
    await c.waitForSelector('#next');
    await c.ev(`BP.sidebar({ open: false })`); // the page's own width, without the comments panel
    await c.waitFor(`!BP.sidebar().open`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(1000); // the title, the stat, the TL;DR

    await c.wheel(await c.ev(to('#numbers')), { ms: 600 });
    await c.pause(250);
    await c.moveTo({ sel: '#numbers tbody tr[data-r="0"]', x: 0.3 }, { ms: 550 });
    await c.pause(900); // orders up 6%

    await c.wheel(await c.ev(to('#incidents')), { ms: 550 });
    await c.pause(1000); // the incident and its note

    await c.wheel(await c.ev(to('#next')), { ms: 550 });
    await c.pause(200);
    await c.moveTo({ sel: '#next .bp-choice.rec', y: 0.6 }, { ms: 600 });
    await c.pause(1100); // the tasks, the decision with its recommendation
  },
};
