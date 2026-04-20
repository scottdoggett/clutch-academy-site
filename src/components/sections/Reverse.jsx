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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

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
      <h2>Ready to shift into gear?</h2>

      <button type="button" className="btn btn--primary btn--xl" onClick={onBookNow}>
        Book Your First Lesson
      </button>

      <p className="reverse__payment-note">
        Payment collected in person — cash, e-transfer, or PayPal.
      </p>

      <div className="reverse__contact">
        <h3>Get in Touch</h3>

        {status === 'success' ? (
          <p>Thanks! We'll get back to you within 24 hours.</p>
        ) : (
          <form name="contact" onSubmit={handleSubmit} noValidate>
            <input type="hidden" name="form-name" value="contact" />
            <p hidden>
              <input name="bot-field" onChange={handleChange} />
            </p>
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
          <p>
            Phone: <a href="tel:">[pending]</a>
          </p>
          {/* PENDING: EMAIL ADDRESS */}
          <p>
            Email: <a href="mailto:">[pending]</a>
          </p>
          <p>Serving Toronto and the surrounding GTA.</p>
        </div>
      </div>
    </GearSection>
  )
}
