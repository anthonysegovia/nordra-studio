/* Deform a prepared texture on a small mesh. No per-pixel noise or live blur. */
(()=>{
 const host=document.querySelector('.horizon-hero .horizon-light');
 if(!host)return;
 const image=host.querySelector('img'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
 const canvas=document.createElement('canvas');canvas.className='horizon-flow';canvas.setAttribute('aria-hidden','true');
 let gl,program,buffer,texture,raf=0,last=0,elapsed=0,visible=false,ready=false,lost=false;
 const paused=()=>reduce.matches||document.body.dataset.journeyMotion==='paused'||document.hidden||!visible;
 function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
 function sync(){stop();canvas.dataset.motion=paused()?'paused':'playing';if(ready&&!lost&&!paused())raf=requestAnimationFrame(tick);}
 function tick(now){
  raf=0;if(paused()||!ready||lost)return;
  if(!last||now-last>=1000/30-1){if(last)elapsed+=Math.min((now-last)/1000,.1);last=now;draw();}
  raf=requestAnimationFrame(tick);
 }
 let time;
 function draw(){gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(time,elapsed);gl.drawArrays(gl.TRIANGLES,0,48*8*6);canvas.dataset.elapsed=elapsed.toFixed(2);}
 function resize(){
  if(!ready||lost)return;
  const scale=Math.min(1,1400/Math.max(1,host.clientWidth));
  canvas.width=Math.max(1,Math.round(host.clientWidth*scale));canvas.height=Math.max(1,Math.round(host.clientHeight*scale));
  gl.viewport(0,0,canvas.width,canvas.height);draw();
 }
 const view=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});view.observe(host);
 const size=new ResizeObserver(resize);size.observe(host);
 const state=new MutationObserver(sync);state.observe(document.body,{attributes:true,attributeFilter:['data-journey-motion']});
 document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',sync);
 function fallback(){stop();lost=true;host.classList.remove('has-flow');canvas.remove();}
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback();});
 async function initialize(){
  try{
   await image.decode();
   gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,powerPreference:'low-power'});
   if(!gl)throw Error('WebGL unavailable');
   const vertex=`attribute vec2 position;varying vec2 uv;uniform float time;
    void main(){uv=position;float fold=(sin(position.x*7.0+time*.55)*.15+sin(position.x*13.0-time*.39)*.055)*sin(position.y*3.14159);
    vec2 p=position*2.0-1.0;p.y=p.y*.88+fold;p.x+=sin(position.y*6.0+time*.32)*.015*sin(position.x*3.14159);gl_Position=vec4(p,0.0,1.0);}`;
   const fragment=`precision mediump float;varying vec2 uv;uniform sampler2D light;void main(){gl_FragColor=texture2D(light,uv);}`;
   function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Shader compilation');return s;}
   const v=shader(gl.VERTEX_SHADER,vertex),f=shader(gl.FRAGMENT_SHADER,fragment);
   program=gl.createProgram();gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);gl.deleteShader(v);gl.deleteShader(f);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Shader linking');gl.useProgram(program);
   const points=[];for(let y=0;y<8;y++)for(let x=0;x<48;x++){const a=x/48,b=y/8,c=(x+1)/48,d=(y+1)/8;points.push(a,b,c,b,a,d,a,d,c,b,c,d);}
   buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points),gl.STATIC_DRAW);
   const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
   texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.uniform1i(gl.getUniformLocation(program,'light'),0);time=gl.getUniformLocation(program,'time');
   ready=true;resize();host.append(canvas);host.classList.add('has-flow');sync();
  }catch{fallback();}
 }
 // Keep the original static artwork when reduced motion is requested at entry.
 if(!reduce.matches)initialize();
 addEventListener('pagehide',()=>{stop();view.disconnect();size.disconnect();state.disconnect();if(gl&&!lost){gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);}},{once:true});
})();
