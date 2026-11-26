---
title: "On the blob bench, bend only the body and keep the bridge off the soft edge; the owner's first dial values"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 4, tokens: 56576 }
id: l-64a30a8b
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/hero-samples/blob-lab-shader.ts
  - src/components/canvas/hero-samples/blob-lab.ts
  - src/components/sections/hero-blob-lab.tsx
  - "src/app/[locale]/design/hero/[variant]/page.tsx"
  - src/components/canvas/hero-samples/blob-lab.test.ts
  - src/components/canvas/hero-samples/variants.ts
  - src/components/sections/hero-sample.tsx
---

## Decided
On 2026-11-15 the owner tuned the blob bench and reported two faults, both fixed. His setting became the default: outline wander 0.7 at pace 1.5, lean 0.25, gulp 0.5, ball stretch 1, springiness 0, bridge off (he turned it off only because of the fault). He said the wander makes the blob "more interesting, more like a blob than a ball" and that with wander at zero the join with the ball looked natural and good.

## Tried and ruled out
- Scaling the wander by a body-or-ball switch (full on the body, a quarter on the ball): the switch is sharp, so the offset jumps along the line where body and ball are equally near and cuts a visible seam. The wander now bends the body's distance alone, before the single smooth union with the ball.
- A bridge drawn as a segment minus its radius: because the edge is soft, a segment of zero radius still shows as a faint streak between body and ball at any distance. The bridge is offset by the soft edge's width and switched off below a small bond.

## Watch out
- Any term added to the distance after the union must be continuous across the body and ball boundary; anything that should treat them differently belongs before the union.
- He would like the bench kept later as a public "workshop" where visitors tune the blob and it stays that way across the site; that is an idea (MYS-35), not a decision.

In the code: `src/components/canvas/hero-samples/blob-lab-shader.ts` (`body += wander`, the `thread` offset), `src/components/canvas/hero-samples/blob-lab.ts` (`PROPOSAL`, `thread`).
