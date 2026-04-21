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
        <header className="reverse__hero">
          <p className="reverse__eyebrow">Shift into gear</p>
          <h2 className="reverse__headline">
            Ready to drive
            <br />
            stick with confidence?
          </h2>
          <button
            type="button"
            className="btn btn--primary btn--xl"
            onClick={onBookNow}
          >
            Book Your First Lesson
          </button>
          <p className="reverse__payment-note">
            Payment collected in person — cash, e-transfer, or PayPal.
          </p>
        </header>

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
                  rows="5"
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

          <div className="reverse__direct">
            {/* PENDING: PHONE NUMBER */}
            <div className="reverse__direct-item">
              <span className="reverse__direct-label">Call</span>
              <a href="tel:">[pending]</a>
            </div>
            {/* PENDING: EMAIL ADDRESS */}
            <div className="reverse__direct-item">
              <span className="reverse__direct-label">Email</span>
              <a href="mailto:">[pending]</a>
            </div>
            <div className="reverse__direct-item">
              <span className="reverse__direct-label">Service area</span>
              <span>Toronto and the surrounding GTA</span>
            </div>
          </div>
        </div>
      </div>
    </GearSection>
  )
}
