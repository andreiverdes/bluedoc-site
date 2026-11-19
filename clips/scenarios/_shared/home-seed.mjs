// The home clips' docs in mixed states, made through each doc's own page (as a reader would) before recording:
// - acme-orders: two comments sent with Request changes → Waiting on agent;
// - acme-status: the rollout date picked, one of the week's two tasks still open → In progress;
// - acme-fit-design: approved → Done (a deck's green key is Present: decks aren't approved).
// The plan, the review, the website, the deck and the listing stay as the examples ship (Needs you / Awaiting approval).
// It ends on the home page at the top, in its default Rows view, with the project shown.

// The home hides a folder under /tmp by itself (serve.py temp_folder): list the run's docs folder as shown, by the path
// the server lists it under (/private/tmp on macOS).
export async function showProject(c) {
  const { json } = await c.bd.req('GET', '/__bluedoc/settings');
  const r = await c.bd.req('POST', '/__bluedoc/settings', { home: { shown: json.folders.map((f) => f.path) } });
  if (r.status !== 200) throw new Error(`home.shown: ${r.status} ${JSON.stringify(r.json)}`);
}

// the home's doc list has rendered: a row (or a card) links each doc
export const HOME_READY = `document.querySelectorAll('a.t').length > 0`;

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
  await c.goto('home');
  await c.waitFor(HOME_READY);
}
