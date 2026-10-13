// Reviews: GitHub review threads come in through ghthreads.py, which runs in a terminal (the page has no import key).
// The terminal card is drawn by this scenario: the command as the agent guide writes it (skills/bluedoc/types/
// review.md) and the one line ghthreads.py prints to stderr, in its own format, for #415's 4 open threads at the
// commits in acme-shop.bundle (base 89efd8e22, head 0a46a97f3). Then the page: #415's PR link, the note on who read
// and posted, and one finding from a thread opened on Reviewer, My reasoning and Reply I'd post.
import { findingsView, scrollSettled } from './_shared/review-findings.mjs';

// the page scrolls a long way to the finding in one glide: trade a little quality for size
export const crf = 29;

const CMD = 'python3 ghthreads.py --repo acme/acme-shop --pr 415 --checklist t415 > t415.json';
const OUT = '4 open thread(s), 0 resolved skipped; base 89efd8e22 head 0a46a97f3';
const ROW = '#pr-415 .bd-mrow[data-item="t415/backoff-const"]';

const CSS = `#clip-term { position: fixed; inset: 0; z-index: 2147483000; display: grid; place-items: center;
  background: rgb(8 9 12 / .62); transition: opacity .3s; }
#clip-term.off { opacity: 0; }
#clip-term .w { width: 900px; border-radius: 12px; overflow: hidden; background: #111318;
  box-shadow: 0 0 0 1px #2b2e36, 0 24px 70px rgb(0 0 0 / .55); }
#clip-term .t { display: flex; align-items: center; gap: 8px; height: 34px; padding: 0 14px; background: #1a1d23;
  border-bottom: 1px solid #262931; font: 500 12px/1 Inter, system-ui, sans-serif; color: #9aa0ab; }
#clip-term .t i { width: 12px; height: 12px; border-radius: 50%; background: #3a3e47; }
#clip-term .t span { margin: 0 auto; padding-right: 60px; }
#clip-term pre { margin: 0; padding: 16px 18px 20px; min-height: 92px; white-space: pre-wrap;
  font: 14px/1.6 "JetBrains Mono Variable", "JetBrains Mono", ui-monospace, Menlo, monospace; color: #e6e7ea; }
#clip-term .p { color: #7aa7ff; }
#clip-term .o { color: #9aa0ab; }
#clip-term .k { display: inline-block; width: 8px; height: 17px; vertical-align: -3px; background: #e6e7ea; }`;

// typed in the page over TYPE_MS (paced by the clock, not by timer ticks), then the output line
const TYPE_MS = 900;
const TERM = `(() => {
  const el = document.createElement('div');
  el.id = 'clip-term';
  el.innerHTML = '<div class="w"><div class="t"><i></i><i></i><i></i><span>acme-shop</span></div><pre><span class="p">acme-shop $ </span><span class="c"></span><span class="k"></span></pre></div>';
  document.body.append(el);
  window.__clipTerm = () => new Promise((done) => {
    const c = el.querySelector('.c'), cmd = ${JSON.stringify(CMD)};
    const t0 = performance.now();
    const tick = () => {
      const i = Math.ceil(cmd.length * Math.min(1, (performance.now() - t0) / ${TYPE_MS}));
      c.textContent = cmd.slice(0, i);
      if (i < cmd.length) return requestAnimationFrame(tick);
      setTimeout(() => {
        el.querySelector('.k').remove();
        el.querySelector('pre').insertAdjacentHTML('beforeend', '\\n<span class="o">' + ${JSON.stringify(OUT)} + '</span>\\n<span class="p">acme-shop $ </span><span class="k"></span>');
        done();
      }, 200);
    };
    requestAnimationFrame(tick);
  });
})()`;

export default {
  doc: 'acme-review-findings',
  posterAt: -0.4,
  cursor: [300, 640],

  async setup(c) {
    await findingsView(c, 'pr-415', 'merged');
    // the summary's #415 rows and its note in view, the PR links in the rail
    await c.ev(`(() => { const n = document.querySelector('#summary .bp-callout') || document.querySelector('#summary > :last-child');
      window.scrollTo({top: n.getBoundingClientRect().bottom + scrollY - 700, behavior: 'instant'}); })()`);
    await c.addStyle(CSS);
    await c.ev(TERM);
    await c.pause(300);
  },

  async run(c) {
    await c.pause(200);
    await c.ev('__clipTerm()');
    await c.pause(500);
    await c.ev(`document.getElementById('clip-term').classList.add('off')`);
    await c.pause(300);
    await c.ev(`document.getElementById('clip-term').remove()`);

    await c.moveTo({ text: 'acme-shop #415 (PayCo retry)' }, { ms: 350 });
    await c.pause(250);
    await c.moveTo({ text: 'posted with your', in: '#summary' }, { ms: 450 });
    await c.pause(250);
    await c.click({ text: 'Name the 250 ms backoff', in: '#summary table' }, { ms: 450 });
    await c.waitForSelector(`${ROW}.bd-flash`);
    await scrollSettled(c);
    await c.pause(100);
    await c.click(`${ROW} .bd-mdet`, { ms: 450 });
    await c.waitFor(`document.querySelector('${ROW} .bd-mdet').getAttribute('aria-expanded') === 'true'`);
    await c.pause(100);
    // the details fit under the row: the pointer rests just under Reply I'd post
    const [x, y] = await c.point({ text: 'Reply I', in: ROW });
    await c.moveTo([x - 20, y + 20], { ms: 450 });
    await c.pause(1000);
  },
};
