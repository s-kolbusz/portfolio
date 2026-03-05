# Progress Log

## Current Phase

- Phase: `Phase 4 - Code Quality and Component/Hooks Refactor`
- Status: `Completed`
- Active Branch: `codex/refactoring`

## Completed Items (Phase 4)

- [x] Split `useTimeline` into focused timeline modules: public types, Zustand store, reveal engine, and hook shell while preserving the existing `src/hooks/useTimeline.ts` import surface.
- [x] Simplified `DockNav` by extracting route predicates, active-item resolution, indicator offset math, hover scaling, and resize/animation wiring into dedicated modules.
- [x] Refactored `ViscousPuddle` into a component shell plus isolated shader and WebGL setup/teardown modules.
- [x] Removed the render-time state update pattern from `ProjectHoverPreview` by moving retained-preview ownership into `ProjectList`.
- [x] Replaced `ProjectItem`'s timeout-based accordion scroll sync with an animation-complete callback from `ProjectAccordion`.
- [x] Removed hook lint suppressions from `Lightbox` and `SettingsDock` by redesigning lifecycle/mount handling.
- [x] Added pure-logic tests for extracted `DockNav`, hover-preview, and project-item scroll helpers.
- [x] Deleted unused `ContactLink`, `PricingCard`, and `useCursorState` modules, which also removed the last `PricingCard` `any` escape hatch.

## Verification Snapshot (Phase 4)

- `pnpm lint`: pass
- `pnpm typecheck`: pass
- `pnpm format:check`: pass
- `pnpm test`: pass (33 tests / 9 files)
- `pnpm build`: pass
- Build route output remains static for localized routes (`/en`, `/pl`, `/en/cv`, `/pl/cv`, `/en/projects`, `/pl/projects`, and localized project detail paths).

## Previous Phase (Phase 3)

- Completed: `Phase 3 - Domain Model and Data Layer Cleanup`.

## Errors Encountered (Log)

- `2026-03-04`: `pnpm lint` initially failed after the refactor because React compiler lint rules rejected ref writes during render in `ViscousPuddle`, ref reads during render in `ProjectHoverPreview`, and effect-driven mount/index state in `Lightbox`.
- `2026-03-04`: Resolved by syncing long-lived refs in effects, moving retained preview-image ownership up to `ProjectList`, and remounting `Lightbox` only when open so index lifecycle stays local to mount.
- `2026-03-04`: `pnpm test src/data/get-projects.test.ts src/lib/calculate-print.test.ts` initially failed due missing invariant in `getProjects` when localized content entry was removed in test.
- `2026-03-04`: Resolved by adding explicit localized-content invariant and strict locale/entry typing in `src/data/get-projects.ts`.
- `2026-03-04`: `pnpm typecheck` initially failed after stricter domain typing (`TS4104` in `ProjectCardStack`, `ProjectCaseStudy`, `ProjectItem` callsites).
- `2026-03-04`: Resolved by making consuming prop contracts readonly-compatible (`ProjectMeta.techStack`, `Lightbox.images`).
- `2026-03-04`: `pnpm format:check` initially failed on `src/data/get-projects.test.ts` and `src/data/get-projects.ts`.
- `2026-03-04`: Resolved with Prettier formatting and re-run of all quality gates.
