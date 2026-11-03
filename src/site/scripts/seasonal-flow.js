// The ambient field and the CSS palette follow the collection, even while motion is paused.
(()=>{
 const host=document.querySelector('[data-view="temporada"]:not([hidden])');
 if(!host)return;
 const palettes={halloween:4,posadas:5,'fin-de-ano':6};
 function update(){
   const palette=palettes[document.documentElement.dataset.season];
   host.querySelector('.seasonal-flow-field').dataset.palette=String(palette);
   dispatchEvent(new CustomEvent('nordra-seasonal-palette',{detail:{from:palette,to:palette,blend:0}}));
 }
 addEventListener('season-selection',update);
 update();
})();
