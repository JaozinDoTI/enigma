# Mapa completo dos registros

Os nomes abaixo são internos. Para a jogadora, tudo aparece como um único arquivo em recuperação.

## 01 — Processo interrompido

- **Objetivo:** iniciar sem botão “começar”.
- **O que vê:** terminal quebrado e comando incompleto.
- **Pista real:** cursor quadrado no fim de `recovery_`.
- **Distrações:** mensagens de boot.
- **Solução:** clicar no cursor.
- **Dependências:** nenhuma.
- **Flags:** `initialized`, `startedAt`; libera 02.
- **Dicas:** cursor → linha interrompida → clique no quadrado.
- **Retorno futuro:** a estética do boot reaparece no falso final.
- **Descoberta antecipada:** não aplicável.

## 02 — EVENT_1010

- **Objetivo:** identificar a anomalia de relógio.
- **O que vê:** seis logs, incluindo `10:10:00 / EVENT_1010` e VX-04/11/02.
- **Pista real:** nome e horário repetem 1010.
- **Distrações:** checksums e outros logs.
- **Solução:** abrir EVENT_1010.
- **Dependências:** 01.
- **Flags:** `event1010Seen`; libera 03.
- **Dicas:** repetição → horário/nome → abrir a linha.
- **Retorno futuro:** VX-04/11/02 alimentam o meta; EVENT_1010 muda no registro 10.
- **Descoberta antecipada:** códigos VX podem ser anotados sem contexto.

## 03 — Primeiro receptor

- **Objetivo:** perceber que a TV não é decoração.
- **O que vê:** TV com 12 canais, ruído e controles.
- **Pista real:** canal 4 transmite marcação anômala.
- **Distrações:** canais sem sinal, volume ainda inútil.
- **Solução:** alcançar canal 4.
- **Dependências:** 02.
- **Flags:** `tv.unlocked`; libera 04.
- **Dicas:** transmissão sem imagem → número diferente → canal 4.
- **Retorno futuro:** a mesma tela muda no registro 13.
- **Descoberta antecipada:** volume e canal são persistidos.

## 04 — Sinal por duração

- **Objetivo:** reconhecer Morse sem exigir conhecimento prévio.
- **O que vê:** lâmpada que pisca e transcrição visual curta/longa.
- **Pista real:** `-- . ... .-`.
- **Distrações:** estática da TV.
- **Solução:** `MESA` ou `ESCRIVANINHA`.
- **Dependências:** 03.
- **Flags:** `tv.morsePlays`; libera 05.
- **Dicas:** duração → ponto/traço → tradução explícita.
- **Pista física:** aponta para escrivaninha.
- **Retorno futuro:** estabelece a TV como canal entre digital e físico.
- **Descoberta antecipada:** QR da mesa é tolerado.

## 05 — Node da escrivaninha

- **Objetivo:** atravessar a fronteira do navegador.
- **O que vê:** terminal aguardando contexto externo.
- **Pista real:** MESA era um objeto, não uma senha.
- **Distrações:** campo só abre depois da travessia narrativa.
- **Solução:** escanear o QR e inserir `VX-MESA-1010`.
- **Dependências:** 04; QR pode vir antes.
- **Flags:** `deskNodeScanned`, `deskNodeValidated`; libera 06.
- **Dicas:** fora da tela → objeto real → local e token.
- **Pista física:** QR na escrivaninha.
- **Retorno futuro:** padrão de node reaparece na estante.
- **Descoberta antecipada:** node fica `detected-early` e não causa softlock.

## 06 — Documento inflado

- **Objetivo:** encontrar inconsistência visual em texto longo.
- **O que vê:** relatório propositalmente cansativo.
- **Pista real:** `A DATA`, `ABRE`, `ARQUIVO` destoam de margem/tipografia.
- **Distrações:** conteúdo plausível e longo.
- **Solução:** `A DATA ABRE O ARQUIVO` ou `DATA`.
- **Dependências:** 05.
- **Flags:** resposta 06; libera 07.
- **Dicas:** olhos cansados → palavras desalinhadas → frase completa.
- **Retorno futuro:** ensina que formatação é dado.
- **Descoberta antecipada:** não aplicável.

## 07 — Versões do João

- **Objetivo:** confiar em metadados, não nomes.
- **O que vê:** cinco arquivos “finais”.
- **Pista real:** modificação exatamente às 10:10 e tamanho coerente.
- **Distrações:** nomes cada vez mais convincentes.
- **Solução:** `final_agora_vai.txt`.
- **Dependências:** 06 e EVENT_1010.
- **Flags:** resposta 07; libera 08.
- **Dicas:** nomes mentem → relógio/tamanho → arquivo das 10:10.
- **Retorno futuro:** reforça que o sistema e nomes podem mentir.
- **Descoberta antecipada:** abrir arquivos errados só soma tentativa.

## 08 — Pacotes de oito

- **Objetivo:** reconstruir palavra binária sem técnica prévia.
- **O que vê:** 24 bits com bordas a cada oito.
- **Pista real:** agrupamento visual 8/8/8.
- **Distrações:** aparência técnica.
- **Solução:** `LUA`.
- **Dependências:** 07.
- **Flags:** resposta 08; libera 09.
- **Dicas:** divisões → byte/letra → conversão completa.
- **Pista física:** aponta para o pano com lua.
- **Retorno futuro:** LUA é observador e parte do meta.
- **Descoberta antecipada:** a lua pode ser examinada antes sem quebrar o site.

## 09 — Primeira Lua

- **Objetivo:** localizar no quarto o equivalente do objeto digital.
- **O que vê:** referência `L_U_A` fora do arquivo.
- **Pista real:** há uma lua física no ambiente.
- **Distrações:** nenhuma instrução direta de busca.
- **Solução:** encontrar a primeira tira e inserir `VX-04`.
- **Dependências:** 08.
- **Flags:** `moonFirstFound`; libera 10.
- **Dicas:** objeto externo → lua que não está na tela → pano.
- **Pista física:** `VX-04 // VOCÊ JÁ PASSOU POR ISSO`.
- **Retorno futuro:** VX-04 liga LUA ao primeiro resíduo do meta; haverá segunda visita.
- **Descoberta antecipada:** token pode ser guardado e usado ao chegar.

## 10 — Registro antigo alterado

- **Objetivo:** ensinar que telas visitadas mudam.
- **O que vê:** tela atual sem conteúdo novo e checksum divergente.
- **Pista real:** o arquivo lateral continua navegável.
- **Distrações:** expectativa de botão de continuar.
- **Solução:** voltar ao registro EVENT_1010 e abrir sua linha revisada.
- **Dependências:** 09 e visita anterior ao 02.
- **Flags:** `eventChanged`; libera 11.
- **Dicas:** já viu → mudou sem aviso → voltar ao EVENT_1010.
- **Retorno futuro:** EVENT_1010 passa a significar duas entidades e conversa.
- **Descoberta antecipada:** impossível antes da flag; versão antiga permanece justa.

## 11 — Memória conflitante

- **Objetivo:** reconstruir uma forma a partir de dois relatos.
- **O que vê:** laterais curtas, comprimento atrás e uma negação confiante.
- **Pista real:** geometria de um corte conhecido.
- **Distrações:** credibilidade declarada da entidade B.
- **Solução:** comparar os registros.
- **Dependências:** 10.
- **Flags:** conflito extraído; libera 12.
- **Dicas:** descrição → nome de corte → mullet.
- **Retorno futuro:** `CONFLICT` liga ao VX-02 no meta.
- **Descoberta antecipada:** não aplicável.

## 12 — MULLET

- **Objetivo:** nomear a memória negada.
- **O que vê:** campo de identificador.
- **Pista real:** conclusão do registro anterior.
- **Distrações:** resposta errada recebe trollagem leve.
- **Solução:** `MULLET`.
- **Dependências:** 11.
- **Flags:** `mulletConfirmed`; libera 13.
- **Dicas:** nome do corte → entidade B nega → resposta explícita.
- **Retorno futuro:** entra no teste de identidade e meta.
- **Descoberta antecipada:** resposta sem contexto não é acessível.

## 13 — TV alterada

- **Objetivo:** perceber segunda mudança silenciosa.
- **O que vê:** apenas um processo em segundo plano.
- **Pista real:** o registro antigo VX_RECEIVER está acessível.
- **Distrações:** a tela 13 parece vazia.
- **Solução:** voltar ao registro 03 e alcançar canal 11.
- **Dependências:** 12 e visita anterior à TV.
- **Flags:** `tvSequenceSeen`; libera 14.
- **Dicas:** aparelho mudou → TV → canal 11.
- **Retorno futuro:** sequência 2–5–1.
- **Descoberta antecipada:** canal 11 antes mostra apenas ruído.

## 14 — Livros posicionais

- **Objetivo:** projetar 2–5–1 sobre uma coleção ordenada.
- **O que vê:** índices, direção esquerda→direita e referência “acima do descanso”.
- **Pista real:** livros acima da cama.
- **Distrações:** possibilidade de coordenadas digitais.
- **Solução:** examinar livros 2, 5 e 1, unir os checksums e inserir `NIGHT-251`.
- **Dependências:** 13.
- **Flags:** `booksFound`; libera 15.
- **Dicas:** objetos ordenados → acima da cama → posições exatas.
- **Pista física:** quatro fragmentos nos três livros.
- **Retorno futuro:** LIVROS aparece no meta como evidência, não solução.
- **Descoberta antecipada:** fragmentos e token podem ser encontrados cedo e guardados.

## 15 — Frase incompleta

- **Objetivo:** ordenar fisicamente/mentalmente quatro fragmentos.
- **O que vê:** palavras embaralhadas clicáveis.
- **Pista real:** única sintaxe natural.
- **Distrações:** “noite” sugere cama cedo demais.
- **Solução:** `ONDE / A NOITE / DEIXA / O QUE VOCÊ PRECISA`.
- **Dependências:** 14.
- **Flags:** ordem de `fragments`; libera 16.
- **Dicas:** cama é rápida demais → móvel lateral → ordem explícita.
- **Retorno futuro:** conduz à cabeceira e não ao colchão.
- **Descoberta antecipada:** ordem errada é reversível clicando nos fragmentos.

## 16 — Mesa de cabeceira

- **Objetivo:** corrigir a falsa interpretação “cama”.
- **O que vê:** semântica de noite, alcance e proximidade.
- **Pista real:** móvel ao lado de onde se dorme.
- **Distrações:** cama como resposta óbvia.
- **Solução:** encontrar a tira e inserir `VX-11` (também aceita receptor/TV).
- **Dependências:** 15.
- **Flags:** `bedsideFound`; libera 17.
- **Dicas:** perto do sono → móvel acompanhante → mesa de cabeceira.
- **Pista física:** `VX-11 // O RECEPTOR ACEITA DOIS CONTROLES. A MESMA DEZENA.`
- **Retorno futuro:** VX-11 liga TV ao segundo resíduo do meta.
- **Descoberta antecipada:** papel pode ser guardado sem perda.

## 17 — TV 10/10

- **Objetivo:** dar função a dois controles antes inúteis.
- **O que vê:** TV com canal e volume persistentes.
- **Pista real:** “dois controles / mesma dezena” e EVENT_1010.
- **Distrações:** botão power e outros valores.
- **Solução:** canal 10, volume 10.
- **Dependências:** 16, 02 e 03.
- **Flags:** `tvTuned`; libera 18.
- **Dicas:** controles → mesma dezena → 10/10.
- **Retorno futuro:** 1010 deixa de ser só data e vira chave recorrente.
- **Descoberta antecipada:** valores persistem, mas só resolvem com o registro 17 ativo.

## 18 — Local reconstruído

- **Objetivo:** inferir lugar pela coexistência de características.
- **O que vê:** água, vento, bancos, brinquedos, área aberta e conversa.
- **Pista real:** composição única para a memória pessoal.
- **Distrações:** cada fragmento isolado é genérico.
- **Solução:** `PARQUINHO DA BEIRA-MAR` e aliases.
- **Dependências:** 17.
- **Flags:** `locationRecovered`; libera 19.
- **Dicas:** lugar, não palavra → coexistência → resposta explícita.
- **Retorno futuro:** local do evento inicial e meta narrativo.
- **Descoberta antecipada:** aliases evitam erro ortográfico/acentuação.

## 19 — Teste de identidade

- **Objetivo:** demonstrar reconhecimento sem quiz.
- **O que vê:** seis cartões de registros.
- **Pista real:** pares descrevem a mesma lembrança.
- **Distrações:** ordem visual embaralhada.
- **Solução:** EVENT/conversa, cabelo/mullet, margem/local.
- **Dependências:** 18, 12 e 10.
- **Flags:** `relationLinks`, `identityLinked`; libera 20.
- **Dicas:** vínculos → pares semânticos → pares explícitos.
- **Retorno futuro:** sistema passa a suspeitar que a usuária pertence ao arquivo.
- **Descoberta antecipada:** pares corretos persistem; erro não apaga progresso válido.

## 20 — Quarto virtual

- **Objetivo:** reconstruir espacialmente o quarto e notar a anomalia.
- **O que vê:** planta em grade e seis objetos arrastáveis.
- **Pista real:** cinco existem no quarto real; TV não.
- **Distrações:** vontade de posicionar também a TV.
- **Solução:** mover os cinco objetos reais e validar; a TV rejeita âncora.
- **Dependências:** 19.
- **Flags:** posições em `room`, `roomRebuilt`; libera 21.
- **Dicas:** quarto específico → posições reais → TV impossível.
- **Retorno futuro:** TV é reinterpretada como canal/testemunha, não móvel.
- **Descoberta antecipada:** posições persistem; arrastar TV não estraga estado.

## 21 — Objeto impossível e falso final

- **Objetivo:** produzir alívio e quebrá-lo de forma justa.
- **O que vê:** interface de `RECOVERY COMPLETE` e primeira frase humana.
- **Pista real:** barra para em 99%.
- **Distrações:** botão convincente de encerrar.
- **Solução:** clicar em encerrar; surge `1 RECORD MISSING`; retornar ao arquivo.
- **Dependências:** 20.
- **Flags:** `fakeFinalSeen`; libera 22.
- **Dicas:** objeto sem âncora → canal externo → clicar no encerramento.
- **Retorno futuro:** espelha o final verdadeiro, agora com 100%.
- **Descoberta antecipada:** estado não é apagado; trollagem nunca perde progresso.

## 22 — Node sob as histórias

- **Objetivo:** localizar o segundo QR por metáfora espacial.
- **O que vê:** “abaixo de onde as histórias ficam”.
- **Pista real:** estante de livros acima da cama.
- **Distrações:** livros individuais já usados.
- **Solução:** escanear QR sob a prateleira e inserir `VX-LIVROS-0214`.
- **Dependências:** 21; QR pode vir antes.
- **Flags:** `booksNodeScanned`, `booksNodeValidated`; libera 23.
- **Dicas:** histórias acima do sono → superfície inferior → estante.
- **Pista física:** segundo QR.
- **Retorno futuro:** abre a fase mais humana e prepara música.
- **Descoberta antecipada:** node detectado cedo é reaproveitado.

## 23 — Segunda visita à Lua

- **Objetivo:** criar o momento “estava ali desde o começo”.
- **O que vê:** observador com duas camadas e referência “atrás de você”.
- **Pista real:** o pano já visitado continha outra tira.
- **Distrações:** procurar novo objeto em vez de retornar.
- **Solução:** encontrar segunda tira e inserir `VX-02`.
- **Dependências:** 22 e 09.
- **Flags:** `moonSecondFound`; libera 24.
- **Dicas:** já visitou → camada separada → segunda borda da lua.
- **Pista física:** `VX-02 // O CONFLITO QUE A ENTIDADE B AINDA NEGA`.
- **Retorno futuro:** VX-02 conecta ao MULLET no meta.
- **Descoberta antecipada:** tira existe desde o início; encontrar cedo não impede inserir depois.

## 24 — Registro ausente / meta

- **Objetivo:** recombinar anotações físicas e registros antigos.
- **O que vê:** 99%, VX-04/11/02 e sete memórias recuperadas.
- **Pista real:** cada VX esteve fisicamente ligado a um conceito.
- **Distrações:** 1010, livros, música e parquinho são verdadeiros mas não carregam esses três VX.
- **Solução:** selecionar LUA (VX-04), TV (VX-11), MULLET (VX-02); resíduos mostram N/O/S; inserir `NÓS`.
- **Dependências:** todos os arcos principais, especialmente 09, 16 e 23.
- **Flags:** `metaSelections`, resposta 24, `finalRecovered`; libera 25.
- **Dicas:** códigos como ordem → associação física → sequência explícita.
- **Retorno futuro:** toda a recuperação é reinterpretada como história das duas entidades.
- **Descoberta antecipada:** seleção é reversível; nenhuma tentativa apaga flags.

## 25 — Recuperação completa

- **Objetivo:** revelar que o sistema recompunha o relacionamento.
- **O que vê:** interface quente, entidades nomeadas, data, contador, mensagem, mídia e estatísticas.
- **Pista real:** todas as pistas anteriores eram memórias.
- **Distrações:** nenhuma; é recompensa narrativa.
- **Solução:** não há nova trava.
- **Dependências:** 24.
- **Flags:** `finalRecovered`.
- **Dicas:** não necessárias.
- **Retorno futuro:** fotos, vídeo, música e link são configuráveis.
- **Descoberta antecipada:** rota não abre sem desbloqueio persistido.

# Sistema de dicas

Cada registro possui três níveis persistidos:

1. chama atenção para a categoria da anomalia;
2. direciona o raciocínio e elimina a interpretação injusta mais comum;
3. explica quase todo o mecanismo, preservando apenas a ação final.

Antes da primeira pista, o painel avisa `JOÃO SERÁ NOTIFICADO`, sem enviar dados. O contador final soma níveis revelados, não apenas registros que pediram ajuda.

# Auditoria de softlocks

- **QR encontrado cedo:** o código pode ser guardado e continua aceito quando o registro correto for aberto.
- **Tela antiga necessária:** o arquivo lateral mantém todo registro desbloqueado navegável.
- **TV em valor adiantado:** canal/volume persistem e os gatilhos são reavaliados em cada interação no registro correto.
- **Fragmentos em ordem errada:** cada peça pode ser removida individualmente.
- **Pares de identidade:** acertos persistem; erros limpam apenas a seleção atual.
- **Quarto virtual:** qualquer posição é aceita depois que os cinco objetos reais foram conscientemente movidos; não depende de uma planta que João ainda não forneceu.
- **Meta em ordem errada:** a quarta escolha reinicia a sequência sem apagar descobertas.
- **Atualização/reabertura:** todo estado relevante fica em `localStorage`.
- **Áudio bloqueado/mudo:** nenhuma solução depende apenas de som.
- **Movimento reduzido:** mensagens e estados continuam legíveis sem animação.

# Melhorias aplicadas ao conceito

- Transformação dos retornos 10 e 13 em mudanças reais de registros antigos, não telas que anunciam a mudança.
- Falso final colocado após a TV impossível para nascer da própria lógica, não como susto arbitrário.
- Meta baseado nos códigos impressos nos três papéis, recompensando anotações e memória física.
- Planta do quarto valida intenção de posicionamento, não coordenadas desconhecidas, evitando arbitrariedade.
- QR antecipado virou evidência persistente, não erro fatal.
- Morse ganhou transcrição visual e binário ganhou separação em bytes, mantendo descoberta difícil e decodificação justa.

# Dados ainda necessários

- Ajustes opcionais na mensagem final.
- URL/arquivo autorizado de `So Easy to Fall in Love`.
- Fotos, vídeos e link secreto finais.
- Endereço de publicação para gerar os três QR Codes em `dev/physical-kit.html`.
- Confirmação de que existem pelo menos cinco livros utilizáveis na estante.
- Confirmação de locais seguros e alcançáveis na escrivaninha, cabeceira, estante, pano de lua e área privada do quintal.
- Se desejado, planta aproximada real do quarto para ajustar a posição inicial/configuração visual.
