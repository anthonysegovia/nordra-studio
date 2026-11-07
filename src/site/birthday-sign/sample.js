import {carousel} from './carousel.js';
export function mountSample({root,world,text,ask,still}){
  const section=document.getElementById('cumpleanos-respuesta'),phone=section.querySelector('.wedding-phone'),stage=section.querySelector('.wedding-stage'),links=section.querySelector('.wedding-links'),credit=section.querySelector('.wedding-credit');
  const box=phone.firstElementChild.cloneNode(true),covers=new Map([...root.querySelectorAll('.card .cover')].map(c=>[c.closest('.card').dataset.world,c.cloneNode(true)]));
  const people={caja:['Camila','30'],bar:['Andrés','40'],xv:['Ximena','XV'],espacio:['Iker','6']};
  phone.classList.add('birthday-sign-root');
  const mobile=matchMedia('(max-width:900px)'),tabs=section.querySelector('.wedding-switch');
  const marker=document.createComment('sample links');links.before(marker);
  function layout(){
    tabs.setAttribute('aria-orientation',mobile.matches?'horizontal':'vertical');
    if(mobile.matches)stage.after(links);else marker.after(links);
    const panel=stage.dataset.step==='panel';
    [...links.children].forEach((link,i)=>{link.hidden=mobile.matches&&(i===0?panel:!panel);});
    phone.inert=mobile.matches&&panel;stage.querySelector('.wedding-dashboard').inert=mobile.matches&&!panel;
  }
  new MutationObserver(layout).observe(stage,{attributes:true,attributeFilter:['data-step']});mobile.addEventListener('change',layout);layout();
  let painted;
  function sync(){
    const selected=world(),cover=selected==='neon'?'caja':selected,[name,age]=people[cover];
    if(painted!==cover){
      const art=cover==='caja'?box.cloneNode(true):covers.get(cover).cloneNode(true);
      const img=cover==='caja'?art:art.querySelector('img');img.src=cover==='caja'?'/artwork/birthday-noche/camila-portada-780.webp':`/artwork/birthday-estilos/${cover}-780.webp`;img.removeAttribute('srcset');img.alt=text('{name} {age} · Un diseño de Nordra',{name,age});
      phone.replaceChildren(art);painted=cover;phone.dataset.style=cover;
      credit.textContent=text('{name} {age} · Un diseño de Nordra',{name,age});
    }
    const link=links.firstElementChild;link.textContent=text(selected==='caja'?'Abrir la invitación completa ↗':'Pedir este estilo ↗');
    link.href=selected==='caja'?'/invitaciones/camila-30/':ask.href;
    link.target=selected==='caja'?'_self':'_blank';link.rel='noopener';
  }
  const plans=document.querySelector('.occasion-plan-grid'),small=matchMedia('(max-width:700px)');
  const first=plans.firstElementChild,featured=plans.querySelector('.invite-featured');
  const indicators=document.createElement('div');indicators.className='plan-dots fan-dots';
  indicators.append(document.createElement('span'),document.createElement('i'),document.createElement('i'));plans.after(indicators);
  function order(){if(small.matches)plans.prepend(featured);else plans.prepend(first);}
  small.addEventListener('change',order);order();
  carousel(plans,indicators,{mobile:small,still,countText:(n,total)=>text('{n} de {total}',{n,total})});sync();return {sync};
}
