// Designs: the app icon sheet. From the whole sheet the camera moves in on iOS's light, dark and tinted icons, across
// to Android's masks, themed icons and the Play Store icon, down to the four home screens at real size, and back out.
import { glide, panels, settled, view } from '../fixtures/acme-fit-design/board.mjs';

// the sheet (artboard app-icon at 0, 4096, 1280 × 860)
const SHEET = { x: 640, y: 4526, k: 0.72 };

export const crf = 31;

export default {
  doc: 'acme-fit-design',
  posterAt: 0.4,
  cursor: [1180, 650],

  async setup(c) {
    await panels(c);
    await view(c, SHEET);
    await settled(c);
  },

  async run(c) {
    await c.pause(800);
    await glide(c, { x: 330, y: 4372, k: 1.45, ms: 900 }); // iOS: the master, light, dark and tinted
    await c.pause(700);
    await glide(c, { x: 955, y: 4372, k: 1.45, ms: 800 }); // Android: masks, themed, Play Store
    await c.pause(700);
    await glide(c, { x: 640, y: 4762, k: 0.98, ms: 800 }); // home screens
    await c.pause(700);
    await glide(c, { ...SHEET, ms: 800 });
    await c.pause(500);
  },
};
