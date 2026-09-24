// The road graph: what a car may do at each junction, and the checks that
// keep a map drivable. Run with `npm test`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildGraph, checkGraph } from './graph.js'

const load = (name) => JSON.parse(readFileSync(new URL(`./layouts/${name}.json`, import.meta.url), 'utf8'))
const LAYOUTS = { wide: load('wide'), compact: load('compact') }
const SIZE = { wide: { width: 1440, height: 836 }, compact: { width: 390, height: 176 } }

// A plus sign: one main road across, one down, crossing in the middle.
const PLUS = {
  name: 'plus',
  nodes: [
    { id: 'w', x: -0.1, y: 0.5 },
    { id: 'e', x: 1.1, y: 0.5 },
    { id: 'n', x: 0.5, y: -0.1 },
    { id: 's', x: 0.5, y: 1.1 },
    { id: 'c', x: 0.5, y: 0.5 },
  ],
  roads: [
    { id: 'across', kind: 'main', nodes: ['w', 'c', 'e'] },
    { id: 'down', kind: 'main', nodes: ['n', 'c', 's'] },
  ],
}

// A T: a main road across, a side street coming up to it from below.
const TEE = {
  name: 'tee',
  nodes: [
    { id: 'w', x: -0.1, y: 0.5 },
    { id: 'e', x: 1.1, y: 0.5 },
    { id: 's', x: 0.5, y: 1.1 },
    { id: 'c', x: 0.5, y: 0.5 },
  ],
  roads: [
    { id: 'across', kind: 'main', nodes: ['w', 'c', 'e'] },
    { id: 'stem', kind: 'side', nodes: ['c', 's'] },
  ],
}

const size = { width: 400, height: 400 }
const angle = (a) => Math.atan2(Math.sin(a), Math.cos(a))
const near = (a, b, eps = 1e-6) => Math.abs(a - b) < eps

test('both layouts build with nothing wrong', () => {
  for (const [name, layout] of Object.entries(LAYOUTS)) {
    const graph = buildGraph(layout, SIZE[name])
    assert.deepEqual(checkGraph(graph, layout), [], name)
  }
})

test('every junction is a cross, a T or a corner, and every road end is a junction or an edge', () => {
  for (const [name, layout] of Object.entries(LAYOUTS)) {
    const graph = buildGraph(layout, SIZE[name])
    for (const n of graph.nodes) {
      assert.ok(['cross', 'tee', 'corner', 'portal'].includes(n.kind), `${name} ${n.id} is a ${n.kind}`)
    }
  }
})

test('both layouts have crosses and Ts, so traffic meets both', () => {
  for (const [name, layout] of Object.entries(LAYOUTS)) {
    const kinds = new Set(buildGraph(layout, SIZE[name]).nodes.map((n) => n.kind))
    assert.ok(kinds.has('cross'), `${name} has no 4-way cross`)
    assert.ok(kinds.has('tee'), `${name} has no T-junction`)
  }
})

test('no movement anywhere is a U-turn', () => {
  for (const [name, layout] of Object.entries(LAYOUTS)) {
    for (const lane of buildGraph(layout, SIZE[name]).lanes) {
      for (const m of lane.moves) {
        assert.notEqual(m.to.seg, lane.seg, `${name} ${lane.id} turns back on itself`)
        assert.ok(lane.d.x * m.to.d.x + lane.d.y * m.to.d.y > -0.5, `${name} ${lane.id} → ${m.to.id} reverses`)
      }
    }
  }
})

test('traffic keeps right', () => {
  const g = buildGraph(PLUS, size)
  const c = g.nodes.find((n) => n.id === 'c')
  const east = g.lanes.find((l) => l.d.x > 0)
  const north = g.lanes.find((l) => l.d.y < 0)
  // Eastbound drives below the centre line (y is down); northbound, to its right.
  assert.ok(east.p0.y > c.y)
  assert.ok(north.p0.x > c.x)
})

test('a cross offers straight, left and right', () => {
  const g = buildGraph(PLUS, size)
  const east = g.lanes.find((l) => l.d.x > 0 && l.to.id === 'c')
  const turns = Object.fromEntries(east.moves.map((m) => [m.turn, m.to]))
  assert.deepEqual(Object.keys(turns).sort(), ['left', 'right', 'straight'])
  // Heading east, right is south (+y on screen) and left is north.
  assert.ok(turns.right.d.y > 0)
  assert.ok(turns.left.d.y < 0)
  assert.ok(turns.straight.d.x > 0)
})

test('a T gives the stem left or right, and the through road straight or one turn', () => {
  const g = buildGraph(TEE, size)
  assert.equal(g.nodes.find((n) => n.id === 'c').kind, 'tee')
  const up = g.lanes.find((l) => l.to.id === 'c' && l.d.y < 0)
  assert.deepEqual(up.moves.map((m) => m.turn).sort(), ['left', 'right'])
  const east = g.lanes.find((l) => l.to.id === 'c' && l.d.x > 0)
  assert.deepEqual(east.moves.map((m) => m.turn).sort(), ['right', 'straight'])
  const west = g.lanes.find((l) => l.to.id === 'c' && l.d.x < 0)
  assert.deepEqual(west.moves.map((m) => m.turn).sort(), ['left', 'straight'])
})

test("a T's box is as wide as the side street and as tall as the main road", () => {
  const c = buildGraph(TEE, size).nodes.find((n) => n.id === 'c')
  assert.equal(c.box.x1 - c.box.x0, 24)
  assert.equal(c.box.y1 - c.box.y0, 40)
})

test('every turn leaves its lane and joins the next one smoothly', () => {
  for (const [name, layout] of Object.entries(LAYOUTS)) {
    for (const lane of buildGraph(layout, SIZE[name]).lanes) {
      for (const m of lane.moves) {
        const start = m.path.at(0)
        const end = m.path.at(m.path.len)
        const where = `${name} ${lane.id} → ${m.to.id}`
        assert.ok(near(start.x, lane.p1.x) && near(start.y, lane.p1.y), `${where} starts off the lane`)
        assert.ok(near(end.x, m.to.p0.x) && near(end.y, m.to.p0.y), `${where} ends off the next lane`)
        if (m.turn === 'straight') continue
        assert.ok(Math.abs(angle(start.a - lane.heading)) < 0.01, `${where} starts at the wrong heading`)
        assert.ok(Math.abs(angle(end.a - m.to.heading)) < 0.01, `${where} ends at the wrong heading`)
        assert.ok(m.path.len > 0)
      }
    }
  }
})

test('right turns are tighter than left turns', () => {
  const east = buildGraph(PLUS, size).lanes.find((l) => l.d.x > 0 && l.to.id === 'c')
  const len = Object.fromEntries(east.moves.map((m) => [m.turn, m.path.len]))
  assert.ok(len.right < len.left)
})

test('the checks catch a dead end', () => {
  // A spur off the main road that stops inside the map.
  const layout = {
    name: 'stub',
    nodes: [...PLUS.nodes, { id: 'y', x: 0.8, y: 0.5 }, { id: 'z', x: 0.8, y: 0.8 }],
    roads: [
      { id: 'across', kind: 'main', nodes: ['w', 'c', 'y', 'e'] },
      { id: 'down', kind: 'main', nodes: ['n', 'c', 's'] },
      { id: 'spur', kind: 'main', nodes: ['y', 'z'] },
    ],
  }
  const problems = checkGraph(buildGraph(layout, size), layout)
  assert.ok(problems.some((p) => /z is a dead end/.test(p)))
})

test('the checks catch a map in two pieces', () => {
  const layout = {
    name: 'split',
    nodes: [
      { id: 'a', x: -0.1, y: 0.2 },
      { id: 'b', x: 1.1, y: 0.2 },
      { id: 'c', x: -0.1, y: 0.8 },
      { id: 'd', x: 1.1, y: 0.8 },
    ],
    roads: [
      { id: 'top', kind: 'main', nodes: ['a', 'b'] },
      { id: 'bottom', kind: 'main', nodes: ['c', 'd'] },
    ],
  }
  const problems = checkGraph(buildGraph(layout, size), layout)
  assert.ok(problems.some((p) => /cut off/.test(p)))
  assert.ok(problems.some((p) => /can't reach/.test(p)))
})

test('the checks catch a side street running off the edge', () => {
  const layout = {
    name: 'side-off',
    nodes: TEE.nodes,
    roads: TEE.roads,
  }
  const problems = checkGraph(buildGraph(layout, size), layout)
  assert.ok(problems.some((p) => /side street stem runs off the edge/.test(p)))
})
