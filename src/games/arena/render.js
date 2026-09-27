export function renderArena(ctx, state, viewport) {
  const { width, height } = viewport;
  ctx.fillStyle = '#10192b'; ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#ffffff0b'; ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
  for (let y = 0; y < height; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
  ctx.strokeStyle = '#67ddec55'; ctx.lineWidth = 3; ctx.strokeRect(18, 18, width - 36, height - 36);
  for (const enemy of state.enemies) {
    ctx.shadowColor = '#ff756f'; ctx.shadowBlur = 18; ctx.fillStyle = '#ff756f';
    ctx.beginPath(); ctx.arc(enemy.x, enemy.y, 12, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#301d2b'; ctx.beginPath(); ctx.arc(enemy.x - 3, enemy.y - 2, 2, 0, Math.PI * 2); ctx.arc(enemy.x + 3, enemy.y - 2, 2, 0, Math.PI * 2); ctx.fill();
  }
  for (const player of state.players) {
    if (player.hp <= 0) continue;
    if (player.attackFlash > 0) { ctx.strokeStyle = `${player.color}99`; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(player.x, player.y, 96 * (1 - player.attackFlash / 0.16), 0, Math.PI * 2); ctx.stroke(); }
    ctx.globalAlpha = player.invulnerable > 0 ? 0.55 : 1;
    ctx.shadowColor = player.color; ctx.shadowBlur = 22; ctx.fillStyle = player.color;
    ctx.beginPath(); ctx.arc(player.x, player.y, 17, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#10192b'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center'; ctx.fillText(String(player.id + 1), player.x, player.y + 6); ctx.globalAlpha = 1;
  }
  ctx.fillStyle = '#0a1026dd'; ctx.fillRect(28, 28, width - 56, 58);
  ctx.font = 'bold 15px Arial'; ctx.textAlign = 'left'; ctx.fillStyle = '#dfe9ff';
  ctx.fillText(`TEMPO  ${Math.ceil(state.timeRemaining)}s`, 48, 65);
  ctx.fillText(`PONTOS  ${state.score}`, 235, 65);
  state.players.forEach((player, index) => { ctx.fillStyle = player.color; ctx.fillText(`P${index + 1}  ${'♥'.repeat(player.hp)}${'·'.repeat(5 - player.hp)}`, 420 + (index % 2) * 230, 55 + Math.floor(index / 2) * 22); });
}
