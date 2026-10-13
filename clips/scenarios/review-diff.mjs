// Reviews: #412 in Diff view, file by file. createOrder.ts, then tiers.ts with its 3 findings: the pill at the pane's
// foot counts the comments below the view, and a click steps to the next one (the tierFor finding at line 17).
import { findingsView, scrollTop } from './_shared/review-findings.mjs';

const PILL = '#diff-diff-412 .bd-pill-wrap.down .bd-pill';
const file = (name) => ({ text: name, in: '#diff-diff-412 .bd-files' });

export default {
  doc: 'acme-review-findings',
  posterAt: -0.5,
  cursor: [470, 560],

  async setup(c) {
    await findingsView(c, 'pr-412', 'diff');
    // the file list and the pane under the view bar; the pane's foot (and its pill) clears the tool tray
    await scrollTop(c, '#diff-diff-412 .bd-diff-tb', 64);
    await c.waitFor(`BP.diffState('diff-412').file === 'src/pricing/tiers.ts'`);
  },

  async run(c) {
    await c.pause(700);
    await c.click(file('createOrder.ts'), { ms: 600 });
    await c.waitFor(`BP.diffState('diff-412').file === 'src/orders/createOrder.ts'`);
    await c.pause(1000);
    await c.click(file('tiers.ts'), { ms: 450 });
    await c.waitFor(`BP.diffState('diff-412').file === 'src/pricing/tiers.ts'`);
    await c.pause(600);
    await c.moveTo(PILL, { ms: 650 });
    await c.pause(500);
    await c.click(PILL, { ms: 150 });
    await c.waitFor(`BP.diffState('diff-412').comment === 3`);
    await c.pause(700);
    await c.moveTo({ text: 'Line 17', in: '#diff-diff-412 .bd-pane' }, { ms: 600 });
    await c.pause(1100);
  },
};
