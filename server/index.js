import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { RoomManager } from './rooms.js';

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

export function createHttpServer({ heartbeatIntervalMs = 30000 } = {}) {
  const server = createServer(serve);
  const rooms = new RoomManager();
  const sockets = new WebSocketServer({ noServer: true, maxPayload: 4096 });
  let timer;
  let heartbeat;
  server.on('upgrade', (request, socket, head) => {
    if (request.url !== '/ws') { socket.destroy(); return; }
    sockets.handleUpgrade(request, socket, head, client => sockets.emit('connection', client));
  });
  sockets.on('connection', client => {
    client.isAlive = true;
    client.on('pong', () => { client.isAlive = true; });
    client.on('message', data => {
      let message;
      try { message = JSON.parse(data.toString()); }
      catch { rooms.send(client, { type: 'error', message: 'Mensagem inválida.' }); return; }
      if (!message || typeof message !== 'object') { rooms.send(client, { type: 'error', message: 'Mensagem inválida.' }); return; }
      switch (message.type) {
        case 'create': rooms.create(client, message.gameId); break;
        case 'join': rooms.join(client, message.code); break;
        case 'start': rooms.start(client); break;
        case 'input': rooms.input(client, message.frame); break;
        default: rooms.send(client, { type: 'error', message: 'Ação desconhecida.' });
      }
    });
    client.on('close', () => rooms.leave(client));
    client.on('error', () => { rooms.leave(client); client.terminate(); });
  });
  server.on('listening', () => {
    timer = setInterval(() => rooms.tickAll(1 / 30), 1000 / 30);
    heartbeat = setInterval(() => {
      for (const client of sockets.clients) {
        if (!client.isAlive) {
          rooms.leave(client);
          client.terminate();
          continue;
        }
        client.isAlive = false;
        client.ping();
      }
    }, heartbeatIntervalMs);
  });
  server.on('close', () => { clearInterval(timer); clearInterval(heartbeat); sockets.close(); });
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 3000;
  createHttpServer().listen(port, '0.0.0.0', () => console.log(`Intervalo Arcade: http://localhost:${port}`));
}
