'use client'

import { useEffect, useRef } from 'react'
import { CONFIG } from './config.js'
import { hideRule, resolveClearance } from './layout.js'
// Only the wide map sits near the copy; the phone band clears it by
// construction, so its map doesn't need to ship to the client for this.
import wideMap from './layouts/wide.json'
import './HeroStage.css'

// The hero's client side, sitting over the copy. So far it has one job, the
// headline check (docs/spec/hero-drive.md §Keeping clear of the headline):
// measure the copy, and hide any road segment that comes within 48px of it,
// as long as the map still works without it. The traffic, the Drive button
// and the HUD arrive here in later phases.
//
// The server-rendered road layer shows the whole map, which is right at every size
// the tests cover, so this only ever changes anything on unusual screens:
// very short windows, or zoomed type.
export default function HeroStage() {
  const ref = useRef(null)

  useEffect(() => {
    const hero = ref.current?.parentElement
    const copy = hero?.querySelector('.hero__copy')
    const roads = hero?.querySelector('.roads[data-layout="wide"]')
    if (!hero || !copy || !roads) return

    const wide = window.matchMedia(CONFIG.layout.wideQuery)
    let timer = 0
    let live = true
    let warned = ''

    const check = () => {
      if (!live) return
      let hidden = () => false
      let blocked = []
      // Below the wide breakpoint the roads are in their own band under the
      // CTAs, clear of the copy by construction.
      if (wide.matches) {
        const h = hero.getBoundingClientRect()
        const c = copy.getBoundingClientRect()
        const result = resolveClearance(wideMap, {
          width: h.width,
          height: h.height,
          copy: { x0: c.left - h.left, y0: c.top - h.top, x1: c.right - h.left, y1: c.bottom - h.top },
        })
        hidden = hideRule(result.graph)
        blocked = result.blocked
      }
      for (const el of roads.querySelectorAll('[data-piece]')) {
        const { piece, seg, node } = el.dataset
        el.toggleAttribute('data-hidden', hidden({ kind: piece, seg, node }))
      }
      // Once per change, not on every re-check.
      if (blocked.join() !== warned) {
        warned = blocked.join()
        if (!blocked.length) return
        console.warn(
          `Hero roads: ${blocked.join(', ')} come within ${CONFIG.roads.clearance}px of the headline at ` +
            `${Math.round(hero.clientWidth)}×${Math.round(hero.clientHeight)}, and hiding them would break the map.`,
        )
      }
    }

    const later = () => {
      clearTimeout(timer)
      timer = setTimeout(check, CONFIG.layout.resizeDebounce)
    }

    const ro = new ResizeObserver(later)
    ro.observe(hero)
    ro.observe(copy)
    wide.addEventListener('change', check)
    check()
    // next/font can reflow the copy after the first measure.
    document.fonts?.ready.then(check)

    return () => {
      live = false
      clearTimeout(timer)
      ro.disconnect()
      wide.removeEventListener('change', check)
    }
  }, [])

  return <div ref={ref} className="hero__stage" />
}
