// The engine and gearbox (docs/spec/hero-drive.md §Gearbox and engine), on
// their own. A one-line car moves the wheel speed along, so the box sees the
// speeds it would on the road. Run with `npm test`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CONFIG } from '../config.js'
import { createGearbox } from './gearbox.js'

const DT = CONFIG.world.step
const MASS = CONFIG.player.mass
const kmh = (ms) => ms * 3.6

// Run the box for `secs` with pedals from `input(t)`, on a car of MASS with
// the player's drag and brakes. Returns every step's report and speed.
function ride(box, secs, input, v0 = 0) {
  let v = v0
  const log = []
  for (let i = 0; i < secs / DT; i++) {
    const pedals = typeof input === 'function' ? input(i * DT, box) : input
    const out = box.step(DT, { ...pedals, wheelSpeed: v })
    const { linear, quad } = CONFIG.player.drag
    const stopPedal = box.gear === 'R' ? pedals.throttle ?? 0 : pedals.brake ?? 0
    const resist = out.brakeDecel + stopPedal * CONFIG.player.brake + linear * Math.abs(v) + quad * v * v
    v += (out.driveForce / MASS) * DT
    // Resistance only ever slows the car, and never past a stop.
    v = Math.sign(v) * Math.max(0, Math.abs(v) - resist * DT)
    log.push({ ...out, events: [...out.events], v, t: i * DT })
  }
  return log
}

const manual = (v = 0) => createGearbox(CONFIG.gearbox, { mode: 'manual', wheelSpeed: v })
const auto = (v = 0) => createGearbox(CONFIG.gearbox, { mode: 'auto', wheelSpeed: v })

test('taken over at a standstill a manual box is in N; at 40 km/h, the highest gear that holds 2,000 rpm', () => {
  assert.equal(manual(0).gear, 'N')
  const cruising = manual(40 / 3.6)
  assert.equal(cruising.gear, '3')
  assert.ok(cruising.rpm >= CONFIG.gearbox.startGearRpm)
  assert.equal(auto(0).gear, '1')
})

test('shifting without the clutch grinds, and the gear stays put', () => {
  const box = manual(40 / 3.6)
  assert.equal(box.shift(+1, false), 'grind')
  assert.equal(box.gear, '3')
  const out = box.step(DT, { throttle: 0.5, wheelSpeed: 40 / 3.6 })
  assert.ok(out.events.includes('grind'), 'the grind reaches the next report')
  assert.equal(box.shift(+1, true), 'ok')
  assert.equal(box.gear, '4')
  // Into and out of N needs it too, and the ends of the gate stop you.
  const parked = manual(0)
  assert.equal(parked.shift(+1, false), 'grind')
  for (let i = 0; i < 6; i++) parked.shift(+1, true)
  assert.equal(parked.gear, '6')
  assert.equal(parked.shift(+1, true), 'end')
})

test('in N, or with the clutch down, the engine revs freely and bounces off the limiter', () => {
  for (const [box, pedals] of [
    [manual(0), { throttle: 1 }],
    [manual(40 / 3.6), { throttle: 1, clutch: 1 }],
  ]) {
    const log = ride(box, 2, pedals, box.gear === 'N' ? 0 : 40 / 3.6)
    assert.ok(log.every((s) => s.driveForce === 0), 'no drive with the engine free')
    assert.ok(log.some((s) => s.events.includes('limiter')), 'never reached the limiter')
    assert.ok(Math.max(...log.map((s) => s.rpm)) <= CONFIG.gearbox.redline)
  }
  // And lifting off, it settles back to idle.
  const idle = ride(manual(0), 1.5, (t) => ({ throttle: t < 0.5 ? 1 : 0 }))
  assert.ok(Math.abs(idle.at(-1).rpm - CONFIG.gearbox.idle) < 50)
})

test('letting the clutch out in 2nd at a standstill stalls; 1st and R pull away with launch assist', () => {
  const second = manual(0)
  second.shift(+1, true) // N → 1
  second.shift(+1, true) // 1 → 2
  const stalled = ride(second, 0.2, { throttle: 0.5 })
  assert.ok(stalled.some((s) => s.events.includes('stall')))
  assert.equal(stalled.at(-1).state, 'stalled')

  for (const dir of [+1, -1]) {
    const box = manual(0)
    box.shift(dir, true) // N → 1, or N → R
    const log = ride(box, 2, dir > 0 ? { throttle: 0.6 } : { brake: 0.6 })
    assert.ok(!log.some((s) => s.events.includes('stall')), `${box.gear} stalled pulling away`)
    const v = log.at(-1).v
    assert.ok(dir > 0 ? v > 3 : v < -3, `${box.gear} didn't move off: ${v.toFixed(1)} m/s`)
  }
})

test('1st creeps at idle with no pedals, at about 7.6 km/h', () => {
  const box = manual(0)
  box.shift(+1, true)
  const log = ride(box, 6, {})
  const v = kmh(log.at(-1).v)
  assert.ok(v > 5 && v < 9, `creeping at ${v.toFixed(1)} km/h`)
})

test('braking to a stop in 3rd without the clutch stalls, and then it waits instead of stalling again', () => {
  const box = manual(40 / 3.6)
  assert.equal(box.gear, '3')
  const log = ride(box, 4, { brake: 1 }, 40 / 3.6)
  const stalls = log.filter((s) => s.events.includes('stall')).length
  assert.equal(stalls, 1, 'it should stall once')
  // Restarted and waiting, at a standstill in 3rd, for 2 more seconds: no loop.
  const after = ride(box, 2, {})
  assert.ok(!after.some((s) => s.events.includes('stall')), 'stalled again on its own')
  assert.equal(after.at(-1).state, 'waiting')
  // Changing down to 1st ends the wait, and it pulls away.
  box.shift(-1, true)
  box.shift(-1, true)
  assert.equal(box.gear, '1')
  const away = ride(box, 1.5, { throttle: 0.6 })
  assert.ok(away.at(-1).v > 2)
})

test('a downshift past the redline over-revs and brakes the car hard until the revs come down', () => {
  const box = manual(100 / 3.6)
  const g = box.gear
  // Clutch down, all the way down to 2nd, clutch up.
  while (box.gear !== '2') box.shift(-1, true)
  assert.notEqual(g, '2')
  const log = ride(box, 1, (t) => ({ clutch: t < 0.1 ? 1 : 0 }), 100 / 3.6)
  assert.ok(log.some((s) => s.events.includes('overrev')))
  const braking = log.filter((s) => s.state === 'overrev')
  assert.ok(braking.length > 0 && braking.every((s) => s.brakeDecel === CONFIG.gearbox.overrevDecel))
  assert.ok(log.at(-1).state === 'running', 'still over-revving after a second')
})

test('flooring it off the line with high revs spins the rear wheels for a moment', () => {
  const box = manual(0)
  box.shift(+1, true)
  // Revved to 5,000 or so with the clutch down, then dropped.
  const log = ride(box, 1, (t) => ({ throttle: 1, clutch: t < 0.45 ? 1 : 0 }))
  assert.ok(log.some((s) => s.events.includes('wheelspin')))
  assert.ok(log.some((s) => s.wheelspin))
})

test('putting it in R while rolling forward grinds and locks the rear until the car stops, then reverses', () => {
  const box = manual(3)
  while (box.gear !== 'R') box.shift(-1, true)
  const log = ride(box, 3, (t) => ({ clutch: t < 0.05 ? 1 : 0 }), 3)
  assert.ok(log.some((s) => s.events.includes('grind')))
  const locked = log.filter((s) => s.brakeDecel === CONFIG.gearbox.lockDecel)
  assert.ok(locked.length > 0 && locked.every((s) => s.v >= 0), 'locked while still rolling forward')
  // Stopped, R engages and it creeps backwards at idle.
  assert.ok(log.at(-1).v < 0, `not reversing: ${log.at(-1).v.toFixed(2)} m/s`)
})

test('the automatic changes up through the gears flat out, and down again as the car slows', () => {
  const box = auto(0)
  const up = ride(box, 12, { throttle: 1 })
  const gears = [...new Set(up.map((s) => s.gear))]
  assert.deepEqual(gears.slice(0, 4), ['1', '2', '3', '4'], `went ${gears.join(' ')}`)
  assert.ok(up.every((s) => s.rpm <= CONFIG.gearbox.redline))
  const hundred = up.findIndex((s) => kmh(s.v) >= 100) * DT
  assert.ok(hundred > 0 && hundred < 2.6, `0 to 100 km/h in ${hundred.toFixed(1)}s`)
  const down = ride(box, 8, { brake: 0.6 }, up.at(-1).v)
  assert.equal(down.at(-1).gear, 'R', 'held S at a standstill should select R')
  assert.ok(down.some((s) => s.gear === '1'))
  assert.ok(!down.concat(up).some((s) => s.events.includes('stall') || s.events.includes('grind')))
})

test('the automatic reverses on S from a standstill, and takes 1st again on W', () => {
  const box = auto(0)
  const back = ride(box, 2, { brake: 1 })
  assert.equal(box.gear, 'R')
  assert.ok(back.at(-1).v < -2)
  // W brakes in R; stopped, W is 1st.
  const forward = ride(box, 3, { throttle: 1 }, back.at(-1).v)
  assert.equal(box.gear !== 'R', true)
  assert.ok(forward.at(-1).v > 2)
})

test('switching modes mid-drive keeps the gear, and the automatic ignores the lever', () => {
  const box = manual(60 / 3.6)
  const g = box.gear
  box.setMode('auto', 60 / 3.6)
  assert.equal(box.gear, g)
  assert.equal(box.shift(+1, true), 'end')
  box.setMode('manual', 60 / 3.6)
  assert.equal(box.gear, g)
  // A stall is simply over in the automatic.
  const stalled = manual(0)
  stalled.shift(+1, true)
  stalled.shift(+1, true)
  ride(stalled, 0.1, {})
  assert.equal(stalled.state, 'stalled')
  stalled.setMode('auto', 0)
  assert.notEqual(stalled.state, 'stalled')
})
