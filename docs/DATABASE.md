# Database Design

## Engine

The running application uses **Supabase (PostgreSQL)**. All queries go through a single RPC:

```
exec_sql(query_text text, params jsonb) returns setof json
```

Application code never talks to PostgREST table endpoints directly. It calls `sql(...)` from `lib/db.ts`, which rewrites `?` placeholders into `$1`, `$2`, and so on before calling the RPC.

> **Note on `db/schema.sql`.** That file is a legacy SQLite reference kept for historical context. It is applied only by `npm run db:setup`, which no longer initializes the Supabase database. Treat the table descriptions below and the live Supabase project as the source of truth.

## Entity Relationships

```
organizations ──┬─< campaigns ──< missions >── mission_metrics
                │                    │              │
                └─< rewards          │              │
                                     │              │
users ──┬─< participations >─────────┘              │
        │        │                                  │
        │        └─< submissions >── submission_impacts
        │                 │
        │                 ├─< submission_evidence
        │                 └─< verification_logs
        │
        ├─< xp_transactions
        ├─< point_transactions
        ├─< user_badges >── badges
        ├─< reward_redemptions >── rewards
        ├─< notifications
        └─< sessions
```

## Tables

### Identity

| Table | Columns | Notes |
|---|---|---|
| `users` | `id`, `email`, `full_name`, `password_hash`, `role`, `total_xp`, `points_balance`, `created_at`, `updated_at` | `role` is `USER`, `ADMIN`, or `ORGANIZATION`. `total_xp` and `points_balance` are denormalized totals kept in step with the transaction ledgers. |
| `sessions` | `id`, `user_id`, `expires_at`, `created_at` | The cookie stores only the session `id`. Expired rows are deleted on read. |

### Organizations and Campaigns

| Table | Columns | Notes |
|---|---|---|
| `organizations` | `id`, `name`, `slug`, `description`, `logo_url`, `organization_type`, `is_demo`, `created_at` | Partner and sponsor records. |
| `campaigns` | `id`, `organization_id`, `name`, `slug`, `description`, `target_metric_key`, `target_value`, `demo_reward_pool`, `start_at`, `end_at`, `status`, `is_demo`, `created_at`, `updated_at` | Progress is computed from approved submissions, not stored. |

### Missions

| Table | Columns | Notes |
|---|---|---|
| `missions` | `id`, `organization_id`, `campaign_id`, `title`, `slug`, `short_description`, `description`, `category`, `difficulty`, `mission_type`, `xp_reward`, `point_reward`, `repeat_type`, `cooldown_days`, `participation_expiry_hours`, `requires_before_photo`, `requires_after_photo`, `requires_description`, `requires_proof_code`, `requires_partner_code`, `sdg_codes`, `status`, `start_at`, `end_at`, `created_at`, `updated_at` | `requires_*` flags drive which fields the evidence form demands. |
| `mission_metrics` | `id`, `mission_id`, `name`, `metric_key`, `unit`, `display_order`, `created_at` | Numeric metrics a contributor reports, for example waste in kilograms. |

**Controlled values**

- `category`: `ENVIRONMENT`, `EDUCATION`, `COMMUNITY`, `DIGITAL`, `SOCIAL`
- `difficulty`: `EASY`, `MEDIUM`, `HIGH`
- `mission_type`: `STANDARD`, `LIMITED`, `SPONSORED`
- `repeat_type`: `ONCE`, `WEEKLY`, `REPEATABLE`
- `status`: `DRAFT`, `ACTIVE`, `PAUSED`, `ENDED`

### Participation and Submissions

| Table | Columns | Notes |
|---|---|---|
| `participations` | `id`, `user_id`, `mission_id`, `proof_code`, `status`, `joined_at`, `expires_at`, `completed_at`, `cancelled_at`, `rewarded`, `created_at`, `updated_at` | One active slot per user per mission. `proof_code` is unique and shown to the contributor. |
| `submissions` | `id`, `participation_id`, `user_id`, `mission_id`, `description`, `proof_code_input`, `partner_code_input`, `risk_score`, `risk_level`, `risk_flags`, `status`, `revision_count`, `submitted_at`, `reviewed_at`, `created_at`, `updated_at` | One submission per participation. `risk_flags` stores a JSON array. `revision_count` is capped at 1. |
| `submission_evidence` | `id`, `submission_id`, `evidence_type`, `storage_path`, `file_hash`, `mime_type`, `file_size`, `created_at` | `evidence_type` is `BEFORE_PHOTO`, `AFTER_PHOTO`, or `SUPPORTING_PHOTO`. `file_hash` is SHA-256. |
| `submission_impacts` | `id`, `submission_id`, `mission_metric_id`, `reported_value`, `verified_value`, `created_at`, `updated_at` | `reported_value` comes from the contributor, `verified_value` from the reviewer. Only verified values feed public impact totals. |
| `verification_logs` | `id`, `submission_id`, `verifier_id`, `action`, `reason`, `note`, `previous_status`, `new_status`, `created_at` | Append-only audit trail. `action` is `START_REVIEW`, `APPROVE`, `REJECT`, or `REQUEST_REVISION`. |

**Status values**

| Field | Values |
|---|---|
| `participations.status` | `JOINED`, `SUBMITTED`, `UNDER_REVIEW`, `REVISION_REQUESTED`, `RESUBMITTED`, `APPROVED`, `REJECTED`, `CANCELLED`, `EXPIRED` |
| `submissions.status` | `PENDING`, `UNDER_REVIEW`, `REVISION_REQUESTED`, `APPROVED`, `REJECTED` |
| `submissions.risk_level` | `LOW`, `MEDIUM`, `HIGH` |

### Rewards and Gamification

| Table | Columns | Notes |
|---|---|---|
| `badges` | `id`, `name`, `slug`, `description`, `icon_key`, `category`, `condition_type`, `condition_value`, `created_at` | Badge definitions. Award rules live in `lib/gamification.ts`. |
| `user_badges` | `id`, `user_id`, `badge_id`, `earned_at` | Unique per user and badge, so a badge cannot be awarded twice. |
| `rewards` | `id`, `organization_id`, `title`, `description`, `point_cost`, `demo_value`, `stock`, `status`, `is_demo`, `image_url`, `created_at`, `updated_at` | `status` is `ACTIVE` or `INACTIVE`. |
| `reward_redemptions` | `id`, `user_id`, `reward_id`, `point_cost`, `demo_code`, `status`, `created_at` | `demo_code` is unique. `status` is `REDEEMED` or `CANCELLED`. |

### Ledgers and Notifications

| Table | Columns | Notes |
|---|---|---|
| `xp_transactions` | `id`, `user_id`, `amount`, `transaction_type`, `source_type`, `source_id`, `description`, `created_at` | `transaction_type` is `MISSION_REWARD`, `BONUS`, or `ADMIN_ADJUSTMENT`. A unique constraint on user, type, and source makes mission rewards idempotent. |
| `point_transactions` | `id`, `user_id`, `amount`, `transaction_type`, `source_type`, `source_id`, `balance_after`, `description`, `created_at` | `transaction_type` is `MISSION_REWARD`, `REWARD_REDEMPTION`, or `ADMIN_ADJUSTMENT`. |
| `notifications` | `id`, `user_id`, `type`, `title`, `message`, `reference_type`, `reference_id`, `is_read`, `created_at` | `type` is `MISSION_VERIFIED`, `REVISION_REQUESTED`, `MISSION_REJECTED`, `BADGE_UNLOCKED`, `LEVEL_UP`, or `REWARD_REDEEMED`. |
| `demo_baselines` | `metric_key`, `numeric_value`, `updated_at` | Seeded starting figures for the community page. They are illustrative, not independently verified. |

## Idempotency

`xp_transactions` carries a unique constraint on `(user_id, transaction_type, source_id)`. Before granting a mission reward, `approveSubmission` checks whether a reward row already exists for that submission. Approving the same submission twice therefore returns the previous result instead of granting a second reward.

## Indexes

`db/schema.sql` lists the intended indexes, including lookups on mission status and category, participations by user and mission, submissions by status, user, and mission, evidence by file hash, and notification reads by user. Confirm the live Supabase project matches before relying on them for performance.
