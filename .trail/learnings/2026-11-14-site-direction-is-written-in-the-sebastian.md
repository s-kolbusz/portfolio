---
title: "Site direction is written in the design docs; the map of roads is a metaphor, not a UI to build"
author: Sebastian
date: 2026-11-14
branch: redesign/decyzje
cost: { minutes: 70, tokens: 687132 }
id: l-d2d94127
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-14-historia-strony-koncept.md
  - docs/design/2026-11-14-lusion-przepis.md
  - docs/design/2026-11-14-otwarcie-diagnoza-telefon.md
  - docs/design/README.md
  - e2e/visual-regression.spec.ts-snapshots/cv-en-chromium.png
  - ".prettierignore"
  - package.json
  - pnpm-lock.yaml
  - pnpm-workspace.yaml
---

## Decided
On 2026-11-14 the owner set the direction for the whole site: it answers "who am I" in three layers (home, work and offer, the person). The personal layer is never on the homepage. The book-style project catalogue goes away. Any session starts from the design docs index, not from chat history, and writes decisions back into those docs.

## Tried and ruled out
A literal map with contour lines drawn from the blob's distance field, with three views of one graph. The owner meant the map as a metaphor (directions that seem pointless still lead somewhere), so it became reasoned links between pages and a "where next" door at the end of each page.
Open, introspective questions to the owner about himself. He cannot answer them; give two or three concrete candidates built from known facts and let him mark each true, false or skip.

## Watch out
Nothing in the concept is permission to write code: plan A/B/C for the opening still waits for the owner's approval. Section 0 of the concept lists what is decided and what is only proposed; keep it true when you add decisions. A cold read by a reviewer with no context found 15 gaps in the first clean version, so run one again after bigger rewrites.

In the code:
- `docs/design/README.md` (which doc is the source of truth)
- `docs/design/2026-11-14-historia-strony-koncept.md` (section 0: decided vs proposed; section 12: open questions)
- `docs/design/2026-11-14-otwarcie-diagnoza-telefon.md` (plan A/B/C)
