# Technical Documentation

ImpactQuest is a Next.js application for running verified social impact missions. This folder documents how the system is built, how data is stored, which rules the code enforces, and how access is protected.

## Contents

| Document | What it covers |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Runtime components, request flows, module map, rendering strategy |
| [DATABASE.md](./DATABASE.md) | Tables, columns, relationships, status values |
| [BUSINESS-RULES.md](./BUSINESS-RULES.md) | Mission lifecycle, verification rules, risk scoring, gamification |
| [SECURITY.md](./SECURITY.md) | Authentication, authorization, evidence protection, known gaps |

## System at a Glance

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 with a dark theme token override |
| Database | Supabase (PostgreSQL), accessed through an `exec_sql` RPC |
| Authentication | Local scrypt password hashing plus session cookies, optional Google OAuth via Supabase Auth |
| Icons | Lucide React |
| Motion | Motion (Framer Motion engine) |
| Charts | Recharts |
| Evidence files | Local disk under `data/evidence/` with SHA-256 hashing |
| End-to-end tests | Playwright Core driving a local Chromium browser |

## Repository Layout

```
app/            Routes, layouts, server actions, and API handlers
components/     Shared UI components
lib/            Domain logic (auth, missions, verification, rewards, impact)
db/             Reference SQL: schema and the exec_sql hardening script
scripts/        Legacy local setup utilities
e2e/            Browser-driven test and audit scripts
data/           Runtime evidence storage (git-ignored)
docs/           This documentation
```

## Reading Order for Reviewers

1. [README](../README.md) for setup and the demo walkthrough.
2. [ARCHITECTURE.md](./ARCHITECTURE.md) to see how a submission moves through the system.
3. [BUSINESS-RULES.md](./BUSINESS-RULES.md) for the rules that prevent unverified rewards.
4. [SECURITY.md](./SECURITY.md) for the access control model and its limits.
5. [DATABASE.md](./DATABASE.md) for the data model.
