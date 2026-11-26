---
title: "ready2order keeps real liquid on every device: slow devices get light physics, never discs without physics"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 13, tokens: 171668 }
id: l-83413c32
scope: repo
status: active
replaces: l-86a035e1
src: agent
touches:
  - src/components/ui/site-nav/site-nav.css
  - src/components/ui/site-nav/site-nav.tsx
  - src/i18n/messages/en.json
  - src/i18n/messages/pl.json
  - src/components/canvas/liquid-hero/drops-stage.ts
  - src/components/canvas/liquid-hero/drops.worker.ts
  - src/components/canvas/liquid-hero/sim.ts
---

## Decided
- On 2026-11-18 the owner reversed the earlier choice: the round discs without physics "broke it everywhere" (he saw them on his desktop too). The liquid must work normally on every device. The disc fallback (makeStill, ?bezfizyki) is gone.
- Where a full physics step costs over 6.5 ms of compute (the owner's iPad: 84.5 ms), the drops worker switches itself to light physics, as the hero does: one bigger step covering up to 4 base steps, no separate viscosity or smoothing pass, drag 0.988. It is still the real liquid. It decides on compute time, after the first 10 steps, over the next 20 steps or one second of compute.
- Messages from the page (targets each frame) step the physics only if the thread has had a breather (over 2 ms since the last batch ended). The messages that queued up during a long step only update the targets.

## Tried and ruled out
- Gating the disc fallback on pointer and tab visibility: the owner rejected the discs themselves, on any device.

## Watch out
- Before the breather rule, each queued message ran up to 8 steps. With 80 ms steps that built a backlog, and the liquid chased targets seconds old (lagging and smearing, as on the iPad). The hero's physics worker got the same rule.
- The drops sim is now created with exactly the particles used. Before, about 17% spare particles were parked on one point.
- Simulated by a busy-wait inside the worker step (80 ms full, 40 ms light) in Mac WebKit: light physics ran 80/120 and the drops split. The real iPad is not measured yet.

In the code: drops.worker.ts goLight / timing / LIGHT_MS / tEnd; physics.worker.ts tEnd; drops-stage.ts ?lekko forces light physics, ?pomiar shows "light physics".
