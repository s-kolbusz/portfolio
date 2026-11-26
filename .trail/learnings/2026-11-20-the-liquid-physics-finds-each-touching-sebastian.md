---
title: The liquid physics finds each touching pair once a step and reuses its distance; that made it about 1.6x faster
author: Sebastian
date: 2026-11-20
branch: redesign/decyzje
cost: { minutes: 13, tokens: 110461 }
id: l-ef7af844
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/liquid-hero/sim.ts
---

## Decided
On 2026-11-20 the owner's iPad showed ready2order's physics at 75 ms a step (steering only 1.3 ms), so the liquid got ~13 new states a second and stuttered. The owner allowed changing the shared physics even though the hero uses it too. Changes: neighbours searched once a step (after the move) with a half stencil (rest of own cell + 4 forward cells, each pair met once); the density pass stores the touching pairs (distance, direction); relaxation walks only those pairs (recomputing positions exactly); viscosity (next step) and XSPH reuse the stored distance and direction.

## Tried and ruled out
- Raising the light step's time caps alone: fixes slow motion, not stutter.
- Bigger or fewer particles for ready2order: threads between drops (ruled out earlier).
- The owner rejects any talk of the iPad lacking a JIT; don't raise it again.

## Watch out
- Measured: desktop Chromium 2.4 -> 1.5 ms a step; node bench 23 -> 17 ms with JIT off. Pair loops (viscosity, density, relaxation, smoothing) are now ~80% of the step; a further big cut needs fewer pairs or another runtime, not more loop tweaks.
- Viscosity and smoothing use pairs measured before relaxation: a tiny approximation, visually the same on hero and ready2order.

In the code: website/src/components/canvas/liquid-hero/sim.ts buildNeighbors (FWD stencil), pI/pJ/pQ/pUX/pUY, NP.
