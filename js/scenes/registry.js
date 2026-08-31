import { renderSystemScene } from './system-scene.js';
import { renderReceiverScene } from './receiver-scene.js';
import { renderEvidenceScene } from './evidence-scene.js';
import { renderDocumentScene } from './document-scene.js';
import { renderOverrideScene, renderReconstructionScene } from './immersive-scene.js';
import { sceneBlueprintFor } from './scene-blueprints.js';

export function sceneFamilyFor(puzzle) {
  return sceneBlueprintFor(puzzle).family;
}

export function renderExperienceScene(context) {
  const family = sceneFamilyFor(context.puzzle);
  return ({ system: renderSystemScene, device: renderReceiverScene, forensic: renderEvidenceScene, archive: renderDocumentScene, reconstruction: renderReconstructionScene, override: renderOverrideScene })[family](context);
}
