// Store listings: a listing isn't approved; its drafts go to the agent with Request changes. Two drafts are made
// before the clip (the L4 Dark hero pick, a Short description edit); the dock's Request changes counts them, its
// dialog lists each draft with where it is, a note goes with them, and Send hands them to the agent.
import { panels, setTab, shotsReady, toRow } from '../fixtures/acme-fit-listing/listing.mjs';

const SHORT = '.bd-lfield[data-field="en-US/play/short"] textarea';

export default {
  doc: 'acme-fit-listing',
  posterAt: 3.4,
  cursor: [820, 560],

  async setup(c) {
    await panels(c, { left: true, tab: 'style' });
    await c.ev(`document.querySelector('#bd-lp-style .bd-lst-style[data-style=l4]').click()`);
    await c.waitFor(`BP.listing().style.layout === 'l4'`);
    await setTab(c, 'text');
    await c.ev(`(t => { t.value = t.value.replace('Keep the streak going.', 'Plan the week ahead.'); t.dispatchEvent(new Event('input', { bubbles: true })); })(document.querySelector('${SHORT}'))`);
    await c.waitFor(`BP.listing().text.canSave`);
    await c.ev(`document.querySelector('.bd-lst-tsave [data-save]').click()`);
    await c.waitFor(`BP.listing().text.drafts.length === 1`);
    await panels(c, { left: false });
    await toRow(c, 'phone', -10);
    await c.waitFor(`/2/.test(document.querySelector('.bd-key.go').textContent)`);
  },

  async run(c) {
    await c.pause(800);
    await c.click('.bd-key.go', { ms: 700 });
    await c.waitFor(`!!document.querySelector('dialog.bd-chgs[open]')`);
    await c.pause(1200);
    await c.click('dialog.bd-chgs[open] .sd-note textarea', { ms: 500 });
    await c.type('Ship the dark hero on Play.', { cps: 24 });
    await c.pause(400);
    await c.click('dialog.bd-chgs[open] .ft .pri', { ms: 550 });
    await c.waitFor(`!document.querySelector('dialog.bd-chgs[open]') && /0/.test(document.querySelector('.bd-key.go').textContent)`, 15_000);
    await shotsReady(c);
    await c.moveTo([820, 560], { ms: 600 });
    await c.pause(1200);
  },
};
