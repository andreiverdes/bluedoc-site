// Every doc type: attach a file to a comment (1.0.9). On the price question of acme-saved-carts-plan, the reader
// writes a reply, presses Attach and picks a CSV (headless Chrome has no file dialog: the press hands the pick to the
// box's file input, as bluedoc's tests set it); the server keeps a copy and the chip shows its name and size. Save,
// then Request changes: the Markdown the agent gets lists the copy's full path under the comment, for it to read.
const ITEM = '#item-decisions-prices';
const BOX = `document.querySelector('${ITEM} > .bp-note')`;

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
  cursor: [760, 560],

  async setup(c) {
    await c.waitForSelector(`${ITEM} .bp-note-ta`);
    await c.ev(`BP.sidebar({open: false})`);
    await c.waitFor(`!BP.sidebar().open`);
    await c.ev(PICK);
    // the reader's BLUEDOC_HOME is ~/.bluedoc: the Request changes preview shows the take's temp one as that (a text
    // replace in the preview only, run by a MutationObserver before the preview paints)
    await c.ev(`(() => {
      const home = ${JSON.stringify(c.bd.home)};
      const tidy = () => document.querySelectorAll('.bd-chgs pre').forEach((pre) => {
        const w = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT);
        for (let n; (n = w.nextNode()); ) if (n.data.includes(home)) n.data = n.data.split(home).join('~/.bluedoc');
      });
      new MutationObserver(tidy).observe(document.body, { subtree: true, childList: true, characterData: true });
    })()`);
    await c.ev(`document.querySelector('${ITEM} .bp-cl-head').click()`);
    await c.waitFor(`document.querySelector('${ITEM}').classList.contains('open')`);
    // the reply box low in the frame, with the question's options above it
    await c.ev(`window.scrollTo({top: ${BOX}.getBoundingClientRect().top + scrollY - 420, behavior: 'instant'})`);
    await c.pause(400);
  },

  async run(c) {
    await c.pause(800);
    await c.click({ sel: `${ITEM} > .bp-note .bp-note-ta`, x: 0.3 }, { ms: 600 });
    await c.pause(150);
    await c.type('Price changes since July:', { cps: 28 });
    await c.pause(200);
    await c.click(`${ITEM} > .bp-note .bp-attach`, { ms: 550 });
    await c.waitFor(`${BOX}.querySelectorAll('.bp-file').length === 1 && !${BOX}.querySelector('.bp-files-up')`);
    await c.moveTo({ sel: `${ITEM} > .bp-note .bp-file`, x: 0.5, y: 0.5 }, { ms: 450 });
    await c.pause(550);
    await c.click(`${ITEM} > .bp-note .bp-btn.primary`, { ms: 500 });
    await c.waitFor(`/1/.test(document.querySelector('.bd-anntb .go').textContent)`);
    await c.pause(200);
    // what the agent gets: the comment, then the copy's full path
    await c.click('.bd-anntb .go', { ms: 650 });
    await c.waitForSelector('.bd-chgs .bp-btn.primary');
    await c.pause(200);
    await c.moveTo({ text: 'KB)', in: '.bd-chgs pre', at: 'end', dx: 40 }, { ms: 600 });
    await c.pause(1500);
  },
};
