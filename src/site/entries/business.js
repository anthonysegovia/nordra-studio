// Scope side effects to this entry so shared chunks cannot reorder initialization.
// Vite consumes this module ID query; emitted asset URLs use content hashes only.
import '../scripts/journey.js?entry=business';
// The business prototype uses one native CSS light object, without canvas renderers.
import '../scripts/scroll-motion.js?entry=business';
import '../scripts/business-motion.js?entry=business';
import '../scripts/theme-transition.js?entry=business';
import '../scripts/living-images.js?entry=business';
import '../styles/light-table.css';
import '../scripts/light-table.js';
import '../scripts/interface-icons.js?entry=business';
import '../scripts/page-navigation.js?entry=business';
import '../analytics/entry.js';
