const $ = selector => document.querySelector(selector);
let lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'es';
let category = 'all';
let taste = 'intense';
let toastTimer;
let exploreMenuOnClose=false;
const selected = new Map();
const addFeedback = new Map();
const products = [
 {id:'espresso',category:'hot',name:['Espresso de la casa','House espresso'],description:['Corto, profundo y con notas de cacao. El comienzo de todo.','Short, rich, with cocoa notes. Where it all begins.'],price:45,tag:['EL ESENCIAL','THE ESSENTIAL'],icon:'◒'},
 {id:'flat',category:'hot',name:['Flat white','Flat white'],description:['Doble espresso y leche sedosa. Un equilibrio que se queda contigo.','Double espresso and silky milk. A balance that stays with you.'],price:68,tag:['FAVORITO DE LA CASA','HOUSE FAVORITE'],icon:'◌'},
 {id:'latte',category:'hot',name:['Latte de vainilla','Vanilla latte'],description:['Suave, cremoso y con un toque de vainilla. Tu momento dulce.','Smooth, creamy, with a touch of vanilla. Your sweet moment.'],price:75,tag:['UNA PAUSA SUAVE','A GENTLE PAUSE'],icon:'◍'},
 {id:'cold',category:'cold',name:['Cold brew cítrico','Citrus cold brew'],description:['Café de extracción en frío, hielo y un giro de naranja.','Cold-steeped coffee, ice and a twist of orange.'],price:72,tag:['FRESCO & SIN PRISA','COOL & UNHURRIED'],icon:'◐'},
 {id:'tonic',category:'cold',name:['Espresso tonic','Espresso tonic'],description:['Espresso sobre tónica y hielo. Burbujeante, ligero, distinto.','Espresso over tonic and ice. Sparkling, light, different.'],price:78,tag:['ALGO DIFERENTE','SOMETHING DIFFERENT'],icon:'✧'},
 {id:'croissant',category:'bakery',name:['Croissant de mantequilla','Butter croissant'],description:['Capas doradas, centro suave. La mejor compañía para tu café.','Golden layers, a soft center. The best company for your coffee.'],price:55,tag:['DEL HORNO A TU MESA','FROM OVEN TO TABLE'],icon:'☾'},
];
const pick = value => value[lang === 'en' ? 1 : 0];
const money = value => '$' + value.toLocaleString(lang === 'en' ? 'en-US' : 'es-MX');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let gridAnimation;
function renderMenu(){
 $('#menu-grid').innerHTML = products.map((p,index)=>`<article class="menu-item" data-product="${p.id}" ${category!=='all'&&p.category!==category?'hidden':''}><div class="product-photo photo-${index}" aria-hidden="true"><span class="photo-number">0${index+1}</span></div><div class="product-copy"><span class="item-category">${pick(p.tag)}</span><h3>${pick(p.name)}</h3><p>${pick(p.description)}</p><div class="menu-item-bottom"><span class="item-price">${money(p.price)}<small>MXN</small></span><button class="add-item" type="button" data-add="${p.id}" aria-label="${lang==='en'?'Add':'Agregar'} ${pick(p.name)}"><span class="add-label">${lang==='en'?'Add':'Agregar'}</span><span aria-hidden="true">+</span></button></div><span class="product-selected" data-selected="${p.id}"></span></div></article>`).join('');
 updateMenuCount();
 updateAddFeedback();
}
function updateMenuCount(){const count=products.filter(p=>category==='all'||p.category===category).length;$('#menu-count').textContent=lang==='en'?`${count} options · choose your pause`:`${count} opciones · elige tu pausa`;}
function filterMenu(next){
 const grid=$('#menu-grid');
 const before=grid.getBoundingClientRect().height;
 gridAnimation?.cancel();
 category=next;
 grid.querySelectorAll('[data-product]').forEach(card=>{const p=products.find(p=>p.id===card.dataset.product);card.hidden=category!=='all'&&p.category!==category;});
 const after=grid.getBoundingClientRect().height;
 if(!reducedMotion.matches){
  gridAnimation=grid.animate([{height:before+'px'},{height:after+'px'}],{duration:420,easing:'cubic-bezier(.22,1,.36,1)'});
  grid.querySelectorAll('article:not([hidden])').forEach((card,index)=>card.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,delay:index*35,fill:'backwards'}));
 }
 updateMenuCount();
}
function renderRecommendation(){
 const product=products.find(p=>p.id===({intense:'espresso',soft:'flat',fresh:'cold'})[taste]);
 $('#recommendation').innerHTML=`<span>${lang==='en'?'WE THINK YOU WILL LOVE':'CREEMOS QUE TE VA A GUSTAR'}</span><h3>${pick(product.name)}</h3><p>${pick(product.description)}</p><button type="button" data-add="${product.id}"><span class="add-label">${lang==='en'?'Add to my selection':'Agregar a mi selección'}</span><span class="recommendation-price"> · ${money(product.price)}</span> <span aria-hidden="true">↗</span></button>`;
 updateAddFeedback();
}
function updateAddFeedback(){
 document.querySelectorAll('.add-item, #recommendation [data-add]').forEach(button=>{
  const confirmed=addFeedback.has(button.dataset.add);
  const full=button.closest('#recommendation');
  button.classList.toggle('is-added',confirmed);
  button.querySelector('.add-label').textContent=confirmed?(lang==='en'?'Added':'Agregado'):(full?(lang==='en'?'Add to my selection':'Agregar a mi selección'):(lang==='en'?'Add':'Agregar'));
  button.querySelector('[aria-hidden]').textContent=confirmed?'✓':(full?'↗':'+');
  const product=products.find(p=>p.id===button.dataset.add);
  button.setAttribute('aria-label',(lang==='en'?'Add':'Agregar')+' '+pick(product.name));
  button.disabled=(selected.get(product.id)||0)>=99;
 });
}
function confirmAddition(id){
 clearTimeout(addFeedback.get(id));
 addFeedback.set(id,setTimeout(()=>{addFeedback.delete(id);updateAddFeedback();},1800));
 updateAddFeedback();
}
function renderSelection(){
 const count=[...selected.values()].reduce((a,b)=>a+b,0);
 document.querySelectorAll('.bag-count').forEach(el=>el.textContent=count);
 $('[data-open-selection]').setAttribute('aria-label',(lang==='en'?'Open my selection':'Abrir mi selección')+` (${count})`);
 $('#selection-items').innerHTML=selected.size ? [...selected].map(([id,quantity])=>{const p=products.find(p=>p.id===id);return `<div class="selection-row"><div class="selection-thumb photo-${products.indexOf(p)}" aria-hidden="true"></div><div class="selection-product"><strong>${pick(p.name)}</strong><small>${money(p.price)} ${lang==='en'?'each':'por unidad'}</small></div><span class="line-total">${money(p.price*quantity)}</span><div class="quantity" role="group" aria-label="${lang==='en'?'Quantity of':'Cantidad de'} ${pick(p.name)}"><button type="button" data-remove="${id}" aria-label="${lang==='en'?'Remove one':'Quitar uno de'} ${pick(p.name)}">−</button><output aria-label="${lang==='en'?'Quantity':'Cantidad'}">${quantity}</output><button type="button" data-add="${id}" ${quantity>=99?'disabled':''} aria-label="${lang==='en'?'Add one':'Añadir uno de'} ${pick(p.name)}">+</button></div><button class="remove-item" type="button" data-delete="${id}" aria-label="${lang==='en'?'Remove':'Quitar'} ${pick(p.name)}">${lang==='en'?'Remove':'Quitar'}</button></div>`}).join('') : `<div class="empty-selection"><span aria-hidden="true">◌</span><h3>${lang==='en'?'A little pause starts here.':'Una pequeña pausa empieza aquí.'}</h3><p>${lang==='en'?'Coffee, something sweet, or both. Explore the menu and save what catches your eye.':'Un café, algo dulce o los dos. Explora la carta y guarda lo que se te antoje.'}</p></div>`;
 document.querySelectorAll('[data-selected]').forEach(el=>{const q=selected.get(el.dataset.selected)||0;el.textContent=q?(lang==='en'?`${q} in your selection`:`${q} en tu selección`):'';});
 $('.continue-button').textContent=selected.size?(lang==='en'?'Keep exploring':'Seguir explorando'):(lang==='en'?'Explore the menu':'Explorar el menú');
 try{sessionStorage.setItem('bruma-selection',JSON.stringify([...selected]));}catch{}

 updateAddFeedback();
 $('#selection-total').textContent=money([...selected].reduce((sum,[id,q])=>sum+products.find(p=>p.id===id).price*q,0))+' MXN';
}
function renderLanguage(){
 document.documentElement.lang=lang;
 document.querySelectorAll('[data-es]').forEach(el=>el.textContent=el.dataset[lang]);
 $('#language').textContent=lang==='es'?'EN':'ES';
 $('#language').setAttribute('aria-label',lang==='es'?'Switch to English':'Cambiar a español');
 $('.close-button').setAttribute('aria-label',lang==='en'?'Close selection':'Cerrar selección');
 $('.wordmark[aria-label]').setAttribute('aria-label',lang==='en'?'Bruma, home':'Bruma, inicio');
 $('.desktop-nav').setAttribute('aria-label',lang==='en'?'Main navigation':'Principal');
 $('#mobile-nav').setAttribute('aria-label',lang==='en'?'Mobile navigation':'Móvil');
 $('.values-band').setAttribute('aria-label',lang==='en'?'The Bruma philosophy':'Esencia Bruma');
 $('.filters').setAttribute('aria-label',lang==='en'?'Filter menu':'Filtrar carta');
 $('.taste-controls').setAttribute('aria-label',lang==='en'?'Coffee preference':'Preferencia de café');
 $('.hero-image img').alt=lang==='en'?'Concept Bruma interior with warm light, wood and a stone counter':'Interior conceptual de Bruma, con luz cálida, madera y una barra de piedra';
 $('.space-image img').alt=lang==='en'?'Concept café with a stone counter, warm wood and deep green walls':'Concepto visual de una cafetería con barra de piedra, madera y paredes verde profundo';
 $('[data-nordra]').href='https://wa.me/528129022231?text='+encodeURIComponent(lang==='en'?"Hi Nordra Studio! I explored the Bruma demo and would like a website for my business. Can we discuss a quote?":'¡Hola, Nordra Studio! Vi la demo de Bruma y me gustaría una página para mi negocio. ¿Podemos platicar sobre una cotización?');
 updateMenuLabel();renderMenu();renderRecommendation();renderSelection();updateFilterIndicator();
}
function announce(text){clearTimeout(toastTimer);$('.toast').textContent=text;$('.toast').classList.add('visible');toastTimer=setTimeout(()=>$('.toast').classList.remove('visible'),2800);}
let menuOpen=false;
let menuAnimation;
function updateMenuLabel(){
 $('.mobile-menu-toggle').setAttribute('aria-label',lang==='en'?(menuOpen?'Close menu':'Open menu'):(menuOpen?'Cerrar menú':'Abrir menú'));
}
function setMenu(open,immediate=false){
 if(!immediate&&open===menuOpen)return;
 const nav=$('#mobile-nav');
 const wasHidden=nav.hidden;
 const opacity=wasHidden?'0':getComputedStyle(nav).opacity;
 menuAnimation?.cancel();
 menuOpen=open;
 $('.mobile-menu-toggle').setAttribute('aria-expanded',String(open));
 nav.inert=!open;
 updateMenuLabel();
 if(immediate||reducedMotion.matches){nav.hidden=!open;return;}
 if(wasHidden&&!open)return;
 nav.hidden=false;
 menuAnimation=nav.animate([
  {opacity,transform:wasHidden?'translateY(-8px)':'translateY(0)'},
  {opacity:open?1:0,transform:open?'translateY(0)':'translateY(-6px)'}
 ],{duration:open?300:180,easing:'cubic-bezier(.22,1,.36,1)'});
 const currentAnimation=menuAnimation;
 currentAnimation.finished.catch(()=>{}).then(()=>{if(menuAnimation===currentAnimation&&!menuOpen)nav.hidden=true;});
}
function closeMenu(){setMenu(false);}
function updateNavLocation(){
 document.querySelectorAll('#mobile-nav a').forEach(link=>{
  if(link.hash===location.hash)link.setAttribute('aria-current','location');
  else link.removeAttribute('aria-current');
 });
}
addEventListener('hashchange',updateNavLocation);
updateNavLocation();
reducedMotion.addEventListener('change',()=>setMenu(menuOpen,true));
$('#language').addEventListener('click',()=>{lang=lang==='es'?'en':'es';const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);renderLanguage();});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));filterMenu(button.dataset.filter);updateFilterIndicator();}));
document.querySelectorAll('[data-taste]').forEach(button=>button.addEventListener('click',()=>{taste=button.dataset.taste;document.querySelectorAll('[data-taste]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));renderRecommendation();}));
document.addEventListener('click',event=>{
 const add=event.target.closest('[data-add]');
 if(add){const id=add.dataset.add;const previous=selected.get(id)||0;if(previous>=99)return;selected.set(id,previous+1);renderSelection();confirmAddition(id);announce((lang==='en'?'Added to your selection: ':'Agregado a tu selección: ')+pick(products.find(p=>p.id===id).name));if($('#selection').open){$('#selection-status').textContent=(lang==='en'?'Selection updated. Total ':'Selección actualizada. Total ')+$('#selection-total').textContent;const replacement=$(`#selection [data-add="${id}"]`);(replacement?.disabled?$(`#selection [data-remove="${id}"]`):replacement)?.focus({preventScroll:true});}}
 const remove=event.target.closest('[data-remove], [data-delete]');
 if(remove){const id=remove.dataset.remove||remove.dataset.delete;const priorIds=[...selected.keys()];const index=priorIds.indexOf(id);const neighbor=priorIds[index+1]||priorIds[index-1];const next=remove.hasAttribute('data-delete')?0:(selected.get(id)||0)-1;if(next>0)selected.set(id,next);else selected.delete(id);renderSelection();const replacement=$(`[data-remove="${id}"]`)||$(`[data-remove="${neighbor}"]`)||$('.continue-button');replacement.focus();$('#selection-status').textContent=lang==='en'?'Selection updated. Total '+$('#selection-total').textContent:'Selección actualizada. Total '+$('#selection-total').textContent;}

});
$('[data-open-selection]').addEventListener('click',()=>{closeMenu();$('#selection').showModal();document.documentElement.classList.add('selection-open');});
$('.close-button').addEventListener('click',()=>$('#selection').close());
$('.continue-button').addEventListener('click',()=>{exploreMenuOnClose=!selected.size;$('#selection').close();});
$('#selection').addEventListener('click',event=>{if(event.target!==event.currentTarget)return;const rect=event.currentTarget.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)event.currentTarget.close();});
$('#selection').addEventListener('close',()=>{document.documentElement.classList.remove('selection-open');if(exploreMenuOnClose){location.hash='carta';$('[data-filter]').focus({preventScroll:true});}else{$('[data-open-selection]').focus({preventScroll:true});}exploreMenuOnClose=false;});
$('.mobile-menu-toggle').addEventListener('click',()=>setMenu(!menuOpen));
$('#mobile-nav').addEventListener('click',event=>{
 const link=event.target.closest('a');
 if(!link)return;
 closeMenu();
 const section=document.querySelector(link.hash);
 if(section){section.setAttribute('tabindex','-1');section.focus({preventScroll:true});}
});
document.addEventListener('click',event=>{if(menuOpen&&!event.target.closest('#mobile-nav,.mobile-menu-toggle,#language'))closeMenu();});
document.addEventListener('focusin',event=>{if(menuOpen&&!event.target.closest('.header'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuOpen){closeMenu();$('.mobile-menu-toggle').focus();}});
matchMedia('(min-width:801px)').addEventListener('change',event=>{if(event.matches)setMenu(false,true);});
try{const saved=JSON.parse(sessionStorage.getItem('bruma-selection')||'[]');if(Array.isArray(saved))saved.forEach(entry=>{if(Array.isArray(entry)){const [id,q]=entry;if(products.some(p=>p.id===id)&&Number.isInteger(q)&&q>0&&q<=99)selected.set(id,q);}});}catch{}
const filterIndicator=document.createElement('span');
filterIndicator.className='filter-ink';
filterIndicator.setAttribute('aria-hidden','true');
$('.filters').append(filterIndicator);
function updateFilterIndicator(){
 const active=$('.filters [aria-pressed="true"]');
 if(!active)return;
 filterIndicator.style.width=active.offsetWidth+'px';
 filterIndicator.style.transform=`translateX(${active.offsetLeft}px)`;
}
new ResizeObserver(updateFilterIndicator).observe($('.filters'));
renderLanguage();
