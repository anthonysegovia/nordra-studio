/* 5.40 — Layered aurora light + the unchanged CSS 3D typography.
   Image composition, envelopes and snow keep their existing controllers. */
(()=>{
 const host=document.querySelector('[data-view]:not([hidden])');if(!host)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),small=matchMedia('(max-width:700px)'),short=matchMedia('(max-height:650px)');
 const stopped=()=>reduce.matches||document.body.dataset.journeyMotion==='paused';
 const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
 const layoutTop=el=>{let y=0;for(let n=el;n;n=n.offsetParent)y+=n.offsetTop;return y;};
 const chapters=[];
 function chapter(anchor,stage,kind,pinned){
  const ribbon=document.createElement('div');ribbon.className='theatre-ribbon';ribbon.setAttribute('aria-hidden','true');stage.prepend(ribbon);
  const canvas=document.createElement('canvas');ribbon.append(canvas);
  const item={anchor,stage,kind,pinned,ribbon,canvas,progress:1,render:()=>{},dispose:()=>{}};chapters.push(item);return item;
 }
 function spacer(track){const el=document.createElement('div');el.className='theatre-distance';el.setAttribute('aria-hidden','true');track.append(el);}
 const heading=host.querySelector('.opening-title');
 if(heading){
  host.classList.add('has-theatre');
  const track=document.createElement('div');track.className='theatre-track hero-track';
  const stage=document.createElement('div');stage.className='theatre-stage theatre-hero';
  const nodes=[...host.children].filter(el=>el.matches('.location,.opening-title,.opening-foot,.grounding'));
  nodes[0].before(track);track.append(stage);nodes.forEach(el=>stage.append(el));spacer(track);
  const item=chapter(track,stage,'hero',true);item.words=[...heading.children];
 }
 const paths=host.querySelector('.home-paths');
 if(paths){
  const stage=document.createElement('div');stage.className='theatre-stage theatre-paths';
  const nodes=[...paths.children].filter(el=>el.matches('.eyebrow,h2,.paths-layout'));
  nodes[0].before(stage);nodes.forEach(el=>stage.append(el));paths.classList.add('theatre-track','paths-track');spacer(paths);
  const item=chapter(paths,stage,'paths',true);item.cards=[...stage.querySelectorAll('.service-path')];
 }
 host.querySelectorAll('.travel-closing').forEach(section=>{
  section.classList.add('theatre-closing');
  const item=chapter(section,section,'contact',false);
  item.title=section.querySelector('h2');item.contact=section.querySelector('.contact-layout');
 });
 if(!chapters.length)return;
 // Three translucent light fields. Depth comes from different scales, folds and parallax.
 const palette={0:[[.04,.65,.66],[.24,.43,.91],[.62,.3,.85]],1:[[.63,.43,.25],[.9,.75,.53],[.5,.31,.21]],2:[[.45,.34,.9],[.8,.43,.68],[.4,.62,.9]],3:[[.1,.61,.44],[.23,.53,.61],[.3,.42,.7]],4:[[.9,.4,.12],[.53,.28,.68],[.77,.48,.36]],5:[[.13,.6,.4],[.52,.69,.44],[.86,.65,.28]],6:[[.8,.62,.32],[.61,.44,.78],[.91,.78,.5]]};
 let colors=palette[({bodas:1,cumpleanos:2,eventos:3,temporada:6})[host.dataset.view]||0];
 for(const item of chapters){
  if((small.matches||matchMedia('(pointer:coarse)').matches)&&window.NordraMobileAurora){
   item.canvas.remove();const light=window.NordraMobileAurora.create(item.ribbon,colors);
   item.render=()=>{light.setColors(colors);light.render(item.progress);};item.dispose=()=>light.dispose();continue;
  }
  let gl;
  try{
   gl=item.canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});if(!gl)throw Error('No WebGL');
   const vert=`attribute vec2 a;varying vec2 uv;
    void main(){uv=vec2(a.x*.5+.5,.5-a.y*.5);gl_Position=vec4(a,0.,1.);}`;
   const frag=`precision highp float;varying vec2 uv;
    uniform float progress;uniform float aspect;uniform float layer;uniform float closing;
    uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
     return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
    void main(){
     float p=progress,depth=layer*.5,seed=layer*2.31;
     float span=mix(mix(.62,1.24,p),mix(1.5,.94,p),closing);
     float x=(uv.x-.5)/span+.5+(p-.5)*mix(.32,.12,depth);
     // Each layer drifts at a different depth, with a broad continuous fold.
     float fold=x*mix(6.4,8.2,clamp(aspect*.4,0.,1.))+seed+p*mix(2.8,1.15,depth);
     float arc=.51+.15*sin(fold)+.065*sin(fold*1.87+seed-p*.8);
     arc+=(layer-1.)*mix(.10,.035,closing*p)+mix(.13,-.12,p)*(1.-depth*.55);
     arc+=.045*(noise(vec2(x*5.+seed,p*1.4))-.5);
     float up=arc-uv.y;
     float breath=.5+.5*sin(fold*.79+seed);
     float height=mix(.13,.26,breath)*mix(.78,1.3,p)*(1.+depth*.25);
     float veil=exp(-max(up,0.)/height*1.7)*smoothstep(-.075,.04,up);
     veil*=1.-smoothstep(height*.65,height*2.5,up);
     float width=mix(.018,.043,breath)*(1.+depth*.4);
     float edge=exp(-up*up/(width*width))*.23;
     float haze=exp(-up*up/(height*height*1.5))*.16;
     float texture=.57+.43*noise(vec2(x*13.+seed,uv.y*3.+p*.6));
     float light=.58+.42*noise(vec2(x*5.-p*1.4,seed));
     float ends=smoothstep(-.12,.12,x)*(1.-smoothstep(.86,1.12,x));
     float bounds=smoothstep(0.,.09,uv.y)*(1.-smoothstep(.85,1.,uv.y));
     float density=(veil*.72+edge+haze)*texture*light*ends*bounds;
     vec3 c=mix(c1,c2,smoothstep(.15,.62,x));c=mix(c,c3,smoothstep(.5,.91,x));
     c=mix(c,c*1.13,breath*.3);
     gl_FragColor=vec4(c,clamp(density*mix(1.85,1.15,depth),0.,.78));
    }`;
   function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('ribbon shader');return s;}
   const v=shader(gl.VERTEX_SHADER,vert),f=shader(gl.FRAGMENT_SHADER,frag),program=gl.createProgram();gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('ribbon link');gl.useProgram(program);gl.deleteShader(v);gl.deleteShader(f);
   const vertices=[-1,-1,1,-1,-1,1,-1,1,1,-1,1,1];
   const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
   const a=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
   const uniforms={};['progress','aspect','layer','closing','c1','c2','c3'].forEach(key=>uniforms[key]=gl.getUniformLocation(program,key));
   gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
   item.render=()=>{
    const w=item.ribbon.clientWidth,h=item.ribbon.clientHeight,dpr=Math.min(devicePixelRatio,small.matches?1:1.25,Math.sqrt(1200000/Math.max(1,w*h)));
    const cw=Math.max(1,Math.round(w*dpr)),ch=Math.max(1,Math.round(h*dpr));
    if(item.canvas.width!==cw||item.canvas.height!==ch){item.canvas.width=cw;item.canvas.height=ch;gl.viewport(0,0,cw,ch);}
    gl.uniform1f(uniforms.progress,item.progress);gl.uniform1f(uniforms.aspect,w/Math.max(1,h));gl.uniform1f(uniforms.closing,item.kind==='contact'?1:0);
    colors.forEach((c,i)=>gl.uniform3fv(uniforms['c'+(i+1)],c));gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    for(let i=2;i>=0;i--){gl.uniform1f(uniforms.layer,i);gl.drawArrays(gl.TRIANGLES,0,vertices.length/2);}
   };
   item.dispose=()=>{gl.deleteBuffer(buffer);gl.deleteProgram(program);};item.ribbon.dataset.renderer='webgl';
   item.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();item.render=()=>{};item.ribbon.dataset.renderer='fallback';item.canvas.hidden=true;});
  }catch{item.canvas.hidden=true;item.ribbon.dataset.renderer='fallback';}
 }
 let frame=0;
 function paint(){
  frame=0;if(document.hidden)return;
  const still=stopped(),mobile=small.matches,h=innerHeight;
  host.classList.toggle('theatre-still',still);
  for(const item of chapters){
   const y=layoutTop(item.anchor)-scrollY;
   let p=still?1:item.pinned&&!short.matches?clamp(((mobile?90:108)-y)/(h*.85)):clamp((h*.9-y)/(h*.85));
   const e=smooth(p);item.progress=e;item.stage.dataset.theatreProgress=p.toFixed(5);
   if(item.kind==='hero'){
    item.words.forEach((word,i)=>{
     const q=1-smooth((p-i*.055)/(.7-i*.055));
     const x=[-6,9,-5,mobile?3:12][i]*(mobile?.55:1)*q,y=[-12,-5,0,28][i]*q;
     const z=[-180,-95,mobile?60:180,-200][i]*q*(mobile?.55:1);
     const tilt=mobile?.16:1;
     word.style.transform=`perspective(1000px) translate3d(${x*tilt}%,${y*tilt}px,${z*tilt}px) rotateY(${[28,-24,-32,30][i]*q*tilt}deg) rotateX(${[12,-10,8,-14][i]*q*tilt}deg)`;
    });
   }
   if(item.kind==='paths'){
    const q=1-smooth((p-.05)/.8);
    item.cards.forEach(card=>{
     const cp=still?1:mobile?clamp((h*.92-(layoutTop(card)-scrollY))/(h*.68)):p;
     card.style.setProperty('--path-open',smooth(cp).toFixed(5));
    });
    item.cards.forEach((card,i)=>{const sign=i?-1:1;
     card.style.setProperty('--fan-transform',mobile?`perspective(1000px) translate3d(0,${sign*q*12}px,${-q*70}px) rotateX(${sign*q*8}deg) rotateZ(${sign*q*2}deg)`:`perspective(1300px) translate3d(${sign*q*6}%,${(i?40:24)*q}px,${(i?-90:40)*q}px) rotateY(${sign*q*12}deg) rotateZ(${sign*q*4}deg)`);
    });
   }
   if(item.kind==='contact'){
    const q=(1-smooth(p/.85))*(mobile?.2:1);item.title?.style.setProperty('--contact-transform',`perspective(1000px) translate3d(0,${q*65}px,${-q*160}px) rotateX(${q*38}deg)`);
    item.contact?.style.setProperty('--contact-transform',`perspective(1000px) translate3d(0,${q*100}px,${-q*220}px) rotateX(${q*22}deg)`);
   }
   if(y<h*1.5&&y+item.anchor.offsetHeight>-h*.5)item.render();
  }
 }
 function queue(){if(!frame&&!document.hidden)frame=requestAnimationFrame(paint);}
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});
 addEventListener('nordra-seasonal-palette',e=>{const a=palette[e.detail.from]||palette[6],b=palette[e.detail.to]||a;colors=a.map((c,i)=>c.map((v,j)=>v+(b[i][j]-v)*e.detail.blend));queue();});
 document.addEventListener('visibilitychange',queue);reduce.addEventListener('change',queue);small.addEventListener('change',queue);short.addEventListener('change',queue);
 const state=new MutationObserver(queue);state.observe(document.body,{attributes:true,attributeFilter:['data-journey-motion']});
 const size=new ResizeObserver(queue);size.observe(host);document.fonts.ready.then(queue);queue();
 addEventListener('pagehide',()=>{cancelAnimationFrame(frame);state.disconnect();size.disconnect();chapters.forEach(i=>i.dispose());removeEventListener('scroll',queue);removeEventListener('resize',queue);},{once:true});
})();
