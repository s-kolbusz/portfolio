# Progress Log

## Current Phase

- Phase: `Phase 6 - Testing Coverage Expansion and Regression Defense`
- Status: `Completed`
- Active Branch: `codex/refactoring`

## Completed Items (Phase 6)

- [x] Added integration tests for locale switching, route preservation, and section navigation behavior in [`src/components/ui/navigation.integration.test.tsx`].
- [x] Added component-level calculator interaction and deterministic formatting tests in [`src/components/features/CalculatorPanel.test.tsx`].
- [x] Added e2e regression flow for project list -> detail navigation with prev/next verification in [`e2e/project-navigation.spec.ts`].
- [x] Added e2e metadata + JSON-LD assertions in [`e2e/metadata-jsonld.spec.ts`].
- [x] Added coverage thresholds in [`vitest.config.ts`] and enforced them in CI via [`package.json`] + [`.github/workflows/ci.yml`].
- [x] Added a pre-release verification checklist in [`docs/pre-release-checklist.md`] and linked it from [`README.md`].
- [x] Marked Phase 6 tasks complete in [`docs/task_plan.md`].

## Verification Snapshot (Phase 6)

- `pnpm lint`: pass
- `pnpm typecheck`: pass
- `pnpm format:check`: pass
- `pnpm test:coverage`: pass (40 tests / 12 files, thresholds met)
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm test:e2e e2e/project-navigation.spec.ts e2e/metadata-jsonld.spec.ts --workers=1`: pass (3 tests)
- `pnpm build`: pass

## Previous Phase

- Completed: `Phase 5 - Accessibility and UX Hardening`.

## Errors Encountered (Log)

- `2026-03-05`: `pnpm vitest run --coverage` initially failed due missing `@vitest/coverage-v8`.
- `2026-03-05`: Resolved by adding `@vitest/coverage-v8` as a dev dependency.
- `2026-03-05`: `pnpm build` failed after an invalid `vitest.config.ts` coverage option (`all`) was introduced.
- `2026-03-05`: Resolved by removing the unsupported option and keeping compatible coverage thresholds.
- `2026-03-05`: New Playwright specs intermittently timed out on `next dev` startup route compilation for `/en/projects`.
- `2026-03-05`: Resolved for verification by running e2e against `next start` with `PLAYWRIGHT_BASE_URL`, while keeping test assertions unchanged.
