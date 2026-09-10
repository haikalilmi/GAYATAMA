# ImpactQuest — Business Rules

## 1. Purpose

This document defines the mandatory business rules for ImpactQuest.

When implementation behavior conflicts with this document, this document takes precedence unless explicitly updated.

---

# A. Global Principles

## RULE-001 — Human Verification Is Final

No automated system may make the final approval or rejection decision for a social impact submission.

Rule-based risk checks are advisory only.

---

## RULE-002 — No Reward Before Approval

XP, Impact Points, badges dependent on mission completion, and verified impact must not be granted before a submission is approved.

---

## RULE-003 — Verified Data Only

Public impact statistics, campaign progress, portfolio impact totals, and verified action counts must use approved data only.

Pending, rejected, expired, or cancelled activities must not affect public impact.

---

## RULE-004 — Impact Is Not Moral Ranking

The platform measures verified contribution, not whether a person is morally “better” than another person.

UI wording should use:

- Contribution
- Verified Action
- Mission
- Impact

Avoid:

- Best Person
- Kindest Person
- Most Good Person

---

## RULE-005 — Rewards Are Prototype Simulations

All monetary-looking rewards in the competition prototype are simulations.

No real money is transferred.

No real banking, payment, wallet, KYC, withdrawal, or e-wallet system should be implemented.

---

# B. User Rules

## RULE-010 — Authenticated Participation

Only authenticated users with the USER role may join missions.

---

## RULE-011 — User Identity Comes From Session

The backend must determine the acting user from the authenticated session.

Client-provided `user_id` must not be trusted for protected actions.

---

## RULE-012 — User Cannot Access Admin Functions

Normal users must not access:

- Admin dashboard
- Submission verification actions
- Mission administration
- Reward administration
- Platform analytics restricted to admins

Frontend hiding is not sufficient; authorization must also exist server-side.

---

# C. Mission Rules

## RULE-020 — Only Active Missions Can Be Joined

A mission may be joined only when:

```text
status = ACTIVE
```

DRAFT, PAUSED, and ENDED missions cannot receive new participation.

---

## RULE-021 — Mission Date Window Must Be Respected

If a mission has `start_at` or `end_at`, joining is allowed only inside the valid time window.

---

## RULE-022 — One Active Participation Per Mission

A user may have only one active participation for the same mission.

Active states include:

- JOINED
- SUBMITTED
- UNDER_REVIEW
- REVISION_REQUESTED
- RESUBMITTED

---

## RULE-023 — Participation Generates a Proof Code

Joining a mission creates exactly one participation record and generates one unique proof code.

---

## RULE-024 — Participation Has Expiry

Participation expiry is calculated from:

```text
joined_at + mission.participation_expiry_hours
```

An expired participation cannot accept a new submission.

---

## RULE-025 — User May Cancel Before Submission

A user may cancel a JOINED participation.

After evidence has been submitted, cancellation is not allowed.

---

## RULE-026 — Repeat Rules Must Be Enforced

Supported prototype repeat types:

- ONCE
- WEEKLY
- REPEATABLE

The backend must enforce the mission's repeat policy.

---

## RULE-027 — Weekly Means Reward-Limited Weekly

A weekly mission may grant a new completion reward only once per 7-day cooldown period for the same user.

---

## RULE-028 — Mission Reward Values Come From Mission Data

XP and Impact Point rewards must be read from the mission record.

The client must not decide reward values.

---

# D. Submission Rules

## RULE-030 — Submission Requires Valid Participation

A user may submit evidence only for their own valid active participation.

---

## RULE-031 — Evidence Requirements Are Mission-Driven

Required submission fields depend on mission configuration.

Possible requirements:

- Before photo
- After photo
- Description
- Proof code
- Partner/event code
- Impact metric values

---

## RULE-032 — Allowed Evidence Formats

Prototype image evidence:

- JPG
- JPEG
- PNG
- WEBP

Maximum file size:

```text
5 MB
```

Video is not supported.

---

## RULE-033 — Evidence Is Private

Submission evidence must not appear in public portfolios or public impact pages.

Evidence may be read only by:

- Submission owner
- Authorized administrators

---

## RULE-034 — Integrity Confirmation Required

Before submission, the user must confirm:

- The activity is genuine.
- The evidence represents their activity.
- Sensitive personal information is not exposed without permission.

---

## RULE-035 — User Report Is Not Automatically Verified

Reported impact values are claims from the user.

They must remain separate from verified impact values.

---

# E. Verification Rules

## RULE-040 — Verification Has Three Final Actions

Administrators may:

- APPROVE
- REJECT
- REQUEST REVISION

---

## RULE-041 — One Revision Maximum

A submission may receive at most one revision request.

After resubmission, the verifier must approve or reject.

---

## RULE-042 — Revision Is For Correctable Evidence

Use revision when the problem is potentially correctable, for example:

- Unclear image
- Missing required photo
- Incomplete description

---

## RULE-043 — Rejection Is For Invalid or Unverifiable Activity

Use rejection when the activity is invalid or cannot reasonably be verified.

Examples:

- Duplicate evidence used fraudulently
- Mission requirements not met
- Invalid proof code
- Activity cannot be verified

---

## RULE-044 — Rejection Reason Required

A rejection must include a predefined reason.

Allowed prototype reasons:

- INSUFFICIENT_EVIDENCE
- DUPLICATE_EVIDENCE
- MISSION_REQUIREMENTS_NOT_MET
- INVALID_PROOF_CODE
- ACTIVITY_CANNOT_BE_VERIFIED
- OTHER

Optional verifier note may be added.

---

## RULE-045 — Verified Impact May Be Corrected

The verifier may approve a submission while changing the impact value.

Example:

```text
Reported:
50 kg

Verified:
5 kg
```

Public metrics use 5 kg.

---

## RULE-046 — Verification Actions Must Be Auditable

Every verification action should create an audit log containing:

- Submission
- Verifier
- Action
- Previous state
- New state
- Reason
- Note
- Timestamp

---

# F. Risk Rules

## RULE-050 — Risk Does Not Decide Outcome

LOW, MEDIUM, or HIGH risk must never automatically approve or reject a submission.

---

## RULE-051 — Exact Duplicate Hashing

Prototype duplicate detection may use exact SHA-256 file hashing.

A matching file adds a risk flag.

It does not automatically reject.

---

## RULE-052 — Prototype Risk Indicators

Initial rule-based indicators:

```text
Exact duplicate evidence   +50
Invalid proof code         +30
More than 5 submissions    +20
Account age < 24 hours     +10
```

---

## RULE-053 — Risk Levels

```text
0–29   LOW
30–59  MEDIUM
60+    HIGH
```

---

## RULE-054 — Risk Must Be Explainable

Admin UI must display meaningful flags, not only a number.

Example:

```text
HIGH RISK

- Exact duplicate evidence
- Account created less than 24 hours ago
```

---

# G. Reward Processing Rules

## RULE-060 — Mission Reward Is Idempotent

An approved submission must receive its mission reward exactly once.

Repeated admin requests, refreshes, retries, or duplicate requests must not grant the reward twice.

---

## RULE-061 — Reward Processing Uses Submission as Source

XP and point transaction records must reference the approved submission.

This relationship should be protected with unique database constraints where possible.

---

## RULE-062 — Approval Reward Order

Approval should perform these logical operations as one safe unit:

1. Validate submission.
2. Validate verifier.
3. Update verified impact.
4. Mark submission approved.
5. Mark participation approved.
6. Grant XP.
7. Grant Impact Points.
8. Evaluate badge unlocks.
9. Detect level up.
10. Create notifications.
11. Mark participation rewarded.
12. Write verification log.

If critical writes fail, the operation should not leave a partially rewarded user.

---

# H. XP Rules

## RULE-070 — XP Never Decreases From Reward Redemption

Redeeming Impact Points has no effect on XP.

---

## RULE-071 — XP Determines Level

Prototype levels:

```text
0–499       Explorer
500–1199    Contributor
1200–1999   Advocate
2000–3499   Changemaker
3500+       Impact Leader
```

---

## RULE-072 — Level Is Derived

Do not store a mutable level field unless there is a clear reason.

Level should be calculated from total XP.

---

## RULE-073 — Level Up Notification

When an XP reward causes the user to cross a level threshold, create a LEVEL_UP notification.

---

# I. Impact Point Rules

## RULE-080 — Points Are Reward Currency

Impact Points may be:

- Earned from approved missions.
- Spent on prototype rewards.

---

## RULE-081 — Users Cannot Buy Points

There is no point top-up or purchase feature.

---

## RULE-082 — Point Ledger Must Exist

Point changes should create transaction records.

Positive example:

```text
+30
MISSION_REWARD
```

Negative example:

```text
-500
REWARD_REDEMPTION
```

---

## RULE-083 — Balance Cannot Become Negative

A reward redemption must fail if:

```text
points_balance < reward.point_cost
```

---

# J. Badge Rules

## RULE-090 — Badges Are Awarded Once

A user may earn each badge only once.

Database uniqueness should protect:

```text
user_id + badge_id
```

---

## RULE-091 — Initial Badge Conditions

### Eco Starter

At least 1 approved ENVIRONMENT mission.

### Eco Guardian

At least 5 approved ENVIRONMENT missions.

### Knowledge Giver

At least 1 approved EDUCATION mission.

### Digital Helper

At least 1 approved DIGITAL mission.

### Community Builder

At least 1 approved COMMUNITY mission.

### Verified Contributor

At least 10 total approved submissions.

---

## RULE-092 — Badge Notification

A newly unlocked badge creates a BADGE_UNLOCKED notification.

---

# K. Impact Rules

## RULE-100 — Verified Value Is the Source of Truth

Impact displays must use:

```text
verified_value
```

not:

```text
reported_value
```

---

## RULE-101 — Pending Impact Is Not Public

If:

```text
verified_value = null
```

the value must not contribute to public totals.

---

## RULE-102 — Maximum Two Metrics Per Mission

Prototype missions may define at most two impact metrics.

---

## RULE-103 — Community Impact Is Aggregated

Global impact should be calculated from verified submission metrics, optionally combined with clearly identified prototype demonstration baseline values.

---

## RULE-104 — Campaign Progress Is Verified Only

Campaign progress must be calculated from verified impacts linked to missions in the campaign.

---

# L. Reward Store Rules

## RULE-110 — Reward Must Be Active

Only ACTIVE rewards may be redeemed.

---

## RULE-111 — Reward Must Have Stock

Redemption requires:

```text
stock > 0
```

---

## RULE-112 — Reward Stock Decreases Once

A successful redemption decreases stock by exactly one.

---

## RULE-113 — Reward Uses Current Point Cost

The point cost used in the redemption must be stored in the redemption record.

---

## RULE-114 — Demo Code Is Generated

Successful prototype redemption generates a unique demo redemption code.

---

## RULE-115 — Reward Redemption Is Atomic

Logical redemption flow:

1. Validate authenticated user.
2. Validate active reward.
3. Validate stock.
4. Validate point balance.
5. Subtract Impact Points.
6. Write point transaction.
7. Decrease stock.
8. Create redemption.
9. Generate demo code.
10. Create notification.

The operation must not leave partial state.

---

# M. Notification Rules

## RULE-120 — Supported Notification Types

- MISSION_VERIFIED
- REVISION_REQUESTED
- MISSION_REJECTED
- BADGE_UNLOCKED
- LEVEL_UP
- REWARD_REDEEMED

---

## RULE-121 — Real-Time Infrastructure Is Not Required

Notifications may be loaded on page refresh.

WebSocket or real-time infrastructure is optional and not required for prototype completion.

---

# N. Portfolio Rules

## RULE-130 — Portfolio Uses Verified History

Portfolio totals must include approved submissions only.

---

## RULE-131 — Public Portfolio Must Protect Privacy

Do not expose:

- Email
- Private evidence
- Exact private location
- Proof codes
- Internal risk score
- Internal verifier notes

---

# O. Campaign Rules

## RULE-140 — Campaign Financial Data Is Demo Only

Any reward pool or financial display associated with campaigns must be labeled as simulation/demo data.

---

## RULE-141 — Sponsored Mission May Reference a Campaign

A mission may optionally belong to a campaign.

Standard missions do not require a campaign.

---

## RULE-142 — Ended Campaign Does Not Invalidate Existing Review

A campaign ending must not automatically reject submissions that were validly submitted before the deadline.

---

# P. Organization Rules

## RULE-150 — Organization Role Is Limited in Prototype

Prototype organization users may access:

- Organization dashboard
- Campaign information
- Impact analytics

They do not require:

- Full onboarding
- Team management
- Financial settlement
- Delegated verification

---

# Q. Demo Rules

## RULE-160 — Demo User Must Support Full Showcase

Recommended initial state:

```text
XP: 1900
Level: Advocate
Impact Points: 470
Approved ENVIRONMENT missions: 0
```

Demo mission:

```text
Clean Your Neighborhood
+100 XP
+30 Impact Points
```

Expected result:

```text
XP: 2000
Level: Changemaker
Points: 500
Eco Starter unlocked
```

---

## RULE-161 — Demo Reward Must Be Immediately Redeemable

Recommended reward:

```text
Coffee Voucher
Cost: 500 Impact Points
```

After demo mission approval, the demo user can immediately redeem it.

---

## RULE-162 — Demo Baseline Must Be Identified

Large seeded or baseline statistics must be presented as demonstration data, not real production activity.

---

# R. Security Rules

## RULE-170 — Do Not Trust Reward Values From Client

The backend reads XP and point rewards from the mission database.

Ignore client-provided reward values.

---

## RULE-171 — Do Not Trust Roles From Client

Role authorization must be resolved server-side.

---

## RULE-172 — Do Not Trust Impact Approval From User

Only authorized verifiers can set `verified_value`.

---

## RULE-173 — Evidence Access Must Be Authorized

Storage access should prevent unrelated users from viewing other users' evidence.

---

## RULE-174 — Server-Only Data Access

All database access runs server-side. No query ever runs in the browser.

---

# S. Prototype Constraints

## RULE-180 — No Real Payment Features

Do not implement:

- Payment gateway
- Bank account
- E-wallet
- Withdrawal
- KYC
- Real wallet
- Cash transfer

---

## RULE-181 — No AI Final Verification

Do not implement an AI system that automatically decides whether an activity is accepted.

---

## RULE-182 — No Unnecessary Microservices

Use a modular monolith for the prototype.

---

## RULE-183 — No Social Feed Scope Expansion

Do not add:

- Likes
- Comments
- Followers
- Public social posting feed

unless the product scope is explicitly changed.

---

# T. Definition of Done

## RULE-190 — Feature Completion

A feature is complete only when:

- Business rules are respected.
- Authorization is correct.
- Validation works.
- Data persists.
- Error state exists.
- Loading state exists.
- Success state exists.
- No unrelated feature is broken.
- TypeScript passes.
- Lint passes.
- Production build passes.

---

## RULE-191 — Stability Over Extra Features

Near competition submission, fixing bugs and protecting the core demo has higher priority than adding new features.
