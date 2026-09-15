# Business Rules

These are the rules the code actually enforces. Each entry names the module that owns it.

## Mission Visibility

- Only missions with status `ACTIVE` appear in the catalog and can be opened by contributors. Enforced in `lib/missions.ts`.
- New missions created by an admin start as `DRAFT` and stay hidden until published. Enforced in `lib/missions.ts`.
- Status changes follow a fixed flow. Anything else is rejected. Enforced in `lib/missions.ts`.

| From | Allowed next states |
|---|---|
| `DRAFT` | `ACTIVE` |
| `ACTIVE` | `PAUSED`, `ENDED` |
| `PAUSED` | `ACTIVE`, `ENDED` |
| `ENDED` | none |

## Joining a Mission

Enforced in `lib/participation.ts`.

- Only accounts with role `USER` may join. Admin and organization accounts are told they act as managers or verifiers.
- The mission must be `ACTIVE`, and the current time must fall inside any `start_at` and `end_at` window.
- A contributor may hold only one active slot per mission. Active means `JOINED`, `SUBMITTED`, `UNDER_REVIEW`, `REVISION_REQUESTED`, or `RESUBMITTED`.
- For `ONCE` missions, an already approved participation blocks joining again.
- For `WEEKLY` missions, the contributor must wait seven days after the last approved completion.
- Joining generates a unique proof code in the format `IQ-XXXXXX`, using an alphabet that omits easily confused characters.
- The slot expires after `participation_expiry_hours`. Expired slots are marked `EXPIRED` when the contributor's mission list is read.
- A `JOINED` slot can be cancelled before evidence is submitted. Cancelling releases the slot.

## Evidence Submission

Enforced in `lib/submissions.ts` and `lib/evidence.ts`.

- The participation must belong to the signed-in contributor and must still be `JOINED`.
- An expired slot is marked `EXPIRED` and the submission is rejected.
- Required fields depend on the mission flags: description, proof code, partner code, before photo, after photo.
- Every mission must include at least one photo. If a mission requires neither a before nor an after photo, a `SUPPORTING_PHOTO` becomes mandatory.
- The proof code entered by the contributor must match the code issued at join time. A mismatch is rejected when the code is required, and recorded as a risk flag when it is optional.
- Files must be JPG, PNG, or WEBP, at most 5 MB each. The MIME type is checked, and the file content is checked against magic bytes so a renamed file is rejected.
- Each stored file receives a SHA-256 hash.
- Reported metric values must be finite numbers greater than or equal to zero, with an upper bound of 1,000,000,000.
- A participation can be submitted only once.

## Risk Scoring

Enforced in `lib/risk.ts`. The score is advisory. It never approves or rejects anything on its own.

| Condition | Points | Severity |
|---|---|---|
| Identical file hash already stored | +50 | HIGH |
| Proof code does not match the issued code | +30 | MEDIUM |
| Five or more submissions in the last 24 hours | +20 | MEDIUM |
| Account created less than 24 hours ago | +10 | LOW |

| Total score | Level |
|---|---|
| 60 or more | `HIGH` |
| 30 to 59 | `MEDIUM` |
| Below 30 | `LOW` |

Every flag is stored with the submission and shown to the reviewer alongside its explanation.

## Verification

Enforced in `lib/verification.ts`.

- Only submissions in `PENDING` or `UNDER_REVIEW` can be approved, rejected, or sent back for revision.
- Starting a review moves the submission and its participation to `UNDER_REVIEW` so two reviewers do not handle it twice.
- Approving requires a verified value for every mission metric. Values are validated with the same bounds as reported values.
- On approval, the code sets the submission to `APPROVED`, marks the participation `APPROVED` and `rewarded`, writes the verified impact values, grants XP and points, awards any newly earned badges, sends notifications, and appends an audit log entry.
- XP and point amounts are read from the mission record, never from the submitted form.
- Approving an already approved submission returns the previous result and grants nothing further.
- Rejecting requires a reason drawn from the allowed list in `lib/review-constants.ts`. A free-form note may be added.
- Requesting a revision requires a note. It is allowed only once per submission.
- Every action writes a row to `verification_logs` with the previous and new status.

## Revision and Resubmission

Enforced in `lib/submissions.ts`.

- Only a submission in `REVISION_REQUESTED` can be resubmitted, and only by its owner.
- Resubmission requires the same fields as the original submission, including photos.
- The resubmission moves the submission to `UNDER_REVIEW` and the participation to `UNDER_REVIEW`.
- New files replace the old ones, and the previous files are deleted from disk.
- The risk score is recalculated.

## Gamification

Levels, from `lib/level.ts`:

| Total XP | Level | Title |
|---|---|---|
| 0 to 499 | 1 | Explorer |
| 500 to 1,199 | 2 | Contributor |
| 1,200 to 1,999 | 3 | Advocate |
| 2,000 to 3,499 | 4 | Changemaker |
| 3,500 and above | 5 | Impact Leader |

Badges, from `lib/gamification.ts`. A badge is awarded once and only once per contributor.

| Badge | Condition |
|---|---|
| Eco Starter | 1 approved environment mission |
| Eco Guardian | 5 approved environment missions |
| Knowledge Giver | 1 approved education mission |
| Digital Helper | 1 approved digital mission |
| Community Builder | 1 approved community mission |
| Verified Contributor | 10 approved submissions total |

## Rewards

Enforced in `lib/rewards.ts`.

- Only `ACTIVE` rewards are listed to contributors.
- Redemption requires sufficient points and available stock.
- A successful redemption decreases the balance, decreases stock by exactly one, writes a point ledger entry with the resulting balance, generates a unique demo code, and sends a notification.
- Redeeming does not reduce XP. XP and points are separate balances.
- Insufficient points and exhausted stock produce specific messages rather than generic failures.
- Reward vouchers and point values are simulated. No real money moves.

## Impact Reporting

Enforced in `lib/impact.ts` and `lib/campaigns.ts`.

- Personal portfolio totals and community totals count only submissions with status `APPROVED` and only `verified_value`, never `reported_value`.
- Community figures add the seeded `demo_baselines` on top of verified contributions. The community page states this openly.
- Campaign progress sums verified values for the campaign's target metric across its missions.
- The leaderboard ranks by XP. The monthly view sums XP transactions created in the current month.

## Notifications

Enforced in `lib/notifications.ts` and its callers.

| Event | Type |
|---|---|
| Submission approved | `MISSION_VERIFIED` |
| Level increased | `LEVEL_UP` |
| Badge earned | `BADGE_UNLOCKED` |
| Revision requested | `REVISION_REQUESTED` |
| Submission rejected | `MISSION_REJECTED` |
| Reward redeemed | `REWARD_REDEEMED` |
