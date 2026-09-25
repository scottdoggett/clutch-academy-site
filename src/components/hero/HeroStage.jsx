'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap, MOTION_OK } from '@/lib/gsap'
import { DUR_BASE, DUR_QUICK, EASE_IN, HERO_SETTLED } from '@/lib/motion'
import { CONFIG } from './config.js'
import DriveButton from './DriveButton'
import { hideRule, resolveMap } from './layout.js'
// Only the wide map sits near the copy; the phone band clears it by
// construction, so its map doesn't need to ship to the client for this.
import wideMap from './layouts/wide.json'
import './HeroStage.css'

// The same failsafe motion.css gives the hero's own entrance, ms. If the
// entrance never reports that it's finished, the traffic goes anyway.
const SETTLE_FAILSAFE = 1500

// Drive needs a keyboard and the wide map (docs/spec/hero-drive.md §Phones,
// touch and reduced motion): a fine pointer that can hover, as the About
// page's shift gate tests for, and 768px up.
const FINE_POINTER = '(hover: hover) and (pointer: fine)'

// The driving display (the speedometer, the dock and the shifter), only
// needed once someone presses Test drive: it loads with the drive chunk, on
// the pill's hover or focus, not with the page. Not React.lazy: that
// suspends on its first render even once loaded, and the dock has to be
// there in the same commit that takes focus from the pill.
const loadHud = () => import('./DriveHud')

// How long the keys show along the bottom when driving starts, ms.
const HINT_FOR = 6000

// The rev arc's full scale, rpm (§HUD): the redline band starts at 7,000.
const REV_MAX = 8000

// The gearbox mode a visitor last picked, remembered in this browser only.
// Storage can be off or full; then it's the default every time.
const MODE_KEY = 'clutch.hero.gearbox'
function savedMode() {
  try {
    const m = localStorage.getItem(MODE_KEY)
    if (m === 'auto' || m === 'manual') return m
  } catch {
    // private window, or storage blocked
  }
  return CONFIG.gearbox.defaultMode
}
function saveMode(m) {
  try {
    localStorage.setItem(MODE_KEY, m)
  } catch {
    // as above: it just won't be remembered
  }
}

// fn, once the page has loaded and the browser has a spare moment, within
// 2s. Safari has no requestIdleCallback, so it gets a short timeout.
function whenIdle(fn) {
  let idle = 0
  let timer = 0
  const go = () => {
    if (window.requestIdleCallback) idle = window.requestIdleCallback(fn, { timeout: 2000 })
    else timer = setTimeout(fn, 200)
  }
  if (document.readyState === 'complete') go()
  else window.addEventListener('load', go, { once: true })
  return () => {
    window.removeEventListener('load', go)
    if (idle) window.cancelIdleCallback(idle)
    clearTimeout(timer)
  }
}

// fn, once the hero's entrance has finished (src/lib/motion.js settleHero):
// at once if it already has, otherwise on its signal or the failsafe.
function whenSettled(hero, fn) {
  if (hero.hasAttribute('data-hero-settled')) {
    fn()
    return () => {}
  }
  let done = false
  const go = () => {
    if (done) return
    done = true
    clearTimeout(timer)
    hero.removeEventListener(HERO_SETTLED, go)
    fn()
  }
  const timer = setTimeout(go, SETTLE_FAILSAFE)
  hero.addEventListener(HERO_SETTLED, go)
  return () => {
    done = true
    clearTimeout(timer)
    hero.removeEventListener(HERO_SETTLED, go)
  }
}

// The hero's client side, sitting over the copy (docs/spec/hero-drive.md
// §Layers). Two jobs so far:
//
// 1. The runtime rules (§Keeping clear of the headline, §Room for a car):
//    measure the copy, and hide any road segment that comes within 48px of
//    it, then any road that leaves a lane too short to hold a car, as long
//    as the map still works without it. The server-rendered road layer
//    shows the whole map, which is right at every size the tests cover, so
//    this only changes anything on unusual screens: very short windows, a
//    phone on its side, or zoomed type.
//
// 2. The traffic (§Ambient traffic). The engine and three.js load as their
//    own chunk once the page is idle, and only where WebGL works. The canvas
//    covers the hero on the wide map and the street band on phones. The cars
//    fade in once, after the hero's entrance, and drive; under reduced
//    motion they're drawn parked and never move.
//
// 3. Test drive (§Play mode). A pill in the bottom-right corner, once the
//    cars are showing, on screens with a keyboard and the wide map.
//    Hovering or focusing it starts loading the drive chunk (planck.js and
//    the car); pressing it hands the black car over. The car can go
//    anywhere on the page (§Driving the whole page), so the canvas and the
//    driving display move into the driving layer, fixed over the window,
//    along the bottom: the speedometer bottom left, the dock in the middle,
//    and the gear shifter bottom right.
//    Focus goes to the dock, and comes back to the pill when driving ends
//    with Esc or Stop.
export default function HeroStage() {
  const ref = useRef(null)
  const engineRef = useRef(null)
  const driveRef = useRef(null)
  const hudRef = useRef(null)
  const hintTimer = useRef(0)
  const refocus = useRef(false)
  const chunk = useRef(null)
  const pillFaded = useRef(false)
  // The driving layer: fixed over the window, over the page and under the
  // nav, made on the first press and kept. The canvas moves into it for a
  // drive, and the gear display renders into it.
  const [layer, setLayer] = useState(null)
  const layerRef = useRef(null)
  // The cars are on screen: faded in, or parked under reduced motion.
  const [shown, setShown] = useState(false)
  // A keyboard, and the wide map. Read on the client only; the server never
  // renders the pill (it waits for the cars), so the two can't disagree.
  const [canDrive, setCanDrive] = useState(
    () => typeof window !== 'undefined' && matchMedia(CONFIG.layout.wideQuery).matches && matchMedia(FINE_POINTER).matches,
  )
  // idle → starting (the chunk loading, or the black car coming in from off
  // screen) → driving → idle.
  const [mode, setMode] = useState('idle')
  const [hint, setHint] = useState(false)
  // What the driving display shows, set only when one of these changes; the
  // speed, the revs and the clutch move every frame through refs instead.
  const [hud, setHud] = useState({ gear: 'N', mode: CONFIG.gearbox.defaultMode, off: false })
  const [grinding, setGrinding] = useState(false)
  const [Hud, setHudComponent] = useState(null)
  const revsRef = useRef(null)
  const redlineRef = useRef(null)
  const speedRef = useRef(null)
  const speedArcRef = useRef(null)
  const clutchRef = useRef(null)
  // The speedometer's full scale, loaded with the display.
  const topKmh = useRef(220)
  const seen = useRef({ hud: null, grinds: 0, limits: 0, flicker: false, kmh: -1, revs: -1, clutch: null })
  const hintFade = useRef(null)
  const grindTimer = useRef(0)

  useEffect(() => {
    const stage = ref.current
    const hero = stage?.parentElement
    const copy = hero?.querySelector('.hero__copy')
    const roads = hero?.querySelector('.roads[data-layout="wide"]')
    const streets = hero?.querySelector('.hero__streets')
    if (!hero || !copy || !roads || !streets) return

    const wide = window.matchMedia(CONFIG.layout.wideQuery)
    let timer = 0
    let live = true
    let warned = ''
    let engine = null
    let mm = null
    // The map the traffic should drive, kept for the engine if it isn't
    // loaded yet.
    let map = null

    const check = () => {
      if (!live) return
      let hidden = () => false
      let blocked = []
      let tight = []
      const h = hero.getBoundingClientRect()
      // Below the wide breakpoint the roads are in their own band under the
      // CTAs, clear of the copy by construction.
      if (wide.matches) {
        const c = copy.getBoundingClientRect()
        const result = resolveMap(wideMap, {
          width: h.width,
          height: h.height,
          copy: { x0: c.left - h.left, y0: c.top - h.top, x1: c.right - h.left, y1: c.bottom - h.top },
        })
        hidden = hideRule(result.graph)
        blocked = result.blocked
        tight = result.tight
        map = { name: 'wide', box: { x: 0, y: 0, width: h.width, height: h.height }, hidden: result.hidden }
      } else {
        const s = streets.getBoundingClientRect()
        map = {
          name: 'compact',
          box: { x: s.left - h.left, y: s.top - h.top, width: s.width, height: s.height },
          hidden: [],
        }
      }
      engine?.setMap(map)
      for (const el of roads.querySelectorAll('[data-piece]')) {
        const { piece, seg, node } = el.dataset
        el.toggleAttribute('data-hidden', hidden({ kind: piece, seg, node }))
      }
      // Once per change, not on every re-check.
      const problem = `${blocked}|${tight}`
      if (problem !== warned) {
        warned = problem
        const at = `${Math.round(hero.clientWidth)}×${Math.round(hero.clientHeight)}`
        if (blocked.length) {
          console.warn(
            `Hero roads: ${blocked.join(', ')} come within ${CONFIG.roads.clearance}px of the headline at ${at}, ` +
              'and hiding them would break the map.',
          )
        }
        if (tight.length) console.warn(`Hero roads: lanes ${tight.join(', ')} are too short to hold a car at ${at}.`)
      }
    }

    const later = () => {
      clearTimeout(timer)
      timer = setTimeout(check, CONFIG.layout.resizeDebounce)
    }

    const ro = new ResizeObserver(later)
    ro.observe(hero)
    ro.observe(copy)
    ro.observe(streets)
    wide.addEventListener('change', check)
    check()
    // next/font can reflow the copy after the first measure.
    document.fonts?.ready.then(check)

    // The traffic. three.js is WebGL2 only.
    const cancelIdle = whenIdle(async () => {
      if (!live || !window.WebGL2RenderingContext) return
      try {
        const { createEngine } = await import('./engine/index.js')
        // React StrictMode unmounts and remounts in development, and the
        // import can resolve after the first cleanup.
        if (!live) return
        engine = createEngine({ hero, host: stage })
      } catch {
        return // the chunk didn't load, or no WebGL after all: the roads stay
      }
      engineRef.current = engine
      if (map) engine.setMap(map)

      // Moving traffic is motion that starts itself, so it only runs with
      // motion allowed (08-motion.md rule 8). Otherwise the engine has
      // already drawn the cars parked, and they just appear.
      let faded = false
      mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        if (!faded) gsap.set(engine.canvas, { autoAlpha: 0 })
        const cancel = whenSettled(hero, () => {
          engine.play()
          setShown(true)
          if (faded) return
          faded = true
          gsap.to(engine.canvas, { autoAlpha: 1, duration: DUR_BASE, ease: EASE_IN })
        })
        // Reduced motion switched on: stand every car back at the start.
        return () => {
          cancel()
          engine.park()
        }
      })
      // Under reduced motion the handler above never runs, and the cars are
      // simply there.
      if (!window.matchMedia(MOTION_OK).matches) setShown(true)
    })

    return () => {
      live = false
      clearTimeout(timer)
      cancelIdle()
      ro.disconnect()
      wide.removeEventListener('change', check)
      mm?.revert()
      engine?.dispose()
      engineRef.current = null
    }
  }, [])

  // The pill fades in with the cars, once.
  const pill = shown && canDrive && mode !== 'driving'
  useEffect(() => {
    const el = driveRef.current
    if (!pill || !el || pillFaded.current) return
    pillFaded.current = true
    const mm = gsap.matchMedia()
    mm.add(MOTION_OK, () => {
      gsap.from(el, { autoAlpha: 0, duration: DUR_BASE, ease: EASE_IN })
    })
  }, [pill])

  // The drive chunk, loaded once, on hover or focus or at the latest on press.
  const prefetch = () => {
    chunk.current ??= Promise.all([import('./drive/index.js'), loadHud()])
      .then(([drive, hudModule]) => {
        setHudComponent(() => hudModule.default)
        topKmh.current = hudModule.TOP_KMH
        return drive
      })
      .catch((err) => {
        chunk.current = null
        throw err
      })
    return chunk.current
  }

  // Driving ends: Esc, Stop, or focus leaving the driving layer. Focus goes
  // back to the pill only if it was still on the dock; tabbing away keeps it
  // where it went.
  // Only refs and state setters inside, so one copy does for the component's
  // whole life, including as the driver's onExit.
  const exit = useCallback(() => {
    refocus.current = !!layerRef.current?.contains(document.activeElement)
    engineRef.current?.stopDrive()
    clearTimeout(hintTimer.current)
    hintFade.current?.revert()
    hintFade.current = null
    setHint(false)
    setMode('idle')
  }, [])

  // The controls hint, for a few seconds: when driving starts, and again
  // when the mode changes, with that mode's keys. Its text changing is what
  // a screen reader announces.
  const flashHint = useCallback(() => {
    clearTimeout(hintTimer.current)
    hintFade.current?.revert()
    hintFade.current = null
    setHint(true)
    hintTimer.current = setTimeout(() => {
      const text = hudRef.current?.querySelector('.drive-hint__text')
      let faded = false
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        if (!text) return
        faded = true
        gsap.to(text, { autoAlpha: 0, duration: DUR_BASE, ease: EASE_IN, onComplete: () => setHint(false) })
      })
      hintFade.current = mm
      if (!faded) setHint(false)
    }, HINT_FOR)
  }, [])

  // A grind: the shifter shakes sideways for a moment, and the numeral goes
  // black. Under reduced motion there's no shake; the numeral holds black
  // for 0.4s instead.
  const grind = useCallback(() => {
    clearTimeout(grindTimer.current)
    setGrinding(true)
    grindTimer.current = setTimeout(() => setGrinding(false), 400)
    const box = layerRef.current?.querySelector('.dash__shifter')
    if (!box) return
    const mm = gsap.matchMedia()
    mm.add(MOTION_OK, () => {
      gsap.fromTo(box, { x: 0 }, { keyframes: { x: [-4, 4, -3, 3, -1, 0], easeEach: 'power2.out' }, duration: 0.3 })
    })
  }, [])

  // Every frame while driving, from the engine: the speed, the revs, the
  // redline's flicker and the clutch lamp written straight to the DOM, each
  // only when it has changed; React state only when the gear, the mode or
  // the engine's state has.
  const onFrame = useCallback(
    (t) => {
      const seenNow = seen.current
      const kmh = Math.round(Math.abs(t.speed) * 3.6)
      if (speedRef.current && kmh !== seenNow.kmh) {
        seenNow.kmh = kmh
        speedRef.current.textContent = kmh
        // The speed's arc is 100 long, filled to its share of the scale.
        speedArcRef.current?.style.setProperty('stroke-dasharray', `${Math.min(100, (kmh / topKmh.current) * 100)} 100`)
      }
      // So is the revs', filled to their share of 8,000.
      const revs = Math.round(Math.min(1, t.rpm / REV_MAX) * 1000) / 10
      if (revsRef.current && revs !== seenNow.revs) {
        seenNow.revs = revs
        revsRef.current.style.strokeDasharray = `${revs} 100`
      }
      const mark = redlineRef.current
      if (mark) {
        seenNow.flicker = t.limits !== seenNow.limits ? !seenNow.flicker : false
        mark.style.opacity = seenNow.flicker ? '0.2' : '1'
      }
      seenNow.limits = t.limits
      const clutch = t.clutch > 0.5
      if (clutchRef.current && clutch !== seenNow.clutch) {
        seenNow.clutch = clutch
        clutchRef.current.toggleAttribute('data-on', clutch)
      }
      const off = t.state === 'stalled' || t.state === 'waiting'
      const prev = seenNow.hud
      if (!prev || prev.gear !== t.gear || prev.mode !== t.mode || prev.off !== off) {
        if (prev && prev.mode !== t.mode) {
          saveMode(t.mode)
          flashHint()
          // The clutch lamp comes and goes with manual: write it afresh.
          seenNow.clutch = null
        }
        seenNow.hud = { gear: t.gear, mode: t.mode, off }
        setHud(seenNow.hud)
      }
      if (t.grinds !== seenNow.grinds) {
        seenNow.grinds = t.grinds
        grind()
      }
    },
    [flashHint, grind],
  )

  const toggleMode = () => {
    engineRef.current?.setDriveMode(hud.mode === 'auto' ? 'manual' : 'auto')
  }

  // Whether this screen can drive, watched live. If it stops being able to
  // mid-drive (the window narrowed to the phone map), driving ends.
  useEffect(() => {
    const wide = window.matchMedia(CONFIG.layout.wideQuery)
    const fine = window.matchMedia(FINE_POINTER)
    const can = () => wide.matches && fine.matches
    const change = () => {
      setCanDrive(can())
      if (!can()) exit()
    }
    wide.addEventListener('change', change)
    fine.addEventListener('change', change)
    return () => {
      wide.removeEventListener('change', change)
      fine.removeEventListener('change', change)
    }
  }, [exit])

  const start = async () => {
    const engine = engineRef.current
    if (mode !== 'idle' || !engine) return
    setMode('starting')
    // One GA4 event per press (docs/spec/05-analytics.md), through the
    // consent-gated gtag like every other event.
    window.gtag?.('event', 'hero_drive')
    let drive
    try {
      drive = await prefetch()
    } catch {
      setMode('idle')
      return
    }
    const gearbox = savedMode()
    seen.current = { hud: null, grinds: 0, limits: 0, flicker: false, kmh: -1, revs: -1, clutch: null }
    setHud({ gear: 'N', mode: gearbox, off: false })
    if (!layerRef.current) {
      const el = document.createElement('div')
      el.className = 'drive-layer'
      document.body.appendChild(el)
      layerRef.current = el
      setLayer(el)
    }
    const ok = engine.startDrive(drive.createDriver, {
      mode: gearbox,
      area: layerRef.current,
      onFrame,
      onControl: () => setMode('driving'),
      onExit: exit,
      onEnd: () => setMode((m) => (m === 'driving' || m === 'starting' ? 'idle' : m)),
    })
    if (!ok) setMode('idle')
  }

  // Driving starts: focus to the dock, in the same commit that swaps the
  // pill for it. The pill had focus, and a later effect would be too late:
  // its removal reads as focus leaving, which ends the drive. The dock is
  // fixed to the window, and the page mustn't jump to either of them.
  useLayoutEffect(() => {
    if (mode === 'driving') hudRef.current?.focus({ preventScroll: true })
  }, [mode])

  // The layer goes with the component.
  useEffect(() => () => layerRef.current?.remove(), [])

  // Then the keys along the bottom for a few seconds. They go in a tick
  // after the dock so the live region is already there and a screen reader
  // announces them.
  useEffect(() => {
    if (mode === 'driving') {
      const show = setTimeout(flashHint, 50)
      // The dock comes in with a short rise and fade, on opacity, not
      // autoAlpha, since it already has focus and a hidden element can't
      // keep it; the speedometer and the shifter rise in the same way.
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        if (hudRef.current) gsap.from(hudRef.current, { opacity: 0, y: 8, duration: DUR_QUICK, ease: EASE_IN, clearProps: 'opacity,transform' })
        const plates = layerRef.current?.querySelectorAll('.dash__panel')
        if (plates?.length) gsap.from(plates, { opacity: 0, y: 8, duration: DUR_QUICK, ease: EASE_IN, clearProps: 'opacity,transform' })
      })
      return () => {
        clearTimeout(show)
        clearTimeout(hintTimer.current)
        mm.revert()
      }
    }
    // Back to the pill, without scrolling the page back up to it from
    // wherever the drive ended.
    if (mode === 'idle' && refocus.current) {
      refocus.current = false
      driveRef.current?.focus({ preventScroll: true })
    }
  }, [mode, flashHint])

  return (
    <div ref={ref} className="hero__stage">
      {pill && <DriveButton ref={driveRef} onPress={start} onPrefetch={prefetch} busy={mode === 'starting'} />}
      {mode === 'driving' &&
        Hud &&
        layer &&
        createPortal(
          <Hud
            ref={hudRef}
            {...hud}
            grinding={grinding}
            hint={hint}
            revs={revsRef}
            redline={redlineRef}
            speed={speedRef}
            speedArc={speedArcRef}
            clutch={clutchRef}
            onToggleMode={toggleMode}
            onExit={exit}
          />,
          layer,
        )}
    </div>
  )
}
