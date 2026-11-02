import { createLandscapeScene } from '/src/site/landscape/landscape-scene.js';

const buttons = [...document.querySelectorAll('button')];
const names = buttons.map(button => button.textContent.toLowerCase().replaceAll(' ', '-'));
window.curtainMode = { value: 0 };
function choose(index) {
  window.curtainMode.value = index;
  buttons.forEach((button,i) => button.setAttribute('aria-pressed', String(i === index)));
  history.replaceState(null, '', '#' + names[index]);
}
buttons.forEach((button, i) => button.addEventListener('click', () => choose(i)));
addEventListener('keydown', e => { if (/^[1234]$/.test(e.key)) choose(Number(e.key) - 1); });
choose(Math.max(0,names.indexOf(location.hash.slice(1))));
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const state = () => ({ dark: true, hidden: document.hidden, reduced: reduced.matches });
const scene = await createLandscapeScene(document.querySelector('#scene'), {
  dark: true, initialElapsed: 60000, getState: state,
  onFallback: () => document.querySelector('output').textContent = 'WebGL no está disponible.'
});
const sync = () => scene.setState(state());
document.addEventListener('visibilitychange', sync);
reduced.addEventListener('change', sync);
buttons.forEach(button => button.addEventListener('click', sync));
addEventListener('keydown', e => { if (/^[1234]$/.test(e.key)) sync(); });
