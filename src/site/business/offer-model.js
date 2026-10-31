// Highest functional need wins. A payment/shop requirement takes priority;
// selling/booking or a catalogue needs custom scope. More sections/services
// need a business site, while a simple form upgrades a one-page landing.
export function recommendBusiness(answers) {
 if(!Array.isArray(answers)||answers.length!==3||answers.some(v=>!Number.isInteger(v)||v<0||v>2))throw new TypeError('Three valid answers are required');
 const [need,size,special]=answers;
 if(special===2)return {id:'shop',reason:'Quieres recibir pagos o vender en línea: conviene partir de una tienda y definir contigo catálogo, pagos y envíos.'};
 if(need===2||size===2)return {id:'custom-web',reason:'Tu idea necesita una agenda, un catálogo amplio o funciones específicas. Definimos las integraciones y su alcance en la propuesta.'};
 if(need===1&&size===1)return {id:'business-site',reason:'Quieres presentar tus servicios con espacio para explicar tu negocio. De 4 a 6 apartados ayudan a organizarlo.'};
 if(need===1||size===1||special===1)return {id:'landing-professional',reason:'Una página con hasta tres secciones y formulario te da espacio para explicar tu oferta y recibir consultas. Si necesitas una agenda integrada, cotizamos esa función a medida.'};
 return {id:'landing-essential',reason:'Para una presencia sencilla y contacto directo por WhatsApp, una página personalizada es un buen comienzo.'};
}
// Closest point on a rounded rectangle, in CSS pixels: four edges + four arcs.
export function borderPoint(w,h,x,y,r=22) {
 r=Math.min(r,w/2,h/2);const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const points=[[clamp(x,r,w-r),0],[w,clamp(y,r,h-r)],[clamp(x,r,w-r),h],[0,clamp(y,r,h-r)]];
 for(const [cx,cy,lo,hi]of [[r,r,Math.PI,Math.PI*1.5],[w-r,r,-Math.PI/2,0],[w-r,h-r,0,Math.PI/2],[r,h-r,Math.PI/2,Math.PI]]){
  let a=Math.atan2(y-cy,x-cx);if(lo===Math.PI&&a<0)a+=Math.PI*2;a=clamp(a,lo,hi);points.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);
 }
 const p=points.reduce((a,b)=>Math.hypot(a[0]-x,a[1]-y)<Math.hypot(b[0]-x,b[1]-y)?a:b);return {x:p[0],y:p[1],distance:Math.hypot(p[0]-x,p[1]-y)};
}
export function orbitPoint(w,h,progress,r=22){
 r=Math.min(r,w/2,h/2);const arc=Math.PI*r/2,lengths=[w-2*r,arc,h-2*r,arc,w-2*r,arc,h-2*r,arc],total=lengths.reduce((a,b)=>a+b,0);let d=((progress%1)+1)%1*total;
 for(let i=0;i<lengths.length;i++){if(d>lengths[i]){d-=lengths[i];continue;}if(i===0)return{x:r+d,y:0};if(i===2)return{x:w,y:r+d};if(i===4)return{x:w-r-d,y:h};if(i===6)return{x:0,y:h-r-d};const centers=[[w-r,r],[w-r,h-r],[r,h-r],[r,r]],q=(i-1)/2,[cx,cy]=centers[q],a=-Math.PI/2+q*Math.PI/2+d/r;return{x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)};}
 return{x:r,y:0};
}
