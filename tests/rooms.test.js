import test from 'node:test';
import assert from 'node:assert/strict';
import { RoomManager } from '../server/rooms.js';

function client() {
  return { messages: [], send(value) { this.messages.push(JSON.parse(value)); } };
}
function last(client, type) { return client.messages.filter(message => message.type === type).at(-1); }

test('sala aceita dois, três e quatro participantes e rejeita o quinto', () => {
  const manager = new RoomManager();
  const players = Array.from({ length: 5 }, client);
  const room = manager.create(players[0], 'arena');
  players.slice(1, 4).forEach(player => manager.join(player, room.code));
  assert.equal(room.players.length, 4);
  assert.equal(last(players[0], 'room').players, 4);
  manager.join(players[4], room.code);
  assert.match(last(players[4], 'error').message, /cheia/);
  assert.equal(room.players.length, 4);
});

test('código inválido e entrada repetida não alteram a sala', () => {
  const manager = new RoomManager();
  const host = client();
  const room = manager.create(host, 'race');
  manager.join(client(), 'XXXXXX');
  manager.join(host, room.code);
  assert.equal(room.players.length, 1);
  assert.match(last(host, 'error').message, /já está/);
});

test('só o criador inicia com ao menos dois jogadores', () => {
  const manager = new RoomManager();
  const host = client(), guest = client();
  const room = manager.create(host, 'tower');
  manager.start(host);
  assert.equal(room.started, false);
  manager.join(guest, room.code);
  manager.start(guest);
  assert.equal(room.started, false);
  manager.start(host);
  assert.equal(room.started, true);
  assert.equal(room.state.playerCount, 2);
  assert.equal(last(guest, 'start').gameId, 'tower');
});

test('entrada de ação é atribuída ao jogador certo e consumida uma vez', () => {
  const manager = new RoomManager();
  const host = client(), guest = client(), stranger = client();
  const room = manager.create(host, 'tower');
  manager.join(guest, room.code);
  manager.start(host);
  manager.input(stranger, { actionPressed: true });
  assert.match(last(stranger, 'error').message, /sala/);
  manager.input(guest, { actionPressed: true });
  manager.tickAll(0.03);
  assert.equal(room.state.towers[1].level, 1);
  assert.equal(room.state.resources, 80);
  manager.tickAll(0.03);
  assert.equal(room.state.towers[1].level, 1);
});

test('primeiro enigma correto recebido marca o único ponto', () => {
  const manager = new RoomManager();
  const host = client(), guest = client();
  const room = manager.create(host, 'puzzles');
  manager.join(guest, room.code);
  manager.start(host);
  room.state.selections.fill(room.state.questions[0].correct);
  manager.input(guest, { round: room.state.round, actionPressed: true });
  manager.input(host, { round: room.state.round, actionPressed: true });
  manager.tickAll(0.03);
  assert.deepEqual(room.state.points, [0, 1]);
});

test('resposta atrasada de um enigma não pontua na pergunta seguinte', () => {
  const manager = new RoomManager();
  const host = client(), guest = client();
  const room = manager.create(host, 'puzzles');
  manager.join(guest, room.code);
  manager.start(host);
  room.state.selections.fill(room.state.questions[0].correct);
  manager.input(host, { round: 0, actionPressed: true });
  manager.tickAll(0.03);
  assert.equal(room.state.round, 1);
  room.state.selections[1] = room.state.questions[1].correct;
  manager.input(guest, { round: 0, actionPressed: true });
  manager.tickAll(0.03);
  assert.deepEqual(room.state.points, [1, 0]);
  assert.equal(room.state.round, 1);
});

test('entrada nula recebe erro sem derrubar a sala', () => {
  const manager = new RoomManager();
  const host = client(), guest = client();
  const room = manager.create(host, 'arena');
  manager.join(guest, room.code);
  manager.start(host);
  manager.input(host, null);
  assert.match(last(host, 'error').message, /inválida/);
  assert.equal(room.started, true);
});

test('desconexão encerra a sala para todos', () => {
  const manager = new RoomManager();
  const players = Array.from({ length: 4 }, client);
  const room = manager.create(players[0], 'arena');
  players.slice(1).forEach(player => manager.join(player, room.code));
  manager.start(players[0]);
  manager.leave(players[2]);
  assert.equal(manager.rooms.has(room.code), false);
  assert.equal(last(players[0], 'closed').reason, 'Um jogador saiu da sala.');
});

test('ações após o fim não alteram a partida', () => {
  const manager = new RoomManager();
  const host = client(), guest = client();
  const room = manager.create(host, 'tower');
  manager.join(guest, room.code);
  manager.start(host);
  room.state.status = 'finished';
  manager.tickAll(0.03);
  const resources = room.state.resources;
  manager.input(host, { actionPressed: true });
  manager.tickAll(0.03);
  assert.equal(room.state.resources, resources);
});
