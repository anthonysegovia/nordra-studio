const list = document.querySelector('.wedding-switch');
const tabs = [...list.querySelectorAll('[role=tab]')];
const stage = document.getElementById('panel-boda');
const mobile = matchMedia('(max-width:700px)');
function orient() {
  list.setAttribute('aria-orientation', mobile.matches ? 'horizontal' : 'vertical');
}
function select(tab) {
  for (const item of tabs) {
    item.tabIndex = item === tab ? 0 : -1;
    item.setAttribute('aria-selected', String(item === tab));
  }
  stage.dataset.step = tab.id === 'tab-cover' ? 'cover' : 'panel';
  stage.setAttribute('aria-labelledby', tab.id);
}
orient();
mobile.addEventListener('change', orient);
for (const tab of tabs) {
  tab.addEventListener('click', () => select(tab));
  tab.addEventListener('keydown', event => {
    const arrows = mobile.matches ? ['ArrowLeft','ArrowRight'] : ['ArrowUp','ArrowDown'];
    const next = arrows.includes(event.key) ? tabs[1 - tabs.indexOf(tab)] :
      event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[1] : null;
    if (next) { event.preventDefault(); select(next); next.focus(); }
  });
}
if (['#panel-boda','#bodas-panel-muestra'].includes(location.hash)) select(tabs[1]);
