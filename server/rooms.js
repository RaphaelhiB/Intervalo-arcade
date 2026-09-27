import { randomInt } from 'node:crypto';
import './games.js';
import { createGame, stepGame, resultOf } from '../src/shared/game.js';
import { IDLE_FRAME } from '../src/shared/input.js';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const GAME_IDS = new Set(['arena', 'puzzles', 'race', 'tower']);

function codeFor(rooms) {
  let code;
  do { code = Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join(''); }
  while (rooms.has(code));
  return code;
}

function cleanFrame(frame = {}) {
  return {
    up: frame.up === true, down: frame.down === true,
    left: frame.left === true, right: frame.right === true,
    action: frame.action === true, actionPressed: frame.actionPressed === true
  };
}

export class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.clients = new Map();
  }

  send(client, message) {
    try { client.send(JSON.stringify(message)); } catch { /* socket already closed */ }
  }

  broadcast(room, message) {
    room.players.forEach(client => this.send(client, message));
  }

  announceRoom(room) {
    room.players.forEach((client, playerIndex) => this.send(client, {
      type: 'room', code: room.code, gameId: room.gameId, playerIndex,
      players: room.players.length, host: playerIndex === 0, started: room.started
    }));
  }

  create(client, gameId) {
    if (this.clients.has(client)) { this.send(client, { type: 'error', message: 'Você já está em uma sala.' }); return null; }
    if (!GAME_IDS.has(gameId)) { this.send(client, { type: 'error', message: 'Jogo inválido.' }); return null; }
    const room = { code: codeFor(this.rooms), gameId, players: [client], started: false,
      state: null, inputs: [], sequence: 0 };
    this.rooms.set(room.code, room);
    this.clients.set(client, room);
    this.announceRoom(room);
    return room;
  }

  join(client, rawCode) {
    if (this.clients.has(client)) { this.send(client, { type: 'error', message: 'Você já está em uma sala.' }); return null; }
    const code = String(rawCode || '').trim().toUpperCase();
    const room = this.rooms.get(code);
    if (!room) { this.send(client, { type: 'error', message: 'Código de sala inválido.' }); return null; }
    if (room.started) { this.send(client, { type: 'error', message: 'A partida já começou.' }); return null; }
    if (room.players.length >= 4) { this.send(client, { type: 'error', message: 'A sala está cheia.' }); return null; }
    room.players.push(client);
    this.clients.set(client, room);
    this.announceRoom(room);
    return room;
  }

  start(client) {
    const room = this.clients.get(client);
    if (!room) { this.send(client, { type: 'error', message: 'Você não está em uma sala.' }); return; }
    if (room.players[0] !== client) { this.send(client, { type: 'error', message: 'Só o criador pode iniciar.' }); return; }
    if (room.started) { this.send(client, { type: 'error', message: 'A partida já começou.' }); return; }
    if (room.players.length < 2) { this.send(client, { type: 'error', message: 'Espere pelo menos mais um jogador.' }); return; }
    room.state = createGame(room.gameId, randomInt(1, 2 ** 30), room.players.length);
    room.inputs = room.players.map(() => ({ ...IDLE_FRAME }));
    room.sequence = 0;
    room.started = true;
    this.broadcast(room, { type: 'start', gameId: room.gameId });
    this.broadcast(room, { type: 'state', state: room.state });
  }

  input(client, frame) {
    const room = this.clients.get(client);
    if (!room) { this.send(client, { type: 'error', message: 'Você não está em uma sala.' }); return; }
    if (!room.started) { this.send(client, { type: 'error', message: 'A partida não está em andamento.' }); return; }
    const index = room.players.indexOf(client);
    if (index < 0) return;
    const incoming = cleanFrame(frame);
    const previous = room.inputs[index];
    const pending = previous.actionPressed || incoming.actionPressed;
    room.inputs[index] = { ...incoming, actionPressed: pending,
      sequence: incoming.actionPressed && !previous.actionPressed ? ++room.sequence : previous.sequence };
  }

  tickAll(dt = 1 / 30) {
    for (const room of this.rooms.values()) {
      if (!room.started) continue;
      room.state = stepGame(room.gameId, room.state, room.inputs, dt);
      room.inputs = room.inputs.map(frame => ({ ...frame, actionPressed: false, sequence: undefined }));
      this.broadcast(room, { type: 'state', state: room.state });
      const result = resultOf(room.gameId, room.state);
      if (result?.finished) {
        room.started = false;
        this.broadcast(room, { type: 'result', result });
      }
    }
  }

  leave(client) {
    const room = this.clients.get(client);
    if (!room) return;
    this.rooms.delete(room.code);
    room.players.forEach(player => this.clients.delete(player));
    room.players.filter(player => player !== client).forEach(player =>
      this.send(player, { type: 'closed', reason: 'Um jogador saiu da sala.' }));
  }
}
