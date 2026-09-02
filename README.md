# RECOVERY_1010

Uma experiência investigativa estática, feita em HTML, CSS e JavaScript, que mistura um arquivo digital corrompido com pistas físicas no quarto.

## Antes de entregar

Edite `js/config.js` e preencha pelo menos:

- `playerName`
- `finalMessage`
- `musicUrl` (URL autorizada ou caminho local)
- `gallery`
- `finalVideoUrl` / `finalSecretUrl`, se desejar
- códigos dos nodes, caso queira substituir os padrões
- posições dos livros, caso o par FIM · distância 01 · COMEÇO não seja prático

O `index.html` pode ser aberto diretamente por duplo clique. Os arquivos em `js/` continuam modulares para manutenção, enquanto `js/app.bundle.js` é a versão carregada pelo navegador.

Depois de alterar qualquer arquivo JavaScript modular, atualize os bundles:

```powershell
node scripts/build-bundles.mjs
```

O sistema de movimento está centralizado em `js/motion-engine.js`. `js/puzzles/catalog.js` é a fonte canônica dos registros: narrativa, objetivo, interação, pistas, renderer, controller, efeitos e solução derivam do mesmo contrato. `js/progression.js` apenas executa os efeitos declarados.

Também é possível servir a pasta como site estático, mas isso não é obrigatório.

O progresso existe apenas em memória enquanto `index.html` permanece aberto. Recarregar ou fechar a página reinicia a experiência; nenhum estado é gravado no navegador.

## Modo de desenvolvimento

Abra `index.html?dev=1`. Um console discreto aparece na barra lateral para desbloquear o próximo registro, visualizar o estado e resetar o progresso.

Na versão entregue, use a URL sem `?dev=1` e mantenha `devMode: false`.

## QR nodes

- Cadeira verde: `http://SEU-ENDERECO/node.html?node=green`
- Margem do quintal: `http://SEU-ENDERECO/node.html?node=yard`
- Quarto não indexado: `http://SEU-ENDERECO/node.html?node=room`
- Estante: `http://SEU-ENDERECO/node.html?node=books`

A primeira saída física obrigatória acontece no registro 09, com a marca `VX-04` na Lua. Os quatro QR nodes só entram depois que o computador, o Arquivo e o Receiver já estabeleceram suas regras.

O kit também imprime dois insertos não-QR para **É Assim que Acaba** e **É Assim que Começa**. A fotografia e o Receiver identificam o par pela relação FIM · distância 01 · COMEÇO; os insertos formam `03:17` sem depender do conteúdo literário.

Substitua `SEU-ENDERECO` pelo endereço final publicado antes de gerar os QR Codes. A página móvel revela um token de retorno; o terminal principal só o valida quando o contexto correto foi recuperado. Não há sincronização automática de estado entre celular e notebook.

## Limitação de segurança

Todo conteúdo enviado ao navegador pode ser encontrado por alguém tecnicamente determinado. `finalVideoUrl` vazio evita expor um link antes de você decidir a estratégia. Para proteção real, use um serviço autenticado. Uma futura versão pode armazenar conteúdo cifrado e derivar uma chave da resposta final com Web Crypto, mas isso ainda seria proteção limitada do lado do cliente.

Consulte `docs/PHYSICAL_SETUP.md` antes de imprimir qualquer papel.

## Documentação de evolução

- `docs/PUZZLE_MAP.md`: comportamento e soluções atuais.
- `docs/EVOLUTION_MATRIX.md`: contrato cinematográfico proposto para os 25 registros, com atos, motion, corrupção, evidências e mutações do sistema.
