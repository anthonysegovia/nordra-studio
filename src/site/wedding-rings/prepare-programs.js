import * as THREE from 'three';
// Prepare every layer/target variant before the first visible render. In particular,
// Three's transmission prepass uses linear output even when the final target is sRGB.
export const yieldSetup = () => new Promise(resolve => setTimeout(resolve, 0));
export async function prepareRingsPrograms(renderer, camera, scene, passes) {
 const {rtRefl,rtMain,fsScene,fsCam,fsQuad,brightMat,downMat,blurMat,compMat,bloomRT}=passes;
 const objects=[];scene.traverse(o=>{if(o.material)objects.push(o);});
 try {
  for(const [layer,target] of [[1,rtRefl],[0,rtMain],[2,null]]){
   camera.layers.set(layer);renderer.setRenderTarget(target);
   const variants=new Set();
   for(const object of objects){
    if(!object.layers.test(camera.layers))continue;
    const key=object.material.uuid+':'+object.type;
    if(variants.has(key))continue;variants.add(key);
    await yieldSetup();await renderer.compileAsync(object,camera,scene);
    if(object.material.side===THREE.DoubleSide&&(object.material.transmission>0||(object.material.transparent&&!object.material.forceSinglePass))){
     object.material.side=THREE.BackSide;object.material.needsUpdate=true;
     await yieldSetup();await renderer.compileAsync(object,camera,scene);
     object.material.side=THREE.DoubleSide;object.material.needsUpdate=true;
    }
   }
  }
  for(const [material,target] of [[brightMat,bloomRT[0]],[downMat,bloomRT[1]],[blurMat,bloomRT[0]],[compMat,null]]){
   await yieldSetup();renderer.setRenderTarget(target);fsQuad.material=material;await renderer.compileAsync(fsScene,fsCam);
  }
 }finally{camera.layers.set(0);renderer.setRenderTarget(null);fsQuad.material=compMat;}
}

// Three 0.181.0 exposes no async PMREM preparation API. Initialize its existing
// 256px targets once, then await the exact blur/background programs it uses.
// Keep this adapter pinned to that version; no environment parameters change.
export async function preparePMREM(renderer, pmrem) {
 pmrem._setSize(256);
 const target=pmrem._allocateTargets();
 const geometry=new THREE.BufferGeometry();
 const background=new THREE.MeshBasicMaterial({side:THREE.BackSide,depthWrite:false,depthTest:false});
 const camera=new THREE.OrthographicCamera();
 // Instantiate Three's GGX material without executing its first synchronous draw.
 const render=renderer.render;
 try{renderer.render=()=>{};pmrem._applyGGXFilter(target,0,1);}
 finally{renderer.render=render;}
 try{
  renderer.setRenderTarget(target);
  for(const material of [pmrem._blurMaterial,pmrem._ggxMaterial,background]){
   await yieldSetup();await renderer.compileAsync(new THREE.Mesh(geometry,material),camera);
  }
 }finally{renderer.setRenderTarget(null);target.dispose();geometry.dispose();background.dispose();}
}
