import { BufferGeometry, Float32BufferAttribute, Path } from 'three';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';

// Original centre lines. Sweep the inflated foil across each stroke instead of using a font mesh.
const strokes={
  '0':['M .01 .89 C .76 .89 .77 -.89 0 -.89 C -.77 -.89 -.76 .89 .01 .89'],
  '1':['M -.37 .52 L .11 .88 L .11 -.88'],
  '2':['M -.48 .49 C -.39 1.08 .56 1.08 .49 .43 C .45 .07 -.23 -.36 -.52 -.83 L .54 -.83'],
  '3':['M -.47 .58 C -.10 1.11 .65 .88 .49 .38 C .43 .16 .18 .04 -.12 .025 C .21 .04 .59 -.14 .54 -.50 C .47 -.99 -.18 -1.08 -.51 -.70'],
  '4':['M .30 -.88 L .30 .85 L -.55 -.22 L .57 -.22'],
  '5':['M .48 .86 L -.36 .86 L -.46 .10 C -.02 .37 .55 .21 .52 -.37 C .49 -.98 -.21 -1.07 -.53 -.66'],
  '6':['M .39 .71 C -.26 1.28 -.73 .17 -.45 -.57 C -.18 -1.13 .57 -.94 .48 -.36 C .41 .09 -.18 .24 -.46 -.16'],
  '7':['M -.55 .86 L .49 .86 L -.19 -.86'],
  '8':['M .01 0 C -.64 .23 -.59 .92 0 .91 C .57 .9 .68 .27 .01 0 C -.72 -.26 -.58 -.92 0 -.93 C .64 -.92 .69 -.26 .01 0'],
  '9':['M -.37 -.74 C .24 -1.2 .68 -.09 .46 .57 C .23 1.13 -.53 .98 -.48 .38 C -.43 -.12 .12 -.23 .46 .18'],
  'X':['M -.49 .87 L .50 -.87','M .49 .87 L -.50 -.87'],
  'V':['M -.52 .87 L 0 -.86 L .52 .87'],
  'I':['M 0 .87 L 0 -.87']
};
function pathFrom(line){
  const p=new Path(),v=line.split(/\s+/);
  for(let i=0;i<v.length;){
    const op=v[i++],count=op==='C'?6:2, points=v.slice(i,i+count).map(Number);i+=count;
    p[op==='C'?'bezierCurveTo':op==='M'?'moveTo':'lineTo'](...points);
  }
  return p;
}
// Isosurface of the inflated extrusion. Taking the union of strokes avoids a
// crossing seam or an open end where the two lobes of the three meet.
export function inflatedGlyph(letter, fine, material) {
  const size=fine?76:58;
  const surface=new MarchingCubes(size,material,false,false,26000);
  surface.isolation=0;
  const samples=strokes[letter].flatMap(line=>pathFrom(line).getSpacedPoints(110));
  const xyScale=1.28,zScale=.52;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const px=(2*x/size-1)*xyScale,py=(2*y/size-1)*xyScale;
    let d2=Infinity;
    for(const p of samples)d2=Math.min(d2,(px-p.x)**2+(py-p.y)**2);
    const width=.203+.013*Math.sin(4.3*py+px);
    const ripple=.0055*Math.sin(72*py+15*px)+.003*Math.cos(55*px-21*py);
    for(let z=0;z<size;z++){
      const pz=(2*z/size-1)*zScale;
      const weld=.022*Math.exp(-(pz*pz)/.00036);
      const radius=width+weld+ripple*Math.exp(-(pz*pz)/.014);
      surface.field[x+y*size+z*size*size]=1-d2/(radius*radius)-(pz/(.16+.015*Math.sin(6*py+2*px)))**2;
    }
  }
  surface.update();
  const geom=new BufferGeometry();
  for(const attr of ['position','normal']){
    const data=surface.geometry.attributes[attr].array.slice(0,surface.count*3);
    geom.setAttribute(attr,new Float32BufferAttribute(data,3));
  }
  geom.scale(xyScale,xyScale,zScale);geom.normalizeNormals();surface.geometry.dispose();
  return geom;
}
