// Embed the existing invitation in the studio portfolio, without a second design.
// This mode only changes presentation; the RSVP remains the original local demo.
const studioScene = new URLSearchParams(location.search).get('studio-preview');
if (self !== top && ['story', 'day', 'reply'].includes(studioScene)) {
  document.documentElement.dataset.studioPreview = studioScene;
  addEventListener('DOMContentLoaded', () => {
    finishEntry(false);
    document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
    scrollTo(0, 0);
  }, { once:true });
}
