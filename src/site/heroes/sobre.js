import { tr, english } from './locale.js';
import { THREE, clamp, seg, eo, eio, lerp, spring, seenBefore, stillMode, createStage, place, toStage, screenRect, createClock, tiltControls, followGlow, scrollFlight, canvasTexture, dotTexture, tallTexture } from './shared.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const $=id=>document.getElementById(id);
const hero=$('hero'),stage=$('stage'),chip=$('chip'),counter=$('counter'),tryLink=$('try'),namesIn=$('names'),dateIn=$('date');
const still=stillMode(),repeat=seenBefore('nordra-sobre');
const isNarrow=matchMedia('(max-width:860px)').matches;

const OCC={
 bodas:{paper:0xf1e7d4,lining:'#d9c39b',lineA:'#b8955a',table:'lino',seal:0xa8803e,sealCss:'#b08a4a',sealMetal:.28,frame:0xf0e6d4,frameMetal:.6,confetti:'petal',colors:[0xf7d4d8,0xf2c2c8,0xfbe6e3,0xead2b4],screen:'/nordra/v550/assets/wedding-live-cover.webp',flip:'/nordra/v550/assets/apertura-bodas',frames:89,tall:'/nordra/v550/assets/larga-bodas.jpg',kicker:tr("NOS CASAMOS"),name:tr("Valentina & Sebastián"),date:tr("19 de junio de 2027"),iso:'2027-06-19',ink:'#3f2f24',gold:'#76511c',cardBg:'#fbf6ec',font:'italic 400 92px "Cormorant Garamond"',label:tr("ESCRIBE SUS NOMBRES"),href:'https://nordrastudio.mx/invitaciones/valentina-y-sebastian/',ribbon:true,key:[0xffc98a,2.1,[-6,2.6,4]],rsvp:[['AN','Ana',2,'#c08a5a'],['LU','Luis',3,'#7a8b6e'],['FG',tr("Familia Garza"),4,'#9a6f8c'],['CA','Carmen',1,'#b07a52']]},
 cumple:{paper:0x2b1f40,lining:'#24183a',lineA:'#ff4fae',lineB:'#5ee7ff',table:'terciopelo',seal:0xff3fa4,sealCss:'#ff3fa4',sealMetal:.08,frame:0x1b1a22,frameMetal:.7,confetti:'rect',colors:[0xff4fae,0x5ee7ff,0xffd166,0xb388ff],screen:'/nordra/v550/assets/camila-portada-780.webp',flip:'/nordra/v550/assets/apertura-cumple',frames:81,tall:'/nordra/v550/assets/larga-cumple.jpg',kicker:tr("MIS 30"),name:'Camila',date:tr("30 años"),ink:'#ffe3f4',gold:'#ff5fb8',cardBg:'#24183a',font:'500 104px Sora',label:tr("ESCRIBE EL NOMBRE"),href:'https://nordrastudio.mx/invitaciones/camila-30/',ribbon:false,key:[0xffd2ee,1.3,[-5,3,4]],rsvp:[['DA','Dani',2,'#ff4fae'],['SL','Sofi y Leo',2,'#5ec8e7'],['MA','Mau',1,'#c79bff'],['RE','Regina',3,'#ffb84f']]},
 eventos:{paper:0x2a333d,lining:'#bfc8d1',lineA:'#8e9aa6',table:'piedra',seal:0xa7b2bd,sealCss:'#8e9aa6',sealMetal:.55,frame:0xc9cfd6,frameMetal:.9,confetti:'glitter',colors:[0xdfe7ef,0xb9c4ce,0xffffff],screen:'/nordra/v550/assets/conexion-27.webp',flip:'/nordra/v550/assets/apertura-eventos',frames:86,tall:'/nordra/v550/assets/larga-eventos.jpg',kicker:(english?"ANNUAL GATHERING":"ENCUENTRO ANUAL"),name:'Conexión 27',date:(english?"June 12, 2027":"12 de junio de 2027"),iso:'2027-06-12',ink:'#e9eef3',gold:'#c3ccd5',cardBg:'#1f2831',font:'500 96px Sora',label:(english?"ENTER THE EVENT NAME":"ESCRIBE EL NOMBRE DEL EVENTO"),href:'https://nordrastudio.mx/invitaciones/conexion-27/',ribbon:false,key:[0xd6e8ff,2.0,[6,4,3]],rsvp:[['MA','Mariana',1,'#5a7fa8'],['EN','Equipo Norte',6,'#3f6b6b'],['DI','Diego',1,'#7a6fa8'],['LU','Lucía',2,'#8a6a52']]}};
let occ=new URLSearchParams(location.search).get('occ');if(!OCC[occ])occ='bodas';
// Tres colores por ocasión: tiñen el sobre, el forro y el lacre
const PALS={
 bodas:[{n:(english?"Champagne":"Champán"),c:'#e3cfa8'},{n:(english?"Sage":"Salvia"),c:'#9fb08a',paper:0xe9ecdf,lining:'#b9c4a8',lineA:'#7f9070',seal:0x6f8a5e,sealCss:'#6f8a5e'},{n:(english?"Terracotta":"Terracota"),c:'#c47a55',paper:0xf3e3d6,lining:'#d9a988',lineA:'#a4583a',seal:0xa4502f,sealCss:'#a4502f'}],
 cumple:[{n:(english?"Neon":"Neón"),c:'#ff4fae'},{n:(english?"Lime":"Lima"),c:'#b8ff3f',paper:0x1f2a22,lining:'#1a2a1d',lineA:'#c6ff4f',lineB:'#5ee7ff',seal:0x9be22e,sealCss:'#9be22e'},{n:(english?"Gold":"Oro"),c:'#e0a63a',paper:0x2a2218,lining:'#231a10',lineA:'#ffcf5e',lineB:'#ff9f4f',seal:0xd99a2b,sealCss:'#d99a2b'}],
 eventos:[{n:(english?"Graphite":"Grafito"),c:'#8e9aa6'},{n:(english?"Navy":"Marino"),c:'#4f6b9a',paper:0x1f2c44,lining:'#b9c6dc',lineA:'#6f86ad',seal:0x8aa0c8,sealCss:'#6f86ad'},{n:(english?"Sand":"Arena"),c:'#c2a77a',paper:0x4a4035,lining:'#dccdb6',lineA:'#a8916e',seal:0xc2a77a,sealCss:'#a8916e'}]};
let palI=0;const cur=()=>Object.assign({},OCC[occ],PALS[occ][palI]);
let customName='',customDate='';

const {renderer,scene,camera}=createStage(stage,{camPos:[0,2.8,9.6],lookAt:[0,-.15,0]});
const key=new THREE.DirectionalLight(0xffc98a,2.1);key.position.set(-6,2.6,4);scene.add(key);
const fill=new THREE.HemisphereLight(0xfff4e8,0x6a4d78,.7);scene.add(fill);
const candles=[new THREE.PointLight(0xffb36b,0,6,2),new THREE.PointLight(0xffc98a,0,6,2)];candles[0].position.set(-1.6,.6,2.2);candles[1].position.set(1.8,.9,2);candles.forEach(l=>scene.add(l));
const party=[0xff4fae,0x5ee7ff,0xffd166].map(c=>{const l=new THREE.PointLight(c,0,7,2);scene.add(l);return l;});
const root=new THREE.Group();scene.add(root);
const TABLE=-1.15;let sealBase=[0];

// Mesa: lino, terciopelo o piedra, con bordes que se funden con la página
const tableCanvas=document.createElement('canvas');tableCanvas.width=tableCanvas.height=1024;
const tableTex=new THREE.CanvasTexture(tableCanvas);tableTex.colorSpace=THREE.SRGBColorSpace;tableTex.wrapS=tableTex.wrapT=THREE.RepeatWrapping;
// Sin bordes visibles: la mesa es más ancha que la escena y solo se desvanece hacia el fondo,
// como una superficie que se aleja, en lugar de terminar en una elipse
const ss_=(a,b,x)=>{const k=Math.min(1,Math.max(0,(x-a)/(b-a)));return k*k*(3-2*k);};
const tableAlpha=canvasTexture(256,256,(g,w,h)=>{const img=g.createImageData(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=x/(w-1),v=y/(h-1);
 const side=ss_(0,.3,u)*ss_(1,.7,u),depth=Math.pow(ss_(.02,.75,v),2.2)*ss_(1,.86,v);const a=Math.round(255*side*depth),i=(y*w+x)*4;img.data[i]=img.data[i+1]=img.data[i+2]=a;img.data[i+3]=255;}g.putImageData(img,0,0);});tableAlpha.colorSpace=THREE.NoColorSpace;
const tableMat=new THREE.MeshPhysicalMaterial({map:tableTex,alphaMap:tableAlpha,transparent:true,roughness:.9,sheen:0,sheenColor:new THREE.Color(0xff8fd0),sheenRoughness:.4,depthWrite:false});
// el fondo de la mesa se desenfoca (como poca profundidad de campo): la textura se lee más borrosa hacia atrás
tableMat.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','#ifdef USE_MAP\n vec4 sampledDiffuseColor = texture2D( map, vMapUv, smoothstep(.35,1.,vAlphaMapUv.y)*5. );\n diffuseColor *= sampledDiffuseColor;\n#endif');};
const table=new THREE.Mesh(new THREE.PlaneGeometry(12,6.4),tableMat);table.rotation.x=-Math.PI/2;table.position.set(0,TABLE,0);root.add(table);
function drawTable(){const o=OCC[occ],g=tableCanvas.getContext('2d'),S=1024;const dk=dark;
 if(o.table==='lino'){g.fillStyle=dk?'#3a3129':'#e9dfd0';g.fillRect(0,0,S,S);for(let i=0;i<S;i+=3){g.fillStyle=`rgba(${dk?'255,240,220':'120,95,70'},${.05+Math.random()*.05})`;g.fillRect(0,i,S,1);g.fillRect(i,0,1,S);}tableMat.sheen=0;tableMat.roughness=.92;}
 else if(o.table==='terciopelo'){g.fillStyle=dk?'#1a1026':'#3a2550';g.fillRect(0,0,S,S);for(let i=0;i<9000;i++){g.fillStyle=`rgba(255,${120+Math.random()*80},${200+Math.random()*55},${Math.random()*.06})`;g.fillRect(Math.random()*S,Math.random()*S,2,2);}tableMat.sheen=1;tableMat.roughness=.75;}
 else{g.fillStyle=dk?'#2b2a28':'#cfc6b8';g.fillRect(0,0,S,S);for(let i=0;i<26000;i++){const v=Math.random();g.fillStyle=v<.5?`rgba(255,255,255,${Math.random()*.18})`:`rgba(40,35,30,${Math.random()*.16})`;g.fillRect(Math.random()*S,Math.random()*S,1+Math.random()*2,1+Math.random()*2);}tableMat.sheen=0;tableMat.roughness=.85;}
 tableTex.repeat.set(3,1.6);tableTex.needsUpdate=true;}

// Objetos de ambiente al fondo de la mesa, ya desenfocados
const propCanvas=[0,1].map(()=>{const c=document.createElement('canvas');c.width=512;c.height=384;return c;});
const propMats=propCanvas.map(c=>{const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:0,depthWrite:false});});
const props=propMats.map((m,i)=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.42),m);p.position.set(i?2.05:-2.1,TABLE+.62,i?-1.7:-1.5);p.rotation.y=i?-.25:.3;root.add(p);return p;});
function drawProps(){const o=cur();propCanvas.forEach((c,i)=>{const g=c.getContext('2d'),w=512,h=384;g.clearRect(0,0,w,h);g.save();g.filter='blur(5px)';
 if(occ==='bodas'){if(!i){g.strokeStyle='#7e8f63';g.lineWidth=7;g.beginPath();g.moveTo(90,350);g.quadraticCurveTo(220,220,400,90);g.stroke();g.fillStyle='#8fa070';for(let k=0;k<9;k++){const x=120+k*32,y=320-k*27;g.save();g.translate(x,y);g.rotate(-.7+(k%2?.9:-.9));g.beginPath();g.ellipse(0,-26,12,30,0,0,7);g.fill();g.restore();}}
  else{g.lineWidth=16;['#d8b46a','#c9a052'].forEach((col,k)=>{g.strokeStyle=col;g.beginPath();g.ellipse(210+k*90,240,70,42,k?.3:-.2,0,7);g.stroke();});g.strokeStyle='rgba(255,250,230,.8)';g.lineWidth=5;g.beginPath();g.ellipse(200,232,62,34,-.2,3.6,4.6);g.stroke();}}
 else if(occ==='cumple'){if(!i){const r=g.createRadialGradient(256,110,4,256,110,90);r.addColorStop(0,'rgba(255,230,160,1)');r.addColorStop(.3,'rgba(255,170,80,.6)');r.addColorStop(1,'rgba(255,120,60,0)');g.fillStyle=r;g.fillRect(150,10,220,200);
   g.fillStyle='#f5d6e8';g.fillRect(232,150,48,220);g.fillStyle=o.sealCss;for(let y=160;y<370;y+=34)g.fillRect(232,y,48,12);}
  else{g.fillStyle=o.sealCss;g.globalAlpha=.85;g.fillRect(150,170,220,170);g.globalAlpha=1;g.fillStyle='#ffd166';g.fillRect(248,170,26,170);g.fillRect(150,240,220,24);g.beginPath();g.ellipse(232,160,40,22,-.5,0,7);g.ellipse(292,160,40,22,.5,0,7);g.fill();}}
 else{if(!i){g.fillStyle=dark?'#d8dde3':'#f3f1ec';g.fillRect(170,170,150,170);g.strokeStyle=g.fillStyle;g.lineWidth=18;g.beginPath();g.arc(330,250,42,-1.2,1.2);g.stroke();g.fillStyle='#6b4a32';g.fillRect(182,176,126,22);g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=6;for(let k=0;k<3;k++){g.beginPath();g.moveTo(210+k*30,150);g.bezierCurveTo(190+k*30,110,235+k*30,90,215+k*30,50);g.stroke();}}
  else{g.strokeStyle='#244a64';g.lineWidth=14;g.beginPath();g.moveTo(200,20);g.lineTo(240,150);g.moveTo(330,20);g.lineTo(290,150);g.stroke();g.fillStyle='rgba(225,230,250,.92)';g.fillRect(190,150,150,200);g.fillStyle='#8a7bd6';g.beginPath();g.arc(265,250,40,0,7);g.fill();}}
 g.restore();propMats[i].map.needsUpdate=true;});}
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
let customTo='';
// Solapa que se curva como papel al abrirse
const FX=22,FY=16,flapGeo=new THREE.PlaneGeometry(EW,FH,FX,FY);
const flapAlpha=canvasTexture(512,512,(g)=>{g.fillStyle='#000';g.fillRect(0,0,512,512);g.fillStyle='#fff';g.beginPath();g.moveTo(0,0);g.lineTo(512,0);g.lineTo(272,496);g.quadraticCurveTo(256,516,240,496);g.closePath();g.fill();});flapAlpha.colorSpace=THREE.NoColorSpace;
const flapFront=new THREE.MeshStandardMaterial({color:0xf1e7d4,roughness:.9,bumpMap:fiberTex,bumpScale:1.4,alphaMap:flapAlpha,alphaTest:.5,side:THREE.FrontSide,transparent:true});
const flapBack=new THREE.MeshStandardMaterial({map:liningTex,roughness:.7,alphaMap:flapAlpha,alphaTest:.5,side:THREE.BackSide,transparent:true});
const flapPivot=new THREE.Group();flapPivot.position.set(0,EH/2,.05);env.add(flapPivot);
flapPivot.add(new THREE.Mesh(flapGeo,flapFront),new THREE.Mesh(flapGeo,flapBack));
const flapBase=flapGeo.attributes.position.array.slice();
function bendFlap(open){const p=flapGeo.attributes.position,A=open*Math.PI*.96,bend=1.1*Math.sin(A),step=FH/FY;
 const rowY=[],rowZ=[];let y=0,z=0;for(let j=0;j<=FY;j++){rowY.push(y);rowZ.push(z);const th=A+bend*(j/FY);y-=step*Math.cos(th);z+=step*Math.sin(th);}
 for(let i=0;i<p.count;i++){const j=Math.round((FH/2-flapBase[i*3+1])/step);p.setXYZ(i,flapBase[i*3],rowY[j],rowZ[j]+.002*j/FY);}
 p.needsUpdate=true;flapGeo.computeVertexNormals();}
bendFlap(0);
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

// Sello de lacre con el isotipo, con grieta que avanza
const sealCanvas=document.createElement('canvas');sealCanvas.width=sealCanvas.height=512;
const sealBump=new THREE.CanvasTexture(sealCanvas);
// Lacre de verdad: cera derramada con borde irregular y un anillo donde apoyó el sello,
// superficie cerosa (sin metal), caras de corte más mates y migajas al romperse
const sealSide=new THREE.MeshPhysicalMaterial({color:0xa8803e,roughness:.62,metalness:.05,clearcoat:.15,transparent:true,side:THREE.DoubleSide});
const sealTop=new THREE.MeshPhysicalMaterial({color:0xa8803e,roughness:.34,metalness:.28,clearcoat:1,clearcoatRoughness:.22,sheen:.6,sheenRoughness:.5,sheenColor:new THREE.Color(0xffe6c0),bumpMap:sealBump,bumpScale:7,transparent:true});
const PROF=[[0,.062],[.12,.06],[.17,.057],[.2,.052],[.218,.058],[.234,.056],[.252,.044],[.27,.027],[.283,.012],[.29,.003],[.291,0]];
const wob=a=>1+.07*Math.sin(a*5+.4)+.04*Math.sin(a*11+1)+.022*Math.sin(a*23+2);
const halves=[0,1].map(i=>{const g=new THREE.LatheGeometry([...PROF].reverse().map(([r,y])=>new THREE.Vector2(r,y)),64,i*Math.PI,Math.PI);
 const p=g.attributes.position,uv=g.attributes.uv;
 for(let k=0;k<p.count;k++){const x=p.getX(k),z=p.getZ(k),rr=Math.hypot(x,z),a=Math.atan2(z,x),w=rr>.16?1+(wob(a)-1)*Math.min(1,(rr-.16)/.1):1;p.setX(k,x*w);p.setZ(k,z*w);uv.setXY(k,x/.62+.5,-z/.62+.5);}
 g.computeVertexNormals();
 // cara del corte, con el mismo perfil
 const cs=new THREE.Shape();cs.moveTo(-.291,0);[...PROF].reverse().forEach(([r,y])=>cs.lineTo(-r,y));PROF.forEach(([r,y])=>cs.lineTo(r,y));cs.lineTo(-.291,0);
 const cut=new THREE.Mesh(new THREE.ShapeGeometry(cs),sealSide);cut.rotation.y=Math.PI/2;
 const m=new THREE.Group();m.add(new THREE.Mesh(g,sealTop),cut);m.rotation.x=Math.PI/2;m.position.copy(SEAL);env.add(m);return m;});
const CRN=14,crumbs=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.018,0),sealSide,CRN);crumbs.visible=false;env.add(crumbs);
const SPN=70,spPos=new Float32Array(SPN*3),spCol=new Float32Array(SPN*3),spV=[...Array(SPN)].map(()=>{const a=Math.random()*6.28,s=.4+Math.random()*1.2;return new THREE.Vector3(Math.cos(a)*s,Math.sin(a)*s*.8+.4,.3+Math.random()*.9);});
const spGeo=new THREE.BufferGeometry();spGeo.setAttribute('position',new THREE.BufferAttribute(spPos,3));spGeo.setAttribute('color',new THREE.BufferAttribute(spCol,3));
const spMat=new THREE.PointsMaterial({size:.07,map:dotTexture(),vertexColors:true,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});const sparks=new THREE.Points(spGeo,spMat);env.add(sparks);
const SPC={bodas:[0xffe2a0,0xfff4d8],cumple:[0xff6fc0,0x6fe9ff,0xffe07a],eventos:[0xe6eef6,0xffffff,0xb9c4ce]};
const crumbV=[...Array(CRN)].map((_,i)=>new THREE.Vector3((Math.random()-.5)*1.6,.6+Math.random()*1.1,.4+Math.random()*.6));
const crackPts=[];for(let i=0;i<=14;i++){const y=.3-i*(.6/14);crackPts.push(new THREE.Vector3(Math.sin(i*2.1)*.035+(i%2?.02:-.02),y,0));}
const crackGeo=new THREE.BufferGeometry().setFromPoints(crackPts);
const crackMat=new THREE.LineBasicMaterial({color:0xfff1c8,transparent:true,opacity:0});
const crack=new THREE.Line(crackGeo,crackMat);crack.position.copy(SEAL).add(new THREE.Vector3(0,0,.058));env.add(crack);
let isoPath=null;
fetch('/nordra/v550/assets/isotipo.svg').then(r=>r.text()).then(s=>{const m=s.match(/id="montana"[^>]*d="([^"]+)"/)||s.match(/d="([^"]+)"/);if(m)isoPath=new Path2D(m[1]);drawSeal();draw();});
// Grabado del sello: las iniciales de quien celebra (cambian al escribir) y el isotipo pequeño
function initials(){const n=(customName||OCC[occ].name).trim();if(occ==='eventos'){const d=n.match(/\d+/);return d?d[0]:n[0]?.toUpperCase()||'';}
 const parts=n.split(/\s*(?:&|\by\b)\s*/i).filter(Boolean);return parts.length>1?parts.slice(0,2).map(p=>p[0].toUpperCase()).join('·'):(n[0]||'').toUpperCase();}
function drawSeal(){const g=sealCanvas.getContext('2d');g.filter='none';g.fillStyle='#000';g.fillRect(0,0,512,512);
 g.strokeStyle='#8a8a8a';g.lineWidth=10;g.beginPath();g.arc(256,256,196,0,Math.PI*2);g.stroke();
 g.fillStyle='#777';for(let i=0;i<36;i++){const a=i/36*Math.PI*2;g.beginPath();g.arc(256+Math.cos(a)*172,256+Math.sin(a)*172,4,0,7);g.fill();}
 g.save();g.filter='blur(1.2px)';g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';const ini=initials();
 g.font=(occ==='bodas'?'italic 400 ':'600 ')+(ini.length>2?118:150)+'px '+(occ==='bodas'?'"Cormorant Garamond"':'Sora');g.fillText(ini,256,276);g.restore();
 if(isoPath){g.save();g.filter='blur(1px)';g.translate(256-46,128);g.scale(92/937,92/937);g.fillStyle='#ddd';g.fill(isoPath);g.restore();}sealBump.needsUpdate=true;}

// Tarjeta en dos mitades (para doblarse), con letras hundidas y foil
const CW=2.2,CH=1.44;
const cardCanvas=document.createElement('canvas'),metalCanvas=document.createElement('canvas'),roughCanvas=document.createElement('canvas');
// Lienzo al doble de resolución para que lo que escribes se vea nítido
const CS=2;[cardCanvas,metalCanvas,roughCanvas].forEach(c=>{c.width=1024*CS;c.height=672*CS;});
const MAXANI=renderer.capabilities.getMaxAnisotropy();
const cardTex=new THREE.CanvasTexture(cardCanvas);cardTex.colorSpace=THREE.SRGBColorSpace;cardTex.anisotropy=MAXANI;
const metalTex=new THREE.CanvasTexture(metalCanvas),roughTex=new THREE.CanvasTexture(roughCanvas);metalTex.anisotropy=roughTex.anisotropy=MAXANI;
const cardMat=new THREE.MeshStandardMaterial({map:cardTex,metalnessMap:metalTex,roughnessMap:roughTex,bumpMap:metalTex,bumpScale:-4,color:0xe8e2d8,metalness:1,roughness:1,envMapIntensity:1.9,transparent:true});
const cardG=new THREE.Group();root.add(cardG);
// Papel con grosor: cada mitad es una caja delgada con canto; el frente lleva su mitad del diseño
const CT=.014;
const halfGeo=(left)=>{const g=new THREE.BoxGeometry(CW/2,CH,CT);const uv=g.attributes.uv;
 // cara frontal (grupo 4, vértices 16–19): su mitad del lienzo
 for(let i=16;i<20;i++)uv.setX(i,uv.getX(i)*.5+(left?0:.5));
 g.translate(left?-CW/4:CW/4,0,left?0:CT);return g;};
const cardBackMat=new THREE.MeshStandardMaterial({color:0xf4ede1,roughness:.9,bumpMap:fiberTex,bumpScale:1,transparent:true});
const cardEdgeMat=new THREE.MeshStandardMaterial({color:0xe9dfcf,roughness:.95,transparent:true});
const cardMats=[cardEdgeMat,cardEdgeMat,cardEdgeMat,cardEdgeMat,cardMat,cardBackMat];
const cardL=new THREE.Mesh(halfGeo(true),cardMats);cardG.add(cardL);
const rightPivot=new THREE.Group();rightPivot.position.z=-CT;cardG.add(rightPivot);const cardR=new THREE.Mesh(halfGeo(false),cardMats);rightPivot.add(cardR);
// Sombra del pliegue: oscurece junto a la bisagra mientras la tarjeta se dobla
const creaseTex=canvasTexture(128,8,(g,w,h)=>{const r=g.createLinearGradient(0,0,w,0);r.addColorStop(0,'rgba(30,18,10,.85)');r.addColorStop(1,'rgba(30,18,10,0)');g.fillStyle=r;g.fillRect(0,0,w,h);});
const creaseMat=new THREE.MeshBasicMaterial({map:creaseTex,transparent:true,depthWrite:false,opacity:0});
const creaseR=new THREE.Mesh(new THREE.PlaneGeometry(.32,CH),creaseMat);creaseR.position.set(.16,0,CT+CT/2+.001);rightPivot.add(creaseR);
const creaseL=new THREE.Mesh(new THREE.PlaneGeometry(.32,CH),creaseMat);creaseL.scale.x=-1;creaseL.position.set(-.16,0,CT/2+.001);cardG.add(creaseL);
// Luz que sigue al cursor para que el foil brille donde pasas
const foilLight=new THREE.PointLight(0xfff0d0,0,2.6,2);root.add(foilLight);
let pointer={x:0,y:0,on:false};
hero.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const b=stage.getBoundingClientRect();pointer={x:(e.clientX-b.left)/b.width*2-1,y:-((e.clientY-b.top)/b.height*2-1),on:true};});
hero.addEventListener('pointerleave',()=>{pointer.on=false;});
const cardShadow=new THREE.Mesh(new THREE.PlaneGeometry(2.8,1.7),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false,opacity:0}));cardShadow.rotation.x=-Math.PI/2;root.add(cardShadow);
const glintMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uX:{value:-1}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float uX;varying vec2 vUv;void main(){float d=vUv.x-uX+vUv.y*.25;gl_FragColor=vec4(vec3(1.,.95,.8),exp(-d*d*220.)*.55);}'});
const glint=new THREE.Mesh(new THREE.PlaneGeometry(CW,CH),glintMat);glint.position.z=CT/2+.004;cardG.add(glint);
function fitFont(g,font,text,max){let size=parseInt(font.match(/(\d+)px/)[1],10);g.font=font;while(g.measureText(text).width>max&&size>30){size-=4;g.font=font.replace(/\d+px/,size+'px');}return g.font;}
// Fecha en formato de México: «19 de junio de 2027»
function fmtDate(v){if(!v)return '';const [y,m,d]=v.split('-').map(Number);if(!y||!m||!d)return '';return new Date(y,m-1,d).toLocaleDateString(english?'en-US':'es-MX',{day:'numeric',month:'long',year:'numeric'});}
function daysTo(iso){if(!iso)return 0;const [y,m,d]=iso.split('-').map(Number);if(!y||!m||!d)return 0;const now=new Date(),a=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()),b=Date.UTC(y,m-1,d);return Math.round((b-a)/864e5);}
function drawCard(){const o=OCC[occ],w=1024,h=672,name=customName||o.name,date=fmtDate(customDate)||o.date;
 for(const [c,kind] of [[cardCanvas,'base'],[metalCanvas,'metal'],[roughCanvas,'rough']]){const g=c.getContext('2d');g.setTransform(CS,0,0,CS,0,0);
  g.fillStyle=kind==='base'?o.cardBg:kind==='metal'?'#000':'#ffffff';g.fillRect(0,0,w,h);
  // foil: metal pleno y poco áspero, para que el destello se note
  const foil=kind==='base'?o.gold:kind==='metal'?'#ffffff':'#2c2c2c',plain=kind==='base'?o.ink:kind==='metal'?'#000':'#ffffff';
  g.strokeStyle=foil;g.lineWidth=3;g.strokeRect(34,34,w-68,h-68);g.lineWidth=1;g.strokeRect(48,48,w-96,h-96);
  g.textAlign='center';g.fillStyle=foil;g.font='600 26px Manrope';g.letterSpacing='8px';g.fillText(o.kicker,w/2,200);g.letterSpacing='0px';
  fitFont(g,o.font,name,w-160);g.fillText(name,w/2,350);g.fillRect(w/2-60,400,120,2);
  g.fillStyle=plain;g.font='500 34px Manrope';g.fillText(date,w/2,470);
  const days=daysTo(customDate||o.iso);if(days>0){g.globalAlpha=.7;g.font='500 24px Manrope';g.letterSpacing='3px';g.fillText(english?`${days} ${days===1?'DAY':'DAYS'} TO GO`:`FALTAN ${days} ${days===1?'DÍA':'DÍAS'}`,w/2,530);g.letterSpacing='0px';g.globalAlpha=1;}}
 cardTex.needsUpdate=metalTex.needsUpdate=roughTex.needsUpdate=true;}

// Teléfono: despierta y reproduce la apertura real; luego recorre la invitación
const PW=1.2,PH=2.46;
const frameMat=new THREE.MeshPhysicalMaterial({color:0xf0e6d4,metalness:.6,roughness:.25,clearcoat:1,clearcoatRoughness:.1,transparent:true,opacity:0});
const phone=new THREE.Group();root.add(phone);
phone.add(new THREE.Mesh(new RoundedBoxGeometry(PW,PH,.11,6,.17),frameMat));
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
// Portada con tu nombre: se tapa el nombre de muestra con el color de fondo y se escribe el tuyo
const COVERTXT={bodas:{box:[.08,.285,.84,.255],date:[.18,.555,.64,.05]},cumple:{box:[.205,.143,.77,.046]},eventos:{box:[.385,.574,.48,.05]}};
const persCache={};
function personal(k){const img=covers[k]?.image;if(!img||!img.complete||!img.naturalWidth)return null;const name=customName||OCC[k].name,date=fmtDate(customDate),key=k+'|'+name+'|'+date;if(persCache[k]?.key===key)return persCache[k].tex;
 const c=document.createElement('canvas'),W=780,H=1688;c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0,W,H);
 const patch=([x,y,w,h])=>{const X=x*W,Y=y*H,Ww=w*W,Hh=h*H,top=g.getImageData(X+Ww/2,Math.max(0,Y-6),1,1).data,bot=g.getImageData(X+Ww/2,Math.min(H-1,Y+Hh+6),1,1).data;
  const gr=g.createLinearGradient(0,Y,0,Y+Hh);gr.addColorStop(0,`rgb(${top[0]},${top[1]},${top[2]})`);gr.addColorStop(1,`rgb(${bot[0]},${bot[1]},${bot[2]})`);g.save();g.filter='blur(4px)';g.fillStyle=gr;g.fillRect(X-4,Y-4,Ww+8,Hh+8);g.restore();};
 const fit=(font,txt,max,min=26)=>{let s=parseInt(font.match(/(\d+)px/)[1],10);g.font=font;while(g.measureText(txt).width>max&&s>min){s-=2;g.font=font.replace(/\d+px/,s+'px');}};
 const T=COVERTXT[k];patch(T.box);
 if(k==='bodas'){g.fillStyle='#4d4239';g.textAlign='center';const parts=name.split(/\s*(?:&|\by\b)\s*/i).filter(Boolean),cx=W/2,y0=T.box[1]*H;
  if(parts.length>1){fit('500 110px "Cormorant Garamond"',parts[0],W*.8);g.fillText(parts[0],cx,y0+.085*H);g.font='italic 400 46px "Cormorant Garamond"';g.fillStyle='#a39383';g.fillText('&',cx,y0+.13*H);g.fillStyle='#4d4239';fit('500 110px "Cormorant Garamond"',parts[1],W*.8);g.fillText(parts[1],cx,y0+.215*H);}
  else{fit('500 110px "Cormorant Garamond"',name,W*.8);g.fillText(name,cx,y0+.15*H);}
  if(date){patch(T.date);g.fillStyle='#6a5a4b';g.font='400 42px "Cormorant Garamond"';g.fillText(date,cx,(T.date[1]+.035)*H);}}
 else if(k==='cumple'){g.fillStyle='#e9c48d';g.textAlign='left';fit('500 32px Sora',tr("De parte de ")+name,T.box[2]*W);g.fillText(tr("De parte de ")+name,T.box[0]*W+16,(T.box[1]+.031)*H);}
 else{g.fillStyle='#1d2b46';g.textAlign='center';fit('600 44px Sora',name,T.box[2]*W-20);g.fillText(name,(T.box[0]+T.box[2]/2)*W,(T.box[1]+.036)*H);}
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=MAXANI;persCache[k]?.tex.dispose();persCache[k]={key,tex};return tex;}
let forceVideo=false;
const screenMat=new THREE.MeshBasicMaterial({map:null,toneMapped:false,color:0x000000,transparent:true,opacity:0});
const scr=new THREE.Mesh(new THREE.PlaneGeometry(PW-.1,PH-.1),screenMat);scr.position.z=.056;phone.add(scr);
const pGlareMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uT:{value:0},uK:{value:.35}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float uT,uK;varying vec2 vUv;void main(){float d=vUv.x+vUv.y*.5-uT;gl_FragColor=vec4(vec3(1.),exp(-d*d*90.)*uK);}'});
const pGlare=new THREE.Mesh(new THREE.PlaneGeometry(PW-.1,PH-.1),pGlareMat);pGlare.position.z=.058;phone.add(pGlare);
const flashMat=new THREE.MeshBasicMaterial({map:dotTexture(),color:0xfff1c8,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
const flash=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.6),flashMat);root.add(flash);
const phoneShadow=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.2),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false,opacity:0}));phoneShadow.rotation.x=-Math.PI/2;phoneShadow.position.set(0,TABLE+.012,.9);root.add(phoneShadow);

// Confeti propio de cada ocasión
const CN=isNarrow?70:140;
const shapes={petal:canvasTexture(64,64,(g)=>{const r=g.createRadialGradient(32,40,2,32,34,30);r.addColorStop(0,'#fff');r.addColorStop(1,'#e9d6d6');g.fillStyle=r;g.beginPath();g.moveTo(32,60);g.bezierCurveTo(6,48,4,14,24,5);g.quadraticCurveTo(32,12,40,5);g.bezierCurveTo(60,14,58,48,32,60);g.fill();}),rect:canvasTexture(64,64,(g)=>{g.fillStyle='#fff';g.fillRect(18,8,28,48);}),glitter:canvasTexture(64,64,(g)=>{g.fillStyle='#fff';g.fillRect(16,16,32,32);})};
// Pétalos y tiras curvas (no planas), con brillo suave; al caer se posan con una inclinación y su sombra
const confMat=new THREE.MeshPhysicalMaterial({map:shapes.petal,alphaTest:.5,side:THREE.DoubleSide,roughness:.5,metalness:0,sheen:0,sheenRoughness:.45,sheenColor:new THREE.Color(0xffffff),emissive:0xffffff,emissiveIntensity:0});
const curled=(()=>{const g=new THREE.PlaneGeometry(.12,.12,6,6),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i)/.06,y=p.getY(i)/.06;p.setZ(i,(x*x*.022+y*y*.008));}g.computeVertexNormals();return g;})();
const flatG=new THREE.PlaneGeometry(.09,.09);
const conf=new THREE.InstancedMesh(curled,confMat,CN);conf.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(CN*3),3);root.add(conf);
const confShadow=new THREE.InstancedMesh(new THREE.PlaneGeometry(.16,.16),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false,opacity:.28}),CN);root.add(confShadow);
const cv=[],cs=[];for(let i=0;i<CN;i++){const a=Math.random()*Math.PI*2,s=.6+Math.random()*1.6;cv.push(new THREE.Vector3(Math.cos(a)*s*.9,2.4+Math.random()*1.8,Math.sin(a)*s*.6+.4));cs.push({r:new THREE.Euler(Math.random()*6,Math.random()*6,Math.random()*6),w:new THREE.Vector3(Math.random()*6-3,Math.random()*6-3,Math.random()*6-3),ph:Math.random()*6,tilt:(Math.random()-.5)*1.3,spin:Math.random()*6.28});}
function paintSparks(){const c=new THREE.Color(),L=SPC[occ];for(let i=0;i<SPN;i++){c.set(L[i%L.length]);spCol.set([c.r,c.g,c.b],i*3);}spGeo.attributes.color.needsUpdate=true;}
function paintConfetti(){const o=OCC[occ],gl=o.confetti==='glitter';confMat.map=shapes[o.confetti];confMat.metalness=gl?.9:0;confMat.roughness=gl?.2:.55;confMat.sheen=o.confetti==='petal'?1:0;
 confMat.emissiveIntensity=dark&&!gl?.12:0;conf.geometry=gl?flatG:curled;confMat.needsUpdate=true;
 const c=new THREE.Color();for(let i=0;i<CN;i++){c.set(o.colors[i%o.colors.length]);conf.setColorAt(i,c);}conf.instanceColor.needsUpdate=true;}
const m4=new THREE.Matrix4(),qq=new THREE.Quaternion(),vv=new THREE.Vector3(),ss=new THREE.Vector3();

let dark=false;
function applyOcc(){const o=cur(),dk=dark?.55:1;ensure(occ);cardBackMat.color.set(o.cardBg).multiplyScalar(dark?.7:1);
 paperMat.color.set(o.paper).multiplyScalar(dk);flapFront.color.set(o.paper).multiplyScalar(dk*.94);liningMat.color.setScalar(dark?.7:1);flapBack.color.setScalar(dark?.7:1);
 [sealSide,sealTop].forEach(m=>{m.color.set(o.seal);m.emissive.set(occ==='cumple'?0x5a0b38:0);});sealTop.metalness=o.sealMetal;sealSide.metalness=o.sealMetal*.2;sealSide.color.multiplyScalar(.82);drawSeal();
 cardEdgeMat.color.set(o.cardBg).lerp(new THREE.Color(0x8a7a66),.18).multiplyScalar(dark?.7:1);
 frameMat.color.set(o.frame);frameMat.metalness=o.frameMetal;crackMat.color.set(occ==='cumple'?0xffa6de:0xfff1c8);
 tryLink.href=o.href;$('names-label').textContent=o.label;namesIn.placeholder=o.name;hero.style.setProperty('--seal',o.sealCss);hero.dataset.occ=occ;
 document.documentElement.style.setProperty('--seal',o.sealCss);
 ribbon.visible=o.ribbon;drawLining();drawTable();drawCard();paintConfetti();drawProps();drawDecals();renderSwatches();paintSparks();sealBase=[occ==='cumple'?0x5a0b38:0];}
function drawDecals(){const o=cur(),darkPaper=new THREE.Color(o.paper).getHSL({}).l<.4,ink=darkPaper?'#efe6f5':'#4a3a2c';
 {const g=addrCanvas.getContext('2d'),w=1024,h=512;g.clearRect(0,0,w,h);g.fillStyle=ink;g.globalAlpha=.75;g.font='600 30px Manrope';g.letterSpacing='8px';g.fillText(tr("PARA"),60,150);g.letterSpacing='0px';g.globalAlpha=1;
  g.font='italic 400 104px "Cormorant Garamond"';g.fillText(customTo||tr("Familia Garza"),60,270);g.font='italic 400 58px "Cormorant Garamond"';g.globalAlpha=.8;g.fillText('Monterrey, N. L.',60,360);
  g.strokeStyle=ink;g.globalAlpha=.25;g.lineWidth=2;[290,380].forEach(y=>{g.beginPath();g.moveTo(60,y);g.lineTo(820,y);g.stroke();});addrTex.needsUpdate=true;}
 {const g=stampCanvas.getContext('2d'),w=512,h=400;g.clearRect(0,0,w,h);const sx=200,sy=40,sw=270,sh=320;
  g.fillStyle='#fbf8f2';g.fillRect(sx,sy,sw,sh);g.globalCompositeOperation='destination-out';for(let x=sx;x<=sx+sw;x+=18){g.beginPath();g.arc(x,sy,7,0,7);g.arc(x,sy+sh,7,0,7);g.fill();}for(let y=sy;y<=sy+sh;y+=18){g.beginPath();g.arc(sx,y,7,0,7);g.arc(sx+sw,y,7,0,7);g.fill();}g.globalCompositeOperation='source-over';
  const gr=g.createLinearGradient(0,sy+20,0,sy+sh-20);gr.addColorStop(0,o.sealCss);gr.addColorStop(1,new THREE.Color(o.sealCss).multiplyScalar(.6).getStyle());g.fillStyle=gr;g.fillRect(sx+20,sy+20,sw-40,sh-40);
  g.strokeStyle='#fff';g.fillStyle='#fff';g.lineWidth=9;g.textAlign='center';
  if(occ==='bodas'){g.beginPath();g.arc(sx+sw/2-26,sy+150,46,0,7);g.stroke();g.beginPath();g.arc(sx+sw/2+26,sy+150,46,0,7);g.stroke();}
  else{g.font='700 120px Sora';g.fillText(occ==='cumple'?'30':'27',sx+sw/2,sy+195);}
  g.font='600 22px Manrope';g.fillText(tr("MÉXICO"),sx+sw/2,sy+sh-44);
  // matasellos que pisa la estampilla
  const d=(customDate||o.iso||'2027-06-19').split('-'),mes=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'][(+d[1]||6)-1];
  g.strokeStyle='rgba(40,30,40,.55)';g.fillStyle='rgba(40,30,40,.6)';g.lineWidth=5;g.beginPath();g.arc(190,170,92,0,7);g.stroke();g.lineWidth=2;g.beginPath();g.arc(190,170,74,0,7);g.stroke();
  g.font='700 24px Manrope';g.fillText('MONTERREY',190,150);g.font='700 30px Manrope';g.fillText(`${+d[2]||19} ${mes} ${d[0]||2027}`,190,190);g.lineWidth=4;
  for(let k=0;k<4;k++){g.beginPath();for(let x=0;x<110;x+=4)g.lineTo(x,120+k*28+Math.sin(x/9)*6);g.stroke();}stampTex.needsUpdate=true;}}
function renderSwatches(){const box=$('swatches');box.querySelectorAll('.sw').forEach(b=>b.remove());PALS[occ].forEach((pl,i)=>{const b=document.createElement('button');b.type='button';b.className='sw';b.style.setProperty('--c',pl.c);b.setAttribute('aria-label',pl.n);b.title=pl.n;b.setAttribute('aria-pressed',String(i===palI));b.onclick=()=>{palI=i;applyOcc();draw();};box.append(b);});}
function setTheme(d){dark=d;fill.intensity=d?.35:.7;renderer.toneMappingExposure=d?1.12:1.05;if(ready)applyOcc();}
let ready=false;
setTheme(document.body.classList.contains('dark'));
addEventListener('nordra-theme',()=>{setTheme(document.body.classList.contains('dark'));draw();});

function size(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 root.scale.setScalar(isNarrow?Math.min(1.12,w/348):Math.min(1.25,w/680));root.position.set(isNarrow?0:.2,isNarrow?-.1:0,0);draw();}
addEventListener('resize',size);

// Confirmaciones: iniciales que llegan desde los bordes al teléfono
let events=[],count=12,pend=23,rsvpI=0;
function confirm(at){events.push({at,fn:()=>{const o=OCC[occ],[ini,n,p,col]=o.rsvp[rsvpI++%4];const a=document.createElement('div');a.className='ava';a.textContent=ini;a.style.background=col;stage.append(a);
 const W=stage.clientWidth,H=stage.clientHeight,side=rsvpI%4,from=side===0?[-40,H*.3]:side===1?[W+10,H*.25]:side===2?[W*.2,H+10]:[W+10,H*.75];
 const to=toStage(phone,new THREE.Vector3(0,.2,.06),camera,stage);
 a.animate([{transform:`translate(${from[0]}px,${from[1]}px) scale(1)`,opacity:0},{opacity:1,offset:.2},{transform:`translate(${to.x-17}px,${to.y-17}px) scale(.5)`,opacity:0}],{duration:still?0:1100,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'}).onfinish=()=>a.remove();
 setTimeout(()=>{$('chipName').textContent=n+(n.includes(' y ')||n.startsWith('Familia')||n.startsWith('Equipo')?tr(" confirmaron"):tr(" confirmó"));$('chipPeople').textContent='· '+p+(p>1?tr(" personas"):tr(" persona"));notifT.textContent=$('chipName').textContent;notifS.textContent=p+(p>1?tr(" personas"):tr(" persona"))+tr(" · Panel de invitados");notif.classList.add('on');buzzT=T();
  count+=p;pend=Math.max(0,pend-1);$('count').textContent=count;$('pend').textContent=pend;counter.classList.remove('pop');void counter.offsetWidth;counter.classList.add('pop');},still?0:1050);}},
 {at:at+2.4,fn:()=>notif.classList.remove('on')});}

const rot={x:0,y:0,tx:0,ty:0};const tilt=tiltControls(hero,stage,rot,{x:.18,y:.55,drag:200,max:.8});
const clock=createClock({still,finalTime:14,speed:repeat?1.6:1});
const tmpV=new THREE.Vector3(),tmpQ=new THREE.Quaternion(),tmpE=new THREE.Euler();
const notif=$('notif'),notifT=$('notifT'),notifS=$('notifS'),under=$('under'),hint3=$('hint3'),hint3t=$('hint3t');
let buzzT=-9,ghostOn=false,pullP=0;
// Abrirlo tú mismo: si estás encima (o acabas de tocar), la animación espera en el listón o el sello y luego en la tarjeta
let holdShift=0,holdAt=-1,holdsDone=0,overStage=false,lastTouch=-1e9,dragY=null;
const T=()=>clock.now()-holdShift;
function HOLDS(){const r=OCC[occ].ribbon,c=.9+(r?.6:0);return [{at:r?.86:c-.02,txt:r?(english?"Pull the ribbon":"Jala el listón"):tr("Toca el sello"),mob:r?(english?"Tap the ribbon":"Toca el listón"):tr("Toca el sello"),pt:r?[0,SEAL.y,.14]:[SEAL.x,SEAL.y,.12]},{at:c+1.0,txt:(english?"Drag up to pull it out":"Arrastra hacia arriba para sacarla"),mob:(english?"Tap to pull it out":"Toca para sacarla"),pt:[0,EH/2,.1]}];}
function holdT(){let t=T();if(still)return t;const h=HOLDS()[holdsDone];
 if(h&&t>=h.at){if(holdAt<0){if(overStage||performance.now()-lastTouch<5000){holdAt=performance.now();hint3t.textContent=isNarrow?h.mob:h.txt;hint3.classList.add('on');}else{holdsDone++;return t;}}
  holdShift+=t-h.at;t=h.at;if(performance.now()-holdAt>3600)release();}
 return t;}
function release(){if(holdAt<0)return;holdAt=-1;holdsDone++;hint3.classList.remove('on');dragY=null;}
let R=0,foldTarget=1,F=0,Fv=0,flipT=-9,flipSwap=false,wakeAt=0,typingAt=-9,scrollP=0,landedFlag=false;

function reset(){events=[];count=12;pend=23;rsvpI=0;$('count').textContent=count;$('pend').textContent=pend;chip.classList.remove('on');stage.querySelectorAll('.ava').forEach(a=>a.remove());
 R=OCC[occ].ribbon?.6:0;for(let k=0;k<14;k++)confirm(5.6+R+k*2.8);hero.classList.remove('spark');foldTarget=1;F=0;flipT=-9;flipSwap=true;typingAt=-9;}

function frame(t){
 const o=OCC[occ];
 const sp=still?0:scrollP,b1=eio(seg(sp,.08,.22)),b2=eio(seg(sp,.18,.31)),b3=eio(seg(sp,.27,.42)),b4=eio(seg(sp,.4,.5));
 // 0–0.9 s el sobre llega a la mesa y se asienta
 const land=spring(clamp(t/.6,0,1.8),7,9);
 holder.position.set(0,TABLE+.05+(1-land)*1.6,.3);env.rotation.set(-Math.PI/2+.42,0,-.06);
 envShadow.material.opacity=.55*clamp(land)*(1-seg(t,3.0+R,3.6+R));envShadow.scale.setScalar(lerp(1.6,1,clamp(land)));
 // 0.9–1.5 s (Bodas) el listón se desata
 const un=eio(seg(t,.9,1.5));bow.scale.setScalar(1-un);bow.rotation.z=un*2.4;strip.position.x=un*2.2;satin.opacity=1-seg(t,1.2,1.5);ribbon.visible=o.ribbon&&satin.opacity>.01;
 // el sello se agrieta, se parte y las mitades caen hacia la mesa
 const c0=.9+R;crackGeo.setDrawRange(0,Math.floor(15*eo(seg(t,c0,c0+.35))));crackMat.opacity=t>c0&&t<c0+.6?1:0;
 const s=seg(t,c0+.35,c0+1.0);
 halves.forEach((m,i)=>{const d=i?-1:1,b=spring(clamp(s*1.4,0,1.8),5,10);m.position.set(SEAL.x+d*b*.75,SEAL.y-b*1.05,SEAL.z+.05+Math.sin(Math.min(1,s)*Math.PI)*.35);m.rotation.set(Math.PI/2+b*.12,d*b*.18,d*b*1.1);});
 sealSide.opacity=sealTop.opacity=1-seg(t,3.0+R,3.5+R);
 if(holdAt>=0&&holdsDone===0){sealTop.emissive.set(cur().seal);sealTop.emissiveIntensity=.2+.2*Math.sin(performance.now()/170);}else{sealTop.emissive.set(sealBase[0]);sealTop.emissiveIntensity=1;}
 // migajas de cera que saltan al partirse
 const cr=t-(c0+.3);crumbs.visible=cr>0&&cr<1.6;
 {const sk=t-(c0+.32);spMat.opacity=sk>0&&sk<1.4?(1-seg(sk,.5,1.4))*.95:0;if(spMat.opacity>0){for(let i=0;i<SPN;i++){const v=spV[i],e=eo(clamp(sk/1.1));spPos.set([SEAL.x+v.x*e*.9,SEAL.y+v.y*e*.9-sk*sk*.2,SEAL.z+.08+v.z*e*.5],i*3);}spGeo.attributes.position.needsUpdate=true;}}
 if(crumbs.visible){for(let i=0;i<CRN;i++){const v=crumbV[i],tt=Math.min(cr,1.6);vv.set(SEAL.x+v.x*tt*.8,SEAL.y+v.y*tt-2.6*tt*tt,SEAL.z+.06+v.z*tt*.6);tmpE.set(tt*9+i,tt*7,i);qq.setFromEuler(tmpE);ss.setScalar((.6+(i%4)*.25)*(1-seg(cr,1.1,1.6)));m4.compose(vv,qq,ss);crumbs.setMatrixAt(i,m4);}crumbs.instanceMatrix.needsUpdate=true;}
 if(t>c0+.35&&!hero.classList.contains('spark'))hero.classList.add('spark');
 // la solapa se curva al abrirse y deja ver el forro
 bendFlap(eio(seg(t,c0+.35,c0+1.15))*(1-b4));
 // la tarjeta sale con fricción y se levanta frente a la cámara
 env.updateMatrixWorld(true);
 // al bajar: el teléfono vuelve a ser tarjeta, el sobre regresa, la tarjeta entra y la solapa se cierra
 if(holdAt<0)pullP*=.9;
 let sl=Math.max(eio(seg(t,c0+1.0,c0+2.0)),pullP*.3),up=eio(seg(t,c0+1.8,c0+2.5));
 if(sp>0&&t>c0+2.5){up=Math.min(up,1-b3);sl=Math.min(sl,1-eio(seg(sp,.32,.46)));}
 tmpV.set(0,-.05+sl*1.55,.02);env.localToWorld(tmpV);root.worldToLocal(tmpV);
 const target=new THREE.Vector3(0,.55,1.25);
 env.getWorldQuaternion(tmpQ);tmpE.setFromQuaternion(tmpQ);
 if(F<.001||t<c0+3.4||sp>0){cardG.position.set(lerp(tmpV.x,target.x,up),lerp(tmpV.y,target.y,up),lerp(tmpV.z,target.z,up));cardG.rotation.set(lerp(tmpE.x,-.22,up),lerp(tmpE.y,0,up),lerp(tmpE.z,0,up));}
 cardG.visible=t>c0+.95&&b4<.6;cardMat.opacity=1;
 cardShadow.position.set(cardG.position.x,TABLE+.011,cardG.position.z+.1);cardShadow.material.opacity=cardG.visible?.45*(1-F):0;cardShadow.scale.setScalar(lerp(.8,1.6,up));
 // el sobre se desliza hacia atrás y se desvanece
 const away=eio(seg(t,c0+2.2,c0+2.9))*(1-b2);holder.position.z=.3-away*1.6;holder.position.y-=away*.05;
 const po=1-away;paperMat.opacity=liningMat.opacity=flapFront.opacity=flapBack.opacity=addrMat.opacity=stampMat.opacity=po;env.visible=po>.01&&!ghostOn;
 props.forEach((pr,i)=>{pr.material.opacity=seg(t,.2+i*.2,1.2+i*.2)*(dark?.55:.8);});
 // confeti al salir la tarjeta
 const ct=t-(c0+1.6);conf.visible=confShadow.visible=ct>0;
 if(ct>0){const fade=1-seg(ct,5,7);for(let i=0;i<CN;i++){const v=cv[i],cc=cs[i];const tt=Math.min(ct,6);let y=.3+v.y*tt*.55-1.3*tt*tt;const floor=TABLE+.03;let settled=false;if(y<floor){y=floor;settled=true;}
  const k=settled?0:1,x=v.x*Math.min(tt,1.6)*.9+Math.sin(tt*2+cc.ph)*.12*k,z=v.z*Math.min(tt,1.6)*.6;vv.set(x,y,z);
  // al posarse: boca arriba, con una inclinación propia (como si cayera sobre otros) y girado al azar
  if(settled)tmpE.set(-Math.PI/2+cc.tilt,cc.tilt*.6,cc.spin,'YXZ');else tmpE.set(cc.r.x+cc.w.x*tt,cc.r.y+cc.w.y*tt,cc.r.z+cc.w.z*tt,'XYZ');
  qq.setFromEuler(tmpE);ss.setScalar(fade);m4.compose(vv,qq,ss);conf.setMatrixAt(i,m4);
  // sombra en la mesa: se aprieta y oscurece al acercarse
  const hgt=Math.max(0,y-floor),sh=fade*clamp(1-hgt/1.2)*(1+.0);vv.set(x+.03,TABLE+.012,z+.02);tmpE.set(-Math.PI/2,0,0,'XYZ');qq.setFromEuler(tmpE);ss.set(sh*(1+hgt),sh*(1+hgt),1);m4.compose(vv,qq,ss);confShadow.setMatrixAt(i,m4);}
  conf.instanceMatrix.needsUpdate=confShadow.instanceMatrix.needsUpdate=true;}
 // la tarjeta se dobla como origami y se vuelve el teléfono
 const auto=seg(t,c0+2.7,c0+3.6);
 // después de la entrada, el pliegue va con resorte: al desdoblarse, la mitad se pasa un poco y rebota
 if(still)F=1;else if(t<c0+3.6){F=auto;Fv=0;}else{Fv=Fv*.8+(foldTarget-F)*.045;F+=Fv;}
 const Fkeep=F;if(sp>0)F=Math.min(F,1-b1);
 const f1=eio(seg(F,0,.45)),f2=eio(seg(F,.4,.75)),f3=eio(seg(F,.6,1)),over=F<0?-F*2.4:0;
 rightPivot.rotation.y=-Math.PI*.98*f1+over;
 creaseMat.opacity=.55*Math.sin(f1*Math.PI)+.25*f1*(1-f2)+over*.6;creaseL.visible=creaseR.visible=F<.6;
 cardG.rotation.z=f2*Math.PI/2;cardG.scale.setScalar(lerp(1,.7,f2)*(1-f3*.5));cardMat.opacity=cardBackMat.opacity=cardEdgeMat.opacity=1-seg(F,.75,.95);cardL.visible=cardR.visible=F<.97;
 // destello del foil: cruza al escribir, al salir la tarjeta, y sigue al cursor cuando estás encima
 glint.visible=F<.2;const gx=t-typingAt<.8?lerp(-.2,1.2,(t-typingAt)/.8):t>c0+2.3&&t<c0+3.1?lerp(-.2,1.2,(t-c0-2.3)/.8):pointer.on?(pointer.x*.5+.5)*1.1-.05:-1;
 glintMat.uniforms.uX.value+=(gx-glintMat.uniforms.uX.value)*(pointer.on&&t-typingAt>.8?.15:1);
 foilLight.intensity=F<.3?(pointer.on?1.6:.5)*(1-F/.3):0;foilLight.position.set(cardG.position.x+(pointer.on?pointer.x*1.3:Math.sin(t*.8)*.8),cardG.position.y+(pointer.on?pointer.y*.9:.3),cardG.position.z+.9);
 flash.position.copy(cardG.position).add(new THREE.Vector3(0,0,.1));flashMat.opacity=Math.sin(seg(F,.55,1)*Math.PI)*.5;
 phone.visible=F>.6;const pa=eio(seg(F,.65,1));frameMat.opacity=pa;screenMat.opacity=pa;
 phone.position.set(0,.55+Math.sin(t*.9)*.04*pa,1.25);phone.scale.setScalar((isNarrow?1.32:1.12)*lerp(.55,1,pa));
 phoneShadow.material.opacity=.5*pa;
 // el teléfono despierta y reproduce la apertura real, luego recorre la invitación
 if(t>c0&&!still)prime(occ);
 if(F>.95&&!wakeAt){wakeAt=t;playOpening(occ);}if(F<.9)wakeAt=0;
 const wt=wakeAt?t-wakeAt:0;const lum=wakeAt?eo(seg(wt,0,.5)):0;screenMat.color.setScalar(still?1:lum);
 const vt=vids[occ],vid=vt?.userData.video,tall=talls[occ],VD=vid&&isFinite(vid.duration)&&vid.duration>0?vid.duration:6;
 let map=covers[occ];const custom=(customName||customDate)&&!forceVideo;
 if(custom&&(still||wakeAt))map=personal(occ)||map;
 else if(!still&&wakeAt){if(vid&&wt<VD&&!vid.ended){map=vid.readyState>=2&&vid.currentTime>0?vt:(firsts[occ]||map);if(vid.paused&&!clock.paused)vid.play()?.catch?.(()=>{});}
  else if(tall&&tall.image&&tall.userData.frac<1){map=tall;const f=Math.min(1,tall.userData.frac),k=eio(seg(wt-VD,1,9))*(1-eio(seg(wt-VD,12,18)));tall.offset.y=1-f-(1-f)*.65*k;}}
 if(screenMat.map!==map){screenMat.map=map;screenMat.needsUpdate=true;}
 pGlareMat.uniforms.uT.value=wakeAt?-.6+(wt%5)/5*2.6:-1;
 // cambio de ocasión con giro del teléfono
 const fl=seg(t,flipT,flipT+.9);if(fl>.5&&!flipSwap){flipSwap=true;applyOcc();wakeAt=t;playOpening(occ);}
 tilt();
 const bz=t>buzzT&&t<buzzT+.4?Math.sin((t-buzzT)*70)*.03*(1-seg(t,buzzT,buzzT+.4)):0;
 phone.rotation.set(-.12+rot.x+scrollP*.5,rot.y+Math.sin(t*.5)*.05*pa+eio(fl)*Math.PI*2*(fl<1?1:0),bz);
 // luz de cada ocasión
 key.color.set(o.key[0]);key.intensity=(dark?.7:1)*o.key[1]*(dark&&occ==='bodas'?1+.08*Math.sin(t*9.1)*Math.sin(t*3.7):1);key.position.set(...o.key[2]);
 candles.forEach((l,i)=>{l.intensity=(occ==='bodas'?(dark?3.2:1.4):0)*(1+.15*Math.sin(t*(7+i*3.3)));});
 party.forEach((l,i)=>{const a=t*.8+i*2.1;l.position.set(Math.cos(a)*2.6,1.2+Math.sin(a*1.3)*.5,Math.sin(a)*1.8+1);l.intensity=occ==='cumple'?(dark?3:2.4):0;});
 // etiquetas
 for(const e of events)if(!e.done&&t>=e.at){e.done=true;e.fn();}
 counter.classList.toggle('on',F>.9&&t>c0+3.8&&sp<.08);chip.style.visibility='hidden';under.classList.toggle('on',F>.9&&t>c0+3.5&&sp<.08);if(!under.classList.contains('on'))closePops();
 // el aviso de confirmación va dentro de la pantalla del teléfono
 if(phone.visible){const r=screenRect(scr,PW-.1,PH-.1,camera,stage),sb=stage.getBoundingClientRect();notif.style.left=(r.left-sb.left+r.width*.06)+'px';notif.style.top=(r.top-sb.top+r.height*.05)+'px';notif.style.width=(r.width*.88)+'px';}
 if(holdAt>=0){const h=HOLDS()[holdsDone];if(h)place(hint3,env,new THREE.Vector3(...h.pt),camera,stage,0,-56,'center');}
 if(isNarrow){place(counter,phone,new THREE.Vector3(PW/2,PH/2,.06),camera,stage,-70,-56);place(chip,phone,new THREE.Vector3(-PW/2,-PH/2+.6,.06),camera,stage,-50,0);}
 else{place(counter,phone,new THREE.Vector3(PW/2,PH/2-.1,.06),camera,stage,24,-10);place(chip,phone,new THREE.Vector3(PW/2,.1,.06),camera,stage,24,-20);}
 place(under,phone,new THREE.Vector3(0,-PH/2,.06),camera,stage,0,14,'center');
 for(const pp of [sharePop,qrPop])if(pp.classList.contains('on'))place(pp,phone,new THREE.Vector3(0,-PH/2,.06),camera,stage,0,8-pp.offsetHeight,'center');
 followGlow(hero,stage,F>.5?phone:holder,camera);
 F=Fkeep;
}
function draw(){frame(holdT());renderer.render(scene,camera);}
let raf=0;function loop(){cancelAnimationFrame(raf);draw();if(!clock.paused&&!still)raf=requestAnimationFrame(loop);}
// Visitas repetidas: la tarjeta ya viene saliendo del sobre y se dobla enseguida
const skipTo=()=>repeat&&!still?(OCC[occ].ribbon?.6:0)+.9+2.4:0;
function start(from=0){reset();wakeAt=0;holdShift=0;holdAt=-1;hint3.classList.remove('on');holdsDone=HOLDS().filter(h=>h.at<from).length;hero.classList.add('go');stage.classList.add('ready');clock.start(from);hero.classList.remove('hero-paused');cancelAnimationFrame(raf);if(still){events.slice(0,2).forEach(e=>{e.done=true;e.fn();});setTimeout(draw,1200);}loop();}

// Clic en el teléfono: abre la invitación
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
function hit(e){if(!phone.visible||F<.95)return false;const b=stage.getBoundingClientRect();ndc.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(ndc,camera);return ray.intersectObjects(phone.children,false).length>0;}
let downAt=null;
stage.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')stage.classList.toggle('hot',hit(e));});
stage.addEventListener('pointerdown',e=>{downAt={x:e.clientX,y:e.clientY};lastTouch=performance.now();
 if(holdAt>=0){if(holdsDone===0||e.pointerType!=='mouse')release();else dragY=e.clientY;}});
stage.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')overStage=true;});stage.addEventListener('pointerleave',()=>{overStage=false;});
addEventListener('pointermove',e=>{if(dragY===null||holdAt<0)return;const dy=dragY-e.clientY;pullP=clamp(dy/90);if(dy>80)release();});
addEventListener('pointerup',()=>{if(dragY!==null&&holdAt>=0&&pullP<.15)release();dragY=null;});
stage.addEventListener('pointerup',e=>{if(!downAt||Math.hypot(e.clientX-downAt.x,e.clientY-downAt.y)>8||e.target.closest('a,.counter'))return;if(hit(e)){forceVideo=true;wakeAt=T();playOpening(occ);}});

// Al bajar, el teléfono se inclina y entrega la invitación a su tarjeta
const ghost=$('ghost'),dir=document.querySelector('.inv-directory');
let target=document.querySelector(`.dir-shot[data-occ="${occ}"]`);
scrollFlight({hero,startEl:stage,ghost,target:()=>target,lag:.5,fromRect:()=>screenRect(back,EW,EH,camera,stage),onProgress:p=>{scrollP=p;if(clock.paused||still)draw();},
 onState:s=>{ghostOn=s===1;ghost.style.backgroundImage=`url(${OCC[occ].screen})`;document.querySelectorAll('.dir-shot').forEach(d=>{if(d!==target)d.style.opacity=1;});scr.visible=s===0;dir.classList.toggle('landed',s===2);}});
addEventListener('scroll',()=>{const p=clamp(scrollY/(hero.offsetHeight*.9));root.position.z=-p*1.6;renderer.domElement.style.opacity=String(1-p*.5);if(clock.paused||still)draw();},{passive:true});

// Ocasión: si la tarjeta ya es teléfono, el teléfono gira y cambia; si no, el sobre empieza de nuevo
document.querySelectorAll('.pill').forEach(b=>{b.addEventListener('pointerenter',()=>ensure(b.dataset.occ));b.onclick=()=>{if(occ===b.dataset.occ)return;occ=b.dataset.occ;customName='';namesIn.value='';
 document.querySelectorAll('.pill').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));target=document.querySelector(`.dir-shot[data-occ="${occ}"]`);ensure(occ);
 if(F>.95&&!still){flipT=T();flipSwap=false;}else{applyOcc();start();}};});
// Escribir: la tarjeta vuelve al frente y las letras aparecen en foil
const dateOut=$('dateOut');
function editing(){forceVideo=false;customName=namesIn.value.trim();customDate=dateIn.value;drawCard();drawSeal();const fd=fmtDate(customDate);dateOut.textContent=fd?tr("Se verá: ")+fd:'';dateOut.classList.toggle('on',!!fd);typingAt=T();foldTarget=0;clearTimeout(editing.t);editing.t=setTimeout(()=>{foldTarget=1;},1800);}
namesIn.addEventListener('input',editing);$('to').addEventListener('input',e=>{customTo=e.target.value.trim();drawDecals();});dateIn.addEventListener('input',editing);namesIn.addEventListener('focus',()=>{if(T()>3)foldTarget=0;});
$('pause').onclick=e=>{const p=clock.toggle();const v=vids[occ]?.userData.video;if(v){if(p)v.pause();else if(wakeAt)v.play()?.catch?.(()=>{});}e.currentTarget.querySelector('span').textContent=p?tr("Reanudar movimiento"):tr("Pausar movimiento");if(!p)loop();};
// Mini panel: también se abre con Enter o Espacio y con un toque
counter.addEventListener('keydown',e=>{if(e.target!==counter||(e.key!=='Enter'&&e.key!==' '))return;e.preventDefault();counter.classList.toggle('open');});
counter.addEventListener('click',e=>{if(!e.target.closest('a'))counter.classList.toggle('open');});
counter.addEventListener('blur',e=>{if(!counter.contains(e.relatedTarget))counter.classList.remove('open');});
const sharePop=$('sharePop'),qrPop=$('qrPop'),shareBtn=$('shareBtn'),qrBtn=$('qrBtn');
function closePops(){[sharePop,qrPop].forEach(p=>p.classList.remove('on'));[shareBtn,qrBtn].forEach(b=>b.setAttribute('aria-expanded','false'));}
function fillShare(){const o=OCC[occ],name=customName||o.name;$('waImg').src=o.screen;
 $('waTitle').textContent=occ==='bodas'?name+tr(" · Nuestra boda"):occ==='cumple'?(customName?name+tr(" · Mi cumpleaños"):tr("Camila cumple 30")):name+tr(" · Te apartamos un lugar");
 $('waDesc').textContent=occ==='bodas'?tr("Te invitamos a celebrar con nosotros. Confirma tu asistencia aquí."):occ==='cumple'?tr("Hay algo para ti. Confirma si vienes."):tr("Confirma tu lugar y recibe tu gafete.");$('waLink').textContent=tryLink.href.replace(/^https?:\/\//,'');}
let qrLib=null;
function loadQR(){return qrLib||(qrLib=import('qrcode'));}
function togglePop(pop,btn,fill){const open=!pop.classList.contains('on');closePops();if(!open)return;fill();pop.classList.add('on');btn.setAttribute('aria-expanded','true');draw();}
shareBtn.onclick=()=>togglePop(sharePop,shareBtn,fillShare);
qrBtn.onclick=()=>togglePop(qrPop,qrBtn,()=>{const box=$('qrBox');box.textContent=tr("Cargando…");loadQR().then(async module=>{box.innerHTML=await (module.default||module).toString(tryLink.href,{type:'svg',errorCorrectionLevel:'M',margin:2});}).catch(()=>{box.textContent=tryLink.href;});});
addEventListener('keydown',e=>{if(e.key==='Escape')closePops();});
addEventListener('pointerdown',e=>{if(!e.target.closest('.popv,#under'))closePops();});
$('replay').onclick=()=>{hero.classList.remove('go');void hero.offsetWidth;start();};

document.querySelectorAll('.pill').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.occ===occ)));
size();
Promise.all([document.fonts.load('italic 400 92px "Cormorant Garamond"'),document.fonts.load('500 96px Sora'),document.fonts.ready]).then(()=>{
 ready=true;applyOcc();draw();
 if(still||!isNarrow){start(skipTo());return;}
 hero.classList.add('go');stage.classList.add('ready');draw();const io=new IntersectionObserver(es=>{if(es[0].isIntersecting){io.disconnect();start(skipTo());}},{threshold:.35});io.observe(stage);
});
let backgroundPaused=false;
function syncVisibility(){const hidden=document.hidden||document.body.classList.contains('has-page-frame')||window.frameElement?.getAttribute('aria-hidden')==='true';if(hidden&&!clock.paused){backgroundPaused=true;clock.toggle();cancelAnimationFrame(raf);Object.values(vids).forEach(t=>t.userData.video.pause());}else if(!hidden&&backgroundPaused){backgroundPaused=false;if(clock.paused)clock.toggle();loop();}}
document.addEventListener('visibilitychange',syncVisibility);
new MutationObserver(syncVisibility).observe(document.body,{attributes:true,attributeFilter:['class']});


matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches&&!clock.paused){clock.toggle();cancelAnimationFrame(raf);hero.classList.add('hero-still');Object.values(vids).forEach(t=>t.userData.video.pause());}});
