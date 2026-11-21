---
title: "The ready2order drops are the hero's real liquid: groups of particles the scroll pulls together and apart"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 11, tokens: 121993 }
id: l-1eca02d1
scope: repo
status: active
replaces: l-5bf5c10e
src: agent
touches:
  - src/components/canvas/liquid-hero/drops-stage.ts
  - src/components/sections/ready2order-scene.tsx
  - src/components/canvas/liquid-hero/liquid-stage.ts
---

## Decided
The owner wants real liquid, not moving images. The scene runs the hero's own particle simulation on a canvas of its own. Each drop is a group of particles. The scroll moves every group's target from the drop's place to one point, so the liquid merges by itself, and when the page scrolls back up the body tears into four drops again.

## Tried and ruled out
- PNG drops slid together with an SVG goo filter (commit f3b956fb). Mid-scroll they read as overlapping stickers. Now only the fallback without WebGL2.
- Steering only each group's centre. The merged body grew threads, and on the way back it tore into threads and flung bits: threads are out.
- One particle size for every screen. On a phone the drops were too few particles, surface tension won, and pairs stayed joined as "spoons".

## Watch out
- The sim's own pulls (main-body pull, anchor, own weight, cursor) must be off. `self` especially draws every drop towards one centre.
- Groups are re-divided while the drops pull apart: each target takes its nearest particles up to its share. Without that the body splits into threads.
- The particle size follows the biggest drop (Hq = rMax/3.2, between 0.014 and 0.03 of the height).
- In headless SwiftShader the scene runs at 13 fps at 1440@2×. Software rendering, not checked on a real GPU yet.

In the code: src/components/canvas/liquid-hero/drops-stage.ts (`steer`, `regroup`, SURFACE shader), started from src/components/sections/ready2order-scene.tsx (drop radius = width × 0.34, at least 0.024 of the height).
