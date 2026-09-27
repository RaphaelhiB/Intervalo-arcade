# Plataforma de quatro jogos para intervalos

## Objetivo

Criar uma plataforma para computador, aberta no navegador, com quatro jogos de partidas curtas. Uma pessoa deve conseguir jogar sozinha; duas pessoas devem conseguir jogar no mesmo computador; de duas a quatro pessoas devem conseguir jogar online. A entrada em partidas online usa um código de sala e não exige conta.

## Experiência compartilhada

- A página inicial mostra Arena de Sobrevivência, Duelo de Enigmas, Corrida de Obstáculos e Defesa de Torre Compacta.
- Antes da partida, o jogador escolhe solo, dupla local ou sala online. Na sala online, uma pessoa cria a sala e compartilha o código; até três outras entram com esse código. O criador inicia a partida quando houver de dois a quatro participantes.
- Cada jogo apresenta instruções curtas, controles, pontuação ou tempo, resultado e opção de jogar novamente. As partidas devem caber em aproximadamente três a cinco minutos.
- Os melhores resultados solo ficam salvos no navegador. Não há conta, perfil, compras ou chat.
- A interface é feita para teclado e mouse de computador. O jogador 1 usa WASD e Espaço; o jogador 2 usa as setas e Enter. Cada jogo mostra o significado dessas ações antes de começar. Em partidas online, cada participante usa os controles de jogador 1 em seu próprio computador.

## Jogos

### Arena de Sobrevivência

Arena vista de cima. O jogador se move, ataca e evita inimigos que surgem em ondas. A partida termina quando o tempo acaba ou todos perdem a vida. No solo, a meta é sobreviver e superar a pontuação. Com dois a quatro jogadores, todos cooperam e somam pontos; a dificuldade cresce com o grupo.

### Duelo de Enigmas

Rodadas de perguntas curtas de lógica, padrões e cálculo com quatro alternativas. O jogador navega entre respostas e confirma. No solo, resolve uma sequência progressiva contra o relógio. Com dois a quatro jogadores, todos recebem a mesma pergunta ao mesmo tempo; a primeira resposta correta aceita marca ponto. Uma resposta errada bloqueia apenas aquele jogador até a próxima pergunta. O vencedor tem mais pontos ao fim das rodadas.

### Corrida de Obstáculos

Corrida lateral de pista curta com salto e obstáculos previsíveis. No solo, o objetivo é concluir no menor tempo e superar o recorde. Com dois a quatro jogadores, todos correm simultaneamente em pistas equivalentes; vence quem chega primeiro. Colisões atrasam o corredor, sem encerrar a partida.

### Defesa de Torre Compacta

Um mapa pequeno, caminho fixo e ondas de inimigos que tentam chegar à base. O jogador seleciona posições, instala torres e melhora torres com recursos ganhos ao derrotar inimigos. No solo, busca sobreviver a todas as ondas com a maior vida de base possível. Com dois a quatro jogadores, todos compartilham recursos e cooperam na defesa. A partida termina quando a base cai ou a última onda é vencida.

## Estrutura técnica

- Interface em HTML/CSS e jogos desenhados em Canvas, com módulos JavaScript para menu, controles, interface de partida e cada jogo. Recursos visuais simples são desenhados no próprio Canvas.
- Um servidor Node.js entrega a página e mantém conexões WebSocket para salas online de dois a quatro jogadores. Ele valida código, entrada, início, desconexão e ações de jogo.
- A lógica de regras de cada jogo é compartilhada entre navegador e servidor. Solo e dupla local rodam no navegador; nas salas online, o servidor conduz o estado da partida e envia atualizações a todos os participantes. Entradas do jogador seguem para o servidor, que calcula o resultado. Isso evita divergências de estado e resultados conflitantes.
- As salas existem apenas enquanto os jogadores estão conectados. A perda de conexão encerra a partida com uma mensagem e oferece retorno ao menu. Código inválido e sala cheia produzem mensagens claras.
- Para jogar pela internet, o servidor precisa estar hospedado em um endereço público com suporte a WebSocket. A entrega inclui instruções para executar localmente e configurar essa hospedagem. Sem um servidor público, os modos solo e dupla local funcionam no próprio computador, e o modo online funciona apenas onde os dois navegadores alcançarem o servidor.

## Verificação e limites

- Verificar inicialização, menu, controles, término e reinício dos quatro jogos em solo e dupla local.
- Testar criação e entrada de sala, mínimo de dois e limite de quatro participantes, início sincronizado, troca de ações e desconexão em quatro navegadores.
- Testar as regras centrais isoladamente: pontuação, colisões, respostas, ondas e condição de vitória ou derrota.
- A primeira versão prioriza partidas completas e legíveis. Não inclui contas, ranking global, editor de fases, chat, celular, mais de dois jogadores locais ou mais de quatro online.
