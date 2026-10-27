// Headings in src/content carry a small markup: [words] set in the blue pixel face, {words} in the soft second
// ink, and "\n" for a line break. rich() turns it into HTML for set:html. With `words`, every word is its own span
// (class "w") numbered by --i, so the hero's CSS can bring them in one by one.

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const TOKEN = /\[([^\]]+)\]|\{([^}]+)\}|(\n)|([^[{\n]+)/g;

export function rich(text: string, { words = false } = {}): string {
  let i = 0;
  const wrap = (s: string) =>
    words
      ? s
          .split(/(\s+)/)
          .map((w) => (w.trim() ? `<span class="w" style="--i:${i++}">${esc(w)}</span>` : w))
          .join('')
      : esc(s);
  let out = '';
  for (const m of text.matchAll(TOKEN)) {
    if (m[1]) out += `<span class="px">${wrap(m[1])}</span>`;
    else if (m[2]) out += `<span class="h-soft">${wrap(m[2])}</span>`;
    else if (m[3]) out += '<br />';
    else out += wrap(m[4]);
  }
  return out;
}
