# Repo Overview (Original Fork Baseline)

> Snapshot of the repository **as it was forked** — commit `6ce3b0d` ("Add files via upload").
> Everything described here is original upstream code. My additions are tracked in [`../MY-CHANGES.md`](../MY-CHANGES.md).

## What this project is

**WBLRMS** — Web-Based Local Road Management System for the Office of the Municipal Engineer, Bayan ng Mabini, Batangas. A Next.js app (exported from Figma Make) for monitoring municipal road infrastructure: road inventory, inspections, maintenance, AI-assisted prioritization, analytics, and user management.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + React 18 + TypeScript 5.5 |
| Styling | Tailwind CSS 3.4, shadcn/ui (Radix primitives), MUI, tw-animate-css |
| Charts | Recharts |
| Database | SQLite via `better-sqlite3` → `data/local-road.sqlite` (auto-created at runtime, not in git) |
| Auth | Custom: scrypt password hashing, login lockout, admin master-password unlock |

## Directory map

```
WBLRMS-Dev/
├── package.json              # scripts: dev / build / start / lint
├── database-schema.sql       # documents the SQLite schema (tables auto-created in code)
├── next.config.js, tailwind.config.js, tsconfig.json, components.json
└── src/
    ├── app/
    │   ├── layout.tsx, page.tsx, globals.css
    │   ├── App.tsx           # main client app: login gate, routing between modules,
    │   │                     #   3-min idle timeout with 30-s warning
    │   ├── api/
    │   │   ├── auth/         # login, status, lock-status, unlock (master password)
    │   │   ├── local-road/   # roads CRUD
    │   │   ├── inspections/  # inspections CRUD
    │   │   ├── maintenance/  # maintenance records CRUD
    │   │   ├── ai-priority/  # maintenance prioritization endpoint
    │   │   └── health/
    │   └── components/
    │       ├── ui/           # ~45 shadcn/ui primitives (button, dialog, table, ...)
    │       ├── LoginPage.tsx
    │       ├── Sidebar.tsx
    │       ├── Dashboard.tsx
    │       ├── LocalRoadList.tsx / LocalRoadForm.tsx   # road inventory (form: 910 lines)
    │       ├── InspectionModule.tsx
    │       ├── MaintenanceModule.tsx
    │       ├── AIPredictionModule.tsx
    │       ├── AnalyticsDashboard.tsx
    │       ├── ReportsModule.tsx
    │       ├── ProjectProgressModule.tsx
    │       ├── UserManagementModule.tsx                # largest module (1,081 lines)
    │       └── SystemArchitecture.tsx
    ├── lib/
    │   ├── local-database.ts # SQLite setup, CRUD helpers, user auth, demo seeding
    │   ├── demo-data.ts      # demo roads + demo users
    │   ├── ai.ts             # rule-based priority scoring (Poor=95, Fair=70, Good=45)
    │   ├── lockout.ts        # failed-login lockout logic
    │   └── master-password.ts# admin unlock code (env ADMIN_UNLOCK_CODE or data/master-password.txt)
    ├── imports/              # logos (Municipality of Mabini)
    └── styles/               # extra css (fonts, theme, tailwind)
```

## Database schema (from `database-schema.sql` / `local-database.ts`)

- `roads(id, data JSON, created_at)`
- `inspections(id, road_id → roads, data JSON, created_at)`
- `maintenance_records(id, road_id → roads, data JSON, created_at)`
- `users(id, name, email, username, password_hash, role, status, created_at)`

Road/inspection/maintenance details are stored as JSON blobs in the `data` column.

## How to run

```bash
npm install
npm run dev     # http://localhost:3000
```

The SQLite database and demo users are seeded automatically on first run.
