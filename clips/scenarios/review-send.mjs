// Reviews: #412's toolbar Accept recommended picks its 7 starred options (#415's 4 were accepted before the clip); change
// one (Ticket instead of Fix in PR on the tier tests). Reply and fix opens the send dialog: every finding with its
// pick, and the changed one with its recommendation under it.
import { findingsView, scrollTop } from './_shared/review-findings.mjs';

const ROW = '#item-t412-boundary-tests';
const DLG = 'dialog.bd-sendans[open]';

export default {
  doc: 'acme-review-findings',
  posterAt: -0.4,
  cursor: [760, 600],

  async setup(c) {
    // All: the answered findings stay in the list
    await findingsView(c, 'pr-412', 'checklist', { filter: 'all' });
    await c.ev(`BP.acceptRecommended('t415')`);
    // its toast gone before the clip starts
    await c.waitFor(`!document.querySelector('.bp-toast.on')`, 15_000);
    // the tier-tests finding and its answers right under the PR's sticky header
    await scrollTop(c, ROW, 170);
  },

  async run(c) {
    await c.pause(700);
    await c.click({ text: 'Accept recommended', in: '#pr-412 .bd-ftb' }, { ms: 650 });
    await c.waitFor(`BP.progress().every((p) => p.done === p.total)`);
    await c.pause(700);
    await c.click(`${ROW} > .bp-opts .bp-opt[data-id="ticket"] .pk`, { ms: 650 });
    await c.waitFor(`document.querySelector('${ROW} > .bp-opts .bp-opt[data-id="ticket"] .pk').getAttribute('aria-checked') === 'true'`);
    await c.pause(500);
    await c.click('.bd-anntb .bd-key.send', { ms: 650 });
    await c.waitForSelector(DLG);
    await c.pause(400);
    // the pointer rests just under the changed pick's recommendation, so its words stay readable
    const [x, y] = await c.point({ text: 'Recommended: Fix in PR', in: DLG });
    await c.moveTo([x, y + 18], { ms: 650 });
    await c.pause(1500);
  },
};
