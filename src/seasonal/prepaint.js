// Bundled into a classic head script by seasonal-page.mjs. No runtime import
// or fetch is needed to choose the visitor's season before the body can paint.
import {seasonOrder, chapterId, cover, inOrderingWindow, returnMessage} from './order.mjs';
const date = new Date(), ordered = seasonOrder(date), selected = ordered[0];
const root = document.documentElement;
root.dataset.season = selected.id;
root.dataset.seasonPreparing = '';
const sizes = '(max-width:700px) 236px, 264px';
const srcset = `${cover(selected,390)} 390w, ${cover(selected,780)} 780w`;
const preload = document.createElement('link');
preload.rel = 'preload'; preload.as = 'image'; preload.fetchPriority = 'high';
preload.imageSizes = sizes; preload.imageSrcset = srcset; preload.href = cover(selected,780);
document.head.append(preload);
window.prepareNordraSeason = () => {
  try {
    const collection = document.getElementById('temporada-coleccion');
    const list = collection.querySelector('[role="tablist"]');
    const en = root.lang === 'en';
    const items = ordered.map(season => {
      const panel = document.getElementById(chapterId(season.id));
      const tab = document.getElementById('tab-' + panel.id);
      const note = tab.querySelector('[data-season-return]');
      note.hidden = inOrderingWindow(season,date);
      if (!note.hidden) note.textContent = returnMessage(season,en?'en':'es-MX');
      list.append(tab);
      panel.setAttribute('role','tabpanel');
      panel.setAttribute('aria-labelledby',tab.id);
      return {season, tab, panel};
    });
    function activate(item) {
      for (const other of items) {
        const active = other === item;
        other.tab.setAttribute('aria-selected',String(active));
        other.tab.tabIndex = active ? 0 : -1;
        other.panel.hidden = !active;
      }
      root.dataset.season = item.season.id;
      dispatchEvent(new Event('season-selection'));
    }
    function fromHash() {
      const item = items.find(({panel}) => '#' + panel.id === location.hash);
      activate(item ?? items[0]);
      if (item) collection.scrollIntoView({block:'start'});
    }
    items.forEach((item,index) => {
      function select() {
        activate(item);
        history.replaceState(history.state,'','#'+item.panel.id);
      }
      item.tab.addEventListener('click',select);
      item.tab.addEventListener('keydown',event => {
        const target = {ArrowRight:(index+1)%items.length, ArrowLeft:(index+items.length-1)%items.length, Home:0, End:items.length-1}[event.key];
        if (target === undefined) return;
        event.preventDefault();
        items[target].tab.focus();
        items[target].tab.click();
      });
    });
    list.hidden = false;
    fromHash();
    addEventListener('hashchange',fromHash);
    addEventListener('message',event => {
      if (parent === window || event.source !== parent || event.data?.type !== 'nordra-anchor') return;
      const item = items.find(({panel}) => panel.id === event.data.id);
      if (item) {
        activate(item);
        collection.scrollIntoView({block:'start'});
      }
    });
    const hero = document.querySelector('.seasonal-hero-live');
    const link = hero.querySelector('[data-live-try]');
    const englishLabel = {halloween:'Halloween invitation',posadas:'Christmas and posada invitation','fin-de-ano':'New Year’s invitation'}[selected.id];
    link.href = selected.demo; link.dataset.liveTry = en ? englishLabel : selected.label;
    link.setAttribute('aria-label', en ? `Open ${englishLabel}` : `Abrir la invitación de ${selected.name}`);
    const img = hero.querySelector('.live-screen > img');
    img.alt = en ? `${englishLabel} by Nordra` : `${selected.label} de Nordra, portada del diseño real`;
    img.sizes = sizes; img.srcset = srcset; img.src = cover(selected,780);
  } finally {
    delete root.dataset.seasonPreparing;
    delete window.prepareNordraSeason;
  }
};
