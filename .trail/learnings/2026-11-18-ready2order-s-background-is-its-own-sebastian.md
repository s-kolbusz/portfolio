---
title: "ready2order's background is its own bundle as a treemap that halves, not contour lines"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 6, tokens: 65839 }
id: l-8a034713
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/liquid-hero/drops-stage.ts
  - src/components/sections/aspect-demo.tsx
  - src/components/ui/custom-cursor.css
  - src/components/ui/custom-cursor.tsx
---

## Decided
On 2026-11-18 the owner rejected contour lines behind ready2order: the ground should refer to ready2order itself. It is the production bundle drawn as a treemap of module blocks, faint on ink. It shrinks to half its area around the merged body as the drops run together, which is the story's own result (-50%).

## Watch out
- Lines refracted strongly through the liquid read as cracks. Keep the refraction small and the lines faint under the glass.
- The map's line width is worked out from the pixel size, not fwidth, because ground() is also sampled inside the refraction.

In the code: src/components/canvas/liquid-hero/drops-stage.ts (`ground` in SURFACE, uniforms uMerge/uBody/uA).
