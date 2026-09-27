import test from 'node:test';
import assert from 'node:assert/strict';
import { frameDelta } from '../src/client/orientation.js';

test('partida solo congela o tempo no celular vertical e retoma sem salto', () => {
  assert.equal(frameDelta(1000, 1030, true), 0);
  assert.equal(frameDelta(1030, 1060, true), 0);
  assert.equal(frameDelta(1060, 1090, false), 0.03);
});
