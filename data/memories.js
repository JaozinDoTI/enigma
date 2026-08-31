export const HAIR_CONFLICT = {
  entityA: ['o pedido aconteceu mais de uma vez', 'laterais curtas', 'comprimento mantido atrás', 'testemunha insiste que lembra direito'],
  entityB: ['“eu nunca pedi isso”', 'negação repetida sem detalhe novo', 'certeza declarada: 97%', 'compatibilidade com o arquivo: 99,4%']
};

export const IDENTITY_RECORDS = [
  { id: 'date', label: 'EVENTO_1010', pair: 'conversation' },
  { id: 'conversation', label: 'A CONVERSA QUE COMEÇOU TUDO', pair: 'date' },
  { id: 'hair', label: 'UM PEDIDO QUE ELA NEGA', pair: 'mullet' },
  { id: 'mullet', label: 'O CORTE QUE O ARQUIVO CONFIRMOU', pair: 'hair' },
  { id: 'shore', label: 'ÁGUA + VENTO + BRINQUEDOS', pair: 'place' },
  { id: 'place', label: 'ONDE OS DOIS ESTAVAM EM 10.10', pair: 'shore' }
];
