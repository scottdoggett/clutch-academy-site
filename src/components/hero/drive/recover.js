// A car finding its own way back into traffic (docs/spec/hero-drive.md
// §Recovery): a knocked car once it has settled, or the black car when
// asked to rejoin. Its body is a planck body in the driver's world; this
// steers it and says when it's back.
//
// A way back: a curve from where the car is, leaving along its heading, to
// a landing spot on the nearest lane it can join (sim.landing()), arriving
// along the lane, then on down the lane as far as the line. The car follows
// it with its velocity and turn rate set directly, still a solid body that
// other cars stop for and it can't pass through, up to 30 km/h while the
// landing is far and 10 km/h for the last few car lengths, stopping at the
// line if it gets there. Once it's on the lane's line and heading, and
// there's room, it rejoins traffic.
//
// The spec's first version steered it there through the tyre model by pure
// pursuit. From wherever a drive ends (mid-block, over the headline, at a
// steep angle to the road) that swung wide, ran parallel to the lane and
// missed short ones; about a quarter of test runs never made it back.
//
// const back = createRecovery({ sim, car, body, k, inside })
// back.steer(dt)          // before the world steps
// back.check(dt)          // after, with car.x, car.y, car.a from the body:
//                         // 'rejoined', 'lost' (it gave up) or null
// back.from               // where it was drawn when it rejoined

import { CONFIG } from '../config.js'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a))
const SAMPLES = 24

// sim: the traffic. car: the car, in px, kept up to date by the caller.
// body: its planck body, metres. k: px per metre. inside(pose): is a pose
// wholly in the hero, where landing spots may be.
export function createRecovery({ sim, car, body, k, inside, rc = CONFIG.recovery }) {
  const u = sim.units
  let target = null
  let path = null // points { x, y, at } along the way back, px, `at` cumulative
  let progress = 0 // index along it the car has reached
  let furthest = 0
  let retarget = 0
  let returning = 0 // s since it started back
  let stuck = 0
  let backing = 0 // s left backing off
  let landed = false // close to its landing spot at least once
  let sinceLanded = 0
  let idle = 0 // s since it last got further along the way back
  let from = null
  const aim = { x: 0, y: 0, a: 0 }

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

  function steer(dt) {
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
    // Blocked, most likely by a traffic car that's waiting for it: back off
    // for a second, then plan again.
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

  // On the lane's line and heading, with room: back into traffic.
  function tryRejoin() {
    if (!target) return false
    const lane = target.lane
    const at = (car.x - lane.p0.x) * lane.d.x + (car.y - lane.p0.y) * lane.d.y
    const off = Math.abs((car.x - lane.p0.x) * -lane.d.y + (car.y - lane.p0.y) * lane.d.x)
    const turn = Math.abs(wrap(car.a - lane.heading))
    if (off > rc.near * k || turn > (rc.nearDeg * Math.PI) / 180) return false
    const pose = { x: car.x, y: car.y, a: car.a }
    const vel = body.getLinearVelocity()
    const v = vel.x * Math.cos(car.a) + vel.y * Math.sin(car.a)
    if (!sim.rejoin(car, lane, at + u.length / 2, Math.max(0, v * k))) return false
    from = pose
    return true
  }

  return {
    steer,

    check(dt) {
      returning += dt
      if (landed) sinceLanded += dt
      if (tryRejoin()) return 'rejoined'
      // Pinned against a wall, or no lane with room: give up, rather than
      // stuck for good.
      if (sinceLanded > rc.giveUp || returning > rc.giveUpMax) return 'lost'
      return null
    },

    get from() {
      return from
    },
  }
}
