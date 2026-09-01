import { renderSystemScene } from './system-scene.js';
import { renderReceiverScene } from './receiver-scene.js';
import { renderEvidenceScene } from './evidence-scene.js';
import { renderDocumentScene } from './document-scene.js';
import { renderOverrideScene, renderReconstructionScene } from './immersive-scene.js';
import { renderPhoneScene } from './phone-scene.js';
export function sceneFamilyFor(puzzle) {
  if (puzzle.world === 'computer') return 'computer';
  if (puzzle.world === 'tv') return 'device';
  if (puzzle.world === 'phone') return 'phone';
  return puzzle.environment || puzzle.family || puzzle.world || 'computer';
}

export function worldFor(puzzle) { return puzzle.world || sceneFamilyFor(puzzle); }

export function renderExperienceScene(context) {
  const family = sceneFamilyFor(context.puzzle);
  const renderer = ({
    computer: renderSystemScene,
    system: renderSystemScene,
    device: renderReceiverScene,
    phone: renderPhoneScene,
    forensic: renderEvidenceScene,
    archive: renderDocumentScene,
    reconstruction: renderReconstructionScene,
    override: renderOverrideScene,
    final: renderOverrideScene
  })[family] || renderSystemScene;
  return renderer(context);
}
