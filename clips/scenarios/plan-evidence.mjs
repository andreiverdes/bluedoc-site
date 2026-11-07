// Plans: evidence is pinned to the code it checked. Before the take, acme-shop is a git repo (the history in
// acme-shop.bundle, plus a commit with the saved-carts table and repo); the reader approved rev 1, and the agent's
// rev 2 ticks Run the orders-api tests with its result as evidence, which build.py patch pins to that commit for
// services/orders-api. The check opens on a green ✓ chip. Then a commit changes savedCartRepo.ts; after the reload the
// check reads Needs recheck and leaves the count; opened, its chip is amber, and Stale lists the file that moved.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ITEM = '#item-checks-unit';
const REPO = 'services/orders-api/src/carts/savedCartRepo.ts';

// git in the temp project (acme-shop/, the docs folder inside it), as one author
const git = (ctx, ...args) => execFileSync('git', ['-c', 'user.name=Acme Dev', '-c', 'user.email=dev@acme.test', ...args], { cwd: ctx.work });
const write = (ctx, rel, text) => {
  mkdirSync(join(ctx.work, rel, '..'), { recursive: true });
  writeFileSync(join(ctx.work, rel), text);
};

export default {
  doc: 'acme-saved-carts-plan',
  posterAt: -0.4,
  cursor: [1040, 470],

  async prepare(ctx) {
    git(ctx, 'init', '-q', '-b', 'main');
    git(ctx, 'fetch', '-q', join(ctx.repo, 'skills/bluedoc/examples/acme-shop.bundle'), 'main');
    git(ctx, 'reset', '-q', '--hard', 'FETCH_HEAD');
    writeFileSync(join(ctx.work, '.git/info/exclude'), 'docs/\n');
    write(ctx, 'services/orders-api/migrations/0012_saved_carts.sql', 'create table saved_carts (\n  id uuid primary key,\n  account_id uuid not null,\n  name text not null,\n  last_used_at timestamptz not null\n);\n');
    write(ctx, 'services/orders-api/src/carts/savedCartLimit.ts', 'export const SAVED_CART_LIMIT = 20;\nexport class SavedCartLimit extends Error {}\n');
    write(ctx, REPO, "import { SAVED_CART_LIMIT, SavedCartLimit } from './savedCartLimit';\n\nexport class SavedCartRepo {\n  async save(accountId: string, name: string, lines: unknown[]) {\n    if ((await this.count(accountId)) >= SAVED_CART_LIMIT) throw new SavedCartLimit();\n  }\n  async count(accountId: string) { return 0; }\n}\n");
    git(ctx, 'add', '-A');
    git(ctx, 'commit', '-q', '-m', 'Saved carts: the table and SavedCartRepo');
  },

  async setup(c) {
    await c.waitForSelector('.bd-anntb .approve');
    await c.ev(`BP.sidebar({open: false})`);
    // the reader approved rev 1 (with the recommended picks)
    await c.ev(`BP.acceptRecommended()`);
    await c.click('.bd-anntb .approve', { ms: 100 });
    await c.waitForSelector('.bd-approve .bp-btn.ok');
    await c.click('.bd-approve .bp-btn.ok', { ms: 100 });
    await c.waitFor(`BP.planState().state === 'approved'`);
    // the agent's rev 2: steps 1 and 2 done, the tests run and their result recorded (pinned to HEAD)
    const doc = c.bd.docPath('acme-saved-carts-plan');
    c.bd.py('build.py', 'patch', doc, 'step:steps/0/table', '--set', 'status=done', '--change', 'Steps 1 and 2 are done; the orders-api tests pass.');
    c.bd.py('build.py', 'patch', doc, 'step:steps/0/repo', '--no-bump', '--set', 'status=done');
    c.bd.py('build.py', 'patch', doc, 'item:checks/unit', '--no-bump', '--set', 'done=true', '--json',
      JSON.stringify({ evidence: [{ label: 'orders-api tests', code: 'pnpm --filter orders-api test', md: '`48 passed` in 3.1 s' }] }),
      '--paths', 'services/orders-api');
    await c.reload();
    await c.waitFor(`BP.planState().rev === '2' && !BP.sidebar().open`);
    await c.ev(`[...document.querySelectorAll('button[aria-label=Dismiss]')].forEach((b) => b.click())`);
    await c.ev(`document.querySelector('${ITEM} .bp-cl-head').click()`);
    await c.waitFor(`!!document.querySelector('${ITEM} .bp-pin.current')`);
    // the check, its evidence and the checklist's count in the frame
    await c.ev(`window.scrollTo({top: document.querySelector('#verify').getBoundingClientRect().top + scrollY - 60, behavior: 'instant'})`);
    await c.pause(400);
  },

  async run(c) {
    await c.pause(800);
    await c.moveTo({ sel: `${ITEM} .bp-pin`, x: 1, y: 0.5, dx: 30 }, { ms: 600 });
    await c.pause(800); // ✓ checked at this commit

    // the agent changes the repo after the check ran; the reader reloads
    writeFileSync(join(c.bd.work, REPO), "import { SAVED_CART_LIMIT, SavedCartLimit } from './savedCartLimit';\n\nexport class SavedCartRepo {\n  async save(accountId: string, name: string, lines: unknown[]) {\n    const existing = await this.byName(accountId, name);\n    if (!existing && (await this.count(accountId)) >= SAVED_CART_LIMIT) throw new SavedCartLimit();\n  }\n  async byName(accountId: string, name: string) { return null; }\n  async count(accountId: string) { return 0; }\n}\n");
    execFileSync('git', ['-c', 'user.name=Acme Dev', '-c', 'user.email=dev@acme.test', 'commit', '-q', '-am', 'SavedCartRepo: saving under a taken name replaces it'], { cwd: c.bd.work });
    await c.reload();
    await c.waitFor(`!!document.querySelector('${ITEM} .bp-recheck')`);
    await c.pause(700); // the check reads Needs recheck and leaves the count
    await c.click({ sel: `${ITEM} .bp-cl-head`, x: 0.3, y: 0.5 }, { ms: 550 });
    await c.waitFor(`document.querySelector('${ITEM}').classList.contains('open')`);
    await c.pause(500);
    await c.click(`${ITEM} .bp-pin-stale summary`, { ms: 550 });
    await c.waitFor(`document.querySelector('${ITEM} .bp-pin-stale').open`);
    await c.moveTo({ sel: `${ITEM} .bp-pin-stale li`, x: 1, y: 0.5, dx: 40 }, { ms: 500 });
    await c.pause(1300);
  },
};
