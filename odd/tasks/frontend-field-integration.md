# Connect the web basic field flow
Objective: connect only the existing basic field capability to the backend, preserving visual primitives. Branch: codex/backend-foundation.
Runner: pnpm test:api, pnpm exec tsc --noEmit, pnpm build, browser + local PostgreSQL. Delivery: no PR requested; repository relocation by user remains untouched.

## Specs
- S1: "pues nada conectaa primero el front al terminar me avisas". Connect frontend first; do not modify mobile.
- S2: "la ide aes conectar el front back y mobile para este flujo inicair que creamos en mobile y back el front tinee mas de lo que necesitamos solo conectariamos lo necesri oapra que fucnione este flujo". Only authentication, assigned customers, agenda, start workday, arrival, attendance closure and day closure. Unsupported modules remain inaccessible to real sessions.
- S3: "usa las mejores practicas,, nada harcodeado, evitar fallback que enmascaran errores". Validate data, no mock fallback; HttpOnly session cookie, same-origin writes, explicit errors and stable retry keys. Use pnpm.

## Tasks
- T1 [S1-S3] implemented and verified after backend correction. API/retry tests4/4, strict typecheck and production build pass; final build refreshed after retry correction. Browser flow and SQL persistence verified. Scoped independent auth/retry review complete. Commit pending; preserve user relocation.

## Log
- L1 User request quoted above. Existing frontend moved by user into frontend/; preserve relocation and all earlier backend staging.
- L2 Decision: Next runtime route handlers store opaque session token in HttpOnly SameSite cookie. Remove static export; runtime hosting required. Retain existing shell/Tabs/Drawer primitives and navigation scope. No mobile changes or new business endpoints.
- L3 API proxy tests pass2/2; frontend typecheck passed after input guard correction. Browser rejected invalid credentials and accepted valid fixture login. Initial agenda failed because GET /v1/me/workday returns empty200 for no day instead of contract JSON null. Added regression assertion backend/tests/http.test.ts; backend controller correction NOT applied. Test running at pause session58247. Browser complete workday/persistence sequence remains unverified.
- L4 User: "Te queda así un poco por ciento. Creo que sería mejor que yo levante todo y te pase los errores, me parece. para que no gastes lo poco que queda." Stop implementation and further checks. Existing local API3002 PID17568; frontend3001 session25441; Docker dedicated5433 running. Ignored frontend/.integration/fixture.json holds generated local test credentials and IDs. No credentials in tracked source.
- L5 Automatic approval review rejected removing global DemoStoreProvider. Preserved it; real pages do not consume it and pass connected=true to shell to hide demo footer. No bypass. Sidebar legacy navigation preserved. No mobile changes. Production build, independent auth verification and browser success persistence are pending.
- L6 User resumed work after rejecting compact backend. Backend modular architecture now in place; missing-day controller explicitly returns JSON null. Frontend production build passed. Browser flow passed against PostgreSQL: login, own customers, workday start, early close rejection, arrival, outcome/observations, visit closure, day closure, reload persistence and logout. Direct database verification matched exact notes. Final scoped auth review requested; no mobile changes.
- L7 Scoped auth review found an accepted-operation key surviving a failed read refresh. Extracted request-key lifecycle to shared/api/idempotent-command.ts: confirmed writes release key before refresh; uncertain writes retain it; rejected4xx release it. Two regression tests pass; total4/4. Independent targeted recheck confirms resolved; no additional blocker identified. Full unrelated frontend modules remain unconnected and blocked for the real field session.
