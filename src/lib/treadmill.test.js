// The reviews strip as a treadmill (docs/spec/hero-drive.md §The
// treadmill): how fast it goes, with and without the car on it. Run with
// `npm test`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { TREADMILL, beltSpeed } from './treadmill.js'

const DT = 1 / 60
const REST = -60 // px/s, the strip's own drift, leftwards

// The strip's speed after `secs` with the car at `car` px/s across it.
function after(secs, car, speed = REST) {
  for (let t = 0; t < secs; t += DT) speed = beltSpeed(speed, REST, car, DT)
  return speed
}

test('with nothing on it, the strip keeps its drift', () => {
  assert.equal(after(2, null), REST)
})

test('a car standing on it leaves it drifting, so the car rides with the reviews', () => {
  assert.ok(Math.abs(after(2, 0) - REST) < 1e-9)
})

test('driving right pushes the reviews left, harder the faster it goes; driving left turns them round', () => {
  const slow = after(2, 60)
  const fast = after(2, 170)
  assert.ok(slow < REST && fast < slow, `${slow.toFixed(0)}, ${fast.toFixed(0)} px/s`)
  assert.ok(Math.abs(fast - (REST - TREADMILL.coupling * 170)) < 1, 'it settles where the wheels push it')
  assert.ok(after(2, -170) > 0, 'driving left should turn the reviews round')
  // The car's own progress across the page, on top of the strip: a
  // treadmill, it mostly runs on the spot.
  assert.ok(Math.abs(170 + fast) < 170 * 0.35)
})

test('it answers the wheels quickly and settles back to its drift slowly, and has a top speed', () => {
  const target = REST - TREADMILL.coupling * 170
  // Most of the way there within `grab`.
  const pushed = after(TREADMILL.grab, 170)
  assert.ok((pushed - REST) / (target - REST) > 0.6, `only ${(pushed - REST).toFixed(0)} px/s in ${TREADMILL.grab}s`)
  // Off again, it's still well short of its drift after `grab`, and back
  // there within a few seconds.
  const fast = after(3, 170)
  assert.ok(after(TREADMILL.grab, null, fast) < REST - 30, 'back to its drift at once')
  assert.ok(Math.abs(after(8, null, fast) - REST) < 1)
  assert.ok(Math.abs(after(3, 5000) + TREADMILL.max) < 1, 'no top speed')
})
