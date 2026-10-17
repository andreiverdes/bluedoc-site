// Store listings: the Colors tab extracts a palette from an image. The image's colours become swatches and roles
// (the darkest the background, the lightest the light ground, the most saturated the accent), every shot re-renders
// in them, and each text pair shows its contrast ratio against 4.5:1.
import { join } from 'node:path';
import sharp from 'sharp';
import { answerFileDialog, panels, paneTo, shotsReady, toRow } from '../fixtures/acme-fit-listing/listing.mjs';

let image;

// a brand board: deep green, mint, an orange accent and a few mid tones
const BOARD = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400">
  <rect width="640" height="400" fill="#0f3d2e"/>
  <rect x="380" width="260" height="400" fill="#e7f6ee"/>
  <rect x="380" y="260" width="260" height="140" fill="#f97316"/>
  <rect x="0" y="300" width="380" height="100" fill="#1f7a55"/>
  <circle cx="190" cy="150" r="80" fill="#ffffff"/>
</svg>`;

export default {
  doc: 'acme-fit-listing',
  posterAt: -0.6,
  cursor: [820, 520],

  async prepare(ctx) {
    image = join(ctx.work, 'acme-brand-board.png');
    await sharp(Buffer.from(BOARD)).png().toFile(image);
  },

  async setup(c) {
    await panels(c, { left: true, tab: 'colors' });
    await paneTo(c, '#bd-lp-colors .bd-lst-imgdrop', 40);
    await toRow(c, 'phone', -10);
  },

  async run(c) {
    await c.pause(800);
    const picked = answerFileDialog(c, image);
    await c.click('#bd-lp-colors .bd-lst-imgdrop', { ms: 700 });
    await picked;
    await c.waitFor(`BP.listing().brand.swatches.length > 0`);
    await shotsReady(c);
    await c.pause(700);
    await c.moveTo([200, 640], { ms: 600 });
    await c.wheel(420, { ms: 800 });
    await c.pause(200);
    await c.moveTo({ sel: '#bd-lp-colors .bd-lst-pair', x: 0.85, y: 0.5 }, { ms: 600 });
    await c.pause(1600);
  },
};
