import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import './index.css'
import App from './App.jsx'

// During the build-time prerender (scripts/prerender.mjs), Puppeteer sets
// window.__PRERENDER__ before the bundle runs. We skip GSAP plugin registration
// in that mode so the snapshotted HTML contains zero animation-injected
// inline styles or data-* attributes — keeping the static markup clean for
// crawlers and avoiding hydration mismatches in real-user sessions.
if (!window.__PRERENDER__) {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
