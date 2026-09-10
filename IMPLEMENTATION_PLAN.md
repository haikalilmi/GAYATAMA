# ImpactQuest — Implementation Plan

## 1. Objective

Build a reliable competition prototype that demonstrates one complete end-to-end social impact workflow.

Primary goal:

```text
Mission
→ Join
→ Evidence
→ Human Verification
→ XP + Points
→ Level + Badge
→ Verified Impact
→ Portfolio
→ Reward Redemption
```

The project should be implemented incrementally.

Do not ask the coding agent to generate the entire platform in one task.

---

# 2. Development Strategy

Each milestone should:

1. Read project documentation.
2. Inspect existing implementation.
3. Implement one coherent capability.
4. Manually test the capability.
5. Run lint.
6. Run typecheck.
7. Run production build.
8. Fix errors caused by the change.
9. Commit stable work.

---

# 3. Recommended Repository Docs

```text
docs/
├── PRD.md
├── BUSINESS_RULES.md
├── DATABASE.md
└── IMPLEMENTATION_PLAN.md

AGENTS.md
```

---

# 4. Milestone 0 — Foundation

## Goal

Create a clean project foundation.

## Tasks

- Initialize Next.js with TypeScript.
- Configure Tailwind CSS.
- Add shadcn/ui.
- Configure Supabase client/server helpers.
- Configure environment variables.
- Add base application layout.
- Add public layout.
- Add user dashboard layout.
- Add admin layout.
- Add organization layout placeholder.
- Add error/loading patterns.
- Add project documentation.
- Add AGENTS.md.
- Add lint/typecheck/build scripts.

## Acceptance Criteria

```text
✓ app runs locally
✓ production build succeeds
✓ Supabase client initializes
✓ public page renders
✓ dashboard route exists
✓ admin route exists
✓ no TypeScript error
```

## Do Not

- Build full landing page.
- Build rewards.
- Build verification.
- Add unnecessary dependencies.

---

# 5. Milestone 1 — Authentication and Roles

## Goal

Working authentication and route protection.

## Tasks

- Supabase Auth signup.
- Login.
- Logout.
- Session persistence.
- Create profile row after signup.
- USER role.
- ADMIN role.
- ORGANIZATION role.
- Protected routes.
- Server-side role checks.

## Acceptance Criteria

```text
✓ user can register
✓ user can login
✓ user stays logged in
✓ user can logout
✓ USER cannot open admin route
✓ ADMIN can open admin route
✓ ORGANIZATION can open organization route
✓ role checks are not frontend-only
```

## Manual Test

1. Register new user.
2. Login.
3. Refresh page.
4. Confirm session remains.
5. Attempt admin URL.
6. Confirm access denied.
7. Login admin.
8. Confirm admin page accessible.

---

# 6. Milestone 2 — Database Schema

## Goal

Create stable schema before feature work expands.

## Tasks

Create migrations for:

```text
profiles
organizations
campaigns
missions
mission_metrics
participations
submissions
submission_evidence
submission_impacts
verification_logs
xp_transactions
point_transactions
badges
user_badges
rewards
reward_redemptions
notifications
demo_baselines
```

Add:

- Enums
- Foreign keys
- Constraints
- Indexes
- RLS policies
- Seed script

## Acceptance Criteria

```text
✓ migrations run from clean database
✓ seed runs successfully
✓ demo accounts exist
✓ missions exist
✓ badges exist
✓ rewards exist
✓ required constraints exist
```

---

# 7. Milestone 3 — Seed Core Demo Data

## Goal

Make the application testable immediately.

## Seed

### Missions

- Clean Your Neighborhood
- Plant for Tomorrow
- Share Knowledge
- Donate a Book
- Help a Local Business
- Community Volunteer

### Organizations

- EcoFuture Foundation
- Green Future Community
- GoodCup
- EduFuture

### Badges

- Eco Starter
- Eco Guardian
- Knowledge Giver
- Digital Helper
- Community Builder
- Verified Contributor

### Rewards

- Coffee Voucher — 500
- Book Voucher — 750
- Learning Voucher — 1000
- Social Contribution Reward — 1500
- Community Scholarship — 5000

### Demo User

```text
XP = 1900
Points = 470
No approved ENVIRONMENT mission
```

## Acceptance Criteria

```text
✓ seed is reproducible
✓ mission explorer can query seed missions later
✓ demo user starts at intended values
```

---

# 8. Milestone 4 — Mission Explorer

## Goal

Users can discover missions.

## Tasks

- Mission list query.
- Mission cards.
- Mission category filter.
- Difficulty filter.
- Mission type filter.
- Search.
- Mission detail page.
- Evidence requirement display.
- Reward display.
- Impact metric display.
- SDG display.
- Repeat rule display.

## Acceptance Criteria

```text
✓ ACTIVE missions appear
✓ DRAFT does not appear
✓ PAUSED does not appear in joinable list
✓ filters work
✓ mission detail loads from database
✓ no mission content hardcoded into page logic
```

---

# 9. Milestone 5 — Mission Participation

## Goal

User can intentionally join a mission.

## Tasks

Implement:

```text
joinMission()
```

Requirements:

- Authenticated USER only.
- Mission must be ACTIVE.
- Date window valid.
- Repeat rule valid.
- No duplicate active participation.
- Generate unique proof code.
- Calculate expiry.
- Create participation.
- Show success state.

## Acceptance Criteria

```text
✓ joining active mission succeeds
✓ duplicate active join fails
✓ paused mission fails
✓ ended mission fails
✓ proof code is unique
✓ expires_at is correct
✓ participation belongs to authenticated user
```

---

# 10. Milestone 6 — My Missions

## Goal

Users can track current participation.

## Tasks

- My Missions page.
- Active tab.
- Under Review tab.
- Completed tab.
- Needs Attention tab.
- Participation status.
- Expiry countdown.
- Cancel JOINED participation.
- Submission CTA.

## Acceptance Criteria

```text
✓ user sees only own participations
✓ user can cancel JOINED
✓ user cannot cancel SUBMITTED
✓ expired participation is handled
```

---

# 11. Milestone 7 — Evidence Storage

## Goal

Private image upload works safely.

## Tasks

- Create private evidence bucket.
- Upload utility.
- Validate MIME type.
- Validate max 5 MB.
- Generate safe filename.
- Use structured storage path.
- Compute SHA-256 hash.
- Save evidence metadata.

Recommended path:

```text
{user_id}/{submission_id}/{uuid}.{extension}
```

## Acceptance Criteria

```text
✓ JPG works
✓ PNG works
✓ WEBP works
✓ >5 MB fails cleanly
✓ invalid type fails
✓ evidence is not public
✓ unrelated user cannot fetch file
✓ SHA-256 hash is stored
```

---

# 12. Milestone 8 — Submission Engine

## Goal

User can submit mission evidence.

## Tasks

- Dynamic evidence form.
- Fields driven by mission configuration.
- Impact metric form.
- Description.
- Proof code.
- Partner code if required.
- Integrity checkbox.
- Privacy checkbox.
- Submit confirmation.
- Create submission.
- Create submission impacts.
- Upload evidence.
- Update participation status.

## Acceptance Criteria

```text
✓ only participation owner can submit
✓ expired participation cannot submit
✓ required evidence enforced
✓ required metric enforced
✓ submission starts PENDING
✓ participation becomes SUBMITTED
✓ reported_value is stored
✓ verified_value remains null
```

---

# 13. Milestone 9 — Risk Engine

## Goal

Generate explainable pre-review indicators.

## Implement

```text
calculateSubmissionRisk()
```

Initial checks:

```text
exact duplicate      +50
invalid proof code   +30
>5 submissions/day   +20
account <24h         +10
```

Output:

```text
score
level
flags[]
```

## Acceptance Criteria

```text
✓ exact duplicate creates flag
✓ invalid proof code creates flag
✓ score maps to LOW/MEDIUM/HIGH
✓ flags contain readable reason
✓ risk never auto-rejects
```

---

# 14. Milestone 10 — Admin Dashboard

## Goal

Admin can see verification workload.

## Tasks

- Pending review count.
- High-risk count.
- Active mission count.
- Verified today.
- Submission queue preview.
- Recent verification summary.

## Acceptance Criteria

```text
✓ ADMIN only
✓ pending counts are database-driven
✓ high-risk count works
✓ review links open correct submission
```

---

# 15. Milestone 11 — Submission Queue

## Goal

Admin can find and prioritize submissions.

## Tasks

- Pending tab.
- Flagged tab.
- Revision tab.
- Approved tab.
- Rejected tab.
- Search.
- Mission filter.
- Risk filter.
- Submission row.

## Acceptance Criteria

```text
✓ queue is database-driven
✓ filters work
✓ risk level visible
✓ submission opens review page
```

---

# 16. Milestone 12 — Human Verification

## Goal

Implement the platform's most important workflow.

## Build

```text
startReview()
approveSubmission()
requestRevision()
rejectSubmission()
```

Admin review page shows:

- User
- Mission
- Evidence
- Reported impact
- Editable verified impact
- Risk level
- Risk flags
- User approval/rejection history
- Audit timeline

## Acceptance Criteria

```text
✓ admin can start review
✓ admin can approve
✓ admin can reject
✓ admin can request revision
✓ normal user cannot call verification action
✓ admin may adjust verified impact
✓ verification log created
```

---

# 17. Milestone 13 — Approval Transaction and Rewards

## Goal

Approval updates all dependent systems correctly.

## Build

```text
approveSubmission()
grantMissionReward()
```

Approval should:

```text
set verified impact
approve submission
approve participation
grant XP once
grant Impact Points once
update balances
mark rewarded
create verification log
```

## Acceptance Criteria

```text
✓ approved submission grants correct XP
✓ grants correct points
✓ verified impact saved
✓ reported impact preserved
✓ duplicate approval does not grant twice
✓ public impact can query verified value
```

---

# 18. Milestone 14 — Gamification

## Goal

User feels progression.

## Tasks

- calculateLevel()
- XP progress bar.
- Level title.
- Badge rule checks.
- User badges.
- Level-up detection.
- Badge notification.
- Mission verified notification.

## Demo Requirement

Before:

```text
XP 1900
Level Advocate
```

After Clean mission approval:

```text
XP 2000
Level Changemaker
```

Badge:

```text
Eco Starter
```

## Acceptance Criteria

```text
✓ correct level before
✓ correct level after
✓ badge awarded once
✓ level notification created
✓ badge notification created
```

---

# 19. Milestone 15 — Revision Workflow

## Goal

Correctable evidence can be resubmitted.

## Tasks

- Revision reason.
- Revision note.
- User sees Needs Attention.
- User edits/replaces evidence.
- Resubmit.
- revision_count increments.
- Return to review.

## Acceptance Criteria

```text
✓ first revision allowed
✓ second revision request blocked
✓ resubmission returns to review
✓ verifier must approve or reject afterward
```

---

# 20. Milestone 16 — Submission Detail and Timeline

## Goal

User can transparently track submission.

## Display

- Submission ID
- Mission
- Status
- Timeline
- Evidence
- Reported impact
- Verified impact when approved
- Reward
- Rejection/revision reason

## Acceptance Criteria

```text
✓ user can access own submission
✓ unrelated user cannot access
✓ timeline reflects audit/status
✓ private admin-only data not exposed
```

---

# 21. Milestone 17 — User Dashboard

## Goal

Create a useful logged-in home.

## Show

- Welcome
- Current level
- XP progress
- Impact Points
- Verified actions
- Active missions
- Recent activity
- Suggested missions

## Acceptance Criteria

```text
✓ values are database-driven
✓ active mission CTA works
✓ level progress correct
```

---

# 22. Milestone 18 — Impact Portfolio

## Goal

Turn verified contribution into long-term user value.

## Show

- Level
- XP
- Current points
- Verified actions
- Aggregated verified metrics
- Badges
- Recent verified activities
- Category distribution

## Acceptance Criteria

```text
✓ only approved submissions count
✓ only verified_value counts
✓ rejected/pending values excluded
✓ badges load correctly
```

---

# 23. Milestone 19 — Community Impact

## Goal

Show collective impact.

## Show

- Verified actions
- Contributors
- Waste
- Plants
- Books
- Teaching hours
- Volunteer hours
- Businesses assisted

## Demo Baseline

Optionally:

```text
display = demo baseline + verified prototype data
```

## Acceptance Criteria

```text
✓ real prototype approval changes displayed total
✓ baseline is clearly demonstration data
✓ unverified submissions do not affect total
```

---

# 24. Milestone 20 — Reward Store

## Goal

Prototype reward economy works.

## Tasks

- Reward list.
- Current point balance.
- Demo notice.
- Point cost.
- Demo value.
- Stock.
- Sponsor.
- Redeem button.

## Acceptance Criteria

```text
✓ active rewards shown
✓ insufficient balance handled
✓ zero stock handled
✓ demo notice visible
```

---

# 25. Milestone 21 — Reward Redemption

## Goal

Complete the gamification loop.

## Build

```text
redeemReward()
```

Flow:

```text
validate user
validate reward
validate stock
validate point balance
subtract points
write transaction
decrement stock
create redemption
generate demo code
create notification
```

## Demo Requirement

After Clean mission approval:

```text
Points = 500
```

Coffee Voucher:

```text
Cost = 500
```

After redeem:

```text
Points = 0
```

## Acceptance Criteria

```text
✓ redemption succeeds
✓ balance changes once
✓ stock changes once
✓ demo code created
✓ point transaction created
✓ reward notification created
✓ refresh does not duplicate redemption
```

---

# 26. Milestone 22 — Reward History

## Goal

User can see redeemed demo rewards.

## Show

- Reward
- Point cost
- Demo value
- Demo code
- Redemption date
- Prototype indicator

---

# 27. Milestone 23 — Leaderboard

## Goal

Show contribution ranking without moral framing.

## Tabs

- This Month
- All Time

## Ranking Basis

```text
XP
```

Monthly:

```text
SUM xp_transactions
inside current month
```

All time:

```text
profiles.total_xp
```

## Acceptance Criteria

```text
✓ ranking sorted correctly
✓ current user rank visible
✓ points balance not used
```

---

# 28. Milestone 24 — Admin Mission Management

## Goal

Admin can manage content after core user loop works.

## Tasks

- Mission table.
- Create mission.
- Edit mission.
- Draft.
- Publish.
- Pause.
- End.
- Evidence requirements.
- Reward values.
- Impact metrics.
- SDGs.
- Repeat rules.

## Acceptance Criteria

```text
✓ ADMIN only
✓ new ACTIVE mission appears to user
✓ DRAFT does not appear
✓ PAUSED cannot be joined
✓ reward values stored server-side
```

---

# 29. Milestone 25 — Rewards Administration

## Tasks

- Create reward.
- Edit reward.
- Update stock.
- Activate/deactivate.
- Assign demo sponsor.

---

# 30. Milestone 26 — Campaign Prototype

## Goal

Demonstrate scalable social campaigns.

## Build

- Campaign detail.
- Sponsor.
- Target metric.
- Target value.
- Verified progress.
- Participants.
- Verified actions.
- Demo reward pool.

Example:

```text
Green City Challenge
742 / 1000 kg
74%
```

---

# 31. Milestone 27 — Organization Dashboard

## Goal

Show future institutional value without building full organization product.

## Display

- Campaign
- Participants
- Verified actions
- Verified impact
- Goal progress
- Demo reward pool
- Demo distributed value

This page may be partially simulated.

---

# 32. Milestone 28 — Analytics

## Admin analytics:

- Verified actions
- Contributors
- Impact by category
- Approval rate
- Rejection rate
- Revision rate
- Campaign progress

Use simple charts.

Do not add predictive analytics.

---

# 33. Milestone 29 — Notifications Center

## Build

- List notifications.
- Read/unread state.
- Mark read.
- Links to relevant submission/reward where applicable.

Real-time transport is not required.

---

# 34. Milestone 30 — Public Landing Page

Only after the core flow works.

## Sections

1. Hero
2. Community impact
3. How it works
4. Featured missions
5. Featured campaign
6. Impact portfolio preview
7. CTA

## Hero

```text
Turn Good Actions Into Measurable Impact
```

Subtext:

```text
Join verified social missions, earn recognition and rewards, and build your social impact portfolio.
```

---

# 35. Milestone 31 — UI Polish

## Tasks

- Responsive navigation.
- Loading skeletons.
- Empty states.
- Toasts.
- Error messages.
- Consistent status badges.
- Consistent cards.
- Responsive admin tables.
- Form help text.
- Confirmation dialogs.
- Accessibility check.

Do not introduce major new features.

---

# 36. Milestone 32 — Demo Reset

## Goal

Make rehearsal repeatable.

Development/demo-only action should restore:

```text
Demo User
XP = 1900
Points = 470
No Eco Starter

Clean Mission
ACTIVE

Coffee Voucher
500 point cost
stock restored

Demo submission
cleared
```

Protect reset capability from normal users.

---

# 37. Milestone 33 — Demo Rehearsal

Prepare three logged-in sessions if possible:

```text
Browser/Profile 1 → USER
Browser/Profile 2 → ADMIN
Browser/Profile 3 → ORGANIZATION
```

Demo assets prepared locally:

```text
clean-before.jpg
clean-after.jpg
```

Rehearse:

```text
User join
User submit
Admin review
Admin approve
User level up
Badge unlock
User redeem
Impact total changes
```

Target live demo:

```text
≤ 5 minutes
```

---

# 38. Milestone 34 — Documentation

Repository must include:

- README
- Technology stack
- Installation instructions
- Environment variables
- Architecture
- Database overview
- Prototype limitations
- Demo accounts
- SDG alignment
- Screenshots
- Demo flow

Keep documentation consistent with actual implementation.

---

# 39. Milestone 35 — Final QA

Freeze new features.

Test:

## Authentication

- Register
- Login
- Logout
- Session
- Roles

## Mission

- Browse
- Detail
- Join
- Duplicate prevention
- Expiry

## Submission

- Upload
- Validation
- Risk
- Submit
- Ownership

## Admin

- Queue
- Review
- Approve
- Reject
- Revision

## Gamification

- XP
- Level
- Point balance
- Badge
- Notification

## Impact

- Portfolio
- Community metrics

## Rewards

- Stock
- Balance
- Redeem
- History

## Security

- USER cannot admin
- User A cannot see User B evidence
- Client cannot set reward values

## Technical

```text
lint passes
typecheck passes
build passes
```

---

# 40. Recommended Calendar

Competition submission deadline is September 20, 2026.

Suggested schedule:

```text
Sep 4–5
Foundation, Auth, Database

Sep 6
Mission Engine

Sep 7
Participation + Submission

Sep 8–9
Admin Verification

Sep 10
Gamification

Sep 11
Impact Portfolio

Sep 12
Reward System

Sep 13
Leaderboard + Analytics

Sep 14
Landing + UI Polish

Sep 15
Organization Prototype

Sep 16
Testing + Bug Fixes

Sep 17
Seed + Demo Rehearsal

Sep 18
README + Technical Documentation

Sep 19
Proposal + Final QA + Backup Demo

Sep 20
Submission Buffer
```

Do not plan major coding for September 20.

---

# 41. Feature Freeze

Recommended:

```text
Sep 15–16
```

After feature freeze, allow only:

- Bug fixes
- UX improvements
- Responsive fixes
- Documentation
- Demo preparation

No major new module.

---

# 42. OpenCode / Muse Spark Prompt Pattern

Use one task per prompt.

Recommended format:

```text
CONTEXT

TASK

BUSINESS RULES

ACCEPTANCE CRITERIA

DO NOT
```

---

# 43. Example Prompt — Mission Participation

```text
Read AGENTS.md, docs/PRD.md, docs/BUSINESS_RULES.md, docs/DATABASE.md, and inspect the existing mission implementation before changing code.

TASK

Implement Mission Participation only.

REQUIREMENTS

- Authenticated USER can join an ACTIVE mission.
- Joining creates exactly one participation.
- Generate a unique proof code.
- expires_at uses mission.participation_expiry_hours.
- Prevent more than one active participation for the same user and mission.
- Enforce mission date window.
- Do not implement evidence submission yet.

ACCEPTANCE CRITERIA

1. Joining an ACTIVE mission succeeds.
2. Joining the same mission again while active fails cleanly.
3. PAUSED or ENDED mission cannot be joined.
4. Proof code is unique.
5. Participation belongs to authenticated user.
6. lint passes.
7. typecheck passes.
8. production build passes.

DO NOT

- Rewrite unrelated components.
- Add new dependencies unless required.
- Modify reward logic.
- Implement future features.
- Use any or @ts-ignore to silence errors.

After implementation, report changed files and manual test steps.
```

---

# 44. Example Prompt — Admin Approval

```text
Read AGENTS.md and all relevant docs first. Inspect current submission, transaction, and gamification code before editing.

TASK

Implement approveSubmission() and the admin approval action.

BUSINESS RULES

- ADMIN only.
- Only reviewable submissions may be approved.
- Admin sets verified impact.
- XP and points come from mission database values.
- Reward must be granted exactly once.
- Reported impact must remain unchanged.
- Verified impact becomes public only after approval.
- Create verification log.
- Create mission verified notification.
- Evaluate badges.
- Detect level up.
- Use a safe database transaction/RPC approach where practical.

ACCEPTANCE CRITERIA

1. Approval updates submission.
2. Approval updates participation.
3. Correct XP is granted once.
4. Correct points are granted once.
5. verified_value is saved.
6. Repeating the request does not grant duplicate reward.
7. Normal USER cannot call the action.
8. build passes.

DO NOT

- Let frontend provide authoritative XP or point values.
- Auto-approve from risk score.
- Rewrite unrelated UI.
```

---

# 45. Example Prompt — Reward Redemption

```text
Read the project docs and inspect the existing point ledger and rewards tables.

TASK

Implement simulated reward redemption.

RULES

- Authenticated USER only.
- Reward must be ACTIVE.
- Stock must be greater than zero.
- User must have enough Impact Points.
- Subtract points exactly once.
- Decrease stock exactly once.
- Write point transaction.
- Create reward_redemption.
- Generate unique demo code.
- Create notification.
- No real payment behavior.

ACCEPTANCE CRITERIA

1. User with enough points can redeem.
2. Insufficient points fails cleanly.
3. Zero stock fails cleanly.
4. Successful redemption changes balance and stock.
5. Demo code is generated.
6. No duplicate transaction on refresh/retry.
7. UI shows prototype simulation notice.
8. build passes.
```

---

# 46. Definition of Done for Every Milestone

```text
✓ correct business behavior
✓ authorization correct
✓ database writes correct
✓ validation exists
✓ loading state
✓ error state
✓ success state
✓ responsive
✓ no unrelated regression
✓ lint
✓ typecheck
✓ production build
```

---

# 47. Final Priority Order

If time becomes limited, preserve these in order:

## Priority A — Must Work

1. Auth
2. Mission Explorer
3. Mission Detail
4. Join Mission
5. Evidence Submission
6. Admin Queue
7. Admin Review
8. Approve/Reject/Revision
9. XP
10. Impact Points
11. Verified Impact
12. User Dashboard
13. Portfolio
14. Reward Redemption

## Priority B — Important

15. Badges
16. Notifications
17. Leaderboard
18. Community Impact
19. Mission Management
20. Analytics

## Priority C — Optional / Demo

21. Organization dashboard
22. Campaign finance visualization
23. Public portfolio
24. Advanced filters
25. Extra animations

---

# 48. Final Demo Definition

The prototype is ready for competition when this sequence can be performed repeatedly without manual database editing:

```text
USER
opens mission
joins mission
uploads before/after evidence
submits

ADMIN
opens queue
reviews evidence
checks risk indicators
sets verified impact
approves

USER
sees verified notification
XP increases
level becomes Changemaker
Eco Starter unlocks
points become 500
portfolio updates
community impact updates
redeems Coffee Voucher
points become 0
demo redemption code appears
```

Everything else supports this story.
