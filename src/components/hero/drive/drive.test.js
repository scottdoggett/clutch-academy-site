// Play mode, headless (docs/spec/hero-drive.md §Play mode, §Driving and
// physics): the car model on its own, then the black car taken out of
// traffic, driven, parked in the way, and handed back. planck runs in Node;
// there's no keyboard here, so the tests set the controls directly.
// Run with `npm test`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { World } from 'planck'
import { CONFIG } from '../config.js'
import { buildGraph } from '../graph.js'
import { carCount, createTraffic, mulberry32, overlap } from '../engine/traffic.js'
import { createDriver } from './index.js'
import { createPlayer } from './player.js'

const wide = JSON.parse(readFileSync(new URL('../layouts/wide.json', import.meta.url), 'utf8'))
const DT = CONFIG.world.step
const K = CONFIG.world.pxPerM
const NAV = 64 // px, the nav's bottom: the top wall
const kmh = (ms) => ms * 3.6

// The car model alone, on an empty world: `input` each step, for `secs`.
// Each pose also has the slide angle, degrees between where the car points
// and where it's going, and how far into a drift the rear is.
function drive(secs, input, speed = 0) {
  const world = new World({ gravity: { x: 0, y: 0 } })
  const car = createPlayer(world, { x: 0, y: 0, a: 0 }, speed)
  const poses = []
  for (let i = 0; i < secs / DT; i++) {
    car.step(DT, typeof input === 'function' ? input(i * DT) : input)
    world.step(DT, 8, 3)
    const p = car.pose()
    const v = car.body.getLinearVelocity()
    const heading = Math.atan2(v.y, v.x)
    p.slide = Math.hypot(v.x, v.y) > 3 ? Math.abs(Math.atan2(Math.sin(heading - p.a), Math.cos(heading - p.a))) * (180 / Math.PI) : 0
    p.drift = car.drift
    poses.push(p)
  }
  return poses
}

const none = { throttle: 0, brake: 0, steer: 0 }
const at = (run, s) => run[Math.round(s / DT) - 1]

test('the car launches hard, tops out around 200 km/h, and coasts down', () => {
  const run = drive(20, { ...none, throttle: 1 })
  const hundred = run.findIndex((p) => kmh(p.v) >= 100) * DT
  assert.ok(hundred > 0 && hundred < 2.5, `0 to 100 km/h in ${hundred.toFixed(1)}s`)
  const top = kmh(run.at(-1).v)
  assert.ok(top > 180 && top < 230, `top speed ${top.toFixed(0)} km/h`)
  const coast = drive(3, none, 100 / 3.6)
  assert.ok(kmh(coast.at(-1).v) < 80 && kmh(coast.at(-1).v) > 20)
})

test('the brakes stop it from 100 km/h in under 30m, and S held then reverses it', () => {
  const run = drive(5, { ...none, brake: 1 }, 100 / 3.6)
  const stopAt = run.findIndex((p) => p.v <= 0.05)
  const metres = run[stopAt].x
  assert.ok(metres > 10 && metres < 30, `stopped in ${metres.toFixed(1)}m`)
  assert.ok(run.at(-1).v < 0, 'held S should back it up, in R')
})

test('it turns quickly: a quarter turn at full lock in about a second, a tight circle at walking pace', () => {
  for (const start of [30, 60, 100]) {
    const run = drive(2, { ...none, throttle: 0.6, steer: 1 }, start / 3.6)
    const quarter = run.findIndex((p) => p.a >= Math.PI / 2) * DT
    assert.ok(quarter > 0 && quarter < 1.2, `90° from ${start} km/h took ${quarter.toFixed(2)}s`)
  }
  const circle = drive(6, { ...none, throttle: 0.15, steer: 1 }, 15 / 3.6)
  const xs = circle.map((p) => p.x)
  assert.ok(Math.max(...xs) - Math.min(...xs) < 12, 'full lock at walking pace turns in a tight circle')
})

test('fast enough, hard steering drifts; the drift holds without spinning, and catches when you straighten up', () => {
  // Below the drift speed, full lock just turns.
  const slow = drive(1.5, { ...none, throttle: 0.2, steer: 1 }, 30 / 3.6)
  assert.ok(slow.every((p) => p.drift === 0), 'drifted at 30 km/h')
  for (const start of [90, 140]) {
    const run = drive(4, (t) => ({ ...none, throttle: 1, steer: t < 2.5 ? 1 : 0 }), start / 3.6)
    const held = run.filter((_, i) => i * DT > 0.5 && i * DT < 2.5)
    const most = Math.max(...held.map((p) => p.slide))
    assert.ok(most > 20, `from ${start} km/h the tail only slid ${most.toFixed(0)}°`)
    assert.ok(most < 80, `from ${start} km/h it slid ${most.toFixed(0)}°, a spin`)
    assert.ok(at(run, 4).slide < 5, `still sliding ${at(run, 4).slide.toFixed(0)}° after straightening up`)
  }
})

// A drive on the wide map, the driver standing in for the engine.
function scene({ width = 1440, height = 716, seed = CONFIG.world.seed } = {}) {
  const graph = buildGraph(wide, { width, height })
  const sim = createTraffic(graph, wide, { count: carCount(wide, width, height), seed })
  let controlled = 0
  const driver = createDriver({
    sim,
    k: K,
    box: { width, height },
    top: NAV,
    hero: null,
    onControl: () => controlled++,
  })
  return { sim, driver, car: sim.cars.find((c) => c.black), width, height, controlled: () => controlled }
}

const touching = ({ sim, car }) =>
  sim.cars.filter((c) => c !== car && c.active && overlap(c, car, sim.units.length, sim.units.width, -3, -3))

// A wandering drive: throttle and brake in turns, steering swinging about.
function wander(s, secs, rnd, moving = true, each = () => {}) {
  const f1 = 0.3 + rnd()
  const f2 = 0.5 + rnd() * 2
  const bias = rnd() - 0.5
  const want = s.driver.controls.want
  for (let i = 0; i < secs / DT; i++) {
    const t = i * DT
    want.throttle = Math.sin(t * f1) > -0.3 ? 1 : 0
    want.brake = want.throttle ? 0 : 1
    want.steer = Math.max(-1, Math.min(1, Math.sin(t * f2) + bias))
    s.driver.step(DT, moving)
    each()
  }
}

test('pressing Drive takes the black car out of traffic, and it can drive anywhere inside the walls', () => {
  for (const size of [{}, { width: 768, height: 960 }, { width: 1920, height: 1016 }]) {
    const s = scene(size)
    s.driver.step(DT, true)
    assert.equal(s.driver.state, 'driving')
    assert.equal(s.controlled(), 1)
    assert.ok(s.car.driven)
    assert.ok(s.driver.ring, 'the takeover ring shows')
    wander(s, 60, mulberry32(s.width), true, () => {
      assert.ok(s.car.x > 0 && s.car.x < s.width && s.car.y > NAV && s.car.y < s.height, 'out through a wall')
      assert.deepEqual(touching(s).map((c) => c.id), [], 'drove into a traffic car')
    })
    assert.equal(s.driver.ring, null, 'the ring is gone after a second')
  }
})

test('traffic stops for the car parked in its way, and never runs into it', () => {
  const s = scene()
  s.driver.step(DT, true)
  const want = s.driver.controls.want
  let stoppedBehind = 0
  for (let i = 0; i < 60 / DT; i++) {
    want.brake = 1
    s.driver.step(DT, true)
    assert.deepEqual(touching(s).map((c) => c.id), [])
    stoppedBehind = Math.max(stoppedBehind, s.sim.cars.filter((c) => c !== s.car && c.active && c.v === 0).length)
  }
  assert.ok(stoppedBehind > 0, 'nothing ever waited')
})

test('when driving ends, the car finds its own way back into traffic', (t) => {
  const times = []
  let fellBack = 0
  for (const size of [{}, { width: 768, height: 960 }, { width: 1920, height: 1016 }]) {
    for (let run = 0; run < 8; run++) {
      const rnd = mulberry32(run * 31 + (size.width ?? 1440))
      const s = scene({ ...size, seed: run + 1 })
      wander(s, 5 + rnd() * 25, rnd)
      s.driver.release()
      assert.equal(s.driver.state, 'returning')
      let secs = 0
      while (s.driver.state !== 'done' && secs < CONFIG.recovery.giveUpMax + 1) {
        s.driver.step(DT, true)
        secs += DT
        assert.deepEqual(touching(s).map((c) => c.id), [], 'ran into traffic on the way back')
      }
      assert.equal(s.driver.state, 'done', 'still not back after the safety net')
      assert.ok(!s.car.driven)
      if (s.car.active) times.push(secs)
      else fellBack++
      // And the traffic carries on as normal afterwards.
      const last = s.sim.cars.map((c) => ({ x: c.x, y: c.y, t: 0 }))
      for (let i = 0; i < 20 / DT; i++) {
        s.sim.step(DT)
        for (const c of s.sim.cars) {
          const seen = last[c.id]
          if (!c.active || c.x !== seen.x || c.y !== seen.y) Object.assign(seen, { x: c.x, y: c.y, t: i * DT })
          assert.ok(i * DT - seen.t <= 15, `car ${c.id} stuck after the drive`)
        }
      }
    }
  }
  times.sort((a, b) => a - b)
  t.diagnostic(
    `${times.length} of ${times.length + fellBack} drove back in; median ${times[times.length >> 1].toFixed(1)}s, ` +
      `slowest ${times.at(-1).toFixed(1)}s; ${fellBack} went off at an edge instead`,
  )
  assert.ok(fellBack <= 2, `${fellBack} cars never made it back`)
})

test("under reduced motion only the visitor's car moves", () => {
  const s = scene()
  const before = s.sim.cars.map((c) => `${c.x},${c.y}`)
  s.driver.controls.want.throttle = 1
  for (let i = 0; i < 5 / DT; i++) s.driver.step(DT, false)
  assert.equal(s.driver.state, 'driving')
  const moved = s.sim.cars.filter((c, i) => `${c.x},${c.y}` !== before[i])
  assert.deepEqual(moved.map((c) => c.id), [s.car.id])
})

test('pressed while the black car is off screen, control starts once it has come in', () => {
  const s = scene()
  // Send it off an edge, as if it had just left.
  s.sim.sendOff(s.car)
  let waited = 0
  while (s.driver.state === 'waiting' && waited < 10) {
    s.driver.step(DT, true)
    waited += DT
  }
  assert.equal(s.driver.state, 'driving')
  const c = Math.cos(s.car.a)
  const sn = Math.sin(s.car.a)
  for (const [l, w] of [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]) {
    const x = s.car.x + (c * l * s.sim.units.length - sn * w * s.sim.units.width) / 2
    const y = s.car.y + (sn * l * s.sim.units.length + c * w * s.sim.units.width) / 2
    assert.ok(x >= 0 && x <= s.width && y >= NAV && y <= s.height, 'control started with the car partly outside')
  }
})

test('in manual the driver shifts with the clutch and grinds without; M hands over to the automatic', () => {
  const s = scene()
  s.driver.setMode('manual')
  s.driver.step(DT, true)
  assert.equal(s.driver.state, 'driving')
  const t = s.driver.telemetry
  const start = t.gear
  assert.equal(t.mode, 'manual')
  // Up a gear without the clutch: a grind, and the same gear.
  s.driver.shift(+1)
  s.driver.step(DT, true)
  assert.equal(t.gear, start)
  assert.ok(t.grinds >= 1)
  // With the clutch: the next gear up (or 1st from N).
  s.driver.controls.want.clutch = 1
  s.driver.shift(+1)
  s.driver.step(DT, true)
  assert.notEqual(t.gear, start)
  const shifted = t.gear
  assert.ok(shifted)
  s.driver.controls.want.clutch = 0
  // The automatic takes over from that gear (gearbox.test.js checks it's
  // kept), then picks whatever suits the speed. It never stalls.
  s.driver.setMode('auto')
  for (let i = 0; i < 2 / DT; i++) s.driver.step(DT, true)
  assert.equal(t.mode, 'auto')
  assert.notEqual(t.state, 'stalled')
})
