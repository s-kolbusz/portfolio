---
title: "Site copy justifies the working rules with quality and safety, never with saving money"
author: Sebastian
date: 2026-11-14
branch: redesign/decyzje
cost: { minutes: 2, tokens: 27997 }
id: l-ceb83ced
scope: repo
status: active
src: agent
touches:
  - docs/design/2026-11-14-jak-pracuje-z-agentami-szkic.md
  - docs/design/2026-11-14-otwarcie-diagnoza-telefon.md
  - "src/app/[locale]/design/hero/[variant]/page.tsx"
  - src/components/canvas/hero-samples/shader.ts
  - src/components/canvas/hero-samples/variants.ts
  - src/components/sections/hero-sample.tsx
---

## Decided
On 2026-11-14 the owner finished marking all 15 statements for the "Jak pracuję z agentami" subpage. The rules (one topic per session, one executor, one fix loop, plan before code) are explained on the site by quality and safety first: that is what the process is for.

## Tried and ruled out
Explaining one executor and one fix loop by cost ("it is my money"). He called it artificial and forced. The internal rule files do frame these rules as cost; that framing stays internal. Cost appears in the copy once, as a side effect.

## Watch out
The sources do not say what "safety" means here, so the draft does not spell it out; do not invent it. Three phrasings in the draft are the writer's and still wait for his edit (part 3, points 1, 11 and 14).

In the code:
- `docs/design/2026-11-14-jak-pracuje-z-agentami-szkic.md` (part 2: intro, sections 2 and 4; part 3: all answers)
