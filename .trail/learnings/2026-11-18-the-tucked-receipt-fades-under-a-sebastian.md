---
title: "The tucked receipt fades under a gradient fixed to its slot, never to the paper; the plugin window fits 78% of the screen"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 11, tokens: 65124 }
id: l-caaaec9d
scope: repo
status: active
replaces: l-441ff2b9
src: agent
touches:
  - src/components/sections/ready2order-scene.css
  - src/components/sections/aspect-demo.tsx
---

## Decided
- On 2026-11-18 the owner accepted this: the tucked ready2order receipt fades out under an ink gradient that belongs to its slot. The gradient stays put while the paper prints and moves up under it, and it goes out at once when the receipt is pulled up. It shows only when the paper is longer than its room.
- The plugin demo's admin window fits at most 78% of the screen's height on a desktop (the owner found 90% and then 85% still too big).

## Tried and ruled out
- A gradient on the paper itself: it travelled with the paper as the receipt opened ("mega weak").
- A hard slot edge with no fade: "unnaturally cut for no reason".
- Tucking the paper under the step's text with a cast shadow: "tragic".

In the code: src/components/sections/ready2order-scene.css (.r2o-slot::after, [data-over], [data-lift]), ready2order-scene.tsx (ResizeObserver sets data-over on the slot), src/components/sections/aspect-demo.tsx (fit target 0.78 of innerHeight).
