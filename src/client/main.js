import { CATALOG, showMenu, showModes, showLobby, showGame, showResult } from './screens.js';
import { createKeyboard } from './controls.js';
import { createGame, stepGame, resultOf, registerGame } from '../shared/game.js';

const root = document.querySelector('#app');
const keyboard = createKeyboard(window);
const loaded = new Map();
let gameId = null;
let mode = 'solo';
let state = null;
let canvas = null;
let animation = 0;
let lastTime = 0;

const loaders = {
  arena: async () => {
    const [model, view] = await Promise.all([import('../games/arena/model.js'), import('../games/arena/render.js')]);
    return { create: model.createArena, step: model.stepArena, result: model.resultArena, render: view.renderArena };
  },
  puzzles: async () => {
    const [model, view] = await Promise.all([import('../games/puzzles/model.js'), import('../games/puzzles/render.js')]);
    return { create: model.createPuzzles, step: model.stepPuzzles, result: model.resultPuzzles, render: view.renderPuzzles };
  },
  race: async () => {
    const [model, view] = await Promise.all([import('../games/race/model.js'), import('../games/race/render.js')]);
    return { create: model.createRace, step: model.stepRace, result: model.resultRace, render: view.renderRace };
  },
  tower: async () => {
    const [model, view] = await Promise.all([import('../games/tower/model.js'), import('../games/tower/render.js')]);
    return { create: model.createTower, step: model.stepTower, result: model.resultTower, render: view.renderTower };
  }
};

async function ensureGame(id) {
  if (loaded.has(id)) return loaded.get(id);
  const model = await loaders[id]();
  registerGame(id, model);
  loaded.set(id, model);
  return model;
}

function recordKey(id) { return `intervalo-arcade-record-${id}`; }
function readRecord(id) {
  try { return Number(localStorage.getItem(recordKey(id))) || 0; } catch { return 0; }
}
function updateRecord(id, score) {
  const old = readRecord(id);
  const better = id === 'race' ? (!old || score < old) : score > old;
  if (better) {
    try { localStorage.setItem(recordKey(id), String(score)); } catch { /* storage disabled */ }
  }
  return better ? score : old;
}
function records() {
  return Object.fromEntries(Object.keys(CATALOG).map(id => [id, readRecord(id)]));
}

function stop() {
  cancelAnimationFrame(animation);
  animation = 0;
  keyboard.reset();
}

function home() {
  stop();
  state = null;
  showMenu(root, records());
}

async function startLocal(selectedMode) {
  stop();
  mode = selectedMode;
  try {
    const model = await ensureGame(gameId);
    state = createGame(gameId, Math.floor(Math.random() * 2 ** 30), mode === 'solo' ? 1 : 2);
    canvas = showGame(root, gameId, mode);
    lastTime = performance.now();
    const loop = now => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const frames = keyboard.frames(mode === 'solo' ? 1 : 2);
      state = stepGame(gameId, state, frames, dt);
      model.render(canvas.getContext('2d'), state, { width: canvas.width, height: canvas.height });
      const result = resultOf(gameId, state);
      if (result?.finished) {
        finish(result);
      } else {
        animation = requestAnimationFrame(loop);
      }
    };
    animation = requestAnimationFrame(loop);
  } catch (error) {
    showModes(root, gameId);
    const message = document.createElement('p');
    message.className = 'lobby-message';
    message.textContent = `Não foi possível abrir o jogo: ${error.message}`;
    root.querySelector('.mode-page')?.append(message);
  }
}

function finish(result) {
  stop();
  const score = Number(result.score) || 0;
  const record = mode === 'solo' ? updateRecord(gameId, score) : 0;
  showResult(root, gameId, mode, result, record);
}

root.addEventListener('click', async event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.game) {
    gameId = button.dataset.game;
    showModes(root, gameId);
  } else if (button.hasAttribute('data-back')) {
    home();
  } else if (button.dataset.mode === 'solo' || button.dataset.mode === 'local') {
    await startLocal(button.dataset.mode);
  } else if (button.dataset.mode === 'online') {
    mode = 'online';
    showLobby(root, gameId, { message: 'Conectando ao servidor…' });
  } else if (button.hasAttribute('data-exit') || button.hasAttribute('data-home')) {
    home();
  } else if (button.hasAttribute('data-replay')) {
    if (mode === 'online') showLobby(root, gameId);
    else await startLocal(mode);
  }
});

home();
