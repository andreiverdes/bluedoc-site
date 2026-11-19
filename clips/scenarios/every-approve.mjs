// Every doc type: Approve opens the send dialog with the picks it approves (one differs from the recommendation, which
// it names); Approve there, and the chip at the top of the page reads Approved · rev 1.
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
    await c.waitForSelector('dialog.bd-approve[open] .ft .pri');
    await c.pause(300);
    // the picks it approves: Until deleted, against the recommended 180 days
    await c.moveTo({ sel: 'dialog.bd-approve[open] .sd-dec .sd-chip', x: 0.5, y: 0.5, dy: 22 }, { ms: 600 });
    await c.pause(1000);
    await c.click('dialog.bd-approve[open] .ft .pri', { ms: 550 });
    await c.waitFor(`BP.planState().state === 'approved' && !document.querySelector('dialog.bd-approve[open]')`);
    await c.pause(300);
    // just under the chip, so its words stay readable
    const [x, y] = await c.point({ text: 'Approved · rev 1' });
    await c.moveTo([x + 24, y + 20], { ms: 750 });
    await c.pause(1300);
  },
};
