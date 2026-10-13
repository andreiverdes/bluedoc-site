// Presentations (hero): Present plays the deck full-window from the selected slide, each slide as large as the window
// allows with its speaker notes under it. → steps from the title through What shipped to Weekly actives; Esc returns
// to the board on the slide it left. The board starts fitted, so every slide's frame is live when Esc lands.
import { ab, settled } from '../fixtures/acme-fit-design/board.mjs';
import { panels } from '../fixtures/acme-fit-deck/deck.mjs';

const PRESENT = '.bd-btb .bd-tbtn.pri';
const shown = (id) => `BP.board().presented && BP.board().presented.screen === '${id}'`;

export default {
  doc: 'acme-fit-deck',
  posterAt: 2.2,
  cursor: [1000, 560],

  async setup(c) {
    await panels(c, { left: true });
    await c.waitFor(`BP.board().artboards.every(a => a.live)`);
    await settled(c);
    await c.click(ab('title', 0.5, 0.15), { ms: 1 });
    await c.waitFor(`BP.board().selected === 'title'`);
    await c.moveTo([1000, 560], { ms: 1 });
    await c.pause(400);
  },

  async run(c) {
    await c.pause(800);
    await c.click(PRESENT, { ms: 700 });
    await c.waitFor(shown('title'));
    await c.waitForSelector('.bd-pres iframe');
    await c.moveTo([1215, 640], { ms: 500 });
    await c.pause(700);
    await c.key('ArrowRight');
    await c.waitFor(shown('shipped'));
    await c.pause(1150);
    await c.key('ArrowRight');
    await c.waitFor(shown('actives'));
    await c.pause(1400);
    await c.key('Escape');
    await c.waitFor(`!BP.board().present`);
    await c.moveTo([1000, 560], { ms: 550 });
    await c.pause(900);
  },
};
