// Plans: the status chip follows the review. Rev 1 reads Awaiting approval; Request changes sends the reader's picks
// and a note on the retention question, and the chip turns Changes requested. The agent's rev 2 takes the note
// (build.py patch on the temp copy); after the reload it awaits approval again, and Approve plan makes it
// Approved · rev 2.
import { patchRev2, reviewRev1 } from './_shared/plan-rev2.mjs';

export default {
  doc: 'acme-saved-carts-plan',
  posterAt: -0.4,
  cursor: [400, 137], // just under the chip, so its words stay readable

  async setup(c) {
    await c.waitForSelector('.bd-anntb .approve');
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    await reviewRev1(c);
    await c.pause(300);
  },

  async run(c) {
    const under = async (text) => {
      const [x, y] = await c.point({ text });
      return [x, y + 16];
    };
    await c.pause(800); // Awaiting approval

    // Request changes: the picks and the note go to the agent
    await c.click('.bd-anntb .go', { ms: 650 });
    await c.waitForSelector('.bd-chgs .bp-btn.primary');
    await c.pause(200);
    await c.click('.bd-chgs .bp-btn.primary', { ms: 400 });
    await c.waitFor(`BP.planState().state === 'changes'`);
    await c.moveTo(await under('Changes requested'), { ms: 600 });
    await c.pause(700);

    // the agent's rev 2: awaiting approval again
    patchRev2(c.bd);
    await c.reload();
    await c.waitFor(`BP.planState().rev === '2' && BP.planState().state === 'awaiting' && !BP.sidebar().open`);
    await c.pause(400);

    await c.click('.bd-anntb .approve', { ms: 600 });
    await c.waitForSelector('.bd-approve .bp-btn.ok');
    await c.pause(200);
    await c.click('.bd-approve .bp-btn.ok', { ms: 400 });
    await c.waitFor(`BP.planState().state === 'approved'`);
    await c.moveTo(await under('Approved · rev 2'), { ms: 600 });
    await c.pause(1100);
  },
};
