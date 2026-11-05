import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const root=process.cwd();
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.ttf':'font/ttf'};
export async function localServer(port=5602){
 const server=http.createServer((req,res)=>{
  let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(!/^\/(documentacion\/gafete|public|demos|fonts|nordra|artwork)\//.test(pathname)){res.writeHead(404);res.end();return;}
  if(pathname.endsWith('/'))pathname+='index.html';
  let file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  if(!fs.existsSync(file))file=path.resolve(root,'public','.'+pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
 });await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));return server;
}
