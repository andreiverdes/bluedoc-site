// The home clips' docs in mixed states, made through each doc's own page (as a reader would) before recording:
// - acme-orders: two comments sent with Request changes → Waiting on agent;
// - acme-status: the rollout date picked and one task ticked → In progress;
// - acme-fit-deck: approved → Done.
// The plan, the review, the design and the website stay as the examples ship: Needs you (three awaiting approval).
export async function seedHome(c) {
  await c.goto('acme-orders');
  await c.ev(`BP.annotate({type: 'pin', key: 'node:orders/api', note: 'Show the retry policy'})`);
  await c.ev(`BP.annotate({type: 'general', note: 'Link the relay runbook'})`);
  await c.click('.bd-anntb .go', { ms: 120 });
  await c.waitForSelector('.bd-chgs .bp-btn.primary');
  await c.click('.bd-chgs .bp-btn.primary', { ms: 120 });
  await c.waitFor(`BP.annotations().every((a) => a.status === 'open')`);

  await c.goto('acme-status');
  await c.ev(`BP.choose('next/saved-carts', 'oct19')`);
  await c.ev(`document.querySelector('#cb-next-fulfilment').click()`);
  await c.waitFor(`BP.progress()[0].done === 2`);

  await c.goto('acme-fit-deck');
  await c.click('.bd-anntb .approve', { ms: 120 });
  await c.waitForSelector('.bd-approve .bp-btn.ok');
  await c.click('.bd-approve .bp-btn.ok', { ms: 120 });
  await c.waitFor(`BP.planState().state === 'approved'`);

  // the page saves ticks and picks a moment after each change
  await c.pause(1200);
  await c.goto('home');
  await c.waitFor(`document.querySelectorAll('button.bd-fc').length > 0`);
}
