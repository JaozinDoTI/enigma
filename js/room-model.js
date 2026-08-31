const REQUIRED_OBJECTS = ['bed','shelf','desk','bedside','moon'];

const RELATIONS = [
  { id: 'shelf-above-bed', label: 'ESTANTE ACIMA DA CAMA', test: (room) => room.shelf.y < room.bed.y - 8 },
  { id: 'moon-above-bed', label: 'LUA ACIMA DA CAMA', test: (room) => room.moon.y < room.bed.y - 8 },
  { id: 'bedside-near-bed', label: 'MESA LATERAL JUNTO À CAMA', test: (room) => room.bedside.x < room.bed.x && Math.abs(room.bedside.y - room.bed.y) < 28 },
  { id: 'desk-right-bed', label: 'ESCRIVANINHA À DIREITA', test: (room) => room.desk.x > room.bed.x },
  { id: 'shelf-aligned-bed', label: 'ESTANTE ALINHADA À CAMA', test: (room) => Math.abs(room.shelf.x - room.bed.x) < 36 }
];

export function evaluateRoom(state) {
  const room = state.room || {};
  const moved = REQUIRED_OBJECTS.filter((key) => room[key]?.moved);
  const canEvaluate = moved.length === REQUIRED_OBJECTS.length;
  const verifiedRelations = canEvaluate ? RELATIONS.filter((relation) => relation.test(room)) : [];
  const score = moved.length ? Math.min(99, 80 + moved.length * 2 + verifiedRelations.length) : 0;
  return {
    required: REQUIRED_OBJECTS,
    moved,
    relations: RELATIONS,
    verifiedRelations,
    score,
    ready: canEvaluate && verifiedRelations.length >= 4
  };
}
