---
title: "ready2order's light physics keeps viscosity and lets one step cover up to 250 ms, so slow tablets neither foam nor run in slow motion"
author: Sebastian
date: 2026-11-20
branch: redesign/decyzje
cost: { minutes: 9, tokens: 277136 }
id: l-ae6284e8
scope: repo
status: active
replaces: l-60e82faf
src: agent
touches:
  - src/components/canvas/liquid-hero/drops.worker.ts
---

## Decided
On slow devices the ready2order liquid runs light physics: one bigger step covering all elapsed time, with the full forces and viscosity kept. One step may cover up to 250 ms and a tick counts up to 250 ms of elapsed time. On 2026-11-20 the owner's iPad took 143 ms a step (it was ~85 ms on 11-18), and the old 100 ms caps made it run at 70% speed, in slow motion.

## Tried and ruled out
- The hero's light mode (no viscosity): the big body tears into a holey foam.
- Capping a step at 4, then 12 base steps: both ran in slow motion on the iPad.

## Watch out
- The `?pomiar` "steps/s" readout is the share of real time the liquid covers: anything under ~110/120 is slow motion.
- Tested on desktop with a temporary 190 ms busy-wait after the step: 116–139/120 and the liquid stays whole.
- The elapsed-time cap has two places to raise: MAX_D and the Math.min in tick().

In the code: website/src/components/canvas/liquid-hero/drops.worker.ts (MAX_D = 30, tick()).
