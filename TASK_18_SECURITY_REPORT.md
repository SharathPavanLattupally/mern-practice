
# Task 18 – Security and Code Quality Report

**Project:** Advanced Project & Team Management System (MERN Stack)
**Repository:** https://github.com/SharathPavanLattupally/mern-practice
**Branch:** `feature/task-18-security-hardening`
**Base commit:** `ec2684b`
**Status:** Security improvements implemented; verification partially completed.
## 1. Verification Results

| Area | Result | Evidence |
|---|---|---|
| Backend automated tests | PASS | 22 test files; 168 tests passed |
| CSRF middleware tests | PASS | 5 additional tests passed |
| Frontend automated tests | PASS (previously reported) | 4 test files; 22 tests passed |
| Backend dependency audit | PASS | `npm.cmd audit`: 0 vulnerabilities |
| Frontend dependency audit | PASS | `npm.cmd audit`: 0 vulnerabilities |
| Frontend lint | PASS (previously reported) | `npm.cmd run lint` completed successfully |
| Frontend production build | PASS (previously reported) | `npm.cmd run build` completed successfully |
| Git whitespace verification | PASS | `git diff --check` completed without errors |
| Environment file protection | PASS | Environment files are ignored by Git |
| Dependency exclusion | PASS | `node_modules` is not tracked |
| Student database indexes | PASS | Five additional indexes created and verified in MongoDB |
| GitHub feature branch | IN PROGRESS | `feature/task-18-security-hardening` created; push and pull request pending |

The frontend production build previously emitted a bundle-size warning. The generated JavaScript bundle was approximately 705.92 kB minified, exceeding Vite's 500 kB warning threshold. This was a warning, not a build failure. Route-level lazy loading and code splitting are recommended future improvements.

## 2. Security Improvements Implemented

The following security controls were implemented or reviewed during Task 18:

- Environment-based configuration for secrets and database connection settings.
- JWT access tokens configured with a 15-minute expiry and HS256 signing.
- Authentication middleware verifies HS256 tokens and checks the user's token version.
- Passwords are hashed using bcrypt with 12 salt rounds.
- Refresh tokens are generated using cryptographically secure random bytes; only their SHA-256 hashes are stored in the database.
- Refresh-token cookies use `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- Password-reset tokens are generated randomly, stored as hashes, and expire after 15 minutes.
- Successful password changes and password resets increment `tokenVersion` and clear stored refresh-token data.
- Logout increments `tokenVersion`, clears refresh-token data, and clears the refresh-token cookie.
- Registration, profile updates, password operations, and role updates include input validation.
- Profile updates use an explicit allowlist of editable fields.
- Role updates validate the role and user ID format.
- User-provided usernames are HTML-escaped before insertion into password-reset email HTML.
- Generic error responses are used in reviewed authentication controller paths to avoid exposing internal error messages.
- Request body limits and CORS allowlisting are configured in the Express application.
- Authentication rate limiting is applied to registration, login, and password-reset routes.
- Student API routes use authentication and role-based authorization.
- Student input validation rejects unsupported fields and validates supplied values.
- Student search input is length-limited and regex special characters are escaped.

## 3. CSRF Verification

Origin-based CSRF middleware was implemented in `server/app.js`.

Five additional automated tests were added to `server/tests/app.test.js`:

1. Trusted Origin requests pass CSRF middleware.
2. Untrusted Origin requests are rejected.
3. Requests without an Origin header and with a refresh cookie are rejected.
4. Requests without an Origin header and without a refresh cookie pass the middleware.
5. Safe GET requests skip Origin validation.

**Test result:** All five additional tests passed as part of the backend test suite.

The middleware tests verify the implemented Origin-checking behavior. However, complete CSRF protection across every browser cookie-authenticated state-changing endpoint still requires review.

## 4. MongoDB Indexes and Performance

Student indexes were declared in `server/models/Student.js`.

During verification, five additional indexes were created and confirmed in the MongoDB database:

| Index | Purpose |
|---|---|
| `{ createdAt: -1, _id: 1 }` | Recent student sorting |
| `{ fullName: 1 }` | Student name filtering |
| `{ course: 1 }` | Course filtering |
| `{ courseId: 1 }` | Course relationship lookup |
| `{ gender: 1 }` | Gender filtering |

The following unique indexes were also verified in the database:

- Student email.
- Course code.
- Instructor email.
- User username.
- User email.

The production database configuration uses `autoIndex: false`. Therefore, index creation must be handled through an appropriate deployment or database migration process.

## 5. Dependency Audit Record

Both dependency audits reported zero known vulnerabilities at the time of verification.

**Backend:**
`npm.cmd audit` → found 0 vulnerabilities.

**Frontend:**
`npm.cmd audit` → found 0 vulnerabilities.

Dependency audits should be repeated before deployment and whenever dependencies are updated.

## 6. Items Still Requiring Verification

The following items must not be considered fully complete until additional review and testing are performed.

1. **Complete CSRF protection:** Review every cookie-authenticated state-changing endpoint. Confirm that the Origin-based middleware and browser cookie behavior provide appropriate protection.
2. **Record ownership and authorization:** Review student, course, instructor, file, and team-management routes. The student directory currently uses shared records with role-based permissions rather than individual ownership.
3. **Refresh-token lifecycle:** Verify whether a complete refresh-token endpoint and rotation lifecycle exist. If missing, implement and test token rotation, expiry, reuse handling, and revocation.
4. **Sensitive logging:** Review backend controllers and services for passwords, access tokens, refresh tokens, reset tokens, personal data, or database credentials in logs.
5. **MongoDB injection and input sanitization:** An initial review found validated student search input, escaped regex characters, validated course IDs, and server-constructed dashboard queries. A complete review of all query-building code and automated injection tests is still required.
6. **Production cookie and proxy configuration:** Verify HTTPS deployment, trusted proxy configuration where applicable, allowed frontend origins, and cookie behavior in the actual deployment topology.
7. **Rate-limit deployment behavior:** The configured in-memory rate limiter is suitable for a single server process. A shared store such as Redis is recommended if production runs multiple instances.
8. **Security headers and error middleware:** Review the final error handler and verify that malformed JSON, oversized requests, CORS rejections, and unexpected errors return safe and consistent responses.
9. **Dependency cleanup:** A complete unused-dependency and unused-import review has not yet been completed.

## 7. Recommended Next Actions

- Complete the remaining CSRF, authorization, and refresh-token reviews.
- Add automated tests for confirmed security boundaries.
- Review remaining controllers and middleware for injection, sensitive logging, and error leakage.
- Re-run backend and frontend tests, lint, build, and dependency audits.
- Complete unused dependency and import cleanup.
- Update this report with additional evidence as verification progresses.
- Push the security feature branch and submit a GitHub pull request for review.

## 8. Current Conclusion

Task 18 introduced important security and code-quality improvements to the MERN application.

The latest backend test run passed all 168 tests across 22 test files. Both backend and frontend dependency audits reported zero vulnerabilities. Five additional Student indexes were created and verified in MongoDB, and five additional CSRF middleware tests passed.

However, not every one of the 20 security requirements has been fully verified. The remaining limitations listed in Section 6 must be addressed before claiming complete security approval.

**Final status: Partially verified – additional security review and production verification remain pending.**