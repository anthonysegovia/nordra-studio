(() => {
  const links = [...document.querySelectorAll('a[data-language]')];
  if (!links.length) return;
  const suggestion = document.querySelector('.locale-suggestion');
  function save(key, value) {
    try { localStorage.setItem(key,value); } catch {}
  }
  function read(key) {
    try { return localStorage.getItem(key); } catch { return null; }
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
      if (suggestion) suggestion.hidden = true;
    });
  }
  if (!suggestion) return;
  suggestion.hidden = !/^en(?:-|$)/i.test(navigator.language) || !!read('nordra-lang') || !!read('nordra-lang-dismissed');
  suggestion.querySelector('button').addEventListener('click',() => {
    save('nordra-lang-dismissed','1');
    suggestion.hidden = true;
    document.querySelector('.header-actions a[data-language="en"]')?.focus();
  });
})();
