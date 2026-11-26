---
title: "A liquid canvas that scrolls in edge first must observe several visibility thresholds, or it never starts drawing"
author: Sebastian
date: 2026-11-18
branch: redesign/decyzje
cost: { minutes: 15, tokens: 283867 }
id: l-4b6744de
scope: repo
status: active
src: agent
touches:
  - src/components/canvas/liquid-hero/drops-stage.ts
  - src/components/canvas/liquid-hero/drops.worker.ts
  - src/components/canvas/liquid-hero/physics.worker.ts
  - src/components/canvas/liquid-hero/liquid-stage.ts
  - src/components/sections/ready2order-scene.css
  - src/components/sections/aspect-demo.tsx
  - src/components/sections/hero.tsx
  - src/components/sections/ready2order-scene.tsx
  - src/components/ui/site-nav/site-nav.tsx
  - src/components/sections/how-i-work.tsx
---

## Decided
The liquid scenes (ready2order, act 4 "How I work") pause drawing while their canvas is off screen. A canvas that comes in edge first first reports a sliver of 1 px or less, and the scene treats that as hidden. With the observer's default single threshold it never reports again while the canvas grows into view. The act 4 drop stayed blank on the page, even though the canvas existed and had the right size. The observer now watches several thresholds (0, 0.01, 0.05, 0.2), so it reports again as the canvas grows.

## Tried and ruled out
Suspecting WebGL in headless Chromium, or the canvas geometry: a fresh IntersectionObserver on the same canvas reported it visible, 900 px high. Only the scene's own observer had stayed silent.

## Watch out
Any new scene built on the drops stage gets this for free. A scene with its own observer and a "sliver means hidden" rule needs the same thresholds.

In the code: website/src/components/canvas/liquid-hero/drops-stage.ts, the IntersectionObserver in run(), options { threshold: [0, 0.01, 0.05, 0.2] }.
