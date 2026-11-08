// Scope side effects to this entry so shared chunks cannot reorder initialization.
// Vite consumes this module ID query; emitted asset URLs use content hashes only.
import '../scripts/journey.js?entry=weddings';
import '../scripts/scroll-travel.js?entry=weddings';
import '../scripts/mobile-aurora.js?entry=weddings';
import '../scripts/motion.js?entry=weddings';
import '../scripts/scroll-motion.js?entry=weddings';
import '../scripts/business-motion.js?entry=weddings';

import '../scripts/theme-transition.js?entry=weddings';



import '../scripts/interface-icons.js?entry=weddings';
import '../styles/mobile-chrome.css';
import '../styles/language-switch.css';
import '../scripts/mobile-chrome.js?entry=weddings';
import '../scripts/language-switch.js?entry=weddings';
import '../scripts/page-navigation.js?entry=weddings';
import '../analytics/entry.js';
import '../styles/wedding-page.css';
import '../styles/occasion-stage.css';

import '../../../public/motion-system.css';
import '../scripts/interaction-motion.js?entry=weddings';

import '../wedding-rings/rings.css';
import '../wedding-rings/rings-hero.js';
import '../styles/wedding-sample.css';

// Prepare the editorial section only as it approaches the viewport.
const details = document.getElementById('bodas-respuesta');
if (details) {
 const observer = new IntersectionObserver(entries => {
  if (!entries.some(entry => entry.isIntersecting)) return;
  observer.disconnect();
  void Promise.all([import('../scripts/wedding-stage.js?entry=weddings'), import('../scripts/living-images.js?entry=weddings'), import('../scripts/nordra-materials.js?entry=weddings'), import('../scripts/nordra-theatre.js?entry=weddings')]);
 }, {rootMargin:'0px'});
 observer.observe(details);
 addEventListener('pagehide', () => observer.disconnect(), {once:true});
}
import '../styles/simple.css';
