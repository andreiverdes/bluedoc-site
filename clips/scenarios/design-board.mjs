// Designs: one board of device frames. From the phone app the camera glides down to the round watch, the app icon
// sheet and the browser dashboard. Each rest is framed so the next stop is already within the board's mount margin
// (the view plus a quarter on each side): the board mounts screens only while the camera rests, so a stop outside
// it would arrive as an empty bezel.
import { glide, panels, settled, view } from '../fixtures/acme-fit-design/board.mjs';

export const crf = 32;

export default {
  doc: 'acme-fit-design',
  posterAt: 0.4,
  cursor: [1160, 640],

  async setup(c) {
    await panels(c);
    await view(c, { x: 1080, y: 2120, k: 0.25 }); // the phone app; its margin reaches the watch
    await settled(c);
  },

  async run(c) {
    await c.pause(900);
    await glide(c, { x: 120, y: 3856, k: 1.25, ms: 1100 }); // the round watch
    await settled(c);
    await c.pause(500);
    await glide(c, { x: 640, y: 4526, k: 0.72, ms: 900 }); // the app icon sheet
    await settled(c);
    await c.pause(700);
    await glide(c, { x: 720, y: 5526, k: 0.66, ms: 900 }); // the browser dashboard
    await settled(c);
    await c.pause(700);
  },
};
