# SPEC 04 — CONTINUIDADE, PRESENÇA E TRANSIÇÕES FÍSICAS

## Rework definitivo da progressão entre mundos, presença do celular e inteligibilidade sonora

Atue simultaneamente como:

- Senior Creative Front-End Engineer;
- Game Systems Designer;
- Interaction Designer;
- Technical Sound Designer;
- Motion Designer especializado em interfaces diegéticas;
- UX Engineer com foco em acessibilidade e continuidade de fluxo.

Esta SPEC parte da implementação da SPEC 03. Ela não pede um novo jogo nem uma substituição estética indiscriminada. O objetivo é corrigir a continuidade quebrada, transformar mudanças de dispositivo em deslocamentos físicos perceptíveis e fazer o celular parecer uma presença autônoma no ambiente.

---

# 1. TEXTO ORIGINAL REVISADO

Depois da última implementação, a progressão deixou de conduzir com segurança à próxima fase. Em vários momentos, principalmente quando a narrativa precisa trocar de computador para TV, celular ou ambiente físico, a fase é concluída, mas a experiência permanece na tela anterior sem apresentar uma continuação clara.

As notificações do celular ainda não causam tensão nem parecem suficientemente vivas. Elas se comportam como avisos comuns de interface, e não como acontecimentos dentro do ambiente. O controle usado para abrir o celular também parece um botão flutuante genérico, em vez de representar o ato de pegar um aparelho que está próximo da jogadora.

Os sons do computador e do celular estão baixos, especialmente gravações, chamadas e conteúdos que possuem a ação “ouvir”. Esses conteúdos precisam ter presença, clareza e prioridade sobre a ambiência.

Quero uma revisão sistêmica desses pontos. A mudança entre computador e TV deve incluir uma animação que sugira deslocamento físico ou troca de assento: afastar-se de um aparelho, mover-se pelo cômodo e aproximar-se do outro. O resultado deve aumentar imersão, continuidade e tensão sem comprometer acessibilidade, desempenho ou clareza.

---

# 2. DIAGNÓSTICO TÉCNICO ATUAL

## 2.1. Causa do bloqueio de progressão

O fluxo atual possui esta combinação:

1. `completePuzzle()` conclui a fase, desbloqueia a próxima e mantém `currentPuzzle` na fase concluída;
2. `progress()` renderiza novamente a fase atual para mostrar a revelação de título;
3. a navegação posterior só acontece se `nextPuzzle.visibility === "immediate"`;
4. a maior parte do catálogo usa `visibility: "latent"`;
5. nem toda fase latente possui, na tela que permaneceu aberta, um ponto de entrada visível e acionável;
6. o trilho não mostra registros latentes.

O resultado é um dead-end de UX: o estado interno sabe que existe uma próxima fase, mas a jogadora não recebe uma ação possível.

## 2.2. Fragmentação das regras de navegação

A progressão está distribuída entre:

- `events.js`;
- `state.js`;
- `router.js`;
- `renderReturnControl()`;
- botões específicos com `data-action="navigate"`;
- pontos de entrada criados por arquivos, telefone e Receiver.

Não existe um único resolvedor que garanta a continuidade depois de toda conclusão.

## 2.3. Transição visual atual

`scene-transition` aplica efeitos sobre `#app`, como compressão vertical, contraste, blur e fade. Esses efeitos comunicam troca de interface, mas não comunicam deslocamento no quarto. Computador e TV parecem duas páginas diferentes, não dois objetos ocupando lugares diferentes.

## 2.4. Celular atual

O celular fechado é representado por um pequeno botão textual fixo no canto. A abertura apenas alterna `hidden` e mostra o aparelho. A notificação aparece como um cartão separado acima do controle. Isso reduz presença física e faz o evento parecer um toast convencional.

## 2.5. Áudio atual

O master inicia em `0.45`. Os buses `device`, `ui` e `signal` ficam entre `0.42` e `0.50`, e várias reproduções importantes ainda sobrescrevem o volume para valores entre `0.035` e `0.10`. A multiplicação master × bus × evento deixa gravações e assinaturas narrativas excessivamente baixas.

---

# 3. OBJETIVOS DO REWORK

1. Eliminar qualquer situação em que uma fase seja concluída sem continuação acionável.
2. Preservar fases latentes sem esconder da jogadora a próxima ação.
3. Transformar trocas de mundo em deslocamentos físicos legíveis.
4. Fazer o celular existir como objeto no cômodo, mesmo quando fechado.
5. Fazer notificações criarem antecipação, invasão e consequência, não apenas informação.
6. Tornar gravações e chamadas claramente audíveis sem destruir a dinâmica sonora.
7. Manter caminhos equivalentes para teclado, toque e `prefers-reduced-motion`.

---

# 4. REGRA INVIOLÁVEL DE CONTINUIDADE

Toda fase concluída precisa terminar em exatamente um dos seguintes resultados:

- `AUTO_CONTINUE`: continuação imediata no mesmo objeto ou na mesma ferramenta;
- `WORLD_HANDOFF`: convite explícito para se deslocar até outro dispositivo;
- `DIEGETIC_ENTRY`: um novo arquivo, aplicativo, mensagem ou objeto aparece de modo visível e acionável na tela atual;
- `PHYSICAL_HANDOFF`: uma instrução inequívoca pede uma ação fora da tela;
- `FINAL`: encerramento real.

Nunca permitir:

- fase concluída com apenas uma mensagem de sucesso;
- próxima fase latente sem ponto de entrada renderizado;
- botão de retorno apontando para um registro ainda não descoberto sem explicar a ação;
- dependência exclusiva do trilho para continuar;
- troca silenciosa de `currentPuzzle` sem transição visual;
- navegação para `undefined` quando `next` estiver vazio.

---

# 5. NOVO TRANSITION DIRECTOR

Criar um módulo único, por exemplo:

`js/transition-director.js`

Responsabilidades:

- receber a conclusão de uma fase;
- resolver a próxima fase e o tipo de handoff;
- registrar `pendingTransition` no estado;
- garantir que a próxima ação exista no DOM;
- controlar revelação do título, movimento, áudio, descoberta e rota;
- impedir múltiplas transições concorrentes;
- recuperar a sessão se a tela for renderizada novamente no meio do handoff.

Estado mínimo:

```js
pendingTransition: {
  from: '02',
  to: '03',
  mode: 'WORLD_HANDOFF',
  fromWorld: 'computer',
  toWorld: 'tv',
  status: 'offered',
  createdAt: 0
}
```

Estados permitidos:

`idle → preparing → offered → moving → arrived → idle`

## API esperada

```js
resolveCompletion(fromId)
offerTransition(plan)
acceptTransition(plan)
completeTransition(plan)
recoverPendingTransition()
```

Somente `acceptTransition()` pode:

- marcar o destino como descoberto;
- alterar a rota;
- alterar o mundo de áudio;
- consumir o handoff pendente.

`router.navigate()` não deve ser responsável por descobrir silenciosamente qualquer fase desbloqueada. Descoberta precisa possuir uma origem semântica registrada.

---

# 6. MATRIZ OBRIGATÓRIA DE CONTINUIDADE

| Fluxo | Modo | Continuação visível |
|---|---|---|
| 01 → 02 | DIEGETIC_ENTRY | desktop inicia e o registro anômalo passa a ser investigável |
| 02 → 03 | WORLD_HANDOFF | levantar do PC e ir ao Receiver |
| 03 → 04 | AUTO_CONTINUE | o canal bloqueado entra no modo de leitura de pulsos |
| 04 → 05 | WORLD_HANDOFF | abandonar o Receiver e voltar ao computador |
| 05 → 06 | DIEGETIC_ENTRY | `ARCHIVE_170491` é montado diante da jogadora |
| 06 → 07 | WORLD_HANDOFF | fechar comparador e retornar ao desktop |
| 07 → 08 | DIEGETIC_ENTRY | pacote recuperado aparece no diretório |
| 08 → 09 | PHYSICAL_HANDOFF | a palavra LUA aponta explicitamente para o quarto |
| 09 → 10 | WORLD_HANDOFF | voltar ao computador; o primeiro registro mudou |
| 10 → 11 | DIEGETIC_ENTRY | `OBJETO_C.thumb` ganha uma ação forense inequívoca |
| 11 → 12 | WORLD_HANDOFF | o celular vibra; ação “pegar celular” |
| 12 → 13 | WORLD_HANDOFF | abaixar celular e deslocar-se até o Receiver |
| 13 → 14 | WORLD_HANDOFF | retornar ao PC; `BOOKSCAN.exe` está ativo |
| 14 → 15 | DIEGETIC_ENTRY | relógio da barra reage ao horário recuperado |
| 15 → 16 | PHYSICAL_HANDOFF | `0317.REC` aponta para a cabeceira |
| 16 → 17 | WORLD_HANDOFF | deslocar-se da cabeceira até o Receiver |
| 17 → 18 | PHYSICAL_HANDOFF | sinal validado aponta para a margem externa |
| 18 → 19 | AUTO_CONTINUE | contorno recuperado abre o modelo de vínculos |
| 19 → 20 | WORLD_HANDOFF | entrar na reconstrução do cômodo |
| 20 → 21 | WORLD_HANDOFF | voltar ao computador para testar integridade |
| 21 → 22 | PHYSICAL_HANDOFF | ruptura aponta para baixo das histórias |
| 22 → 23 | WORLD_HANDOFF | retornar ao computador e restaurar a hora |
| 23 → 24 | DIEGETIC_ENTRY | `RECUPERAR_FINAL.exe` torna-se acionável |
| 24 → 25 | FINAL | transição para recuperação completa |

Cada linha deve possuir um contrato correspondente no catálogo. Nenhum par pode depender de comportamento implícito.

---

# 7. HANDOFF VISÍVEL

Quando o modo for `WORLD_HANDOFF`, não navegar sozinho imediatamente.

Depois da revelação do título, renderizar um cartão diegético curto dentro da cena:

```text
O SINAL CONTINUA À SUA DIREITA
[LEVANTAR E IR AO RECEIVER]
```

ou:

```text
O COMPUTADOR TERMINOU DE INDEXAR
[VOLTAR À MESA]
```

O texto precisa:

- nomear uma ação física;
- informar o objeto de destino;
- ser o foco de teclado após aparecer;
- permanecer disponível até ser acionado;
- sobreviver a re-renderizações;
- não depender de timer para desaparecer.

Após 20 segundos sem ação, pode receber apenas uma alteração sutil de luz. Não exibir toast insistente.

---

# 8. TRANSIÇÃO “TROCA DE ASSENTO”

## 8.1. Conceito

A câmera não teletransporta entre interfaces. Ela abandona um objeto, atravessa uma pequena distância e se acomoda diante do próximo.

## 8.2. Computador → TV

Sequência recomendada, entre 1,2 e 1,6 segundo:

1. cursor e janelas deixam de responder;
2. brilho do monitor diminui, mas a tela permanece reconhecível;
3. enquadramento recua entre 3% e 6%;
4. pequeno movimento vertical sugere levantar da cadeira;
5. câmera faz pan lateral com perspectiva e parallax de sombras;
6. uma oclusão escura curta representa passar pelo encosto ou pelo corpo;
7. ruído elétrico da TV entra antes de a imagem aparecer;
8. o gabinete do Receiver surge primeiro;
9. o fósforo da tela acende por último.

## 8.3. TV → computador

Sequência inversa, mas não espelhada mecanicamente:

1. TV reduz a portadora;
2. clique físico de desligamento ou abandono;
3. recuo do enquadramento;
4. passos curtos e cadeira deslizando;
5. monitor entra lateralmente ainda escuro;
6. barra inferior e cursor aparecem;
7. conteúdo novo pisca uma única vez.

## 8.4. Outros deslocamentos

- evidência → celular: aproximação e ato de pegar;
- celular → TV: celular desce, ambiente escurece, estática cresce fora de quadro;
- PC → objeto físico: monitor perde foco e a luz do quarto assume a cena;
- ambiente → PC: reflexo do monitor aparece antes da interface;
- documento → PC: folha/janela recua e volta a ocupar uma janela do desktop.

## 8.5. Implementação

Usar um overlay global persistente fora de `#app`, para que a troca do HTML aconteça atrás da animação sem flash preto ou frame vazio.

Estrutura sugerida:

```html
<div class="world-handoff" data-from="computer" data-to="tv">
  <div class="world-handoff__room"></div>
  <div class="world-handoff__occluder"></div>
  <p aria-live="polite">MOVENDO PARA O RECEIVER</p>
</div>
```

Não usar imagens externas como requisito. Profundidade pode ser construída com gradientes, pseudo-elementos, perspectiva e as superfícies já existentes.

## 8.6. Movimento reduzido

Com `prefers-reduced-motion: reduce`:

- remover pan, zoom e parallax;
- usar fade de 120–180 ms;
- manter o rótulo textual do destino;
- preservar os sons de confirmação, respeitando mute e volume;
- trocar foco somente depois que a nova cena existir.

---

# 9. CELULAR COMO OBJETO FÍSICO

## 9.1. Remover o aspecto de botão flutuante

Fechado, o telefone deve continuar parcialmente visível como objeto apoiado na borda inferior do ambiente.

O estado recolhido deve mostrar:

- parte do chassis;
- tela apagada ou relógio mínimo;
- brilho de borda quando existe atividade;
- badge integrado à tela, não solto sobre um texto “CELULAR”;
- área de toque mínima de 52 × 72 px.

Evitar:

- botão retangular escrito `CELULAR`;
- cartão de notificação separado do aparelho;
- surgimento instantâneo por `display: none`;
- aparência de ferramenta administrativa.

## 9.2. Máquina de estados de abertura

```text
RESTING → WAKING → LIFTING → HELD → LOWERING → RESTING
```

- `RESTING`: aparelho repousa no ambiente;
- `WAKING`: tela acende e mostra o evento pendente;
- `LIFTING`: aparelho translada, gira e aumenta;
- `HELD`: interação liberada;
- `LOWERING`: aparelho volta ao ponto de origem.

Durante `LIFTING` e `LOWERING`, bloquear apenas os controles do telefone, não toda a página indefinidamente.

## 9.3. Animação de pegar

Duração entre 520 e 760 ms:

- `transform-origin` no canto inferior correspondente;
- rotação inicial entre 4° e 8°;
- pequena inclinação em perspectiva;
- escala do estado repousado até leitura confortável;
- sombra se desprende da superfície;
- fundo recebe blur ou redução de contraste muito leve;
- conteúdo interno só se torna nítido perto do fim.

A ação para fechar deve dizer `ABAIXAR CELULAR`, inclusive fora da fase 12.

---

# 10. NOTIFICAÇÕES QUE PARECEM VIVAS

## 10.1. Princípio de medo

Medo não deve vir de excesso de glitch ou volume. Deve vir de três sensações:

1. o sistema percebeu uma ação específica da jogadora;
2. o sistema agiu enquanto não estava sendo observado;
3. o evento parece ter começado antes de ser mostrado.

## 10.2. Ciclo de vida

Cada evento de celular precisa possuir:

```text
scheduled → pre_signal → arrived → ignored|opened → consequence → resolved
```

Guardar timestamps e estado de leitura. Não reduzir tudo a `unread += 1`.

## 10.3. Sequência de chegada

Mensagem:

1. silêncio ou duck curto da ambiência;
2. vibração física curta em padrão duplo;
3. chassis se move alguns pixels;
4. tela acende dentro do aparelho recolhido;
5. remetente aparece;
6. preview surge 200–500 ms depois;
7. a luz permanece até abertura ou timeout.

Chamada:

1. vibração longa e irregular;
2. tela pulsa em baixa frequência;
3. identificação muda uma vez durante o toque, se narrativamente permitido;
4. se ignorada, torna-se chamada perdida e produz consequência posterior.

Nota ou arquivo criado sozinho:

1. não vibrar imediatamente;
2. acender a tela silenciosamente;
3. mostrar `NOTAS — editada agora` ou `ARQUIVOS — 1 item novo`;
4. usar um som mínimo de escrita, disco ou shutter somente depois.

## 10.4. Eventos encadeados

O diretor deve poder entregar sequências, não somente eventos isolados.

Exemplos:

- abrir o mesmo arquivo quatro vezes → pausa → telefone acende → “não mudou na quinta vez”;
- ignorar duas notificações → tela apaga → chamada perdida → nota criada: “você ouviu”;
- insistir no Receiver → chamada `SOURCE.03` → áudio contém a mesma portadora do canal atual;
- ficar preso na fase 06 → primeira mensagem fala da mudança; a segunda só pode existir depois e fala do que ficou parado;
- colocar arquivo em quarentena → telefone recebe uma cópia com timestamp posterior à própria ação;
- abrir a conversa antes da mensagem chegar → indicador de digitação surge sem remetente, para, e a mensagem chega apenas quando a conversa é fechada.

## 10.5. Escalonamento por ato

- Ato 1: coincidências plausíveis;
- Ato 2: referências diretas ao comportamento;
- Ato 3: conteúdo criado sem ação da jogadora;
- Ato 4: eventos atravessam PC, telefone e Receiver;
- Ato 5: o sistema antecipa uma ação, sem bloquear a conclusão.

Manter orçamento baixo. Um evento forte vale mais que cinco mensagens consecutivas.

## 10.6. Linguagem

Mensagens devem ser específicas, curtas e contextualizadas.

Preferir:

- “você fechou antes da última linha.”
- “a cópia estava aí quando você procurou?”
- “não mudou na quinta vez.”
- “a TV ainda está ligada.”
- “você deixou 03:17 no outro aparelho.”

Evitar:

- frases genéricas de terror;
- ameaças;
- exposição longa;
- mensagens que entreguem solução crítica;
- uso repetitivo de `NÚMERO NÃO SALVO` sem evolução de identidade.

---

# 11. REWORK SONORO

## 11.1. Prioridades

Separar três classes:

- `AMBIENCE`: deve sustentar, nunca competir;
- `FEEDBACK`: cliques, janelas, relés e navegação;
- `FOREGROUND`: gravações, chamadas, Morse, mensagens críticas e assinatura SOURCE.03.

Conteúdo acionado por botões `OUVIR` ou `REPRODUZIR` é sempre `FOREGROUND`.

## 11.2. Ganhos iniciais propostos

Ponto de partida para calibração, não valores absolutos imutáveis:

```text
master padrão: 0.62–0.68
ambience bus: 0.26–0.34
ui bus: 0.50–0.58
device bus: 0.66–0.74
signal bus: 0.74–0.82
narrative bus: 0.70–0.78
impact bus: 0.68–0.76
```

Não sobrescrever um evento foreground com `volume: 0.035`, `0.045` ou valores equivalentes.

## 11.3. Reprodução de gravação e chamada

Ao pressionar `OUVIR`:

- desbloquear/resumir o AudioContext no mesmo gesto;
- reduzir ambience e device para 18–28% do nível atual;
- tocar o conteúdo entre 2,5 e 4 vezes mais presente que hoje;
- preservar headroom no compressor;
- restaurar buses em 600–1000 ms ao terminar;
- impedir duas reproduções foreground simultâneas;
- pressionar novamente deve reiniciar ou parar de forma explícita;
- mostrar progresso, duração e estado `REPRODUZINDO`;
- manter legenda textual sincronizada.

Para `fonte_03.m4a`, os três impactos precisam ser distinguíveis em caixas pequenas e fones comuns. Reforçar médios-graves, mas incluir componente audível acima de 300 Hz para não depender apenas de subgrave.

## 11.4. Mixagem das notificações

- mensagem: vibração audível + tom curto, sem estridência;
- chamada: corpo grave, oscilação e repetição limitada;
- evento silencioso: usar ruído físico mínimo do aparelho, não ausência total de feedback;
- telefone fora de foco: aplicar pan coerente com a posição visual do aparelho;
- telefone em mãos: centralizar e elevar clareza;
- TV fora de quadro: estática começa com pan lateral e converge durante a troca de assento.

## 11.5. Controles

Manter volume mestre e acrescentar, se necessário:

- `EFEITOS`;
- `GRAVAÇÕES E SINAIS`.

Ambos precisam ser acessíveis sem abrir painel de desenvolvimento. Nunca iniciar áudio narrativo longo sem gesto prévio ou evento já autorizado pelo primeiro gesto da sessão.

---

# 12. INTEGRAÇÃO ENTRE MOVIMENTO E ÁUDIO

Transição não pode disparar áudio e visual como sistemas independentes.

Cada `TransitionPlan` deve declarar cues:

```js
{
  motion: 'seat-computer-to-tv',
  audio: {
    leave: 'chair.release',
    travel: 'room.steps.short',
    arrive: 'receiver.wake'
  }
}
```

O swap de cena deve acontecer na oclusão, nunca em um frame claro. O crossfade de ambience começa antes do swap e termina depois da chegada.

Sons novos podem continuar procedurais. Não exigir arquivos externos para cadeira, passos ou tecido; ruído filtrado, impactos curtos e envelopes já são suficientes quando bem mixados.

---

# 13. ACESSIBILIDADE E CONFORTO

- toda informação sonora crítica possui legenda ou transcrição;
- notificações não dependem apenas de vibração ou cor;
- foco vai para o CTA de handoff e depois para o título da nova cena;
- Escape não pode consumir uma transição pendente por acidente;
- nenhuma animação prende a interface por mais de 1,8 segundo;
- reduced motion recebe continuidade equivalente;
- evitar flashes acima de três por segundo;
- evitar shake de página inteira em notificações comuns;
- não usar Browser Notifications, câmera, microfone ou vibração real do dispositivo sem consentimento específico;
- o volume inicial maior deve continuar controlável e nunca ignorar mute.

---

# 14. ARQUIVOS PROVAVELMENTE AFETADOS

- `js/state.js`: `pendingTransition`, estados do telefone e reprodução foreground;
- `js/progression.js`: resultado estruturado de conclusão;
- `js/events.js`: remover decisão fragmentada de navegação;
- `js/router.js`: navegação sem descoberta implícita;
- `js/transition-director.js`: novo orquestrador;
- `js/motion-engine.js`: movimentos de assento, pickup e lowering;
- `js/app.js`: overlay global, recuperação e foco;
- `js/puzzles/catalog.js`: contrato de handoff para os 24 limites;
- `js/behavior-director.js`: sequências e ciclo de vida dos eventos;
- `js/worlds/world-events.js`: entrega encadeada e estados de leitura;
- `js/phone.js` e `js/events/phone.js`: novo aparelho recolhido e pickup;
- `js/audio.js`, `js/audio/engine.js`, `js/audio/manifest.js`: foreground bus, ducking e mixagem;
- `css/transitions.css`, `css/scenes.css`, `css/phone.css`: movimentos e presença física.

Regenerar `js/app.bundle.js` e `js/node.bundle.js` somente depois das alterações modulares.

---

# 15. ORDEM DE IMPLEMENTAÇÃO

1. Corrigir progressão e introduzir `TransitionPlan`.
2. Preencher a matriz dos 24 limites no catálogo.
3. Implementar fallback visível para qualquer handoff sem entry point.
4. Criar overlay global e movimentos PC ↔ TV.
5. Integrar cues e crossfades de áudio às transições.
6. Refazer o estado recolhido e a animação de pickup do celular.
7. Migrar notificações para o ciclo de vida completo.
8. Criar ao menos quatro sequências comportamentais encadeadas.
9. Rebalancear buses e reprodução foreground.
10. Adicionar controles de desenvolvimento para simular cada handoff e evento.
11. Revisar reduced motion, teclado e foco.
12. Regenerar bundles.

---

# 16. CONTROLES DE DESENVOLVIMENTO

Em `?dev=1`, adicionar:

- selecionar origem e destino;
- simular cada tipo de handoff;
- avançar manualmente estados `preparing/offered/moving/arrived`;
- simular mensagem, chamada, nota e artefato;
- simular evento ignorado;
- tocar cada cue de foreground isoladamente;
- visualizar master, bus e volume efetivo calculado;
- limpar somente a transição pendente sem zerar a sessão.

O painel deve indicar quando uma fase concluída não possui continuação válida.

---

# 17. CRITÉRIOS DE ACEITE

## Progressão

- concluir qualquer uma das fases 01–24 sempre produz uma ação de continuidade visível;
- nenhum fluxo termina na fase anterior sem CTA, objeto novo ou instrução física;
- os 24 limites estão descritos no catálogo;
- recarregar visualmente a cena durante um handoff não perde a continuação em memória;
- cliques repetidos não iniciam transições duplicadas;
- a fase 25 não tenta navegar para destino inexistente.

## Trocas de mundo

- PC → TV e TV → PC parecem deslocamentos diferentes e direcionais;
- o swap ocorre durante oclusão;
- áudio do destino começa antes da chegada visual;
- não há frame preto sem intenção nem flash do layout intermediário;
- reduced motion continua deixando origem e destino claros.

## Celular

- telefone recolhido parece um objeto, não um botão textual;
- abrir e fechar possui animação reversível;
- notificação acende e move o próprio aparelho;
- mensagem, chamada, nota e arquivo têm comportamentos distintos;
- eventos ignorados permanecem consultáveis e podem gerar consequência;
- uma notificação não desaparece apenas porque outra chegou.

## Áudio

- gravações e chamadas são audíveis com master padrão em caixas comuns;
- foreground reduz ambiência automaticamente;
- não existe empilhamento acidental de gravações;
- legendas continuam disponíveis;
- mute interrompe ou silencia todo áudio imediatamente;
- controles não produzem clipping perceptível.

## Atmosfera

- tensão vem de causalidade e antecipação;
- eventos referenciam ações reais da sessão;
- o diretor não repete a mesma frase em sequência;
- não há spam de notificações;
- o sistema parece observar e agir, mas nunca remove agência ou bloqueia puzzle crítico.

---

# 18. DEFINITION OF DONE

Este rework só está concluído quando:

1. o bloqueio de progressão estiver removido em todos os 24 limites;
2. existir um único orquestrador de conclusão e handoff;
3. PC ↔ TV possuir linguagem de troca de assento;
4. o celular recolhido tiver presença física e pickup animado;
5. notificações possuírem ciclo de vida e consequências;
6. ao menos quatro eventos forem encadeados entre comportamento e dispositivo;
7. chamadas e gravações tiverem mixagem foreground;
8. teclado, toque, mute e reduced motion permanecerem funcionais;
9. controles de desenvolvimento permitirem inspecionar os novos sistemas;
10. os bundles versionados forem regenerados somente ao final.

Não considerar concluído apenas porque a próxima fase pode ser acessada manualmente por URL ou pelo painel de desenvolvimento.
