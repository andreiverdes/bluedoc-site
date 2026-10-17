// Store listings: edit the store text in place. The Short description's counter follows the typing against Play's
// 80 characters; Save turns the edit into a draft, one step of the undo history, and tags the field Draft.
import { panels, paneTo } from '../fixtures/acme-fit-listing/listing.mjs';

const FIELD = '.bd-lfield[data-field="en-US/play/short"]';

export default {
  doc: 'acme-fit-listing',
  posterAt: -0.6,
  cursor: [700, 420],

  async setup(c) {
    await panels(c, { left: true, tab: 'text' });
    await paneTo(c, '.bd-lfield[data-field="en-US/play/name"]', 40);
  },

  async run(c) {
    await c.pause(800);
    // the end of the field's text: the cursor clicks after "going."
    await c.click({ sel: `${FIELD} textarea`, x: 0.62, y: 0.72 }, { ms: 650 });
    await c.ev(`(t => { t.focus(); t.setSelectionRange(t.value.length, t.value.length); })(document.querySelector('${FIELD} textarea'))`);
    await c.pause(250);
    for (let i = 0; i < 'Keep the streak going.'.length; i++) {
      await c.key('Backspace');
      await c.pause(22);
    }
    await c.type('Plan the week ahead.', { cps: 18 });
    await c.pause(700);
    await c.click('.bd-lst-tsave [data-save]', { ms: 650 });
    await c.waitFor(`BP.listing().text.drafts.length === 1`);
    await c.moveTo({ sel: `${FIELD} .bd-lst-tag.draft` }, { ms: 650 });
    await c.pause(1500);
  },
};
