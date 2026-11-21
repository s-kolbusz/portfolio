---
title: "The ready2order liquid is drawn with the hero's own height and light, not a simplified copy; its story runs one bundle, taken apart, each part's fate, half the…"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 33, tokens: 454013 }
id: l-d698f952
scope: repo
status: active
src: agent
touches:
  - cook/akt3/r2o-szkic/index.html
  - src/components/sections/ready2order-scene.tsx
  - src/components/sections/ready2order-scene.css
  - src/components/canvas/liquid-hero/drops-stage.ts
---

## Decided
- On 2026-11-18 the owner rejected the ready2order drops as "the weird doughnut I told you not to make": he spent half a day on the hero liquid's shape, mutation, waves and light. The scene now draws the liquid the hero's way: a distance field from the density (jump flooding plus blur), the hero's height pass (HEIGHT_FRAGMENT: 0.5*sqrt(distance) plus its waves), the rolled-under edge from the distance with its wandering width, and the hero's env(), Fresnel and highlights. Over ink the colour is the hero's green glass for its drop on the dark sheet.
- The story was turned around after three critics (story, composition, technical honesty) and the owner's go-ahead. One body on a map of the bundle, then taken apart into its parts, then each part's fate: dependencies slimmed in place, screens split off onto a shelf (they still load when opened), Redux drained away. What is left runs together into half the old outline, with −50% in the freed strip.
- The owner confirmed that −50% means JavaScript loaded at start. That is why the split-off screens count as saved.
- The map makes no claim to real data. There are no inner module lines, and it is captioned "illustrative · not to scale".

## Tried and ruled out
- Height from the density with a steep threshold (the old SURFACE). It gives a ring at the edge, the doughnut. The hero dropped it for the same reason.
- Dead code as four tiny drops scattered through the app and the dependencies. Every tuning left threads between them and the big drops, and threads are out. Dead code is now named in the text only.
- Re-dividing particles between groups all the time. At rest a drop whose share differs a little from its size draws a tail out of its neighbour. Re-dividing now happens only while the targets move.

## Watch out
- If the hero's look changes in MAIN_FRAGMENT, change SURFACE in drops-stage.ts with it.
- A stopped stage loses its WebGL context. Each start needs a fresh canvas, because React dev mounts the scene twice.
- The field runs 0.6 canvas heights below the canvas, so drained parts sink out of sight and can rise again when scrolling up.

In the code: src/components/canvas/liquid-hero/drops-stage.ts (SURFACE, distanceField, steer/regroup, BELOW), src/components/sections/ready2order-scene.tsx (GROUPS, BLOCKS, geometry, frameAt, label show windows), live shots via cook/akt3/r2o-szkic/live-shots.mjs.
