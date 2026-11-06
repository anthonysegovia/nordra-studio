// Scene ported from the approved 2026-11-05 mockup. Geometry, shaders and timeline retain its values.

import * as THREE from 'three';
import { prepareRingsPrograms, preparePMREM, yieldSetup } from './prepare-programs.js';

export async function createRingsScene(stage, options = {}) {
const hero=stage.closest('.rings-hero');
const events=new AbortController(), envTargets=[];
let disposed=false, frameId=0, active=false, currentDark=Boolean(options.dark);
const listen=(target,type,fn,opts={})=>target.addEventListener(type,fn,{...opts,signal:events.signal});
function releaseTree(tree){tree.traverse(o=>{o.geometry?.dispose();for(const m of (Array.isArray(o.material)?o.material:[o.material]))m?.dispose();});}
async function environment(env,sigma){await yieldSetup();if(pmremPrepared){renderer.setRenderTarget(pmrem._pingPongRenderTarget);await renderer.compileAsync(env,new THREE.PerspectiveCamera(90,1,.1,100));renderer.setRenderTarget(null);await yieldSetup();}const rt=pmrem.fromScene(env,sigma);envTargets.push(rt);releaseTree(env);return rt.texture;}
let reduce=false;
const wideQ=matchMedia('(min-width:901px)'),narrowQ=matchMedia('(max-width:700px)');
const LITE=narrowQ.matches;
const renderer=new THREE.WebGLRenderer({canvas:options.context?.canvas,context:options.context,antialias:false,alpha:true,premultipliedAlpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,LITE?1.5:2));
renderer.toneMapping=THREE.NoToneMapping; // tone mapping happens in the composite pass
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.setClearColor(0x000000,0);renderer.autoClear=false;
stage.appendChild(renderer.domElement);

const scene=new THREE.Scene();
const pmrem=new THREE.PMREMGenerator(renderer);
const camera=new THREE.PerspectiveCamera(30,1,0.05,80);
const pmremPrepared=await preparePMREM(renderer,pmrem);

// ---------- Helpers ----------
const clamp=t=>Math.min(1,Math.max(0,t));
const ease=t=>1-Math.pow(1-t,3);
const inOut=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const settle=t=>{const c=1.4;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)};
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
const lerp=(a,b,t)=>a+(b-a)*t;
function dataTexture(n,fn){const d=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const [r,g,b,a]=fn((x+.5)/n,(y+.5)/n);const k=(y*n+x)*4;d[k]=r;d[k+1]=g;d[k+2]=b;d[k+3]=a;}const t=new THREE.DataTexture(d,n,n,THREE.RGBAFormat);t.magFilter=t.minFilter=THREE.LinearFilter;t.needsUpdate=true;return t;}
const softDot=dataTexture(64,(u,v)=>{const r=Math.hypot(u-.5,v-.5)*2;const a=Math.pow(clamp(1-r),2.2);return [255,255,255,255*a];});
const starTex=dataTexture(64,(u,v)=>{const x=Math.abs(u-.5)*2,y=Math.abs(v-.5)*2,r=Math.hypot(x,y);const rays=Math.max(Math.pow(clamp(1-x),8)*Math.pow(clamp(1-y*9),2),Math.pow(clamp(1-y),8)*Math.pow(clamp(1-x*9),2));const core=Math.pow(clamp(1-r*2.2),2);return [255,255,255,255*clamp(rays+core)];});
const bokehTex=dataTexture(128,(u,v)=>{const r=Math.hypot(u-.5,v-.5)*2;const body=smooth(1,.9,r);const rim=.55+.45*smooth(.55,.93,r);const a=body*rim;return [255,255,255,255*a];});

// ---------- Light ----------
async function studio(dark){
 const env=new THREE.Scene();
 env.add(new THREE.Mesh(new THREE.SphereGeometry(10,48,24),new THREE.MeshBasicMaterial({side:THREE.BackSide,color:dark?'#2a211b':'#c2a888'})));
 const f=new THREE.Mesh(new THREE.CircleGeometry(10,48),new THREE.MeshBasicMaterial({color:dark?'#120e0b':'#6f5a45'}));f.rotation.x=-Math.PI/2;f.position.y=-3;env.add(f);
 const box=(w,h,x,y,z,c,i)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(i),side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);env.add(m);};
 box(7,1.6,0,6,2.5,'#fff4e2',dark?2.6:3.4);box(1.4,7,-6,.5,2.5,'#ffe9cf',dark?2:2.8);box(1.4,7,6,1,-1.5,'#fff8ee',dark?2.2:3);box(6,.9,0,1.2,-7,'#ffe3c2',1.8);box(3,3,2,-1,6,'#fff1dd',dark?1.2:1.8);
 return environment(env,0.02);
}
async function gemStudio(){const env=new THREE.Scene();env.add(new THREE.Mesh(new THREE.SphereGeometry(10,32,16),new THREE.MeshBasicMaterial({side:THREE.BackSide,color:'#16110d'})));
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2,e=(i%3-1)*.6;const m=new THREE.Mesh(new THREE.PlaneGeometry(.9,.35),new THREE.MeshBasicMaterial({color:new THREE.Color(i%4?'#fff7ea':'#ffe2b0').multiplyScalar(6),side:THREE.DoubleSide}));m.position.set(Math.cos(a)*6,Math.sin(e)*6+1.5,Math.sin(a)*6);m.lookAt(0,0,0);env.add(m);}
 return environment(env,0);}
const envGem=await gemStudio();await yieldSetup();const envLight=await studio(false);await yieldSetup();const envDark=await studio(true);await yieldSetup();scene.environment=envLight;
const key=new THREE.DirectionalLight('#fff1dc',1.4);key.position.set(3,4,5);
const fill=new THREE.DirectionalLight('#ffe2c4',.6);fill.position.set(-4,1,2);
const glint=new THREE.PointLight('#fff6e6',0,8,1.6);
for(const l of [key,fill,glint]){l.layers.enableAll();scene.add(l);}

// ---------- Rings: A is her engagement ring (upright, stone on top); B is his band that closes around it ----------
function band(radius,tube,width){const g=new THREE.TorusGeometry(radius,tube,72,240);g.scale(1,1,width);return g;}
const gold=new THREE.MeshPhysicalMaterial({color:'#e8c283',metalness:1,roughness:.12,clearcoat:.35,clearcoatRoughness:.2,envMapIntensity:1.15});
const champagne=new THREE.MeshPhysicalMaterial({color:'#e9c49a',metalness:1,roughness:.14,clearcoat:.35,clearcoatRoughness:.2,envMapIntensity:1.15});
const RA=.74,TA=.064,RB=.8;
const ringA=new THREE.Mesh(band(RA,TA,2.3),champagne);ringA.position.set(-.38,0,0);
const ringB=new THREE.Mesh(band(RB,.072,2.5),gold);ringB.position.set(.38,0,0);
const pair=new THREE.Group();pair.add(ringA,ringB);
const holder=new THREE.Group();holder.add(pair);scene.add(holder);
const THETA=1.32;

// Diamond
const gem=new THREE.Group();
const gemProfile=[[0,.16],[.11,.16],[.19,.09],[.2,.07],[.2,.055],[0,-.13]].map(([x,y])=>new THREE.Vector2(x,y));
const gemGeo=new THREE.LatheGeometry(gemProfile,24).toNonIndexed();gemGeo.computeVertexNormals();
const diamondMat=new THREE.MeshPhysicalMaterial({envMap:envGem,color:'#ffffff',metalness:0,roughness:0,transmission:.35,ior:2.42,thickness:.6,dispersion:LITE?3:6,specularIntensity:1,envMapIntensity:4.2,flatShading:true,attenuationColor:'#fffaf0',attenuationDistance:2});
const diamond=new THREE.Mesh(gemGeo,diamondMat);diamond.scale.setScalar(1.15);gem.add(diamond);
const collet=new THREE.Mesh(new THREE.CylinderGeometry(.1,.06,.08,24),champagne);collet.position.y=-.1;collet.scale.setScalar(1.35);gem.add(collet);
// Claws: rise from the collet to the girdle and fold over the crown edge.
for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4,c=Math.cos(a),sn=Math.sin(a);
 const claw=new THREE.CatmullRomCurve3([new THREE.Vector3(c*.1,-.14,sn*.1),new THREE.Vector3(c*.2,-.03,sn*.2),new THREE.Vector3(c*.238,.075,sn*.238),new THREE.Vector3(c*.2,.13,sn*.2)]);
 gem.add(new THREE.Mesh(new THREE.TubeGeometry(claw,24,.016,10),champagne));
 const tip=new THREE.Mesh(new THREE.SphereGeometry(.022,16,12),champagne);tip.position.set(c*.2,.13,sn*.2);gem.add(tip);}
ringA.add(gem);gem.position.set(0,RA+TA+.15,0);
const sparkles=[];const sparkleHues=['#ffffff','#fff2c8','#d9f1ff','#ffd6ec','#e7ffd6'];
for(let i=0;i<5;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:starTex,color:sparkleHues[i],transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));const a=i/5*Math.PI*2;s.position.set(Math.cos(a)*.1,.1+Math.random()*.06,Math.sin(a)*.1);s.userData.phase=Math.random()*6;s.scale.setScalar(.001);gem.add(s);sparkles.push(s);}

// Engraving inside ring A
const engravingMat=new THREE.MeshBasicMaterial({color:'#ffcf8a',transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.BackSide});
const engraving=new THREE.Mesh(new THREE.CylinderGeometry(RA-TA-.002,RA-TA-.002,.1,128,1,true),engravingMat);engraving.rotation.x=Math.PI/2;ringA.add(engraving);
function buildEngraving(){
 const c=document.createElement('canvas');c.width=2048;c.height=96;const x=c.getContext('2d');
 x.fillStyle='#fff';x.font='italic 58px "Cormorant Wedding"';x.textBaseline='middle';x.textAlign='center';
 const text='V & S  ·  19 · 06 · 2027';for(let i=0;i<3;i++)x.fillText(text,(i+.5)*2048/3,50);
 const img=x.getImageData(0,0,2048,96).data,d=new Uint8Array(img.length);
 for(let y=0;y<96;y++)for(let k=0;k<2048*4;k++)d[(95-y)*2048*4+k]=img[y*2048*4+k];
 const t=new THREE.DataTexture(d,2048,96,THREE.RGBAFormat);t.wrapS=THREE.RepeatWrapping;t.repeat.x=-1;t.magFilter=t.minFilter=THREE.LinearFilter;t.needsUpdate=true;
 engravingMat.map=t;engravingMat.needsUpdate=true;
}

// Thread of light that ends at the stone
// Trail of light, like a pen writing: threads through her ring, then through his, and dissolves into falling gold.
// Path in pair space: through the centre of ring A (z axis), then through the open side of ring B's hole (≈ y axis).
const threadPts=[[-2.8,1.5,1.6],[-1.6,.7,1.0],[-.62,.12,.45],[-.4,.02,0],[-.25,-.12,-.55],[.1,-.55,-.52],[.62,-.72,.2],[.72,0,.32],[.82,.6,.2],[.55,1.12,.36],[.08,1.42,.55]].map(p=>new THREE.Vector3(...p));
const threadCurve=new THREE.CatmullRomCurve3(threadPts,false,'catmullrom',.5);
const TAIL=.3,TRAIL_R=.028;
const trailMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneFactor,blendSrcAlpha:THREE.OneFactor,blendDstAlpha:THREE.OneFactor,
 uniforms:{uHead:{value:-1},uR:{value:TRAIL_R},uTail:{value:TAIL},uColor:{value:new THREE.Color('#ffc978').multiplyScalar(2.4)},uCore:{value:new THREE.Color('#fff4dc').multiplyScalar(3.2)}},
 vertexShader:`uniform float uHead,uR,uTail;varying float vF;varying float vEdge;
 void main(){float u=uv.x;float f=clamp((u-(uHead-uTail))/uTail,0.,1.)*step(u,uHead);vF=f;
  // calligraphic swell: thin at the tail, full near the head, a fine point at the tip
  float tip=smoothstep(0.,.025,uHead-u);float w=pow(f,1.6)*tip*(.35+.65*sin(u*3.14159));
  vec3 c=position-normal*uR;vec3 p=c+normal*uR*max(w,.0);
  vec4 mv=modelViewMatrix*vec4(p,1.);vEdge=abs(dot(normalize(normalMatrix*normal),normalize(-mv.xyz)));gl_Position=projectionMatrix*mv;}`,
 fragmentShader:`uniform vec3 uColor,uCore;varying float vF;varying float vEdge;void main(){if(vF<=0.)discard;float core=pow(vEdge,3.);vec3 c=mix(uColor,uCore,core*vF);float k=clamp(pow(vF,1.4)*(.35+.65*vEdge),0.,1.);gl_FragColor=vec4(c*k,k);}`});
const trail=new THREE.Mesh(new THREE.TubeGeometry(threadCurve,700,TRAIL_R,10),trailMat);trail.frustumCulled=false;
const threadHead=new THREE.Sprite(new THREE.SpriteMaterial({map:softDot,color:new THREE.Color('#fff0c8').multiplyScalar(3.4),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));threadHead.scale.setScalar(.26);
const headStar=new THREE.Sprite(new THREE.SpriteMaterial({map:starTex,color:new THREE.Color('#fff6e4').multiplyScalar(2.6),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));headStar.scale.setScalar(.34);
const threadGroup=new THREE.Group();threadGroup.add(trail,threadHead,headStar);pair.add(threadGroup);
// Gold motes shed by the pen; at the end they all drift down and settle on the silk.
const MOTES=LITE?160:360;const motePos=new Float32Array(MOTES*3),moteVel=new Float32Array(MOTES*3),moteAge=new Float32Array(MOTES).fill(99),moteLife=new Float32Array(MOTES);let moteNext=0;
const moteGeo=new THREE.BufferGeometry();moteGeo.setAttribute('position',new THREE.BufferAttribute(motePos,3));moteGeo.setAttribute('aA',new THREE.BufferAttribute(new Float32Array(MOTES),1));
const moteMat=new THREE.ShaderMaterial({uniforms:{uPixel:{value:1},uColor:{value:new THREE.Vector3(1.9,1.45,.8)}},transparent:true,depthWrite:false,blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneFactor,blendSrcAlpha:THREE.OneFactor,blendDstAlpha:THREE.OneFactor,
 vertexShader:`attribute float aA;uniform float uPixel;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;vA=aA;gl_PointSize=(1.6+aA*1.4)*uPixel*(16./-mv.z);}`,
 fragmentShader:`uniform vec3 uColor;varying float vA;void main(){float r=length(gl_PointCoord-.5)*2.;float a=pow(clamp(1.-r,0.,1.),2.);float k=clamp(a*vA,0.,1.);gl_FragColor=vec4(uColor*k,k);}`});
const motes=new THREE.Points(moteGeo,moteMat);motes.frustumCulled=false;scene.add(motes);
const motePt=new THREE.Vector3();
function emitMote(u,spread,fall){threadCurve.getPointAt(clamp(u),motePt);pair.localToWorld(motePt);const i=moteNext;moteNext=(moteNext+1)%MOTES;
 motePos.set([motePt.x+(Math.random()-.5)*spread,motePt.y+(Math.random()-.5)*spread,motePt.z+(Math.random()-.5)*spread],i*3);
 moteVel.set([(Math.random()-.5)*.12,fall?-(.12+Math.random()*.18):(Math.random()-.5)*.1,(Math.random()-.5)*.12],i*3);moteAge[i]=0;moteLife[i]=fall?3.2+Math.random()*1.4:1.2+Math.random()*1.2;}

// Gold dust with depth-of-field: out-of-focus grains open into soft discs (bokeh).
const DUST=LITE?520:1500;
const dGeo=new THREE.BufferGeometry();
const seeds=new Float32Array(DUST*4),targets=new Float32Array(DUST*3),pos=new Float32Array(DUST*3);
for(let i=0;i<DUST;i++){
 seeds.set([1.1+Math.pow(Math.random(),.7)*2.6,Math.random()*Math.PI*2,(Math.random()-.5)*2.4,(.04+Math.random()*.1)*(Math.random()<.5?-1:1)],i*4);
 const onA=Math.random()<.52,u=Math.random()*Math.PI*2,j=(Math.random()-.5)*.08;
 if(onA){targets.set([-.38+Math.cos(u)*(RA+j),Math.sin(u)*(RA+j),(Math.random()-.5)*.3],i*3);}
 else{const lx=Math.cos(u)*(RB+j),ly=Math.sin(u)*(RB+j),lz=(Math.random()-.5)*.28;targets.set([.38+lx,ly*Math.cos(THETA)-lz*Math.sin(THETA),ly*Math.sin(THETA)+lz*Math.cos(THETA)],i*3);}
}
dGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));dGeo.setAttribute('aSeed',new THREE.BufferAttribute(seeds,4));dGeo.setAttribute('aTarget',new THREE.BufferAttribute(targets,3));
dGeo.boundingSphere=new THREE.Sphere(new THREE.Vector3(),8);
const dustMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
 uniforms:{uTime:{value:0},uGather:{value:0},uPixel:{value:1},uPointer:{value:new THREE.Vector3(99,99,99)},uPush:{value:0},uSpeed:{value:1},uAlpha:{value:0},uDark:{value:0},uFocus:{value:7},uAperture:{value:.4}},
 vertexShader:`attribute vec4 aSeed;attribute vec3 aTarget;uniform float uTime,uGather,uPixel,uPush,uSpeed,uAlpha,uFocus,uAperture;uniform vec3 uPointer;varying float vA;varying float vHot;varying float vCoc;
 void main(){float ang=aSeed.y+uTime*aSeed.w*uSpeed;vec3 orbit=vec3(cos(ang)*aSeed.x,aSeed.z+sin(uTime*.3+aSeed.y*3.)*.12,sin(ang)*aSeed.x*.55-.3);
 float g=uGather*smoothstep(0.,1.,fract(aSeed.y*7.31)*.4+.6);vec3 p=mix(orbit,aTarget,g);
 vec3 d=p-uPointer;float dist=length(d);p+=normalize(d+1e-4)*uPush*.45*smoothstep(1.,0.,dist);
 vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
 float coc=clamp(abs(-mv.z-uFocus)*uAperture,0.,2.6);vCoc=coc;
 float tw=.55+.45*sin(uTime*(1.5+fract(aSeed.y*3.7)*2.)+aSeed.y*13.);vA=tw*uAlpha/(1.+coc*coc*1.4);vHot=g;
 gl_PointSize=(1.1+fract(aSeed.x*9.1)*1.6+g*.8)*(1.+coc*1.8)*uPixel*(22./-mv.z);}`,
 fragmentShader:`varying float vA;varying float vHot;varying float vCoc;uniform float uDark;void main(){vec2 c=gl_PointCoord-.5;float r=length(c)*2.;
 float sharp=pow(clamp(1.-r,0.,1.),1.8);float disc=smoothstep(1.,.86,r)*(.7+.3*smoothstep(.5,.9,r));float a=mix(sharp,disc,clamp(vCoc*.6,0.,1.));
 vec3 edge=mix(vec3(.62,.43,.17),vec3(.95,.74,.38),uDark);vec3 core=vec3(1.4,1.25,1.);vec3 col=mix(edge,core,pow(sharp,2.)*(.6+.4*vHot));gl_FragColor=vec4(col,a*vA);}`});
const dust=new THREE.Points(dGeo,dustMat);holder.add(dust);

// (2) Jeweller's bokeh: large soft discs of light behind the rings.
const BOKEH=LITE?10:22;const bokeh=[];
for(let i=0;i<BOKEH;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:bokehTex,color:['#e9c27a','#f5dfb4','#fff6e6','#e6b56a'][i%4],transparent:true,depthWrite:false,opacity:0}));
 s.userData={x:(Math.random()-.4)*9,y:-.8+Math.random()*3.6,z:-2.6-Math.random()*4.5,size:.35+Math.random()*1.1,phase:Math.random()*6,op:.14+Math.random()*.22};scene.add(s);bokeh.push(s);}

// Spark burst on tap
const SPARK=160;const sGeo=new THREE.BufferGeometry();const sPos=new Float32Array(SPARK*3),sVel=new Float32Array(SPARK*3);
sGeo.setAttribute('position',new THREE.BufferAttribute(sPos,3));
const sparkMat=new THREE.PointsMaterial({map:softDot,color:new THREE.Color('#ffcf7a').multiplyScalar(2.2),size:.08,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0});
const sparks=new THREE.Points(sGeo,sparkMat);sparks.frustumCulled=false;scene.add(sparks);

// ---------- (4) Silk ----------
const floorY=-1.02;
// Static folds, flatter under the rings; JS and GLSL share the same function so petals rest on the cloth.
function silkH(x,z){const d=Math.hypot(x,z*1.6);const amp=lerp(.3,1,smooth(.5,2.4,d));return (.1*Math.sin(x*1.15+z*.55+.4)+.055*Math.sin(x*2.3-z*1.7+1.7)+.03*Math.sin(z*3.4+x*.6+.3))*amp;}
const SILK_GLSL=`float silkH(vec2 p){float d=length(p*vec2(1.,1.6));float amp=mix(.3,1.,smoothstep(.5,2.4,d));return (.1*sin(p.x*1.15+p.y*.55+.4)+.055*sin(p.x*2.3-p.y*1.7+1.7)+.03*sin(p.y*3.4+p.x*.6+.3))*amp;}
float ripple(vec2 p,float t){float d=length(p*vec2(1.,1.6));float front=t*.95;return sin((d-front)*20.)*exp(-abs(d-front)*3.5)*exp(-t*.7)*step(0.,t);}`;

const mirror=new THREE.Group();mirror.scale.y=-1;mirror.position.y=2*floorY;scene.add(mirror);
const mirrorHolder=new THREE.Group(),mirrorPair=new THREE.Group();mirrorHolder.add(mirrorPair);mirror.add(mirrorHolder);
const mA=new THREE.Mesh(ringA.geometry,champagne),mB=new THREE.Mesh(ringB.geometry,gold);mA.position.copy(ringA.position);mB.position.copy(ringB.position);mirrorPair.add(mA,mB);

// Lily petals
const PETALS=LITE?9:18;
const petalAlpha=dataTexture(64,(u,v)=>{const x=(u-.5)*2,y=v;const w=Math.sin(Math.PI*Math.pow(y,.8))*.95;const m=255*clamp((w-Math.abs(x))*8);return [m,m,m,m];});
const petalGeo=new THREE.PlaneGeometry(.17,.28,6,8);{const p=petalGeo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,x*x*4.2+Math.pow(y+.14,2)*.6);}petalGeo.computeVertexNormals();}
const petalMat=new THREE.MeshPhysicalMaterial({color:'#fffdf8',roughness:.5,sheen:1,sheenColor:'#fff6e8',sheenRoughness:.35,side:THREE.DoubleSide,alphaMap:petalAlpha,alphaTest:.4,emissive:'#fbf1e2',emissiveIntensity:.55,transmission:.25,thickness:.05});
const petals=new THREE.InstancedMesh(petalGeo,petalMat,PETALS);petals.frustumCulled=false;scene.add(petals);
const mPetals=new THREE.InstancedMesh(petalGeo,petalMat,PETALS);mPetals.instanceMatrix=petals.instanceMatrix;mPetals.frustumCulled=false;mirror.add(mPetals);
const petalState=[];const dummy=new THREE.Object3D();
function spawnPetal(p,initial){p.x=(Math.random()-.5)*6.5;p.z=(Math.random()-.5)*3-.4;p.y=initial?2.4+Math.random()*3.6:2.6+Math.random()*1.2;p.vy=.16+Math.random()*.1;p.phase=Math.random()*6;p.rx=Math.random()*6;p.ry=Math.random()*6;p.spin=.6+Math.random()*.9;p.landed=-1;p.scale=.75+Math.random()*.5;}
for(let i=0;i<PETALS;i++){const p={};spawnPetal(p,true);petalState.push(p);}
for(const m of [mA,mB,mPetals])m.layers.set(1);

const rtRefl=new THREE.WebGLRenderTarget(2,2,{type:THREE.HalfFloatType});
const silkMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
 uniforms:{tReflect:{value:rtRefl.texture},uRes:{value:new THREE.Vector2(1,1)},uTime:{value:0},uRipple:{value:99},uBase:{value:new THREE.Color()},uSheen:{value:new THREE.Color()},uShadow:{value:0},uCaustic:{value:0},uRefl:{value:0},uDark:{value:0}},
 vertexShader:SILK_GLSL+`uniform float uRipple;varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);w.y+=silkH(w.xz)+ripple(w.xz,uRipple)*.022;vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
 fragmentShader:SILK_GLSL+`uniform sampler2D tReflect;uniform vec2 uRes;uniform float uTime,uRipple,uShadow,uCaustic,uRefl,uDark;uniform vec3 uBase,uSheen;varying vec3 vW;
 float caustic(vec2 p,float t){vec2 i=p;float c=1.;float k=.005;for(int n=0;n<4;n++){float tt=t*(1.-(3.5/float(n+1)));i=p+vec2(cos(tt-i.x)+sin(tt+i.y),sin(tt-i.y)+cos(tt+i.x));c+=1./length(vec2(p.x/(sin(i.x+tt)/k),p.y/(cos(i.y+tt)/k)));}c/=4.;c=1.17-pow(c,1.4);return pow(abs(c),8.);}
 float H(vec2 p){return silkH(p)+ripple(p,uRipple)*.022;}
 void main(){vec2 q=vW.xz-vec2(0.,-.1);float d=length(q*vec2(1.,1.6));
  float e=.01;vec3 n=normalize(vec3(-(H(vW.xz+vec2(e,0.))-H(vW.xz-vec2(e,0.)))/(2.*e),1.,-(H(vW.xz+vec2(0.,e))-H(vW.xz-vec2(0.,e)))/(2.*e)));
  vec3 V=normalize(cameraPosition-vW),L=normalize(vec3(-.5,.8,.45)),Hh=normalize(L+V);
  float diff=.74+.3*dot(n,L);float rim=pow(1.-max(dot(n,V),0.),3.)*.38;float spec=pow(max(dot(n,Hh),0.),36.)*.42;
  float wave=ripple(vW.xz,uRipple);
  vec2 suv=gl_FragCoord.xy/uRes+n.xz*.05+vec2(wave*.012,wave*.008);
  vec4 r=texture2D(tReflect,suv);r.rgb=pow(max(r.rgb,0.),vec3(1./2.2));
  float near=smoothstep(2.6,.2,d);
  vec3 col=uBase*diff;
  col=mix(col,r.rgb,clamp(r.a,0.,1.)*.24*near*uRefl);
  col*=1.-exp(-d*d*2.6)*uShadow*.22;
  float ca=clamp(caustic(vW.xz*3.+vec2(9.),uTime*.6),0.,1.)*exp(-d*d*2.2)*uCaustic;
  col=mix(col,mix(vec3(.93,.74,.42),vec3(1.,.8,.48),uDark),ca*(.22+uDark*.1));
  col+=uSheen*(rim+spec);
  float alpha=smoothstep(11.,5.,length(vW.xz))*.95;
  gl_FragColor=vec4(col,alpha);}`});
const silk=new THREE.Mesh(new THREE.PlaneGeometry(40,24,LITE?140:280,LITE?84:168),silkMat);silk.rotation.x=-Math.PI/2;silk.position.y=floorY;silk.layers.set(2);scene.add(silk);

// ---------- (3) Post: scene → HDR target → bloom → tone map + composite over the silk ----------
const fsScene=new THREE.Scene(),fsCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);const fsQuad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));fsQuad.frustumCulled=false;fsScene.add(fsQuad);
const rtMain=new THREE.WebGLRenderTarget(2,2,{type:THREE.HalfFloatType,samples:4});
// Bloom mip chain (1/2 → 1/16): each level blurred at its own scale, then summed. Smooth, no blocks or stripes.
const LEVELS=4,mk=()=>new THREE.WebGLRenderTarget(2,2,{type:THREE.HalfFloatType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});
const bloomRT=Array.from({length:LEVELS},mk),bloomTmp=Array.from({length:LEVELS},mk);
const fsVert=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const brightMat=new THREE.ShaderMaterial({uniforms:{tSrc:{value:null},uThreshold:{value:1.05}},vertexShader:fsVert,depthTest:false,depthWrite:false,
 fragmentShader:`uniform sampler2D tSrc;uniform float uThreshold;uniform vec2 uTexel;varying vec2 vUv;
 vec3 pick(vec2 o){vec3 c=texture2D(tSrc,vUv+o*uTexel).rgb;float l=max(c.r,max(c.g,c.b));return c*smoothstep(uThreshold,uThreshold+.6,l)/(1.+l*.25);}
 void main(){gl_FragColor=vec4((pick(vec2(-.5,-.5))+pick(vec2(.5,-.5))+pick(vec2(-.5,.5))+pick(vec2(.5,.5)))*.25,1.);}`});
brightMat.uniforms.uTexel={value:new THREE.Vector2()};
const downMat=new THREE.ShaderMaterial({uniforms:{tSrc:{value:null},uTexel:{value:new THREE.Vector2()}},vertexShader:fsVert,depthTest:false,depthWrite:false,
 fragmentShader:`uniform sampler2D tSrc;uniform vec2 uTexel;varying vec2 vUv;void main(){vec3 c=texture2D(tSrc,vUv).rgb*.5;c+=(texture2D(tSrc,vUv+vec2(-1.,-1.)*uTexel).rgb+texture2D(tSrc,vUv+vec2(1.,-1.)*uTexel).rgb+texture2D(tSrc,vUv+vec2(-1.,1.)*uTexel).rgb+texture2D(tSrc,vUv+vec2(1.,1.)*uTexel).rgb)*.125;gl_FragColor=vec4(c,1.);}`});
const blurMat=new THREE.ShaderMaterial({uniforms:{tSrc:{value:null},uDir:{value:new THREE.Vector2()}},vertexShader:fsVert,depthTest:false,depthWrite:false,
 fragmentShader:`uniform sampler2D tSrc;uniform vec2 uDir;varying vec2 vUv;void main(){vec3 c=texture2D(tSrc,vUv).rgb*.1596;float w[6];w[0]=.1488;w[1]=.1210;w[2]=.0861;w[3]=.0537;w[4]=.0293;w[5]=.0140;for(int i=0;i<6;i++){vec2 o=uDir*float(i+1);c+=(texture2D(tSrc,vUv+o).rgb+texture2D(tSrc,vUv-o).rgb)*w[i];}gl_FragColor=vec4(c/.9846,1.);}`});
const compMat=new THREE.ShaderMaterial({uniforms:{tMain:{value:rtMain.texture},tB0:{value:bloomRT[0].texture},tB1:{value:bloomRT[1].texture},tB2:{value:bloomRT[2].texture},tB3:{value:bloomRT[3].texture},uBloom:{value:.9},uExposure:{value:1.08}},vertexShader:fsVert,depthTest:false,depthWrite:false,transparent:true,
 blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor,blendSrcAlpha:THREE.OneFactor,blendDstAlpha:THREE.OneMinusSrcAlphaFactor,
 fragmentShader:`uniform sampler2D tMain,tB0,tB1,tB2,tB3;uniform float uBloom,uExposure;varying vec2 vUv;
 vec3 RRT(vec3 v){vec3 a=v*(v+.0245786)-.000090537;vec3 b=v*(.983729*v+.4329510)+.238081;return a/b;}
 vec3 aces(vec3 c){const mat3 I=mat3(vec3(.59719,.07600,.02840),vec3(.35458,.90834,.13383),vec3(.04823,.01566,.83777));const mat3 O=mat3(vec3(1.60475,-.10208,-.00327),vec3(-.53108,1.10813,-.07276),vec3(-.07367,-.00605,1.07602));c*=uExposure/.6;c=I*c;c=RRT(c);c=O*c;return clamp(c,0.,1.);}
 vec3 srgb(vec3 c){return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(.0031308,c));}
 void main(){vec4 s=texture2D(tMain,vUv);float a=clamp(s.a,0.,1.);vec3 col=a>.0001?srgb(aces(s.rgb/a))*a:vec3(0.);
  vec3 b=(texture2D(tB0,vUv).rgb*.35+texture2D(tB1,vUv).rgb*.3+texture2D(tB2,vUv).rgb*.22+texture2D(tB3,vUv).rgb*.13)*uBloom*1.6;vec3 bt=srgb(1.-exp(-b*1.3));
  col+=bt;float ba=max(bt.r,max(bt.g,bt.b));gl_FragColor=vec4(col,clamp(a+ba,0.,1.));}`});
function pass(mat,target){fsQuad.material=mat;renderer.setRenderTarget(target);renderer.clear();renderer.render(fsScene,fsCam);}

function setTheme(dark){
 silkMat.uniforms.uBase.value.setRGB(...(dark?[40,32,26]:[250,245,236]).map(v=>v/255));
 silkMat.uniforms.uSheen.value.setRGB(...(dark?[.5,.38,.24]:[.55,.48,.36]));
 silkMat.uniforms.uDark.value=dustMat.uniforms.uDark.value=dark?1:0;
 trailMat.uniforms.uColor.value.set(...(dark?[2.4,1.89,1.13]:[.95,.52,.15]));trailMat.uniforms.uCore.value.set(...(dark?[3.2,3.06,2.82]:[1.5,.98,.42]));moteMat.uniforms.uColor.value.set(...(dark?[1.9,1.45,.8]:[.95,.6,.22]));
 scene.environment=dark?envDark:envLight;
 compMat.uniforms.uExposure.value=dark?.95:.98;compMat.uniforms.uBloom.value=dark?.85:.42;key.intensity=dark?1.8:1.4;
 bokeh.forEach(s=>{s.material.blending=dark?THREE.AdditiveBlending:THREE.NormalBlending;s.material.needsUpdate=true;});
}
setTheme(currentDark);

// ---------- (5) Layout and camera ----------
let W=1,H=1,finalDist=7,ringCx=0,ringCy=0;
const actions=document.querySelector('.actions'),hint=document.getElementById('hint');
const script1=document.getElementById('script1'),script2=document.getElementById('script2');
const camDirFinal=new THREE.Vector3(0,Math.sin(THREE.MathUtils.degToRad(13)),Math.cos(THREE.MathUtils.degToRad(13)));
function resize(){
 W=stage.clientWidth;H=stage.clientHeight;renderer.setSize(W,H,false);camera.aspect=W/H;
 const pr=renderer.getPixelRatio();
 rtMain.setSize(Math.round(W*pr),Math.round(H*pr));rtRefl.setSize(Math.round(W*pr*.6),Math.round(H*pr*.6));
 for(let i=0;i<LEVELS;i++){const d=2<<i;bloomRT[i].setSize(Math.max(2,Math.round(W*pr/d)),Math.max(2,Math.round(H*pr/d)));bloomTmp[i].setSize(bloomRT[i].width,bloomRT[i].height);}
 silkMat.uniforms.uRes.value.set(W*pr,H*pr);dustMat.uniforms.uPixel.value=pr;moteMat.uniforms.uPixel.value=pr;
 const wide=wideQ.matches;
 script1.setAttribute('text-anchor',wide?'start':'middle');script2.setAttribute('text-anchor',wide?'start':'middle');
 script1.setAttribute('x',wide?20:450);script2.setAttribute('x',wide?20:450);
 let unit;
 if(wide){unit=Math.min(H*.25,W*.16);ringCx=W*.7;ringCy=H*.55;}
 else if(LITE){unit=Math.min(H*.28,W*.27);ringCx=W/2;ringCy=H*.47;}
 else{const heroTop=hero.getBoundingClientRect().top,below=actions.getBoundingClientRect().bottom-heroTop;const space=LITE?Math.max(140,H-below-70):Math.max(260,H-below-30);unit=Math.min(space*(LITE?.38:.3),W*.27);ringCx=W/2;ringCy=below+space*.5;}
 const half=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));finalDist=(H/2)/(unit*half);
 hint.style.left=ringCx+'px';hint.style.top=((LITE?stage.offsetTop:0)+Math.min(H-34,ringCy+unit*1.45))+'px';
}
const observer=new ResizeObserver(()=>{if(!disposed){resize();if(active)render();}});observer.observe(stage);

// ---------- Sound (8): synthesised glass chimes, off by default ----------
let audio=null,wet=null,soundOn=false;
function initAudio(){audio=new (window.AudioContext||window.webkitAudioContext)();const conv=audio.createConvolver();const len=audio.sampleRate*2.4,buf=audio.createBuffer(2,len,audio.sampleRate);for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);}conv.buffer=buf;wet=audio.createGain();wet.gain.value=.35;conv.connect(wet).connect(audio.destination);audio._conv=conv;}
function chime(freq,delay=0,gain=.1){if(!soundOn||!audio||paused||!active)return;const t=audio.currentTime+delay;const out=audio.createGain();out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(gain,t+.004);out.gain.exponentialRampToValueAtTime(.0001,t+3);out.connect(audio.destination);out.connect(audio._conv);
 [[1,1],[2.756,.45],[5.404,.22],[8.933,.1]].forEach(([r,g],i)=>{const o=audio.createOscillator();o.type='sine';o.frequency.value=freq*r*(1+(Math.random()-.5)*.003);const v=audio.createGain();v.gain.setValueAtTime(g,t);v.gain.exponentialRampToValueAtTime(.0001,t+3/(1+i*.9));o.connect(v).connect(out);o.start(t);o.stop(t+3.1);});}
const soundBtn=hero.querySelector('[data-rings-sound]');
listen(soundBtn,'click',()=>{if(!active)return;soundOn=!soundOn;soundBtn.setAttribute('aria-pressed',String(soundOn));if(soundOn){if(!audio)initAudio();void audio.resume();chime(1568,0,.06);}else void audio?.suspend();});

// ---------- Timeline ----------
const ENTRY=4.8;let trailDone=false,lastHead=-1;let clock=options.initialElapsed ?? 0,last=performance.now(),paused=false,shown=false,closedChimed=false;
let spin=0,spinFrom=0,spinTo=0,spinAt=-99,engravePulse=-99,rippleAt=-99,sparkAt=-99;
let userRot=0,userVel=0,dragging=false,dragId=null,dragX=0,dragMoved=0,dragT=0;
const pointerNDC=new THREE.Vector2(9,9);let pointerIn=false,scrollP=0;const tilt={x:0,y:0};
const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,0,1),0),hit=new THREE.Vector3(),camDir=new THREE.Vector3(),axis=new THREE.Vector3(),q=new THREE.Quaternion();
const gemW=new THREE.Vector3(),introDir=new THREE.Vector3(),tmp=new THREE.Vector3(),target=new THREE.Vector3();

function burst(origin){for(let i=0;i<SPARK;i++){sPos.set([origin.x,origin.y,origin.z],i*3);const a=Math.random()*Math.PI*2,e=Math.random()*Math.PI-.3,v=.8+Math.random()*1.6;sVel.set([Math.cos(a)*Math.cos(e)*v,Math.sin(e)*v+.6,Math.sin(a)*Math.cos(e)*v],i*3);}sGeo.attributes.position.needsUpdate=true;sparkAt=clock;}

function pose(e,dt){
 const t=reduce?ENTRY+3:e;
 const swing=settle(clamp((t-1.2)/2.2)),turn=ease(clamp(t/3.6));
 const idle=Math.max(0,t-ENTRY),idleOn=clamp(idle/1.2);
 const sp=clamp((clock-spinAt)/1.5);spin=spinFrom+(spinTo-spinFrom)*inOut(sp);
 // drag inertia with a spring back to the nearest full turn
 if(!dragging){const home=Math.round(userRot/(Math.PI*2))*Math.PI*2;userVel+=(home-userRot)*2.2*dt;userVel*=Math.exp(-1.7*dt);userRot+=userVel*dt;}
 const sc=scrollP;
 holder.position.y=.18*(1-ease(clamp(t/2.6)))+Math.sin(idle*.9)*.035*idleOn+sc*.55;
 holder.rotation.y=.4+1.1*(1-turn)+Math.sin(idle*.35)*.12*idleOn+tilt.x*.25+spin+userRot+sc*1.1;
 holder.rotation.x=-.08+tilt.y*.12-sc*.2;holder.rotation.z=.08;
 ringB.rotation.x=.55+(THETA-.55)*swing+Math.sin(idle*.6)*.04*idleOn-sc*.32;
 mirrorHolder.position.copy(holder.position);mirrorHolder.rotation.copy(holder.rotation);mB.rotation.x=ringB.rotation.x;
 // the moment the band closes: ripple, glint and a chime
 const tClose=3.35;
 if(t>=tClose&&!closedChimed&&!reduce){closedChimed=true;chime(1318.5,0,.09);chime(1760,.11,.07);}
 // (1) camera: from a macro on the stone to the full composition
 holder.updateMatrixWorld(true);gem.getWorldPosition(gemW);
 const k=reduce?1:inOut(clamp((t-.35)/3.3));
 introDir.set(.42,.16,1).normalize();
 const dir=tmp.copy(introDir).lerp(camDirFinal,k).normalize();
 const dist=Math.exp(lerp(Math.log(1.55),Math.log(finalDist),k));
 target.copy(gemW).lerp(holder.position,k);
 camera.position.copy(target).addScaledVector(dir,dist);camera.lookAt(target);
 camera.setViewOffset(W,H,-(ringCx-W/2)*(wideQ.matches?1:k),-(ringCy-H/2)*k,W,H);camera.updateProjectionMatrix();
 dustMat.uniforms.uFocus.value=camera.position.distanceTo(target);dustMat.uniforms.uAperture.value=lerp(1.1,.12,k);
 // (2) pen of light: head runs 0→1+tail between 2.2 s and 4.2 s
 const head=reduce?-1:lerp(-.02,1+TAIL,clamp((t-2.2)/2));
 trailMat.uniforms.uHead.value=head;
 const hu=clamp(head);threadCurve.getPointAt(hu,threadHead.position);headStar.position.copy(threadHead.position);
 const headOn=head>0&&head<1?1:0;threadHead.material.opacity=headOn;headStar.material.opacity=headOn*(.6+.4*Math.sin(clock*22));headStar.material.rotation=clock*1.5;
 if(!paused&&head>0&&head<1&&dt>0){const n=LITE?2:4;for(let i=0;i<n;i++)emitMote(head-Math.random()*.04,.04,false);}
 if(!reduce&&head>=1&&!trailDone){trailDone=true;for(let i=0;i<(LITE?110:240);i++)emitMote(.72+Math.random()*.28,.18,true);}
 lastHead=head;threadGroup.visible=!reduce&&head>-.01&&head<1+TAIL;
 // motes
 {const pa=moteGeo.attributes.position,aa=moteGeo.attributes.aA;const ground=floorY+.03;
  for(let i=0;i<MOTES;i++){if(moteAge[i]>=moteLife[i]){aa.array[i]=0;continue;}moteAge[i]+=dt;
   moteVel[i*3+1]-=.05*dt;let y=pa.array[i*3+1]+moteVel[i*3+1]*dt;pa.array[i*3]+=moteVel[i*3]*dt;pa.array[i*3+2]+=moteVel[i*3+2]*dt;
   if(y<ground){y=ground;moteVel[i*3]=moteVel[i*3+1]=moteVel[i*3+2]=0;}pa.array[i*3+1]=y;
   const a=moteAge[i]/moteLife[i];aa.array[i]=Math.min(1,moteAge[i]*6)*(1-a*a)*(.6+.4*Math.sin(clock*9+i));}
  pa.needsUpdate=true;aa.needsUpdate=true;}
 // dust
 const gather=reduce?0:smooth(.2,1.6,t)*(1-smooth(3.4,4.6,t));
 dustMat.uniforms.uGather.value=gather;dustMat.uniforms.uAlpha.value=reduce?1:smooth(0,.5,t);dustMat.uniforms.uSpeed.value=reduce?0:1+sc*2.5;
 // bokeh
 bokeh.forEach((s,i)=>{const u=s.userData;s.position.set(u.x+Math.cos(clock*.13+u.phase)*.25-tilt.x*.35,u.y+Math.sin(clock*.2+u.phase)*.18-tilt.y*.2,u.z);s.scale.setScalar(u.size*(1+(1-k)*.8));s.material.opacity=u.op*(.65+.35*Math.sin(clock*.5+u.phase))*smooth(0,.8,t)*(1+(1-k)*.6);});
 // silk
 const r1=t-tClose,r2=clock-rippleAt;
 silkMat.uniforms.uRipple.value=reduce?99:(r2>=0&&(r1<0||r2<r1)?r2:r1);
 silkMat.uniforms.uShadow.value=1;silkMat.uniforms.uRefl.value=1;
 silkMat.uniforms.uCaustic.value=reduce?.6:smooth(2.2,3.6,t)*(.75+.25*Math.sin(clock*.7));
 // glint
 const g=clamp((t-1.6)/1.6);glint.intensity=reduce?0:Math.sin(g*Math.PI)*14+Math.max(0,1-(clock-spinAt)/1.2)*10+Math.max(0,1-Math.abs(t-tClose)/.5)*8;glint.position.set(-3+6*g,1.2,2.2);
 // stone sparkles (bright in the macro and when the band closes)
 camera.getWorldDirection(camDir);
 const macro=1-smooth(.3,1.6,t),closeBoost=Math.max(0,1-Math.abs(t-tClose-.15)/.6);
 sparkles.forEach((s,i)=>{const f=Math.pow(Math.max(0,Math.sin(clock*1.7+s.userData.phase+holder.rotation.y*9+i)),24);const v=reduce?.3:Math.min(1.4,f+(macro+closeBoost)*(i%2?1:.6));s.material.opacity=Math.min(1,v);s.scale.setScalar(.05+v*.34);s.material.rotation=clock*.3+i;});
 // engraving
 axis.set(0,0,1).applyQuaternion(ringA.getWorldQuaternion(q));
 const facing=Math.abs(axis.dot(camDir)),pulse=Math.max(0,1-(clock-engravePulse)/1.8);
 engravingMat.opacity=engravingMat.map?(smooth(3.8,4.6,t)*smooth(.55,.95,facing)*.75+pulse*.6):0;
 // sparks
 const sa=clock-sparkAt;if(sa<1.6){const p=sGeo.attributes.position;for(let i=0;i<SPARK;i++){sVel[i*3+1]-=1.6*dt;p.array[i*3]+=sVel[i*3]*dt;p.array[i*3+1]+=sVel[i*3+1]*dt;p.array[i*3+2]+=sVel[i*3+2]*dt;}p.needsUpdate=true;sparkMat.opacity=1-sa/1.6;}else sparkMat.opacity=0;
 // petals rest on the silk
 const pOn=reduce?1:smooth(3.2,3.8,t);
 petalState.forEach((p,i)=>{
  const rest=floorY+silkH(p.x,p.z)+.012;
  if(p.landed<0){if(!reduce){p.y-=p.vy*dt*pOn;p.x+=Math.sin(clock*.8+p.phase)*.12*dt;p.rx+=p.spin*dt;p.ry+=p.spin*.7*dt;}
   if(p.y<=rest){p.y=rest;p.landed=clock;}
   dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(Math.sin(p.rx)*1.2,p.ry,Math.cos(p.rx*.8)*.9);
  }else{dummy.position.set(p.x,rest,p.z);dummy.rotation.set(-Math.PI/2+.08,p.ry,0);if(clock-p.landed>7)spawnPetal(p,false);}
  const shrink=p.landed>0?1-smooth(5.5,7,clock-p.landed):1;
  dummy.scale.setScalar(p.scale*shrink*(pOn>0?1:0));dummy.updateMatrix();petals.setMatrixAt(i,dummy.matrix);
 });
 petals.instanceMatrix.needsUpdate=true;
 dustMat.uniforms.uTime.value=silkMat.uniforms.uTime.value=clock;
 if(!hero.classList.contains('ready')&&t>1.9)hero.classList.add('ready');
}

function render(){
 // mirror world for the silk
 camera.layers.set(1);renderer.setRenderTarget(rtRefl);renderer.setClearColor(0x000000,0);renderer.clear();renderer.render(scene,camera);
 // scene in HDR
 camera.layers.set(0);renderer.setRenderTarget(rtMain);renderer.clear();renderer.render(scene,camera);
 // bloom
 brightMat.uniforms.tSrc.value=rtMain.texture;brightMat.uniforms.uTexel.value.set(1/rtMain.width,1/rtMain.height);pass(brightMat,bloomRT[0]);
 for(let i=1;i<LEVELS;i++){downMat.uniforms.tSrc.value=bloomRT[i-1].texture;downMat.uniforms.uTexel.value.set(1/bloomRT[i-1].width,1/bloomRT[i-1].height);pass(downMat,bloomRT[i]);}
 for(let i=0;i<LEVELS;i++){const r=bloomRT[i],tmp=bloomTmp[i];
  blurMat.uniforms.tSrc.value=r.texture;blurMat.uniforms.uDir.value.set(1/r.width,0);pass(blurMat,tmp);
  blurMat.uniforms.tSrc.value=tmp.texture;blurMat.uniforms.uDir.value.set(0,1/r.height);pass(blurMat,r);}
 // screen: silk first, then the tone-mapped scene and its glow on top
 renderer.setRenderTarget(null);renderer.clear();camera.layers.set(2);renderer.render(scene,camera);camera.layers.set(0);
 fsQuad.material=compMat;renderer.render(fsScene,fsCam);
}
function frame(now){
 const dt=Math.min(.05,(now-last)/1000);last=now;
 if(!paused&&shown){clock+=dt;
  tilt.x+=((pointerIn&&!dragging?pointerNDC.x:0)-tilt.x)*.04;tilt.y+=((pointerIn&&!dragging?-pointerNDC.y:0)-tilt.y)*.04;
  if(pointerIn){ray.setFromCamera(pointerNDC,camera);if(ray.ray.intersectPlane(plane,hit)){holder.worldToLocal(hit);dustMat.uniforms.uPointer.value.copy(hit);}}
  dustMat.uniforms.uPush.value+=((pointerIn?1:0)-dustMat.uniforms.uPush.value)*.06;
  pose(clock-.25,dt);render();
 }
 if(active&&!disposed)frameId=requestAnimationFrame(frame);
}


// ---------- (7)(10) Touch, drag and tap ----------
const pickables=[ringA,ringB,diamond,collet];
function toNDC(e){const r=stage.getBoundingClientRect();pointerNDC.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);return e.clientY>=r.top&&e.clientY<=r.bottom;}
function overRings(e){toNDC(e);ray.setFromCamera(pointerNDC,camera);return ray.intersectObjects(pickables,false).length>0;}
function tap(){if(clock-spinAt<1.2)return;spinFrom=spin;spinTo=spin+Math.PI*2;spinAt=clock;engravePulse=clock;rippleAt=clock;const o=new THREE.Vector3();diamond.getWorldPosition(o);burst(o);chime(1568,0,.08);chime(2093,.08,.05);}
listen(window,'pointermove',e=>{
 if(!active)return;
 if(dragging&&e.pointerId===dragId){const dx=e.clientX-dragX,now=performance.now(),dt=Math.max(1,now-dragT)/1000;dragX=e.clientX;dragT=now;dragMoved+=Math.abs(dx);userRot+=dx*.0085;userVel=dx*.0085/dt;return;}
 pointerIn=toNDC(e)&&e.pointerType==='mouse';if(!pointerIn){hero.style.cursor='';return;}
 hero.style.cursor=overRings(e)?'grab':'';});
listen(document,'pointerleave',()=>{pointerIn=false;});
listen(hero,'pointerdown',e=>{if(!active||e.target.closest('a,button')||!overRings(e))return;dragging=true;dragId=e.pointerId;dragX=e.clientX;dragT=performance.now();dragMoved=0;userVel=0;hero.setPointerCapture(e.pointerId);hero.style.cursor='grabbing';});
function endDrag(e){if(!dragging||e.pointerId!==dragId)return;dragging=false;hero.style.cursor='grab';if(dragMoved<6)tap();}
listen(hero,'pointerup',endDrag);listen(hero,'pointercancel',e=>{dragging=false;pointerIn=false;hero.style.cursor='';});
listen(window,'scroll',()=>{const r=hero.getBoundingClientRect();scrollP=clamp(-r.top/(r.height*.75));},{passive:true});

function silence(){soundOn=false;soundBtn.setAttribute('aria-pressed','false');void audio?.suspend();}
function setState(state){
 if(disposed)return;
 const next=state.visible&&!state.hidden&&!state.embeddedHidden&&!state.paused&&!state.reduced;
 if(state.dark!==currentDark){currentDark=state.dark;setTheme(currentDark);}
 if(state.paused||state.reduced){
  clock=ENTRY+3;spin=spinFrom=spinTo=userRot=userVel=0;scrollP=0;tilt.x=tilt.y=0;
  dragging=false;pointerIn=false;reduce=true;pose(clock,0);reduce=false;
 }
 if(!next){active=false;cancelAnimationFrame(frameId);frameId=0;last=performance.now();silence();return;}
 if(!active){active=true;last=performance.now();pose(clock-.25,0);render();frameId=requestAnimationFrame(frame);}
}
function dispose(){
 if(disposed)return;disposed=true;active=false;cancelAnimationFrame(frameId);observer.disconnect();events.abort();silence();void audio?.close();
 const textures=new Set([softDot,starTex,bokehTex]);
 scene.traverse(o=>{for(const m of(Array.isArray(o.material)?o.material:[o.material])){if(!m)continue;for(const v of Object.values(m))if(v?.isTexture)textures.add(v);for(const u of Object.values(m.uniforms||{}))if(u.value?.isTexture)textures.add(u.value);}});
 releaseTree(scene);releaseTree(fsScene);for(const m of[brightMat,downMat,blurMat,compMat])m.dispose();
 for(const t of textures)t.dispose();for(const r of[rtMain,rtRefl,...bloomRT,...bloomTmp,...envTargets])r.dispose();pmrem.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
}
listen(renderer.domElement,'webglcontextlost',e=>{e.preventDefault();options.onFallback?.();});
await document.fonts.ready;
if(options.isCancelled?.()){dispose();return {setState(){},dispose(){}};}
buildEngraving();resize();pose(clock-.25,0);
await prepareRingsPrograms(renderer,camera,scene,{rtRefl,rtMain,fsScene,fsCam,fsQuad,brightMat,downMat,blurMat,compMat,bloomRT});
await yieldSetup();
if(options.isCancelled?.()){dispose();return {setState(){},dispose(){}};}
shown=true;render();performance.mark('nordra-rings-ready');
return {setState,dispose};
}
