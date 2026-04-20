import { useState } from 'react'
import Nav from './components/Nav'
import Home from './components/sections/Home'
import About from './components/sections/About'
import HowItWorks from './components/sections/HowItWorks'
import Packages from './components/sections/Packages'
import Reviews from './components/sections/Reviews'
import Faq from './components/sections/Faq'
import Reverse from './components/sections/Reverse'

const GEAR_TO_ID = {
  1: 'home',
  2: 'about',
  3: 'how-it-works',
  4: 'packages',
  5: 'reviews',
  6: 'faq',
  R: 'book',
}

export default function App() {
  const [currentGear, setCurrentGear] = useState(1)

  // TODO (step 7+): replace with useShiftTransition-driven navigation.
  const handleNavigate = (gear) => {
    setCurrentGear(gear)
    const el = document.getElementById(GEAR_TO_ID[gear])
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  // TODO (step 14): play Reverse shift animation, then open Calendly popup.
  const handleBookNow = () => handleNavigate('R')

  const handleSeePackages = () => handleNavigate(4)

  return (
    <>
      <Nav
        currentGear={currentGear}
        onNavigate={handleNavigate}
        onBookNow={handleBookNow}
      />
      <main>
        <Home onBookNow={handleBookNow} onSeePackages={handleSeePackages} />
        <About onBookNow={handleBookNow} />
        <HowItWorks />
        <Packages onBookNow={handleBookNow} />
        <Reviews />
        <Faq />
        <Reverse onBookNow={handleBookNow} />
      </main>
    </>
  )
}
