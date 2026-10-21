// The invitation's styling guide is local and illustrative; no choices are sent.
(() => {
  const atelier = document.querySelector('.guest-atelier');
  if (!atelier) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const choices = { dress: {color:'#398f97',name:'Turquesa',length:'long'}, suit: {color:'#b79157',name:'Arena'} };
  let active = 'dress';
  const modelButtons = [...atelier.querySelectorAll('[data-outfit]')];
  const swatches = [...atelier.querySelectorAll('[data-fabric]')];
  const lengths = [...atelier.querySelectorAll('[data-length]')];
  const figure = atelier.querySelector('.atelier-illustration');
  const status = atelier.querySelector('.look-result');
  const tip = atelier.querySelector('.atelier-tip');
  const tips = {
    fabric: ['Telas ligeras', 'Para el vestido, una tela fluida; para el traje, lino o una tela ligera. La idea es estar cómodo en la playa.'],
    shoes: ['Piensa en la arena', 'Elige sandalias elegantes o calzado de suela plana. Evita tacones finos que se hundan al caminar.'],
    white: ['El blanco, para la novia', 'Puedes explorar estos cuatro tonos como inspiración. No son una paleta obligatoria.']
  };
  function animateFigure() {
    figure.getAnimations().forEach(animation => animation.cancel());
    if (!motion.matches && !document.documentElement.classList.contains('motion-paused')) {
      figure.animate([{opacity:.3,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:500,easing:'cubic-bezier(.22,1,.36,1)'});
    }
  }
  function render(animate = false) {
    const choice = choices[active];
    atelier.style.setProperty('--look-color',choice.color);
    atelier.dataset.model = active;
    atelier.dataset.length = choices.dress.length;
    modelButtons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.outfit === active)));
    swatches.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.fabric === choice.color)));
    lengths.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.length === choices.dress.length)));
    atelier.querySelector('.length-options').hidden = active !== 'dress';
    atelier.querySelector('.suit-description').hidden = active !== 'suit';
    atelier.querySelector('.look-color-name').textContent = choice.name;
    const label = active === 'dress' ? `Vestido ${choice.length === 'long' ? 'largo' : 'midi'}` : 'Traje de tela ligera';
    status.textContent = `${label} · ${choice.name}`;
    if (animate) animateFigure();
  }
  modelButtons.forEach(button => button.addEventListener('click',()=>{active=button.dataset.outfit;render(true)}));
  swatches.forEach(button => button.addEventListener('click',()=>{
    choices[active].color=button.dataset.fabric;
    choices[active].name=button.dataset.name;
    render();
  }));
  lengths.forEach(button => button.addEventListener('click',()=>{choices.dress.length=button.dataset.length;render(true)}));
  atelier.querySelectorAll('[data-tip]').forEach(button=>button.addEventListener('click',()=>{
    atelier.querySelectorAll('[data-tip]').forEach(control=>control.setAttribute('aria-pressed',String(control===button)));
    const content=tips[button.dataset.tip];
    tip.querySelector('strong').textContent=content[0];
    tip.querySelector('p').textContent=content[1];
  }));
  motion.addEventListener('change',()=>{if(motion.matches)figure.getAnimations().forEach(animation=>animation.cancel())});
  render();
})();
