uniform float time, seed;
uniform vec3 eye;
varying float worldX;
varying vec2 ribbon;
varying float nearWeight;
void main() {
  float u = uv.x, v = uv.y * 1.13 - 0.13;
  float rear = step(3.0, seed);
  float drift = time * 0.063 + seed;
  float bend = u * 12.0 + drift + 0.52 * sin(u * 9.0 - drift);
  float swell = sin(u * 15.0 - time * 0.62 + seed);
  // Along-track folds turn around in X while moving into and out of depth.
  float x = (u - 0.5) * 294.0 + 27.0 * sin(bend) + 4.0 * swell;
  float z = -104.0 - 48.0 * cos(bend) - 30.0 * rear + 9.0 * swell;
  float pleat = sin(u*37.0 + seed + 1.7*sin(u*16.0-time*0.34) - time*0.68);
  float curl = sin(u*64.0 + 1.8*pleat + time*0.43);
  x += 2.8*pleat + 1.2*curl;
  z += 4.6*pleat + 1.7*curl;
  nearWeight = clamp((z + 191.0) / 140.0, 0.0, 1.0);
  float y = 38.0 + 6.0 * sin(bend * 0.82 + seed) + 2.8 * swell + rear * 12.0 + 1.6*pleat + 0.65*curl;
  // The luminous foot stays above the summit's apparent elevation even on the far folds.
  float floorY = eye.y + (eye.z - z) * (0.184 + 0.018 * sin(bend + 0.5));
  y = 0.5 * (y + floorY + sqrt((y-floorY)*(y-floorY) + 42.0));
  vec3 base = vec3(x,y,z);
  vec3 pole = vec3(-24.0,145.0,-88.0);
  float reach = mix(0.24, 0.61, nearWeight);
  vec3 point = base + (pole - base) * v * reach;
  point.x += max(v, 0.0) * (2.6 * swell + 2.0 * sin(u * 23.0 + time * 0.33));
  // Lift the whole sheet by an angular offset; keep the folds and ray widths intact.
  float aspect = projectionMatrix[1][1] / projectionMatrix[0][0];
  float lift = mix(0.16,0.085,smoothstep(0.6,1.0,aspect));
  point.y += lift * (eye.z - point.z);
  worldX = x;
  ribbon = vec2(u,v);
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(point,1.0);
}
