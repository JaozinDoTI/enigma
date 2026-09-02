# Arquitetura final

## Camadas

```text
index.html
  ├─ css/*                     identidade fria → quente, ambientes, corrupção, TV e puzzles
  └─ js/app.js                 bootstrap e tratamento dos QR nodes
       ├─ router.js            navegação por #/record/NN
       ├─ state.js             estado global em memória durante a sessão
       ├─ progression.js       respostas, mutações e transições de domínio
       ├─ events.js            registro global e roteamento para domínios
       ├─ events/computer.js   alternância local entre fase e Arquivo
       ├─ events/desktop-os.js janelas, foco, drag e recursos do computador
       ├─ events/phone.js      patch local do chassis e aplicativos
       ├─ events/receiver.js   operação material do Receiver
       ├─ events/clock.js      calibração temporal do computador
       ├─ events/bookscan.js   zoom e marcação direta das lombadas
       ├─ events/navigation.js rotas, hints e controles globais
       ├─ events/puzzle-actions.js interações de documento e evidência
       ├─ events/reconstruction.js alternativa de teclado e posicionamento espacial
       ├─ scene-renderer.js    componentes narrativos por mecânica
       ├─ view.js              composição de cena, foco e modo imersivo
       ├─ phase-one-computer.js sistema gráfico fictício, recursos e janelas da etapa 01
       ├─ computer-runtime.js overlays de arquivo, payloads, quarentena, navegação e reboot fictício
       ├─ worlds/world-events.js agenda e entrega efeitos entre worlds
       ├─ experience.js        ato, papel, área e corrupção derivados
       ├─ motion-engine.js     scheduler, timelines e eventos de motion
       ├─ narrative-events.js  mutações silenciosas finitas
       ├─ evidence-board.js    evidências, COLD_STORAGE, identidade e receptor
       ├─ room-model.js        relações espaciais do quarto
       ├─ tv.js/audio.js       aparelho persistente e áudio desacoplado
       ├─ config.js            todos os dados pessoais/configuráveis
       ├─ data/*               logs, memórias, conteúdo e dicas
       └─ puzzles/catalog.js   contrato canônico dos 25 registros
```

## Fases como cenários

A estrutura compartilhada das fases não imersivas possui apenas `phase-rail + phase-stage`. A rail orienta progressão, revisita, objetivo e pistas; não contém inspector nem ferramentas concorrentes. O stage muda de gramática conforme a fase. Na etapa 01 ele é a tela de um sistema gráfico fictício com pastas e janelas locais; no Receiver, documento e reconstrução, a própria composição de cena assume o objeto operado. Experiências como a TV podem ocultar a rail temporariamente.

## Movimento e áudio

`motion-engine.js` é o scheduler de efeitos narrativos. `world-events.js` separa evento, agendamento e entrega; uma mensagem não entra na conversa antes da vibração/notificação. `audio.js` mantém ambiências procedurais por world, one-shots irregulares e a assinatura de três impactos da fonte desconhecida.

## Estado global em memória

O objeto `gameState` mantém durante a página aberta:

- registros desbloqueados e concluídos separadamente;
- respostas e contagem de tentativas por registro;
- nível de dica utilizado por registro;
- flags narrativas e nodes físicos;
- TV (energia, canal, volume e transmissões);
- relógios independentes do computador e do telefone;
- efeitos entre worlds agendados e entregues separadamente;
- histórico de chamadas, mensagens entregues e notificações do telefone;
- posições do quarto virtual;
- ordem de fragmentos, relações, seleção espacial e estado das janelas do computador da etapa 01;
- overlays dinâmicos dos arquivos, contagem de leituras, quarentena, histórico/busca do Explorer e processos fictícios;
- estado da shell e do boot simulado, independente de recarregar a página;
- visitas, retornos, eventos e estatísticas;
- horário inicial, último progresso e configurações de áudio.

Manter apenas a “fase atual” impediria retornos, descobertas antecipadas e mudanças silenciosas durante a sessão. Por isso cada evidência vive em flag própria. O estado não é gravado no navegador: recarregar ou fechar a página reinicia a experiência.

## Filesystem em runtime

`phase-one-computer.js` mantém os recursos-base imutáveis. `computer-runtime.js` resolve os overlays da sessão: variante, visibilidade, tamanho, origem, comportamento, número de leituras, quarentena e última mutação. Assim `REG_101000.idx` continua sendo um único arquivo, embora seu conteúdo e seus metadados possam divergir depois da revisita.

Payloads narrativos são determinísticos e governados por flags, registros desbloqueados, relógio e número de abertura. Eventos cosméticos podem variar, mas nenhuma pista crítica depende de RNG. O reboot de `INTEGRIDADE.exe` desmonta e remonta apenas a shell fictícia; progresso, telefone, Receiver, evidências e janelas permanecem no estado da sessão.

## Rotas

- Registro: `#/record/01` até `#/record/25`
- Nodes móveis: `node.html?node=green`, `yard`, `room` e `books`
- Desenvolvimento: `?dev=1`

Os nodes usam uma página móvel própria. O celular entrega uma assinatura de retorno; o terminal principal controla em memória quando essa assinatura pode avançar a história, sem sincronização automática entre dispositivos.

## Decisões de puzzle

- A dificuldade fica em reconhecer o meio: TV, objeto físico, retorno, disposição espacial.
- Morse e binário mostram agrupamento e aceitam resposta simples.
- Duas telas antigas mudam: EVENT_1010 e VX_RECEIVER.
- O falso final ocorre antes dos dois últimos nodes, deixando espaço para uma segunda queda narrativa.
- O BOOKSCAN recupera `03:17`; o relógio da estação reage à calibração e, perto do fim, precisa voltar à origem `10:10` para liberar as cadeias finais.
- A última operação concatena `520` e `1314`; a interpretação é recuperada pelo próprio sistema depois da entrada `5201314`.

## Acessibilidade

- Toda informação sonora importante possui representação visual.
- TV e glitches evitam flashes rápidos.
- `prefers-reduced-motion` desativa transições relevantes.
- Controles são elementos semânticos de botão/formulário.
- A reconstrução aceita drag ou seleção de objeto + âncora por teclado.
- ESC fecha documento, retorna do Arquivo à fase ou sai de uma cena imersiva.
- A escala tipográfica e os alvos principais partem de tamanhos legíveis e hitbox de 44px.

## Segurança do conteúdo final

O navegador precisa receber qualquer conteúdo que mostra; portanto não há segredo absoluto no front-end. O projeto deixa URLs finais vazias e centralizadas. Web Crypto pode elevar o custo de inspeção, mas não substitui autorização no servidor.
