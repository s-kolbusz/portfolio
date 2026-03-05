# Codebase Audit Findings

## Executive Summary

The repository already has a strong visual identity, modern tooling (Next.js 16, React 19, TypeScript, Tailwind v4), and good intent around performance/animation craft. However, the current codebase is not yet recruiter-grade from a maintainability and engineering-rigor perspective.

The highest-impact gaps are:

- Missing automated tests and CI quality gates.
- Inconsistent i18n/static-rendering architecture (most locale routes build as dynamic).
- Metadata/SEO inconsistencies (title template misuse, mixed canonical hostnames).
- Large, tightly-coupled UI/animation modules that are hard to reason about and safely change.
- Dead code and legacy data structures still present.
- Formatting/lint discipline drift (Prettier check currently fails).

Build and type checks run successfully, but quality and long-term maintainability are below the standard expected for public portfolio review by senior engineers.

Validation snapshot:

- `pnpm lint`: 1 warning (`src/app/[locale]/layout.tsx:18`, unused `params`)
- `pnpm exec tsc --noEmit`: pass
- `pnpm build`: pass, but locale app routes are dynamic (`f`) rather than static (`o`)
- `pnpm format:check`: fails on 9 files

## Phase 1 Status Update (2026-03-04)

The original audit snapshot above is intentionally preserved. Phase 1 implementation resolved the baseline quality-gate issues:

- Automated test stack added (`vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`) with working test coverage.
- e2e smoke scaffold added with Playwright and validated on Chromium.
- CI workflow added at `.github/workflows/ci.yml` with install, lint (zero warnings), typecheck, test, format check, and build gates.
- Lint warning in `src/app/[locale]/layout.tsx` fixed by removing unused `params`.
- Prettier normalization completed and `format:check` now passes.

---

## Architecture Findings

### A1. i18n request-locale flow is incomplete, forcing dynamic rendering

**Files:**

- `src/app/[locale]/layout.tsx:18-19`
- `src/app/[locale]/projects/page.tsx:26-28`
- `src/app/[locale]/cv/page.tsx:30-34`
- `src/app/[locale]/projects/[slug]/page.tsx:46`

**Pattern:** Locale pages are typed with `params`, but locale handling is inconsistent. `setRequestLocale(locale)` is only called on some routes. The locale layout receives `params` but does not use it.

**Why this matters:** The build output confirms most locale routes are dynamic. For a portfolio site, static generation should be the default for speed, stability, and SEO.

**Recommendation:**

- Make locale handling canonical at the layout level.
- Validate locale once, call `setRequestLocale(locale)` consistently.
- Remove repeated `locale as Locale` casts by tightening param typing.
- Verify static generation behavior after refactor.

---

### A2. Root layout uses legacy `next/head` in App Router and omits `<html lang>`

**Files:**

- `src/app/layout.tsx:4`
- `src/app/layout.tsx:119-122`
- `src/app/layout.tsx:119`

**Pattern:** `Head` from `next/head` is used in the App Router root layout, and `<html>` has no `lang` attribute.

**Why this matters:** This reduces clarity and can hurt accessibility/SEO quality signals.

**Recommendation:**

- Use App Router-native metadata/script patterns.
- Set `lang` on `<html>` from locale-aware context.

---

### A3. Metadata strategy is inconsistent (title template and canonical host mismatch)

**Files:**

- `src/app/layout.tsx:53-57` (global title template)
- `src/app/[locale]/projects/page.tsx:20`
- `src/app/[locale]/cv/page.tsx:24`
- `src/app/[locale]/projects/[slug]/page.tsx:29`
- `src/app/[locale]/projects/page.tsx:51`
- `src/app/[locale]/projects/[slug]/page.tsx:69`

**Pattern:** Child pages include "| Sebastian Kolbusz" while a global template already appends branding. Structured data URLs use `https://kolbusz.xyz/...` while `metadataBase` uses `https://www.kolbusz.xyz`.

**Why this matters:** This can produce inconsistent titles/canonical signals and weakens SEO hygiene.

**Recommendation:**

- Let root template own suffixing.
- Standardize one canonical host and use it everywhere (metadata + JSON-LD).
- Add metadata tests/snapshots for title and canonical fields.

---

### A4. `not-found` handling is duplicated and architecture is inconsistent

**Files:**

- `src/app/not-found.tsx:1-80`
- `src/app/[locale]/not-found.tsx:1-22`

**Pattern:** Root not-found redefines fonts/providers/layout concerns, while locale not-found is a separate implementation with different styling and routing behavior.

**Why this matters:** Duplicate error-page architecture increases maintenance burden and drift risk.

**Recommendation:**

- Extract one shared `NotFoundView` component.
- Keep root/locale wrappers minimal and consistent.
- Use locale-aware link/navigation wrappers uniformly.

---

### A5. Key modules are overly monolithic and tightly coupled

**Files:**

- `src/hooks/useTimeline.ts` (334 lines)
- `src/components/ui/DockNav.tsx` (280 lines)
- `src/components/canvas/ViscousPuddle.tsx` (418 lines)
- `src/components/features/ProjectCaseStudy.tsx` (271 lines)
- `src/components/features/RoleCaseStudy.tsx` (226 lines)

**Pattern:** Large components/hooks mix state management, DOM orchestration, animation config, interaction logic, and rendering in a single unit.

**Why this matters:** Harder onboarding, harder testing, greater regression risk.

**Recommendation:**

- Split into pure utility modules + focused hooks + presentation components.
- Keep animation math and event orchestration testable outside render functions.
- Add module-level tests for extracted behavior.

---

### A6. Legacy/deprecated data artifacts remain in production code

**Files:**

- `src/data/projects.ts:150-199`
- `src/data/cv.ts:41-121`

**Pattern:** Deprecated `projects` export and an unused full `cvData` object coexist with newer localized datasets.

**Why this matters:** Confuses code ownership and source of truth.

**Recommendation:**

- Remove dead/deprecated data after migration.
- Keep one authoritative data model per domain.

---

## Code Quality Findings

### Q1. Formatting discipline is currently broken

**Files (Prettier output):**

- `src/app/[locale]/not-found.tsx`
- `src/components/features/BookPageDots.tsx`
- `src/components/ui/BaseSection.tsx`
- `src/components/ui/DockNav.tsx`
- `src/components/ui/SettingsDock.tsx`
- `src/data/projects-en.ts`
- `src/lib/gsap-core.ts`
- `src/lib/gsap.ts`
- `pnpm-lock.yaml`

**Pattern:** `pnpm format:check` fails.

**Why this matters:** Formatting drift signals weak quality gating.

**Recommendation:**

- Format the repository.
- Add CI check for `lint`, `typecheck`, and `format:check`.

---

### Q2. Explicit `any` + lint suppression in translation access

**Files:**

- `src/components/features/PricingCard.tsx:57-58`

**Pattern:** `@typescript-eslint/no-explicit-any` suppression and `as any` for feature keys.

**Why this matters:** Bypasses type safety exactly where runtime i18n key mismatches are common.

**Recommendation:**

- Replace with typed key unions / helper function.
- Remove lint suppression.

---

### Q3. Additional lint suppressions hide maintainability issues

**Files:**

- `src/components/ui/Lightbox.tsx:135-136`
- `src/components/ui/SettingsDock.tsx:22-23`

**Pattern:** Hook dependency and state-in-effect suppressions.

**Why this matters:** These are frequent sources of stale closures and lifecycle bugs.

**Recommendation:**

- Refactor with stable callbacks/dependencies.
- Remove suppressions and keep lint fully actionable.

---

### Q4. State updates during render are used in hover preview flow

**Files:**

- `src/components/features/ProjectHoverPreview.tsx:26-31`

**Pattern:** `setState` called during render path to track `prevActiveImage`/`lastImage`.

**Why this matters:** This pattern is fragile and harder to reason about than effect/memo-based alternatives.

**Recommendation:**

- Replace with effect-driven state sync or derived memoized state.
- Add behavior tests around hover transitions.

---

### Q5. Hardcoded locale/path checks are repeated and brittle

**Files:**

- `src/hooks/useActiveSection.ts:14-15, 81-82`
- `src/components/ui/DockNav.tsx:41-43, 210`

**Pattern:** Homepage detection is hardcoded for `'/'`, `'/en'`, `'/pl'` in multiple places.

**Why this matters:** Fragile when adding locales or changing route strategy.

**Recommendation:**

- Centralize route predicates in one utility tied to i18n routing config.

---

### Q6. Timer-based UI synchronization is fragile

**Files:**

- `src/components/features/ProjectItem.tsx:33-58`

**Pattern:** Scroll behavior waits on a timeout derived from animation duration constants.

**Why this matters:** Any timing shift can break behavior and create inconsistent UX.

**Recommendation:**

- Synchronize via animation completion callbacks/events rather than hardcoded delays.

---

### Q7. Locale-aware routing wrappers are not used consistently

**Files:**

- `src/app/not-found.tsx:5, 68-70`
- `src/app/[locale]/not-found.tsx:2, 14-16`
- `src/components/features/ProjectAccordion.tsx:7, 136-140`

**Pattern:** `next/link` is used directly in a locale-routed app (and for an external URL case).

**Why this matters:** Locale behavior can drift and link semantics become inconsistent.

**Recommendation:**

- Use app-wide locale-aware navigation wrappers for internal links.
- Use plain `<a>` for external URLs.

---

### Q8. Global CSS choices reduce usability/accessibility

**Files:**

- `src/app/globals.css:139-147` (hide all scrollbars)
- `src/app/globals.css:193-206` (hide native cursor globally on fine pointers)

**Pattern:** Global scrollbar and cursor overrides are applied broadly.

**Why this matters:** Can impair discoverability and usability, especially for assistive workflows.

**Recommendation:**

- Scope these effects to specific experiences.
- Keep default browser affordances for most pages/components.

---

### Q9. Typing could be stricter in data merge layer

**Files:**

- `src/data/get-projects.ts:12-23`
- Multiple `locale as Locale` casts in route files

**Pattern:** `Record<string, ...>` with fallback and downstream type assertions.

**Why this matters:** Missing locale/content keys can slip through until runtime.

**Recommendation:**

- Use stricter mapped types keyed by known locales and entry IDs.
- Eliminate casts by validating params at boundaries.

---

### Q10. Unused code paths and stale symbols remain

**Files / symbols:**

- `src/components/ui/ContactLink.tsx` (unused)
- `src/components/features/PricingCard.tsx` (unused)
- `src/hooks/useCursorState.ts` exports (unused)
- `src/i18n/en.json:18` and `src/i18n/pl.json:18` (`HomePage` key appears unused)

**Pattern:** Exported but unreferenced modules and translation keys.

**Why this matters:** Increases cognitive load and weakens trust in codebase cleanliness.

**Recommendation:**

- Remove unused code or wire it intentionally.
- Add i18n key usage audit tooling.

---

### Q11. Existing lint warning indicates baseline drift

**Files:**

- `src/app/[locale]/layout.tsx:18`

**Pattern:** Unused `params` in production path.

**Why this matters:** Small warning, but important signal for tightening standards.

**Recommendation:**

- Either use validated locale params or remove the argument.
- Enforce zero-lint-warning policy.

---

## Testing Findings

### T1. No automated tests exist in repository

**Evidence:** No `test/spec` files found and no `test` script in `package.json`.

**Why this matters:** Any refactor can regress behavior silently.

**Recommendation:**

- Introduce layered strategy: unit + integration + e2e.

---

### T2. Core business logic is untested

**Files:**

- `src/lib/calculate-print.ts`
- `src/data/get-projects.ts`

**Why this matters:** Pure logic should have deterministic unit tests; this is low-cost and high-value.

**Recommendation:**

- Add comprehensive table-driven tests (edge cases, locale completeness, math sanity checks).

---

### T3. High-risk interaction flows are untested

**Files:**

- `src/components/ui/Lightbox.tsx`
- `src/components/ui/DockNav.tsx`
- `src/components/features/ProjectBook.tsx`
- `src/components/features/ProjectAccordion.tsx`

**Why this matters:** Keyboard/focus/nav/animation interactions are regression-prone.

**Recommendation:**

- Add integration/e2e tests for:
  - keyboard navigation
  - focus trapping
  - locale switching
  - project navigation and deep links

---

### T4. SEO and metadata behavior is untested

**Files:**

- `src/app/layout.tsx`
- `src/app/[locale]/**/page.tsx`
- `src/components/SEO/JsonLd.tsx`

**Why this matters:** Metadata/title/canonical regressions are easy to miss and visible to recruiters.

**Recommendation:**

- Add metadata snapshot tests for each route type.
- Add structured-data presence assertions in e2e.

---

### T5. No CI automation for quality gates

**Evidence:** `.github` directory absent.

**Why this matters:** Manual verification is unreliable.

**Recommendation:**

- Add CI workflow for install, lint, typecheck, tests, format check, and build.

---

## Naming Conventions Findings

### N1. Inconsistent casing conventions for folders/modules

**Files:**

- `src/components/SEO/JsonLd.tsx`

**Pattern:** `SEO` uppercase folder among mostly lowercase domain folders.

**Why this matters:** Inconsistent naming decreases scanability and can be annoying in cross-platform tooling.

**Recommendation:**

- Standardize folder naming convention (prefer lowercase directories).

---

### N2. Domain model naming is mixed and partially legacy

**Files:**

- `src/data/projects.ts`
- `src/data/projects-en.ts`
- `src/data/get-projects.ts`

**Pattern:** `Project`, `PortfolioEntry`, deprecated exports, and mixed naming intent coexist.

**Why this matters:** Harder to reason about canonical model.

**Recommendation:**

- Define one canonical domain type set and remove aliases/deprecated names.

---

### N3. Translation key style is inconsistent

**Files:**

- `src/i18n/en.json`
- `src/i18n/pl.json`

**Pattern:** Mixed styles (`skip_to_main`, `viewAll`, nested semantic keys).

**Why this matters:** Increases translation maintenance friction.

**Recommendation:**

- Choose one key style convention and migrate incrementally with tooling support.

---

### N4. Route and content naming are not fully aligned

**Files:**

- `src/components/features/ProjectBook.tsx`
- `src/i18n/*` (`projectsBook` namespace)
- `src/components/sections/Projects.tsx`

**Pattern:** Multiple names for similar concepts (`projects`, `projectsBook`, `portfolio`, `work`).

**Why this matters:** Naming drift makes cross-file tracing slower.

**Recommendation:**

- Standardize terminology (e.g., `projects` vs `portfolio`) and enforce in code + i18n.

---

## Notes on External Guidance Used for This Audit

- Next.js `generateMetadata` API: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Next.js JSON-LD guidance: https://nextjs.org/docs/app/guides/json-ld
- `next-intl` App Router i18n routing setup: https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing
