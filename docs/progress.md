# Progress Log

## Current Phase

- Phase: `Phase 3 - Domain Model and Data Layer Cleanup`
- Status: `Completed`
- Active Branch: `codex/refactoring`

## Completed Items (Phase 3)

- [x] Removed deprecated `projects` export and legacy `Project` interface from `src/data/projects.ts`.
- [x] Removed unused legacy `cvData` object from `src/data/cv.ts`; localized sources (`cvDataEn`, `cvDataPl`) remain canonical.
- [x] Tightened `getProjects` data merge typing with `Record<Locale, Record<PortfolioEntryId, PortfolioEntryContent>>`.
- [x] Added runtime invariant in `getProjects` that throws when localized content is missing for a canonical entry.
- [x] Added compile-time entry ID completeness checks by deriving `PortfolioEntryId` from canonical `portfolioEntries` and constraining `projectsEn`/`projectsPl` with `satisfies Record<PortfolioEntryId, PortfolioEntryContent>`.
- [x] Added unit tests for `getProjects`, `getProject`, and `getFeaturedProjects` in `src/data/get-projects.test.ts`.
- [x] Added unit tests for `calculatePrintCost` with deterministic, boundary, and sanity scenarios in `src/lib/calculate-print.test.ts`.

## Verification Snapshot (Phase 3)

- `pnpm lint`: pass
- `pnpm typecheck`: pass
- `pnpm format:check`: pass
- `pnpm test`: pass (18 tests / 6 files)
- `pnpm build`: pass
- Build route output remains static for localized routes (`/en`, `/pl`, `/en/cv`, `/pl/cv`, `/en/projects`, `/pl/projects`, and localized project detail paths).

## Previous Phase (Phase 2)

- Completed: `Phase 2 - i18n, Routing, and Metadata Architecture Fixes`.

## Errors Encountered (Log)

- `2026-03-04`: `pnpm test src/data/get-projects.test.ts src/lib/calculate-print.test.ts` initially failed due missing invariant in `getProjects` when localized content entry was removed in test.
- `2026-03-04`: Resolved by adding explicit localized-content invariant and strict locale/entry typing in `src/data/get-projects.ts`.
- `2026-03-04`: `pnpm typecheck` initially failed after stricter domain typing (`TS4104` in `ProjectCardStack`, `ProjectCaseStudy`, `ProjectItem` callsites).
- `2026-03-04`: Resolved by making consuming prop contracts readonly-compatible (`ProjectMeta.techStack`, `Lightbox.images`).
- `2026-03-04`: `pnpm format:check` initially failed on `src/data/get-projects.test.ts` and `src/data/get-projects.ts`.
- `2026-03-04`: Resolved with Prettier formatting and re-run of all quality gates.
