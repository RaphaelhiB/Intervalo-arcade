function obstaclesFor(seed, distance) {
  let value = seed >>> 0;
  const random = () => { value = (Math.imul(1664525, value) + 1013904223) >>> 0; return value / 4294967296; };
  const obstacles = [];
  for (let x = 210; x < distance - 100; x += 190 + Math.floor(random() * 85)) obstacles.push({ x });
  return obstacles;
}

export function createRace(seed, playerCount) {
  const distance = 7200;
  return {
    distance, obstacles: obstaclesFor(seed, distance), elapsed: 0, status: 'playing', winner: null,
    runners: Array.from({ length: playerCount }, (_, id) => ({ id, progress: 0, height: 0, velocity: 0, stumble: 0, hits: 0, finishedAt: null }))
  };
}

export function stepRace(state, inputs, dt) {
  if (state.status !== 'playing') return state;
  const beforeTime = state.elapsed;
  state.elapsed += dt;
  for (const [index, runner] of state.runners.entries()) {
    if (runner.finishedAt != null) continue;
    const input = inputs[index] || {};
    if (input.actionPressed && runner.height === 0 && runner.stumble === 0) runner.velocity = 570;
    runner.velocity -= 1500 * dt;
    runner.height = Math.max(0, runner.height + runner.velocity * dt);
    if (runner.height === 0) runner.velocity = 0;
    if (runner.stumble > 0) { runner.stumble = Math.max(0, runner.stumble - dt); continue; }
    const previous = runner.progress;
    runner.progress = Math.min(state.distance, runner.progress + 140 * dt);
    const hit = state.obstacles.find(obstacle => previous < obstacle.x && runner.progress >= obstacle.x && runner.height < 35);
    if (hit) { runner.hits++; runner.stumble = 0.72; }
    if (runner.progress >= state.distance) {
      const fraction = (state.distance - previous) / (runner.progress - previous || 1);
      runner.finishedAt = beforeTime + dt * fraction;
    }
  }
  const finishers = state.runners.filter(runner => runner.finishedAt != null);
  if (finishers.length) {
    finishers.sort((a, b) => a.finishedAt - b.finishedAt);
    state.winner = finishers.length > 1 && Math.abs(finishers[0].finishedAt - finishers[1].finishedAt) < 0.001 ? null : finishers[0].id;
    state.status = 'finished';
  }
  return state;
}

export function resultRace(state) {
  if (state.status !== 'finished') return null;
  const best = Math.min(...state.runners.filter(runner => runner.finishedAt != null).map(runner => runner.finishedAt));
  return { finished: true, winner: state.winner, score: Number(best.toFixed(1)),
    label: state.runners.length === 1 ? 'Linha de chegada!' : state.winner == null ? 'Empate na chegada!' : `Jogador ${state.winner + 1} venceu!` };
}
