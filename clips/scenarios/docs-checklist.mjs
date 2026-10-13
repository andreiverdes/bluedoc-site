// Docs: tick a runbook step. In the Local stack runbook (two steps already done), Start the fulfilment worker opens
// to its command, Copy takes the command, and the tick moves the checklist's bar and the Tracker in the rail to 3 of 6.
const CL = '#cl-local';
const ITEM = '#item-local-worker';

export default {
  doc: 'acme-orders',
  posterAt: -0.4,
  cursor: [1000, 560],

  async setup(c) {
    await c.waitForSelector(ITEM);
    await c.ev(`BP.sidebar({ open: false })`); // the page's own width, without the comments panel
    // the first two steps are done: the bar has somewhere to go
    await c.ev(`['doctor', 'up'].forEach((id) => { const cb = document.getElementById('cb-local-' + id); if (!cb.checked) cb.click(); })`);
    await c.waitFor(`BP.progress().find((p) => p.id === 'local').done === 2`);
    // the checklist's header just under the app bar
    await c.ev(`scrollTo(0, document.querySelector('${CL}').getBoundingClientRect().top + scrollY - 76)`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(700);

    // open the step: its command, its check and the node it runs
    await c.click({ sel: `${ITEM} .bp-cl-text`, x: 0.35 }, { ms: 650 });
    await c.waitFor(`document.querySelector('${ITEM}').classList.contains('open')`, 2000);
    await c.pause(700);

    // copy the command
    await c.click(`${ITEM} .bp-code-h button`, { ms: 600 });
    await c.pause(900);

    // tick it
    await c.click(`#cb-local-worker`, { ms: 650 });
    await c.waitFor(`BP.progress().find((p) => p.id === 'local').done === 3`, 2000);
    await c.pause(1400);
  },
};
