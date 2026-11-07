import {carousel} from './carousel.js';
export function mountCards({root,world,goWorld,chosen,labels,text,mobile,still}){
  const cards=[...root.querySelectorAll('.card')],toast=document.getElementById('bs-toast');
  let timer,previous;
  const hide=()=>{toast.classList.remove('show');toast.inert=true;};hide();
  toast.querySelector('button').addEventListener('click',()=>{const target=previous;hide();if(target)goWorld(target,chosen);});
  for(const card of cards)card.querySelector('.card-hit').addEventListener('click',()=>{
    const target=card.dataset.world,from=world();
    if(target===from){chosen();scrollTo({top:0,behavior:still()?'instant':'smooth'});return;}
    goWorld(target,()=>{chosen();scrollTo({top:0,behavior:'instant'});previous=from;
      toast.querySelector('span').textContent=text('Ahora: {style}',{style:labels[target].label});
      toast.inert=false;toast.classList.add('show');clearTimeout(timer);timer=setTimeout(hide,5000);
    });
  });
  function sync(){for(const card of cards){const active=card.dataset.world===world(),hit=card.querySelector('.card-hit'),style=labels[card.dataset.world].label;
    card.classList.toggle('is-active',active);hit.setAttribute('aria-pressed',String(active));
    hit.setAttribute('aria-label',text(active?'{style}: lo estás viendo, volver al letrero':'Probar el estilo {style}',{style}));
  }}
  carousel(root.querySelector('.fan'),root.querySelector('.fan-dots'),{mobile,still,countText:(n,total)=>text('{n} de {total}',{n,total})});sync();return {sync};
}
