# SPEC 03 — implementação

## Progressão

Os registros agora distinguem quatro estados: `LOCKED`, `LATENT`, `DISCOVERED` e `COMPLETED`. Um registro latente pode existir no mundo, mas não aparece no trilho nem aceita rota direta. A interação com seu ponto de entrada o marca como descoberto. O catálogo mantém `revealTitle`, `visibility`, `discovery`, `entryPoints`, `behaviorHooks` e `reactiveEvents`; o título narrativo só aparece depois da conclusão.

## Diretor comportamental

`js/behavior-director.js` observa apenas sinais internos da sessão: repetição de arquivos, navegação improdutiva, buscas vazias, respostas inconsistentes, uso excessivo do Receiver, quarentena e notificações ignoradas. A seleção usa uma seed em memória, prioridade, peso, cooldown, limite por evento e orçamento por ato. Pistas críticas continuam determinísticas.

O celular pode receber mensagens, chamadas, notas, artefatos, itens de galeria, alteração de bateria e aparições breves. Todos os efeitos passam pelo mesmo agendador de mundos. `?dev=1` expõe seed, métricas e simulações de famílias de eventos.

## Fase 06

`REL_1708.A` aparece em `ARCHIVE_170491`; `REL_1708.B` precisa ser encontrado separadamente no backup. Reabrir as cópias avança estados controlados sem randomizar a pista crítica. O comparador usa overlay, transparência, regiões fixáveis e snapshot. A instrução recuperada é `A DATA ABRE O ARQUIVO`.

## Câmera opcional e privacidade

`CAM_LOCAL.exe` só chama `getUserMedia` depois de um clique explícito. Quando autorizado, captura um único quadro em canvas, encerra todas as tracks imediatamente e conserva apenas uma URL de Blob em memória. Não existe upload, reconhecimento facial, `localStorage`, IndexedDB ou persistência. Negar ou não possuir câmera ativa um artefato fictício equivalente e não bloqueia nenhuma fase. Resetar ou recarregar descarta o quadro.

## Acessibilidade

Os eventos importantes têm representação textual. O overlay possui controles nativos de teclado, as regiões são botões semânticos e a captura não é requisito de progressão. `prefers-reduced-motion` remove animações do título, vibração visual e aparições breves.
