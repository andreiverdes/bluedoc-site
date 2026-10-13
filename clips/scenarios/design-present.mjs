// Designs (hero): Present plays the phone app full-window from Today and follows the taps: Start workout pushes
// Workout, its back arrow returns, the Activity tab switches tabs, and the bar's Back goes home to Today.
import { ab, panels, settled } from '../fixtures/acme-fit-design/board.mjs';

export const gif = true;

// a point in the presented screen, by fractions of it
const scr = (x, y) => ({ sel: '.bd-pres iframe', x, y });

export default {
  doc: 'acme-fit-design',
  posterAt: 0.4,
  cursor: [1000, 560],

  async setup(c) {
    await panels(c);
    await c.ev(`BP.board({focus: 'today'})`);
    await settled(c);
    await c.click(ab('today', 0.5, 0.2), { ms: 1 });
    await c.click('button[aria-label^="Present"]', { ms: 1 });
    await c.waitFor(`BP.board().presented && BP.board().presented.screen === 'today'`);
    await c.waitForSelector('.bd-pres iframe');
    await c.pause(900);
  },

  async run(c) {
    await c.pause(800);
    await c.click(scr(0.5, 0.633), { ms: 700 }); // Start workout
    await c.waitFor(`BP.board().presented.screen === 'workout'`);
    await c.pause(1300);
    await c.click(scr(0.096, 0.082), { ms: 650 }); // the back arrow in Workout's header
    await c.waitFor(`BP.board().presented.screen === 'today'`);
    await c.pause(550);
    await c.click(scr(0.38, 0.92), { ms: 650 }); // the Activity tab
    await c.waitFor(`BP.board().presented.screen === 'activity'`);
    await c.pause(1150);
    await c.click({ text: 'Back', in: '.bd-pres .bar' }, { ms: 700 });
    await c.waitFor(`BP.board().presented.screen === 'today'`);
    await c.moveTo([1000, 560], { ms: 550 });
    await c.pause(300);
  },
};
