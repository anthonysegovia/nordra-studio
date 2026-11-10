export { staticProfile } from '../wedding-rings/state.js';

export function badgePolicy(state) {
  const available = !state.disposed && !state.failed && !state.static && !state.reduced && !state.paused;
  const present = !state.hidden && !state.embeddedHidden;
  const requested = !state.phone || state.requested;
  return {
    load: available && present && requested && state.near && state.painted && !state.ready,
    animate: available && present && state.visible && state.ready,
    showScene: available && state.ready,
    offerMotion: available && state.phone && !state.requested,
  };
}
