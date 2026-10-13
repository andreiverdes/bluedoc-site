// Every doc type: Approve plan opens a dialog that lists the picks it approves; Approve, and the chip at the top of the
// page and the key both read Approved · rev 1.
export default {
  doc: 'acme-saved-carts-plan',
  posterAt: -0.4,
  cursor: [760, 560],

  async setup(c) {
    await c.waitForSelector('.bd-anntb .approve');
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    // the reader has picked: two recommendations and one other option
    await c.ev(`BP.choose('decisions/retention', 'forever')`);
    await c.ev(`BP.choose('decisions/prices', 'notice')`);
    await c.ev(`BP.choose('decisions/guests', 'accounts')`);
    await c.waitFor(`BP.progress().find((p) => p.id === 'decisions').done === 3`);
  },

  async run(c) {
    await c.pause(700);
    await c.click('.bd-anntb .approve', { ms: 650 });
    await c.waitForSelector('.bd-approve .bp-btn.ok');
    await c.pause(300);
    await c.moveTo({ sel: '.bd-approve', x: 0.62, y: 0.52 }, { ms: 600 });
    await c.pause(1000);
    await c.click('.bd-approve .bp-btn.ok', { ms: 550 });
    await c.waitFor(`BP.planState().state === 'approved'`);
    await c.pause(300);
    await c.moveTo({ text: 'Approved · rev 1' }, { ms: 750 });
    await c.pause(1300);
  },
};
