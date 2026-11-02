uniform float time, seed, variant, pulse, level;
varying vec2 ribbon;
varying float nearWeight;
float hash(float n){return fract(sin(n*127.1)*43758.5453);}
float smoothNoise(float x){float i=floor(x), f=fract(x);return mix(hash(i),hash(i+1.0),f*f*(3.0-2.0*f));}
void main(){
  float u=ribbon.x, v=ribbon.y;
  bool energetic=variant>0.5 && variant<1.5;
  if(seed>3.0 && !energetic) discard;
  float coord=u*126.0 + 2.3*sin(u*19.0+time*0.22+seed) + 1.4*sin(u*44.0-time*0.31);
  float id=floor(coord), local=fract(coord);
  float strand=exp(-pow((local-mix(0.25,0.75,hash(id+seed)))/mix(0.075,0.32,hash(id+15.0)),2.0));
  float flash=pow(max(0.0,sin(time*1.1+hash(id+seed)*48.0)),6.0);
  float tall=mix(0.20,0.98,smoothNoise(coord*0.23+seed));
  float h=max(v,0.0);
  float foot=exp(-abs(v)*78.0);
  float pocket=smoothNoise(u*13.0+seed+time*0.13);
  float density=0.09+0.91*smoothstep(0.21,0.73,pocket);
  float veil=exp(-h*3.8)*(0.62+0.38*smoothNoise(coord*0.41));
  float rays=strand*(0.36+0.82*hash(id+seed)+0.65*flash)*(1.0-smoothstep(tall*0.45,tall,h));
  float silk = 0.76 + 0.24 * smoothNoise(coord * 1.71 + 0.7 * sin(h * 3.1 + u * 14.0));
  float body=(veil*silk+0.64*rays)*smoothstep(-0.012,0.018,v)*(1.0-smoothstep(0.63,0.97,h));
  float knot=exp(-pow((u-0.5-0.19*sin(time*0.28+seed))*4.4,2.0));
  vec3 green=vec3(0.12,0.94,0.59),cyan=vec3(0.17,0.76,0.83),violet=vec3(0.61,0.24,0.82);
  vec3 color=mix(green,cyan,smoothstep(0.03,0.22,h));
  color=mix(color,violet,smoothstep(0.13,0.49,h));
  vec3 rim=mix(green,vec3(1.0,0.22,0.62),energetic?smoothstep(0.55,0.93,pulse)*knot:0.0);
  vec3 emission=(0.68*foot*rim+color*body)*density*mix(0.36,1.0,nearWeight);
  emission*=smoothstep(0.0,0.085,u)*(1.0-smoothstep(0.92,1.0,u))*level;
  emission*=mix(0.76,1.03,step(0.5,variant))*(1.0+0.44*knot*pulse);
  gl_FragColor=vec4(emission,0.0);
}
