// Plans: read what the agent changed after a request. The reader sent rev 1 back with a note on the retention
// question; rev 2 opens with Updated since you last opened it, and Show what changed compares it with rev 1: the
// author's notes on the changes up top, then the sweeper step's text marked word by word and the question's
// recommendation moved to 90 days.
import { patchRev2, reviewRev1 } from './_shared/plan-rev2.mjs';

export const crf = 31; // two long scrolls of small text

export default {
  doc: 'acme-saved-carts-plan',
  posterAt: 3.4,
  cursor: [1000, 160],

  async setup(c) {
    await c.waitForSelector('.bd-anntb .approve');
    await c.ev(`BP.sidebar({open: false})`);
    // rev 1 goes back with the reader's picks and note
    await reviewRev1(c);
    await c.click('.bd-anntb .go', { ms: 120 });
    await c.waitForSelector('.bd-chgs .bp-btn.primary');
    await c.click('.bd-chgs .bp-btn.primary', { ms: 120 });
    await c.waitFor(`BP.planState().state === 'changes'`);
    // the agent's rev 2; the reader opens it again
    patchRev2(c.bd);
    await c.reload();
    await c.waitFor(`BP.planState().rev === '2' && !BP.sidebar().open`);
    await c.waitForSelector('.bd-revbar a.bp-btn.primary[href*="diff="]');
    await c.pause(300);
  },

  async run(c) {
    await c.pause(700); // Updated since you last opened it: 1 → 2
    await c.click('.bd-revbar a.bp-btn.primary[href*="diff="]', { ms: 600 });
    await c.waitFor(`!!window.BP && !!BP.compare() && !!document.querySelector('.bd-revtb')`);
    await c.pause(1100); // the author's notes on rev 2
    // the step: its text marked word by word
    await c.click('.bd-revtb button[aria-label="Next change"]', { ms: 650 });
    await c.pause(1300);
    // the question: its recommendation moved
    await c.click('.bd-revtb button[aria-label="Next change"]', { ms: 350 });
    await c.pause(1500);
  },
};
