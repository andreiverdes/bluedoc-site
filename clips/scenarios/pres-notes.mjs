// Presentations: speaker notes. In Present, Weekly actives shows alone; the bar's Notes key (N) brings its speaker
// notes up under the slide, never on it, and hides them again.
import { settled } from '../fixtures/acme-fit-design/board.mjs';
import { panels } from '../fixtures/acme-fit-deck/deck.mjs';

const NOTES = '.bd-pres .bar button[title^="Speaker notes"]';
const notesShown = (on) => `${on ? '' : '!'}(document.querySelector('.bd-pres .notes') && !document.querySelector('.bd-pres .notes').hidden)`;

export default {
  doc: 'acme-fit-deck',
  posterAt: 2.4,
  cursor: [1180, 690],

  async setup(c) {
    await panels(c, { left: true });
    await settled(c);
    await c.ev(`BP.board({present: 'actives'})`);
    await c.waitFor(`BP.board().presented && BP.board().presented.screen === 'actives'`);
    await c.waitForSelector('.bd-pres iframe');
    await c.key('n'); // the notes start shown: hide them first
    await c.waitFor(notesShown(false));
    await c.pause(800);
  },

  async run(c) {
    await c.pause(800);
    await c.click(NOTES, { ms: 650 });
    await c.waitFor(notesShown(true));
    await c.moveTo({ sel: '.bd-pres .notes', x: 0.7, y: 0.5 }, { ms: 600 });
    await c.pause(1800);
    await c.click(NOTES, { ms: 600 });
    await c.waitFor(notesShown(false));
    await c.moveTo([1180, 690], { ms: 550 });
    await c.pause(500);
  },
};
