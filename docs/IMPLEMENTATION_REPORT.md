> 2026-11-17: Loyiha pnpm monorepoga ko'chirildi: `apps/frontend`, `apps/backend`, `docs/design`. Joriy buyruqlar va yo'llar uchun [README.md](README.md)ni ko'ring. Quyidagi npm/oldingi yo'llar tarixiy yozuvlardir.

# TeamFlow implementation report

RUN_ID: TEAMFLOW-OVERNIGHT-01

Overnight continuation in progress. Current frontend handoff absent at initial overnight inspection. Hibernation gate has not passed; computer must remain running until final integrated GO. Prior verification below remains historical evidence, not final overnight acceptance.

**Current coordination blocker (02:22 Asia/Tashkent):** frontend/FRONTEND_HANDOFF.md appeared, but lacks both mandatory RUN_ID: TEAMFLOW-OVERNIGHT-01 and FRONTEND_STATUS: READY_FOR_CODEX markers, and does not explicitly confirm editing has stopped. It cannot be accepted under the user's strict current-run handoff requirement. A correction request is saved in root COORDINATION.md. Codex has not amended or forged the handoff or taken frontend ownership. Hibernation remains prohibited.

The received handoff declares all dependencies listed. Root npm install completed (133 added, one root lockfile). Read-only frontend typecheck then failed with 12 TS6133 unused-state diagnostics across six pages. No source fixes were attempted while handoff remains invalid. Audit reports two moderate React Router advisories; no high/critical advisories. The upgrade/fix remains queued for authorized frontend takeover. Earlier zero-vulnerability audit and missing-frontend observations below describe the earlier backend-only phase, not the latest full dependency tree.

**Observed dev-server security failure:** root added `tests/dev-server-security.test.mjs` / `npm run test:dev-security`. A temporary Vite instance using the actual frontend config returned HTTP200 for an unauthenticated /@fs request to a synthetic non-secret credential-shaped JSON in backend/data; expected403. No real credentials or database were requested. The probe server, synthetic file and isolated cache were removed. A high-priority fix request is in COORDINATION.md. Normal dev startup and GO remain blocked until this regression passes. The probe did not alter frontend source or emit frontend build files.

## Overnight verification update

Terra completed generated-credential persistence, with exclusive file creation and transaction rollback on file errors. Root seeded the default local database successfully; generated passwords are in ignored `backend/data/demo-credentials.json`, never in tracked reports or stdout. Custom DB names use `<name>.demo-credentials.json` beside their database. Existing files and credentials are preserved.

After formatting, root ran the final available suite: **17 tests passed, zero failed**. Backend TypeScript and build passed; production dependency audit reported zero vulnerabilities. Five additional independent tests cover all-session revocation, task/risk unassignment, live permission changes, demo email collision, invalid-password rollback and credential-file collision preservation.

Frontend package.json appeared during overnight verification; no current-run terminal handoff yet. Root typecheck encountered this incomplete frontend and failed because its tsconfig was not present, while backend typecheck passed. No frontend correction or installation was attempted before handoff. Browser connection is ready, but UI/browser acceptance has not been performed. Current decision remains NO-GO for the complete application and hibernation.

Changed files during overnight continuation: root .gitignore/README/COORDINATION/report; backend seed, seed tests, README and overnight security tests; docs coordination/demo/architecture plus overnight acceptance checklist. The approved ui/ reference remains untouched.

Added `tests/integration.test.mjs` and root `test:integration` to verify the compiled SPA/assets/deep links and real authenticated HTTP writes using an isolated temporary SQLite database. Initial direct execution failed as expected at frontend HTTP 404 because no frontend production build exists yet. This remains an unresolved acceptance test pending handoff/build; it has not been reported as passing.

Read-only review during active frontend work added root `tests/frontend-contract.test.ts` and `test:frontend-contract`. All three checks demonstrated RED: bodyless DELETE is rejected for missing application/json, host-UTC date reports November16 instead of Tashkent November17 at the test instant, and a legacy saved flag activates mock data. Frontend source remains untouched; these findings must be rechecked and resolved after current-run terminal handoff. The clock test adds Node's experimental MockTimers warning. These frontend failures are separate from the 17 passing backend tests.

Subsequent external frontend fixes at 02:26–02:29 resolved those three regressions: root reran `npm run test:frontend-contract` and all 3 passed. No frontend source was edited by Codex. The handoff still lacks required current-run markers; this result does not certify the full UI, production build, dashboard placeholders or loading/error states.

2026-11-17, Asia/Tashkent. **Backend ready for integration. Complete application: NO-GO pending frontend handoff and UI acceptance.**

## Actual delegation

- Root Codex: architecture, root configuration, exclusive dependency/lockfile management, independent code review, final verification and HTTP smoke tests.
- `backend`: gpt-6.1-terra with high reasoning effort implemented backend, tests, schema initialization and seed.
- `docs`: prepared 19 documentation files and checked the API specification.
- `security_review`: added eight independent security/persistence/seed tests; confirmed bcrypt's password suffix acceptance beyond 72 bytes and verified the fix.
- Gemini is externally coordinated by the user. Its execution status is unverified; no frontend handoff received. Codex made no frontend changes.

No student contributions or Git commits were fabricated. GitHub issue drafts are local; no issues or external messages were posted.

## Features and technology

Verified Node.js v22.22.0, npm 10.9.4, built-in SQLite 3.50.4. Express/TypeScript, Zod4 and bcryptjs; no cloud credentials, separate DB, Docker or native SQLite compilation required.

Implemented real sessions with cryptographic tokens and stored SHA-256 hashes, HttpOnly/SameSite=Lax cookies, expiry/logout, pending registration, explicit manager approval, permissions reread from DB, protected manager identity, member removal/session revocation, origin/content-type checks and login throttling. No email ownership verification is claimed.

Projects/tasks/members/risks support the shared CRUD contract, validated references/dates/enums, project filters, computed rounded progress/status and risk score/level. SQLite enables foreign keys, prepared statements, indexes and multistep transactions. Project deletion cascades; member deletion unassigns tasks/risks. Optional repeatable seed provides five members, 12 tasks and four risks with fictional emails, labeled demo data and dates relative to Asia/Tashkent today. Existing accounts and data are preserved.

One Git repository at TEAMFLOW; npm workspaces frontend/backend; one root package-lock.json. All installation ran from root. Root dev uses concurrently; no Turborepo or Nx.

Backend structure: src/app.ts contains routes, validation, authorization and DTO/business helpers; src/database/migrate.ts initializes schema; src/server.ts configures runtime; src/seed.ts creates demo data; tests use isolated databases. This compact monolith uses fewer files than the suggested module tree. Express supports frontend/dist after it exists. Configuration/static/database paths resolve relative to backend rather than terminal location.

Required Uzbek project-management docs, SMART/WBS/schedule/cost/risk/test plans, Mermaid architecture/ER, demo guide, API/OpenAPI and five issue drafts are in docs/. Coordination is tracked in COORDINATION.md; Gemini handoff belongs in frontend/FRONTEND_HANDOFF.md.

## Startup and database initialization

From C:\Users\user\Desktop\TEAMFLOW:

```sh
npm install
npm run setup
npm run db:seed
npm run dev
```

setup runs root npm install; repeating an unchanged installation is optional. Full dev requires the missing frontend. Until handoff, run `npm run dev --workspace backend` for backend-only work.

Database: backend/data/teamflow.db. Missing directory/tables initialize safely; existing data is never reset automatically. DATABASE_PATH resolves relative to backend. Optional backend/.env is loaded explicitly; see backend/.env.example.

Seed is optional. Default fictional accounts: manager@example.test and member@example.test. New passwords are generated securely and printed once locally unless DEMO_* variables supply them. Save generated credentials; reseeding does not reset passwords or promote arbitrary existing identities. No credentials are committed.

After frontend handoff: npm run build, then npm start. Frontend http://localhost:5173 proxies /api to http://localhost:4000. When NODE_ENV=production enables Secure cookies, use HTTPS; local startup does not force that mode.

## API summary

- GET /api/health.
- POST /api/auth/register, /login, /logout; GET /api/auth/me.
- GET/POST /api/projects; GET/PATCH/DELETE /api/projects/:id.
- GET/POST /api/tasks; GET/PATCH/DELETE /api/tasks/:id; optional projectId filter.
- GET/POST /api/members; PATCH/DELETE /api/members/:id.
- GET/POST /api/risks; PATCH/DELETE /api/risks/:id; optional projectId filter.

POST returns 201 including login; GET/PATCH return 200; DELETE/logout return empty 204. All mutations including DELETE/logout require Content-Type: application/json. See docs/API_CONTRACT.md and docs/openapi.yaml for exact DTOs, envelopes and permissions.

## Executed verification

| Check | Actual result |
|---|---|
| SQLite runtime probe | PASS, SQLite3.50.4 |
| Root npm install / npm run setup | PASS, one root lockfile |
| Initial audit | High Zod advisory found; upgraded to ^4.6.7 |
| Final install audit / npm audit --omit=dev | Zero vulnerabilities reported |
| Initial TypeScript/API checks | Failed on Zod4 type, nullable login value, DELETE test content type; corrected |
| Password suffix regression | Observed failing test; byte-limit fix verified green |
| Final root npm test | PASS: 11 tests, zero failures; available backend workspace only |
| npm run typecheck | PASS for available backend workspace |
| npm run build --workspace backend | PASS, including after formatting |
| OpenAPI | YAML parsed; 13 paths,23 operations; docs agent checked refs and unique operation IDs |
| Root npm run db:seed twice on isolated DB | PASS; credentials suppressed from report |
| Seed tests | Counts, password hashes and user-edited task preserved |
| SQLite reopening test | Projects and valid sessions persisted, foreign keys enabled |
| Root npm start | PASS: compiled backend listened on temporary port; health200, anonymous protected401 |
| Compiled server real HTTP smoke | PASS: seeded manager login201, project create/PATCH/delete, pending registration/denial, logout/replay401 |
| Root npm run dev | FAIL: missing frontend workspace; concurrently stopped backend |
| Full npm run build | FAIL: backend built; frontend workspace missing |
| Frontend/browser acceptance | NOT RUN: no frontend or handoff |

Tests cover registration/login/invalid credentials/logout, manual approval, session hashing/expiry/replay, CSRF, manager/member protections, CRUD/filters/assignments/date validation, progress and risk calculations, cascades, member deletion, persistence and repeatable seeding. Temporary smoke databases were removed and spawned servers stopped. No default user DB was reset.

Earlier root test attempts passed backend tests then failed selecting the absent frontend. The final root test script uses standard workspace discovery with --if-present: it passes available tests and does not certify an absent frontend.

## Limitations and remaining work

- No critical backend runtime defect remained in executed checks; coverage is limited to these tests.
- Node emits its experimental node:sqlite warning.
- Schema initializer uses repeatable CREATE IF NOT EXISTS, without versioned schema upgrades. Date ordering is enforced at the API layer.
- Login rate limiting is in memory for one local server; restart clears counters. Manual approval does not verify email ownership.
- Frontend absent: Vite proxy, dashboard, Kanban, calendar, team/risk UI, browser auth, frontend build and complete application restart remain unverified.
- No deployment performed. Local backend readiness does not imply integrated application readiness.

Next: receive frontend/FRONTEND_HANDOFF.md, install frontend dependencies from root, review API compatibility, build/test both workspaces, verify browser flows and persistence after restart, then issue the integrated GO/NO-GO decision.
