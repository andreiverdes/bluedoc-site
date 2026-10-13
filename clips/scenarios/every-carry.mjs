// Every doc type with approval: an approval holds across a progress-only revision. Rev 1 is approved; the agent's
// rev 2 only marks a step done, so the chip stays Approved · rev 1 · progress in rev 2. Its rev 3 edits the content,
// and the chip turns to Changes since approved rev 1: Approve plan asks again.
export default {
  doc: 'acme-saved-carts-plan',
  posterAt: 2.6,
  cursor: [700, 420],

  async setup(c) {
    await c.waitForSelector('.bd-anntb .approve');
    await c.ev(`BP.sidebar({open: false})`);
    // the reader approved rev 1 (with the recommended picks)
    await c.ev(`BP.acceptRecommended()`);
    await c.click('.bd-anntb .approve', { ms: 100 });
    await c.waitForSelector('.bd-approve .bp-btn.ok');
    await c.click('.bd-approve .bp-btn.ok', { ms: 100 });
    await c.waitFor(`BP.planState().state === 'approved'`);
    await c.reload();
    await c.waitFor(`BP.planState().state === 'approved' && !BP.sidebar().open`);
  },

  async run(c) {
    // the pointer rests just under the chip, so its words stay readable
    const under = async (text) => {
      const [x, y] = await c.point({ text });
      return [x, y + 16];
    };
    await c.pause(500);
    await c.moveTo(await under('Approved · rev 1'), { ms: 600 });
    await c.pause(500);

    // rev 2: the agent marks step 1 done, nothing else
    c.bd.py('build.py', 'patch', c.bd.docPath('acme-saved-carts-plan'), 'step:steps/0/table', '--set', 'status=done',
      '--change', 'Step 1 is done: the `saved_carts` table is live.');
    await c.reload();
    await c.waitFor(`BP.planState().rev === '2' && BP.planState().carried`);
    await c.pause(300);
    await c.moveTo(await under('progress in rev 2'), { ms: 500 });
    await c.pause(1400);

    // rev 3: a content edit, so the approval no longer covers it
    c.bd.py('build.py', 'patch', c.bd.docPath('acme-saved-carts-plan'), 'step:steps/0/routes', '--set',
      'title=Add the four `/v1/saved-carts` routes, with rate limits', '--change', 'Step 3 adds rate limits to the routes.');
    await c.reload();
    await c.waitFor(`BP.planState().rev === '3' && BP.planState().state === 'stale'`);
    await c.pause(300);
    await c.moveTo(await under('Changes since approved rev 1'), { ms: 500 });
    await c.pause(1400);
  },
};
