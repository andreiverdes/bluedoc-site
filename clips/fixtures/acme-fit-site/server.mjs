// The Acme Fit fixture site's dev server: Vite with hot module replacement.
//
//   node clips/fixtures/acme-fit-site/server.mjs [port] [root]   # serve root (default: this folder) on port
//                                                                # (default: the first free one from 5173)
//
// The website clips start it through fixture.mjs, in a temp copy of the site.
import { createServer as netServer } from 'node:net';
import { fileURLToPath } from 'node:url';

// the bluedoc site's own dev server, and bluedoc's default port
const TAKEN = new Set([4321, 8740]);

function portFree(port) {
  return new Promise((ok) => {
    const s = netServer();
    s.once('error', () => ok(false));
    s.listen(port, '127.0.0.1', () => s.close(() => ok(true)));
  });
}

/** The first free port from 5173 on (a Vite dev server's usual address), skipping 4321 and 8740. */
export async function pickPort(from = 5173) {
  for (let p = from; p < from + 200; p++) if (!TAKEN.has(p) && (await portFree(p))) return p;
  throw new Error('no free port for the fixture site');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2]) || (await pickPort());
  const { createServer } = await import('vite');
  const server = await createServer({
    configFile: false,
    root: process.argv[3] || import.meta.dirname,
    logLevel: 'warn',
    clearScreen: false,
    server: { host: '127.0.0.1', port, strictPort: true },
  });
  await server.listen();
  console.log(`Acme Fit at http://localhost:${port}/ (blog: /blog/)`);
  // started by fixture.mjs: go when the harness goes, even if it never got to stop it
  const parent = process.ppid;
  if (process.argv[3]) setInterval(() => process.ppid !== parent && process.exit(0), 1000);
}
