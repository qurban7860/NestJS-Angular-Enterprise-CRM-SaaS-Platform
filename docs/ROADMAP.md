# Engineering Roadmap

Last reviewed: 2026-11-28

## Scope

Strengthen this existing NestJS + Angular multi-tenant CRM platform as a credible enterprise application. Prioritize security boundaries, repeatable verification, and operational clarity over adding more feature breadth.

## Milestone 1 — Backend CI baseline

- [x] Add a GitHub Actions workflow for a clean backend dependency install, NestJS build, and unit tests.
- [x] Confirm the hosted workflow run succeeds after the unit-test corrections.
- [ ] Validate the incremental, non-mutating lint check on a PR that changes TypeScript source.
- [ ] Reduce the repository-wide lint baseline before switching CI to full-source lint.

Status: the default-branch build and unit-test baseline is green. The first full-source lint attempt failed on existing violations; the incremental lint gate is now in place. This run adds TypeScript source tests so the next hosted run can validate the gate rather than skip it.

## Milestone 2 — Multi-tenant isolation regression tests

- [ ] Verify organization-scoped contact lookup at the Prisma query boundary and application use-case layer (implementation and regression specs added in PR #1; hosted validation pending).
- [ ] Extend equivalent coverage to deals, companies, tasks, and cross-organization references.
- [ ] Add database-backed integration tests proving that one organization's users cannot read or mutate another organization's records.

Acceptance criteria: a user from organization A cannot read or mutate organization B's records; valid same-organization operations continue to work.

## Milestone 3 — Authentication and authorization coverage

- [ ] Cover expired/invalid tokens, inactive or deleted users, and refresh-token rotation/revocation.
- [ ] Cover role and custom-permission checks for both allowed and denied actions.
- [ ] Verify authorization failures do not disclose whether another organization's resource exists.

## Milestone 4 — Database-backed integration and API tests

- [ ] Add an isolated PostgreSQL test service and apply migrations in CI.
- [ ] Add Redis only for suites that exercise queue, cache, or real-time infrastructure.
- [ ] Expand API-level tests around authentication, CRM, tasks, and billing webhook idempotency.
- [ ] Keep deterministic unit tests separate from infrastructure-dependent integration and end-to-end suites.

## Milestone 5 — Operational and delivery evidence

- [ ] Document health/readiness behavior and required runtime dependencies.
- [ ] Add traceable structured logs and request correlation where missing.
- [ ] Document deployment configuration, rollback expectations, and known limitations.
- [ ] Add architecture decision records for material tenancy, authorization, and data-consistency decisions.

## CI findings (2026-11-24)

The first hosted run (run #1) completed dependency installation and the NestJS build, then failed in two existing unit specs:

- The registration success test used an incomplete CRM repository mock and omitted the JWT sign mock. The corrected spec now mocks the complete repository contract and verifies organization creation, admin-user persistence, and access-token signing. It also covers duplicate organization slugs.
- The app-controller test still expected the NestJS starter response even though the controller returns the CRM API status message. The assertion now matches the controller's current public response.

The initial run passed 5 of 7 tests.

The follow-up hosted run (run #2) succeeded on 2026-11-24: dependency installation, Prisma Client generation, NestJS build, and all 8 unit tests across 3 suites passed.

During dependency installation, npm reported 54 advisories (2 low, 30 moderate, 20 high, and 2 critical). This was the install-time summary, not a completed advisory triage. Review detailed advisory paths before selecting targeted upgrades; do not apply a blanket force upgrade.

## CI findings (2026-11-26)

The first PR lint attempt (run #3) completed dependency installation, Prisma generation, NestJS build, and all 8 unit tests successfully. The full-source ESLint step then reported 567 errors and 63 warnings across the existing TypeScript source tree. No auto-fix was run and no source files were reformatted as part of this attempt.

The repository-wide lint baseline is therefore not clean. The workflow now uses an incremental changed-file gate so new or modified TypeScript source is checked without requiring a broad, unrelated cleanup in the same PR. This is a transitional policy, not a claim that the existing source tree passes full lint.

## CI findings (2026-11-27)

The incremental lint workflow ran on a documentation/configuration-only PR update and skipped lint because no TypeScript source files changed. The hosted run (run #4) passed dependency installation, Prisma generation, NestJS build, and all 8 unit tests. This did not validate ESLint against a source file.

## CI findings (2026-11-28)

The current PR adds organization-scoped contact retrieval at the Prisma query boundary and regression tests for cross-organization contact reads, updates, and deletes. The next hosted run must verify the NestJS build, all unit tests, and incremental lint against the changed TypeScript files before this milestone is marked complete.

## Audit baseline (2026-11-23)

- The backend contains three source-level unit spec files: the app controller, registration use case, and contact entity.
- One end-to-end smoke spec exists and boots the full AppModule; it is kept out of the initial CI job until its database and supporting-service requirements are explicitly provisioned.
- No GitHub Actions workflow or engineering roadmap was present at the time of this audit.
- The current roadmap deliberately prioritizes tenancy and authorization regression coverage before adding more product modules.
