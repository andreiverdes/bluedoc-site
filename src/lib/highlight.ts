// Build-time syntax highlighting for the code shown on the site: one line in, HTML out. Each token gets a
// one-letter class (k key or attribute, s string, n number or literal or tag name, p punctuation) that the
// component colours with the --code-* tokens in global.css.

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const JSON_TOKEN = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b|([{}[\],:])/g;

/** One line of JSON: keys, strings, numbers, literals and punctuation. */
export function highlightJson(line: string): string {
  let out = '';
  let last = 0;
  for (const m of line.matchAll(JSON_TOKEN)) {
    out += esc(line.slice(last, m.index));
    if (m[1]) out += `<span class="${m[2] ? 'k' : 's'}">${esc(m[1])}</span>${m[2] ? `<span class="p">${esc(m[2])}</span>` : ''}`;
    else if (m[3]) out += `<span class="n">${m[3]}</span>`;
    else if (m[4]) out += `<span class="n">${m[4]}</span>`;
    else out += `<span class="p">${esc(m[5])}</span>`;
    last = m.index + m[0].length;
  }
  return out + esc(line.slice(last));
}

const HTML_TAG = /(<\/?)([\w-]+)([^>]*?)(\/?>)/g;
const HTML_ATTR = /([\w-:]+)(=)("[^"]*")/g;

/** One line of HTML: tag names, attribute names and values, the angle brackets. */
export function highlightHtml(line: string): string {
  let out = '';
  let last = 0;
  for (const m of line.matchAll(HTML_TAG)) {
    out += esc(line.slice(last, m.index));
    let attrs = '';
    let at = 0;
    for (const a of m[3].matchAll(HTML_ATTR)) {
      attrs += esc(m[3].slice(at, a.index));
      attrs += `<span class="k">${esc(a[1])}</span><span class="p">${a[2]}</span><span class="s">${esc(a[3])}</span>`;
      at = a.index + a[0].length;
    }
    attrs += esc(m[3].slice(at));
    out += `<span class="p">${esc(m[1])}</span><span class="n">${m[2]}</span>${attrs}<span class="p">${esc(m[4])}</span>`;
    last = m.index + m[0].length;
  }
  return out + esc(line.slice(last));
}

const MD_TOKEN = /^(#{1,6} .*)$|^(\s*>.*)$|(`[^`]+`)|(\*\*[^*]+\*\*)|(\([a-z0-9]+\))$/g;

/** One line of Markdown, as a change request reads: headings, quotes, `code` keys, **labels** and comment ids. */
export function highlightMarkdown(line: string): string {
  let out = '';
  let last = 0;
  for (const m of line.matchAll(MD_TOKEN)) {
    out += esc(line.slice(last, m.index));
    const cls = m[1] ? 'n' : m[2] || m[5] ? 'p' : m[3] ? 'k' : 's';
    out += `<span class="${cls}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + esc(line.slice(last));
}
