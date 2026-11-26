---
title: "Merging with auto-merge lands at once here, because main has no required checks"
author: Sebastian
date: 2026-11-26
branch: fix/visual-snapshots
cost: { minutes: 4, tokens: 35014 }
id: l-04a02d10
scope: repo
status: active
src: agent
touches:
  - e2e/visual-regression.spec.ts-snapshots/cv-en-chromium.png
  - ".github/workflows/update-snapshots.yml"
---

## Decided
On 2026-11-26 the owner said to merge the /v2 release once CI was green. `gh pr merge --auto` merged it right away, with CI still running. The repo has no branch protection on main, so GitHub has nothing to wait for. To merge after CI here, watch the checks first and merge by hand, or add required status checks on main.

## Watch out
- The Visual Regression job was already red on main before that merge: the stored CV snapshot was stale. Snapshots must come from Linux, so regenerate them with the "Update Visual Snapshots" workflow on a branch, never locally on macOS. That workflow commits with [skip ci], so its PR shows no checks.
- Vercel deploys main to production as soon as the merge lands.

In the code: .github/workflows/update-snapshots.yml (workflow_dispatch, run it with --ref <branch>), e2e/visual-regression.spec.ts-snapshots/.
