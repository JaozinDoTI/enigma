# SPEC 04 — implementação

## Continuidade

`js/transition-director.js` centraliza a saída de todas as fases. Cada conclusão cria um `pendingTransition` persistente em memória com origem, destino, modo, mundos, movimento e estado. Fases automáticas são aceitas pelo diretor; as demais apresentam uma ação explícita e focável. A matriz dos 24 limites está em `js/puzzles/catalog.js`.

O destino só é descoberto quando o handoff é aceito. Durante a troca, a próxima cena é montada atrás de um overlay global, evitando o frame intermediário e a dupla animação anterior.

## Movimento entre mundos

O handoff possui linguagens direcionais para PC → TV, TV/ambiente → PC, celular e documento. O movimento combina recuo, elevação, pan, oclusão e chegada. Transições na mesma superfície usam uma passagem curta. `prefers-reduced-motion` mantém apenas fade e identificação textual do destino.

## Celular

O antigo botão textual foi substituído por um aparelho parcialmente apoiado na borda. A tela do objeto acende, mostra preview e usa padrões distintos para mensagem, chamada, nota e arquivo. Abrir o telefone executa pickup com perspectiva, sombra e backdrop; o controle inferior abaixa o aparelho.

Notificações agora possuem `status`, `arrivedAt` e `openedAt`. Consultar uma notificação não remove o histórico. O Behavior Director pode entregar sequências com consequências posteriores, como chamada seguida por nota ou arquivo criado após quarentena.

## Áudio

O master inicial passou para `0.65`; buses de device, signal, narrative e impact receberam mais presença, enquanto ambience continua abaixo. Chamadas, gravações e previews acionados manualmente fazem duck da ambiência, impedem reprodução concorrente e exibem estado visual durante o áudio.

As trocas de mundo possuem cues de cadeira, passos, ativação do Receiver, pickup do telefone e retorno do computador. O crossfade ambiental continua sendo feito pelo motor existente quando a cena de destino é montada.

## Desenvolvimento

`?dev=1` permite limpar uma transição pendente além dos controles anteriores. O estado completo continua visível para inspeção de `pendingTransition`, ciclo das notificações, seed e orçamento do diretor.

## Restrições preservadas

- nenhum progresso é persistido localmente;
- não há Browser Notifications;
- eventos críticos continuam determinísticos;
- mute continua global;
- toda gravação importante possui legenda textual;
- bundles devem ser regenerados depois das fontes modulares.
