'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import BookButton from './BookButton'
import './Nav.css'

// Top-level pages only (08-overhaul-reference §1); the lessons hub links out
// to the four package pages, and the footer lists the full sitemap.
// `section` lists the path prefixes a link owns. Lessons owns the hub *and*
// every package page under /lessons/*, so the nav underline stays lit while a
// visitor is reading a package's full details. Defaults to the link's own href.
const NAV_LINKS = [
  { label: 'Home', href: '/' },
  {
    label: 'Lessons',
    href: '/manual-driving-lessons',
    section: ['/manual-driving-lessons', '/lessons'],
  },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
]

// Home ('/') only ever matches exactly — the `p + '/'` guard means it can't
// swallow every route.
function inSection(pathname, link) {
  return (link.section ?? [link.href]).some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
}

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
              className={`nav__link ${inSection(pathname, link) ? 'nav__link--active' : ''}`}
              /* aria-current stays exact: on a package page the visitor is in
                 the Lessons section but not *on* the Lessons hub page. */
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
