export const OBJECT_CONFLICT = {
  entityA: ['material têxtil', 'forma animal', 'volume pequeno', 'origem doméstica recorrente'],
  entityB: ['silhueta felina', 'superfície macia', 'presença em mais de uma captura', 'identidade ainda não catalogada']
};

export const IDENTITY_RECORDS = [
  { id: 'date', label: 'EVENTO_1010', pair: 'conversation' },
  { id: 'conversation', label: 'A CONVERSA QUE COMEÇOU TUDO', pair: 'date' },
  { id: 'object-c', label: 'OBJETO SEM NOME', pair: 'curitiba' },
  { id: 'curitiba', label: 'CURITIBA', pair: 'object-c' },
  { id: 'shore', label: 'ÁGUA + VENTO + BRINQUEDOS', pair: 'place' },
  { id: 'place', label: 'ONDE OS DOIS ESTAVAM EM 10.10', pair: 'shore' }
];
