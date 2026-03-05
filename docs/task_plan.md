# Refactoring Master Plan

## Phase 1: Baseline Quality Gates and Safety Rails

**Required Skills:** `test-driven-development`, `verification-before-completion`, `systematic-debugging`

- [x] Add a `test` script and `typecheck` script in `package.json`.
- [x] Add a testing stack for unit/integration (`vitest`, `@testing-library/react`, `@testing-library/jest-dom`) with config files.
- [x] Add e2e tooling (`playwright`) with a minimal smoke test scaffold.
- [x] Add CI workflow (`.github/workflows/ci.yml`) running install, lint, typecheck, test, format check, and build.
- [x] Configure CI to fail on lint warnings (target: zero warnings).
- [x] Run Prettier and normalize formatting drift across all files.
- [x] Document quality commands in `README.md` (temporary section; refined in final README phase).

---

## Phase 2: i18n, Routing, and Metadata Architecture Fixes

**Required Skills:** `react-best-practices`, `systematic-debugging`, `test-driven-development`

- [x] Refactor locale ownership in `src/app/[locale]/layout.tsx` to validate locale and apply request-locale consistently.
- [x] Remove unused `params` warning and eliminate unnecessary locale casts (`locale as Locale`) where possible.
- [x] Ensure static rendering intent is explicit for locale routes and verify route output after build.
- [x] Replace direct `next/link` internal navigation with locale-aware wrappers in all localized routes/components.
- [x] Replace `next/head` usage in App Router root with App Router-native metadata/script strategy.
- [x] Add `lang` handling strategy on the root `<html>` element.
- [x] Standardize canonical host/domain across metadata and JSON-LD payloads.
- [x] Fix page title composition to avoid duplicating branding suffixes when template is applied.
- [x] Add metadata tests/snapshots for home, CV, projects index, and project detail pages.

---

## Phase 3: Domain Model and Data Layer Cleanup

**Required Skills:** `test-driven-development`, `systematic-debugging`

- [x] Remove or quarantine deprecated `projects` export from `src/data/projects.ts`.
- [x] Remove or migrate unused `cvData` in `src/data/cv.ts` so one canonical CV source remains.
- [x] Tighten `get-projects.ts` typing (`Locale` and entry ID completeness) to avoid runtime gaps.
- [x] Add compile-time checks that every portfolio entry has localized content in both locales.
- [x] Add unit tests for `getProjects`, `getProject`, and `getFeaturedProjects`.
- [x] Add unit tests for `calculatePrintCost` including boundary and sanity scenarios.

---

## Phase 4: Code Quality and Component/Hooks Refactor

**Required Skills:** `react-best-practices`, `systematic-debugging`, `test-driven-development`

- [x] Split `src/hooks/useTimeline.ts` into smaller modules (types, store, reveal engine, hooks).
- [x] Simplify `src/components/ui/DockNav.tsx` by extracting indicator math, route predicates, and event wiring.
- [x] Refactor `src/components/canvas/ViscousPuddle.tsx` into shader source module + WebGL setup module + component shell.
- [x] Remove setState-during-render pattern from `ProjectHoverPreview` and replace with effect/memo-safe flow.
- [x] Replace timeout-coupled accordion scroll sequencing in `ProjectItem` with callback/event-based sync.
- [x] Remove lint suppressions in `Lightbox` and `SettingsDock` by fixing hook dependencies/lifecycle design.
- [x] Replace `any` usage in `PricingCard` with typed i18n key access.
- [x] Delete unused modules/exports (`ContactLink`, `PricingCard`, `useCursorState` exports) or wire them intentionally.

---

## Phase 5: Accessibility and UX Hardening

**Required Skills:** `react-best-practices`, `react-ui`, `test-driven-development`

- [x] Rework global scrollbar/cursor suppression to be opt-in and scoped to specific experiences.
- [x] Audit keyboard/focus paths for overlays and nav components (`Lightbox`, `DockNav`, `ProjectBook`).
- [x] Ensure skip-link targets always exist on rendered pages, including not-found variants.
- [x] Normalize internal/external link semantics (locale-aware internal links, native anchors for external links).
- [x] Add accessibility checks (Playwright + axe or equivalent) for core routes.
- [x] Add reduced-motion behavior assertions for animation-heavy components.

---

## Phase 6: Testing Coverage Expansion and Regression Defense

**Required Skills:** `test-driven-development`, `systematic-debugging`, `verification-before-completion`

- [x] Add integration tests for locale switching, routing preservation, and section navigation behavior.
- [x] Add e2e tests for project list -> detail navigation (including prev/next links).
- [x] Add e2e tests for JSON-LD presence and key metadata outputs.
- [x] Add tests around print calculator interactions and deterministic output formatting.
- [x] Add test coverage thresholds and enforce them in CI.
- [x] Add a pre-release verification checklist in repo docs.

---

## Phase 7: Project Documentation (README.md)

**Required Skills:** `writing-clearly-and-concisely`, `verification-before-completion`

- [x] Replace template README with a recruiter-ready project narrative.
- [x] Add `Project Overview` section with business context and engineering goals.
- [x] Add `Tech Stack` section with rationale for each core choice.
- [x] Add `Architectural Decisions` section explaining important tradeoffs and why.
- [x] Add `Setup and Run Instructions` (prereqs, install, dev, build, production run).
- [x] Add `Testing Guidelines` (unit/integration/e2e commands, expectations, CI policy).
- [x] Add `Code Quality Standards` (lint, format, typecheck, accessibility expectations).
- [x] Add `Performance and Accessibility Notes` for animation-heavy features.
- [x] Add `Deployment` and `Environment Variables` sections if applicable.
- [x] Add `Known Limitations / Future Improvements` section with intentional scope notes.

---

## Phase Exit Criteria (applies to every phase)

- [x] All changed files pass lint with zero warnings.
- [x] Formatting check passes.
- [x] Type check passes.
- [x] Relevant tests added/updated and passing.
- [x] Build passes.
- [x] Progress logged in `progress.md` before moving to the next phase.
