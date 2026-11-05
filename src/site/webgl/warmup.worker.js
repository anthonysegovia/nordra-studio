// Initialize both browser GL backends away from the UI thread, without drawing.
self.onmessage=()=>{
 try{for(const type of ['webgl','webgl2']){
  const gl=new OffscreenCanvas(1,1).getContext(type,{antialias:false,alpha:true,premultipliedAlpha:true});
  gl?.getParameter(gl.VERSION);gl?.getExtension('WEBGL_lose_context')?.loseContext();
 }}finally{self.postMessage('ready');self.close();}
};
