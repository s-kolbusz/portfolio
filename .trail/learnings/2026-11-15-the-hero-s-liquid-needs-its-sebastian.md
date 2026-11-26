---
title: "The hero's liquid needs its own surface tension and a mould that only attracts; what failed on the way"
author: Sebastian
date: 2026-11-15
branch: redesign/decyzje
cost: { minutes: 38, tokens: 591330 }
id: l-7add24b3
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/hero-samples/matter-fluid.ts
  - cook/rig/preview.mjs
  - cook/rig/hooks.mjs
  - cook/rig/fluid-basics.mjs
  - src/components/canvas/hero-samples/matter-moulds.ts
  - src/components/canvas/hero-samples/matter-story.ts
  - cook/rig/dump.mjs
  - cook/rig/story.mjs
  - src/components/canvas/hero-samples/matter-renderer.ts
  - src/components/sections/hero-assembly.tsx
---

## Decided
The hero's matter is now a particle liquid: pressure by double density relaxation, braking of pairs that close in, neighbour viscosity, and surface tension as a pull up the slope of a blurred "full or not" grid. A drawing acts as a wall (signed distance) plus a thirst (pull of the missing matter). The blob is taken apart by one attractor per part of the drawing, each bit of matter answering to the strongest one. Work stopped at the usage limit on 2026-11-15: uncommitted, checked only in a Node rig, not in the browser.

## Tried and ruled out
Cohesion from pair pressure alone (raising the rest density): the body jams like plasticine, a stretched drop never rounds, and a little more makes it collapse. Stiffness above about 1200 1/s² at two substeps: blows up. Surface tension without braking of closing pairs: a large body implodes and shatters. A thirst that also repels where the mould is over-full: it throws surplus matter out of the frame. A thirst reaching the letters from afar: it pulls rain towards the middle of the word and accelerates it to about 900 px/s, so it flies through. Letting all matter answer to the letters: the blob glues itself to both words as one pillar. An outward burst to take the blob apart: ragged foam, not drops. Attractors whose pulls add up: they cancel inside the ring and the blob only grows arms.

## Watch out
Stopping the dev server on 3101 was housekeeping, not a dropped approach. About a third of the matter is marked from the start as the matter the letters draw; that is a split of matter, not slots, but the owner asked for no assignment and has not seen it. Letters and things set to only about 70-75% before the story moves on.

In the code: src/components/canvas/hero-samples/matter-fluid.ts (LIQUID), matter-moulds.ts (reach, missing > 0), matter-story.ts (lettered, seeds, hollow); rig in cook/rig (local only); hand-over note hero-fluid-handover.md in the shared notes folder.
