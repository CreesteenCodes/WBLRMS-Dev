# WBLRMS Project History

**Last updated:** 2026-10-18

**Scope:** This summary follows the two merged pull requests and adds plain-language explanations. The original uploaded app is described as the starting point, not as work done in those PRs.

## Starting point: the original WBLRMS app

The repository began from the original WBLRMS fork baseline (`6ce3b0d`). It already contained the web interface for managing Mabini local-road projects, inspections, maintenance, reports, analytics, AI priority recommendations, and users.

The original app saved its records in a local SQLite file. That was a problem for Vercel because files on its serverless machines are not reliable long-term storage. The WBLRMS Supabase database already had the tables and workflows needed for the app, so the work focused on connecting the existing interface to Supabase and preparing sample data.

## PR #1 — Move the app from SQLite to Supabase

[PR #1: Migrate data layer from SQLite to Supabase + change-tracking docs](https://github.com/mendozagabii/WBLRMS-Dev/pull/1) — merged on 2026-10-18.

This PR changed where the app stores and retrieves data, while keeping the existing screens working:

- Added `src/lib/supabase.ts` to create Supabase clients and `src/lib/supabase-db.ts` to translate the app's simpler form records into the database's separate tables. For example, the app's road/project form is saved across `roads`, `projects`, and lookup tables such as `barangays`, `project_categories`, and `contractors`.
- Reworked the road, inspection, maintenance, authentication, and health API routes to use Supabase. Their response formats were kept compatible with the existing interface, so the frontend components did not need to be rewritten for the migration.
- Replaced local login handling with Supabase Auth. Username lookup, failed-login lockout, account unlocking, and master-code checks use database functions (RPCs). The old local SQLite demo credentials are not automatically the same as Supabase Auth credentials; sign in with accounts configured in Supabase Auth.
- Moved project attachments to the private `wblrms-files` Storage bucket. When the app reads a file, it returns a temporary signed link that expires after seven days.
- Removed the SQLite database and old local auth helper modules, and added `.env.example` with the required Supabase settings. The service-role key is for server-side code only and must never be exposed to the browser or committed to Git.
- Added documentation describing the original codebase, Supabase schema, Vercel deployment, and post-fork changes.

The PR notes report that `next build` passed and a protected Vercel preview was ready. Production was not changed as part of that review. Vercel Git auto-deploy is disabled, so deployments need to be triggered manually. See the [Vercel deployment reference](VERCEL-DEPLOYMENT.md) for setup details.

## PR #2 — Fix sample SQL and add database test data

[PR #2: WBLRMS seed session: fix missing projects, rebuild SQL, seed inspections](https://github.com/mendozagabii/WBLRMS-Dev/pull/2) — merged on 2026-10-18.

This PR focused on the Supabase records and the SQL used to create sample data:

- Checked the database before seeding. The recorded counts were 10 roads, 4 contractors, 4 user profiles, and 6 projects. Projects 05, 08, 09, and 10 were missing.
- Fixed the SQL for those four projects and inserted them, bringing the recorded project total to 10.
- Prepared a repeatable sample-data script at [`scripts/seed-dummy-data.sql`](../scripts/seed-dummy-data.sql). It covers roads, projects, inspections and their component ratings, maintenance, progress updates, and attachment metadata.
- Corrected SQL syntax problems and split some inserts into smaller files in [`rebuilt_sql/`](../rebuilt_sql/). Smaller batches made the records easier to execute and helped isolate SQL errors.
- The change notes report that 17 inspection rows were inserted in batches, plus one inspection inserted separately. Some inspection rows and all the prepared inspection-item batches were still pending at the last recorded check. Maintenance, progress-update, and attachment inserts were also prepared but were not confirmed as completed.
- Preserved the four existing Supabase user accounts and did not change their authentication passwords during this seeding work.
- Disabled the `sync_road_after_inspection` trigger temporarily after it failed. Its SQL expects old `data` and `road_id` columns that are not present in the current schema. The trigger was disabled rather than deleted so it can be repaired later.

The detailed execution notes are in [`MY-CHANGES.md`](../MY-CHANGES.md). The database review in [`SUPABASE-DB-ANALYSIS.md`](SUPABASE-DB-ANALYSIS.md) is a snapshot from before the app migration; its statements about the repo still using SQLite describe that earlier stage.

## Current handoff notes

- **App and database:** The current API/data layer uses Supabase, not a local SQLite file. For local development or deployment, configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. Keep the service-role key private and server-side.
- **Sample data:** The four missing projects are in place, but the seed work was only partially verified. Check the live database counts before continuing with pending batches.
- **Trigger:** Fix and test `sync_road_after_inspection` before re-enabling it; otherwise, saving an inspection may not update the related road as expected.
- **Seed safety:** `scripts/seed-dummy-data.sql` begins with `TRUNCATE ... CASCADE`, which deletes existing domain data and related rows. Only run it against a safe test database after reviewing the cleanup section.
- **Login:** Use Supabase Auth accounts. If a master unlock code has not yet been configured in the database, the app still has a legacy fallback; set a secure code before real use.
- **AI recommendations:** The current API uses simple condition-based rules; it does not make a live Gemini API call yet, despite some text in the interface mentioning Gemini.

## Related files

- [Original repository overview](REPO-OVERVIEW.md)
- [Supabase database analysis](SUPABASE-DB-ANALYSIS.md)
- [Vercel deployment reference](VERCEL-DEPLOYMENT.md)
- [`MY-CHANGES.md`](../MY-CHANGES.md) — detailed database work and pending items
- [`scripts/seed-dummy-data.sql`](../scripts/seed-dummy-data.sql) — sample data script
