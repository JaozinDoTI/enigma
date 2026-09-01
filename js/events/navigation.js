import { audioManager } from '../audio.js';
import { GAME_CONFIG } from '../config.js';
import { syncHintPanel, syncMuteControls } from '../dom-sync.js';
import { useHint } from '../hints.js';
import { getState, resetState, unlockThrough } from '../state.js';
import { uiFeedback } from '../ui-feedback.js';

const ACTIONS = new Set(['navigate','hint','toggle-mute','play-final-music','dev-next','dev-reset']);

export function handleNavigationClick(action,button,context) {
  if (!ACTIONS.has(action)) return false;
  if (action === 'navigate') { context.go(button.dataset.target); return true; }
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
  if (action === 'dev-reset' && confirm('Reiniciar esta sessão em memória?')) {
    resetState();
    context.go('01');
  }
  return true;
}
