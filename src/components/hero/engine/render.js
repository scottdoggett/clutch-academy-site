// The car canvas (docs/spec/hero-drive.md §Car look, §Layers): three.js with
// an orthographic camera at one unit per CSS px, looking straight down, and
// the traffic drawn by one instanced quad in a single draw call, the black
// car by another. The fragment shader shapes each car: a rounded body, a
// windscreen and a rear window, and two headlights, with its own
// anti-aliased edges, so it stays crisp at any pixel ratio with no images.
//
// The simulation keeps DOM orientation, y down. The camera draws it at -y.
//
// Normally the canvas covers the hero. While someone drives, it covers the
// window instead (§Driving the whole page): the camera follows the hero as
// the page scrolls, the traffic is clipped to the hero, and the black car
// and its tyre marks (marks.js) can be drawn anywhere. The marks go under
// all the cars.

import {
  BufferAttribute,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  OrthographicCamera,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three'
import { CONFIG } from '../config.js'
import { createMarks } from './marks.js'

const vertexShader = /* glsl */ `
  attribute vec3 pose;   // x, y in CSS px (y down), heading in radians
  attribute vec3 body;
  attribute vec3 glass;
  uniform vec2 size;     // the car's length and width, px
  uniform float pad;     // px of quad beyond the body, room for the soft edge
  varying vec2 vP;       // this point in the car's own frame, px, x forward
  varying vec3 vBody;
  varying vec3 vGlass;

  void main() {
    vec2 p = position.xy * (size + 2.0 * pad);
    float c = cos(pose.z);
    float s = sin(pose.z);
    vec2 at = pose.xy + vec2(p.x * c - p.y * s, p.x * s + p.y * c);
    vP = p;
    vBody = body;
    vGlass = glass;
    gl_Position = projectionMatrix * viewMatrix * vec4(at.x, -at.y, 0.0, 1.0);
  }
`

// Proportions are fractions of the car's length and width, so a phone car
// at 0.6 zoom is the same shape.
const fragmentShader = /* glsl */ `
  uniform vec2 size;
  uniform vec3 lamp;
  varying vec2 vP;
  varying vec3 vBody;
  varying vec3 vGlass;

  float box(vec2 p, vec2 extent, float r) {
    vec2 q = abs(p) - extent + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  // How much of this pixel a shape covers, from its signed distance.
  float cover(float d) {
    return clamp(0.5 - d / max(fwidth(d), 1e-4), 0.0, 1.0);
  }

  void main() {
    float L = size.x;
    float W = size.y;
    vec2 p = vP;

    float shape = cover(box(p, vec2(L, W) * 0.5, W * 0.3));
    if (shape <= 0.0) discard;

    vec3 col = vBody;
    // Windscreen, then the rear window.
    col = mix(col, vGlass, cover(box(p - vec2(L * 0.13, 0.0), vec2(L * 0.09, W * 0.36), W * 0.14)));
    col = mix(col, vGlass, cover(box(p - vec2(-L * 0.3, 0.0), vec2(L * 0.055, W * 0.33), W * 0.12)));
    // Headlights, one each side at the nose.
    vec2 q = vec2(p.x, abs(p.y));
    col = mix(col, lamp, cover(box(q - vec2(L * 0.455, W * 0.29), vec2(L * 0.035, W * 0.11), W * 0.05)));

    gl_FragColor = vec4(col, shape);
  }
`

// The takeover ring: a circle outline around the black car, drawn on one
// quad, anti-aliased the same way as the cars.
const ringVertex = /* glsl */ `
  uniform vec3 ring;     // x, y (CSS px, y down), radius
  uniform float width;
  varying vec2 vP;

  void main() {
    vec2 p = position.xy * 2.0 * (ring.z + width);
    vP = p;
    gl_Position = projectionMatrix * viewMatrix * vec4(ring.x + p.x, -(ring.y + p.y), 0.0, 1.0);
  }
`

const ringFragment = /* glsl */ `
  uniform vec3 ring;
  uniform float width;
  uniform vec4 color;
  varying vec2 vP;

  void main() {
    float d = abs(length(vP) - ring.z) - width * 0.5;
    float a = clamp(0.5 - d / max(fwidth(d), 1e-4), 0.0, 1.0) * color.a;
    if (a <= 0.0) discard;
    gl_FragColor = vec4(color.rgb, a);
  }
`

// canvas: the element to draw into. colors: { traffic, black, lamp }, each
// { body, glass } or an [r, g, b] in 0–1 sRGB, straight from the tokens.
export function createRenderer(canvas, colors) {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false, // the shader draws its own soft edges
    powerPreference: 'low-power', // a decoration shouldn't wake a discrete GPU
  })
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  const camera = new OrthographicCamera(0, 1, 0, -1, -1, 1)

  const max = CONFIG.traffic.max
  // One quad, -0.5 to 0.5, as two triangles. They're wound clockwise
  // because drawing at -y mirrors them, and three.js culls back faces.
  const quad = new BufferAttribute(new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0]), 3)
  const corners = [0, 2, 1, 0, 3, 2]

  // Instances of the car quad, up to n of them: the traffic's, and the
  // black car's on its own so it can be drawn outside the hero.
  function cars(n) {
    const geometry = new InstancedBufferGeometry()
    geometry.setAttribute('position', quad)
    geometry.setIndex(corners)
    const attr = (name) => {
      const a = new InstancedBufferAttribute(new Float32Array(n * 3), 3)
      a.setUsage(DynamicDrawUsage)
      geometry.setAttribute(name, a)
      return a
    }
    const set = { geometry, pose: attr('pose'), body: attr('body'), glass: attr('glass'), n: 0 }
    geometry.instanceCount = 0
    return set
  }
  const traffic = cars(max)
  const black = cars(1)

  function put(set, car, c) {
    const i = set.n++
    set.pose.setXYZ(i, car.x, car.y, car.a)
    set.body.setXYZ(i, c.body[0], c.body[1], c.body[2])
    set.glass.setXYZ(i, c.glass[0], c.glass[1], c.glass[2])
  }

  function finish(set) {
    set.geometry.instanceCount = set.n
    set.pose.needsUpdate = set.body.needsUpdate = set.glass.needsUpdate = true
  }

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      size: { value: [24, 11] },
      pad: { value: 1 },
      lamp: { value: colors.lamp },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
  })

  const mesh = new Mesh(traffic.geometry, material)
  mesh.frustumCulled = false
  scene.add(mesh)
  const blackMesh = new Mesh(black.geometry, material)
  blackMesh.frustumCulled = false
  blackMesh.renderOrder = 1
  scene.add(blackMesh)

  // The takeover ring, over the cars. Its own quad, one more draw call.
  const ringGeometry = new InstancedBufferGeometry()
  ringGeometry.setAttribute('position', quad)
  ringGeometry.setIndex(corners)
  ringGeometry.instanceCount = 1
  const ringStyle = CONFIG.render.ring
  const ringMaterial = new ShaderMaterial({
    vertexShader: ringVertex,
    fragmentShader: ringFragment,
    uniforms: {
      ring: { value: [0, 0, ringStyle.from] },
      width: { value: ringStyle.width },
      color: { value: [...colors.black.body, 0] },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
  })
  const ringMesh = new Mesh(ringGeometry, ringMaterial)
  ringMesh.frustumCulled = false
  ringMesh.renderOrder = 2
  ringMesh.visible = false
  scene.add(ringMesh)

  const marks = createMarks(quad, corners, colors.black.body)
  scene.add(marks.mesh)

  // Only these meshes drawn, for one pass of a clipped frame.
  const all = [marks.mesh, mesh, blackMesh, ringMesh]
  function only(...shown) {
    for (const m of all) m.visible = shown.includes(m)
  }

  let lost = false
  const onLost = (e) => {
    e.preventDefault()
    lost = true
  }
  canvas.addEventListener('webglcontextlost', onLost)

  let size = { width: 1, height: 1 }
  // Where the simulation's origin (the hero's top left) is on the canvas,
  // CSS px, and the box the traffic is clipped to, or null for none.
  let origin = { x: 0, y: 0 }
  let clip = null

  function place() {
    camera.left = -origin.x
    camera.right = size.width - origin.x
    camera.top = origin.y
    camera.bottom = origin.y - size.height
    camera.updateProjectionMatrix()
  }

  return {
    marks,

    // The canvas's size, CSS px.
    resize(width, height) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, CONFIG.render.maxDpr))
      renderer.setSize(width, height, false)
      size = { width, height }
      place()
    },

    // x, y: where the hero's top left is on the canvas, CSS px. box: the
    // traffic's clip, { x0, y0, x1, y1 } on the canvas, or null when the
    // canvas is the hero and its own edges clip.
    view(x, y, box = null) {
      if (x !== origin.x || y !== origin.y) {
        origin = { x, y }
        place()
      }
      clip = box
    },

    // The car's size on this map, px.
    setCar(length, width) {
      material.uniforms.size.value = [length, width]
    },

    // ring: { x, y, t } from the driver while the takeover ring shows, t in
    // seconds. still: reduced motion, where it holds its size and doesn't
    // fade, then goes. time: the engine's clock, s, for the marks' fade.
    draw(cars, ring, still = false, time = 0) {
      if (lost) return
      marks.update(time)
      ringMesh.visible = !!ring
      if (ring) {
        const e = Math.min(1, ring.t / ringStyle.life)
        const out = 1 - (1 - e) ** 3
        const r = still ? ringStyle.to : ringStyle.from + (ringStyle.to - ringStyle.from) * out
        ringMaterial.uniforms.ring.value = [ring.x, ring.y, r]
        ringMaterial.uniforms.color.value[3] = still ? 0.9 : 0.9 * (1 - e)
      }
      traffic.n = black.n = 0
      for (const car of cars) {
        if (!car.active) continue
        if (car.black) put(black, car, colors.black)
        else if (traffic.n < max) put(traffic, car, colors.traffic)
      }
      finish(traffic)
      finish(black)
      if (!clip) {
        renderer.render(scene, camera)
        return
      }
      // Over the window: the marks wherever they are, the traffic only
      // inside the hero, then the black car and the ring over everything. A
      // scissored clear would only clear the scissor box, so the whole
      // canvas is cleared first.
      const ringOn = ringMesh.visible
      renderer.autoClear = false
      renderer.clear()
      only(marks.mesh)
      renderer.render(scene, camera)
      const w = Math.max(0, clip.x1 - clip.x0)
      const h = Math.max(0, clip.y1 - clip.y0)
      if (w && h) {
        only(mesh)
        renderer.setScissorTest(true)
        renderer.setScissor(clip.x0, size.height - clip.y1, w, h)
        renderer.render(scene, camera)
        renderer.setScissorTest(false)
      }
      only(blackMesh, ...(ringOn ? [ringMesh] : []))
      renderer.render(scene, camera)
      only(marks.mesh, mesh, blackMesh, ...(ringOn ? [ringMesh] : []))
      renderer.autoClear = true
    },

    get lost() {
      return lost
    },

    dispose() {
      canvas.removeEventListener('webglcontextlost', onLost)
      traffic.geometry.dispose()
      black.geometry.dispose()
      marks.dispose()
      material.dispose()
      ringGeometry.dispose()
      ringMaterial.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}
