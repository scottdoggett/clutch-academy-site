'use client'

import { usePathname } from 'next/navigation'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { CONDITIONS, applyMotion, playHero } from '@/lib/motion'

// The one motion runtime (docs/spec/08-motion.md §Implementation), mounted
// once in layout.jsx. Finds every [data-anim] in <main> and applies its type,
// plays the hero timeline if the page has one, and tears it all down on the
// next route change. Pages opt in with attributes and stay server components.
//
// Everything runs inside gsap.matchMedia() under CONDITIONS.motion, so with
// prefers-reduced-motion nothing is set up and the page is simply there.
export default function SiteMotion() {
  const pathname = usePathname()

  useGSAP(
    () => {
      const main = document.querySelector('main')
      if (!main) return
      const mm = gsap.matchMedia()

      mm.add(CONDITIONS, (ctx) => {
        const { motion, small, desktop } = ctx.conditions
        if (!motion) return
        const opts = { small, desktop }

        applyMotion(main, opts)

        // The hero plays on load. If the page took longer than the CSS
        // failsafe (1.5s) to hydrate, the hero is already showing — leave it
        // rather than hide it again and replay.
        const hero = main.querySelector('[data-hero-root]')
        const late =
          document.documentElement.dataset.motion === 'ok' &&
          !document.documentElement.hasAttribute('data-motion-ready') &&
          performance.now() > 1500
        if (hero && !late) playHero(hero, opts)

        // next/font can change line heights after first measure.
        document.fonts?.ready.then(() => ScrollTrigger.refresh())
      })

      // Same frame as the hero's first fromTo: hands its starting states from
      // motion.css over to GSAP without a paint in between.
      document.documentElement.setAttribute('data-motion-ready', '')

      return () => mm.revert()
    },
    { dependencies: [pathname], revertOnUpdate: true },
  )

  return null
}
