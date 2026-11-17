# ChainIntel — Backend Notes

Living document. Fed to the backend team (or future us) when the API work begins. Every item below is already reflected in the frontend's mock layer and UI; the backend must honour it.

---

## 1. Authentication model — invite-only, no self-registration

**Hard rule:** There is **no public sign-up endpoint.** Ever. Not per-tenant, not per-plan, not behind a flag. Users can only exist because someone with authority created them. This is a compliance-grade banking product — public registration is a non-starter.

### 2.1 Endpoints

**`POST /auth/login`**
- **Auth:** none
- **Body:** `{ email, password }`
- **Server behaviour:**
  1. Look up user by email — case-insensitive, trimmed
  2. Check `status` (`Invited` / `Disabled` → reject `401` with the generic message)
  3. Check tenant `status = 'Active'`
  4. Check lockout window
  5. Verify password hash (Argon2id, cost 3, memory 64MB per OWASP)
  6. On failure:
     - Increment `failed_attempts`; audit `{ action: 'Failed sign-in', result: 'Failed' }`
     - At 5 → `locked_until = now + 15 min`; audit `{ action: 'Account locked' }`
     - Return `401 { error: 'Invalid email or password' }` — identical message for all failure causes
  7. On success:
     - Reset `failed_attempts`
     - Generate a 6-digit OTP (§6), send to user's email
     - Generate `mfa_challenge_token` (32-byte random, hashed, **TTL 5 min**, single-use)
     - Audit `{ action: 'Sign-in (OTP sent)', result: 'Success' }`
- **Response:** `200 { mfaRequired: true, challengeToken, maskedEmail }`
  - **Critical:** do NOT return the user object or tokens before OTP verification
  - `maskedEmail` = `s***a.ali@examplebank.com` — for display only

**`POST /auth/mfa/verify`**
- **Auth:** none
- **Body:** `{ challengeToken, code }`
- **Server behaviour:**
  1. Look up challenge by token hash; reject if expired/used/not found
  2. Look up the latest unconsumed `otp` row for the user with `purpose = 'login_mfa'`; reject if none
  3. Check `attempts < 5` — on 5th failure, delete the challenge, force re-login
  4. Compare `code` against `otp.code_hash` (Argon2id)
  5. On failure: increment `otp.attempts`, return `401 { error: 'Incorrect or expired code' }`
  6. On success:
     - Mark `otp.consumed_at = now`
     - Delete challenge
     - Issue access token + refresh token (§3)
     - Audit `{ action: 'Sign-in', result: 'Success' }`
- **Response:** `200 { user, permissions, tenant, accessToken, expiresIn }` + `Set-Cookie: refresh_token=...`

**`POST /auth/mfa/resend`**
- **Auth:** challengeToken
- **Server:** invalidate previous OTP for this challenge, generate a new one, send email
- **Rate limit:** 3 sends per 15 min per user
- **Response:** `200 { expiresAt }`

**`POST /auth/logout`** — unchanged.

**`POST /auth/refresh`** — unchanged.

## 3. Password reset — email OTP, three steps

**`POST /auth/password-reset/send-otp`**
- **Auth:** none
- **Body:** `{ email }`
- **Server behaviour:**
  1. Look up user by email
  2. **Always** respond `200 { message: 'If an account exists, a code has been sent.' }` — identical timing, identical body
  3. If user exists and `status = 'Active'`:
     - Rate limit: reject if 3 OTPs already sent for `password_reset` in last 15 min
     - Invalidate any existing unconsumed `password_reset` OTP
     - Generate 6-digit OTP, send email
     - Audit `{ action: 'Password reset OTP sent' }`
- **Response:** `200` (always)

**`POST /auth/password-reset/verify-otp`**
- **Auth:** none
- **Body:** `{ email, code }`
- **Server behaviour:**
  1. Look up user + latest unconsumed `password_reset` OTP
  2. Check `attempts < 5`
  3. Compare hash
  4. On success:
     - Mark OTP consumed
     - Generate `reset_session_token` (32-byte random, hashed, **TTL 5 min**, single-use)
     - Audit `{ action: 'Password reset OTP verified' }`
- **Response:** `200 { resetToken }`

**`POST /auth/password-reset/reset`**
- **Auth:** resetToken (body)
- **Body:** `{ resetToken, newPassword }`
- **Server behaviour:**
  1. Look up reset session by token hash; reject if expired/used/not found
  2. Enforce password policy (min 12 chars in prod, no reuse of last 3)
  3. Update hash, `password_changed_at = now`
  4. Delete reset session
  5. **Invalidate all refresh tokens** for the user (forces re-login everywhere)
  6. Audit `{ action: 'Password reset completed' }`
- **Response:** `200`

## 6. Two-factor authentication — email OTP

| Concern | Value |
|---|---|
| Factor | 6-digit numeric code delivered to the user's verified email |
| Digits | 6 |
| TTL | **10 minutes** |
| Attempts per OTP | 5 (then invalidate and force re-login) |
| Rate limit — send | 3 per 15 min per user |
| Single-use | Yes — consumed on successful verification |
| Storage | Argon2id hash at rest, never stored in plaintext |
| Delivery | Transactional email (SES / SendGrid / Postmark) with 30s SLA target |
| Enforcement | Login is **two-step, mandatory** — password success alone never returns a session |

**Security note (must be acknowledged by Product/Security):**
Email OTP is materially weaker than TOTP: an attacker with access to the user's email account can bypass the second factor entirely. Mitigations to implement:
- Hard-timeout the OTP (10 min) and invalidate on any password change
- Strict per-user send rate limit (3/15 min) + per-IP WAF rate limit
- Alert on rapid OTP requests from disparate IPs (email account compromise indicator)
- Subsequent session actions that increase trust (invite user, disable user, change security settings) require re-verification

**No authenticator-app enrollment.** There is no TOTP secret, no QR code, no recovery codes. The user's verified email is the factor. Bank Admin "Manage MFA" in Bank Settings simply shows whether the user's email is verified — nothing more.

**Deliverability:** transactional email from a dedicated subdomain with SPF/DKIM/DMARC. Bounce and complaint handling mandatory.

## 13. Endpoint summary

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/login` | none | Step 1 — email/password → send OTP, return challenge |
| POST | `/auth/mfa/verify` | challenge | Step 2 — verify OTP → session |
| POST | `/auth/mfa/resend` | challenge | Resend login OTP |
| POST | `/auth/logout` | session | Revoke refresh |
| POST | `/auth/refresh` | refresh cookie | Rotate tokens |
| POST | `/auth/password-reset/send-otp` | none | Send password-reset OTP |
| POST | `/auth/password-reset/verify-otp` | none (OTP) | Verify OTP → resetToken |
| POST | `/auth/password-reset/reset` | resetToken | Consume resetToken + new password |
| POST | `/auth/accept-invite` | none (invite token) | Consume invite, set password |
| POST | `/admin/users/invite` | `manage_users` | Create user in caller's tenant |
| POST | `/admin/users/:id/resend-invite` | `manage_users` | Resend invitation |
| POST | `/admin/users/:id/disable` | `manage_users` | Disable + revoke sessions |
| POST | `/admin/users/:id/enable` | `manage_users` | Re-enable |
| POST | `/platform/tenants` | `SuperAdmin` | Create tenant + initial Bank Admin |
| POST | `/admin/audit/verify` | `view_audit_logs` | Recompute hash chain |
| GET | `/admin/audit/export` | `view_audit_logs` | Signed export |

`POST /auth/accept-invite` no longer requires MFA setup — the accepted invitation just sets the password. The user's first sign-in triggers the standard email-OTP 2FA.


otps
  id              uuid PK
  user_id         uuid FK users(id)
  purpose         text NOT NULL         -- 'login_mfa' | 'password_reset'
  code_hash       char(64) NOT NULL
  attempts        int DEFAULT 0
  expires_at      timestamptz NOT NULL  -- 10 min
  consumed_at     timestamptz
  created_at      timestamptz NOT NULL

password_reset_sessions
  id              uuid PK
  user_id         uuid FK users(id)
  token_hash      char(64) UNIQUE NOT NULL
  expires_at      timestamptz NOT NULL  -- 5 min
  consumed_at     timestamptz
  created_at      timestamptz NOT NULL