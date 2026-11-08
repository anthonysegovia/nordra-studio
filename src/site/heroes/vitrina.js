import { businessOffers, businessMoney } from '../../data/businessOffers.ts';
import { tr, english } from './locale.js';
import { THREE, clamp, seg, eo, eio, bounce, lerp, spring, seenBefore, stillMode, createStage, place, toStage, screenRect, createClock, tiltControls, followGlow, canvasTexture, dotTexture, softTexture } from './shared.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

const $=id=>document.getElementById(id);
const hero=$('hero'),stage=$('stage'),msgsEl=$('msgs'),mini=$('mini'),gcard=$('gcard'),caption=$('caption'),phases=$('phases'),cursor=$('cursor');
const still=stillMode(),repeat=seenBefore('nordra-vitrina');
const narrow=matchMedia('(max-width:860px)'),isNarrow=narrow.matches;
const {renderer,scene,camera}=createStage(stage,{camPos:[0,.9,10.5],lookAt:[0,-.15,0]});
renderer.domElement.setAttribute('aria-hidden','true');
// Presupuesto en teléfono: densidad de píxeles limitada desde el inicio
if(isNarrow)renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
const MAXANI=renderer.capabilities.getMaxAnisotropy();
// La entrada se cuenta en tiempo de guion; los primeros 5.25 s del guion pasan en 3.75 s reales
const WARP=r=>r<3.75?r*1.4:r+1.5;
// Hora real de Monterrey (para el horario de la ficha y para entrar de noche si allá es de noche)
function mtyHour(){try{const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Monterrey',hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(new Date());const g=k=>+p.find(x=>x.type===k).value;return g('hour')+g('minute')/60;}catch{return new Date().getHours();}}
const key=new THREE.DirectionalLight(0xffffff,1.6);key.position.set(3,4,6);scene.add(key);
const rim=new THREE.DirectionalLight(0x7fe0ff,1.2);rim.position.set(-5,2,-3);scene.add(rim);
const root=new THREE.Group();scene.add(root);
const vit=new THREE.Group();root.add(vit);
const world=new THREE.Group();root.add(world);

// Cada demo trae su tono de luz, su barrio en el mapa, su horario de ejemplo y su conversación
const DEMOS=[
 {name:tr("Nítida"),kind:tr("clínica de la vista"),barrio:'San Pedro',lcp:'0.9',tint:'#7fb3ea',pin:[1.62,.75],hours:[9,19],talks:[[tr("Tengo una clínica de la vista, ¿me hacen la página?"),tr("¡Claro! ¿Qué servicios quieres mostrar?")],[tr("¿Me dan factura?"),tr("Sí, emitimos CFDI")]],word:tr("Tu clínica,"),href:'https://nordrastudio.mx/demos/nitida/',desk:'/nordra/v550/assets/nitida-desk.jpg',mob:'/nordra/v550/assets/nitida-movil.jpg',scroll:true},
 {name:'Sobremesa',kind:tr("café de especialidad"),barrio:'Barrio Antiguo',tint:'#e6c095',pin:[-.6,1.05],hours:[8,21],talks:[[tr("Tengo un café y quiero que me encuentren"),tr("¡Claro! ¿En qué zona está tu café?")],[tr("¿Cuánto cuesta una página?"),`${english?'From':'Desde'} ${businessMoney(Math.min(...businessOffers.map(o=>o.cents)))} MXN`]],word:tr("Tu café,"),href:'https://nordrastudio.mx/demos/sobremesa/',desk:'/nordra/v550/assets/sobremesa-flor-1100.webp',mob:'/nordra/v550/assets/sobremesa-movil.jpg',scroll:false},
 {name:'Cantera',kind:tr("arquitectura"),barrio:'Valle Oriente',lcp:'1.2',tint:'#d38a5e',pin:[2.05,.4],hours:[9,18],talks:[[tr("Somos un despacho de arquitectura"),tr("¡Qué bien! ¿Qué obra quieres mostrar?")],[tr("¿Cuánto tarda?"),tr("Desde 3–5 días hábiles, según el paquete")]],word:tr("Tu despacho,"),href:'https://nordrastudio.mx/demos/cantera/',desk:'/nordra/v550/assets/cantera-desk.jpg',mob:'/nordra/v550/assets/cantera-movil.jpg',scroll:false}];
const SLOTS=[{d:0,m:'desk'},{d:0,m:'phone'},{d:1,m:'desk'},{d:2,m:'desk'},{d:2,m:'phone'},{d:1,m:'phone'}];
const loader=new THREE.TextureLoader();
function tex(src,ratio){const t=loader.load(src,()=>{t.userData.frac=Math.min(1,t.image.width/ratio/t.image.height);if(still||clock.paused||!clock.started)draw();});t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=MAXANI;t.userData.frac=1;return t;}

// Vitrina: cristal con grosor y borde iridiscente
const W=3.4,H=2.25,D=.16,SW=3.2,SH=1.8,SY=-.12,PW=.98,PH=2.0;
// Texturas por partes: cada captura se pide solo cuando hace falta (o justo antes)
DEMOS.forEach(d=>{let a=null,b=null;Object.defineProperty(d,'tDesk',{get:()=>a||(a=tex(d.desk,SW/SH))});Object.defineProperty(d,'tMob',{get:()=>b||(b=tex(d.mob,(PW-.08)/(PH-.08)))});});
const glassMat=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.06,metalness:0,clearcoat:1,clearcoatRoughness:.04,iridescence:1,iridescenceIOR:1.35,iridescenceThicknessRange:[180,520],transparent:true,opacity:0,depthWrite:false,envMapIntensity:1.8,emissive:0x6fd3d6,emissiveIntensity:0});
const glass=new THREE.Mesh(new RoundedBoxGeometry(W,H,D,6,.14),glassMat);vit.add(glass);
// Borde que nace de la montaña del isotipo
const NP=400;
const rect=new THREE.Shape(),r=.12,hw=W/2,hh=H/2;
rect.moveTo(-hw+r,hh);rect.lineTo(hw-r,hh);rect.quadraticCurveTo(hw,hh,hw,hh-r);rect.lineTo(hw,-hh+r);rect.quadraticCurveTo(hw,-hh,hw-r,-hh);rect.lineTo(-hw+r,-hh);rect.quadraticCurveTo(-hw,-hh,-hw,-hh+r);rect.lineTo(-hw,hh-r);rect.quadraticCurveTo(-hw,hh,-hw+r,hh);
const rectPts=rect.getSpacedPoints(NP-1);
let mountPts=rectPts.map(p=>new THREE.Vector2(p.x*.6,(p.y<0?-hh:-hh+Math.max(0,.9-Math.abs(p.x)*.5))));
fetch('/nordra/v550/assets/isotipo.svg').then(r=>r.text()).then(txt=>{const data=new SVGLoader().parse(txt);const pts=data.paths[0].toShapes(true)[0].getSpacedPoints(NP-1);
 const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),cx=(Math.min(...xs)+Math.max(...xs))/2,w=Math.max(...xs)-Math.min(...xs),maxY=Math.max(...ys);
 const k=W/w;mountPts=pts.map(p=>new THREE.Vector2((p.x-cx)*k,-hh+(maxY-p.y)*k));
 // empezar el recorrido de la montaña cerca del rectángulo para que el paso sea limpio
 let best=0,bd=1e9;for(let i=0;i<NP;i++){const d=mountPts[i].distanceTo(rectPts[0]);if(d<bd){bd=d;best=i;}}mountPts=mountPts.slice(best).concat(mountPts.slice(0,best));});
const borderPos=new Float32Array(NP*3),borderCol=new Float32Array(NP*3);
for(let i=0;i<NP;i++){const c=new THREE.Color().setHSL(.5+.25*(i/NP),.75,.6);borderCol.set([c.r,c.g,c.b],i*3);}
const borderGeo=new THREE.BufferGeometry();borderGeo.setAttribute('position',new THREE.BufferAttribute(borderPos,3));borderGeo.setAttribute('color',new THREE.BufferAttribute(borderCol,3));
const borderMat=new THREE.LineBasicMaterial({vertexColors:true,transparent:true});
vit.add(new THREE.Line(borderGeo,borderMat));
const barMat=new THREE.MeshBasicMaterial({color:0x9fb3c2,transparent:true,opacity:0});
[0,1,2].forEach(i=>{const m=new THREE.Mesh(new THREE.CircleGeometry(.035,20),barMat);m.position.set(-hw+.18+i*.1,hh-.13,D/2+.003);vit.add(m);});
const pill=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.08),barMat);pill.position.set(0,hh-.13,D/2+.003);vit.add(pill);

// Pantalla: aparición por barrido, fundido entre demos y recorrido vertical
const VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
const screenShader=(band=[0,1])=>new THREE.ShaderMaterial({transparent:true,toneMapped:false,uniforms:{tA:{value:null},tB:{value:null},fA:{value:1},fB:{value:1},oA:{value:0},oB:{value:0},uMix:{value:0},uReveal:{value:1},uGlow:{value:new THREE.Color(0x6fd3d6)},uOp:{value:1},uBand:{value:new THREE.Vector2(...band)},uDim:{value:0}},
 vertexShader:VS,fragmentShader:`uniform sampler2D tA,tB;uniform float fA,fB,oA,oB,uMix,uReveal,uOp,uDim;uniform vec2 uBand;uniform vec3 uGlow;varying vec2 vUv;
 // nitidez: realce suave medido en píxeles de pantalla
 vec3 sharp(sampler2D t,vec2 uv){vec2 px=fwidth(uv)*.8;vec3 c=texture2D(t,uv).rgb;vec3 n=texture2D(t,uv+vec2(px.x,0.)).rgb+texture2D(t,uv-vec2(px.x,0.)).rgb+texture2D(t,uv+vec2(0.,px.y)).rgb+texture2D(t,uv-vec2(0.,px.y)).rgb;return clamp(c+(c-n*.25)*.45,0.,1.);}
 void main(){float vy=mix(uBand.x,uBand.y,vUv.y);float e=1.-vy;
 // cambio de demo: la página actual se desliza y la nueva entra detrás de un filo de luz
 float k=uMix,edge=1.-k;vec2 a=vec2(vUv.x+k,1.-oA-e*fA),b=vec2(vUv.x-edge,1.-oB-e*fB);
 vec3 c=vUv.x<edge?sharp(tA,a)*(1.-k*.3):sharp(tB,b);
 c+=uGlow*exp(-pow((vUv.x-edge)*80.,2.))*sin(k*3.1416)*1.3;c*=(1.-uDim*.55);
 float m=1.-smoothstep(uReveal-.035,uReveal,e);float line=exp(-pow((e-uReveal)*70.,2.))*step(uReveal,.999);
 gl_FragColor=vec4(c*m+uGlow*line*1.6,max(m,line)*uOp);
 #include <colorspace_fragment>
 }`});
const screenMat=screenShader();screenMat.uniforms.uReveal.value=0;
const screen=new THREE.Mesh(new THREE.PlaneGeometry(SW,SH),screenMat);screen.position.set(0,SY,D/2+.004);vit.add(screen);
// Capas de la página que se separan al pasar el cursor
const BANDS=[[.86,1],[.42,.86],[0,.42]];
const layers=BANDS.map((b)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(SW,SH*(b[1]-b[0])),screenShader(b));m.position.set(0,SY-SH/2+SH*(b[0]+b[1])/2,D/2+.006);m.visible=false;m.material.uniforms.uReveal.value=1.05;vit.add(m);return m;});
// Reflejo que cruza el cristal
const glareMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uT:{value:0},uK:{value:.12}},vertexShader:VS,fragmentShader:'uniform float uT,uK;varying vec2 vUv;void main(){float d=vUv.x*.8+vUv.y*.6-uT;gl_FragColor=vec4(vec3(1.),exp(-d*d*60.)*uK);}'});
const glare=new THREE.Mesh(new THREE.PlaneGeometry(W-.04,H-.04),glareMat);glare.position.z=D/2+.008;vit.add(glare);
// Canto del cristal: brilla más donde el vidrio se ve de lado (fresnel), de cyan a violeta
const rimMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uK:{value:0},uA:{value:new THREE.Color(0x6fe3ff)},uB:{value:new THREE.Color(0x9b8cff)}},
 vertexShader:'varying vec3 vN,vV;varying float vX;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);vX=position.x;gl_Position=projectionMatrix*mv;}',
 fragmentShader:`uniform float uK;uniform vec3 uA,uB;varying vec3 vN,vV;varying float vX;void main(){float f=pow(1.-abs(dot(normalize(vN),normalize(vV))),3.);gl_FragColor=vec4(mix(uA,uB,clamp(vX/${W.toFixed(2)}+.5,0.,1.)),f*uK);}`});
const rimMesh=new THREE.Mesh(glass.geometry,rimMat);rimMesh.scale.setScalar(1.004);vit.add(rimMesh);
// El título se refleja, muy tenue y al revés, en el lado izquierdo del cristal
const reflSrc=document.createElement('canvas'),reflCanvas=document.createElement('canvas');reflSrc.width=reflCanvas.width=1024;reflSrc.height=reflCanvas.height=680;
const reflTex=new THREE.CanvasTexture(reflCanvas);reflTex.colorSpace=THREE.SRGBColorSpace;
const reflMat=new THREE.MeshBasicMaterial({map:reflTex,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
const reflM=new THREE.Mesh(new THREE.PlaneGeometry(W-.06,H-.06),reflMat);reflM.position.z=D/2+.009;vit.add(reflM);
function drawRefl(word){const g=reflSrc.getContext('2d'),w=1024,h=680;g.clearRect(0,0,w,h);g.fillStyle='#fff';g.font='500 92px Sora';g.textAlign='right';
 [word,english?'turned into a website':'convertida en una web',english?'that feels like you':'que se siente tuya'].forEach((l,i)=>g.fillText(l,w-40,180+i*104));
 const r=reflCanvas.getContext('2d');r.clearRect(0,0,w,h);r.save();r.translate(w,0);r.scale(-1,1);r.drawImage(reflSrc,0,0);r.restore();
 r.globalCompositeOperation='destination-in';const fade=r.createLinearGradient(0,0,w,0);fade.addColorStop(0,'rgba(0,0,0,1)');fade.addColorStop(.55,'rgba(0,0,0,.25)');fade.addColorStop(.8,'rgba(0,0,0,0)');r.fillStyle=fade;r.fillRect(0,0,w,h);r.globalCompositeOperation='source-over';reflTex.needsUpdate=true;}

// Bloques que caen con resorte, con su sombra
const shadowT=softTexture();
const blockSpec=[[0,.8,3.0,.09,0],[.74,.13,1.5,1.04,0],[-.8,.4,1.25,.15,1],[-.9,.19,1.05,.15,1],[-.88,-.03,1.1,.05,0],[-.93,-.13,1.0,.05,0],[-1.1,-.4,.62,.16,2],[-1.02,-.7,.98,.2,0],[0,-.7,.9,.2,0],[1.02,-.7,.98,.2,0]];
const blocks=blockSpec.map(([x,y,w,h,kind],i)=>{const g=new THREE.Group();
 g.add(new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:0x6fd3d6,transparent:true,opacity:0,depthWrite:false})),new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(w,h)),new THREE.LineBasicMaterial({color:0x6fd3d6,transparent:true,opacity:0,depthWrite:false})));
 const sh=new THREE.Mesh(new THREE.PlaneGeometry(w*1.25,h*1.6+.08),new THREE.MeshBasicMaterial({map:shadowT,transparent:true,opacity:0,depthWrite:false}));sh.position.set(x,y+SY-.03,D/2+.0065);vit.add(sh);
 const a=i*2.399;g.userData={to:new THREE.Vector3(x,y+SY,D/2+.01+i*.0004),from:new THREE.Vector3(x+Math.cos(a)*.6,y+SY+1.4+(i%3)*.3,1.6+(i%4)*.4),rot:new THREE.Euler(i%2?.5:-.4,(i%3-1)*.5,i%2?-.3:.35),kind,sh};vit.add(g);return g;});

// Teléfono para la versión en celular
const phone=new THREE.Group();root.add(phone);
const phoneFrameMat=new THREE.MeshPhysicalMaterial({color:0x1b2b38,metalness:.7,roughness:.25,clearcoat:1,transparent:true,opacity:0});
phone.add(new THREE.Mesh(new RoundedBoxGeometry(PW,PH,.09,6,.14),phoneFrameMat));
const phoneMat=screenShader();
const phoneScreen=new THREE.Mesh(new THREE.PlaneGeometry(PW-.08,PH-.08),phoneMat);phoneScreen.position.z=.047;phone.add(phoneScreen);
phone.visible=false;

// Mundo: mapa que se enciende, edificios, Cerro de la Silla, piso con reflejo, haz de luz
const FLOOR=-1.32;
const mapBase=document.createElement('canvas'),mapStreets=document.createElement('canvas');mapBase.width=mapStreets.width=1024;mapBase.height=mapStreets.height=640;
const tBase=new THREE.CanvasTexture(mapBase),tStreets=new THREE.CanvasTexture(mapStreets);tBase.colorSpace=THREE.SRGBColorSpace;
const BLOCKS=[];for(let y=20;y<640;y+=86)for(let x=14;x<1024;x+=118)BLOCKS.push([x+((y/86)%2)*20,y,96,64]);
function drawMap(dark){const g=mapBase.getContext('2d'),s=mapStreets.getContext('2d'),w=1024,h=640;
 g.clearRect(0,0,w,h);g.fillStyle=dark?'#122433':'#dbe8ee';g.fillRect(0,0,w,h);g.fillStyle=dark?'#183041':'#cfe0e8';BLOCKS.forEach(b=>g.fillRect(...b));
 s.fillStyle='#000';s.fillRect(0,0,w,h);
 for(const c of [g,s]){c.strokeStyle=c===s?'#fff':(dark?'#2b4a62':'#ffffff');c.lineCap='round';
  c.lineWidth=14;c.beginPath();c.moveTo(0,h*.72);c.bezierCurveTo(w*.3,h*.58,w*.55,h*.9,w,h*.6);c.stroke();
  c.lineWidth=8;c.beginPath();c.moveTo(w*.18,0);c.lineTo(w*.62,h);c.stroke();
  c.lineWidth=4;for(let y=8;y<h;y+=86){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}for(let x=6;x<w;x+=118){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}}
 g.strokeStyle=dark?'#1d4a5a':'#b9dfe6';g.lineWidth=26;g.beginPath();g.moveTo(0,h*.18);g.bezierCurveTo(w*.35,h*.32,w*.6,h*.05,w,h*.22);g.stroke();
 tBase.needsUpdate=tStreets.needsUpdate=true;}
const MAPW=4.6,MAPH=2.9,MAPC=new THREE.Vector3(.5,FLOOR+.012,.5);
const PIN=new THREE.Vector3(1.62,FLOOR+.16,.75);
const pinUV=new THREE.Vector2((PIN.x-MAPC.x)/MAPW+.5,1-((PIN.z-MAPC.z)/MAPH+.5));
const mapMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{tBase:{value:tBase},tStreets:{value:tStreets},uT:{value:-1},uPin:{value:pinUV},uOp:{value:0},uGlow:{value:new THREE.Color(0x6fd3d6)}},vertexShader:VS,
 fragmentShader:`uniform sampler2D tBase,tStreets;uniform float uT,uOp;uniform vec2 uPin;uniform vec3 uGlow;varying vec2 vUv;
 void main(){vec3 c=texture2D(tBase,vUv).rgb;float st=texture2D(tStreets,vUv).r;vec2 d=(vUv-uPin)*vec2(1.6,1.);float r=length(d);
 float wave=uT<0.?0.:exp(-pow((r-uT*.45)*14.,2.))+.35*smoothstep(uT*.45,0.,r)*step(0.,uT);float lit=st*clamp(wave,0.,1.4);
 float fade=1.-smoothstep(.25,.62,length((vUv-.5)*vec2(1.,1.25)));gl_FragColor=vec4(c+uGlow*lit*.9,fade*uOp);
 #include <colorspace_fragment>
 }`});
const map=new THREE.Mesh(new THREE.PlaneGeometry(MAPW,MAPH),mapMat);map.rotation.x=-Math.PI/2;map.position.copy(MAPC);world.add(map);
// Edificios bajos sobre las manzanas
const bGeo=new THREE.BoxGeometry(1,1,1);bGeo.translate(0,.5,0);
// Ventanas que se encienden de noche (solo en los costados; el techo va liso)
const winTex=canvasTexture(64,128,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);for(let y=10;y<h-6;y+=12)for(let x=8;x<w-6;x+=12)if(Math.random()<.55){g.fillStyle=Math.random()<.75?'#ffd29a':'#9fe8ff';g.fillRect(x,y,6,6);}});
const bMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.65,transparent:true,opacity:0,emissive:0xffffff,emissiveMap:winTex,emissiveIntensity:0});
const bTop=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.5,transparent:true,opacity:0});
const picks=BLOCKS.map((b,i)=>({b,i,x:MAPC.x+((b[0]+48)/1024-.5)*MAPW,z:MAPC.z+((b[1]+32)/640-.5)*MAPH})).filter(o=>Math.hypot((o.x-MAPC.x)/MAPW,(o.z-MAPC.z)/MAPH*1.25)<.26);
const bldg=new THREE.InstancedMesh(bGeo,[bMat,bMat,bTop,bTop,bMat,bMat],picks.length);
// Alturas variadas: casas bajas, edificios medianos y alguna torre
const bH=picks.map((o,i)=>{const r=((i*37)%11)/11;return i%7===3?.3+r*.12:i%3===0?.12+r*.08:.035+r*.07;});
const bW=picks.map((o,i)=>i%7===3?.12:.15+((i*13)%5)*.01);
const PAL=[0x2fd0e0,0x4a7cf0,0x8a5cf0];
function paintBuildings(d){const c=new THREE.Color(),p=new THREE.Color();picks.forEach((o,i)=>{p.set(PAL[(i*5)%3]);c.set(d?0x15283a:0xf2f7fa).lerp(p,d?.22+((i*7)%4)*.04:.14+((i*7)%4)*.05);bldg.setColorAt(i,c);});bldg.instanceColor.needsUpdate=true;}
world.add(bldg);const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),sv=new THREE.Vector3(),pv=new THREE.Vector3();
// Silueta del Cerro de la Silla al fondo
const cerro=new THREE.Shape();[[-4,0],[-2.6,.25],[-1.7,.95],[-1.25,1.25],[-.95,1.05],[-.55,.62],[-.2,.7],[.25,1.05],[.6,1.5],[.95,1.25],[1.6,.7],[2.6,.3],[4,0]].forEach(([x,y],i)=>i?cerro.lineTo(x,y):cerro.moveTo(x,y));cerro.lineTo(4,-.3);cerro.lineTo(-4,-.3);
const cerroMat=new THREE.MeshBasicMaterial({color:0xc9dbe4,transparent:true,opacity:0,depthWrite:false});
// el fondo va desenfocado para que la vitrina quede en foco
const CERRO=[[-4,0],[-2.6,.25],[-1.7,.95],[-1.25,1.25],[-.95,1.05],[-.55,.62],[-.2,.7],[.25,1.05],[.6,1.5],[.95,1.25],[1.6,.7],[2.6,.3],[4,0]];
cerroMat.map=canvasTexture(1024,256,(g,w,h)=>{const X=x=>(x+4.4)/8.8*w,Y=y=>(1.75-y)/2.2*h;g.filter='blur(6px)';g.fillStyle='#fff';g.beginPath();CERRO.forEach(([x,y],i)=>i?g.lineTo(X(x),Y(y)):g.moveTo(X(x),Y(y)));g.lineTo(X(4),Y(-.3));g.lineTo(X(-4),Y(-.3));g.closePath();g.fill();});
const cerroM=new THREE.Mesh(new THREE.PlaneGeometry(8.8,2.2),cerroMat);cerroM.position.set(.6,FLOOR+.65*1.1,-3.4);cerroM.scale.set(1.3,1.1,1);world.add(cerroM);
// Piso con reflejo (solo escritorio)
let reflector=null;
if(!isNarrow){
 const RS={uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null},uK:{value:0}},
  vertexShader:'uniform mat4 textureMatrix;varying vec4 vUv;varying vec2 vP;void main(){vUv=textureMatrix*vec4(position,1.);vP=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform vec3 color;uniform sampler2D tDiffuse;uniform float uK;varying vec4 vUv;varying vec2 vP;void main(){vec4 b=texture2DProj(tDiffuse,vUv);float f=1.-smoothstep(.08,.5,length((vP-vec2(.5,.62))*vec2(1.,1.4)));gl_FragColor=vec4(b.rgb*color,f*uK*b.a);}'};
 reflector=new Reflector(new THREE.PlaneGeometry(7,4.2),{shader:RS,textureWidth:768,textureHeight:460,color:0xffffff,clipBias:.003});
 reflector.material.transparent=true;reflector.material.depthWrite=false;reflector.rotation.x=-Math.PI/2;reflector.position.set(.3,FLOOR,.2);world.add(reflector);}
// Haz de luz desde arriba con polvo
const beamMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{uK:{value:0},uC:{value:new THREE.Color(0xbff4ff)}},vertexShader:VS,fragmentShader:'uniform float uK;uniform vec3 uC;varying vec2 vUv;void main(){float w=.07+.33*(1.-vUv.y);float a=smoothstep(0.,.35,vUv.y)*smoothstep(1.,.75,vUv.y)*exp(-pow((vUv.x-.5)/w,2.)*2.5);gl_FragColor=vec4(uC,a*uK);}'});
const beam=new THREE.Mesh(new THREE.PlaneGeometry(6,5.2),beamMat);beam.position.set(0,1.3,-.6);world.add(beam);
// Luz que atraviesa el cristal y cae sobre el piso (cáusticas)
const causticMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uT:{value:0},uK:{value:0},uC:{value:new THREE.Color(0x8fefff)}},vertexShader:VS,
 fragmentShader:`uniform float uT,uK;uniform vec3 uC;varying vec2 vUv;
 void main(){vec2 p=vUv*vec2(7.,3.)*6.2832;vec2 i=p;float c=1.;
 for(int n=0;n<3;n++){float t=uT*.35*(1.-3.5/float(n+1));i=p+vec2(cos(t-i.x)+sin(t+i.y),sin(t-i.y)+cos(t+i.x));c+=1./length(vec2(p.x/(sin(i.x+t)/.005),p.y/(cos(i.y+t)/.005)));}
 c/=3.;c=1.17-pow(c,1.4);c=pow(abs(c),7.);float m=1.-smoothstep(.12,.5,length((vUv-.5)*vec2(1.,2.1)));
 gl_FragColor=vec4(uC,clamp(c,0.,1.)*m*uK);}`});
const caustic=new THREE.Mesh(new THREE.PlaneGeometry(3.8,1.7),causticMat);caustic.rotation.x=-Math.PI/2;caustic.position.set(0,FLOOR+.014,.35);world.add(caustic);
const DN=60,dp=new Float32Array(DN*3),ds=[];for(let i=0;i<DN;i++){const a=Math.random()*6.28,rr=Math.random()*1.6;dp.set([Math.cos(a)*rr,FLOOR+Math.random()*3.8,Math.sin(a)*rr],i*3);ds.push(Math.random());}
const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.BufferAttribute(dp,3));
const dustMat=new THREE.PointsMaterial({size:.04,map:dotTexture(),color:0xe6fbff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});world.add(new THREE.Points(dustGeo,dustMat));
// Sombra de contacto bajo la vitrina
const vitShadow=new THREE.Mesh(new THREE.PlaneGeometry(3.9,1.05),new THREE.MeshBasicMaterial({map:shadowT,transparent:true,opacity:0,depthWrite:false}));vitShadow.rotation.x=-Math.PI/2;vitShadow.position.set(0,FLOOR+.013,.15);world.add(vitShadow);
// Pin y ondas
const pin=new THREE.Group();
const pinMat=new THREE.MeshPhysicalMaterial({color:0x1d6672,metalness:.25,roughness:.22,clearcoat:1,clearcoatRoughness:.1});
const head=new THREE.Mesh(new THREE.SphereGeometry(.2,40,24),pinMat);head.position.y=.28;
const tip=new THREE.Mesh(new THREE.ConeGeometry(.196,.44,40,1,true),pinMat);tip.rotation.x=Math.PI;tip.position.y=.06;
const eye=new THREE.Mesh(new THREE.SphereGeometry(.075,24,16),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:.35}));eye.position.set(0,.28,.15);
pin.add(head,tip,eye);pin.position.copy(PIN);world.add(pin);
const pinShadow=new THREE.Mesh(new THREE.PlaneGeometry(.7,.7),new THREE.MeshBasicMaterial({map:shadowT,transparent:true,opacity:0,depthWrite:false}));pinShadow.rotation.x=-Math.PI/2;pinShadow.position.set(PIN.x,FLOOR+.016,PIN.z);world.add(pinShadow);
const ripples=[0,1].map(()=>{const m=new THREE.Mesh(new THREE.RingGeometry(.14,.17,56),new THREE.MeshBasicMaterial({color:0x6fd3d6,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(PIN.x,FLOOR+.02,PIN.z);world.add(m);return m;});
// Noche: ciudad con ventanas encendidas y luces desenfocadas
const sky=canvasTexture(2048,512,(g,w,h)=>{g.clearRect(0,0,w,h);g.filter='blur(2.5px)';let x=0;while(x<w){const bw=40+Math.random()*90,bh=120+Math.random()*320;g.fillStyle='#0c1924';g.fillRect(x,h-bh,bw,bh);
 for(let wy=h-bh+10;wy<h-8;wy+=16)for(let wx=x+6;wx<x+bw-6;wx+=12)if(Math.random()<.32){g.fillStyle=Math.random()<.7?'rgba(255,205,140,.85)':'rgba(120,225,255,.8)';g.fillRect(wx,wy,5,7);}x+=bw+4+Math.random()*10;}});
const skyMat=new THREE.MeshBasicMaterial({map:sky,transparent:true,opacity:0,depthWrite:false,toneMapped:false});
const skyM=new THREE.Mesh(new THREE.PlaneGeometry(13,5),skyMat);skyM.position.set(1.8,FLOOR+2.2,-7);root.add(skyM);
const N=80,cp=new Float32Array(N*3),cc=new Float32Array(N*3);
for(let i=0;i<N;i++){cp[i*3]=(Math.random()-.5)*12;cp[i*3+1]=-1.2+Math.random()*3;cp[i*3+2]=-4-Math.random()*2;const c=new THREE.Color(Math.random()<.55?0xffc58a:0x6fe3ff);cc.set([c.r,c.g,c.b],i*3);}
const cityGeo=new THREE.BufferGeometry();cityGeo.setAttribute('position',new THREE.BufferAttribute(cp,3));cityGeo.setAttribute('color',new THREE.BufferAttribute(cc,3));
const cityMat=new THREE.PointsMaterial({size:.3,map:dotTexture(),vertexColors:true,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});root.add(new THREE.Points(cityGeo,cityMat));

// Tema
let dark=false;
function setTheme(d){dark=d;const glow=d?0x4fc6cf:0x5cc9cf;
 screenMat.uniforms.uGlow.value.set(glow);mapMat.uniforms.uGlow.value.set(d?0x6fe3ff:0x2fb8c4);glassMat.color.set(d?0x9fd8e6:0xffffff);
 ripples.forEach(m=>m.material.color.set(glow));pinMat.color.set(d?0x4fbfc6:0x1d6672);barMat.color.set(d?0x557080:0x9fb3c2);
 blocks.forEach(b=>{b.children[0].material.color.set(b.userData.kind===2?(d?0x7fd3d6:0x1d6672):glow);b.children[1].material.color.set(glow);});
 paintBuildings(d);bMat.emissiveIntensity=d?1.25:0;bMat.emissive.set(d?0xffffff:0x000000);rimMat.uniforms.uA.value.set(d?0x5fe0ff:0x2fb8c4);rimMat.uniforms.uB.value.set(d?0xa08cff:0x7a6cf0);causticMat.uniforms.uC.value.set(d?0x7fe9ff:0x5fd0e0);cerroMat.color.set(d?0x0e1c27:0xd7e5ec);beamMat.uniforms.uC.value.set(d?0x7fe3ff:0xffffff);
 if(reflector)reflector.material.uniforms.color.value.set(d?0x9fc7d6:0xffffff);
 phoneFrameMat.color.set(d?0x0d1820:0x1b2b38);rim.color.set(d?0x4fd0ff:0x9fe6ff);renderer.toneMappingExposure=d?1.15:1.05;
 drawMap(d);}
setTheme(document.body.classList.contains('dark'));
addEventListener('nordra-theme',()=>{setTheme(document.body.classList.contains('dark'));draw();});

function size(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 root.scale.setScalar(isNarrow?Math.min(1,w/430):Math.min(1.5,w/700));root.position.set(isNarrow?-.05:.55,isNarrow?-.25:.05,0);draw();}
addEventListener('resize',size);

// Conversación en un teléfono pequeño que vibra
const TALKS=[['Hola, vi su página. Quiero cotizar','¡Claro! ¿De qué es tu negocio?'],['¿Tienen disponibilidad esta semana?','Sí, te agendo una llamada hoy'],[tr("¿Me dan factura?"),tr("Sí, emitimos CFDI")]];
function bubble(cls,text,time){const m=document.createElement('div');m.className='msg '+cls;m.innerHTML=`<div class="typing" aria-hidden="true"><i></i><i></i><i></i></div><div class="text">${text}<small>${time}${cls==='out'?' <span aria-hidden="true">✓✓</span>':''}</small></div>`;msgsEl.append(m);requestAnimationFrame(()=>m.classList.add('on'));return m;}
let events=[];
function talk(at,i){let q='',a='',m1,m2;const min=24+i*3;
 events.push({at,fn:()=>{[q,a]=DEMOS[SLOTS[slot].d].talks[i%2];msgsEl.querySelectorAll('.msg').forEach(x=>{x.classList.remove('on');setTimeout(()=>x.remove(),450);});if(still)m1=bubble('in',q,'10:'+min);else setTimeout(()=>{m1=bubble('in',q,'10:'+min);},300);}},
  {at:at+.9,fn:()=>{m1?.classList.add('sent');mini.classList.remove('buzz');void mini.offsetWidth;mini.classList.add('buzz');}},
  {at:at+1.6,fn:()=>{m2=bubble('out',a,'10:'+(min+1));}},{at:at+2.4,fn:()=>m2?.classList.add('sent')});}

// Recorrido de demos y cambio de palabra en el título
const wordEl=$('word');let wordNow=tr("Tu negocio,");
// El cursor «Diseñando contigo» borra la palabra y escribe la nueva, letra por letra
let typeTimer=0;
function setWord(w){w=tr("Tu visión,");if(w===wordNow)return;const first=!wordNow;wordNow=w;clearTimeout(typeTimer);const line=wordEl.parentElement;
 if(still||first){wordEl.textContent=w;drawRefl(w);return;}
 let cur=wordEl.textContent;line.classList.add('typing-on');
 const type=()=>{if(cur.length<w.length){cur=w.slice(0,cur.length+1);wordEl.textContent=cur;typeTimer=setTimeout(type,48+Math.random()*40);}else typeTimer=setTimeout(()=>{line.classList.remove('typing-on');drawRefl(w);},650);};
 const del=()=>{if(!w.startsWith(cur)){cur=cur.slice(0,-1);wordEl.textContent=cur;typeTimer=setTimeout(del,26);}else typeTimer=setTimeout(type,140);};
 typeTimer=setTimeout(del,180);}
const dotsEl=$('dots');
DEMOS.forEach((d,i)=>{const b=document.createElement('button');b.type='button';b.innerHTML='<i></i>';b.setAttribute('aria-label',(english?'View ':'Ver ')+d.name);b.setAttribute('aria-pressed',String(i===0));b.onclick=()=>jump(i);dotsEl.append(b);});
let slot=0,slotStart=0,mode='desk',modeFrom='desk',modeT=-9,fadeT=-9,fadeOn=null,holdHover=false,lastT=0,pendingJump=-1,manual=null;
const SLOT=7;
function setScreen(mat,t){mat.uniforms.tA.value=t;mat.uniforms.fA.value=t.userData.frac;mat.uniforms.oA.value=0;mat.uniforms.uMix.value=0;}
function texFor(s){const d=DEMOS[s.d];return s.m==='desk'?d.tDesk:d.tMob;}
const fmtH=h=>h===12?'12 p. m.':h>12?(h-12)+' p. m.':h+' a. m.';
function showCaption(){const s=SLOTS[slot],d=DEMOS[s.d];$('capName').textContent=d.name;$('capMode').textContent=s.m==='desk'?tr("en computadora"):tr("en celular");$('gName').textContent=d.name;$('gKind').textContent=d.kind[0].toUpperCase()+d.kind.slice(1)+' · '+d.barrio;
 const H=mtyHour(),[o,c]=d.hours,isOpen=H>=o&&H<c,go=$('gOpen');go.textContent=isOpen?(english?`Open now · Closes at ${fmtH(c)}`:`Abierto ahora · Cierra a las ${fmtH(c)}`):(english?`Closed · Opens at ${fmtH(o)}`:`Cerrado · Abre a las ${fmtH(o)}`);go.classList.toggle('closed',!isOpen);
 hero.style.setProperty('--tint',d.tint);$('speed').innerHTML=d.lcp?`<i aria-hidden="true"></i>${english?`This demo loads in ${d.lcp} s on a phone with 4G (measured Nov 7, 2026)`:`Esta demo carga en ${d.lcp} s en un celular con 4G (medido el 7 nov 2026)`}`:'';
 dotsEl.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===s.d)));labelBtn();}
function goSlot(n,t){const next=SLOTS[n],nt=texFor(next);
 if(next.d!==pinDemo){pinFrom.copy(PP);const q=DEMOS[next.d].pin;pinTo.set(q[0],PIN.y,q[1]);pinT0=t;pinDemo=next.d;}
 if(n===0&&slot===SLOTS.length-1)isoT0=t;
 if(next.m===mode){const mat=mode==='desk'?screenMat:phoneMat;mat.uniforms.tB.value=nt;mat.uniforms.fB.value=nt.userData.frac;mat.uniforms.oB.value=0;fadeT=t;fadeOn=mat;}
 else{setScreen(next.m==='desk'?screenMat:phoneMat,nt);if(next.m==='phone')setScreen(screenMat,DEMOS[next.d].tMob);else setScreen(screenMat,nt);modeFrom=mode;mode=next.m;modeT=t;}
 slot=n;slotStart=t;manual=null;showCaption();setWord(DEMOS[next.d].word);}
function jump(i){pendingJump=SLOTS.findIndex(s=>s.d===i&&s.m===mode);if(pendingJump<0)pendingJump=SLOTS.findIndex(s=>s.d===i);}

const rot={x:0,y:0,tx:0,ty:0};const tilt=tiltControls(hero,stage,rot,{x:.2,y:.45});
const clock=createClock({still,finalTime:9,speed:repeat?1.7:1});
let hover=0,hoverTarget=0,pressT=-9,scrollP=0,ctaLook=0,ctaK=0;
const PP=PIN.clone(),pinFrom=PIN.clone(),pinTo=PIN.clone();let pinT0=-9,pinDemo=0,waveT0=3.35,isoT0=-9;
const uvOf=(x,z)=>new THREE.Vector2((x-MAPC.x)/MAPW+.5,1-((z-MAPC.z)/MAPH+.5));
const dbase=dp.slice();

// Un protagonista a la vez: la ficha tiene su momento y luego le cede el lugar a cada conversación
const TALK_AT=[6.8,17.5,28.5,39.5],TALK_LEN=5.4;
const chatting=t=>TALK_AT.some(a=>t>=a&&t<a+TALK_LEN);
function reset(){msgsEl.innerHTML='';events=[];TALK_AT.forEach((a,i)=>talk(a,i));
 slot=0;mode='desk';modeFrom='desk';modeT=-9;fadeT=-9;fadeOn=null;slotStart=3.0;setScreen(screenMat,DEMOS[0].tDesk);setScreen(phoneMat,DEMOS[0].tMob);layers.forEach(l=>setScreen(l.material,DEMOS[0].tDesk));
 pinT0=-9;pinDemo=0;waveT0=3.35;isoT0=-9;PP.copy(PIN);mapMat.uniforms.uPin.value.copy(pinUV);showCaption();wordNow='';setWord(tr("Tu negocio,"));hero.classList.remove('lit');phases.classList.remove('done');}

function frame(t){
 const dt=clamp(t-lastT,0,.1);lastT=t;
 // Acto 1 (0–1.1 s): la montaña del isotipo se dibuja y se vuelve el marco
 const draw1=eo(seg(t,0,.7)),morph=eio(seg(t,.55,1.25)),pa=borderGeo.attributes.position;
 const shown=Math.floor(NP*draw1);
 for(let i=0;i<NP;i++){const a=mountPts[i]||rectPts[i],b=rectPts[i];pa.setXYZ(i,lerp(a.x,b.x,morph),lerp(a.y,b.y,morph),D/2+.002);}pa.needsUpdate=true;borderGeo.setDrawRange(0,shown);
 // Acto 2 (0.45–2.0 s): los bloques caen con resorte y un cursor los acomoda
 const out=1-seg(t,2.05,2.6);
 let current=-1;
 blocks.forEach((b,i)=>{const t0=.45+i*.12,p=spring(clamp((t-t0)/.55,0,1.8)),u=b.userData;
  b.position.lerpVectors(u.from,u.to,p);b.rotation.set(u.rot.x*(1-Math.min(1,p)),u.rot.y*(1-Math.min(1,p)),u.rot.z*(1-Math.min(1,p)));
  const a=seg(t,t0-.05,t0+.15)*out;b.visible=a>.001;b.children[0].material.opacity=(u.kind===2?.9:.22)*a;b.children[1].material.opacity=.9*a;
  const near=clamp((t-t0)/.45);u.sh.material.opacity=.35*near*out;u.sh.scale.setScalar(lerp(1.7,1,near));if(t>=t0-.12&&t<t0+.4)current=i;});
 if(current>=0&&!isNarrow){const u=blocks[current].userData;place(cursor,vit,u.to,camera,stage,4,4);if(cursor.dataset.i!==String(current)){cursor.dataset.i=current;cursor.classList.remove('click');void cursor.offsetWidth;cursor.classList.add('click');}}
 cursor.classList.toggle('on',t>.4&&t<2.1&&!still);
 // Acto 3 (2.0–2.7 s): la página real aparece con un barrido
 screenMat.uniforms.uReveal.value=eo(seg(t,2.0,2.7))*1.04;
 const ph=[t>.3&&t<1.6,t>=1.6&&t<2.7,t>=2.7&&t<3.8];phases.querySelectorAll('span').forEach((s,i)=>s.classList.toggle('on',ph[i]));phases.classList.toggle('done',t>3.9);
 // Acto 4 (2.8–3.6 s): cae el pin, las calles se encienden y suben los edificios
 mapMat.uniforms.uOp.value=seg(t,2.3,3.0);
 const pd=seg(t,2.8,3.4);pin.visible=t>2.8;pin.rotation.y=t*.9;
 // al cambiar de demo, el pin vuela en arco a su barrio y las calles se vuelven a encender desde ahí
 let lift=0;if(pinT0>0){const fk=seg(t,pinT0,pinT0+1.05);PP.lerpVectors(pinFrom,pinTo,eio(fk));lift=Math.sin(Math.PI*eio(fk))*1.1;
  if(fk>=1&&waveT0<pinT0){waveT0=t;mapMat.uniforms.uPin.value.copy(uvOf(pinTo.x,pinTo.z));}}else lift=(1-bounce(pd))*3.2;
 pin.position.set(PP.x,PIN.y+lift,PP.z);
 pinShadow.position.set(PP.x,FLOOR+.016,PP.z);pinShadow.material.opacity=.5*pd*(1-clamp(lift/1.6)*.7);pinShadow.scale.setScalar(lerp(1,2.2,clamp(lift/3.2)));
 mapMat.uniforms.uT.value=t>waveT0?(t-waveT0):-1;
 ripples.forEach((m,i)=>{m.position.set(PP.x,FLOOR+.02,PP.z);const on=t>3.4&&lift<.05,k=on?((t-3.4+i*1.2)%2.4)/2.4:0;m.scale.setScalar(1+k*3.4);m.material.opacity=on?.55*(1-k):0;});
 bMat.opacity=bTop.opacity=.95*seg(t,3.3,3.6);
 picks.forEach((o,i)=>{const d=Math.hypot(o.x-PIN.x,o.z-PIN.z);const g=spring(clamp((t-3.35-d*.35)/.6,0,1.8),6,9);sv.set(bW[i],Math.max(.001,bH[i]*g),bW[i]*.75);pv.set(o.x,FLOOR+.01,o.z);m4.compose(pv,q,sv);bldg.setMatrixAt(i,m4);});bldg.instanceMatrix.needsUpdate=true;
 cerroMat.opacity=.55*seg(t,2.6,3.6);
 const talking=still||chatting(t);
 gcard.classList.toggle('on',t>3.8&&!talking);caption.classList.toggle('on',t>3.0);mini.classList.toggle('on',talking&&t>3.4);hero.classList.toggle('lit',t>4.6);
 for(const e of events)if(!e.done&&t>=e.at){e.done=true;e.fn();}
 if(t>4.4&&wordNow===tr("Tu negocio,"))setWord(DEMOS[SLOTS[slot].d].word);
 // Recorrido de demos (se detiene con el cursor encima)
 if(!still&&t>3.0){if(holdHover)slotStart+=dt;
  if(pendingJump>=0){if(pendingJump!==slot)goSlot(pendingJump,t);pendingJump=-1;}else if(t-slotStart>SLOT)goSlot((slot+1)%SLOTS.length,t);}
 // prepara la captura siguiente antes de que haga falta
 if(t-slotStart>2)texFor(SLOTS[(slot+1)%SLOTS.length]);
 if(fadeOn){const k=seg(t,fadeT,fadeT+1.1);fadeOn.uniforms.uMix.value=eio(k);if(k>=1){const u=fadeOn.uniforms;u.tA.value=u.tB.value;u.fA.value=u.fB.value;u.oA.value=0;u.uMix.value=0;if(fadeOn===screenMat)layers.forEach(l=>setScreen(l.material,u.tA.value));fadeOn=null;}}
 [screenMat,phoneMat].forEach(mt=>{if(mt!==fadeOn&&mt.uniforms.tA.value)mt.uniforms.fA.value=mt.uniforms.tA.value.userData.frac;});
 const s=SLOTS[slot],live=s.m==='desk'?screenMat:phoneMat;
 if(DEMOS[s.d].scroll&&!fadeOn&&!still){const f=live.uniforms.fA.value;live.uniforms.oA.value=manual&&t<manual.until?manual.o*(1-f):(1-f)*.6*eio(seg(t-slotStart,1.4,SLOT-.4));}
 layers.forEach(l=>{const u=l.material.uniforms;u.tA.value=screenMat.uniforms.tA.value;u.fA.value=screenMat.uniforms.fA.value;u.oA.value=screenMat.uniforms.oA.value;});
 // Computadora → celular: el cristal se encoge y redondea; la página pasa a una columna
 const mk=eio(seg(t,modeT,modeT+1.1)),m=mode===modeFrom?(mode==='phone'?1:0):(mode==='phone'?mk:1-mk);
 vit.scale.set(lerp(1,PW/W,m),lerp(1,PH/H,m),1);
 const deskA=1-seg(m,.82,1);
 glassMat.opacity=.32*seg(t,.4,1.2)*deskA;barMat.opacity=.55*seg(t,.9,1.4)*(1-seg(m,0,.3));borderMat.opacity=deskA;screenMat.uniforms.uOp.value=deskA;
 // el reflejo cruza el cristal junto con cada cambio de demo
 const sweep=fadeOn===screenMat?eio(seg(t,fadeT,fadeT+1.1)):-1;
 glareMat.uniforms.uK.value=(dark?.24:.12)*deskA*(sweep>=0?2.2:1);glareMat.uniforms.uT.value=sweep>=0?-.6+sweep*2.6:-.6+((t%6)/6)*2.6;
 rimMat.uniforms.uK.value=(dark?.9:.6)*seg(t,.8,1.6)*deskA*(1+.25*Math.sin(t*1.3));
 causticMat.uniforms.uT.value=t;causticMat.uniforms.uK.value=lowQ?0:(dark?.5:.32)*seg(t,1.8,3)*deskA;
 const phoneA=seg(m,.78,1);phone.visible=phoneA>.01;phoneFrameMat.opacity=phoneA;phoneMat.uniforms.uOp.value=phoneA;phone.position.set(0,.02,.0);
 // Capas que se separan al pasar el cursor (solo computadora)
 hover+=(hoverTarget*(mode==='desk'&&m<.01?1:0)-hover)*.12;
 layers.forEach((l,i)=>{l.visible=hover>.01;l.position.z=D/2+.006+hover*[.42,.26,.12][i];l.material.uniforms.uOp.value=hover*deskA;});screenMat.uniforms.uDim.value=hover*1.6;
 // Clic: el cristal se ilumina y se hunde
 const pk=seg(t,pressT,pressT+.18)*(1-seg(t,pressT+.18,.45+pressT));glassMat.emissiveIntensity=pk*.8;vit.position.z=-pk*.18;
 // Luz y noche
 beamMat.uniforms.uK.value=(dark?.16:.09)*seg(t,1.6,3.0);dustMat.opacity=.7*seg(t,2,3);
 // al terminar la vuelta de demos, el polvo forma un instante la montaña de Nordra sobre la vitrina
 const ik=eio(seg(t,isoT0,isoT0+.8)*(1-seg(t,isoT0+2.1,isoT0+2.9)));
 const dpos=dustGeo.attributes.position;for(let i=0;i<DN;i++){let y=dbase[i*3+1]+.002*(.3+ds[i]);if(y>FLOOR+3.8)y=FLOOR;dbase[i*3+1]=y;
  if(ik>0){const mp=mountPts[Math.floor(i/DN*NP)]||rectPts[0],tx=vit.position.x+mp.x*.36,ty=vit.position.y+hh*vit.scale.y+.5+(mp.y+hh)*.36;dpos.setXYZ(i,lerp(dbase[i*3],tx,ik),lerp(y,ty,ik),lerp(dbase[i*3+2],.55,ik));}else dpos.setXYZ(i,dbase[i*3],y,dbase[i*3+2]);}dpos.needsUpdate=true;
 dustMat.opacity=Math.max(dustMat.opacity,ik*.95);dustMat.size=.04+ik*.035;
 if(reflector)reflector.material.uniforms.uK.value=(dark?.55:.35)*seg(t,2,3.2);
 cityMat.opacity=dark?.8*seg(t,.5,2):0;skyMat.opacity=dark?.9*seg(t,.5,2):0;
 // Movimiento de cámara: flotar, inclinarse y girar al bajar
 tilt();const enter=eo(seg(t,0,1.8));
 // En reposo la escena respira: la cámara se mece apenas y la luz principal se desplaza
 const br=seg(t,4.5,6.5);
 camera.position.set(Math.sin(t*.13)*.24*br,.9+Math.sin(t*.17)*.08*br,10.5+Math.sin(t*.11)*.3*br);camera.lookAt(0,-.15,0);camera.updateMatrixWorld();
 key.position.set(3+Math.sin(t*.21)*1.4*br,4+Math.cos(t*.17)*.6*br,6);key.intensity=1.6*(1+.06*Math.sin(t*.5)*br);
 beamMat.uniforms.uK.value*=1+.18*Math.sin(t*.7)*br;
 // al acercarte a «Cotizar mi página», la vitrina se vuelve un poco hacia el botón
 ctaK+=(ctaLook-ctaK)*.06;
 root.rotation.set(-.04+rot.x+Math.sin(t*.6)*.012+ctaK*.03,-.5*(1-enter)-.36+rot.y+Math.sin(t*.4)*.03-scrollP*.6-ctaK*.15,0);
 vitShadow.material.opacity=.32*seg(t,1.2,2.2)*(1-.25*Math.sin(t*.8));vitShadow.scale.set(lerp(1,PW/W*1.5,m),lerp(1,.8,m),1);
 reflMat.opacity=(dark?.08:.05)*deskA*seg(t,2.7,3.4)*(1-hover);
 vit.position.y=Math.sin(t*.8)*.05+(narrow.matches?0:.05);phone.rotation.y=Math.sin(t*.5)*.08;
 if(m>.5&&!isNarrow)place(mini,phone,new THREE.Vector3(-PW/2,PH/2,.1),camera,stage,-290,-30);
 else if(isNarrow)mini.style.transform='translate(14px,14px)';else place(mini,vit,new THREE.Vector3(-W/2,-H/2,.2),camera,stage,-260,-90);
 place(gcard,world,new THREE.Vector3(PP.x,PIN.y+.5+lift,PP.z),camera,stage,26,-40);
 // botón invisible sobre la pantalla para el teclado
 if(t>2.7){const r=mode==='desk'?screenRect(screen,SW,SH,camera,stage):screenRect(phoneScreen,PW-.08,PH-.08,camera,stage),sb=stage.getBoundingClientRect();
  openBtn.style.transform=`translate(${r.left-sb.left}px,${r.top-sb.top}px)`;openBtn.style.width=r.width+'px';openBtn.style.height=r.height+'px';}
 openBtn.classList.toggle('on',t>2.7);stage.classList.toggle('hint',isNarrow&&t>4.2&&t<8.5&&!still);
 followGlow(hero,stage,vit,camera);
}
const openBtn=$('openDemo');if(isNarrow)$('wheelHint').textContent=tr("Desliza de lado para recorrerla");
const now=()=>WARP(clock.now());
function draw(){frame(now());renderer.render(scene,camera);}
// Presupuesto: si tras la entrada el equipo no sostiene 50 cuadros por segundo, se baja la calidad
let lowQ=false,perf={n:0,sum:0,prev:0};
function degrade(fps){if(lowQ)return;lowQ=true;renderer.setPixelRatio(1);if(reflector)reflector.visible=false;dustMat.visible=false;caustic.visible=false;size();console.info('Vitrina: calidad reducida a',fps.toFixed(0),'cps');}
function measure(){const p=performance.now();if(perf.prev&&now()>3.5&&perf.n<90){perf.sum+=p-perf.prev;perf.n++;if(perf.n===90){const fps=1000/(perf.sum/90);window.__vitrinaFps=fps;if(fps<(new URLSearchParams(location.search).has('lento')?999:50))degrade(fps);}}perf.prev=p;}
let raf=0;function loop(){cancelAnimationFrame(raf);draw();measure();if(!clock.paused&&!still)raf=requestAnimationFrame(loop);}
function start(from=0){reset();lastT=WARP(from);perf={n:0,sum:0,prev:0};hero.classList.add('go');stage.classList.add('ready');clock.start(from);hero.classList.remove('hero-paused');cancelAnimationFrame(raf);loop();}

// Cursor: capas, rueda y clic
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
function hit(e){const b=stage.getBoundingClientRect();ndc.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(ndc,camera);return ray.intersectObjects(mode==='desk'?[glass]:phone.children,false).length>0;}
let downAt=null;
stage.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const h=clock.started&&now()>2.7&&hit(e);stage.classList.toggle('hot',h);hoverTarget=h?1:0;holdHover=h;});
stage.addEventListener('pointerleave',()=>{hoverTarget=0;holdHover=false;stage.classList.remove('hot');});
stage.addEventListener('wheel',e=>{const s=SLOTS[slot];if(!stage.classList.contains('hot')||!DEMOS[s.d].scroll||mode!=='desk')return;e.preventDefault();
 const f=screenMat.uniforms.fA.value,cur=manual&&now()<manual.until?manual.o:screenMat.uniforms.oA.value/Math.max(.001,1-f);manual={o:clamp(cur+e.deltaY*.0009),until:now()+3};slotStart=now();},{passive:false});
stage.addEventListener('pointerdown',e=>{downAt={x:e.clientX,y:e.clientY};});
let lastUp=null;
stage.addEventListener('pointerup',e=>{lastUp=downAt&&Math.hypot(e.clientX-downAt.x,e.clientY-downAt.y);if(!downAt||lastUp>8||e.target.closest('button'))return;if(hit(e))openDemo();});
function openDemo(){pressT=now();setTimeout(()=>open(DEMOS[SLOTS[slot].d].href,'_blank','noopener'),300);}
// Teclado: el botón sobre la pantalla abre la demo con Enter; las flechas cambian de ejemplo
function labelBtn(){openBtn.setAttribute('aria-label',english?`Open the ${DEMOS[SLOTS[slot].d].name} demo in a new tab. Use arrow keys to switch examples.`:`Abrir la demo de ${DEMOS[SLOTS[slot].d].name} en una pestaña nueva. Usa las flechas para cambiar de ejemplo.`);}
openBtn.addEventListener('click',e=>{if(swiped){swiped=false;return;}if(e.detail&&lastUp>8&&!isNarrow)return;openDemo();});
openBtn.addEventListener('focus',()=>{if(openBtn.matches(':focus-visible')){hoverTarget=1;holdHover=true;}});
openBtn.addEventListener('blur',()=>{hoverTarget=0;holdHover=false;});
openBtn.addEventListener('keydown',e=>{if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;e.preventDefault();const n=DEMOS.length,d=(SLOTS[slot].d+(e.key==='ArrowRight'?1:n-1))%n;jump(d);setTimeout(labelBtn,60);});

// Al bajar, la vitrina solo gira y se aleja; los ejemplos de abajo conservan sus propias imágenes
addEventListener('scroll',()=>{const p=clamp(scrollY/(hero.offsetHeight*.9));scrollP=p;root.position.z=-p*1.6;renderer.domElement.style.opacity=String(1-p*.5);if(clock.paused||still)draw();},{passive:true});

const cta=document.querySelector('.cta'),miniState=mini.querySelector('header small');
const look=on=>{ctaLook=on?1:0;mini.classList.toggle('writing',on);miniState.textContent=on?tr("escribiendo…"):tr("en línea");};
['pointerenter','focus'].forEach(ev=>cta.addEventListener(ev,()=>look(true)));['pointerleave','blur'].forEach(ev=>cta.addEventListener(ev,()=>look(false)));
// Teléfono: deslizar de lado sobre la pantalla recorre la demo (o cambia de ejemplo si la demo no se recorre)
let sw=null,swiped=false;
openBtn.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;e.stopPropagation();swiped=false;const f=screenMat.uniforms.fA.value,live=mode==='desk'?screenMat:phoneMat,lf=live.uniforms.fA.value;sw={x:e.clientX,o:live.uniforms.oA.value/Math.max(.001,1-lf)};});
openBtn.addEventListener('pointermove',e=>{if(!sw)return;const dx=e.clientX-sw.x;if(Math.abs(dx)>8)swiped=true;const s=SLOTS[slot];
 if(DEMOS[s.d].scroll){manual={o:clamp(sw.o-dx*.0035),until:now()+3};slotStart=now();}});
openBtn.addEventListener('pointerup',e=>{if(!sw)return;const dx=e.clientX-sw.x,s=SLOTS[slot];if(!DEMOS[s.d].scroll&&Math.abs(dx)>50){const n=DEMOS.length;jump((s.d+(dx<0?1:n-1))%n);}sw=null;});
openBtn.addEventListener('pointercancel',()=>{sw=null;});
$('pause').onclick=e=>{const p=clock.toggle();hero.classList.toggle('hero-paused',p);e.currentTarget.setAttribute('aria-pressed',String(p));e.currentTarget.querySelector('span').textContent=p?tr("Reanudar movimiento"):tr("Pausar movimiento");if(!p)loop();};

size();
document.fonts.ready.then(()=>{
 if(still){reset();hero.classList.add('go');stage.classList.add('ready');clock.start();events.slice(0,4).forEach(e=>{e.done=true;e.fn();});setTimeout(()=>{msgsEl.querySelectorAll('.msg').forEach(m=>m.classList.add('on','sent'));draw();},400);draw();return;}
 if(isNarrow){
  // Teléfono: primero una imagen quieta idéntica al primer cuadro; al llegar, la entrada corta
  reset();clock.offset=1.72;stage.classList.add('ready');hero.classList.add('go');draw();
  const io=new IntersectionObserver(es=>{if(es[0].isIntersecting){io.disconnect();start(1.72);}},{threshold:.4});io.observe(stage);}
 else start(repeat?1.2:0);
});
let backgroundPaused=false;
function syncVisibility(){const hidden=document.hidden||document.body.classList.contains('has-page-frame')||window.frameElement?.getAttribute('aria-hidden')==='true';if(hidden&&!clock.paused){backgroundPaused=true;clock.toggle();cancelAnimationFrame(raf);}else if(!hidden&&backgroundPaused){backgroundPaused=false;if(clock.paused)clock.toggle();loop();}}
document.addEventListener('visibilitychange',syncVisibility);
new MutationObserver(syncVisibility).observe(document.body,{attributes:true,attributeFilter:['class']});


matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches&&!clock.paused){clock.toggle();cancelAnimationFrame(raf);hero.classList.add('hero-still');}});
