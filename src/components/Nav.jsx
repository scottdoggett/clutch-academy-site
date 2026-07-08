'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import BookButton from './BookButton'
import './Nav.css'

// Top-level pages only (08-overhaul-reference §1); the lessons hub links out
// to the four package pages, and the footer lists the full sitemap.
const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Lessons', href: '/manual-driving-lessons' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
]

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="nav" aria-label="Primary">
      <Link
        href="/"
        className="nav__brand"
        aria-label="Clutch Academy — home"
        onClick={() => setMenuOpen(false)}
      >
        <img src="/logo.svg" alt="Clutch Academy" className="nav__logo" />
      </Link>

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
            <Link
              href={link.href}
              className={`nav__link ${pathname === link.href ? 'nav__link--active' : ''}`}
              aria-current={pathname === link.href ? 'page' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <BookButton source="nav" className="nav__book" />
    </nav>
  )
}
