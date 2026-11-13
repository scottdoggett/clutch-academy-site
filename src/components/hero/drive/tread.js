// Tyre marks behind the black car while it's driven (docs/spec/hero-drive.md
// §Tyre marks): which marks, and how strong. Faint whenever a wheel rolls,
// and darker and wider as its tyre slides: a drift or a skid at that axle,
// hard braking on all four, wheelspin at the rear.
//
// Pure, no DOM: the driver feeds it the car's pose and its tyres
// (player.js), and hands the segments on to the renderer (engine/marks.js).
//
// const tread = createTread()
// tread.lay(pose, tyres, k, (x0, y0, x1, y1, strength, onBelt) => ..., belt)
//
// strength runs from CONFIG.marks.roll, a plain rolling mark, to 1, a full
// skid. belt: the reviews strip, { x0, y0, x1, y1, travel } in the hero's
// px, or null (src/lib/treadmill.js). A wheel on it marks the strip, not
// the page: its segment is in the strip's own frame, x less the strip's
// travel so far, and onBelt is true, so the mark rides along with the
// reviews.

import { CONFIG } from '../config.js'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// How hard each axle is marking, 0 to 1, from what the tyres did:
// { front, rear }.
export function skids(tyres, cfg = CONFIG.marks, out = {}) {
  const slide = (v) => clamp((v - cfg.slip) / (cfg.slipFull - cfg.slip), 0, 1)
  out.front = slide(tyres.front)
  out.rear = slide(tyres.rear)
  if (tyres.brake > cfg.brakeAbove && tyres.speed > cfg.brakeFromKmh / 3.6) {
    out.front = Math.max(out.front, cfg.brake)
    out.rear = Math.max(out.rear, cfg.brake)
  }
  if (tyres.spin && tyres.speed > 0.5) out.rear = 1
  return out
}

// Where the four wheels are, px: front left, front right, rear left, rear
// right. pose: the car's centre, px, and heading. k: px per metre.
export function wheelSpots(pose, k, out = [{}, {}, {}, {}], car = CONFIG.car, cfg = CONFIG.marks) {
  const c = Math.cos(pose.a)
  const s = Math.sin(pose.a)
  const along = (car.wheelbase / 2) * k
  const across = (cfg.track / 2) * k
  const at = (i, l, w) => {
    out[i].x = pose.x + c * l - s * w
    out[i].y = pose.y + s * l + c * w
  }
  at(0, along, -across)
  at(1, along, across)
  at(2, -along, -across)
  at(3, -along, across)
  return out
}

export function createTread(cfg = CONFIG.marks, dt = CONFIG.world.step) {
  const last = [null, null, null, null] // where each wheel's last mark ended
  const spots = [{}, {}, {}, {}]
  const now = { front: 0, rear: 0 }
  // What's marked: a skid comes in at once, and tails off over `release` as
  // the tyre grips again, the way a real mark does, instead of stopping dead.
  const axles = { front: 0, rear: 0 }
  const drop = dt / cfg.release

  return {
    // One step's marks: a segment for each wheel that has rolled `every` px
    // since its last one, joined end to end so the strip is continuous.
    // Called once a fixed step.
    lay(pose, tyres, k, emit, belt = null) {
      wheelSpots(pose, k, spots)
      skids(tyres, cfg, now)
      axles.front = Math.max(now.front, axles.front - drop)
      axles.rear = Math.max(now.rear, axles.rear - drop)
      for (let i = 0; i < 4; i++) {
        const at = spots[i]
        const on = !!belt && at.x >= belt.x0 && at.x <= belt.x1 && at.y >= belt.y0 && at.y <= belt.y1
        if (on) at.x -= belt.travel
        const from = last[i]
        // Onto the strip or off it: a fresh strip, in the other frame.
        if (!from || from.on !== on) {
          last[i] = { x: at.x, y: at.y, on }
          continue
        }
        const d = Math.hypot(at.x - from.x, at.y - from.y)
        if (d > cfg.jump) {
          from.x = at.x
          from.y = at.y
          continue
        }
        if (d < cfg.every) continue
        const skid = i < 2 ? axles.front : axles.rear
        emit(from.x, from.y, at.x, at.y, cfg.roll + (1 - cfg.roll) * skid, on)
        from.x = at.x
        from.y = at.y
      }
    },

    // The car stopped being driven: the next mark starts fresh.
    reset() {
      last.fill(null)
      axles.front = axles.rear = 0
    },
  }
}
