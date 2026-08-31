# Montagem física

Não imprima QR Codes antes de definir o endereço definitivo do site. Os caminhos abaixo já são os caminhos finais esperados pelo código.

## Materiais

- 3 QR Codes pequenos
- 7 tiras de papel (4 dos livros, 1 da lua na primeira camada, 1 da mesa de cabeceira, 1 da lua na segunda camada)
- fita removível de baixa aderência ou adesivo reposicionável
- caneta ou impressão em tipografia monoespaçada

Nada exige mover móveis, subir em superfícies, desmontar objetos ou danificar o pano.

## Gerador e impressão

Abra `dev/physical-kit.html` diretamente. Informe a URL base onde o site será servido, atualize os QRs e use **IMPRIMIR KIT**. A página DEV não é vinculada pela experiência normal e gera tudo localmente, sem enviar endereço ou conteúdo a serviços externos.

## Node da escrivaninha

- Puzzle: `NODE_02` / registro 05
- QR: `http://SEU-ENDERECO/node.html?node=desk`
- Esconderijo seguro: sob uma borda frontal facilmente alcançável da escrivaninha, sem exigir que ela entre sob o móvel
- Texto impresso junto ao QR: `NODE 02 // TOKEN VX-MESA-1010`
- Token configurado: `VX-MESA-1010`
- Se for encontrado cedo, o código pode ser guardado; o registro 05 só dará contexto no momento correto

## Livros 2–5–1

Conte os livros da esquerda para a direita. Ajuste `bookPositions` em `js/config.js` se houver menos de cinco livros ou se algum não puder receber papel com segurança.

- Livro 2: `A NOITE` e checksum `NI`
- Livro 5: `O QUE VOCÊ PRECISA` e checksum `GH`
- Livro 1: `ONDE` e, no verso da mesma tira, `DEIXA`; checksum `T-251`

Os checksums formam `NIGHT-251`, token configurável em `bookFragmentToken`. Os quatro fragmentos digitais aparecem embaralhados. O objetivo físico é provar que 2–5–1 aponta para livros; o digital verifica a ordem sintática final:

`ONDE / A NOITE / DEIXA / O QUE VOCÊ PRECISA`

Prenda cada tira como marcador, sem cola sobre páginas.

## Lua — primeira camada

- Puzzle: registro 09
- Coloque uma tira visível apenas ao examinar uma borda acessível do pano
- Texto: `VX-04 // VOCÊ JÁ PASSOU POR ISSO`
- Não coloque atrás de suporte elétrico, prego ou ponto alto

## Mesa de cabeceira

- Puzzle: registro 16
- Esconderijo: sob um objeto leve que normalmente fica sobre o móvel, ou sob uma borda acessível
- Texto: `VX-11 // O LIMIAR AINDA NÃO FOI AUTENTICADO.`
- Isso abre a transição para a área externa, mas não revela onde o NÓ está

## NÓ do limiar / quintal

- Puzzle: `NÓ_17` / registro 17
- QR: `http://SEU-ENDERECO/node.html?node=yard`
- Esconderijo seguro: área privada do quintal, perto do limite físico da casa, ao alcance do chão e protegida do tempo
- Texto impresso junto: `NÓ 17 // TOKEN VX-LIMIAR-1010`
- Fragmento revelado pelo NÓ: `REPITA O EVENTO NOS DOIS CONTROLES`
- O fragmento não fornece os valores; Rayssa precisa cruzá-lo com `EVENTO_1010` no ARQUIVO
- Nunca posicionar na rua, em muro alto, árvore, telhado, quadro elétrico ou propriedade vizinha

## Node da estante

- Puzzle: `NODE_11` / registro 22
- QR: `http://SEU-ENDERECO/node.html?node=books`
- Esconderijo seguro: sob a borda frontal da prateleira, alcançável do chão
- Texto impresso junto: `NODE 11 // TOKEN VX-LIVROS-0214`
- Token configurado: `VX-LIVROS-0214`
- Se for encontrado cedo, o código pode ser guardado; o registro 22 só dará contexto no momento correto

## Lua — segunda camada

Esta tira precisa estar no local desde o começo, mas fisicamente separada da primeira.

- Coloque-a na outra borda acessível do pano, dobrada para dentro, sem exigir remover o tecido
- Texto externo discreto: `OBSERVER / LAYER B`
- Texto interno: `VX-02 // O CONFLITO QUE A ENTIDADE B AINDA NEGA`

Na primeira visita, a tira VX-04 deve ser naturalmente encontrada antes. A VX-02 não deve depender de escuridão, altura ou desmontagem; ela só deve parecer irrelevante até a pista da segunda visita.

## Checklist antes da noite

- Publicar o site e confirmar o endereço definitivo
- Abrir `dev/physical-kit.html`, informar a URL base e imprimir os três cartões
- Testar os três QR Codes em um celular real
- Revisar mensagem final, música e galeria
- Abrir sem `?dev=1`
- Limpar o `localStorage` no navegador que será usado
- Conferir que todos os papéis podem ser alcançados com segurança
- Deixar papel e caneta disponíveis sem anunciar que serão necessários
- Manter uma cópia dos tokens para socorro manual
