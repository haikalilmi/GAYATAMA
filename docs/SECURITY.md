# Security

## Authentication

Enforced in `lib/auth.ts`.

- Passwords are hashed with `scrypt` using a per-user random salt. The stored format is `scrypt:salt:hash`. Verification uses `timingSafeEqual` so comparison time does not leak information.
- A successful login creates a row in `sessions` and sets an HTTP-only cookie named `iq_session`. The cookie stores only the session ID, is `SameSite=Lax`, and is marked `Secure` in production.
- Sessions expire after 30 days. Expired rows are deleted when encountered.
- `requireUser(next)` redirects anonymous visitors to the login page and preserves where they were headed.
- Google sign-in is optional. The OAuth callback in `app/api/auth/callback/route.ts` exchanges the Supabase code, finds or creates a matching row in `users`, and then issues the same application session cookie used by password login.

## Authorization

| Area | Rule | Where |
|---|---|---|
| Admin portal | Only role `ADMIN` may load `/admin`. Other signed-in users see an access denied panel. | `app/admin/layout.tsx` |
| Admin navigation | The Admin Portal link renders only for admins, so regular contributors never see it. | `components/sidebar.tsx` |
| Joining missions | Only role `USER` may join. | `lib/participation.ts` |
| Organization dashboard | Role `ORGANIZATION` or `ADMIN` only. | `app/org/page.tsx` |
| Submission detail | The owner or an admin. | `lib/submissions.ts` |
| Resubmission | The owner, and only while the submission is `REVISION_REQUESTED`. | `lib/submissions.ts` |
| Review actions | Admin only, enforced by the admin layout. | `app/admin/layout.tsx` |

A central rule applies everywhere: the acting user is always read from the server session with `getCurrentUser()`. No action trusts a user ID, role, or email sent from the browser. Reward amounts on approval are read from the mission row rather than from the form.

## Evidence File Protection

Implemented in `app/api/evidence/[id]/route.ts`.

- The route requires a session. Anonymous requests are redirected to login.
- The requester must be the submission owner or an admin. Anyone else receives `403`.
- Files are served with a private cache header so intermediaries do not retain them.
- Uploaded files are stored outside the public web root under `data/evidence/`, and are only reachable through this route.

## Input Validation

- Every server action parses its input with a Zod schema before use. Schemas live beside the domain logic in `lib/`.
- Uploaded images are validated three ways: declared MIME type, file size, and magic bytes read from the file content.
- SQL is parameterized. `lib/db.ts` converts `?` placeholders into `$1`, `$2`, and so on and passes values through the RPC parameter object rather than concatenating them into the query string.
- Filter values that reach SQL are constrained by enum schemas, for example category, difficulty, risk level, and queue tab.

## Database Access Hardening

- `lib/db.ts` refuses to start if `SUPABASE_SERVICE_ROLE_KEY` is missing, or if it holds an anon key rather than a server secret. This prevents the application from silently running with browser-level credentials.
- `db/supabase-hardening.sql` grants `EXECUTE` on `exec_sql(text, jsonb)` to `service_role` and revokes it from `PUBLIC`, `anon`, and `authenticated`. Run it with a database owner account in the Supabase SQL editor.
- The `exec_sql` RPC returns SQL exceptions as rows rather than throwing. `lib/db.ts` detects that shape and raises an error instead of reporting a failed write as successful, and it does not surface the embedded parameters.

## Error Handling

- Domain errors use typed classes: `JoinError`, `SubmitError`, `VerificationError`, `RedeemError`, `EvidenceError`, `MissionAdminError`, `RewardAdminError`.
- Server actions catch these and return a readable message to the form. Unexpected errors propagate to the framework rather than being swallowed.
- Public error responses stay short. Missing evidence returns `404`, forbidden access returns `403`, and a deleted file returns `410`.

## Known Gaps

These are real limitations of the prototype, stated plainly so they are not mistaken for finished work.

1. **No atomic transactions.** Approval and redemption run as a sequence of separate RPC calls. If a call fails partway through, the record can be left partially updated. A production build should move each flow into a single database function so it commits or rolls back as one unit.
2. **Evidence stored on local disk.** `data/evidence/` is fine for a single-machine demo but does not survive redeploys and cannot be shared across instances. Object storage with signed URLs would be the production path.
3. **Application-level authorization only.** Because all queries pass through one server-side RPC with a service key, row-level security in Postgres is not the enforcement point. The checks in `lib/` and the route guards are what protect data, so any new entry point must repeat them.
4. **No rate limiting.** Nothing throttles login attempts or submission volume beyond the advisory risk score.
5. **No CSRF token.** Mutations rely on `SameSite=Lax` cookies and Next.js server action protections rather than an explicit token.
6. **Google OAuth users have no local password.** Their `password_hash` is a placeholder, and they must continue using Google to sign in.
7. **Demo credentials are published.** The seeded accounts in the README exist for judging and must not be reused in a real deployment.
