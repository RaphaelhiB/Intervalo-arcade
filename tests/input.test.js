import test from 'node:test';
import assert from 'node:assert/strict';
import { makeFrame, mergeFrames } from '../src/shared/input.js';
import { frameForKeys, createKeyboard, createInputSource } from '../src/client/controls.js';
import { createTouchState } from '../src/client/touch-controls.js';

test('segurar ação só produz actionPressed no primeiro quadro', () => {
  const first = makeFrame({ action: true }, {});
  const held = makeFrame({ action: true }, { action: true });
  const again = makeFrame({ action: true }, { action: false });
  assert.equal(first.actionPressed, true);
  assert.equal(held.actionPressed, false);
  assert.equal(again.actionPressed, true);
});

test('quadro de entrada normaliza direções ausentes', () => {
  assert.deepEqual(makeFrame({ left: true }, {}), {
    up: false, down: false, left: true, right: false,
    action: false, actionPressed: false
  });
});

test('controles locais separam as teclas dos dois jogadores', () => {
  const keys = new Set(['KeyW', 'Space', 'ArrowLeft', 'Enter']);
  assert.deepEqual(frameForKeys(keys, new Set(), 0), {
    up: true, down: false, left: false, right: false,
    action: true, actionPressed: true
  });
  assert.deepEqual(frameForKeys(keys, new Set(), 1), {
    up: false, down: false, left: true, right: false,
    action: true, actionPressed: true
  });
});

test('toque rápido entre quadros ainda produz uma ação', () => {
  const target = new EventTarget();
  const keyboard = createKeyboard(target);
  const press = type => {
    const event = new Event(type);
    Object.defineProperty(event, 'code', { value: 'Space' });
    target.dispatchEvent(event);
  };
  press('keydown');
  press('keyup');
  assert.equal(keyboard.frames(1)[0].actionPressed, true);
  assert.equal(keyboard.frames(1)[0].actionPressed, false);
});

test('teclado e toque combinam direções e ação sem perda', () => {
  const keyboard = makeFrame({ up: true }, {});
  const touch = makeFrame({ right: true, action: true }, {});
  assert.deepEqual(mergeFrames(keyboard, touch), {
    up: true, down: false, left: false, right: true,
    action: true, actionPressed: true
  });
});

test('entrada unificada consome toque rápido uma vez e limpa ao sair', () => {
  const keyboard = createKeyboard(new EventTarget());
  const touch = createTouchState();
  const input = createInputSource(keyboard, touch);
  touch.press(1, 'action');
  touch.release(1);
  assert.equal(input.frames(1)[0].actionPressed, true);
  assert.equal(input.frames(1)[0].actionPressed, false);
  touch.press(2, 'left');
  input.reset();
  assert.equal(input.frames(1)[0].left, false);
});

test('dupla local mantém entradas de teclado separadas', () => {
  const target = new EventTarget();
  const keyboard = createKeyboard(target);
  const touch = createTouchState();
  const input = createInputSource(keyboard, touch);
  touch.press(1, 'action');
  const frames = input.frames(2);
  assert.equal(frames.length, 2);
  assert.equal(frames[0].actionPressed, false);
  assert.equal(frames[1].actionPressed, false);
});
