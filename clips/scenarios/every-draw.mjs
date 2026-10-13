// Every doc type: Draw (D), pick the amber pen, box the numbers table by hand, write a note, Save; the drawing stays
// on the table and the comment waits in the Comments panel.
const TOOL = (m) => `.bd-anntb button[data-m="${m}"]`;

export default {
  doc: 'acme-status',
  posterAt: -0.4,
  cursor: [700, 560],

  async setup(c) {
    await c.waitForSelector('.bd-anntb');
    await c.waitFor(`BP.sidebar().open && BP.sidebar().section === 'comments'`);
    // the Numbers heading under the app bar, the whole table in view above the tool tray
    await c.ev(`window.scrollTo({top: document.querySelector('#numbers').getBoundingClientRect().top + scrollY - 70, behavior: 'instant'})`);
  },

  async run(c) {
    await c.pause(450);
    await c.click(TOOL('draw'), { ms: 520 });
    await c.waitForSelector('.bd-anntb .bd-pen-warn');
    await c.pause(180);
    await c.click('.bd-anntb .bd-pen-warn', { ms: 360 });
    await c.pause(180);

    // a hand-drawn box just outside the table's edges
    const [l, t, r, b] = await c.ev(`(() => { const e = document.querySelector('#numbers table').getBoundingClientRect(); return [e.left, e.top, e.right, e.bottom]; })()`);
    await c.moveTo([l - 6, t - 8], { ms: 480 });
    await c.down();
    await c.moveTo([r + 6, t - 6], { ms: 360 });
    await c.moveTo([r + 8, b + 6], { ms: 260 });
    await c.moveTo([l - 4, b + 8], { ms: 360 });
    await c.moveTo([l - 8, t - 2], { ms: 260 });
    await c.up();
    await c.waitForSelector('.bd-cmp:not([hidden]) textarea');
    await c.pause(150);
    await c.type('Add the week 42 forecast', { cps: 32 });
    await c.pause(200);
    await c.click('.bd-cmp:not([hidden]) .bp-btn.primary', { ms: 450 });
    await c.waitFor(`BP.annotations().length === 1`);
    await c.pause(250);
    await c.moveTo({ sel: '.bd-cs-l li:first-child', x: 0.45, y: 0.6 }, { ms: 550 });
    await c.pause(1000);
  },
};
