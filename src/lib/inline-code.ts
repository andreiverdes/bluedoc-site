// Short copy with `code` spans, as HTML: the text escaped, each backtick pair a <code>. For set:html.
export function inlineCode(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}
