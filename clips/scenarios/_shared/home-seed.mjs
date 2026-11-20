// The home clips' docs in mixed states, made through each doc's own page (as a reader would) before recording:
// - acme-orders: two comments sent with Request changes → Waiting on agent;
// - acme-status: the rollout date picked, one of the week's two tasks still open → In progress;
// - acme-fit-design: approved → Done (a deck's green key is Present: decks aren't approved).
// The plan, the review, the website, the deck and the listing stay as the examples ship (Needs you / Awaiting approval).
// It ends on the home page at the top, in its default Rows view, with the project shown and the index complete.
import { setTimeout as sleep } from 'node:timers/promises';

// The home hides a folder under /tmp by itself (serve.py temp_folder): list the run's docs folder as shown, by the path
// the server lists it under (/private/tmp on macOS). Then wait for the home's index to hold every doc.
export async function showProject(c) {
  const { json } = await c.bd.req('GET', '/__bluedoc/settings');
  const r = await c.bd.req('POST', '/__bluedoc/settings', { home: { shown: json.folders.map((f) => f.path) } });
  if (r.status !== 200) throw new Error(`home.shown: ${r.status} ${JSON.stringify(r.json)}`);
  await waitIndexed(c);
}

// Since 1.2.0 the home renders from index.db, which a fresh BLUEDOC_HOME builds on first start ("indexing N of M"):
// wait until every listed doc has a row and a summary (its card hero), as index.json reports.
export async function waitIndexed(c, timeout = 180_000) {
  const deadline = Date.now() + timeout;
  for (;;) {
    const { status, json } = await c.bd.req('GET', '/__bluedoc/index.json?view=rows');
    if (status === 200 && !json.indexing && json.index && json.index.docs > 0 && json.index.summarized >= json.index.docs) return;
    if (Date.now() > deadline) throw new Error(`home index not done: ${status} ${JSON.stringify(json && (json.indexing || json.index))}`);
    await sleep(250);
  }
}

// the home's doc list has rendered from a complete index: a row (or a card) links each doc, no "indexing" note
export const HOME_READY = `document.querySelectorAll('a.t, a.bd-card').length > 0 && !/indexing \\d+ of \\d+|\\d+ of \\d+ indexed/.test(document.body.innerText)`;

export async function seedHome(c) {
  await showProject(c);

  await c.goto('acme-orders');
  await c.ev(`BP.annotate({type: 'pin', key: 'node:orders/api', note: 'Show the retry policy'})`);
  await c.ev(`BP.annotate({type: 'general', note: 'Link the relay runbook'})`);
  await c.click('.bd-anntb .go', { ms: 120 });
  await c.waitForSelector('dialog.bd-chgs[open] .ft .pri');
  await c.click('dialog.bd-chgs[open] .ft .pri', { ms: 120 });
  await c.waitFor(`BP.annotations().every((a) => a.status === 'open')`);

  await c.goto('acme-status');
  await c.ev(`BP.choose('decide/saved-carts', 'oct19')`);
  await c.waitFor(`BP.progress().find((p) => p.id === 'decide').done === 1`);

  await c.goto('acme-fit-design');
  await c.click('.bd-anntb .approve', { ms: 120 });
  await c.waitForSelector('dialog.bd-approve[open] .ft .pri');
  await c.click('dialog.bd-approve[open] .ft .pri', { ms: 120 });
  await c.waitFor(`BP.planState().state === 'approved'`);

  // the page saves ticks and picks a moment after each change
  await c.pause(1200);
  await waitIndexed(c);
  await c.goto('home');
  await c.waitFor(HOME_READY, 60_000);
}
