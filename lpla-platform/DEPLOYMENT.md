# Deployment

This repo is a monorepo with two Vercel projects:

- **Admin** (`lpla-platform/`, Next.js) — Vercel project `locoporlaaventura`
- **Customer** (repo root, Vite) — Vercel project `locoporlaaventura-k1oz3`

Each project uses an `ignoreCommand` in its `vercel.json` so it only rebuilds
when its own files change, which conserves the Hobby-plan build budget:

- Admin builds only when files under `lpla-platform/` change.
- Customer builds only when `src/`, `public/`, `index.html`, `package.json`,
  `vite.config.js`, or `vercel.json` change.

## Triggering a deploy

Vercel builds the **latest commit on `main`**, and the per-project
`ignoreCommand` then decides which project(s) actually rebuild. If a push does
not produce a new deployment, trigger one by pushing a commit through the
GitHub API (which reliably fires the Vercel webhook) or by using a Vercel
Deploy Hook.

> Note: a commit that only changes files outside `lpla-platform/` will not
> rebuild the admin app, and vice-versa. To force an admin rebuild, the commit
> must touch something under `lpla-platform/`.
