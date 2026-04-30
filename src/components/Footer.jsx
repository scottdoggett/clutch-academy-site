import './Footer.css'

const QUICK_LINKS = [
  { label: 'Home', gear: 1 },
  { label: 'About', gear: 2 },
  { label: 'How It Works', gear: 3 },
  { label: 'Packages', gear: 4 },
  { label: 'Reviews', gear: 5 },
  { label: 'FAQ', gear: 6 },
  { label: 'Contact', gear: 'R' },
]

export default function Footer({ onNavigate }) {
  const handleClick = (e, gear) => {
    e.preventDefault()
    if (onNavigate) onNavigate(gear)
  }

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
              <a href="tel:+19023183193">+1 (902) 318-3193</a>
            </li>
            <li>
              <a href="mailto:">samanthony@live.ca</a>
            </li>
            <li>Serving Toronto and the GTA</li>
          </ul>
        </div>

        <nav className="footer__col" aria-label="Footer navigation">
          <h3 className="footer__heading">Explore</h3>
          <ul className="footer__list footer__list--two-col">
            {QUICK_LINKS.map((link) => (
              <li key={link.gear}>
                <a href="#" onClick={(e) => handleClick(e, link.gear)}>
                  {link.label}
                </a>
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
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copy">
          &copy; 2026 Clutch Academy. All rights reserved.
        </p>
        <ul className="footer__legal">
          {/* PENDING: CANCELLATION POLICY DESTINATION */}
          <li>
            <a href="#">Cancellation Policy</a>
          </li>
          {/* PENDING: PRIVACY POLICY PAGE */}
          <li>
            <a href="#">Privacy Policy</a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
