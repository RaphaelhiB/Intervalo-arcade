# Plataforma de Quatro Jogos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar no navegador quatro jogos completos, cada um com modo solo, dupla no mesmo computador e sala online de dois a quatro jogadores por código.

**Architecture:** O navegador executa a interface, os desenhos em Canvas e as partidas solo/locais. Regras puras em módulos compartilhados também rodam no servidor Node.js, que é a autoridade das partidas online e transmite estados por WebSocket. Todos os jogos usam o mesmo formato de entrada, ciclo de atualização e tela de resultados.

**Tech Stack:** JavaScript ES modules, HTML/CSS, Canvas 2D, Node.js 18+, pacote `ws`, testes com `node:test` e `assert/strict`.

**Spec:** `docs/superpowers/specs/2026-09-26-plataforma-quatro-jogos-design.md`

## Global Constraints

- Quatro jogos: Arena de Sobrevivência, Duelo de Enigmas, Corrida de Obstáculos e Defesa de Torre Compacta.
- Modos solo e dupla local, além de salas online de dois a quatro jogadores, para todos os jogos.
- Partidas de aproximadamente três a cinco minutos, sem contas, chat ou ranking global.
- No mesmo computador, jogador 1 usa WASD e Espaço; jogador 2 usa setas e Enter. Online, todos usam o mapa do jogador 1 em seu próprio computador.
- Código de sala para entrada online. O servidor precisa de endereço público com WebSocket para partidas pela internet.
- Recordes solo salvos no navegador; interface e instruções em português.

## Mapa de arquivos e interfaces

- `package.json`: scripts `start` e `test`, módulo ES e dependência `ws`.
- `server/index.js`: servidor HTTP, arquivos estáticos e upgrade WebSocket.
- `server/rooms.js`: criação, entrada e ciclo de vida de salas com dois a quatro jogadores.
- `src/shared/game.js`: `createGame(id, seed, playerCount)`, `stepGame(id, state, inputs, dt)` e `resultOf(id, state)`; despacho para as quatro regras.
- `src/shared/input.js`: formato `InputFrame` com `up`, `down`, `left`, `right`, `action` e `actionPressed` booleanos.
- `src/games/{arena,puzzles,race,tower}/model.js`: estado inicial e atualização determinística de um jogo.
- `src/games/{arena,puzzles,race,tower}/render.js`: desenho de um estado em Canvas, usado somente no navegador.
- `src/client/main.js`: seleção de jogo/modo, ciclo local, mensagens online e troca de telas.
- `src/client/controls.js`: leitura das duas combinações de teclas e borda de pressionamento.
- `src/client/screens.js`, `src/client/styles.css`, `public/index.html`: menu, sala, instruções, HUD e resultado.
- `tests/*.test.js`: regras e protocolo; `README.md`: execução, controles e publicação do servidor.

## Review Focus

1. Respostas corretas quase simultâneas de até quatro jogadores no enigma online: só o primeiro evento aceito deve marcar ponto (Task 3 e 6).
2. Tecla de ação mantida pressionada: deve produzir apenas uma compra, resposta ou salto por pressionamento (Task 1).
3. Código de sala inválido, sala cheia ou entrada repetida: retornar erro legível sem alterar a sala existente (Task 6).
4. Desconexão no meio da partida: todos devem ver o encerramento da sala e poder voltar ao menu (Task 6).
5. Entradas após vitória ou derrota: não devem alterar pontuação, recursos nem resultado (Task 1 e regras dos jogos).

---

### Task 1: Base jogável e ciclo compartilhado

**Files:** Create `package.json`, `public/index.html`, `src/shared/input.js`, `src/shared/game.js`, `src/client/main.js`, `src/client/controls.js`, `src/client/screens.js`, `src/client/styles.css`, `tests/input.test.js`, `tests/game.test.js`.

**Interfaces:** `createGame(id, seed, playerCount) -> state`; `stepGame(id, state, inputs, dt) -> nextState`; `resultOf(id, state) -> null | {finished, winner, score}`. `inputs` é um array de um a quatro `InputFrame`; `dt` é em segundos e limitado a 0,05 por atualização. Os modelos implementados nas Tasks 2–5 são registrados à medida que aparecem.

- [ ] Escrever testes: ação contínua gera um único `actionPressed`; modo solo lê só o jogador 1; resultado final não muda após novas entradas; identificador de jogo desconhecido retorna erro controlado.
- [ ] Executar `npm test` e confirmar que esses testes falham pelas funções ausentes.
- [ ] Implementar a estrutura de menu, escolha de modo, controles, ciclo de atualização, tela de resultado e persistência de recorde solo em `localStorage`; jogos ainda não implementados aparecem indisponíveis.
- [ ] Executar `npm test` e confirmar todos os testes da Task 1 passando; abrir o menu e confirmar navegação por mouse/teclado.
- [ ] Criar commit `feat: add shared game shell`.

### Task 2: Arena de Sobrevivência

**Files:** Create `src/games/arena/model.js`, `src/games/arena/render.js`, `tests/arena.test.js`; modify `src/shared/game.js`, `src/client/main.js`.

**Interfaces:** `createArena(seed, playerCount) -> state`; `stepArena(state, inputs, dt) -> state`. Estado serializável contém jogadores, inimigos, tempo restante, vidas, pontuação e status. `renderArena(ctx, state, viewport)` desenha a arena.

- [ ] Escrever testes para movimento dentro dos limites, ataque que elimina inimigo e soma pontos, dano com intervalo de invulnerabilidade, dificuldade crescente de dois a quatro jogadores e término por tempo ou perda de todas as vidas.
- [ ] Executar `node --test tests/arena.test.js` e confirmar falhas esperadas.
- [ ] Implementar regras e desenho da arena, registrar o jogo e mostrar instruções e placar.
- [ ] Executar testes; jogar uma rodada solo e uma local até a tela de resultado.
- [ ] Criar commit `feat: add survival arena`.

### Task 3: Duelo de Enigmas

**Files:** Create `src/games/puzzles/model.js`, `src/games/puzzles/render.js`, `src/games/puzzles/questions.js`, `tests/puzzles.test.js`; modify `src/shared/game.js`, `src/client/main.js`.

**Interfaces:** `createPuzzles(seed, playerCount) -> state`; `stepPuzzles(state, inputs, dt) -> state`. Perguntas são geradas ou selecionadas pela semente; cada uma tem enunciado, quatro alternativas e índice correto. Estado inclui seleção e bloqueio por jogador, rodada, cronômetro e pontos.

- [ ] Escrever testes para resposta correta solo, resposta errada que bloqueia só aquele jogador, avanço de rodada, classificação por pontos de até quatro jogadores e aceitação de somente uma primeira resposta correta no mesmo passo.
- [ ] Executar `node --test tests/puzzles.test.js` e confirmar falhas esperadas.
- [ ] Implementar perguntas de lógica, padrões e cálculo com alternativas sem ambiguidade, regras e desenho; registrar o jogo.
- [ ] Executar testes; jogar uma sequência solo e um duelo local completo.
- [ ] Criar commit `feat: add puzzle duel`.

### Task 4: Corrida de Obstáculos

**Files:** Create `src/games/race/model.js`, `src/games/race/render.js`, `tests/race.test.js`; modify `src/shared/game.js`, `src/client/main.js`.

**Interfaces:** `createRace(seed, playerCount) -> state`; `stepRace(state, inputs, dt) -> state`. Estado serializável contém progresso, altura do salto, obstáculos, tempos e vencedor; até quatro pistas usam a mesma sequência de obstáculos.

- [ ] Escrever testes para salto e aterrissagem, atraso por colisão sem eliminação, até quatro pistas equivalentes, cronômetro e vencedor entre até quatro corredores.
- [ ] Executar `node --test tests/race.test.js` e confirmar falhas esperadas.
- [ ] Implementar regras e desenho lateral com pista curta; registrar o jogo e salvar melhor tempo solo.
- [ ] Executar testes; concluir uma corrida solo e uma local.
- [ ] Criar commit `feat: add obstacle race`.

### Task 5: Defesa de Torre Compacta

**Files:** Create `src/games/tower/model.js`, `src/games/tower/render.js`, `tests/tower.test.js`; modify `src/shared/game.js`, `src/client/main.js`.

**Interfaces:** `createTower(seed, playerCount) -> state`; `stepTower(state, inputs, dt) -> state`. Estado serializável contém mapa fixo, posições de construção, cursores, torres, recursos compartilhados, inimigos, ondas e vida da base. `actionPressed` instala ou melhora a torre na posição selecionada.

- [ ] Escrever testes para compra e melhora, recursos insuficientes, dano de torre, recurso por inimigo derrotado, dano na base, recursos compartilhados e vitória/derrota.
- [ ] Executar `node --test tests/tower.test.js` e confirmar falhas esperadas.
- [ ] Implementar regras e desenho do mapa; registrar o jogo.
- [ ] Executar testes; concluir uma partida solo e uma local.
- [ ] Criar commit `feat: add compact tower defense`.

### Task 6: Salas online e servidor autoritativo

**Files:** Create `server/index.js`, `server/rooms.js`, `tests/rooms.test.js`; modify `src/client/main.js`, `src/client/screens.js`, `package.json`.

**Interfaces:** Mensagens cliente→servidor: `{type:'create', gameId}`, `{type:'join', code}`, `{type:'start'}`, `{type:'input', frame}`. Respostas servidor→cliente: `{type:'room', code, playerIndex, players}`, `{type:'state', state}`, `{type:'error', message}`, `{type:'closed', reason}`. `RoomManager.create`, `.join`, `.start`, `.input`, `.leave` são as operações testáveis; uma sala tem código de seis caracteres, exige de dois a quatro participantes para iniciar e rejeita o quinto. O servidor roda um passo de jogo a cada 1/30 s e envia estados a todos, usando os mesmos modelos das Tasks 2–5.

- [ ] Escrever testes de duas, três e quatro conexões, rejeição da quinta, código inválido, entrada repetida, início com menos de dois participantes, entradas de jogador sem autoridade, encerramento de todos ao desconectar e rejeição de ações depois do fim.
- [ ] Executar `node --test tests/rooms.test.js` e confirmar falhas esperadas.
- [ ] Implementar servidor HTTP/WebSocket, salas, sincronização de estado, criação/entrada por código e mensagens de erro em português.
- [ ] Executar testes; abrir quatro navegadores, jogar ao menos uma partida de cada jogo pela mesma sala e verificar desconexão.
- [ ] Criar commit `feat: add online rooms`.

### Task 7: Entrega e revisão final

**Files:** Create `README.md`; modify `src/client/screens.js`, `src/client/styles.css`, `src/client/main.js` conforme os problemas encontrados.

**Interfaces:** `npm start` serve o aplicativo em `http://localhost:3000`; `PORT` muda a porta. `npm test` roda todos os testes. O README explica controles, como jogar localmente, como abrir em dois computadores na mesma rede e os requisitos de hospedagem pública com WebSocket para internet.

- [ ] Escrever checklist manual de início, término, revanche, retorno ao menu e recorde solo para os quatro jogos e três modos.
- [ ] Executar `npm test` e confirmar todos os testes passando.
- [ ] Executar o checklist em navegador e corrigir problemas concretos de legibilidade, foco do teclado ou navegação.
- [ ] Escrever README com passos reproduzíveis e executar `npm start` para confirmar que a página abre.
- [ ] Criar commit `docs: explain play and deployment` e verificar `git status --short` sem mudanças pendentes.
