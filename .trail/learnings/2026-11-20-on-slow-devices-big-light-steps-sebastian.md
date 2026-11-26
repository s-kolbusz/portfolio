---
title: On slow devices big light steps crushed ready2order drops and made each step costlier; gather pull is eased by 1/sqrt(d)
author: Sebastian
date: 2026-11-20
branch: redesign/decyzje
cost: { minutes: 5, tokens: 147935 }
id: l-f0d4f748
scope: repo
status: active
src: agent
---

## Decided
On slow devices the light physics takes one big step covering ~14–30 base steps. The per-particle gather pull grows with the square of the step, while pressure pushes back only once per step. Drops got squeezed to 2–4× density, so each step had 2–4× the neighbour pairs: the slower the device, the costlier the step. Inside its own drop the gather is now eased by 1/√d; particles outside the drop are still gathered at full strength. The swirl is eased the same way. Each drop's path is integrated in base sub-steps inside carry(), so it stays stable at 250 ms steps. Drops on slow devices are now desktop-sized, slightly bigger than before.
## Tried and ruled out
- Easing the gather fully (1/d): exact desktop size, but a hole stayed in the single body for 5+ s.
- Re-dividing particles by liquid time instead of step count: left beads and threads between drops.
- A native numeric sort in regroup: changed the result at desktop pace.
- Dropping viscosity/XSPH on big steps: about 15% cheaper, but risks foam.
## Watch out
At d=30 the old code blew up. Viscosity impulses went to NaN, and NaN particles looped the neighbour lists forever, which hung the worker. The viscosity impulse is now capped at the value that stops a pair's approach, and NaN particles stay out of the grid.
In the code: sim.ts (merged neighbour+density pass, per-particle pair groups, impulse cap), drops.worker.ts carry()/steer light branch.
