export const SLOTS = [
  { x: 150, y: 165 }, { x: 365, y: 165 }, { x: 580, y: 165 }, { x: 795, y: 165 },
  { x: 150, y: 435 }, { x: 365, y: 435 }, { x: 580, y: 435 }, { x: 795, y: 435 }
];

export function createTower(seed, playerCount) {
  return {
    seed, playerCount, towers: Array(SLOTS.length).fill(null),
    cursors: Array.from({ length: playerCount }, (_, index) => index),
    navCooldown: Array(playerCount).fill(0), resources: 120, baseHp: 10,
    enemies: [], nextEnemyId: 1, wave: 1, spawnRemaining: 6, spawnTimer: 0,
    wavePause: null, status: 'playing', won: false, elapsed: 0
  };
}

function moveCursor(index, input) {
  let row = Math.floor(index / 4);
  let col = index % 4;
  if (input.left) col = Math.max(0, col - 1);
  else if (input.right) col = Math.min(3, col + 1);
  else if (input.up) row = 0;
  else if (input.down) row = 1;
  return row * 4 + col;
}

export function stepTower(state, inputs, dt) {
  if (state.status !== 'playing') return state;
  state.elapsed += dt;
  for (let index = 0; index < state.playerCount; index++) {
    const input = inputs[index] || {};
    state.navCooldown[index] = Math.max(0, state.navCooldown[index] - dt);
    if (state.navCooldown[index] === 0 && (input.up || input.down || input.left || input.right)) {
      state.cursors[index] = moveCursor(state.cursors[index], input);
      state.navCooldown[index] = 0.16;
    }
    if (!input.actionPressed) continue;
    const slot = state.cursors[index];
    const tower = state.towers[slot];
    if (!tower && state.resources >= 40) {
      state.towers[slot] = { level: 1, cooldown: 0 };
      state.resources -= 40;
    } else if (tower && tower.level < 3 && state.resources >= 50 * tower.level) {
      state.resources -= 50 * tower.level;
      tower.level++;
    }
  }
  if (state.spawnRemaining > 0) {
    state.spawnTimer += dt;
    if (state.spawnTimer >= 1.15) {
      state.spawnTimer -= 1.15;
      state.spawnRemaining--;
      state.enemies.push({ id: state.nextEnemyId++, x: -15, hp: 1 + Math.floor((state.wave - 1) / 2), speed: 55 + state.wave * 5 });
    }
  }
  for (const enemy of state.enemies) enemy.x += enemy.speed * dt;
  const reached = state.enemies.filter(enemy => enemy.x >= 960).length;
  if (reached) state.baseHp = Math.max(0, state.baseHp - reached);
  state.enemies = state.enemies.filter(enemy => enemy.x < 960);
  if (state.baseHp <= 0) { state.status = 'finished'; return state; }
  state.towers.forEach((tower, slot) => {
    if (!tower) return;
    tower.cooldown = Math.max(0, tower.cooldown - dt);
    if (tower.cooldown > 0) return;
    const target = state.enemies.filter(enemy => enemy.hp > 0 && Math.abs(enemy.x - SLOTS[slot].x) < 170)
      .sort((a, b) => b.x - a.x)[0];
    if (target) {
      target.hp -= tower.level;
      tower.cooldown = 0.72 / (1 + (tower.level - 1) * 0.25);
    }
  });
  const defeated = state.enemies.filter(enemy => enemy.hp <= 0).length;
  state.resources += defeated * 12;
  state.enemies = state.enemies.filter(enemy => enemy.hp > 0);
  if (state.spawnRemaining === 0 && state.enemies.length === 0) {
    if (state.wave >= 6) {
      state.status = 'finished'; state.won = true;
    } else if (state.wavePause == null) {
      state.wavePause = 6;
    } else {
      state.wavePause -= dt;
      if (state.wavePause <= 0) {
        state.wave++;
        state.spawnRemaining = 6 + (state.wave - 1) * 2;
        state.spawnTimer = 0;
        state.wavePause = null;
      }
    }
  }
  return state;
}

export function resultTower(state) {
  if (state.status !== 'finished') return null;
  return { finished: true, winner: null, score: state.baseHp * 10,
    label: state.won ? 'Base protegida!' : 'A base caiu' };
}
