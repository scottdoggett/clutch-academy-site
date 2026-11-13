// Smoke and sparks (docs/spec/hero-drive.md §Smoke, §Effects): a pool of
// particles drawn over the cars. drive/effects.js decides what to
// emit and where; this draws it.
//
// Two pools, one instanced quad each: smoke, blended normally, soft and
// round, growing and thinning as it goes; and glow, added to what's under
// it, for sparks, cooling from its colour towards a deep red as it dies. Every particle carries where and when it started, its velocity
// and drag, its size at birth and death, its colour and how long it lives;
// the shader moves and fades it from those, so the CPU writes each one once
// and sets one uniform a frame. Oldest recycled first.

import {
  AdditiveBlending,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  NormalBlending,
  ShaderMaterial,
} from 'three'
import { CONFIG } from '../config.js'

const vertexShader = /* glsl */ `
  attribute vec4 motion;  // x, y (CSS px, y down), vx, vy (px/s)
  attribute vec4 span;    // birth s, life s, size at birth, size at death (px)
  attribute vec4 tint;    // r, g, b, opacity
  attribute vec2 feel;    // drag (1/s), stretch along the way it's going
  uniform float time;
  varying vec2 vP;
  varying float vT;
  varying vec4 vTint;

  void main() {
    float age = time - span.x;
    float t = age / span.y;
    vT = t;
    vTint = tint;
    if (t < 0.0 || t > 1.0) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // not yet, or gone: off screen
      return;
    }
    float drag = feel.x;
    float travel = drag > 0.001 ? (1.0 - exp(-drag * age)) / drag : age;
    vec2 at = motion.xy + motion.zw * travel;
    float size = mix(span.z, span.w, t);
    // Sparks draw as streaks along the way they're going.
    vec2 v = motion.zw * exp(-drag * age);
    float speed = length(v);
    vec2 dir = speed > 0.001 ? v / speed : vec2(1.0, 0.0);
    vec2 side = vec2(-dir.y, dir.x);
    float len = size + feel.y * speed * 0.05;
    vP = position.xy * 2.0;
    vec2 p = at + dir * position.x * len + side * position.y * size;
    gl_Position = projectionMatrix * viewMatrix * vec4(p.x, -p.y, 0.0, 1.0);
  }
`

const smokeFragment = /* glsl */ `
  varying vec2 vP;
  varying float vT;
  varying vec4 vTint;

  void main() {
    float r = length(vP);
    float a = vTint.a * (1.0 - smoothstep(0.35, 1.0, r)) * pow(1.0 - vT, 1.3);
    if (a <= 0.003) discard;
    gl_FragColor = vec4(vTint.rgb, a);
  }
`

const glowFragment = /* glsl */ `
  varying vec2 vP;
  varying float vT;
  varying vec4 vTint;

  void main() {
    float r = length(vP);
    float a = vTint.a * (1.0 - smoothstep(0.1, 1.0, r)) * (1.0 - vT);
    if (a <= 0.003) discard;
    // Cooling as it dies: towards a deep red.
    vec3 col = mix(vTint.rgb, vec3(0.75, 0.1, 0.03), smoothstep(0.2, 1.0, vT));
    gl_FragColor = vec4(col * a, a);
  }
`

function pool(n, quad, corners, fragmentShader, blending, order) {
  const geometry = new InstancedBufferGeometry()
  geometry.setAttribute('position', quad)
  geometry.setIndex(corners)
  const attr = (name, size) => {
    const a = new InstancedBufferAttribute(new Float32Array(n * size), size)
    a.setUsage(DynamicDrawUsage)
    geometry.setAttribute(name, a)
    return a
  }
  const motion = attr('motion', 4)
  const span = attr('span', 4)
  const tint = attr('tint', 4)
  const feel = attr('feel', 2)
  geometry.instanceCount = 0
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { time: { value: 0 } },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending,
    premultipliedAlpha: blending === AdditiveBlending,
  })
  const mesh = new Mesh(geometry, material)
  mesh.frustumCulled = false
  mesh.renderOrder = order

  let next = 0
  let filled = 0
  let from = -1
  let count = 0
  const all = [motion, span, tint, feel]

  return {
    mesh,
    add(p, t) {
      if (from < 0) from = next
      count = Math.min(count + 1, n)
      motion.setXYZW(next, p.x, p.y, p.vx ?? 0, p.vy ?? 0)
      span.setXYZW(next, t + (p.delay ?? 0), p.life, p.from, p.to)
      tint.setXYZW(next, p.color[0], p.color[1], p.color[2], p.alpha)
      feel.setXY(next, p.drag ?? 0, p.stretch ?? 0)
      next = (next + 1) % n
      filled = Math.min(filled + 1, n)
    },
    update(t) {
      material.uniforms.time.value = t
      geometry.instanceCount = filled
      if (from < 0) return
      for (const a of all) {
        a.clearUpdateRanges()
        const size = a.itemSize
        if (count >= n) a.addUpdateRange(0, n * size)
        else if (from + count <= n) a.addUpdateRange(from * size, count * size)
        else {
          a.addUpdateRange(from * size, (n - from) * size)
          a.addUpdateRange(0, (from + count - n) * size)
        }
        a.needsUpdate = true
      }
      from = -1
      count = 0
    },
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

// quad, corners: the shared -0.5 to 0.5 quad and its index.
export function createParticles(quad, corners, cfg = CONFIG.effects) {
  const smoke = pool(cfg.pools.smoke, quad, corners, smokeFragment, NormalBlending, 3)
  const glow = pool(cfg.pools.glow, quad, corners, glowFragment, AdditiveBlending, 4)

  return {
    meshes: [smoke.mesh, glow.mesh],

    // A particle, from drive/effects.js: { kind: 'smoke' | 'glow', x, y,
    // vx, vy, life, from, to, color, alpha, drag, stretch, delay }, laid at
    // `t` seconds.
    add(p, t) {
      ;(p.kind === 'glow' ? glow : smoke).add(p, t)
    },

    update(t) {
      smoke.update(t)
      glow.update(t)
    },

    clear() {
      smoke.clear()
      glow.clear()
    },

    dispose() {
      smoke.dispose()
      glow.dispose()
    },
  }
}
