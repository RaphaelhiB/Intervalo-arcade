import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };

async function serve(request, response) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400).end(); return; }
  let file;
  if (pathname === '/') {
    file = resolve(root, 'public/index.html');
  } else if (pathname.startsWith('/src/')) {
    file = resolve(root, `.${pathname}`);
    if (!file.startsWith(resolve(root, 'src') + sep)) file = null;
  } else if (pathname.startsWith('/public/')) {
    file = resolve(root, `.${pathname}`);
    if (!file.startsWith(resolve(root, 'public') + sep)) file = null;
  }
  if (!file) { response.writeHead(404).end('Não encontrado'); return; }
  try {
    const data = await readFile(file);
    response.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' });
    response.end(data);
  } catch {
    response.writeHead(404).end('Não encontrado');
  }
}

export function createHttpServer() {
  return createServer(serve);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 3000;
  createHttpServer().listen(port, '0.0.0.0', () => console.log(`Intervalo Arcade: http://localhost:${port}`));
}
