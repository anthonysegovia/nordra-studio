(() => {
  const links = [...document.querySelectorAll('a[data-language]')];
  if (!links.length) return;
  function save(key, value) {
    try { localStorage.setItem(key,value); } catch {}
  }
  function syncAnchors() {
    for (const link of links) link.hash = location.hash;
  }
  syncAnchors();
  addEventListener('hashchange',syncAnchors);
  addEventListener('pageshow',syncAnchors);
  document.addEventListener('click',event=>{
    const local=event.target.closest?.('a[href^="#"]');
    if(local?.hash && event.defaultPrevented && document.getElementById(local.hash.slice(1))){
      history.replaceState(history.state,'',local.hash);
    }
    syncAnchors();
  });
  for (const link of links) {
    link.addEventListener('focus',syncAnchors);
    link.addEventListener('pointerdown',syncAnchors);
    link.addEventListener('click',() => {
      syncAnchors();
      save('nordra-lang',link.dataset.language === 'en' ? 'en' : 'es');
    });
  }
})();
