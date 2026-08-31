const blueprint = (family, narrative, objective, object, mechanic, feedback, transition) => Object.freeze({
  family, narrative, objective, object, mechanic, feedback, transition
});

export const SCENE_BLUEPRINTS = Object.freeze({
  '01': blueprint('override', 'inicialização interrompida', 'ativar recuperação', 'nó de sistema', 'completar comando', 'boot físico', 'hard-reset'),
  '02': blueprint('system', 'arquivo sobrevivente', 'encontrar registro anômalo', 'índice de logs', 'inspeção de metadados', 'anomalia localizada', 'frame-ghost'),
  '03': blueprint('device', 'interceptação', 'encontrar a portadora', 'televisão CRT', 'sintonização', 'interferência analógica', 'receiver-channel-lock'),
  '04': blueprint('device', 'sinal codificado', 'interpretar a transmissão', 'televisão CRT', 'leitura de Morse', 'objeto identificado', 'signal-recovery'),
  '05': blueprint('reconstruction', 'nó físico', 'validar código', 'armazenamento frio', 'autenticação', 'acesso concedido', 'signal-recovery'),
  '06': blueprint('archive', 'duas versões', 'localizar invariante', 'documento recuperado', 'comparação por varredura', 'texto estabilizado', 'hard-reset'),
  '07': blueprint('archive', 'diretório suspeito', 'identificar arquivo real', 'pasta recuperada', 'análise de metadados', 'falso positivo', 'frame-ghost'),
  '08': blueprint('system', 'pacote sem cabeçalho', 'decodificar objeto', 'dump binário', 'agrupamento visual', 'palavra recuperada', 'frame-ghost'),
  '09': blueprint('reconstruction', 'resíduo lunar', 'validar índice', 'memória fria', 'correspondência', 'memória reativada', 'signal-recovery'),
  '10': blueprint('system', 'índice divergente', 'localizar registro alterado', 'arquivo persistente', 'consulta histórica', 'soma de verificação alterada', 'frame-ghost'),
  '11': blueprint('forensic', 'conflito de identidade', 'reconstruir geometria', 'mesa forense', 'seleção de camadas', 'modelo desenhado', 'hard-reset'),
  '12': blueprint('reconstruction', 'memória negada', 'confirmar lembrança', 'fragmento humano', 'resposta em conflito', 'negação do sistema', 'vertical-desync'),
  '13': blueprint('device', 'portadora alterada', 'revelar imagem residual', 'televisão CRT', 'canal e desligamento', 'imagem residual', 'receiver-power-off'),
  '14': blueprint('reconstruction', 'índices físicos', 'ordenar posições', 'arquivo de livros', 'soma de fragmentos', 'sequência encontrada', 'signal-recovery'),
  '15': blueprint('forensic', 'instrução rasgada', 'recompor sintaxe', 'mesa de fragmentos', 'montagem de papéis', 'frase estabilizada', 'hard-reset'),
  '16': blueprint('reconstruction', 'objeto de cabeceira', 'validar fragmento', 'memória espacial', 'correspondência física', 'índice VX-11', 'signal-recovery'),
  '17': blueprint('device', 'controle recorrente', 'fixar portadora', 'receptor analógico', 'canal e volume', 'sincronização', 'signal-recovery'),
  '18': blueprint('forensic', 'local sem nome', 'reconstruir lugar', 'mapa de evidências', 'coexistência espacial', 'contorno recuperado', 'hard-reset'),
  '19': blueprint('reconstruction', 'memórias duplicadas', 'ligar pares', 'matriz de identidade', 'relações semânticas', 'vínculos desenhados', 'phosphor-burn'),
  '20': blueprint('reconstruction', 'quarto incompleto', 'reconstruir relações', 'planta top-down', 'posicionamento espacial', 'objeto impossível', 'vertical-desync'),
  '21': blueprint('override', 'falso encerramento', 'romper a conclusão', 'final adulterado', 'interrupção narrativa', 'integridade 99%', 'system-signal-loss'),
  '22': blueprint('reconstruction', 'segundo nó físico', 'validar cabeçalho', 'arquivo de áudio', 'autenticação', 'canal externo', 'signal-recovery'),
  '23': blueprint('reconstruction', 'segunda camada', 'confirmar resíduo', 'registro de identidade', 'retorno físico', 'entidade exposta', 'phosphor-burn'),
  '24': blueprint('override', 'relação órfã', 'classificar vínculo', 'núcleo do sistema', 'meta associação', 'fusão de entidades', 'hard-reset'),
  '25': blueprint('override', 'memória restaurada', 'permanecer', 'estado final', 'conclusão narrativa', 'sistema estável', 'signal-recovery')
});

export function sceneBlueprintFor(puzzle) {
  return SCENE_BLUEPRINTS[puzzle.id] || SCENE_BLUEPRINTS['02'];
}
