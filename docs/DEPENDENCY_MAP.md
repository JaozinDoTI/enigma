# Mapa de dependências

```text
BOOT
  └─ EVENT_1010 ─ TV(CH04) ─ MORSE:MESA ─ QR ESCRIVANINHA
                                      └─ documento ─ arquivos ─ binário:LUA
                                                                    └─ LUA #1 [VX-04]
                                                                          └─ retorno ao EVENT_1010
                                                                                └─ conflito ─ MULLET
                                                                                               └─ retorno à TV(CH11)
                                                                                                     └─ 2-5-1 ─ LIVROS
                                                                                                                   └─ frase física
                                                                                                                         └─ CABECEIRA [VX-11/TV]
                                                                                                                               └─ TV 10/10
                                                                                                                                     └─ PARQUINHO
                                                                                                                                           └─ vínculos de identidade
                                                                                                                                                 └─ QUARTO VIRTUAL
                                                                                                                                                       └─ TV impossível
                                                                                                                                                             └─ FALSO FINAL 99%
                                                                                                                                                                   └─ QR ESTANTE
                                                                                                                                                                         └─ LUA #2 [VX-02/CONFLITO]
                                                                                                                                                                               └─ META
                                                                                                                                                                                     └─ FINAL
```

## Alimentação do meta-enigma

```text
VX-04 ─ primeira visita à LUA ─┐
VX-11 ─ cabeceira → TV ────────┼─ ordem: LUA / TV / MULLET ─ resíduos: N / O / S ─ NÓS
VX-02 ─ segunda Lua → CONFLITO ─┘

1010 ─ data e controles da TV ───────────────┐
MULLET ─ memória negada ─────────────────────┤
PARQUINHO ─ localização reconstruída ────────┼─ reinterpretação final das duas entidades
TV ─ testemunha/objeto impossível ───────────┤
LUA ─ observador físico em duas camadas ─────┘
```

## Progressão não perfeitamente linear

- Os QR nodes podem ser escaneados antes de seus registros. O estado fica `detected-early` e é reaproveitado depois.
- Registros concluídos permanecem navegáveis. Os registros `EVENT_1010` e `VX_RECEIVER` mudam silenciosamente.
- A progressão principal tem uma espinha narrativa para evitar contradições, mas voltar, investigar e descobrir nodes cedo não perde dados nem trava o jogo.
