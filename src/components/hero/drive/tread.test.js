// Tyre marks (docs/spec/hero-drive.md §Tyre marks): where the wheels are,
// strips laid end to end as they roll, and how strong they are for the car
// driven straight, drifted, braked hard and spun up. planck runs in Node.
// Run with `npm test`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { World } from 'planck'
import { CONFIG } from '../config.js'
import { createPlayer } from './player.js'
import { createTread, wheelSpots } from './tread.js'

const DT = CONFIG.world.step
const K = CONFIG.world.pxPerM
const M = CONFIG.marks
const none = { throttle: 0, brake: 0, clutch: 0, steer: 0 }

// The car on an empty world for `secs`, input(t) each step, and every mark
// segment it laid: { x0, y0, x1, y1, s, wheel, t }.
function marks(secs, input, { speed = 0, mode = 'auto', before = () => {} } = {}) {
  const world = new World({ gravity: { x: 0, y: 0 } })
  const car = createPlayer(world, { x: 0, y: 0, a: 0 }, speed, { mode })
  before(car)
  const tread = createTread()
  const out = []
  const pose = {}
  for (let i = 0; i < secs / DT; i++) {
    const t = i * DT
    car.step(DT, typeof input === 'function' ? input(t) : input)
    world.step(DT, 8, 3)
    car.pose(pose)
    let wheel = 0
    tread.lay({ x: pose.x * K, y: pose.y * K, a: pose.a }, car.tyres, K, (x0, y0, x1, y1, s) =>
      out.push({ x0, y0, x1, y1, s, t, wheel: wheel++ }),
    )
  }
  return out
}

test('the wheels sit a wheelbase apart and a track wide, turning with the car', () => {
  const w = wheelSpots({ x: 100, y: 50, a: Math.PI / 2 }, K)
  const along = (CONFIG.car.wheelbase / 2) * K
  const across = (M.track / 2) * K
  // Pointing down the page: the front wheels are below the centre.
  assert.ok(Math.abs(w[0].y - (50 + along)) < 1e-9 && Math.abs(w[2].y - (50 - along)) < 1e-9)
  assert.ok(Math.abs(w[0].x - (100 + across)) < 1e-9 && Math.abs(w[1].x - (100 - across)) < 1e-9)
})

test('each wheel lays a strip end to end, a segment every few px, and none across a jump', () => {
  const tread = createTread()
  const segs = []
  const tyres = { front: 0, rear: 0, brake: 0, speed: 10, spin: false }
  for (let x = 0; x <= 60; x += 1) tread.lay({ x, y: 0, a: 0 }, tyres, K, (x0, y0, x1) => segs.push({ x0, x1 }))
  // A car's jump: no segment bridges it.
  tread.lay({ x: 400, y: 0, a: 0 }, tyres, K, (x0, y0, x1) => segs.push({ x0, x1 }))
  assert.equal(segs.length, 4 * Math.floor(60 / M.every))
  assert.ok(segs.every((s) => Math.abs(s.x1 - s.x0 - M.every) < 1e-9))
  // Each wheel's segments join up.
  for (let wheel = 0; wheel < 4; wheel++) {
    const own = segs.filter((_, i) => i % 4 === wheel)
    for (let i = 1; i < own.length; i++) assert.equal(own[i].x0, own[i - 1].x1)
  }
})

test('driving straight leaves faint marks; a drift leaves dark ones at the rear', () => {
  const straight = marks(3, { ...none, throttle: 0.4 }, { speed: 60 / 3.6 })
  assert.ok(straight.length > 0)
  assert.ok(straight.every((m) => Math.abs(m.s - M.roll) < 1e-9), 'a straight line marked like a skid')
  const drift = marks(3, (t) => ({ ...none, throttle: 1, steer: t < 2 ? 1 : 0 }), { speed: 90 / 3.6 })
  const held = drift.filter((m) => m.t > 0.6 && m.t < 2)
  const rear = held.filter((m) => m.wheel >= 2)
  const front = held.filter((m) => m.wheel < 2)
  const mean = (list) => list.reduce((a, m) => a + m.s, 0) / list.length
  assert.ok(mean(rear) > 0.8, `the drift's rear marks averaged ${mean(rear).toFixed(2)}`)
  assert.ok(mean(front) < mean(rear), 'the front marked as hard as the sliding rear')
})

test('hard braking marks all four wheels; wheelspin marks the rear', () => {
  const stop = marks(2, { ...none, brake: 1 }, { speed: 100 / 3.6 })
  const early = stop.filter((m) => m.t < 0.5)
  assert.ok(early.length >= 8 && early.every((m) => m.s >= M.roll + (1 - M.roll) * M.brake - 1e-9))
  // Manual, 1st, revved up with the clutch down, then dropped.
  const spin = marks(1.5, (t) => ({ ...none, throttle: 1, clutch: t < 0.6 ? 1 : 0 }), {
    mode: 'manual',
    before: (car) => car.box.shift(+1, true),
  })
  const rear = spin.filter((m) => m.wheel >= 2 && m.t > 0.6)
  assert.ok(rear.some((m) => m.s === 1), 'no wheelspin marks')
})

test('on the reviews strip a wheel marks the strip, in its frame, starting afresh at its edge', () => {
  const tread = createTread()
  const segs = []
  const tyres = { front: 0, rear: 0, brake: 0, speed: 10, spin: false }
  // Driving down the page across a strip that has moved 500px left.
  const belt = { x0: -1000, x1: 1000, y0: 40, y1: 80, travel: -500 }
  for (let y = 0; y <= 120; y += 1) {
    tread.lay({ x: 0, y, a: Math.PI / 2 }, tyres, K, (x0, y0, x1, y1, s, on) => segs.push({ x0, y0, x1, y1, on }), belt)
  }
  const across = (M.track / 2) * K
  const on = segs.filter((s) => s.on)
  const off = segs.filter((s) => !s.on)
  assert.ok(on.length > 0 && off.length > 0)
  assert.ok(on.every((s) => Math.abs(Math.abs(s.x0 - 500) - across) < 1e-9 && s.y0 >= belt.y0 && s.y1 <= belt.y1))
  assert.ok(off.every((s) => Math.abs(Math.abs(s.x0) - across) < 1e-9))
  // No segment joins the page to the strip.
  assert.ok(segs.every((s) => Math.hypot(s.x1 - s.x0, s.y1 - s.y0) <= M.every + 1e-9))
})
