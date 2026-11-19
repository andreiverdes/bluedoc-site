// Reviews: a comment on one diff line. Element (C), click tiers.ts line 17 in #412's diff, write the change, Save;
// Request changes lists it in its send dialog under its place, On acme-shop #412 › tiers.ts:17.
import { findingsView, scrollTop } from './_shared/review-findings.mjs';

const LINE = '#diff-diff-412 .bd-pane .bd-ln[data-n="17"]';
const CMP = '.bd-cmp:not([hidden])';

export default {
  doc: 'acme-review-findings',
  posterAt: -0.4,
  cursor: [880, 600],

  async setup(c) {
    await findingsView(c, 'pr-412', 'diff');
    await scrollTop(c, '#diff-diff-412 .bd-diff-body', 150);
    await c.waitFor(`BP.diffState('diff-412').file === 'src/pricing/tiers.ts'`);
    // the pane scrolled to lines 14–17, the tierFor finding's card under them
    await c.ev(`(() => { const p = document.querySelector('#diff-diff-412 .bd-pane'), l = document.querySelector('#diff-diff-412 .bd-pane .bd-ln[data-n="14"]');
      p.scrollTop += l.getBoundingClientRect().top - p.getBoundingClientRect().top - 150; })()`);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(500);
    await c.click('.bd-anntb .bd-key[data-m="point"]', { ms: 600 });
    await c.waitFor(`document.querySelector('.bd-anntb .bd-key[data-m="point"]').getAttribute('aria-pressed') === 'true'`);
    await c.pause(200);
    await c.click({ sel: LINE, x: 0.55 }, { ms: 600 });
    await c.waitFor(`document.activeElement === document.querySelector('${CMP} textarea')`);
    await c.pause(150);
    await c.type('Use >= for 10 and 50 units', { cps: 40 });
    await c.pause(200);
    await c.click(`${CMP} .bp-btn.primary`, { ms: 400 });
    await c.waitFor(`BP.annotations().length === 1`);
    await c.pause(300);
    await c.click('.bd-anntb .bd-key.go', { ms: 600 });
    await c.waitForSelector('dialog.bd-chgs[open]');
    await c.pause(250);
    // the pointer rests just under the comment's place, so it stays readable
    const [x, y] = await c.point({ text: 'tiers.ts:17', in: 'dialog.bd-chgs[open]' });
    await c.moveTo([x, y + 16], { ms: 600 });
    await c.pause(1100);
  },
};
