// The black car under a visitor's control (docs/spec/hero-drive.md §The
// player car): a planck.js body with top-down car handling. Arcade, not a
// simulation.
//
// Everything here is SI, metres and seconds, in DOM orientation (x right, y
// down), so a heading is the same angle the traffic uses. drive/index.js
// converts to and from px.
//
// How it drives: two virtual axles, a wheelbase apart. Each step, at each
// axle, the sideways part of the velocity is cancelled by an impulse, up to
// that axle's grip; anything over the cap slides, and that's the drift. The
// front axle's "sideways" follows the steered wheels, which is what turns
// the car. The drive force pushes at the rear axle, and the brakes oppose
// the car's motion. No planck, no DOM in the maths below; the body comes in.
//
// The drive comes from the engine and gearbox (gearbox.js), in whichever
// mode the visitor has picked: its force at the rear axle, capped at what
// the tyres can put down; its braking (engine braking, a stall bogging the
// car down, an over-rev, the rear locking) on top of the brakes; and its
// wheelspin loosening the rear.

import { Box } from 'planck'
import { CONFIG } from '../config.js'
import { createGearbox } from './gearbox.js'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// Move `v` toward `to` by at most `step`: pedals and steering ease over
// CONFIG.player.ease instead of snapping.
const ease = (v, to, step) => (v < to ? Math.min(to, v + step) : Math.max(to, v - step))

// A pedals-and-steering state: what the keys ask for, and where the car's
// controls actually are after easing. throttle is W, brake is S (in R they
// swap roles; the gearbox knows), clutch is Shift.
const KEYS = ['throttle', 'brake', 'clutch', 'steer']
export function createControls() {
  return {
    want: { throttle: 0, brake: 0, clutch: 0, steer: 0 },
    now: { throttle: 0, brake: 0, clutch: 0, steer: 0 },
    step(dt) {
      const { steer, pedal } = CONFIG.player.ease
      this.now.throttle = ease(this.now.throttle, this.want.throttle, dt / pedal)
      this.now.brake = ease(this.now.brake, this.want.brake, dt / pedal)
      this.now.clutch = ease(this.now.clutch, this.want.clutch, dt / pedal)
      this.now.steer = ease(this.now.steer, this.want.steer, dt / steer)
    },
    clear() {
      for (const key of KEYS) this.want[key] = this.now[key] = 0
    },
  }
}

// world: a planck World. pose: { x, y, a } in metres and radians. speed: m/s
// along the heading, so a car taken out of traffic keeps going, in a gear
// that suits it. mode: the gearbox's, 'auto' or 'manual'.
export function createPlayer(world, { x, y, a }, speed = 0, { mode, p = CONFIG.player } = {}) {
  const { length, width, wheelbase } = CONFIG.car
  const body = world.createBody({
    type: 'dynamic',
    position: { x, y },
    angle: a,
    bullet: true, // so it can't tunnel through a car at top speed
    allowSleep: false,
    angularDamping: p.spinDamping,
  })
  body.createFixture(new Box(length / 2, width / 2), {
    density: p.mass / (length * width),
    friction: 0.3,
    restitution: 0.2,
  })
  body.setLinearVelocity({ x: Math.cos(a) * speed, y: Math.sin(a) * speed })

  const mass = body.getMass()
  const half = wheelbase / 2
  const g = { x: 0, y: 0 } // scratch
  const box = createGearbox(CONFIG.gearbox, { mode, wheelSpeed: speed })
  let last = null // the gearbox's report from the last step
  // How far into a drift the rear is: 0 gripping, 1 fully loose.
  let drifting = 0

  // m/s along the car's heading, negative when rolling backwards.
  const forwardSpeed = () => {
    const v = body.getLinearVelocity()
    const ang = body.getAngle()
    return v.x * Math.cos(ang) + v.y * Math.sin(ang)
  }

  // Cancel the sideways velocity at one axle, up to its grip. dir is the
  // way the axle's wheels point.
  function grip(localX, dirAngle, share, dt) {
    const ang = body.getAngle()
    const c = Math.cos(ang)
    const s = Math.sin(ang)
    g.x = body.getPosition().x + c * localX
    g.y = body.getPosition().y + s * localX
    const v = body.getLinearVelocityFromWorldPoint(g)
    // The wheels' right-hand side, y down.
    const sx = -Math.sin(dirAngle)
    const sy = Math.cos(dirAngle)
    const lateral = v.x * sx + v.y * sy
    const cap = p.grip * share * (mass / 2) * dt
    const j = clamp(-lateral * (mass / 2), -cap, cap)
    body.applyLinearImpulse({ x: sx * j, y: sy * j }, g, true)
    return Math.abs(-lateral * (mass / 2)) > cap
  }

  return {
    body,

    box,

    // One fixed step. controls: from createControls(), already eased.
    step(dt, { throttle, brake, clutch, steer }) {
      const ang = body.getAngle()
      const fx = Math.cos(ang)
      const fy = Math.sin(ang)
      const v = forwardSpeed()
      const speed = Math.abs(v)

      const out = box.step(dt, { throttle, brake, clutch, wheelSpeed: v })
      last = out
      // In R, S drives and W is the brake (§Keys).
      const reversing = box.gear === 'R'
      const stop = reversing ? throttle : brake

      // Steering lock shrinks with speed: twitchy slow, stable fast.
      const top = p.topKmh / 3.6
      const lock = ((p.maxSteerDeg * Math.PI) / 180) * (1 - (1 - p.steerAtTop) * clamp(speed / top, 0, 1))
      const delta = steer * lock

      // Grip at each axle. The rear loses some under hard braking, and a lot
      // in a drift, which steps the tail out; the front keeps its grip, so
      // it's recoverable.
      const d = p.drift
      const loose = speed > d.fromKmh / 3.6 && Math.abs(steer) > d.steer && !reversing
      drifting = ease(drifting, loose ? 1 : 0, dt / d.ease)
      const hard = stop > p.hardBrake && speed > 1
      // How far the car is sliding: the angle between where it points and
      // where it's going. Past maxSlipDeg the drift gives its grip back.
      const vel0 = body.getLinearVelocity()
      const moving = Math.hypot(vel0.x, vel0.y)
      const slip =
        moving > 3 && !reversing
          ? Math.abs(Math.atan2(Math.sin(Math.atan2(vel0.y, vel0.x) - ang), Math.cos(Math.atan2(vel0.y, vel0.x) - ang)))
          : 0
      const over = clamp(((slip * 180) / Math.PI - d.maxSlipDeg) / (d.spinDeg - d.maxSlipDeg), 0, 1)
      const looseness = drifting * (1 - over)
      let rear = p.rearGrip * (1 - looseness * (1 - d.rearGrip))
      if (hard) rear *= p.rearGripBraking
      // Wheelspin, and the rear locked by the gearbox (an over-rev, or a gear
      // against the way the car's rolling): the rear lets go.
      if (out.wheelspin || out.brakeDecel >= CONFIG.gearbox.overrevDecel - 1) rear *= p.rearGripSpin
      grip(half, ang + delta, 1, dt)
      grip(-half, ang, rear, dt)

      // Drive, at the rear axle, along the heading, as much as the tyres can
      // put down.
      const force = clamp(out.driveForce, -p.traction * mass, p.traction * mass)
      if (force) {
        g.x = body.getPosition().x - fx * half
        g.y = body.getPosition().y - fy * half
        body.applyForce({ x: fx * force, y: fy * force }, g, true)
      }

      // Brakes and drag oppose the motion; brakes never push it backwards.
      const vel = body.getLinearVelocity()
      const vv = Math.hypot(vel.x, vel.y)
      if (vv > 1e-4) {
        const drag = p.drag.linear * vv + p.drag.quad * vv * vv
        const decel = Math.min(stop * p.brake + out.brakeDecel + drag, vv / dt)
        body.applyForceToCenter({ x: (-vel.x / vv) * decel * mass, y: (-vel.y / vv) * decel * mass }, true)
      }
    },

    // Where the car is, metres and radians, and how fast it's going.
    pose(out = {}) {
      const at = body.getPosition()
      out.x = at.x
      out.y = at.y
      out.a = body.getAngle()
      out.v = forwardSpeed()
      return out
    },

    get speed() {
      return Math.abs(forwardSpeed())
    },

    // How far into a drift the rear is, 0 to 1: for the tyre marks, later.
    get drift() {
      return drifting
    },

    // The gearbox's last report: gear, rpm, state and this step's events.
    get engine() {
      return last
    },

    dispose() {
      world.destroyBody(body)
    },
  }
}
