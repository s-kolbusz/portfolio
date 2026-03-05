# Portfolio Refactor Round 2: Public-Release Refactoring Program (Epic/Story PR Model)

## Summary

This plan defines a multi-stage refactor program for your portfolio with independent, small PR-ready stories. It enforces a single source of truth for naming, structure, hooks, and code-splitting, while also including a breaking URL taxonomy redesign and content/UI consistency work.  
Execution is governed by skill-gated phases, strict automation, and `planning-with-files` artifacts under `docs/refactor-round-2`.

## Skill Enforcement Model (Mandatory)

1. Every story starts by invoking its required skills and logging the chosen guidance in `docs/refactor-round-2/progress.md`.
2. No PR merges without passing all skill-gated checks for that story.
3. `planning-with-files` rules are mandatory across the full program: update findings after every 2 discovery actions and keep phase status current.
4. Planning-file state and Linear state must stay synchronized: any scope/status decision update in plan files requires a same-session update to mapped Linear items.

## Planning-With-Files Workspace (First Deliverable)

1. Create `docs/refactor-round-2/task_plan.md` from the `planning-with-files` task template.
2. Create `docs/refactor-round-2/findings.md` from the findings template.
3. Create `docs/refactor-round-2/progress.md` from the progress template.
4. Add a “Round 2 PR Checklist” section to `progress.md` with required commands and skill gates.
5. Add a plan-to-Linear prerequisite in the planning files: updates to `task_plan.md`, `findings.md`, or `progress.md` must update related Linear epic/story/task items.

## Important Public API / Interface / Type Changes

### Public URL Taxonomy (Breaking, Intentional)

| Current                     | Target                                                                      |
| --------------------------- | --------------------------------------------------------------------------- |
| `/[locale]/projects`        | `/[locale]/work`                                                            |
| `/[locale]/projects/[slug]` | `/[locale]/work/[slug]`                                                     |
| `/[locale]/cv`              | `/[locale]/resume`                                                          |
| `/[locale]/design`          | `/[locale]/lab`                                                             |
| Home sections only          | Add standalone `/[locale]/services`, `/[locale]/about`, `/[locale]/contact` |

Policy: old URLs are removed in this round (no compatibility redirects), per “best design wins”.

### Internal Type and Module Contracts

| Current                            | Target                                         |
| ---------------------------------- | ---------------------------------------------- |
| `PortfolioEntry*` naming           | `WorkItem*` naming across data/types/selectors |
| `projects-*.ts` data modules       | `work-*.ts` data modules                       |
| `cv-*.ts` data modules             | `resume-*.ts` data modules                     |
| Mixed key styles in i18n           | Dot-namespaced camelCase keys only             |
| Mixed folder casing (`SEO`)        | `lowercase-kebab` directories only             |
| Mixed placement of hooks/constants | Feature-first hooks + shared core boundaries   |

## Multi-Stage Epic Plan (Independent Small PR Stories)

### Epic 0: Program Bootstrap and Baseline Lock

Required skills: `planning-with-files`, `brainstorming`, `verification-before-completion`

1. E0-S1 (PR-01): Initialize `docs/refactor-round-2/{task_plan,findings,progress}.md`; mark all planned epics as `pending`.
2. E0-S2 (PR-02): Capture baseline snapshots (`lint`, `typecheck`, `test`, `build`, route map, file topology).
3. E0-S3 (PR-03): Add PR template checklist requiring skill gate evidence and phase status updates.

### Epic 1: Conventions as Single Source of Truth

Required skills: `typescript-expert`, `frontend-patterns`, `verification-before-completion`

1. E1-S1 (PR-04): Add `docs/architecture/frontend-conventions.md` defining naming, directory rules, hooks placement, code-split policy, import boundaries.
2. E1-S2 (PR-05): Add automated convention enforcement via lint/custom checks and wire into CI as hard-fail.
3. E1-S3 (PR-06): Add scripts in `package.json` for convention checks (`check:conventions`, `check:architecture`) and enforce in release checklist.

### Epic 2: Naming and Directory Normalization

Required skills: `typescript-expert`, `frontend-patterns`, `clean-code`

1. E2-S1 (PR-07): Rename uppercase/mixed directories to `lowercase-kebab` (including `components/SEO` → `components/seo`).
2. E2-S2 (PR-08): Enforce file naming policy: PascalCase React files, `useX` hooks, kebab-case utility/data modules.
3. E2-S3 (PR-09): Remove stale aliases/duplicate naming patterns and update imports atomically per slice.

### Epic 3: Feature-First Architecture Migration

Required skills: `frontend-patterns`, `react-best-practices`, `typescript-expert`

1. E3-S1 (PR-10): Introduce target structure: `src/features/*` and `src/shared/{ui,lib,hooks,config}` with boundary rules.
2. E3-S2 (PR-11): Migrate “work” domain modules and components into `src/features/work`.
3. E3-S3 (PR-12): Migrate “resume” domain modules into `src/features/resume`.
4. E3-S4 (PR-13): Migrate global overlays/navigation into `src/features/navigation` and shared primitives into `src/shared/ui`.

### Epic 4: Hooks, State, and Constants Standardization

Required skills: `frontend-patterns`, `typescript-expert`, `react-patterns`

1. E4-S1 (PR-14): Define hooks placement rule: feature-specific hooks stay in feature folders; generic hooks in `src/shared/hooks`.
2. E4-S2 (PR-15): Make constants pure data; move hook-bearing logic out of constants modules.
3. E4-S3 (PR-16): Consolidate route predicates and locale-aware helpers into one typed routing module (no hardcoded locale sets).
4. E4-S4 (PR-17): Standardize Zustand store naming and placement by domain.

### Epic 5: Code-Splitting Policy and Runtime Boundaries

Required skills: `react-best-practices`, `web-performance-optimization`, `typescript-expert`

1. E5-S1 (PR-18): Add codified code-splitting rules: route-level split + heavy client-only modules split; default to static imports otherwise.
2. E5-S2 (PR-19): Introduce shared lazy/dynamic helper wrappers and migrate existing ad-hoc patterns.
3. E5-S3 (PR-20): Add bundle budget checks and fail CI if thresholds regress.

### Epic 6: Service-Oriented URL Restructure (Breaking)

Required skills: `frontend-patterns`, `typescript-expert`, `seo-fundamentals`

1. E6-S1 (PR-21): Implement new route tree with always-prefixed locales: `/[locale]/work`, `/services`, `/about`, `/contact`, `/resume`, `/lab`.
2. E6-S2 (PR-22): Move page modules and metadata builders to new route names and update all internal navigation links.
3. E6-S3 (PR-23): Remove legacy route entries (`projects`, `cv`, `design`) and associated dead code.
4. E6-S4 (PR-24): Update JSON-LD/canonical outputs for the new route map and verify crawlability.

### Epic 7: Content Model + i18n Normalization

Required skills: `typescript-expert`, `i18n-localization`, `frontend-patterns`

1. E7-S1 (PR-25): Rename domain data contracts to `WorkItem*` and `Resume*` naming family.
2. E7-S2 (PR-26): Migrate translation keys to dot-namespaced camelCase in both locales.
3. E7-S3 (PR-27): Add typed key/coverage checks for locale parity and missing keys.
4. E7-S4 (PR-28): Remove orphaned copy/content keys and legacy datasets.

### Epic 8: UI Consistency + Accessibility Hardening

Required skills: `web-design-guidelines`, `frontend-patterns`, `webapp-testing`

1. E8-S1 (PR-29): Run `web-design-guidelines` audit against changed UI and log findings in `docs/refactor-round-2/findings.md`.
2. E8-S2 (PR-30): Fix guideline violations (focus treatment consistency, avoid problematic transitions, semantic controls, keyboard parity).
3. E8-S3 (PR-31): Preserve current visual identity while unifying interaction behavior and component API consistency.

### Epic 9: Final Hardening and Public-Ready Exit

Required skills: `verification-before-completion`, `planning-with-files`, `test-driven-development`

1. E9-S1 (PR-32): Run full quality suite plus new architecture checks.
2. E9-S2 (PR-33): Update README and release docs to new route model and architecture rules.
3. E9-S3 (PR-34): Execute final pre-public checklist and produce publish-ready signoff log.

## Test Cases and Scenarios (Mandatory Acceptance)

1. Convention enforcement tests: intentionally invalid file/dir naming must fail CI.
2. Type safety tests: renamed domain types compile without `any` escape hatches.
3. Routing unit tests: all new routes resolve for both locales; old routes are absent.
4. Navigation integration tests: locale switch preserves equivalent path under new taxonomy.
5. E2E smoke: `/en` and `/pl` flows for `work`, `work/[slug]`, `resume`, `services`, `about`, `contact`, `lab`.
6. Accessibility E2E: zero serious/critical Axe violations on all primary routes.
7. Metadata/SEO tests: canonical and JSON-LD reflect new route names and locale prefixes.
8. Performance checks: bundle budgets and route-level loading behavior pass thresholds.
9. Regression checks: print calculator and existing key interactions still function after module moves.

## Sequencing and Parallelization Rules

1. Strict order: Epic 0 → Epic 1.
2. Parallel window A: Epics 2, 3, 4 can run in parallel after Epic 1 if they touch separate slices.
3. Parallel window B: Epic 5 can start once impacted slices from 3/4 are merged.
4. Route/content chain: Epic 6 then Epic 7.
5. Final quality: Epic 8 then Epic 9.
6. PR size rule: each story scoped to ~1–3 days and one mergeable PR.

## Assumptions and Defaults Locked

1. Planning artifacts location: `docs/refactor-round-2`.
2. Scope: includes internal consistency plus route/content/UI refactors, split into independent epics/stories.
3. Compatibility: “best design wins” (breaking changes allowed).
4. PR strategy: small PRs.
5. Enforcement: strict automation, not docs-only.
6. UI direction: preserve current visual identity.
7. URL model: service-oriented.
8. Locale URL style: always prefixed (`/en`, `/pl`).
9. i18n key style: dot-namespaced camelCase.
10. Naming policy: PascalCase React files + kebab-case utilities; directory names lowercase-kebab only.
11. Frontend architecture target: feature-first + shared core.
12. Code splitting policy: route + heavy-client split.
13. Runtime/tooling note: resolve Node runtime mismatch (`volta` pin vs active runtime) in Epic 1 before major migrations.
