# DIBA Bookings — Project and Git Integration Guide

**Updated:** 13 October 2026  
**Repository:** [Ntlahla5408/DibaBookings](https://github.com/Ntlahla5408/DibaBookings)  
**Project:** NMU Conference Centre venue-booking system

> This document records the repository integration and the checks completed. A successful build is not proof that every feature works in a live environment. Database migrations and end-to-end verification were deliberately left for a separate review.

## 1. The five Ws and one H

| Question | Answer |
|---|---|
| **What?** | DIBA Bookings is intended to manage conference-centre venue bookings. The work documented here integrated diverged Git histories, cleaned generated files from source control, checked the frontend and backend, and prepared a record of remaining work. |
| **Why?** | The original repository and a fork had diverged, and an earlier pull request had merge conflicts. A separate integration branch allowed us to combine and review the changes without starting directly on `main`. Generated files were also removed because they should be recreated by tools, not stored as source code. |
| **Where?** | GitHub repository above. The local Windows checkout used was `C:\Users\Ntlahla\source\repos\Ntlahla5408\DibaBookings`. |
| **When?** | Integration work took place on 12 October 2026. PR #2 was merged on 12 October 2026 at 22:45:33 UTC. This guide was prepared on 13 October 2026. |
| **Who?** | This is a team-created NMU Conference Centre final-year project. Repository integration was carried out by the repository owner with development assistance. Confirm individual feature ownership with the project team. |
| **How?** | We used a dedicated integration branch, merged the diverged history, reviewed conflicts and changed files, cleaned generated files, updated ignore rules, built/tested both application parts, pushed the branch, reviewed PR #2, and merged it into the original repository's `main`. |

## 2. What DIBA Bookings is supposed to do

The system aims to give event organisers one place to request venue bookings and let authorised staff manage those requests.

### Roles

- **Event Organiser:** Creates and checks their own booking requests.
- **Staff:** Reviews bookings and performs actions permitted to staff.
- **Administrator:** Has broader management and oversight permissions.

The backend must enforce permissions. Hiding a button in React is not security; the API must check the signed-in user and their permissions too.

### Intended booking flow

1. An organiser signs in.
2. The organiser selects a venue and enters event and booking details.
3. The system validates the request and checks for conflicts.
4. The request is saved, commonly with **Pending** status.
5. Authorised staff/admin review it.
6. The booking can be approved or rejected; cancellation may also be available according to the requirements.
7. The organiser sees the outcome. Notifications and audit records should help explain what happened.

The flow above describes the intended behaviour, not a claim that every step has been fully tested end-to-end.

## 3. Current status versus remaining work

| Area | Intended behaviour | Verified in this integration | Still needs work/testing |
|---|---|---|---|
| Authentication | Register and sign in securely. | Authentication code exists; this merge check was not a security audit. | Test valid/invalid login, registration, token expiry, logout/invalidation, and error handling. |
| Dashboards and roles | Show the correct dashboard for each role. | Three frontend tests passed for administrator, staff, and default organiser dashboard selection. | Test real users and API permissions for every role. |
| Venues and booking forms | Display venues and collect event details. | Frontend production build succeeded. | Test loading, validation, empty/error states, and API data mapping. |
| Booking persistence | Save and retrieve bookings with correct status. | Backend compiled successfully. | Test database create/read/update, ownership, validation, and failure handling. |
| Conflict detection | Avoid overlapping bookings for the same venue under applicable statuses. | No live concurrent-booking test was done as part of the merge. | Test overlaps, non-overlaps, time boundaries, Pending/Approved status, and simultaneous requests. |
| Approval/rejection | Authorised staff decide requests and record the outcome. | Not fully verified end-to-end. | Test role restrictions, rejection reason, status changes, audit records, and notifications. |
| Notifications/audit | Notify the correct user and record important actions. | Not end-to-end verified. | Test recipients, ownership, timestamps, read state, ordering, and failure cases. |
| Payments | Complete required payment steps, if included in scope. | Build only; no live payment transaction/provider verification in this merge. | Test success/failure/cancel/retry, duplicate webhooks, reconciliation, and refund rules in a test environment. |
| Database | Store application data reliably. | No database migration was run. | Confirm provider/connection settings, inspect migration history, back up data, then plan migrations separately. |
| Deployment | Run securely in the target environment. | Local builds succeeded with warnings. | Check secrets, HTTPS/CORS, hosting settings, logs, health checks, backups, and deployment smoke tests. |

## 4. Technology stack: benefits and limitations

### React and JavaScript — frontend

**Purpose:** Builds the pages, forms, dashboards, tables, and interactions shown in the browser.

**Benefits:** Reusable components; responsive interfaces; a large ecosystem; updates the interface as data changes; keeps the user interface separate from database rules.

**Limitations:** Components can become difficult to maintain when old/duplicate files remain. API errors and loading states need deliberate handling. React does not enforce security on the backend.

**Verified:** `npm run build` succeeded with a warning. `npm test -- --watchAll=false` passed three dashboard-role tests. The build warning was an unused variable named `upcoming` in `src/pages/dashboards/OrganizerDashboard.js`.

**Repository note:** More than one frontend-related path exists, including `diba-bookings-frontend` and `DibaBookingsFrontend`. The frontend used for the recent build/tests was `diba-bookings-frontend`. Confirm the canonical directory before moving or deleting anything else.

### ASP.NET Core Web API and C# — backend

**Purpose:** Receives requests from the frontend, validates data, checks permissions and booking rules, and accesses the database.

**Benefits:** Strong typing; built-in routing and dependency injection; support for authentication/authorisation; structured API development; shared business rules in one place.

**Limitations:** Compilation does not prove that endpoints work at runtime. Large controllers can be hard to maintain. Incorrect configuration, permissions, or database connections can break features.

**Verified:** Backend build succeeded using .NET 8 with three warnings: two lowercase-name warnings for the `initialmigration` migration class and one possible-null warning related to `Encoding.GetBytes` in `Program.cs` around line 115. They were recorded, not fixed during this merge.

### Entity Framework Core (EF Core)

**Purpose:** Maps C# objects to database records and helps the backend query/save data and describe schema changes through migrations.

**Benefits:** Less repeated data-access code; integrates with ASP.NET Core; tracks entity changes; migrations can document schema updates.

**Limitations:** Developers still need to understand tables, relationships, constraints, indexes, and query performance. A migration file being present does not mean it has safely run. The EF Core provider must match the actual database.

EF Core package versions were aligned to **8.0.4**, and the Design package was added at that version. The global `dotnet-ef` tool was also changed to 8.0.4. **No migrations were run.**

### SQL Server / SQL Server Express and SSMS

**Purpose:** Persistently stores users, venues, events, bookings, and related records.

**Benefits:** Relational data model, constraints and queries; SSMS helps developers inspect and troubleshoot data.

**Limitations:** Requires correct installation/hosting, access controls, connection configuration, and backups. Local and hosted database settings can differ. The project has used SQL Server Express/SSMS in its development context, but the active branch's provider and connection settings must be checked before assuming which database is currently configured.

### JWT and role-based access control (RBAC)

**Purpose:** JWTs carry signed identity/claim information after login; RBAC restricts actions according to role.

**Benefits:** A standard token-based approach and clear separation of organiser, staff, and administrator permissions.

**Limitations:** Signing keys must remain secret; token validation, expiry, logout/invalidation, and endpoint permissions must be implemented correctly. A role stored only in browser storage is not proof of permission.

### Supporting tools

- **Swagger/OpenAPI:** Documents and allows manual testing of API endpoints. It does not prove that the full application works.
- **Git:** Tracks file history and commits, allowing changes to be reviewed and traced.
- **GitHub:** Hosts the repository and pull requests so changes can be reviewed before merging.
- **Node.js/npm:** Run frontend scripts and manage JavaScript packages. Run them in the actual frontend directory; the repository root does not contain the authoritative frontend package manifest.
- **Visual Studio / .NET CLI:** Build and troubleshoot the C# backend.
- **Yoco (if payments are in scope):** Payment credentials must remain secret. Use a test environment first and test duplicate callbacks, failed payments, retries, and reconciliation before production use.

## 5. Repository integration: steps and reasons

### Problem

The original repository and a fork had diverged. Earlier PR #1 had conflicts, so it was not used as the successful merge path. We needed a dedicated branch to integrate and test the code before updating `main`.

### Steps completed

1. **Used integration branch `integration/merge-diverged-work`.** This kept the work separate from `main` while changes were combined and checked.
2. **Merged the fork's history into the integration branch.** Local merge commit: `290bc02`, message “Merge fork main into integration branch”.
3. **Checked for unresolved conflicts.** `git diff --cached --name-only --diff-filter=U` returned no unresolved paths at the time of the check.
4. **Removed generated files from version control.** Tracked Visual Studio `.vs` and backend `obj` artifacts were staged for removal. They are generated by tools and should be recreated locally.
5. **Updated `.gitignore`.** It ignores common generated folders and local environment files, including `.vs/`, `bin/`, `obj/`, `node_modules/`, `build/`, `coverage/`, `.env`, and `.env.*`, while allowing `.env.example`.
6. **Removed obsolete/legacy frontend files from the integration result.** The empty root `package-lock.json` was removed because there was no root `package.json`; the actual frontend lockfile is under `diba-bookings-frontend/package-lock.json`. Legacy frontend files were removed from the active tree. Because multiple frontend folders exist, confirm the canonical location before further cleanup.
7. **Aligned EF Core package versions** to 8.0.4 and added the Design package at the same version.
8. **Performed a limited current-file secret scan.** The Yoco secret-key setting in the checked appsettings file was empty. This does not prove the entire repository or Git history is clean. If a real secret was ever committed, rotate it; removing it from the latest file does not erase it from history.
9. **Built the frontend.** `npm run build` succeeded with the unused-variable warning.
10. **Ran frontend tests.** `npm test -- --watchAll=false` passed 3 tests for dashboard role selection.
11. **Built the backend.** `dotnet build ".\Backend\DIBA_Backend\DIBA_Backend\DIBA_Backend.csproj"` succeeded with the 3 warnings described above.
12. **Committed and pushed the integration branch** to GitHub.
13. **Reviewed PR #2's changed files.** GitHub reported no merge conflicts and allowed automatic merging.
14. **Merged PR #2 into original `main`.** GitHub records the merge at 12 October 2026 22:45:33 UTC. Merge commit: `4aaac6e669e16eab9f4895e54e7a35d81ed8099b`.

### Pull requests and branches

- **PR #2 — merged:** [Integrate diverged DIBA Bookings changes](https://github.com/Ntlahla5408/DibaBookings/pull/2).
- **PR #1 — earlier conflicting attempt:** [View PR #1](https://github.com/Ntlahla5408/DibaBookings/pull/1). It was not the successful integration path.
- **Integration branch:** `integration/merge-diverged-work`.
- **Documentation branch:** `docs/diba-project-integration-guide` (this guide is submitted separately for review).

Using a branch and pull request gives the team a visible diff, a review point, and a record of what was integrated. It lowers risk but does not replace functional testing or security review.

## 6. Commands used

Run frontend commands from the active frontend directory:

```powershell
npm run build
npm test -- --watchAll=false
```

Run the backend build from the repository root:

```powershell
dotnet build ".\Backend\DIBA_Backend\DIBA_Backend\DIBA_Backend.csproj"
```

Useful safe Git inspection commands:

```powershell
git status
git fetch origin
git log -1 --oneline origin/main
git log --oneline --decorate -10
```

These inspect Git state; they do not apply database changes.

## 7. Known warnings and risks

1. **Frontend:** Unused variable `upcoming` in `OrganizerDashboard.js`.
2. **Backend:** Two warnings for lowercase `initialmigration` naming. Check migration/designer references before renaming.
3. **JWT configuration:** Possible-null value passed to `Encoding.GetBytes` in `Program.cs` around line 115. Validate required configuration and fail safely if missing. Do not put the key in source code or documentation.
4. **Database:** No migration or complete database workflow was run. Confirm provider, schema, migration history, and backup before any database-changing action.
5. **Secrets:** The scan only checked the current file. If credentials were ever committed, rotate them and assess history cleanup separately.
6. **Duplicate frontend paths:** Confirm which frontend directory is authoritative before more cleanup.
7. **Testing scope:** Build and unit tests do not prove booking persistence, permissions, conflict detection, notifications, payments, or deployment work end-to-end.
8. **CI:** No automated CI checks were reported for PR #2. Add repeatable frontend and backend build/test checks for future pull requests.

## 8. Recommended next work

### Priority 1 — Establish a clean baseline
- Fetch the merged `main` and inspect it in a clean local checkout or safely updated working copy.
- Confirm the canonical frontend folder and document prerequisites/run commands.
- Re-run frontend build/tests and backend build from merged `main`.

### Priority 2 — Review database and configuration
- Confirm the database provider and connection configuration.
- Ensure connection strings, JWT signing keys, and payment keys are supplied through local environment configuration or a secret store.
- Review migrations and schema history; back up important data before applying a reviewed migration. Do not run migrations until this is done.

### Priority 3 — Test the booking journey
- Test login as each role.
- Create and retrieve bookings; check status persistence.
- Test same-venue overlaps, non-overlaps, and concurrent requests.
- Test approval, rejection reason, cancellation (if required), notifications, and audit history.
- Verify organisers cannot access another organiser's bookings.
- Verify staff/admin permissions in the API, not only in the UI.

### Priority 4 — Security, payments, and release
- Fix the JWT configuration warning safely.
- Test token expiry/invalidation and endpoint permissions.
- Rotate credentials that may have been committed historically.
- If payments are required, test provider sandbox success/failure/cancel/retry, duplicate callbacks, and reconciliation.
- Add backend tests and CI; verify HTTPS/CORS, logs, health checks, backups, and deployment behaviour.
- Test mobile/desktop usability, validation, loading states, and accessible error messages.

## 9. Safe practices

- Never commit API keys, database passwords, JWT signing keys, or payment secrets.
- Do not commit generated folders such as `bin`, `obj`, `node_modules`, or `.vs`.
- Do not run migrations just because a migration file exists; confirm the target database and backup first.
- Do not force-push or rewrite shared history without team agreement.
- Before merging, review changed files, check for secrets/generated files, and run relevant tests.
- Keep this guide and the README aligned with the actual code. Mark features as complete only after testing them.

## 10. Glossary

| Term | Meaning |
|---|---|
| API | A defined way for frontend and backend to exchange requests and responses. |
| ASP.NET Core | Microsoft's framework for web applications and APIs. |
| Build | Checks whether code compiles/packages; it is not a full feature test. |
| Branch | A separate line of work in Git. |
| Commit | A saved snapshot of repository changes. |
| EF Core | A .NET library for working with relational database records. |
| JWT | A signed token commonly used to carry authenticated-user claims. |
| Migration | A versioned description of a database schema change. |
| PR / pull request | A proposal to merge changes, with a reviewable comparison. |
| RBAC | Role-based access control: permissions depend on a user's role. |
| React | A JavaScript library for building user interfaces from reusable components. |
| Repository | Project files and tracked history in Git. |
| SQL Server Express | A lightweight Microsoft SQL Server edition often used for local development. |
| Swagger/OpenAPI | API documentation and a tool for manually trying endpoints. |

## 11. Final status

**Completed:** Repository integration on a separate branch; generated-file cleanup and ignore rules; frontend production build; three frontend tests; backend build; review and merge of PR #2 into `main`.

**Not completed by this integration:** Database migrations, full end-to-end testing, complete security review, production payment verification, deployment verification, and fixing the warnings.

**Bottom line:** The repository is integrated. The application should only be described as fully working after the booking workflows, database behaviour, permissions, and any required payment flows have been tested in the intended environment.
