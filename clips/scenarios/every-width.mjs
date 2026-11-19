// Every doc type: drag a docked pane's edge. The Comments pane sits beside the page; drag its handle left and the pane
// widens while the page reflows to fill the rest, a chip showing the width; double-click the handle to reset it.
// (Until 1.0.46 this dragged the content column's own width; those handles are gone.)
const HANDLE = '.bd-rh.bd-rh-right';

export default {
  doc: 'acme-orders',
  posterAt: 1.9,
  cursor: [700, 300],

  async setup(c) {
    await c.waitFor(`BP.sidebar().open && BP.sidebar().section === 'comments' && !!document.querySelector('${HANDLE}')`);
    // a comment waiting in the pane, so it has something to show wider
    await c.ev(`BP.annotate({type: 'text', key: 'tldr', quote: 'the event never left the outbox', note: 'Link the relay runbook'})`);
    await c.waitFor(`document.querySelectorAll('.bd-cs-l li').length === 1`);
    // the TL;DR and the blueprint under it
    await c.ev(`window.scrollTo({top: document.querySelector('.bd-tldr').getBoundingClientRect().top + scrollY - 90, behavior: 'instant'})`);
    await c.pause(300);
  },

  async run(c) {
    const [x, y] = await c.point({ sel: HANDLE, x: 0.5, y: 0.5 });
    await c.pause(600);
    await c.moveTo([x, y], { ms: 600 });
    await c.pause(250);
    await c.down();
    await c.pause(120);
    // 150 px left: the pane from 320 to 470 px wide
    await c.moveTo([x - 150, y], { ms: 800 });
    await c.pause(120);
    await c.up();
    await c.pause(1100);
    await c.dblclick({ sel: HANDLE, x: 0.5, y: 0.5 }, { ms: 300 });
    await c.waitFor(`document.querySelector('${HANDLE}').getAttribute('aria-valuenow') === '320'`);
    await c.pause(1100);
  },
};
