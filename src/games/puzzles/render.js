const colors = ['#bdff6e', '#66ddeb', '#be9aff', '#ffb37e'];

export function renderPuzzles(ctx, state, viewport) {
  const { width, height } = viewport;
  ctx.fillStyle = '#111a2c'; ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#19263d'; ctx.fillRect(0, 0, width, 105);
  ctx.textAlign = 'left'; ctx.font = 'bold 14px Arial'; ctx.fillStyle = '#b8c7dd';
  ctx.fillText(`RODADA ${Math.min(state.round + 1, state.questions.length)} / ${state.questions.length}`, 46, 42);
  ctx.fillText(`TEMPO ${Math.ceil(Math.max(0, state.questionTime))}s`, 315, 42);
  state.points.forEach((points, index) => { ctx.fillStyle = colors[index]; ctx.fillText(`P${index + 1}  ${points} PTS`, 46 + index * 215, 83); });
  const question = state.questions[Math.min(state.round, state.questions.length - 1)];
  ctx.fillStyle = '#bdff6e'; ctx.font = 'bold 13px Arial'; ctx.fillText(question.category, 70, 168);
  ctx.fillStyle = '#f3f7ff'; ctx.font = 'bold 38px Arial'; ctx.fillText(question.prompt, 70, 225);
  question.options.forEach((option, index) => {
    const x = 70 + (index % 2) * 420;
    const y = 285 + Math.floor(index / 2) * 118;
    ctx.fillStyle = '#202e47'; ctx.strokeStyle = '#52647e'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(x, y, 395, 94, 12); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#90a3be'; ctx.font = 'bold 17px Arial'; ctx.fillText('ABCD'[index], x + 22, y + 55);
    ctx.fillStyle = '#f3f7ff'; ctx.font = 'bold 29px Arial'; ctx.fillText(String(option), x + 72, y + 59);
    state.selections.forEach((selection, player) => {
      if (selection !== index || state.blocked[player]) return;
      ctx.fillStyle = colors[player]; ctx.beginPath(); ctx.arc(x + 315 + (player % 2) * 32, y + 31 + Math.floor(player / 2) * 33, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#10192b'; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'center'; ctx.fillText(String(player + 1), x + 315 + (player % 2) * 32, y + 36 + Math.floor(player / 2) * 33); ctx.textAlign = 'left';
    });
  });
  ctx.fillStyle = '#90a3be'; ctx.font = '13px Arial';
  ctx.fillText('A/D OU ←/→ PARA ESCOLHER    •    ESPAÇO OU ENTER PARA RESPONDER', 70, 565);
}
