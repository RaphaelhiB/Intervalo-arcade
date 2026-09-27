const colors = ['#bdff6e', '#66ddeb', '#be9aff', '#ffb37e'];

export function renderRace(ctx, state, viewport) {
  const { width, height } = viewport;
  ctx.fillStyle = '#10192b'; ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#192b43'; ctx.fillRect(0, 0, width, 95);
  ctx.fillStyle = '#f5f8ff'; ctx.font = 'bold 25px Arial'; ctx.textAlign = 'left'; ctx.fillText(`TEMPO ${state.elapsed.toFixed(1)}s`, 42, 51);
  ctx.fillStyle = '#98aac2'; ctx.font = 'bold 13px Arial'; ctx.fillText('PULOS PRECISOS · PISTAS IGUAIS', 720, 50);
  const laneHeight = (height - 115) / state.runners.length;
  state.runners.forEach((runner, index) => {
    const top = 105 + index * laneHeight;
    const ground = top + laneHeight * 0.68;
    ctx.fillStyle = index % 2 ? '#1b2840' : '#17233a'; ctx.fillRect(26, top, width - 52, laneHeight - 9);
    ctx.strokeStyle = '#536986'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(26, ground); ctx.lineTo(width - 26, ground); ctx.stroke();
    ctx.fillStyle = colors[index]; ctx.font = 'bold 13px Arial'; ctx.fillText(`P${index + 1}`, 45, top + 25);
    ctx.fillStyle = '#92a8c3'; ctx.fillText(`${Math.floor(runner.progress / state.distance * 100)}%`, 84, top + 25);
    for (const obstacle of state.obstacles) {
      const x = 180 + (obstacle.x - runner.progress) * 0.75;
      if (x < 20 || x > width - 20) continue;
      ctx.fillStyle = '#ff8b73'; ctx.fillRect(x - 12, ground - 31, 24, 31);
      ctx.fillStyle = '#ffc0a8'; ctx.fillRect(x - 12, ground - 31, 24, 6);
    }
    const finishX = 180 + (state.distance - runner.progress) * 0.75;
    if (finishX < width - 25 && finishX > 30) {
      ctx.fillStyle = '#f4f7ff'; ctx.fillRect(finishX, top + 10, 5, ground - top - 10);
      for (let y = top + 10; y < ground - 15; y += 13) { ctx.fillStyle = '#152036'; ctx.fillRect(finishX, y, 5, 6); }
    }
    ctx.shadowColor = colors[index]; ctx.shadowBlur = 17; ctx.fillStyle = colors[index];
    ctx.beginPath(); ctx.roundRect(155, ground - 37 - runner.height * 0.55, 47, 37, 9); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#10192b'; ctx.font = 'bold 17px Arial'; ctx.textAlign = 'center'; ctx.fillText(String(index + 1), 178, ground - 13 - runner.height * 0.55); ctx.textAlign = 'left';
    if (runner.stumble > 0) { ctx.fillStyle = '#ff8b73'; ctx.font = 'bold 12px Arial'; ctx.fillText('TROPEÇOU!', 220, ground - 17); }
    ctx.fillStyle = '#30425e'; ctx.fillRect(42, top + laneHeight - 27, width - 84, 6);
    ctx.fillStyle = colors[index]; ctx.fillRect(42, top + laneHeight - 27, (width - 84) * runner.progress / state.distance, 6);
  });
}
