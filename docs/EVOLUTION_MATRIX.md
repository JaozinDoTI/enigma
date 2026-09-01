# Matriz de evolução dos 25 registros

## Objetivo e fonte de verdade

Este documento transforma a direção cinematográfica em contratos implementáveis. Ele não substitui o comportamento atual descrito em [`PUZZLE_MAP.md`](./PUZZLE_MAP.md): separa explicitamente o que existe hoje da evolução proposta.

A matriz foi derivada dos 25 descritores em `js/puzzles/`, das cenas em `js/scene-renderer.js`, das regras em `js/events.js`, das dicas em `data/hints.js` e das dependências persistidas em `js/state.js`.

## Escalas usadas

- **Motion — LOW:** microinteração e confirmação local.
- **Motion — MEDIUM:** revelação ou montagem de um componente.
- **Motion — HIGH:** transição de área, reconstrução ou evento narrativo.
- **Motion — SIGNATURE:** sequência única que identifica um momento central.
- **Corrupção — 0:** estável; **1:** anomalia quase subliminar; **2:** desync perceptível; **3:** interferência entre módulos; **4:** interface reage à identidade; **5:** estrutura desmontada ou fundida.
- **Receptor — 0:** ausente; **1:** referência/eco; **2:** influência indireta; **3:** mecânica ou evento central.
- **Mutação:** altera de forma persistente o shell, uma área ou a linguagem do sistema.
- **Retroativo:** muda algo já visitado ou produz consequência fora do módulo atual.

## Atos, estado global e papel da jogadora

| Ato | Registros | Estado do sistema | Papel percebido | Ambiente dominante |
|---|---:|---|---|---|
| I — Intrusão | 01–05 | `STABLE → OBSERVING` | `OPERADOR EXTERNO` | ARQUIVO / RECEPTOR / COLD_STORAGE |
| II — O arquivo mente | 06–10 | `DESYNC → CORRUPTED` | `OBSERVADOR` | ARQUIVO |
| III — Contaminação humana | 11–17 | `CORRUPTED` | `TESTEMUNHA` | EVIDÊNCIAS / RECEPTOR / COLD_STORAGE |
| IV — Reconhecimento | 18–23 | `RECOGNITION` | `POSSÍVEL CONTAMINAÇÃO` | EVIDÊNCIAS / IDENTIDADE / COLD_STORAGE |
| V — Relação | 24–25 | `MERGE → STABLE` | `ENTIDADE B IDENTIFICADA` | IDENTIDADE |

## Classificação executiva

| ID | Ato | Área | Motion | Corrupção | Receptor | Mutação | Retroativo |
|---:|---:|---|---|---:|---:|---|---|
| 01 | I | ARQUIVO | SIGNATURE | 0 | 1 | Sim | Não |
| 02 | I | ARQUIVO | LOW | 0 | 1 | Não | Sim |
| 03 | I | RECEPTOR | SIGNATURE | 1 | 3 | Sim | Sim |
| 04 | I | RECEPTOR | HIGH | 1 | 3 | Não | Não |
| 05 | I | COLD_STORAGE | HIGH | 1 | 1 | Sim | Sim |
| 06 | II | ARQUIVO | SIGNATURE | 1 | 0 | Sim | Não |
| 07 | II | ARQUIVO | HIGH | 2 | 1 | Sim | Não |
| 08 | II | ARQUIVO | MEDIUM | 1 | 0 | Não | Não |
| 09 | II | COLD_STORAGE | HIGH | 2 | 1 | Sim | Sim |
| 10 | II | ARQUIVO | HIGH | 3 | 1 | Sim | Sim |
| 11 | III | EVIDÊNCIAS | SIGNATURE | 2 | 1 | Sim | Não |
| 12 | III | IDENTIDADE | HIGH | 2 | 1 | Sim | Sim |
| 13 | III | RECEPTOR | SIGNATURE | 3 | 3 | Sim | Sim |
| 14 | III | COLD_STORAGE | MEDIUM | 2 | 2 | Não | Sim |
| 15 | III | EVIDÊNCIAS | MEDIUM | 2 | 1 | Sim | Não |
| 16 | III | COLD_STORAGE | MEDIUM | 2 | 2 | Sim | Sim |
| 17 | III | RECEPTOR | SIGNATURE | 3 | 3 | Sim | Sim |
| 18 | IV | EVIDÊNCIAS | SIGNATURE | 3 | 1 | Sim | Não |
| 19 | IV | IDENTIDADE | HIGH | 4 | 1 | Sim | Sim |
| 20 | IV | COLD_STORAGE | SIGNATURE | 4 | 2 | Sim | Não |
| 21 | IV | RECEPTOR | SIGNATURE | 4 | 3 | Sim | Sim |
| 22 | IV | COLD_STORAGE | MEDIUM | 4 | 2 | Sim | Sim |
| 23 | IV | IDENTIDADE | HIGH | 4 | 2 | Sim | Sim |
| 24 | V | IDENTIDADE | SIGNATURE | 5 | 3 | Sim | Sim |
| 25 | V | IDENTIDADE | SIGNATURE | 5 → 0 | 1 | Sim | Não |

---

## 01 — SEQUENCIA_INICIAL

- **Contrato:** Ato I; sem requisito; inicia em tela preta com sistema ainda `STABLE`; acessibilidade exige botão real e log textual completo.
- **Puzzle atual → problema:** cursor clicável conclui o boot, mas toda a interface já está montada e a primeira ação parece apenas um botão escondido.
- **Nova mecânica / interação:** boot em camadas; a jogadora acompanha as verificações e ativa o fragmento interrompido `recuperar_interface_`.
- **Animação:** sequência signature `boot-sequence`: linha CRT, abertura vertical, typing das quatro checagens, erro em `EVENTO_1010` e montagem segmentada do shell. Sem flash de alta frequência.
- **Pista → solução:** o único processo incompleto termina no cursor; clicar no cursor continua sendo a solução.
- **Evidência gerada:** `EVENTO_1010 / CORROMPIDO` e `RECEPTOR / DESCONHECIDO` entram no ARQUIVO.
- **Mutação / retorno:** cria a sessão, inicia o relógio e troca o papel para `OPERADOR EXTERNO`; a mesma linguagem reaparece invertida no falso final.
- **Evento antecipado:** durante `MEMORY .... OK`, `ENTITY_B` pode surgir como `FOUND` por 80 ms, com o mesmo dado disponível depois em texto estático.
- **Classificação:** `MOTION SIGNATURE · CORRUPTION 0 · RECEPTOR 1 · MUTATION YES · RETROACTIVE NO`.

## 02 — INDICE_DO_ARQUIVO

- **Contrato:** Ato I; requer 01; ARQUIVO estável; navegação e anomalia devem ser perceptíveis sem movimento ou cor.
- **Puzzle atual → problema:** seis linhas de log funcionam, mas o clique correto não ensina ainda que evidências persistem e podem voltar alteradas.
- **Nova mecânica / interação:** inspeção de linhas com metadados sob demanda; o painel de evidências registra silenciosamente IDs, confiança e residual.
- **Animação:** scanner horizontal curto no hover/foco; ao abrir `EVENTO_1010`, a linha é indexada e uma cópia reduzida viaja para EVIDÊNCIAS.
- **Pista → solução:** horário e nome repetem 1010; abrir `EVENTO_1010` permanece a solução.
- **Evidência gerada:** `EVT-1010`, mais referências antecipadas `VX-04`, `VX-11` e `SRC-B` sem explicação completa.
- **Mutação / retorno:** nenhuma mutação imediata; o próprio registro será reescrito pelo 10.
- **Evento antecipado:** `VX-04` mostra `RESIDUAL: N` apenas em inspeção profunda, sem destaque.
- **Classificação:** `MOTION LOW · CORRUPTION 0 · RECEPTOR 1 · MUTATION NO · RETROACTIVE YES`.

## 03 — RECEPTOR_VX / primeiro contato

- **Contrato:** Ato I; requer 02; RECEPTOR em `OFF/BOOT/NO_SIGNAL`; controles continuam operáveis por teclado.
- **Puzzle atual → problema:** o canal troca instantaneamente e a TV existe somente dentro desta cena, reduzindo seu peso como objeto persistente.
- **Nova mecânica / interação:** RECEPTOR torna-se módulo persistente; ligar, percorrer canais e aguardar o `CHANNEL_LOCK` do canal 04.
- **Animação:** signature de boot da TV, bloom moderado, roll vertical, tearing de troca e estabilização progressiva; canal 04 trava depois de estática curta.
- **Pista → solução:** um canal se comporta diferente dos demais; alcançar o canal 04 permanece a solução.
- **Evidência gerada:** `RCV-04 / PORTADORA POR DURAÇÃO`.
- **Mutação / retorno:** RECEPTOR permanece acessível e conserva energia/canal/volume; após o 12 ele muda sem anúncio.
- **Evento antecipado:** controles aceitam valores antes de terem significado; `CH 00` pode aparecer uma vez e voltar ao canal real.
- **Classificação:** `MOTION SIGNATURE · CORRUPTION 1 · RECEPTOR 3 · MUTATION YES · RETROACTIVE YES`.

## 04 — SINAL_04

- **Contrato:** Ato I; requer canal 04; RECEPTOR em `CHANNEL`; a transcrição visual é obrigatória e o som é suplementar.
- **Puzzle atual → problema:** Morse já é justo, porém lâmpada e texto são independentes e o playback usa temporização local.
- **Nova mecânica / interação:** acionar leitura da portadora e acompanhar uma timeline única de luz, traço, áudio e texto.
- **Animação:** pulso de lâmpada com afterglow curto; cada marca desenha o traço correspondente, e a palavra decodificada é reconstruída em quatro células.
- **Pista → solução:** curto/longo → ponto/traço → `-- . ... .-`; responder `MESA` ou `ESCRIVANINHA`.
- **Evidência gerada:** `OBJ-MESA / ÍNDICE DE SISTEMA PROVÁVEL`.
- **Mutação / retorno:** sem mutação global; estabelece que o RECEPTOR pode nomear estruturas internas do computador.
- **Evento antecipado:** no fim do sinal, a estação destaca a tabela `MESA`; o texto de evidência garante equivalência acessível.
- **Classificação:** `MOTION HIGH · CORRUPTION 1 · RECEPTOR 3 · MUTATION NO · RETROACTIVE NO`.

## 05 — MOUNT_TABLE

- **Contrato:** Ato I; requer 04; a estação continua totalmente digital e apresenta uma tabela de montagem investigável.
- **Puzzle atual → problema:** MESA não poderia obrigar uma saída física antes que o computador parecesse um lugar confiável.
- **Nova mecânica / interação:** comparar unidades, datas e estado de dispositivo para isolar a montagem órfã.
- **Animação:** realce contido da linha sem dispositivo; propriedades entram no inspetor da estação.
- **Pista → solução:** `17 / 04 / 91` no formato DDMMYY produz `170491`.
- **Evidência gerada:** `ARCHIVE_170491 / DISPOSITIVO AUSENTE`.
- **Mutação / retorno:** o novo registro passa a existir no Archive e poderá ser reencontrado por busca.
- **Evento antecipado:** o Explorador pode mostrar a entrada antes da resolução, sem revelar a interpretação.
- **Classificação:** `MOTION LOW · CORRUPTION 1 · COMPUTER 3 · MUTATION YES · RETROACTIVE YES`.

## 06 — DOC_1708

- **Contrato:** Ato II; requer 05; ARQUIVO entra em `DESYNC`; comparação continua possível por teclado e em modo estático.
- **Puzzle atual → problema:** palavras deslocadas resolvem a pista, mas a mecânica é leitura passiva e não materializa duas memórias simultâneas.
- **Nova mecânica / interação:** comparador `VERSÃO A | VERSÃO B` com divisor arrastável; três fragmentos permanecem imóveis enquanto os demais divergem.
- **Animação:** signature `document-desync`: máscara revela versões sobrepostas; scanner congela `A DATA`, `ABRE`, `ARQUIVO`; cada trecho extraído segue até EVIDÊNCIAS.
- **Pista → solução:** o conteúdo invariável entre versões forma `A DATA ABRE O ARQUIVO`; aceitar também `DATA` preserva a regra atual.
- **Evidência gerada:** três evidências textuais com origem `DOC_1708`, dependência comum e confiança alta.
- **Mutação / retorno:** ativa pequenas discrepâncias de espaçamento no ARQUIVO; a estabilidade visual deixa de ser confiável.
- **Evento antecipado:** a versão B contém uma menção discreta a “duas fontes de memória”.
- **Classificação:** `MOTION SIGNATURE · CORRUPTION 1 · RECEPTOR 0 · MUTATION YES · RETROACTIVE NO`.

## 07 — DIRETORIO_J

- **Contrato:** Ato II; requer 06 e EVT-1010; ARQUIVO em `DESYNC`; datas e estados precisam permanecer textuais.
- **Puzzle atual → problema:** selecionar a linha correta é imediato; arquivos errados são rejeitados sem o sistema demonstrar uma hipótese falsa.
- **Nova mecânica / interação:** organizar cinco arquivos numa timeline por metadados; nomes tentam “puxar” o item para posições plausíveis, mas timestamps governam a consistência.
- **Animação:** arquivos ganham peso e snap; hipótese errada mostra `CONSISTÊNCIA: OK`, pausa, reprocessa e retorna suavemente com `FALSA`; a correta alinha a linha temporal.
- **Pista → solução:** nomes mentem, horário e tamanho não; selecionar/posicionar `final_agora_vai.txt` às 10:10.
- **Evidência gerada:** `FILE-FINAL-1010 / METADADO CONFIÁVEL`.
- **Mutação / retorno:** labels do ARQUIVO podem se autocorrigir; “final” perde tratamento de estado confiável.
- **Evento antecipado:** por um frame, `final_REAL_AGORA.txt` recebe a hora futura e volta, caracterizando desync temporal.
- **Classificação:** `MOTION HIGH · CORRUPTION 2 · RECEPTOR 1 · MUTATION YES · RETROACTIVE NO`.

## 08 — PACOTE_8BIT

- **Contrato:** Ato II; requer 07; ARQUIVO ainda legível; agrupamento visual deve possuir rótulo acessível equivalente.
- **Puzzle atual → problema:** conversão binária é clara, porém estática e desconectada do vocabulário de reconstrução.
- **Nova mecânica / interação:** alternar agrupamento bruto/8 bits e confirmar as três células decodificadas; resposta textual continua disponível.
- **Animação:** bits são indexados em blocos, cada byte colapsa para `L`, `U`, `A`; sem partículas ou glitch global.
- **Pista → solução:** 24 bits separados em 8/8/8 formam `LUA`.
- **Evidência gerada:** `OBJ-LUA / OBSERVADOR / LOCALIZAÇÃO EXTERNA`.
- **Mutação / retorno:** nenhuma global; a Lua entra no painel como evidência ainda incompleta.
- **Evento antecipado:** o residual de `VX-04` é vinculado à Lua, mas fica classificado como “sem relação”.
- **Classificação:** `MOTION MEDIUM · CORRUPTION 1 · RECEPTOR 0 · MUTATION NO · RETROACTIVE NO`.

## 09 — OBJETO_L-01

- **Contrato:** Ato II; requer 08, aceita pista física antecipada; COLD_STORAGE volta mais escuro; solução nunca depende de efeito efêmero.
- **Puzzle atual → problema:** a ida ao pano funciona, mas a marca da Lua precisa permanecer consultável depois da visita física.
- **Nova mecânica / interação:** scanner de objeto externo registra uma camada visível e uma área `UNREADABLE`; inserir `VX-04` recupera apenas a primeira.
- **Animação:** wireframe simples da Lua, varredura, separação em duas lâminas e arquivamento da primeira; a segunda permanece atrás como ghost estático rotulado.
- **Pista → solução:** procurar a Lua física e inserir `VX-04` ou a frase física aceita atualmente.
- **Evidência gerada:** `VX-04 → LUA → RESIDUAL N`, com `CAMADA 2: PENDENTE`.
- **Mutação / retorno:** muda a jogadora para `OBSERVADOR`; a entrada Lua no painel nunca desaparece e será reaberta no 23.
- **Evento antecipado:** a camada traseira registra atividade sem revelar conteúdo.
- **Classificação:** `MOTION HIGH · CORRUPTION 2 · RECEPTOR 1 · MUTATION YES · RETROACTIVE YES`.

## 10 — EVENTO_1010 revisado

- **Contrato:** Ato II; requer 09 e visita ao 02; ARQUIVO em `CORRUPTED`; a mudança retroativa precisa ser auditável.
- **Puzzle atual → problema:** a tela manda voltar e a linha muda, mas o sistema não mostra a coexistência do estado anterior com o revisado.
- **Nova mecânica / interação:** notificação de checksum leva ao ARQUIVO; a jogadora abre EVT-1010 e alterna histórico atual/anterior.
- **Animação:** temporal ghost preserva a linha antiga por alguns frames, uma scan corruption substitui `ORIGEM DESCONHECIDA` por `DUAS ENTIDADES / CONVERSA` e o painel lateral responde 150 ms atrasado.
- **Pista → solução:** retornar ao registro já visitado e abrir `EVENTO_1010` revisado.
- **Evidência gerada:** `EVT-1010 / ENTITY_A + ENTITY_B / SHARED_EVENT`.
- **Mutação / retorno:** estado global chega a `CORRUPTED`; ARQUIVO passa a expor revisões e a IDENTIDADE surge bloqueada no shell.
- **Evento antecipado:** `ENTIDADE B: DESCONHECIDA` muda brevemente para `ENCONTRADA` e volta; o painel preserva log acessível da ocorrência.
- **Classificação:** `MOTION HIGH · CORRUPTION 3 · RECEPTOR 1 · MUTATION YES · RETROACTIVE YES`.

## 11 — CONFLITO_DE_MEMORIA

- **Contrato:** Ato III; requer 10; EVIDÊNCIAS é aberto; comparação deve funcionar sem imagem ou precisão motora.
- **Puzzle atual → problema:** duas listas e um botão entregam a geometria sem permitir a investigação forense proposta.
- **Nova mecânica / interação:** selecionar volume, laterais, comprimento, silhueta, relato e inconsistência para compor uma hipótese de corte.
- **Animação:** signature em quatro passes — scan, wireframe SVG, silhueta, textura — sempre acionados por escolhas; incompatibilidades desfazem somente a camada correspondente.
- **Pista → solução:** laterais curtas + comprimento atrás + repetição; concluir a comparação prepara `MULLET`, sem alterar o avanço atual para o 12.
- **Evidência gerada:** `HAIR-GEOMETRY`, `ENTITY_A TESTIMONY` e `ENTITY_B DENIAL` com níveis de confiança distintos.
- **Mutação / retorno:** EVIDÊNCIAS passa de lista para grafo técnico; o sistema começa a avaliar a entidade, não apenas o arquivo.
- **Evento antecipado:** o relato da entidade B recebe `CONFIANÇA DECLARADA ≠ CONFIANÇA CALCULADA`.
- **Classificação:** `MOTION SIGNATURE · CORRUPTION 2 · RECEPTOR 1 · MUTATION YES · RETROACTIVE NO`.

## 12 — RESOLUCAO_DO_CONFLITO

- **Contrato:** Ato III; requer 11; IDENTIDADE contém A e B sem relação; input mantém mensagem textual e foco.
- **Puzzle atual → problema:** digitar `MULLET` é correto, mas o gag de rejeição não é encenado como falha do sistema em aceitar a própria conclusão.
- **Nova mecânica / interação:** confirmar o identificador calculado; o sistema valida, recebe a negação da entidade B e recalcula antes de aceitar.
- **Animação:** campo contrai e processa; `CORRETO` surge, sofre character substitution para `INCORRETO`, pausa e termina em `MEMÓRIA CONFIRMADA ... sério?`; sem shake forte.
- **Pista → solução:** usar o nome `MULLET` já reconstruído.
- **Evidência gerada:** `IMG_2019_MULLET / METADATA ANEXADA / ENTITY_B: NEGA`.
- **Mutação / retorno:** linguagem técnica apresenta a primeira frase humana; papel da jogadora muda para `TESTEMUNHA`.
- **Evento antecipado:** o RECEPTOR recebe silenciosamente um estado pendente para canal 11.
- **Classificação:** `MOTION HIGH · CORRUPTION 2 · RECEPTOR 1 · MUTATION YES · RETROACTIVE YES`.

## 13 — RECEPTOR_VX / afterimage

- **Contrato:** Ato III; requer 12 e retorno ao módulo persistente; código também aparece como texto após descoberta para acessibilidade.
- **Puzzle atual:** canal 11 só deixa a relação `FIM · 01 · COMEÇO` como imagem residual depois de ser desligado.
- **Nova mecânica / interação:** chegar ao canal 11 parece inconclusivo; desligar a TV revela o afterimage `2 5 1` por aproximadamente um segundo.
- **Animação:** signature `tv-afterimage`: lock vazio, desligamento CRT, frame residual verde/cinza e dissipação lenta; ao religar, o código não está mais lá.
- **Pista → solução:** o RECEPTOR mudou em segundo plano; visitar canal 11 e desligar para recuperar 2–5–1.
- **Evidência gerada:** `RCV-11 / AFTERIMAGE / FIM-DISTÂNCIA-COMEÇO`.
- **Mutação / retorno:** TV passa ao estado `AFTERIMAGE`; pode ligar sozinha por 400 ms em outros ambientes, com frequência limitada.
- **Evento antecipado:** `CH 00` evolui para `CH B` em uma ativação silenciosa posterior.
- **Classificação:** `MOTION SIGNATURE · CORRUPTION 3 · RECEPTOR 3 · MUTATION YES · RETROACTIVE YES`.

## 14 — OBJETOS_ORDENADOS

- **Contrato:** Ato III; requer 13; COLD_STORAGE usa 2–5–1; a atividade física tem alternativa textual e configuração em `GAME_CONFIG`.
- **Puzzle atual → problema:** os índices apontam para livros, porém o painel digital apenas exibe chips estáticos antes do input.
- **Nova mecânica / interação:** associar visualmente os três índices à coleção `LIVROS`; a ação física continua localizar as posições e combinar o token.
- **Animação:** linha de índice percorre 02→05→01; EVIDÊNCIAS destaca a dependência entre RECEPTOR e COLD_STORAGE, sem simular os objetos físicos.
- **Pista → solução:** a afterimage entrega FIM · 01 · COMEÇO; o BOOKSCAN cruza as fotos reais com `EXTREMIDADES / DISTÂNCIA 01`; os insertos de **É Assim que Acaba** e **É Assim que Começa** formam `03:17`.
- **Evidência gerada:** `BOOK-02`, `BOOK-05`, `BOOK-01` e quatro fragmentos físicos sem ordem.
- **Mutação / retorno:** nenhuma global; o sistema aprende que `COLD_STORAGE` contém fragmentos deliberadamente removidos.
- **Evento antecipado:** `VX-11` reaparece como dependência vazia, preparando a cabeceira.
- **Classificação:** `MOTION MEDIUM · CORRUPTION 2 · RECEPTOR 2 · MUTATION NO · RETROACTIVE YES`.

## 15 — MONTAGEM_DE_FRAGMENTOS

- **Contrato:** Ato III; requer 14; EVIDÊNCIAS; controles clicáveis devem permitir montar, remover e reordenar sem drag obrigatório.
- **Puzzle atual → problema:** a seleção sequencial funciona, mas não visualiza relações sintáticas nem diferencia erro de hipótese de erro de input.
- **Nova mecânica / interação:** montar uma cadeia de quatro fragmentos; cada encaixe calcula compatibilidade gramatical sem resolver antes da validação.
- **Animação:** fragmentos entram com peso, conexões SVG são desenhadas entre posições; hipótese inválida processa, a linha retrocede e o fragmento volta sem elasticidade.
- **Pista → solução:** a única frase natural é `ONDE / A NOITE / DEIXA / O QUE VOCÊ PRECISA`.
- **Evidência gerada:** `INSTRUCTION-NIGHT / DESTINO: PROXIMIDADE DO SONO`.
- **Mutação / retorno:** introduz erros de hipótese com fase “aceito → processado → rejeitado”, reutilizável no restante do jogo.
- **Evento antecipado:** COLD_STORAGE destaca `CAMA` como hipótese com baixa confiança, preparando sua correção.
- **Classificação:** `MOTION MEDIUM · CORRUPTION 2 · RECEPTOR 1 · MUTATION YES · RETROACTIVE NO`.

## 16 — NO_NOTURNO

- **Contrato:** Ato III; requer 15; aceita pista física antecipada; não exige posição exata nem movimento.
- **Puzzle atual → problema:** dois cards explicam cama/cabeceira, mas a correção espacial não reaproveita o grafo ou o ambiente persistente.
- **Nova mecânica / interação:** relacionar `NOITE`, `ALCANCE` e `AO LADO` ao objeto físico correto; inserir `VX-11` valida a pista da cabeceira.
- **Animação:** conexão `CAMA — AO LADO → MESA LATERAL`; a hipótese CAMA perde contraste e a cabeceira é escaneada como node.
- **Pista → solução:** perto do sono, não sobre o colchão; encontrar a tira na mesa de cabeceira e inserir `VX-11`/`RECEPTOR`/`TV`.
- **Evidência gerada:** `VX-11 → RECEPTOR → RESIDUAL O`.
- **Mutação / retorno:** COLD_STORAGE passa a exibir relações espaciais; o RECEPTOR ganha dois parâmetros em estado de espera.
- **Evento antecipado:** a mesma dezena aparece nos labels de canal e volume antes de o puzzle 17 explicar o uso.
- **Classificação:** `MOTION MEDIUM · CORRUPTION 2 · RECEPTOR 2 · MUTATION YES · RETROACTIVE YES`.

## 17 — CONTROLE_VX

- **Contrato:** Ato III; requer 16; RECEPTOR persistente; valores e estados precisam de outputs semânticos.
- **Puzzle atual → problema:** canal 10/volume 10 resolve corretamente, mas cada clique rerenderiza a TV e a transmissão aparece sem estabilização.
- **Nova mecânica / interação:** sintonizar dois controles independentes; o sistema mede distância da portadora sem dizer os valores corretos.
- **Animação:** assinatura de sintonia: tearing diminui conforme canal e volume se aproximam; em 10/10 ocorre `CHANNEL_LOCK`, scan central e fixação da portadora.
- **Pista → solução:** dois controles, mesma dezena e EVENTO_1010; definir canal 10 e volume 10.
- **Evidência gerada:** `CARRIER-1010 / EVENTO + RECEPTOR / LOCKED`.
- **Mutação / retorno:** RECEPTOR entra em `ENTITY_CONTACT`; o sistema deixa de chamar 1010 de coincidência.
- **Evento antecipado:** durante o lock, uma segunda silhueta textual é registrada como `PRESENÇA EXTERNA`.
- **Classificação:** `MOTION SIGNATURE · CORRUPTION 3 · RECEPTOR 3 · MUTATION YES · RETROACTIVE YES`.

## 18 — RECONSTRUCAO_ESPACIAL

- **Contrato:** Ato IV; requer 17; EVIDÊNCIAS inicia `RECOGNITION`; existe modo de seleção/ordenação sem drag.
- **Puzzle atual → problema:** seis cards levam a uma resposta textual, mas a reconstrução não permite que o lugar emerja das relações.
- **Nova mecânica / interação:** posicionar/relacionar água, vento, bancos, brinquedos, conversa e espaço aberto num mapa abstrato.
- **Animação:** signature em quatro estágios: fragmentos, linhas SVG, contorno, mapa mental; relações corretas revelam o ambiente progressivamente.
- **Pista → solução:** coexistência dos seis elementos; confirmar `PARQUINHO DA BEIRA-MAR` ou aliases atuais.
- **Evidência gerada:** `LOCATION-PARQUINHO_BEIRA_MAR / EVENTO INICIAL`.
- **Mutação / retorno:** `UNKNOWN_LOCATION` é substituído persistentemente; a IDENTIDADE passa a mostrar memória compartilhada entre A e uma fonte não classificada.
- **Evento antecipado:** fragmento “conversa” liga-se sozinho a EVT-1010 depois de breve cálculo.
- **Classificação:** `MOTION SIGNATURE · CORRUPTION 3 · RECEPTOR 1 · MUTATION YES · RETROACTIVE NO`.

## 19 — TESTE_DE_ENTIDADE

- **Contrato:** Ato IV; requer 18/12/10; IDENTIDADE; conexões SVG têm descrição textual e ordem de seleção não importa.
- **Puzzle atual → problema:** pares corretos persistem, mas as linhas e o cálculo de relação ainda não existem visualmente.
- **Nova mecânica / interação:** conectar três pares de evidências no grafo técnico; cada vínculo calcula origem, confiança e memória compartilhada.
- **Animação:** linha percorre A→B; acerto pulsa e se estabiliza, erro falha e retrocede; ao fechar o terceiro par, todos os caminhos convergem em `ENTITY_B`.
- **Pista → solução:** ligar EVENTO/conversa, cabelo/mullet, margem/local.
- **Evidência gerada:** três `SHARED_MEMORY` e `ENTITY_B / POSSÍVEL CORRESPONDÊNCIA`.
- **Mutação / retorno:** papel vira `POSSÍVEL CONTAMINAÇÃO`; labels e timings respondem à presença da jogadora, não só aos dados.
- **Evento antecipado:** evidências antigas VX reaparecem em segundo plano com resíduos ainda bloqueados.
- **Classificação:** `MOTION HIGH · CORRUPTION 4 · RECEPTOR 1 · MUTATION YES · RETROACTIVE YES`.

## 20 — MODELO_DO_QUARTO

- **Contrato:** Ato IV; requer 19; COLD_STORAGE; valida relações espaciais, oferece controles alternativos ao drag e não depende de pixel exato.
- **Puzzle atual → problema:** basta mover cinco objetos para qualquer posição; não há match espacial nem desmontagem técnica da inconsistência.
- **Nova mecânica / interação:** reconstruir cama, cabeceira, escrivaninha, estante, livros, Lua e TV por relações (`ACIMA`, `AO LADO`, `PRÓXIMO`), com posições aproximadas.
- **Animação:** signature de sala técnica: snap com resistência, linhas relacionais, pontos de âncora e cálculo `87→92→98→99%`; objetos recebem `VERIFICADO` um a um.
- **Pista → solução:** cinco objetos possuem correspondência física; TV não aceita âncora. Validar após estabelecer as relações reais.
- **Evidência gerada:** `ROOM-MATCH 99%`, cinco objetos verificados e `TELEVISION / NO PHYSICAL MATCH`.
- **Mutação / retorno:** COLD_STORAGE ganha profundidade e o sistema passa a tratar o quarto como memória interna.
- **Evento antecipado:** a TV não retorna com bounce; permanece fixa enquanto o restante do modelo apresenta leve transparência.
- **Classificação:** `MOTION SIGNATURE · CORRUPTION 4 · RECEPTOR 2 · MUTATION YES · RETROACTIVE NO`.

## 21 — OBJETO_IMPOSSIVEL / falso final

- **Contrato:** Ato IV; requer 20; conecta COLD_STORAGE ao RECEPTOR; a pausa narrativa não pode esconder o próximo controle.
- **Puzzle atual → problema:** o falso final aparece imediatamente após validação e a TV impossível não atravessa visualmente os módulos.
- **Nova mecânica / interação:** confirmar a inconsistência; o quarto desmonta e transfere a TV para RECEPTOR. Depois surge a recuperação “perfeita” a 99%, sem ruído nem animação.
- **Animação:** signature dupla: objetos viram wireframe→linhas→pontos→nada; TV permanece intacta e sai da planta. O falso final é deliberadamente estático e silencioso. Ao encerrar, `1 RELAÇÃO NÃO RESOLVIDA` rompe a perfeição.
- **Pista → solução:** `OBJECT DOES NOT BELONG TO MEMORY` muda para `OBJECT BELONGS TO SYSTEM`; clicar em encerrar e retornar ao arquivo continua a progressão.
- **Evidência gerada:** `RECEPTOR_VX / OBJETO DO SISTEMA`, não do quarto.
- **Mutação / retorno:** RECEPTOR entra em `OVERRIDE`; o shell estabiliza falsamente e depois volta em corrupção 4.
- **Evento antecipado:** nenhuma anomalia durante o falso final; a ausência total de efeitos é a anomalia.
- **Classificação:** `MOTION SIGNATURE · CORRUPTION 4 · RECEPTOR 3 · MUTATION YES · RETROACTIVE YES`.

## 22 — NO_11

- **Contrato:** Ato IV; requer 21, aceita QR antecipado; COLD_STORAGE; conteúdo físico e token possuem instrução textual segura.
- **Puzzle atual → problema:** metáfora e QR funcionam, mas o segundo node repete quase exatamente a apresentação do primeiro.
- **Nova mecânica / interação:** localizar uma lacuna de COLD_STORAGE “abaixo das histórias”; o node chega como assinatura que também contém cabeçalho de áudio parcial.
- **Animação:** estante abstrata surge em linhas; a faixa inferior não reconstrói e abre um canal de leitura externo; token entra junto de `SO EASY TO…`.
- **Pista → solução:** histórias acima do sono; escanear QR sob a estante e inserir `VX-LIVROS-0214`.
- **Evidência gerada:** `NODE-11`, `AUDIO-HEADER / SO EASY TO…` e origem física da segunda assinatura.
- **Mutação / retorno:** o sistema começa a usar linguagem menos técnica; a música passa de configuração final a evidência narrativa.
- **Evento antecipado:** QR lido cedo é reclassificado retroativamente; RECEPTOR produz um acorde curto apenas após gesto, com texto equivalente.
- **Classificação:** `MOTION MEDIUM · CORRUPTION 4 · RECEPTOR 2 · MUTATION YES · RETROACTIVE YES`.

## 23 — CLOCK_ORIGIN

- **Contrato:** Ato V; requer 22 e 20; ocorre no mesmo computador e usa um registro antigo.
- **Puzzle atual → problema:** a estação continua calibrada em `03:17`, mas precisa recuperar sua origem.
- **Nova mecânica / interação:** revisitar EVENTO_1010 e restaurar `10:10` na janela DATA / HORA.
- **Animação:** taskbar sincroniza, wallpaper estabiliza e RECUPERAR.exe é reescrito.
- **Pista → solução:** o nome e a primeira linha do evento repetem `10:10`.
- **Evidência gerada:** `ORIGEM_TEMPORAL_1010`.
- **Mutação / retorno:** o relógio deixa de revelar e passa a sincronizar o sistema.
- **Evento antecipado:** EVENTO_1010 existe desde o início e só depois vira referência temporal.
- **Classificação:** `MOTION MEDIUM · CORRUPTION 4 · COMPUTER 3 · MUTATION YES · RETROACTIVE YES`.

## 24 — CHAVE_COMPOSTA

- **Contrato:** Ato V; requer 23 e as cadeias anteriores; a operação e os fragmentos permanecem disponíveis em texto.
- **Puzzle atual → problema:** a conclusão precisava nascer de dados vistos antes, sem depender de conhecimento externo.
- **Nova mecânica / interação:** revisar a cadeia A (`520`) e a cadeia B (`1314`) e concatená-las na ordem indicada.
- **Animação:** os dois trilhos de evidência convergem sem perder seus limites e formam uma chave de sete dígitos.
- **Pista → solução:** não somar; `520` seguido de `1314` produz `5201314`.
- **Evidência gerada:** `RELATION: NÓS / ENTITY_A + ENTITY_B / SHARED SOURCE`.
- **Mutação / retorno:** aceita a chave, interpreta os dois fragmentos e prepara a transição humana final.
- **Evento antecipado:** `520` e `1314` aparecem separadamente no Archive antes desta operação.
- **Classificação:** `MOTION SIGNATURE · CORRUPTION 5 · COMPUTER 3 · MUTATION YES · RETROACTIVE YES`.

## 25 — RECUPERACAO_COMPLETA / MERGE

- **Contrato:** Ato V; requer 24; IDENTIDADE ocupa o shell; todo conteúdo pessoal continua configurável e a conclusão funciona com reduced motion.
- **Puzzle atual → problema:** o tema muda para quente e mostra a recompensa, mas não existe a maior transformação estrutural que explica por que o sistema se torna íntegro.
- **Nova mecânica / interação:** não há nova trava; a jogadora acompanha a reconciliação de A e B e então pode explorar mensagem, mídia, estatísticas e áudio.
- **Animação:** maior signature: dados são separados em duas colunas, conexões atravessam o centro, logs registram duplicidade/colisão, colunas convergem e a divisória desaparece. Termina em `RELAÇÃO: NÓS / ESTADO: ATIVO`.
- **Pista → solução:** não há puzzle adicional; `NÓS` já é a solução e o final é recompensa.
- **Evidência gerada:** nenhuma nova; todas as evidências perdem a classificação exclusiva A/B e tornam-se memória compartilhada.
- **Mutação / retorno:** corrupção 5 cai para 0; ruído, scanlines e glitches cessam; cursor, relógio, espaçamento e bordas estabilizam; interface técnica se torna humana.
- **Evento antecipado:** nenhum. Depois do MERGE o sistema não mente mais.
- **Acessibilidade específica:** em reduced motion, a convergência vira uma sequência de estados estáticos anunciados por live region; mídia não inicia automaticamente.
- **Classificação:** `MOTION SIGNATURE · CORRUPTION 5 → 0 · RECEPTOR 1 · MUTATION YES · RETROACTIVE NO`.

---

## Contratos transversais de implementação

### Idioma de interface

- Todo texto visível para a jogadora permanece em português.
- IDs técnicos como `ENTITY_B`, `COLD_STORAGE` e nomes de eventos podem existir internamente, mas a interface apresenta tradução ou explicação em português.
- Exemplos de logs, erros, loadings e estados deste documento devem ser localizados antes de entrar no DOM.

### Ambientes persistentes

- **ARQUIVO:** registros 01, 02, 06, 07, 08 e 10; histórico de revisão e timeline.
- **RECEPTOR:** 03, 04, 13, 17 e 21; permanece acessível após 03 e muda por estado, não por cópias de cena.
- **EVIDÊNCIAS:** começa no 02 de forma discreta, torna-se interativo no 11 e domina 18/19/24.
- **COLD_STORAGE:** nasce no 05 e reúne nodes, objetos físicos e quarto; 09, 14–16, 20, 22 e 23.
- **IDENTIDADE:** aparece bloqueada no 10, abre no 12, reconhece no 19 e absorve o shell em 24/25.

### Eventos de motion e áudio

O motor de movimento deve emitir eventos, sem chamar o áudio diretamente dentro dos puzzles:

```text
motion:start
motion:impact
motion:error
motion:complete
tv:power
tv:channel
tv:afterimage
entity:detected
memory:restored
system:mutation
```

O áudio escuta esses eventos em camada separada. Morse preserva uma timeline narrativa própria, porém utiliza o mesmo scheduler central.

### Regras de corrupção

1. Nenhum glitch aleatório infinito.
2. Todo evento tem origem, alvo, nível, duração, cooldown e fallback textual.
3. Eventos subliminares nunca carregam a única pista necessária.
4. Níveis 0–2 não deslocam controles durante interação.
5. Níveis 3–4 podem afetar outro módulo, mas não roubam foco.
6. Nível 5 só existe nos registros 24/25 e termina estabilizado.

### Regras de acessibilidade

- Toda informação por som possui transcrição ou estado visual persistente.
- Toda informação efêmera reaparece em log/evidência.
- Drag possui alternativa por seleção e comandos posicionais.
- SVG de relação possui lista textual equivalente.
- `prefers-reduced-motion` troca timelines por estados discretos, sem remover conteúdo.
- Nenhum progresso depende exclusivamente de cor, flash, timing ou precisão espacial.

## Ordem técnica derivada da matriz

1. Criar snapshot versionado. A pasta atual ainda não é um repositório Git; essa precondição precisa ser resolvida antes da refatoração estrutural.
2. Formalizar contrato de puzzle e separar progressão de eventos DOM.
3. Consolidar `UIFeedback` no futuro `motion-engine`, com scheduler, timelines e eventos.
4. Introduzir `act`, `systemState`, `operatorRole`, `corruptionLevel` e `activeArea` no estado derivado.
5. Construir shell dos cinco ambientes persistentes.
6. Tornar RECEPTOR persistente e implementar sua máquina de estados.
7. Construir EVIDÊNCIAS com SVG e fallback textual.
8. Implementar vertical slice 11 → 13 → 18 → 20 → 21 → 24 → 25.
9. Aplicar linguagem de ato aos demais puzzles e só então adicionar eventos silenciosos.

## Critério de pronto para cada puzzle

Um registro só está pronto quando: preserva solução e softlocks atuais; declara contrato completo; registra evidência; emite eventos de motion; possui fallback reduced motion; não acopla áudio; não cria timer isolado; não move foco inesperadamente; e produz a mutação/retorno definidos nesta matriz.
