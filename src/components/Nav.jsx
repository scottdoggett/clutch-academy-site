import { useState } from 'react'
import './Nav.css'

const NAV_LINKS = [
  { label: 'Home', href: '#home', gear: 1 },
  { label: 'About', href: '#about', gear: 2 },
  { label: 'Packages', href: '#packages', gear: 4 },
  { label: 'Reviews', href: '#reviews', gear: 5 },
  { label: 'FAQ', href: '#faq', gear: 6 },
  { label: 'Contact', href: '#book', gear: 'R' },
]

export default function Nav({ currentGear = 1, onNavigate, onBookNow }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleClick = (e, gear) => {
    e.preventDefault()
    setMenuOpen(false)
    if (onNavigate) onNavigate(gear)
  }

  const handleBookNow = (e) => {
    e.preventDefault()
    setMenuOpen(false)
    if (onBookNow) onBookNow()
  }

  return (
    <nav className="nav" aria-label="Primary">
      <a href="#home" className="nav__brand" onClick={(e) => handleClick(e, 1)}>
        {/* PENDING: LOGO FILE */}
        Clutch Academy
      </a>

      <button
        className="nav__toggle"
        aria-expanded={menuOpen}
        aria-controls="nav-menu"
        aria-label="Toggle navigation menu"
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
      </button>

      <ul
        id="nav-menu"
        className={`nav__menu ${menuOpen ? 'nav__menu--open' : ''}`}
      >
        {NAV_LINKS.map((link) => (
          <li key={link.href} className="nav__item">
            <a
              href={link.href}
              className={`nav__link ${currentGear === link.gear ? 'nav__link--active' : ''}`}
              aria-current={currentGear === link.gear ? 'true' : undefined}
              onClick={(e) => handleClick(e, link.gear)}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <button className="nav__book" onClick={handleBookNow}>
        Book Now
      </button>
    </nav>
  )
}
