// Tagged template for markup: interpolated strings are escaped, arrays are joined, raw() passes markup through.

const RAW = Symbol('raw');
export type Raw = { [RAW]: string };
type Value = string | number | boolean | null | undefined | Raw | Value[];

const str = (v: Value): string =>
  v == null || v === false
    ? ''
    : Array.isArray(v)
      ? v.map(str).join('')
      : typeof v === 'object'
        ? v[RAW]
        : String(v).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const raw = (s: string): Raw => ({ [RAW]: s });

export function html(parts: TemplateStringsArray, ...values: Value[]): Raw {
  return raw(parts.reduce((out, p, i) => out + p + (i < values.length ? str(values[i]) : ''), ''));
}

/** Replace the page's markup: the entry modules call it on load and again on each hot update. */
export function mount(view: Raw[]) {
  document.getElementById('app')!.innerHTML = view.map((v) => v[RAW]).join('');
}
