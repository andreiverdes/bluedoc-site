// Plans: read what the agent changed after a request. The reader sent rev 1 back with a note on the retention
// question; rev 2 opens with Updated since you last opened it, and Show what changed compares it with rev 1: the
// author's notes on the changes up top, then the sweeper step's text marked word by word and the question's
// recommendation moved to 90 days.
import { patchRev2, reviewRev1 } from './_shared/plan-rev2.mjs';
const UPD = '.bd-revbar.upd button[aria-label="Show what changed"]';
const NEXT = '.bd-revbar.cmp button[aria-label="Next change"]';

export const crf = 31; // two long scrolls of small text

export default {
  doc: 'acme-saved-carts-plan',
  posterAt: 3.4,
  cursor: [1000, 160],

  async setup(c) {
    await c.waitForSelector('.bd-anntb .approve');
    // the page's own width, in this load and after the reload (the Contents pane would dock once the panel is shut)
    await c.ev(`BP.sidebar({open: false}); BP.contents({open: false})`);
    // rev 1 goes back with the reader's picks and note
    await reviewRev1(c);
    await c.click('.bd-anntb .go', { ms: 120 });
    await c.waitForSelector('dialog.bd-chgs[open] .ft .pri');
    await c.click('dialog.bd-chgs[open] .ft .pri', { ms: 120 });
    await c.waitFor(`BP.planState().state === 'changes'`);
    // the agent's rev 2; the reader opens it again
    patchRev2(c.bd);
    await c.reload();
    await c.waitFor(`BP.planState().rev === '2' && !BP.sidebar().open`);
    await c.waitForSelector(UPD);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(700); // Updated since you last opened it: 1 → 2
    await c.click(UPD, { ms: 600 });
    await c.waitFor(`!!window.BP && !!BP.compare() && !!document.querySelector('.bd-revbar.cmp')`);
    await c.pause(1100); // the author's notes on rev 2
    // the step: its text marked word by word
    await c.click(NEXT, { ms: 650 });
    await c.pause(1300);
    // the question: its recommendation moved
    await c.click(NEXT, { ms: 350 });
    await c.pause(1500);
  },
};
