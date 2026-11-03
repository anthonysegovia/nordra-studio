import {
  WebGLRenderer, Scene, OrthographicCamera, MeshPhysicalMaterial, Mesh, Group, Color,
  AmbientLight, DirectionalLight, DataTexture, FloatType, EquirectangularReflectionMapping,
  PMREMGenerator, SphereGeometry, Line, LineBasicMaterial, BufferGeometry, Float32BufferAttribute,
  ACESFilmicToneMapping, PCFSoftShadowMap
} from 'three';
import {inflatedGlyph} from './balloons';
import {invitation} from '../caja-de-regalo/config.mjs';

function softboxes(renderer){
  // A panoramic studio with two tall silk panels and one narrow rim light.
  const w=128,h=64,data=new Float32Array(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const u=x/w,v=y/h;
    const panel=(cx,cy,sx,sy)=>Math.exp(-((Math.abs(u-cx)/sx)**6+(Math.abs(v-cy)/sy)**4));
    const key=3.2*panel(.29,.59,.10,.24), fill=2.2*panel(.73,.54,.05,.30),rim=2.6*panel(.54,.84,.17,.045);
    const i=(y*w+x)*4;
    const wash=.5+.38*Math.cos(2*Math.PI*(u-.52))*Math.sin(Math.PI*v);
    data.set([wash+key+fill+rim,wash*.96+key*.96+fill*.91+rim*.88,wash*.92+key*.91+fill+.71*rim,1],i);
  }
  const texture=new DataTexture(data,w,h,undefined,FloatType);texture.mapping=EquirectangularReflectionMapping;texture.needsUpdate=true;
  const generator=new PMREMGenerator(renderer);
  try{return generator.fromEquirectangular(texture)}finally{generator.dispose();texture.dispose()}
}
export function createFloatScene(stage, canvas, gl, quality) {
  const renderer=new WebGLRenderer({canvas,context:gl,alpha:true,powerPreference:'low-power'});
  renderer.setClearColor(0x000000,0);renderer.toneMapping=ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  const scene=new Scene(), camera=new OrthographicCamera(-2,2,2,-2,.1,30);
  camera.position.z=8;
  const environment=softboxes(renderer);scene.environment=environment.texture;
  const foil=new MeshPhysicalMaterial({color:new Color(invitation.palette.gold),metalness:.78,roughness:.31,emissive:0x947045,emissiveIntensity:.23,clearcoat:.22,clearcoatRoughness:.30});
  const thread=new LineBasicMaterial({color:0xc39b58,transparent:true,opacity:.83});
  const key=new DirectionalLight(0xffe5be,2.1);key.position.set(-3,5,3);scene.add(key,new AmbientLight(0xffedcc,.65));
  renderer.shadowMap.enabled=quality!=='low';renderer.shadowMap.type=PCFSoftShadowMap;
  key.castShadow=renderer.shadowMap.enabled;key.shadow.mapSize.setScalar(quality==='high'?512:256);
  key.shadow.normalBias=.025;key.shadow.camera.far=15;
  const ensemble=new Group();scene.add(ensemble);
  const glyphs=[...invitation.balloons].map((letter,i)=>{
    const group=new Group();ensemble.add(group);
    const shape=inflatedGlyph(letter,quality==='high',foil);
    const mesh=new Mesh(shape,foil);mesh.castShadow=mesh.receiveShadow=key.castShadow;group.add(mesh);
    let foot=Infinity,footX=0;
    const pos=shape.attributes.position;
    for(let j=0;j<pos.count;j++)if(pos.getY(j)<foot){foot=pos.getY(j);footX=pos.getX(j)}
    const knot=new Mesh(new SphereGeometry(.062,10,8),foil);knot.scale.set(.7,1,.5);knot.position.set(footX,foot-.012,0);group.add(knot);
    const geo=new BufferGeometry();const points=new Float32BufferAttribute(new Float32Array(17*3),3);
    geo.setAttribute('position',points);const string=new Line(geo,thread);string.frustumCulled=false;group.add(string);
    return {group,string,points,foot,footX,index:i,swing:0,velocity:0};
  });
  const span=Math.max(3.85,glyphs.length*1.55+.36);
  let actualSize=0,tiltX=0,tiltY=0,previousTime=0;
  function render(time, pointer, lift=1){
    const size=Math.max(1,stage.clientWidth);
    const limit={low:256,medium:450,high:780}[quality];
    const buffer=Math.min(limit,Math.round(size*Math.min(devicePixelRatio,1.55)));
    if(actualSize!==buffer){renderer.setSize(buffer,buffer,false);actualSize=buffer;}
    camera.left=-span/2;camera.right=span/2;camera.top=span/2;camera.bottom=-span/2;camera.position.y=-.16+lift*.30;camera.updateProjectionMatrix();
    tiltX+=(pointer.x-tiltX)*.14;tiltY+=(pointer.y-tiltY)*.14;
    const dt=Math.min(.045,Math.max(0,time-previousTime));previousTime=time;
    
    for(const glyph of glyphs){
      const {group,points,foot,footX,index:i}=glyph;
      const wave=time*.65+i*2.2, rise=-1.9*(1-Math.min(1,Math.max(0,lift*1.25-i*.16)));
      group.position.set((i-(glyphs.length-1)/2)*1.49+.025*Math.sin(wave),.24+.075*Math.sin(wave)+rise*(1+i*.10),0);
      
      group.rotation.set(-.07+.045*Math.cos(wave)+tiltY*.18,(i%2?.18:-.21)+.09*Math.sin(wave*.76)+tiltX*.32,(i%2?-.06:.055)+.028*Math.sin(wave));
      const target=.12*Math.sin(wave+.7)-.18*tiltX;
      glyph.velocity+=((target-glyph.swing)*22-glyph.velocity*6)*dt;
      glyph.swing+=glyph.velocity*dt;
      for(let j=0;j<17;j++){
        const f=j/16;
        points.setXYZ(j,footX+(.085*Math.sin(wave+f*4.2)+glyph.swing)*f*(1-lift),foot-.025-f*(.98+.42*lift),.035*f*Math.cos(wave+f));
      }
      points.needsUpdate=true;
    }
    renderer.render(scene,camera);
  }
  function dispose(){
    for(const {group} of glyphs)for(const child of group.children)child.geometry.dispose();
    key.shadow.dispose();foil.dispose();thread.dispose();environment.dispose();renderer.dispose();
  }
  return {render,dispose};
}