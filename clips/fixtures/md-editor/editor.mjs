// A plain code editor's window for one Markdown file, for the clip that shows what Export → Markdown saved: the file
// as the browser wrote it, read again on every request, with line numbers and a light Markdown tint (blues only).
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { basename } from 'node:path';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// one line of Markdown, tinted: headings, list and quote markers, task boxes, `code`, **bold**, |table| rules
function tint(line) {
  let m;
  if ((m = /^(#{1,6} )(.*)$/.exec(line))) return `<span class="h">${esc(m[1])}${esc(m[2])}</span>`;
  if (/^\|/.test(line)) return esc(line).replace(/\|/g, '<span class="p">|</span>').replace(/(-{3,})/g, '<span class="p">$1</span>');
  let out = esc(line);
  out = out.replace(/^(\s*)([-*]|\d+\.)( \[[ x]\])?( )/, (_, a, b, c = '', d) => `${a}<span class="p">${b}${c}</span>${d}`);
  out = out.replace(/^(\s*)(&gt;)/, '$1<span class="p">$2</span>');
  out = out.replace(/`([^`]+)`/g, '<span class="c">`$1`</span>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<span class="b">**$1**</span>');
  return out;
}

function page(file, shown) {
  const lines = readFileSync(file, 'utf8').replace(/\n$/, '').split('\n');
  const rows = lines.map((l, i) => `<div class="r"><i>${i + 1}</i><code>${tint(l) || ' '}</code></div>`).join('');
  return `<!doctype html><meta charset="utf-8"><title>${esc(basename(file))}</title><style>
  :root { color-scheme: dark; }
  html, body { margin: 0; height: 100%; background: #0b0e14; }
  body { font: 14px/1.6 ui-monospace, 'SF Mono', Menlo, monospace; color: #c9d4e3; display: flex; flex-direction: column; }
  .bar { flex: none; height: 44px; display: flex; align-items: center; gap: 14px; padding: 0 18px; background: #12161f; border-bottom: 1px solid #1d2330; font: 13px -apple-system, system-ui, sans-serif; color: #8a96a8; }
  .dots { display: flex; gap: 8px; } .dots b { width: 12px; height: 12px; border-radius: 50%; background: #2a3242; }
  .tab { display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; background: #0b0e14; color: #e4ebf5; border-top: 2px solid #3b82f6; box-sizing: border-box; }
  .tab svg { width: 14px; height: 14px; color: #5ab4ff; }
  .path { margin-left: auto; font: 12px ui-monospace, 'SF Mono', Menlo, monospace; color: #6b778a; }
  main { flex: 1; overflow: auto; padding: 14px 0 40px; }
  .r { display: flex; white-space: pre-wrap; } .r i { flex: none; width: 56px; padding-right: 18px; text-align: right; font-style: normal; color: #3d4757; user-select: none; }
  .r code { font: inherit; flex: 1; padding-right: 40px; }
  .h { color: #5ab4ff; font-weight: 700; } .p { color: #4f7fc4; } .c { color: #93c5fd; } .b { color: #f1f5fb; font-weight: 700; }
</style><div class="bar"><span class="dots"><b></b><b></b><b></b></span><span class="tab"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 2.5h6.5L13 6v7.5H3z"/><path d="M9.5 2.5V6H13"/></svg>${esc(basename(file))}</span><span class="path">${esc(shown)}</span></div><main>${rows}</main>`;
}

/** Serves the editor window for file (shown: the path its bar shows); {url, stop}. */
export async function mdEditor(file, shown) {
  const server = createServer((req, res) => {
    try {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }).end(page(file, shown));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain' }).end(String(e));
    }
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  return { url: `http://127.0.0.1:${server.address().port}/`, stop: () => new Promise((ok) => server.close(ok)) };
}
