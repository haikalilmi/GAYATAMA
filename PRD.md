# ImpactQuest — Product Requirements Document (PRD)

## 1. Document Purpose

This document defines the product scope, goals, users, features, workflows, constraints, and prototype requirements for **ImpactQuest**, a gamified social impact platform built for a web technology competition.

This document is the primary product source of truth. Implementation decisions should remain consistent with this PRD unless explicitly updated.

---

## 2. Product Summary

**ImpactQuest** is a gamified web platform that encourages people—especially students and young adults—to participate in structured social impact missions.

Users can:

1. Discover social missions.
2. Join a mission.
3. Perform the activity.
4. Submit evidence.
5. Wait for human verification.
6. Receive XP and Impact Points after approval.
7. Build a verified social impact portfolio.
8. Redeem simulated prototype rewards.
9. Contribute to measurable community impact.

The platform does **not** rank people by how "good" they are. It measures and rewards **verified social contribution**.

---

## 3. Competition Context

The prototype is designed for the International Web Technology Competition with the theme:

> “Innovating for a Sustainable Future: Empowering Communities through Web Technology”

The competition emphasizes:

- Real-world problem solving
- Innovation and creativity
- Technical implementation
- User experience
- SDG alignment
- Sustainable impact
- Scalability

The prototype should therefore demonstrate both a strong user experience and a technically credible end-to-end system.

---

## 4. Problem Statement

Social contributions are often fragmented, difficult to verify, poorly documented, and disconnected from long-term recognition.

Common problems include:

- People participate in social activities only occasionally.
- Volunteer contributions are often not recorded in one continuous profile.
- Organizations may struggle to motivate sustained participation.
- Social impact is often communicated as stories rather than measurable data.
- Rewarding participation can become vulnerable to fraud if activities are not structured and verified.
- Public recognition can become performative if the platform focuses too heavily on individual attention rather than collective impact.

---

## 5. Proposed Solution

ImpactQuest provides a structured mission system where:

- Missions define clear requirements.
- Users intentionally join before submitting evidence.
- Evidence is checked by rule-based risk indicators.
- Human verifiers make final decisions.
- Only approved submissions grant rewards and impact.
- Verified activities are stored as a personal impact portfolio.
- Community impact is aggregated from verified data.
- Rewards are simulated in the competition prototype.
- Sponsored campaigns demonstrate a possible future sustainability model.

---

## 6. Product Vision

Create a platform where meaningful social contribution becomes:

- Easier to discover
- Easier to verify
- More motivating
- More measurable
- More visible as a personal record
- More useful to communities and organizations

---

## 7. Core Product Principle

> Gamification motivates participation, but collective verified impact remains the primary measure of success.

---

## 8. Core Loop

```text
Discover Mission
      ↓
Join Mission
      ↓
Receive Proof Code
      ↓
Perform Activity
      ↓
Submit Evidence
      ↓
System Pre-Check
      ↓
Human Verification
      ↓
Approved
      ↓
XP + Impact Points
      ↓
Badge / Level Progress
      ↓
Impact Portfolio Updated
      ↓
Community Impact Updated
      ↓
Optional Reward Redemption
```

---

## 9. Target Users

### 9.1 Primary Users

Students and young adults who want to:

- Participate in meaningful activities
- Build a record of social contribution
- Earn recognition
- Join community missions
- Track their personal impact

### 9.2 Secondary Users

Organizations, communities, institutions, NGOs, and CSR partners that may:

- Create campaigns
- Mobilize participants
- Measure social impact
- Sponsor future reward programs

### 9.3 Platform Administrators

Administrators responsible for:

- Mission management
- Submission verification
- User management
- Reward management
- Analytics
- Campaign management

---

## 10. User Roles

### USER

Can:

- Register and log in
- Browse missions
- Join missions
- Submit evidence
- View submission status
- Receive XP and Impact Points
- Unlock badges
- View impact portfolio
- View leaderboard
- Redeem simulated rewards
- View notifications

### ADMIN

Can:

- Access admin dashboard
- Review submissions
- Approve submissions
- Reject submissions
- Request one revision
- Adjust verified impact values
- View risk indicators
- Manage missions
- Manage rewards
- View users
- View analytics
- View campaigns

### ORGANIZATION

Prototype role.

Can:

- View a demo organization dashboard
- View campaign performance
- View measurable impact
- View simulated reward pool information

Full organization onboarding and delegated verification are out of prototype scope.

---

## 11. Mission Model

A Mission is a structured social action with predefined requirements.

Each mission includes:

- Title
- Description
- Category
- Difficulty
- Mission type
- XP reward
- Impact Points reward
- Evidence requirements
- Participation expiry
- Repeat rules
- Impact metric
- SDG alignment
- Optional organization
- Optional campaign
- Status

---

## 12. Mission Categories

Initial categories:

- ENVIRONMENT
- EDUCATION
- COMMUNITY
- DIGITAL
- SOCIAL

---

## 13. Mission Types

### STANDARD

General missions available continuously.

### LIMITED

Missions available during a specific period.

### SPONSORED

Campaign-linked missions associated with a demo sponsor or organization.

---

## 14. Mission Difficulties

- EASY
- MEDIUM
- HIGH

Difficulty is descriptive. Rewards are explicitly configured by the administrator and are not automatically calculated from difficulty.

---

## 15. Mission Lifecycle

```text
DRAFT
  ↓
ACTIVE
  ↓
PAUSED
  ↓
ACTIVE
  ↓
ENDED
```

Rules:

- DRAFT is hidden from normal users.
- ACTIVE can be joined.
- PAUSED cannot receive new participants.
- ENDED cannot receive new participants.
- Existing valid submissions may still be reviewed after a mission ends.

---

## 16. Initial Prototype Missions

### 16.1 Clean Your Neighborhood

Category: ENVIRONMENT  
Difficulty: EASY  
Type: STANDARD  
Reward: 100 XP + 30 Impact Points  
Repeat: Weekly  
Participation expiry: 48 hours

Evidence:

- Before photo
- After photo
- Description
- Proof code
- Estimated waste collected

Impact metric:

- Waste Collected (kg)

Possible SDG alignment:

- SDG 11
- SDG 12

---

### 16.2 Plant for Tomorrow

Category: ENVIRONMENT  
Difficulty: MEDIUM  
Reward: 150 XP + 40 Impact Points

Evidence:

- Before photo
- After photo
- Description
- Proof code
- Number of plants

Impact metric:

- Plants Added

Possible SDG alignment:

- SDG 11
- SDG 13

---

### 16.3 Share Knowledge

Category: EDUCATION  
Difficulty: MEDIUM  
Reward: 200 XP + 50 Impact Points

Evidence:

- Activity photo
- Description
- Duration
- People reached

Impact metrics:

- Teaching Hours
- People Reached

Possible SDG alignment:

- SDG 4

---

### 16.4 Donate a Book

Category: EDUCATION  
Difficulty: EASY  
Reward: 100 XP + 25 Impact Points

Evidence:

- Donation photo
- Description
- Number of books

Impact metric:

- Books Donated

Possible SDG alignment:

- SDG 4

---

### 16.5 Help a Local Business

Category: DIGITAL  
Difficulty: HIGH  
Reward: 300 XP + 80 Impact Points

Evidence:

- Before/after result
- Description
- Business name
- Work performed

Impact metric:

- Businesses Assisted

Possible SDG alignment:

- SDG 8

---

### 16.6 Community Volunteer

Category: COMMUNITY  
Difficulty: MEDIUM  
Type: LIMITED or SPONSORED  
Reward: 250 XP + 70 Impact Points

Evidence:

- Event photo
- Event/partner code
- Description
- Volunteer duration

Impact metric:

- Volunteer Hours

Possible SDG alignment:

- SDG 11
- SDG 17

---

## 17. Participation

A Participation record is created when a user joins a mission.

The platform must:

- Generate a unique proof code.
- Store join time.
- Store expiry time.
- Prevent multiple active participations for the same user and mission.
- Allow cancellation before submission.
- Mark expired participations.
- Enforce mission repeat rules.

---

## 18. Participation Lifecycle

```text
JOINED
   ↓
SUBMITTED
   ↓
UNDER_REVIEW
   ↓
 ┌───────────────┬──────────────────────┬───────────┐
 ▼               ▼                      ▼
APPROVED    REVISION_REQUESTED        REJECTED
                  ↓
             RESUBMITTED
                  ↓
            UNDER_REVIEW
                  ↓
           APPROVED / REJECTED
```

Additional terminal states:

- CANCELLED
- EXPIRED

Only one revision is allowed per participation.

---

## 19. Evidence Submission

A user submits evidence according to the mission requirements.

Supported prototype evidence:

- JPG
- PNG
- WEBP
- Maximum 5 MB per image

Video upload is out of scope.

Evidence may include:

- Before photo
- After photo
- Supporting photo
- Description
- Proof code
- Partner/event code
- Impact values

---

## 20. Evidence Privacy

Evidence is private by default.

Evidence may be accessed by:

- The user who owns the submission
- Authorized administrators

Evidence must not be exposed on the public portfolio.

Users must confirm:

- Evidence is genuine.
- Evidence does not expose sensitive personal information without permission.

The product should follow a dignity-first approach:

> Proof of impact, not proof of people's suffering.

---

## 21. Verification

Final verification is performed by a human administrator.

The platform may provide rule-based risk indicators, but those indicators:

- Never automatically approve.
- Never automatically reject.
- Never replace the human verifier.

Possible decisions:

- APPROVE
- REJECT
- REQUEST REVISION

---

## 22. Verification Review Screen

The administrator should see:

- Submission ID
- User
- Mission
- Evidence
- Reported impact
- Editable verified impact
- Risk level
- Risk flags
- User verification history
- Verification actions

---

## 23. Rejection Reasons

Predefined rejection reasons:

- INSUFFICIENT_EVIDENCE
- DUPLICATE_EVIDENCE
- MISSION_REQUIREMENTS_NOT_MET
- INVALID_PROOF_CODE
- ACTIVITY_CANNOT_BE_VERIFIED
- OTHER

Admin may add an optional note.

---

## 24. Revision Rules

- Maximum one revision.
- Revision should be used when evidence may be corrected.
- Rejection should be used when the activity is invalid or cannot reasonably be verified.
- A resubmitted item returns to UNDER_REVIEW.

---

## 25. Risk Engine

Prototype risk checks are explainable and deterministic.

Possible indicators:

- Exact duplicate image
- Invalid proof code
- Too many submissions in one day
- Very new account

Example scoring:

```text
Exact duplicate evidence   +50
Invalid proof code         +30
More than 5 submissions    +20
Account age < 24h          +10
```

Risk levels:

```text
0–29   LOW
30–59  MEDIUM
60+    HIGH
```

Risk score is advisory only.

---

## 26. Duplicate Detection

Prototype duplicate detection uses exact file hashing.

Flow:

```text
Upload File
   ↓
Generate SHA-256 Hash
   ↓
Compare with Existing Evidence Hashes
   ↓
If Match → Add Risk Flag
```

A production version may use perceptual hashing, but that is not required for the prototype.

---

## 27. Gamification

Gamification consists of:

- XP
- Levels
- Impact Points
- Badges
- Leaderboard
- Notifications

Gamification supports engagement but should not make the product feel childish.

---

## 28. XP

XP represents long-term progression.

Rules:

- XP is granted only after approved submissions.
- XP cannot be redeemed.
- XP does not decrease when rewards are redeemed.
- XP determines user level.

Prototype levels:

| Level | Title | Minimum XP |
|---|---|---:|
| 1 | Explorer | 0 |
| 2 | Contributor | 500 |
| 3 | Advocate | 1200 |
| 4 | Changemaker | 2000 |
| 5 | Impact Leader | 3500 |

---

## 29. Impact Points

Impact Points are the reward currency.

Rules:

- Points are granted only after approved submissions.
- Points may be redeemed for simulated prototype rewards.
- Points do not determine user level.
- Users cannot buy points.
- Redeeming points does not affect XP.

---

## 30. Badges

Initial prototype badges:

### Eco Starter
First approved environmental mission.

### Eco Guardian
Five approved environmental missions.

### Knowledge Giver
First approved education mission.

### Digital Helper
First approved digital empowerment mission.

### Community Builder
First approved community mission.

### Verified Contributor
Ten total approved submissions.

Badges are awarded once.

---

## 31. Leaderboard

Leaderboard measures contribution, not personal moral value.

Label:

> Top Contributors

Leaderboard basis:

- XP earned

Views:

- This Month
- All Time

Impact Points are not used because they may be redeemed.

---

## 32. Impact Metrics

Every mission may define up to two measurable impact metrics.

Examples:

| Mission | Metric |
|---|---|
| Clean Your Neighborhood | Waste Collected (kg) |
| Plant for Tomorrow | Plants Added |
| Share Knowledge | Teaching Hours, People Reached |
| Donate a Book | Books Donated |
| Help a Local Business | Businesses Assisted |
| Community Volunteer | Volunteer Hours |

---

## 33. Reported vs Verified Impact

The system must distinguish:

- Reported impact — submitted by user
- Verified impact — approved or corrected by verifier

Public statistics and portfolios must use verified impact only.

Example:

```text
Reported:
50 kg

Verified:
5 kg
```

Only 5 kg contributes to public metrics.

---

## 34. Impact Portfolio

Every user has an impact portfolio.

The portfolio shows:

- Name
- Level
- Total XP
- Current Impact Points
- Verified actions
- Impact metrics
- Badges
- Recent verified activities

Example:

```text
34 Verified Actions
24 kg Waste Collected
8 Trees Planted
12 Teaching Hours
8 Books Donated
2 Businesses Assisted
18 Volunteer Hours
```

---

## 35. Public Portfolio

Optional prototype feature.

May show:

- Name
- Level
- Badges
- Verified impact totals
- Verified mission history

Must not show:

- Email
- Exact private location
- Submission evidence
- Proof code
- Sensitive verifier notes

---

## 36. Community Impact

Public community impact should display aggregate verified data such as:

- Verified Actions
- Contributors
- Waste Collected
- Plants Added
- Books Donated
- Teaching Hours
- Volunteer Hours
- Businesses Assisted

Only verified values may contribute.

---

## 37. Rewards

Rewards are **prototype simulations**.

The system does not perform real financial transactions.

Reward examples:

- Coffee Voucher — 500 points
- Book Voucher — 750 points
- Learning Voucher — 1000 points
- Social Contribution Reward — 1500 points
- Community Scholarship — 5000 points

Each reward may include:

- Point cost
- Demo display value
- Demo sponsor
- Stock
- Demo redemption code

---

## 38. Reward Prototype Notice

The UI must clearly state:

> Monetary values and rewards shown in this prototype are simulations and do not represent real financial transactions.

---

## 39. Reward Redemption

Redemption flow:

```text
User Selects Reward
      ↓
Check Point Balance
      ↓
Check Stock
      ↓
Subtract Points
      ↓
Reduce Stock
      ↓
Create Redemption
      ↓
Generate Demo Code
      ↓
Create Notification
```

All operations should be performed safely as one transaction where practical.

---

## 40. Campaigns

Campaigns represent collective social initiatives.

Example:

### Green City Challenge

Demo sponsor:

EcoFuture Foundation

Target:

1000 kg waste collected

Campaign displays:

- Participants
- Verified actions
- Current verified impact
- Target progress
- Demo reward pool
- Demo sponsor

---

## 41. Organizations

Prototype organizations are seeded demo entities.

Full organization onboarding is out of scope.

Example organization:

- EcoFuture Foundation
- Green Future Community
- GoodCup Demo Partner
- EduFuture Demo Partner

---

## 42. Sponsored Reward Model

Prototype financial data is simulated.

Future production concept:

```text
Sponsor / CSR Partner
        ↓
Funds Campaign
        ↓
Platform Creates Structured Mission
        ↓
Community Participates
        ↓
Verified Impact
        ↓
Rewards + Impact Reporting
```

This is a future sustainability concept, not a real payment implementation.

---

## 43. Notifications

Prototype in-app notifications:

- MISSION_VERIFIED
- REVISION_REQUESTED
- MISSION_REJECTED
- BADGE_UNLOCKED
- LEVEL_UP
- REWARD_REDEEMED

Real-time WebSocket infrastructure is not required.

Notifications may refresh on page load.

---

## 44. Public Pages

Required:

- Landing Page
- Mission Explorer
- Mission Detail
- Community Impact
- Leaderboard
- Rewards
- Login
- Register

---

## 45. User Pages

Required:

- Dashboard
- My Missions
- Submit Evidence
- Submission Detail
- Impact Portfolio
- Rewards
- Reward History
- Notifications
- Profile Settings

---

## 46. Admin Pages

Required:

- Admin Dashboard
- Missions
- Create/Edit Mission
- Submission Queue
- Submission Review
- Users
- Rewards
- Campaigns
- Analytics

---

## 47. Organization Pages

Prototype only:

- Organization Dashboard
- Campaign Detail
- Impact Report Preview

---

## 48. Landing Page Structure

Recommended order:

1. Hero
2. Community impact summary
3. How it works
4. Featured missions
5. Featured sponsored campaign
6. Impact portfolio preview
7. CTA

Hero copy example:

### Turn Good Actions Into Measurable Impact

> Join verified social missions, earn recognition and rewards, and build your social impact portfolio.

---

## 49. User Dashboard

Should prioritize:

- Level progression
- XP progress
- Impact Points
- Verified Actions
- Active missions
- Recent activity
- Suggested missions

The dashboard should feel like a user progression screen, not an admin analytics page.

---

## 50. Admin Dashboard

Should prioritize:

- Pending reviews
- High-risk reviews
- Active missions
- Verified today
- Review queue
- Recent verification activity

---

## 51. Analytics

Prototype analytics should include:

- Verified actions
- Contributors
- Impact by category
- Approval rate
- Rejection rate
- Revision rate
- Campaign progress

Predictive analytics are out of scope.

---

## 52. Prototype Demo Scenario

The main competition demo should follow one complete story.

### Initial demo user state

```text
Name: Haikal
XP: 1900
Level: Advocate
Impact Points: 470
Approved environment missions: 0
```

### Demo Mission

Clean Your Neighborhood

Reward:

```text
+100 XP
+30 Impact Points
```

### Expected approval result

```text
XP: 1900 → 2000
Level: Advocate → Changemaker
Points: 470 → 500
Badge: Eco Starter unlocked
Waste impact: +3 kg
```

### Reward

Coffee Voucher:

```text
Cost: 500 Impact Points
```

After redemption:

```text
Points: 500 → 0
Demo redemption code generated
```

The single demo flow therefore shows:

- Mission participation
- Evidence submission
- Human verification
- Risk indicators
- Impact validation
- XP
- Level up
- Points
- Badge unlock
- Notification
- Reward redemption
- Community impact update

---

## 53. Demo Data

The prototype may contain seeded demonstration data.

Any large platform statistics that do not represent real production users must be identified as demonstration data.

Recommended baseline:

- 8,700+ verified actions
- 2,400+ contributors
- 12,000+ kg waste collected
- Thousands of volunteer/education impact metrics

The real prototype actions should be added on top of the baseline so numbers visibly change during the demo.

---

## 54. Prototype Scope — Real Implementation

The following should work:

- Authentication
- Role-based access
- Mission browsing
- Mission joining
- Unique proof code
- Participation expiry
- Evidence upload
- Submission workflow
- Exact duplicate hashing
- Rule-based risk indicators
- Human approval/rejection/revision
- Verified impact
- XP
- Levels
- Impact Points
- Badges
- Notifications
- Impact portfolio
- Community impact
- Leaderboard
- Reward redemption
- Mission management
- Basic analytics

---

## 55. Prototype Scope — Simulated

The following are simulated:

- Real monetary reward
- Real sponsor funding
- Real CSR funding
- Bank transfer
- E-wallet
- Payment gateway
- KYC
- Sponsor billing
- Real scholarship disbursement
- Real organization settlement

---

## 56. Out of Scope

Do not implement unless the scope is explicitly changed:

- Real payment infrastructure
- Banking integration
- Withdrawals
- Wallet top-up
- Cryptocurrency
- Blockchain
- KYC
- Social feed
- Likes
- Comments
- Followers
- Chat
- Video evidence
- AI final verification
- AI automatic rejection
- GPS enforcement
- Full organization onboarding
- Complex permission systems
- Microservices
- Advanced distributed fraud systems

---

## 57. Future Features

Possible production extensions:

- Mobile application
- QR event verification
- Partner verification
- Institution verification network
- Advanced perceptual image hashing
- Automatic sensitive-face blur
- GPS-assisted proof
- Real sponsor integration
- Real campaign funding
- More sophisticated fraud analysis
- Organization team management
- Verified institutional portfolios

---

## 58. Technology Direction

Recommended prototype stack:

```text
Frontend + Backend:
Next.js + TypeScript

UI:
Tailwind CSS + shadcn/ui

Database:
SQLite via node:sqlite (fully local, zero dependencies)

Authentication:
Local session auth (scrypt + httpOnly cookies)

Storage:
Local filesystem evidence storage

Validation:
Zod

Forms:
React Hook Form

Charts:
Recharts

Deployment:
Vercel

Repository:
GitHub
```

Architecture:

> Modular monolith

---

## 59. UX Direction

The interface should be:

- Modern
- Professional
- Social-impact focused
- Gamified but not childish
- Accessible
- Responsive
- Clear about verification state
- Clear about demo financial simulations

Gamification should appear through:

- XP
- Progress bars
- Levels
- Badges
- Mission status
- Notifications
- Micro-interactions

Avoid excessive gaming illustrations.

---

## 60. Copywriting Direction

Use direct and specific product language.

Avoid vague AI-style marketing phrases such as:

- “Revolutionizing kindness”
- “Unlock your potential”
- “Empowering a brighter tomorrow”
- “Together we can change the world”

Prefer:

> Complete verified social missions and track the impact you create.

---

## 61. Core Success Criteria

The prototype is considered successful when the complete demo flow works reliably:

```text
Login
↓
Select Mission
↓
Join
↓
Submit Evidence
↓
Admin Review
↓
Approve
↓
XP / Points / Badge / Impact Update
↓
User Portfolio Update
↓
Reward Redemption
↓
Community Impact Update
```

---

## 62. Non-Functional Requirements

### Security

- Do not trust client-provided user IDs.
- Do not trust client-provided reward values.
- Verify authorization server-side.
- Evidence access must be restricted.
- Reward processing must be idempotent.

### Reliability

- Approval should not grant duplicate rewards.
- Critical multi-step writes should use transactions when possible.
- Production build must pass before a feature is considered complete.

### Performance

Prototype target:

- Fast navigation
- Responsive mission browsing
- Reasonable image uploads
- No unnecessary background processing

### Accessibility

- Semantic HTML
- Keyboard-accessible controls
- Visible focus states
- Sufficient color contrast
- Clear labels
- Error messages tied to fields

### Responsiveness

Support:

- Desktop
- Tablet
- Mobile

Admin experience may prioritize desktop while remaining usable on smaller screens.

---

## 63. Prototype Definition of Done

A feature is not complete only because it appears visually.

A feature is complete when:

- Business rules are satisfied.
- Authorization is correct.
- Validation exists.
- Loading states exist.
- Error states exist.
- Success states exist.
- Data is persisted correctly.
- It does not break responsive layout.
- TypeScript passes.
- Lint passes.
- Production build passes.

---

## 64. Final Product Positioning

### Short Description

> A gamified web platform that turns verified social contributions into measurable impact, personal recognition, and rewards.

### Extended Description

> ImpactQuest enables users to join structured social missions, submit evidence, receive human verification, earn XP and Impact Points, build a verified impact portfolio, and contribute to measurable community outcomes.

### Core Message

> Do impact. Get verified. Build your record.

---

## 65. Product Guardrail

The platform must never be framed as:

> “Who is the kindest person?”

It should be framed as:

> “How much verified impact can we create together?”
