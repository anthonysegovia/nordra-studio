/* Position dots for horizontal carousels on phones (invitations and business pages).
   Classic script: shared through window, like NordraMobileAurora. */
(()=>{
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const still = () => reduced.matches || document.body.dataset.journeyMotion === 'paused';
 function positions(track, label, titleOf = card => card.querySelector('strong')?.textContent.trim() || card.querySelector('img').alt) {
   const cards = [...track.children];
   const nav = document.createElement('nav');
   nav.className = 'carousel-positions';
   nav.setAttribute('aria-label', label);
   const buttons = cards.map(card => {
     const title = titleOf(card);
     const button = document.createElement('button');
     button.type = 'button';
     button.setAttribute('aria-label', 'Ir a ' + title);
     button.addEventListener('click', () => track.scrollBy({
       left: offset(card), behavior: still() ? 'instant' : 'smooth',
     }));
     nav.append(button);
     return button;
   });
   function offset(card) {
     return card.getBoundingClientRect().left - track.getBoundingClientRect().left - parseFloat(getComputedStyle(track).paddingLeft);
   }
   function sync() {
     if (track.scrollWidth <= track.clientWidth) return;
     const active = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1 ? cards.length - 1 :
       cards.reduce((best, card, i) => Math.abs(offset(card)) < Math.abs(offset(cards[best])) ? i : best, 0);
     buttons.forEach((button, i) => button.setAttribute('aria-current', String(i === active)));
   }
   track.after(nav);
   track.addEventListener('scroll', sync, { passive: true });
   new ResizeObserver(sync).observe(track);
   sync();
 }
 window.NordraCarousel = { positions };
})();
