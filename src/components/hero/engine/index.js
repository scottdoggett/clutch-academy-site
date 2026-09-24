/* global process -- Next replaces process.env.NODE_ENV at build time */

// The ambient chunk (docs/spec/hero-drive.md §Loading and performance):
// three.js, the traffic and the loop that drives them. HeroStage imports
// this lazily, after the page has loaded and gone idle, and only where WebGL
// works, so none of it is on the page's critical path.
//
// The engine is told three things from outside: which map and where it is
// (setMap, from HeroStage's debounced resize check, which also knows which
// segments the runtime rules have hidden), and whether it may move (play)
// or must stand still at the seeded start (park). It pauses on its own when
// the hero is off screen or the tab is hidden.
//
// From Phase 4 it can also hand the black car to a visitor: startDrive()
// takes a driver from the drive chunk (drive/index.js), which it never
// imports itself, so the ambient chunk stays free of planck. While there's
// a driver, its step replaces the traffic's own, and the loop runs even
// under reduced motion, since driving is something the visitor chose.

import { CONFIG } from '../config.js'
import { buildGraph } from '../graph.js'
import { LAYOUTS } from '../layouts/index.js'
import { createRenderer } from './render.js'
import { carCount, createTraffic } from './traffic.js'

// A colour token as [r, g, b] in 0–1, straight sRGB, as the shader writes it.
function token(style, name) {
  const hex = style.getPropertyValue(name).trim().replace('#', '')
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex
  if (!/^[0-9a-f]{6}$/i.test(full)) return null
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
}

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)

// Colours from the tokens, so tokens.css stays the only source. Traffic
// glass is darker than its blue; the black car's has to be lighter than its
// body, a dark grey, or its windows vanish.
function readColors() {
  const style = getComputedStyle(document.documentElement)
  const black = token(style, '--black') ?? [0.04, 0.04, 0.04]
  const blue = token(style, '--car-traffic') ?? [0.14, 0.34, 0.77]
  const cream = token(style, '--cream') ?? [0.99, 0.97, 0.95]
  const { glass } = CONFIG.render
  return {
    traffic: { body: blue, glass: mix(blue, black, glass.traffic) },
    black: { body: black, glass: mix(black, [1, 1, 1], glass.black) },
    lamp: cream,
  }
}

// hero: the hero section, watched to pause the loop when it's off screen.
// host: the element the canvas goes in, over the copy.
export function createEngine({ hero, host }) {
  const canvas = document.createElement('canvas')
  canvas.className = 'hero__cars'
  canvas.setAttribute('aria-hidden', 'true')
  host.appendChild(canvas)

  let renderer
  try {
    renderer = createRenderer(canvas, readColors())
  } catch (err) {
    canvas.remove()
    throw err
  }

  const { step, maxSteps } = CONFIG.world
  let map = null // { name, layout, box, hidden, graph, count }
  let sim = null
  let playing = false
  let onScreen = true
  let raf = 0
  let last = 0
  let spare = 0
  let disposed = false
  let debug = null
  let driver = null

  const draw = () => sim && renderer.draw(sim.cars, driver?.ring, !playing)

  const running = () => (playing || driver) && onScreen && !document.hidden && !disposed && !renderer.lost

  // One fixed step of everything: the driver's, which steps the traffic
  // itself when it may move, or the traffic's alone.
  function tick() {
    if (!driver) return sim.step(step)
    driver.step(step, playing)
    if (driver.state === 'done') endDrive()
  }

  // Where the top wall goes: the bottom of the fixed nav, in hero px.
  function navTop() {
    const nav = document.querySelector('.nav')
    if (!nav) return 0
    return Math.max(0, nav.getBoundingClientRect().bottom - hero.getBoundingClientRect().top)
  }
  const onScroll = () => driver?.setTop(navTop())

  let onEnd = null
  let onFrame = null

  function endDrive() {
    driver?.dispose()
    driver = null
    onFrame = null
    onEnd?.()
    onEnd = null
    window.removeEventListener('scroll', onScroll)
    sync()
  }

  function frame(now) {
    raf = 0
    if (!running()) return
    // No catching up after a pause or a slow frame: at most maxSteps steps.
    spare += last ? Math.min((now - last) / 1000, step * maxSteps) : 0
    last = now
    for (let n = 0; spare >= step && n < maxSteps; n++) {
      tick()
      spare -= step
    }
    draw()
    if (driver) onFrame?.(driver.telemetry)
    raf = requestAnimationFrame(frame)
  }

  // Start or stop the loop to match the state. A restart begins a fresh
  // clock, so a pause never shows up as a jump.
  function sync() {
    if (running() && !raf && sim) {
      last = 0
      spare = 0
      driver?.clearKeys()
      raf = requestAnimationFrame(frame)
    } else if (!running() && raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }

  const io = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting
    sync()
  })
  io.observe(hero)
  document.addEventListener('visibilitychange', sync)

  // Cars placed where the seeded start puts them, stopped.
  function reset() {
    if (!map) return
    sim = createTraffic(map.graph, map.layout, { count: map.count })
    renderer.setCar(sim.units.length, sim.units.width)
    draw()
  }

  const engine = {
    canvas,

    // name: 'wide' or 'compact'. box: where the layout's box is inside the
    // hero, CSS px. hidden: segments the headline check has taken out.
    setMap({ name, box, hidden = [] }) {
      if (disposed || box.width <= 0 || box.height <= 0) return
      Object.assign(canvas.style, {
        left: `${box.x}px`,
        top: `${box.y}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
      })
      const key = hidden.join()
      const same = map && map.name === name
      if (same && map.box.width === box.width && map.box.height === box.height && map.key === key) {
        map.box = box
        return
      }
      const layout = LAYOUTS[name]
      const graph = buildGraph(layout, { width: box.width, height: box.height, hidden })
      const count = carCount(layout, box.width, box.height)
      map = { name, layout, box, key, graph, count }
      renderer.resize(box.width, box.height)
      // A new map starts over from the seeded start; the same map at a new
      // size keeps every car on its lane, as far along it. Driving ends if
      // the map changes (there's no driving on the phone map), and carries
      // on inside new walls if it's only resized.
      if (same && sim) {
        sim.rescale(graph, count)
        driver?.resize(box, navTop())
      } else {
        if (driver) endDrive()
        reset()
      }
      draw()
      sync()
    },

    play() {
      playing = true
      sync()
    },

    // Stop and stand every car at the seeded start (reduced motion). Mid
    // drive, the traffic just stands where it is, and the visitor's car
    // carries on.
    park() {
      if (disposed) return
      playing = false
      sync()
      if (!driver) reset()
    },

    // Hand the black car to a visitor. makeDriver is createDriver from the
    // drive chunk. onControl: the car is theirs (straight away, or once it
    // has come in from off screen). onExit: Esc, or focus leaving the hero;
    // the caller ends the drive with stopDrive(). onEnd: the car is back in
    // traffic, or the drive was cut short (the map changed). onFrame: called
    // with the driver's telemetry after every frame drawn, for the gear
    // display. mode: the gearbox's, 'auto' or 'manual'.
    startDrive(makeDriver, { mode, onControl, onExit, onEnd: ended, onFrame: frameHook }) {
      if (disposed || !sim || map?.name !== 'wide' || driver) return false
      onEnd = ended
      onFrame = frameHook
      driver = makeDriver({
        sim,
        k: sim.units.pxPerM,
        box: map.box,
        top: navTop(),
        hero,
        mode,
        onControl,
        onExit,
      })
      window.addEventListener('scroll', onScroll, { passive: true })
      sync()
      return true
    },

    // The visitor is done. The car finds its own way back into traffic, and
    // the driver goes once it has.
    stopDrive() {
      driver?.release()
    },

    get driving() {
      return driver?.state === 'driving'
    },

    // The gear display's Auto / Manual switch.
    setDriveMode(next) {
      driver?.setMode(next)
    },

    dispose() {
      if (disposed) return
      disposed = true
      if (driver) endDrive()
      sync()
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      renderer.dispose()
      canvas.remove()
      if (debug && window.__heroEngine === debug) delete window.__heroEngine
    },
  }

  // Development only: the automation tab Claude checks the hero in is
  // hidden, so requestAnimationFrame never fires there. This advances and
  // draws the traffic by hand: window.__heroEngine.step(5) for 5 seconds.
  if (process.env.NODE_ENV !== 'production') {
    debug = {
      step(seconds = 1) {
        for (let t = 0; t < seconds && sim; t += step) tick()
        draw()
        if (driver) onFrame?.(driver.telemetry)
        return sim?.time
      },
      get driver() {
        return driver
      },
      get sim() {
        return sim
      },
      get map() {
        return map
      },
      engine,
    }
    window.__heroEngine = debug
  }

  return engine
}
