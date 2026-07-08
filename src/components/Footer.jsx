import Link from 'next/link'
import './Footer.css'

// Top-level pages only for now; Phase 3 fills out the full sitemap
// (individual package pages) once those routes exist.
const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Lessons', href: '/manual-driving-lessons' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
]

export default function Footer() {
  return (
    <footer className="footer" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="footer__sr-only">
        Footer
      </h2>

      <div className="footer__grid">
        <div className="footer__col footer__col--brand">
          {/* PENDING: LOGO FILE */}
          <p className="footer__brand">Clutch Academy</p>
          {/* PENDING: TAGLINE */}
          <p className="footer__desc">
            Manual transmission driving lessons in Toronto.
          </p>
        </div>

        <div className="footer__col">
          <h3 className="footer__heading">Contact</h3>
          <ul className="footer__list">
            <li>
              <a href="tel:+14372231153">(437) 223-1153</a>
            </li>
            <li>
              <a href="mailto:hello@clutchacademy.ca">
                hello@clutchacademy.ca
              </a>
            </li>
          </ul>
        </div>

        <nav className="footer__col" aria-label="Footer navigation">
          <h3 className="footer__heading">Explore</h3>
          <ul className="footer__list footer__list--two-col">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__col">
          <h3 className="footer__heading">Follow</h3>
          <ul className="footer__list footer__list--social">
            <li>
              <a
                href="https://www.instagram.com/clutchacademy.ca/"
                aria-label="Instagram"
                rel="noopener noreferrer"
                target="_blank"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/profile.php?id=61569269306023"
                aria-label="Facebook"
                rel="noopener noreferrer"
                target="_blank"
              >
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copy">
          &copy; 2026 Clutch Academy. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
