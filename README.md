# Intervalo Arcade

Uma plataforma para celular e computador com quatro jogos rápidos: Arena de Sobrevivência, Duelo de Enigmas, Corrida de Obstáculos e Defesa de Torre Compacta. Cada jogo tem modo solo e sala online de dois a quatro jogadores; no computador também há dupla no mesmo teclado.

## Começar

É necessário ter Node.js 18 ou mais recente. Nesta pasta, execute:

```powershell
npm install
npm start
```

Abra **http://localhost:3000** no navegador. Para usar outra porta, defina a variável `PORT` antes de iniciar o servidor.

```powershell
$env:PORT = 4000
npm start
```

Escolha um jogo e depois **Jogar sozinho** ou **Sala online**. No computador, também existe **Mesmo computador**. Os recordes solo ficam salvos no navegador usado para jogar. No celular, gire o aparelho na horizontal antes de iniciar a partida; os botões aparecem na tela.

## Controles

| Jogo | Jogador 1 | Jogador 2 no mesmo computador |
| --- | --- | --- |
| Arena | WASD para mover; Espaço para atacar | Setas para mover; Enter para atacar |
| Enigmas | A/D para escolher; Espaço para responder | ←/→ para escolher; Enter para responder |
| Corrida | Espaço para pular | Enter para pular |
| Defesa | WASD para escolher posição; Espaço para construir ou melhorar | Setas para escolher; Enter para construir ou melhorar |

Em uma sala online, cada pessoa usa os controles do jogador 1 no próprio dispositivo. Na Arena, segurar o comando de ataque repete os golpes. Nos outros jogos, cada pressionamento executa uma ação.

No celular, use os botões de toque na horizontal: setas e **ATACAR** na Arena; setas e **RESPONDER** nos Enigmas; **PULAR** na Corrida; setas e **CONSTRUIR** na Defesa. Não há dupla no mesmo celular. Celulares e computadores podem entrar juntos na mesma sala online pelo mesmo link e código.

## Jogar em computadores diferentes

Uma pessoa escolhe **Sala online → Criar sala** e compartilha o código de seis caracteres. As outras escolhem **Sala online → Entrar com código**. O criador pode iniciar assim que houver pelo menos duas pessoas; a sala aceita até quatro. Se alguém sair ou perder a conexão, a sala é encerrada para todos.

Na mesma rede local, os outros computadores podem abrir `http://IP-DO-COMPUTADOR-QUE-RODA-O-SERVIDOR:3000`. O firewall do computador precisa permitir conexões à porta usada. Todos devem acessar o mesmo servidor.

Para jogar pela internet, hospede este projeto em um servidor Node.js acessível publicamente que aceite conexões WebSocket. No servidor, execute `npm ci` e `npm start`, configure a variável `PORT` conforme a hospedagem e publique HTTP e WebSocket no mesmo domínio. Em HTTPS, a conexão do jogo usa `wss://` automaticamente. Compartilhe o endereço público do site e depois o código da sala. A execução local em `localhost` só é visível para o próprio computador.

## Jogos

- **Arena:** sobrevivam às ondas por até três minutos. A equipe compartilha a pontuação, e a dificuldade cresce com mais jogadores.
- **Enigmas:** doze perguntas de cálculo e padrões. A primeira resposta certa aceita marca o ponto da rodada; erro bloqueia apenas aquele jogador até a próxima pergunta.
- **Corrida:** salte os obstáculos e chegue primeiro. Obstáculos são iguais para todos; tropeçar causa atraso. No solo, tente baixar seu tempo.
- **Defesa:** construam torres por 40 recursos e melhorem por 50 ou 100. A equipe compartilha recursos e precisa proteger a base por seis ondas.

## Testes

```powershell
npm test
```

As salas e partidas existem apenas enquanto o servidor e os participantes estiverem conectados. Não há contas nem ranking global.
