// The engine and gearbox (docs/spec/hero-drive.md §Gearbox and engine). This
// is the point of the whole thing: it's a manual driving school.
//
// Pure logic, no planck and no DOM, so the tests run it on its own. SI units:
// wheel speed in m/s along the car's heading, force in N, rpm.
//
//   const box = createGearbox()
//   box.shift(+1, clutchHeld)   // 'ok' | 'grind' | 'end'
//   box.step(dt, { throttle, brake, clutch, wheelSpeed })
//   // → { driveForce, brakeDecel, rpm, gear, state, wheelspin, events }
//
// throttle and brake are the W and S pedals as pressed, 0 to 1. In R the
// engine answers to S and W is the brake (§Keys), and the automatic uses S
// at a standstill to pick R, so the box sees both and the car asks
// box.gear which pedal is braking. clutch is the pedal, 1 fully down.
//
// state: 'running' (clutch up, in gear), 'free' (clutch down, in N, or a
// change under way), 'stalled', 'waiting' (restarted after a stall with the
// drive still out) or 'overrev'. events, this step only: 'grind', 'stall',
// 'restart', 'overrev', 'limiter', 'wheelspin', 'shift'.
//
// Two modes on the same gears. Manual: the visitor shifts and works the
// clutch, and it grinds, stalls and over-revs like a real one. Automatic:
// the box changes gear and handles the clutch itself, never stalls, and
// picks R or 1st at a standstill from the pedal that's down.

import { CONFIG } from '../config.js'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const RPM = 60 / (2 * Math.PI) // rad/s to rpm

// Torque as a share of peak at an engine speed: soft low down, flat through
// the middle, tailing off towards the redline.
const CURVE = [
  [0, 0.3],
  [1000, 0.55],
  [2000, 0.8],
  [3000, 1],
  [5500, 1],
  [6500, 0.88],
  [7000, 0.78],
  [9000, 0.5],
]

export function torqueShare(rpm) {
  for (let i = 1; i < CURVE.length; i++) {
    const [r1, t1] = CURVE[i]
    if (rpm <= r1) {
      const [r0, t0] = CURVE[i - 1]
      return t0 + ((t1 - t0) * (Math.max(rpm, r0) - r0)) / (r1 - r0)
    }
  }
  return CURVE[CURVE.length - 1][1]
}

const FORWARD = new Set(['1', '2', '3', '4', '5', '6'])
const LAUNCH = new Set(['1', 'R']) // gears with launch assist: they never stall

// cfg: CONFIG.gearbox. mode: 'auto' or 'manual'. wheelSpeed: how fast the car
// is going when it's taken over, which picks the starting gear.
export function createGearbox(cfg = CONFIG.gearbox, { mode = cfg.defaultMode, wheelSpeed = 0 } = {}) {
  const order = cfg.order
  let index = order.indexOf('N')
  let rpm = cfg.idle
  let state = 'free'
  let stallLeft = 0
  let shiftLeft = 0 // automatic: the drive is cut while a change goes through
  let spinLeft = 0
  let overrev = false
  let wrongWay = false // grinding into the wrong direction: rear locked until stopped
  let engaged = false // clutch up and in gear last step
  let clutchCycled = false // pressed since a stall, for the wait to end
  let clutchDown = false // last step's clutch, for shift()
  let limiterCut = false
  const events = [] // since the last step, handed over in its report

  const gear = () => order[index]
  const ratio = (g = gear()) => cfg.ratios[g] ?? 0
  const at = (g) => {
    index = order.indexOf(g)
  }

  // The engine speed the wheels turn it at in a gear, clutch up.
  const wheelRpm = (v, g = gear()) => (Math.abs(v) / cfg.tyreRadius) * ratio(g) * cfg.finalDrive * RPM

  // Force at the wheels, N, from the engine at `r` rpm and `open` throttle.
  const push = (r, open, g = gear()) =>
    open * cfg.peakTorque * cfg.torqueScale * torqueShare(r) * ((ratio(g) * cfg.finalDrive) / cfg.tyreRadius)

  // The highest forward gear that keeps the engine at `least` rpm or more at
  // this speed, short of the redline; 1st if none does.
  function gearFor(v, least) {
    for (let i = order.length - 1; i >= 0; i--) {
      const g = order[i]
      if (!FORWARD.has(g)) continue
      const r = wheelRpm(v, g)
      if (r >= least && r < cfg.redline) return g
    }
    return '1'
  }

  // Taking the car over. Manual: N if it's nearly stopped, otherwise the
  // highest gear that keeps the engine at 2,000 rpm or more, clutch up. The
  // automatic: the same, but 1st rather than N at a standstill.
  function start(v) {
    if (Math.abs(v) < 1) at(mode === 'auto' ? '1' : 'N')
    else if (v < 0) at('R')
    else at(gearFor(v, cfg.startGearRpm))
    rpm = gear() === 'N' ? cfg.idle : Math.max(cfg.idle, wheelRpm(v))
    engaged = gear() !== 'N'
    state = engaged ? 'running' : 'free'
  }

  // Revving free: towards idle, or towards the redline and past it into the
  // limiter under throttle.
  function revFree(dt, open) {
    const goal = cfg.idle + open * (cfg.redline + 400 - cfg.idle)
    rpm += clamp(goal - rpm, -cfg.revRate * dt, cfg.revRate * dt)
    limiter()
  }

  // The limiter: at the redline the engine cuts until it has dropped back.
  function limiter() {
    if (rpm >= cfg.redline) {
      limiterCut = true
      rpm = cfg.redline - cfg.limiterDrop
      events.push('limiter')
    } else if (rpm < cfg.redline - cfg.limiterDrop / 2) limiterCut = false
  }

  function stall() {
    state = 'stalled'
    stallLeft = cfg.stallTime
    engaged = false
    clutchCycled = false
    events.push('stall')
  }

  // The automatic's choice of gear, each step.
  function autoSelect(v, throttle, brake) {
    if (shiftLeft > 0) return
    const g = gear()
    const change = (to) => {
      if (to === g) return
      at(to)
      shiftLeft = cfg.auto.shiftTime
      events.push('shift')
    }
    // At a standstill the pedal that's down picks the direction: S held
    // (and not W) is R, W is 1st.
    if (Math.abs(v) < 0.5) {
      if (brake > 0.5 && throttle < 0.1) return change('R')
      if (throttle > 0.1 || g === 'N') return change('1')
      return
    }
    if (v < 0 || g === 'R') return
    if (g === 'N') return change(gearFor(v, cfg.auto.down))
    const r = wheelRpm(v)
    const up = cfg.auto.upLight + (cfg.auto.upFull - cfg.auto.upLight) * throttle
    const i = order.indexOf(g)
    if (r > up && g !== '6') return change(order[i + 1])
    if (r < cfg.auto.down && g !== '1') return change(order[i - 1])
    // Kickdown: flat out, a lower gear that's still short of the redline.
    if (throttle > 0.9 && g !== '1' && wheelRpm(v, order[i - 1]) < cfg.auto.kickdown) change(order[i - 1])
  }

  const out = {
    driveForce: 0,
    brakeDecel: 0,
    rpm: 0,
    gear: 'N',
    state: 'free',
    wheelspin: false,
    events: [],
  }

  const box = {
    get gear() {
      return gear()
    },
    get rpm() {
      return rpm
    },
    get state() {
      return state
    },
    get mode() {
      return mode
    },

    // Switching mode mid-drive keeps the gear. Into the automatic, a stall
    // or a wait is simply over, and N becomes a gear that suits the speed.
    setMode(next, v = 0) {
      if (next === mode) return
      mode = next
      if (mode === 'auto') {
        if (state === 'stalled' || state === 'waiting') state = 'running'
        overrev = wrongWay = false
        if (gear() === 'N') at(Math.abs(v) < 1 ? '1' : v > 0 ? gearFor(v, cfg.auto.down) : 'R')
      }
    },

    // One step up (+1) or down (-1) through R N 1 2 3 4 5 6. In manual it
    // needs the clutch down, every shift, into and out of N too; without it
    // the box grinds and stays in gear. The automatic ignores the lever.
    shift(dir, clutchHeld = clutchDown) {
      if (mode === 'auto') return 'end'
      const next = index + dir
      if (next < 0 || next >= order.length) return 'end'
      if (!clutchHeld) {
        events.push('grind')
        return 'grind'
      }
      index = next
      // A gear change ends the wait after a stall.
      if (state === 'waiting') clutchCycled = true
      return 'ok'
    },

    step(dt, { throttle = 0, brake = 0, clutch = 0, wheelSpeed = 0 }) {
      const v = wheelSpeed
      if (mode === 'auto') {
        clutch = 0
        autoSelect(v, throttle, brake)
      }
      // In R, S drives and W brakes.
      const open = gear() === 'R' ? brake : throttle
      const down = clutch >= 0.5
      clutchDown = down
      const g = gear()
      const inGear = g !== 'N'
      out.driveForce = 0
      out.brakeDecel = 0
      out.wheelspin = false

      // Stalled: the engine is off and the car bogs down, then it restarts
      // with the drive out.
      if (state === 'stalled') {
        stallLeft -= dt
        rpm = Math.max(0, rpm - cfg.revRate * dt)
        if (Math.abs(v) > 0.1) out.brakeDecel = cfg.stallDecel
        if (stallLeft <= 0) {
          state = 'waiting'
          rpm = cfg.idle
          events.push('restart')
        }
        return report()
      }

      // Restarted after a stall: the drive comes back on its own as soon as
      // the gear can hold 600 rpm, or straight away in 1st and R. In 2nd and
      // up at a standstill it waits for the clutch to go down and come up,
      // or a change of gear (§The stall loop).
      if (state === 'waiting') {
        if (down) clutchCycled = true
        const canHold = !inGear || LAUNCH.has(g) || wheelRpm(v) >= cfg.stallBelow
        if (canHold || (clutchCycled && !down)) {
          state = 'free'
          engaged = false
        } else {
          revFree(dt, open)
          return report()
        }
      }

      // The automatic cuts the drive for the moment a change takes.
      if (shiftLeft > 0) {
        shiftLeft -= dt
        rpm += clamp(wheelRpm(v) - rpm, -cfg.revRate * dt, cfg.revRate * dt)
        state = 'free'
        engaged = false
        return report()
      }

      const wantEngaged = inGear && !down
      if (!wantEngaged) {
        engaged = false
        overrev = false
        state = 'free'
        revFree(dt, open)
        return report()
      }

      // The clutch comes up in gear.
      if (!engaged) {
        engaged = true
        const wheels = wheelRpm(v)
        const backwards = (g === 'R' && v > 1) || (FORWARD.has(g) && v < -1)
        if (backwards) {
          // Into a gear against the way the car is rolling: it grinds, and
          // the rear wheels lock until the car has stopped.
          wrongWay = true
          events.push('grind')
        } else if (wheels > cfg.redline) {
          overrev = true
          events.push('overrev')
        } else if (!LAUNCH.has(g) && wheels < cfg.stallBelow && mode === 'manual') {
          stall()
          return report()
        } else if (LAUNCH.has(g) && rpm > cfg.wheelspinAbove && open > 0.5) {
          spinLeft = cfg.wheelspinTime
          events.push('wheelspin')
        }
      }

      if (wrongWay) {
        out.brakeDecel = cfg.lockDecel
        rpm += clamp(cfg.idle - rpm, -cfg.revRate * dt, cfg.revRate * dt)
        state = 'running'
        if (Math.abs(v) < 0.3) wrongWay = false
        return report()
      }

      state = overrev ? 'overrev' : 'running'
      const wheels = wheelRpm(v)
      if (LAUNCH.has(g) && wheels < cfg.idle) {
        // Launch assist: below idle speed the clutch slips, holding the
        // engine up, so 1st and R pull away without stalling and creep on
        // their own.
        rpm = cfg.idle + open * 2600
        out.driveForce = push(rpm, Math.max(open, cfg.creep))
      } else {
        rpm = wheels
        if (!LAUNCH.has(g) && rpm < cfg.stallBelow && mode === 'manual') {
          // Lugged down to a stall: braking to a stop in 3rd without the
          // clutch does this, as it would in a real car.
          stall()
          return report()
        }
        if (overrev) {
          out.brakeDecel = cfg.overrevDecel
          if (rpm <= cfg.redline) overrev = false
        } else {
          limiter()
          if (!limiterCut) out.driveForce = push(Math.max(rpm, cfg.idle), open)
          // Off the throttle, the engine holds the car back, harder in low
          // gears and at high revs.
          out.brakeDecel = cfg.engineBrake * (1 - open) * Math.min(1, rpm / cfg.redline) * (ratio() / cfg.ratios['1'])
        }
      }
      if (spinLeft > 0) {
        spinLeft -= dt
        out.wheelspin = true
      }
      if (g === 'R') out.driveForce = -out.driveForce
      return report()
    },

    // Taking the car over at this speed.
    start,
  }

  // What this step did, and anything shift() did since the last one.
  function report() {
    out.rpm = rpm
    out.gear = gear()
    out.state = state
    out.events.length = 0
    for (const e of events) out.events.push(e)
    events.length = 0
    return out
  }

  start(wheelSpeed)
  return box
}
