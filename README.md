# ImpactQuest

ImpactQuest is a social action platform where people complete real-world positive activities, submit photo evidence, get verified by administrators, and earn XP, impact points, achievement badges, and reward vouchers.

## Why This Exists

This project was built on a simple belief: rewards can be bait for kindness.
Someone may join their first mission just for the points or the voucher —
and that is fine. But after cleaning a neighborhood, planting trees, or
teaching someone something new a few times, the act itself starts to feel
good. The reward gets them through the door; the habit keeps them in the
room. The goal is a world where people do good without needing a reward at
all — ImpactQuest just helps them take the first steps until kindness
becomes second nature.

Public impact numbers combine seeded demo baselines with verified, approved activities. The seeded totals are illustrative, not independently verified real-world impact.

## Quick Start

### Prerequisites
- Node.js 22 or higher (`node:sqlite` needs Node 22+)

### Running for judges (dummy mode, no env needed)

```bash
# 1. Install dependencies
npm install

# 2. Create + seed the local database with dummy accounts
npm run db:setup

# 3. Run the development server (no .env required)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
Login with the demo accounts below. Google login is hidden in this mode.

### Running with Supabase (owner only)

```bash
# 1. Copy .env.example to .env and fill the Supabase block.
# SUPABASE_SERVICE_ROLE_KEY must be a server secret or service_role key.
# Never reuse the anon/public key for this variable.

# 2. Run the development server
npm run dev
```

The app picks its database from `lib/mode.ts`: Supabase/PostgreSQL when the
Supabase env is present, otherwise local SQLite (`DATABASE_PATH`, default
`data/impactquest.db`). `npm run db:setup` / `db:reset` seed the local dummy
database; they do not touch Supabase. The Supabase schema and
`exec_sql(text,jsonb)` RPC must already exist — `db/supabase-hardening.sql`
restricts that RPC to the server role; use a real server key before applying
it to a new environment. Never expose generic SQL execution to `anon` or
`authenticated` roles. Set `NEXT_PUBLIC_DB_MODE=local|supabase` to force a mode.

To access from a mobile phone on the same Wi-Fi network, open `http://<YOUR_LOCAL_IP>:3000` (e.g. `http://192.168.1.19:3000`).

### Production Build

```bash
npm run build
npm run start
```

## Demo Accounts

You can explore the platform using these pre-configured accounts:

| Role | Email | Password | What You Can Do |
|---|---|---|---|
| **Contributor** | `demo@impactquest.local` | `demo1234` | Join missions, upload proof photos, track level & XP, redeem rewards |
| **Admin / Verifier** | `admin@impactquest.local` | `admin1234` | Review incoming submissions, approve/reject/request revision, manage missions & rewards |
| **Organization** | `org@impactquest.local` | `org1234` | View organization campaigns and partner initiatives |

You can also create a new account via the **Sign Up** page. In Supabase mode,
Google OAuth login is also available.

## 5-Minute Quick Demo Walkthrough (dummy mode, no env)

Try opening two different browsers (or one normal window and one incognito window) to see both sides in action:

1. **Contributor Side (Browser 1):**
   - Log in as `demo@impactquest.local` (`demo1234`).
   - Go to **Explore Missions** and click **Clean Your Neighborhood**.
   - Click **Join This Mission** and note the unique proof code shown (e.g. `IQ-ABC123`).
   - Open **My Missions**, click **Submit Evidence**, upload your photo proof, write a brief description, enter the proof code and reported waste amount (e.g. 3 kg), and submit.
   - The status is now **Pending Review**.

2. **Admin Side (Browser 2):**
   - Log in as `admin@impactquest.local` (`admin1234`).
   - The **Admin Portal** tab appears in the sidebar.
   - Go to **Review Queue**, find the submission, and click **Start File Review**.
   - Check the photos, enter the verified amount (3 kg), and click **Approve and Release Rewards**.

3. **Check Results (Browser 1):**
   - Return to the Contributor window.
   - Check **Dashboard**: XP and level updated automatically, notifications received.
   - Check **Rewards**: Points can now be redeemed for demo vouchers.
   - Check **Community**: The total impact numbers reflect the new approved contribution.

## Key Features

- **Evidence-Based Verification**: Every mission requires real photo proof. Submissions go through manual verification before any XP or reward points are released.
- **Role-Based Access**: The Admin Portal is hidden from regular contributors and only accessible after logging in with an authorized admin account.
- **Dark Mode by Default**: Modern dark theme enabled by default with a quick toggle available on both desktop and mobile headers.
- **Mobile-Friendly**: Responsive layout with touch optimization, collapsible sidebar drawer, and quick theme toggle.
- **Gamified Impact Portfolio**: Track personal progress, level progression, unlocked badges, and verified environmental metrics in an audit-ready format.
- **Fraud & Anomaly Detection**: Built-in duplicate photo hash detection, submission velocity checks, and proof code matching to support verifiers during review.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Build the application for production |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint checks |
| `npm run typecheck` | Run TypeScript compiler check |
| `npm run test:e2e` | Run end-to-end automated tests with Playwright |
| `npm run test:regressions` | Run isolated bug regression tests with a mocked database |
| `npm run test:smoke` | Check public pages, role logins and mobile width in a running browser |

Start the server separately before browser tests, e.g. `npm run start -- --port 3185`
after building. Set `E2E_BASE` when using another port and `BROWSER_PATH` if needed.
The legacy `test:e2e` and `e2e/extra.mjs` scripts change demo data, assume a fresh
seed, and contain selectors that need updating for the current UI. They do not
start or reset a server automatically. `test:smoke` does not create submissions
or redeem rewards; login creates sessions and dashboard reads can expire old
participations.

## Project Architecture

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 with custom dark mode theme tokens
- **Database & Auth**: Supabase (PostgreSQL via `exec_sql` RPC) **or** local SQLite dummy mode (`data/impactquest.db`, seeded by `npm run db:setup`) + custom session cookies — switched in `lib/mode.ts`
- **Icons & Motion**: Lucide React + Motion (Framer Motion engine)
- **Charts**: Recharts

## Technical Documentation

Detailed documentation lives in [`docs/`](./docs/):

| Document | What it covers |
|---|---|
| [Architecture](./docs/ARCHITECTURE.md) | Runtime components, request flows, module map, rendering strategy |
| [Database](./docs/DATABASE.md) | Tables, columns, relationships, status values |
| [Business Rules](./docs/BUSINESS-RULES.md) | Mission lifecycle, verification rules, risk scoring, gamification |
| [Security](./docs/SECURITY.md) | Authentication, authorization, evidence protection, known gaps |

## Important Notes

- All reward vouchers and point redemptions are simulated for competition purposes. No real monetary transactions or financial balances are involved.
- All evidence photos uploaded during local development are stored in `data/evidence/` with SHA-256 integrity hashing.
- Organization accounts currently view aggregate campaigns; there is no organization-owned campaign editor or per-organization account mapping.
- Approval and redemption currently use multiple database calls without a single atomic transaction. Concurrent requests and interrupted writes require further database-level hardening before production use.
