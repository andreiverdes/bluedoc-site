// Complete grids: a card grid never ends on a half-empty row. The grid has 12 tracks (.fill-grid in global.css) and
// each item spans 12 / columns of them; when the items don't fill the last row, the last ones widen to fill it.
// A lone item left over joins the row before: 2 columns lay the last 3 as one row of 3, 3 columns the last 4 as two
// rows of 2, 4 columns the last 5 as 3 + 2.
//
//   const spans = fillGrid(items.length, [1, 2, 3]);   // columns below 720 px, from 720 px, from 1080 px
//   items.map((x, i) => <li style={spans[i]}>…</li>)

type Columns = 1 | 2 | 3 | 4;

/** Each item's span, out of 12 tracks, for `cols` columns. */
function fillSpans(count: number, cols: Columns): number[] {
  const spans = Array<number>(count).fill(12 / cols);
  const r = count % cols;
  if (r === 0 || count === 0) return spans;
  if (r > 1 || count === 1) {
    // the short last row, shared out evenly
    for (let i = count - r; i < count; i++) spans[i] = Math.floor(12 / r);
    return spans;
  }
  // one left over: the last cols + 1 items become two even rows (or one row of 3 for two columns)
  const tail = cols + 1;
  const rows = cols === 2 ? [3] : [Math.ceil(tail / 2), Math.floor(tail / 2)];
  let i = count - tail;
  for (const n of rows) for (let k = 0; k < n; k++) spans[i++] = 12 / n;
  return spans;
}

/** Inline styles (`--f1`, `--f2`, `--f3`) giving each item its span at the three widths .fill-grid knows. */
export function fillGrid(count: number, cols: [Columns, Columns, Columns]): string[] {
  const [a, b, c] = cols.map((n) => fillSpans(count, n));
  return Array.from({ length: count }, (_, i) => `--f1:${a[i]};--f2:${b[i]};--f3:${c[i]}`);
}
