// Plans: Approve waits while a question asks for more. The reader picked on two questions and asked on the price
// one with Tell me more; Approve is greyed and its tooltip says why (the server refuses an approval then too).
// Request changes sends the question in the one send dialog; the agent's rev 2 answers it in the card's conversation
// (build.py patch --reply), and after the reload the reader picks the notice and Approve makes it Approved · rev 2.
const ITEM = '#item-decisions-prices';

export const crf = 27; // the reload repaints the whole page twice

export default {
  doc: 'acme-saved-carts-plan',
  posterAt: 2.2,
  cursor: [700, 470],

  async setup(c) {
    await c.waitForSelector(`${ITEM} .ac-tmm`);
    // the comments panel stays open the whole clip (its Pending question, then the agent's reply): rev 2 opens it
    // anyway, as something waits for the reader
    await c.ev(`BP.sidebar({section: 'comments', open: true}); BP.contents({open: false})`);
    await c.waitFor(`BP.sidebar().open`);
    await c.ev(`BP.choose('decisions/retention', 'd180')`);
    await c.ev(`BP.choose('decisions/guests', ['accounts', 'business'])`);
    await c.ev(`BP.moreDetails('decisions/prices')`);
    await c.ev(`BP.setNote('decisions/prices', 'What does the notice say, word for word?')`);
    await c.waitFor(`document.querySelector('.bd-anntb .approve').disabled`);
    // the asking question in the frame, its reply box mid-frame
    await c.ev(`window.scrollTo({top: document.querySelector('${ITEM}').getBoundingClientRect().top + scrollY - 76, behavior: 'instant'})`);
    await c.pause(400);
  },

  async run(c) {
    await c.pause(700);
    await c.moveTo('.bd-anntb .approve', { ms: 650 });
    await c.waitFor(`!document.querySelector('.bd-tip').hidden`);
    await c.pause(1200); // 1 item asks for more details

    await c.click('.bd-anntb .go', { ms: 550 });
    await c.waitForSelector('dialog.bd-chgs[open] .ft .pri');
    await c.pause(500); // the question and the picks it carries
    await c.click('dialog.bd-chgs[open] .ft .pri', { ms: 450 });
    await c.waitFor(`BP.planState().state === 'changes'`);
    // the sent cards fold and the page shrinks above the question: keep it where it was
    const hold = `window.scrollTo({top: document.querySelector('${ITEM}').getBoundingClientRect().top + scrollY - 76, behavior: 'instant'})`;
    await c.ev(hold);
    await c.pause(250);
    await c.ev(hold);

    // the agent's rev 2 answers in the question's conversation
    c.bd.py('build.py', 'patch', c.bd.docPath('acme-saved-carts-plan'), 'item:decisions/prices', '--reply',
      'The badge reads *Prices changed*, and each changed line shows the old price struck through.');
    await c.reload();
    await c.ev(`window.scrollTo({top: document.querySelector('${ITEM}').getBoundingClientRect().top + scrollY - 130, behavior: 'instant'})`);
    await c.waitFor(`BP.planState().rev === '2' && !document.querySelector('.bd-anntb .approve').disabled`);
    await c.pause(700); // the agent's answer in the conversation
    await c.click(`${ITEM} .bp-opt[data-id=notice] .pk`, { ms: 600 });
    await c.waitFor(`BP.approvePayload('').answers.find((a) => a.item === 'prices').choice === 'notice'`, 2000);
    await c.pause(500);
    await c.click('.bd-anntb .approve', { ms: 600 });
    await c.waitForSelector('dialog.bd-approve[open] .ft .pri');
    await c.pause(400);
    await c.click('dialog.bd-approve[open] .ft .pri', { ms: 450 });
    await c.waitFor(`BP.planState().state === 'approved'`);
    await c.moveTo([1110, 600], { ms: 500 });
    await c.pause(1100);
  },
};
