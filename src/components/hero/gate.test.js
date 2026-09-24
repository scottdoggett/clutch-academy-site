// The gear display's knob route (gate.js). Run with `npm test`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PLANE, along, route, spot } from './gate.js'

const GEARS = ['R', 'N', '1', '2', '3', '4', '5', '6']

test('the knob goes through neutral between gates, never straight across', () => {
  for (const a of GEARS) {
    for (const b of GEARS) {
      const r = route(spot(a), b)
      // Every leg is straight along a slot or along the plane.
      for (const { a: p, b: q } of r.legs) {
        const upDown = Math.abs(p.x - q.x) < 1e-9
        const across = Math.abs(p.y - PLANE) < 1e-9 && Math.abs(q.y - PLANE) < 1e-9
        assert.ok(upDown || across, `${a} → ${b} cuts across the gate`)
      }
      const end = along(r, r.total)
      assert.deepEqual([end.x, end.y], [spot(b).x, spot(b).y], `${a} → ${b} ends off its slot`)
    }
  }
})

test('a change mid-travel sets off from wherever the knob has got to', () => {
  const first = route(spot('1'), '4')
  const midway = along(first, first.total / 2) // on the plane, between the columns
  const next = route(midway, '6')
  assert.deepEqual(next.legs[0].a, midway)
  const end = along(next, next.total)
  assert.deepEqual([end.x, end.y], [spot('6').x, spot('6').y])
  // In the same slot, it's one straight move: 3 to 4 through the plane.
  assert.equal(route(spot('3'), '4').legs.length, 1)
})
