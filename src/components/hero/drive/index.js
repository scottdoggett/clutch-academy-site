// The drive chunk (docs/spec/hero-drive.md §Play mode, §Driving and
// physics): planck.js, the black car under a visitor's control, the walls
// around the hero, and the traffic as kinematic bodies it can run into.
// HeroStage loads it when the Drive button is hovered, focused or pressed,
// so phones and touch screens, which have no Drive button, never do.
//
// The engine runs it (engine/index.js): while there's a driver, its step()
// takes the place of the traffic's own. Physics is in metres; the traffic
// and the drawing are in px, and k converts.
//
// A drive goes waiting → driving → returning → done:
// - waiting: Drive was pressed while the black car was outside the hero.
//   It comes in at a way in, and control starts once it's fully inside.
// - driving: the visitor's.
// - returning: driving ended, and the car makes its own way to the
//   nearest lane (§Recovery), then blends into traffic.

import { Box, Chain, World } from 'planck'
import { CONFIG } from '../config.js'
import { createInput } from './input.js'
import { createControls, createPlayer } from './player.js'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a))

// sim: the traffic (engine/traffic.js). k: px per metre. box: the hero's
// { width, height }, px. top: px from the hero's top to the bottom of the
// fixed nav, which is the top wall. hero: the hero element, where keys are
// heard. mode: the gearbox's to start with, 'auto' or 'manual'. onControl:
// the car is now the visitor's. onExit: Esc, or focus leaving the hero.
export function createDriver({ sim, k, box, top, hero, mode = CONFIG.gearbox.defaultMode, onControl, onExit }) {
  const u = sim.units
  const world = new World({ gravity: { x: 0, y: 0 } })
  const car = sim.cars.find((c) => c.black)
  const controls = createControls()
  // What the gear display shows, updated every step: gear, rpm, the engine's
  // state, the mode, whether the clutch key is down, and counters that tick
  // up on a grind and on the limiter, so the display can react to each.
  const telemetry = { gear: 'N', rpm: 0, state: 'free', mode, clutch: false, grinds: 0, limits: 0, speed: 0 }

  // A grind shows up as the gearbox's 'grind' event on the next step.
  function shift(dir) {
    player?.box.shift(dir, controls.want.clutch > 0)
  }

  function setMode(next) {
    telemetry.mode = next
    player?.box.setMode(next, player.pose().v)
  }

  // No hero (the headless tests): no keyboard, and the test sets controls.
  let input = hero
    ? createInput(hero, {
        controls,
        onExit,
        onShift: shift,
        onToggleMode: () => setMode(telemetry.mode === 'auto' ? 'manual' : 'auto'),
      })
    : null
  const rc = CONFIG.recovery

  let state = 'waiting'
  let player = null
  let walls = null
  let rect = null
  let ring = null // { t }: seconds since control started
  let target = null // where a returning car is heading, from sim.landing()
  let retarget = 0
  let returning = 0 // s since it started back
  let blend = null // { from: pose, t }
  const pose = { x: 0, y: 0, a: 0, v: 0 }
  const kin = new Map() // traffic car → its kinematic body

  // ---------- Walls ---------------------------------------------------------
  // The hero's edges, with the top one at the bottom of the fixed nav so the
  // car can't hide under it. Only dynamic bodies touch them, so the traffic
  // drives through to its ways in and out.
  function build(b, t) {
    rect = { x0: 0, y0: t, x1: b.width, y1: b.height }
    if (walls) world.destroyBody(walls)
    walls = world.createBody({ type: 'static' })
    const m = (x, y) => ({ x: x / k, y: y / k })
    walls.createFixture(new Chain([m(0, t), m(b.width, t), m(b.width, b.height), m(0, b.height)], true), {
      restitution: CONFIG.player.wallRestitution,
      friction: 0.1,
    })
  }

  // Is a car's whole body inside the walls?
  function inside(p) {
    const c = Math.cos(p.a)
    const s = Math.sin(p.a)
    for (const [l, w] of [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]) {
      const x = p.x + (c * l * u.length - s * w * u.width) / 2
      const y = p.y + (s * l * u.length + c * w * u.width) / 2
      if (x < rect.x0 + 1 || x > rect.x1 - 1 || y < rect.y0 + 1 || y > rect.y1 - 1) return false
    }
    return true
  }

  // ---------- Traffic as bodies -----------------------------------------------
  // Each traffic car is a kinematic body whose velocity is set every step so
  // it arrives exactly where the traffic code has put it. Teleporting them
  // instead would break planck's contacts. A car that jumped (it came back
  // in at a way in) is moved outright.
  function syncTraffic(dt) {
    for (const c of sim.cars) {
      let b = kin.get(c)
      if (!c.active || c.driven) {
        if (b) {
          world.destroyBody(b)
          kin.delete(c)
        }
        continue
      }
      const x = c.x / k
      const y = c.y / k
      if (!b) {
        b = world.createBody({ type: 'kinematic', position: { x, y }, angle: c.a })
        b.createFixture(new Box(CONFIG.car.length / 2, CONFIG.car.width / 2))
        kin.set(c, b)
        continue
      }
      const at = b.getPosition()
      const dx = x - at.x
      const dy = y - at.y
      if (dx * dx + dy * dy > 4) {
        b.setTransform({ x, y }, c.a)
        b.setLinearVelocity({ x: 0, y: 0 })
        b.setAngularVelocity(0)
        continue
      }
      b.setLinearVelocity({ x: dx / dt, y: dy / dt })
      b.setAngularVelocity(wrap(c.a - b.getAngle()) / dt)
    }
  }

  function clearTraffic() {
    for (const b of kin.values()) world.destroyBody(b)
    kin.clear()
  }

  // ---------- Taking over -------------------------------------------------------

  function takeOver() {
    sim.takeOut(car)
    player = createPlayer(world, { x: car.x / k, y: car.y / k, a: car.a }, car.v / k, { mode: telemetry.mode })
    state = 'driving'
    ring = { t: 0 }
    onControl?.()
  }

  // Outside the hero when Drive is pressed: heading in, it just carries on;
  // otherwise it goes off and comes straight back in at a way in (the black
  // car is always first). With the traffic standing still under reduced
  // motion, nothing would bring it in, so it's parked on a street instead.
  function bringIn(moving) {
    if (car.active && inside(car)) return takeOver()
    if (!moving) {
      if (sim.seatInside(car) && inside(car)) takeOver()
      return
    }
    const comingIn = car.active && car.piece?.seg && car.piece.from.portal
    if (!comingIn && !car.pending) sim.sendOff(car)
  }

  // ---------- Returning to traffic ----------------------------------------------
  // A way back: a curve from where the car is, leaving along its heading, to
  // a landing spot on the nearest lane it can join (sim.landing()), arriving
  // along the lane, then on down the lane as far as the line. The car
  // follows it with its
  // velocity and turn rate set directly, still a solid body that other cars
  // stop for and it can't pass through, up to 30 km/h while the landing is
  // far and 10 km/h for the last few car lengths, stopping at the line if it
  // gets there. Once it's on the lane's line and heading, and there's room,
  // it blends into traffic.
  //
  // The spec's first version steered it there through the tyre model by
  // pure pursuit. From wherever a drive ends (mid-block, over the headline,
  // at a steep angle to the road) that swung wide, ran parallel to the lane
  // and missed short ones; about a quarter of test runs never made it back.

  const SAMPLES = 24
  let path = null // points { x, y, at } along the way back, px, `at` cumulative
  let progress = 0 // index along it the car has reached

  function planBack() {
    target = sim.landing(car, car, inside)
    path = null
    progress = furthest = 0
    idle = 0
    if (!target) return
    const dist = Math.hypot(target.x - car.x, target.y - car.y)
    const reach = Math.max(1.5 * u.length, dist / 2.5)
    const p0 = { x: car.x, y: car.y }
    const p1 = { x: car.x + Math.cos(car.a) * reach, y: car.y + Math.sin(car.a) * reach }
    const p3 = { x: target.x, y: target.y }
    const p2 = { x: p3.x - Math.cos(target.a) * reach, y: p3.y - Math.sin(target.a) * reach }
    path = []
    for (let i = 0; i <= SAMPLES; i++) {
      const t = i / SAMPLES
      const m = 1 - t
      const x = m * m * m * p0.x + 3 * m * m * t * p1.x + 3 * m * t * t * p2.x + t * t * t * p3.x
      const y = m * m * m * p0.y + 3 * m * m * t * p1.y + 3 * m * t * t * p2.y + t * t * t * p3.y
      const prev = path[i - 1]
      path.push({ x, y, at: prev ? prev.at + Math.hypot(x - prev.x, y - prev.y) : 0 })
    }
    // Then on along the lane as far as a car may join it, so it can keep
    // going while it waits for room, and stop at the line if it has to.
    const end = path[path.length - 1]
    const more = target.hi - target.s
    for (let i = 1; i <= 8; i++) {
      const d = (more * i) / 8
      path.push({ x: p3.x + Math.cos(target.a) * d, y: p3.y + Math.sin(target.a) * d, at: end.at + d })
    }
  }

  // The point `at` px along the way back, and the heading there.
  function along(at, out) {
    let i = 1
    while (i < path.length - 1 && path[i].at < at) i++
    const a = path[i - 1]
    const b = path[i]
    const f = clamp((at - a.at) / (b.at - a.at || 1), 0, 1)
    out.x = a.x + (b.x - a.x) * f
    out.y = a.y + (b.y - a.y) * f
    out.a = Math.atan2(b.y - a.y, b.x - a.x)
    return out
  }

  // Blocked, most likely by a traffic car that's waiting for it: back off
  // for a second, then plan again.
  let stuck = 0
  let backing = 0
  let landed = false // close to its landing spot at least once
  let sinceLanded = 0
  let idle = 0 // s since it last got further along the way back
  let furthest = 0
  const aim = { x: 0, y: 0, a: 0 }

  // How far ahead of the car's nose, px, the nearest other car is, if one is
  // roughly in line with it within a few car lengths.
  function clearAhead() {
    const c = Math.cos(car.a)
    const s = Math.sin(car.a)
    let near = Infinity
    for (const o of sim.cars) {
      if (o === car || !o.active) continue
      const dx = o.x - car.x
      const dy = o.y - car.y
      const ahead = dx * c + dy * s
      const side = Math.abs(-dx * s + dy * c)
      if (ahead <= 0 || ahead > 4 * u.length || side > u.width) continue
      near = Math.min(near, ahead - u.length)
    }
    return near
  }

  function autopilot(dt) {
    const body = player.body
    const vel = body.getLinearVelocity()
    const ang = body.getAngle()
    const accel = CONFIG.player.traction * dt // m/s of change allowed this step
    const steerTo = (vx, vy, heading) => {
      body.setLinearVelocity({
        x: vel.x + clamp(vx - vel.x, -accel * 2, accel * 2),
        y: vel.y + clamp(vy - vel.y, -accel * 2, accel * 2),
      })
      body.setAngularVelocity(clamp(wrap(heading - ang) * 5, -3, 3))
    }
    if (backing > 0) {
      backing -= dt
      steerTo(-Math.cos(ang), -Math.sin(ang), ang)
      if (backing <= 0) path = null
      return
    }
    retarget -= dt
    if (!path && retarget <= 0) {
      planBack()
      retarget = 0.5
    }
    if (!path) {
      steerTo(0, 0, ang)
      return
    }
    // Where along the way back the car is.
    const was = progress
    let best = Infinity
    for (let i = progress; i < Math.min(path.length, progress + 6); i++) {
      const d = Math.hypot(path[i].x - car.x, path[i].y - car.y)
      if (d < best) {
        best = d
        progress = i
      }
    }
    if (best > 2 * u.length) {
      path = null
      return
    }
    // Not getting any further (jittering on the spot, or held up) short of
    // the line: back off and plan again.
    if (progress > furthest || was !== progress) {
      furthest = Math.max(furthest, progress)
      idle = 0
    } else idle += dt
    const land = path[SAMPLES].at
    const here = path[progress].at
    const left = land - here
    if (left < 2 * u.length) landed = true
    // Faster while the landing is a way off, 10 km/h for the last few car
    // lengths.
    const slow = rc.rejoinKmh / 3.6
    const fast = rc.approachKmh / 3.6
    // And stopping at the end of the way back, the lane's line.
    const toEnd = path[path.length - 1].at - here
    const brake = Math.sqrt(2 * CONFIG.traffic.decel * Math.max(0, toEnd / k - 0.2))
    let speed = Math.min(brake, clamp(slow + ((fast - slow) * (left - 3 * u.length)) / (4 * u.length), slow, fast))
    // And behind any car in its way, keeping a stopped car's gap.
    const gap = clearAhead()
    if (gap < Infinity) speed = Math.min(speed, Math.sqrt(2 * CONFIG.traffic.decel * Math.max(0, (gap - u.s0) / k)))
    const lead = rc.lead[0] + ((rc.lead[1] - rc.lead[0]) * (speed - slow)) / (fast - slow || 1)
    along(here + (lead * u.length) / 2, aim)
    const dx = aim.x - car.x
    const dy = aim.y - car.y
    const n = Math.hypot(dx, dy) || 1
    steerTo((dx / n) * speed, (dy / n) * speed, aim.a)
    // Standing still anywhere short of the line: blocked, either nose to
    // something or waiting on a traffic car that's waiting on it. Back off.
    const moving = Math.hypot(vel.x, vel.y)
    stuck = moving < 0.3 && toEnd > u.length / 2 ? stuck + dt : 0
    if (stuck > 1 || (idle > 2 && toEnd > u.length / 2)) {
      stuck = idle = 0
      backing = 1
    }
  }

  function tryRejoin() {
    if (!target) return
    const lane = target.lane
    const along = (car.x - lane.p0.x) * lane.d.x + (car.y - lane.p0.y) * lane.d.y
    const off = Math.abs((car.x - lane.p0.x) * -lane.d.y + (car.y - lane.p0.y) * lane.d.x)
    const turn = Math.abs(wrap(car.a - lane.heading))
    if (off > rc.near * k || turn > (rc.nearDeg * Math.PI) / 180) return
    const from = { x: car.x, y: car.y, a: car.a }
    if (!sim.rejoin(car, lane, along + u.length / 2, Math.max(0, pose.v * k))) return
    player.dispose()
    player = null
    blend = { from, t: 0 }
    state = 'blending'
  }

  // For the blend's half second, what's drawn eases from where the car was
  // off the lanes to where the traffic has it.
  function applyBlend(dt) {
    blend.t += dt
    const e = clamp(blend.t / rc.blend, 0, 1)
    const f = e * e * (3 - 2 * e)
    car.x = blend.from.x + (car.x - blend.from.x) * f
    car.y = blend.from.y + (car.y - blend.from.y) * f
    car.a = blend.from.a + wrap(car.a - blend.from.a) * f
    if (e >= 1) {
      blend = null
      state = 'done'
      sim.setBodies([])
    }
  }

  // ---------- The step --------------------------------------------------------

  // moving: whether the traffic moves. Under reduced motion it stands still,
  // and only the visitor's car moves.
  function step(dt, moving) {
    if (state === 'waiting') bringIn(moving)
    controls.step(dt)
    sim.setBodies(player ? [car] : [])
    if (moving) sim.step(dt)
    syncTraffic(dt)
    if (state === 'driving') player.step(dt, controls.now)
    else if (state === 'returning') autopilot(dt)
    world.step(dt, 8, 3)
    if (player) {
      player.pose(pose)
      car.x = pose.x * k
      car.y = pose.y * k
      car.a = pose.a
      car.v = pose.v * k
      const engine = player.engine
      if (engine && state === 'driving') {
        telemetry.gear = engine.gear
        telemetry.rpm = engine.rpm
        telemetry.state = engine.state
        telemetry.speed = pose.v
        telemetry.clutch = controls.want.clutch > 0
        for (const e of engine.events) {
          if (e === 'grind') telemetry.grinds++
          else if (e === 'limiter') telemetry.limits++
        }
      }
    }
    if (state === 'returning') {
      returning += dt
      if (landed) sinceLanded += dt
      tryRejoin()
      // Pinned against a wall, or no lane with room: off at an edge, and
      // straight back in, rather than stuck.
      if (state === 'returning' && (sinceLanded > rc.giveUp || returning > rc.giveUpMax)) {
        player.dispose()
        player = null
        // Under reduced motion nothing would bring it back in; park it.
        if (!moving) sim.seatInside(car)
        else sim.sendOff(car)
        state = 'done'
        sim.setBodies([])
      }
    }
    if (blend) applyBlend(dt)
    if (ring) ring.t += dt
  }

  build(box, top)

  return {
    step,
    controls,
    telemetry,
    shift,
    setMode,

    get state() {
      return state
    },

    // The takeover ring: where the car is and how long since control
    // started, while it's showing.
    get ring() {
      return ring && ring.t < CONFIG.render.ring.life ? { x: car.x, y: car.y, t: ring.t } : null
    },

    // Driving is over: Esc, the ×, or focus gone. The keys stop counting
    // and the car finds its own way back.
    release() {
      input?.dispose()
      input = null
      controls.clear()
      if (state === 'waiting') {
        state = 'done'
        sim.setBodies([])
      }
      if (state !== 'driving') return
      state = 'returning'
      returning = 0
      target = null
      path = null
      retarget = 0
      stuck = backing = sinceLanded = 0
      landed = false
    },

    // Held keys go when the loop pauses (off screen, hidden tab).
    clearKeys() {
      input?.clear()
    },

    // The hero changed size: new walls, and the car keeps its place in
    // proportion, inside them.
    resize(next, nextTop) {
      const sx = next.width / (rect.x1 || 1)
      const sy = next.height / (rect.y1 || 1)
      build(next, nextTop)
      clearTraffic()
      if (player) {
        const at = player.body.getPosition()
        const x = clamp(at.x * sx * k, rect.x0 + u.length, rect.x1 - u.length) / k
        const y = clamp(at.y * sy * k, rect.y0 + u.length, rect.y1 - u.length) / k
        player.body.setTransform({ x, y }, player.body.getAngle())
      }
    },

    // The nav's bottom moved relative to the hero: the page scrolled.
    setTop(nextTop) {
      if (Math.abs(nextTop - rect.y0) > 0.5) build({ width: rect.x1, height: rect.y1 }, nextTop)
    },

    dispose() {
      input?.dispose()
      input = null
      sim.setBodies([])
      // Mid-drive (the page is going, or the map changed): the car goes back
      // to traffic by way of an edge.
      if (car.driven) sim.sendOff(car)
    },
  }
}
