# 04 — Technical Specification

## Stack Overview

| Concern              | Decision                                          | Status         |
| -------------------- | ------------------------------------------------- | -------------- |
| Framework            | **React** (statically bundled single-page app)    | ✅ Decided     |
| Animation library    | **GSAP** (with `@gsap/react` and `ScrollTrigger`) | ✅ Decided     |
| Build tool           | Vite                                              | ✅ Decided     |
| Hosting              | Netlify or Vercel                                 | 🟡 Recommended |
| Booking              | Calendly (popup modal)                            | ✅ Decided     |
| Payment              | None online — in-person only                      | ✅ Decided     |
| Contact form backend | Netlify Forms (recommended)                       | 🟡 Recommended |
| Analytics            | GA4                                               | 🟡 Recommended |
| Domain registrar     | TBD                                               | ❓ Open        |
| Email provider       | TBD                                               | ❓ Open        |

Default to the recommendations above when building. Flag any choice the agent makes so it can be reviewed.

---

## React + GSAP Setup

✅ **Framework: React** | ✅ **Animation: GSAP**

### Recommended project bootstrap

```bash
npm create vite@latest clutch-academy -- --template react
cd clutch-academy
npm install gsap @gsap/react
```

### Required dependencies

| Package | Purpose |
|---|---|
| `react`, `react-dom` | Core framework |
| `gsap` | Animation engine |
| `@gsap/react` | `useGSAP` hook for proper React lifecycle integration |

`ScrollTrigger` ships with the core `gsap` package — register it once at app entry:

```jsx
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
```

### Component architecture

Suggested structure:

```
src/
├── App.jsx              # Top-level — orchestrates gear transitions
├── components/
│   ├── Nav.jsx          # Sticky nav with gear indicator
│   ├── GearSection.jsx  # Wrapper that handles pinning + position
│   ├── GearIndicator.jsx # The circled numeral
│   ├── sections/
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── HowItWorks.jsx
│   │   ├── Packages.jsx
│   │   ├── Reviews.jsx
│   │   ├── Faq.jsx
│   │   └── Reverse.jsx  # Contact form + booking CTAs
│   └── Footer.jsx
├── hooks/
│   └── useShiftTransition.js  # Encapsulates GSAP logic per transition type
└── styles/
    └── tokens.css       # CSS custom properties (colors, type scale)
```

### Animation conventions

All animation code lives inside `useGSAP` hooks for automatic cleanup:

```jsx
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

function Home() {
  const container = useRef();

  useGSAP(() => {
    // Animations scoped to this component are cleaned up on unmount
    gsap.from(".home-heading", { y: 60, opacity: 0, duration: 0.8 });
  }, { scope: container });

  return <section ref={container}>...</section>;
}
```

See `06-design-system.md` for the three transition types (same-column, H-crossing, Reverse) with timing and easing specs.

### SSR / hydration note

This is a client-side React app. GSAP + ScrollTrigger need `window` and run post-hydration — do not attempt SSR for the animated sections. A static Vite build serves pre-rendered HTML for SEO (see SEO section below) while JS takes over for interactivity and animations.

---

## Calendly Integration

✅ **Decided: Calendly is the booking platform.**

🟡 **Recommended: Popup modal integration** (vs. inline embed or external link). Keeps users on site, works on Calendly free tier, clean UX.

### React implementation

Load the Calendly assets once at app entry — in `index.html`:

```html
<!-- public/index.html or equivalent -->
<link
  href="https://assets.calendly.com/assets/external/widget.css"
  rel="stylesheet"
/>
<script
  src="https://assets.calendly.com/assets/external/widget.js"
  type="text/javascript"
  async
></script>
```

Create a reusable hook or utility to trigger the popup from any button:

```jsx
// src/hooks/useCalendly.js
const CALENDLY_URL = "https://calendly.com/CLUTCH_ACADEMY_URL"; // 📎 PENDING

export function openCalendly() {
  if (window.Calendly) {
    window.Calendly.initPopupWidget({ url: CALENDLY_URL });
  }
  return false;
}
```

Then any booking CTA becomes:

```jsx
<button onClick={openCalendly} className="btn btn-primary">
  Book a Lesson
</button>
```

📎 **Pending:** Exact Calendly URL from client.

### Integration with gear-shift animations

When the **Book Now** nav button is clicked, the intended UX is:

1. Play the signature Reverse shift animation (see `06-design-system.md`)
2. After the animation completes, open the Calendly popup

Implementation sketch:

```jsx
function handleBookNowClick() {
  playReverseShift().then(() => openCalendly());
}
```

Other CTAs (Home hero, package cards, in-section buttons) should open Calendly immediately without triggering a shift — the user is already where they need to be.

### Event types

❓ Open question: separate Calendly event types for single lesson vs. 3-pack, or one event type with package-choice as an intake field?

**Agent guidance:** Use one shared URL placeholder for now. If the client later provides separate URLs per package, swap them per-CTA.

### Analytics on booking clicks

Fire a custom GA4 event on any Calendly CTA click — include the source section in the event parameters (e.g., `source: "hero"`, `source: "packages_single"`, `source: "reverse"`).

---

## Contact Form

### Field specs
See `03-content-spec.md` Section 8 for field definitions (Name, Email, Message).

The form lives inside the Reverse section (combined with booking CTAs). See `02-site-architecture.md`.

### Backend: Netlify Forms (recommended)

🟡 Netlify Forms works with React SPAs, but requires a specific setup because Netlify's build scanner needs to find the form markup in the static HTML output.

#### Step 1 — Static form declaration in `index.html`

Add a hidden form to `public/index.html` that Netlify can detect at build time:

```html
<!-- public/index.html -->
<form name="contact" netlify netlify-honeypot="bot-field" hidden>
  <input type="text" name="name" />
  <input type="email" name="email" />
  <textarea name="message"></textarea>
</form>
```

#### Step 2 — React form component

```jsx
// src/components/ContactForm.jsx
import { useState } from "react";

const encode = (data) =>
  Object.keys(data)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`)
    .join("&");

export default function ContactForm() {
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({ "form-name": "contact", ...form }),
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return <p>Thanks! We'll get back to you within 24 hours.</p>;
  }

  return (
    <form name="contact" onSubmit={handleSubmit}>
      <input type="hidden" name="form-name" value="contact" />
      <p hidden><input name="bot-field" onChange={handleChange} /></p>
      <label>Name<input name="name" required onChange={handleChange} /></label>
      <label>Email<input name="email" type="email" required onChange={handleChange} /></label>
      <label>Message<textarea name="message" required rows="5" onChange={handleChange} /></label>
      <button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending..." : "Send Message"}
      </button>
      {status === "error" && <p>Something went wrong. Please try again.</p>}
    </form>
  );
}
```

### Alternatives
- **Formspree** — works well with React, slightly less integrated with Netlify deploy
- **Basin** — similar to Formspree
- **Formspark** — simple, pay-per-use

### Spam protection
- Honeypot field (included in the example above via the hidden `bot-field`)
- Consider reCAPTCHA v3 if spam volume becomes an issue (add later, not V1)

### Success / error handling
- On success: show inline confirmation message. Do not redirect.
- On error: show inline error with retry option. Preserve the user's input.

---

## Hosting & Deployment

### Recommended options

| Option | Cost/year | Notes |
|---|---|---|
| **Netlify** 🟡 | $0 on free tier | Ideal for static sites; free forms, free SSL, easy custom domain, good DX |
| Vercel | $0 on free tier | Similar to Netlify; slightly more dev-oriented |
| Cloudflare Pages | $0 on free tier | Fastest, integrates with Cloudflare DNS |
| GitHub Pages | $0 | Simple but no form backend |

🟡 **Default to Netlify** unless client has a preference. Specifically because it pairs well with Netlify Forms for the contact form.

### SSL
- All recommended hosts provide free auto-renewing SSL. No config needed.
- Ensure the site is only served over HTTPS.

### Custom domain setup
Once domain is purchased:
1. Add custom domain in host's dashboard
2. Point domain's nameservers to host (or add the host's CNAME/A records)
3. Verify DNS propagation (usually <1 hour, can take up to 48)
4. Confirm SSL certificate is issued
5. Set primary domain + redirect the secondary TLD

See `06-domain-email-setup.md` (the original GoDaddy guide) for domain purchase steps. **That file is not in this spec folder — it lives in the original Word docs — but the summary is:** buy both `.ca` and `.com`, pick one as primary, redirect the other.

---

## Domain & Email

❓ **All open.** Client has not yet purchased domain or chosen email provider.

### Domain options

- ❓ Registrar: GoDaddy (considered) vs. Cloudflare (cheaper, no upsells) vs. Namecheap vs. Porkbun
- 🟡 Recommend: register **both** `clutchacademy.ca` AND `clutchacademy.com`, redirect one to the other
- ⚠️ Note: confirm exact spelling with client before purchase (client had a typo in original message)

### Email options

Target: custom address such as `info@clutchacademy.ca` or `hello@clutchacademy.ca`.

| Provider | ~Cost/mo CAD | Best for |
|---|---|---|
| Zoho Mail | Free (up to 5 users) or $1.25 | Cheapest |
| Google Workspace | $8.40/user | Best UX, Gmail-familiar |
| Microsoft 365 (direct) | $8.10/user | If Outlook-preferred |
| GoDaddy Microsoft email | $2.99–$8.99 promo | Convenience (same invoice as domain) |

🟡 Recommend **Zoho Mail** for cost, or **Google Workspace** if client wants a polished Gmail experience.

### Build-side implications

- Email addresses shown on the site (Contact section, footer) should match the final chosen address
- Until email is set up, use a clearly-marked placeholder: `<!-- PENDING: EMAIL ADDRESS -->`
- `mailto:` links should be consistent site-wide

---

## Analytics

🟡 **Recommended setup:**

### Google Analytics 4 (GA4)
- Free, essential
- Add the GA4 gtag script to the `<head>` on every page

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

📎 **Pending:** GA4 measurement ID (client needs to create property)

### Event tracking
Fire custom GA4 events on:
- Any Calendly CTA button click (event name: `booking_cta_click`, include the source section as a parameter)
- Contact form submit (event name: `contact_submit`)
- Phone number click on mobile (event name: `phone_click`)

### Google Business Profile
- ✅ Already in progress (client-side, not agent's job)
- ⚠️ Once verified, agent should ensure NAP (Name, Address, Phone) on the site matches GBP exactly

### Other tracking
- ❓ Meta Pixel — only if client plans paid Facebook/Instagram ads. Skip for V1.
- Calendly's built-in booking analytics runs automatically

---

## Performance Targets

- Lighthouse Performance score ≥ 85 on mobile (slightly relaxed from 90 due to GSAP + React bundle)
- First Contentful Paint < 1.5s on 4G
- Total JS bundle target: < 200KB gzipped (React + GSAP + app code — achievable with Vite's default production optimization)
- All images served as WebP with fallback
- Images lazy-loaded where feasible (note: with pinned sections, traditional lazy-loading needs adjusting — load all above-the-fold gear content eagerly, defer hero imagery below Reverse if any)
- Use `gsap.ticker` not multiple `requestAnimationFrame` loops
- Animations must maintain 60fps on mid-range mobile devices (see `06-design-system.md` performance notes)

---

## SEO Baseline

- Semantic HTML (headings in order: one H1, then H2/H3)
- `<title>` and meta description per page (only one page, so one each)
- Open Graph tags for social sharing:
  - `og:title`, `og:description`, `og:image`, `og:url`
- Canonical URL
- `robots.txt` allowing all
- `sitemap.xml` (auto-generated is fine for a single-page site)
- JSON-LD structured data for **LocalBusiness**:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Clutch Academy",
    "description": "Manual transmission driving lessons in Toronto",
    "areaServed": "Toronto, Ontario",
    "priceRange": "$$",
    "telephone": "PENDING",
    "email": "PENDING",
    "address": { ... }
  }
  ```
- Target keywords for on-page content: "manual driving lessons Toronto", "stick shift lessons Toronto", "learn to drive manual Toronto"

---

## Security & Privacy

### HTTPS
- Required everywhere, no exceptions
- Host provides free certificates; enforce HTTPS redirect

### Privacy Policy
- ⚠️ Required because the site collects data (contact form + analytics)
- Must disclose: what's collected, how it's used, third-party services (GA, Calendly, form backend)
- ❓ Open: standalone page vs. FAQ entry — client decision pending

### Cookie / consent
- GA4 + embedded Calendly set cookies
- Ontario has no specific cookie law, but GDPR-style consent is good practice
- V1 recommendation: include a small cookie notice banner linking to the privacy policy
- Do NOT implement a full consent management platform for V1 (over-engineering)

---

## Build Order Recommendation

If the agent is planning the build sequence, this order minimizes blocker risk:

1. Bootstrap Vite + React project; install GSAP dependencies
2. Set up `tokens.css` with color + type scale from `06-design-system.md`
3. Build the `GearSection` wrapper component (handles pinning + viewport-position alignment)
4. Build `GearIndicator` component (the circled numeral)
5. Build `Nav` component with sticky positioning and quick-shift hooks
6. Scaffold each gear section component with placeholder content
7. Wire up scroll-triggered gear transitions (start with same-column shifts — simplest)
8. Add H-crossing transitions (2→3, 4→5)
9. Add Reverse signature transition
10. Populate confirmed content: Packages (pricing locked), FAQ (most answers known)
11. Populate How It Works Part A (confirmed); leave Part B as placeholder
12. Stub About and Reviews sections with `<!-- PENDING -->` placeholders
13. Build Reverse section: contact form + dominant booking CTA
14. Integrate Calendly (popup + Book Now → Reverse-shift-then-open)
15. Add responsive/mobile simplified-shift mode
16. Implement `prefers-reduced-motion` fallback
17. Add analytics (GA4 + event tracking)
18. Deploy to staging (Netlify)
19. Review with client
20. Swap placeholders for final content as assets arrive
21. Launch

This order front-loads the animation framework and confirmed content, and defers pending-asset-dependent sections so they don't block progress toward the May 1 deadline.
