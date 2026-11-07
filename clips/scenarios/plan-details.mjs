// Plans: Approve waits while an item asks for more details. The reader picked on two questions and asked on the price
// one with Need more details; Approve plan is greyed and its tooltip says why (the server refuses an approval then
// too: 409 "an item asks for more details"). Request changes sends the question; the agent's rev 2 answers it in the
// item's conversation (build.py patch --reply), and after the reload Approve plan is back: Approved · rev 2.
const ITEM = '#item-decisions-prices';

export const crf = 27; // the reload repaints the whole page twice

export default {
  doc: 'acme-saved-carts-plan',
  posterAt: 2.2,
  cursor: [700, 470],

  async setup(c) {
    await c.waitForSelector(`${ITEM} .bp-note-ta`);
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    await c.ev(`BP.choose('decisions/retention', 'd180')`);
    await c.ev(`BP.choose('decisions/guests', ['accounts', 'business'])`);
    await c.ev(`BP.moreDetails('decisions/prices')`);
    await c.ev(`BP.setNote('decisions/prices', 'What does the notice say, word for word?')`);
    await c.waitFor(`document.querySelector('.bd-anntb .approve').disabled`);
    // the asking question in the frame, its reply box mid-frame
    await c.ev(`window.scrollTo({top: document.querySelector('${ITEM}').getBoundingClientRect().top + scrollY - 90, behavior: 'instant'})`);
    await c.pause(400);
  },

  async run(c) {
    await c.pause(700);
    await c.moveTo('.bd-anntb .approve', { ms: 650 });
    await c.waitFor(`!document.querySelector('.bd-tip').hidden`);
    await c.pause(1200); // 1 item asks for more details

    await c.click('.bd-anntb .go', { ms: 550 });
    await c.waitForSelector('.bd-chgs .bp-btn.primary');
    await c.pause(250);
    await c.click('.bd-chgs .bp-btn.primary', { ms: 450 });
    await c.waitFor(`BP.planState().state === 'changes'`);
    await c.pause(200);

    // the agent's rev 2 answers in the question's conversation
    c.bd.py('build.py', 'patch', c.bd.docPath('acme-saved-carts-plan'), 'item:decisions/prices', '--reply',
      'The badge reads *Prices changed*, and each changed line shows the old price struck through.');
    await c.reload();
    await c.waitFor(`BP.planState().rev === '2' && !document.querySelector('.bd-anntb .approve').disabled`);
    await c.pause(500);
    await c.click('.bd-anntb .approve', { ms: 600 });
    await c.waitForSelector('.bd-approve .bp-btn.ok');
    await c.pause(250);
    await c.click('.bd-approve .bp-btn.ok', { ms: 450 });
    await c.waitFor(`BP.planState().state === 'approved'`);
    await c.moveTo([1110, 600], { ms: 500 });
    await c.pause(1100);
  },
};
