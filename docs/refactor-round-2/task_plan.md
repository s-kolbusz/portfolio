# Task Plan: Portfolio Refactor Round 2 - Deliverable 1 Bootstrap

## Goal

Maintain synchronized `planning-with-files` artifacts and a fully mapped, prioritized Linear backlog for the full Refactor Round 2 program.

## Current Phase

Phase 8

## Phases

### Phase 1: Requirements & Discovery

- [x] Read `docs/PLAN.md` and lock first-deliverable scope
- [x] Review `planning-with-files` templates and rules
- [x] Identify available Linear team/project context
- **Status:** complete

### Phase 2: Planning Workspace Bootstrap

- [x] Create `docs/refactor-round-2/task_plan.md`
- [x] Create `docs/refactor-round-2/findings.md`
- [x] Create `docs/refactor-round-2/progress.md`
- [x] Add "Round 2 PR Checklist" section to `progress.md`
- **Status:** complete

### Phase 3: Linear Work Item Bootstrap

- [x] Create/refine Linear project for Refactor Round 2
- [x] Create Epic 0 parent issue
- [x] Create stories for E0-S1, E0-S2, E0-S3
- [x] Create first-deliverable execution tasks
- **Status:** complete

### Phase 4: Plan-to-Linear Sync Protocol

- [x] Add prerequisite that planning file updates require Linear updates
- [x] Add Linear mapping references to planning files
- [x] Ensure status changes are mirrored in both systems
- **Status:** complete

### Phase 5: Verification & Handoff

- [x] Validate created files and Linear links
- [x] Update phase statuses and progress log
- [x] Deliver completion summary
- **Status:** complete

### Phase 6: Full Backlog Mapping + Prioritization

- [x] Expand Linear hierarchy for all remaining epics/stories/tasks from `docs/PLAN.md`
- [x] Update planning files with full `WEB-*` mapping ranges
- [x] Apply PM prioritization in Linear and sync priority tiers in planning artifacts
- **Status:** complete

### Phase 7: E0-S2 Baseline Snapshot Capture (`WEB-50`, duplicate parent: `WEB-3`)

- [x] Run baseline quality commands and capture raw output artifacts: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`
- [x] Generate and store route map snapshot and file topology snapshot
- [x] Convert baseline failures into follow-up Linear issues and link evidence
- [x] Update planning artifacts and synchronize Linear state in the same session
- **Status:** complete

### Phase 8: Post-Project Architecture Flattening Validation (`WEB-84`)

- [ ] Define flattening validation criteria (complexity, coupling, velocity, boundary-rule signal).
- [ ] Evaluate final architecture after Epic 9 and score keep-vs-flatten options.
- [ ] Record decision and follow-on plan (retain `shared` or execute flattening migration slice).
- **Status:** pending

## Program Epic Status

| Epic                                                 | Identifier | Linear Status | Priority |
| ---------------------------------------------------- | ---------- | ------------- | -------- |
| Epic 0: Program Bootstrap and Baseline Lock          | WEB-1      | in_progress   | High     |
| Epic 1: Conventions as Single Source of Truth        | WEB-10     | todo          | High     |
| Epic 2: Naming and Directory Normalization           | WEB-11     | todo          | High     |
| Epic 3: Feature-First Architecture Migration         | WEB-12     | todo          | High     |
| Epic 4: Hooks, State, and Constants Standardization  | WEB-13     | todo          | High     |
| Epic 5: Code-Splitting Policy and Runtime Boundaries | WEB-14     | todo          | Medium   |
| Epic 6: Service-Oriented URL Restructure             | WEB-15     | todo          | High     |
| Epic 7: Content Model + i18n Normalization           | WEB-16     | todo          | High     |
| Epic 8: UI Consistency + Accessibility Hardening     | WEB-17     | todo          | Medium   |
| Epic 9: Final Hardening and Public-Ready Exit        | WEB-18     | todo          | High     |
| Epic 10: Post-Project Flattening Validation          | WEB-84     | backlog       | Medium   |

## Key Questions

1. Which Linear team should own this workstream? Resolved: `Website`.
2. Should Epic/Story/Task hierarchy be represented with parent-child issues? Resolved: yes.
3. What is the minimum synchronization rule that keeps plan files and Linear aligned? Resolved: same-session mirrored updates for scope/status/decision changes.

## Decisions Made

| Decision                                                 | Rationale                                                                                                                                |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Keep planning artifacts in `docs/refactor-round-2`       | Matches `docs/PLAN.md` assumptions and keeps all Round 2 program state in one directory                                                  |
| Use `Website` Linear team for execution tracking         | Team is already provisioned and directly maps to this repo scope                                                                         |
| Model epic/story/task through parent-child Linear issues | Preserves hierarchy without introducing custom workflow complexity                                                                       |
| Use dependency-weighted PM prioritization (High/Medium)  | Foundational + breaking-route + final-release work should be front-loaded; performance/accessibility polish follows core migration chain |

## Linear Synchronization Prerequisite

- Any update to `docs/refactor-round-2/task_plan.md`, `docs/refactor-round-2/findings.md`, or `docs/refactor-round-2/progress.md` that changes scope, status, decisions, or checklist state must include an update to the mapped Linear item in the same working session.
- If a Linear update cannot be made, log the failure in `Errors Encountered` and `progress.md` before continuing.

## Linear Mapping

| Program Slice                   | Epic    | Stories        | Tasks                                                                                |
| ------------------------------- | ------- | -------------- | ------------------------------------------------------------------------------------ |
| Round 2 project container       | Project | -              | https://linear.app/sebastian-kolbusz/project/portfolio-refactor-round-2-0b8880dacf7c |
| Epic 0: Program Bootstrap       | WEB-1   | WEB-2..WEB-4   | WEB-5..WEB-9, WEB-50                                                                 |
| Epic 1: Conventions             | WEB-10  | WEB-19..WEB-21 | WEB-51..WEB-53                                                                       |
| Epic 2: Naming Normalization    | WEB-11  | WEB-22..WEB-24 | WEB-54..WEB-56                                                                       |
| Epic 3: Feature-First Migration | WEB-12  | WEB-25..WEB-28 | WEB-57..WEB-60                                                                       |
| Epic 4: Hooks/State/Constants   | WEB-13  | WEB-29..WEB-32 | WEB-61..WEB-64                                                                       |
| Epic 5: Code-Splitting          | WEB-14  | WEB-33..WEB-35 | WEB-65..WEB-67                                                                       |
| Epic 6: URL Restructure         | WEB-15  | WEB-36..WEB-39 | WEB-68..WEB-71                                                                       |
| Epic 7: Content + i18n          | WEB-16  | WEB-40..WEB-43 | WEB-72..WEB-75                                                                       |
| Epic 8: UI + Accessibility      | WEB-17  | WEB-44..WEB-46 | WEB-76..WEB-78                                                                       |
| Epic 9: Final Exit              | WEB-18  | WEB-47..WEB-49 | WEB-79..WEB-81                                                                       |
| Epic 10: Flattening Validation  | WEB-84  | TBD            | TBD                                                                                  |

## Errors Encountered

| Error                                                            | Attempt | Resolution                                                         |
| ---------------------------------------------------------------- | ------- | ------------------------------------------------------------------ |
| `pnpm typecheck` failed in baseline capture (TS2307 + TS1261)    | 1       | Captured in artifact log and opened `WEB-83` + `WEB-82` follow-ups |
| `pnpm build` failed in baseline capture (TS1261 casing conflict) | 1       | Captured in artifact log and opened `WEB-82` follow-up             |

## Notes

- Re-read this file before major implementation changes.
- Update phase statuses using `pending -> in_progress -> complete`.
- Keep plan files and Linear item states synchronized.
