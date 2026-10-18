# My Changes Log

> This file tracks **everything added or modified after forking** this repo.
> Anything NOT listed here (and not shown by the git command below) is original upstream code.

- **Fork baseline:** commit `6ce3b0d` ("Add files via upload") on `main`
- **Working branch:** `arena/f362ad88-wblrms-dev`
- **Verify anytime with git:** `git diff 6ce3b0d --stat` (full list of every file I've touched since the baseline)

Entry format: date · type (Added / Changed / Fixed / Removed / Experiment) · files · what & why.

---

## 2026-10-18

### Added — Change-tracking documentation setup
- **Files:** `MY-CHANGES.md` (new), `docs/REPO-OVERVIEW.md` (new)
- **What:** Created this changelog to record every adjustment made after the fork, and a repo overview documenting the original structure as it existed at the baseline commit.
- **Why:** To clearly distinguish my own additions/experiments from the original forked code.

### Added — Supabase database scan & analysis
- **Files:** `docs/SUPABASE-DB-ANALYSIS.md` (new)
- **What:** Connected to the Supabase project "WBLRMS" and scanned the live database (read-only — no changes made to the DB). Documented all 17 tables, 13 enums, 4 views, 22 functions, 34 triggers, RLS policies, storage bucket, and the gap between the DB and the current repo code.
- **Why:** To understand the existing cloud schema before migrating the app off SQLite.

### Added — Vercel deployment identification
- **Files:** `docs/VERCEL-DEPLOYMENT.md` (new)
- **What:** Identified the Vercel project `wblrms-dev` as this repo's deployment (matched Git link + exact production commit SHA = fork baseline `6ce3b0d`). Documented project facts and noted that auto-deploy from Git is disabled and that SQLite cannot persist on Vercel.

### Changed — **MIGRATION: SQLite → Supabase (the big one)**
- **Files added:** `src/lib/supabase.ts` (client factories), `src/lib/supabase-db.ts` (full data-access layer), `.gitignore`, `.env.example`
- **Files removed:** `src/lib/local-database.ts`, `src/lib/lockout.ts`, `src/lib/master-password.ts`, `src/lib/demo-data.ts` (all legacy SQLite/in-memory logic)
- **Files rewritten:** all API routes — `api/local-road`, `api/inspections`, `api/maintenance`, `api/auth/login`, `api/auth/status`, `api/auth/lock-status`, `api/auth/unlock`, `api/health`
- **Dependencies:** removed `better-sqlite3` + `@types/better-sqlite3`; added `@supabase/supabase-js`; package renamed `local-road` → `wblrms`
- **What & how:**
  - Roads/projects: frontend's flat "LocalRoad" records are now mapped onto the normalized `roads` + `projects` tables (with `barangays`, `project_categories`, `contractors` lookups auto-resolved/created by name)
  - Attachments: base64 dataURLs are now uploaded to the private `wblrms-files` storage bucket + `attachments` table; reads return 7-day signed URLs
  - Inspections → `inspections` table (road condition auto-synced by the DB trigger `sync_road_after_inspection`)
  - Maintenance → `maintenance_records` with enum mapping (type/status)
  - Login → Supabase Auth `signInWithPassword` with username→email via `resolve_login_email` RPC; lockout via `register_failed_login` / `is_login_locked` / `unlock_account` RPCs (DB-side, works on serverless)
  - Master code → `verify_master_code` / `set_master_code` RPCs, with env fallback (`ADMIN_UNLOCK_CODE`, default `master123`) until a code is stored in `system_settings`
  - User management → `profiles` table (role enums mapped to display names)
  - All routes marked `force-dynamic`; API contracts/response shapes kept identical so **no frontend component changed**
- **Deployment:** set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` env vars on the Vercel project `wblrms-dev` (all environments)
- **Why:** SQLite files don't persist on Vercel's serverless filesystem; the Supabase schema was already built and waiting (see `docs/SUPABASE-DB-ANALYSIS.md`)
- **Verified:** `next build` passes; all API routes compile as dynamic functions

<!-- New entries go below. Keep newest date sections at the top of the list above this line's section, or simply append — just stay consistent. -->
