---
title: "No fading gradients over moving elements: the tucked receipt is cut by a hard slot edge, and the plugin window fits 85% of the screen"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 16, tokens: 63173 }
id: l-441ff2b9
scope: repo
status: active
src: agent
touches:
  - src/components/sections/aspect-demo.tsx
  - src/components/sections/ready2order-scene.css
  - src/components/sections/ready2order-scene.tsx
  - src/i18n/messages/en.json
  - src/i18n/messages/pl.json
---

## Decided
- On 2026-11-18 the owner called the ink gradient fading over the top of the tucked ready2order receipt "mega weak". It moved together with the paper. The receipt is now cut by a hard edge, read as the till's slot. The edge shows only while the paper is longer than its room.
- The owner wants the plugin demo's admin window a little smaller on a desktop, about 85% of the screen's height, so it sits comfortably. This replaces the earlier 90%.

## Tried and ruled out
- A linear-gradient fade (mask or overlay) over the receipt's top.

In the code: src/components/sections/ready2order-scene.css (.r2o-receipt::before, [data-cut]), ready2order-scene.tsx (ResizeObserver sets data-cut), src/components/sections/aspect-demo.tsx (fit target 0.85 of innerHeight).
