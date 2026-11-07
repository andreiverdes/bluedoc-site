// Code review: a finding whose recommendation moved between revisions. The example's rev 2 turns the docs/pricing.md
// finding into a ticket; Changes from 1 (?diff=1) marks it changed in #412's checklist: the star now on Ticket, and
// What changed shows the subtitle reworded and Recommended going from Fix in PR to Ticket. every-compare shows the same
// compare's header and summary; this one scrolls to the finding.
import { findingsView, scrollTop } from './_shared/review-findings.mjs';

const ITEM = '#item-t412-docs-stale';

export default {
  doc: 'acme-review-findings',
  query: 'diff=1',
  posterAt: -0.6,
  cursor: [700, 560],

  async setup(c) {
    await c.waitFor(`!!window.BP && !!BP.compare() && !!document.querySelector('.bd-revtb')`);
    await findingsView(c, 'pr-412', 'checklist');
    await c.pause(400);
    // the finding's title just above the bottom of the view, the one before it above
    await scrollTop(c, ITEM, 640);
  },

  async run(c) {
    await c.pause(800);
    // a smooth scroll brings the changed finding up under the view bar
    await c.ev(`scrollBy({top: 470, behavior: 'smooth'})`);
    await c.pause(1100);
    // the star moved to Ticket
    await c.moveTo({ text: 'Recommended', in: ITEM, at: 'end' }, { ms: 650 });
    await c.pause(700);
    // What changed: Recommended, Fix in PR struck, Ticket added
    await c.moveTo({ sel: `${ITEM} .bd-chgbox dd:nth-of-type(2) ins`, x: 1, y: 0.5, dx: 12, dy: 6 }, { ms: 600 });
    await c.pause(1600);
  },
};
