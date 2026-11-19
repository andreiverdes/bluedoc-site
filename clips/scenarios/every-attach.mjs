// Every doc type: attach a file to a comment (1.0.9). On the price question of acme-saved-carts-plan, the reader
// writes in the question's reply field, presses Attach and picks a CSV (headless Chrome has no file dialog: the press
// hands the pick to the field's file input, as bluedoc's tests set it); the server keeps a copy and the chip shows its
// name and size. Save, then Request changes: the send dialog lists the comment with its file, which the agent reads
// from the server's copy, by its path.
const ITEM = '#item-decisions-prices';
const REPLY = `${ITEM} > .ac-reply`;
const BOX = `document.querySelector('${REPLY}')`;
const SEND = 'dialog.bd-chgs[open]';

// a quarter of price changes, as the export a shop's admin would download
const PICK = `(() => {
window.__pick = (input) => {
  const rows = ['sku,name,old_price,new_price,changed_on'];
  for (let i = 0; i < 140; i++) rows.push(\`SKU-\${1040 + i},Item \${1040 + i},\${(12 + i % 37).toFixed(2)},\${(12.5 + i % 37 * 1.06).toFixed(2)},2026-0\${7 + i % 3}-\${String(1 + i % 28).padStart(2, '0')}\`);
  const dt = new DataTransfer();
  dt.items.add(new File([rows.join('\\n') + '\\n'], 'price-changes-q3.csv', { type: 'text/csv' }));
  input.files = dt.files;
  input.dispatchEvent(new Event('change'));
};
// Attach opens the file dialog with input.click(): the pick lands a moment later instead
const click = HTMLInputElement.prototype.click;
HTMLInputElement.prototype.click = function () { if (this.type !== 'file') return click.call(this); setTimeout(() => window.__pick(this), 300); };
})()`;

export default {
  doc: 'acme-saved-carts-plan',
  posterAt: -0.4,
  // beside the question's line, off the rows (a hovered row or head lights up)
  cursor: [1000, 175],

  async setup(c) {
    await c.waitForSelector(`${REPLY} textarea`);
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    await c.ev(PICK);
    // the reply field low in the frame, with the question's answers above it
    await c.ev(`window.scrollTo({top: ${BOX}.getBoundingClientRect().top + scrollY - 470, behavior: 'instant'})`);
    await c.pause(400);
  },

  async run(c) {
    await c.pause(800);
    await c.click({ sel: `${REPLY} textarea`, x: 0.3 }, { ms: 600 });
    await c.pause(150);
    await c.type('Price changes since July:', { cps: 28 });
    await c.pause(200);
    await c.click(`${REPLY} .ac-att`, { ms: 550 });
    await c.waitFor(`${BOX}.querySelectorAll('.bp-file').length === 1 && !${BOX}.querySelector('.bp-files-up')`);
    await c.moveTo({ sel: `${REPLY} .bp-file`, x: 0.5, y: 0.5, dy: 22 }, { ms: 450 });
    await c.pause(550);
    await c.click(`${REPLY} .ac-go`, { ms: 500 });
    await c.waitFor(`/1/.test(document.querySelector('.bd-anntb .go').textContent)`);
    await c.pause(200);
    // what the agent gets: the comment with its file
    await c.click('.bd-anntb .go', { ms: 650 });
    await c.waitForSelector(`${SEND} .ft .pri`);
    await c.pause(200);
    await c.moveTo({ sel: `${SEND} .sd-cm .bp-file`, x: 0.5, y: 0.5, dy: 24 }, { ms: 600 });
    await c.pause(1500);
  },
};
