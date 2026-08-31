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
- posições dos livros, caso 2–5–1 não sejam práticas

O `index.html` pode ser aberto diretamente por duplo clique. Os arquivos em `js/` continuam modulares para manutenção, enquanto `js/app.bundle.js` é a versão carregada pelo navegador.

Depois de alterar qualquer arquivo JavaScript modular, atualize os bundles:

```powershell
node scripts/build-bundles.mjs
```

O sistema de movimento está centralizado em `js/motion-engine.js`. As regras de resposta ficam em `js/progression.js`; os metadados narrativos e de acessibilidade dos 25 registros ficam em `js/puzzles/contracts.js`.

Também é possível servir a pasta como site estático, mas isso não é obrigatório.

## Modo de desenvolvimento

Abra `index.html?dev=1`. Um console discreto aparece na barra lateral para desbloquear o próximo registro, visualizar o estado e resetar o progresso.

Na versão entregue, use a URL sem `?dev=1` e mantenha `devMode: false`.

## QR nodes

- Escrivaninha: `http://SEU-ENDERECO/node.html?node=desk`
- Estante: `http://SEU-ENDERECO/node.html?node=books`

Substitua `SEU-ENDERECO` pelo endereço final publicado antes de gerar os QR Codes. A página móvel revela um token de retorno; o terminal principal só o valida quando o contexto correto foi recuperado. Isso funciona sem sincronizar `localStorage` entre celular e notebook.

## Limitação de segurança

Todo conteúdo enviado ao navegador pode ser encontrado por alguém tecnicamente determinado. `finalVideoUrl` vazio evita expor um link antes de você decidir a estratégia. Para proteção real, use um serviço autenticado. Uma futura versão pode armazenar conteúdo cifrado e derivar uma chave da resposta final com Web Crypto, mas isso ainda seria proteção limitada do lado do cliente.

Consulte `docs/PHYSICAL_SETUP.md` antes de imprimir qualquer papel.

## Documentação de evolução

- `docs/PUZZLE_MAP.md`: comportamento e soluções atuais.
- `docs/EVOLUTION_MATRIX.md`: contrato cinematográfico proposto para os 25 registros, com atos, motion, corrupção, evidências e mutações do sistema.
