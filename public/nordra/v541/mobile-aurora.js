/* Mobile light uses transparent SVG ribbons, avoiding WebGL alpha compositing
   differences on iOS. The existing scroll controllers still own the playhead. */
(()=>{
 const ns='http://www.w3.org/2000/svg';let nextId=0;
 const palettes=[['#279ca8','#527ac5','#9672b4'],['#a38d76','#c5b196','#998471'],['#7773b7','#bc88aa','#718fbd'],['#5c9c88','#60919f','#7385a6'],['#bf885c','#9c7cae','#b8957e'],['#679080','#94a38a','#baa378'],['#b39b75','#9987b0','#b8ab90']];
 function create(container,initial=palettes[0]){
  const id='mobile-light-'+nextId++,svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 1000 650');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');svg.classList.add('mobile-aurora');
  svg.innerHTML=`<defs><filter id="${id}-blur" x="-30%" y="-40%" width="160%" height="180%"><feGaussianBlur stdDeviation="12"/></filter><radialGradient id="${id}-fade"><stop offset="30%" stop-color="white"/><stop offset="100%" stop-color="black"/></radialGradient><mask id="${id}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="650"><rect width="1000" height="650" fill="url(#${id}-fade)"/></mask></defs><g mask="url(#${id}-mask)" filter="url(#${id}-blur)"></g>`;
  const defs=svg.querySelector('defs'),group=svg.querySelector('g');
  const paths=initial.map((color,i)=>{
   const gradient=document.createElementNS(ns,'linearGradient');gradient.id=id+'-'+i;gradient.setAttribute('x1','0');gradient.setAttribute('y1','0');gradient.setAttribute('x2','0');gradient.setAttribute('y2','1');
   gradient.innerHTML='<stop offset="0" stop-opacity="0"/><stop offset=".65" stop-opacity=".3"/><stop offset=".88" stop-opacity=".65"/><stop offset="1" stop-opacity="0"/>';defs.append(gradient);
   const path=document.createElementNS(ns,'path');path.setAttribute('fill',`url(#${gradient.id})`);group.append(path);return {path,gradient};
  });
  container.append(svg);container.dataset.renderer='svg-mobile';
  const setColors=colors=>paths.forEach(({gradient},i)=>{const c=colors[i];const color=Array.isArray(c)?`rgb(${c.map(v=>Math.round(v*255)).join(',')})`:c;gradient.querySelectorAll('stop').forEach(s=>s.setAttribute('stop-color',color));});
  setColors(initial);
  return {setColors,render(progress=0,time=0){
   paths.forEach(({path},i)=>{
    const lower=[],upper=[];for(let x=-80;x<=1080;x+=20){const u=x/1000,phase=u*7+i*1.7+progress*2.5+time*.12;const y=350+Math.sin(phase)*75+Math.sin(phase*1.8+i)*24+i*28-progress*55;lower.push(`${x},${y.toFixed(2)}`);upper.unshift(`${x},${(y-120-35*Math.sin(phase*.6)).toFixed(2)}`);}
    path.setAttribute('d','M'+lower.join(' L')+' L'+upper.join(' L')+' Z');
   });svg.dataset.progress=progress.toFixed(4);
  },dispose(){svg.remove();}};
 }
 window.NordraMobileAurora={create,palettes};
})();
