// A Reflector target and the screen require distinct Three program variants.
// Wait for each completion and yield to input/paint before starting the next one.
export async function preparePrograms(renderer, camera, scene, objects, { reflection, water, yieldTask, cancelled, overlap = false }) {
  try {
    for (const target of reflection ? [reflection, null] : [null]) {
      if (cancelled()) return false;
      const pending = [];
      let failure;
      try {
        for (const object of objects) {
          if (target && object === water) continue;
          await yieldTask();
          if (cancelled()) return false;
          renderer.setRenderTarget(target);
          const program = renderer.compileAsync(object, camera, scene);
          if (overlap) pending.push(program.catch(error => { failure = error; }));
          else await program;
          if (cancelled()) return false;
        }
      } finally {
        // Three stores the current variant on the material. Finish this target
        // before asking the same material for its screen-space program.
        await Promise.all(pending);
      }
      if (failure) throw failure;
    }
    return true;
  } finally { renderer.setRenderTarget(null); }
}
