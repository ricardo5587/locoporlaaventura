# Loco Por La Aventura — Event Booking Site

A React + Vite site for browsing events, booking tickets, and signing up to volunteer.

## Project structure

```
public/            static assets (logo, fonts)
src/
  lib/tokens.js     design tokens, event data, helpers
  lib/api.js        form submission helper
  components/       shared UI (navbar, hero, cards, footer, etc.)
  pages/            HomePage, EventDetailPage, ConfirmationPage, VolunteerPage
  App.jsx           top-level routing/state
  main.jsx          entry point
```

## Local development

```bash
npm install
npm run dev
```

## Building for production

```bash
npm run build
npm run preview   # serve the built output locally
```

## Connecting the booking & volunteer forms

The booking and volunteer forms POST to an external form endpoint configured via the
`VITE_FORM_ENDPOINT` environment variable. Without it set, submissions are simulated
(logged to the console) so the site still works for local development.

1. Create a free form endpoint, e.g. with [Formspree](https://formspree.io) or
   [Web3Forms](https://web3forms.com) — sign up and create a form pointed at the
   email address that should receive bookings/volunteer applications.
2. Copy `.env.example` to `.env` and set:
   ```
   VITE_FORM_ENDPOINT=https://formspree.io/f/your-form-id
   ```
3. Rebuild/restart the dev server.

> **Note on payments:** paid events currently just collect attendee info and submit
> it via the form above — no real charge is made. To accept real payments, integrate
> Stripe Checkout (or similar) in `EventDetailPage`'s `handleSubmit`.

## Event data

Events are defined in `src/lib/tokens.js` (`EVENTS` array). To manage events without
editing code, move this data to a headless CMS or a small database-backed API.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import the repo in [Vercel](https://vercel.com/new) — it auto-detects the Vite
   project (build command `npm run build`, output directory `dist`).
3. Add the `VITE_FORM_ENDPOINT` environment variable in the Vercel project settings.
4. Deploy.
