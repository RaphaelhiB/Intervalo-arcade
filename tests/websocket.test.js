import test from 'node:test';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
import { createHttpServer } from '../server/index.js';

function connect(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    socket.once('open', () => resolve(socket));
    socket.once('error', reject);
  });
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
