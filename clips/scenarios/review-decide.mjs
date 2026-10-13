// Reviews: one decision per finding, sized blocker to nit. Ticket on the minor tier-tests finding (Fix in PR is
// starred): the row ticks, and the same card under its lines in test/tiers.test.ts shows Ticket too.
import { findingsView, scrollTop } from './_shared/review-findings.mjs';

const ROW = '#item-t412-boundary-tests';

export default {
  doc: 'acme-review-findings',
  posterAt: -0.4,
  cursor: [1040, 300],

  async setup(c) {
    await findingsView(c, 'pr-412', 'checklist');
    // the row open, so its code excerpt (the lines, then the finding's card) sits under it
    await c.ev(`document.querySelector('${ROW} .bp-cl-head').click()`);
    await c.waitForSelector(`${ROW} .bd-xcs .bd-cm`);
    await scrollTop(c, '#item-t412-tier-boundary', 150);
  },

  async run(c) {
    await c.pause(700);
    // the sizes, blocker to minor
    await c.moveTo({ sel: '#item-t412-tier-boundary .bp-chip', y: 1.6 }, { ms: 500 });
    await c.moveTo({ sel: `${ROW} .bp-chip`, y: 1.6 }, { ms: 900 });
    await c.pause(300);
    await c.click(`${ROW} .bp-cl-choices .bp-choice[data-id="ticket"]`, { ms: 600 });
    await c.waitFor(`document.querySelector('${ROW} .bd-xcs .bd-cm .bp-choice[data-id="ticket"]').getAttribute('aria-checked') === 'true'`);
    await c.pause(500);
    // down to the card in the excerpt
    await c.scrollTo(`${ROW} .bd-xcs .bd-cm`, { block: 'center', ms: 800 });
    await c.moveTo(`${ROW} .bd-xcs .bd-cm .bp-choice[data-id="ticket"]`, { ms: 550 });
    await c.pause(1300);
  },
};
