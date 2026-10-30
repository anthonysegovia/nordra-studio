// A Reflector target and the screen require distinct Three program variants.
// Wait for each completion and yield to input/paint before starting the next one.
export async function preparePrograms(renderer, camera, scene, objects, { reflection, water, yieldTask, cancelled }) {
  try {
    for (const target of reflection ? [reflection, null] : [null]) {
      if (cancelled()) return false;
      for (const object of objects) {
        if (target && object === water) continue;
        await yieldTask();
        if (cancelled()) return false;
        renderer.setRenderTarget(target);
        await renderer.compileAsync(object, camera, scene);
        if (cancelled()) return false;
      }
    }
    return true;
  } finally { renderer.setRenderTarget(null); }
}
