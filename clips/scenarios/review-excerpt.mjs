// Reviews: the code under a finding, in Checklist view. More details on the bulkSavingsCents finding opens its detail,
// then its file, the lines around the comment and their +/− counts; Open in Diff view jumps to the same finding's card
// under createOrder.ts line 16 in the diff.
import { findingsView, scrollTop } from './_shared/review-findings.mjs';

const ROW = '#item-t412-savings-coupon';

export default {
  doc: 'acme-review-findings',
  posterAt: -0.4,
  cursor: [760, 600],

  async setup(c) {
    await findingsView(c, 'pr-412', 'checklist');
    await scrollTop(c, ROW, 160);
  },

  async run(c) {
    await c.pause(700);
    await c.click(`${ROW} .ac-detrow .pv-more`, { ms: 600 });
    await c.waitFor(`!!document.querySelector('${ROW} .bd-xcs').getClientRects().length`);
    await c.pause(500);
    // the detail, then the excerpt: file, lines, Open in Diff view
    await c.moveTo({ text: 'My reasoning', in: `${ROW} .bd-dets` }, { ms: 550 });
    await c.pause(400);
    await c.moveTo({ sel: `${ROW} .bd-xcs .bd-ln.hit`, x: 0.45 }, { ms: 550 });
    await c.pause(500);
    await c.click(`${ROW} .bd-xcs .bd-xgo`, { ms: 550 });
    await c.waitFor(`BP.findingsView('pr-412') === 'diff' && BP.diffState('diff-412').file === 'src/orders/createOrder.ts'`);
    await c.pause(500);
    await c.moveTo({ text: 'also counts the coupon', in: '#diff-diff-412 .bd-pane .bd-cm', at: 'end' }, { ms: 600 });
    await c.pause(1300);
  },
};
