# Deployment

This repo is a monorepo with two Vercel projects, both connected to this
GitHub repo and auto-deploying from `main`:

- **Admin** (`lpla-platform/`, Next.js) — Vercel project `locoporlaaventura`,
  Root Directory = `lpla-platform`
- **Customer** (repo root, Vite) — Vercel project `locoporlaaventura-k1oz3`,
  Root Directory = repo root

## How auto-deploy works

A push to `main` fires Vercel's webhook for both projects. Each project's
`ignoreCommand` (in its `vercel.json`) then decides whether that project
actually rebuilds, so a change to one app doesn't burn a build on the other.

A normal `git push origin main` is enough to trigger deploys.

### Commit author must match a Git account (important)

Vercel **blocks** a deployment if the triggering commit's *author* email does
not map to a real Git account (e.g. `noreply@anthropic.com`). The commit's
*committer* email is not checked by Vercel. So commits must be authored with a
real account email:

    git commit --author="Ricardo <ricardo8755@gmail.com>" -m "..."

(The committer may remain whatever the tooling sets; only the author email
needs to match a Git account for Vercel to accept the deploy.)

### ignoreCommand and the Root Directory (important)

Vercel runs the `ignoreCommand` **from the project's Root Directory**, and all
paths are relative to it. For the admin project (Root Directory =
`lpla-platform`) the command must reference the current directory, **not**
`lpla-platform/`:

    git diff --quiet HEAD^ HEAD -- .

Using `-- lpla-platform/` here resolves to `lpla-platform/lpla-platform/`,
which never changes, so `git diff --quiet` always exits 0 — which tells Vercel
to skip the build. That silently CANCELED every admin deployment until it was
fixed. If admin deploys ever start canceling again, check this first.

## Manual deploy (CLI)

Run from the **repo root** (not `lpla-platform/`) so the Root Directory is
applied exactly once, with a Vercel token:

    vercel pull --yes --environment=production --token=$TOKEN
    vercel build --prod --token=$TOKEN
    vercel deploy --prebuilt --prod --token=$TOKEN
