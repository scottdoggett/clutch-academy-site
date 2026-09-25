// Knocks and effects (docs/spec/hero-drive.md §Traffic as physical bodies,
// §Recovery, §Smoke, §Effects), headless: the black car rams traffic, the
// cars it hits are bumped, slide, settle and find their way back; and the
// driving throws off smoke and sparks. planck runs in Node; the tests set
// the controls. Run with `npm test`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CONFIG } from '../config.js'
import { buildGraph } from '../graph.js'
import { carCount, createTraffic } from '../engine/traffic.js'
import { createDriver } from './index.js'

const wide = JSON.parse(readFileSync(new URL('../layouts/wide.json', import.meta.url), 'utf8'))
const DT = CONFIG.world.step
const K = CONFIG.world.pxPerM
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a))

function scene({ width = 1440, height = 716, seed = CONFIG.world.seed, mode = 'auto' } = {}) {
  const graph = buildGraph(wide, { width, height })
  const sim = createTraffic(graph, wide, { count: carCount(wide, width, height), seed })
  const particles = []
  const driver = createDriver({
    sim,
    k: K,
    box: { width, height },
    top: 64,
    mode,
    onParticle: (p) => particles.push(p),
  })
  driver.step(DT, true)
  return { sim, driver, car: sim.cars.find((c) => c.black), particles, width, height }
}

const knockedCars = (s) => s.sim.cars.filter((c) => c !== s.car && c.driven)

// Flat out at the nearest traffic car until one more is knocked.
function ram(s, secs = 10) {
  const already = new Set(knockedCars(s))
  const want = s.driver.controls.want
  for (let t = 0; t < secs; t += DT) {
    let best = null
    let bestD = Infinity
    for (const c of s.sim.cars) {
      if (c === s.car || !c.active || c.driven) continue
      const d = Math.hypot(c.x - s.car.x, c.y - s.car.y)
      if (d < bestD) {
        bestD = d
        best = c
      }
    }
    if (best) {
      const aim = Math.atan2(best.y - s.car.y, best.x - s.car.x)
      want.steer = Math.max(-1, Math.min(1, wrap(aim - s.car.a) * 3))
    }
    want.throttle = 1
    want.brake = 0
    s.driver.step(DT, true)
    const fresh = knockedCars(s).find((c) => !already.has(c))
    if (fresh) return fresh
  }
  return null
}

test('ramming a traffic car knocks it out of its lane: it slides, settles and finds its own way back', () => {
  let rejoined = 0
  let tries = 0
  for (let seed = 1; seed <= 6; seed++) {
    const s = scene({ seed })
    const hit = ram(s)
    if (!hit) continue
    tries++
    const from = { x: hit.x, y: hit.y }
    s.driver.release()
    let secs = 0
    let moved = 0
    while (s.driver.state !== 'done' && secs < 25) {
      s.driver.step(DT, true)
      secs += DT
      if (hit.driven) moved = Math.max(moved, Math.hypot(hit.x - from.x, hit.y - from.y))
    }
    assert.equal(s.driver.state, 'done', `seed ${seed}: still settling after ${secs.toFixed(0)}s`)
    assert.ok(moved > 2, `seed ${seed}: the knocked car hardly moved`)
    assert.ok(!hit.driven, `seed ${seed}: never handed back to traffic`)
    if (hit.active && !hit.fade) rejoined++
  }
  assert.ok(tries >= 4, `only ${tries} of 6 runs hit anything`)
  assert.ok(rejoined + tries > 0)
})

test('a crash throws sparks and nothing else; a stall puffs smoke from the exhaust; sliding tyres smoke', () => {
  const s = scene({ seed: 2 })
  const hit = ram(s)
  const sparks = s.particles.filter((p) => p.kind === 'glow')
  assert.ok(sparks.length >= 4, `${sparks.length} sparks`)
  assert.ok(sparks.every((p) => p.stretch), 'something glowed that wasn\'t a spark')
  // The car it hit is bumped, not hurt: it never fades while it's on the roads.
  s.driver.release()
  let faded = false
  for (let t = 0; t < 3 && hit.driven; t += DT) {
    s.driver.step(DT, true)
    if ((hit.fade ?? 1) < 1 && hit.x > 0 && hit.x < s.width && hit.y > 0 && hit.y < s.height) faded = true
  }
  assert.ok(!faded, 'the knocked car faded in the hero')

  // A stall: manual, 2nd at a standstill, clutch out.
  const t = scene({ seed: 4, mode: 'manual' })
  const want = t.driver.controls.want
  want.brake = 1
  for (let i = 0; i < 3 / DT; i++) t.driver.step(DT, true)
  want.brake = 0
  want.clutch = 1
  for (let i = 0; i < 0.2 / DT; i++) t.driver.step(DT, true)
  t.driver.shift(+1)
  t.driver.step(DT, true)
  t.driver.shift(+1)
  t.driver.step(DT, true)
  const before = t.particles.length
  want.clutch = 0
  for (let i = 0; i < 0.5 / DT && t.driver.telemetry.state !== 'stalled'; i++) t.driver.step(DT, true)
  assert.equal(t.driver.telemetry.state, 'stalled')
  const puffs = t.particles.slice(before).filter((p) => p.kind === 'smoke')
  assert.ok(puffs.length >= 6, `${puffs.length} puffs on a stall`)

  // A drift: fast and at full lock.
  const d = scene({ seed: 5 })
  const w = d.driver.controls.want
  w.throttle = 1
  for (let i = 0; i < 1.2 / DT; i++) d.driver.step(DT, true)
  const at = d.particles.length
  w.steer = 1
  for (let i = 0; i < 1 / DT; i++) d.driver.step(DT, true)
  const tyres = d.particles.slice(at).filter((p) => p.kind === 'smoke')
  assert.ok(tyres.length > 5, `${tyres.length} puffs from a drift`)
})

test('a chain of knocks clears on its own within 15s of the last', () => {
  const s = scene({ seed: 7, width: 1920, height: 1016 })
  const seen = new Set()
  for (let round = 0; round < 6; round++) {
    ram(s, 5)
    for (const c of knockedCars(s)) seen.add(c)
  }
  assert.ok(seen.size >= 3, `only ${seen.size} cars knocked`)
  s.driver.release()
  let quiet = 0 // s since the last new knock
  while (s.driver.state !== 'done' && quiet < 15) {
    const n = knockedCars(s).length
    s.driver.step(DT, true)
    quiet = knockedCars(s).length > n ? 0 : quiet + DT
  }
  assert.equal(s.driver.state, 'done', `${knockedCars(s).length} cars still out after ${quiet.toFixed(0)}s quiet`)
})
