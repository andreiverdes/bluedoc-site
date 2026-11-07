// Designs: video plays in a screen (1.0.14). The Dashboard screen gets a card with a <video> of the Q3 launch review
// (a file beside the doc, cut from the pres-present clip: clips/fixtures/acme-fit-design/q3-recap.webm). On the board
// it plays in the screen's frame; Present opens the screen full-window and the video keeps playing there.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ab, panels, settled } from '../fixtures/acme-fit-design/board.mjs';

export default {
  doc: 'acme-fit-design',
  posterAt: -0.8,
  cursor: [1000, 620],

  async prepare(ctx) {
    const doc = ctx.bd.docPath('acme-fit-design');
    mkdirSync(join(ctx.docs, 'media'), { recursive: true });
    copyFileSync(join(ctx.clips, 'fixtures/acme-fit-design/q3-recap.webm'), join(ctx.docs, 'media/q3-recap.webm'));
    // the screen's own URL is …/acme-fit-design.design/dashboard.html: the video beside the doc, by its path on the server
    const u = await ctx.bd.req('GET', `/__bluedoc/url?doc=${encodeURIComponent(doc)}`);
    const src = `${dirname(u.json.url)}/media/q3-recap.webm`;
    const html = join(ctx.work, 'dashboard-video.html');
    writeFileSync(html, readFileSync(join(ctx.clips, 'fixtures/acme-fit-design/dashboard-video.html'), 'utf8').replace('__SRC__', src));
    ctx.py('build.py', 'patch', doc, 'artboard:dashboard', '--html', html,
      '--change', 'Dashboard: the Q3 launch review recording plays in a card.');
  },

  async setup(c) {
    await panels(c);
    await c.ev(`BP.board({focus: 'dashboard'})`);
    await settled(c);
    await c.pause(1200); // the screen's frame is sandboxed (no access from here): give its video time to start
  },

  async run(c) {
    await c.pause(900);
    await c.moveTo(ab('dashboard', 0.3, 0.62), { ms: 650 });
    await c.pause(1300); // it plays on the board
    await c.click(ab('dashboard', 0.9, 0.06), { ms: 550 });
    await c.waitFor(`BP.board().selected === 'dashboard'`);
    await c.pause(200);
    await c.click('button[aria-label^="Present"]', { ms: 650 });
    await c.waitFor(`BP.board().presented && BP.board().presented.screen === 'dashboard'`);
    await c.waitForSelector('.bd-pres iframe');
    await c.moveTo({ sel: '.bd-pres iframe', x: 0.92, y: 0.9 }, { ms: 600 });
    await c.pause(2000);
  },
};
