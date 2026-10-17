// Store listings: upload a PNG to a set's slot. A set with room ends in a Drop PNG slot with its size; the page
// checks the PNG's size and alpha, the server writes it beside the doc, and it shows as a Draft tile with an upload
// tag until the agent records it.
// prepare takes the Streak shot out of Play's phone set (7 / 8, so the set has a slot) and makes its PNG the upload:
// the shot exported at Play's phone size by build.py --listing, as a reader's real screenshot would be.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { answerFileDialog, panels, shotsReady, toRow } from '../fixtures/acme-fit-listing/listing.mjs';

let png;

export default {
  doc: 'acme-fit-listing',
  posterAt: -0.6,
  cursor: [820, 520],

  async prepare(ctx) {
    const doc = ctx.bd.docPath('acme-fit-listing'), zip = join(ctx.work, 'play.zip');
    ctx.py('build.py', doc, '--listing', zip, '--platform', 'play', '--locale', 'en-US', '--no-history');
    png = join(ctx.work, 'streak.png');
    const r = spawnSync('unzip', ['-p', zip, 'fastlane/metadata/android/en-US/images/phoneScreenshots/08-streak.png']);
    if (r.status !== 0 || !r.stdout.length) throw new Error('no 08-streak.png in the export');
    writeFileSync(png, r.stdout);
    const d = JSON.parse(readFileSync(doc, 'utf8'));
    for (const s of d.sections) for (const b of s.blocks || []) if (b.type === 'board') {
      const a = b.artboards.find((x) => x.id === 'streak');
      a.sets = a.sets.filter((x) => x !== 'play/phone');
    }
    writeFileSync(doc, JSON.stringify(d, null, 2));
  },

  async setup(c) {
    await panels(c, { left: false });
    await toRow(c, 'phone', -10);
    await c.ev(`(r => r.scrollLeft = r.scrollWidth)(document.querySelector('.bd-lst-upslot[data-set="play/phone"]').closest('.bd-lst-tiles'))`);
    await shotsReady(c);
  },

  async run(c) {
    await c.pause(800);
    const picked = answerFileDialog(c, png);
    await c.click('.bd-lst-upslot[data-set="play/phone"]', { ms: 700 });
    await picked;
    await c.waitFor(`BP.listing().uploads.length === 1 && !!document.querySelector('.bd-lst-upimg')`, 20_000);
    // the upload redraws the sections, which start each set at its first shot: back to the end of the phone set
    await c.ev(`(r => r.scrollLeft = r.scrollWidth)(document.querySelector('.bd-lst-upimg').closest('.bd-lst-tiles'))`);
    await shotsReady(c);
    await c.moveTo({ sel: '.bd-lst-upimg', x: 0.5, y: 1.06 }, { ms: 700 });
    await c.pause(1600);
  },
};
