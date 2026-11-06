// Cache geometric influence once; toggling a tube only dirties nearby bricks.
export function lightingCache(bricks,sources,radius){
  const values=bricks.map(()=>[0,0,0,0]);
  const previous=sources.map(()=>[0,0,0]);
  const influence=sources.map(s=>bricks.flatMap(([x,y,w,h],index)=>{
    const cx=x+w/2,cy=y+h/2;
    const k=s.k/(1+(((cx-s.x)**2+(cy-s.y)**2)/(radius*radius))*4.5)-.07;
    return k>0?[[index,k,cy>s.y?1:-1]]:[];
  }));
  return {values,update(colors,all=false){
    const dirty=new Set(all?bricks.map((_,i)=>i):[]);
    colors.forEach((color,j)=>{
      const diff=color.map((v,k)=>v-previous[j][k]);
      if(!diff.some(v=>v!==0))return;
      const wasOn=previous[j].some(v=>v!==0),on=color.some(v=>v!==0);
      for(const [i,k,direction] of influence[j]){
        for(let n=0;n<3;n++)values[i][n]+=diff[n]*k;
        values[i][3]+=(Number(on)-Number(wasOn))*direction*k;
        dirty.add(i);
      }
      previous[j]=[...color];
    });
    return dirty;
  }};
}
