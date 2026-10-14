// Short copy with `code` spans, as HTML: the text escaped, each backtick pair a <code>. For set:html.
export function inlineCode(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// Short copy with `code`, **bold** and [links](url), as HTML: the text escaped first. External links open as usual,
// with rel=noopener. For set:html.
export function inlineMd(text: string): string {
  return inlineCode(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => `<a href="${href}"${href.startsWith('http') ? ' rel="noopener"' : ''}>${label}</a>`);
}
