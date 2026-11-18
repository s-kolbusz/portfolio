---
title: ready2order keeps real liquid everywhere; its light mode keeps viscosity and only takes bigger steps
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 9, tokens: 140736 }
id: l-4d312a2c
scope: repo
status: active
replaces: l-83413c32
src: agent
touches:
  - "src/app/[locale]/page.tsx"
  - src/components/ui/site-nav/site-nav.css
  - src/components/ui/site-nav/site-nav.tsx
  - src/i18n/messages/en.json
  - src/i18n/messages/pl.json
  - src/components/canvas/liquid-hero/drops-stage.ts
  - src/components/canvas/liquid-hero/drops.worker.ts
  - src/components/canvas/liquid-hero/physics.worker.ts
---

## Decided
On 2026-11-18 the owner rejected the round discs without physics on every device: ready2order must show real liquid everywhere, iPad included. Slow devices get "light physics": one bigger step covering up to 4 base steps (1/120 s each), with the same particles, forces and drawing. Unlike the hero's light mode, it keeps the viscosity and XSPH smoothing passes.

## Tried and ruled out
Copying the hero's light mode (`P.light = true`, no viscosity, `drag 0.988`). It is fine at 1440 px, but in a 2000 px window the body has 2818 particles and tears into a holey foam that never settles. The owner's desktop under load tripped into that mode and showed it ("the liquid keeps jumping"). The hero gets away with no viscosity because its light mode also uses bigger, fewer particles.

## Watch out
- Light mode switches on when a full step costs more than 6.5 ms of compute. A 2000 px window already costs 4.5 ms a step on the Mac, so a loaded desktop can switch. That is harmless now: at a desktop's pace d is about 1 and light mode equals full physics.
- Page messages drive ticks only after a 2 ms breather. Ticking on every queued message built a backlog, and the liquid chased targets that were seconds old.
- To test slow devices, add a temporary 30 ms busy-wait after `sim.step(d)` in the light branch. With it the body stays liquid and splits into the four parts.

In the code: src/components/canvas/liquid-hero/drops.worker.ts (`goLight`, `tick`, `LIGHT_MS`), and `?lekko` / `?pomiar` in drops-stage.ts.
