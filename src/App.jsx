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
import Footer from './components/Footer'
import { openCalendly } from './hooks/useCalendly'

const GEAR_TO_ID = {
  1: 'home',
  2: 'how-it-works',
  3: 'packages',
  4: 'about',
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

// After nav-driven navigation, send focus to the landing section's heading
// (or a more specific element for the Reverse booking destination). Critical
// for keyboard + screen-reader users — without this, focus stays on the nav.
const focusSectionLanding = (gear) => {
  const section = document.getElementById(GEAR_TO_ID[gear])
  if (!section) return

  // For the Reverse gear, prefer focusing the dominant Book CTA so the
  // keyboard user lands on the primary action, per spec.
  const target =
    gear === 'R'
      ? section.querySelector('.btn--xl, h2')
      : section.querySelector('h1, h2')

  if (!target) return

  const hadTabindex = target.hasAttribute('tabindex')
  if (!hadTabindex) target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
  if (!hadTabindex) {
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), {
      once: true,
    })
  }
}

export default function App() {
  const [currentGear, setCurrentGear] = useState(1)

  const scrollToGear = (gear, { onComplete } = {}) => {
    setCurrentGear(gear)
    const el = document.getElementById(GEAR_TO_ID[gear])
    if (!el) {
      onComplete?.()
      return
    }

    const afterScroll = () => {
      focusSectionLanding(gear)
      onComplete?.()
    }

    if (prefersReducedMotion()) {
      el.scrollIntoView({ behavior: 'auto' })
      afterScroll()
      return
    }

    // autoKill must stay false: on iOS Safari, the address bar collapses as
    // scrolling begins and fires synthetic scroll events that GSAP would
    // otherwise treat as user input — killing the tween a split-second
    // after it starts.
    gsap.to(window, {
      duration: SCROLL_DURATION,
      scrollTo: { y: el, autoKill: false },
      ease: 'power2.inOut',
      onComplete: afterScroll,
    })
  }

  const handleNavigate = (gear) => scrollToGear(gear)

  // Nav "Book Now": open the Calendly popup immediately, no scroll. All
  // in-section CTAs do the same.
  const handleNavBookNow = () => openCalendly('nav')

  const makeBookHandler = (source) => () => openCalendly(source)

  return (
    <>
      <a href="#home" className="skip-link">
        Skip to content
      </a>
      <Nav
        currentGear={currentGear}
        onNavigate={handleNavigate}
        onBookNow={handleNavBookNow}
      />
      <main id="main">
        <Home
          onBookNow={makeBookHandler('hero')}
          onSeePackages={() => scrollToGear(3)}
        />
        <HowItWorks />
        <Packages
          onBookSingle={makeBookHandler('packages_single')}
          onBookPack={makeBookHandler('packages_3pack')}
        />
        <About onBookNow={makeBookHandler('about')} />
        <Reviews />
        <Faq />
        <Reverse onBookNow={makeBookHandler('reverse')} isLast />
      </main>
      <Footer onNavigate={handleNavigate} />
    </>
  )
}
