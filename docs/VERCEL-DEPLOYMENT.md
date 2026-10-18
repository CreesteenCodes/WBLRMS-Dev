# Vercel Deployment Reference

> Documented 2026-10-18 via the Arena Vercel connector.

## Project identification

The repo `mendozagabii/WBLRMS-Dev` is deployed as the Vercel project **`wblrms-dev`**.
Identification was confirmed by three matching fingerprints:

1. Project Git link: `org = mendozagabii`, `repo = WBLRMS-Dev`
2. Production branch: `main`
3. The production deployment was built from commit `6ce3b0d622f15...` — the exact fork-baseline commit of this workspace.

## Project facts

| Item | Value |
|---|---|
| Project ID | `prj_lzTrv69E9lGdC41XvVNkiNQUjB04` |
| Team | `gabii0805s-projects` (hobby plan) |
| Live URL | https://wblrms-dev.vercel.app |
| Framework | Next.js · Node 24.x |
| Auto-deploy from Git | **Disabled** (`createDeployments: disabled`) — deploys are triggered manually |
| Env vars (before migration) | none |

## Why the SQLite version can't work on Vercel

Vercel serverless functions have an **ephemeral filesystem** — the `data/local-road.sqlite`
file written by `better-sqlite3` is lost between invocations, so no data persists on the
live site. This is the main motivation for migrating the data layer to Supabase
(see `SUPABASE-DB-ANALYSIS.md`), which pairs correctly with stateless hosting.

## Environment variables required after the Supabase migration

| Name | Purpose |
|---|---|
| `SUPABASE_URL` | `https://jowcyoziuqzoezxboffx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side key used by the API routes (never exposed to the browser) |
| `SUPABASE_ANON_KEY` | Used only for `signInWithPassword` during login |

Set these in Vercel Project Settings → Environment Variables (all environments), and in
a local `.env.local` (never committed) when running `npm run dev` on your machine.
