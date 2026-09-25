// The drive chunk (docs/spec/hero-drive.md §Play mode, §Driving and
// physics): planck.js, the black car under a visitor's control, the walls
// around the page, and the traffic as kinematic bodies it can run into and
// knock out of their lanes. HeroStage loads it when the Test drive button
// is hovered, focused or pressed, so phones and touch screens, which have
// no button, never do.
//
// The engine runs it (engine/index.js): while there's a driver, its step()
// takes the place of the traffic's own. Physics is in metres; the traffic
// and the drawing are in px, and k converts.
//
// A drive goes waiting → driving → leaving → done:
// - waiting: Drive was pressed while the black car was outside the hero.
//   It comes in at a way in, and control starts once it's fully inside.
// - driving: the visitor's, anywhere on the page (§Driving the whole page).
// - leaving: driving ended. The car drives itself off the side of the
//   window, fast, and only once it's out of sight goes back into traffic,
//   coming in at the top of the map.
// - returning, instead of leaving, when asked for (release({ rejoin: true })):
//   the car makes its own way to the nearest lane (recover.js) and blends
//   into traffic.
// - done, and until every car it knocked has found its way back or faded
//   out, settling: the world stays up for them, and a new drive can start.
//
// Knocks (§Traffic as physical bodies): the first time the black car
// touches a traffic car, the contact is let through for one step, and after
// it the traffic car becomes a real body of the same mass, moving as it
// was; the next step the two meet properly. A knocked car slides and spins
// with its brakes locked, can knock others harder than a nudge, settles,
// and finds its way back into its lane the same way the black car can
// (recover.js). That's all that happens to it: it's bumped, not damaged.
//
// Effects (§Smoke, §Effects): smoke from a stall, an over-rev and sliding
// tyres, and sparks where cars hit. effects.js says what; onParticle hands
// each particle to the engine to draw.

import { Box, Chain, World } from 'planck'
import { CONFIG } from '../config.js'
import { mulberry32 } from '../engine/traffic.js'
import { crash, due, rearBurst, stallSmoke, tyreSmoke } from './effects.js'
import { createFollow } from './follow.js'
import { createInput } from './input.js'
import { createControls, createPlayer } from './player.js'
import { createRecovery } from './recover.js'
import { createTread, skids, wheelSpots } from './tread.js'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a))

// sim: the traffic (engine/traffic.js). k: px per metre. box: the hero's
// { width, height }, px. top: px from the hero's top to the bottom of the
// fixed nav, above which the hero is out of sight. page: the walls,
// { x0, y0, x1, y1 } in the hero's px, the whole page; without it (the
// tests) the walls are the hero's edges with the top one at `top`. area:
// the element keys are heard on, the driving layer. mode: the gearbox's to
// start with, 'auto' or 'manual'. onControl: the car is now the visitor's.
// onExit: Esc, or focus leaving the driving layer. onMark(x0, y0, x1, y1,
// strength, onBelt): a tyre mark segment, px, laid while the visitor
// drives; on the reviews strip it's in the strip's frame (tread.js).
// onParticle(p): smoke or a spark to draw (effects.js).
export function createDriver({
  sim,
  k,
  box,
  top,
  page = null,
  area,
  mode = CONFIG.gearbox.defaultMode,
  onControl,
  onExit,
  onMark,
  onParticle,
}) {
  const u = sim.units
  const world = new World({ gravity: { x: 0, y: 0 } })
  const car = sim.cars.find((c) => c.black)
  const controls = createControls()
  const rc = CONFIG.recovery
  const kc = CONFIG.knock
  const fx = CONFIG.effects
  const rnd = mulberry32(CONFIG.world.seed + 101)
  const emit = onParticle ?? (() => {})
  // What the driving display shows, updated every step: gear, rpm, the
  // engine's state, the mode, how far down the clutch pedal is (0 to 1, eased
  // like the key), and counters that tick up on a grind and on the limiter,
  // so the display can react to each; and the speed, m/s along the heading.
  const telemetry = {
    gear: 'N',
    rpm: 0,
    state: 'free',
    mode,
    clutch: 0,
    grinds: 0,
    limits: 0,
    speed: 0,
  }

  // A grind shows up as the gearbox's 'grind' event on the next step.
  function shift(dir) {
    player?.box.shift(dir, controls.want.clutch > 0)
  }

  function setMode(next) {
    telemetry.mode = next
    player?.box.setMode(next, player.pose().v)
  }

  // No area (the headless tests): no keyboard, and the test sets controls.
  const listen = (el) =>
    el
      ? createInput(el, {
          controls,
          onExit: () => onExit?.(),
          onShift: shift,
          onToggleMode: () => setMode(telemetry.mode === 'auto' ? 'manual' : 'auto'),
        })
      : null
  let input = listen(area)

  let state = 'waiting'
  let player = null
  let walls = null
  let hero = null // the hero's box in sight, { x0, y0, x1, y1 }: where traffic is
  let bounds = page // the walls; the hero's box when there's no page
  let leaving = null // { side, t, held, ghost }: side -1 off the left, +1 off the right
  let back = null // the black car's way back into traffic, when asked to rejoin
  let follow = createFollow()
  const tread = createTread()
  // The reviews strip, a treadmill (§The treadmill): { x0, y0, x1, y1 } in
  // the hero's px, its speed, px/s, + right, and how far it has moved in
  // all. Null when there's none.
  let belt = null
  let across = null // px/s the car is going across the strip, while it's on it
  let ring = null // { t }: seconds since control started
  const pose = { x: 0, y: 0, a: 0, v: 0 }
  const kin = new Map() // traffic car → its kinematic body
  const knocked = new Map() // car → { body, t, back, fading }
  const blends = new Map() // car → { from, t }: drawn easing into its lane
  const toKnock = new Map() // traffic car → closing speed, knocked after this step
  const impacts = [] // this step's crashes, for the sparks
  const acc = { tyres: [{}, {}] } // particles owed between steps
  const wheels = [{}, {}, {}, {}]
  const axles = { front: 0, rear: 0 }

  // ---------- Walls ---------------------------------------------------------
  // The page's edges. The top one is the page's top, just under the nav when
  // it's scrolled to the top, and further down the page the follow keeps the
  // car below the nav instead (follow.js). Only dynamic bodies touch them,
  // so the traffic drives through to its ways in and out.
  function build() {
    if (walls) world.destroyBody(walls)
    walls = null
    if (leaving) return
    const r = bounds ?? hero
    walls = world.createBody({ type: 'static' })
    walls.setUserData({ kind: 'wall' })
    const m = (x, y) => ({ x: x / k, y: y / k })
    walls.createFixture(new Chain([m(r.x0, r.y0), m(r.x1, r.y0), m(r.x1, r.y1), m(r.x0, r.y1)], true), {
      restitution: CONFIG.player.wallRestitution,
      friction: 0.1,
    })
  }

  // The car back inside the walls, if they've moved in on it.
  function keepIn() {
    if (!player || !walls) return
    const r = bounds ?? hero
    const at = player.body.getPosition()
    const reach = u.length / 2 + 1
    const x = clamp(at.x * k, r.x0 + reach, r.x1 - reach) / k
    const y = clamp(at.y * k, r.y0 + reach, r.y1 - reach) / k
    if (x !== at.x || y !== at.y) player.body.setTransform({ x, y }, player.body.getAngle())
  }

  // Is a car's whole body inside the hero, below the nav?
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
      if (x < hero.x0 + 1 || x > hero.x1 - 1 || y < hero.y0 + 1 || y > hero.y1 - 1) return false
    }
    return true
  }

  // ---------- Traffic as bodies -----------------------------------------------
  // Each traffic car is a kinematic body whose velocity is set every step so
  // it arrives exactly where the traffic code has put it. Teleporting them
  // instead would break planck's contacts. A car that jumped (it came back
  // in at a way in) is moved outright. Only cars in the hero are solid: past
  // its edges they're out of sight, and the car mustn't hit what it can't
  // see. A knocked car has a body of its own.
  function syncTraffic(dt) {
    for (const c of sim.cars) {
      let b = kin.get(c)
      if (!c.active || c.driven || c.x < 0 || c.x > hero.x1 || c.y < 0 || c.y > hero.y1) {
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
        b.setUserData({ kind: 'traffic', car: c })
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

  // ---------- Contacts: knocks and crashes ------------------------------------

  const tag = (body) => body.getUserData() ?? {}

  // Where two bodies touch, the way from the first to the second, and how
  // fast they're closing along it, m/s.
  function hit(contact) {
    const wm = contact.getWorldManifold(null)
    if (!wm || !wm.pointCount) return null
    const p = wm.points[0]
    const n = wm.normal
    const va = contact.getFixtureA().getBody().getLinearVelocityFromWorldPoint(p)
    const vb = contact.getFixtureB().getBody().getLinearVelocityFromWorldPoint(p)
    const speed = Math.max(0, (va.x - vb.x) * n.x + (va.y - vb.y) * n.y)
    return { x: p.x, y: p.y, nx: n.x, ny: n.y, speed }
  }

  // A traffic car touched by a moving body: let this step's contact through
  // and knock it after the step, if the other car is the black car being
  // driven, or anything else closing faster than a nudge. The black car
  // leaving never knocks: it's on its way out, and it's a wall until it
  // isn't solid at all.
  world.on('pre-solve', (contact) => {
    const a = contact.getFixtureA().getBody()
    const b = contact.getFixtureB().getBody()
    const ta = tag(a)
    const tb = tag(b)
    let traffic = null
    let other = null
    if (ta.kind === 'traffic' && b.isDynamic()) {
      traffic = ta
      other = tb
    } else if (tb.kind === 'traffic' && a.isDynamic()) {
      traffic = tb
      other = ta
    } else return
    if (toKnock.has(traffic.car)) {
      contact.setEnabled(false)
      return
    }
    if (other.kind === 'player' && state === 'leaving') return
    const h = hit(contact)
    if (!h) return
    const need = other.kind === 'player' && state === 'driving' ? kc.touch : kc.nudge
    if (h.speed < need) return
    contact.setEnabled(false)
    toKnock.set(traffic.car, h.speed)
  })

  // Every new contact that's hard enough makes sparks.
  world.on('begin-contact', (contact) => {
    if (contact.getFixtureA().isSensor() || contact.getFixtureB().isSensor()) return
    const ta = tag(contact.getFixtureA().getBody())
    const tb = tag(contact.getFixtureB().getBody())
    if (!ta.kind || !tb.kind) return
    const h = hit(contact)
    if (h && h.speed * 3.6 >= fx.sparksKmh) impacts.push(h)
  })

  // A traffic car out of its lane and into the world as a real body, moving
  // as it was.
  function knock(c) {
    const kb = kin.get(c)
    if (kb) {
      world.destroyBody(kb)
      kin.delete(c)
    }
    sim.takeOut(c)
    const { length, width } = CONFIG.car
    const body = world.createBody({
      type: 'dynamic',
      position: { x: c.x / k, y: c.y / k },
      angle: c.a,
      allowSleep: false,
      angularDamping: kc.spin,
    })
    body.createFixture(new Box(length / 2, width / 2), {
      density: CONFIG.player.mass / (length * width),
      friction: 0.3,
      restitution: 0.2,
    })
    const v = c.v / k
    body.setLinearVelocity({ x: Math.cos(c.a) * v, y: Math.sin(c.a) * v })
    body.setUserData({ kind: 'knocked', car: c })
    knocked.set(c, { body, t: 0, back: null, fading: null })
  }

  // After the step: the knocks it brought about, then the sparks.
  function aftermath() {
    for (const c of toKnock.keys()) knock(c)
    toKnock.clear()
    for (const h of impacts) crash(emit, h.x * k, h.y * k, h.nx, h.ny, h.speed, rnd)
    impacts.length = 0
  }

  // ---------- Knocked cars ---------------------------------------------------------

  // Its brakes locked: it slides to a stop.
  function slide(body, dt) {
    const v = body.getLinearVelocity()
    const s = Math.hypot(v.x, v.y)
    if (s < 1e-4) return
    const m = body.getMass()
    const dec = Math.min(kc.friction, s / dt)
    body.applyForceToCenter({ x: (-v.x / s) * dec * m, y: (-v.y / s) * dec * m }, true)
  }

  // Lost, or off the roads: no longer solid, and it fades away.
  function fadeOut(kn) {
    if (kn.fading) return
    kn.fading = { t: 0 }
    kn.back = null
    for (let f = kn.body.getFixtureList(); f; f = f.getNext()) f.setSensor(true)
  }

  // Gone: back to traffic, at an edge, or parked up top under reduced
  // motion, where nothing would bring it in.
  function handBack(c, kn, moving) {
    world.destroyBody(kn.body)
    knocked.delete(c)
    c.fade = 1
    if (moving) sim.sendOff(c)
    else sim.seatInside(c)
  }

  function knockedBefore(dt) {
    for (const kn of knocked.values()) {
      if (kn.back) kn.back.steer(dt)
      else slide(kn.body, dt)
    }
  }

  function knockedAfter(dt, moving) {
    for (const [c, kn] of knocked) {
      const b = kn.body
      const at = b.getPosition()
      const vel = b.getLinearVelocity()
      c.x = at.x * k
      c.y = at.y * k
      c.a = b.getAngle()
      c.v = (vel.x * Math.cos(c.a) + vel.y * Math.sin(c.a)) * k
      kn.t += dt
      if (kn.fading) {
        kn.fading.t += dt
        c.fade = Math.max(0, 1 - kn.fading.t / fx.fade)
        if (kn.fading.t >= fx.fade) handBack(c, kn, moving)
        continue
      }
      if (!kn.back) {
        const still = Math.hypot(vel.x, vel.y) < kc.settleSpeed && Math.abs(b.getAngularVelocity()) < kc.settleSpin
        if (still || kn.t > kc.settleMax) {
          if (inside(c)) kn.back = createRecovery({ sim, car: c, body: b, k, inside })
          else fadeOut(kn)
        }
        continue
      }
      const r = kn.back.check(dt)
      if (r === 'rejoined') {
        world.destroyBody(b)
        knocked.delete(c)
        blends.set(c, { from: kn.back.from, t: 0 })
      } else if (r === 'lost') fadeOut(kn)
    }
  }

  // For the blend's half second, what's drawn eases from where a car was
  // off the lanes to where the traffic has it.
  function applyBlends(dt) {
    for (const [c, bl] of blends) {
      bl.t += dt
      const e = clamp(bl.t / rc.blend, 0, 1)
      const f = e * e * (3 - 2 * e)
      c.x = bl.from.x + (c.x - bl.from.x) * f
      c.y = bl.from.y + (c.y - bl.from.y) * f
      c.a = bl.from.a + wrap(c.a - bl.from.a) * f
      if (e >= 1) {
        blends.delete(c)
        if (c === car && state === 'blending') state = 'done'
      }
    }
  }

  // ---------- Taking over -------------------------------------------------------

  function takeOver() {
    sim.takeOut(car)
    player = createPlayer(world, { x: car.x / k, y: car.y / k, a: car.a }, car.v / k, { mode: telemetry.mode })
    player.body.setUserData({ kind: 'player', car })
    state = 'driving'
    ring = { t: 0 }
    onControl?.()
  }

  // Outside the hero when Drive is pressed: heading in, it just carries on;
  // otherwise it goes off and comes straight back in at a way in (the black
  // car is always first). With the traffic standing still under reduced
  // motion, nothing would bring it in, so it's parked on a street instead.
  // Once it's on its way in, it's waited for: it comes in at the top, where
  // the first stretch of road is partly under the nav, and it can be past
  // the way in before it's wholly in view.
  let entering = false
  function bringIn(moving) {
    if (car.active && inside(car)) return takeOver()
    if (!moving) {
      if (sim.seatInside(car) && inside(car)) takeOver()
      return
    }
    if (car.active && car.piece?.seg && car.piece.from.portal) entering = true
    if (!entering && !car.pending) {
      sim.sendOff(car)
      entering = true
    }
  }

  // ---------- Leaving by the side -------------------------------------------------
  // Driving ended. The car picks the side of the window it can be off
  // soonest, counting both how far it is and how far it has to turn, and
  // drives off it at CONFIG.recovery.leaveKmh. The walls go so it can. Held
  // up by a traffic car for a moment, it stops being solid and drives
  // through, rather than never getting there. It only goes once it's out of
  // sight, and then comes back in at the top of the map (traffic.js).

  function startLeaving() {
    const ang = player.body.getAngle()
    const r = bounds ?? hero
    const v = (rc.leaveKmh / 3.6) * k // px/s
    const cost = (side) => {
      const far = side > 0 ? r.x1 - car.x : car.x - r.x0
      const turn = Math.abs(wrap((side > 0 ? 0 : Math.PI) - ang))
      return far / v + turn / 2
    }
    const side = cost(1) <= cost(-1) ? 1 : -1
    leaving = { side, t: 0, held: 0, ghost: false }
    build()
  }

  function leave(dt) {
    leaving.t += dt
    const body = player.body
    const vel = body.getLinearVelocity()
    const ang = body.getAngle()
    const aimA = leaving.side > 0 ? 0 : Math.PI
    // Along its heading, speeding up or slowing to the leaving speed, and
    // turning for the side as it goes.
    const now = vel.x * Math.cos(ang) + vel.y * Math.sin(ang)
    const want = rc.leaveKmh / 3.6
    const speed = now + clamp(want - now, -CONFIG.player.brake * dt, rc.leaveAccel * dt)
    body.setLinearVelocity({ x: Math.cos(ang) * speed, y: Math.sin(ang) * speed })
    body.setAngularVelocity(clamp(wrap(aimA - ang) * 3, -2.5, 2.5) * clamp(Math.abs(speed) / 4, 0, 1))
    // Held up (a traffic car across its way): not solid any more.
    leaving.held = now < 1 && leaving.t > 0.3 ? leaving.held + dt : 0
    if (leaving.held > rc.leaveHeld && !leaving.ghost) {
      leaving.ghost = true
      for (let f = body.getFixtureList(); f; f = f.getNext()) f.setSensor(true)
    }
  }

  // Out of sight past the side of the window.
  function offSide() {
    const r = bounds ?? hero
    return car.x < r.x0 - u.length || car.x > r.x1 + u.length
  }

  // Gone. It comes back in at a way in, at the top, or under reduced motion,
  // where nothing would bring it, it's parked on a street up top.
  function done(moving) {
    player.dispose()
    player = null
    leaving = null
    back = null
    if (!moving) sim.seatInside(car)
    else sim.sendOff(car)
    state = 'done'
  }

  // ---------- The black car's effects ------------------------------------------------

  function playerEffects(dt) {
    const engine = player.engine
    wheelSpots(car, k, wheels)
    for (const e of engine?.events ?? []) {
      if (e === 'stall') stallSmoke(emit, car, u, rnd)
      else if (e === 'overrev') rearBurst(emit, wheels, rnd)
    }
    // Sliding tyres smoke: a drift, a skid, wheelspin, a locked rear.
    const tyres = player.tyres
    if (tyres.speed > 3) {
      skids(tyres, CONFIG.marks, axles)
      ;[axles.front, axles.rear].forEach((s, i) => {
        if (s <= fx.tyreSmoke) return
        for (let n = due(acc.tyres[i], fx.tyreRate * s, dt); n > 0; n--) {
          const w = wheels[i * 2 + (n % 2)]
          tyreSmoke(emit, w.x, w.y, s, rnd)
        }
      })
    }
  }

  // ---------- The step --------------------------------------------------------

  // moving: whether the traffic moves. Under reduced motion it stands still,
  // and only the visitor's car, and anything it knocks, moves.
  function step(dt, moving) {
    if (state === 'waiting') bringIn(moving)
    controls.step(dt)
    sim.setBodies(player ? [car, ...knocked.keys()] : [...knocked.keys()])
    if (moving) sim.step(dt)
    syncTraffic(dt)
    if (state === 'driving') player.step(dt, controls.now)
    else if (state === 'returning') back.steer(dt)
    else if (state === 'leaving') leave(dt)
    knockedBefore(dt)
    world.step(dt, 8, 3)
    aftermath()
    // On the strip, the strip carries the car: it moves with the reviews,
    // and its own driving is on top of that. What it does to the strip is
    // its speed across it.
    across = null
    if (player && belt) {
      const at = player.body.getPosition()
      const x = at.x * k
      const y = at.y * k
      if (x >= belt.x0 && x <= belt.x1 && y >= belt.y0 && y <= belt.y1) {
        const r = bounds ?? hero
        const reach = u.length / 2 + 1
        const to = walls ? clamp(x + belt.speed * dt, r.x0 + reach, r.x1 - reach) : x + belt.speed * dt
        player.body.setTransform({ x: to / k, y: at.y }, player.body.getAngle())
        across = player.body.getLinearVelocity().x * k
      }
    }
    if (player) {
      player.pose(pose)
      car.x = pose.x * k
      car.y = pose.y * k
      car.a = pose.a
      car.v = pose.v * k
      // Tyre marks and effects, only while it's the visitor's.
      if (state === 'driving' && onMark) tread.lay(car, player.tyres, k, onMark, belt)
      else tread.reset()
      if (state === 'driving') playerEffects(dt)
      const engine = player.engine
      if (engine && state === 'driving') {
        telemetry.gear = engine.gear
        telemetry.rpm = engine.rpm
        telemetry.state = engine.state
        telemetry.speed = pose.v
        telemetry.clutch = controls.now.clutch
        for (const e of engine.events) {
          if (e === 'grind') telemetry.grinds++
          else if (e === 'limiter') telemetry.limits++
        }
      }
    }
    knockedAfter(dt, moving)
    if (state === 'returning') {
      const r = back.check(dt)
      if (r === 'rejoined') {
        player.dispose()
        player = null
        blends.set(car, { from: back.from, t: 0 })
        back = null
        state = 'blending'
      } else if (r === 'lost') done(moving)
    }
    // Only once it's out of sight. leaveMax is a guard that can't be
    // reached: nothing holds a car that isn't solid.
    if (state === 'leaving' && (offSide() || leaving.t > rc.leaveMax)) done(moving)
    applyBlends(dt)
    if (ring) ring.t += dt
  }

  hero = { x0: 0, y0: top, x1: box.width, y1: box.height }
  build()

  return {
    step,
    controls,
    telemetry,
    shift,
    setMode,

    // done only once every car it knocked is back or gone; settling until
    // then, with the black car's part over.
    get state() {
      return state === 'done' && (knocked.size || blends.size) ? 'settling' : state
    },

    // The takeover ring: where the car is and how long since control
    // started, while it's showing.
    get ring() {
      return ring && ring.t < CONFIG.render.ring.life ? { x: car.x, y: car.y, t: ring.t } : null
    },

    // Driving is over: Esc, Stop, or focus gone. The keys stop counting and
    // the car drives off the side of the window, then comes back in at the
    // top. rejoin: make its own way back into the nearest lane instead
    // (recover.js), as the tests and knocked cars do.
    release({ rejoin = false } = {}) {
      input?.dispose()
      input = null
      controls.clear()
      if (state === 'waiting') state = 'done'
      if (state !== 'driving') return
      const inHero = car.x >= hero.x0 && car.x <= hero.x1 && car.y >= hero.y0 && car.y <= hero.y1 + u.length
      if (!rejoin || !inHero) {
        state = 'leaving'
        startLeaving()
        return
      }
      state = 'returning'
      back = createRecovery({ sim, car, body: player.body, k, inside })
    },

    // Another drive, on the same world, while cars from the last one are
    // still settling: the black car is fetched as on the first.
    restart({ mode: next = telemetry.mode, area: el, onControl: control, onExit: exit }) {
      if (state !== 'done') return false
      onControl = control
      onExit = exit
      Object.assign(telemetry, { gear: 'N', rpm: 0, state: 'free', mode: next, clutch: 0, speed: 0 })
      state = 'waiting'
      entering = false
      ring = null
      follow = createFollow()
      tread.reset()
      controls.clear()
      input = listen(el)
      build()
      return true
    },

    // Held keys go when the loop pauses (off screen, hidden tab).
    clearKeys() {
      input?.clear()
    },

    // The page scrolls with the car near the bottom or top of the window
    // (follow.js): the page's scroll to go to after this step. view: the
    // window, measured by the engine: heroTop, px from the window's top to
    // the hero's; top, the nav's bottom; bottom, the window's height;
    // scroll and max, the page's; still, reduced motion.
    follow(dt, view) {
      if (state !== 'driving' || !player) return view.scroll
      return follow.step(dt, {
        y: car.y + view.heroTop,
        vy: player.body.getLinearVelocity().y * k,
        reach: u.length / 2,
        top: view.top,
        bottom: view.bottom,
        scroll: view.scroll,
        max: view.max,
        still: view.still,
      })
    },

    // The visitor scrolled the page themselves.
    holdFollow() {
      follow.hold()
    },

    // The reviews strip, measured by the engine each frame, or null.
    setBelt(next) {
      belt = next
    },

    // How fast the car is going across the strip, px/s, + right, while it's
    // on it; null when it isn't. The strip answers to it.
    get across() {
      return across
    },

    // The hero changed size: new walls if they're the hero's, and the car
    // kept inside them.
    resize(next, nextTop) {
      hero = { x0: 0, y0: nextTop, x1: next.width, y1: next.height }
      clearTraffic()
      if (!bounds) {
        build()
        keepIn()
      }
    },

    // The page changed size, or its walls: { x0, y0, x1, y1 }, hero px.
    setPage(next) {
      const same = bounds && ['x0', 'y0', 'x1', 'y1'].every((key) => Math.abs(next[key] - bounds[key]) < 0.5)
      if (same) return
      bounds = next
      build()
      keepIn()
    },

    // The nav's bottom moved relative to the hero: the page scrolled. With
    // no page (the tests), that's the top wall too.
    setTop(nextTop) {
      if (Math.abs(nextTop - hero.y0) < 0.5) return
      hero.y0 = nextTop
      if (!bounds) {
        build()
        keepIn()
      }
    },

    dispose() {
      input?.dispose()
      input = null
      sim.setBodies([])
      // Anything still out of its lane (the page is going, or the map
      // changed) goes back to traffic by way of an edge.
      for (const [c, kn] of knocked) handBack(c, kn, true)
      blends.clear()
      if (car.driven) sim.sendOff(car)
    },
  }
}
