// Designs: moving a screen. Workout is dragged beside Workouts: pink guides snap it to the other screens' edges and
// its links reroute around the screens at right angles, live; it goes back the same way, so the clip loops.
import { ab, at, panels, settled, view } from '../fixtures/acme-fit-design/board.mjs';

// Workout's middle on the board now, and where it goes: right of Workouts, its top on Workouts' top
const HOME = [1375, 422];
const AWAY = [1965, 1346];

export default {
  doc: 'acme-fit-design',
  posterAt: 2.6,
  cursor: [1080, 640],

  async setup(c) {
    await panels(c);
    await view(c, { x: 1480, y: 1250, k: 0.24, to: [640, 440] });
    await settled(c);
  },

  async run(c) {
    await c.pause(800);
    // press on Workout, then carry it over in a few steps so the guides show as it snaps
    await c.moveTo(ab('workout', 0.5, 0.42), { ms: 650 });
    await c.down();
    await c.pause(150);
    const [hx, hy] = await at(c, ...HOME), [ax, ay] = await at(c, ...AWAY);
    const grab = [c.x - hx, c.y - hy];
    await c.moveTo([ax + grab[0], ay + grab[1] - 20], { ms: 1100 });
    await c.moveTo([ax + grab[0] + 2, ay + grab[1]], { ms: 300 });
    await c.pause(150);
    await c.up();
    await c.waitFor(`BP.boardEdit().positions.workout[0] > 1700`);
    await c.pause(1100);
    await c.down();
    await c.pause(150);
    await c.moveTo([hx + grab[0], hy + grab[1] + 20], { ms: 1000 });
    await c.moveTo([hx + grab[0], hy + grab[1]], { ms: 300 });
    await c.pause(150);
    await c.up();
    await c.waitFor(`BP.boardEdit().positions.workout[0] < 1300`);
    await c.moveTo([1080, 640], { ms: 600 });
    await c.pause(500);
  },
};
