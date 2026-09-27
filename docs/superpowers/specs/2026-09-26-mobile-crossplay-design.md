# Intervalo Arcade no celular — desenho

## Objetivo e alcance

Permitir partidas solo em celular e salas online compartilhadas entre celulares e computadores, inclusive uma sala formada apenas por celulares. O limite online continua de dois a quatro participantes. No celular, a partida é jogada na horizontal; a navegação pelo menu e pela sala funciona também na vertical. Dupla local no mesmo aparelho não faz parte desta adaptação. No computador, os modos e controles existentes permanecem.

## Experiência no celular

- A página inicial, escolha de modo, sala e resultado cabem na largura do celular sem rolagem horizontal. O texto da página inicial deixa de afirmar que o produto é apenas para PC.
- Em dispositivo com toque, a escolha de modo oferece solo e sala online. A opção de dois jogadores no mesmo teclado fica disponível no computador. Menu e sala avisam para girar o celular antes de iniciar uma partida.
- Durante a partida, um layout horizontal usa o espaço disponível para o Canvas e oferece botões grandes, com rótulos acessíveis, nas laterais ou na área inferior. Nenhum botão depende de passar o mouse. Uma indicação para girar o aparelho aparece caso ele esteja na vertical; no online o servidor continua conduzindo a partida, então a orientação deve ser corrigida antes de começar.
- Arena oferece direções e ataque; Enigmas oferece anterior, próxima e responder; Corrida oferece pular; Defesa oferece direções e construir/melhorar. Os rótulos de instrução da partida descrevem os controles de toque no celular e o teclado no computador.
- O Canvas mantém as coordenadas lógicas de 960 × 600 usadas pelos jogos. O navegador o ajusta à área restante sem distorcer ou cortar conteúdo. A interface deve ser legível e utilizável em larguras horizontais de aproximadamente 667 a 844 pixels, além do desktop existente.

## Entrada e integração

- Um módulo de controles de toque converte botões pressionados em `InputFrame` (`up`, `down`, `left`, `right`, `action`, `actionPressed`), o mesmo formato usado pelo teclado, sem alterar modelos de jogo nem protocolo WebSocket.
- Pressionar e soltar entre dois quadros ainda gera uma ação; segurar não repete `actionPressed`. Direção e ação podem ser mantidas simultaneamente, e `pointerup`, `pointercancel`, perda de foco, mudança de visibilidade ou saída da partida liberam os estados retidos.
- O ciclo solo e o envio online combinam teclado e toque em um único quadro. A identidade da rodada dos Enigmas continua acompanhando os comandos online para impedir respostas atrasadas.
- As salas, códigos, limite de quatro participantes e fechamento por desconexão permanecem iguais. Todos acessam o mesmo endereço público HTTPS/WSS.

## Verificação e entrega

- Testes automatizados cobrem toque rápido, ação mantida, vários toques, cancelamento e reset, além da combinação com o teclado. A suíte existente deve continuar passando.
- Conferir visualmente menu, modos, sala, Canvas e controles nos tamanhos de celular horizontal, celular vertical para navegação/aviso e desktop. Iniciar cada jogo em solo com toque e uma sala online com um navegador móvel e outro de desktop; verificar que celulares também podem compartilhar uma sala.
- Atualizar o README com orientação horizontal e controles por jogo. Publicar a versão no repositório GitHub e fazer novo deploy do serviço Render existente; verificar o endereço público antes de entregar.

## Fora de escopo

Não há dupla no mesmo celular, controles por gesto no Canvas, instalação como aplicativo, contas, mudanças nas regras ou aumento do limite de quatro jogadores online.
