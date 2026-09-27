import { SLOTS } from './model.js';
const colors = ['#bdff6e', '#66ddeb', '#be9aff', '#ffb37e'];

export function renderTower(ctx, state, viewport) {
  const { width, height } = viewport;
  ctx.fillStyle = '#0f1b2d'; ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#ffffff0a'; ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 45) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
  for (let y = 0; y < height; y += 45) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
  ctx.fillStyle = '#26354b'; ctx.fillRect(0, 259, width, 83);
  ctx.strokeStyle = '#556985'; ctx.setLineDash([12, 12]); ctx.beginPath(); ctx.moveTo(0, 300); ctx.lineTo(width, 300); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#ff8b73'; ctx.fillRect(927, 256, 33, 90);
  ctx.fillStyle = '#172438'; ctx.fillRect(0, 0, width, 92);
  ctx.textAlign = 'left'; ctx.font = 'bold 17px Arial'; ctx.fillStyle = '#f3f7ff';
  ctx.fillText(`ONDA ${state.wave} / 6`, 37, 39);
  ctx.fillText(`BASE ${state.baseHp} ♥`, 210, 39);
  ctx.fillStyle = '#bdff6e'; ctx.fillText(`RECURSOS ${state.resources}`, 410, 39);
  ctx.fillStyle = '#91a6c2'; ctx.font = 'bold 13px Arial';
  ctx.fillText(state.wavePause != null ? `PRÓXIMA ONDA EM ${Math.ceil(state.wavePause)}s` : `${state.spawnRemaining} INIMIGOS POR CHEGAR`, 700, 39);
  SLOTS.forEach((position, index) => {
    const tower = state.towers[index];
    ctx.fillStyle = tower ? '#253d50' : '#25344a'; ctx.strokeStyle = tower ? '#66ddeb' : '#61758e'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(position.x, position.y, 30, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (tower) {
      ctx.fillStyle = '#66ddeb'; ctx.fillRect(position.x - 13, position.y - 18, 26, 36);
      ctx.fillStyle = '#14243a'; ctx.fillRect(position.x - 4, position.y - 28, 8, 18);
      ctx.fillStyle = '#d8faff'; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'center'; ctx.fillText(`N${tower.level}`, position.x, position.y + 46); ctx.textAlign = 'left';
    } else {
      ctx.fillStyle = '#8fa2bc'; ctx.font = 'bold 23px Arial'; ctx.textAlign = 'center'; ctx.fillText('+', position.x, position.y + 8); ctx.textAlign = 'left';
    }
    state.cursors.forEach((cursor, player) => {
      if (cursor !== index) return;
      ctx.strokeStyle = colors[player]; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(position.x, position.y, 38 + player * 5, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = colors[player]; ctx.font = 'bold 12px Arial'; ctx.fillText(`P${player + 1}`, position.x - 12 + player * 16, position.y - 49);
    });
  });
  for (const enemy of state.enemies) {
    ctx.fillStyle = '#ff8b73'; ctx.shadowColor = '#ff8b73'; ctx.shadowBlur = 13;
    ctx.beginPath(); ctx.roundRect(enemy.x - 15, 283, 30, 34, 7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#311e2a'; ctx.fillRect(enemy.x - 6, 291, 5, 5); ctx.fillRect(enemy.x + 3, 291, 5, 5);
  }
  ctx.fillStyle = '#8fa4bf'; ctx.font = '13px Arial'; ctx.fillText('MOVER CURSOR: WASD / SETAS    •    CONSTRUIR: 40    •    MELHORAR: 50 / 100    •    AÇÃO: ESPAÇO / ENTER', 38, 565);
}
