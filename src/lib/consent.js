// Single source of truth for the consent-choice storage key used by the app
// bundle (ConsentBanner, AnalyticsLoader). The inline gtag snippet in
// app/layout.jsx and the static public/booked.html page must hardcode the
// same literal — they run outside this bundle. Keep all three in sync.
export const CONSENT_STORAGE_KEY = 'clutch.consent.v1'

// Returns 'granted' | 'denied' | null (not yet decided / storage unavailable)
export function readStoredConsent() {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(CONSENT_STORAGE_KEY)
  } catch {
    return null
  }
}
