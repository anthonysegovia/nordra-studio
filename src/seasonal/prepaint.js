// Bundled into a classic head script by seasonal-page.mjs. No runtime import
// or fetch is needed to choose the visitor's season before the body can paint.
import {seasons} from '../data/invitationPricing.ts';
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
    const chapters = ordered.map(s => document.getElementById(chapterId(s.id)));
    const original = document.querySelector('.seasonal-chapter');
    const marker = document.createComment('season order');
    original.before(marker);
    chapters.forEach(chapter => marker.before(chapter));
    marker.remove();
    const index = document.querySelector('.seasonal-route > div');
    ordered.forEach(s => index.append(index.querySelector(`a[href="#${chapterId(s.id)}"]`)));
    document.querySelector('.mobile-route a[href="#temporada-halloween"]').href = `#${chapterId(selected.id)}`;
    const hero = document.querySelector('.seasonal-hero-live');
    const link = hero.querySelector('[data-live-try]');
    link.href = selected.demo; link.dataset.liveTry = selected.label;
    const img = hero.querySelector('.live-screen > img');
    img.alt = `${selected.label} de Nordra, portada del diseño real`;
    img.sizes = sizes; img.srcset = srcset; img.src = cover(selected,780);
    const halloween = seasons.find(s => s.id === 'halloween');
    const note = document.querySelector('[data-season-return]');
    note.textContent = returnMessage(halloween);
    note.hidden = inOrderingWindow(halloween,date);
  } finally {
    delete root.dataset.seasonPreparing;
    delete window.prepareNordraSeason;
  }
};
