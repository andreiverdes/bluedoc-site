// Every doc type: the Settings page (the gear at the home sidebar's foot): the folders the home page lists, then
// Agents, where the plan-mode hook's switch turns Claude Code's plan mode off here (saved at once), then Sharing,
// where acme-shop gets the GitHub account it shares as. gh is bluedoc's stand-in (fixtures/share-standin), signed in
// as acme-dev and acme-design; never GitHub.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { standinServer } from '../fixtures/share-standin/standin.mjs';

const GEAR = '.bd-side [aria-label=Settings]';
const HOOK = '#agents button[role=switch][aria-label="Plan mode opens plans here"]';
const ACCT = '#sharing [data-bd=sharing] .bd-st-row[data-slug] .bd-sh-acct';
const nav = (label) => `[...document.querySelectorAll('.bd-st-nav a')].find((a) => a.textContent === ${JSON.stringify(label)})`;
let bd = null;

export default {
  url: () => bd.urlFor('home'),
  posterAt: 3.4,
  cursor: [760, 300],

  async prepare(ctx) {
    bd = await standinServer({
      repo: ctx.repo, base: `/tmp/bd-clips-${ctx.tag}-settings`,
      projects: { 'acme-shop': ['acme-orders', 'acme-saved-carts-plan', 'acme-review-findings'], 'acme-fit': ['acme-status'] },
      env: { STANDIN_GH_ACCOUNTS: 'acme-dev:active,acme-design' },
    });
    // a code link, as building a doc in the repo adds one
    writeFileSync(join(bd.home, 'repos.json'), JSON.stringify({ 'acme-shop': bd.work }));
    return () => bd.stop();
  },

  async setup(c) {
    await c.waitFor(`document.readyState === 'complete' && !!document.querySelector(${JSON.stringify(GEAR)})`);
    await c.ev(`document.querySelector(${JSON.stringify(GEAR)}).click()`);
    await c.waitFor(`location.pathname === '/settings' && !!document.querySelector('#server .bd-st-row') && !!document.querySelector(${JSON.stringify(ACCT)})`);
    await c.pause(800);
  },

  async run(c) {
    await c.pause(1000);

    // Agents: the plan-mode hook, off here; saved at once
    await c.click(await navTarget(c, 'Agents'), { ms: 600 });
    await c.pause(650);
    await c.click(HOOK, { ms: 550 });
    await c.waitFor(`document.querySelector(${JSON.stringify(HOOK)}).getAttribute('aria-checked') === 'false'`);
    await c.pause(1000);

    // Sharing: the account acme-shop shares as
    await c.click(await navTarget(c, 'Sharing'), { ms: 550 });
    await c.pause(600);
    await c.click(ACCT, { ms: 600 });
    await c.waitForSelector('[role=menuitemradio]');
    await c.pause(600);
    await c.click('[role=menuitemradio]', { ms: 450 });
    await c.waitFor(`document.querySelector(${JSON.stringify(ACCT)} + ' b')?.textContent === 'acme-dev'`);
    await c.pause(1300);
  },
};

// a section's link in the page's section list, as a viewport point
async function navTarget(c, label) {
  return c.ev(`(r => [r.left + r.width / 2, r.top + r.height / 2])(${nav(label)}.getBoundingClientRect())`);
}
