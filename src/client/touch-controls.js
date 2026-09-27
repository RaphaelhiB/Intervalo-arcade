import { makeFrame } from '../shared/input.js';

const CONTROLS = new Set(['up', 'down', 'left', 'right', 'action']);

export function createTouchState() {
  const pointers = new Map();
  let actionPressed = false;
  const held = control => [...pointers.values()].includes(control);
  return {
    press(pointerId, control) {
      if (!CONTROLS.has(control) || pointers.has(pointerId)) return;
      if (control === 'action' && !held('action')) actionPressed = true;
      pointers.set(pointerId, control);
    },
    release(pointerId) { pointers.delete(pointerId); },
    frame() {
      const frame = makeFrame(Object.fromEntries([...CONTROLS].map(control => [control, held(control)])));
      frame.actionPressed = actionPressed;
      actionPressed = false;
      return frame;
    },
    reset() { pointers.clear(); actionPressed = false; }
  };
}

export function bindTouchControls(root, state, target = window) {
  root.addEventListener('pointerdown', event => {
    const button = event.target.closest?.('[data-control]');
    if (!button || !CONTROLS.has(button.dataset.control)) return;
    event.preventDefault();
    state.press(event.pointerId, button.dataset.control);
    button.setPointerCapture?.(event.pointerId);
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    root.addEventListener(type, event => state.release(event.pointerId));
  }
  target.addEventListener('blur', () => state.reset());
  target.document?.addEventListener('visibilitychange', () => {
    if (target.document.hidden) state.reset();
  });
}
