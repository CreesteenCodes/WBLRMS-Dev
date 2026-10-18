# Supabase Database Analysis — WBLRMS Project

> Scanned on 2026-10-18 via the Arena Supabase connector.
> Project: **WBLRMS** (`jowcyoziuqzoezxboffx`) · Region: ap-south-1 · Postgres 17 · Status: ACTIVE_HEALTHY
> Other projects in the account (both INACTIVE/paused): "mendozagabii's Project", "ordering-system".

> **Status note:** This is a snapshot of the database review. The finding below that the repo was not yet connected describes the code at the time of that review. The current repo now includes a Supabase-backed data layer; see [Project History](PROJECT-HISTORY.md) and `src/lib/supabase-db.ts`.

## 1. Summary

At the time of this scan, the Supabase database was a **complete, production-grade,
relational schema** for WBLRMS, with 17 tables, 13 enum types, 4 reporting views, 22
functions, 34 triggers, Row Level Security on every table, Supabase Auth integration,
and a private storage bucket.

**Finding at scan time:** the repository was not yet connected to this database and still
used local SQLite storage. This was a point-in-time finding; the current repo now contains
a Supabase-backed data layer, as noted above.

## 2. Tables (public schema)

### Core domain
| Table | Rows | Purpose |
|---|---|---|
| `roads` | 0 | Road inventory: `road_network_id` (unique), name, barangay FK, length_km, width_m, condition, etc. |
| `projects` | 0 | Road projects (28 columns): road FK, category FK, contractor FK, financials (appropriation, contracted_amount, adjusted_project_cost), dates, completion %, status, validation workflow |
| `inspections` | 0 | Inspection header: project FK, date, type, inspector FK, overall score/condition, validation workflow |
| `inspection_items` | 0 | Per-component ratings (child of inspections, unique per inspection+component) |
| `maintenance_records` | 0 | Maintenance: project FK, optional inspection FK, contractor FK, type, schedule, cost, status, validation workflow |
| `project_progress_updates` | 0 | Progress reports: completion %, amount spent, reported_by |
| `attachments` | 0 | File metadata → Supabase Storage paths; exactly-one-parent check (project XOR inspection XOR maintenance) |

### Reference / lookup
| Table | Rows | Purpose |
|---|---|---|
| `barangays` | 34 | Seeded — the 34 barangays of Mabini, Batangas |
| `project_categories` | 5 | Seeded project categories |
| `contractors` | 0 | Contractor registry (name, address, contact, PCAB license) |

### Users, security, system
| Table | Rows | Purpose |
|---|---|---|
| `profiles` | 4 | App users, 1:1 with `auth.users` (FK on id). Auto employee IDs (`EMP-0001` style via sequence). Roles: head_engineer, encoder, inspector, validator |
| `role_module_access` | 14 | Role → module permission matrix |
| `login_attempts` | 0 | Server-side lockout (failed_count, lockout_count, locked_until) |
| `activity_logs` | 21 | Audit trail (jsonb details), auto-populated by triggers |
| `ai_analysis_runs` | 0 | AI run header — model column defaults to **'gemini'** |
| `ai_priority_results` | 0 | Per-project AI results: risk_level, priority_score (0–100 check), justification, recommendation, factors jsonb, accept/dismiss decision workflow |
| `system_settings` | 0 | Key-value settings (likely master code etc.) |

## 3. Enum types (13)

- `user_role`: head_engineer, encoder, inspector, validator
- `account_status`: active, inactive, locked
- `project_status`: planned, on_track, delayed, completed, turned_over
- `validation_status`: pending, approved, rejected
- `inspection_type`: type_acceptance, routine, follow_up, initial
- `road_component`: concrete, asphalt, gravel, earth, shoulder, side_drain, sidewalk
- `condition_rating`: good, fair, poor, bad, n/a · `road_condition`: good, fair, poor, bad
- `maintenance_type`: corrective, preventive, routine, emergency
- `maintenance_status`: scheduled, in_progress, completed
- `risk_level`: high, medium, low · `ai_decision`: pending, accepted, dismissed
- `attachment_category`: project_attachment, turnover_certificate, inspection_photo, maintenance_document

## 4. Views (4)

- `v_project_overview` — joined dashboard view (project + road + barangay + contractor + inspection/maintenance aggregates)
- `v_ai_priority_inputs` — feature set for the AI prioritization
- `v_condition_summary` — condition counts (analytics)
- `v_monthly_maintenance_cost` — cost per month/status (analytics charts)

## 5. Automation (22 functions, 34 triggers)

- **Audit:** `log_activity()` triggers on roads, projects, inspections, maintenance, profiles → `activity_logs`
- **Workflow:** `protect_validation_columns()` (only validators can touch validation fields), `validate_record()` RPC
- **Data sync:** `sync_road_from_inspection()` (inspection updates road condition), `sync_project_progress()` (progress update → project %), `refresh_inspection_summary()` (items → overall score)
- **Auth/lockout RPCs:** `resolve_login_email`, `is_login_locked`, `register_failed_login(p_max_attempts, p_lock_minutes)`, `register_successful_login`, `unlock_account`, `verify_master_code`, `set_master_code`
- **Auth sync:** `handle_new_user` / `create_profile_for_auth_user` (auth.users → profiles)
- **RLS helpers:** `current_user_role`, `has_role(VARIADIC)`, `has_app_role`, `is_active_user`
- Housekeeping: `set_updated_at` on all main tables

## 6. Security posture

- **RLS enabled on all 17 tables**, 51 policies total (role-based: e.g. roads 8 policies, inspections 6, maintenance 6)
- ⚠️ `system_settings` has RLS ON but **0 policies** → inaccessible via the public API (probably intentional: accessed only through SECURITY DEFINER functions like `verify_master_code`)
- **Supabase Auth** in use: 4 users in `auth.users` matching `profiles` (admin/encoder/inspector/validator — same demo set as the repo)
- **Storage:** 1 private bucket `wblrms-files` (matches `attachments.storage_path`)

## 7. Gap analysis at the time of the scan

| Aspect | Repo at scan time | Supabase DB |
|---|---|---|
| Storage engine | SQLite file, JSON blobs | Postgres 17, fully normalized |
| Roads vs projects | One merged "LocalRoad" blob | Separate `roads` + `projects` + lookups |
| Auth | Custom scrypt in `users` table | Supabase Auth + `profiles` + RLS |
| Lockout | File/memory logic in `lockout.ts` | DB RPCs (`register_failed_login`, etc.) |
| Master password | `data/master-password.txt` / env | `verify_master_code` / `set_master_code` RPCs |
| Attachments | Base64 dataURLs inside road JSON | `attachments` table + private storage bucket |
| AI | Rule-based stub in `ai.ts` | `ai_analysis_runs`/`ai_priority_results`, model default **gemini** |
| Audit trail | None | `activity_logs` + triggers |
| Role permissions | Hardcoded in Sidebar/App | `role_module_access` table |
| Analytics | Computed client-side | Prebuilt SQL views |

### Minor observations
- Validator profile's username is an email (`Validator@gmail.com`) while others are plain usernames — inconsistent seed data.
- `activity_logs` already has 21 rows → the DB has been exercised (likely manual testing / seeding).
- All domain tables are empty — no real data yet, safe to experiment.

## 8. Recommendation from the scan

At the time, the recommended next step was to migrate the app from SQLite to this Supabase schema. That connection is now present in the repository; this list is retained as part of the historical review:
1. Add `@supabase/supabase-js`; create `src/lib/supabase.ts` (client) with env vars
2. Replace `local-database.ts` CRUD with Supabase queries against the normalized tables
3. Swap custom auth for Supabase Auth (the lockout/master-code RPCs already exist in the DB)
4. Move attachment uploads to the `wblrms-files` bucket
5. Point Analytics/Dashboard at the `v_*` views
6. Wire the AI module to `ai_analysis_runs` / `ai_priority_results` (and optionally a real Gemini call)
