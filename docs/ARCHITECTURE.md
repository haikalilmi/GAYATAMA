# Architecture

## Overview

ImpactQuest is a single Next.js application. It has no separate backend service and no background workers. Every read and write happens inside a server component, a server action, or a route handler.

The database is Supabase (PostgreSQL). Application code does not use the Supabase client for table access. Instead it calls one RPC, `exec_sql(text, jsonb)`, through a thin wrapper in `lib/db.ts` that accepts `?` placeholders and rewrites them to `$1`, `$2`, and so on.

## Runtime Components

| Component | Location | Role |
|---|---|---|
| Root layout | `app/layout.tsx` | Loads the sidebar, reads the current session, applies the saved theme before paint |
| Sidebar | `components/sidebar.tsx` | Primary navigation, role-aware links, theme toggle |
| Route handlers | `app/api/**/route.ts` | Google OAuth callback and protected evidence file delivery |
| Server actions | `app/**/actions.ts` | All mutations: join, submit, review, redeem, admin CRUD |
| Domain logic | `lib/*.ts` | Business rules, validation, and database queries |
| Database wrapper | `lib/db.ts` | Converts placeholder syntax and calls `exec_sql` |

## Request Flow

### Page render

1. A request reaches a server component under `app/`.
2. The component calls a domain function in `lib/` such as `listMissions` or `getCommunityImpact`.
3. That function calls `sql(...)` in `lib/db.ts`.
4. `lib/db.ts` rewrites `?` into `$N` and calls the `exec_sql` RPC.
5. Rows come back as plain objects and are rendered on the server.

### Mutation

1. A form posts to a server action declared in a nearby `actions.ts`.
2. The action reads the session through `getCurrentUser()`. The user identity never comes from the request body.
3. Input is validated with Zod schemas defined in `lib/`.
4. Domain rules run. Invalid operations throw a typed error such as `SubmitError` or `JoinError`, and the action returns that message to the form.
5. On success the action calls `revalidatePath` or `redirect`.

### Evidence upload

1. The contributor submits the evidence form.
2. `submitEvidence` in `lib/submissions.ts` verifies ownership, status, deadline, required fields, and required photos.
3. `storeEvidenceFile` in `lib/evidence.ts` checks the MIME type, file size, and magic bytes, then writes the file to `data/evidence/{userId}/{submissionId}/`.
4. A SHA-256 hash of the file is stored so identical uploads can be detected later.
5. The submission row, impact rows, and evidence rows are written.

## Module Map

### Domain logic in `lib/`

| Module | Responsibility |
|---|---|
| `db.ts` | Supabase client, placeholder rewriting, RPC calls |
| `auth.ts` | Password hashing, session create and destroy, `requireUser` |
| `missions.ts` | Mission listing, mission detail, admin create and update, status transitions |
| `participation.ts` | Join rules, proof code generation, expiry, cancellation |
| `submissions.ts` | Evidence submission, resubmission, submission detail for owners and admins |
| `evidence.ts` | File validation, disk storage, hash computation, path resolution |
| `risk.ts` | Risk scoring and flag generation |
| `verification.ts` | Reviewer queue data, approve, reject, request revision, audit log writes |
| `gamification.ts` | Badge rules and badge awarding |
| `level.ts` | XP thresholds and level titles |
| `rewards.ts` | Reward catalog, redemption, demo code generation |
| `rewards-admin.ts` | Admin reward create and update |
| `impact.ts` | Portfolio, community impact, leaderboard, notifications |
| `campaigns.ts` | Campaign progress and campaign detail |
| `analytics.ts` | Admin analytics aggregates |
| `admin.ts` | Admin dashboard statistics and review queue filters |
| `notifications.ts` | Notification insertion |
| `risk.ts` | Risk scoring |
| `review-constants.ts` | Allowed rejection reasons |
| `mission-constants.ts` | Category, difficulty, and mission type values |

### Routes in `app/`

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page with live impact telemetry |
| `/missions` | Public | Mission catalog with search and filters |
| `/missions/[slug]` | Public | Mission detail and join action |
| `/community` | Public | Aggregate community impact |
| `/leaderboard` | Public | XP ranking |
| `/rewards` | Public | Reward catalog |
| `/login`, `/register` | Public | Authentication |
| `/campaigns/[slug]` | Public | Campaign detail |
| `/dashboard` | Signed in | Personal summary |
| `/my-missions` | Signed in | Participation list with tabs |
| `/my-missions/[id]/submit` | Owner | Evidence upload form |
| `/submissions/[id]` | Owner or admin | Submission detail and audit trail |
| `/submissions/[id]/resubmit` | Owner | Revision upload |
| `/portfolio` | Signed in | Verified impact portfolio |
| `/notifications` | Signed in | Notification list |
| `/rewards/history` | Signed in | Redemption history |
| `/org` | Organization or admin | Campaign overview |
| `/admin` and children | Admin | Verification queue, mission and reward management, analytics |
| `/api/evidence/[id]` | Owner or admin | Serves a stored evidence file |
| `/api/auth/callback` | Public | Google OAuth callback |

## Rendering Strategy

Most pages are server components that read the database on each request, so impact numbers and queue contents are always current. Client components are limited to interactive pieces: forms, the sidebar drawer, the theme toggle, and the analytics chart.

The landing page uses a scroll-driven hero. On desktop the hero is fixed and shrinks using a clip path; on mobile it sits in normal document flow so native scrolling and touch behave correctly.

## Theming

Dark mode is the default. The theme is applied by a small inline script in the root layout before the page paints, so there is no flash of the wrong theme. All colors come from Tailwind tokens, and `app/globals.css` remaps those tokens under the `.dark` class. A few literals are overridden separately where a dark background is also used as a text color, such as buttons that use `bg-slate-900` with white text.

## Development Origin Handling

Next.js 16 blocks dev-only assets and the HMR endpoint from origins other than the one the server started with. `next.config.mjs` sets `allowedDevOrigins` for private network ranges so the dev server can be opened from a phone on the same Wi-Fi. Without it, JavaScript never loads on the phone, React never hydrates, and every button appears unresponsive. This setting only affects development.

## Known Limits

- Approvals and redemptions run as a sequence of separate RPC calls, not one database transaction. A failure partway through can leave partial state. See [SECURITY.md](./SECURITY.md).
- Evidence files live on local disk. This suits a single-machine demo but not a multi-instance deployment.
- Analytics charts render on the client with Recharts.
