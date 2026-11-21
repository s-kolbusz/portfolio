---
title: "Grid-like, trembling light on the particle liquid came from 16-bit float accumulation and bilinear sampling, not from the simulation"
author: Sebastian
date: 2026-11-16
branch: redesign/decyzje
cost: { minutes: 40, tokens: 261033 }
id: l-4c813fd1
scope: repo
status: active
src: agent
touches:
  - cook/ciecz-czastki/sim.js
  - cook/ciecz-czastki/test-sim.mjs
  - cook/ciecz-czastki/index.html
---

## Decided
The surface height of the particle liquid is built by splatting thousands of particles into a dome texture. Light on it looked like a grid and trembled. Three render fixes removed it, without touching the simulation: accumulate the dome in a 32-bit float texture (EXT_float_blend + OES_texture_float_linear), sample it bicubically (4 bilinear taps), and average it over frames (75% previous, 25% new).

## Tried and ruled out
- A separate steep rim term in the height (from the density threshold): it made small drops look like a doughnut, with the outer ring refracting differently from a flat centre.
- Wider spatial blur alone: it did not remove the banding, because the steps come from half-float precision when ~2.6k small values are summed.

## Watch out
- After summing thousands of particles, a 16-bit float (RGBA16F) has steps around 5e-4. The normal derivative magnifies them into visible bands.
- The owner wants at most ~16 gentle waves on the surface and no fine roughness ("not a basketball").

In the code: cook/ciecz-czastki/index.html — hgt(), bicubic(), dome pass (fbo2, kTex) with the fade program.
