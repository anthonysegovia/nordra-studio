// Page-only enhancement; the native content is complete before this runs.
(()=>{
 const root=document.querySelector('.business');if(!root)return;
 let started=false,loaded=document.readyState==='complete',near=false,raf=0,idle=0,timer=0;
 const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){near=true;if(loaded)schedule();}},{rootMargin:'600px'});
 function cancel(){observer.disconnect();cancelAnimationFrame(raf);clearTimeout(timer);if(idle&&window.cancelIdleCallback)cancelIdleCallback(idle);removeEventListener('load',load);}
 async function start(){if(started)return;started=true;cancel();try{const{initializeBusinessContent}=await import('../business/content-controls.js');initializeBusinessContent(root);}catch(error){const photo=root.querySelector('.person-photo');if(photo)photo.dataset.photoReady='true';console.error('No se pudieron iniciar los detalles de Negocios',error);}}
 function schedule(){if(raf||started)return;raf=requestAnimationFrame(()=>{raf=requestAnimationFrame(()=>{raf=0;if(near)start();else if('requestIdleCallback'in window)idle=requestIdleCallback(start,{timeout:2500});else timer=setTimeout(start,250);});});}
 function load(){loaded=true;schedule();}
 root.querySelectorAll('.case-brief').forEach(el=>observer.observe(el));if(loaded)schedule();else addEventListener('load',load,{once:true});addEventListener('pagehide',e=>{if(!e.persisted)cancel();},{once:true});
})();
