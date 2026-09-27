const games = new Map();

export function registerGame(id, module) {
  if (!id || !module?.create || !module?.step || !module?.result) {
    throw new Error('Registro de jogo inválido');
  }
  games.set(id, module);
}

function modelFor(id) {
  const model = games.get(id);
  if (!model) throw new Error(`Jogo desconhecido: ${id}`);
  return model;
}

export function createGame(id, seed, playerCount) {
  if (!Number.isInteger(playerCount) || playerCount < 1 || playerCount > 4) {
    throw new Error('Número de jogadores inválido');
  }
  return modelFor(id).create(seed, playerCount);
}

export function stepGame(id, state, inputs, dt) {
  if (resultOf(id, state)?.finished) return state;
  return modelFor(id).step(state, inputs, Math.min(0.05, Math.max(0, dt)));
}

export function resultOf(id, state) {
  return modelFor(id).result(state);
}
