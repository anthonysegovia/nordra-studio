import{D as e,En as t,Et as n,Un as r,W as i,at as a,ft as o}from"./three.core-BnyATOTM.js";var s=e=>Math.min(1,Math.max(0,e)),c=(e,t,n)=>s((n-e)/(t-e)),l=e=>e*e*(3-2*e),u=e=>1-(1-e)**3,d=e=>e<.5?4*e*e*e:1-(-2*e+2)**3/2,f=(e,t,n)=>e+(t-e)*n;function p(e){let t=Math.sin(e*127.1+311.7)*43758.5453;return t-Math.floor(t)}function m(e,t=.7){let n=new o({color:`#fdfaf7`,roughness:.02,metalness:0,transparent:!0,opacity:t,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:2.4,depthWrite:!1});return e&&(n.envMap=e),n}function h({count:o=24,size:s=.006,speed:c=.9,envMap:l}){let u=new i(new t(1,12,8),m(l,.75),o);u.instanceMatrix.setUsage(e),u.frustumCulled=!1,u.renderOrder=2;let d=Array.from({length:o},(e,t)=>[p(t+1),p(t+51),p(t+101)]),f=new a,h=new r,g=new r,_=new n,v=2.6;function y(e,t,n=1){for(let r=0;r<o;r++){let[i,a,l]=d[r],p=r/o*Math.PI*2+i*.4,m=c*n*(.25+.45*a),y=c*n*(.9+.9*l),b=t-l*.05,x=y*b-.5*v*b*b;if(b<=0||x<0)f.makeScale(0,0,0);else{h.set(e.x+Math.cos(p)*m*b,x,e.z+Math.sin(p)*m*b);let t=s*(.5+a)*n,r=y-v*b;g.set(t,t*(1+Math.min(Math.abs(r)*.6,.8)),t),f.compose(h,_,g)}u.setMatrixAt(r,f)}u.instanceMatrix.needsUpdate=!0}return y(new r,-1),{mesh:u,update:y}}var g=`
float caustic(vec2 p, float time) {
  vec2 i = p;
  float c = 1.0;
  float inten = 0.005;
  for (int n = 0; n < 4; n++) {
    float t = time * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
  }
  c /= 4.0;
  c = 1.17 - pow(c, 1.4);
  return clamp(pow(abs(c), 8.0), 0.0, 1.6);
}
`;export{p as a,l as c,u as i,h as n,f as o,d as r,c as s,g as t};