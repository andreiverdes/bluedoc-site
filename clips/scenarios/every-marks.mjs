// Every doc type: the eye key fades the comment marks (a pin, a marked phrase, a region's box) out to read the page
// clean, then brings them back. A drawing would show only its pin at rest: its ink shows while it is hovered or
// selected (by design), so the third mark is a region, whose box always shows.

// the Refund rate row of the numbers table, as fractions of the table's box: [x, y, w, h]
const ROW = [0.005, 0.665, 0.99, 0.165];

export default {
  doc: 'acme-status',
  posterAt: 0.3,
  // beside the table's lead line, off the chart (its hover tooltip would open the clip)
  cursor: [700, 230],

  async setup(c) {
    await c.waitForSelector('.bd-anntb .eye');
    await c.ev(`BP.sidebar({open: false})`);
    await c.ev(`BP.annotate({type: 'pin', key: 'tldr', pos: {x: 0.9, y: 0.3}, note: 'Add the week 42 forecast'})`);
    await c.ev(`BP.annotate({type: 'text', key: 'tldr', quote: 'one 18-minute slowdown in pricing is fixed', note: 'Link the incident report'})`);
    await c.ev(`BP.annotate({type: 'region', key: 'block:numbers/0', box: ${JSON.stringify(ROW)}, note: 'Say why refunds held'})`);
    await c.waitFor(`BP.annotations().length === 3`);
    // the TL;DR and the numbers table in the frame
    await c.ev(`window.scrollTo({top: document.querySelector('.bd-tldr').getBoundingClientRect().top + scrollY - 90, behavior: 'instant'})`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(700);
    await c.click('.bd-anntb .eye', { ms: 600 });
    await c.pause(1200);
    await c.click('.bd-anntb .eye', { ms: 200 });
    await c.pause(1000);
  },
};
