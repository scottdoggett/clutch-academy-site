import { useState } from 'react'
import GearSection from '../GearSection'
import './Reverse.css'

const encode = (data) =>
  Object.keys(data)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`)
    .join('&')

export default function Reverse({ onBookNow, isLast = false }) {
  const [status, setStatus] = useState('idle')
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({ 'form-name': 'contact', ...form }),
      })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

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
            <br/>
            All cards accepted
          </p>

          <ul className="reverse__direct">
            <li className="reverse__direct-item">
              <span className="reverse__direct-label">Call</span>
              <a href="tel:+14372231153">(437) 223-1153</a>
            </li>
            <li className="reverse__direct-item">
              <span className="reverse__direct-label">Email</span>
              <a href="mailto:samuel.anthony@clutchacademy.ca">
                samuel.anthony@clutchacademy.ca
              </a>
            </li>
            <li className="reverse__direct-item">
              <span className="reverse__direct-label">Service area</span>
              <span>Toronto</span>
            </li>
          </ul>
        </header>

        {/* RIGHT: contact form */}
        <div className="reverse__contact">
          <div className="reverse__contact-header">
            <p className="section-header__eyebrow">Or send a message</p>
            <h3>Get in Touch</h3>
          </div>

          {status === 'success' ? (
            <p className="reverse__success">
              Thanks! We&apos;ll get back to you within 24 hours.
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <input type="hidden" name="form-name" value="contact" />
              <p hidden>
                <input name="bot-field" onChange={handleChange} />
              </p>
              <div className="reverse__form-row">
                <label>
                  Name
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                  />
                </label>
              </div>
              <label>
                Message
                <textarea
                  name="message"
                  required
                  rows="4"
                  value={form.message}
                  onChange={handleChange}
                />
              </label>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Sending...' : 'Send Message'}
              </button>
              {status === 'error' && (
                <p role="alert">Something went wrong. Please try again.</p>
              )}
            </form>
          )}
        </div>
      </div>
    </GearSection>
  )
}
