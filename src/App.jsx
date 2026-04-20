import { useState } from 'react'
import gsap from 'gsap'
import Nav from './components/Nav'
import Home from './components/sections/Home'
import About from './components/sections/About'
import HowItWorks from './components/sections/HowItWorks'
import Packages from './components/sections/Packages'
import Reviews from './components/sections/Reviews'
import Faq from './components/sections/Faq'
import Reverse from './components/sections/Reverse'
import { openCalendly } from './hooks/useCalendly'

const GEAR_TO_ID = {
  1: 'home',
  2: 'about',
  3: 'how-it-works',
  4: 'packages',
  5: 'reviews',
  6: 'faq',
  R: 'book',
}

// Duration of the GSAP scroll-to tween used for nav quick-shifts and the
// Book Now Reverse-then-Calendly sequence. Longer than a standard smooth scroll
// so the pinned gear transitions play out legibly as scroll passes over them.
const SCROLL_DURATION = 1.4

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function App() {
  const [currentGear, setCurrentGear] = useState(1)

  const scrollToGear = (gear, { onComplete } = {}) => {
    setCurrentGear(gear)
    const el = document.getElementById(GEAR_TO_ID[gear])
    if (!el) {
      onComplete?.()
      return
    }

    if (prefersReducedMotion()) {
      el.scrollIntoView({ behavior: 'auto' })
      onComplete?.()
      return
    }

    gsap.to(window, {
      duration: SCROLL_DURATION,
      scrollTo: { y: el, autoKill: true },
      ease: 'power2.inOut',
      onComplete,
    })
  }

  const handleNavigate = (gear) => scrollToGear(gear)

  // Nav "Book Now": play the full Reverse-shift scroll into place, then open
  // Calendly once the animation settles. All in-section CTAs open immediately.
  const handleNavBookNow = () => {
    scrollToGear('R', { onComplete: () => openCalendly('nav') })
  }

  const makeBookHandler = (source) => () => openCalendly(source)

  return (
    <>
      <Nav
        currentGear={currentGear}
        onNavigate={handleNavigate}
        onBookNow={handleNavBookNow}
      />
      <main>
        <Home
          onBookNow={makeBookHandler('hero')}
          onSeePackages={() => scrollToGear(4)}
        />
        <About onBookNow={makeBookHandler('about')} />
        <HowItWorks />
        <Packages
          onBookSingle={makeBookHandler('packages_single')}
          onBookPack={makeBookHandler('packages_3pack')}
        />
        <Reviews />
        <Faq />
        <Reverse onBookNow={makeBookHandler('reverse')} isLast />
      </main>
    </>
  )
}
