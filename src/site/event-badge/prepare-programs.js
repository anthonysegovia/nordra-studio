import * as THREE from 'three';
import { yieldSetup } from '../wedding-rings/prepare-programs.js';
export { preparePMREM, yieldSetup } from '../wedding-rings/prepare-programs.js';

// Prepare the badge's material variants without changing their visual parameters.
export async function prepareBadgePrograms(renderer, camera, scene) {
    const objects = [];
    scene.traverse(object => { if (object.material)
        objects.push(object); });
    const prepared = new Set();
    for (const object of objects) {
        const material = object.material;
        if (prepared.has(material))
            continue;
        prepared.add(material);
        await yieldSetup();
        await renderer.compileAsync(object, camera, scene);
        if (material.side === THREE.DoubleSide && material.transparent && !material.forceSinglePass) {
            material.side = THREE.BackSide;
            material.needsUpdate = true;
            await yieldSetup();
            await renderer.compileAsync(object, camera, scene);
            material.side = THREE.DoubleSide;
            material.needsUpdate = true;
        }
    }
}
