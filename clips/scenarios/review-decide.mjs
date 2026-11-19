// Reviews: one decision per finding, sized blocker to nit. Ticket on the minor tier-tests finding (Fix in PR is
// starred), after the major bulkSavingsCents one: the answer opens as Your pick, the finding's head reads ✓ Ticket,
// and the toolbar's Done count and the PR's meter move up one.
import { findingsView, scrollTop } from './_shared/review-findings.mjs';

const ROW = '#item-t412-boundary-tests';

export default {
  doc: 'acme-review-findings',
  posterAt: -0.4,
  cursor: [1040, 300],

  async setup(c) {
    await findingsView(c, 'pr-412', 'checklist');
    // bulkSavingsCents folded to its head just under the PR's sticky header, the tier-tests finding and its answers
    // under it, clear of the dock
    await c.ev(`document.querySelector('#item-t412-savings-coupon .bp-cl-head').click()`);
    await c.waitFor(`document.querySelector('#item-t412-savings-coupon .bp-cl-head').getAttribute('aria-expanded') === 'false'`);
    await scrollTop(c, '#item-t412-savings-coupon', 160);
  },

  async run(c) {
    await c.pause(700);
    // the sizes, major then minor
    await c.moveTo({ sel: '#item-t412-savings-coupon .bp-cl-row .bp-chip', y: 1.6 }, { ms: 500 });
    await c.moveTo({ sel: `${ROW} .bp-cl-row .bp-chip`, y: 1.6 }, { ms: 900 });
    await c.pause(300);
    await c.click(`${ROW} > .bp-opts .bp-opt[data-id="ticket"] .pk`, { ms: 600 });
    await c.waitFor(`document.querySelector('${ROW} > .bp-opts .bp-opt[data-id="ticket"] .pk').getAttribute('aria-checked') === 'true'`);
    await c.pause(500);
    // the head says what was picked; the toolbar counts it done
    await c.moveTo({ sel: `${ROW} .bp-cl-row .pv-ok`, y: 1.4 }, { ms: 600 });
    await c.pause(700);
    await c.moveTo({ sel: '#pr-412 .bd-ffilt button[data-f="done"]', y: 1.3 }, { ms: 650 });
    await c.pause(1200);
  },
};
