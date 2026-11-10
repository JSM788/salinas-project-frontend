# Multi-company backend foundation
Objective: implement an independent REST backend for the existing basic field flow. Branch: codex/backend-foundation.
Runner: backend pnpm test / pnpm run build. Delivery: ask-on-risk; forecast approximately 900 authored lines; no PR requested.

## Specs
- S1: "listo inicia con el backend". Initial work unit: standalone NestJS/PostgreSQL package with executable API, migrations and minimal operating instructions.
- S2: "la idea es comercaialziarlo para cualquier empresa". Independent companies, shared user identities, scoped memberships and sessions; reject cross-company and unassigned object access.
- S3: "lo de documentar dossier y lo demas q es secundario lo dejaria creo para despues". Keep only API contract, data migration and execution documentation with this delivery.
- S4: Preserve basic mobile behavior: active workday before check-in; one active visit; close with attendance result; normal workday closure requires all assigned visits complete. Server timestamps. No sales requirement or simulated file evidence.
- S5: "usa las mejores practicas,, nada harcodeado, evitar fallback que enmascaran errores es mejor controlarlos en un catch y mensajes, cosas centralizadas en archivos principales y etc cosa mas que se consideran buenas practicas en el backend cosas hasheadas , seguridad , dejar el flujo listo para el tema de logs en el backend, seguridad etc." Validate runtime configuration, separate policy/logging/errors by responsibility, hash credentials/tokens and correlate structured error logs without exposing submitted data.
- S6: "mejor es usar pnpm todo es mas rapido" and "sino esta instalado usa npx pnpm". Use pnpm for backend scripts, lock and instructions; no mixed package-manager lockfiles.

## Tasks
- T1 [S1-S6] inline, in progress: implement/test tenant identity and basic field operations. Mapping delegated because broad source understanding exceeded evidence budget. No writer reason; parent implements. Independent verifier required for permissions/data isolation. Commit pending; chain strategy decision required before >400-line commit.

## Log
- L1 User: "listo inicia con el backend". Asked tenancy; user: "la idea es comercaialziarlo para cualquier empresa".
- L2 Existing human modifications and image artifacts preserved. Next compiler requires backend exclusion. Docker daemon unavailable; use embedded PostgreSQL for deterministic SQL/API tests and document server-specific concurrency proof pending.
- L3 Scope here is a working foundation, not all future sales/payment/ERP modules. Full dossier and incident agents deferred. No remote access or frontend integration.
- L5 User: "mejor es usar pnpm todo es mas rapido"; "sino esta instalado usa npx pnpm". pnpm12.14.0 frozen install, audit and six tests pass. Observed RED missing API module, then GREEN; contract validation caught DATE serialization, corrected explicitly.
- L6 Independent verifier: S1-S5 pass, six tests plus 12 rejected-operation snapshots, two unauthorized actors and log/error redaction probes; no blockers. S6 manager validation performed by parent.
- L7 User started Docker ("prendere docker, dame un momento", then "listo"). Dedicated salinas-backend-dev PostgreSQL17 container created on loopback5433 with generated credentials in ignored backend/.env; pre-existing postgres-local5432 untouched. Migration and real multi-pool concurrency/isolation check pass; temporary test schema removed.
- L8 Initial functional proof complete. Native review preflight only; no START or authority yet. No commit made: authored scope exceeds400 and delivery strategy decision is pending before commit. Full sales/payment/ERP/evidence/offline flows are future work.
- L4 User: "usa las mejores practicas,, nada harcodeado, evitar fallback que enmascaran errores es mejor controlarlos en un catch y mensajes, cosas centralizadas en archivos principales y etc cosa mas que se consideran buenas practicas en el backend cosas hasheadas , seguridad , dejar el flujo listo para el tema de logs en el backend, seguridad etc."
