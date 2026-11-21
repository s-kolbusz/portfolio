---
title: "The owner rejected the hero where liquid builds drawings: childish and unprofessional, far from his bar"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 1, tokens: 6699 }
id: l-8e5617ff
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/hero-samples/matter-story.ts
  - src/components/canvas/hero-samples/things.ts
  - src/components/sections/hero-assembly.tsx
---

## Decided
On 2026-11-15 the owner looked at the hero sample live after the particle liquid and the part-by-part build were in, and said it looks childish, very unpolished and completely unprofessional, and that the animations, illustrations and physics are not at the level of award-winning sites. This came after several rounds on the same idea (springs, a real particle liquid, a scenario, building in order), each of which fixed one defect and exposed another.

## Tried and ruled out
- More polishing of the same idea as the way to reach his bar: every round so far ended with the same verdict, so another round needs a different idea, not better tuning.

## Watch out
- (Interpretation of the session that wrote this, not his words:) three things work against the bar at once. The things are pictograms drawn in code, which read as icons whatever the motion. A few thousand particles give a lumpy, hazy liquid. And physics left to itself does not produce composed frames; each shape it has to hit needs its own patch.
- The agent sees motion only as strips of frames, so it cannot judge how motion feels. Do not show him motion work as ready on that basis.
- What he has approved stays approved: the blob's flat pastel look, the typeface, the name framing the object.

In the code: `src/components/canvas/hero-samples/matter-story.ts` (`createStory`), `src/components/canvas/hero-samples/things.ts` (`THINGS`), shown by `src/components/sections/hero-assembly.tsx` at /pl/design/hero/zlozenie. None of it is used by the production home page.
