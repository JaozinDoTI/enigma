# Arquitetura final

## Camadas

```text
index.html
  ├─ css/*                     identidade fria → quente, ambientes, corrupção, TV e puzzles
  └─ js/app.js                 bootstrap e tratamento dos QR nodes
       ├─ router.js            navegação por #/record/NN
       ├─ state.js/storage.js  estado global robusto e persistência
       ├─ progression.js       respostas, mutações e transições de domínio
       ├─ events.js            delegação de interações e orquestração
       ├─ scene-renderer.js    componentes narrativos por mecânica
       ├─ view.js              shell dos cinco ambientes e DEV console
       ├─ experience.js        ato, papel, área e corrupção derivados
       ├─ motion-engine.js     scheduler, timelines e eventos de motion
       ├─ narrative-events.js  mutações silenciosas finitas
       ├─ evidence-board.js    evidências, COLD_STORAGE, identidade e receptor
       ├─ room-model.js        relações espaciais do quarto
       ├─ tv.js/audio.js       aparelho persistente e áudio desacoplado
       ├─ config.js            todos os dados pessoais/configuráveis
       ├─ data/*               logs, memórias, conteúdo e dicas
       └─ puzzles/*            25 descritores e contratos narrativos
```

## Ambientes persistentes

O shell mantém cinco ambientes no mesmo software: ARQUIVO, RECEPTOR, EVIDÊNCIAS, ARMAZENAMENTO FRIO e IDENTIDADE. Os 25 registros continuam endereçáveis, mas deixam de se comportar como páginas independentes. O RECEPTOR possui um beacon sempre visível depois de desbloqueado e pode sofrer eventos silenciosos fora de sua cena principal.

## Movimento e áudio

`motion-engine.js` é o único scheduler de efeitos narrativos. Ele executa sequências nomeadas, controla cancelamento e emite eventos como `motion:error`, `motion:complete`, `tv:channel`, `entity:detected` e `memory:restored`. `audio.js` apenas escuta esses eventos; puzzles não disparam beeps de sucesso/erro diretamente.

## Estado global

O objeto `gameState` persiste:

- registros desbloqueados e concluídos separadamente;
- respostas e contagem de tentativas por registro;
- nível de dica utilizado por registro;
- flags narrativas e nodes físicos;
- TV (energia, canal, volume e transmissões);
- posições do quarto virtual;
- ordem de fragmentos e escolhas do meta;
- visitas, retornos, eventos e estatísticas;
- horário inicial, último progresso e configurações de áudio.

Salvar apenas “fase atual” impediria retornos, descobertas antecipadas e mudanças silenciosas. Por isso cada evidência vive em flag própria.

## Rotas

- Registro: `#/record/01` até `#/record/25`
- Node móvel da escrivaninha: `node.html?node=desk`
- Node móvel da estante: `node.html?node=books`
- Desenvolvimento: `?dev=1`

Os nodes usam uma página móvel própria porque o celular e o notebook não compartilham `localStorage`. O celular entrega uma assinatura de retorno; o terminal principal controla quando essa assinatura pode avançar a história.

## Decisões de puzzle

- A dificuldade fica em reconhecer o meio: TV, objeto físico, retorno, disposição espacial.
- Morse e binário mostram agrupamento e aceitam resposta simples.
- Duas telas antigas mudam: EVENT_1010 e VX_RECEIVER.
- O falso final ocorre antes dos dois últimos nodes, deixando espaço para uma segunda queda narrativa.
- O meta não introduz cifra nova; apenas exige relacionar os três códigos VX com os registros físicos já anotados.

## Acessibilidade

- Toda informação sonora importante possui representação visual.
- TV e glitches evitam flashes rápidos.
- `prefers-reduced-motion` desativa transições relevantes.
- Controles são elementos semânticos de botão/formulário.
- Contraste e tamanho foram pensados para notebook.

## Segurança do conteúdo final

O navegador precisa receber qualquer conteúdo que mostra; portanto não há segredo absoluto no front-end. O projeto deixa URLs finais vazias e centralizadas. Web Crypto pode elevar o custo de inspeção, mas não substitui autorização no servidor.
