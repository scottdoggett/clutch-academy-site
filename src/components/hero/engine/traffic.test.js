// Ambient traffic, headless (docs/spec/hero-drive.md §Tests): five simulated
// minutes on each map with the fixed seed. No two cars ever overlap, the
// count holds, nothing is ever stuck, and the rules at junctions hold.
// Run with `npm test`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CONFIG } from '../config.js'
import { buildGraph, roadsFor } from '../graph.js'
import { resolveMap, segmentBand } from '../layout.js'
import { carCount, createTraffic, overlap } from './traffic.js'

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const wide = read('../layouts/wide.json')
const compact = read('../layouts/compact.json')

const DT = CONFIG.world.step
const MINUTES = 5
const STILL_MAX = 15 // s: every car moves at least this often

// A desktop, a portrait tablet, and a phone's street band.
const SIZES = [
  { layout: wide, width: 1440, height: 716 },
  { layout: wide, width: 768, height: 960 },
  { layout: compact, width: 390, height: 240 },
]
const label = (s) => `${s.layout.name} ${s.width}×${s.height}`

const simFor = ({ layout, width, height, hidden = [] }, opts = {}) => {
  const graph = buildGraph(layout, { width, height, hidden })
  return { graph, sim: createTraffic(graph, layout, { count: carCount(layout, width, height), ...opts }) }
}

const active = (sim) => sim.cars.filter((c) => c.active)

// The first two cars on the map whose bodies overlap, if any.
function firstOverlap(sim) {
  const cars = active(sim)
  const { length, width } = sim.units
  for (let i = 0; i < cars.length; i++) {
    for (let j = i + 1; j < cars.length; j++) {
      if (overlap(cars[i], cars[j], length, width)) return [cars[i], cars[j]]
    }
  }
  return null
}

// A car's body against an axis-aligned box, by the same separating-axis
// test as overlap().
function boxHit(car, length, width, box) {
  const hl = length / 2
  const hw = width / 2
  const bx = (box.x1 - box.x0) / 2
  const by = (box.y1 - box.y0) / 2
  const dx = box.x0 + bx - car.x
  const dy = box.y0 + by - car.y
  const c = Math.cos(car.a)
  const s = Math.sin(car.a)
  for (const [ax, ay] of [
    [1, 0],
    [0, 1],
    [c, s],
    [-s, c],
  ]) {
    const rc = hl * Math.abs(c * ax + s * ay) + hw * Math.abs(-s * ax + c * ay)
    const rb = bx * Math.abs(ax) + by * Math.abs(ay)
    if (Math.abs(dx * ax + dy * ay) >= rc + rb) return false
  }
  return true
}

test('the car count follows the box, within its limits', () => {
  const t = CONFIG.traffic
  assert.equal(carCount(wide, 1440, 716), Math.round((1440 * 716) / t.pxPerCar))
  assert.equal(carCount(wide, 768, 400), t.min)
  assert.equal(carCount(wide, 2560, 1376), t.max)
  assert.equal(carCount(compact, 390, 343), t.compactMin)
})

test('phone cars are drawn and driven at the phone map\'s zoom', () => {
  const k = roadsFor(compact).zoom
  const w = simFor(SIZES[0]).sim.units
  const c = simFor(SIZES[2]).sim.units
  assert.equal(w.length, CONFIG.car.length * CONFIG.world.pxPerM)
  assert.ok(Math.abs(c.length - w.length * k) < 1e-9)
  assert.ok(Math.abs(c.width - w.width * k) < 1e-9)
  assert.ok(Math.abs(c.cruise[1] - w.cruise[1] * k) < 1e-9)
  assert.ok(Math.abs(c.decel - w.decel * k) < 1e-9)
})

test('the start is seeded: same map, same seed, same cars', () => {
  const a = simFor(SIZES[0]).sim
  const b = simFor(SIZES[0]).sim
  for (let i = 0; i < 10 / DT; i++) {
    a.step(DT)
    b.step(DT)
  }
  assert.deepEqual(
    a.cars.map((c) => [c.x, c.y, c.a]),
    b.cars.map((c) => [c.x, c.y, c.a]),
  )
  const other = simFor(SIZES[0], { seed: 1 }).sim
  assert.notDeepEqual(
    other.cars.map((c) => [c.x, c.y]),
    simFor(SIZES[0]).sim.cars.map((c) => [c.x, c.y]),
  )
})

test('every car starts on a lane, clear of every box and every other car', () => {
  for (const size of SIZES) {
    const { graph, sim } = simFor(size)
    assert.equal(active(sim).length, sim.cars.length, `${label(size)}: not every car found a place`)
    assert.equal(firstOverlap(sim), null, label(size))
    for (const car of active(sim)) {
      for (const n of graph.nodes.filter((m) => m.stop)) {
        assert.ok(!boxHit(car, sim.units.length, sim.units.width, n.box), `${label(size)}: car ${car.id} starts in ${n.id}`)
      }
    }
  }
})

for (const size of SIZES) {
  test(`${MINUTES} minutes of traffic on ${label(size)}: no overlaps, no jams, the count holds`, (t) => {
    const { graph, sim } = simFor(size)
    const { length, width } = sim.units
    const count = sim.cars.length
    const stops = graph.nodes.filter((n) => n.stop)
    const { gap, depth } = roadsFor(size.layout).crosswalk
    const last = sim.cars.map((c) => ({ x: c.x, y: c.y, t: 0 }))
    let longest = 0
    let pendingFor = 0
    let arrivals = 0
    const onCrossing = new Set()

    for (let i = 0; i < (MINUTES * 60) / DT; i++) {
      sim.step(DT)
      const now = sim.time

      const pair = firstOverlap(sim)
      assert.equal(pair, null, pair && `${label(size)} at ${now.toFixed(2)}s: cars ${pair[0].id} and ${pair[1].id} overlap`)

      // One car in a junction's box at a time.
      for (const n of stops) {
        const inside = active(sim).filter((c) => boxHit(c, length, width, { x0: n.box.x0 + 1, y0: n.box.y0 + 1, x1: n.box.x1 - 1, y1: n.box.y1 - 1 }))
        assert.ok(inside.length <= 1, `${label(size)} at ${now.toFixed(2)}s: ${inside.length} cars in ${n.id}`)
      }

      // Every car is on the map or about to come back in.
      const live = sim.cars.filter((c) => c.active || c.pending).length
      assert.equal(live, count)
      pendingFor = sim.cars.some((c) => c.pending) ? pendingFor + DT : 0
      assert.ok(pendingFor < 2, `${label(size)} at ${now.toFixed(2)}s: a car has waited ${pendingFor.toFixed(1)}s to come back`)

      for (const car of sim.cars) {
        const seen = last[car.id]
        if (!car.active || car.x !== seen.x || car.y !== seen.y) {
          seen.x = car.x
          seen.y = car.y
          seen.t = now
        }
        longest = Math.max(longest, now - seen.t)
        assert.ok(now - seen.t <= STILL_MAX, `${label(size)} at ${now.toFixed(2)}s: car ${car.id} hasn't moved for ${STILL_MAX}s`)

        // Waiting at a junction means stopped just behind its crossing,
        // unless the block is too short to hold a car there.
        if (car.queued) {
          arrivals++
          const nose = car.piece.path.len - car.s
          if (nose < gap + depth) onCrossing.add(car.piece.id)
          else assert.ok(nose <= gap + depth + 2 * roadsFor(size.layout).zoom, `${label(size)}: car ${car.id} stopped ${nose.toFixed(1)}px short of ${car.piece.to.id}`)
        }
      }
    }
    assert.ok(arrivals > 0, 'no car ever stopped at a junction')
    t.diagnostic(`longest any car stood still: ${longest.toFixed(1)}s`)
    t.diagnostic(onCrossing.size ? `blocks too short to stop behind the crossing: ${[...onCrossing].join(', ')}` : 'every stop is behind its crossing')
  })
}

test('cars leave by the edges and come back in, and the black car stays in view', () => {
  for (const size of SIZES) {
    const { graph, sim } = simFor(size)
    let entries = 0
    let inView = 0
    const steps = 120 / DT
    const at = sim.cars.map((c) => c.piece)
    for (let i = 0; i < steps; i++) {
      sim.step(DT)
      for (const car of sim.cars) {
        if (car.piece !== at[car.id] && graph.entries.includes(car.piece) && car.trail.length === 0) entries++
        at[car.id] = car.piece
      }
      const b = sim.cars[0]
      if (b.active && b.x > 0 && b.x < size.width && b.y > 0 && b.y < size.height) inView++
    }
    assert.ok(entries > 0, `${label(size)}: no car came back in`)
    assert.ok(inView / steps > 0.9, `${label(size)}: the black car was in view ${Math.round((inView / steps) * 100)}% of the time`)
  }
})

test('through every turn, every corner of every car stays on the road', (t) => {
  // Both axles follow the path, so the body cuts a turn slightly, the way a
  // real car does. It must never cut it so far that it leaves the road.
  for (const size of SIZES) {
    const { graph, sim } = simFor(size)
    const { length, width } = sim.units
    const road = [
      ...graph.segments.filter((sg) => !sg.hidden).map(segmentBand),
      ...graph.nodes.filter((n) => ['cross', 'tee', 'corner'].includes(n.kind)).map((n) => n.box),
    ]
    const offRoad = (x, y) =>
      Math.min(...road.map((r) => Math.hypot(Math.max(r.x0 - x, 0, x - r.x1), Math.max(r.y0 - y, 0, y - r.y1))))
    let worst = 0
    for (let i = 0; i < 90 / DT; i++) {
      sim.step(DT)
      for (const car of active(sim)) {
        const c = Math.cos(car.a)
        const s = Math.sin(car.a)
        for (const [l, w] of [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ]) {
          const x = car.x + (c * l * length - s * w * width) / 2
          const y = car.y + (s * l * length + c * w * width) / 2
          worst = Math.max(worst, offRoad(x, y))
        }
      }
    }
    t.diagnostic(`${label(size)}: the furthest any corner gets off the road is ${worst.toFixed(2)}px`)
    assert.ok(worst < 0.5, `${label(size)}: a car's corner is ${worst.toFixed(2)}px off the road`)
  }
})

test('a resize keeps each car on its lane, the same way along it, and overlapping nothing', () => {
  const { sim } = simFor(SIZES[0])
  for (let i = 0; i < 20 / DT; i++) sim.step(DT)
  const sizes = [
    { width: 1280, height: 656 },
    { width: 768, height: 960 },
    { width: 1920, height: 1016 },
  ]
  for (const { width, height } of sizes) {
    const before = sim.cars.map((c) => c.active && c.piece.seg && !c.queued && { id: c.piece.id, f: c.s / c.piece.path.len })
    sim.rescale(buildGraph(wide, { width, height }), carCount(wide, width, height))
    for (const car of sim.cars) {
      const b = before[car.id]
      if (!b || !car.active || car.piece.to.stop) continue
      assert.equal(car.piece.id, b.id)
      assert.ok(Math.abs(car.s / car.piece.path.len - b.f) < 1e-9)
    }
    assert.equal(firstOverlap(sim), null, `${width}×${height}`)
    for (let i = 0; i < 60 / DT; i++) {
      sim.step(DT)
      assert.equal(firstOverlap(sim), null, `${width}×${height} after the resize`)
    }
    assert.equal(sim.cars.filter((c) => c.active || c.pending).length, carCount(wide, width, height))
  }
})

const rects = read('../__fixtures__/copy-rects.json')
const copyOf = (s) => ({ x0: s.copy[0], y0: s.copy[1], x1: s.copy[2], y1: s.copy[3] })

test('traffic drives around the segments the runtime rules hide, in the short windows', () => {
  for (const s of rects.short.sizes) {
    const size = { layout: wide, width: s.hero[0], height: s.hero[1] }
    const { hidden } = resolveMap(wide, { ...size, copy: copyOf(s) })
    assert.ok(hidden.length > 0)
    const { sim } = simFor({ ...size, hidden })
    const gone = new Set(hidden)
    const last = sim.cars.map((c) => ({ x: c.x, y: c.y, t: 0 }))
    for (let i = 0; i < 120 / DT; i++) {
      sim.step(DT)
      assert.equal(firstOverlap(sim), null, s.viewport.join('×'))
      for (const car of sim.cars) {
        const seen = last[car.id]
        if (!car.active || car.x !== seen.x || car.y !== seen.y) Object.assign(seen, { x: car.x, y: car.y, t: sim.time })
        assert.ok(sim.time - seen.t <= STILL_MAX, `${s.viewport.join('×')}: car ${car.id} is stuck`)
        if (!car.active) continue
        const lane = car.piece.seg ? car.piece : car.piece.to
        assert.ok(!gone.has(lane.seg.id), `car ${car.id} is on hidden ${lane.seg.id}`)
      }
    }
  }
})

test('at every recorded size, a car can be let onto every lane out of a junction', () => {
  const sizes = rects.sizes.map((s) =>
    s.band
      ? { layout: compact, width: s.band[2] - s.band[0], height: s.band[3] - s.band[1], label: s.viewport.join('×') }
      : { layout: wide, width: s.hero[0], height: s.hero[1], label: s.viewport.join('×') },
  )
  for (const size of sizes) {
    const { graph, sim } = simFor(size, { count: 0 })
    for (const lane of graph.lanes.filter((l) => l.from.stop)) {
      assert.ok(sim.canEnter(lane), `${size.label}: nothing can ever get onto ${lane.id}`)
    }
  }
})
