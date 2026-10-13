// Reviews: the code under a finding, in Checklist view. Expand the bulkSavingsCents finding: its detail, then its file,
// the lines around the comment and the comment card with the same options; Open in Diff view jumps to that card in
// the diff.
import { findingsView, scrollTop } from './_shared/review-findings.mjs';

const ROW = '#item-t412-savings-coupon';

export default {
  doc: 'acme-review-findings',
  posterAt: -0.4,
  cursor: [760, 600],

  async setup(c) {
    await findingsView(c, 'pr-412', 'checklist');
    await scrollTop(c, ROW, 130);
  },

  async run(c) {
    await c.pause(700);
    await c.click(`${ROW} .bp-cl-head`, { ms: 600 });
    await c.waitForSelector(`${ROW} .bd-xcs .bd-cm`);
    await c.pause(300);
    // down past the detail to the excerpt: file, lines, card
    await c.scrollTo(`${ROW} .bd-xcs`, { block: 'center', ms: 900 });
    await c.moveTo(`${ROW} .bd-xcs .bd-xgo`, { ms: 550 });
    await c.pause(400);
    await c.click(`${ROW} .bd-xcs .bd-xgo`, { ms: 150 });
    await c.waitFor(`BP.findingsView('pr-412') === 'diff' && BP.diffState('diff-412').file === 'src/orders/createOrder.ts'`);
    await c.pause(500);
    await c.moveTo({ sel: '#diff-diff-412 .bd-pane .bd-cm[data-ci]:not(.nott) .hd', x: 0.75, y: 0.9 }, { ms: 600 });
    await c.pause(1200);
  },
};
