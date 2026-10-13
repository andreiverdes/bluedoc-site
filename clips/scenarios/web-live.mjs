// Websites: the Blog page live from the Acme Fit dev server. A post title is edited in the site's source, a letter
// at a time, and each edit lands on the board through Vite's hot reload.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { BOARD_READY, boardOnly, inFrame, inPage, settle, startFixture, stepBack } from '../fixtures/acme-fit-site/fixture.mjs';

const TITLE = 'Weekly goals are here';
const ADDED = ' for everyone';
const TITLE_EL = '#post-weekly-goals .post-title';
let site;

export default {
  doc: 'acme-site',
  posterAt: -0.4,
  cursor: [1010, 640],

  async prepare(ctx) {
    site = await startFixture(ctx);
    return () => site.stop();
  },

  async setup(c) {
    await c.waitFor(BOARD_READY, 30_000);
    await boardOnly(c);
    await c.ev(`BP.board({section: ['blog', 'posts']})`);
    await settle(c);
    await stepBack(c);
  },

  async run(c) {
    await c.pause(900);
    const [x, y] = await inPage(c, 'blog', TITLE_EL, { fx: 1 });
    await c.moveTo([x + 40, y + 34], { ms: 650 });
    await c.pause(350);
    // src/content/blog.ts, as an editor saves it on each keystroke
    const file = join(site.root, 'src/content/blog.ts');
    let shown = TITLE;
    for (const ch of ADDED) {
      writeFileSync(file, readFileSync(file, 'utf8').replace(`title: '${shown}'`, `title: '${shown + ch}'`));
      shown += ch;
      await c.pause(95);
    }
    for (let i = 0; i < 50 && (await inFrame(c, 'blog', `document.querySelector('${TITLE_EL}')?.textContent`)) !== TITLE + ADDED; i++) await c.pause(50);
    await c.pause(2200);
  },
};
