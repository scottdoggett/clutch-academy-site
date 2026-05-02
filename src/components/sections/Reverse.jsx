import GearSection from '../GearSection'
import './Reverse.css'

export default function Reverse({ onBookNow, isLast = false }) {
  return (
    <GearSection gear="R" id="book" isLast={isLast}>
      <div className="reverse">
        {/* LEFT: hero pitch + primary book CTA */}
        <header className="reverse__hero">
          <p className="reverse__eyebrow">Shift into gear</p>
          <h2 className="reverse__headline">
            Ready to drive stick with confidence?
          </h2>
          <button
            type="button"
            className="btn btn--primary btn--xl"
            onClick={onBookNow}
          >
            Book Your First Lesson
          </button>
          <p className="reverse__payment-note">
            Payment collected at time of booking, not in person
            <br />
            All cards accepted
          </p>
        </header>

        {/* RIGHT: contact info card */}
        <div className="reverse__contact">
          <div className="reverse__contact-header">
            <p className="section-header__eyebrow">Prefer to reach out?</p>
            <h3>Get in Touch</h3>
          </div>

          <ul className="reverse__contact-list">
            <li className="reverse__contact-item">
              <span className="reverse__contact-label">Call</span>
              <a href="tel:+14372231153">(437) 223-1153</a>
            </li>
            <li className="reverse__contact-item">
              <span className="reverse__contact-label">Email</span>
              <a href="mailto:samuel.anthony@clutchacademy.ca">
                samuel.anthony@clutchacademy.ca
              </a>
            </li>
            <li className="reverse__contact-item">
              <span className="reverse__contact-label">Instagram</span>
              <a
                href="https://www.instagram.com/clutchacademy.ca/"
                rel="noopener noreferrer"
                target="_blank"
              >
                @clutchacademy.ca
              </a>
            </li>
            <li className="reverse__contact-item">
              <span className="reverse__contact-label">Facebook</span>
              <a
                href="https://www.facebook.com/profile.php?id=61569269306023"
                rel="noopener noreferrer"
                target="_blank"
              >
                Clutch Academy
              </a>
            </li>
          </ul>
        </div>
      </div>
    </GearSection>
  )
}
