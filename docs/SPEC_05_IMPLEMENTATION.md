# SPEC 05 — implementação

## Princípio estrutural

A experiência passa a ser enquadrada por um `ROOM STAGE`. PC, Receiver, mesa, cabeceira e quarto são alvos da mesma câmera conceitual. O celular permanece portátil e pode abrir sobre o alvo atual. Transições entre alvos iguais não executam movimento de quarto.

O estado de câmera vive apenas durante a sessão:

```text
roomCamera
  target
  previousTarget
  transition
  locked
```

Cada conclusão cria uma única `pendingTransition.instanceId`. Re-renderizações não recriam a mesma oferta. O texto de orientação e o CTA não repetem a mesma label.

## Paper Engine

`js/paper-engine.js` define mesas persistentes por fase. Cada peça mantém `x`, `y`, `rotation`, `z`, `flipped`, `group` e `locked`. O z-index é monotônico e a seleção sempre traz o papel para frente. Drag não resolve automaticamente; a validação usa tolerância pequena e rotação.

Mesas implementadas:

- 11: fotografia e contorno do OBJETO C, com duas distrações;
- 18: mapa rasgado com seis peças válidas e quatro distrações;
- 20: quatro transparências da planta;
- 24: síntese de PC, Receiver, livros e mesa.

As mesas anteriores permanecem no estado como vestígios arquivados.

## VX_NET

`VX_NET.exe` é uma rede estritamente local. Possui barra de endereço, voltar, avançar, reload, histórico, favoritos, cache, Downloads, busca local e 404. `mirror://final` contém snapshots; o download correto cria `DUMP_24.bin` em `C:\DOWNLOADS`, sem materializá-lo no desktop.

## Telefone

Eventos possuem ledger canônico por `eventId`. Entrega repetida atualiza lifecycle e substitui a notificação associada, sem duplicar bubble. A fase 12 percorre Mensagens, Arquivos e CAM Archive antes de anexar Curitiba.

## Window manager

O contador de z permanece monotônico. Nova janela recebe maior z, foco a traz à frente, conteúdo crítico nasce centralizado e limitado à viewport, e toda titlebar possui ação explícita de trazer para frente.

## Reworks de puzzle

- 06: analisador coarse/fine em 170.8, SIGNAL LOCK e congelamento dos invariantes;
- 07: triangulação de snapshots no VX_NET;
- 08: decoder do arquivo realmente baixado;
- 09: busca LUA e recuperação do scan por contraste/canal;
- 10: histórico versus checksum atual e cópia em quarentena;
- 11: composição de papéis;
- 12: investigação entre apps do telefone;
- 13 e 15: preservadas;
- 17: waveform, estabilidade e lock respondem aos três controles;
- 18: mapa rasgado + segunda fonte;
- 19: hipótese livre com verificação posterior;
- 20: transparências e divergência de +11,2 m²;
- 21 e 23: preservadas;
- 22: títulos apontam a região sob a estante;
- 24: síntese física sem tutorial de concatenação;
- 25: payoff isolado do shell, hints e handoffs.

## Curva qualitativa

| Fase | Observação | Navegação | Transformação | Correlação | Memória |
|---|---:|---:|---:|---:|---:|
| 03 | 2 | 1 | 1 | 0 | 0 |
| 06 | 3 | 2 | 3 | 2 | 1 |
| 11 | 3 | 2 | 3 | 3 | 2 |
| 18 | 4 | 3 | 4 | 4 | 3 |
| 24 | 4 | 4 | 4 | 5 | 5 |

Nenhum estado é persistido em armazenamento local. Recarregar reinicia a sessão.
