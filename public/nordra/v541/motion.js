(()=>{
 const host=document.querySelector('[data-view]:not([hidden])');
 host.querySelectorAll('.aurora-field').forEach((field,index)=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const smallScreen=matchMedia('(max-width:700px)');
 const constrained=navigator.connection?.saveData===true||(navigator.deviceMemory>0&&navigator.deviceMemory<=4)||(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4);
 const profile=()=>constrained?{fps:24,dpr:1,pixels:700000,name:'light'}:smallScreen.matches?{fps:30,dpr:1.15,pixels:1000000,name:'mobile'}:{fps:60,dpr:index===0?1.5:1.25,pixels:2400000,name:'full'};
 let paused=parent!==window||reduced.matches||document.body.dataset.journeyMotion==='paused',intensity=.85,time=0,last=0,raf=0,ready=false,visible=false,render;
 const tell=state=>{if(index===0&&parent!==window)parent.postMessage({type:'nordra-motion-status',state},'*');};
 const stop=()=>{cancelAnimationFrame(raf);raf=0;last=0;};
 function frame(now){if(paused||document.hidden||!ready||!visible)return;if(last&&now-last<1000/profile().fps-.5){raf=requestAnimationFrame(frame);return;}if(last)time+=Math.min((now-last)/1000,.08);last=now;render(time);raf=requestAnimationFrame(frame);}
 function sync(){stop();if(!ready)return;canvas.dataset.motion=paused?'paused':visible?'playing':'offscreen';tell(paused?'paused':'playing');if(!paused&&!document.hidden&&visible)raf=requestAnimationFrame(frame);}
 addEventListener('message',e=>{if(e.source!==parent||e.data?.type!=='nordra-motion')return;paused=!!e.data.paused;intensity=Math.max(.2,Math.min(1.2,Number(e.data.intensity)||.85));sync();if(ready)render(time);});
 addEventListener('nordra-local-motion',e=>{paused=!!e.detail.paused;sync();if(ready)render(time);});
 reduced.addEventListener('change',e=>{paused=e.matches;sync();});document.addEventListener('visibilitychange',sync);addEventListener('nordra-theme',()=>{if(ready)render(time);});
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');field.append(canvas);
 const inView=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:0});inView.observe(field);
 try{
 const gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false,preserveDrawingBuffer:true});if(!gl)throw Error('WebGL');
 const vs='attribute vec2 a;varying vec2 uv;void main(){uv=vec2(a.x*.5+.5,.5-a.y*.5);gl_Position=vec4(a,0.,1.);}';
 const fs=`precision highp float;varying vec2 uv;uniform float t;uniform float strength;uniform float dark;uniform float palette;uniform float paletteNext;uniform float paletteBlend;uniform float unfold;
 float hash(float n){return fract(sin(n*127.1)*43758.5453);}
 float noise(float x){float i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(hash(i),hash(i+1.),f);}
 float mist(vec2 p){
   vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
   float n=i.x+i.y*57.;
   return mix(mix(hash(n),hash(n+1.),f.x),mix(hash(n+57.),hash(n+58.),f.x),f.y);
 }
 float curtain(vec2 p,float seed,float offset){
   float clock=t*mix(.55,1.25,strength/1.2);
   // The sheet bends with height. Its folds drift at different, slow rates.
   float x=p.x+.065*sin(p.y*5.+seed+clock*.19);
   x+=.025*sin(p.y*10.+x*5.-clock*.13+seed);
   float drift=clock*.20;
   float fold=x*8.+seed+drift+.7*sin(x*3.8-clock*.12+seed);
   float spread=mix(.28,1.35,unfold);
   float base=.58+offset*spread+.11*spread*sin(fold+unfold*2.4)+.055*spread*sin(fold*2.73+seed-clock*.11);
   float up=base-p.y;
   float openness=.5+.5*sin(fold*1.31-clock*.27);
   float height=(.10+.16*openness+.08*noise(x*4.+seed+clock*.15))*mix(.5,1.15,unfold);
   // Broad translucent volumes replace the previous dense vertical line pattern.
   float veil=exp(-max(up,0.)/height*1.65)*smoothstep(-.055,.035,up);
   veil*=1.-smoothstep(height*.7,height*2.7,up);
   float width=.014+.014*openness;
   float edge=exp(-(up*up)/(width*width))*.28;
   float texture=.74+.26*mist(vec2(x*29.+seed-clock*.23,p.y*3.+clock*.08));
   float light=.42+.58*noise(x*7.+seed-clock*.48);
   float folds=.65+.35*sin(fold*2.23+up*4.+seed);
   float ends=smoothstep(-.12,.2,p.x)*(1.-smoothstep(.85,1.15,p.x));
   return (veil*.78+edge)*texture*light*folds*ends;
 }
 vec3 auroraColor(float pal,float x){
   vec3 cyan=vec3(.03,.66,.66),blue=vec3(.17,.38,.81),violet=vec3(.51,.27,.78);
   if(pal>.5&&pal<1.5){cyan=vec3(.56,.40,.27);blue=vec3(.76,.61,.43);violet=vec3(.46,.31,.22);}
   if(pal>1.5&&pal<2.5){cyan=vec3(.26,.38,.90);blue=vec3(.54,.36,.82);violet=vec3(.80,.41,.65);}
   if(pal>2.5&&pal<3.5){cyan=vec3(.07,.55,.43);blue=vec3(.12,.42,.62);violet=vec3(.24,.38,.57);}
   if(pal>3.5&&pal<4.5){cyan=vec3(.78,.39,.12);blue=vec3(.53,.27,.56);violet=vec3(.79,.48,.36);}
   if(pal>4.5&&pal<5.5){cyan=vec3(.13,.52,.37);blue=vec3(.44,.60,.38);violet=vec3(.77,.58,.27);}
   if(pal>5.5){cyan=vec3(.66,.49,.27);blue=vec3(.58,.43,.72);violet=vec3(.72,.61,.43);}
   vec3 color=mix(cyan,blue,smoothstep(.35,.63,x));color=mix(color,violet,smoothstep(.61,.88,x));
   return color;
 }
 void main(){
   vec2 p=uv; p.x=(p.x-.5)/mix(.65,1.18,unfold)+.5;
   p.y+=mix(.14,-.06,unfold);
   float a=curtain(p,2.,0.);
   float b=curtain(vec2(p.x+.13,p.y),17.,.10)*.62;
   float c=curtain(vec2(p.x-.18,p.y),32.,-.13)*.32;
   float light=(a+b+c)*mix(.85,1.3,strength/1.2);
   vec3 color=mix(auroraColor(palette,p.x),auroraColor(paletteNext,p.x),paletteBlend);
   color=mix(color,vec3(.20,.91,.80),dark*(palette>.5?0.:.22));
   gl_FragColor=vec4(color,clamp(light*mix(1.35,1.9,dark),0.,.82));
 }`;
 function shader(type,text){const s=gl.createShader(type);gl.shaderSource(s,text);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('shader');return s;}
 const program=gl.createProgram(),v=shader(gl.VERTEX_SHADER,vs),f=shader(gl.FRAGMENT_SHADER,fs);gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('link');gl.useProgram(program);gl.deleteShader(v);gl.deleteShader(f);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
 const up=gl.getUniformLocation(program,'palette'),un=gl.getUniformLocation(program,'paletteNext'),ub=gl.getUniformLocation(program,'paletteBlend');const initialPalette=Number(field.dataset.palette)||({bodas:1,cumpleanos:2,eventos:3,temporada:6})[host.dataset.view]||0;gl.uniform1f(up,initialPalette);gl.uniform1f(un,initialPalette);gl.uniform1f(ub,0);
 if(host.dataset.view==='temporada')addEventListener('nordra-seasonal-palette',e=>{gl.uniform1f(up,e.detail.from);gl.uniform1f(un,e.detail.to);gl.uniform1f(ub,e.detail.blend);if(ready)render(time);});
 if(field.classList.contains('showcase-aurora'))addEventListener('nordra-showcase-palette',e=>{gl.uniform1f(up,e.detail.from);gl.uniform1f(un,e.detail.to);gl.uniform1f(ub,e.detail.blend);if(ready)render(time);});
 const uf=gl.getUniformLocation(program,'unfold');let unfold=Number(field.dataset.unfold)||0;
 gl.uniform1f(uf,unfold);
 addEventListener('nordra-aurora-unfold',e=>{if(e.detail.field!==field)return;unfold=e.detail.progress;gl.uniform1f(uf,unfold);if(ready)render(time);});
 const ut=gl.getUniformLocation(program,'t'),us=gl.getUniformLocation(program,'strength'),ud=gl.getUniformLocation(program,'dark');
 render=elapsed=>{const quality=profile(),area=Math.max(1,field.clientWidth*field.clientHeight),dpr=Math.min(devicePixelRatio,quality.dpr,Math.sqrt(quality.pixels/area)),w=Math.max(1,Math.round(field.clientWidth*dpr)),h=Math.max(1,Math.round(field.clientHeight*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}canvas.dataset.quality=quality.name;canvas.dataset.targetFps=String(quality.fps);gl.uniform1f(ut,elapsed+index*11.7);gl.uniform1f(us,intensity);gl.uniform1f(ud,document.body.classList.contains('dark')?1:0);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,6);canvas.dataset.elapsed=elapsed.toFixed(2);};
 const observer=new ResizeObserver(()=>render(time));observer.observe(field);ready=true;render(0);if(parent!==window)tell('ready');else sync();
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();ready=false;stop();canvas.remove();tell('static');});
 addEventListener('pagehide',()=>{stop();observer.disconnect();inView.disconnect();gl.deleteBuffer(buffer);gl.deleteProgram(program);},{once:true});
 }catch{inView.disconnect();canvas.remove();tell('static');}
 });
})();
