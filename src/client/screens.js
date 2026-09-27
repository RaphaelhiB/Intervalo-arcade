export const CATALOG = {
  arena: { title: 'Arena de Sobrevivência', icon: '✦', tag: 'COOPERAÇÃO', description: 'Desvie, ataque e resista às ondas até o último segundo.', accent: 'coral', controls: 'Mover: WASD / setas · Atacar: Espaço / Enter' },
  puzzles: { title: 'Duelo de Enigmas', icon: '◇', tag: 'RACIOCÍNIO', description: 'Pense rápido. A primeira resposta certa leva o ponto.', accent: 'violet', controls: 'Escolher: A/D ou ←/→ · Responder: Espaço / Enter' },
  race: { title: 'Corrida de Obstáculos', icon: '➜', tag: 'VELOCIDADE', description: 'Pule na hora certa e cruze a linha de chegada primeiro.', accent: 'cyan', controls: 'Pular: Espaço / Enter' },
  tower: { title: 'Defesa de Torre Compacta', icon: '▣', tag: 'ESTRATÉGIA', description: 'Monte sua defesa e segure a base com seus amigos.', accent: 'lime', controls: 'Escolher posição: WASD / setas · Construir ou melhorar: Espaço / Enter' }
};

export function showMenu(root, records = {}) {
  root.innerHTML = `
    <div class="shell">
      <header class="topbar"><div class="brand-mark">IA</div><div class="brand">INTERVALO <strong>ARCADE</strong></div><span class="top-note">QUATRO JOGOS · PARTIDAS RÁPIDAS</span></header>
      <main class="home">
        <section class="hero"><div class="eyebrow"><span class="pulse"></span> SUA PAUSA COMEÇA AQUI</div><h1>Escolha o jogo.<br><em>Chame a galera.</em></h1><p>Quatro desafios para jogar sozinho, lado a lado ou em uma sala online com até quatro pessoas.</p><div class="hero-chips"><span>⚡ PARTIDAS CURTAS</span><span>♟ SOLO OU MULTIPLAYER</span><span>⌨ FEITO PARA PC</span></div></section>
        <section class="game-grid" aria-label="Jogos">${Object.entries(CATALOG).map(([id, game], index) => `
          <button class="game-card ${game.accent}" data-game="${id}" type="button"><span class="card-number">0${index + 1} / 04</span><span class="card-icon">${game.icon}</span><span class="card-tag">${game.tag}</span><strong>${game.title}</strong><span class="card-desc">${game.description}</span><span class="card-footer"><span>${records[id] ? `SEU RECORDE: ${records[id]}` : 'PRONTO PARA JOGAR'}</span><span class="arrow">↗</span></span></button>
        `).join('')}</section>
      </main><footer class="footer">APERTE START NO SEU INTERVALO <span>01 — 04</span></footer>
    </div>`;
}

export function showModes(root, gameId) {
  const game = CATALOG[gameId];
  root.innerHTML = `<div class="shell"><header class="topbar"><button class="back" data-back>← VOLTAR</button><div class="brand">INTERVALO <strong>ARCADE</strong></div></header><main class="mode-page"><div class="eyebrow">${game.tag} / ESCOLHA O MODO</div><div class="mode-title"><span class="large-icon ${game.accent}">${game.icon}</span><h1>${game.title}</h1></div><p class="mode-subtitle">${game.description}</p><div class="mode-grid"><button class="mode-card" data-mode="solo"><span class="mode-glyph">◉</span><strong>Jogar sozinho</strong><span>Treine e tente superar seu recorde.</span><b>1 JOGADOR →</b></button><button class="mode-card" data-mode="local"><span class="mode-glyph">◎</span><strong>Mesmo computador</strong><span>Dois jogadores, um teclado.</span><b>2 JOGADORES →</b></button><button class="mode-card" data-mode="online"><span class="mode-glyph">▥</span><strong>Sala online</strong><span>Crie uma sala ou entre com um código.</span><b>2 A 4 JOGADORES →</b></button></div><div class="control-hint"><span>CONTROLES</span> ${game.controls}</div></main></div>`;
}

export function showLobby(root, gameId, options = {}) {
  const game = CATALOG[gameId];
  const code = options.code || '';
  const players = options.players || 0;
  root.innerHTML = `<div class="shell"><header class="topbar"><button class="back" data-back>← VOLTAR</button><div class="brand">INTERVALO <strong>ARCADE</strong></div></header><main class="lobby-page"><div class="eyebrow">SALA ONLINE / ${game.title.toUpperCase()}</div><h1>Jogue de onde<br><em>vocês estiverem.</em></h1><div class="lobby-panel">${code ? `<span class="panel-label">CÓDIGO DA SALA</span><div class="room-code">${code}</div><p>Compartilhe este código com seus amigos.</p><div class="room-players">${players} / 4 JOGADORES</div><button class="primary" data-start-room ${players < 2 ? 'disabled' : ''}>INICIAR PARTIDA →</button>` : `<button class="primary" data-create-room>CRIAR SALA →</button><div class="divider">OU</div><label class="panel-label" for="join-code">ENTRAR COM CÓDIGO</label><div class="join-row"><input id="join-code" maxlength="6" autocomplete="off" placeholder="ABC123" aria-label="Código da sala"><button class="primary" data-join-room>ENTRAR →</button></div>`}<p class="lobby-message" role="status">${options.message || ''}</p></div></main></div>`;
}

export function showGame(root, gameId, mode) {
  const game = CATALOG[gameId];
  root.innerHTML = `<div class="play-shell"><header class="play-top"><button class="back" data-exit>← SAIR</button><div class="play-game-title"><span class="mini-icon ${game.accent}">${game.icon}</span>${game.title}</div><span class="play-mode">${mode === 'solo' ? 'SOLO' : mode === 'local' ? 'DUPLA LOCAL' : 'SALA ONLINE'}</span></header><main class="play-main"><div class="canvas-wrap"><canvas id="game-canvas" width="960" height="600" aria-label="${game.title}"></canvas></div><div class="play-bottom"><span>${game.controls}</span><span class="status-dot">● EM JOGO</span></div></main></div>`;
  return root.querySelector('canvas');
}

export function showResult(root, gameId, mode, result, record) {
  const game = CATALOG[gameId];
  let headline = result?.label || (result?.winner == null ? 'Partida encerrada' : mode === 'solo' ? 'Boa partida!' : `Jogador ${result.winner + 1} venceu!`);
  root.innerHTML = `<div class="shell"><header class="topbar"><div class="brand-mark">IA</div><div class="brand">INTERVALO <strong>ARCADE</strong></div></header><main class="result-page"><div class="result-symbol ${game.accent}">${game.icon}</div><div class="eyebrow">${game.title.toUpperCase()} / RESULTADO</div><h1>${headline}</h1><div class="result-score">${result?.score ?? 0}<span>${gameId === 'race' ? 'SEGUNDOS' : 'PONTOS'}</span></div>${record ? `<p class="record-note">SEU MELHOR RESULTADO: ${record}</p>` : ''}<div class="result-actions"><button class="primary" data-replay>JOGAR DE NOVO →</button><button class="secondary" data-home>OUTRO JOGO</button></div></main></div>`;
}
