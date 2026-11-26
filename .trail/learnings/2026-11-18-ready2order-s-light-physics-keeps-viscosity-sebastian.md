---
title: "ready2order's light physics keeps viscosity and lets one step cover up to 100 ms, so slow tablets neither foam nor run in slow motion"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 2, tokens: 53946 }
id: l-60e82faf
scope: repo
status: active
replaces: l-4d312a2c
src: agent
touches:
  - src/components/canvas/liquid-hero/drops.worker.ts
---

## Decided
On slow devices the ready2order liquid runs light physics: one bigger step covering all the time that passed, up to 12 base steps (100 ms). It keeps the viscosity and smoothing passes.

## Tried and ruled out
- The hero's light mode (no viscosity). A big body tears into a holey foam, as seen in a 2000 px window with 2818 particles.
- Capping a light step at 4 base steps. With viscosity a step costs about 85 ms on the iPad but covered only 33 ms, so the liquid ran at 40% speed. The owner saw that as slow motion, not stutter.

## Watch out
The `?pomiar` "steps/s" readout is the share of real time the liquid covers: anything under 120 means slow motion. To test a tablet's pace on a Mac, add a temporary 85 ms busy-wait after `sim.step(d)`.

In the code: src/components/canvas/liquid-hero/drops.worker.ts (`MAX_D`, `LIGHT_MS`, `tick`).
