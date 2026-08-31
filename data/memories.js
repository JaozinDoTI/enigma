export const HAIR_CONFLICT = {
  entityA: ['pedido recorrente confirmado', 'laterais curtas', 'comprimento preservado atrás', 'frequência: mais de uma vez'],
  entityB: ['registro negado', 'frase provável: “eu nunca pedi isso”', 'confiança declarada: 97%', 'confiança do arquivo: 99.4%']
};

export const IDENTITY_RECORDS = [
  { id: 'date', label: 'EVENTO_1010', pair: 'conversation' },
  { id: 'conversation', label: 'CONVERSA QUE MUDOU O ESTADO', pair: 'date' },
  { id: 'hair', label: 'ARQUIVO CAPILAR NEGADO', pair: 'mullet' },
  { id: 'mullet', label: 'MEMÓRIA CONFIRMADA / ENTIDADE B NEGA', pair: 'hair' },
  { id: 'shore', label: 'ÁGUA + VENTO + BRINQUEDOS', pair: 'place' },
  { id: 'place', label: 'LOCAL DO EVENTO INICIAL', pair: 'shore' }
];
