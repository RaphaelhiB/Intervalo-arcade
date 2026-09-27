const WIDTH = 960;
const HEIGHT = 600;
const COLORS = ['#bdff6e', '#66ddeb', '#be9aff', '#ffb37e'];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function random(state) {
  state.seed = (Math.imul(1664525, state.seed) + 1013904223) >>> 0;
  return state.seed / 4294967296;
}

function spawnEnemy(state) {
  const side = Math.floor(random(state) * 4);
  const position = random(state);
  const x = side === 0 ? -12 : side === 1 ? WIDTH + 12 : position * WIDTH;
  const y = side === 2 ? -12 : side === 3 ? HEIGHT + 12 : position * HEIGHT;
  state.enemies.push({ id: state.nextEnemyId++, x, y, hp: 1, speed: 48 + random(state) * 20 });
}

export function createArena(seed, playerCount) {
  return {
    seed: seed >>> 0,
    players: Array.from({ length: playerCount }, (_, index) => ({
      id: index, x: WIDTH / 2 + (index % 2 ? 55 : -55), y: HEIGHT / 2 + (index < 2 ? -25 : 45),
      hp: 5, invulnerable: 0, attackCooldown: 0, attackFlash: 0, color: COLORS[index]
    })),
    enemies: [], nextEnemyId: 1, spawnTimer: 0,
    spawnInterval: 1.8 / (1 + (playerCount - 1) * 0.25),
    timeRemaining: 180, score: 0, status: 'playing', survived: false
  };
}

export function stepArena(state, inputs, dt) {
  if (state.status !== 'playing') return state;
  if (state.players.every(player => player.hp <= 0)) {
    state.status = 'finished';
    return state;
  }
  state.timeRemaining = Math.max(0, state.timeRemaining - dt);
  if (state.timeRemaining === 0) {
    state.status = 'finished'; state.survived = true;
    return state;
  }
  for (const [index, player] of state.players.entries()) {
    if (player.hp <= 0) continue;
    const input = inputs[index] || {};
    const dx = Number(Boolean(input.right)) - Number(Boolean(input.left));
    const dy = Number(Boolean(input.down)) - Number(Boolean(input.up));
    const length = Math.hypot(dx, dy) || 1;
    player.x = clamp(player.x + dx / length * 205 * dt, 24, WIDTH - 24);
    player.y = clamp(player.y + dy / length * 205 * dt, 24, HEIGHT - 24);
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    player.attackCooldown = Math.max(0, player.attackCooldown - dt);
    player.attackFlash = Math.max(0, player.attackFlash - dt);
    if ((input.action || input.actionPressed) && player.attackCooldown === 0) {
      player.attackCooldown = 0.35;
      player.attackFlash = 0.16;
      for (const enemy of state.enemies) {
        if (Math.hypot(enemy.x - player.x, enemy.y - player.y) < 96) enemy.hp = 0;
      }
    }
  }
  const defeated = state.enemies.filter(enemy => enemy.hp <= 0).length;
  state.score += defeated * 10;
  state.enemies = state.enemies.filter(enemy => enemy.hp > 0);
  for (const enemy of state.enemies) {
    const target = state.players.filter(player => player.hp > 0).sort((a, b) =>
      Math.hypot(enemy.x - a.x, enemy.y - a.y) - Math.hypot(enemy.x - b.x, enemy.y - b.y))[0];
    if (!target) break;
    const distance = Math.hypot(target.x - enemy.x, target.y - enemy.y) || 1;
    enemy.x += (target.x - enemy.x) / distance * enemy.speed * dt;
    enemy.y += (target.y - enemy.y) / distance * enemy.speed * dt;
    if (Math.hypot(target.x - enemy.x, target.y - enemy.y) < 25 && target.invulnerable === 0) {
      target.hp = Math.max(0, target.hp - 1);
      target.invulnerable = 1.1;
    }
  }
  state.spawnTimer += dt;
  if (state.spawnTimer >= state.spawnInterval && state.enemies.length < 45) {
    state.spawnTimer -= state.spawnInterval;
    spawnEnemy(state);
  }
  if (state.players.every(player => player.hp <= 0)) state.status = 'finished';
  return state;
}

export function resultArena(state) {
  if (state.status !== 'finished') return null;
  return { finished: true, winner: null, score: state.score, label: state.survived ? 'Vocês sobreviveram!' : 'Fim da resistência' };
}
