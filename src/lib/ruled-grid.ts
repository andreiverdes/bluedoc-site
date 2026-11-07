// A complete grid drawn with hairline rules between its cells (.fill-grid.ruled in global.css): fillGrid's spans,
// plus which items end a row at each width, since those leave out their right rule (the rail draws that edge).
//
//   const styles = ruledGrid(items.length, [1, 2, 3]);
//   <ul class="fill-grid ruled">{items.map((x, i) => <li style={styles[i]}>…</li>)}</ul>
import { fillGrid, fillSpans } from './fill-grid';

type Columns = Parameters<typeof fillSpans>[1];

/** 1 for each item that ends its row, 0 for the rest. */
function rowEnds(spans: number[]): number[] {
  let used = 0;
  return spans.map((s) => {
    used = (used + s) % 12;
    return used === 0 ? 1 : 0;
  });
}

/** fillGrid's styles, each with `--e1`, `--e2`, `--e3`: 1 where the item ends a row at that width. */
export function ruledGrid(count: number, cols: [Columns, Columns, Columns]): string[] {
  const ends = cols.map((n) => rowEnds(fillSpans(count, n)));
  return fillGrid(count, cols).map((style, i) => `${style};--e1:${ends[0][i]};--e2:${ends[1][i]};--e3:${ends[2][i]}`);
}
