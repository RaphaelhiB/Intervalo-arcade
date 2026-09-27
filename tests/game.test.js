import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, stepGame, resultOf, registerGame } from '../src/shared/game.js';

test('jogo desconhecido gera erro controlado', () => {
  assert.throws(() => createGame('inexistente', 1, 1), /Jogo desconhecido/);
});

test('resultado final não aceita mais entradas', () => {
  registerGame('finished-test', {
    create: () => ({ status: 'finished', score: 7 }),
    step: state => ({ ...state, score: 99 }),
    result: state => ({ finished: true, winner: 0, score: state.score })
  });
  const state = createGame('finished-test', 1, 1);
  assert.equal(stepGame('finished-test', state, [{ actionPressed: true }], 0.016), state);
  assert.deepEqual(resultOf('finished-test', state), { finished: true, winner: 0, score: 7 });
});
