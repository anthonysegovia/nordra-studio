// Scope side effects to this entry so shared chunks cannot reorder initialization.
// Vite consumes this module ID query; emitted asset URLs use content hashes only.
import '../scripts/journey.js?entry=events';
import '../scripts/scroll-travel.js?entry=events';
import '../scripts/mobile-aurora.js?entry=events';
import '../scripts/motion.js?entry=events';
import '../scripts/scroll-motion.js?entry=events';
import '../scripts/business-motion.js?entry=events';
import '../scripts/wedding-stage.js?entry=events';
import '../scripts/theme-transition.js?entry=events';
import '../styles/phone-frame.css';
import '../styles/showcase-live.css';
import '../styles/occasion-live.css';
import '../scripts/showcase-live.js?entry=events';
import '../scripts/nordra-materials.js?entry=events';
import '../scripts/nordra-theatre.js?entry=events';
import '../scripts/interface-icons.js?entry=events';
import '../styles/mobile-chrome.css';
import '../styles/language-switch.css';
import '../scripts/mobile-chrome.js?entry=events';
import '../scripts/language-switch.js?entry=events';
import '../scripts/page-navigation.js?entry=events';
import '../analytics/entry.js';
import '../styles/occasion-stage.css';

import '../../../public/motion-system.css';
import '../styles/simple.css';
import '../scripts/interaction-motion.js?entry=events';

import '../event-badge/badge.css';
import '../event-badge/badge-hero.js';
