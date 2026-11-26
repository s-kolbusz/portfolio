---
title: "The owner accepted drops without physics on devices where the liquid physics is slow, and chose not to hunt the cause"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 13, tokens: 53965 }
id: l-86a035e1
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/liquid-hero/drops-stage.ts
  - src/components/canvas/liquid-hero/drops.worker.ts
  - src/components/canvas/liquid-hero/physics.worker.ts
---

## Decided
- On 2026-11-18 the owner chose to keep ready2order's drops without physics on slow devices. That covers his iPad Pro M2, and his iPhone 11 Pro in Low Power Mode. He chose not to look for why the iPad computes one physics step in 84.5 ms when WebKit on a Mac takes 2.3 ms (1942 particles, 11 steps/s).

## Watch out
- Ruled out by the owner: no JIT, and Low Power Mode. The cause is compute time, not scheduling.
- If anyone picks this up again, first compare the hero's physics worker on the same iPad. If the hero is also slow, it is how that iPad treats workers. If the hero is fast, it is something specific to ready2order's worker (steer, or the regroup sort).

In the code: drops-stage.ts watch (switch below 60 steps/s after 1.5 s), ?pomiar readout.
