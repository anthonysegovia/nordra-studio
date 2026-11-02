uniform float time, seed, dark, pulse, pulseCenter, level, sweep;
varying float worldX;
varying vec2 ribbon;
varying float nearWeight;
float hash(float n){return fract(sin(n*127.1)*43758.5453);}
float smoothNoise(float x){float i=floor(x), f=fract(x);return mix(hash(i),hash(i+1.0),f*f*(3.0-2.0*f));}
void main(){
  float u=ribbon.x, v=ribbon.y;
  if(dark < 0.001 || level <= 0.0) discard;
  float h=max(v,0.0);
  float path=u*78.0 + 1.8*sin(u*17.0-time*0.31+seed) + 0.8*sin(u*34.0+time*0.22)
    + h*(1.4*sin(u*12.0+seed)+0.9*sin(h*5.0-time*0.41));
  float silk=smoothNoise(path*0.61+seed);
  float haze=smoothNoise(path*1.27+2.1);
  float tall=mix(0.23,1.0,smoothNoise(path*0.26+seed));
  float flash=smoothstep(0.82,1.0,sin(time*1.17+floor(path)*2.1))*smoothstep(0.83,0.99,hash(floor(path)+seed));
  float fine=exp(-pow((fract(path)-0.5)/0.19,2.0))*flash;
  float breakUp=smoothNoise(u*24.0+0.32*time+seed);
  float seam=smoothstep(0.28,0.69,breakUp);
  float foot=exp(-abs(v)*mix(64.0,144.0,1.0-seam))*seam;
  float density=0.07+0.93*smoothstep(0.18,0.77,smoothNoise(u*12.0+seed+time*0.14));
  float body=(0.22+0.64*silk+0.16*haze+0.22*fine)*exp(-h*2.8)
    *(1.0-smoothstep(tall*0.42,tall,h))*smoothstep(-0.014,0.025,v);
  float knot=exp(-pow((worldX-pulseCenter)/27.0,2.0))*seam;
  vec3 green=vec3(0.12,0.94,0.59),cyan=vec3(0.17,0.76,0.83),violet=vec3(0.61,0.24,0.82);
  vec3 color=mix(green,cyan,smoothstep(0.03,0.22,h));
  color=mix(color,violet,smoothstep(0.13,0.49,h));
  vec3 rim=mix(green,vec3(1.0,0.22,0.62),smoothstep(0.55,0.93,pulse)*knot);
  vec3 emission=(0.68*foot*rim+color*body)*density*mix(0.36,1.0,nearWeight);
  emission*=smoothstep(0.0,0.085,u)*(1.0-smoothstep(0.92,1.0,u))*level;
  emission *= (1.42+0.35*smoothstep(0.16,0.50,h))*(1.0+0.44*knot*pulse);
  emission *= dark*smoothstep(1.0-u,1.24-u,sweep);
  gl_FragColor=vec4(emission,0.0);
}
