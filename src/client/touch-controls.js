import { makeFrame } from '../shared/input.js';

const CONTROLS = new Set(['up', 'down', 'left', 'right', 'action']);

export function createTouchState(now = () => performance.now()) {
  const pointers = new Map();
  const linger = new Map();
  let actionPressed = false;
  const held = control => [...pointers.values()].some(pointer => pointer.control === control);
  return {
    press(pointerId, control) {
      if (!CONTROLS.has(control) || pointers.has(pointerId)) return;
      if (control === 'action' && !held('action')) actionPressed = true;
      pointers.set(pointerId, { control, startedAt: now() });
    },
    release(pointerId, cancelled = false) {
      const pointer = pointers.get(pointerId);
      if (!pointer) return;
      pointers.delete(pointerId);
      if (pointer.control === 'action') {
        if (cancelled && !held('action')) actionPressed = false;
      } else {
        if (cancelled) linger.delete(pointer.control);
        else linger.set(pointer.control, Math.max(linger.get(pointer.control) || 0, pointer.startedAt + 90));
      }
    },
    frame() {
      const frame = makeFrame(Object.fromEntries([...CONTROLS].map(control => [control, held(control) || (control !== 'action' && now() < (linger.get(control) || 0))])));
      frame.actionPressed = actionPressed;
      actionPressed = false;
      return frame;
    },
    reset() { pointers.clear(); linger.clear(); actionPressed = false; }
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
    root.addEventListener(type, event => state.release(event.pointerId, type !== 'pointerup'));
  }
  target.addEventListener('blur', () => state.reset());
  target.document?.addEventListener('visibilitychange', () => {
    if (target.document.hidden) state.reset();
  });
}
