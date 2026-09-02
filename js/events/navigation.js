import { audioManager } from '../audio.js';
import { GAME_CONFIG } from '../config.js';
import { syncHintPanel, syncMuteControls } from '../dom-sync.js';
import { useHint } from '../hints.js';
import { getState, resetState, unlockThrough } from '../state.js';
import { uiFeedback } from '../ui-feedback.js';
import { evaluateBehaviorDirector } from '../behavior-director.js';
import { releaseLocalCapture } from '../local-capture.js';
import { acceptPendingTransition, clearPendingTransition } from '../transition-director.js';

const ACTIONS = new Set(['navigate','accept-transition','hint','toggle-mute','play-final-music','dev-next','dev-event','dev-clear-transition','dev-reset']);

export function handleNavigationClick(action,button,context) {
  if (!ACTIONS.has(action)) return false;
  if (action === 'navigate') { context.go(button.dataset.target); return true; }
  if (action === 'accept-transition') { acceptPendingTransition(); return true; }
  if (action === 'hint') {
    useHint(button.dataset.puzzle);
    syncHintPanel(button.dataset.puzzle,getState());
    uiFeedback.reveal(button.closest('.hint-panel'),{kind:'hint'});
    return true;
  }
  if (action === 'toggle-mute') {
    const muted=!getState().settings.muted;
    audioManager.setMuted(muted);
    if (!muted) audioManager.confirmEnabled();
    syncMuteControls(muted);
    uiFeedback.toast(muted?'EFEITOS SONOROS DESLIGADOS':'EFEITOS SONOROS LIGADOS');
    return true;
  }
  if (action === 'play-final-music') {
    audioManager.playMusic(GAME_CONFIG.musicUrl).then((played)=>uiFeedback.toast(played?'SINAL DE ÁUDIO INICIADO':'NÃO FOI POSSÍVEL INICIAR O ÁUDIO',{kind:played?'success':'error'}));
    return true;
  }
  if (action === 'dev-next') {
    const next=String(Math.min(Number(context.last()),Number(context.current())+1)).padStart(2,'0');
    unlockThrough(next);
    context.go(next);
    return true;
  }
  if (action === 'dev-event') {
    const delivered=evaluateBehaviorDirector({force:button.dataset.event});
    uiFeedback.toast(delivered?`EVENTO SIMULADO // ${delivered}`:'EVENTO INELEGÍVEL',{kind:delivered?'discovery':'error'});
    return true;
  }
  if (action === 'dev-clear-transition') { clearPendingTransition(); return true; }
  if (action === 'dev-reset' && confirm('Reiniciar esta sessão em memória?')) {
    releaseLocalCapture();
    resetState();
    context.go('01');
  }
  return true;
}
