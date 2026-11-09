import { tr, english } from './locale.js';
import { THREE, clamp, seg, eio, lerp, spring, seenBefore, stillMode, createStage, place, toStage, screenRect, createClock, tiltControls, followGlow, canvasTexture, tallTexture } from './shared.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const $=id=>document.getElementById(id);
const hero=$('hero'),stage=$('stage'),chip=$('chip'),tryLink=$('try');
const still=stillMode(),repeat=seenBefore('nordra-sobre');
const isNarrow=matchMedia('(max-width:860px)').matches;

const OCC={
 bodas:{paper:0xf1e7d4,lining:'#d9c39b',lineA:'#b8955a',seal:0xa8803e,sealCss:'#b08a4a',sealMetal:.28,frame:0xf0e6d4,frameMetal:.6,confetti:'petal',colors:[0xf7d4d8,0xf2c2c8,0xfbe6e3,0xead2b4],screen:'/nordra/v550/assets/wedding-live-cover.webp',flip:'/nordra/v550/assets/apertura-bodas',frames:89,tall:'/nordra/v550/assets/larga-bodas.jpg',kicker:tr("NOS CASAMOS"),name:tr("Valentina & Sebastián"),date:tr("19 de junio de 2027"),iso:'2027-06-19',ink:'#3f2f24',gold:'#76511c',cardBg:'#fbf6ec',font:'italic 400 92px "Cormorant Garamond"',href:'https://nordrastudio.mx/invitaciones/valentina-y-sebastian/',ribbon:true,key:[0xffc98a,2.1,[-6,2.6,4]],rsvp:[['AN','Ana',2,'#c08a5a'],['LU','Luis',3,'#7a8b6e'],['FG',tr("Familia Garza"),4,'#9a6f8c'],['CA','Carmen',1,'#b07a52']]},
 cumple:{paper:0x2b1f40,lining:'#24183a',lineA:'#ff4fae',lineB:'#5ee7ff',seal:0xff3fa4,sealCss:'#ff3fa4',sealMetal:.08,frame:0x1b1a22,frameMetal:.7,confetti:'rect',colors:[0xff4fae,0x5ee7ff,0xffd166,0xb388ff],screen:'/nordra/v550/assets/camila-portada-780.webp',flip:'/nordra/v550/assets/apertura-cumple',frames:81,tall:'/nordra/v550/assets/larga-cumple.jpg',kicker:tr("MIS 30"),name:'Camila',date:tr("30 años"),ink:'#ffe3f4',gold:'#ff5fb8',cardBg:'#24183a',font:'500 104px Sora',href:'https://nordrastudio.mx/invitaciones/camila-30/',ribbon:false,key:[0xffd2ee,1.3,[-5,3,4]],rsvp:[['DA','Dani',2,'#ff4fae'],['SL','Sofi y Leo',2,'#5ec8e7'],['MA','Mau',1,'#c79bff'],['RE','Regina',3,'#ffb84f']]},
 eventos:{paper:0x2a333d,lining:'#bfc8d1',lineA:'#8e9aa6',seal:0xa7b2bd,sealCss:'#8e9aa6',sealMetal:.55,frame:0xc9cfd6,frameMetal:.9,confetti:'glitter',colors:[0xdfe7ef,0xb9c4ce,0xffffff],screen:'/nordra/v550/assets/conexion-27.webp',flip:'/nordra/v550/assets/apertura-eventos',frames:86,tall:'/nordra/v550/assets/larga-eventos.jpg',kicker:(english?"ANNUAL GATHERING":"ENCUENTRO ANUAL"),name:'Conexión 27',date:(english?"June 12, 2027":"12 de junio de 2027"),iso:'2027-06-12',ink:'#e9eef3',gold:'#c3ccd5',cardBg:'#1f2831',font:'500 96px Sora',href:'https://nordrastudio.mx/invitaciones/conexion-27/',ribbon:false,key:[0xd6e8ff,2.0,[6,4,3]],rsvp:[['MA','Mariana',1,'#5a7fa8'],['EN','Equipo Norte',6,'#3f6b6b'],['DI','Diego',1,'#7a6fa8'],['LU','Lucía',2,'#8a6a52']]}};
let occ=new URLSearchParams(location.search).get('occ');if(!OCC[occ])occ='bodas';
const cur=()=>OCC[occ];

const {renderer,scene,camera}=createStage(stage,{camPos:[0,2.8,9.6],lookAt:[0,-.15,0]});
const key=new THREE.DirectionalLight(0xffc98a,2.1);key.position.set(-6,2.6,4);scene.add(key);
const fill=new THREE.HemisphereLight(0xfff4e8,0x6a4d78,.7);scene.add(fill);
const candles=[new THREE.PointLight(0xffb36b,0,6,2),new THREE.PointLight(0xffc98a,0,6,2)];candles[0].position.set(-1.6,.6,2.2);candles[1].position.set(1.8,.9,2);candles.forEach(l=>scene.add(l));
const party=[0xff4fae,0x5ee7ff,0xffd166].map(c=>{const l=new THREE.PointLight(c,0,7,2);scene.add(l);return l;});
const root=new THREE.Group();scene.add(root);
const TABLE=-1.15;

// Sobre con volumen, en tres cuartos sobre la mesa
const EW=2.5,EH=1.66,FH=EH*.6;
const holder=new THREE.Group();holder.rotation.y=.32;root.add(holder);
const env=new THREE.Group();holder.add(env);
const fiberCanvas=document.createElement('canvas');fiberCanvas.width=fiberCanvas.height=512;
const fiberTex=new THREE.CanvasTexture(fiberCanvas);fiberTex.wrapS=fiberTex.wrapT=THREE.RepeatWrapping;fiberTex.repeat.set(2,2);
(()=>{const g=fiberCanvas.getContext('2d');g.fillStyle='#808080';g.fillRect(0,0,512,512);for(let i=0;i<5000;i++){const x=Math.random()*512,y=Math.random()*512,a=Math.random()*Math.PI,l=4+Math.random()*14;g.strokeStyle=`rgba(${Math.random()<.5?255:0},${Math.random()<.5?255:0},${Math.random()<.5?255:0},.12)`;g.lineWidth=.8;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();}fiberTex.needsUpdate=true;})();
const paperMat=new THREE.MeshStandardMaterial({color:0xf1e7d4,roughness:.9,bumpMap:fiberTex,bumpScale:1.4,transparent:true});
const liningCanvas=document.createElement('canvas');liningCanvas.width=liningCanvas.height=512;
const liningTex=new THREE.CanvasTexture(liningCanvas);liningTex.colorSpace=THREE.SRGBColorSpace;
const liningMat=new THREE.MeshStandardMaterial({map:liningTex,roughness:.7,metalness:.15,transparent:true});
function drawLining(){const o=cur(),g=liningCanvas.getContext('2d');g.fillStyle=o.lining;g.fillRect(0,0,512,512);
 if(occ==='bodas'){g.strokeStyle=o.lineA;g.lineWidth=2;for(let i=-512;i<1024;i+=48){g.beginPath();g.moveTo(i,0);g.lineTo(i+512,512);g.stroke();g.beginPath();g.moveTo(i+512,0);g.lineTo(i,512);g.stroke();}g.fillStyle=o.lineA;for(let y=0;y<=512;y+=48)for(let x=0;x<=512;x+=48){g.beginPath();g.arc(x+24,y,3.2,0,7);g.fill();}}
 else if(occ==='cumple'){g.lineWidth=2;for(let i=0;i<=512;i+=40){g.strokeStyle=i%80?o.lineB:o.lineA;g.globalAlpha=.75;g.beginPath();g.moveTo(i,0);g.lineTo(i,512);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(512,i);g.stroke();}g.globalAlpha=1;}
 else{g.fillStyle=o.lineA;for(let y=0;y<512;y+=64)for(let x=0;x<512;x+=64){g.beginPath();g.moveTo(x,y+64);g.lineTo(x+32,y+8);g.lineTo(x+64,y+64);g.closePath();g.globalAlpha=((x+y)/64)%2?.35:.6;g.fill();}g.globalAlpha=1;}
 liningTex.needsUpdate=true;}
const back=new THREE.Mesh(new THREE.BoxGeometry(EW,EH,.03),[paperMat,paperMat,paperMat,paperMat,liningMat,paperMat]);back.position.z=-.015;env.add(back);
const pocketShape=new THREE.Shape();pocketShape.moveTo(-EW/2,-EH/2);pocketShape.lineTo(EW/2,-EH/2);pocketShape.lineTo(EW/2,EH/2);pocketShape.lineTo(0,-.02);pocketShape.lineTo(-EW/2,EH/2);pocketShape.closePath();
const pocket=new THREE.Mesh(new THREE.ExtrudeGeometry(pocketShape,{depth:.012,bevelEnabled:true,bevelThickness:.004,bevelSize:.006,bevelSegments:2}),paperMat);pocket.position.z=.035;env.add(pocket);
// Destinatario escrito a mano y estampilla con matasellos
const addrCanvas=document.createElement('canvas');addrCanvas.width=1024;addrCanvas.height=512;
const stampCanvas=document.createElement('canvas');stampCanvas.width=512;stampCanvas.height=400;
const addrTex=new THREE.CanvasTexture(addrCanvas),stampTex=new THREE.CanvasTexture(stampCanvas);addrTex.colorSpace=stampTex.colorSpace=THREE.SRGBColorSpace;addrTex.anisotropy=stampTex.anisotropy=8;
const addrMat=new THREE.MeshStandardMaterial({map:addrTex,transparent:true,roughness:.9,depthWrite:false}),stampMat=new THREE.MeshStandardMaterial({map:stampTex,transparent:true,roughness:.85,depthWrite:false});
const addr=new THREE.Mesh(new THREE.PlaneGeometry(1.15,.575),addrMat);addr.position.set(-.5,-.47,.057);env.add(addr);
const stamp=new THREE.Mesh(new THREE.PlaneGeometry(.6,.47),stampMat);stamp.position.set(.85,.2,.057);stamp.rotation.z=.05;env.add(stamp);addr.renderOrder=stamp.renderOrder=3;
// Solapa que se curva como papel al abrirse; lleva el sello pegado en la punta
const FX=22,FY=16,flapGeo=new THREE.PlaneGeometry(EW,FH,FX,FY);
const flapAlpha=canvasTexture(512,512,(g)=>{g.fillStyle='#000';g.fillRect(0,0,512,512);g.fillStyle='#fff';g.beginPath();g.moveTo(0,0);g.lineTo(512,0);g.lineTo(272,496);g.quadraticCurveTo(256,516,240,496);g.closePath();g.fill();});flapAlpha.colorSpace=THREE.NoColorSpace;
const flapFront=new THREE.MeshStandardMaterial({color:0xf1e7d4,roughness:.9,bumpMap:fiberTex,bumpScale:1.4,alphaMap:flapAlpha,alphaTest:.5,side:THREE.FrontSide,transparent:true});
const flapBack=new THREE.MeshStandardMaterial({map:liningTex,roughness:.7,alphaMap:flapAlpha,alphaTest:.5,side:THREE.BackSide,transparent:true});
const flapPivot=new THREE.Group();flapPivot.position.set(0,EH/2,.05);env.add(flapPivot);
flapPivot.add(new THREE.Mesh(flapGeo,flapFront),new THREE.Mesh(flapGeo,flapBack));
const flapBase=flapGeo.attributes.position.array.slice();
const SEAL_ROW=(FH-.08)/(FH/FY);let flapNow=-1;
function bendFlap(open){if(open===flapNow)return;flapNow=open;const p=flapGeo.attributes.position,A=open*Math.PI*1.02,bend=1.1*Math.sin(A),step=FH/FY;
 const rowY=[],rowZ=[];let y=0,z=0;for(let j=0;j<=FY;j++){rowY.push(y);rowZ.push(z);const th=A+bend*(j/FY);y-=step*Math.cos(th);z+=step*Math.sin(th);}
 for(let i=0;i<p.count;i++){const j=Math.round((FH/2-flapBase[i*3+1])/step);p.setXYZ(i,flapBase[i*3],rowY[j],rowZ[j]+.002*j/FY);}
 p.needsUpdate=true;flapGeo.computeVertexNormals();
 // abierta, la bisagra queda detrás de la tarjeta para que esta salga por delante del forro
 flapPivot.position.z=lerp(.05,-.02,seg(open,.55,1));
 const j0=Math.floor(SEAL_ROW),f=SEAL_ROW-j0,th=A+bend*(SEAL_ROW/FY);
 sealG.position.set(0,lerp(rowY[j0],rowY[j0+1],f)+Math.sin(th)*.006,lerp(rowZ[j0],rowZ[j0+1],f)+Math.cos(th)*.006);sealG.rotation.x=-th;sealG.visible=open<.45;}
const shadowTex=canvasTexture(128,128,(g)=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(40,20,10,.6)');r.addColorStop(1,'rgba(40,20,10,0)');g.fillStyle=r;g.fillRect(0,0,128,128);});
const envShadow=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.4),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false,opacity:0}));envShadow.rotation.x=-Math.PI/2;envShadow.position.set(0,TABLE+.01,.25);root.add(envShadow);

// Listón de satén (Bodas) que se desata antes del sello
const satin=new THREE.MeshPhysicalMaterial({color:0xefe3cc,roughness:.35,metalness:.1,sheen:1,sheenColor:new THREE.Color(0xfff6e6),sheenRoughness:.3,clearcoat:.4,transparent:true});
const ribbon=new THREE.Group();env.add(ribbon);
const strip=new THREE.Mesh(new THREE.BoxGeometry(.2,EH+.04,.06),satin);strip.position.z=.02;ribbon.add(strip);
const bowLoop=(s)=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(s*.25,.16,.06),new THREE.Vector3(s*.45,.05,.08),new THREE.Vector3(s*.42,-.12,.06),new THREE.Vector3(s*.2,-.08,.04),new THREE.Vector3(0,0,0)],true),48,.035,8,true);
const bow=new THREE.Group();bow.add(new THREE.Mesh(bowLoop(1),satin),new THREE.Mesh(bowLoop(-1),satin),new THREE.Mesh(new THREE.SphereGeometry(.06,16,12),satin));
const tail=(s)=>new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,.02),new THREE.Vector3(s*.12,-.25,.04),new THREE.Vector3(s*.2,-.5,.03)]),24,.03,6,false),satin);
bow.add(tail(1),tail(-1));
const SEAL=new THREE.Vector3(0,EH/2-FH+.08,.1);
bow.position.set(0,SEAL.y,.12);ribbon.add(bow);

// Sello de lacre con el isotipo: no se rompe, sube con la solapa
const sealCanvas=document.createElement('canvas');sealCanvas.width=sealCanvas.height=512;
const sealBump=new THREE.CanvasTexture(sealCanvas);
// Lacre de verdad: cera derramada con borde irregular y un anillo donde apoyó el sello
const sealTop=new THREE.MeshPhysicalMaterial({color:0xa8803e,roughness:.34,metalness:.28,clearcoat:1,clearcoatRoughness:.22,sheen:.6,sheenRoughness:.5,sheenColor:new THREE.Color(0xffe6c0),bumpMap:sealBump,bumpScale:7,transparent:true});
const PROF=[[0,.062],[.12,.06],[.17,.057],[.2,.052],[.218,.058],[.234,.056],[.252,.044],[.27,.027],[.283,.012],[.29,.003],[.291,0]];
const wob=a=>1+.07*Math.sin(a*5+.4)+.04*Math.sin(a*11+1)+.022*Math.sin(a*23+2);
const sealG=new THREE.Group();flapPivot.add(sealG);
[0,1].forEach(i=>{const g=new THREE.LatheGeometry([...PROF].reverse().map(([r,y])=>new THREE.Vector2(r,y)),64,i*Math.PI,Math.PI);
 const p=g.attributes.position,uv=g.attributes.uv;
 for(let k=0;k<p.count;k++){const x=p.getX(k),z=p.getZ(k),rr=Math.hypot(x,z),a=Math.atan2(z,x),w=rr>.16?1+(wob(a)-1)*Math.min(1,(rr-.16)/.1):1;p.setX(k,x*w);p.setZ(k,z*w);uv.setXY(k,x/.62+.5,-z/.62+.5);}
 g.computeVertexNormals();
 const m=new THREE.Mesh(g,sealTop);m.rotation.x=Math.PI/2;sealG.add(m);});
bendFlap(0);
let isoPath=null;
fetch('/nordra/v550/assets/isotipo.svg').then(r=>r.text()).then(s=>{const m=s.match(/id="montana"[^>]*d="([^"]+)"/)||s.match(/d="([^"]+)"/);if(m)isoPath=new Path2D(m[1]);drawSeal();draw();});
// Grabado del sello: las iniciales de quien celebra (cambian al escribir) y el isotipo pequeño
function initials(){const n=OCC[occ].name.trim();if(occ==='eventos'){const d=n.match(/\d+/);return d?d[0]:n[0]?.toUpperCase()||'';}
 const parts=n.split(/\s*(?:&|\by\b)\s*/i).filter(Boolean);return parts.length>1?parts.slice(0,2).map(p=>p[0].toUpperCase()).join('·'):(n[0]||'').toUpperCase();}
function drawSeal(){const g=sealCanvas.getContext('2d');g.filter='none';g.fillStyle='#000';g.fillRect(0,0,512,512);
 g.strokeStyle='#8a8a8a';g.lineWidth=10;g.beginPath();g.arc(256,256,196,0,Math.PI*2);g.stroke();
 g.fillStyle='#777';for(let i=0;i<36;i++){const a=i/36*Math.PI*2;g.beginPath();g.arc(256+Math.cos(a)*172,256+Math.sin(a)*172,4,0,7);g.fill();}
 g.save();g.filter='blur(1.2px)';g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';const ini=initials();
 g.font=(occ==='bodas'?'italic 400 ':'600 ')+(ini.length>2?118:150)+'px '+(occ==='bodas'?'"Cormorant Garamond"':'Sora');g.fillText(ini,256,276);g.restore();
 if(isoPath){g.save();g.filter='blur(1px)';g.translate(256-46,128);g.scale(92/937,92/937);g.fillStyle='#ddd';g.fill(isoPath);g.restore();}sealBump.needsUpdate=true;}

const MAXANI=renderer.capabilities.getMaxAnisotropy();
// Un solo objeto: la tarjeta con la portada de la invitación sale del sobre y su canto crece hasta ser el teléfono
const PW=1.2,PH=2.46;
const CARD_S=.68,frameMat=new THREE.MeshPhysicalMaterial({color:0xf0e6d4,metalness:.6,roughness:.25,clearcoat:1,clearcoatRoughness:.1});
const phone=new THREE.Group();root.add(phone);
const body=new THREE.Mesh(new RoundedBoxGeometry(PW,PH,.11,6,.17),frameMat);phone.add(body);
const loader=new THREE.TextureLoader();
const covers={},vids={},firsts={},talls={};
// La apertura real es un video corto a 30 cuadros por segundo (780×1688, menos de 1.1 MB),
// con su primer cuadro como imagen mientras carga
function ensure(k){if(!covers[k]){const t=loader.load(OCC[k].screen,()=>draw());t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=MAXANI;covers[k]=t;}
 if(!vids[k]&&!still){const v=document.createElement('video');v.dataset.src=OCC[k].flip+'.mp4';v.muted=true;v.playsInline=true;v.setAttribute('playsinline','');v.preload='none';v.crossOrigin='anonymous';
  const vt=new THREE.VideoTexture(v);vt.colorSpace=THREE.SRGBColorSpace;vt.userData.video=v;vids[k]=vt;
  const f=loader.load(OCC[k].flip+'-0.jpg');f.colorSpace=THREE.SRGBColorSpace;firsts[k]=f;}
 if(!talls[k])talls[k]=tallTexture(OCC[k].tall,t=>{t.userData.frac=((PH-.1)/(PW-.1))*t.userData.ratio;t.repeat.set(1,Math.min(1,t.userData.frac));});}
// el video solo se descarga cuando el sobre empieza a abrirse (o al elegir la ocasión)
function prime(k){const v=vids[k]?.userData.video;if(v&&!v.getAttribute('src')){v.src=v.dataset.src;v.preload='auto';v.load();}}
function playOpening(k){prime(k);const v=vids[k]?.userData.video;if(!v)return;try{v.currentTime=0;}catch{}const p=v.play();p?.catch?.(()=>{});}
const screenMat=new THREE.MeshBasicMaterial({map:null,toneMapped:false});
const scr=new THREE.Mesh(new THREE.PlaneGeometry(PW-.1,PH-.1),screenMat);scr.position.z=.056;phone.add(scr);
const pGlareMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uT:{value:0},uK:{value:.35}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float uT,uK;varying vec2 vUv;void main(){float d=vUv.x+vUv.y*.5-uT;gl_FragColor=vec4(vec3(1.),exp(-d*d*90.)*uK);}'});
const pGlare=new THREE.Mesh(new THREE.PlaneGeometry(PW-.1,PH-.1),pGlareMat);pGlare.position.z=.058;phone.add(pGlare);

// Confeti propio de cada ocasión: pocas piezas que caen desde arriba cuando la invitación ya llegó
const CN=isNarrow?24:48;
const shapes={petal:canvasTexture(64,64,(g)=>{const r=g.createRadialGradient(32,40,2,32,34,30);r.addColorStop(0,'#fff');r.addColorStop(1,'#e9d6d6');g.fillStyle=r;g.beginPath();g.moveTo(32,60);g.bezierCurveTo(6,48,4,14,24,5);g.quadraticCurveTo(32,12,40,5);g.bezierCurveTo(60,14,58,48,32,60);g.fill();}),rect:canvasTexture(64,64,(g)=>{g.fillStyle='#fff';g.fillRect(18,8,28,48);}),glitter:canvasTexture(64,64,(g)=>{g.fillStyle='#fff';g.fillRect(16,16,32,32);})};
// Pétalos y tiras curvas (no planas), con brillo suave; al caer se posan con una inclinación y su sombra
const confMat=new THREE.MeshPhysicalMaterial({map:shapes.petal,alphaTest:.5,side:THREE.DoubleSide,roughness:.5,metalness:0,sheen:0,sheenRoughness:.45,sheenColor:new THREE.Color(0xffffff),emissive:0xffffff,emissiveIntensity:0});
const curled=(()=>{const g=new THREE.PlaneGeometry(.12,.12,6,6),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i)/.06,y=p.getY(i)/.06;p.setZ(i,(x*x*.022+y*y*.008));}g.computeVertexNormals();return g;})();
const flatG=new THREE.PlaneGeometry(.09,.09);
const conf=new THREE.InstancedMesh(curled,confMat,CN);conf.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(CN*3),3);root.add(conf);

const cv=[],cs=[];for(let i=0;i<CN;i++){cv.push(new THREE.Vector3((Math.random()-.5)*6.4,3.2+Math.random()*1.4,-1+Math.random()*2.8));cs.push({r:new THREE.Euler(Math.random()*6,Math.random()*6,Math.random()*6),w:new THREE.Vector3(Math.random()*4-2,Math.random()*4-2,Math.random()*4-2),ph:Math.random()*6,tilt:(Math.random()-.5)*1.3,spin:Math.random()*6.28,delay:Math.random()*1.1,speed:1.5+Math.random()*.8});}
function paintConfetti(){const o=OCC[occ],gl=o.confetti==='glitter';confMat.map=shapes[o.confetti];confMat.metalness=gl?.9:0;confMat.roughness=gl?.2:.55;confMat.sheen=o.confetti==='petal'?1:0;
 confMat.emissiveIntensity=dark&&!gl?.12:0;conf.geometry=gl?flatG:curled;confMat.needsUpdate=true;
 const c=new THREE.Color();for(let i=0;i<CN;i++){c.set(o.colors[i%o.colors.length]);conf.setColorAt(i,c);}conf.instanceColor.needsUpdate=true;}
const m4=new THREE.Matrix4(),qq=new THREE.Quaternion(),vv=new THREE.Vector3(),ss=new THREE.Vector3();

let dark=false;
function applyOcc(){const o=cur(),dk=dark?.55:1;ensure(occ);
 paperMat.color.set(o.paper).multiplyScalar(dk);flapFront.color.set(o.paper).multiplyScalar(dk*.94);liningMat.color.setScalar(dark?.7:1);flapBack.color.setScalar(dark?.7:1);
 sealTop.color.set(o.seal);sealTop.emissive.set(occ==='cumple'?0x5a0b38:0);sealTop.metalness=o.sealMetal;drawSeal();
 tryLink.href=o.href;hero.style.setProperty('--seal',o.sealCss);hero.dataset.occ=occ;
 document.documentElement.style.setProperty('--seal',o.sealCss);
 ribbon.visible=o.ribbon;drawLining();paintConfetti();drawDecals();}
function drawDecals(){const o=cur(),darkPaper=new THREE.Color(o.paper).getHSL({}).l<.4,ink=darkPaper?'#efe6f5':'#4a3a2c';
 {const g=addrCanvas.getContext('2d'),w=1024,h=512;g.clearRect(0,0,w,h);g.fillStyle=ink;g.globalAlpha=.75;g.font='600 30px Manrope';g.letterSpacing='8px';g.fillText(tr("PARA"),60,150);g.letterSpacing='0px';g.globalAlpha=1;
  g.font='italic 400 104px "Cormorant Garamond"';g.fillText(tr("Familia Garza"),60,270);g.font='italic 400 58px "Cormorant Garamond"';g.globalAlpha=.8;g.fillText('Monterrey, N. L.',60,360);
  g.strokeStyle=ink;g.globalAlpha=.25;g.lineWidth=2;[290,380].forEach(y=>{g.beginPath();g.moveTo(60,y);g.lineTo(820,y);g.stroke();});addrTex.needsUpdate=true;}
 {const g=stampCanvas.getContext('2d'),w=512,h=400;g.clearRect(0,0,w,h);const sx=200,sy=40,sw=270,sh=320;
  g.fillStyle='#fbf8f2';g.fillRect(sx,sy,sw,sh);g.globalCompositeOperation='destination-out';for(let x=sx;x<=sx+sw;x+=18){g.beginPath();g.arc(x,sy,7,0,7);g.arc(x,sy+sh,7,0,7);g.fill();}for(let y=sy;y<=sy+sh;y+=18){g.beginPath();g.arc(sx,y,7,0,7);g.arc(sx+sw,y,7,0,7);g.fill();}g.globalCompositeOperation='source-over';
  const gr=g.createLinearGradient(0,sy+20,0,sy+sh-20);gr.addColorStop(0,o.sealCss);gr.addColorStop(1,new THREE.Color(o.sealCss).multiplyScalar(.6).getStyle());g.fillStyle=gr;g.fillRect(sx+20,sy+20,sw-40,sh-40);
  g.strokeStyle='#fff';g.fillStyle='#fff';g.lineWidth=9;g.textAlign='center';
  if(occ==='bodas'){g.beginPath();g.arc(sx+sw/2-26,sy+150,46,0,7);g.stroke();g.beginPath();g.arc(sx+sw/2+26,sy+150,46,0,7);g.stroke();}
  else{g.font='700 120px Sora';g.fillText(occ==='cumple'?'30':'27',sx+sw/2,sy+195);}
  g.font='600 22px Manrope';g.fillText(tr("MÉXICO"),sx+sw/2,sy+sh-44);
  // matasellos que pisa la estampilla
  const d=(o.iso||'2027-06-19').split('-'),mes=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'][(+d[1]||6)-1];
  g.strokeStyle='rgba(40,30,40,.55)';g.fillStyle='rgba(40,30,40,.6)';g.lineWidth=5;g.beginPath();g.arc(190,170,92,0,7);g.stroke();g.lineWidth=2;g.beginPath();g.arc(190,170,74,0,7);g.stroke();
  g.font='700 24px Manrope';g.fillText('MONTERREY',190,150);g.font='700 30px Manrope';g.fillText(`${+d[2]||19} ${mes} ${d[0]||2027}`,190,190);g.lineWidth=4;
  for(let k=0;k<4;k++){g.beginPath();for(let x=0;x<110;x+=4)g.lineTo(x,120+k*28+Math.sin(x/9)*6);g.stroke();}stampTex.needsUpdate=true;}}
function setTheme(d){dark=d;fill.intensity=d?.35:.7;renderer.toneMappingExposure=d?1.12:1.05;if(ready)applyOcc();}
let ready=false;
setTheme(document.body.classList.contains('dark'));
addEventListener('nordra-theme',()=>{setTheme(document.body.classList.contains('dark'));draw();});

function size(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 root.scale.setScalar(isNarrow?Math.min(1.12,w/348):1.5);root.position.set(0,isNarrow?-.1:-.72,0);draw();}
addEventListener('resize',size);

// Confirmaciones: iniciales que llegan desde los bordes al teléfono
let events=[],rsvpI=0;
function confirm(at){events.push({at,fn:()=>{const o=OCC[occ],[ini,n,p,col]=o.rsvp[rsvpI++%4];const a=document.createElement('div');a.className='ava';a.textContent=ini;a.style.background=col;stage.append(a);
 const W=stage.clientWidth,H=stage.clientHeight,side=rsvpI%4,from=side===0?[-40,H*.3]:side===1?[W+10,H*.25]:side===2?[W*.2,H+10]:[W+10,H*.75];
 const to=toStage(phone,new THREE.Vector3(0,.2,.06),camera,stage);
 a.animate([{transform:`translate(${from[0]}px,${from[1]}px) scale(1)`,opacity:0},{opacity:1,offset:.2},{transform:`translate(${to.x-17}px,${to.y-17}px) scale(.5)`,opacity:0}],{duration:still?0:1100,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'}).onfinish=()=>a.remove();
 setTimeout(()=>{$('chipName').textContent=n+(n.includes(' y ')||n.startsWith('Familia')||n.startsWith('Equipo')?tr(" confirmaron"):tr(" confirmó"));$('chipPeople').textContent='· '+p+(p>1?tr(" personas"):tr(" persona"));notifT.textContent=$('chipName').textContent;notifS.textContent=p+(p>1?tr(" personas"):tr(" persona"))+tr(" · Panel de invitados");notif.classList.add('on');buzzT=T();
  },still?0:1050);}},
 {at:at+2.4,always:true,fn:()=>notif.classList.remove('on')});}

const rot={x:0,y:0,tx:0,ty:0};const tilt=tiltControls(hero,stage,rot,{x:.18,y:.55,drag:200,max:.8});
const clock=createClock({still,finalTime:14,speed:repeat?1.6:1});
const tmpV=new THREE.Vector3(),tmpE=new THREE.Euler(),tmpC=new THREE.Color(),cardQ=new THREE.Quaternion(),finalQ=new THREE.Quaternion();
const notif=$('notif'),notifT=$('notifT'),notifS=$('notifS'),under=$('under');
// Si bajas antes de que termine, lo que falta pasa a cuádruple velocidad, sin cortes
let buzzT=-9,rushShift=0,rushing=false,lastFrame=0;
const T=()=>clock.now()+rushShift;
const LAND=2.1,landT=()=>.6+R+LAND;
function advance(){const now=performance.now(),dt=Math.min(.1,(now-lastFrame)/1000);lastFrame=now;if(rushing&&!clock.paused){if(T()<landT())rushShift+=dt*3;else rushing=false;}return T();}
let R=0,flipT=-9,flipSwap=false,wakeAt=0,scrollTilt=0,landedNow=false;

function reset(){events=[];rsvpI=0;chip.classList.remove('on');stage.querySelectorAll('.ava').forEach(a=>a.remove());
 R=OCC[occ].ribbon?.45:0;for(let k=0;k<14;k++)confirm(3.8+R+k*2.8);flipT=-9;flipSwap=true;notif.classList.remove('on');}

function frame(t){
 const o=OCC[occ],c0=.6+R,EXIT=3.6;
 // 0–0.6 s el sobre llega a la mesa y se asienta; cuando la tarjeta ya salió, baja y deja el cuadro
 const land=spring(clamp(t/.6,0,1.8),7,9),away=eio(seg(t,c0+1.05,c0+1.85));
 holder.position.set(0,TABLE+.05+(1-land)*1.6-away*.2,.3+away*EXIT);env.rotation.set(-Math.PI/2+.42,0,-.06);env.visible=away<.995;
 envShadow.position.z=.25+away*EXIT;envShadow.material.opacity=.55*clamp(land)*(1-away);envShadow.scale.setScalar(lerp(1.6,1,clamp(land)));
 // el listón (Bodas) se desata
 const un=eio(seg(t,.55,1));bow.scale.setScalar(1-un);bow.rotation.z=un*2.4;strip.position.x=un*2.2;satin.opacity=1-seg(t,.8,1);ribbon.visible=o.ribbon&&satin.opacity>.01;
 // la solapa se curva al abrirse, deja ver el forro y se lleva el sello
 bendFlap(eio(seg(t,c0,c0+.7)));
 root.updateMatrixWorld(true);
 // la tarjeta sube desde el bolsillo, avanza hacia la cámara y su canto crece hasta ser el teléfono
 const slide=eio(seg(t,c0+.3,c0+1.2)),lift=eio(seg(t,c0+.75,c0+1.85)),m=eio(seg(t,c0+1.25,c0+2));
 landedNow=t>=c0+LAND;tilt();phone.visible=t>c0+.2;
 tmpV.set(0,-.02+slide*1.35,.016);env.localToWorld(tmpV);root.worldToLocal(tmpV);env.getWorldQuaternion(cardQ);
 phone.position.set(lerp(tmpV.x,0,lift),lerp(tmpV.y,.55+Math.sin(t*.9)*.04*lift,lift),lerp(tmpV.z,1.25,lift));
 phone.scale.setScalar(lerp(CARD_S,isNarrow?1.32:1.12,lift));
 const fl=seg(t,flipT,flipT+.9),bz=t>buzzT&&t<buzzT+.4?Math.sin((t-buzzT)*70)*.03*(1-seg(t,buzzT,buzzT+.4)):0;
 tmpE.set(-.12+rot.x+scrollTilt*.24,rot.y+Math.sin(t*.5)*.05*lift+eio(fl)*Math.PI*2*(fl<1?1:0),bz,'XYZ');finalQ.setFromEuler(tmpE);phone.quaternion.copy(cardQ).slerp(finalQ,lift);
 body.scale.set(lerp((PW-.1)/PW,1,m),lerp((PH-.1)/PH,1,m),lerp(.12,1,m));scr.position.z=lerp(.0075,.056,m);pGlare.position.z=scr.position.z+.002;
 frameMat.color.set(o.cardBg).lerp(tmpC.set(o.frame),m);frameMat.metalness=o.frameMetal*m;frameMat.roughness=lerp(.9,.25,m);frameMat.clearcoat=m;
 // pocas piezas caen desde arriba y salen por abajo
 const ct=t-(c0+1.7);conf.visible=ct>0&&ct<7;
 if(conf.visible){for(let i=0;i<CN;i++){const v=cv[i],cc=cs[i],tt=Math.max(0,ct-cc.delay);vv.set(v.x+Math.sin(tt*1.4+cc.ph)*.16,v.y-cc.speed*tt,v.z);tmpE.set(cc.r.x+cc.w.x*tt,cc.r.y+cc.w.y*tt,cc.r.z+cc.w.z*tt,'XYZ');qq.setFromEuler(tmpE);ss.setScalar(tt>0?1:0);m4.compose(vv,qq,ss);conf.setMatrixAt(i,m4);}
  conf.instanceMatrix.needsUpdate=true;}
 // al llegar, la portada arranca como video y luego recorre la invitación; la imagen nunca se apaga
 if(t>c0&&!still)prime(occ);
 if(landedNow&&!wakeAt&&!still){wakeAt=t;playOpening(occ);}
 const wt=wakeAt?t-wakeAt:0,vt=vids[occ],vid=vt?.userData.video,tall=talls[occ],VD=vid&&isFinite(vid.duration)&&vid.duration>0?vid.duration:6,first=firsts[occ]?.image?firsts[occ]:covers[occ];
 let map=still?covers[occ]:first;
 if(!still&&wakeAt){if(vid&&wt<VD&&!vid.ended){map=vid.readyState>=2&&vid.currentTime>0?vt:first;if(vid.paused&&!clock.paused)vid.play()?.catch?.(()=>{});}
  else{map=covers[occ];if(tall&&tall.image&&tall.userData.frac<1){map=tall;const f=Math.min(1,tall.userData.frac),k=eio(seg(wt-VD,1,9))*(1-eio(seg(wt-VD,12,18)));tall.offset.y=1-f-(1-f)*.65*k;}}}
 if(screenMat.map!==map){screenMat.map=map;screenMat.needsUpdate=true;}
 pGlareMat.uniforms.uT.value=wakeAt?-.6+(wt%5)/5*2.6:-1;
 // cambio de ocasión con giro del teléfono
 if(fl>.5&&!flipSwap){flipSwap=true;applyOcc();wakeAt=t;playOpening(occ);}
 // luz de cada ocasión
 key.color.set(o.key[0]);key.intensity=(dark?.7:1)*o.key[1]*(dark&&occ==='bodas'?1+.08*Math.sin(t*9.1)*Math.sin(t*3.7):1);key.position.set(...o.key[2]);
 candles.forEach((l,i)=>{l.intensity=(occ==='bodas'?(dark?3.2:1.4):0)*(1+.15*Math.sin(t*(7+i*3.3)));});
 party.forEach((l,i)=>{const a=t*.8+i*2.1;l.position.set(Math.cos(a)*2.6,1.2+Math.sin(a*1.3)*.5,Math.sin(a)*1.8+1);l.intensity=occ==='cumple'?(dark?3:2.4):0;});
 // etiquetas; las que vencieron con el hero fuera de pantalla no se disparan todas juntas
 for(const e of events)if(!e.done&&t>=e.at){e.done=true;if(e.always||t-e.at<1)e.fn();}
 chip.style.visibility='hidden';under.classList.toggle('on',landedNow);
 // el aviso de confirmación va dentro de la pantalla del teléfono
 if(phone.visible){const r=screenRect(scr,PW-.1,PH-.1,camera,stage),sb=stage.getBoundingClientRect();notif.style.left=(r.left-sb.left+r.width*.06)+'px';notif.style.top=(r.top-sb.top+r.height*.05)+'px';notif.style.width=(r.width*.88)+'px';}
 if(isNarrow){place(chip,phone,new THREE.Vector3(-PW/2,-PH/2+.6,.06),camera,stage,-50,0);}
 else{place(chip,phone,new THREE.Vector3(PW/2,.1,.06),camera,stage,24,-20);}
 place(under,phone,new THREE.Vector3(0,-PH/2,.06),camera,stage,0,14,'center');
 followGlow(hero,stage,lift>.5?phone:holder,camera);
}
let warmed=false;
function draw(){if(!warmed)return;frame(advance());renderer.render(scene,camera);}
let raf=0,offscreen=false;function loop(){cancelAnimationFrame(raf);draw();if(!clock.paused&&!still&&!offscreen)raf=requestAnimationFrame(loop);}
// Visitas repetidas: la tarjeta ya viene saliendo del sobre
const skipTo=()=>(repeat||isNarrow)&&!still?(OCC[occ].ribbon?.45:0)+.6+.9:0;
function start(from=0){reset();wakeAt=0;rushShift=0;rushing=false;hero.classList.add('go');stage.classList.add('ready');clock.start(from);hero.classList.remove('hero-paused');cancelAnimationFrame(raf);if(still){events.slice(0,2).forEach(e=>{e.done=true;e.fn();});setTimeout(draw,1200);}loop();}

// Clic en el teléfono: abre la invitación
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
function hit(e){if(!landedNow)return false;const b=stage.getBoundingClientRect();ndc.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(ndc,camera);return ray.intersectObjects(phone.children,false).length>0;}
let downAt=null;
stage.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')stage.classList.toggle('hot',hit(e));});
stage.addEventListener('pointerdown',e=>{downAt={x:e.clientX,y:e.clientY};});
stage.addEventListener('pointerup',e=>{if(!downAt||Math.hypot(e.clientX-downAt.x,e.clientY-downAt.y)>8||e.target.closest('a'))return;if(hit(e)){wakeAt=T();playOpening(occ);}});

// Al bajar, el teléfono se va con la página y solo se inclina un poco
addEventListener('scroll',()=>{const b=stage.getBoundingClientRect(),c=b.top+b.height/2;scrollTilt=clamp((innerHeight*.35-c)/(innerHeight*.7));
 if(clock.started&&!still&&!rushing&&T()<landT()&&c<innerHeight*.4)rushing=true;if(clock.paused||still)draw();},{passive:true});

// Ocasión: si la tarjeta ya es teléfono, el teléfono gira y cambia; si no, el sobre empieza de nuevo
document.querySelectorAll('.pill').forEach(b=>{b.addEventListener('pointerenter',()=>ensure(b.dataset.occ));b.onclick=()=>{if(occ===b.dataset.occ)return;occ=b.dataset.occ;
 document.querySelectorAll('.pill').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));ensure(occ);
 if(landedNow&&!still){flipT=T();flipSwap=false;}else{applyOcc();start();}};});
$('pause').onclick=e=>{const p=clock.toggle();const v=vids[occ]?.userData.video;if(v){if(p)v.pause();else if(wakeAt)v.play()?.catch?.(()=>{});}e.currentTarget.querySelector('span').textContent=p?tr("Reanudar movimiento"):tr("Pausar movimiento");if(!p)loop();};

document.querySelectorAll('.pill').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.occ===occ)));
size();
Promise.all([document.fonts.load('italic 400 92px "Cormorant Garamond"'),document.fonts.load('500 96px Sora'),document.fonts.ready]).then(()=>{ready=true;applyOcc();return renderer.compileAsync(scene,camera).catch(()=>{});}).then(()=>{
 warmed=true;applyOcc();draw();
 if(still||!isNarrow){start(skipTo());return;}
 hero.classList.add('go');stage.classList.add('ready');draw();const io=new IntersectionObserver(es=>{if(es[0].isIntersecting){io.disconnect();start(skipTo());}},{threshold:.35});io.observe(stage);
});
let backgroundPaused=false;
function syncVisibility(){const hidden=document.hidden||document.body.classList.contains('has-page-frame')||window.frameElement?.getAttribute('aria-hidden')==='true';if(hidden&&!clock.paused){backgroundPaused=true;clock.toggle();cancelAnimationFrame(raf);Object.values(vids).forEach(t=>t.userData.video.pause());}else if(!hidden&&backgroundPaused){backgroundPaused=false;if(clock.paused)clock.toggle();loop();}}
document.addEventListener('visibilitychange',syncVisibility);
new MutationObserver(syncVisibility).observe(document.body,{attributes:true,attributeFilter:['class']});
// Fuera de pantalla no se dibuja: el scroll queda libre
new IntersectionObserver(([e])=>{offscreen=!e.isIntersecting;if(offscreen){cancelAnimationFrame(raf);Object.values(vids).forEach(t=>t.userData.video.pause());}else if(clock.started&&!clock.paused&&!still)loop();},{rootMargin:'160px'}).observe(stage);


matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches&&!clock.paused){clock.toggle();cancelAnimationFrame(raf);hero.classList.add('hero-still');Object.values(vids).forEach(t=>t.userData.video.pause());}});
