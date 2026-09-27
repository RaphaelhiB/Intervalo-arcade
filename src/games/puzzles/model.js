import { buildQuestions } from './questions.js';

export function createPuzzles(seed, playerCount) {
  return {
    questions: buildQuestions(seed, 10), playerCount, round: 0,
    selections: Array(playerCount).fill(0), blocked: Array(playerCount).fill(false),
    navCooldown: Array(playerCount).fill(0), points: Array(playerCount).fill(0),
    questionTime: 15, totalRemaining: 180, status: 'playing'
  };
}

function nextQuestion(state) {
  state.round++;
  state.questionTime = 15;
  state.selections.fill(0);
  state.blocked.fill(false);
  state.navCooldown.fill(0);
  if (state.round >= state.questions.length) state.status = 'finished';
}

export function stepPuzzles(state, inputs, dt) {
  if (state.status !== 'playing') return state;
  state.questionTime -= dt;
  state.totalRemaining -= dt;
  if (state.totalRemaining <= 0) { state.status = 'finished'; return state; }
  if (state.questionTime <= 0) { nextQuestion(state); return state; }
  for (let index = 0; index < state.playerCount; index++) {
    const input = inputs[index] || {};
    state.navCooldown[index] = Math.max(0, state.navCooldown[index] - dt);
    if (!state.blocked[index] && state.navCooldown[index] === 0 && (input.left || input.right)) {
      state.selections[index] = (state.selections[index] + (input.right ? 1 : 3)) % 4;
      state.navCooldown[index] = 0.18;
    }
  }
  const order = Array.from({ length: state.playerCount }, (_, index) => index);
  order.sort((a, b) => {
    const sa = inputs[a]?.sequence;
    const sb = inputs[b]?.sequence;
    if (sa != null && sb != null && sa !== sb) return sa - sb;
    return ((a - state.round + state.playerCount) % state.playerCount) - ((b - state.round + state.playerCount) % state.playerCount);
  });
  for (const index of order) {
    if (state.blocked[index] || !inputs[index]?.actionPressed) continue;
    if (state.selections[index] === state.questions[state.round].correct) {
      state.points[index]++;
      nextQuestion(state);
      return state;
    }
    state.blocked[index] = true;
  }
  if (state.blocked.every(Boolean)) nextQuestion(state);
  return state;
}

export function resultPuzzles(state) {
  if (state.status !== 'finished') return null;
  const high = Math.max(...state.points);
  const leaders = state.points.flatMap((points, index) => points === high ? [index] : []);
  const winner = leaders.length === 1 ? leaders[0] : null;
  return { finished: true, winner, score: high,
    label: state.playerCount === 1 ? 'Desafio concluído!' : winner == null ? 'Empate!' : `Jogador ${winner + 1} venceu!` };
}
