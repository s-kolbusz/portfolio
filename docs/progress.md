# Progress Log

## Current Phase

- Phase: `Phase 5 - Accessibility and UX Hardening`
- Status: `Completed`
- Active Branch: `codex/refactoring`

## Completed Items (Phase 5)

- [x] Reworked global suppression patterns in [`src/app/globals.css`] to opt-in classes (`.hide-scrollbar`, `.custom-cursor-active`) instead of broad global overrides.
- [x] Scoped the custom cursor experience to home routes via [`src/components/ui/ClientOverlays.tsx`] and runtime root-class toggling in [`src/components/ui/CustomCursor.tsx`].
- [x] Audited and hardened keyboard/focus behavior for the targeted interaction surfaces:
  - `ProjectBook`: focusable region + scoped arrow-key handling + tab/tabpanel wiring.
  - `Lightbox`: explicit keyboard listener lifecycle with focus restoration retained.
  - `DockNav`: active-location semantics via `aria-current`.
- [x] Ensured skip-link targets are always present across locale pages and not-found variants by using a shared page-start anchor (`#page-content-start`) in locale/root not-found layouts.
- [x] Normalized shared link semantics in [`src/components/ui/Button.tsx`]:
  - internal routes render locale-aware `Link`
  - external URLs render native `<a>`
- [x] Added accessibility and reduced-motion e2e coverage in [`e2e/accessibility.spec.ts`] (axe checks, skip-link presence, keyboard flows, reduced-motion assertions).
- [x] Added unit coverage for link semantics in [`src/components/ui/Button.test.tsx`].

## Verification Snapshot (Phase 5)

- `pnpm lint`: pass
- `pnpm typecheck`: pass
- `pnpm format:check`: pass
- `pnpm test`: pass (35 tests / 10 files)
- `pnpm test:e2e e2e/accessibility.spec.ts --workers=1`: pass (6 tests)
- `pnpm build`: pass

## Previous Phase

- Completed: `Phase 4 - Code Quality and Component/Hooks Refactor`.

## Errors Encountered (Log)

- `2026-03-05`: `pnpm test:e2e e2e/accessibility.spec.ts` initially failed due missing `@axe-core/playwright`.
- `2026-03-05`: Resolved by adding `@axe-core/playwright` as a dev dependency.
- `2026-03-05`: Next.js threw `Event handlers cannot be passed to Client Component props` after `Button` link refactor.
- `2026-03-05`: Resolved by only attaching link `onClick` handlers when needed (`disabled` or explicit `onClick`), avoiding server-component serialization issues.
- `2026-03-05`: Axe rule `aria-hidden-focus` flagged inactive project-book panels.
- `2026-03-05`: Resolved by removing `aria-hidden` from tabpanels while keeping keyboard/tab semantics.
- `2026-03-05`: `pnpm lint`/`pnpm format:check` failed after e2e runs because Playwright report artifacts were generated in-repo.
- `2026-03-05`: Resolved by cleaning generated report directories and re-running formatting/quality gates.
