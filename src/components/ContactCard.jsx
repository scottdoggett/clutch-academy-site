'use client'

import { trackContact as trackMetaContact } from '../lib/metaPixel'
import { trackContact as trackTiktokContact } from '../lib/tiktokPixel'
import './ContactCard.css'

// Contact-info card, ported from the Reverse section. Each tap fires the
// Meta + TikTok "Contact" intent events (consent-gated — the track calls
// no-op until the pixels are loaded).
function trackContact(method) {
  trackMetaContact(method)
  trackTiktokContact(method)
}

const CHANNELS = [
  {
    label: 'Call',
    href: 'tel:+14372231153',
    text: '(437) 223-1153',
    method: 'phone',
  },
  {
    label: 'Email',
    href: 'mailto:hello@clutchacademy.ca',
    text: 'hello@clutchacademy.ca',
    method: 'email',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/clutchacademy.ca/',
    text: '@clutchacademy.ca',
    method: 'instagram',
    external: true,
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61569269306023',
    text: 'Clutch Academy',
    method: 'facebook',
    external: true,
  },
]

export default function ContactCard() {
  return (
    <div className="contact-card">
      <div className="contact-card__header">
        <p className="section-header__eyebrow">Prefer to reach out?</p>
        <h2>Get in Touch</h2>
      </div>

      <ul className="contact-card__list">
        {CHANNELS.map((c) => (
          <li key={c.method} className="contact-card__item">
            <span className="contact-card__label">{c.label}</span>
            <a
              href={c.href}
              onClick={() => trackContact(c.method)}
              {...(c.external
                ? { rel: 'noopener noreferrer', target: '_blank' }
                : {})}
            >
              {c.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
