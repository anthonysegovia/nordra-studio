import { weddingHandler } from '../server/wedding-links.js';

// Same public-sample handler as the deployment; only storage and signing secret are local.
export function samplePanelFixture(origin) {
  const rows=new Map();
  const store={
    async read(id){const row=rows.get(id);return row && Date.parse(row.expires_at)>Date.now()?structuredClone(row):null},
    async create(row){rows.set(row.id,structuredClone(row));return row},
    async swap(row,invitations,boreal,management){
      if(rows.get(row.id)?.version!==row.version)return false;
      rows.set(row.id,structuredClone({...row,invitations,boreal,management:management??row.management,version:row.version+1}));return true;
    },
    async allow(){return true},
  };
  const handler=weddingHandler({store:()=>store,site:()=>origin,secret:()=>'local-visual-fixture',bucket:()=>'local'});
  return async route=>{
    const req=route.request(), headers={};
    const res={setHeader(name,v){headers[name]=v},status(status){this.code=status;return this},json:body=>route.fulfill({status:res.code,headers,json:body})};
    await handler({method:req.method(),headers:{...await req.allHeaders(),origin},body:req.postDataJSON()},res);
  };
}
