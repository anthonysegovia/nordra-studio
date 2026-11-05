// Some drivers synchronously initialize their WebGL2 backend on the first context.
// Warm that backend off the UI thread; this temporary context never renders.
self.onmessage=()=>{
 let gl;
 try{
  gl=new OffscreenCanvas(1,1).getContext('webgl2',{antialias:false,alpha:true,premultipliedAlpha:true});
  gl?.getParameter(gl.VERSION);
 }finally{
  gl?.getExtension('WEBGL_lose_context')?.loseContext();
  self.postMessage('ready');self.close();
 }
};
