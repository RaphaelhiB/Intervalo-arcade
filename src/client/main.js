import { CATALOG, showMenu, showModes, showLobby, showGame, showResult } from './screens.js';
import { createKeyboard, createInputSource } from './controls.js';
import { createTouchState, bindTouchControls } from './touch-controls.js';
import { createGame, stepGame, resultOf, registerGame } from '../shared/game.js';

const root = document.querySelector('#app');
const keyboard = createKeyboard(window);
const touch = createTouchState();
bindTouchControls(root, touch, window);
const input = createInputSource(keyboard, touch);
const loaded = new Map();
let gameId = null;
let mode = 'solo';
let state = null;
let canvas = null;
let animation = 0;
let lastTime = 0;
let socket = null;
let roomInfo = null;
let onlinePlaying = false;

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
  input.reset();
}

function closeOnline() {
  const previous = socket;
  socket = null;
  roomInfo = null;
  onlinePlaying = false;
  if (previous && previous.readyState < WebSocket.CLOSING) previous.close();
}

function home() {
  stop();
  closeOnline();
  state = null;
  showMenu(root, records());
}

function lobbyMessage(message) {
  const element = root.querySelector('.lobby-message');
  if (element) element.textContent = message;
}

async function onServerMessage(event) {
  let message;
  try { message = JSON.parse(event.data); } catch { return; }
  if (message.type === 'room') {
    roomInfo = message;
    gameId = message.gameId || gameId;
    if (!onlinePlaying && root.querySelector('.lobby-page')) showLobby(root, gameId, roomInfo);
  } else if (message.type === 'error') {
    lobbyMessage(message.message);
  } else if (message.type === 'closed') {
    onlinePlaying = false;
    roomInfo = null;
    stop();
    showLobby(root, gameId, { message: message.reason });
  } else if (message.type === 'start') {
    stop();
    mode = 'online';
    gameId = message.gameId;
    state = null;
    try {
      await ensureGame(gameId);
      canvas = showGame(root, gameId, mode, roomInfo?.playerIndex || 0);
      onlinePlaying = true;
      const sendFrame = () => {
        if (!onlinePlaying || socket?.readyState !== WebSocket.OPEN) return;
        const frame = input.frames(1)[0];
        if (gameId === 'puzzles') frame.round = state?.round;
        socket.send(JSON.stringify({ type: 'input', frame }));
        animation = requestAnimationFrame(sendFrame);
      };
      animation = requestAnimationFrame(sendFrame);
    } catch (error) {
      showLobby(root, gameId, { ...roomInfo, message: `Falha ao abrir o jogo: ${error.message}` });
    }
  } else if (message.type === 'state') {
    if (!onlinePlaying || !canvas) return;
    state = message.state;
    loaded.get(gameId)?.render(canvas.getContext('2d'), state, { width: canvas.width, height: canvas.height });
  } else if (message.type === 'result') {
    if (!onlinePlaying) return;
    onlinePlaying = false;
    finish(message.result);
  }
}

async function openSocket() {
  if (socket?.readyState === WebSocket.OPEN) return socket;
  const url = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/ws`;
  const connection = new WebSocket(url);
  socket = connection;
  connection.addEventListener('message', onServerMessage);
  connection.addEventListener('close', () => {
    if (socket !== connection) return;
    socket = null;
    roomInfo = null;
    onlinePlaying = false;
    stop();
    if (mode === 'online') showLobby(root, gameId, { message: 'Conexão perdida. Crie ou entre em outra sala.' });
  });
  await new Promise((resolve, reject) => {
    connection.addEventListener('open', resolve, { once: true });
    connection.addEventListener('error', () => reject(new Error('Servidor indisponível.')), { once: true });
  });
  return connection;
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
      const frames = input.frames(mode === 'solo' ? 1 : 2);
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
    showLobby(root, gameId);
  } else if (button.hasAttribute('data-create-room')) {
    lobbyMessage('Criando sala…');
    try { (await openSocket()).send(JSON.stringify({ type: 'create', gameId })); }
    catch (error) { lobbyMessage(error.message); }
  } else if (button.hasAttribute('data-join-room')) {
    const code = root.querySelector('#join-code')?.value.trim().toUpperCase() || '';
    if (!/^[A-Z0-9]{6}$/.test(code)) { lobbyMessage('Digite um código de 6 caracteres.'); return; }
    lobbyMessage('Entrando na sala…');
    try { (await openSocket()).send(JSON.stringify({ type: 'join', code })); }
    catch (error) { lobbyMessage(error.message); }
  } else if (button.hasAttribute('data-start-room')) {
    socket?.send(JSON.stringify({ type: 'start' }));
  } else if (button.hasAttribute('data-exit') || button.hasAttribute('data-home')) {
    home();
  } else if (button.hasAttribute('data-replay')) {
    if (mode === 'online') showLobby(root, gameId, roomInfo || {});
    else await startLocal(mode);
  }
});

home();
