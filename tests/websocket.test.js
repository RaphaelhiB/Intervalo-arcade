import test from 'node:test';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
import { createHttpServer } from '../server/index.js';

function connect(url, options) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url, options);
    socket.once('open', () => resolve(socket));
    socket.once('error', reject);
  });
}

async function startServer(options) {
  const server = createHttpServer(options);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { server, url: `ws://127.0.0.1:${server.address().port}/ws` };
}

function messageOf(socket, type) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Sem mensagem ${type}`)), 3000);
    const receive = data => {
      const message = JSON.parse(data.toString());
      if (message.type !== type) return;
      clearTimeout(timeout);
      socket.off('message', receive);
      resolve(message);
    };
    socket.on('message', receive);
  });
}

test('quatro navegadores entram na mesma sala e recebem início sincronizado', async () => {
  const server = createHttpServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const sockets = [];
  try {
    const url = `ws://127.0.0.1:${server.address().port}/ws`;
    for (let i = 0; i < 4; i++) sockets.push(await connect(url));
    const created = messageOf(sockets[0], 'room');
    sockets[0].send(JSON.stringify({ type: 'create', gameId: 'arena' }));
    const { code } = await created;
    for (let i = 1; i < 4; i++) {
      const joined = messageOf(sockets[i], 'room');
      sockets[i].send(JSON.stringify({ type: 'join', code }));
      assert.equal((await joined).players, i + 1);
    }
    const starts = sockets.map(socket => messageOf(socket, 'start'));
    const states = sockets.map(socket => messageOf(socket, 'state'));
    sockets[0].send(JSON.stringify({ type: 'start' }));
    assert.equal((await Promise.all(starts)).length, 4);
    const snapshots = await Promise.all(states);
    assert.ok(snapshots.every(message => message.state.players.length === 4));
  } finally {
    sockets.forEach(socket => socket.terminate());
    await new Promise(resolve => server.close(resolve));
  }
});

test('quadro nulo retorna erro e o servidor continua atendendo', async () => {
  const { server, url } = await startServer();
  const host = await connect(url), guest = await connect(url);
  try {
    const created = messageOf(host, 'room');
    host.send(JSON.stringify({ type: 'create', gameId: 'arena' }));
    const { code } = await created;
    const joined = messageOf(guest, 'room');
    guest.send(JSON.stringify({ type: 'join', code }));
    await joined;
    const started = messageOf(host, 'start');
    host.send(JSON.stringify({ type: 'start' }));
    await started;
    const error = messageOf(host, 'error');
    host.send(JSON.stringify({ type: 'input', frame: null }));
    assert.match((await error).message, /inválida/);
    assert.equal(server.listening, true);
  } finally {
    host.terminate(); guest.terminate();
    await new Promise(resolve => server.close(resolve));
  }
});

test('quadro WebSocket excessivo fecha só a conexão inválida', async () => {
  const { server, url } = await startServer();
  const bad = await connect(url);
  bad.on('error', () => {});
  try {
    const closed = new Promise(resolve => bad.once('close', resolve));
    bad.send('x'.repeat(5000));
    await closed;
    assert.equal(server.listening, true);
    const next = await connect(url);
    const room = messageOf(next, 'room');
    next.send(JSON.stringify({ type: 'create', gameId: 'arena' }));
    assert.ok((await room).code);
    next.terminate();
  } finally {
    bad.terminate();
    await new Promise(resolve => server.close(resolve));
  }
});

test('conexão sem pong é removida e os demais recebem aviso', async () => {
  const { server, url } = await startServer({ heartbeatIntervalMs: 40 });
  const host = await connect(url), guest = await connect(url, { autoPong: false });
  try {
    const created = messageOf(host, 'room');
    host.send(JSON.stringify({ type: 'create', gameId: 'arena' }));
    const { code } = await created;
    const joined = messageOf(guest, 'room');
    guest.send(JSON.stringify({ type: 'join', code }));
    await joined;
    const closed = messageOf(host, 'closed');
    assert.match((await closed).reason, /saiu/);
    assert.equal(server.listening, true);
  } finally {
    host.terminate(); guest.terminate();
    await new Promise(resolve => server.close(resolve));
  }
});
