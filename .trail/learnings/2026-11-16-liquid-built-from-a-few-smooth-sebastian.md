---
title: Liquid built from a few smooth spheres on springs reads as soap bubbles; the hero liquid needs a particle fluid driven by cursor speed
author: Sebastian
date: 2026-11-16
branch: redesign/decyzje
cost: { minutes: 20, tokens: 168512 }
id: l-386aeeb9
scope: repo
status: active
src: agent
touches:
  - cook/ciecz-ruch/index.html
  - cook/ciecz-ruch/shots.mjs
---

## Decided
On 2026-11-16 the owner tried the live motion test (a few SDF spheres, spring physics, pieces that break off past a speed threshold and come back on timers) and rejected how it moves. What he asked for instead: pieces that are not round balls; no springy, stepwise motion; a response that scales with cursor speed; a drop that follows the cursor; tearing that visibly deforms the main body and is tied to the cursor's movement; organic, chaotic, living shapes. He also said the text changes have no clear, visible link to what the liquid does.

## Tried and ruled out
- Body = 5 smooth-min'd spheres + spring to center; pieces spawned at a speed threshold with phases out/back/merge on timers: reads as "a soap bubble that springily spits new bubbles in random places".
- Sentence highlight switched by those phases: the link between gesture and text is invisible.

## Watch out
- Timers and thresholds are what make motion read as stepwise; forces must be continuous and scale with cursor velocity.
- A real fluid tears with short-lived necks; the owner has banned persistent threads and tongues, so necks must snap quickly.
- The material, color, Mattone type and contour background were approved on stills; only the motion engine failed.

In the code: cook/ciecz-ruch/index.html (physics in frame(): bodyR, pieces, phases).
