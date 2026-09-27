import { makeFrame } from '../shared/input.js';

const MAPS = [
  { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', action: 'Space' },
  { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', action: 'Enter' }
];

export function frameForKeys(keys, previousKeys, playerIndex = 0) {
  const map = MAPS[playerIndex];
  if (!map) throw new Error('Jogador local inválido');
  const read = source => Object.fromEntries(
    Object.entries(map).map(([action, code]) => [action, source.has(code)])
  );
  return makeFrame(read(keys), read(previousKeys));
}

export function createKeyboard(target = window) {
  const keys = new Set();
  let previous = new Set();
  const prevent = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
  target.addEventListener('keydown', event => {
    if (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
    if (prevent.has(event.code)) event.preventDefault();
    keys.add(event.code);
  });
  target.addEventListener('keyup', event => keys.delete(event.code));
  target.addEventListener('blur', () => keys.clear());
  return {
    frames(count) {
      const frames = Array.from({ length: count }, (_, index) => frameForKeys(keys, previous, index));
      previous = new Set(keys);
      return frames;
    },
    reset() { keys.clear(); previous.clear(); }
  };
}
