// Side-effect order matches the former classic scripts at the end of estudio.html.
// Styles remain blocking <link> elements in the head, in their original order.
import '../scripts/journey.js';
import '../scripts/scroll-travel.js';
import '../scripts/mobile-aurora.js';
import '../scripts/motion.js';
import '../scripts/scroll-motion.js';
import '../scripts/theme-transition.js';
import '../scripts/nordra-materials.js';
import '../scripts/nordra-theatre.js';
import '../scripts/interface-icons.js';
import '../styles/mobile-chrome.css';
import '../styles/language-switch.css';
import '../scripts/mobile-chrome.js';
import '../scripts/language-switch.js';
import '../scripts/page-navigation.js';
import '../analytics/entry.js';

import '../styles/studio-showcase.css';
import '../scripts/studio-showcase.js';

// Native lazy loading may fetch the portrait several screens before the profile.
const portrait = document.querySelector('.studio-person .person-photo');
if (portrait) {
  const proximity = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      portrait.dataset.photoReady = 'true';
      proximity.disconnect();
    }
  }, { rootMargin: '400px' });
  proximity.observe(portrait);
}
import '../../../public/motion-system.css';
import '../styles/simple.css';
import '../scripts/interaction-motion.js?entry=estudio';
