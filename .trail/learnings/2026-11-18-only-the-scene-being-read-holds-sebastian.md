---
title: "Only the scene being read holds WebGL, and touch screens draw the liquid at reduced resolution"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 6, tokens: 70679 }
id: l-9fd41ce4
scope: repo
status: active
src: agent
touches:
  - src/components/sections/hero.tsx
  - src/components/sections/ready2order-scene.tsx
---

## Decided
- On 2026-11-18 the owner found the page very slow on an iPhone 11 Pro and the ready2order liquid lagging on an M2 iPad, worst in low power mode, and approved: only the current scene in memory, no drawing off screen, a lighter liquid on touch screens.
- The hero's stage is stopped (WebGL context lost, physics worker ended) once the page is 1.5 screens past the hero, and built again on a fresh canvas a screen before it returns. ready2order's liquid exists only within 1 screen (built) / 1.5 screens (freed) of its section. The menu's water is created on the first menu open.
- Touch screens (pointer: coarse) draw the hero at 1.5x at most (its name is drawn in the canvas, so not lower) and ready2order at 1.25x (no text in that canvas).

## Watch out
- An IntersectionObserver counts an element whose edge only touches the viewport as intersecting: the hero kept drawing under the plugin demo. Both stages also require intersectionRect.height > 1, and the hero re-checks on scroll.
- A rebuilt hero relies on the reload fixes: the eased scroll starts at the page's scroll and the loader skips its show when the hero is away. The site bar treats an off-screen loader board as done, or it waited 9 s on a page opened further down.

In the code:
- src/components/sections/hero.tsx: `far` state, generation bump on release, guard in the stage effect.
- src/components/sections/ready2order-scene.tsx: near() / free() in draw.
- liquid-stage.ts / drops-stage.ts: dprCap; onScreen(); site-nav.tsx: ensureWater().
- Measured headless at 375x812@3x: hero canvas 750x1624 → 563x1218, ready2order 750x1624 → 469x1015; live contexts: hero only at the hero, ready2order only near it, none at the contact section.
