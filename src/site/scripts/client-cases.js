// Native lazy loading can request these covers several screens early. Keep
// templates inert until a card approaches the viewport; noscript remains usable.
const covers = document.querySelectorAll('[data-client-cover]');
const reveal = template => template.replaceWith(template.content.cloneNode(true));
if (!('IntersectionObserver' in window)) {
  covers.forEach(reveal);
} else if (covers.length) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const template = entry.target.querySelector('[data-client-cover]');
      if (template) reveal(template);
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '200px 0px' });
  covers.forEach(template => observer.observe(template.parentElement));
  addEventListener('pagehide', event => { if (!event.persisted) observer.disconnect(); }, { once: true });
}
