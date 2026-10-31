// Scope side effects to this entry so shared chunks cannot reorder initialization.
// Vite consumes this module ID query; emitted asset URLs use content hashes only.
import '../styles/phone-frame.css';
import '../scripts/journey.js?entry=home';
import '../scripts/scroll-motion.js?entry=home';
import '../scripts/theme-transition.js?entry=home';
import '../scripts/interface-icons.js?entry=home';
import '../scripts/home.js?entry=home';
import '../scripts/page-navigation.js?entry=home';
import '../analytics/entry.js';
import '../landscape/landscape-hero.js';
