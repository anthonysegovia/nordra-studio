// Read-only bootstrap: below-fold controls wait for load, a paint and idle/proximity.
(()=>{
 const root=document.querySelector('.business-offers'),guide=document.querySelector('.offer-guide');if(!root||!guide)return;
 let started=false,loaded=document.readyState==='complete',near=false,idle=0,timer=0,raf=0;
 const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){near=true;if(loaded)schedule();}},{rootMargin:'600px'});
 async function start(){if(started)return;started=true;cancel();try{const {initializeBusinessOffers}=await import('../business/offer-controls.js');initializeBusinessOffers(root,guide);}catch(error){console.error('No se pudo iniciar la guía de paquetes',error);}}
 function schedule(){if(started||raf)return;raf=requestAnimationFrame(()=>{raf=requestAnimationFrame(()=>{raf=0;if(near)start();else if('requestIdleCallback'in window)idle=requestIdleCallback(start,{timeout:2500});else timer=setTimeout(start,250);});});}
 function load(){loaded=true;schedule();}
 function cancel(){observer.disconnect();cancelAnimationFrame(raf);clearTimeout(timer);if(idle&&window.cancelIdleCallback)cancelIdleCallback(idle);removeEventListener('load',load);}
 observer.observe(root);observer.observe(guide);if(loaded)schedule();else addEventListener('load',load,{once:true});addEventListener('pagehide',e=>{if(!e.persisted)cancel();},{once:true});
})();

// Phones: the three package groups slide side by side; carousel-positions.js adds the dots.
(()=>{const grid=document.querySelector('.business .offers-grid');if(grid)window.NordraCarousel?.positions(grid,(document.documentElement.lang==='en'?'Package position':'Posición en los paquetes'),card=>card.querySelector('h3').textContent.trim());})();
