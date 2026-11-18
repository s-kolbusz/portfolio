---
title: "Where the liquid physics can't keep up, ready2order draws drops without physics"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 17, tokens: 162474 }
id: l-51c86578
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/liquid-hero/liquid-stage.ts
---

## Decided
- On 2026-11-18 the owner's iPad (Safari) ran ready2order's physics at 12 of 120 steps a second (30 fps, 1942 particles). The liquid lagged and smeared at the bottom of the map. His iPhone 11 Pro ran it fine, so the iPad's Safari most likely runs JavaScript without a JIT (Lockdown Mode or a similar setting); an earlier hero note already saw this iPad's physics without a JIT.
- After 1.5 s on screen, if the worker manages under 60 steps/s, the scene stops the worker and moves the same particles without physics. Each part is a disc around its target. Parts whose edges meet (distance < 1.1·(Rg+Rh)) are laid out as one disc of their summed area, so a merge keeps the volume. Particles ease to their sunflower slots and sway a little. The drawing is unchanged.
- The receipt has a 7.5rem minimum height, with tighter column gaps on screens across under 900 px tall. Phones show no receipt.
- Tablets lay the hero out midway between Safari's bar shown and hidden (half the inset). Phones keep the full inset.

## Tried and ruled out
- Bigger particles for slow devices: threads between drops (see the tablet note).

## Watch out
- At a 0.8·(Rg+Rh) merge threshold, drops that touched still showed as two discs with a neck (a "snowman").
- ?bezfizyki forces the mode without physics; ?pomiar shows which mode runs.

In the code: drops-stage.ts makeStill / goStill / watch; ready2order-scene.css .r2o-slot and the max-height 900 media query; liquid-stage.ts INSET.
