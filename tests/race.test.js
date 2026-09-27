import test from 'node:test';
import assert from 'node:assert/strict';
import { createRace, stepRace, resultRace } from '../src/games/race/model.js';

const idle = { actionPressed: false };

test('todos os corredores usam a mesma sequência de obstáculos', () => {
  const state = createRace(7, 4);
  assert.equal(state.runners.length, 4);
  assert.ok(state.obstacles.length > 8);
  assert.equal(state.runners[0].progress, state.runners[3].progress);
});

test('salto sobe e depois aterrissa', () => {
  const state = createRace(7, 1);
  stepRace(state, [{ actionPressed: true }], 0.05);
  assert.ok(state.runners[0].height > 0);
  for (let i = 0; i < 25; i++) stepRace(state, [idle], 0.05);
  assert.equal(state.runners[0].height, 0);
});

test('colisão atrasa sem eliminar o corredor', () => {
  const state = createRace(7, 1);
  state.obstacles = [{ x: 5 }];
  stepRace(state, [idle], 0.05);
  const progress = state.runners[0].progress;
  stepRace(state, [idle], 0.05);
  assert.equal(state.runners[0].hits, 1);
  assert.equal(state.runners[0].progress, progress);
  assert.equal(state.status, 'playing');
});

test('salto evita obstáculo atravessado no ar', () => {
  const state = createRace(7, 1);
  state.runners[0].height = 80;
  state.obstacles = [{ x: 5 }];
  stepRace(state, [idle], 0.05);
  assert.equal(state.runners[0].hits, 0);
});

test('primeiro de quatro corredores a chegar vence', () => {
  const state = createRace(7, 4);
  state.runners[2].progress = state.distance - 3;
  stepRace(state, [idle, idle, idle, idle], 0.05);
  assert.equal(resultRace(state).winner, 2);
  assert.ok(resultRace(state).score > 0);
});
