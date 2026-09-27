# Mobile Crossplay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Jogar os quatro jogos em celular, solo ou em salas online com celulares e PCs, usando controles de toque em partidas horizontais.

**Architecture:** Os botões de toque produzem o mesmo `InputFrame` que o teclado. O cliente combina ambos antes de avançar o jogo solo ou enviar ações pelo WebSocket. Telas e CSS acomodam menu vertical, partida horizontal, Canvas e botões, sem alterar modelos nem servidor.

**Tech Stack:** HTML, CSS, JavaScript ES modules, Canvas 2D, Node.js 18+, WebSocket `ws`.

**Spec:** `docs/superpowers/specs/2026-09-26-mobile-crossplay-design.md`

## Global Constraints

- No celular: solo e sala online de dois a quatro, inclusive grupos mistos com PC; sem dupla no mesmo aparelho.
- Partidas no celular em orientação horizontal; menu, sala e resultados adaptados também à vertical.
- Preservar teclado, dupla local no PC, regras dos jogos, protocolo WebSocket e Canvas lógico de 960 × 600.
- Publicar no repositório `origin/main` e atualizar o serviço Render existente após testes.

## Review Focus

1. Um toque de ação concluído entre dois quadros produz exatamente um `actionPressed` — teste da Task 1.
2. Dois dedos mantêm direção e ação juntos; soltar um não solta o outro — teste da Task 1.
3. `pointercancel`, perda de foco e saída de partida limpam comandos retidos — teste da Task 1 e teste de navegador da Task 3.
4. Teclado e toque simultâneos não perdem direções ou ação — teste da Task 1.
5. Um celular e um PC recebem a mesma partida, inclusive resposta de Enigmas com identidade de rodada — teste de navegador da Task 3.

---

### Task 1: Entrada de toque

**Files:**
- Create: `src/client/touch-controls.js`
- Modify: `src/shared/input.js`
- Test: `tests/touch-controls.test.js`
- Test: `tests/input.test.js`

**Interfaces:**
- `createTouchState()` retorna `{ press(pointerId, control), release(pointerId), frame(), reset() }`. `control` é uma das chaves `up`, `down`, `left`, `right`, `action`.
- `bindTouchControls(root, state, target = window)` observa botões `[data-control]` via pointer events e limpa o estado em `blur` e `visibilitychange`.
- `mergeFrames(keyboardFrame, touchFrame)` retorna um `InputFrame` com OR por campo, inclusive `actionPressed`.

- [ ] **Step 1: Write failing tests.** Em `tests/touch-controls.test.js`, provar toque rápido; ação mantida; dois dedos independentes; cancelamento/reset. Em `tests/input.test.js`, provar `mergeFrames` com teclado e toque simultâneos.
- [ ] **Step 2: Run `node --test tests/touch-controls.test.js tests/input.test.js`; expect RED** por interfaces ausentes.
- [ ] **Step 3: Implement the three interfaces** sem alterar o formato enviado ao servidor. Capturar o ponteiro no botão quando disponível; liberar em `pointerup`, `pointercancel` e `lostpointercapture`.
- [ ] **Step 4: Run `node --test tests/touch-controls.test.js tests/input.test.js`; expect PASS.**
- [ ] **Step 5: Commit** `feat: add touch input frames`.

### Task 2: Telas responsivas e controles por jogo

**Files:**
- Modify: `src/client/screens.js`
- Modify: `src/client/styles.css`
- Modify: `public/index.html` se necessário para comportamento do viewport.
- Test: `tests/screens.test.js`

**Interfaces:**
- `showGame(root, gameId, mode, playerIndex)` mantém o Canvas e adiciona botões `[data-control]` apropriados ao jogo.
- `showModes` oculta dupla local em dispositivo de toque por CSS; textos do menu, sala e partida explicam a orientação e os comandos.
- O Canvas preserva 960 × 600 internamente, ajustando-se sem corte à largura/altura disponíveis.

- [ ] **Step 1: Write failing screen tests** para botões de cada jogo, texto mobile e ausência de botões não pertinentes ao jogo.
- [ ] **Step 2: Run `node --test tests/screens.test.js`; expect RED.**
- [ ] **Step 3: Implement markup and CSS** para menus estreitos, partida horizontal com botões grandes, aviso vertical, áreas seguras e prevenção de rolagem nos controles.
- [ ] **Step 4: Run `node --test tests/screens.test.js`; expect PASS.** Conferir visualmente 667 × 375, 844 × 390, celular vertical e desktop.
- [ ] **Step 5: Commit** `feat: add responsive mobile game screens`.

### Task 3: Ligar entrada ao ciclo e verificar crossplay

**Files:**
- Modify: `src/client/main.js`
- Modify: `README.md`
- Test: `tests/input.test.js` ou `tests/touch-controls.test.js` para integração de quadros, se a Task 1 não a cobrir integralmente.

**Interfaces:**
- Solo e online chamam `mergeFrames(keyboard.frames(1)[0], touchState.frame())` para o jogador 1. Dupla local mantém os dois quadros de teclado.
- `stop()` limpa toque, teclado e animação; Enigmas online anexa `round` ao quadro mesclado.

- [ ] **Step 1: Add failing integration test** para um toque rápido consumido uma vez pelo quadro mesclado e `reset` na saída.
- [ ] **Step 2: Run targeted tests; expect RED.**
- [ ] **Step 3: Wire touch controls into `main.js` and update README** com orientação, modos e comandos de cada jogo; corrigir a contagem de perguntas de Enigmas para doze.
- [ ] **Step 4: Run `npm test`; expect all PASS.** Em navegador, abrir os quatro jogos solo em viewport mobile, verificar rotação/saída, e iniciar uma sala pública com um navegador mobile e outro desktop, confirmando P1/P2 e a pergunta atual de Enigmas.
- [ ] **Step 5: Commit** `feat: enable mobile and desktop crossplay`.

### Task 4: Publicar e conferir

**Files:** nenhum arquivo adicional previsto.

- [ ] **Step 1: Run final `npm test` and `git diff --check`; expect PASS and clean diff.**
- [ ] **Step 2: Push tested branch to `origin/main`** sem force push; resolver qualquer divergência antes de publicar.
- [ ] **Step 3: Trigger manual deploy of the existing Render Web Service** (repositório público ligado sem auto-deploy) e aguardar `Deploy succeeded`.
- [ ] **Step 4: Open `https://intervalo-arcade.onrender.com`**, conferir layout mobile/desktop e entrada na mesma sala por dois navegadores. Entregar o link público e mencionar a rotação horizontal para partidas.
