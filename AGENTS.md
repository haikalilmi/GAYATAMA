# AGENTS.md — ImpactQuest Coding Agent Instructions

## 1. Project Identity

This repository contains **ImpactQuest**, a competition prototype for a gamified social impact platform.

Users join structured social missions, submit evidence, receive human verification, earn XP and Impact Points, build a verified impact portfolio, and redeem simulated prototype rewards.

The project must prioritize:

1. Correct business logic
2. Stable end-to-end demo
3. Clear UX
4. Security appropriate for a prototype
5. Maintainable code
6. Competition readiness

---

# 2. Required Reading

Before implementing a task, read the relevant project documentation.

At minimum inspect:

```text
docs/PRD.md
docs/BUSINESS_RULES.md
docs/DATABASE.md
```

When relevant also inspect:

```text
docs/IMPLEMENTATION_PLAN.md
```

Do not make assumptions that contradict these documents.

---

# 3. Architecture

Use:

> Modular monolith

Do not create microservices.

Keep business domains logically separated inside one application.

Core domains:

```text
Authentication
Mission
Participation
Submission
Verification
Gamification
Impact
Rewards
Campaigns
Administration
```

---

# 4. Approved Stack

Default stack:

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
SQLite via node:sqlite (fully local, zero dependencies)
Local session auth (scrypt + httpOnly cookies)
Local filesystem evidence storage
Zod
Recharts
```

Do not add new infrastructure or major dependencies without a concrete need.

---

# 5. Dependency Discipline

Before adding a dependency:

1. Check whether the current stack already solves the problem.
2. Prefer platform/browser/Next.js capabilities.
3. Add only maintained, necessary libraries.
4. Explain why a new dependency is needed.

Do not introduce:

- Express backend
- Separate API server
- Redis
- Docker requirement
- Message queue
- Microservices
- Blockchain
- AI service

unless explicitly requested.

---

# 6. Prototype Scope

The following should be implemented:

- Authentication
- Role-based access
- Mission browsing
- Mission joining
- Proof code
- Participation expiry
- Evidence upload
- Submission
- Exact duplicate hashing
- Rule-based risk indicators
- Human verification
- Revision
- Rejection
- Approval
- XP
- Levels
- Impact Points
- Badges
- Notifications
- Verified impact
- Impact portfolio
- Community impact
- Leaderboard
- Dummy rewards
- Reward redemption
- Mission management
- Basic analytics

---

# 7. Explicitly Out of Scope

Do not implement unless explicitly instructed:

- Real payment gateway
- Real money transfer
- Bank account integration
- E-wallet
- Withdraw
- KYC
- Real wallet
- Crypto
- Blockchain
- AI final verification
- AI auto-approval
- AI auto-rejection
- Social feed
- Likes
- Comments
- Followers
- Chat
- Video evidence
- Complex organization onboarding
- Microservices
- Advanced distributed systems

---

# 8. Critical Product Principle

Only **human-approved submissions** may create verified impact or mission rewards.

Risk systems may flag submissions.

They may never make the final decision.

---

# 9. Core Business Rules

Never violate these rules:

```text
No approval → no XP.
No approval → no Impact Points.
No approval → no verified impact.
One approved participation → one reward.
Redeeming points does not reduce XP.
Only verified impact is public.
Risk score does not decide outcome.
Human verifier is final authority.
Client does not decide reward values.
Client does not decide verified impact.
```

See `docs/BUSINESS_RULES.md` for the complete rule set.

---

# 10. Coding Workflow

For every task:

## Step 1 — Inspect

Read:

- Relevant docs
- Existing implementation
- Database schema/migrations
- Related domain services
- Existing components

Do not begin by blindly rewriting files.

## Step 2 — Plan

Identify:

- Required files
- Existing patterns to reuse
- Business rules
- Authorization requirements
- Validation requirements

## Step 3 — Implement

Make the smallest complete change that satisfies the task.

## Step 4 — Verify

Run relevant checks.

At minimum before completion:

```text
lint
typecheck
production build
```

Run tests if present.

## Step 5 — Report

At the end of the task, state:

- Files changed
- What was implemented
- How to test manually
- Any known limitation

---

# 11. Do Not Rewrite Unrelated Code

When assigned a task:

- Do not refactor unrelated modules.
- Do not redesign unrelated pages.
- Do not rename large parts of the repository.
- Do not change database schema unless required.
- Do not install unrelated dependencies.
- Do not “improve everything”.

Stability is more important than broad cleanup.

---

# 12. TypeScript Rules

Use strict TypeScript.

Avoid:

```text
any
@ts-ignore
@ts-nocheck
disabled lint rules
```

Do not silence type errors to finish faster.

If external data is unknown:

- Validate it.
- Narrow the type.
- Define an interface/schema.

Use Zod where appropriate for external/user input.

---

# 13. Error Handling

Every user-facing mutation should provide:

- Loading state
- Success state
- Error state

Errors should be understandable.

Avoid exposing raw database errors to normal users.

Log useful technical details server-side where appropriate.

---

# 14. Validation

Validate on the server even if the client also validates.

Client validation improves UX.

Server validation protects correctness.

Examples requiring server validation:

- Mission join
- Participation ownership
- Mission status
- Participation expiry
- Submission requirements
- Admin role
- Approval state
- Reward balance
- Reward stock

---

# 15. Authentication

Local session auth with scrypt password hashing and httpOnly cookies.

Do not build a separate password service.

Application user data belongs in:

```text
users
```

Sessions belong in:

```text
sessions
```

referencing:

```text
users.id
```

---

# 16. Authorization

Never rely only on UI visibility.

Example:

Bad:

```text
if role === ADMIN:
    show approve button
```

while the backend mutation is unrestricted.

Correct:

- Hide unavailable UI.
- Verify role server-side.
- The local database is server-only: no query ever runs in the browser.

---

# 17. User Identity

Do not trust client-submitted `user_id`.

Protected actions must determine identity from authenticated session.

---

# 18. Reward Security

The client must never send authoritative:

```text
xp_reward
point_reward
```

The server reads reward values from the mission.

---

# 19. Verified Impact Security

Only an authorized verifier may set:

```text
verified_value
```

The user may submit only:

```text
reported_value
```

---

# 20. Business Logic Placement

Do not place core domain logic inside presentational React components.

Prefer dedicated functions/services such as:

```text
joinMission()
submitEvidence()
calculateSubmissionRisk()
approveSubmission()
requestRevision()
rejectSubmission()
grantMissionReward()
checkBadgeUnlocks()
redeemReward()
calculateLevel()
```

Suggested structure:

```text
lib/
  missions/
  participation/
  submissions/
  verification/
  gamification/
  impact/
  rewards/
```

---

# 21. Approval Logic

Approval is a critical operation.

It must be:

- Authorized
- Idempotent
- Transaction-safe where practical

Approval logically performs:

```text
Validate submission
Validate verifier
Set verified impact
Approve submission
Approve participation
Grant XP once
Grant points once
Evaluate badge
Detect level up
Create notifications
Write audit log
Mark rewarded
```

Do not spread this logic across UI components.

---

# 22. Idempotency

A repeated approval request must not reward twice.

Use multiple safeguards:

- Check existing reward transaction
- Unique database constraint
- `rewarded` flag as supporting state

Do not rely only on button disabling.

---

# 23. Reward Redemption Logic

Redemption must verify on the server:

```text
authenticated user
reward active
stock > 0
points_balance >= point_cost
```

Then safely:

```text
subtract points
write ledger transaction
decrease stock
create redemption
generate demo code
create notification
```

---

# 24. Evidence Rules

Supported:

```text
image/jpeg
image/png
image/webp
```

Maximum:

```text
5 MB
```

Do not implement video.

---

# 25. Evidence Storage

Use the local private filesystem.

Storage path:

```text
data/evidence/{user_id}/{submission_id}/{uuid}.{extension}
```

Serve files only through the authorized `/api/evidence` route.

Do not expose evidence publicly.

---

# 26. Evidence Hashing

Prototype exact duplicate detection:

```text
SHA-256 file hash
```

Store the hash in the evidence table.

A duplicate produces a risk flag.

It does not automatically reject.

---

# 27. Risk Engine

Risk must be explainable.

Prefer output:

```ts
{
  score: 50,
  level: "MEDIUM",
  flags: [
    {
      type: "EXACT_DUPLICATE",
      severity: "HIGH",
      message: "This exact file was previously submitted."
    }
  ]
}
```

Do not return only a number.

---

# 28. State Machines

Respect documented state transitions.

Do not arbitrarily set statuses.

Participation:

```text
JOINED
→ SUBMITTED
→ UNDER_REVIEW
→ APPROVED

or

→ REVISION_REQUESTED
→ RESUBMITTED
→ UNDER_REVIEW
→ APPROVED / REJECTED

or

→ REJECTED
```

JOINED may also become:

```text
CANCELLED
EXPIRED
```

---

# 29. Mission State

Valid:

```text
DRAFT
ACTIVE
PAUSED
ENDED
```

Only ACTIVE may receive new participation.

---

# 30. UI Direction

The visual style should be:

- Modern
- Professional
- Clean
- Social-impact focused
- Gamified but not childish
- Minimal
- Consistent
- Responsive

Think:

> modern SaaS with meaningful gamification

not:

> cartoon mobile game

---

# 31. Avoid AI-Looking UI

Do not overuse:

- Giant gradient text
- Glassmorphism everywhere
- Excessive glow
- Random blobs
- Too many gradients
- Oversized headings on every page
- Emoji-heavy interfaces
- Repeated generic card layouts with no hierarchy

Use strong layout hierarchy and restrained decoration.

---

# 32. Icons

Use one consistent icon library already present in the project.

Do not mix several icon libraries.

Prefer icons over emoji in navigation and application UI.

Emoji may appear sparingly in celebratory microcopy.

---

# 33. Design Consistency

Reuse:

- Button variants
- Status badges
- Cards
- Empty states
- Form fields
- Dialogs
- Toasts
- Page headings
- Table styles

Do not create one-off visual styles when an existing component can be reused.

---

# 34. Semantic Status UI

Use consistent semantic meaning:

```text
Verified / Approved → success
Pending → neutral
Revision → warning
Rejected → danger
High Risk → danger/warning
```

Do not hardcode unrelated colors everywhere.

---

# 35. Copywriting

Keep copy concise and concrete.

Avoid AI marketing phrases such as:

```text
Empowering a brighter tomorrow
Unlock your potential
Revolutionizing kindness
Together we can change the world
```

Prefer:

```text
Complete verified social missions and track the impact you create.
```

---

# 36. Prototype Reward Copy

Always make simulation clear.

Example:

```text
Prototype Simulation

Rewards displayed in this prototype do not represent real financial transactions.
```

Do not imply a real payout happened.

---

# 37. Accessibility

Use:

- Semantic HTML
- Labels for form fields
- Keyboard-accessible interactions
- Focus states
- Sufficient contrast
- Proper button elements
- Accessible dialogs
- Meaningful alt text where appropriate

---

# 38. Responsive Design

Public and user pages must support:

- Mobile
- Tablet
- Desktop

Admin may be desktop-first but must remain usable on smaller screens.

---

# 39. Data Source Discipline

When real database data exists, do not replace it with hardcoded mock data inside components.

Seed data belongs in database seed/migration scripts.

Large demo baselines should come from a dedicated config/table.

---

# 40. Demo Mode

Recommended environment variable:

```text
NEXT_PUBLIC_DEMO_MODE=true
```

Demo-only visual features must not silently appear as real production financial behavior.

Optional demo-only tooling should be clearly separated from normal application logic.

---

# 41. Demo User State

The main demo flow expects:

```text
XP = 1900
Impact Points = 470
Environment approved count = 0
```

Clean Your Neighborhood reward:

```text
+100 XP
+30 points
```

Expected:

```text
XP = 2000
Level = Changemaker
Points = 500
Eco Starter unlocked
```

Coffee Voucher:

```text
500 points
```

Do not accidentally break this intended demo progression when changing seed data.

---

# 42. Database Migration Discipline

Do not edit old production-applied migrations casually.

Add new migrations for schema changes.

Keep migrations reproducible.

Seed scripts should be repeatable where possible.

---

# 43. Git Discipline

Keep changes scoped.

Recommended commit style:

```text
feat: implement mission participation
feat: add evidence submission
feat: add admin verification workflow
fix: prevent duplicate mission rewards
refactor: extract reward service
```

Do not make huge unrelated commits.

---

# 44. No Destructive Commands Without Need

Do not:

- Reset databases
- Delete migration history
- Remove user data
- Force push
- Drop tables

unless the task explicitly requires it and the consequence is clear.

---

# 45. No Feature Expansion Near Deadline

When the core flow is stable, prioritize:

- Bugs
- UX
- Responsiveness
- Documentation
- Demo reliability

over new features.

---

# 46. Definition of Done

Before claiming completion:

```text
✓ business rules satisfied
✓ authorization correct
✓ validation exists
✓ database writes correct
✓ error state exists
✓ loading state exists
✓ success state exists
✓ responsive layout not broken
✓ lint passes
✓ typecheck passes
✓ production build passes
```

---

# 47. Task Response Format

After implementing a coding task, respond with:

```text
Implemented:
- ...

Files changed:
- ...

How to test:
1. ...
2. ...

Checks:
- lint: pass/fail
- typecheck: pass/fail
- build: pass/fail

Known limitations:
- ...
```

Do not produce long generic explanations when a concise implementation report is enough.

---

# 48. Final Priority

The five-minute competition demo must work reliably.

Protect this flow above all optional features:

```text
User joins mission
→ submits evidence
→ admin reviews
→ admin approves
→ user receives XP + points
→ user levels up
→ badge unlocks
→ impact changes
→ user redeems demo reward
```

If a proposed change risks this core flow without meaningful benefit, do not make it.
