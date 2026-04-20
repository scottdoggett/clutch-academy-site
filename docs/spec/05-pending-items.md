# 05 — Pending Items & Open Decisions

This file is the single source of truth for what is NOT yet known. An AI agent building the site should use this as a checklist for where to place TODOs and placeholder comments.

---

## 📎 Assets Pending from Client

These are items the client (business owner) needs to deliver. Use placeholder comments in HTML: `<!-- PENDING: [ITEM NAME] -->`

### Brand Assets (from marketing package)
- [ ] Logo files (vector preferred — `.svg` or `.ai`)
- [ ] Brand colors (hex codes)
- [ ] Typography choices (or reference examples)
- [ ] Tagline / brand voice guidelines

### Photography
- [ ] Instructor headshot or action photo
- [ ] Photos of the training car (exterior + interior)
- [ ] Any lifestyle / lesson-in-progress photos

### Written Content
- [ ] Instructor bio (~200–300 words)
- [ ] "What to Expect in Your First Lesson" content (teaching progression, topics covered)
- [ ] Final headline choice (3 options provided in `03-content-spec.md`)
- [ ] 4–6 testimonials with permission to publish
- [ ] Exact cancellation / reschedule policy wording
- [ ] Inclusions list (3–5 bullets) for Single Lesson package
- [ ] Inclusions list (3–5 bullets) for 3-Lesson Package
- [ ] Training car make/model for FAQ #8

### Contact Details
- [ ] Phone number
- [ ] Email address (final, depends on email provider decision)
- [ ] Instagram handle / URL
- [ ] Other social media accounts (if any)
- [ ] Specific lesson meetup location in Toronto (address for FAQ #3 and optional map embed)

### Third-Party Accounts
- [ ] Calendly account URL
- [ ] Google Analytics 4 measurement ID (after client creates property)
- [ ] Google Business Profile URL (after verification completes)

---

## ❓ Decisions Still Open

These require a client decision. The agent should use the recommended default and flag the decision for review.

### Hero Headline Direction
- Options: benefit-led / outcome-led / personality-led (see `03-content-spec.md`)
- 🟡 Default: **personality-led** (aligns with instructor positioning)

### Hosting Platform
- Options: Netlify, Vercel, Cloudflare Pages, etc.
- 🟡 Default: **Netlify** (pairs with Netlify Forms)

### Domain Registrar
- Options: GoDaddy, Cloudflare, Namecheap, Porkbun
- 🟡 Default: purchase both `.ca` and `.com`; registrar choice pending

### Email Provider
- Options: Zoho, Google Workspace, Microsoft 365, GoDaddy/Microsoft bundle
- 🟡 Default: **Zoho Mail** (cheapest) or **Google Workspace** (best UX)

### Contact Form Backend
- Options: Netlify Forms, Formspree, Basin, Formspark
- 🟡 Default: **Netlify Forms** (assuming Netlify hosting)

### Calendly Event Types
- Single event type with intake field for package, OR separate event types per package?
- 🟡 Default: assume single URL until client specifies otherwise

### Standalone Pages vs. FAQ Entries
- Cancellation policy: standalone page or FAQ entry only?
- Privacy policy: standalone page required (data is collected)
- Terms of service: optional, skip for V1?
- 🟡 Default:
  - Cancellation policy → FAQ entry only (like DrivingMan does)
  - Privacy policy → standalone page (required)
  - Terms of service → skip V1

### Differentiator Features
- Referral discount / promo code field: maybe, per client note
- Photo gallery / student completions: not mentioned in meeting
- Instagram feed embed: depends on IG activity level
- 🟡 Default for V1: ship without any of these. Add later if client requests.

### Review Platforms to Feature
- Confirmed: Google Business Profile
- Open: Facebook, Yelp, others?
- 🟡 Default: Google only until client specifies

### Analytics Extras
- Meta Pixel for future Facebook/Instagram ads: skip for V1 unless client confirms ad plans
- Conversion tracking beyond GA4 basics: not scoped for V1

### FAQ Gift-Lesson Answer
- Client hasn't confirmed answer wording for FAQ #9 ("Can I buy a lesson as a gift?")
- 🟡 Default suggested: "We don't offer gift certificates, but a friend or family member is welcome to pay on your behalf." Flag for client confirmation.

---

## ⚠️ Critical Flags

These are items that could derail the build if not caught:

### Domain spelling
- Client's original message had a typo ("clucthacademy"). Intended spelling is almost certainly `clutchacademy`. **Verify before any domain purchase.**

### Google Business Profile NAP consistency
- Once GBP is verified, the exact Name, Address (or service area), and Phone on the website MUST match GBP character-for-character. Small inconsistencies can hurt local SEO.

### Launch deadline
- ✅ **May 1, 2026** is stated as a hard deadline. Build plan must accommodate asset delivery delays — scope back features rather than slip the date.

### Payment confusion risk
- Because payment is handled in-person (not at booking), there's a risk of students booking but not showing up with payment ready. Copy needs to make this clear in:
  - The Packages section (line near pricing)
  - The FAQ (question #6)
  - Possibly the Calendly confirmation email (separate setup, but worth flagging)

---

## Agent Workflow for Handling Pending Items

When an agent encounters a pending asset while building:

1. **Add an HTML comment** with the exact pending-item name from this file:
   ```html
   <!-- PENDING: INSTRUCTOR BIO (see 05-pending-items.md) -->
   ```

2. **Use a sensible placeholder** so the page still renders:
   - Text: `[Lorem ipsum dolor sit amet...]` or a bracketed description
   - Images: a neutral placeholder (not a pirated stock photo)
   - Links: `#` with a clearly-commented TODO

3. **Do NOT invent content** that could conflict with client's brand or positioning:
   - ❌ Do not invent the instructor's name or credentials
   - ❌ Do not invent testimonial quotes
   - ❌ Do not invent the training car's make/model
   - ❌ Do not invent cancellation policy terms

4. **Keep a running list** of placeholders used. When delivering the build, output a summary of every `<!-- PENDING: -->` comment so the client knows exactly what to provide.

---

## Delivery Deadline Checklist

To hit May 1, 2026 launch, these milestones should be hit:

| Milestone | Latest date |
|---|---|
| All open decisions resolved | April 22 |
| All pending assets delivered | April 25 |
| Staging build complete | April 27 |
| Client review + revisions | April 28–30 |
| Domain + email live | April 29 |
| Production launch | **May 1** |

⚠️ If any pending asset is still missing by April 25, scope back the affected section (use a minimal placeholder or temporarily hide the section) rather than delay launch.
