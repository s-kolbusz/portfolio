---
title: "On slow devices each ready2order drop's mean motion is carried outside the physics step, so the per-step move cap doesn't slow drops to a crawl"
author: Sebastian
date: 2026-11-20
branch: redesign/decyzje
cost: { minutes: 7, tokens: 50322 }
id: l-72411bc4
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/liquid-hero/drops.worker.ts
---

## Decided
On 2026-11-20 the owner's iPad took ~120 ms a physics step (~8 steps a second) and the iPhone, which had worked, turned unusably slow too. The `?pomiar` readout said 120/120 steps/s, yet the liquid crawled. Cause: the sim caps a particle's move at 0.6 radii per step (vmax = min(0.6, 0.6/dt)), so one big light step covering d base steps caps speed at 0.6/d. Raising d (4 → 12 → 30) made it worse. Fix: in light steps the worker takes each group's mean velocity out before sim.step, then adds it back and moves the group by it, uncapped. Only motion within a drop stays capped. Tested at a fake 116 ms step: drops split and reach their cells in ~0.6 s, no splashing.

## Tried and ruled out
- Raising MAX_D and the elapsed-time cap: the readout looks fine but the liquid gets slower, not faster.
- The owner rejects any explanation about the iPad lacking a JIT; don't bring it up again.

## Watch out
- "steps/s" in ?pomiar only counts covered time. It says nothing about the move cap, so check motion on screenshots.
- At ~8 steps a second the page only gets ~8 new states to interpolate between. Motion speed is right now, but smoothness depends on that.
- The act 4 vessel path does not use carry (gravity in a vessel needs the cap).

In the code: website/src/components/canvas/liquid-hero/drops.worker.ts carry(), mvx/mvy/mn, fieldW/fieldH; sim.ts step() vmax.
