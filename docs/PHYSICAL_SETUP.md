# Montagem física

Não imprima QR Codes antes de definir o endereço definitivo do site. Os caminhos abaixo já são os caminhos finais esperados pelo código.

## Materiais

- 4 QR Codes pequenos, gerados pela área DEV
- 10 tiras ou marcas (4 dos livros, 2 da lua, 1 da mesa de cabeceira e 3 símbolos do quintal)
- fita removível de baixa aderência ou adesivo reposicionável
- caneta ou impressão em tipografia monoespaçada

Nada exige mover móveis, subir em superfícies, desmontar objetos ou danificar o pano.

## Gerador e impressão

Abra `dev/physical-kit.html` diretamente. Informe a URL base onde o site será servido, atualize os QRs e use **IMPRIMIR KIT**. A página DEV não é vinculada pela experiência normal e gera tudo localmente, sem enviar endereço ou conteúdo a serviços externos.

## Livros FIM / COMEÇO — BOOKSCAN

- **É Assim que Acaba**: `FIM // 03:__`
- **É Assim que Começa**: `COMEÇO // __:17`

Mantenha os volumes imediatamente adjacentes. A captura real, o log `DISTÂNCIA 01` e a afterimage `FIM · 01 · COMEÇO` identificam o par; somente os insertos físicos completam `03:17`.

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

## Cadeiras verdes — NÓ cromático

- Puzzle: `NÓ_14` / registro 17
- QR: `http://SEU-ENDERECO/node.html?node=green`
- Antes de preparar, defina uma ordem inequívoca das cadeiras da esquerda para a direita
- Use a sequência `03 · 01 · 04` como confirmação de posição/orientação e deixe o QR apenas na cadeira correta
- Esconderijo seguro: atrás ou sob uma parte acessível, sem desmontagem, dentro de envelope plástico
- O celular revela `△ ○ ⌁`, que será usado no quintal

## Quintal — NÓ da margem

- Puzzle: `NÓ_17` / registro 18
- QR: `http://SEU-ENDERECO/node.html?node=yard`
- Prepare `△`, `○` e `⌁` em três pontos acessíveis e com leitura inequívoca; a última marca leva ao QR
- Esconderijo seguro: área privada do quintal, ao alcance do chão e protegida do tempo
- Texto impresso junto: `NÓ 17 // TOKEN VX-MARGEM-1703`
- Fragmento revelado pelo NÓ: `REPITA O EVENTO NOS DOIS CONTROLES`
- O fragmento não fornece os valores; Rayssa precisa cruzá-lo com `EVENTO_1010` no ARQUIVO
- Nunca posicionar na rua, em muro alto, árvore, telhado, quadro elétrico ou propriedade vizinha

## Quarto não indexado — NÓ 00

- Puzzle: reconstrução espacial / registro 20
- QR: `http://SEU-ENDERECO/node.html?node=room`
- Crie uma cadeia curta de três marcas discretas próximas de madeira; a terceira indica o esconderijo acessível
- Não deixe o QR visível na entrada e não use palavras como “quarto assombrado” no material
- Texto impresso: `LEITURA ANTERIOR // 03:17 // EVENTO DE ENTRADA AUSENTE`
- O áudio do celular é sintetizado localmente: hum baixo e três impactos, sem jumpscare ou arquivo externo

## Node da estante

- Puzzle: `NODE_11` / registro 22
- QR: `http://SEU-ENDERECO/node.html?node=books`
- Esconderijo seguro: sob a borda frontal da prateleira, alcançável do chão
- Texto impresso junto: `NODE 11 // TOKEN VX-LIVROS-0214`
- Token configurado: `VX-LIVROS-0214`
- Se for encontrado cedo, o código pode ser guardado; o registro 22 só dará contexto no momento correto

## Retorno temporal — 10:10

- Depois de `03:17`, a estação mantém a hora calibrada.
- Na fase 23, o próprio `EVENTO_1010` fornece a hora de origem `10:10`.
- A solução acontece no relógio simulado da barra inferior, sem novo inserto físico.

## Checklist antes da noite

- Publicar o site e confirmar o endereço definitivo
- Abrir `dev/physical-kit.html`, informar a URL base e imprimir os quatro cartões e os dois insertos de livros
- Conferir os quatro QR Codes em um celular real antes da entrega
- Revisar mensagem final, música e galeria
- Abrir sem `?dev=1`
- Evitar recarregar ou fechar a página durante a experiência, pois o progresso existe apenas em memória
- Conferir que todos os papéis podem ser alcançados com segurança
- Deixar papel e caneta disponíveis sem anunciar que serão necessários
- Manter uma cópia dos tokens para socorro manual
