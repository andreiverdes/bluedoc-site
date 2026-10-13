// Designs: editing a link as a draft. In Link mode (L) the end of Today's Profile-tab arrow is dragged from Profile
// onto Settings: the arrow turns into an amber draft. Present follows the draft at once: Today's Profile tab now
// opens Settings.
import { ab, panels, settled, view } from '../fixtures/acme-fit-design/board.mjs';

const LINK = 'link:today/tab-profile';
const scr = (x, y) => ({ sel: '.bd-pres iframe', x, y });

export default {
  doc: 'acme-fit-design',
  posterAt: 3.2,
  cursor: [1110, 420],

  async setup(c) {
    await panels(c);
    await view(c, { x: 1400, y: 2620, k: 0.3, to: [640, 470] });
    await settled(c);
    await c.click(ab('today', 0.5, 0.6), { ms: 1 });
    await c.waitFor(`BP.board().selected === 'today'`);
    await c.key('l');
    await c.waitFor(`BP.board().mode === 'link'`);
  },

  async run(c) {
    await c.pause(700);
    // the arrow's end, where it meets Profile
    const end = await c.ev(`(() => {
      const ln = document.querySelector('.bd-lnk[data-link="${LINK}"] .ln');
      const p = ln.getPointAtLength(ln.getTotalLength() - 1), q = new DOMPoint(p.x, p.y).matrixTransform(ln.getScreenCTM());
      return [q.x, q.y];
    })()`);
    await c.moveTo(end, { ms: 700 });
    await c.pause(250);
    await c.down();
    await c.pause(150);
    await c.moveTo(ab('settings', 0.5, 0.4), { ms: 900 });
    await c.pause(200);
    await c.up();
    await c.waitFor(`BP.boardEdit().drafts.some(d => d.key === '${LINK}' && d.link.to === 'settings')`);
    await c.pause(1100);
    // Present from Today, then its Profile tab
    await c.click('button[aria-label^="Present"]', { ms: 700 });
    await c.waitFor(`BP.board().presented && BP.board().presented.screen === 'today'`);
    await c.pause(700);
    await c.click(scr(0.857, 0.921), { ms: 650 });
    await c.waitFor(`BP.board().presented.screen === 'settings'`);
    await c.pause(1300);
  },
};
