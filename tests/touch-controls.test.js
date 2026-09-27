import test from 'node:test';
import assert from 'node:assert/strict';
import { createTouchState, bindTouchControls } from '../src/client/touch-controls.js';

test('toque rápido entre quadros produz exatamente uma ação', () => {
  const touch = createTouchState();
  touch.press(1, 'action');
  touch.release(1);
  assert.equal(touch.frame().actionPressed, true);
  assert.equal(touch.frame().actionPressed, false);
});

test('segurar ação não repete actionPressed', () => {
  const touch = createTouchState();
  touch.press(1, 'action');
  assert.deepEqual([touch.frame().actionPressed, touch.frame().actionPressed], [true, false]);
  assert.equal(touch.frame().action, true);
});

test('dois dedos mantêm direção e ação independentes', () => {
  const touch = createTouchState();
  touch.press(1, 'left');
  touch.press(2, 'action');
  assert.equal(touch.frame().left, true);
  assert.equal(touch.frame().action, true);
  touch.release(1);
  assert.equal(touch.frame().left, false);
  assert.equal(touch.frame().action, true);
});

test('cancelamento e perda de foco soltam comandos retidos', () => {
  const root = new EventTarget();
  root.dataset = { control: 'action' };
  root.closest = () => root;
  root.setPointerCapture = () => {};
  const target = new EventTarget();
  const touch = createTouchState();
  bindTouchControls(root, touch, target);
  const pointer = (type, id) => {
    const event = new Event(type);
    Object.defineProperty(event, 'pointerId', { value: id });
    root.dispatchEvent(event);
  };
  pointer('pointerdown', 1);
  touch.frame();
  pointer('pointercancel', 1);
  assert.equal(touch.frame().action, false);
  pointer('pointerdown', 2);
  target.dispatchEvent(new Event('blur'));
  assert.equal(touch.frame().action, false);
});
