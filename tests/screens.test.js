import test from 'node:test';
import assert from 'node:assert/strict';
import { showGame, showMenu, showModes } from '../src/client/screens.js';

function screen() {
  return { innerHTML: '', querySelector(selector) { return selector === 'canvas' ? {} : null; } };
}

test('cada jogo apresenta apenas os comandos de toque necessários', () => {
  const expected = {
    arena: ['up', 'down', 'left', 'right', 'action'],
    puzzles: ['left', 'right', 'action'],
    race: ['action'],
    tower: ['up', 'down', 'left', 'right', 'action']
  };
  for (const [gameId, controls] of Object.entries(expected)) {
    const root = screen();
    showGame(root, gameId, 'solo');
    const actual = [...root.innerHTML.matchAll(/data-control="([a-z]+)"/g)].map(match => match[1]);
    assert.deepEqual(actual.sort(), [...controls].sort(), gameId);
    assert.match(root.innerHTML, /aria-label="Controles de toque"/);
  }
});

test('partida preserva o Canvas lógico e avisa para girar o celular', () => {
  const root = screen();
  showGame(root, 'arena', 'online', 1);
  assert.match(root.innerHTML, /canvas id="game-canvas" width="960" height="600"/);
  assert.match(root.innerHTML, /Gire o celular/);
  assert.match(root.innerHTML, /VOCÊ É P2/);
});

test('dupla no mesmo computador usa somente o teclado', () => {
  const root = screen();
  showGame(root, 'arena', 'local');
  assert.doesNotMatch(root.innerHTML, /data-control=/);
  assert.match(root.innerHTML, /DUPLA LOCAL/);
});

test('partida online identifica o modo para manter controles acessíveis na vertical', () => {
  const root = screen();
  showGame(root, 'race', 'online', 1);
  assert.match(root.innerHTML, /class="play-shell online-mode"/);
});

test('menu e escolha de modo explicam celular e orientação', () => {
  const root = screen();
  showMenu(root);
  assert.match(root.innerHTML, /CELULAR E PC/);
  showModes(root, 'race');
  assert.match(root.innerHTML, /horizontal/);
});
