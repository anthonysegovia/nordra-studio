import {DoubleSide,InstancedMesh,MeshStandardMaterial,Object3D,PlaneGeometry} from 'three';

export function foilShower(quality,glyphCount){
  const count={low:90,medium:170,high:240}[quality];
  const geometry=new PlaneGeometry(1,1);
  const material=new MeshStandardMaterial({color:0xeac983,metalness:.75,roughness:.29,side:DoubleSide});
  const mesh=new InstancedMesh(geometry,material,count);
  mesh.frustumCulled=false;mesh.visible=false;
  const transform=new Object3D();
  let seed=30;
  const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  const strips=Array.from({length:count},(_,i)=>({
    x:((i%glyphCount)-(glyphCount-1)/2)*1.49+(random()-.5)*.8,y:.6+(random()-.5)*1.1,z:random()*.4,
    vx:(random()-.5)*3.4,vy:.5+random()*2.8,vz:(random()-.5)*1.5,angle:random()*6.28,
    spin:2+random()*7,width:.018+random()*.05,height:i%4===0?.2:.055+random()*.08
  }));
  function update(lift){
    mesh.visible=lift>=.31;
    if(!mesh.visible)return;
    const t=(lift-.31)*2.2;
    for(let i=0;i<count;i++){
      const p=strips[i],rotation=p.angle+p.spin*t;
      transform.position.set(p.x+p.vx*t+.13*Math.sin(rotation)*t,p.y+p.vy*t-2.9*t*t,p.z+p.vz*t);
      transform.rotation.set(rotation*.6,rotation,p.angle+t);
      transform.scale.set(p.width,p.height,1);transform.updateMatrix();mesh.setMatrixAt(i,transform.matrix);
    }
    mesh.instanceMatrix.needsUpdate=true;
  }
  return {mesh,update,dispose(){geometry.dispose();material.dispose();mesh.dispose()}};
}
