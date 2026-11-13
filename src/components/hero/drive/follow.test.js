// The page following the car (docs/spec/hero-drive.md §Driving the whole
// page): a car driven down or up the page, with the window as numbers.
// Run with `npm test`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CONFIG } from '../config.js'
import { createFollow } from './follow.js'

const DT = CONFIG.world.step
const F = CONFIG.follow
// A 900px window under a 64px nav, on a page that scrolls 5,000px, and a
// 24px car.
const WIN = { top: 64, bottom: 900, max: 5000, reach: 12 }
const ZONE = F.zone * (WIN.bottom - WIN.top)

// A car at `from` px down the window, the page scrolled to `start`, moving
// at vy(t) px/s for `secs`: where it was in the window, and the page's
// scroll, every step.
function run({ secs, from = 400, start = 0, vy, still = false, before = () => {} }) {
  const follow = createFollow()
  before(follow)
  let page = from + start
  let scroll = start
  const log = []
  for (let i = 0; i < secs / DT; i++) {
    const t = i * DT
    const v = vy(t)
    page += v * DT
    scroll = follow.step(DT, { y: page - scroll, vy: v, reach: WIN.reach, top: WIN.top, bottom: WIN.bottom, scroll, max: WIN.max, still })
    log.push({ t, y: page - scroll, scroll, speed: follow.speed })
  }
  return log
}

const at = (log, t) => log[Math.round(t / DT) - 1]

test('in the middle of the window, or standing still near the bottom, the page stays put', () => {
  const log = run({ secs: 3, vy: (t) => (t < 1 ? 150 : 0), from: 300 })
  assert.ok(log.every((p) => p.scroll === 0))
  const parked = run({ secs: 3, vy: () => 0, from: WIN.bottom - 40 })
  assert.ok(parked.every((p) => p.scroll === 0), 'a car standing in the zone scrolled the page')
})

test('driving down, the page follows near the bottom, and the car never leaves the window', () => {
  for (const vy of [100, 200, 345]) {
    const log = run({ secs: 10, vy: () => vy })
    const first = log.find((p) => p.scroll > 0)
    assert.ok(first, `${vy} px/s: the page never scrolled`)
    assert.ok(first.y > WIN.bottom - ZONE, `${vy} px/s: it scrolled with the car ${first.y.toFixed(0)}px down`)
    const lowest = Math.max(...log.map((p) => p.y))
    assert.ok(lowest <= WIN.bottom - WIN.reach - F.edge + 0.01, `${vy} px/s: the car got to ${lowest.toFixed(0)}px`)
    // Following, it keeps pace with the car.
    assert.ok(Math.abs(at(log, 10).speed - vy) < vy * 0.1, `${vy} px/s: the page scrolls at ${at(log, 10).speed.toFixed(0)}`)
  }
})

test('when the car stops, the page carries on for a moment and then stops', () => {
  const log = run({ secs: 10, vy: (t) => (t < 5 ? 200 : 0) })
  const stopped = at(log, 5)
  const after = at(log, 5.5)
  assert.ok(after.scroll - stopped.scroll > 40, `only ${(after.scroll - stopped.scroll).toFixed(0)}px after the car stopped`)
  assert.ok(at(log, 7).y < WIN.bottom - ZONE, 'the car was left in the zone')
  assert.equal(at(log, 10).speed, 0, 'still scrolling after 5s')
  assert.equal(at(log, 10).scroll, at(log, 9).scroll)
})

test('driving up, it follows near the top, and never lets the car under the nav', () => {
  const log = run({ secs: 6, start: 3000, from: 500, vy: () => -300 })
  assert.ok(at(log, 6).scroll < 3000 - 1000, `the page only went up to ${at(log, 6).scroll.toFixed(0)}`)
  const highest = Math.min(...log.map((p) => p.y))
  assert.ok(highest >= WIN.top + WIN.reach + F.edge - 0.01, `the car got to ${highest.toFixed(0)}px, under the nav`)
})

test('it stops at the ends of the page', () => {
  const down = run({ secs: 6, start: WIN.max - 100, vy: () => 300 })
  assert.ok(down.every((p) => p.scroll <= WIN.max))
  assert.equal(at(down, 6).scroll, WIN.max)
  const up = run({ secs: 6, start: 100, from: 300, vy: () => -300 })
  assert.ok(up.every((p) => p.scroll >= 0))
})

test("a visitor's own scroll wins for a moment, and a car scrolled out of view is left alone", () => {
  const held = run({ secs: F.hold - DT, from: 880, vy: () => 0, before: (f) => f.hold() })
  assert.ok(held.every((p) => p.scroll === 0), 'the page moved while held')
  const below = run({ secs: 1, from: 1400, vy: () => 100 })
  assert.ok(below.every((p) => p.scroll === 0), 'followed a car below the window')
})

test('under reduced motion there is no momentum: the page moves only with the car', () => {
  const log = run({ secs: 8, vy: (t) => (t < 4 ? 200 : 0), still: true })
  const hi = WIN.bottom - ZONE
  assert.ok(log.every((p) => p.y <= hi + 200 * DT + 0.01), 'the car went past the zone')
  assert.ok(at(log, 4).scroll > 0)
  assert.equal(at(log, 8).scroll, at(log, 4 + DT).scroll, 'the page kept going after the car stopped')
})
