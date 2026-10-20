// Reviews: one pick, three views. Fix in PR on the bulkSavingsCents finding in Merged; Checklist shows that row
// picked and ticked; Diff shows the same pick on the finding's card under createOrder.ts line 16.
import { findingsView, scrollTop } from './_shared/review-findings.mjs';

const ITEM = 't412/savings-coupon';
const ROW = `#pr-412 .bd-mrow[data-item="${ITEM}"]`;
const SEG = (v) => `#pr-412 .bd-fvseg button[data-v="${v}"]`;

export default {
  doc: 'acme-review-findings',
  posterAt: -0.5,
  cursor: [760, 520],

  async setup(c) {
    await findingsView(c, 'pr-412', 'merged');
    await scrollTop(c, '#pr-412 .bd-mg.bd-xf', 130);
    await c.waitForSelector(`${ROW} .bp-opt:has(.rec) .pk`);
  },

  async run(c) {
    await c.pause(500);
    await c.click(`${ROW} .bp-opt:has(.rec) .pk`, { ms: 600 });
    await c.waitFor(`BP.progress()[0].done === 1`);
    await c.pause(400);

    await c.click(SEG('checklist'), { ms: 600 });
    await c.waitFor(`BP.findingsView('pr-412') === 'checklist'`);
    await c.pause(150);
    // the rows are taller than the view: down to the picked finding
    await c.scrollTo('#item-t412-savings-coupon', { block: 'center', ms: 600 });
    await c.moveTo('#item-t412-savings-coupon > .bp-opts .bp-opt:has(.rec) .pk', { ms: 500 });
    await c.pause(700);

    await c.click(SEG('diff'), { ms: 600 });
    await c.waitFor(`BP.findingsView('pr-412') === 'diff'`);
    await c.pause(150);
    await c.click({ text: 'createOrder.ts', in: '#diff-diff-412 .bd-files' }, { ms: 550 });
    await c.waitFor(`BP.diffState('diff-412').file === 'src/orders/createOrder.ts'`);
    await c.pause(100);
    // the pane scrolls on its own: down to the finding's card under line 16, the cursor following its pick
    await c.ev(`document.querySelector('#diff-diff-412 .bd-pane').scrollBy({top: 300, behavior: 'smooth'})`);
    await c.moveTo('#diff-diff-412 .bd-pane .bd-cm .bp-opt:has(.rec) .pk', { ms: 750 });
    await c.pause(1100);
  },
};
