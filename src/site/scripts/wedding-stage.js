const list = document.querySelector('.wedding-switch');
const tabs = [...list.querySelectorAll('[role=tab]')];
const stage = document.getElementById(tabs[0].getAttribute('aria-controls'));
const mobile = matchMedia(document.body.hasAttribute('data-birthday-sign')?'(max-width:900px)':'(max-width:700px)');
function orient() {
  list.setAttribute('aria-orientation', mobile.matches ? 'horizontal' : 'vertical');
}
function select(tab) {
  for (const item of tabs) {
    item.tabIndex = item === tab ? 0 : -1;
    item.setAttribute('aria-selected', String(item === tab));
  }
  stage.dataset.step = tab === tabs[0] ? 'cover' : 'panel';
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
// While the dashboard sits behind the phone, a tap brings it forward; once in front, it opens the sample panel.
// Keyboard activation (detail 0) and modified clicks keep the link's normal behaviour.
stage.querySelector('.wedding-dashboard').addEventListener('click', event => {
  if (stage.dataset.step === 'panel' || event.detail === 0 || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  select(tabs[1]);
});
// The phone only takes pointer events while it sits behind the dashboard; a tap brings the cover back.
stage.querySelector('.wedding-phone').addEventListener('click', () => {
  if (stage.dataset.step === 'panel') select(tabs[0]);
});
function followPanelAnchor() {
  if (location.hash === '#' + stage.id || (stage.id === 'panel-boda' && location.hash === '#bodas-panel-muestra')) select(tabs[1]);
}
followPanelAnchor();
addEventListener('hashchange', followPanelAnchor);
