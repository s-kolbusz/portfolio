---
title: "The redesign ships as a whole; main flows into the redesign branch, never the reverse"
author: Sebastian
date: 2026-11-14
branch: redesign/decyzje
cost: { minutes: 15, tokens: 85071 }
id: l-6e224d94
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-09-24-redesign-decyzje.md
  - package.json
  - pnpm-lock.yaml
---

## Decided
The kolbusz.xyz redesign lives on one long-running branch and is not merged to main step by step. The owner corrected this on 2026-11-14: only step 1 of 11 (hero + signature scene) exists, and it leads straight into the old homepage sections, so merging now would break the whole portfolio. Main keeps getting fixes only; main is merged into the redesign branch from time to time so it does not drift.

## Tried and ruled out
Proposing to merge PR #20 because CI was green and the owner had accepted the transition in the browser. "Accepted" meant that one scene, not a release.

## Watch out
The decisions doc still says each step can be shipped separately. That line is outdated; the owner's rule wins until the doc is fixed.

In the code:
- branch `redesign/decyzje`, PR s-kolbusz/portfolio#20 (keep open, do not merge until the owner accepts the whole redesign)
- `docs/design/2026-09-24-redesign-decyzje.md`, section "Sposób realizacji"
- merging main in: dependency conflicts only in package.json / pnpm-lock.yaml; take main's versions, then `pnpm install`
