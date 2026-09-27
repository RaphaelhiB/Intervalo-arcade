import test from 'node:test';
import assert from 'node:assert/strict';
import { createArena, stepArena, resultArena } from '../src/games/arena/model.js';

const idle = { up: false, down: false, left: false, right: false, action: false, actionPressed: false };

test('arena cria até quatro jogadores e aumenta a frequência dos inimigos', () => {
  const solo = createArena(1, 1);
  const group = createArena(1, 4);
  assert.equal(group.players.length, 4);
  assert.ok(group.spawnInterval < solo.spawnInterval);
});

test('jogador não atravessa a borda da arena', () => {
  const state = createArena(1, 1);
  state.players[0].x = 25;
  state.players[0].y = 25;
  stepArena(state, [{ ...idle, up: true, left: true }], 0.05);
  assert.ok(state.players[0].x >= 24);
  assert.ok(state.players[0].y >= 24);
});

test('ataque próximo elimina inimigo e soma pontos', () => {
  const state = createArena(1, 1);
  const player = state.players[0];
  state.enemies.push({ id: 1, x: player.x + 35, y: player.y, hp: 1, speed: 0 });
  stepArena(state, [{ ...idle, actionPressed: true }], 0.016);
  assert.equal(state.enemies.length, 0);
  assert.equal(state.score, 10);
});

test('dano próximo respeita invulnerabilidade temporária', () => {
  const state = createArena(1, 1);
  const player = state.players[0];
  state.enemies.push({ id: 1, x: player.x, y: player.y, hp: 1, speed: 0 });
  stepArena(state, [idle], 0.016);
  stepArena(state, [idle], 0.016);
  assert.equal(player.hp, 4);
});

test('arena termina por tempo ou por perda de todas as vidas', () => {
  const timed = createArena(1, 1);
  timed.timeRemaining = 0.01;
  stepArena(timed, [idle], 0.05);
  assert.equal(resultArena(timed).finished, true);
  const defeated = createArena(1, 2);
  defeated.players.forEach(player => { player.hp = 0; });
  stepArena(defeated, [idle, idle], 0.016);
  assert.match(resultArena(defeated).label, /Fim/);
});
