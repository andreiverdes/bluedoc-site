// Every doc type: drag the content width. Drag the column's right edge in: both edges move, so the column stays
// centred, and a chip shows the width; double-click the edge to reset it.
export default {
  doc: 'acme-orders',
  posterAt: 1.9,
  cursor: [1080, 520],

  async setup(c) {
    await c.waitFor(`document.querySelectorAll('.bd-rh').length >= 2`);
    // no docked panel: the column has room both ways
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    // the TL;DR and the blueprint under it
    await c.ev(`window.scrollTo({top: document.querySelector('.bd-tldr').getBoundingClientRect().top + scrollY - 90, behavior: 'instant'})`);
    await c.pause(300);
  },

  async run(c) {
    // the column's right edge (the panels' own edge handles are .bd-rh-p)
    const edge = () => c.ev(`(() => { const h = [...document.querySelectorAll('.bd-rh')].filter((h) => !h.classList.contains('bd-rh-p')).at(-1).getBoundingClientRect();
      return [h.left + h.width / 2, 420]; })()`);
    const [x, y] = await edge();
    await c.pause(600);
    await c.moveTo([x, y], { ms: 600 });
    await c.pause(250);
    await c.down();
    await c.pause(120);
    // both edges move: 60 px in takes the column from 680 to 560 px wide
    await c.moveTo([x - 60, y], { ms: 800 });
    await c.pause(120);
    await c.up();
    await c.pause(1000);
    await c.dblclick(await edge(), { ms: 250 });
    await c.waitFor(`[...document.querySelectorAll('.bd-rh')].at(-1).getAttribute('aria-valuenow') === '680'`);
    await c.pause(1100);
  },
};
