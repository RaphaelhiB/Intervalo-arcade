export function makeFrame(held = {}, previous = {}) {
  return {
    up: Boolean(held.up),
    down: Boolean(held.down),
    left: Boolean(held.left),
    right: Boolean(held.right),
    action: Boolean(held.action),
    actionPressed: Boolean(held.action) && !Boolean(previous.action)
  };
}

export const IDLE_FRAME = Object.freeze(makeFrame());

export function mergeFrames(first, second) {
  return Object.fromEntries(Object.keys(IDLE_FRAME).map(key => [key, Boolean(first?.[key] || second?.[key])]));
}
