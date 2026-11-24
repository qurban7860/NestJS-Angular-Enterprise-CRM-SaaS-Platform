# Engineering Roadmap

Last reviewed: 2026-11-24

## Scope

Strengthen this existing NestJS + Angular multi-tenant CRM platform as a credible enterprise application. Prioritize security boundaries, repeatable verification, and operational clarity over adding more feature breadth.

## Milestone 1 — Backend CI baseline

- [x] Add a GitHub Actions workflow for a clean backend dependency install, NestJS build, and unit tests.
- [ ] Confirm the hosted workflow run succeeds after the unit-test corrections below.
- [ ] Add a non-mutating lint check. The current `npm run lint` script includes `--fix`, so it is intentionally not invoked by the initial CI workflow.

Status: workflow and first round of test corrections are committed; the follow-up hosted run is pending.

## Milestone 2 — Multi-tenant isolation regression tests

- [ ] Build reusable fixtures for two organizations with separate users, contacts, companies, deals, and tasks.
- [ ] Test that list, read, update, and delete paths are always scoped to the authenticated organization.
- [ ] Test cross-organization references (for example, attaching another organization's contact or deal to a task) are rejected.
- [ ] Add negative-path tests at the application/repository boundary, not only domain-entity tests.

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

The first hosted run ([run #1](https://github.com/qurban7860/NestJS-Angular-Enterprise-CRM-SaaS-Platform/actions/runs/45109597322)) completed dependency installation and the NestJS build, then failed in two existing unit specs:

- The registration success test used an incomplete CRM repository mock and omitted the JWT `sign` mock. The corrected spec now mocks the complete repository contract and verifies organization creation, admin-user persistence, and access-token signing. It also covers duplicate organization slugs.
- The app-controller test still expected NestJS's starter response (`Hello World!`) even though the controller returns the CRM API status message. The assertion now matches the controller's current public response.

The initial run passed 5 of 7 tests. The follow-up CI run is required before this milestone can be marked complete.

During `npm ci`, npm reported 54 dependency advisories (2 low, 30 moderate, 20 high, and 2 critical). This is the install-time summary, not a completed advisory triage. Review the detailed audit output before selecting targeted upgrades; do not apply a blanket force upgrade.

## Audit baseline (2026-11-23)

- The backend contains three source-level unit spec files: the app controller, registration use case, and contact entity.
- One end-to-end smoke spec exists and boots the full `AppModule`; it is kept out of the initial CI job until its database and supporting-service requirements are explicitly provisioned.
- No GitHub Actions workflow or engineering roadmap was present at the time of this audit.
- The current roadmap deliberately prioritizes tenancy and authorization regression coverage before adding more product modules.
