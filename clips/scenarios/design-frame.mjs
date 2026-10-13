// Designs: ask for a new screen. In Frame mode (R) a click on the empty board beside Settings places a phone frame;
// its editor asks what the screen should show, and drags inside the frame add labelled boxes. Saved, it is a
// pending `frame:phone@x,y` comment, drawn dashed on the board where the agent should put the screen.
import { at, panels, settled, view } from '../fixtures/acme-fit-design/board.mjs';

// the requested phone's top-left on the board (right of Settings, its top on Settings' top), and its size
const F = { x: 2256, y: 2772, w: 390, h: 844 };

export default {
  doc: 'acme-fit-design',
  posterAt: -0.6,
  cursor: [1100, 650],

  async setup(c) {
    await panels(c);
    await view(c, { x: 2150, y: 3194, k: 0.5, to: [520, 430] });
    await settled(c);
  },

  async run(c) {
    await c.pause(600);
    await c.click('button.bd-key[aria-label="Frame"]', { ms: 550 });
    await c.waitFor(`BP.board().mode === 'frame'`);
    await c.pause(150);
    // a click places a phone with its top-left there
    await c.click(await at(c, F.x, F.y), { ms: 600 });
    await c.waitFor(`!!document.querySelector('.bd-rqe textarea:focus')`);
    await c.pause(200);
    await c.type('Workout summary', { cps: 30 });
    await c.pause(200);
    // two labelled boxes: the route map, then the stats under it
    const box = async (x0, y0, x1, y1, label) => {
      await c.moveTo(await at(c, F.x + x0, F.y + y0), { ms: 450 });
      await c.down();
      await c.pause(80);
      await c.moveTo(await at(c, F.x + x1, F.y + y1), { ms: 450 });
      await c.up();
      await c.waitFor(`!!document.querySelector('.bd-rqe input:focus')`);
      await c.type(label, { cps: 28 });
      await c.pause(150);
    };
    await box(24, 110, 366, 420, 'Route map');
    await box(24, 450, 366, 600, 'Stats');
    await c.click({ text: 'Save', in: '.bd-rqe' }, { ms: 550 });
    await c.waitFor(`BP.annotations().some(a => a.target.key.startsWith('frame:phone@'))`);
    await c.moveTo([1100, 650], { ms: 500 });
    await c.pause(700);
  },
};
