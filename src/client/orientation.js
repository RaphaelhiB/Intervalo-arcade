export function frameDelta(lastTime, now, paused) {
  return paused ? 0 : Math.min(0.05, (now - lastTime) / 1000);
}
