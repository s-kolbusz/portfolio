# Findings & Decisions

## Requirements

- Keep planning files synchronized with the full Linear Round 2 backlog.
- Ensure all epics/stories/tasks are mapped from `docs/PLAN.md` into Linear.
- Apply PM prioritization to the active backlog (`High`/`Medium`) with clear rationale.
- Preserve plan-to-Linear same-session synchronization rule.

## Research Findings

- `docs/PLAN.md` defines "Planning-With-Files Workspace (First Deliverable)" as the first concrete implementation step.
- `docs/PLAN.md` enforces skill-gated stories and mandatory `planning-with-files` rules for the whole refactor program.
- Linear workspace currently has teams `Website` and `Sebastian Kolbusz`; `Website` is the best fit for this repository workstream.
- Full hierarchy now exists in Linear for the entire program:
- Epics: `WEB-1`, `WEB-10`..`WEB-18`
- Stories: `WEB-2`..`WEB-4`, `WEB-19`..`WEB-49`
- Tasks: `WEB-5`..`WEB-9`, `WEB-50`..`WEB-81`
- Prioritization applied:
- `High`: foundational architecture, naming, breaking route/content migrations, and final release hardening.
- `Medium`: code-splitting optimization and UI/accessibility polish phases.
- Baseline snapshot run for `WEB-50` captured evidence in `docs/refactor-round-2/artifacts/baseline-2026-03-05-web-50`:
- `pnpm lint`: pass (exit `0`)
- `pnpm typecheck`: fail (exit `2`)
- `pnpm test`: pass (exit `0`)
- `pnpm build`: fail (exit `1`)
- Route map snapshot confirms current routes are still under `/[locale]/projects`, `/[locale]/projects/[slug]`, `/[locale]/cv`, and `/[locale]/design`.
- File topology snapshot captured full `src` directory and file tree baseline.
- Follow-up Linear issues opened from failures:
- `WEB-82`: JsonLd import casing mismatch (`SEO` vs `seo`) breaking typecheck/build.
- `WEB-83`: stale `.next/types/validator.ts` route module references in typecheck baseline.

## Technical Decisions

| Decision                                                          | Rationale                                                                                                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Build planning files under `docs/refactor-round-2`                | Explicitly required by `docs/PLAN.md` assumptions                                                                                                            |
| Add checklist entries for both existing and planned command gates | Keeps current CI gates verifiable now and future architecture gates visible                                                                                  |
| Track sync contract directly inside planning files                | Makes AI-agent behavior deterministic and auditable during multi-session execution                                                                           |
| Use Linear parent-child issue hierarchy for epic -> story -> task | Native relation pattern keeps dependencies and reporting clear                                                                                               |
| Use dependency-weighted PM priority tiers                         | Conventions/architecture/route/content/release gates have highest dependency criticality; optimization and polish follow once core migration chain is stable |

## Issues Encountered

| Issue                                                                          | Resolution                                                                 |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Linear project list query failed due complexity when milestones were requested | Retried with a lighter query and no milestone expansion                    |
| Shell backtick expansion corrupted first route-map/summary rendering command   | Regenerated artifacts with `printf`/plain paths and verified file contents |

## Resources

- `docs/PLAN.md`
- `docs/refactor-round-2/task_plan.md`
- `docs/refactor-round-2/findings.md`
- `docs/refactor-round-2/progress.md`
- `package.json` (command gates source)
- Linear project: `https://linear.app/sebastian-kolbusz/project/portfolio-refactor-round-2-0b8880dacf7c`
- Linear epic: `https://linear.app/sebastian-kolbusz/issue/WEB-1/epic-0-program-bootstrap-and-baseline-lock`
- Linear Epics 1-9: `WEB-10`..`WEB-18`
- Linear Story range: `WEB-19`..`WEB-49`
- Linear Task range: `WEB-50`..`WEB-83`
- Baseline summary: `docs/refactor-round-2/artifacts/baseline-2026-03-05-web-50/summary.md`
- Baseline route map: `docs/refactor-round-2/artifacts/baseline-2026-03-05-web-50/route-map.md`
- Baseline file topology: `docs/refactor-round-2/artifacts/baseline-2026-03-05-web-50/file-topology.txt`
- Follow-up issues:
- `https://linear.app/sebastian-kolbusz/issue/WEB-82/follow-up-fix-jsonld-import-casing-mismatch-breaking-typecheckbuild`
- `https://linear.app/sebastian-kolbusz/issue/WEB-83/follow-up-resolve-stale-next-route-validator-module-references-in`

## Visual/Browser Findings

- None for this deliverable.

---

_Update this file after every 2 discovery actions and after each material decision_
