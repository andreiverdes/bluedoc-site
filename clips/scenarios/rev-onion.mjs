// Revisions: onion skin on a redesign. The temp copy gets rev D, a new Dashboard (dark, a sidebar, a big steps chart,
// the KPI cards moved to a right rail, emerald accent) by a real build.py patch. In Changes from C, the Revisions panel
// lists Dashboard changed; its compare opens, Onion skin lays rev D over rev C, and the opacity slider cross-fades the
// two designs: old, new, old, then rests half way.
import { join } from 'node:path';
import { panels, settled } from '../fixtures/acme-fit-design/board.mjs';

const SLIDER = '.bd-cmpv input[type=range]';
// a point on the slider's track at value v (0–100); the thumb is 16 px wide
const knob = (v) => ({ sel: SLIDER, x: 0, dx: 8 + ((v / 100) * (129 - 16)) });
const CMP_READY = `BP.board().compare === true && [...document.querySelectorAll('.bd-cmpv iframe')].length === 2`;

export const crf = 26;

export default {
  doc: 'acme-fit-design',
  query: 'diff=C',
  posterAt: -0.6,
  cursor: [700, 470],

  prepare(ctx) {
    ctx.py('build.py', 'patch', ctx.bd.docPath('acme-fit-design'), 'artboard:dashboard',
      '--html', join(ctx.clips, 'fixtures/acme-fit-design/dashboard-rev-d.html'),
      '--change', 'Dashboard: a dark layout with a sidebar, a steps chart up top and the KPIs in a right rail.');
  },

  async setup(c) {
    await panels(c, { right: 'revisions' });
    await c.waitFor(`BP.board().artboards.find(a => a.id === 'dashboard').change === 'mod'`);
    await c.waitForSelector('.bd-chl button');
    await settled(c);
  },

  async run(c) {
    await c.pause(700);
    // the Revisions panel's changes: Dashboard, changed in rev D; the board brings it into view
    await c.click({ text: 'Dashboard', in: '.bd-chl' }, { ms: 650 });
    await c.pause(200);
    await settled(c);
    await c.click('.bd-ab[data-ab="dashboard"] .bd-ab-t .cmp', { ms: 600 });
    await c.waitFor(CMP_READY);
    await c.pause(450);
    await c.click('.bd-cmpv button[data-v="onion"]', { ms: 550 });
    await c.waitFor(`!document.querySelector('${SLIDER}').hidden`);
    await c.pause(150);
    await c.moveTo(knob(50), { ms: 450 });
    await c.down();
    await c.moveTo(knob(0), { ms: 650 }); // rev C alone
    await c.pause(350);
    await c.moveTo(knob(100), { ms: 1600 }); // a slow cross-fade to rev D
    await c.pause(500);
    await c.moveTo(knob(0), { ms: 1500 }); // and back
    await c.pause(300);
    await c.moveTo(knob(50), { ms: 650 });
    await c.up();
    await c.pause(1500);
  },
};
