---
title: The ready2order scene merges drop images on scroll; the real liquid simulation is not used there
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 6, tokens: 75147 }
id: l-5bf5c10e
scope: repo
status: active
src: agent
touches:
  - public/images/r2o/body.png
  - public/images/r2o/drop-s.png
  - "src/app/[locale]/page.tsx"
  - src/components/sections/ready2order-scene.css
  - src/components/sections/ready2order-scene.tsx
  - src/components/ui/site-nav/stops.test.ts
  - src/components/ui/site-nav/stops.ts
  - src/i18n/messages/en.json
  - src/i18n/messages/pl.json
  - src/components/sections/aspect-demo.tsx
---

## Decided
The ready2order scene in act 3 moves PNG drops (cut from the hero liquid's real frames) on scroll. An SVG goo filter bridges their edges, and they cross-fade into one body. This was the cheap way to get the accepted stills moving. It is not the hero's particle simulation.

## Tried and ruled out
- The small drop cut-outs (c-d04, s-d10, s-d12) for the big drops: at 2× they render blurry. The big drops reuse the one clean large body (s-d11), turned and flipped.
- The large bodies d00, d03 and d06: they have threads and contour lines, which the owner rules out.

## Watch out
- The merge reads as overlapping stickers mid-scroll, not real liquid. If the owner wants real merging, that means the liquid simulation in this section: a second WebGL stage, which is a much bigger job.
- The section needs `id="ready2order"`: the nav scale and its test count the section tops.

In the code: src/components/sections/ready2order-scene.tsx (timeline in `draw`: merge 0.22–0.5, body 0.42–0.58, finished frame 0.46–0.62), ready2order-scene.css, public/images/r2o/.
