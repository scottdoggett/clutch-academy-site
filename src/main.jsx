import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import './index.css'
import App from './App.jsx'
import { loadPixel } from './lib/metaPixel'

// During the build-time prerender (scripts/prerender.mjs), Puppeteer sets
// window.__PRERENDER__ before the bundle runs. We skip GSAP plugin registration
// in that mode so the snapshotted HTML contains zero animation-injected
// inline styles or data-* attributes — keeping the static markup clean for
// crawlers and avoiding hydration mismatches in real-user sessions.
if (!window.__PRERENDER__) {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
  // Returning visitors who already accepted consent: load the Meta Pixel
  // now so the PageView fires on this navigation. First-time visitors load
  // it from ConsentBanner when they click Accept.
  try {
    if (localStorage.getItem('clutch.consent.v1') === 'granted') loadPixel()
  } catch {
    /* localStorage unavailable; skip */
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
