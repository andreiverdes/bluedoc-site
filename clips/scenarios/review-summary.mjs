// Reviews: the summary table links each finding. A click on #415's blocker scrolls the page to its row in Merged view,
// under the lines it is about, and flashes it.
import { findingsView, scrollTop } from './_shared/review-findings.mjs';

const LINK = '#summary a[href="#item-t415-double-auth"]';
// the page scrolls a long way in one smooth glide: every frame differs, so trade a little quality for size
export const crf = 27;

export default {
  doc: 'acme-review-findings',
  posterAt: 0.5,
  cursor: [760, 520],

  async setup(c) {
    await findingsView(c, 'pr-415', 'merged');
    await scrollTop(c, '#summary', 60);
  },

  async run(c) {
    await c.pause(700);
    await c.click(LINK, { ms: 650 });
    await c.waitFor(`location.hash === '#item-t415-double-auth'`);
    await c.waitForSelector('#pr-415 .bd-mrow[data-item="t415/double-auth"].bd-flash');
    await c.pause(300);
    await c.moveTo({ text: 'A retry can authorize the card twice', in: '#pr-415 .bd-mv' }, { ms: 600 });
    await c.pause(1300);
  },
};
