// Reviews: a comment on one diff line. Point (C), click tiers.ts line 17 in #412's diff, write the change, Save;
// Request changes previews it under its key, line:diff-412/src/pricing/tiers.ts:17.
import { findingsView, scrollTop } from './_shared/review-findings.mjs';

const LINE = '#diff-diff-412 .bd-pane .bd-ln[data-n="17"]';

export default {
  doc: 'acme-review-findings',
  posterAt: -0.4,
  cursor: [880, 600],

  async setup(c) {
    await findingsView(c, 'pr-412', 'diff');
    await scrollTop(c, '#diff-diff-412 .bd-diff-tb', 64);
    await c.waitFor(`BP.diffState('diff-412').file === 'src/pricing/tiers.ts'`);
    // the pane scrolled to lines 14–17, the tierFor finding's card under them
    await c.ev(`(() => { const p = document.querySelector('#diff-diff-412 .bd-pane'), l = document.querySelector('#diff-diff-412 .bd-pane .bd-ln[data-n="14"]');
      p.scrollTop += l.getBoundingClientRect().top - p.getBoundingClientRect().top - 150; })()`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(600);
    await c.click('.bd-anntb button[data-m="point"]', { ms: 600 });
    await c.pause(200);
    await c.click({ sel: LINE, x: 0.55 }, { ms: 600 });
    await c.waitForSelector('.bd-cmp:not([hidden]) textarea');
    await c.pause(150);
    await c.type('Use >= for 10 and 50 units', { cps: 32 });
    await c.pause(200);
    await c.click('.bd-cmp:not([hidden]) .bp-btn.primary', { ms: 400 });
    await c.waitFor(`BP.annotations().length === 1`);
    await c.pause(300);
    await c.click('.bd-anntb .go', { ms: 600 });
    await c.waitForSelector('.bd-chgs details[open] pre, .bd-chgs pre');
    await c.pause(250);
    // the pointer rests just under the key, so it stays readable
    const [x, y] = await c.point({ text: 'line:diff-412/src/pricing/tiers.ts:17', in: '.bd-chgs' });
    await c.moveTo([x, y + 16], { ms: 600 });
    await c.pause(1300);
  },
};
