import test from 'node:test';
import assert from 'node:assert/strict';
import { createPuzzles, stepPuzzles, resultPuzzles } from '../src/games/puzzles/model.js';

const idle = { left: false, right: false, actionPressed: false };

test('resposta correta no solo marca ponto e avança rodada', () => {
  const state = createPuzzles(3, 1);
  state.selections[0] = state.questions[0].correct;
  stepPuzzles(state, [{ ...idle, actionPressed: true }], 0.016);
  assert.equal(state.points[0], 1);
  assert.equal(state.round, 1);
});

test('resposta errada bloqueia apenas quem respondeu', () => {
  const state = createPuzzles(3, 2);
  state.selections[0] = (state.questions[0].correct + 1) % 4;
  stepPuzzles(state, [{ ...idle, actionPressed: true }, idle], 0.016);
  assert.equal(state.blocked[0], true);
  assert.equal(state.blocked[1], false);
  state.selections[1] = state.questions[0].correct;
  stepPuzzles(state, [idle, { ...idle, actionPressed: true }], 0.016);
  assert.equal(state.points[1], 1);
});

test('somente uma de quatro respostas corretas simultâneas marca ponto', () => {
  const state = createPuzzles(3, 4);
  state.selections.fill(state.questions[0].correct);
  stepPuzzles(state, Array.from({ length: 4 }, () => ({ ...idle, actionPressed: true })), 0.016);
  assert.equal(state.points.reduce((sum, points) => sum + points, 0), 1);
  assert.equal(state.round, 1);
});

test('tempo esgotado avança a pergunta e desbloqueia jogadores', () => {
  const state = createPuzzles(3, 2);
  state.blocked[0] = true;
  state.questionTime = 0.01;
  stepPuzzles(state, [idle, idle], 0.05);
  assert.equal(state.round, 1);
  assert.deepEqual(state.blocked, [false, false]);
});

test('maior pontuação vence e igualdade termina empatada', () => {
  const state = createPuzzles(3, 4);
  state.status = 'finished';
  state.points = [1, 3, 2, 0];
  assert.equal(resultPuzzles(state).winner, 1);
  state.points[2] = 3;
  assert.equal(resultPuzzles(state).winner, null);
});
