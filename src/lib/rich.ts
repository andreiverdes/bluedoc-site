// Headings in src/content carry a small markup: [words] set in the blue pixel face, {words} in the soft second
// ink, and "\n" for a line break. rich() turns it into HTML for set:html.

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const TOKEN = /\[([^\]]+)\]|\{([^}]+)\}|(\n)|([^[{\n]+)/g;

export function rich(text: string): string {
  let out = '';
  for (const m of text.matchAll(TOKEN)) {
    if (m[1]) out += `<span class="px">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="h-soft">${esc(m[2])}</span>`;
    else if (m[3]) out += '<br />';
    else out += esc(m[4]);
  }
  return out;
}
