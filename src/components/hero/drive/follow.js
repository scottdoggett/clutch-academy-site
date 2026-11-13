// The page following the car (docs/spec/hero-drive.md §Driving the whole
// page). While a visitor drives, the black car can go anywhere on the page,
// and when it gets near the bottom or the top of the window the page
// scrolls with it. The scroll has momentum: it picks up quickly, and when
// the car slows or stops it keeps going for a moment and dies away, the way
// a flicked trackpad does.
//
// Pure, no DOM: the engine measures the window and applies the result.
//
// const follow = createFollow()
// scroll = follow.step(dt, { y, vy, reach, top, bottom, scroll, max, still })
//
// y: the car's centre, px from the window's top. vy: its speed down the
// page, px/s. reach: px from its centre to its furthest point. top: the
// nav's bottom, the highest the car may show. bottom: the window's height.
// scroll: the page's scroll now, max: the most it can scroll. still:
// reduced motion, where there's no momentum and the page moves only as
// much as keeps the car at the edge of the zone.

import { CONFIG } from '../config.js'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

export function createFollow(cfg = CONFIG.follow) {
  let speed = 0 // px/s the page is scrolling, + down
  let hold = 0 // s left to leave the page alone

  return {
    get speed() {
      return speed
    },

    // The visitor scrolled the page themselves: stop, and leave it to them
    // for a moment.
    hold() {
      speed = 0
      hold = cfg.hold
    },

    step(dt, { y, vy, reach, top, bottom, scroll, max, still = false }) {
      if (hold > 0) {
        hold -= dt
        return scroll
      }
      // Off screen, because the visitor scrolled away from it: leave the
      // page where they put it until the car is back in view.
      if (y < top - reach || y > bottom + reach) {
        speed = 0
        return scroll
      }
      const zone = cfg.zone * (bottom - top)
      const lo = top + zone // above this, the top zone
      const hi = bottom - zone // below this, the bottom zone

      // Only a car heading for the edge moves the page: one standing near
      // the bottom when Drive is pressed, or turning back, leaves it be.
      const down = y > hi && vy > 0
      const up = y < lo && vy < 0
      let next = scroll
      if (still) {
        // No momentum: the page moves with the car, as far as it moves into
        // the zone, and stops when the car does.
        speed = 0
        if (down) next += Math.min(y - hi, vy * dt)
        else if (up) next -= Math.min(lo - y, -vy * dt)
      } else {
        // What the scroll wants: the car's own speed, plus a push that grows
        // the deeper it is into the zone, so it's carried back towards the
        // middle. The push comes in with the car's speed, full from 30 px/s.
        let want = 0
        const moving = Math.min(1, Math.abs(vy) / 30)
        if (down) want = vy + (cfg.push * moving * (y - hi)) / zone
        else if (up) want = vy - (cfg.push * moving * (lo - y)) / zone
        // Quick to pick up or turn round; slow to let go.
        const coasting = want * speed >= 0 && Math.abs(want) < Math.abs(speed)
        speed += (want - speed) * (1 - Math.exp(-dt / (coasting ? cfg.coast : cfg.rise)))
        // The last few px/s would take seconds to die away for 3px of travel.
        if (!want && Math.abs(speed) < 5) speed = 0
        next += speed * dt
        // Whatever the momentum, the car stays on screen.
        const at = y - (next - scroll)
        const low = bottom - reach - cfg.edge
        const high = top + reach + cfg.edge
        if (at > low) next += at - low
        else if (at < high) next -= high - at
      }
      const clamped = clamp(next, 0, Math.max(0, max))
      if (clamped !== next) speed = 0
      return clamped
    },
  }
}
