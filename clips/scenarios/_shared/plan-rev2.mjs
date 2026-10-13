// acme-saved-carts-plan's review round, shared by plan-status and plan-revise: the reader picks an option on each
// open question and leaves a note on the retention one, then Request changes; the agent's rev 2 takes the note.

// the reader's review of rev 1, through the page
export async function reviewRev1(c) {
  await c.ev(`BP.choose('decisions/retention', 'd90')`);
  await c.ev(`BP.choose('decisions/prices', 'notice')`);
  await c.ev(`BP.choose('decisions/guests', 'accounts')`);
  await c.ev(`BP.setNote('decisions/retention', 'Start at 90 days; we can extend it once we see how shoppers reorder.')`);
  await c.waitFor(`BP.progress().find((p) => p.id === 'decisions').done === 3`);
}

// the agent's rev 2 on the temp copy: question 1 recommends 90 days, the sweeper step says so
export function patchRev2(bd) {
  const doc = bd.docPath('acme-saved-carts-plan');
  bd.py('build.py', 'patch', doc, 'item:decisions/retention', '--json', JSON.stringify({
    recommend: 'd90',
    sub: 'Recommend 90 days, as you asked: covers monthly reorders; the sweeper can stretch it later.',
    detail: '**Why 90:** you asked to start shorter. 90 days keeps about 450,000 rows, about 0.9 GB; a longer retention later is one setting in the sweeper.',
  }), '--change', 'Question 1 now recommends 90 days, as you asked.');
  bd.py('build.py', 'patch', doc, 'step:steps/0/sweeper', '--no-bump', '--set',
    'md=Deletes carts unused for 90 days. Runs at 03:10 UTC, in batches of 1,000 rows; a longer retention later is one setting.',
    '--change', 'Step 6 sweeps after 90 days.');
}
