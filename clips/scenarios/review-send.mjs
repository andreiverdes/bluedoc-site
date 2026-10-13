// Reviews: Accept recommended picks all 11 starred options; change one (Ticket instead of Fix in PR on the tier
// tests). Send answers' preview lists each pick, and the changed one next to its recommendation.
import { findingsView, scrollTop } from './_shared/review-findings.mjs';

const ROW = '#item-t412-boundary-tests';

export default {
  doc: 'acme-review-findings',
  posterAt: -0.4,
  cursor: [760, 600],

  async setup(c) {
    await findingsView(c, 'pr-412', 'checklist');
    await scrollTop(c, '#item-t412-float-cents', 128);
  },

  async run(c) {
    await c.pause(700);
    await c.click('.bd-anntb .acc', { ms: 650 });
    await c.waitFor(`BP.progress().every((p) => p.done === p.total)`);
    await c.pause(600);
    await c.click(`${ROW} .bp-choice[data-id="ticket"]`, { ms: 650 });
    await c.waitFor(`document.querySelector('${ROW} .bp-choice[data-id="ticket"]').getAttribute('aria-checked') === 'true'`);
    await c.pause(500);
    await c.click('.bd-anntb .send', { ms: 650 });
    await c.waitForSelector('.bd-send:not(.bd-chgs) summary');
    await c.pause(400);
    await c.click('.bd-send:not(.bd-chgs) summary', { ms: 500 });
    await c.waitFor(`document.querySelector('.bd-send:not(.bd-chgs) details').open`);
    await c.pause(300);
    // the pointer rests just under the phrase, so its words stay readable
    const [x, y] = await c.point({ text: '(recommended: Fix in PR)', in: '.bd-send:not(.bd-chgs)' });
    await c.moveTo([x, y + 18], { ms: 650 });
    await c.pause(1400);
  },
};
