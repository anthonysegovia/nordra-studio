uniform float time, seed, variant;
varying vec2 ribbon;
varying float nearWeight;
void main() {
  float u = uv.x, v = uv.y * 1.13 - 0.13;
  float energetic = step(0.5,variant), crown = step(1.5,variant);
  float rear = step(3.0, seed);
  float drift = time * 0.063 + seed;
  float bend = u * mix(8.4, 12.0, energetic) + drift + 0.52 * sin(u * 9.0 - drift);
  float swell = sin(u * 15.0 - time * 0.62 + seed);
  // Along-track folds turn around in X while moving into and out of depth.
  float x = (u - 0.5) * 294.0 + (19.0 + 8.0 * energetic) * sin(bend) + 4.0 * swell;
  float z = -104.0 - 48.0 * cos(bend) - 30.0 * rear + 9.0 * swell;
  float pleat = sin(u*37.0 + seed + 1.7*sin(u*16.0-time*0.34) - time*0.68);
  float curl = sin(u*64.0 + 1.8*pleat + time*0.43);
  x += 2.8*pleat + 1.2*curl;
  z += 4.6*pleat + 1.7*curl;
  nearWeight = clamp((z + 191.0) / 140.0, 0.0, 1.0);
  float y = 38.0 + 6.0 * sin(bend * 0.82 + seed) + 2.8 * swell + rear * 12.0 + 1.6*pleat + 0.65*curl;
  // The luminous foot stays above the summit's apparent elevation even on the far folds.
  float floorY = 4.2 + (46.0 - z) * (0.184 + 0.018 * sin(bend + 0.5));
  y = 0.5 * (y + floorY + sqrt((y-floorY)*(y-floorY) + 42.0));
  vec3 base = vec3(x,y,z);
  vec3 pole = vec3(mix(-24.0, 8.0, crown), mix(145.0, 74.0, crown), mix(-88.0, -158.0, crown));
  float reach = mix(0.24, 0.61, nearWeight) + 0.34 * crown;
  vec3 point = base + (pole - base) * v * reach;
  point.x += max(v, 0.0) * (2.6 * swell + 2.0 * sin(u * 23.0 + time * 0.33));
  ribbon = vec2(u,v);
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(point,1.0);
}
