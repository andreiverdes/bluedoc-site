// Every doc type: a page without approval (here a status report) sends ticks and picks with Send answers. Pick the
// rollout date, tick a task: Send answers turns green, and opens the send dialog with what goes to the agent.
const PICK = '#item-decide-saved-carts .bp-opt[data-id="oct26"] .pk';
const TASK = '#cb-next-fulfilment';
const DLG = 'dialog.bd-sendans[open]';

export default {
  doc: 'acme-status',
  posterAt: -0.4,
  cursor: [760, 600],

  async setup(c) {
    await c.waitForSelector(PICK);
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    // the open decision's answers mid-frame, the Week 42 tasks under them
    await c.ev(`window.scrollTo({top: document.querySelector('#item-decide-saved-carts').getBoundingClientRect().top + scrollY - 150, behavior: 'instant'})`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(700);
    await c.click(PICK, { ms: 650 });
    await c.waitFor(`BP.progress().find((p) => p.id === 'decide').done === 1`);
    await c.pause(400);
    // down to the week's tasks: the first one is still open
    await c.scrollTo('#item-next-fulfilment', { block: 'center', ms: 700 });
    await c.click(TASK, { ms: 550 });
    await c.waitFor(`BP.progress().every((p) => p.done === p.total)`);
    await c.pause(400);
    await c.click('.bd-anntb .send', { ms: 650 });
    await c.waitForSelector(`${DLG} .ft .pri`);
    await c.pause(300);
    await c.moveTo({ sel: `${DLG} .sd-body`, x: 0.75, y: 0.5 }, { ms: 600 });
    await c.pause(1400);
  },
};
