---
title: "The About drop gets no text or contour-line ground under it; its life comes from the hero's lobe formula driving rim parts"
author: Sebastian
date: 2026-11-27
branch: redesign/decyzje
cost: { minutes: 43, tokens: 501646 }
id: l-c43a7c49
scope: repo
status: active
src: agent
touches:
  - src/components/about/about-liquid.tsx
  - src/components/about/about-page.tsx
  - src/components/about/about.css
  - src/components/canvas/liquid-hero/sim.ts
---

## Decided
On 2026-11-27 the About ("Kim jestem") first-screen drop was made to change shape like the hero's: a core plus six rim groups, each pulled to where the hero's cursor-drop lobe formula (waves with 3, 5 and 2 crests) pushes the rim at its angle. No change to the liquid engine or its look.

## Tried and ruled out
- The hero's contour lines under the drop: the owner rejected it as repeating the hero.
- A "lens": the page's four path questions drawn small in mono as the ground, refracted and magnified by the drop with the hero's tinted-glass formula. Technically it worked, but the owner said the questions are dumb and the block of grey mono text looks terrible. The engine change (ground texture option) was fully reverted.
- More rim swing (0.52/0.58 of the radius with three parts) gave kinks on the edge; six rim parts at 0.46 ± 0.24 stay one smooth body.

## Watch out
On bare paper the drop still reads flatter than the hero's, because the hero's drop bends the contour lines under it. Whatever goes under it must carry the page's own meaning and be designed with the owner first; a text placeholder will be read as the real thing. The path questions themselves may need rewriting (open question to the owner).

In the code: src/components/about/about-liquid.tsx (CORE 0.45, RIM 6, RIM_AT 0.46, RIM_SWING 0.24, PACE 0.7, lobe()); the hero formula is in src/components/canvas/liquid-hero/sim.ts (rebelLife lobes).
