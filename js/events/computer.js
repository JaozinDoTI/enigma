import { getState, updateState } from '../state.js';
import { Motion } from '../motion-engine.js';

function switchWorkspace(panel) {
  updateState((state) => { state.ui.activePanel = panel; });
  document.querySelectorAll('.phase-tool[data-action="workspace-tab"]').forEach((tab) => {
    const selected = tab.dataset.panel === panel;
    tab.classList.toggle('is-active',selected);
    tab.setAttribute('aria-selected',String(selected));
  });
  document.querySelectorAll('[data-workspace-pane]').forEach((pane) => {
    const selected = pane.dataset.workspacePane === panel;
    pane.classList.toggle('is-active',selected);
    pane.hidden = !selected;
    if (selected) {
      pane.classList.remove('is-switching');
      requestAnimationFrame(() => pane.classList.add('is-switching'));
      Motion.schedule(`phase-pane-${panel}`,() => pane.classList.remove('is-switching'),Motion.duration('normal'));
    }
  });
  document.body.dataset.activeArea = panel;
  document.querySelector('.phase-shell[data-area]')?.setAttribute('data-area',panel);
  Motion.emit('workspace:area-change',{panel});
}

export function handleComputerClick(action,button) {
  if (action !== 'workspace-tab') return false;
  switchWorkspace(button.dataset.panel);
  return true;
}

export function handleComputerKeydown(event) {
  const tool = event.target.closest?.('.phase-tool');
  if (!tool || !['ArrowLeft','ArrowRight'].includes(event.key)) return false;
  const tools = [...tool.parentElement.querySelectorAll('.phase-tool:not(:disabled)')];
  const index = (tools.indexOf(tool) + (event.key === 'ArrowRight' ? 1 : -1) + tools.length) % tools.length;
  event.preventDefault();
  tools[index].focus();
  tools[index].click();
  return true;
}

export function returnComputerToTask() {
  if (!document.querySelector('.phase-shell') || !getState().ui.activePanel || getState().ui.activePanel === 'task') return false;
  switchWorkspace('task');
  document.querySelector('.phase-tool[data-panel="task"]')?.focus();
  return true;
}
