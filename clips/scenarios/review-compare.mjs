// Code review: a finding whose recommendation moved between revisions. The example's rev 2 turns the docs/pricing.md
// finding into a ticket; Changes from 1 (?diff=1) marks it CHANGED in #412's checklist, the star now on Ticket, and
// its More details opens on What changed: the subtitle reworded and Recommended going from Fix in PR to Ticket.
// every-compare shows the same compare's header and summary; this one scrolls to the finding.
import { findingsView, scrollTop } from './_shared/review-findings.mjs';

const ITEM = '#item-t412-docs-stale';

export default {
  doc: 'acme-review-findings',
  query: 'diff=1',
  posterAt: -0.6,
  cursor: [700, 560],

  async setup(c) {
    await c.waitFor(`!!window.BP && !!BP.compare() && !!document.querySelector('${ITEM} .bd-chgbox')`);
    // All: the compare marks every finding, answered or not
    await findingsView(c, 'pr-412', 'checklist', { filter: 'all' });
    await c.pause(400);
    // the finding's title just above the bottom of the view, the one before it above
    await scrollTop(c, ITEM, 640);
  },

  async run(c) {
    await c.pause(800);
    // a smooth scroll brings the changed finding up under the PR's sticky header
    await c.ev(`scrollBy({top: 440, behavior: 'smooth'})`);
    await c.pause(1000);
    // the star moved to Ticket
    await c.moveTo({ text: 'Recommended', in: `${ITEM} .bp-opt[data-id="ticket"]` }, { ms: 650 });
    await c.pause(600);
    await c.click(`${ITEM} .ac-detrow .pv-more`, { ms: 550 });
    await c.waitFor(`!!document.querySelector('${ITEM} .bd-chgbox').getClientRects().length`);
    await c.pause(300);
    // What changed: Recommended, Fix in PR struck, Ticket added
    await c.moveTo({ sel: `${ITEM} .bd-chgbox dd:nth-of-type(2) ins`, x: 1, y: 0.5, dx: 12, dy: 6 }, { ms: 600 });
    await c.pause(1600);
  },
};
