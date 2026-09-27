import test from 'node:test';
import assert from 'node:assert/strict';
import { createTower, stepTower, resultTower } from '../src/games/tower/model.js';

const idle = { up: false, down: false, left: false, right: false, actionPressed: false };

test('construir e melhorar torre consome recursos compartilhados', () => {
  const state = createTower(1, 2);
  stepTower(state, [{ ...idle, actionPressed: true }, idle], 0.016);
  assert.equal(state.towers[0].level, 1);
  assert.equal(state.resources, 80);
  stepTower(state, [{ ...idle, actionPressed: true }, idle], 0.016);
  assert.equal(state.towers[0].level, 2);
  assert.equal(state.resources, 30);
});

test('dois jogadores usam a mesma reserva de recursos', () => {
  const state = createTower(1, 2);
  state.cursors[1] = 1;
  stepTower(state, [{ ...idle, actionPressed: true }, { ...idle, actionPressed: true }], 0.016);
  assert.equal(state.towers.filter(Boolean).length, 2);
  assert.equal(state.resources, 40);
});

test('recursos insuficientes impedem uma compra', () => {
  const state = createTower(1, 1);
  state.resources = 10;
  stepTower(state, [{ ...idle, actionPressed: true }], 0.016);
  assert.equal(state.towers[0], null);
  assert.equal(state.resources, 10);
});

test('torre elimina inimigo próximo e concede recursos', () => {
  const state = createTower(1, 1);
  state.towers[0] = { level: 1, cooldown: 0 };
  state.enemies.push({ id: 1, x: 180, hp: 1, speed: 0 });
  stepTower(state, [idle], 0.05);
  assert.equal(state.enemies.length, 0);
  assert.equal(state.resources, 132);
});

test('inimigo que chega à base reduz sua vida', () => {
  const state = createTower(1, 1);
  state.enemies.push({ id: 1, x: 958, hp: 1, speed: 200 });
  stepTower(state, [idle], 0.05);
  assert.equal(state.baseHp, 9);
  assert.equal(state.enemies.length, 0);
});

test('última onda vencida conclui a defesa', () => {
  const state = createTower(1, 1);
  state.wave = 6;
  state.spawnRemaining = 0;
  state.enemies = [];
  stepTower(state, [idle], 0.05);
  assert.equal(resultTower(state).finished, true);
  assert.match(resultTower(state).label, /protegida/);
});
