// Docs: checklist progress as Markdown. With three runbook steps ticked, Copy progress in the rail's Tracker copies
// the page's progress; a card then shows what was copied (BP.progressMarkdown(), the same text), with its [x] ticks.
// The card is drawn by this scenario: a headless clipboard has nothing to paste into.
const CARD = 'clip-md-card';
const COPY = '.bp-side-tools .bp-btn';

// the copied Markdown, as a card over the page: a drawing, not bluedoc UI
const SHOW_CARD = `(() => {
  const md = BP.progressMarkdown().trim().split('\\n').filter((l, i, a) => !(l === '' && a[i - 1] === ''));
  const esc = (s) => s.replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[ch]);
  const line = (l) => {
    const t = esc(l).replace(/\`([^\`]+)\`/g, '<span class="k">\`$1\`</span>');
    if (l.startsWith('#')) return '<div class="h">' + t + '</div>';
    return '<div>' + t.replace('[x]', '<b>[x]</b>') + '</div>';
  };
  const el = document.createElement('div');
  el.id = '${CARD}';
  el.innerHTML = '<div class="t"><span>Copied as Markdown</span><span class="n">' + md.length + ' lines</span></div><pre>' + md.map(line).join('') + '</pre>';
  const box = document.querySelector('#cl-local').getBoundingClientRect(); // over the checklist, its width
  Object.assign(el.style, { left: box.left + 'px', width: box.width + 'px' });
  document.body.append(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('on')));
})()`;

export default {
  doc: 'acme-orders',
  posterAt: -0.9,
  cursor: [760, 560],

  async setup(c) {
    await c.waitForSelector('#cl-local');
    await c.ev(`BP.sidebar({ open: false })`); // the page's own width, without the comments panel
    await c.ev(`['doctor', 'up', 'worker'].forEach((id) => { const cb = document.getElementById('cb-local-' + id); if (!cb.checked) cb.click(); })`);
    await c.waitFor(`BP.progress().find((p) => p.id === 'local').done === 3`);
    await c.ev(`scrollTo(0, document.querySelector('#cl-local').getBoundingClientRect().top + scrollY - 76)`);
    await c.addStyle(`
      #${CARD} { position: fixed; top: 150px; z-index: 90; border-radius: 14px; overflow: hidden;
        background: var(--surface); box-shadow: 0 0 0 1px var(--line), 0 24px 64px rgba(0,0,0,.45);
        opacity: 0; transform: translateY(10px) scale(.985); transition: opacity .35s ease, transform .35s ease; }
      #${CARD}.on { opacity: 1; transform: none; }
      #${CARD} .t { display: flex; justify-content: space-between; padding: 11px 16px; border-bottom: 1px solid var(--line);
        font: 600 13px var(--sans); color: var(--fg); }
      #${CARD} .t .n { font: 500 12px var(--mono); color: var(--fg-subtle); }
      #${CARD} pre { margin: 0; padding: 14px 16px 16px; font: 12.5px/1.7 var(--mono); color: var(--fg-muted); white-space: pre-wrap; }
      #${CARD} .h { color: var(--fg); font-weight: 600; }
      #${CARD} .k { color: var(--fg-subtle); }
      #${CARD} b { color: var(--ok-fg); font-weight: 600; }
    `);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(700);

    await c.click(COPY, { ms: 700 });
    await c.pause(450); // the toast: Copied progress as Markdown
    await c.ev(SHOW_CARD);
    await c.moveTo({ sel: `#${CARD}`, x: 0.88, y: 0.86 }, { ms: 700 }); // the card's empty corner, clear of its lines
    await c.pause(2100);

    // the card goes, back to the page as it opened
    await c.ev(`document.getElementById('${CARD}').classList.remove('on')`);
    await c.moveTo([760, 560], { ms: 550 });
    await c.pause(400);
  },
};
