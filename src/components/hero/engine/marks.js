// Tyre marks (docs/spec/hero-drive.md §Tyre marks): thin dark strips behind
// the black car, drawn under the cars and over everything else, anywhere on
// the page the car went. drive/tread.js decides where and how strong; this
// draws them.
//
// Every segment is one instance of a quad in a fixed pool, recycled oldest
// first. Each carries its ends, the time it was laid and its strength, and
// the shader fades it from those, so the CPU sets one uniform a frame and
// uploads only the slots written since the last one.
//
// Marks laid on the reviews strip (§The treadmill) are in the strip's own
// frame, and ride along with it: the shader adds how far the strip has
// moved, and fades them out at the strip's ends, as the cards do.

import {
  DoubleSide,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  ShaderMaterial,
} from 'three'
import { CONFIG } from '../config.js'

const vertexShader = /* glsl */ `
  attribute vec4 seg;    // x0, y0, x1, y1 in CSS px, y down
  attribute vec3 info;   // when it was laid, s; strength, 0 to 1; 1 if on the strip
  uniform float time;
  uniform float travel;  // px the strip has moved, + right
  uniform vec3 strip;    // its left and right ends, px, and the fade at each
  uniform float alpha;   // a full-strength mark's opacity
  uniform vec2 width;    // px: a rolling mark's, a full skid's
  uniform vec2 life;     // s: a rolling mark's, a full skid's
  varying float vAlpha;
  varying float vAcross; // px from the strip's centre line
  varying float vEdge;   // px from the centre line to its edge

  void main() {
    float strength = info.y;
    float age = time - info.x;
    float left = 1.0 - age / mix(life.x, life.y, strength);
    float carried = info.z > 0.5 ? travel : 0.0;
    vec2 a = seg.xy + vec2(carried, 0.0);
    vec2 d = seg.zw - seg.xy;
    float len = length(d);
    vec2 dir = len > 1e-4 ? d / len : vec2(1.0, 0.0);
    vec2 n = vec2(-dir.y, dir.x);
    vEdge = mix(width.x, width.y, strength) * 0.5;
    // Half a px more each side for the soft edge.
    vAcross = position.y * 2.0 * (vEdge + 0.5);
    vec2 p = a + d * (position.x + 0.5) + n * vAcross;
    vAlpha = age < 0.0 ? 0.0 : alpha * strength * max(left, 0.0);
    if (info.z > 0.5) {
      float mid = a.x + d.x * 0.5;
      vAlpha *= clamp(min(mid - strip.x, strip.y - mid) / strip.z, 0.0, 1.0);
    }
    gl_Position = projectionMatrix * viewMatrix * vec4(p.x, -p.y, 0.0, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 color;
  varying float vAlpha;
  varying float vAcross;
  varying float vEdge;

  void main() {
    float a = vAlpha * clamp(vEdge + 0.5 - abs(vAcross), 0.0, 1.0);
    if (a <= 0.0) discard;
    gl_FragColor = vec4(color, a);
  }
`

// quad: the shared -0.5 to 0.5 quad's position attribute and its index.
// color: [r, g, b], --black.
export function createMarks(quad, corners, color, cfg = CONFIG.marks) {
  const n = cfg.pool
  const geometry = new InstancedBufferGeometry()
  geometry.setAttribute('position', quad)
  geometry.setIndex(corners)
  const seg = new InstancedBufferAttribute(new Float32Array(n * 4), 4)
  const info = new InstancedBufferAttribute(new Float32Array(n * 3), 3)
  seg.setUsage(DynamicDrawUsage)
  info.setUsage(DynamicDrawUsage)
  geometry.setAttribute('seg', seg)
  geometry.setAttribute('info', info)
  geometry.instanceCount = 0

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: { value: 0 },
      travel: { value: 0 },
      strip: { value: [0, 0, 64] },
      alpha: { value: cfg.alpha },
      width: { value: cfg.width },
      life: { value: [cfg.rollFade, cfg.fade] },
      color: { value: color },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: DoubleSide,
  })

  const mesh = new Mesh(geometry, material)
  mesh.frustumCulled = false
  mesh.renderOrder = -1 // under the cars

  let next = 0 // the ring slot the next segment goes in
  let filled = 0
  let from = -1 // the first slot written since the last upload, and how many
  let count = 0

  // Slots [start, start + many) to upload, as ranges of each attribute.
  function range(start, many) {
    seg.addUpdateRange(start * 4, many * 4)
    info.addUpdateRange(start * 3, many * 3)
  }

  return {
    mesh,

    // A segment from (x0, y0) to (x1, y1), px, laid at `t` seconds; on the
    // strip, in its frame.
    add(x0, y0, x1, y1, strength, t, onBelt = false) {
      if (from < 0) from = next
      count = Math.min(count + 1, n)
      seg.setXYZW(next, x0, y0, x1, y1)
      info.setXYZ(next, t, strength, onBelt ? 1 : 0)
      next = (next + 1) % n
      filled = Math.min(filled + 1, n)
    },

    // Before a frame is drawn: the clock, and the new slots uploaded.
    update(t) {
      material.uniforms.time.value = t
      geometry.instanceCount = filled
      if (from < 0) return
      seg.clearUpdateRanges()
      info.clearUpdateRanges()
      if (count >= n) range(0, n)
      else if (from + count <= n) range(from, count)
      else {
        range(from, n - from)
        range(0, from + count - n)
      }
      seg.needsUpdate = info.needsUpdate = true
      from = -1
      count = 0
    },

    // Where the strip is, px in the hero's frame, and how far it has moved.
    belt(travel, x0, x1, fade = 64) {
      material.uniforms.travel.value = travel
      const s = material.uniforms.strip.value
      s[0] = x0
      s[1] = x1
      s[2] = fade
    },

    // How long a mark of this strength lasts, s.
    life(strength) {
      return cfg.rollFade + (cfg.fade - cfg.rollFade) * strength
    },

    // The page moved under them (a resize): they'd no longer line up.
    clear() {
      next = filled = count = 0
      from = -1
      geometry.instanceCount = 0
    },

    dispose() {
      geometry.dispose()
      material.dispose()
    },
  }
}
