# ImpactQuest — Database Design

> Local build note: this document was written for PostgreSQL. The shipped
> implementation ports the same data model to SQLite (`db/schema.sql`,
> applied by `npm run db:setup`). Table and column names match; Postgres-only
> features (enums, RLS, RPCs) become TEXT checks, server-side authorization,
> and TypeScript transactions. The product rules below still apply.

## 1. Database Direction

Database engine:

> SQLite via node:sqlite (fully local, zero dependencies)

Authentication:

> Supabase Auth

User application data:

> `profiles` table referencing `auth.users`

Storage:

> Supabase Storage for private evidence images

Architecture:

> Relational core with JSONB used only where it simplifies prototype-specific data such as risk flags or SDG lists.

---

# 2. Design Goals

The schema must support:

- Authentication roles
- Mission management
- Mission participation
- Evidence submission
- Human verification
- Risk flags
- XP transactions
- Impact Point transactions
- Badges
- Impact metrics
- User portfolios
- Community impact
- Rewards
- Reward redemption
- Campaigns
- Organizations
- Notifications
- Audit logs

The schema should remain simple enough for a competition prototype.

---

# 3. Core Enums

Recommended enum values.

## user_role

```text
USER
ADMIN
ORGANIZATION
```

## mission_category

```text
ENVIRONMENT
EDUCATION
COMMUNITY
DIGITAL
SOCIAL
```

## mission_difficulty

```text
EASY
MEDIUM
HIGH
```

## mission_type

```text
STANDARD
LIMITED
SPONSORED
```

## mission_status

```text
DRAFT
ACTIVE
PAUSED
ENDED
```

## repeat_type

```text
ONCE
WEEKLY
REPEATABLE
```

## participation_status

```text
JOINED
SUBMITTED
UNDER_REVIEW
REVISION_REQUESTED
RESUBMITTED
APPROVED
REJECTED
CANCELLED
EXPIRED
```

## submission_status

```text
PENDING
UNDER_REVIEW
REVISION_REQUESTED
APPROVED
REJECTED
```

## evidence_type

```text
BEFORE_PHOTO
AFTER_PHOTO
SUPPORTING_PHOTO
```

## risk_level

```text
LOW
MEDIUM
HIGH
```

## verification_action

```text
START_REVIEW
APPROVE
REJECT
REQUEST_REVISION
```

## point_transaction_type

```text
MISSION_REWARD
REWARD_REDEMPTION
ADMIN_ADJUSTMENT
```

## xp_transaction_type

```text
MISSION_REWARD
BONUS
ADMIN_ADJUSTMENT
```

## reward_status

```text
ACTIVE
INACTIVE
```

## redemption_status

```text
REDEEMED
CANCELLED
```

## notification_type

```text
MISSION_VERIFIED
REVISION_REQUESTED
MISSION_REJECTED
BADGE_UNLOCKED
LEVEL_UP
REWARD_REDEEMED
```

---

# 4. profiles

Supabase Auth already owns account credentials in:

```text
auth.users
```

Application profile data belongs here.

## Columns

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | references auth.users.id |
| full_name | text | required |
| avatar_url | text nullable | profile image |
| role | user_role | default USER |
| total_xp | integer | default 0 |
| points_balance | integer | default 0 |
| created_at | timestamptz | default now |
| updated_at | timestamptz | default now |

## Constraints

```text
total_xp >= 0
points_balance >= 0
```

## Notes

Do not store password data here.

Do not store mutable user level. Level is calculated from `total_xp`.

---

# 5. organizations

Prototype organization and sponsor records.

## Columns

| Column | Type |
|---|---|
| id | uuid PK |
| name | text |
| slug | text unique |
| description | text nullable |
| logo_url | text nullable |
| organization_type | text nullable |
| is_demo | boolean default true |
| created_at | timestamptz |

Example:

```text
EcoFuture Foundation
Green Future Community
GoodCup
EduFuture
```

---

# 6. campaigns

Collective programs linked to one or more missions.

## Columns

| Column | Type |
|---|---|
| id | uuid PK |
| organization_id | uuid FK nullable |
| name | text |
| slug | text unique |
| description | text nullable |
| target_metric_key | text nullable |
| target_value | numeric nullable |
| demo_reward_pool | numeric nullable |
| start_at | timestamptz nullable |
| end_at | timestamptz nullable |
| status | mission_status |
| is_demo | boolean default true |
| created_at | timestamptz |
| updated_at | timestamptz |

## Notes

`demo_reward_pool` is presentation-only prototype data.

It must not be treated as a real wallet balance.

---

# 7. missions

Core mission configuration.

## Columns

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid FK nullable | |
| campaign_id | uuid FK nullable | |
| title | text | required |
| slug | text unique | |
| short_description | text | |
| description | text | |
| category | mission_category | |
| difficulty | mission_difficulty | |
| mission_type | mission_type | |
| xp_reward | integer | |
| point_reward | integer | |
| repeat_type | repeat_type | |
| cooldown_days | integer nullable | |
| participation_expiry_hours | integer default 48 | |
| proof_level | integer default 1 | |
| requires_before_photo | boolean default false | |
| requires_after_photo | boolean default false | |
| requires_description | boolean default true | |
| requires_proof_code | boolean default false | |
| requires_partner_code | boolean default false | |
| sdg_codes | jsonb | array of SDG numbers/labels |
| status | mission_status | |
| start_at | timestamptz nullable | |
| end_at | timestamptz nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## Constraints

```text
xp_reward >= 0
point_reward >= 0
participation_expiry_hours > 0
cooldown_days >= 0 when not null
```

---

# 8. mission_metrics

Defines one or two measurable impact values for a mission.

## Columns

| Column | Type |
|---|---|
| id | uuid PK |
| mission_id | uuid FK |
| name | text |
| metric_key | text |
| unit | text |
| display_order | integer default 0 |
| created_at | timestamptz |

Example:

```text
mission: Clean Your Neighborhood
name: Waste Collected
metric_key: waste_collected
unit: kg
```

## Constraints

Recommended application rule:

```text
maximum 2 metrics per mission
```

---

# 9. participations

Created when a user joins a mission.

## Columns

| Column | Type |
|---|---|
| id | uuid PK |
| user_id | uuid FK profiles |
| mission_id | uuid FK |
| proof_code | text unique |
| status | participation_status |
| joined_at | timestamptz |
| expires_at | timestamptz |
| completed_at | timestamptz nullable |
| cancelled_at | timestamptz nullable |
| rewarded | boolean default false |
| created_at | timestamptz |
| updated_at | timestamptz |

## Important Rule

A user may not have multiple active participations for the same mission.

Active states:

```text
JOINED
SUBMITTED
UNDER_REVIEW
REVISION_REQUESTED
RESUBMITTED
```

This may be enforced in service logic. If practical, add a supporting partial unique strategy.

---

# 10. submissions

Core review object.

## Columns

| Column | Type |
|---|---|
| id | uuid PK |
| participation_id | uuid FK unique |
| user_id | uuid FK profiles |
| mission_id | uuid FK missions |
| description | text nullable |
| proof_code_input | text nullable |
| partner_code_input | text nullable |
| risk_score | integer default 0 |
| risk_level | risk_level default LOW |
| risk_flags | jsonb default [] |
| status | submission_status |
| revision_count | integer default 0 |
| submitted_at | timestamptz |
| reviewed_at | timestamptz nullable |
| created_at | timestamptz |
| updated_at | timestamptz |

## Constraints

```text
revision_count between 0 and 1
risk_score >= 0
```

---

# 11. submission_evidence

Stores evidence references.

## Columns

| Column | Type |
|---|---|
| id | uuid PK |
| submission_id | uuid FK |
| evidence_type | evidence_type |
| storage_path | text |
| file_hash | text |
| mime_type | text |
| file_size | bigint |
| created_at | timestamptz |

## Indexes

Recommended:

```text
index on file_hash
index on submission_id
```

Exact duplicate checking uses `file_hash`.

---

# 12. submission_impacts

Stores reported and verified impact.

## Columns

| Column | Type |
|---|---|
| id | uuid PK |
| submission_id | uuid FK |
| mission_metric_id | uuid FK |
| reported_value | numeric |
| verified_value | numeric nullable |
| created_at | timestamptz |
| updated_at | timestamptz |

## Unique Constraint

```text
unique(submission_id, mission_metric_id)
```

## Core Rule

Public totals use only:

```text
verified_value
```

---

# 13. verification_logs

Audit trail for human review.

## Columns

| Column | Type |
|---|---|
| id | uuid PK |
| submission_id | uuid FK |
| verifier_id | uuid FK profiles |
| action | verification_action |
| reason | text nullable |
| note | text nullable |
| previous_status | submission_status nullable |
| new_status | submission_status |
| created_at | timestamptz |

## Purpose

Supports:

- Transparency
- Debugging
- Auditability
- Demo credibility

---

# 14. xp_transactions

XP ledger.

## Columns

| Column | Type |
|---|---|
| id | uuid PK |
| user_id | uuid FK profiles |
| amount | integer |
| transaction_type | xp_transaction_type |
| source_type | text nullable |
| source_id | uuid nullable |
| description | text nullable |
| created_at | timestamptz |

## Recommended Constraint

For mission reward:

```text
unique(user_id, transaction_type, source_id)
```

or another equivalent constraint preventing duplicate mission reward grants.

---

# 15. point_transactions

Impact Points ledger.

## Columns

| Column | Type |
|---|---|
| id | uuid PK |
| user_id | uuid FK profiles |
| amount | integer |
| transaction_type | point_transaction_type |
| source_type | text nullable |
| source_id | uuid nullable |
| balance_after | integer |
| description | text nullable |
| created_at | timestamptz |

`amount` may be positive or negative.

Examples:

```text
+30  MISSION_REWARD
-500 REWARD_REDEMPTION
```

---

# 16. badges

Badge catalog.

## Columns

| Column | Type |
|---|---|
| id | uuid PK |
| name | text unique |
| slug | text unique |
| description | text |
| icon_key | text nullable |
| category | mission_category nullable |
| condition_type | text |
| condition_value | text nullable |
| created_at | timestamptz |

Prototype badge rules may remain application-coded.

---

# 17. user_badges

Badge ownership.

## Columns

| Column | Type |
|---|---|
| id | uuid PK |
| user_id | uuid FK profiles |
| badge_id | uuid FK badges |
| earned_at | timestamptz |

## Unique Constraint

```text
unique(user_id, badge_id)
```

---

# 18. rewards

Prototype rewards.

## Columns

| Column | Type |
|---|---|
| id | uuid PK |
| organization_id | uuid FK nullable |
| title | text |
| description | text nullable |
| point_cost | integer |
| demo_value | numeric nullable |
| stock | integer |
| status | reward_status |
| is_demo | boolean default true |
| image_url | text nullable |
| created_at | timestamptz |
| updated_at | timestamptz |

## Constraints

```text
point_cost > 0
stock >= 0
```

---

# 19. reward_redemptions

Stores simulated redemption.

## Columns

| Column | Type |
|---|---|
| id | uuid PK |
| user_id | uuid FK profiles |
| reward_id | uuid FK rewards |
| point_cost | integer |
| demo_code | text unique |
| status | redemption_status |
| created_at | timestamptz |

## Note

No real payment reference should exist in this prototype table.

---

# 20. notifications

In-app notifications.

## Columns

| Column | Type |
|---|---|
| id | uuid PK |
| user_id | uuid FK profiles |
| type | notification_type |
| title | text |
| message | text |
| reference_type | text nullable |
| reference_id | uuid nullable |
| is_read | boolean default false |
| created_at | timestamptz |

Recommended index:

```text
(user_id, created_at desc)
```

---

# 21. demo_baselines

Optional prototype-only table.

Used to display larger demonstration statistics without generating thousands of fake submission rows.

## Columns

| Column | Type |
|---|---|
| metric_key | text PK |
| numeric_value | numeric |
| updated_at | timestamptz |

Examples:

```text
verified_actions     8700
contributors         2450
waste_collected      12000
plants_added         4700
volunteer_hours      9000
teaching_hours       6800
```

## Display Formula

```text
display total
=
demo baseline
+
verified prototype data
```

All such statistics must be labeled as demonstration data.

---

# 22. Relationship Summary

```text
auth.users
    │
    │ 1:1
    ▼
profiles
    │
    ├─────────────┐
    │             │
    ▼             ▼
participations   xp_transactions
    │             point_transactions
    │             user_badges
    ▼             reward_redemptions
submissions
    │
    ├───────────────┐
    │               │
    ▼               ▼
submission_evidence submission_impacts
    │                       │
    │                       ▼
    │                 mission_metrics
    │
    ▼
verification_logs


missions
    │
    ├──────────────▶ mission_metrics
    │
    ├──────────────▶ organizations
    │
    └──────────────▶ campaigns


campaigns
    │
    └──────────────▶ organizations


rewards
    │
    └──────────────▶ organizations
```

---

# 23. Main ERD Cardinality

```text
Profile
1 ─── N Participation

Mission
1 ─── N Participation

Participation
1 ─── 1 Submission

Submission
1 ─── N SubmissionEvidence

Submission
1 ─── N SubmissionImpact

Mission
1 ─── N MissionMetric

Profile
1 ─── N XPTransaction

Profile
1 ─── N PointTransaction

Profile
N ─── N Badge

Profile
1 ─── N RewardRedemption

Organization
1 ─── N Campaign

Campaign
1 ─── N Mission

Organization
1 ─── N Reward
```

---

# 24. Level Calculation

Level is not stored.

Application function:

```text
0–499       Explorer
500–1199    Contributor
1200–1999   Advocate
2000–3499   Changemaker
3500+       Impact Leader
```

---

# 25. Approval Transaction

Approval is the most important database operation.

Conceptual transaction:

```text
BEGIN

1. lock/read target submission
2. confirm status is reviewable
3. confirm verifier authorization
4. update submission_impacts.verified_value
5. update submissions.status = APPROVED
6. update submissions.reviewed_at
7. update participations.status = APPROVED
8. insert xp_transactions
9. update profiles.total_xp
10. insert point_transactions
11. update profiles.points_balance
12. evaluate badges
13. insert user_badges when newly earned
14. insert notifications
15. insert verification_logs
16. update participations.rewarded = true

COMMIT
```

If a critical step fails:

```text
ROLLBACK
```

---

# 26. Reward Redemption Transaction

Conceptual:

```text
BEGIN

1. confirm reward ACTIVE
2. confirm stock > 0
3. confirm points_balance >= point_cost
4. update profiles.points_balance
5. insert point_transaction
6. decrement reward.stock
7. create reward_redemption
8. create notification

COMMIT
```

---

# 27. Idempotency

Critical rule:

An approved submission must not grant reward twice.

Recommended defense:

1. Application checks whether reward transaction already exists.
2. Database unique constraint prevents duplicate source reward.
3. Participation has `rewarded` boolean.

Do not rely on the boolean alone.

---

# 28. Storage Design

Recommended Supabase Storage bucket:

```text
evidence
```

Private bucket.

Recommended path:

```text
{user_id}/{submission_id}/{uuid}.{extension}
```

Example:

```text
8a2.../b44.../ae12....jpg
```

Do not use user-supplied filename as primary storage identity.

---

# 29. Storage Authorization

Normal user should access:

```text
their own evidence
```

Admin should access:

```text
all submission evidence required for verification
```

Unrelated users must not access evidence.

Public portfolio must not use evidence URLs.

---

# 30. Row Level Security Direction

Minimum RLS design:

## profiles

USER:

- SELECT own profile
- UPDATE allowed own safe fields

ADMIN:

- SELECT all

## participations

USER:

- SELECT own
- INSERT own through controlled logic
- UPDATE own only when allowed

ADMIN:

- SELECT all

## submissions

USER:

- SELECT own
- INSERT/update own during valid workflow

ADMIN:

- SELECT all
- UPDATE for review workflow

## submission_evidence

USER:

- SELECT own
- INSERT own submission evidence

ADMIN:

- SELECT all

## point/xp transactions

USER:

- SELECT own
- no direct insert

ADMIN/server service:

- controlled writes only

## rewards

Public authenticated read:

- ACTIVE rewards

Admin:

- manage rewards

---

# 31. Server-Side Authorization

RLS should not replace application authorization completely.

Sensitive actions should verify:

- Authenticated user
- Role
- Ownership
- Object state
- Business rules

especially:

- Approve
- Reject
- Request revision
- Reward redemption
- Mission administration

---

# 32. Seed Data

Required seed content:

## Users

- Demo USER
- Demo ADMIN
- Demo ORGANIZATION
- Several leaderboard users

## Organizations

- EcoFuture Foundation
- Green Future Community
- GoodCup
- EduFuture

## Missions

- Clean Your Neighborhood
- Plant for Tomorrow
- Share Knowledge
- Donate a Book
- Help a Local Business
- Community Volunteer

## Badges

- Eco Starter
- Eco Guardian
- Knowledge Giver
- Digital Helper
- Community Builder
- Verified Contributor

## Rewards

- Coffee Voucher
- Book Voucher
- Learning Voucher
- Social Contribution Reward
- Community Scholarship

## Demo User

Recommended:

```text
total_xp = 1900
points_balance = 470
```

No approved ENVIRONMENT mission.

---

# 33. Demo Reset

Recommended development-only reset mechanism should restore:

```text
Demo user:
1900 XP
470 points

Clean mission:
active

Coffee voucher:
500 points
stock restored

No pending demo submission

No environment badge

Global prototype additive impact:
reset
```

Do not expose destructive reset functionality publicly in production mode.

---

# 34. Index Recommendations

Recommended indexes:

```text
missions(status)
missions(category)
participations(user_id, mission_id)
participations(user_id, status)
submissions(status)
submissions(user_id)
submissions(mission_id)
submission_evidence(file_hash)
submission_impacts(submission_id)
verification_logs(submission_id)
xp_transactions(user_id, created_at)
point_transactions(user_id, created_at)
notifications(user_id, created_at)
reward_redemptions(user_id)
```

---

# 35. Data That Must Not Be Added

Do not add prototype tables for:

- bank_accounts
- payment_transactions
- withdrawals
- wallet_topups
- kyc_documents
- blockchain_transactions
- followers
- likes
- comments
- chat_messages

unless product scope explicitly changes.

---

# 36. Naming Convention

Recommended:

- snake_case for PostgreSQL tables/columns
- singular enum type names
- UUID primary keys
- `created_at` / `updated_at`
- `_id` suffix for foreign keys

---

# 37. Source of Truth Summary

```text
Authentication identity:
auth.users

User progression:
profiles.total_xp
+ xp_transactions audit

Point balance:
profiles.points_balance
+ point_transactions audit

Mission reward amount:
missions.xp_reward
missions.point_reward

Submission outcome:
submissions.status

Final impact:
submission_impacts.verified_value

Public portfolio:
approved submissions only

Community impact:
verified values only

Reward ownership:
reward_redemptions
```
